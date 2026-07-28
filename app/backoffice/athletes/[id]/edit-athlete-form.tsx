"use client";

import { useFormState, useFormStatus } from "react-dom";
import { updateAthlete, type UpdateAthleteResult } from "../../actions";
import type { Database } from "@/lib/supabase/database.types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

const initialState: UpdateAthleteResult | null = null;

function SubmitButton() {
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

export function EditAthleteForm({ athlete }: { athlete: Profile }) {
  const boundAction = updateAthlete.bind(null, athlete.id);
  const [state, formAction] = useFormState(boundAction, initialState);

  return (
    <form action={formAction} className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <label htmlFor="full_name" className="block text-sm font-medium text-neutral-700">
          Nome completo
        </label>
        <input
          id="full_name"
          name="full_name"
          required
          defaultValue={athlete.full_name}
          className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm shadow-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
        />
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-neutral-700">
          Telefone
        </label>
        <input
          id="phone"
          name="phone"
          defaultValue={athlete.phone ?? ""}
          className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm shadow-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
        />
      </div>

      <div>
        <label htmlFor="birth_date" className="block text-sm font-medium text-neutral-700">
          Data de nascimento
        </label>
        <input
          id="birth_date"
          name="birth_date"
          type="date"
          defaultValue={athlete.birth_date ?? ""}
          className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm shadow-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
        />
      </div>

      <div>
        <label htmlFor="club" className="block text-sm font-medium text-neutral-700">
          Clube
        </label>
        <input
          id="club"
          name="club"
          defaultValue={athlete.club ?? ""}
          className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm shadow-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
        />
      </div>

      <div>
        <label htmlFor="federation_number" className="block text-sm font-medium text-neutral-700">
          Número de federado
        </label>
        <input
          id="federation_number"
          name="federation_number"
          defaultValue={athlete.federation_number ?? ""}
          className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm shadow-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
        />
      </div>

      <div className="sm:col-span-2">
        <label htmlFor="notes" className="block text-sm font-medium text-neutral-700">
          Notas
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={2}
          defaultValue={athlete.notes ?? ""}
          className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm shadow-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
        />
      </div>

      <div className="sm:col-span-2 flex items-center gap-3">
        <SubmitButton />
        {state && "error" in state && <p className="text-sm text-red-600">{state.error}</p>}
        {state && "success" in state && (
          <p className="text-sm text-green-700">Guardado.</p>
        )}
      </div>
    </form>
  );
}
