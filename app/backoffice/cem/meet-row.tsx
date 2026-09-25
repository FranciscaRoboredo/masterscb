"use client";

import { useState, useTransition } from "react";
import { toggleCountsForCem, deleteCemMeet, type CemMeetWithCounts } from "./actions";

export function MeetRow({ meet }: { meet: CemMeetWithCounts }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleToggle() {
    setError(null);
    startTransition(async () => {
      const result = await toggleCountsForCem(meet.id, !meet.counts_for_cem);
      if ("error" in result) setError(result.error);
    });
  }

  function handleDelete() {
    if (!window.confirm(`Apagar a prova "${meet.name}" e todos os seus resultados importados?`)) {
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await deleteCemMeet(meet.id);
      if ("error" in result) setError(result.error);
    });
  }

  return (
    <tr>
      <td className="px-4 py-3 text-neutral-700">{meet.name}</td>
      <td className="px-4 py-3 text-neutral-700">
        {new Date(`${meet.start_date}T00:00:00`).toLocaleDateString("pt-PT")}
        {meet.end_date && meet.end_date !== meet.start_date &&
          ` – ${new Date(`${meet.end_date}T00:00:00`).toLocaleDateString("pt-PT")}`}
      </td>
      <td className="px-4 py-3 text-neutral-700">{meet.course ?? "—"}</td>
      <td className="px-4 py-3 text-neutral-700">
        {meet.clubs_count} clubes · {meet.swimmers_count} nadadores · {meet.results_count} resultados
      </td>
      <td className="px-4 py-3">
        <button
          onClick={handleToggle}
          disabled={isPending}
          className={
            meet.counts_for_cem
              ? "rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 hover:bg-green-200"
              : "rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-500 hover:bg-neutral-200"
          }
        >
          {meet.counts_for_cem ? "Conta para o CEM" : "Não conta para o CEM"}
        </button>
      </td>
      <td className="px-4 py-3 text-right">
        <button
          onClick={handleDelete}
          disabled={isPending}
          className="text-sm text-red-600 hover:text-red-800 disabled:opacity-50"
        >
          Apagar
        </button>
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </td>
    </tr>
  );
}
