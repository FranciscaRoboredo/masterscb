"use client";

import { useRef } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { uploadConvocatoria, type ConvocatoriaActionResult } from "@/lib/convocatorias-actions";

const initialState: ConvocatoriaActionResult | null = null;

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-50"
    >
      {pending ? "A enviar..." : "Enviar PDF"}
    </button>
  );
}

export function ConvocatoriaUploadForm({ competitionId }: { competitionId: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const boundAction = uploadConvocatoria.bind(null, competitionId);
  const [state, formAction] = useFormState(async (
    prevState: ConvocatoriaActionResult | null,
    formData: FormData
  ) => {
    const result = await boundAction(prevState, formData);
    if ("success" in result) formRef.current?.reset();
    return result;
  }, initialState);

  return (
    <form ref={formRef} action={formAction} className="flex flex-wrap items-center gap-3">
      <input
        type="file"
        name="file"
        accept="application/pdf"
        required
        className="text-sm text-neutral-700"
      />
      <SubmitButton />
      {state && "error" in state && <p className="text-sm text-red-600">{state.error}</p>}
      {state && "success" in state && <p className="text-sm text-green-700">Enviado.</p>}
    </form>
  );
}
