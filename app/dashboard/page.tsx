import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/supabase/get-profile";
import { AppHeader } from "@/components/app-header";

export default async function DashboardPage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  return (
    <>
      <AppHeader fullName={profile.full_name || profile.email} role={profile.role} />
      <main className="mx-auto max-w-4xl px-4 py-8">
        <h1 className="text-2xl font-semibold text-neutral-900">
          Olá, {profile.full_name || profile.email}
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          O teu dashboard pessoal.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <DashboardCard title="Próxima prova">
            Ainda não há provas marcadas.
          </DashboardCard>
          <DashboardCard title="Treino seco">
            Sem treino seco definido para hoje.
          </DashboardCard>
          <DashboardCard title="Material do dia">
            Sem indicações de material para hoje.
          </DashboardCard>
        </div>

        <p className="mt-6 text-xs text-neutral-400">
          Estas secções são placeholders — a gestão de treinos, provas e
          inscrições será adicionada a seguir.
        </p>
      </main>
    </>
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
      <p className="mt-2 text-sm text-neutral-500">{children}</p>
    </div>
  );
}
