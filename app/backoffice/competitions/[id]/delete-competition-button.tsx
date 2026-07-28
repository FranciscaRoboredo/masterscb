"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteCompetition } from "../actions";

export function DeleteCompetitionButton({
  competitionId,
  competitionName,
}: {
  competitionId: string;
  competitionName: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleDelete() {
    const confirmed = window.confirm(
      `Apagar "${competitionName}"? Isto remove também as provas, inscrições, resultados e convocatórias associadas. Não é possível desfazer.`
    );
    if (!confirmed) return;

    setError(null);
    startTransition(async () => {
      const result = await deleteCompetition(competitionId);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      router.replace("/backoffice/competitions");
      router.refresh();
    });
  }

  return (
    <div>
      <button
        onClick={handleDelete}
        disabled={isPending}
        className="text-sm text-red-600 hover:text-red-800 disabled:opacity-50"
      >
        {isPending ? "A apagar..." : "Apagar competição"}
      </button>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
