/**
 * P97 — national county-by-county USCE discovery system.
 *
 * Local-only, append-only, resumable. Manages CSV ledgers for the
 * national discovery process. Does NOT mutate the database, does NOT
 * import listings, does NOT crawl — it provides the ledger
 * infrastructure that human-driven WebSearch / WebFetch passes
 * write into.
 *
 * CLI:
 *   npx tsx scripts/p97-national-discovery.ts --init-ledgers
 *   npx tsx scripts/p97-national-discovery.ts --status
 *   npx tsx scripts/p97-national-discovery.ts --state ME
 *   npx tsx scripts/p97-national-discovery.ts --state ME --county "Cumberland"
 *   npx tsx scripts/p97-national-discovery.ts --resume
 *
 * The script never opens browsers and never fetches the web by
 * itself. The discovery passes are run by the assistant via
 * WebSearch / WebFetch and written to the ledger CSVs through
 * helper functions in this file (see appendCandidate, etc.).
 */

import { readFile, writeFile, mkdir, access } from "node:fs/promises";
import * as path from "node:path";

const DOCS_DIR = "docs/platform-v2/local";
const LEDGER_PATHS = {
  stateCounty: `${DOCS_DIR}/p97_state_county_progress.csv`,
  institution: `${DOCS_DIR}/p97_institution_search_progress.csv`,
  candidate: `${DOCS_DIR}/p97_candidate_opportunities.csv`,
  rejected: `${DOCS_DIR}/p97_rejected_or_non_target_candidates.csv`,
  duplicate: `${DOCS_DIR}/p97_duplicate_candidates.csv`,
  notFound: `${DOCS_DIR}/p97_not_found_after_search.csv`,
  blocked: `${DOCS_DIR}/p97_blocked_or_login_required.csv`,
};

const HEADERS = {
  stateCounty:
    "state,stateFips,county,countyFips,countyStatus,startedAt,completedAt,institutionsIdentified,institutionsSearched,candidatesFound,acceptedCandidates,manualReviewCandidates,rejectedCandidates,duplicateCandidates,notFoundCount,notes",
  institution:
    "state,county,institutionName,institutionType,officialWebsite,healthSystem,medicalSchoolAffiliation,teachingHospitalLikely,vaAffiliated,searchedAt,searchStatus,searchTermsTried,officialPagesOpened,candidateCount,notFoundReason,notes",
  candidate:
    "candidateId,state,county,institutionName,healthSystem,opportunityTitle,opportunityType,specialty,officialSourceUrl,applicationUrl,sourcePageType,targetFit,targetFitReason,eligibility,imgEligibility,studentGraduateEligibility,visaLanguage,cost,duration,deadline,contactEmail,coordinatorNameIfPublic,evidenceSnippet,evidenceUrl,searchTermsThatFoundIt,duplicateCheckResult,existingListingMatch,confidence,candidateStatus,reviewerNotes,foundAt",
  rejected:
    "state,county,institutionName,rejectedUrl,title,targetFit,rejectionReason,evidenceSnippet,searchTermsThatFoundIt,canReconsiderLater,futureLaneCandidate,notes",
  duplicate:
    "state,county,institutionName,candidateUrl,existingListingIdOrSlug,existingListingTitle,duplicateConfidence,differenceNotes,recommendedAction",
  notFound:
    "state,county,institutionName,officialWebsite,institutionType,searchTermsTried,pagesOpened,reasonNotFound,searchedAt,notes",
  blocked:
    "state,county,institutionName,url,blockerType,searchTerm,recommendedNextStep,notes",
};

// 50-state seed. Counties are populated for the pilot states; other
// states currently store a single placeholder county (the state name)
// so the ledger row exists for resume planning. As we move to a new
// state, that state's placeholder is replaced with its real county
// list (the build-then-discover approach: we don't pre-populate every
// county nationwide on day one because county lists shift over time).
type StateSeed = { state: string; stateFips: string; counties: string[] };

const PILOT_MAINE_COUNTIES = [
  "Androscoggin",
  "Aroostook",
  "Cumberland",
  "Franklin",
  "Hancock",
  "Kennebec",
  "Knox",
  "Lincoln",
  "Oxford",
  "Penobscot",
  "Piscataquis",
  "Sagadahoc",
  "Somerset",
  "Waldo",
  "Washington",
  "York",
];

