"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteAthlete } from "../../actions";

export function DeleteAthleteButton({ athleteId, athleteName }: { athleteId: string; athleteName: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleDelete() {
    const confirmed = window.confirm(
      `Remover "${athleteName}" da app? Isto apaga o perfil dela, inscrições e resultados. A conta de acesso não é apagada — para isso tens de ir ao painel do Supabase (Authentication → Users).`
    );
    if (!confirmed) return;

    setError(null);
    startTransition(async () => {
      const result = await deleteAthlete(athleteId);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      router.replace("/backoffice");
      router.refresh();
    });
  }

  return (
    <div>
      <button
        onClick={handleDelete}
        disabled={isPending}
        className="rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
      >
        {isPending ? "A remover..." : "Remover atleta"}
      </button>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
