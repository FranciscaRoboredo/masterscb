"use client";

import { useRef, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { createRosterAthlete, updateRosterAthlete, type ActionResult } from "./actions";
import type { Database } from "@/lib/supabase/database.types";

type RosterAthlete = Database["public"]["Tables"]["roster_athletes"]["Row"];

const initialState: ActionResult | null = null;

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-50"
    >
      {pending ? "A guardar..." : label}
    </button>
  );
}

export function NewRosterForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useFormState(async (
    prevState: ActionResult | null,
    formData: FormData
  ) => {
    const result = await createRosterAthlete(prevState, formData);
    if ("success" in result) formRef.current?.reset();
    return result;
  }, initialState);

  return (
    <RosterFields formRef={formRef} formAction={formAction} state={state} submitLabel="Adicionar" />
  );
}

export function EditRosterForm({
  athlete,
  onDone,
}: {
  athlete: RosterAthlete;
  onDone: () => void;
}) {
  const boundAction = updateRosterAthlete.bind(null, athlete.id);
  const [state, formAction] = useFormState(async (
    prevState: ActionResult | null,
    formData: FormData
  ) => {
    const result = await boundAction(prevState, formData);
    if ("success" in result) onDone();
    return result;
  }, initialState);

  return <RosterFields formAction={formAction} state={state} athlete={athlete} submitLabel="Guardar" />;
}

function RosterFields({
  formRef,
  formAction,
  state,
  athlete,
  submitLabel,
}: {
  formRef?: React.RefObject<HTMLFormElement>;
  formAction: (formData: FormData) => void;
  state: ActionResult | null;
  athlete?: RosterAthlete;
  submitLabel: string;
}) {
  const [gender, setGender] = useState(athlete?.gender ?? "");

  return (
    <form ref={formRef} action={formAction} className="grid gap-3 sm:grid-cols-2">
      <div>
        <label className="block text-xs font-medium text-neutral-700">Nome</label>
        <input
          name="full_name"
          required
          defaultValue={athlete?.full_name}
          className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-1.5 text-sm shadow-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-neutral-700">Nº Licença FPN</label>
        <input
          name="federation_number"
          defaultValue={athlete?.federation_number ?? ""}
          className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-1.5 text-sm shadow-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-neutral-700">Género</label>
        <select
          name="gender"
          value={gender}
          onChange={(e) => setGender(e.target.value)}
          className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-1.5 text-sm shadow-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
        >
          <option value="">—</option>
          <option value="F">Feminino</option>
          <option value="M">Masculino</option>
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-neutral-700">Data de nascimento</label>
        <input
          name="birth_date"
          type="date"
          defaultValue={athlete?.birth_date ?? ""}
          className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-1.5 text-sm shadow-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
        />
      </div>
      <div className="sm:col-span-2">
        <label className="block text-xs font-medium text-neutral-700">Notas</label>
        <input
          name="notes"
          defaultValue={athlete?.notes ?? ""}
          className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-1.5 text-sm shadow-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
        />
      </div>
      <div className="sm:col-span-2 flex items-center gap-3">
        <SubmitButton label={submitLabel} />
        {state && "error" in state && <p className="text-sm text-red-600">{state.error}</p>}
      </div>
    </form>
  );
}
