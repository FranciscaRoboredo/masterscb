import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/supabase/get-profile";
import { getTodaysTraining, getNextRace } from "@/lib/dashboard-data";

export default async function DashboardPage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  const [training, nextRace] = await Promise.all([
    getTodaysTraining(),
    getNextRace(profile.id),
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
                  {new Date(`${nextRace.competition.date}T00:00:00`).toLocaleDateString("pt-PT")}
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
