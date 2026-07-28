"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/supabase/get-profile";

const BUCKET = "convocatorias";

export type ConvocatoriaFile = {
  name: string;
  createdAt: string | null;
};

export async function listConvocatorias(competitionId: string): Promise<ConvocatoriaFile[]> {
  const supabase = createClient();
  const { data, error } = await supabase.storage.from(BUCKET).list(competitionId, {
    sortBy: { column: "created_at", order: "desc" },
  });

  if (error || !data) return [];
  return data.map((f) => ({ name: f.name, createdAt: f.created_at ?? null }));
}

export type ConvocatoriaActionResult = { error: string } | { success: true };

export async function uploadConvocatoria(
  competitionId: string,
  _prevState: ConvocatoriaActionResult | null,
  formData: FormData
): Promise<ConvocatoriaActionResult> {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "coach") {
    return { error: "Sem permissão." };
  }

  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) {
    return { error: "Escolhe um ficheiro PDF." };
  }
  if (file.type !== "application/pdf") {
    return { error: "Só são aceites ficheiros PDF." };
  }

  const supabase = createClient();
  const path = `${competitionId}/${file.name}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    upsert: true,
    contentType: "application/pdf",
  });

  if (error) return { error: error.message };

  revalidatePath(`/backoffice/competitions/${competitionId}`);
  revalidatePath("/dashboard/provas");
  return { success: true };
}

export async function deleteConvocatoria(
  competitionId: string,
  filename: string
): Promise<ConvocatoriaActionResult> {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "coach") {
    return { error: "Sem permissão." };
  }

  const supabase = createClient();
  const { error } = await supabase.storage.from(BUCKET).remove([`${competitionId}/${filename}`]);

  if (error) return { error: error.message };

  revalidatePath(`/backoffice/competitions/${competitionId}`);
  revalidatePath("/dashboard/provas");
  return { success: true };
}

export async function getConvocatoriaUrl(
  competitionId: string,
  filename: string
): Promise<{ url: string } | { error: string }> {
  const profile = await getCurrentProfile();
  if (!profile) return { error: "Sem sessão." };

  const supabase = createClient();
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(`${competitionId}/${filename}`, 60);

  if (error || !data) return { error: "Não foi possível gerar o link de download." };
  return { url: data.signedUrl };
}
