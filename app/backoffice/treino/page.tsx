import Link from "next/link";
import { getDailyTraining } from "./actions";
import { TrainingForm } from "./training-form";

function toISODate(d: Date) {
  return d.toISOString().slice(0, 10);
}

function shiftDate(iso: string, days: number) {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

export default async function TreinoPage({
  searchParams,
}: {
  searchParams: { date?: string };
}) {
  const date = searchParams.date || toISODate(new Date());
  const training = await getDailyTraining(date);

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-neutral-900">Treino do dia</h1>
      <p className="mt-1 text-sm text-neutral-500">
        O treino seco e o material aparecem no dashboard de todas as atletas
        nesta data.
      </p>

      <div className="mt-6 flex items-center justify-between rounded-lg border border-neutral-200 bg-white px-4 py-3 shadow-sm">
        <Link
          href={`/backoffice/treino?date=${shiftDate(date, -1)}`}
          className="text-sm text-neutral-500 hover:text-neutral-900"
        >
          ← Dia anterior
        </Link>
        <span className="text-sm font-medium text-neutral-900">
          {new Date(`${date}T00:00:00`).toLocaleDateString("pt-PT", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </span>
        <Link
          href={`/backoffice/treino?date=${shiftDate(date, 1)}`}
          className="text-sm text-neutral-500 hover:text-neutral-900"
        >
          Dia seguinte →
        </Link>
      </div>

      <div className="mt-4 rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
        <TrainingForm date={date} training={training} />
      </div>
    </main>
  );
}
