import Link from "next/link";
import { notFound } from "next/navigation";
import { getAthlete } from "../../actions";
import { EditAthleteForm } from "./edit-athlete-form";
import { DeleteAthleteButton } from "./delete-athlete-button";

export default async function AthleteDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const athlete = await getAthlete(params.id);
  if (!athlete) notFound();

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <Link href="/backoffice" className="text-sm text-neutral-500 hover:text-neutral-900">
        ← Atletas
      </Link>
      <h1 className="mt-2 text-2xl font-semibold text-neutral-900">
        {athlete.full_name || athlete.email}
      </h1>
      <p className="mt-1 text-sm text-neutral-500">{athlete.email}</p>

      <div className="mt-6 rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
        <EditAthleteForm athlete={athlete} />
      </div>

      <div className="mt-6">
        <DeleteAthleteButton athleteId={athlete.id} athleteName={athlete.full_name || athlete.email} />
      </div>
    </main>
  );
}
