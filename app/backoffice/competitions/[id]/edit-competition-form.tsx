"use client";

import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { updateCompetition, type ActionResult } from "../actions";
import type { Database } from "@/lib/supabase/database.types";

type Competition = Database["public"]["Tables"]["competitions"]["Row"];

const initialState: ActionResult | null = null;

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-50"
    >
      {pending ? "A guardar..." : "Guardar alterações"}
    </button>
  );
}

export function EditCompetitionForm({ competition }: { competition: Competition }) {
  const [editing, setEditing] = useState(false);
  const boundAction = updateCompetition.bind(null, competition.id);
  const [state, formAction] = useFormState(async (
    prevState: ActionResult | null,
    formData: FormData
  ) => {
    const result = await boundAction(prevState, formData);
    if ("success" in result) setEditing(false);
    return result;
  }, initialState);

  if (!editing) {
    return (
      <button
        onClick={() => setEditing(true)}
        className="text-sm text-neutral-500 hover:text-neutral-900"
      >
        Editar competição
      </button>
    );
  }

  return (
    <form action={formAction} className="mt-4 grid gap-3 rounded-lg border border-neutral-200 bg-white p-4 shadow-sm sm:grid-cols-2">
      <div>
        <label className="block text-sm font-medium text-neutral-700">Nome</label>
        <input
          name="name"
          required
          defaultValue={competition.name}
          className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm shadow-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-neutral-700">Local (morada)</label>
        <input
          name="location"
          defaultValue={competition.location ?? ""}
          className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm shadow-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-neutral-700">Data de início</label>
        <input
          name="start_date"
          type="date"
          required
          defaultValue={competition.start_date}
          className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm shadow-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-neutral-700">Data de fim</label>
        <input
          name="end_date"
          type="date"
          defaultValue={competition.end_date}
          className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm shadow-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-neutral-700">Data final para inscrição</label>
        <input
          name="registration_end"
          type="date"
          defaultValue={competition.registration_end ?? ""}
          className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm shadow-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
        />
      </div>
      <div className="flex items-end pb-2">
        <label className="flex items-center gap-2 text-sm text-neutral-700">
          <input
            type="checkbox"
            name="counts_for_cem"
            defaultChecked={competition.counts_for_cem}
            className="rounded border-neutral-300"
          />
          Conta para o CEM
        </label>
      </div>
      <div className="sm:col-span-2">
        <label className="block text-sm font-medium text-neutral-700">Notas</label>
        <textarea
          name="notes"
          rows={2}
          defaultValue={competition.notes ?? ""}
          className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm shadow-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
        />
      </div>

      <div className="sm:col-span-2 flex items-center gap-3">
        <SaveButton />
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="rounded-md border border-neutral-300 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
        >
          Cancelar
        </button>
        {state && "error" in state && <p className="text-sm text-red-600">{state.error}</p>}
      </div>
    </form>
  );
}
