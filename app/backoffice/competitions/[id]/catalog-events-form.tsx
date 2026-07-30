"use client";

import { useFormState, useFormStatus } from "react-dom";
import { addCatalogEvents, type ActionResult } from "../actions";
import { SWIM_EVENTS } from "@/lib/swim-events";
import { SessionSelect } from "@/components/session-select";

const initialState: ActionResult | null = null;

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-50"
    >
      {pending ? "A adicionar..." : "Adicionar selecionadas"}
    </button>
  );
}

export function CatalogEventsForm({
  competitionId,
  startDate,
  endDate,
}: {
  competitionId: string;
  startDate: string;
  endDate: string;
}) {
  const boundAction = addCatalogEvents.bind(null, competitionId);
  const [state, formAction] = useFormState(boundAction, initialState);

  return (
    <form action={formAction}>
      <div className="mb-3 flex flex-wrap gap-3">
        <div>
          <label htmlFor="event_date" className="block text-xs font-medium text-neutral-700">
            Dia em que estas provas acontecem
          </label>
          <input
            id="event_date"
            name="event_date"
            type="date"
            required
            min={startDate}
            max={endDate}
            defaultValue={startDate}
            className="mt-1 block rounded-md border border-neutral-300 px-3 py-1.5 text-sm shadow-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
          />
        </div>
        <SessionSelect id="catalog_session" />
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-1 sm:grid-cols-3">
        {SWIM_EVENTS.map((name) => (
          <label key={name} className="flex items-center gap-2 text-sm text-neutral-700">
            <input type="checkbox" name="event_names" value={name} className="rounded border-neutral-300" />
            {name}
          </label>
        ))}
      </div>

      <div className="mt-3 flex items-center gap-3">
        <SubmitButton />
        {state && "error" in state && <p className="text-sm text-red-600">{state.error}</p>}
        {state && "success" in state && (
          <p className="text-sm text-green-700">Provas adicionadas.</p>
        )}
      </div>
    </form>
  );
}
