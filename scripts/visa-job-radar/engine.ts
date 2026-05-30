// Visa Job Radar — deterministic engine.
//
// No regex anywhere in this file (a hard project rule for the intelligence
// layer). All matching is explicit character scanning so behaviour is fully
// auditable. Every offset produced here indexes into the cleanedText string
// returned by clean(), which is the single canonical representation.

import type {
  CleanedJob,
  Classification,
  Confidence,
  PhraseHit,
  Polarity,
  Quote,
  RawCandidate,
  RejectReason,
  VisaLabel,
} from "./types";

// ── text normalization ──────────────────────────────────────────────

function replaceAll(s: string, find: string, repl: string): string {
  return s.split(find).join(repl);
}

export function collapseWs(s: string): string {
  let out = "";
  let inWs = false;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    const isWs =
      c === " " || c === "\t" || c === "\n" || c === "\r" || c === "\f" || c === "\v";
    if (isWs) {
      if (!inWs) {
        out += " ";
        inWs = true;
      }
    } else {
      out += c;
      inWs = false;
    }
  }
  return out;
}

// Produces the canonical cleanedText. Length may differ from the raw input
// (ellipsis expands, smart quotes fold) — that is fine because every later
// offset is computed against this output, never against the raw string.
export function clean(rawText: string): string {
  let s = rawText;
  s = replaceAll(s, "‘", "'");
  s = replaceAll(s, "’", "'");
  s = replaceAll(s, "“", '"');
  s = replaceAll(s, "”", '"');
  s = replaceAll(s, "—", "-");
  s = replaceAll(s, "–", "-");
  s = replaceAll(s, "…", "...");
  s = replaceAll(s, " ", " ");
  s = collapseWs(s);
  return s.trim();
}

// Case-insensitive scan returning offsets into haystack. needle must be ASCII
// (all lexicon entries are). Non-overlapping; advances past each match.
export function findAll(
  haystack: string,
  needle: string,
): Array<{ start: number; end: number }> {
  const hits: Array<{ start: number; end: number }> = [];
  const n = needle.length;
  if (n === 0) return hits;
  const needleLc = needle.toLowerCase();
  for (let i = 0; i + n <= haystack.length; i++) {
    let match = true;
    for (let j = 0; j < n; j++) {
      if (haystack[i + j].toLowerCase() !== needleLc[j]) {
        match = false;
        break;
      }
    }
    if (match) {
      hits.push({ start: i, end: i + n });
      i += n - 1;
    }
  }
  return hits;
}

function includesCi(haystack: string, needle: string): boolean {
  return findAll(haystack, needle).length > 0;
}

// ── lexicons ────────────────────────────────────────────────────────

interface LexEntry {
  canonical: string;
  variants: string[]; // lowercase; the canonical is included
  labels: VisaLabel[];
}

// Affirmative-intent phrases only. Deliberately NOT bare "sponsor" /
// "sponsorship": those are frequently negated ("unable to sponsor") or refer
// to non-visa objects ("sponsor relocation"), so requiring a visa object here
// is the single biggest precision lever.
const LEXICON: LexEntry[] = [
  {
    canonical: "j-1 visa waiver",
    variants: [
      "j-1 visa waiver",
      "j-1 waiver",
      "j1 waiver",
      "j 1 waiver",
      "j-1 physician waiver",
    ],
    labels: ["EXPLICIT_J1_WAIVER"],
  },
  {
    canonical: "conrad 30",
    variants: ["conrad 30", "conrad state 30", "conrad program", "conrad waiver"],
    labels: ["EXPLICIT_CONRAD", "EXPLICIT_J1_WAIVER"],
  },
  {
    canonical: "hhs waiver",
    variants: [
      "hhs waiver",
      "hhs j-1 waiver",
      "appalachian regional commission waiver",
      "arc waiver",
      "delta regional authority waiver",
    ],
    labels: ["EXPLICIT_HHS_WAIVER", "EXPLICIT_J1_WAIVER"],
  },
  {
    canonical: "h-1b sponsorship",
    variants: [
      "h-1b sponsorship",
      "h1b sponsorship",
      "h-1b visa sponsorship",
      "h1b visa sponsorship",
      "sponsor h-1b",
      "sponsor h1b",
    ],
    labels: ["EXPLICIT_H1B"],
  },
  {
    canonical: "visa sponsorship",
    variants: [
      "visa sponsorship",
      "visa sponsorship available",
      "sponsorship is available",
      "sponsorship available",
      "will sponsor your visa",
      "sponsor your visa",
      "immigration sponsorship",
    ],
    labels: ["EXPLICIT_VISA_SPONSORSHIP"],
  },
  {
    canonical: "cap-exempt",
    variants: ["cap-exempt", "cap exempt", "h-1b cap-exempt", "cap-exempt employer"],
    labels: ["EXPLICIT_CAP_EXEMPT"],
  },
];

