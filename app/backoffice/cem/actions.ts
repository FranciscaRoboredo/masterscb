"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/supabase/get-profile";
import type { Database } from "@/lib/supabase/database.types";
import { parseLenexXml, LenexParseError, type ParsedLenexMeet } from "@/lib/lenex";
import { computeCemRankings, type CemResultInput } from "@/lib/cem-ranking";
import type { LenexStroke } from "@/lib/lenex";

type CemMeet = Database["public"]["Tables"]["cem_meets"]["Row"];
type CemSwimmer = Database["public"]["Tables"]["cem_swimmers"]["Row"];

// Código LENEX do Sporting Clube de Braga, consistente em todas as provas
// que já importámos (CLUB code="SCB"), independentemente de como o
// software de cada organização escreveu o nome/shortname.
const SC_BRAGA_LENEX_CODE = "SCB";

export type ActionResult = { error: string } | { success: true };

async function requireCoach() {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "coach") {
    throw new Error("Sem permissão.");
  }
  return profile;
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

// Organizadora dos Campeonatos Nacionais (não conta para o CEM, que é
// "disputado exclusivamente nas competições de Clubes ou AT's").
const FPN_ORGANIZER = "federação portuguesa de natação";

export type ImportResult =
  | { error: string }
  | { success: true; meetName: string; clubs: number; swimmers: number; results: number };

