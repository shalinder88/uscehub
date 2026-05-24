/**
 * P99-P97 Micro-Pilot Runtime Generation Script
 *
 * Reads T7 prep CSV at:
 *   /Volumes/T7Shield_Code/.../docs/platform-v2/local/usce-completeness/micro-pilot-runtime-prep-1/micro_pilot_runtime_prep_1_input.csv
 *
 * Writes:
 *   src/data/usce/public-listings-pilot.generated.json
 *   src/data/usce/public-listings-pilot.generated.ts
 *
 * Hard gates:
 *   - Exactly 5 rows
 *   - No excluded institutions
 *   - No raw P97 internal fields on the wire
 *   - No banned public-wording phrases
 *   - audience_detail must be a valid 4-key object with allowed status values
 *   - All 5 rows must have evidence triple complete
 */

import * as fs from "fs";
import * as path from "path";

const T7_PREP_CSV = "/Volumes/T7Shield_Code/01_PROJECTS/USCEHub/08_ACTIVE_ON_SHIELD_LATER/uscehub-active-2026-05-02/docs/platform-v2/local/usce-completeness/micro-pilot-runtime-prep-1/micro_pilot_runtime_prep_1_input.csv";

const OUT_JSON = path.resolve(__dirname, "../src/data/usce/public-listings-pilot.generated.json");
const OUT_TS = path.resolve(__dirname, "../src/data/usce/public-listings-pilot.generated.ts");

// Counties per row (looked up from P97 packets at prep time)
const COUNTY_BY_RANK: Record<string, string> = {
  "75": "Morris",
  "76": "Union",
  "91": "Stark",
  "149": "Cuyahoga",
  "162": "Alameda",
};

const BLOCKED_INSTITUTION_SUBSTRINGS = [
  "Mankato", "Eau Claire", "Bergen New Bridge", "Saint Elizabeths",
  "Hemet Global", "Thomas Jefferson University Hospital",
  "Manatee Memorial", "University Hospital San Antonio", "UH San Antonio",
  "UPMC Western Psychiatric", "Lincoln Medical and Mental Health",
];

const BANNED_PHRASES = [
  /\bguarantee/i,
  /\bguaranteed\b/i,
  /\bhospital[- ]approved\b/i,
  /\bofficially approved by\b/i,
  /\bIMG[- ]friendly\b/i,
  /\bapply through USCEHub\b/i,
  /\bofficial application system\b/i,
];

const FORBIDDEN_RUNTIME_SUBSTRINGS = [
  "npi", "ccn", "cms", "nppes", "aamc", "nrmp", "acgme", "nucc",
  "completeness_score", "max_possible_score", "identity_status",
];

const ALLOWED_AUDIENCE_STATUSES = ["ELIGIBLE_EXPLICIT", "EXCLUDED_EXPLICIT", "UNKNOWN_NOT_STATED", "ONLY_IF_AFFILIATED", "ONLY_IF_LCME_COCA"];

// ── CSV reader ──────────────────────────────────────────────────────────────
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cur = "";
  let inQuotes = false;
  let i = 0;
  while (i < text.length) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') { cur += '"'; i += 2; continue; }
        inQuotes = false; i++; continue;
      }
      cur += ch; i++; continue;
    }
    if (ch === '"') { inQuotes = true; i++; continue; }
    if (ch === ",") { row.push(cur); cur = ""; i++; continue; }
    if (ch === "\r") { i++; continue; }
    if (ch === "\n") { row.push(cur); rows.push(row); row = []; cur = ""; i++; continue; }
    cur += ch; i++;
  }
  if (cur.length > 0 || row.length > 0) { row.push(cur); rows.push(row); }
  return rows.filter(r => !(r.length === 1 && r[0] === ""));
}

