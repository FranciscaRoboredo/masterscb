"use client";

import { useState, useTransition } from "react";
import { register, unregister } from "./actions";

export function RegisterButton({
  eventId,
  registered,
  disabled,
}: {
  eventId: string;
  registered: boolean;
  disabled?: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    setError(null);
    startTransition(async () => {
      const result = registered ? await unregister(eventId) : await register(eventId);
      if ("error" in result) setError(result.error);
    });
  }

  return (
    <div className="text-right">
      <button
        onClick={handleClick}
        disabled={isPending || disabled}
        className={
          registered
            ? "rounded-md border border-neutral-300 px-3 py-1.5 text-sm text-neutral-700 hover:bg-neutral-100 disabled:opacity-50"
            : "rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-50"
        }
      >
        {isPending ? "..." : registered ? "Cancelar inscrição" : "Inscrever"}
      </button>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