export async function importLenexFile(
  _prevState: ImportResult | null,
  formData: FormData
): Promise<ImportResult> {
  await requireCoach();

  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) {
    return { error: "Escolhe um ficheiro .lef ou .lxf." };
  }
  if (!/\.(lef|lxf)$/i.test(file.name)) {
    return { error: "Só são aceites ficheiros .lef ou .lxf (formato LENEX)." };
  }

  let parsed: ParsedLenexMeet;
  try {
    const xml = await file.text();
    parsed = parseLenexXml(xml);
  } catch (err) {
    if (err instanceof LenexParseError) return { error: err.message };
    return { error: "Não foi possível ler o ficheiro." };
  }

  if (!parsed.startDate) {
    return { error: "O ficheiro não tem data de sessão — não é possível importar." };
  }

  const supabase = createClient();

  const isFpnMeet = (parsed.organizer ?? "").trim().toLowerCase() === FPN_ORGANIZER;

  const { data: meetRow, error: meetError } = await supabase
    .from("cem_meets")
    .insert({
      name: parsed.name,
      city: parsed.city,
      course: parsed.course,
      organizer: parsed.organizer,
      start_date: parsed.startDate,
      end_date: parsed.endDate ?? parsed.startDate,
      counts_for_cem: !isFpnMeet,
      source_file: file.name,
    } as never)
    .select()
    .single<CemMeet>();

  if (meetError || !meetRow) {
    return {
      error: meetError?.message.includes("duplicate")
        ? "Já existe uma prova com este nome e data. Apaga-a primeiro no backoffice se queres reimportar."
        : meetError?.message ?? "Erro ao criar a prova.",
    };
  }

  try {
    // Clubes.
    const clubRows = parsed.clubs.map((c) => ({ lenex_code: c.code, name: c.name }));
    const { data: clubsInserted, error: clubsError } = clubRows.length
      ? await supabase
          .from("cem_clubs")
          .upsert(clubRows as never, { onConflict: "lenex_code" })
          .select()
      : { data: [], error: null };
    if (clubsError) throw new Error(clubsError.message);
    const clubIdByCode = new Map<string, string>(
      (clubsInserted ?? []).map((c: { lenex_code: string; id: string }) => [c.lenex_code, c.id])
    );

    // Nadadoras/nadadores (chave: licença; sintética quando não vem no ficheiro).
    const swimmerRows: {
      license: string;
      first_name: string;
      last_name: string;
      birth_date: string | null;
      gender: "M" | "F" | null;
      nation: string | null;
    }[] = [];
    const swimmerKeyByAthlete = new Map<string, string>(); // "clubCode::idx" -> license
    parsed.clubs.forEach((club, clubIdx) => {
      club.athletes.forEach((a, athleteIdx) => {
        const license = a.license ?? `NOLIC-${meetRow.id}-${clubIdx}-${athleteIdx}`;
        swimmerKeyByAthlete.set(`${clubIdx}::${athleteIdx}`, license);
        swimmerRows.push({
          license,
          first_name: a.firstName,
          last_name: a.lastName,
          birth_date: a.birthDate,
          gender: a.gender,
          nation: a.nation,
        });
      });
    });

    // Ligar automaticamente ao plantel do SC Braga por número de licença.
    const licensesWithValue = swimmerRows.map((s) => s.license).filter((l) => !l.startsWith("NOLIC-"));
    const rosterMatches = licensesWithValue.length
      ? await supabase
          .from("roster_athletes")
          .select("id, federation_number")
          .in("federation_number", licensesWithValue)
      : { data: [] as { id: string; federation_number: string | null }[] };
    const rosterIdByLicense = new Map(
      (rosterMatches.data ?? [])
        .filter((r) => r.federation_number)
        .map((r) => [r.federation_number as string, r.id])
    );

    const swimmerRowsWithRoster = swimmerRows.map((s) => ({
      ...s,
      roster_athlete_id: rosterIdByLicense.get(s.license) ?? null,
    }));

    const swimmerIdByLicense = new Map<string, string>();
    for (const batch of chunk(swimmerRowsWithRoster, 500)) {
      const { data, error } = await supabase
        .from("cem_swimmers")
        .upsert(batch as never, { onConflict: "license" })
        .select();
      if (error) throw new Error(error.message);
      for (const row of (data ?? []) as { license: string; id: string }[]) {
        swimmerIdByLicense.set(row.license, row.id);
      }
    }

    // Eventos.
    const eventRows = parsed.events.map((e) => ({
      meet_id: meetRow.id,
      lenex_eventid: e.eventId,
      gender: e.gender,
      distance: e.distance,
      stroke: e.stroke,
      relaycount: e.relayCount,
    }));
    const { data: eventsInserted, error: eventsError } = eventRows.length
      ? await supabase.from("cem_events").insert(eventRows as never).select()
      : { data: [], error: null };
    if (eventsError) throw new Error(eventsError.message);
    const eventIdByLenexId = new Map<string, string>(
      (eventsInserted ?? []).map((e: { lenex_eventid: string; id: string }) => [
        e.lenex_eventid,
        e.id,
      ])
    );

    // Escalões por evento + mapa resultid -> lugar/escalão (só em memória).
    const agegroupRows: {
      event_id: string;
      lenex_agegroupid: string;
      age_min: number | null;
      age_max: number | null;
    }[] = [];
    const placeAndAgegroupByResultId = new Map<string, { place: number; agegroupKey: string }>();
    for (const e of parsed.events) {
      const eventDbId = eventIdByLenexId.get(e.eventId);
      if (!eventDbId) continue;
      for (const ag of e.agegroups) {
        agegroupRows.push({
          event_id: eventDbId,
          lenex_agegroupid: ag.agegroupId,
          age_min: ag.ageMin,
          age_max: ag.ageMax,
        });
        const agegroupKey = `${e.eventId}::${ag.agegroupId}`;
        for (const [resultId, place] of Object.entries(ag.placesByResultId)) {
          placeAndAgegroupByResultId.set(resultId, { place, agegroupKey });
        }
      }
    }
    const agegroupIdByKey = new Map<string, string>();
    for (const batch of chunk(agegroupRows, 500)) {
      const { data, error } = await supabase
        .from("cem_agegroups")
        .insert(batch as never)
        .select();
      if (error) throw new Error(error.message);
      for (const row of (data ?? []) as {
        event_id: string;
        lenex_agegroupid: string;
        id: string;
      }[]) {
        // reconstruir a chave lenex_eventid::agegroupid a partir do event_id
        const lenexEventId = [...eventIdByLenexId.entries()].find(
          ([, dbId]) => dbId === row.event_id
        )?.[0];
        if (lenexEventId) {
          agegroupIdByKey.set(`${lenexEventId}::${row.lenex_agegroupid}`, row.id);
        }
      }
    }

    // Resultados.
    const resultRows: {
      event_id: string;
      agegroup_id: string | null;
      swimmer_id: string;
      club_id: string | null;
      place_in_file: number | null;
      swimtime: string | null;
      entrytime: string | null;
      entrycourse: string | null;
      dsv_points: number | null;
      lenex_resultid: string;
    }[] = [];
    parsed.clubs.forEach((club, clubIdx) => {
      const clubId = clubIdByCode.get(club.code) ?? null;
      club.athletes.forEach((a, athleteIdx) => {
        const license = swimmerKeyByAthlete.get(`${clubIdx}::${athleteIdx}`)!;
        const swimmerId = swimmerIdByLicense.get(license);
        if (!swimmerId) return;
        for (const r of a.results) {
          const eventDbId = eventIdByLenexId.get(r.eventId);
          if (!eventDbId) continue;
          const placement = placeAndAgegroupByResultId.get(r.resultId);
          resultRows.push({
            event_id: eventDbId,
            agegroup_id: placement ? agegroupIdByKey.get(placement.agegroupKey) ?? null : null,
            swimmer_id: swimmerId,
            club_id: clubId,
            place_in_file: placement?.place ?? null,
            swimtime: r.swimTime,
            entrytime: r.entryTime,
            entrycourse: r.entryCourse,
            dsv_points: r.points,
            lenex_resultid: r.resultId,
          });
        }
      });
    });

    for (const batch of chunk(resultRows, 500)) {
      const { error } = await supabase.from("cem_results").insert(batch as never);
      if (error) throw new Error(error.message);
    }

    revalidatePath("/backoffice/cem");
    return {
      success: true,
      meetName: parsed.name,
      clubs: clubRows.length,
      swimmers: swimmerRows.length,
      results: resultRows.length,
    };
  } catch (err) {
    // Falhou a meio — não deixar a prova pendurada sem resultados completos.
    await supabase.from("cem_meets").delete().eq("id", meetRow.id);
    return { error: (err as Error).message || "Erro ao importar o ficheiro." };
  }
}

