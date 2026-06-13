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
//
// Persistence data (FY2019-FY2025) loaded from by-year/persistence_index.json —
// 7 years of DOL LCA disclosure, case-deduplicated, SOC-filtered. Gives each
// employer a yearsActive count (1-7) that becomes the primary ranking signal.

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { DOL_SPONSOR_JOBS } from "../../src/lib/dol-jobs-data";
import { SPONSOR_DATA } from "../../src/lib/sponsor-data";
import { WAIVER_JOBS } from "../../src/lib/waiver-jobs-data";

export interface SponsorUniverseEntry {
  employer: string; // best-cased display name
  normKey: string; // normalized dedupe key
  city?: string;
  state?: string;
  specialties: string[];
  totalPositions: number; // certified LCA positions (volume signal, combined snapshot)
  newPositions: number;
  // Persistence fields — populated from 7-year by-year DOL analysis
  yearsActive?: number;       // 1-7 full years (FY2019-FY2025) with >=1 certified physician H-1B LCA
  firstYearSeen?: string;     // e.g. "FY2019"
  lastYearSeen?: string;      // e.g. "FY2025"
  recentYearPositions?: number; // certified positions in the most recent full year (FY2025 or FY2024)
  recentYear?: string;        // which year recentYearPositions comes from
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
  yearsActive?: number;
  recentYearPositions?: number;
}): number {
  // Persistence is now the primary signal: an employer that filed every year for
  // 7 years is far more reliable than one that filed once with 50 positions.
  // persistence(35) + volume(45) + j1(12) + cap(8) = max 100.
  const persistence = (e.yearsActive ?? 1) * 5; // 1yr=5, 7yr=35
  const positions = e.recentYearPositions ?? e.totalPositions; // prefer most-recent full year
  const volume = Math.min(45, Math.round(Math.sqrt(positions) * 6));
  const j1 = e.visaTypes.includes("j1") ? 12 : 0;
  const cap = e.capExempt ? 8 : 0;
  return Math.min(100, persistence + volume + j1 + cap);
}

interface PersistenceEntry {
  normKey: string;
  display: string;
  state?: string;
  yearsActive: number;
  firstYearSeen: string;
  lastYearSeen: string;
  recentYearPositions: number;
  recentYear: string;
  specialties: string[];
}

function loadPersistenceIndex(): Map<string, PersistenceEntry> {
  const path = join(
    process.cwd(),
    "docs/platform-v2/local/career/jobs/radar/sponsor-universe/by-year/persistence_index.json",
  );
  if (!existsSync(path)) return new Map();
  const rows = JSON.parse(readFileSync(path, "utf8")) as PersistenceEntry[];
  const m = new Map<string, PersistenceEntry>();
  for (const r of rows) m.set(r.normKey, r);
  return m;
}

interface Acc {
  display: string;
  city?: string;
  state?: string;
  specialties: Set<string>;
  totalPositions: number;
  newPositions: number;
  yearsActive?: number;
  firstYearSeen?: string;
  lastYearSeen?: string;
  recentYearPositions?: number;
  recentYear?: string;
  visaTypes: Set<string>;
  capExempt: boolean;
  avgSalaries: number[];
  verifiedCareersUrl?: string;
  sources: Set<string>;
}

export function buildSponsorUniverse(): SponsorUniverseEntry[] {
  const persistence = loadPersistenceIndex();
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

  // Merge persistence data into existing entries; add new entries from the
  // 7-year DOL union that are not in any of the three static sources above.
  for (const [pKey, p] of persistence) {
    let a = acc.get(pKey);
    if (!a) {
      // Employer appears in 7-year DOL data but not in legacy static sources —
      // add it as a new entry so the universe reflects the full known-sponsor set.
      a = {
        display: p.display,
        state: p.state,
        specialties: new Set(p.specialties),
        totalPositions: p.recentYearPositions,
        newPositions: 0,
        visaTypes: new Set(["h1b"]),
        capExempt: false,
        avgSalaries: [],
        sources: new Set(["by-year-dol"]),
      };
      acc.set(pKey, a);
    }
    // Merge persistence signals regardless of whether entry is new or existing.
    a.yearsActive = p.yearsActive;
    a.firstYearSeen = p.firstYearSeen;
    a.lastYearSeen = p.lastYearSeen;
    a.recentYearPositions = p.recentYearPositions;
    a.recentYear = p.recentYear;
    if (p.state && !a.state) a.state = p.state;
    for (const s of p.specialties) a.specialties.add(s);
    a.sources.add("by-year-dol");
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
      yearsActive: a.yearsActive,
      firstYearSeen: a.firstYearSeen,
      lastYearSeen: a.lastYearSeen,
      recentYearPositions: a.recentYearPositions,
      recentYear: a.recentYear,
      visaTypes,
      capExempt: a.capExempt,
      avgSalary,
      verifiedCareersUrl: a.verifiedCareersUrl,
      sources: [...a.sources].sort(),
    };
    out.push({
      ...entry,
      score: sponsorScore({
        totalPositions: entry.totalPositions,
        specialties,
        visaTypes,
        capExempt: entry.capExempt,
        yearsActive: entry.yearsActive,
        recentYearPositions: entry.recentYearPositions,
      }),
    });
  }

  out.sort((x, y) => y.score - x.score || (y.recentYearPositions ?? y.totalPositions) - (x.recentYearPositions ?? x.totalPositions) || x.employer.localeCompare(y.employer));
  return out;
}

