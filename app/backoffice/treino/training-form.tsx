"use client";

import { useFormState, useFormStatus } from "react-dom";
import { saveDailyTraining, type SaveDailyTrainingResult } from "./actions";
import type { Database } from "@/lib/supabase/database.types";

type DailyTraining = Database["public"]["Tables"]["daily_trainings"]["Row"];

const initialState: SaveDailyTrainingResult | null = null;

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-neutral-900 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-50"
    >
      {pending ? "A guardar..." : "Guardar"}
    </button>
  );
}

export function TrainingForm({
  date,
  training,
}: {
  date: string;
  training: DailyTraining | null;
}) {
  const [state, formAction] = useFormState(saveDailyTraining, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="training_date" value={date} />

      <div>
        <label htmlFor="dry_land_training" className="block text-sm font-medium text-neutral-700">
          Treino seco
        </label>
        <textarea
          id="dry_land_training"
          name="dry_land_training"
          rows={4}
          defaultValue={training?.dry_land_training ?? ""}
          className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm shadow-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
        />
      </div>

      <div>
        <label htmlFor="material" className="block text-sm font-medium text-neutral-700">
          Material do dia
        </label>
        <textarea
          id="material"
          name="material"
          rows={2}
          defaultValue={training?.material ?? ""}
          className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm shadow-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
        />
      </div>

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-neutral-700">
          Notas (opcional)
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={2}
          defaultValue={training?.notes ?? ""}
          className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 text-sm shadow-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
        />
      </div>

      <div className="flex items-center gap-3">
        <SubmitButton />
        {state && "error" in state && (
          <p className="text-sm text-red-600">{state.error}</p>
        )}
        {state && "success" in state && (
          <p className="text-sm text-green-700">Guardado.</p>
        )}
      </div>
    </form>
  );
}
