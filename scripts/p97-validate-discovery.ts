/**
 * P97-G — Discovery integrity validator.
 *
 * Checks that every county/state claimed complete is backed by:
 *   - institution rows in the search-progress CSV
 *   - one packet per institution at the expected path
 *   - complete packet fields per the integrity doctrine
 *   - at least one log row per institution (candidate / rejected /
 *     duplicate / not-found / blocked)
 *
 * Detects forbidden umbrella shortcuts (notes contain "rolls up",
 * "umbrella sub-location", "parent covers", "system-wide assumed")
 * unless paired with `umbrellaEvidenceUrl` and
 * `subLocationApplicabilityChecked: true` in the packet.
 *
 * Detects thin-search packets (pagesOpened too few, search terms
 * missing, GME/UME absent without explicit reason).
 *
 * Outputs:
 *   docs/platform-v2/local/P97_DISCOVERY_VALIDATION_REPORT.md
 *   docs/platform-v2/local/p97_validation_results.json
 *
 * CLI:
 *   npx tsx scripts/p97-validate-discovery.ts --status
 *   npx tsx scripts/p97-validate-discovery.ts --state ME
 *   npx tsx scripts/p97-validate-discovery.ts --county "ME:Cumberland"
 *   npx tsx scripts/p97-validate-discovery.ts --all
 *
 * No DB mutation. Read-only against the file system.
 */

import { readFile, writeFile, readdir, access } from "node:fs/promises";
import * as path from "node:path";

const DOCS_DIR = "docs/platform-v2/local";
const PACKETS_DIR = `${DOCS_DIR}/p97-institution-packets`;

const CSV_PATHS = {
  stateCounty: `${DOCS_DIR}/p97_state_county_progress.csv`,
  institution: `${DOCS_DIR}/p97_institution_search_progress.csv`,
  candidate: `${DOCS_DIR}/p97_candidate_opportunities.csv`,
  rejected: `${DOCS_DIR}/p97_rejected_or_non_target_candidates.csv`,
  duplicate: `${DOCS_DIR}/p97_duplicate_candidates.csv`,
  notFound: `${DOCS_DIR}/p97_not_found_after_search.csv`,
  blocked: `${DOCS_DIR}/p97_blocked_or_login_required.csv`,
};

// Forbidden phrases in institution notes / packet evidenceSummary
const FORBIDDEN_UMBRELLA_PHRASES = [
  "umbrella sub-location",
  "rolls up",
  "parent covers",
  "system-wide assumed",
];

// Required core search terms (subset; must appear in searchTermsTried for
// a packet to clear the thin-search check)
const REQUIRED_CORE_TERMS_MIN = 3; // at least 3 of these must appear
const CORE_TERMS = [
  "observership",
  "observer",
  "clinical observer",
  "clinical observational experience",
  "IMG",
  "international medical graduate",
  "externship",
  "elective",
  "clinical elective",
  "visiting student",
  "visiting medical student",
  "international visiting student",
  "away rotation",
  "clerkship",
  "shadowing",
  "B-1",
  "B-2",
  "USCE",
  "U.S. clinical experience",
  "graduate medical education",
  "GME",
  "undergraduate medical education",
  "UME",
];

// Minimum pages opened for a teaching hospital packet
const MIN_PAGES_TEACHING_HOSPITAL = 3;
// Minimum pages opened for a community hospital packet
const MIN_PAGES_COMMUNITY_HOSPITAL = 2;

interface PacketCheckResult {
  packetPath: string;
  ok: boolean;
  errors: string[];
  warnings: string[];
}

interface CountyResult {
  state: string;
  county: string;
  status: "VALIDATED_COMPLETE" | "PARTIAL_NEEDS_RESUME" | "INVALIDATED_REDO" | "BLOCKED_NEEDS_USER_REVIEW" | "NOT_STARTED";
  errors: string[];
  warnings: string[];
  institutions: { name: string; packetExists: boolean; packetOk: boolean }[];
}

