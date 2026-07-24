"use client";

import { useRef } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { addResult, type ActionResult } from "../actions";
import type { Database } from "@/lib/supabase/database.types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

const initialState: ActionResult | null = null;

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-50"
    >
      {pending ? "A guardar..." : "Adicionar resultado"}
    </button>
  );
}

export function AddResultForm({
  eventId,
  competitionId,
  athletes,
}: {
  eventId: string;
  competitionId: string;
  athletes: Profile[];
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const boundAction = addResult.bind(null, eventId, competitionId);
  const [state, formAction] = useFormState(async (
    prevState: ActionResult | null,
    formData: FormData
  ) => {
    const result = await boundAction(prevState, formData);
    if ("success" in result) formRef.current?.reset();
    return result;
  }, initialState);

  return (
    <form ref={formRef} action={formAction} className="flex flex-wrap items-end gap-2">
      <select
        name="athlete_id"
        required
        defaultValue=""
        className="rounded-md border border-neutral-300 px-2 py-1.5 text-sm shadow-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
      >
        <option value="" disabled>
          Atleta
        </option>
        {athletes.map((a) => (
          <option key={a.id} value={a.id}>
            {a.full_name || a.email}
          </option>
        ))}
      </select>
      <input
        name="time"
        placeholder="Tempo (ex: 00:58.32)"
        className="w-36 rounded-md border border-neutral-300 px-2 py-1.5 text-sm shadow-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
      />
      <input
        name="position"
        type="number"
        min={1}
        placeholder="Posição"
        className="w-24 rounded-md border border-neutral-300 px-2 py-1.5 text-sm shadow-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
      />
      <input
        name="notes"
        placeholder="Notas"
        className="w-36 rounded-md border border-neutral-300 px-2 py-1.5 text-sm shadow-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
      />
      <SubmitButton />
      {state && "error" in state && <p className="w-full text-sm text-red-600">{state.error}</p>}
    </form>
  );
}
