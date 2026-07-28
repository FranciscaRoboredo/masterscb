import Link from "next/link";
import { listCompetitions } from "./actions";
import { NewCompetitionForm } from "./new-competition-form";

export default async function CompetitionsPage() {
  const competitions = await listCompetitions();

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-neutral-900">Competições</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Cria competições e, dentro de cada uma, as provas individuais.
      </p>

      <section className="mt-6 rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-neutral-900">Nova competição</h2>
        <div className="mt-4">
          <NewCompetitionForm />
        </div>
      </section>

      <section className="mt-8 space-y-3">
        {competitions.length === 0 && (
          <p className="text-sm text-neutral-400">Ainda não há competições.</p>
        )}
        {competitions.map((c) => (
          <Link
            key={c.id}
            href={`/backoffice/competitions/${c.id}`}
            className="block rounded-lg border border-neutral-200 bg-white p-4 shadow-sm hover:border-neutral-400"
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-neutral-900">{c.name}</span>
              <span className="text-sm text-neutral-500">
                {new Date(`${c.start_date}T00:00:00`).toLocaleDateString("pt-PT")}
                {c.end_date !== c.start_date &&
                  ` – ${new Date(`${c.end_date}T00:00:00`).toLocaleDateString("pt-PT")}`}
              </span>
            </div>
            <div className="mt-1 flex items-center gap-2">
              {c.location && <p className="text-sm text-neutral-500">{c.location}</p>}
              <span
                className={
                  c.published
                    ? "rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700"
                    : "rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-500"
                }
              >
                {c.published ? "Publicada" : "Rascunho"}
              </span>
              {c.counts_for_cem && (
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                  CEM
                </span>
              )}
            </div>
          </Link>
        ))}
      </section>
    </main>
  );
}
