// Grupos de idade Masters, conforme o Regulamento de Competições Nacionais
// Master da FPN (secção 6): idade = ano civil de referência − ano de
// nascimento, agrupada em escalões de 5 em 5 anos a partir dos 25.
//
// A época desportiva atravessa dois anos civis, e o regulamento manda usar
// referências diferentes consoante a data da prova: out-dez do ano anterior
// usa esse ano; o resto da época (jan-dez) usa o ano seguinte. Estes dois
// valores têm de ser atualizados a cada nova época.
export const SEASON_REFERENCE_YEARS = {
  early: 2025, // provas de outubro a dezembro de 2025
  late: 2026, // provas de janeiro a dezembro de 2026
};

export function computeEscalao(birthDate: string | null, refYear: number): string | null {
  if (!birthDate) return null;
  const birthYear = Number(birthDate.slice(0, 4));
  if (!birthYear) return null;

  const age = refYear - birthYear;
  if (age < 25) return "—";

  const idx = Math.floor((age - 25) / 5);
  const low = 25 + idx * 5;
  const high = low + 4;
  const letter = String.fromCharCode(65 + idx);
  return `Master ${letter} (${low}-${high})`;
}
