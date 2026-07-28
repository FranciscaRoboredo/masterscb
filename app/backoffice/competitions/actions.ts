"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/supabase/get-profile";
import type { Database } from "@/lib/supabase/database.types";

type Competition = Database["public"]["Tables"]["competitions"]["Row"];
type CompetitionEvent = Database["public"]["Tables"]["competition_events"]["Row"];
type Result = Database["public"]["Tables"]["results"]["Row"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];

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
    .order("date", { ascending: false })
    .returns<Competition[]>();

  if (error) return [];
  return data;
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
    .order("event_time", { ascending: true })
    .returns<CompetitionEvent[]>();

  if (error) return [];
  return data;
}

export type EventWithDetails = CompetitionEvent & {
  registeredAthletes: Profile[];
  results: (Result & { athlete: Profile | null })[];
};

type Registration = Database["public"]["Tables"]["registrations"]["Row"];

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

export async function createCompetition(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  await requireCoach();

  const name = String(formData.get("name") ?? "").trim();
  const location = String(formData.get("location") ?? "").trim();
  const date = String(formData.get("date") ?? "").trim();
  const registrationStart = String(formData.get("registration_start") ?? "").trim();
  const registrationEnd = String(formData.get("registration_end") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!name || !date) {
    return { error: "Nome e data são obrigatórios." };
  }

  if (registrationStart && registrationEnd && registrationStart > registrationEnd) {
    return { error: "A data de início de inscrições não pode ser depois da data de fim." };
  }

  const supabase = createClient();
  const payload: Database["public"]["Tables"]["competitions"]["Insert"] = {
    name,
    location: location || null,
    date,
    registration_start: registrationStart || null,
    registration_end: registrationEnd || null,
    notes: notes || null,
  };
  // postgrest-js's insert() generic fails to resolve against our hand-written
  // Database type; the payload above is already checked against Insert.
  const { error } = await supabase.from("competitions").insert(payload as never);

  if (error) return { error: error.message };

  revalidatePath("/backoffice/competitions");
  return { success: true };
}

export async function createEvent(
  competitionId: string,
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  await requireCoach();

  const name = String(formData.get("name") ?? "").trim();
  const eventTime = String(formData.get("event_time") ?? "").trim();

  if (!name) {
    return { error: "O nome da prova é obrigatório." };
  }

  const supabase = createClient();
  const payload: Database["public"]["Tables"]["competition_events"]["Insert"] = {
    competition_id: competitionId,
    name,
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

  revalidatePath(`/backoffice/competitions/${competitionId}`);
  return { success: true };
}

export async function addCatalogEvents(
  competitionId: string,
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  await requireCoach();

  const names = formData.getAll("event_names").map(String);
  if (names.length === 0) {
    return { error: "Escolhe pelo menos uma prova." };
  }

  const supabase = createClient();
  const existing = await listEvents(competitionId);
  const existingNames = new Set(existing.map((e) => e.name));
  const toInsert = names.filter((n) => !existingNames.has(n));

  if (toInsert.length === 0) {
    return { error: "Essas provas já estão adicionadas." };
  }

  const payload: Database["public"]["Tables"]["competition_events"]["Insert"][] = toInsert.map(
    (name) => ({ competition_id: competitionId, name })
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
