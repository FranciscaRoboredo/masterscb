"use client";

import { useState, useTransition } from "react";
import { deleteEvents } from "../actions";
import { EventItem } from "./event-item";
import type { EventWithDetails } from "../actions";

export function EventsList({
  events,
  competitionId,
  startDate,
  endDate,
}: {
  events: EventWithDetails[];
  competitionId: string;
  startDate: string;
  endDate: string;
}) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isDeleting, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function toggle(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleBulkDelete() {
    const count = selectedIds.size;
    if (count === 0) return;

    if (!window.confirm(`Apagar ${count} prova${count === 1 ? "" : "s"} selecionada${count === 1 ? "" : "s"}?`)) {
      return;
    }

    setError(null);
    startTransition(async () => {
      const result = await deleteEvents([...selectedIds], competitionId);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      setSelectedIds(new Set());
    });
  }

  if (events.length === 0) {
    return <p className="text-sm text-neutral-400">Ainda não há provas nesta competição.</p>;
  }

  return (
    <div className="space-y-4">
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-neutral-200 bg-neutral-50 px-4 py-2">
          <span className="text-sm text-neutral-700">{selectedIds.size} selecionada(s)</span>
          <button
            onClick={handleBulkDelete}
            disabled={isDeleting}
            className="text-sm font-medium text-red-600 hover:text-red-800 disabled:opacity-50"
          >
            {isDeleting ? "A apagar..." : "Apagar selecionadas"}
          </button>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="text-sm text-neutral-500 hover:text-neutral-900"
          >
            Limpar seleção
          </button>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      )}

      <div className="space-y-6">
        {events.map((event) => (
          <EventItem
            key={event.id}
            event={event}
            competitionId={competitionId}
            startDate={startDate}
            endDate={endDate}
            selected={selectedIds.has(event.id)}
            onToggleSelect={() => toggle(event.id)}
          />
        ))}
      </div>
    </div>
  );
}