// Explicit standalone denials. Every entry carries a visa / work-authorization
// object so generic "does not sponsor relocation" can never match here.
const DENIAL_PHRASES: string[] = [
  "without sponsorship",
  "without visa sponsorship",
  "without the need for sponsorship",
  "without the need for visa sponsorship",
  "no visa sponsorship",
  "visa sponsorship is not available",
  "visa sponsorship not available",
  "not eligible for visa sponsorship",
  "not eligible for sponsorship",
  "sponsorship is not available",
  "sponsorship not available",
  "unable to sponsor visa",
  "unable to provide sponsorship",
  "unable to provide visa sponsorship",
  "cannot sponsor visa",
  "do not offer visa sponsorship",
  "does not offer visa sponsorship",
  "do not sponsor visa",
  "does not sponsor visa",
  "will not sponsor visa",
  "u.s. citizens only",
  "us citizens only",
  "citizenship required",
  "must be a u.s. citizen",
  "must be a us citizen",
  "must be authorized to work in the united states without",
];

const BOILERPLATE_FRAMES: string[] = [
  "without regard to",
  "regardless of",
  "equal opportunity employer",
  "equal employment opportunity",
];

const NEGATOR_SET = new Set<string>([
  "no",
  "not",
  "without",
  "cannot",
  "can't",
  "won't",
  "don't",
  "doesn't",
  "isn't",
  "aren't",
  "non",
  "never",
  "unable",
  "ineligible",
]);

// ── physician gate (title only) ─────────────────────────────────────

const NONPHYS_TOKENS: string[] = [
  "nurse practitioner",
  "physician assistant",
  "physician's assistant",
  "registered nurse",
  " rn ",
  " np ",
  " pa ",
  "pa-c",
  "aprn",
  "crna",
  "pharmacist",
  "technician",
  "technologist",
  "therapist",
  "social worker",
  "dietitian",
  "scribe",
  "medical assistant",
  "paramedic",
  "phlebotom",
  "administrator",
  "coordinator",
  "recruiter",
  "receptionist",
  "biller",
];

const PHYS_TOKENS: string[] = [
  "physician",
  "hospitalist",
  "internal medicine",
  "family medicine",
  "family practice",
  "pediatric",
  "psychiatr",
  "cardiolog",
  "neurolog",
  "oncolog",
  "radiolog",
  "anesthesiolog",
  "surgeon",
  "surgery",
  "obstetric",
  "gynecolog",
  "ob/gyn",
  "ob gyn",
  "endocrinolog",
  "gastroenterolog",
  "nephrolog",
  "pulmonolog",
  "rheumatolog",
  "dermatolog",
  "ophthalmolog",
  "urolog",
  "patholog",
  "emergency medicine",
  "medical officer",
  "primary care physician",
];

