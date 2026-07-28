"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/supabase/get-profile";
import type { Database } from "@/lib/supabase/database.types";

export type UpdateProfileResult = { error: string } | { success: true };

export async function updateProfile(
  _prevState: UpdateProfileResult | null,
  formData: FormData
): Promise<UpdateProfileResult> {
  const profile = await getCurrentProfile();
  if (!profile) return { error: "Sem sessão." };

  const fullName = String(formData.get("full_name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const birthDate = String(formData.get("birth_date") ?? "").trim();
  const club = String(formData.get("club") ?? "").trim();

  if (!fullName) {
    return { error: "O nome é obrigatório." };
  }

  const supabase = createClient();
  const payload: Database["public"]["Tables"]["profiles"]["Update"] = {
    full_name: fullName,
    phone: phone || null,
    birth_date: birthDate || null,
    club: club || null,
  };
  const { error } = await supabase
    .from("profiles")
    .update(payload as never)
    .eq("id", profile.id);

  if (error) return { error: error.message };

  revalidatePath("/profile");
  revalidatePath("/dashboard");
  return { success: true };
}
