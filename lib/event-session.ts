import type { EventSession } from "@/lib/supabase/database.types";

export const SESSION_LABELS: Record<EventSession, string> = {
  manha: "Manhã",
  tarde: "Tarde",
};