function parseAudienceDetail(s: string): { us_md_do: string; international_student: string; img_graduate: string; caribbean_student: string } {
  // Input shape: "{us_md_do: ELIGIBLE_EXPLICIT, international_student: UNKNOWN_NOT_STATED, ...}"
  const pairs: Record<string, string> = {};
  const inner = s.replace(/^\{|\}$/g, "");
  for (const part of inner.split(",")) {
    const [k, v] = part.split(":").map(x => x.trim());
    if (k && v) pairs[k] = v;
  }
  for (const k of ["us_md_do", "international_student", "img_graduate", "caribbean_student"]) {
    if (!pairs[k]) throw new Error(`audience_detail missing key '${k}': ${s}`);
    if (!ALLOWED_AUDIENCE_STATUSES.includes(pairs[k])) {
      throw new Error(`audience_detail.${k}='${pairs[k]}' not in [${ALLOWED_AUDIENCE_STATUSES.join(",")}]`);
    }
  }
  return pairs as any;
}

function deriveAudiences(detail: Record<string, string>): { eligible: string[]; excluded: string[]; unknown: string[] } {
  const KEY_TO_AUDIENCE: Record<string, string> = {
    us_md_do: "US_MD_DO",
    international_student: "INTERNATIONAL_STUDENT",
    img_graduate: "IMG_GRADUATE",
    caribbean_student: "CARIBBEAN_STUDENT",
  };
  const eligible: string[] = [];
  const excluded: string[] = [];
  const unknown: string[] = [];
  for (const [k, v] of Object.entries(detail)) {
    const aud = KEY_TO_AUDIENCE[k];
    if (!aud) continue;
    if (v === "ELIGIBLE_EXPLICIT") eligible.push(aud);
    else if (v === "ONLY_IF_AFFILIATED") eligible.push(aud); // ONLY_IF_AFFILIATED implies eligible-with-restriction
    else if (v === "ONLY_IF_LCME_COCA") eligible.push(aud);
    else if (v === "EXCLUDED_EXPLICIT") excluded.push(aud);
    else if (v === "UNKNOWN_NOT_STATED") unknown.push(aud);
  }
  return { eligible, excluded, unknown };
}

function deriveDisplayBucket(category: string): "READY_PUBLIC_IMG_RELEVANT" | "READY_PUBLIC_US_STUDENT_ONLY" {
  if (category === "READY_PUBLIC_IMG_RELEVANT_CANDIDATE") return "READY_PUBLIC_IMG_RELEVANT";
  if (category === "READY_PUBLIC_US_STUDENT_ONLY_CANDIDATE") return "READY_PUBLIC_US_STUDENT_ONLY";
  throw new Error(`Unrecognized public_pilot_category '${category}'`);
}

function deriveSourcePageType(url: string): string {
  if (/freida\.ama-assn\.org/i.test(url)) return "FREIDA_RECORD";
  if (/elective-program/i.test(url)) return "POLICY_HUB";
  if (/scholarship/i.test(url)) return "SPECIALTY_PAGE";
  if (/medical-students|visiting-medical-student-clerkships/i.test(url)) return "SPECIALTY_PAGE";
  return "SPECIALTY_PAGE"; // safe default for visiting-MS pages
}

function deriveListingId(rank: string, state: string, institutionName: string): string {
  const slug = institutionName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  return `pilot-${rank.padStart(3, "0")}-${state}-${slug}`;
}