// State FIPS codes (2-digit) — used for stable joins in the ledger.
const STATES: StateSeed[] = [
  { state: "ME", stateFips: "23", counties: PILOT_MAINE_COUNTIES },
  { state: "NH", stateFips: "33", counties: ["__seed__"] },
  { state: "VT", stateFips: "50", counties: ["__seed__"] },
  { state: "MA", stateFips: "25", counties: ["__seed__"] },
  { state: "RI", stateFips: "44", counties: ["__seed__"] },
  { state: "CT", stateFips: "09", counties: ["__seed__"] },
  { state: "NY", stateFips: "36", counties: ["__seed__"] },
  { state: "NJ", stateFips: "34", counties: ["__seed__"] },
  { state: "PA", stateFips: "42", counties: ["__seed__"] },
  { state: "DE", stateFips: "10", counties: ["__seed__"] },
  { state: "MD", stateFips: "24", counties: ["__seed__"] },
  { state: "DC", stateFips: "11", counties: ["__seed__"] },
  { state: "VA", stateFips: "51", counties: ["__seed__"] },
  { state: "WV", stateFips: "54", counties: ["__seed__"] },
  { state: "NC", stateFips: "37", counties: ["__seed__"] },
  { state: "SC", stateFips: "45", counties: ["__seed__"] },
  { state: "GA", stateFips: "13", counties: ["__seed__"] },
  { state: "FL", stateFips: "12", counties: ["__seed__"] },
  { state: "AL", stateFips: "01", counties: ["__seed__"] },
  { state: "MS", stateFips: "28", counties: ["__seed__"] },
  { state: "TN", stateFips: "47", counties: ["__seed__"] },
  { state: "KY", stateFips: "21", counties: ["__seed__"] },
  { state: "OH", stateFips: "39", counties: ["__seed__"] },
  { state: "IN", stateFips: "18", counties: ["__seed__"] },
  { state: "IL", stateFips: "17", counties: ["__seed__"] },
  { state: "MI", stateFips: "26", counties: ["__seed__"] },
  { state: "WI", stateFips: "55", counties: ["__seed__"] },
  { state: "MN", stateFips: "27", counties: ["__seed__"] },
  { state: "IA", stateFips: "19", counties: ["__seed__"] },
  { state: "MO", stateFips: "29", counties: ["__seed__"] },
  { state: "AR", stateFips: "05", counties: ["__seed__"] },
  { state: "LA", stateFips: "22", counties: ["__seed__"] },
  { state: "TX", stateFips: "48", counties: ["__seed__"] },
  { state: "OK", stateFips: "40", counties: ["__seed__"] },
  { state: "KS", stateFips: "20", counties: ["__seed__"] },
  { state: "NE", stateFips: "31", counties: ["__seed__"] },
  { state: "SD", stateFips: "46", counties: ["__seed__"] },
  { state: "ND", stateFips: "38", counties: ["__seed__"] },
  { state: "MT", stateFips: "30", counties: ["__seed__"] },
  { state: "WY", stateFips: "56", counties: ["__seed__"] },
  { state: "CO", stateFips: "08", counties: ["__seed__"] },
  { state: "NM", stateFips: "35", counties: ["__seed__"] },
  { state: "AZ", stateFips: "04", counties: ["__seed__"] },
  { state: "UT", stateFips: "49", counties: ["__seed__"] },
  { state: "NV", stateFips: "32", counties: ["__seed__"] },
  { state: "ID", stateFips: "16", counties: ["__seed__"] },
  { state: "WA", stateFips: "53", counties: ["__seed__"] },
  { state: "OR", stateFips: "41", counties: ["__seed__"] },
  { state: "CA", stateFips: "06", counties: ["__seed__"] },
  { state: "AK", stateFips: "02", counties: ["__seed__"] },
  { state: "HI", stateFips: "15", counties: ["__seed__"] },
];

