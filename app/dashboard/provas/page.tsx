import { listUpcomingCompetitions } from "./actions";
import { RegisterButton } from "./register-button";
import { RelayQuestion } from "./relay-question";
import { LocationLink } from "@/components/location-link";
import { ConvocatoriaList } from "@/components/convocatoria-list";
import { listConvocatorias } from "@/lib/convocatorias-actions";

export default async function ProvasPage() {
  const competitions = await listUpcomingCompetitions();
  const convocatoriasByCompetition = new Map(
    await Promise.all(
      competitions.map(async (c) => [c.id, await listConvocatorias(c.id)] as const)
    )
  );

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-neutral-900">Inscrição em provas</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Próximas competições e as respetivas provas individuais.
      </p>

      <div className="mt-6 space-y-6">
        {competitions.length === 0 && (
          <p className="text-sm text-neutral-400">Ainda não há competições marcadas.</p>
        )}

        {competitions.map((competition) => {
          const canRegister = competition.registrationOpen && competition.relayResponse !== null;
          const convocatorias = convocatoriasByCompetition.get(competition.id) ?? [];

          return (
            <div key={competition.id} className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="font-medium text-neutral-900">
                  {competition.name}
                  {competition.counts_for_cem && (
                    <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                      CEM
                    </span>
                  )}
                </h2>
                <span className="text-sm text-neutral-500">
                  {new Date(`${competition.start_date}T00:00:00`).toLocaleDateString("pt-PT")}
                  {competition.end_date !== competition.start_date &&
                    ` – ${new Date(`${competition.end_date}T00:00:00`).toLocaleDateString("pt-PT")}`}
                </span>
              </div>
              {competition.location && (
                <p className="mt-1 text-sm">
                  <LocationLink location={competition.location} />
                </p>
              )}

              {!competition.published && (
                <p className="mt-2 text-sm text-neutral-500">
                  Ainda não está disponível para inscrição.
                </p>
              )}

              {competition.published && !competition.registrationOpen && (
                <p className="mt-2 text-sm text-red-600">
                  {competition.registration_start && new Date() < new Date(`${competition.registration_start}T00:00:00`)
                    ? `As inscrições abrem a ${new Date(`${competition.registration_start}T00:00:00`).toLocaleDateString("pt-PT")}.`
                    : "As inscrições para esta competição já fecharam."}
                </p>
              )}

              {competition.registrationOpen && (
                <div className="mt-3">
                  <RelayQuestion competitionId={competition.id} value={competition.relayResponse} />
                </div>
              )}

              {competition.published && (
                <ul className="mt-3 divide-y divide-neutral-100">
                  {competition.events.length === 0 && (
                    <li className="py-2 text-sm text-neutral-400">Ainda sem provas definidas.</li>
                  )}
                  {competition.events.map((event) => (
                    <li key={event.id} className="flex items-center justify-between py-2">
                      <span className="text-sm text-neutral-700">
                        {event.name}
                        {competition.end_date !== competition.start_date && (
                          <span className="ml-2 text-neutral-400">
                            {new Date(`${event.event_date}T00:00:00`).toLocaleDateString("pt-PT", {
                              weekday: "short",
                              day: "numeric",
                              month: "short",
                            })}
                          </span>
                        )}
                        {event.event_time && (
                          <span className="ml-2 text-neutral-400">{event.event_time.slice(0, 5)}</span>
                        )}
                      </span>
                      <RegisterButton
                        eventId={event.id}
                        registered={event.registered}
                        disabled={!canRegister && !event.registered}
                      />
                    </li>
                  ))}
                </ul>
              )}

              {convocatorias.length > 0 && (
                <div className="mt-4 border-t border-neutral-100 pt-3">
                  <p className="text-xs uppercase tracking-wide text-neutral-400">Convocatória</p>
                  <div className="mt-2">
                    <ConvocatoriaList competitionId={competition.id} files={convocatorias} />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </main>
  );
}
