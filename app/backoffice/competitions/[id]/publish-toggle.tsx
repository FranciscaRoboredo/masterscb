"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setPublished } from "../actions";

export function PublishToggle({
  competitionId,
  published,
}: {
  competitionId: string;
  published: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function toggle() {
    startTransition(async () => {
      await setPublished(competitionId, !published);
      router.refresh();
    });
  }

  if (published) {
    return (
      <button
        onClick={toggle}
        disabled={isPending}
        className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm text-neutral-700 hover:bg-neutral-100 disabled:opacity-50"
      >
        {isPending ? "..." : "Despublicar"}
      </button>
    );
  }

  return (
    <button
      onClick={toggle}
      disabled={isPending}
      className="rounded-md bg-neutral-900 px-3 py-1.5 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-50"
    >
      {isPending ? "..." : "Publicar para as atletas"}
    </button>
  );
}
