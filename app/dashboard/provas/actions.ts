"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/supabase/get-profile";
import type { Database } from "@/lib/supabase/database.types";

type Competition = Database["public"]["Tables"]["competitions"]["Row"];
type CompetitionEvent = Database["public"]["Tables"]["competition_events"]["Row"];
type Registration = Database["public"]["Tables"]["registrations"]["Row"];

export type UpcomingCompetition = Competition & {
  events: (CompetitionEvent & { registered: boolean })[];
};

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export async function listUpcomingCompetitions(): Promise<UpcomingCompetition[]> {
  const profile = await getCurrentProfile();
  if (!profile) return [];

  const supabase = createClient();

  const [{ data: competitions }, { data: events }, { data: myRegistrations }] = await Promise.all([
    supabase
      .from("competitions")
      .select("*")
      .gte("date", todayISO())
      .order("date", { ascending: true })
      .returns<Competition[]>(),
    supabase.from("competition_events").select("*").returns<CompetitionEvent[]>(),
    supabase
      .from("registrations")
      .select("*")
      .eq("athlete_id", profile.id)
      .returns<Registration[]>(),
  ]);

  const registeredEventIds = new Set((myRegistrations ?? []).map((r) => r.competition_event_id));

  return (competitions ?? []).map((competition) => ({
    ...competition,
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

  if (error) return { error: error.message };

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
