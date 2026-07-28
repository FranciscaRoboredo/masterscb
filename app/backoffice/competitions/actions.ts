"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/supabase/get-profile";
import type { Database } from "@/lib/supabase/database.types";

type Competition = Database["public"]["Tables"]["competitions"]["Row"];
type CompetitionEvent = Database["public"]["Tables"]["competition_events"]["Row"];
type Result = Database["public"]["Tables"]["results"]["Row"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type Registration = Database["public"]["Tables"]["registrations"]["Row"];

export type ActionResult = { error: string } | { success: true };

async function requireCoach() {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "coach") {
    throw new Error("Sem permissão.");
  }
  return profile;
}

export async function listCompetitions(): Promise<Competition[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("competitions")
    .select("*")
    .order("start_date", { ascending: false })
    .returns<Competition[]>();

  if (error) return [];
  return data;
}

export type NextCompetitionSummary = {
  competition: Competition;
  totalRegisteredAthletes: number;
  events: { id: string; name: string; count: number }[];
  byDay: { date: string; count: number }[];
};

export async function getNextCompetitionSummary(): Promise<NextCompetitionSummary | null> {
  const supabase = createClient();
  const today = new Date().toISOString().slice(0, 10);

  const { data: competitions } = await supabase
    .from("competitions")
    .select("*")
    .gte("end_date", today)
    .order("start_date", { ascending: true })
    .limit(1)
    .returns<Competition[]>();

  const competition = competitions?.[0];
  if (!competition) return null;

  const events = await listEvents(competition.id);
  if (events.length === 0) {
    return { competition, totalRegisteredAthletes: 0, events: [], byDay: [] };
  }

  const eventIds = events.map((e) => e.id);
  const { data: registrations } = await supabase
    .from("registrations")
    .select("*")
    .in("competition_event_id", eventIds)
    .returns<Registration[]>();

  const eventById = new Map(events.map((e) => [e.id, e]));
  const countByEvent = new Map<string, number>();
  const athletesByDay = new Map<string, Set<string>>();

  (registrations ?? []).forEach((r) => {
    countByEvent.set(r.competition_event_id, (countByEvent.get(r.competition_event_id) ?? 0) + 1);
    const event = eventById.get(r.competition_event_id);
    if (event) {
      const set = athletesByDay.get(event.event_date) ?? new Set<string>();
      set.add(r.athlete_id);
      athletesByDay.set(event.event_date, set);
    }
  });

  return {
    competition,
    totalRegisteredAthletes: new Set((registrations ?? []).map((r) => r.athlete_id)).size,
    events: events.map((e) => ({ id: e.id, name: e.name, count: countByEvent.get(e.id) ?? 0 })),
    byDay: [...athletesByDay.entries()]
      .map(([date, athletes]) => ({ date, count: athletes.size }))
      .sort((a, b) => a.date.localeCompare(b.date)),
  };
}

export async function getCompetition(id: string): Promise<Competition | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from("competitions")
    .select("*")
    .eq("id", id)
    .maybeSingle<Competition>();

  return data;
}

export async function listEvents(competitionId: string): Promise<CompetitionEvent[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("competition_events")
    .select("*")
    .eq("competition_id", competitionId)
    .order("event_date", { ascending: true })
    .order("event_time", { ascending: true })
    .returns<CompetitionEvent[]>();

  if (error) return [];
  return data;
}

export type EventWithDetails = CompetitionEvent & {
  registeredAthletes: Profile[];
  results: (Result & { athlete: Profile | null })[];
};

