"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/supabase/get-profile";
import type { Database } from "@/lib/supabase/database.types";

type Competition = Database["public"]["Tables"]["competitions"]["Row"];
type CompetitionEvent = Database["public"]["Tables"]["competition_events"]["Row"];
type Registration = Database["public"]["Tables"]["registrations"]["Row"];
type RelayResponse = Database["public"]["Tables"]["competition_relay_responses"]["Row"];

export type UpcomingCompetition = Competition & {
  events: (CompetitionEvent & { registered: boolean })[];
  registrationOpen: boolean;
  relayResponse: boolean | null;
};

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function isRegistrationOpen(competition: Competition, today: string) {
  if (!competition.published) return false;
  if (competition.registration_start && today < competition.registration_start) return false;
  if (competition.registration_end && today > competition.registration_end) return false;
  return true;
}

export async function listUpcomingCompetitions(): Promise<UpcomingCompetition[]> {
  const profile = await getCurrentProfile();
  if (!profile) return [];

  const supabase = createClient();
  const today = todayISO();

  const [{ data: competitions }, { data: events }, { data: myRegistrations }, { data: myRelayResponses }] =
    await Promise.all([
      supabase
        .from("competitions")
        .select("*")
        .gte("end_date", today)
        .order("start_date", { ascending: true })
        .returns<Competition[]>(),
      supabase.from("competition_events").select("*").returns<CompetitionEvent[]>(),
      supabase
        .from("registrations")
        .select("*")
        .eq("athlete_id", profile.id)
        .returns<Registration[]>(),
      supabase
        .from("competition_relay_responses")
        .select("*")
        .eq("athlete_id", profile.id)
        .returns<RelayResponse[]>(),
    ]);

  const registeredEventIds = new Set((myRegistrations ?? []).map((r) => r.competition_event_id));
  const relayByCompetition = new Map((myRelayResponses ?? []).map((r) => [r.competition_id, r.wants_relay]));

  return (competitions ?? []).map((competition) => ({
    ...competition,
    registrationOpen: isRegistrationOpen(competition, today),
    relayResponse: relayByCompetition.has(competition.id) ? relayByCompetition.get(competition.id)! : null,
    events: (events ?? [])
      .filter((e) => e.competition_id === competition.id)
      .map((e) => ({ ...e, registered: registeredEventIds.has(e.id) })),
  }));
}

export type ToggleResult = { error: string } | { success: true };

export async function register(eventId: string): Promise<ToggleResult> {
  const profile = await getCurrentProfile();
  if (!profile) return { error: "Sem sessão." };

  const supabase = createClient();
  const payload: Database["public"]["Tables"]["registrations"]["Insert"] = {
    athlete_id: profile.id,
    competition_event_id: eventId,
  };
  const { error } = await supabase.from("registrations").insert(payload as never);

  if (error) return { error: "Não foi possível inscrever (as inscrições podem estar fechadas)." };

  revalidatePath("/dashboard/provas");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function unregister(eventId: string): Promise<ToggleResult> {
  const profile = await getCurrentProfile();
  if (!profile) return { error: "Sem sessão." };

  const supabase = createClient();
  const { error } = await supabase
    .from("registrations")
    .delete()
    .eq("athlete_id", profile.id)
    .eq("competition_event_id", eventId);

  if (error) return { error: error.message };

  revalidatePath("/dashboard/provas");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function setRelayResponse(competitionId: string, wantsRelay: boolean): Promise<ToggleResult> {
  const profile = await getCurrentProfile();
  if (!profile) return { error: "Sem sessão." };

  const supabase = createClient();
  const payload: Database["public"]["Tables"]["competition_relay_responses"]["Insert"] = {
    athlete_id: profile.id,
    competition_id: competitionId,
    wants_relay: wantsRelay,
  };
  const { error } = await supabase
    .from("competition_relay_responses")
    .upsert(payload as never, { onConflict: "athlete_id,competition_id" });

  if (error) return { error: error.message };

  revalidatePath("/dashboard/provas");
  return { success: true };
}