// ATS employer name → canonical DOL norm key.
// Needed when the employer name a healthcare system uses in its ATS differs
// from the legal entity name filed in DOL LCA data (common for large systems
// that have rebranded or operate under a parent umbrella).
const EMPLOYER_ALIASES: Record<string, string> = {
  // Sanford Health (ATS name) is the same system as Sanford Clinic (DOL filer)
  "sanford health": "sanford clinic",
  // Ochsner Health (ATS) = Ochsner Clinic Foundation (DOL filer, 7yr/12pos)
  "ochsner health": "ochsner clinic foundation",
  // UMMS fragmented in DOL; best single entry is the Baltimore entity
  "university of maryland medical system": "university of maryland baltimore",
  // Stanford Health Care (ATS) is the clinical enterprise of Leland Stanford Jr
  // University — the university entity files physician LCAs for the academic
  // medical center (6yr active, 44 certified positions FY2020-FY2025)
  "stanford health care": "leland stanford jr university",
  // Thomas Jefferson University Hospitals (ATS, plural) vs thomas jefferson
  // university hospital (DOL, singular) — same institution, 4yr/28pos FY2025.
  // Prior analysis incorrectly noted 0 positions; DOL entry exists under singular form.
  "thomas jefferson university hospitals": "thomas jefferson university hospital",
  // AdventHealth (ATS, rebranded 2019) = Adventist Health System/Sunbelt, Inc. (DOL filer).
  // normEmployer("AdventHealth") → "adventhealth"; DOL normKey → "adventist health system sunbelt".
  "adventhealth": "adventist health system sunbelt",
  // Brown Health (ATS, rebranded from Lifespan ~2023) = Lifespan Physician Group (DOL filer).
  // normEmployer("Brown Health") → "brown health"; DOL normKey → "lifespan physician".
  // "brown health" is not a standalone key in persistence_index so no collision guard fires.
  "brown health": "lifespan physician",
  // Wellstar Phenom JSON-LD sets hiringOrganization.name = "5000 Wellstar Medical Group, LLC"
  // for all physician jobs. The numeric cost-center prefix "5000" survives normEmployer
  // (it is not a CORP_SUFFIX), producing "5000 wellstar medical" instead of "wellstar medical".
  // Alias routes it to the correct DOL normKey (7yr/19pos FY2025).
  "5000 wellstar medical": "wellstar medical",
  // University of Miami Phenom tenant code "UOMUOMUS" is set as hiringOrganization.name
  // in all JSON-LD job postings. normEmployer("UOMUOMUS") → "uomuomus" (no CORP_SUFFIX tokens).
  // DOL LCA filer is "University of Miami" (7yr/36pos FY2025, normKey "university of miami").
  "uomuomus": "university of miami",
  // Allegheny Health Network (ATS, public-facing name) = Allegheny Clinic (DOL filer, 7yr/31pos).
  // normEmployer("Allegheny Health Network") → "allegheny health network"; DOL normKey → "allegheny clinic".
  // "allegheny health network medical education consortium" is a separate 1yr/1pos PI entry and not a collision risk.
  "allegheny health network": "allegheny clinic",
  // Advocate Aurora Health (merged IL/WI system, rebranded 2022) maps to legacy Aurora Medical (DOL filer,
  // 7yr/33pos FY2025, WI). normEmployer("Advocate Aurora Health") → "advocate aurora health" (no CORP_SUFFIX tokens).
  // DOL also has "advocate health and hospitals" (5yr/13pos, IL); routing to aurora medical captures the stronger entity.
  "advocate aurora health": "aurora medical",
  // Banner Health (ATS public name, AZ-based system) = Banner Medical (DOL filer, 7yr/44pos FY2025, AZ).
  // normEmployer("Banner Health") → "banner health"; DOL has "banner health" only at 2yr/0pos (inactive).
  // "banner university medical" (7yr/60pos) is a separate GME/academic entity — use "banner medical" for general physician jobs.
  "banner health": "banner medical",
  // Novant Health (ATS public name, NC/SC/VA system) = Novant Medical (DOL filer, 7yr/11pos FY2025, NC).
  // normEmployer("Novant Health") → "novant health"; DOL normKey is "novant medical".
  "novant health": "novant medical",
};

// normKey -> entry, for O(1) sponsor-history lookup during classification enrichment.
// Alias keys are inserted so ATS employer names resolve even when DOL uses a
// different legal entity name.
export function sponsorHistoryIndex(): Map<string, SponsorUniverseEntry> {
  const m = new Map<string, SponsorUniverseEntry>();
  for (const e of buildSponsorUniverse()) m.set(e.normKey, e);
  for (const [atsKey, dolKey] of Object.entries(EMPLOYER_ALIASES)) {
    // Allow override when the existing DOL entry is weak (yearsActive < 3), so a
    // strong alias can replace a shell entity that happens to share the ATS display name.
    // E.g. DOL has "banner health" at 2yr/0pos, but the real filer is "banner medical" (7yr/44pos).
    const existing = m.get(atsKey);
    if (!existing || (existing.yearsActive ?? 0) < 3) {
      const target = m.get(dolKey);
      if (target) m.set(atsKey, target);
    }
  }
  return m;
}
