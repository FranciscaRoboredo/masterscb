"use client";

import { useFormState, useFormStatus } from "react-dom";
import { addCatalogEvents, type ActionResult } from "../actions";
import { SWIM_EVENTS } from "@/lib/swim-events";

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
  existingNames,
}: {
  competitionId: string;
  existingNames: string[];
}) {
  const boundAction = addCatalogEvents.bind(null, competitionId);
  const [state, formAction] = useFormState(boundAction, initialState);
  const existing = new Set(existingNames);

  return (
    <form action={formAction}>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 sm:grid-cols-3">
        {SWIM_EVENTS.map((name) => {
          const alreadyAdded = existing.has(name);
          return (
            <label
              key={name}
              className={`flex items-center gap-2 text-sm ${
                alreadyAdded ? "text-neutral-300" : "text-neutral-700"
              }`}
            >
              <input
                type="checkbox"
                name="event_names"
                value={name}
                disabled={alreadyAdded}
                className="rounded border-neutral-300"
              />
              {name}
              {alreadyAdded && " (já adicionada)"}
            </label>
          );
        })}
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
