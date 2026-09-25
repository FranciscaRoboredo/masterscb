// Cálculo dos rankings do Circuito Especialista Master (CEM), conforme o
// Regulamento de Competições Nacionais Master 2025/2026 (secção "CIRCUITO
// ESPECIALISTA MASTER").
//
// Resumo das regras aplicadas aqui:
//
// 1. O CEM só conta provas de Clubes/AT's (não os Campeonatos Nacionais
//    organizados pela FPN) — filtragem feita a montante, por `counts_for_cem`
//    em cada `cem_meets`.
// 2. Dentro de cada prova, cada evento (distância+técnica+género) é
//    corrido por escalão etário: o lugar de cada nadador conta dentro do
//    seu escalão (género + Master A..P), não da prova toda. Usamos o
//    escalão canónico calculado pela data de nascimento (lib/escalao.ts),
//    em vez do agrupamento que cada organização usou no ficheiro — é mais
//    robusto a provas pequenas que juntem escalões.
// 3. Lugar → pontos: tabela 1º-8º = 10,8,6,5,4,3,2,1 (fora do top 8 = 0).
// 4. O ranking final de cada especialidade (Livres/Costas/Bruços/
//    Mariposa/Estilos) é o somatório desses pontos em TODAS as provas
//    elegíveis da época, por género — "em competição direta...
//    independentemente do... escalão etário": ou seja, o escalão só serve
//    para nivelar a pontuação por prova, o ranking final junta todos os
//    escalões numa lista só, por género.
// 5. Elegibilidade: Livres exige pontuação em >=3 distâncias diferentes;
//    Costas/Bruços/Mariposa/Estilos exigem >=2.
// 6. "Nadador +Completo" = somatório dos outros 5 rankings, exigindo
//    adicionalmente elegibilidade nos 5 E um mínimo de 3 pontos em cada um.
// 7. Desempate: nº de 1ºs lugares, depois 2ºs, depois 3ºs, etc. (contados
//    nas provas que pontuam para essa especialidade).

import { computeEscalaoLetter, seasonReferenceYearFor } from "./escalao";
import type { LenexStroke } from "./lenex";

export const CEM_PLACE_POINTS: Record<number, number> = {
  1: 10,
  2: 8,
  3: 6,
  4: 5,
  5: 4,
  6: 3,
  7: 2,
  8: 1,
};

const STROKE_LABEL: Record<LenexStroke, string> = {
  FREE: "Especialista em Livres",
  BACK: "Especialista em Costas",
  BREAST: "Especialista em Bruços",
  FLY: "Especialista em Mariposa",
  MEDLEY: "Especialista em Estilos",
};

const MIN_DISTANCES: Record<LenexStroke, number> = {
  FREE: 3,
  BACK: 2,
  BREAST: 2,
  FLY: 2,
  MEDLEY: 2,
};

export type CemResultInput = {
  swimmerId: string;
  swimmerName: string;
  license: string;
  gender: "M" | "F" | null;
  birthDate: string | null;
  clubName: string | null;
  isOwnClub: boolean;
  meetId: string;
  meetDate: string;
  eventId: string;
  eventGender: "M" | "F" | "X";
  distance: number;
  stroke: LenexStroke;
  relayCount: number;
  swimTime: string | null;
};

export type CemRankingEntry = {
  swimmerId: string;
  swimmerName: string;
  license: string;
  clubName: string | null;
  isOwnClub: boolean;
  points: number;
  distinctDistances: number;
  eligible: boolean;
  placeCounts: number[]; // índice 1..8, para desempate
};

export type CemRankingTable = {
  key: LenexStroke | "COMPLETO";
  label: string;
  gender: "M" | "F";
  entries: CemRankingEntry[]; // já ordenadas e filtradas por elegibilidade
};

// "00:01:51.57", "01:51.57" ou "29.95" -> centésimos de segundo. Tempos
// ausentes ou inválidos (DNS/DNF/NT) devolvem null e ficam fora da
// ordenação (não contam para o lugar nem para os pontos).
function parseSwimTimeCentiseconds(time: string | null): number | null {
  if (!time) return null;
  const trimmed = time.trim();
  if (!/^\d+(:\d+)*(\.\d{1,2})?$/.test(trimmed)) return null;

  const [wholePart, centisPart = "0"] = trimmed.split(".");
  const segments = wholePart.split(":").map(Number);
  if (segments.some((n) => !Number.isFinite(n))) return null;

  let seconds = 0;
  for (const seg of segments) seconds = seconds * 60 + seg;
  const centis = Number(centisPart.padEnd(2, "0").slice(0, 2));
  if (!Number.isFinite(centis)) return null;

  const total = seconds * 100 + centis;
  return total > 0 ? total : null;
}

function newPlaceCounts(): number[] {
  return new Array(9).fill(0); // 0 unused, 1..8
}