export type CemMeetWithCounts = CemMeet & {
  results_count: number;
  swimmers_count: number;
  clubs_count: number;
};

export async function listCemMeets(): Promise<CemMeetWithCounts[]> {
  const supabase = createClient();
  const { data: meets } = await supabase
    .from("cem_meets")
    .select("*")
    .order("start_date", { ascending: false })
    .returns<CemMeet[]>();
  if (!meets) return [];

  const { data: stats } = await supabase
    .from("cem_meet_stats")
    .select("*")
    .returns<{ meet_id: string; results_count: number; swimmers_count: number; clubs_count: number }[]>();

  const statsByMeet = new Map((stats ?? []).map((s) => [s.meet_id, s]));

  return meets.map((m) => {
    const s = statsByMeet.get(m.id);
    return {
      ...m,
      results_count: s?.results_count ?? 0,
      swimmers_count: s?.swimmers_count ?? 0,
      clubs_count: s?.clubs_count ?? 0,
    };
  });
}

export async function toggleCountsForCem(meetId: string, value: boolean): Promise<ActionResult> {
  await requireCoach();
  const supabase = createClient();
  const { error } = await supabase
    .from("cem_meets")
    .update({ counts_for_cem: value } as never)
    .eq("id", meetId);
  if (error) return { error: error.message };
  revalidatePath("/backoffice/cem");
  return { success: true };
}

export async function deleteCemMeet(meetId: string): Promise<ActionResult> {
  await requireCoach();
  const supabase = createClient();
  const { error } = await supabase.from("cem_meets").delete().eq("id", meetId);
  if (error) return { error: error.message };
  revalidatePath("/backoffice/cem");
  return { success: true };
}

// Junta todos os resultados elegíveis (provas com counts_for_cem = true) e
// calcula os 6 rankings x 2 géneros. Feito em memória porque o volume da
// época inteira (algumas dezenas de milhares de linhas, no máximo) é
// pequeno para isto.
const CEM_SELECT = `
  swimtime,
  cem_events!inner (
    id, gender, distance, stroke, relaycount,
    cem_meets!inner ( id, start_date, counts_for_cem )
  ),
  cem_swimmers!inner ( id, license, first_name, last_name, gender, birth_date, roster_athlete_id ),
  cem_clubs ( name )
`;

type CemResultRow = {
  swimtime: string | null;
  cem_events: {
    id: string;
    gender: "M" | "F" | "X";
    distance: number;
    stroke: LenexStroke;
    relaycount: number;
    cem_meets: { id: string; start_date: string; counts_for_cem: boolean };
  };
  cem_swimmers: {
    id: string;
    license: string;
    first_name: string;
    last_name: string;
    gender: "M" | "F" | null;
    birth_date: string | null;
    roster_athlete_id: string | null;
  };
  cem_clubs: { name: string } | null;
};

