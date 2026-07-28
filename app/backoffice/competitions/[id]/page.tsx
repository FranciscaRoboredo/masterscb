import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getCompetition,
  listEventsWithDetails,
  listRelayResponses,
} from "../actions";
import { NewEventForm } from "./new-event-form";
import { CatalogEventsForm } from "./catalog-events-form";

export default async function CompetitionDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const competition = await getCompetition(params.id);
  if (!competition) notFound();

  const [events, relayResponses] = await Promise.all([
    listEventsWithDetails(params.id),
    listRelayResponses(params.id),
  ]);

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-neutral-900">{competition.name}</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {new Date(`${competition.date}T00:00:00`).toLocaleDateString("pt-PT")}
            {competition.location ? ` · ${competition.location}` : ""}
          </p>
          <p className="mt-1 text-sm text-neutral-500">
            Inscrições:{" "}
            {competition.registration_start
              ? new Date(`${competition.registration_start}T00:00:00`).toLocaleDateString("pt-PT")
              : "sem data de início"}{" "}
            até{" "}
            {competition.registration_end
              ? new Date(`${competition.registration_end}T00:00:00`).toLocaleDateString("pt-PT")
              : "sem data de fim"}
          </p>
        </div>
        <Link
          href={`/backoffice/competitions/${competition.id}/resultados`}
          className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm text-neutral-700 hover:bg-neutral-100"
        >
          Gerir resultados →
        </Link>
      </div>

      <section className="mt-6 rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-neutral-900">Adicionar provas do catálogo</h2>
        <div className="mt-3">
          <CatalogEventsForm
            competitionId={competition.id}
            existingNames={events.map((e) => e.name)}
          />
        </div>
      </section>

      <section className="mt-4 rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-neutral-900">Adicionar prova personalizada</h2>
        <div className="mt-3">
          <NewEventForm competitionId={competition.id} />
        </div>
      </section>

      <section className="mt-8 space-y-6">
        {events.length === 0 && (
          <p className="text-sm text-neutral-400">Ainda não há provas nesta competição.</p>
        )}

        {events.map((event) => (
          <div key={event.id} className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-neutral-900">{event.name}</h3>
              {event.event_time && (
                <span className="text-sm text-neutral-500">{event.event_time.slice(0, 5)}</span>
              )}
            </div>

            <p className="mt-2 text-xs uppercase tracking-wide text-neutral-400">
              Inscritas ({event.registeredAthletes.length})
            </p>
            <p className="mt-1 text-sm text-neutral-700">
              {event.registeredAthletes.length > 0
                ? event.registeredAthletes.map((a) => a.full_name || a.email).join(", ")
                : "Ninguém inscrito ainda."}
            </p>
          </div>
        ))}
      </section>

      <section className="mt-8 rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-neutral-900">
          Estafetas ({relayResponses.length} respostas)
        </h2>
        {relayResponses.length === 0 ? (
          <p className="mt-1 text-sm text-neutral-400">Ainda ninguém respondeu.</p>
        ) : (
          <ul className="mt-2 divide-y divide-neutral-100 text-sm">
            {relayResponses.map((r) => (
              <li key={r.athlete.id} className="flex items-center justify-between py-1.5">
                <span className="text-neutral-700">{r.athlete.full_name || r.athlete.email}</span>
                <span className={r.wantsRelay ? "text-green-700" : "text-neutral-400"}>
                  {r.wantsRelay ? "Sim" : "Não"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