function deriveFitWarnings(restrictionTags: string[]): string[] {
  // Surface the most actionable-restriction tags as fit warnings
  const FIT_WARNING_FROM_RESTRICTION: Record<string, string> = {
    NAMED_SCHOOLS_ONLY: "NAMED_SCHOOLS_ONLY",
    HOUSING_NOT_PROVIDED: "HOUSING_NOT_PROVIDED",
    LCME_AOA_ONLY: "LCME_AOA_ONLY",
    VISA_APPLICANT_OBTAINED_B1: "VISA_APPLICANT_OBTAINED_B1",
    NO_J1_SPONSORSHIP: "NO_J1_SPONSORSHIP",
    NO_H1B_SPONSORSHIP: "NO_H1B_SPONSORSHIP",
    FEE_REQUIRED: "FEE_REQUIRED",
    DIVERSITY_ELIGIBILITY_REQUIRED: "DIVERSITY_ELIGIBILITY_REQUIRED",
    MS4_ONLY: "MS4_ONLY",
    SYSTEM_PAGE_SOURCE_NO_HILLCREST_SPECIFIC_GUARANTEE: "SYSTEM_PAGE_NO_SITE_SPECIFIC_GUARANTEE",
    NO_BROAD_IMG_CLAIM: "NO_BROAD_IMG_CLAIM",
  };
  const out = new Set<string>();
  for (const t of restrictionTags) {
    if (FIT_WARNING_FROM_RESTRICTION[t]) out.add(FIT_WARNING_FROM_RESTRICTION[t]);
  }
  return Array.from(out);
}

// ── Forbidden-substring + banned-phrase scans on serialized output ──────────
function scanForbiddenContent(card: Record<string, unknown>): string[] {
  const issues: string[] = [];
  const json = JSON.stringify(card);
  for (const sub of FORBIDDEN_RUNTIME_SUBSTRINGS) {
    // Avoid false positive on legitimate field names; check token boundaries
    const re = new RegExp(`["\\b]${sub}["\\b_]`, "i");
    if (re.test(json)) issues.push(`forbidden substring '${sub}'`);
  }
  // Banned phrases in any string value
  for (const v of Object.values(card)) {
    const s = typeof v === "string" ? v : Array.isArray(v) ? v.join(" ") : "";
    for (const re of BANNED_PHRASES) {
      if (re.test(s)) {
        // Allow negation context (e.g., "no guaranteed rotation")
        if (/\b(no |never )(guarantee|hospital[- ]approved|officially approved by|IMG[- ]friendly|apply through USCEHub|official application system)/i.test(s)) continue;
        issues.push(`banned phrase ${re.source} in field`);
      }
    }
  }
  return issues;
}

