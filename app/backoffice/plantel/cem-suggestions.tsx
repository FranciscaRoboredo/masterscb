"use client";

import { useState, useTransition } from "react";
import { addCemSwimmerToRoster, type UnlinkedScBragaSwimmer } from "../cem/actions";

export function CemSuggestions({ swimmers }: { swimmers: UnlinkedScBragaSwimmer[] }) {
  const [isPending, startTransition] = useTransition();
  const [addingId, setAddingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function addOne(id: string) {
    setError(null);
    setAddingId(id);
    startTransition(async () => {
      const result = await addCemSwimmerToRoster(id);
      if ("error" in result) setError(result.error);
      setAddingId(null);
    });
  }

  function addAll() {
    setError(null);
    startTransition(async () => {
      for (const s of swimmers) {
        const result = await addCemSwimmerToRoster(s.id);
        if ("error" in result) {
          setError(`${s.firstName} ${s.lastName}: ${result.error}`);
          return;
        }
      }
    });
  }

  if (swimmers.length === 0) return null;

  return (
    <section className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-neutral-900">
          Encontradas nas provas do CEM ({swimmers.length})
        </h2>
        <button
          onClick={addAll}
          disabled={isPending}
          className="rounded-md bg-neutral-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-neutral-800 disabled:opacity-50"
        >
          Adicionar todas
        </button>
      </div>
      <p className="mt-1 text-xs text-neutral-500">
        Nadadoras/nadadores do SC Braga que apareceram nos resultados importados no CEM mas
        ainda não estão no plantel. Nome e licença vêm diretamente do ficheiro da FPN.
      </p>
      <ul className="mt-3 divide-y divide-amber-100 text-sm">
        {swimmers.map((s) => (
          <li key={s.id} className="flex items-center justify-between py-2">
            <span className="text-neutral-700">
              {s.firstName} {s.lastName}
              <span className="ml-2 text-xs text-neutral-500">
                {s.gender === "F" ? "Fem." : s.gender === "M" ? "Masc." : ""} · Lic. {s.license}
                {s.birthDate &&
                  ` · ${new Date(`${s.birthDate}T00:00:00`).toLocaleDateString("pt-PT")}`}
              </span>
            </span>
            <button
              onClick={() => addOne(s.id)}
              disabled={isPending}
              className="text-sm text-neutral-500 hover:text-neutral-900 disabled:opacity-50"
            >
              {isPending && addingId === s.id ? "..." : "Adicionar"}
            </button>
          </li>
        ))}
      </ul>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </section>
  );
}