export async function listEventsWithDetails(competitionId: string): Promise<EventWithDetails[]> {
  const supabase = createClient();
  const events = await listEvents(competitionId);
  if (events.length === 0) return [];

  const eventIds = events.map((e) => e.id);

  const [{ data: registrations }, { data: results }, athletes] = await Promise.all([
    supabase
      .from("registrations")
      .select("*")
      .in("competition_event_id", eventIds)
      .returns<Registration[]>(),
    supabase
      .from("results")
      .select("*")
      .in("competition_event_id", eventIds)
      .returns<Result[]>(),
    listAllAthletes(),
  ]);

  const athleteById = new Map(athletes.map((a) => [a.id, a]));

  return events.map((event) => ({
    ...event,
    registeredAthletes: (registrations ?? [])
      .filter((r) => r.competition_event_id === event.id)
      .map((r) => athleteById.get(r.athlete_id))
      .filter((a): a is Profile => Boolean(a)),
    results: (results ?? [])
      .filter((r) => r.competition_event_id === event.id)
      .map((r) => ({ ...r, athlete: athleteById.get(r.athlete_id) ?? null })),
  }));
}

export type DayRegistrationSummary = {
  date: string;
  athleteCount: number;
  athletes: { athlete: Profile; eventNames: string[] }[];
};

