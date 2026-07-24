import { notFound } from "next/navigation";
import {
  getCompetition,
  listEventsWithDetails,
  listAllAthletes,
} from "../actions";
import { NewEventForm } from "./new-event-form";
import { AddResultForm } from "./add-result-form";

export default async function CompetitionDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const competition = await getCompetition(params.id);
  if (!competition) notFound();

  const [events, athletes] = await Promise.all([
    listEventsWithDetails(params.id),
    listAllAthletes(),
  ]);

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-neutral-900">{competition.name}</h1>
      <p className="mt-1 text-sm text-neutral-500">
        {new Date(`${competition.date}T00:00:00`).toLocaleDateString("pt-PT")}
        {competition.location ? ` · ${competition.location}` : ""}
      </p>

      <section className="mt-6 rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-neutral-900">Adicionar prova</h2>
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

            <p className="mt-4 text-xs uppercase tracking-wide text-neutral-400">Resultados</p>
            {event.results.length > 0 ? (
              <table className="mt-2 w-full text-sm">
                <tbody className="divide-y divide-neutral-100">
                  {event.results.map((r) => (
                    <tr key={r.id}>
                      <td className="py-1 pr-3 text-neutral-700">
                        {r.athlete?.full_name || r.athlete?.email || "—"}
                      </td>
                      <td className="py-1 pr-3 text-neutral-700">{r.time || "—"}</td>
                      <td className="py-1 pr-3 text-neutral-700">
                        {r.position ? `${r.position}º` : "—"}
                      </td>
                      <td className="py-1 text-neutral-500">{r.notes || ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="mt-1 text-sm text-neutral-400">Ainda sem resultados.</p>
            )}

            <div className="mt-3">
              <AddResultForm
                eventId={event.id}
                competitionId={competition.id}
                athletes={athletes}
              />
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}
