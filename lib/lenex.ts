// Parser para ficheiros LENEX (.lef / .lxf) — o formato XML standard usado
// pelo software de cronometragem (SPLASH Meet Manager, Team Manager, etc.)
// e pela FPN para distribuir inscrições e resultados de provas.
//
// Referência da estrutura relevante (simplificada):
//
// LENEX > MEETS > MEET
//   SESSIONS > SESSION > EVENTS > EVENT (eventid, gender, SWIMSTYLE)
//     AGEGROUPS > AGEGROUP (agegroupid, agemin, agemax)
//       RANKINGS > RANKING (place, resultid)   -- classificação dentro do escalão
//   CLUBS > CLUB (code, name)
//     ATHLETES > ATHLETE (firstname, lastname, birthdate, gender, license)
//       RESULTS > RESULT (eventid, resultid, swimtime, points, entrytime, entrycourse)
//
// Só extraímos o que é preciso para o plantel/ranking do CEM — o ficheiro
// tem muito mais informação (POOL, FACILITY, FEE, SPLITS, ...) que ignoramos.

import { XMLParser } from "fast-xml-parser";

export type LenexStroke = "FREE" | "BACK" | "BREAST" | "FLY" | "MEDLEY";

export type ParsedLenexMeet = {
  name: string;
  city: string | null;
  course: "SCM" | "LCM" | null;
  organizer: string | null;
  startDate: string | null;
  endDate: string | null;
  events: ParsedLenexEvent[];
  clubs: ParsedLenexClub[];
};

export type ParsedLenexEvent = {
  eventId: string;
  gender: "M" | "F" | "X";
  distance: number;
  stroke: LenexStroke;
  relayCount: number;
  agegroups: ParsedLenexAgegroup[];
};

export type ParsedLenexAgegroup = {
  agegroupId: string;
  ageMin: number | null;
  ageMax: number | null;
  // resultid -> lugar dentro deste escalão, tal como saiu no ficheiro.
  placesByResultId: Record<string, number>;
};

export type ParsedLenexClub = {
  code: string;
  name: string;
  athletes: ParsedLenexAthlete[];
};

export type ParsedLenexAthlete = {
  firstName: string;
  lastName: string;
  birthDate: string | null;
  gender: "M" | "F" | null;
  license: string | null;
  nation: string | null;
  results: ParsedLenexResult[];
};

export type ParsedLenexResult = {
  eventId: string;
  resultId: string;
  swimTime: string | null;
  entryTime: string | null;
  entryCourse: string | null;
  points: number | null;
};

const ARRAY_TAGS = new Set([
  "MEET",
  "SESSION",
  "EVENT",
  "AGEGROUP",
  "RANKING",
  "CLUB",
  "ATHLETE",
  "RESULT",
  "SPLIT",
]);

function toArray<T>(value: T | T[] | undefined): T[] {
  if (value === undefined) return [];
  return Array.isArray(value) ? value : [value];
}

function str(value: unknown): string | null {
  if (value === undefined || value === null) return null;
  const s = String(value).trim();
  return s.length > 0 ? s : null;
}

