"use client";

import { useRef } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { createEvent, type ActionResult } from "../actions";

const initialState: ActionResult | null = null;

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-50"
    >
      {pending ? "A adicionar..." : "Adicionar prova"}
    </button>
  );
}

export function NewEventForm({
  competitionId,
  startDate,
  endDate,
}: {
  competitionId: string;
  startDate: string;
  endDate: string;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const boundAction = createEvent.bind(null, competitionId);
  const [state, formAction] = useFormState(async (
    prevState: ActionResult | null,
    formData: FormData
  ) => {
    const result = await boundAction(prevState, formData);
    if ("success" in result) formRef.current?.reset();
    return result;
  }, initialState);

  return (
    <form ref={formRef} action={formAction} className="flex flex-wrap items-end gap-3">
      <div>
        <label htmlFor="name" className="block text-xs font-medium text-neutral-700">
          Prova (ex: 100m Livre)
        </label>
        <input
          id="name"
          name="name"
          required
          className="mt-1 block rounded-md border border-neutral-300 px-3 py-1.5 text-sm shadow-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
        />
      </div>
      <div>
        <label htmlFor="event_date" className="block text-xs font-medium text-neutral-700">
          Dia
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
      <div>
        <label htmlFor="event_time" className="block text-xs font-medium text-neutral-700">
          Hora (opcional)
        </label>
        <input
          id="event_time"
          name="event_time"
          type="time"
          className="mt-1 block rounded-md border border-neutral-300 px-3 py-1.5 text-sm shadow-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
        />
      </div>
      <SubmitButton />
      {state && "error" in state && <p className="text-sm text-red-600">{state.error}</p>}
    </form>
  );
}