// Non-physician tokens are checked FIRST so "Physician Assistant" (which
// contains "physician") is correctly excluded before the physician test runs.
export function isPhysician(title: string): boolean {
  const padded = " " + title.toLowerCase() + " ";
  for (const t of NONPHYS_TOKENS) {
    if (padded.includes(t)) return false;
  }
  for (const t of PHYS_TOKENS) {
    if (padded.includes(t)) return true;
  }
  return false;
}

// ── recruiter / employer resolution ─────────────────────────────────

const RECRUITER_FLAGS: string[] = [
  "confidential",
  "recruiter",
  "search firm",
  "talent partners",
  "staffing agency",
];

export function isRecruiterHidden(raw: RawCandidate): boolean {
  const e = norm(raw.employer);
  if (e === "") return true;
  for (const f of RECRUITER_FLAGS) {
    if (e.includes(f)) return true;
  }
  return false;
}

function isEmployerResolved(raw: RawCandidate): boolean {
  const e = norm(raw.employer);
  return e.length > 1;
}

// ── staleness ───────────────────────────────────────────────────────

const STALE_DAYS = 120;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

function isStale(raw: RawCandidate): boolean {
  if (!raw.postedDate) return false; // unknown age is not treated as stale
  const posted = Date.parse(raw.postedDate);
  const fetched = Date.parse(raw.fetchedAt);
  if (Number.isNaN(posted) || Number.isNaN(fetched)) return false;
  return fetched - posted > STALE_DAYS * MS_PER_DAY;
}

// ── canonical key / dedupe ──────────────────────────────────────────

export function norm(s: string): string {
  let out = "";
  for (const ch of s.toLowerCase()) {
    const isAlnum = (ch >= "a" && ch <= "z") || (ch >= "0" && ch <= "9");
    out += isAlnum ? ch : " ";
  }
  return collapseWs(out).trim();
}

function postedDateWindow(iso?: string): string {
  if (!iso) return "nodate";
  if (iso.length >= 7) return iso.slice(0, 7); // YYYY-MM tolerates re-post jitter
  return iso;
}

export function canonicalKey(raw: RawCandidate): string {
  return [
    norm(raw.employer),
    norm(raw.title),
    norm(raw.state ?? ""),
    postedDateWindow(raw.postedDate),
  ].join("|");
}

// ── polarity + phrase extraction ────────────────────────────────────

function stripEdgePunct(token: string): string {
  let start = 0;
  let end = token.length;
  const isAlnum = (ch: string) =>
    (ch >= "a" && ch <= "z") || (ch >= "0" && ch <= "9");
  while (start < end && !isAlnum(token[start]) && token[start] !== "'") start++;
  while (end > start && !isAlnum(token[end - 1]) && token[end - 1] !== "'") end--;
  return token.slice(start, end);
}

// True when a negator sits just before the hit within the same sentence.
function precededByNegation(text: string, hitStart: number): boolean {
  const windowStart = Math.max(0, hitStart - 45);
  const before = text.slice(windowStart, hitStart);
  const lastStop = Math.max(
    before.lastIndexOf(". "),
    before.lastIndexOf("? "),
    before.lastIndexOf("! "),
    before.lastIndexOf("; "),
  );
  const scoped = lastStop >= 0 ? before.slice(lastStop + 2) : before;
  const tokens = scoped.toLowerCase().split(" ").filter((t) => t.length > 0);
  const lastFew = tokens.slice(-4);
  for (const t of lastFew) {
    if (NEGATOR_SET.has(stripEdgePunct(t))) return true;
  }
  return false;
}

function inBoilerplateFrame(text: string, hitStart: number): boolean {
  const windowStart = Math.max(0, hitStart - 60);
  const before = text.slice(windowStart, hitStart).toLowerCase();
  for (const frame of BOILERPLATE_FRAMES) {
    if (before.includes(frame)) return true;
  }
  return false;
}

function polarityFor(text: string, hitStart: number): Polarity {
  if (inBoilerplateFrame(text, hitStart)) return "BOILERPLATE";
  if (precededByNegation(text, hitStart)) return "DENIED";
  return "AFFIRMATIVE";
}

