import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/database.types";

type Competition = Database["public"]["Tables"]["competitions"]["Row"];

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export async function listUpcomingCompetitionsCalendar(): Promise<Competition[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("competitions")
    .select("*")
    .gte("end_date", todayISO())
    .order("start_date", { ascending: true })
    .returns<Competition[]>();

  if (error) return [];
  return data;
}
