import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getCompetition,
  listEventsWithDetails,
  listRelayResponses,
  getRegistrationsByDay,
} from "../actions";
import { NewEventForm } from "./new-event-form";
import { CatalogEventsForm } from "./catalog-events-form";
import { PublishToggle } from "./publish-toggle";
import { EventItem } from "./event-item";
import { EditCompetitionForm } from "./edit-competition-form";
import { LocationLink } from "@/components/location-link";

function formatDate(date: string) {
  return new Date(`${date}T00:00:00`).toLocaleDateString("pt-PT", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export default async function CompetitionDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const competition = await getCompetition(params.id);
  if (!competition) notFound();

  const [events, relayResponses, registrationsByDay] = await Promise.all([
    listEventsWithDetails(params.id),
    listRelayResponses(params.id),
    getRegistrationsByDay(params.id),
  ]);

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold text-neutral-900">{competition.name}</h1>
            <span
              className={
                competition.published
                  ? "rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700"
                  : "rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-500"
              }
            >
              {competition.published ? "Publicada" : "Rascunho"}
            </span>
          </div>
          <p className="mt-1 text-sm text-neutral-500">
            {new Date(`${competition.start_date}T00:00:00`).toLocaleDateString("pt-PT")}
            {competition.end_date !== competition.start_date &&
              ` – ${new Date(`${competition.end_date}T00:00:00`).toLocaleDateString("pt-PT")}`}
            {competition.location && (
              <>
                {" · "}
                <LocationLink location={competition.location} />
              </>
            )}
            {competition.counts_for_cem && (
              <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                CEM
              </span>
            )}
          </p>
          <p className="mt-1 text-sm text-neutral-500">
            Inscrições até{" "}
            {competition.registration_end
              ? new Date(`${competition.registration_end}T00:00:00`).toLocaleDateString("pt-PT")
              : "sem data limite definida"}
          </p>
          {competition.notes && (
            <p className="mt-1 text-sm text-neutral-500">{competition.notes}</p>
          )}
        </div>
        <div className="flex flex-col items-end gap-2">
          <PublishToggle competitionId={competition.id} published={competition.published} />
          <Link
            href={`/backoffice/competitions/${competition.id}/resultados`}
            className="text-sm text-neutral-500 hover:text-neutral-900"
          >
            Gerir resultados →
          </Link>
        </div>
      </div>

      <div className="mt-2">
        <EditCompetitionForm competition={competition} />
      </div>

      {!competition.published && (
        <p className="mt-3 rounded-md bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Esta competição ainda é um rascunho — as atletas não a veem. Adiciona as provas e
          publica quando estiver pronta.
        </p>
      )}

      <section className="mt-6 rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-neutral-900">Adicionar provas do catálogo</h2>
        <div className="mt-3">
          <CatalogEventsForm
            competitionId={competition.id}
            startDate={competition.start_date}
            endDate={competition.end_date}
          />
        </div>
      </section>

      <section className="mt-4 rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-neutral-900">Adicionar prova personalizada</h2>
        <div className="mt-3">
          <NewEventForm
            competitionId={competition.id}
            startDate={competition.start_date}
            endDate={competition.end_date}
          />
        </div>
      </section>

      <section className="mt-8 space-y-6">
        {events.length === 0 && (
          <p className="text-sm text-neutral-400">Ainda não há provas nesta competição.</p>
        )}

        {events.map((event) => (
          <EventItem
            key={event.id}
            event={event}
            competitionId={competition.id}
            startDate={competition.start_date}
            endDate={competition.end_date}
          />
        ))}
      </section>

      <section className="mt-8 rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-neutral-900">Inscrições por dia</h2>
        <p className="mt-1 text-xs text-neutral-400">
          Útil para competições de vários dias — nem todas vão a todos os dias.
        </p>
        {registrationsByDay.length === 0 ? (
          <p className="mt-2 text-sm text-neutral-400">Ainda sem inscrições.</p>
        ) : (
          <div className="mt-3 space-y-4">
            {registrationsByDay.map((day) => (
              <div key={day.date}>
                <p className="text-sm font-medium text-neutral-900">
                  {formatDate(day.date)} · {day.athleteCount} atleta
                  {day.athleteCount === 1 ? "" : "s"}
                </p>
                <ul className="mt-1 space-y-0.5 text-sm text-neutral-600">
                  {day.athletes.map(({ athlete, eventNames }) => (
                    <li key={athlete.id}>
                      {athlete.full_name || athlete.email} — {eventNames.join(", ")}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
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
