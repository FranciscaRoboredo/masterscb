"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/supabase/get-profile";
import type { Database } from "@/lib/supabase/database.types";

type DailyTraining = Database["public"]["Tables"]["daily_trainings"]["Row"];

export async function getDailyTraining(date: string): Promise<DailyTraining | null> {
  const supabase = createClient();
  const { data } = await supabase
    .from("daily_trainings")
    .select("*")
    .eq("training_date", date)
    .maybeSingle<DailyTraining>();

  return data;
}

export type SaveDailyTrainingResult = { error: string } | { success: true };

export async function saveDailyTraining(
  _prevState: SaveDailyTrainingResult | null,
  formData: FormData
): Promise<SaveDailyTrainingResult> {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "coach") {
    return { error: "Sem permissão." };
  }

  const trainingDate = String(formData.get("training_date") ?? "").trim();
  const dryLandTraining = String(formData.get("dry_land_training") ?? "").trim();
  const material = String(formData.get("material") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!trainingDate) {
    return { error: "A data é obrigatória." };
  }

  const supabase = createClient();
  const payload: Database["public"]["Tables"]["daily_trainings"]["Insert"] = {
    training_date: trainingDate,
    dry_land_training: dryLandTraining || null,
    material: material || null,
    notes: notes || null,
  };
  // postgrest-js's upsert() generic fails to resolve against our hand-written
  // Database type; the payload above is already checked against Insert.
  const { error } = await supabase
    .from("daily_trainings")
    .upsert(payload as never, { onConflict: "training_date" });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/backoffice/treino");
  revalidatePath("/dashboard");
  return { success: true };
}
