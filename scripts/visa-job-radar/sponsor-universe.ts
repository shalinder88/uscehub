// Visa Job Radar — sponsor universe (Phase B of the >=90% coverage strategy).
//
// The strategy: you cannot aggregate 90% of physician JOBS (they live on boards
// we will not scrape), but the universe of visa-SPONSORING physician EMPLOYERS is
// public and finite — every H-1B requires a public DOL LCA, and every J-1 waiver
// converts to H-1B. This module builds the deduped, ranked master list of that
// universe from the public DOL data already in the repo, so the resolver
// (ats-resolver.ts) can walk it employer-direct.
//
// Deterministic, no network. Scope is PHYSICIAN-ONLY (the source data is
// physician LCA records). LCA = sponsorship intent/history, NOT a live opening —
// this list is a TARGETING spine, never published as jobs.

import { DOL_SPONSOR_JOBS } from "../../src/lib/dol-jobs-data";
import { SPONSOR_DATA } from "../../src/lib/sponsor-data";
import { WAIVER_JOBS } from "../../src/lib/waiver-jobs-data";

export interface SponsorUniverseEntry {
  employer: string; // best-cased display name
  normKey: string; // normalized dedupe key
  city?: string;
  state?: string;
  specialties: string[];
  totalPositions: number; // certified LCA positions (volume signal)
  newPositions: number;
  visaTypes: string[]; // union across sources: "h1b", "j1"
  capExempt: boolean;
  avgSalary?: number;
  verifiedCareersUrl?: string; // from the hand-verified WAIVER_JOBS layer, if any
  sources: string[]; // which datasets contributed
  score: number; // Sponsor-History Score, 0-100
}

const CORP_SUFFIXES = new Set([
  "the", "inc", "llc", "pa", "pc", "pllc", "ltd", "corp", "corporation",
  "company", "co", "group", "incorporated", "associates", "association",
]);

// Employer-name normalization for dedupe. This is data prep, not the engine's
// intelligence layer, so light regex is fine. Folds case, punctuation, and
// trailing corporate suffixes so "MONTEFIORE MEDICAL CENTER" and "Montefiore
// Medical Center, Inc." collapse to one key.
export function normEmployer(s: string): string {
  const tokens = s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .split(" ")
    .filter((t) => t.length > 0 && !CORP_SUFFIXES.has(t));
  return tokens.join(" ").trim();
}

// Prefer a Title-Cased display over ALL-CAPS or all-lower variants.
function betterDisplay(a: string, b: string): string {
  const score = (s: string) => {
    const letters = s.replace(/[^A-Za-z]/g, "");
    if (letters.length === 0) return 0;
    const upper = (s.match(/[A-Z]/g) || []).length;
    const lower = (s.match(/[a-z]/g) || []).length;
    // mixed case (Title Case) scores highest; all-caps / all-lower score low
    if (upper > 0 && lower > 0) return 3;
    if (lower > 0) return 2;
    return 1;
  };
  return score(b) > score(a) ? b : a;
}

function sponsorScore(e: {
  totalPositions: number;
  specialties: string[];
  visaTypes: string[];
  capExempt: boolean;
}): number {
  // Volume dominates but with diminishing returns (an employer that sponsored 64
  // positions is a far stronger lead than 1, but not 64x). sqrt keeps the head
  // from dwarfing the score entirely.
  const volume = Math.min(60, Math.round(Math.sqrt(e.totalPositions) * 8));
  const breadth = Math.min(20, e.specialties.length * 3);
  const j1 = e.visaTypes.includes("j1") ? 12 : 0; // J-1 waiver eligible — our target
  const cap = e.capExempt ? 8 : 0; // cap-exempt = sponsors year-round, no lottery
  return Math.min(100, volume + breadth + j1 + cap);
}

interface Acc {
  display: string;
  city?: string;
  state?: string;
  specialties: Set<string>;
  totalPositions: number;
  newPositions: number;
  visaTypes: Set<string>;
  capExempt: boolean;
  avgSalaries: number[];
  verifiedCareersUrl?: string;
  sources: Set<string>;
}

