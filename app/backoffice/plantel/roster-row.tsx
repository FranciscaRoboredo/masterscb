"use client";

import { useState, useTransition } from "react";
import { deleteRosterAthlete } from "./actions";
import { EditRosterForm } from "./roster-form";
import { computeEscalao, SEASON_REFERENCE_YEARS } from "@/lib/escalao";
import type { Database } from "@/lib/supabase/database.types";

type RosterAthlete = Database["public"]["Tables"]["roster_athletes"]["Row"];

export function RosterRow({ athlete }: { athlete: RosterAthlete }) {
  const [editing, setEditing] = useState(false);
  const [isDeleting, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleDelete() {
    if (!window.confirm(`Remover "${athlete.full_name}" do plantel?`)) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteRosterAthlete(athlete.id);
      if ("error" in result) setError(result.error);
    });
  }

  if (editing) {
    return (
      <tr>
        <td colSpan={7} className="bg-neutral-50 px-4 py-3">
          <EditRosterForm athlete={athlete} onDone={() => setEditing(false)} />
          <button
            onClick={() => setEditing(false)}
            className="mt-2 text-sm text-neutral-500 hover:text-neutral-900"
          >
            Cancelar
          </button>
        </td>
      </tr>
    );
  }

  const escalao25 = computeEscalao(athlete.birth_date, SEASON_REFERENCE_YEARS.early);
  const escalao26 = computeEscalao(athlete.birth_date, SEASON_REFERENCE_YEARS.late);

  return (
    <tr>
      <td className="px-4 py-3 text-neutral-700">{athlete.full_name}</td>
      <td className="px-4 py-3 text-neutral-700">
        {athlete.gender === "F" ? "Feminino" : athlete.gender === "M" ? "Masculino" : "—"}
      </td>
      <td className="px-4 py-3 text-neutral-700">
        {athlete.birth_date ? new Date(`${athlete.birth_date}T00:00:00`).toLocaleDateString("pt-PT") : "—"}
      </td>
      <td className="px-4 py-3 text-neutral-700">{athlete.federation_number || "—"}</td>
      <td className="px-4 py-3 text-neutral-700">{escalao25 || "—"}</td>
      <td className="px-4 py-3 text-neutral-700">{escalao26 || "—"}</td>
      <td className="px-4 py-3 text-right">
        <button onClick={() => setEditing(true)} className="text-sm text-neutral-500 hover:text-neutral-900">
          Editar
        </button>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="ml-3 text-sm text-red-600 hover:text-red-800 disabled:opacity-50"
        >
          {isDeleting ? "..." : "Apagar"}
        </button>
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
      </td>
    </tr>
  );
}
