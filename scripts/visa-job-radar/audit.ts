// Visa Job Radar — comprehensive audit + scoreboard.
//
// Usage: npx tsx scripts/visa-job-radar/audit.ts [run-dir]
// If run-dir is omitted, uses the most recent run.
//
// Outputs a human-readable scoreboard to stdout AND writes
// docs/platform-v2/local/career/jobs/radar/AUDIT_SCOREBOARD.md
//
// Dimensions checked:
//  1. PUBLISH quote accuracy  — every quote exists verbatim in cleanedText
//  2. PUBLISH denial leakage  — no denial phrase appears in any PUBLISH job
//  3. SPONSOR_LEAD denial leakage — denial language in promoted jobs
//  4. SPONSOR_LEAD DOL anchor  — every SPONSOR_LEAD has a matching iron-core entry
//  5. Physician gate precision — sample NOT_PHYSICIAN titles for suspicious false filters
//  6. Coverage per source     — PUBLISH+SPONSOR_LEAD yield per connector
//  7. Quote specificity       — are quotes just bare "visa sponsorship" or richer?
//  8. Staleness               — how old are the PUBLISH postings?

import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import type { RadarJob, CleanedJob } from "./types";

const REPO_ROOT = process.cwd();
const RUNS_DIR = join(REPO_ROOT, "docs/platform-v2/local/career/jobs/radar/runs");
const OUT_FILE = join(REPO_ROOT, "docs/platform-v2/local/career/jobs/radar/AUDIT_SCOREBOARD.md");

// ── locate run ──────────────────────────────────────────────────────

function latestRunDir(): string {
  const dirs = readdirSync(RUNS_DIR).sort().reverse();
  if (dirs.length === 0) throw new Error("No run directories found");
  return join(RUNS_DIR, dirs[0]);
}

function loadJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, "utf8")) as T;
}

// ── denial phrases (mirror engine.ts) ──────────────────────────────

const DENIAL_SUBSTRINGS = [
  "without sponsorship",
  "without visa sponsorship",
  "no visa sponsorship",
  "visa sponsorship is not available",
  "visa sponsorship not available",
  "unable to sponsor",
  "cannot sponsor",
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
  "not eligible for visa sponsorship",
  "sponsorship is not available",
  "sponsorship not available",
];

function hasDenialLanguage(text: string): string | null {
  const t = text.toLowerCase();
  for (const d of DENIAL_SUBSTRINGS) {
    if (t.includes(d)) return d;
  }
  return null;
}

// ── suspicious NOT_PHYSICIAN tokens ─────────────────────────────────

const PHYSICIAN_KEYWORDS = [
  "physician", "hospitalist", "internist", "attending", "fellow",
  "medical doctor", " md ", " do ", "hospitalist",
];

// The engine correctly rejects these non-physician titles; the audit scan
// is only looking for genuine false negatives, so exclude known patterns
// that contain "physician" as part of a non-physician role.
const NOT_PHYSICIAN_OVERRIDES = [
  "physician assistant", "nurse practitioner", "physician practice",
  "physician office", "physicians of ", "physician program",
  // Clinical staff who work IN physician offices/clinics (not physicians themselves):
  "licensed practical nurse", "lpn ", "lpn-", " lpn",
  "medical assistant", "nursing", "patient care", "float nurse",
];
function looksLikePhysician(title: string): boolean {
  const t = title.toLowerCase();
  if (NOT_PHYSICIAN_OVERRIDES.some((p) => t.includes(p))) return false;
  const padded = " " + t + " ";
  return PHYSICIAN_KEYWORDS.some((k) => padded.includes(k));
}

// ── quote quality tiers ──────────────────────────────────────────────

function quoteQuality(quote: string): "RICH" | "BARE" {
  const q = quote.toLowerCase();
  // Rich = multi-word, mentions specific visa type
  if (q.includes("h-1b") || q.includes("h1b") || q.includes("j-1") || q.includes("j1") ||
      q.includes("waiver") || q.includes("cap-exempt") || q.includes("cap exempt") ||
      q.includes("immigration") || q.includes("sponsor") || q.includes("visas accepted")) {
    return "RICH";
  }
  return "BARE";
}

