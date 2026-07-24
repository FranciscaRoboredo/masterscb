"use client";

import { useTransition } from "react";
import { register, unregister } from "./actions";

export function RegisterButton({
  eventId,
  registered,
}: {
  eventId: string;
  registered: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      if (registered) {
        await unregister(eventId);
      } else {
        await register(eventId);
      }
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={
        registered
          ? "rounded-md border border-neutral-300 px-3 py-1.5 text-sm text-neutral-700 hover:bg-neutral-100 disabled:opacity-50"
          : "rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-50"
      }
    >
      {isPending ? "..." : registered ? "Cancelar inscrição" : "Inscrever"}
    </button>
  );
}