function num(value: unknown): number | null {
  const s = str(value);
  if (s === null) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

export class LenexParseError extends Error {}

export function parseLenexXml(xml: string): ParsedLenexMeet {
  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: "",
    parseAttributeValue: false,
    isArray: (tagName) => ARRAY_TAGS.has(tagName),
  });

  let doc: unknown;
  try {
    doc = parser.parse(xml);
  } catch (err) {
    throw new LenexParseError(`Ficheiro XML inválido: ${(err as Error).message}`);
  }

  const root = (doc as Record<string, unknown>)?.LENEX as Record<string, unknown> | undefined;
  if (!root) {
    throw new LenexParseError("Não é um ficheiro LENEX (falta a tag <LENEX>).");
  }

  const meets = toArray((root.MEETS as Record<string, unknown>)?.MEET);
  const meet = meets[0] as Record<string, unknown> | undefined;
  if (!meet) {
    throw new LenexParseError("O ficheiro não contém nenhuma prova (<MEET>).");
  }

  const course = str(meet.course);

  // Eventos: percorrer todas as sessões, extrair o SWIMSTYLE e os
  // escalões/rankings de cada EVENT.
  const events: ParsedLenexEvent[] = [];
  const sessions = toArray((meet.SESSIONS as Record<string, unknown>)?.SESSION) as Record<
    string,
    unknown
  >[];
  for (const session of sessions) {
    const sessionEvents = toArray(
      (session.EVENTS as Record<string, unknown>)?.EVENT
    ) as Record<string, unknown>[];
    for (const ev of sessionEvents) {
      const swimstyle = ev.SWIMSTYLE as Record<string, unknown> | undefined;
      if (!swimstyle) continue;
      const distance = num(swimstyle.distance);
      const stroke = str(swimstyle.stroke) as LenexStroke | null;
      const eventId = str(ev.eventid);
      const gender = str(ev.gender) as "M" | "F" | "X" | null;
      if (!eventId || !distance || !stroke || !gender) continue;

      const agegroups: ParsedLenexAgegroup[] = [];
      const ageGroupsEl = toArray(
        (ev.AGEGROUPS as Record<string, unknown>)?.AGEGROUP
      ) as Record<string, unknown>[];
      for (const ag of ageGroupsEl) {
        const agegroupId = str(ag.agegroupid);
        if (!agegroupId) continue;
        const rankings = toArray(
          (ag.RANKINGS as Record<string, unknown>)?.RANKING
        ) as Record<string, unknown>[];
        const placesByResultId: Record<string, number> = {};
        for (const r of rankings) {
          const resultId = str(r.resultid);
          const place = num(r.place);
          if (resultId && place) placesByResultId[resultId] = place;
        }
        agegroups.push({
          agegroupId,
          ageMin: num(ag.agemin),
          ageMax: num(ag.agemax),
          placesByResultId,
        });
      }

      events.push({
        eventId,
        gender,
        distance,
        stroke,
        relayCount: num(swimstyle.relaycount) ?? 1,
        agegroups,
      });
    }
  }

  // Clubes/nadadores/resultados.
  const clubs: ParsedLenexClub[] = [];
  const clubEls = toArray((meet.CLUBS as Record<string, unknown>)?.CLUB) as Record<
    string,
    unknown
  >[];
  for (const clubEl of clubEls) {
    const code = str(clubEl.code) ?? str(clubEl.name);
    const name = str(clubEl.name);
    if (!code || !name) continue;

    const athletes: ParsedLenexAthlete[] = [];
    const athleteEls = toArray(
      (clubEl.ATHLETES as Record<string, unknown>)?.ATHLETE
    ) as Record<string, unknown>[];
    for (const a of athleteEls) {
      const firstName = str(a.firstname);
      const lastName = str(a.lastname);
      if (!firstName || !lastName) continue;

      const results: ParsedLenexResult[] = [];
      const resultEls = toArray(
        (a.RESULTS as Record<string, unknown>)?.RESULT
      ) as Record<string, unknown>[];
      for (const r of resultEls) {
        const eventId = str(r.eventid);
        const resultId = str(r.resultid);
        if (!eventId || !resultId) continue;
        results.push({
          eventId,
          resultId,
          swimTime: str(r.swimtime),
          entryTime: str(r.entrytime),
          entryCourse: str(r.entrycourse),
          points: num(r.points),
        });
      }

      athletes.push({
        firstName,
        lastName,
        birthDate: str(a.birthdate),
        gender: str(a.gender) as "M" | "F" | null,
        license: str(a.license),
        nation: str(a.nation),
        results,
      });
    }

    clubs.push({ code, name, athletes });
  }

  const firstSessionDate = str(sessions[0]?.date);

  return {
    name: str(meet.name) ?? "Prova sem nome",
    city: str(meet.city),
    course: course === "SCM" || course === "LCM" ? course : null,
    organizer: str(meet.organizer),
    startDate: firstSessionDate,
    endDate: str(sessions[sessions.length - 1]?.date) ?? firstSessionDate,
    events,
    clubs,
  };
}
