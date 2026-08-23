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
  const letter = computeEscalaoLetter(birthDate, refYear);
  if (!letter) return null;
  if (letter === "—") return "—";

  const idx = letter.charCodeAt(0) - 65;
  const low = 25 + idx * 5;
  const high = low + 4;
  return `Master ${letter} (${low}-${high})`;
}

// Só a letra do escalão (Master A, B, C, ...), usada onde só interessa
// agrupar/comparar nadadores (ex: cálculo do ranking do CEM).
export function computeEscalaoLetter(birthDate: string | null, refYear: number): string | null {
  if (!birthDate) return null;
  const birthYear = Number(birthDate.slice(0, 4));
  if (!birthYear) return null;

  const age = refYear - birthYear;
  if (age < 25) return "—";

  const idx = Math.floor((age - 25) / 5);
  return String.fromCharCode(65 + idx);
}

// Qual dos dois anos de referência da época usar, consoante a data da
// prova (ver nota acima sobre out-dez vs jan-dez).
export function seasonReferenceYearFor(date: string | null): number {
  if (!date) return SEASON_REFERENCE_YEARS.late;
  const month = Number(date.slice(5, 7));
  const year = Number(date.slice(0, 4));
  return year === SEASON_REFERENCE_YEARS.early && month >= 10
    ? SEASON_REFERENCE_YEARS.early
    : SEASON_REFERENCE_YEARS.late;
}