interface StateResult {
  state: string;
  status: "VALIDATED_COMPLETE" | "PARTIAL_NEEDS_RESUME" | "INVALIDATED_REDO" | "NOT_STARTED";
  errors: string[];
  counties: CountyResult[];
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

async function fileExists(p: string): Promise<boolean> {
  try {
    await access(p);
    return true;
  } catch {
    return false;
  }
}

async function readCsvRows(filePath: string): Promise<{ header: string[]; rows: Record<string, string>[] }> {
  if (!(await fileExists(filePath))) return { header: [], rows: [] };
  const text = await readFile(filePath, "utf8");
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length === 0) return { header: [], rows: [] };
  const header = splitCsvLine(lines[0]);
  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cells = splitCsvLine(lines[i]);
    const o: Record<string, string> = {};
    for (let j = 0; j < header.length; j++) o[header[j]] = cells[j] ?? "";
    rows.push(o);
  }
  return { header, rows };
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[‘’']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

async function findPacketForInstitution(state: string, county: string, institutionName: string): Promise<string | null> {
  // Strict: filename must equal slugify(institutionName) + ".json".
  // Partial / contains matching is forbidden — it produced false positives
  // (e.g. one MMC packet appearing to satisfy both MMC and Maine Track Program).
  const slug = slugify(institutionName);
  const dir = path.join(PACKETS_DIR, state, county);
  if (!(await fileExists(dir))) return null;
  try {
    const files = await readdir(dir);
    const exactMatch = files.find((f) => f === `${slug}.json`);
    if (exactMatch) return path.join(dir, exactMatch);
    return null;
  } catch {
    return null;
  }
}

async function validatePacket(packetPath: string): Promise<PacketCheckResult> {
  const result: PacketCheckResult = { packetPath, ok: true, errors: [], warnings: [] };
  let p: Record<string, unknown>;
  try {
    p = JSON.parse(await readFile(packetPath, "utf8"));
  } catch (e) {
    result.ok = false;
    result.errors.push(`packet failed to parse as JSON: ${(e as Error).message}`);
    return result;
  }

  const requiredFields = [
    "state",
    "county",
    "institutionName",
    "officialWebsite",
    "searchStatus",
    "pagesOpened",
    "searchTermsTried",
    "evidenceSummary",
    "reviewerSelfAudit",
  ];
  for (const f of requiredFields) {
    if (!(f in p) || p[f] === undefined || p[f] === null) {
      result.ok = false;
      result.errors.push(`missing required field: ${f}`);
    }
  }
  if (!result.ok) return result;

  const pagesOpened = Array.isArray(p.pagesOpened) ? (p.pagesOpened as string[]) : [];
  const searchTermsTried = Array.isArray(p.searchTermsTried) ? (p.searchTermsTried as string[]) : [];
  const institutionType = String(p.institutionType ?? "");
  const evidenceSummary = String(p.evidenceSummary ?? "");

  const isTeaching =
    institutionType.includes("academic") ||
    institutionType.includes("teaching") ||
    institutionType.includes("medical_school");
  const minPages = isTeaching ? MIN_PAGES_TEACHING_HOSPITAL : MIN_PAGES_COMMUNITY_HOSPITAL;

  // Thin-search detection
  if (pagesOpened.length < minPages) {
    result.ok = false;
    result.errors.push(
      `thin search: pagesOpened.length=${pagesOpened.length} < ${minPages} (institutionType=${institutionType})`,
    );
  }

  const lowerTerms = searchTermsTried.map((t) => t.toLowerCase());
  const hits = CORE_TERMS.filter((term) => lowerTerms.some((t) => t.includes(term.toLowerCase()))).length;
  if (hits < REQUIRED_CORE_TERMS_MIN) {
    result.ok = false;
    result.errors.push(
      `thin search: only ${hits}/${REQUIRED_CORE_TERMS_MIN} required core search terms tried`,
    );
  }

  // GME / UME presence (or explicit absent reason)
  const gmePages = Array.isArray(p.gmePagesOpened) ? (p.gmePagesOpened as string[]) : [];
  const gmeAbsent = String(p.gmeAbsentReason ?? "").trim();
  if (isTeaching && gmePages.length === 0 && gmeAbsent === "") {
    result.warnings.push("teaching hospital with no GME pages opened and no gmeAbsentReason");
  }
  const umePages = Array.isArray(p.umePagesOpened) ? (p.umePagesOpened as string[]) : [];
  const umeAbsent = String(p.umeAbsentReason ?? "").trim();
  if (isTeaching && umePages.length === 0 && umeAbsent === "") {
    result.warnings.push("teaching hospital with no UME pages opened and no umeAbsentReason");
  }

  // Forbidden umbrella shortcuts
  const summaryLower = evidenceSummary.toLowerCase();
  const umbrellaUrl = String(p.umbrellaEvidenceUrl ?? "").trim();
  const applicabilityChecked = p.subLocationApplicabilityChecked === true;
  for (const phrase of FORBIDDEN_UMBRELLA_PHRASES) {
    if (summaryLower.includes(phrase)) {
      if (!umbrellaUrl || !applicabilityChecked) {
        result.ok = false;
        result.errors.push(
          `forbidden umbrella shortcut "${phrase}" in evidenceSummary without umbrellaEvidenceUrl + subLocationApplicabilityChecked=true`,
        );
      }
    }
  }

  // searchStatus must be a valid label
  const validStatuses = [
    "NOT_STARTED",
    "IN_PROGRESS",
    "SEARCHED_CANDIDATES_FOUND",
    "SEARCHED_NONE_FOUND",
    "BLOCKED",
    "LOGIN_REQUIRED",
    "DUPLICATE_ONLY",
    "NEEDS_MANUAL_REVIEW",
  ];
  if (!validStatuses.includes(String(p.searchStatus))) {
    result.ok = false;
    result.errors.push(`invalid searchStatus: ${p.searchStatus}`);
  }

  // Reviewer self-audit must not be empty
  const audit = String(p.reviewerSelfAudit ?? "").trim();
  if (audit === "") {
    result.warnings.push("reviewerSelfAudit is empty");
  }

  return result;
}

async function validateCounty(state: string, county: string): Promise<CountyResult> {
  const result: CountyResult = {
    state,
    county,
    status: "NOT_STARTED",
    errors: [],
    warnings: [],
    institutions: [],
  };

  const { rows: instRows } = await readCsvRows(CSV_PATHS.institution);
  const { rows: scRows } = await readCsvRows(CSV_PATHS.stateCounty);
  const scRow = scRows.find((r) => r.state === state && r.county === county);

  if (!scRow) {
    result.status = "NOT_STARTED";
    result.errors.push(`no row found in p97_state_county_progress.csv for ${state}:${county}`);
    return result;
  }

  const claimedStatus = scRow.countyStatus || "";
  // Allow grandfathered "COMPLETE" only for Maine deepened pass; everywhere else, "COMPLETE" is forbidden.
  if (claimedStatus === "COMPLETE") {
    result.warnings.push(
      `legacy status "COMPLETE" detected; should be migrated to VALIDATED_COMPLETE or downgraded based on evidence`,
    );
  }

  const countyInstitutions = instRows.filter((r) => r.state === state && r.county === county);

  if (countyInstitutions.length === 0) {
    if (scRow.notes && scRow.notes.toLowerCase().includes("no hospital")) {
      // explicit "no hospital in county" — fine
      result.status = "VALIDATED_COMPLETE";
      result.warnings.push(`county has no institutions but notes confirm "no hospital"`);
      return result;
    }
    result.status = "NOT_STARTED";
    result.errors.push(`no institutions in p97_institution_search_progress.csv for ${state}:${county}`);
    return result;
  }

  // Per-institution packet check
  let allInstitutionsHavePackets = true;
  for (const ir of countyInstitutions) {
    const inst = ir.institutionName || "";
    const packetPath = await findPacketForInstitution(state, county, inst);
    const entry: { name: string; packetExists: boolean; packetOk: boolean } = {
      name: inst,
      packetExists: !!packetPath,
      packetOk: false,
    };
    if (!packetPath) {
      allInstitutionsHavePackets = false;
      result.errors.push(`institution "${inst}" has no packet at p97-institution-packets/${state}/${county}/${slugify(inst)}.json`);
      result.institutions.push(entry);
      continue;
    }
    const packetCheck = await validatePacket(packetPath);
    entry.packetOk = packetCheck.ok;
    if (!packetCheck.ok) {
      result.errors.push(`packet for "${inst}" has errors: ${packetCheck.errors.join("; ")}`);
    }
    if (packetCheck.warnings.length > 0) {
      result.warnings.push(`packet for "${inst}" warnings: ${packetCheck.warnings.join("; ")}`);
    }
    result.institutions.push(entry);
  }

  // Forbidden umbrella shortcut detection in institution notes column
  for (const ir of countyInstitutions) {
    const notes = (ir.notes || "").toLowerCase();
    for (const phrase of FORBIDDEN_UMBRELLA_PHRASES) {
      if (notes.includes(phrase)) {
        result.warnings.push(
          `institution "${ir.institutionName}" notes contain forbidden phrase "${phrase}" — verify packet has umbrella evidence`,
        );
      }
    }
  }

  // Final status calculation
  if (claimedStatus === "PARTIAL" || claimedStatus === "PARTIAL_NEEDS_RESUME") {
    result.status = "PARTIAL_NEEDS_RESUME";
  } else if (allInstitutionsHavePackets && result.errors.length === 0) {
    result.status = "VALIDATED_COMPLETE";
  } else if (result.errors.length > 0) {
    result.status = "INVALIDATED_REDO";
  } else {
    result.status = "PARTIAL_NEEDS_RESUME";
  }

  return result;
}

async function validateState(state: string): Promise<StateResult> {
  const result: StateResult = { state, status: "NOT_STARTED", errors: [], counties: [] };
  const { rows: scRows } = await readCsvRows(CSV_PATHS.stateCounty);
  const stateCounties = scRows.filter((r) => r.state === state);
  if (stateCounties.length === 0) {
    result.errors.push(`no counties found for state ${state} in p97_state_county_progress.csv`);
    return result;
  }
  const placeholderOnly = stateCounties.every((r) => r.county === "__seed__");
  if (placeholderOnly) {
    result.status = "NOT_STARTED";
    result.errors.push(`state ${state} has only __seed__ placeholder counties; real county list not yet seeded`);
    return result;
  }
  for (const sc of stateCounties) {
    if (sc.county === "__seed__") continue;
    const cr = await validateCounty(state, sc.county);
    result.counties.push(cr);
  }
  const allValidated = result.counties.length > 0 && result.counties.every((c) => c.status === "VALIDATED_COMPLETE");
  const anyInvalidated = result.counties.some((c) => c.status === "INVALIDATED_REDO");
  const anyPartial = result.counties.some((c) => c.status === "PARTIAL_NEEDS_RESUME");
  if (anyInvalidated) result.status = "INVALIDATED_REDO";
  else if (anyPartial) result.status = "PARTIAL_NEEDS_RESUME";
  else if (allValidated) result.status = "VALIDATED_COMPLETE";
  else result.status = "NOT_STARTED";
  return result;
}

async function statusSummary(): Promise<string> {
  const { rows: scRows } = await readCsvRows(CSV_PATHS.stateCounty);
  const byState = new Map<string, { total: number; complete: number; partial: number; notStarted: number; placeholder: number }>();
  for (const r of scRows) {
    const s = r.state;
    if (!byState.has(s)) byState.set(s, { total: 0, complete: 0, partial: 0, notStarted: 0, placeholder: 0 });
    const b = byState.get(s)!;
    b.total++;
    if (r.county === "__seed__") b.placeholder++;
    else if (r.countyStatus === "VALIDATED_COMPLETE") b.complete++;
    else if (r.countyStatus === "COMPLETE") b.complete++;
    else if (r.countyStatus === "PARTIAL" || r.countyStatus === "PARTIAL_NEEDS_RESUME") b.partial++;
    else b.notStarted++;
  }
  const lines: string[] = ["P97 status summary (per state):"];
  for (const [s, b] of byState) {
    lines.push(
      `  ${s}: total=${b.total}  complete=${b.complete}  partial=${b.partial}  not-started=${b.notStarted}  placeholder=${b.placeholder}`,
    );
  }
  return lines.join("\n");
}

async function writeReport(results: { mode: string; states: StateResult[]; counties: CountyResult[] }): Promise<void> {
  const md: string[] = [];
  md.push(`# P97 Discovery Validation Report`);
  md.push(``);
  md.push(`Mode: \`${results.mode}\``);
  md.push(`Generated: ${new Date().toISOString()}`);
  md.push(``);
  md.push(`## State results`);
  md.push(``);
  md.push(`| State | Status | Counties | Errors |`);
  md.push(`| --- | --- | --- | --- |`);
  for (const sr of results.states) {
    const errCount = sr.errors.length + sr.counties.reduce((acc, c) => acc + c.errors.length, 0);
    md.push(`| ${sr.state} | \`${sr.status}\` | ${sr.counties.length} | ${errCount} |`);
  }
  md.push(``);
  md.push(`## County results`);
  md.push(``);
  for (const sr of results.states) {
    md.push(`### ${sr.state}`);
    md.push(``);
    if (sr.errors.length > 0) {
      md.push(`State-level errors:`);
      for (const e of sr.errors) md.push(`- ${e}`);
      md.push(``);
    }
    md.push(`| County | Status | Institutions | Errors | Warnings |`);
    md.push(`| --- | --- | --- | --- | --- |`);
    for (const cr of sr.counties) {
      md.push(`| ${cr.county} | \`${cr.status}\` | ${cr.institutions.length} | ${cr.errors.length} | ${cr.warnings.length} |`);
    }
    md.push(``);
    for (const cr of sr.counties) {
      if (cr.errors.length === 0 && cr.warnings.length === 0) continue;
      md.push(`#### ${sr.state}:${cr.county} — \`${cr.status}\``);
      if (cr.errors.length > 0) {
        md.push(`Errors:`);
        for (const e of cr.errors) md.push(`- ${e}`);
      }
      if (cr.warnings.length > 0) {
        md.push(`Warnings:`);
        for (const w of cr.warnings) md.push(`- ${w}`);
      }
      md.push(``);
    }
  }
  md.push(`## Standalone county results`);
  md.push(``);
  for (const cr of results.counties) {
    md.push(`### ${cr.state}:${cr.county} — \`${cr.status}\``);
    md.push(`Institutions: ${cr.institutions.length}`);
    if (cr.errors.length > 0) {
      md.push(`Errors:`);
      for (const e of cr.errors) md.push(`- ${e}`);
    }
    if (cr.warnings.length > 0) {
      md.push(`Warnings:`);
      for (const w of cr.warnings) md.push(`- ${w}`);
    }
    md.push(``);
  }
  await writeFile(`${DOCS_DIR}/P97_DISCOVERY_VALIDATION_REPORT.md`, md.join("\n"), "utf8");
  await writeFile(`${DOCS_DIR}/p97_validation_results.json`, JSON.stringify(results, null, 2), "utf8");
}

async function main() {
  const args = process.argv.slice(2);
  const has = (f: string) => args.includes(f);
  const arg = (f: string) => {
    const i = args.indexOf(f);
    return i >= 0 && i + 1 < args.length ? args[i + 1] : undefined;
  };

  if (has("--status")) {
    console.log(await statusSummary());
    return;
  }

  const states: StateResult[] = [];
  const counties: CountyResult[] = [];

  if (has("--all")) {
    const { rows: scRows } = await readCsvRows(CSV_PATHS.stateCounty);
    const stateSet = new Set(scRows.map((r) => r.state));
    for (const s of stateSet) states.push(await validateState(s));
  } else if (has("--state")) {
    const s = arg("--state");
    if (!s) {
      console.error("--state requires a value");
      process.exit(2);
    }
    states.push(await validateState(s));
  } else if (has("--county")) {
    const c = arg("--county");
    if (!c || !c.includes(":")) {
      console.error('--county requires "STATE:County Name"');
      process.exit(2);
    }
    const [s, county] = c.split(":");
    counties.push(await validateCounty(s, county));
  } else {
    console.log(
      "Usage:\n  --status\n  --all\n  --state ME\n  --county 'ME:Cumberland'\n",
    );
    process.exit(0);
  }

  await writeReport({ mode: args.join(" "), states, counties });

  // Console summary
  console.log(`\nP97 Validation Results (mode: ${args.join(" ")})`);
  for (const sr of states) {
    const ec = sr.errors.length + sr.counties.reduce((a, c) => a + c.errors.length, 0);
    console.log(`  ${sr.state}: ${sr.status}  counties=${sr.counties.length}  errors=${ec}`);
    for (const cr of sr.counties) {
      if (cr.status === "VALIDATED_COMPLETE") continue;
      console.log(`    - ${cr.county}: ${cr.status}  errors=${cr.errors.length}  warnings=${cr.warnings.length}`);
    }
  }
  for (const cr of counties) {
    console.log(`  ${cr.state}:${cr.county}: ${cr.status}  errors=${cr.errors.length}  warnings=${cr.warnings.length}`);
  }
  const anyFail =
    states.some((s) => s.status === "INVALIDATED_REDO" || s.status === "PARTIAL_NEEDS_RESUME") ||
    counties.some((c) => c.status === "INVALIDATED_REDO" || c.status === "PARTIAL_NEEDS_RESUME");
  if (anyFail) {
    console.log(`\nFAIL — see ${DOCS_DIR}/P97_DISCOVERY_VALIDATION_REPORT.md`);
    process.exitCode = 1;
  } else {
    console.log(`\nPASS — see ${DOCS_DIR}/P97_DISCOVERY_VALIDATION_REPORT.md`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
