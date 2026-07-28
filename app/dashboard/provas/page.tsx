import { listUpcomingCompetitions } from "./actions";
import { RegisterButton } from "./register-button";
import { RelayQuestion } from "./relay-question";

export default async function ProvasPage() {
  const competitions = await listUpcomingCompetitions();

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

          return (
            <div key={competition.id} className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="font-medium text-neutral-900">{competition.name}</h2>
                <span className="text-sm text-neutral-500">
                  {new Date(`${competition.date}T00:00:00`).toLocaleDateString("pt-PT")}
                </span>
              </div>
              {competition.location && (
                <p className="mt-1 text-sm text-neutral-500">{competition.location}</p>
              )}

              {!competition.registrationOpen && (
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

              <ul className="mt-3 divide-y divide-neutral-100">
                {competition.events.length === 0 && (
                  <li className="py-2 text-sm text-neutral-400">Ainda sem provas definidas.</li>
                )}
                {competition.events.map((event) => (
                  <li key={event.id} className="flex items-center justify-between py-2">
                    <span className="text-sm text-neutral-700">
                      {event.name}
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
            </div>
          );
        })}
      </div>
    </main>
  );
}
