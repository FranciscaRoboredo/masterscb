import { listCemMeets, getCemRankings } from "./actions";
import { LenexUploadForm } from "./upload-form";
import { MeetRow } from "./meet-row";
import type { CemRankingTable } from "@/lib/cem-ranking";

const GENDER_LABEL = { M: "Masculino", F: "Feminino" } as const;

export default async function CemPage() {
  const [meets, rankings] = await Promise.all([listCemMeets(), getCemRankings()]);

  const rankingsByGender = {
    M: rankings.filter((t) => t.gender === "M"),
    F: rankings.filter((t) => t.gender === "F"),
  };

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-neutral-900">Circuito Especialista Master</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Importa os ficheiros de resultados (.lef/.lxf) de cada prova para calcular os rankings
        do CEM 25/26. Provas organizadas diretamente pela FPN (Inverno, Fundo, Verão) não contam
        para o CEM — só as de Clubes/AT&apos;s — mas ficam registadas na mesma; podes corrigir o
        toggle abaixo se a deteção automática falhar.
      </p>

      <section className="mt-6 rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-neutral-900">Importar prova</h2>
        <div className="mt-4">
          <LenexUploadForm />
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-semibold text-neutral-900">Provas importadas ({meets.length})</h2>
        <div className="mt-3 overflow-x-auto rounded-lg border border-neutral-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-neutral-200 text-sm">
            <thead className="bg-neutral-50">
              <tr>
                <Th>Nome</Th>
                <Th>Data</Th>
                <Th>Piscina</Th>
                <Th>Volume</Th>
                <Th>CEM</Th>
                <Th></Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {meets.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-neutral-400">
                    Ainda não há provas importadas.
                  </td>
                </tr>
              )}
              {meets.map((meet) => (
                <MeetRow key={meet.id} meet={meet} />
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-semibold text-neutral-900">Rankings do CEM</h2>
        <p className="mt-1 text-xs text-neutral-400">
          Somatório de pontos por lugar (1º-8º dentro do escalão etário) em todas as provas
          marcadas como &ldquo;Conta para o CEM&rdquo;. Atletas do plantel SC Braga a negrito.
        </p>

        {(["M", "F"] as const).map((gender) => (
          <div key={gender} className="mt-6">
            <h3 className="text-base font-semibold text-neutral-900">{GENDER_LABEL[gender]}</h3>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              {rankingsByGender[gender].map((table) => (
                <RankingCard key={table.key} table={table} />
              ))}
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}

function RankingCard({ table }: { table: CemRankingTable }) {
  const top = table.entries.slice(0, 10);
  return (
    <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
      <h4 className="text-sm font-semibold text-neutral-900">{table.label}</h4>
      {top.length === 0 ? (
        <p className="mt-2 text-sm text-neutral-400">Ainda sem dados suficientes.</p>
      ) : (
        <ol className="mt-2 divide-y divide-neutral-100 text-sm">
          {top.map((entry, idx) => (
            <li
              key={entry.swimmerId}
              className={`flex items-center justify-between py-1.5 ${
                entry.isOwnClub ? "font-semibold text-neutral-900" : "text-neutral-600"
              }`}
            >
              <span>
                {idx + 1}. {entry.swimmerName}
                {entry.clubName && (
                  <span className="ml-1 font-normal text-neutral-400">({entry.clubName})</span>
                )}
              </span>
              <span className="tabular-nums text-neutral-500">{entry.points}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

function Th({ children }: { children?: React.ReactNode }) {
  return (
    <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
      {children}
    </th>
  );
}