// ── Main ────────────────────────────────────────────────────────────────────
function main() {
  if (!fs.existsSync(T7_PREP_CSV)) {
    console.error(`T7 prep CSV not found: ${T7_PREP_CSV}`);
    process.exit(2);
  }
  const text = fs.readFileSync(T7_PREP_CSV, "utf8");
  const grid = parseCsv(text);
  if (grid.length < 2) { console.error("CSV has no data rows"); process.exit(2); }

  const header = grid[0];
  const rows: Record<string, string>[] = [];
  for (let i = 1; i < grid.length; i++) {
    const r: Record<string, string> = {};
    for (let j = 0; j < header.length; j++) r[header[j]] = grid[i][j] ?? "";
    rows.push(r);
  }

  console.log("=".repeat(60));
  console.log("P99-P97 Micro-Pilot Runtime Generation");
  console.log("=".repeat(60));
  console.log(`Source: ${T7_PREP_CSV}`);
  console.log(`Source rows: ${rows.length}`);

  if (rows.length !== 5) {
    console.error(`Expected exactly 5 rows; got ${rows.length}`);
    process.exit(1);
  }

  // Hard rejection: any blocked institution
  for (const r of rows) {
    for (const blocked of BLOCKED_INSTITUTION_SUBSTRINGS) {
      if (r.institution_name.includes(blocked)) {
        console.error(`Blocked institution detected: '${r.institution_name}' contains '${blocked}'`);
        process.exit(1);
      }
    }
    if (r.evidence_triple_complete !== "true") {
      console.error(`Row ${r.micro_pilot_id}: evidence_triple_complete must be true; got '${r.evidence_triple_complete}'`);
      process.exit(1);
    }
    if (r.noindex_required !== "true") {
      console.error(`Row ${r.micro_pilot_id}: noindex_required must be true; got '${r.noindex_required}'`);
      process.exit(1);
    }
  }

  // Transform to P99 runtime shape
  const cards: Record<string, unknown>[] = [];
  for (const r of rows) {
    const detail = parseAudienceDetail(r.audience_detail);
    const audiences = deriveAudiences(detail);
    const restrictionTags = (r.restriction_tags || "").split("|").filter(Boolean);
    const card: Record<string, unknown> = {
      listing_id: deriveListingId(r.bridge_row_id.match(/-(\d+)-/)?.[1] || r.micro_pilot_id, r.state, r.institution_name),
      institution_name: r.institution_name,
      campus_name: r.campus_name || "",
      state: r.state,
      county: COUNTY_BY_RANK[r.bridge_row_id.match(/-(\d+)-/)?.[1] || ""] || "",
      specialty: r.specialty || "multispecialty_visiting",
      opportunity_type: r.opportunity_type === "VISITING_ELECTIVE" ? "Visiting elective" : r.opportunity_type,
      source_page_type: deriveSourcePageType(r.official_source_url),
      listing_role: "PUBLIC_OPPORTUNITY",
      display_bucket: deriveDisplayBucket(r.public_pilot_category),
      eligible_audiences: audiences.eligible,
      excluded_audiences: audiences.excluded,
      unknown_audiences: audiences.unknown,
      restriction_tags: restrictionTags,
      fit_warnings: deriveFitWarnings(restrictionTags),
      audience_detail: detail,
      application_url: r.application_url || "",
      official_source_url: r.official_source_url,
      source_status: r.source_status || "OFFICIAL_SOURCE_ARCHIVED",
      last_reviewed_at: `${r.last_reviewed}T00:00:00Z`,
    };

    const issues = scanForbiddenContent(card);
    if (issues.length > 0) {
      console.error(`Row ${r.micro_pilot_id} forbidden content: ${issues.join("; ")}`);
      process.exit(1);
    }
    cards.push(card);
  }

  // Hard count check
  const imgCount = cards.filter(c => c.display_bucket === "READY_PUBLIC_IMG_RELEVANT").length;
  const usOnlyCount = cards.filter(c => c.display_bucket === "READY_PUBLIC_US_STUDENT_ONLY").length;
  console.log(`Generated cards: ${cards.length}`);
  console.log(`  IMG-relevant: ${imgCount}`);
  console.log(`  US-only: ${usOnlyCount}`);

  if (cards.length !== 5) {
    console.error(`FAIL: expected 5 generated cards; got ${cards.length}`);
    process.exit(1);
  }

  // Write JSON
  const promotedAt = new Date().toISOString();
  const jsonOut = JSON.stringify({
    promoted_at: promotedAt,
    source: "T7:micro_pilot_runtime_prep_1_input.csv",
    source_commit_t7: "3b9d0fa",
    cards,
  }, null, 2);
  fs.writeFileSync(OUT_JSON, jsonOut, "utf8");
  console.log(`  Written: ${OUT_JSON}`);

  // Write TS
  const tsLines = [
    `// AUTO-GENERATED by scripts/generate-micro-pilot-runtime.ts`,
    `// Source: T7 prep CSV at commit 3b9d0fa`,
    `// Generated: ${promotedAt}`,
    `// DO NOT EDIT — regenerate with: npx tsx scripts/generate-micro-pilot-runtime.ts`,
    ``,
    `import type { UsceCard } from "@/lib/usce-maine-data";`,
    ``,
    `export const PILOT_USCE_CARDS: UsceCard[] = ${JSON.stringify(cards, null, 2)};`,
    ``,
    `export const PILOT_IMG_RELEVANT_COUNT = ${imgCount};`,
    `export const PILOT_US_ONLY_COUNT = ${usOnlyCount};`,
    `export const PILOT_TOTAL_COUNT = ${cards.length};`,
    ``,
  ];
  fs.writeFileSync(OUT_TS, tsLines.join("\n"), "utf8");
  console.log(`  Written: ${OUT_TS}`);

  console.log("\nGeneration complete. No deploy. No public promotion.");
  process.exit(0);
}

main();
