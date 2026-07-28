"use client";

import { useState, useTransition } from "react";
import {
  getConvocatoriaUrl,
  deleteConvocatoria,
  type ConvocatoriaFile,
} from "@/lib/convocatorias-actions";

export function ConvocatoriaList({
  competitionId,
  files,
  canDelete = false,
}: {
  competitionId: string;
  files: ConvocatoriaFile[];
  canDelete?: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [busyFile, setBusyFile] = useState<string | null>(null);

  function handleDownload(filename: string) {
    setError(null);
    setBusyFile(filename);
    startTransition(async () => {
      const result = await getConvocatoriaUrl(competitionId, filename);
      setBusyFile(null);
      if ("error" in result) {
        setError(result.error);
        return;
      }
      window.open(result.url, "_blank");
    });
  }

  function handleDelete(filename: string) {
    if (!window.confirm(`Apagar "${filename}"?`)) return;
    setError(null);
    setBusyFile(filename);
    startTransition(async () => {
      const result = await deleteConvocatoria(competitionId, filename);
      setBusyFile(null);
      if ("error" in result) setError(result.error);
    });
  }

  if (files.length === 0) {
    return <p className="text-sm text-neutral-400">Ainda não há convocatórias.</p>;
  }

  return (
    <div>
      <ul className="divide-y divide-neutral-100 text-sm">
        {files.map((file) => (
          <li key={file.name} className="flex items-center justify-between py-2">
            <span className="text-neutral-700">{file.name}</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleDownload(file.name)}
                disabled={isPending && busyFile === file.name}
                className="text-neutral-500 hover:text-neutral-900 disabled:opacity-50"
              >
                {isPending && busyFile === file.name ? "..." : "Descarregar"}
              </button>
              {canDelete && (
                <button
                  onClick={() => handleDelete(file.name)}
                  disabled={isPending && busyFile === file.name}
                  className="text-red-600 hover:text-red-800 disabled:opacity-50"
                >
                  Apagar
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
