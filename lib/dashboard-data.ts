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
    .returns<CompetitionEvent[]>();

  if (!events || events.length === 0) return null;

  const competitionIds = [...new Set(events.map((e) => e.competition_id))];

  const { data: competitions } = await supabase
    .from("competitions")
    .select("*")
    .in("id", competitionIds)
    .gte("date", todayISO())
    .order("date", { ascending: true })
    .returns<Competition[]>();

  if (!competitions || competitions.length === 0) return null;

  const nextCompetition = competitions[0];
  const event = events.find((e) => e.competition_id === nextCompetition.id);
  if (!event) return null;

  return { competition: nextCompetition, event };
}
