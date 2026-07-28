import Link from "next/link";
import { listAthletes } from "./actions";
import { getNextCompetitionSummary } from "./competitions/actions";
import { InviteAthleteForm } from "./invite-athlete-form";
import { listUpcomingCompetitionsCalendar } from "@/lib/competitions-calendar";

export default async function BackofficePage() {
  const [athletes, nextCompetition, calendar] = await Promise.all([
    listAthletes(),
    getNextCompetitionSummary(),
    listUpcomingCompetitionsCalendar(),
  ]);

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-neutral-900">Backoffice</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Adiciona atletas manualmente. É criada uma conta e enviado um email
        com um link de acesso — sem registo aberto.
      </p>

      <section className="mt-6 rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-neutral-900">Próxima competição</h2>
          {nextCompetition && (
            <Link
              href={`/backoffice/competitions/${nextCompetition.competition.id}`}
              className="text-sm text-neutral-500 hover:text-neutral-900"
            >
              Ver competição →
            </Link>
          )}
        </div>

        {!nextCompetition ? (
          <p className="mt-2 text-sm text-neutral-400">Não há competições marcadas.</p>
        ) : (
          <>
            <p className="mt-1 text-sm text-neutral-700">
              <span className="font-medium">{nextCompetition.competition.name}</span> ·{" "}
              {new Date(`${nextCompetition.competition.start_date}T00:00:00`).toLocaleDateString("pt-PT")}
              {nextCompetition.competition.end_date !== nextCompetition.competition.start_date &&
                ` – ${new Date(`${nextCompetition.competition.end_date}T00:00:00`).toLocaleDateString("pt-PT")}`}
              {!nextCompetition.competition.published && " · rascunho"}
            </p>
            <p className="mt-2 text-2xl font-semibold text-neutral-900">
              {nextCompetition.totalRegisteredAthletes}
              <span className="ml-1 text-sm font-normal text-neutral-500">
                atleta{nextCompetition.totalRegisteredAthletes === 1 ? "" : "s"} inscrita
                {nextCompetition.totalRegisteredAthletes === 1 ? "" : "s"}
              </span>
            </p>
            {nextCompetition.byDay.length > 1 && (
              <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                {nextCompetition.byDay.map((day) => (
                  <li key={day.date} className="text-neutral-600">
                    {new Date(`${day.date}T00:00:00`).toLocaleDateString("pt-PT", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                    })}
                    : <span className="font-medium text-neutral-900">{day.count}</span>
                  </li>
                ))}
              </ul>
            )}
            {nextCompetition.events.length > 0 && (
              <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-sm sm:grid-cols-3">
                {nextCompetition.events.map((event) => (
                  <li key={event.id} className="flex justify-between text-neutral-600">
                    <span>{event.name}</span>
                    <span className="font-medium text-neutral-900">{event.count}</span>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </section>

      <section className="mt-4 rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-neutral-900">Próximas provas</h2>
        <p className="mt-1 text-xs text-neutral-400">
          Rascunhos ficam calendarizados aqui, mas só abrem inscrições quando publicares.
        </p>
        {calendar.length === 0 ? (
          <p className="mt-2 text-sm text-neutral-400">Não há competições marcadas.</p>
        ) : (
          <ul className="mt-3 divide-y divide-neutral-100">
            {calendar.map((c) => (
              <li key={c.id} className="py-2">
                <Link
                  href={`/backoffice/competitions/${c.id}`}
                  className="flex items-center justify-between text-sm hover:underline"
                >
                  <span className="text-neutral-900">{c.name}</span>
                  <span className="flex items-center gap-2 text-neutral-500">
                    {new Date(`${c.start_date}T00:00:00`).toLocaleDateString("pt-PT")}
                    {c.end_date !== c.start_date &&
                      ` – ${new Date(`${c.end_date}T00:00:00`).toLocaleDateString("pt-PT")}`}
                    <span
                      className={
                        c.published
                          ? "rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700"
                          : "rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-500"
                      }
                    >
                      {c.published ? "Publicada" : "Rascunho"}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-6 rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-neutral-900">
          Adicionar atleta
        </h2>
        <div className="mt-4">
          <InviteAthleteForm />
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-semibold text-neutral-900">
          Atletas ({athletes.length})
        </h2>
        <div className="mt-3 overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-neutral-200 text-sm">
            <thead className="bg-neutral-50">
              <tr>
                <Th>Nome</Th>
                <Th>Email</Th>
                <Th>Telefone</Th>
                <Th>Clube</Th>
                <Th>Nº Federado</Th>
                <Th>Adicionada em</Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {athletes.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-neutral-400">
                    Ainda não há atletas.
                  </td>
                </tr>
              )}
              {athletes.map((athlete) => (
                <tr key={athlete.id} className="hover:bg-neutral-50">
                  <Td>
                    <Link href={`/backoffice/athletes/${athlete.id}`} className="hover:underline">
                      {athlete.full_name || "—"}
                    </Link>
                  </Td>
                  <Td>{athlete.email}</Td>
                  <Td>{athlete.phone || "—"}</Td>
                  <Td>{athlete.club || "—"}</Td>
                  <Td>{athlete.federation_number || "—"}</Td>
                  <Td>{new Date(athlete.created_at).toLocaleDateString("pt-PT")}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
      {children}
    </th>
  );
}

function Td({ children }: { children: React.ReactNode }) {
  return <td className="px-4 py-3 text-neutral-700">{children}</td>;
}