export async function getCemRankings() {
  const supabase = createClient();

  // A época inteira pode facilmente passar das 1000 linhas por defeito do
  // PostgREST, por isso pagina-se com .range() até esgotar.
  const PAGE_SIZE = 1000;
  const data: CemResultRow[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data: page, error } = await supabase
      .from("cem_results")
      .select(CEM_SELECT)
      .eq("cem_events.cem_meets.counts_for_cem", true)
      .range(from, from + PAGE_SIZE - 1)
      .returns<CemResultRow[]>();

    if (error) return [];
    data.push(...(page ?? []));
    if (!page || page.length < PAGE_SIZE) break;
  }

  if (data.length === 0) return [];

  const inputs: CemResultInput[] = data.map((row) => ({
    swimmerId: row.cem_swimmers.id,
    swimmerName: `${row.cem_swimmers.first_name} ${row.cem_swimmers.last_name}`,
    license: row.cem_swimmers.license,
    gender: row.cem_swimmers.gender,
    birthDate: row.cem_swimmers.birth_date,
    clubName: row.cem_clubs?.name ?? null,
    isOwnClub: !!row.cem_swimmers.roster_athlete_id,
    meetId: row.cem_events.cem_meets.id,
    meetDate: row.cem_events.cem_meets.start_date,
    eventId: row.cem_events.id,
    eventGender: row.cem_events.gender,
    distance: row.cem_events.distance,
    stroke: row.cem_events.stroke,
    relayCount: row.cem_events.relaycount,
    swimTime: row.swimtime,
  }));

  return computeCemRankings(inputs);
}

export type UnlinkedScBragaSwimmer = {
  id: string;
  license: string;
  firstName: string;
  lastName: string;
  birthDate: string | null;
  gender: "M" | "F" | null;
};

// Nadadoras/nadadores do SC Braga que apareceram nos resultados
// importados mas ainda não têm registo no plantel — candidatas a
// adicionar com um clique (nome + licença já vêm da FPN, sem erros de
// transcrição).
export async function listUnlinkedScBragaSwimmers(): Promise<UnlinkedScBragaSwimmer[]> {
  const supabase = createClient();

  const { data: club } = await supabase
    .from("cem_clubs")
    .select("id")
    .eq("lenex_code", SC_BRAGA_LENEX_CODE)
    .maybeSingle<{ id: string }>();
  if (!club) return [];

  const { data: results } = await supabase
    .from("cem_results")
    .select("swimmer_id")
    .eq("club_id", club.id)
    .returns<{ swimmer_id: string }[]>();
  const swimmerIds = [...new Set((results ?? []).map((r) => r.swimmer_id))];
  if (swimmerIds.length === 0) return [];

  const { data: swimmers } = await supabase
    .from("cem_swimmers")
    .select("*")
    .in("id", swimmerIds)
    .is("roster_athlete_id", null)
    .returns<CemSwimmer[]>();

  return (swimmers ?? [])
    .filter((s) => !s.license.startsWith("NOLIC-")) // sem licença real, nada a ligar
    .map((s) => ({
      id: s.id,
      license: s.license,
      firstName: s.first_name,
      lastName: s.last_name,
      birthDate: s.birth_date,
      gender: s.gender,
    }))
    .sort((a, b) => a.lastName.localeCompare(b.lastName, "pt-PT"));
}

export async function addCemSwimmerToRoster(swimmerId: string): Promise<ActionResult> {
  await requireCoach();
  const supabase = createClient();

  const { data: swimmer, error: fetchError } = await supabase
    .from("cem_swimmers")
    .select("*")
    .eq("id", swimmerId)
    .single<CemSwimmer>();
  if (fetchError || !swimmer) return { error: "Nadadora/nadador não encontrado." };

  const { data: rosterRow, error: insertError } = await supabase
    .from("roster_athletes")
    .insert({
      full_name: `${swimmer.first_name} ${swimmer.last_name}`,
      gender: swimmer.gender,
      birth_date: swimmer.birth_date,
      federation_number: swimmer.license,
    } as never)
    .select()
    .single<Database["public"]["Tables"]["roster_athletes"]["Row"]>();

  if (insertError || !rosterRow) {
    return {
      error: insertError?.message.includes("duplicate")
        ? "Já existe uma atleta com esse número de licença no plantel."
        : insertError?.message ?? "Erro ao adicionar ao plantel.",
    };
  }

  await supabase
    .from("cem_swimmers")
    .update({ roster_athlete_id: rosterRow.id } as never)
    .eq("id", swimmerId);

  revalidatePath("/backoffice/plantel");
  revalidatePath("/backoffice/cem");
  return { success: true };
}