export async function getRegistrationsByDay(competitionId: string): Promise<DayRegistrationSummary[]> {
  const supabase = createClient();
  const events = await listEvents(competitionId);
  if (events.length === 0) return [];

  const eventIds = events.map((e) => e.id);
  const [{ data: registrations }, athletes] = await Promise.all([
    supabase
      .from("registrations")
      .select("*")
      .in("competition_event_id", eventIds)
      .returns<Registration[]>(),
    listAllAthletes(),
  ]);

  const athleteById = new Map(athletes.map((a) => [a.id, a]));
  const eventById = new Map(events.map((e) => [e.id, e]));

  const byDay = new Map<string, Map<string, string[]>>();

  (registrations ?? []).forEach((r) => {
    const event = eventById.get(r.competition_event_id);
    if (!event) return;
    const dayMap = byDay.get(event.event_date) ?? new Map<string, string[]>();
    const eventNames = dayMap.get(r.athlete_id) ?? [];
    eventNames.push(event.name);
    dayMap.set(r.athlete_id, eventNames);
    byDay.set(event.event_date, dayMap);
  });

  return [...byDay.entries()]
    .map(([date, athleteMap]) => ({
      date,
      athleteCount: athleteMap.size,
      athletes: [...athleteMap.entries()]
        .map(([athleteId, eventNames]) => {
          const athlete = athleteById.get(athleteId);
          return athlete ? { athlete, eventNames } : null;
        })
        .filter((a): a is { athlete: Profile; eventNames: string[] } => Boolean(a)),
    }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export async function createCompetition(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  await requireCoach();

  const name = String(formData.get("name") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const startDate = String(formData.get("start_date") ?? "").trim();
  const endDate = String(formData.get("end_date") ?? "").trim() || startDate;
  const registrationStart = String(formData.get("registration_start") ?? "").trim();
  const registrationEnd = String(formData.get("registration_end") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!name || !startDate) {
    return { error: "Nome e data de início são obrigatórios." };
  }

  if (endDate < startDate) {
    return { error: "A data de fim não pode ser antes da data de início." };
  }

  if (registrationStart && registrationEnd && registrationStart > registrationEnd) {
    return { error: "A data de início de inscrições não pode ser depois da data de fim." };
  }

  const supabase = createClient();
  const payload: Database["public"]["Tables"]["competitions"]["Insert"] = {
    name,
    location: location || null,
    start_date: startDate,
    end_date: endDate,
    registration_start: registrationStart || null,
    registration_end: registrationEnd || null,
    published: false,
    notes: notes || null,
  };
  // postgrest-js's insert() generic fails to resolve against our hand-written
  // Database type; the payload above is already checked against Insert.
  const { error } = await supabase.from("competitions").insert(payload as never);

  if (error) return { error: error.message };

  revalidatePath("/backoffice/competitions");
  return { success: true };
}

export async function setPublished(
  competitionId: string,
  published: boolean
): Promise<ActionResult> {
  await requireCoach();

  const supabase = createClient();
  const payload: Database["public"]["Tables"]["competitions"]["Update"] = { published };
  const { error } = await supabase
    .from("competitions")
    .update(payload as never)
    .eq("id", competitionId);

  if (error) return { error: error.message };

  revalidatePath(`/backoffice/competitions/${competitionId}`);
  revalidatePath("/backoffice/competitions");
  revalidatePath("/backoffice");
  revalidatePath("/dashboard/provas");
  return { success: true };
}

export async function createEvent(
  competitionId: string,
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  await requireCoach();

  const name = String(formData.get("name") ?? "").trim();
  const eventDate = String(formData.get("event_date") ?? "").trim();
  const eventTime = String(formData.get("event_time") ?? "").trim();

  if (!name || !eventDate) {
    return { error: "O nome e a data da prova são obrigatórios." };
  }

  const supabase = createClient();
  const payload: Database["public"]["Tables"]["competition_events"]["Insert"] = {
    competition_id: competitionId,
    name,
    event_date: eventDate,
    event_time: eventTime || null,
  };
  const { error } = await supabase.from("competition_events").insert(payload as never);

  if (error) return { error: error.message };

  revalidatePath(`/backoffice/competitions/${competitionId}`);
  return { success: true };
}

export async function addResult(
  eventId: string,
  competitionId: string,
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  await requireCoach();

  const athleteId = String(formData.get("athlete_id") ?? "").trim();
  const time = String(formData.get("time") ?? "").trim();
  const positionRaw = String(formData.get("position") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!athleteId) {
    return { error: "Escolhe a atleta." };
  }

  const supabase = createClient();
  const payload: Database["public"]["Tables"]["results"]["Insert"] = {
    athlete_id: athleteId,
    competition_event_id: eventId,
    time: time || null,
    position: positionRaw ? Number(positionRaw) : null,
    notes: notes || null,
  };
  const { error } = await supabase.from("results").insert(payload as never);

  if (error) return { error: error.message };

  revalidatePath(`/backoffice/competitions/${competitionId}/resultados`);
  return { success: true };
}

export async function addCatalogEvents(
  competitionId: string,
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  await requireCoach();

  const eventDate = String(formData.get("event_date") ?? "").trim();
  const names = formData.getAll("event_names").map(String);

  if (!eventDate) {
    return { error: "Escolhe o dia em que estas provas acontecem." };
  }
  if (names.length === 0) {
    return { error: "Escolhe pelo menos uma prova." };
  }

  const supabase = createClient();
  const existing = await listEvents(competitionId);
  const existingKeys = new Set(existing.map((e) => `${e.name}__${e.event_date}`));
  const toInsert = names.filter((n) => !existingKeys.has(`${n}__${eventDate}`));

  if (toInsert.length === 0) {
    return { error: "Essas provas já estão adicionadas nesse dia." };
  }

  const payload: Database["public"]["Tables"]["competition_events"]["Insert"][] = toInsert.map(
    (name) => ({ competition_id: competitionId, name, event_date: eventDate })
  );
  const { error } = await supabase.from("competition_events").insert(payload as never);

  if (error) return { error: error.message };

  revalidatePath(`/backoffice/competitions/${competitionId}`);
  return { success: true };
}

export type RelayResponseWithAthlete = {
  athlete: Profile;
  wantsRelay: boolean;
};

export async function listRelayResponses(competitionId: string): Promise<RelayResponseWithAthlete[]> {
  const supabase = createClient();
  type RelayResponse = Database["public"]["Tables"]["competition_relay_responses"]["Row"];

  const [{ data: responses }, athletes] = await Promise.all([
    supabase
      .from("competition_relay_responses")
      .select("*")
      .eq("competition_id", competitionId)
      .returns<RelayResponse[]>(),
    listAllAthletes(),
  ]);

  const athleteById = new Map(athletes.map((a) => [a.id, a]));

  return (responses ?? [])
    .map((r) => {
      const athlete = athleteById.get(r.athlete_id);
      return athlete ? { athlete, wantsRelay: r.wants_relay } : null;
    })
    .filter((r): r is RelayResponseWithAthlete => Boolean(r));
}

export async function listAllAthletes(): Promise<Profile[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "athlete")
    .order("full_name", { ascending: true })
    .returns<Profile[]>();

  if (error) return [];
  return data;
}