export function extractPhraseHits(cleanedText: string): PhraseHit[] {
  const hits: PhraseHit[] = [];
  for (const entry of LEXICON) {
    for (const variant of entry.variants) {
      for (const span of findAll(cleanedText, variant)) {
        hits.push({
          canonical: entry.canonical,
          matchedText: cleanedText.slice(span.start, span.end),
          start: span.start,
          end: span.end,
          polarity: polarityFor(cleanedText, span.start),
          labels: entry.labels,
        });
      }
    }
  }
  hits.sort((a, b) => a.start - b.start);
  return hits;
}

export function findStandaloneDenials(cleanedText: string): string[] {
  const found: string[] = [];
  for (const phrase of DENIAL_PHRASES) {
    if (includesCi(cleanedText, phrase)) found.push(phrase);
  }
  return found;
}

export function validateQuote(cleanedText: string, q: Quote): boolean {
  return cleanedText.slice(q.start, q.end) === q.text;
}

// ── classification ──────────────────────────────────────────────────

function uniqueLabels(hits: PhraseHit[]): VisaLabel[] {
  const set = new Set<VisaLabel>();
  for (const h of hits) for (const l of h.labels) set.add(l);
  return Array.from(set);
}

function rejected(
  reason: RejectReason,
  base: Omit<Classification, "status" | "rejectReason" | "confidence">,
): Classification {
  return { ...base, status: "REJECT", rejectReason: reason, confidence: "LOW" };
}

function held(
  status: "HOLD_REVIEW" | "VISA_SIGNAL_ONLY",
  base: Omit<Classification, "status" | "confidence">,
  confidence: Confidence,
): Classification {
  return { ...base, status, confidence };
}

export function classify(cleaned: CleanedJob, phraseHits: PhraseHit[]): Classification {
  const raw = cleaned.raw;
  const text = cleaned.cleanedText;
  const notes: string[] = [];

  const physician = isPhysician(raw.title);

  const affirmativeHits = phraseHits.filter((h) => h.polarity === "AFFIRMATIVE");
  const deniedHits = phraseHits.filter((h) => h.polarity === "DENIED");
  const standaloneDenials = findStandaloneDenials(text);

  const hasAffirmative = affirmativeHits.length > 0;
  const hasDenied = deniedHits.length > 0 || standaloneDenials.length > 0;

  const visaLabels = uniqueLabels(affirmativeHits);
  const quotes: Quote[] = affirmativeHits.map((h) => ({
    text: h.matchedText,
    start: h.start,
    end: h.end,
  }));

  const base = {
    visaLabels,
    quotes,
    isPhysician: physician,
    hasAffirmative,
    hasDenied,
    notes,
  };

  if (!physician) return rejected("NOT_PHYSICIAN", base);
  if (isRecruiterHidden(raw)) return rejected("RECRUITER_ONLY", base);

  if (hasAffirmative && hasDenied) {
    notes.push("Affirmative and denied visa language both present — contradiction.");
    return held("HOLD_REVIEW", base, "MEDIUM");
  }

  if (hasAffirmative && !hasDenied) {
    if (isStale(raw)) return rejected("STALE", base);
    const tierOne = raw.sourceTier === 1;
    const employerResolved = isEmployerResolved(raw);
    if (tierOne && employerResolved) {
      return { ...base, status: "PUBLISH", confidence: "HIGH" };
    }
    if (employerResolved) {
      notes.push("Real visa signal but source is not Tier 1 — surfaced as signal, not published.");
      return held("VISA_SIGNAL_ONLY", base, "MEDIUM");
    }
    notes.push("Visa signal present but employer is unresolved — needs human review.");
    return held("HOLD_REVIEW", base, "MEDIUM");
  }

  if (hasDenied && !hasAffirmative) return rejected("SPONSORSHIP_DENIED", base);

  return rejected("NO_VISA_MENTION", base);
}
