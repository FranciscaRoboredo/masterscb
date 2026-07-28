import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";

type DailyTraining = Database["public"]["Tables"]["daily_trainings"]["Row"];
type Registration = Database["public"]["Tables"]["registrations"]["Row"];
type CompetitionEvent = Database["public"]["Tables"]["competition_events"]["Row"];
type Competition = Database["public"]["Tables"]["competitions"]["Row"];

export type NextRace = {
  competition: Competition;
  event: CompetitionEvent;
};

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export async function getTodaysTraining(): Promise<DailyTraining | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from("daily_trainings")
    .select("*")
    .eq("training_date", todayISO())
    .maybeSingle<DailyTraining>();

  return data;
}

export async function getNextRace(athleteId: string): Promise<NextRace | null> {
  const supabase = createClient();
  const today = todayISO();

  const { data: registrations } = await supabase
    .from("registrations")
    .select("*")
    .eq("athlete_id", athleteId)
    .returns<Registration[]>();

  if (!registrations || registrations.length === 0) return null;

  const eventIds = registrations.map((r) => r.competition_event_id);

  const { data: events } = await supabase
    .from("competition_events")
    .select("*")
    .in("id", eventIds)
    .gte("event_date", today)
    .order("event_date", { ascending: true })
    .returns<CompetitionEvent[]>();

  const nextEvent = events?.[0];
  if (!nextEvent) return null;

  const { data: competition } = await supabase
    .from("competitions")
    .select("*")
    .eq("id", nextEvent.competition_id)
    .maybeSingle<Competition>();

  if (!competition) return null;

  return { competition, event: nextEvent };
}
