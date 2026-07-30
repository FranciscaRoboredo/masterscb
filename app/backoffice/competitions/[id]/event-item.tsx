"use client";

import { useState, useTransition } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { updateEvent, deleteEvent, type ActionResult } from "../actions";
import type { EventWithDetails } from "../actions";
import { SessionSelect } from "@/components/session-select";
import { SESSION_LABELS } from "@/lib/event-session";

const initialState: ActionResult | null = null;

function formatDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("pt-PT", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-50"
    >
      {pending ? "A guardar..." : "Guardar"}
    </button>
  );
}

export function EventItem({
  event,
  competitionId,
  startDate,
  endDate,
}: {
  event: EventWithDetails;
  competitionId: string;
  startDate: string;
  endDate: string;
}) {
  const [editing, setEditing] = useState(false);
  const [isDeleting, startDeleteTransition] = useTransition();
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const boundUpdate = updateEvent.bind(null, event.id, competitionId);
  const [state, formAction] = useFormState(async (
    prevState: ActionResult | null,
    formData: FormData
  ) => {
    const result = await boundUpdate(prevState, formData);
    if ("success" in result) setEditing(false);
    return result;
  }, initialState);

  function handleDelete() {
    const hasRegistrations = event.registeredAthletes.length > 0;
    const message = hasRegistrations
      ? `"${event.name}" tem ${event.registeredAthletes.length} inscrita(s). Apagar remove também essas inscrições. Continuar?`
      : `Apagar "${event.name}"?`;

    if (!window.confirm(message)) return;

    setDeleteError(null);
    startDeleteTransition(async () => {
      const result = await deleteEvent(event.id, competitionId);
      if ("error" in result) setDeleteError(result.error);
    });
  }

  if (editing) {
    return (
      <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
        <form action={formAction} className="flex flex-wrap items-end gap-3">
          <div>
            <label className="block text-xs font-medium text-neutral-700">Prova</label>
            <input
              name="name"
              required
              defaultValue={event.name}
              className="mt-1 block rounded-md border border-neutral-300 px-3 py-1.5 text-sm shadow-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-700">Dia</label>
            <input
              name="event_date"
              type="date"
              required
              min={startDate}
              max={endDate}
              defaultValue={event.event_date}
              className="mt-1 block rounded-md border border-neutral-300 px-3 py-1.5 text-sm shadow-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-neutral-700">Hora</label>
            <input
              name="event_time"
              type="time"
              defaultValue={event.event_time ?? ""}
              className="mt-1 block rounded-md border border-neutral-300 px-3 py-1.5 text-sm shadow-sm focus:border-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-500"
            />
          </div>
          <SessionSelect defaultValue={event.session} id={`session-${event.id}`} />
          <SaveButton />
          <button
            type="button"
            onClick={() => setEditing(false)}
            className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm text-neutral-700 hover:bg-neutral-100"
          >
            Cancelar
          </button>
          {state && "error" in state && <p className="w-full text-sm text-red-600">{state.error}</p>}
        </form>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-neutral-900">{event.name}</h3>
        <div className="flex items-center gap-3">
          <span className="text-sm text-neutral-500">
            {formatDate(event.event_date)}
            {event.session && ` · ${SESSION_LABELS[event.session]}`}
            {event.event_time && ` · ${event.event_time.slice(0, 5)}`}
          </span>
          <button
            onClick={() => setEditing(true)}
            className="text-sm text-neutral-500 hover:text-neutral-900"
          >
            Editar
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-sm text-red-600 hover:text-red-800 disabled:opacity-50"
          >
            {isDeleting ? "A apagar..." : "Apagar"}
          </button>
        </div>
      </div>

      <p className="mt-2 text-xs uppercase tracking-wide text-neutral-400">
        Inscritas ({event.registeredAthletes.length})
      </p>
      <p className="mt-1 text-sm text-neutral-700">
        {event.registeredAthletes.length > 0
          ? event.registeredAthletes.map((a) => a.full_name || a.email).join(", ")
          : "Ninguém inscrito ainda."}
      </p>
      {deleteError && <p className="mt-2 text-sm text-red-600">{deleteError}</p>}
    </div>
  );
}
