"use client";

import { useTransition } from "react";
import { setRelayResponse } from "./actions";

export function RelayQuestion({
  competitionId,
  value,
}: {
  competitionId: string;
  value: boolean | null;
}) {
  const [isPending, startTransition] = useTransition();

  function answer(wantsRelay: boolean) {
    startTransition(async () => {
      await setRelayResponse(competitionId, wantsRelay);
    });
  }

  return (
    <div className="rounded-md bg-neutral-50 px-3 py-2">
      <p className="text-sm font-medium text-neutral-900">
        Quer fazer estafetas? <span className="text-red-500">*</span>
      </p>
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          disabled={isPending}
          onClick={() => answer(true)}
          className={
            value === true
              ? "rounded-md bg-neutral-900 px-3 py-1 text-sm font-semibold text-white"
              : "rounded-md border border-neutral-300 px-3 py-1 text-sm text-neutral-700 hover:bg-neutral-100"
          }
        >
          Sim
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() => answer(false)}
          className={
            value === false
              ? "rounded-md bg-neutral-900 px-3 py-1 text-sm font-semibold text-white"
              : "rounded-md border border-neutral-300 px-3 py-1 text-sm text-neutral-700 hover:bg-neutral-100"
          }
        >
          Não
        </button>
      </div>
      {value === null && (
        <p className="mt-1 text-xs text-red-600">
          Resposta obrigatória antes de te inscreveres nas provas.
        </p>
      )}
    </div>
  );
}
