import { listRoster } from "./actions";
import { NewRosterForm } from "./roster-form";
import { RosterRow } from "./roster-row";
import { CemSuggestions } from "./cem-suggestions";
import { listUnlinkedScBragaSwimmers } from "../cem/actions";

export default async function PlantelPage() {
  const [roster, cemSuggestions] = await Promise.all([
    listRoster(),
    listUnlinkedScBragaSwimmers(),
  ]);

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-neutral-900">Plantel / Licenças FPN</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Registo de atletas licenciadas, independente de terem conta de acesso à app.
        Útil para inscrições oficiais e gestão do escalão etário.
      </p>

      <CemSuggestions swimmers={cemSuggestions} />

      <section className="mt-6 rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-neutral-900">Adicionar atleta ao plantel</h2>
        <div className="mt-4">
          <NewRosterForm />
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-semibold text-neutral-900">Plantel ({roster.length})</h2>
        <div className="mt-3 overflow-x-auto rounded-lg border border-neutral-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-neutral-200 text-sm">
            <thead className="bg-neutral-50">
              <tr>
                <Th>Nome</Th>
                <Th>Género</Th>
                <Th>Data Nasc.</Th>
                <Th>Nº Licença</Th>
                <Th>Escalão 25</Th>
                <Th>Escalão 26</Th>
                <Th></Th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {roster.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-neutral-400">
                    Ainda não há atletas no plantel.
                  </td>
                </tr>
              )}
              {roster.map((athlete) => (
                <RosterRow key={athlete.id} athlete={athlete} />
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

function Th({ children }: { children?: React.ReactNode }) {
  return (
    <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-neutral-500">
      {children}
    </th>
  );
}
