"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/supabase/get-profile";
import type { Database } from "@/lib/supabase/database.types";

type RosterAthlete = Database["public"]["Tables"]["roster_athletes"]["Row"];

export type ActionResult = { error: string } | { success: true };

async function requireCoach() {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "coach") {
    throw new Error("Sem permissão.");
  }
  return profile;
}

export async function listRoster(): Promise<RosterAthlete[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("roster_athletes")
    .select("*")
    .order("full_name", { ascending: true })
    .returns<RosterAthlete[]>();

  if (error) return [];
  return data;
}

export async function createRosterAthlete(
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  await requireCoach();

  const fullName = String(formData.get("full_name") ?? "").trim();
  const gender = String(formData.get("gender") ?? "").trim();
  const birthDate = String(formData.get("birth_date") ?? "").trim();
  const federationNumber = String(formData.get("federation_number") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!fullName) {
    return { error: "O nome é obrigatório." };
  }

  const supabase = createClient();
  const payload: Database["public"]["Tables"]["roster_athletes"]["Insert"] = {
    full_name: fullName,
    gender: gender === "M" || gender === "F" ? gender : null,
    birth_date: birthDate || null,
    federation_number: federationNumber || null,
    notes: notes || null,
  };
  const { error } = await supabase.from("roster_athletes").insert(payload as never);

  if (error) {
    return {
      error: error.message.includes("duplicate")
        ? "Já existe uma atleta com esse número de licença."
        : error.message,
    };
  }

  revalidatePath("/backoffice/plantel");
  return { success: true };
}

export async function updateRosterAthlete(
  athleteId: string,
  _prevState: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  await requireCoach();

  const fullName = String(formData.get("full_name") ?? "").trim();
  const gender = String(formData.get("gender") ?? "").trim();
  const birthDate = String(formData.get("birth_date") ?? "").trim();
  const federationNumber = String(formData.get("federation_number") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!fullName) {
    return { error: "O nome é obrigatório." };
  }

  const supabase = createClient();
  const payload: Database["public"]["Tables"]["roster_athletes"]["Update"] = {
    full_name: fullName,
    gender: gender === "M" || gender === "F" ? gender : null,
    birth_date: birthDate || null,
    federation_number: federationNumber || null,
    notes: notes || null,
  };
  const { error } = await supabase
    .from("roster_athletes")
    .update(payload as never)
    .eq("id", athleteId);

  if (error) {
    return {
      error: error.message.includes("duplicate")
        ? "Já existe uma atleta com esse número de licença."
        : error.message,
    };
  }

  revalidatePath("/backoffice/plantel");
  return { success: true };
}

export async function deleteRosterAthlete(athleteId: string): Promise<ActionResult> {
  await requireCoach();

  const supabase = createClient();
  const { error } = await supabase.from("roster_athletes").delete().eq("id", athleteId);

  if (error) return { error: error.message };

  revalidatePath("/backoffice/plantel");
  return { success: true };
}
