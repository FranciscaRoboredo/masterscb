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
                {new Date(`${c.date}T00:00:00`).toLocaleDateString("pt-PT")}
              </span>
            </div>
            {c.location && <p className="mt-1 text-sm text-neutral-500">{c.location}</p>}
          </Link>
        ))}
      </section>
    </main>
  );
}