function csvEscape(v: string | number | boolean | null | undefined): string {
  const s = String(v ?? "");
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

async function fileExists(p: string): Promise<boolean> {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

async function ensureHeader(filePath: string, header: string): Promise<void> {
  if (!(await fileExists(filePath))) {
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, header + "\n", "utf8");
  }
}

async function initLedgers(): Promise<void> {
  for (const [k, p] of Object.entries(LEDGER_PATHS)) {
    await ensureHeader(p, HEADERS[k as keyof typeof HEADERS]);
  }
  // Seed state/county progress.
  const existing = (await readFile(LEDGER_PATHS.stateCounty, "utf8"))
    .split(/\r?\n/)
    .filter((l) => l.trim());
  const seen = new Set(
    existing
      .slice(1)
      .map((l) => {
        const cells = splitCsvLine(l);
        return `${cells[0]}|${cells[2]}`;
      }),
  );
  const rowsToAppend: string[] = [];
  for (const s of STATES) {
    for (const c of s.counties) {
      const key = `${s.state}|${c}`;
      if (seen.has(key)) continue;
      rowsToAppend.push(
        [
          s.state,
          s.stateFips,
          c,
          "", // countyFips left blank for seed; populate per state
          "NOT_STARTED",
          "",
          "",
          "0",
          "0",
          "0",
          "0",
          "0",
          "0",
          "0",
          "0",
          c === "__seed__"
            ? "Placeholder. Replace with real county list when this state is activated."
            : "",
        ]
          .map(csvEscape)
          .join(","),
      );
    }
  }
  if (rowsToAppend.length > 0) {
    await writeFile(
      LEDGER_PATHS.stateCounty,
      existing.join("\n") + "\n" + rowsToAppend.join("\n") + "\n",
      "utf8",
    );
  }
  console.log(`Initialized ledgers. Added ${rowsToAppend.length} new state/county rows.`);
}

function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let q = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (q && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else q = !q;
    } else if (c === "," && !q) {
      out.push(cur);
      cur = "";
    } else cur += c;
  }
  out.push(cur);
  return out;
}

async function status(): Promise<void> {
  for (const [k, p] of Object.entries(LEDGER_PATHS)) {
    const exists = await fileExists(p);
    if (!exists) {
      console.log(`  ${k.padEnd(13)}  (missing)`);
      continue;
    }
    const lines = (await readFile(p, "utf8")).split(/\r?\n/).filter((l) => l.trim());
    console.log(`  ${k.padEnd(13)}  ${lines.length - 1} rows`);
  }
  // Per-state county-status summary.
  if (await fileExists(LEDGER_PATHS.stateCounty)) {
    const text = await readFile(LEDGER_PATHS.stateCounty, "utf8");
    const lines = text.split(/\r?\n/).filter((l) => l.trim()).slice(1);
    const byState: Record<string, Record<string, number>> = {};
    for (const l of lines) {
      const cells = splitCsvLine(l);
      const st = cells[0];
      const status = cells[4];
      byState[st] = byState[st] ?? {};
      byState[st][status] = (byState[st][status] ?? 0) + 1;
    }
    console.log("\nPer-state county status:");
    for (const [st, counts] of Object.entries(byState)) {
      const summary = Object.entries(counts)
        .map(([k, v]) => `${k}=${v}`)
        .join(", ");
      console.log(`  ${st}  ${summary}`);
    }
  }
}

async function main() {
  const args = process.argv.slice(2);
  const has = (flag: string) => args.includes(flag);

  if (has("--init-ledgers")) {
    await initLedgers();
    return;
  }
  if (has("--status")) {
    await status();
    return;
  }
  // For --state / --county / --resume, this script is a manifest:
  // it tells the operator (or assistant) which county to work on
  // next, given the ledger state. It does not perform the
  // discovery itself — the assistant runs WebSearch + WebFetch
  // and writes evidence rows back via append helpers.
  await initLedgers();
  await status();
  console.log(
    "\nThe script does not perform discovery automatically. Use the assistant to:\n  1) read p97_state_county_progress.csv\n  2) pick the next NOT_STARTED / IN_PROGRESS / PARTIAL county\n  3) identify institutions for that county\n  4) run WebSearch + WebFetch passes per institution\n  5) append rows to the candidate / rejected / duplicate / not-found / blocked ledgers\n  6) update the state/county progress row at the end\n",
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