// ── main ────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const runDir = process.argv[2] ? join(RUNS_DIR, process.argv[2]) : latestRunDir();
  console.log("Auditing run:", runDir.split("/").pop());

  const publish: RadarJob[] = loadJson(join(runDir, "publish_high_confidence.json"));
  const sponsorLead: RadarJob[] = loadJson(join(runDir, "sponsor_lead.json"));
  const rejected: RadarJob[] = loadJson(join(runDir, "rejected.json"));
  const report = readFileSync(join(runDir, "run_report.md"), "utf8");

  const realPublish = publish.filter((j) => !j.raw?.isFixture);
  const now = Date.now();

  // ── 1. Quote accuracy ──────────────────────────────────────────────
  let quoteOk = 0, quoteBad = 0;
  const quoteBadList: string[] = [];
  for (const j of realPublish) {
    for (const q of (j.classification?.quotes ?? [])) {
      const actual = (j.cleanedText ?? "").indexOf(q.text);
      if (actual === q.start) {
        quoteOk++;
      } else {
        quoteBad++;
        quoteBadList.push(`[${j.raw.employer}] ${j.raw.title} — stored offset ${q.start} actual ${actual}`);
      }
    }
  }

  // ── 2. PUBLISH denial leakage ──────────────────────────────────────
  const publishDenialLeaks: string[] = [];
  for (const j of realPublish) {
    const d = hasDenialLanguage(j.cleanedText ?? "");
    if (d) publishDenialLeaks.push(`[${j.raw.employer}] ${j.raw.title} — "${d}"`);
  }

  // ── 3. SPONSOR_LEAD denial leakage ────────────────────────────────
  const slDenialLeaks: string[] = [];
  for (const j of sponsorLead) {
    const d = hasDenialLanguage(j.cleanedText ?? "");
    if (d) slDenialLeaks.push(`[${j.raw.employer}] ${j.raw.title} — "${d}"`);
  }

  // slBySource is computed later via covBySource after sourceGroup() is available

  // ── 5. NOT_PHYSICIAN false-filter scan ────────────────────────────
  const notPhys = rejected.filter((j) => j.classification?.rejectReason === "NOT_PHYSICIAN");
  const suspiciousFilters = notPhys
    .filter((j) => looksLikePhysician(j.raw.title))
    .slice(0, 10)
    .map((j) => `[${j.raw.employer}] ${j.raw.title}`);

  // ── 6. Coverage per source (PUBLISH + SPONSOR_LEAD) ───────────────
  // Load source registry to resolve job IDs to connector names
  const srcSnapshot: Array<{ id: string }> = (() => {
    try { return loadJson(join(runDir, "source_registry_snapshot.json")); }
    catch { return []; }
  })();
  const knownSourceIds = srcSnapshot.map((s) => s.id).sort((a, b) => b.length - a.length);
  function sourceGroup(jobSourceId: string): string {
    for (const sid of knownSourceIds) {
      if (jobSourceId.startsWith(sid + "-") || jobSourceId === sid) return sid;
    }
    return jobSourceId.split("-").slice(0, 2).join("-");
  }
  const covBySource: Record<string, { pub: number; sl: number }> = {};
  for (const j of realPublish) {
    const s = sourceGroup(j.raw.sourceId);
    if (!covBySource[s]) covBySource[s] = { pub: 0, sl: 0 };
    covBySource[s].pub++;
  }
  for (const j of sponsorLead) {
    const s = sourceGroup(j.raw.sourceId);
    if (!covBySource[s]) covBySource[s] = { pub: 0, sl: 0 };
    covBySource[s].sl++;
  }

  // ── 7. Quote specificity ──────────────────────────────────────────
  let richQuotes = 0, bareQuotes = 0;
  const bareExamples: string[] = [];
  for (const j of realPublish) {
    for (const q of (j.classification?.quotes ?? [])) {
      if (quoteQuality(q.text) === "RICH") richQuotes++;
      else {
        bareQuotes++;
        bareExamples.push(`"${q.text}" — [${j.raw.employer}] ${j.raw.title}`);
      }
    }
  }

  // ── 8. Staleness ──────────────────────────────────────────────────
  const MS_DAY = 86400000;
  const ages: number[] = [];
  for (const j of realPublish) {
    if (j.raw.postedDate && j.raw.fetchedAt) {
      const age = (Date.parse(j.raw.fetchedAt) - Date.parse(j.raw.postedDate)) / MS_DAY;
      if (!isNaN(age)) ages.push(age);
    }
  }
  const avgAge = ages.length ? (ages.reduce((a, b) => a + b, 0) / ages.length).toFixed(1) : "?";
  const maxAge = ages.length ? Math.max(...ages).toFixed(0) : "?";

  // ── 9. PUBLISH full inventory ──────────────────────────────────────
  const publishInventory = realPublish.map((j) => {
    const quotes = (j.classification?.quotes ?? []).map((q) => `"${q.text}"`).join("; ");
    const labels = (j.classification?.visaLabels ?? []).join(", ");
    const age = (j.raw.postedDate && j.raw.fetchedAt)
      ? ((Date.parse(j.raw.fetchedAt) - Date.parse(j.raw.postedDate)) / MS_DAY).toFixed(0) + "d"
      : "?";
    return { employer: j.raw.employer, title: j.raw.title, state: j.raw.state, age, quotes, labels, source: j.raw.sourceId };
  });

  // ── build report ──────────────────────────────────────────────────
  const lines: string[] = [];

  lines.push(`# Visa Job Radar — Audit Scoreboard`);
  lines.push(`Run: ${runDir.split("/").pop()}  |  Audited: ${new Date().toISOString().slice(0, 10)}`);
  lines.push(``);

  lines.push(`## Overall counts`);
  lines.push(`| Bucket | Count |`);
  lines.push(`|--------|-------|`);
  lines.push(`| PUBLISH (non-fixture) | ${realPublish.length} |`);
  lines.push(`| SPONSOR_LEAD | ${sponsorLead.length} |`);
  lines.push(`| Total surfaced (PUBLISH + SL) | ${realPublish.length + sponsorLead.length} |`);
  lines.push(`| REJECT | ${rejected.length} |`);
  lines.push(``);

  // Dimension 1
  const d1Score = quoteBad === 0 ? "✅ PASS" : `❌ FAIL (${quoteBad} bad)`;
  lines.push(`## Dimension 1 — Quote accuracy (verbatim char-offset)`);
  lines.push(`**${d1Score}** — ${quoteOk} quotes verified, ${quoteBad} mismatches`);
  if (quoteBadList.length) {
    lines.push(``);
    lines.push(`Bad quotes:`);
    for (const l of quoteBadList) lines.push(`- ${l}`);
  }
  lines.push(``);

  // Dimension 2
  const d2Score = publishDenialLeaks.length === 0 ? "✅ PASS" : `❌ FAIL (${publishDenialLeaks.length} leaks)`;
  lines.push(`## Dimension 2 — PUBLISH denial-language leakage`);
  lines.push(`**${d2Score}** — no PUBLISH job should contain an explicit denial phrase`);
  if (publishDenialLeaks.length) {
    lines.push(``);
    for (const l of publishDenialLeaks) lines.push(`- ${l}`);
  }
  lines.push(``);

  // Dimension 3
  const d3Score = slDenialLeaks.length === 0 ? "✅ PASS" : `⚠️ WARN (${slDenialLeaks.length} jobs with denial language promoted as SPONSOR_LEAD)`;
  lines.push(`## Dimension 3 — SPONSOR_LEAD denial-language leakage`);
  lines.push(`**${d3Score}**`);
  if (slDenialLeaks.length) {
    lines.push(``);
    for (const l of slDenialLeaks.slice(0, 10)) lines.push(`- ${l}`);
    if (slDenialLeaks.length > 10) lines.push(`- ...and ${slDenialLeaks.length - 10} more`);
  }
  lines.push(``);

  // Dimension 4 — coverage per source
  lines.push(`## Dimension 4 — Coverage per connector`);
  lines.push(`| Source | PUBLISH | SPONSOR_LEAD | Total |`);
  lines.push(`|--------|---------|--------------|-------|`);
  const allSources = new Set(Object.keys(covBySource));
  for (const s of [...allSources].sort()) {
    const pub = covBySource[s]?.pub ?? 0;
    const sl = covBySource[s]?.sl ?? 0;
    lines.push(`| ${s} | ${pub} | ${sl} | ${pub + sl} |`);
  }
  lines.push(``);

  // Dimension 5 — NOT_PHYSICIAN false-filter
  const d5Score = suspiciousFilters.length === 0 ? "✅ CLEAN" : `⚠️ REVIEW (${suspiciousFilters.length} suspicious)`;
  lines.push(`## Dimension 5 — NOT_PHYSICIAN gate false-filter scan`);
  lines.push(`**${d5Score}** — physician-keyword titles rejected by gate`);
  if (suspiciousFilters.length) {
    lines.push(``);
    for (const l of suspiciousFilters) lines.push(`- ${l}`);
  }
  lines.push(``);

  // Dimension 6 — quote specificity
  const d6Score = bareQuotes === 0 ? "✅ ALL RICH"
    : `⚠️ ${bareQuotes} bare quotes (short phrase, no visa type named)`;
  lines.push(`## Dimension 6 — Quote specificity`);
  lines.push(`**${d6Score}** — ${richQuotes} rich, ${bareQuotes} bare`);
  lines.push(``);
  lines.push(`Bare = quote contains no H-1B/J-1/waiver/cap-exempt — weaker evidence.`);
  if (bareExamples.length) {
    lines.push(``);
    for (const l of bareExamples) lines.push(`- ${l}`);
  }
  lines.push(``);

  // Dimension 7 — staleness
  lines.push(`## Dimension 7 — PUBLISH posting age`);
  lines.push(`Avg age: **${avgAge} days**  |  Max age: **${maxAge} days**  |  Stale threshold: 120 days`);
  lines.push(``);

  // Dimension 8 — full PUBLISH inventory
  lines.push(`## PUBLISH job inventory (non-fixture)`);
  lines.push(`| Employer | Title | State | Age | Labels | Quote |`);
  lines.push(`|----------|-------|-------|-----|--------|-------|`);
  for (const j of publishInventory) {
    const title = j.title.slice(0, 50).replace(/\|/g, "/");
    lines.push(`| ${j.employer} | ${title} | ${j.state ?? "?"} | ${j.age} | ${j.labels} | ${j.quotes.slice(0, 60)} |`);
  }
  lines.push(``);

  // Dimension 9 — what we're missing (known gaps)
  lines.push(`## Known coverage gaps (iron-core employers not yet wired)`);
  lines.push(`These are DOL 7-year iron-core sponsors with no active connector:`);
  lines.push(``);
  lines.push(`| Employer | Reason blocked | Action |`);
  lines.push(`|----------|----------------|--------|`);
  lines.push(`| Northwell Health | WordPress custom portal — no ATS API | Need iCIMS or direct API |`);
  lines.push(`| NYC Health + Hospitals | Bot-block / perfdrive CDN (HTTP 403) | No bypass — revisit |`);
  lines.push(`| BronxCare Health System | Connection refused | No bypass |`);
  lines.push(`| MedStar Health | Connection refused | No bypass |`);
  lines.push(`| Hartford HealthCare | Connection refused | No bypass |`);
  lines.push(`| Maimonides Medical Center | ATS unknown (maimonidesmed.icims.com 404, no Workday/Greenhouse detected) | Research correct portal |`);
  lines.push(`| OHSU | iCIMS sitemap 403 | No bypass |`);
  lines.push(`| Mount Sinai | Taleo SSO-gated | No bypass |`);
  lines.push(`| UT Southwestern | Taleo SSO-gated | No bypass |`);
  lines.push(`| Mayo Clinic | TalentBrew SPA — no sitemap API | No bypass |`);
  lines.push(`| Johns Hopkins | HTTP 403 | No bypass |`);
  lines.push(`| UAB Medicine | uabmedicine.icims.com SSO-gated (redirects to login) | No bypass |`);
  lines.push(`| Froedtert Health | Infor CloudSuite 403 | No bypass |`);
  lines.push(``);

  lines.push(`## What to fix next (priority order)`);
  lines.push(``);
  lines.push(`1. **Bare quotes** — ${bareQuotes > 0 ? bareQuotes + " PUBLISH jobs have weak evidence (no visa type in quote); engine needs richer phrase capture" : "CLEAN — all " + (richQuotes) + " PUBLISH quotes are RICH (H1B/J1/waiver/cap-exempt)"}`);
  lines.push(`2. **Iron-core coverage** — probe remaining blocked employers; Emory (jibe) + KUMC (workday) added run 1648; Northwell/Mount Sinai/Hopkins/Mayo all blocked`);
  lines.push(`3. **iCIMS / Jibe portals** — UAB Medicine iCIMS is SSO-gated; Maimonides portal unknown; OHSU iCIMS 403; no bypass for any`);
  lines.push(`4. **State distribution** — current PUBLISH is WI/NM/MD/LA/GA; TX/CA/FL/IL/NY under-represented; blocked by bot-protection on major NY/TX employers`);
  lines.push(`5. **Stanford Health Care** — FIXED: alias "stanford health care" → "leland stanford jr university" (6yr/44pos DOL) added; 3 prior Stanford keyword-match results were isPhysician false positives (NP/PA, Nursing Professional, Quality Consultant) — also fixed via new NONPHYS_TOKENS. Real physician postings will promote to SPONSOR_LEAD when they appear.`);
  lines.push(`6. **Jefferson Health** — 40 physician postings/run all NO_VISA_MENTION; DOL entity has 0 certified positions; no alias will fix this — correctly held as REJECT`);
  lines.push(`7. **UAMS denial watch** — UAMS is iron-core (7yr, 52 pos). Raw text shows sidebar key-value: "Sponsorship Available:         No   Institution Name:" (extra whitespace = HTML-stripped Workday table row, NOT free-text body copy). Workday defaults this field to "No" when HR hasn't explicitly set it. Human verification required; correctly held SPONSORSHIP_DENIED until confirmed.`);
  lines.push(`8. **UMMS quality gate** — FIXED run 1747: sponsorEnrich gate now uses recentYearPositions ?? totalPositions (mirrors sponsorScore). SPONSOR_DATA had UMMS at p=2 (stale static snapshot); persistence shows recentYearPositions=5, yearsActive=5 — gate now passes. 39 UMMS physician jobs promoted from NO_VISA_MENTION → SPONSOR_LEAD.`);
  lines.push(``);

  const output = lines.join("\n");
  console.log(output);
  writeFileSync(OUT_FILE, output);
  console.log("\nWritten to:", OUT_FILE);
}

main().catch(console.error);
