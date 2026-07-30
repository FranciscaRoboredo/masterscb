import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/supabase/get-profile";
import { getTodaysTraining, getNextRace } from "@/lib/dashboard-data";
import { listUpcomingCompetitionsCalendar } from "@/lib/competitions-calendar";
import { SESSION_LABELS } from "@/lib/event-session";

export default async function DashboardPage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  const [training, nextRace, calendar] = await Promise.all([
    getTodaysTraining(),
    getNextRace(profile.id),
    listUpcomingCompetitionsCalendar(),
  ]);

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="text-2xl font-semibold text-neutral-900">
          Olá, {profile.full_name || profile.email}
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          O teu dashboard pessoal.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <DashboardCard title="Próxima prova">
            {nextRace ? (
              <>
                <span className="block font-medium text-neutral-900">
                  {nextRace.event.name}
                </span>
                <span className="block">{nextRace.competition.name}</span>
                <span className="block">
                  {new Date(`${nextRace.event.event_date}T00:00:00`).toLocaleDateString("pt-PT")}
                  {nextRace.event.session && ` · ${SESSION_LABELS[nextRace.event.session]}`}
                </span>
              </>
            ) : (
              "Ainda não estás inscrita em nenhuma prova."
            )}
          </DashboardCard>
          <DashboardCard title="Treino seco">
            {training?.dry_land_training || "Sem treino seco definido para hoje."}
          </DashboardCard>
          <DashboardCard title="Material do dia">
            {training?.material || "Sem indicações de material para hoje."}
          </DashboardCard>
        </div>

        <Link
          href="/dashboard/provas"
          className="mt-6 inline-block rounded-md bg-neutral-900 px-4 py-2 text-sm font-semibold text-white hover:bg-neutral-800"
        >
          Inscrever em provas
        </Link>

        <section className="mt-8 rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-neutral-900">Próximas provas</h2>
          {calendar.length === 0 ? (
            <p className="mt-2 text-sm text-neutral-400">Ainda não há competições marcadas.</p>
          ) : (
            <ul className="mt-3 divide-y divide-neutral-100">
              {calendar.map((c) => (
                <li key={c.id} className="flex items-center justify-between py-2 text-sm">
                  <span className="text-neutral-900">{c.name}</span>
                  <span className="flex items-center gap-2 text-neutral-500">
                    {new Date(`${c.start_date}T00:00:00`).toLocaleDateString("pt-PT")}
                    {c.end_date !== c.start_date &&
                      ` – ${new Date(`${c.end_date}T00:00:00`).toLocaleDateString("pt-PT")}`}
                    {!c.published && (
                      <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-500">
                        Inscrições brevemente
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
    </main>
  );
}

function DashboardCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
      <h2 className="text-sm font-semibold text-neutral-900">{title}</h2>
      <div className="mt-2 text-sm text-neutral-500">{children}</div>
    </div>
  );
}