export function buildSponsorUniverse(): SponsorUniverseEntry[] {
  const acc = new Map<string, Acc>();

  const get = (rawEmployer: string): Acc => {
    const key = normEmployer(rawEmployer);
    let a = acc.get(key);
    if (!a) {
      a = {
        display: rawEmployer,
        specialties: new Set(),
        totalPositions: 0,
        newPositions: 0,
        visaTypes: new Set(),
        capExempt: false,
        avgSalaries: [],
        sources: new Set(),
      };
      acc.set(key, a);
    }
    return a;
  };

  // SPONSOR_DATA carries the position counts (p=total, n=new) + avg salary.
  for (const r of SPONSOR_DATA as Array<{ e: string; c?: string; s?: string; sp?: string[]; p?: number; n?: number; a?: number }>) {
    if (!r.e) continue;
    const a = get(r.e);
    a.display = betterDisplay(a.display, r.e);
    if (r.c && !a.city) a.city = r.c;
    if (r.s && !a.state) a.state = r.s;
    for (const s of r.sp ?? []) a.specialties.add(s);
    a.totalPositions += r.p ?? 0;
    a.newPositions += r.n ?? 0;
    if (typeof r.a === "number" && r.a > 0) a.avgSalaries.push(r.a);
    a.sources.add("sponsor-data");
  }

  // DOL_SPONSOR_JOBS carries the visa-type tag (j1!) + capExempt + specialties.
  for (const j of DOL_SPONSOR_JOBS as Array<{ employer: string; city?: string; state?: string; specialty?: string; visaTypes?: string[]; capExempt?: boolean }>) {
    if (!j.employer) continue;
    const a = get(j.employer);
    a.display = betterDisplay(a.display, j.employer);
    if (j.city && !a.city) a.city = j.city;
    if (j.state && !a.state) a.state = j.state;
    if (j.specialty) a.specialties.add(j.specialty);
    for (const v of j.visaTypes ?? []) a.visaTypes.add(v);
    if (j.capExempt) a.capExempt = true;
    a.sources.add("dol-lca");
  }

  // WAIVER_JOBS is the hand-verified layer — its sourceUrl is an employer-direct
  // careers page we already confirmed. Carry it as a resolution head-start.
  for (const w of WAIVER_JOBS as Array<{ employer: string; city?: string; state?: string; specialty?: string; visaTypes?: string[]; sourceUrl?: string; sourceName?: string }>) {
    if (!w.employer) continue;
    const a = get(w.employer);
    a.display = betterDisplay(a.display, w.employer);
    if (w.specialty) a.specialties.add(w.specialty);
    for (const v of w.visaTypes ?? []) a.visaTypes.add(v);
    if (w.sourceUrl && /employer career page/i.test(w.sourceName ?? "")) {
      a.verifiedCareersUrl = w.sourceUrl;
    }
    a.sources.add("waiver-manual");
  }

  const out: SponsorUniverseEntry[] = [];
  for (const [normKey, a] of acc) {
    const specialties = [...a.specialties].sort();
    const visaTypes = [...a.visaTypes].sort();
    const avgSalary =
      a.avgSalaries.length > 0
        ? Math.round(a.avgSalaries.reduce((x, y) => x + y, 0) / a.avgSalaries.length)
        : undefined;
    const entry: Omit<SponsorUniverseEntry, "score"> = {
      employer: a.display,
      normKey,
      city: a.city,
      state: a.state,
      specialties,
      totalPositions: a.totalPositions,
      newPositions: a.newPositions,
      visaTypes,
      capExempt: a.capExempt,
      avgSalary,
      verifiedCareersUrl: a.verifiedCareersUrl,
      sources: [...a.sources].sort(),
    };
    out.push({ ...entry, score: sponsorScore({ totalPositions: entry.totalPositions, specialties, visaTypes, capExempt: entry.capExempt }) });
  }

  out.sort((x, y) => y.score - x.score || y.totalPositions - x.totalPositions || x.employer.localeCompare(y.employer));
  return out;
}

// normKey -> entry, for O(1) sponsor-history lookup during classification enrichment.
export function sponsorHistoryIndex(): Map<string, SponsorUniverseEntry> {
  const m = new Map<string, SponsorUniverseEntry>();
  for (const e of buildSponsorUniverse()) m.set(e.normKey, e);
  return m;
}
