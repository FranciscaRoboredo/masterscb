"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createEphemeralClient } from "@/lib/supabase/ephemeral";
import { getCurrentProfile } from "@/lib/supabase/get-profile";
import type { Database } from "@/lib/supabase/database.types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export type InviteAthleteResult = { error: string } | { success: true };

export async function inviteAthlete(
  _prevState: InviteAthleteResult | null,
  formData: FormData
): Promise<InviteAthleteResult> {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "coach") {
    return { error: "Sem permissão." };
  }

  const email = String(formData.get("email") ?? "").trim();
  const fullName = String(formData.get("full_name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const birthDate = String(formData.get("birth_date") ?? "").trim();
  const club = String(formData.get("club") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim();

  if (!email || !fullName) {
    return { error: "Nome e email são obrigatórios." };
  }

  const headersList = headers();
  const host = headersList.get("x-forwarded-host") ?? headersList.get("host");
  const protocol = headersList.get("x-forwarded-proto") ?? (host?.startsWith("localhost") ? "http" : "https");
  const emailRedirectTo = `${protocol}://${host}/auth/callback`;

  // Ephemeral client: does not touch the coach's own session cookies.
  const supabase = createEphemeralClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      shouldCreateUser: true,
      emailRedirectTo,
      data: {
        full_name: fullName,
        role: "athlete",
        phone: phone || null,
        birth_date: birthDate || null,
        club: club || null,
        notes: notes || null,
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/backoffice");
  return { success: true };
}

export async function listAthletes(): Promise<Profile[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "athlete")
    .order("created_at", { ascending: false })
    .returns<Profile[]>();

  if (error) return [];
  return data;
}