export function computeCemRankings(results: CemResultInput[]): CemRankingTable[] {
  // 1. Só eventos individuais (sem estafetas) e com género definido.
  const individual = results.filter(
    (r) => r.relayCount === 1 && (r.eventGender === "M" || r.eventGender === "F")
  );

  // 2. Agrupar por (eventId, escalão canónico) para determinar o lugar de
  // cada nadador dentro do seu escalão, nessa prova.
  type GroupKey = string;
  const groups = new Map<GroupKey, CemResultInput[]>();
  for (const r of individual) {
    const refYear = seasonReferenceYearFor(r.meetDate);
    const letter = computeEscalaoLetter(r.birthDate, refYear);
    if (!letter || letter === "—") continue;
    const key = `${r.eventId}::${letter}`;
    const arr = groups.get(key) ?? [];
    arr.push(r);
    groups.set(key, arr);
  }

  // swimmerId -> stroke -> { points, distancesWithPoints: Set<number>, placeCounts }
  type StrokeAgg = {
    points: number;
    distancesWithPoints: Set<number>;
    placeCounts: number[];
  };
  const perSwimmer = new Map<
    string,
    {
      info: CemResultInput;
      strokes: Map<LenexStroke, StrokeAgg>;
    }
  >();

  function getSwimmer(r: CemResultInput) {
    let entry = perSwimmer.get(r.swimmerId);
    if (!entry) {
      entry = { info: r, strokes: new Map() };
      perSwimmer.set(r.swimmerId, entry);
    }
    return entry;
  }

  function getStrokeAgg(r: CemResultInput): StrokeAgg {
    const entry = getSwimmer(r);
    let agg = entry.strokes.get(r.stroke);
    if (!agg) {
      agg = { points: 0, distancesWithPoints: new Set(), placeCounts: newPlaceCounts() };
      entry.strokes.set(r.stroke, agg);
    }
    return agg;
  }

  // 3. Dentro de cada grupo, ordenar por tempo e atribuir lugar (empates
  // partilham o lugar, "1,2,2,4" como é normal em natação).
  for (const groupResults of groups.values()) {
    const timed = groupResults
      .map((r) => ({ r, t: parseSwimTimeCentiseconds(r.swimTime) }))
      .filter((x) => x.t !== null) as { r: CemResultInput; t: number }[];
    timed.sort((a, b) => a.t - b.t);

    let place = 0;
    let lastTime: number | null = null;
    timed.forEach((x, idx) => {
      if (lastTime === null || x.t !== lastTime) {
        place = idx + 1;
        lastTime = x.t;
      }
      const points = CEM_PLACE_POINTS[place] ?? 0;
      if (points === 0) return;

      const agg = getStrokeAgg(x.r);
      agg.points += points;
      agg.distancesWithPoints.add(x.r.distance);
      if (place <= 8) agg.placeCounts[place] += 1;
    });
  }

  // 4. Montar as 6 tabelas (5 especialidades + Nadador+Completo) por género.
  const strokes: LenexStroke[] = ["FREE", "BACK", "BREAST", "FLY", "MEDLEY"];
  const genders: ("M" | "F")[] = ["M", "F"];
  const tables: CemRankingTable[] = [];

  for (const gender of genders) {
    const swimmersOfGender = [...perSwimmer.values()].filter((e) => e.info.gender === gender);

    for (const stroke of strokes) {
      const entries: CemRankingEntry[] = [];
      for (const s of swimmersOfGender) {
        const agg = s.strokes.get(stroke);
        if (!agg) continue;
        const eligible = agg.distancesWithPoints.size >= MIN_DISTANCES[stroke];
        entries.push({
          swimmerId: s.info.swimmerId,
          swimmerName: s.info.swimmerName,
          license: s.info.license,
          clubName: s.info.clubName,
          isOwnClub: s.info.isOwnClub,
          points: agg.points,
          distinctDistances: agg.distancesWithPoints.size,
          eligible,
          placeCounts: agg.placeCounts,
        });
      }
      tables.push({
        key: stroke,
        label: STROKE_LABEL[stroke],
        gender,
        entries: sortRanking(entries.filter((e) => e.eligible)),
      });
    }

    // Nadador+Completo: soma dos 5, exige elegibilidade + >=3 pontos em
    // cada uma das 5 especialidades.
    const completoEntries: CemRankingEntry[] = [];
    for (const s of swimmersOfGender) {
      let ok = true;
      let total = 0;
      const placeCounts = newPlaceCounts();
      for (const stroke of strokes) {
        const agg = s.strokes.get(stroke);
        const eligible = !!agg && agg.distancesWithPoints.size >= MIN_DISTANCES[stroke];
        if (!eligible || !agg || agg.points < 3) {
          ok = false;
          break;
        }
        total += agg.points;
        for (let p = 1; p <= 8; p++) placeCounts[p] += agg.placeCounts[p];
      }
      if (!ok) continue;
      completoEntries.push({
        swimmerId: s.info.swimmerId,
        swimmerName: s.info.swimmerName,
        license: s.info.license,
        clubName: s.info.clubName,
        isOwnClub: s.info.isOwnClub,
        points: total,
        distinctDistances: strokes.length,
        eligible: true,
        placeCounts,
      });
    }
    tables.push({
      key: "COMPLETO",
      label: "Nadador +Completo",
      gender,
      entries: sortRanking(completoEntries),
    });
  }

  return tables;
}

function sortRanking(entries: CemRankingEntry[]): CemRankingEntry[] {
  return [...entries].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    for (let p = 1; p <= 8; p++) {
      if (b.placeCounts[p] !== a.placeCounts[p]) return b.placeCounts[p] - a.placeCounts[p];
    }
    return a.swimmerName.localeCompare(b.swimmerName, "pt-PT");
  });
}
