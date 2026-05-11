/**
 * P99-P97 Micro-Pilot Runtime Validator
 *
 * Validates the generated micro-pilot runtime file at:
 *   src/data/usce/public-listings-pilot.generated.json
 *
 * AND the noindex pilot route metadata at:
 *   src/app/clerkships/pilot/page.tsx
 *
 * Hard gates:
 *   - File exists and parses
 *   - Exactly EXPECTED_CARD_COUNT cards (12 after batch-4 slice)
 *   - The 5 ORIGINAL_PILOT_IDS preserved
 *   - The 3 SLICE_1_NEW_IDS present (Duke / NYU Tisch / IU Methodist)
 *   - The 2 SLICE_2_NEW_IDS present (HUP / Northwestern)
 *   - The 2 BATCH_4_SLICE_NEW_IDS present (Vanderbilt UMC / UCSF Medical Center)
 *   - No DEFERRED_NOT_YET_ACTIVE_IDS in active runtime (Jackson / Methodist San Antonio)
 *   - No excluded institutions
 *   - 21-field allow-list (or 20-field, matching Maine runtime)
 *   - No raw P97 internal field on the wire
 *   - No banned public-wording phrases in any card field
 *   - Route file contains noindex/follow=false metadata
 *   - Route file does NOT contain banned public-launch claims
 */

import * as fs from "fs";
import * as path from "path";

const RUNTIME_JSON = path.resolve(__dirname, "../src/data/usce/public-listings-pilot.generated.json");
const ROUTE_PAGE = path.resolve(__dirname, "../src/app/clerkships/pilot/page.tsx");

const BLOCKED_INSTITUTION_SUBSTRINGS = [
  "Mankato", "Eau Claire", "Bergen New Bridge", "Saint Elizabeths",
  "Hemet Global", "Thomas Jefferson University Hospital",
  "Manatee Memorial", "University Hospital San Antonio", "UH San Antonio",
  "UPMC Western Psychiatric", "Lincoln Medical and Mental Health",
];

const EXPECTED_CARD_COUNT = 12;

const ORIGINAL_PILOT_IDS = [
  "pilot-001-NJ-morristown-medical-center",
  "pilot-002-NJ-overlook-medical-center",
  "pilot-003-OH-cleveland-clinic-mercy-hospital",
  "pilot-004-OH-cleveland-clinic-hillcrest-hospital",
  "pilot-007-CA-highland-hospital-alameda-health-system",
];

const SLICE_1_NEW_IDS = [
  "pilot-014-NC-duke-university-hospital",
  "pilot-017-NY-nyu-langone-tisch-hospital",
  "pilot-019-IN-iu-health-methodist-hospital",
];

const SLICE_2_NEW_IDS = [
  "pilot-016-PA-hospital-of-the-university-of-pennsylvania",
  "pilot-015-IL-northwestern-memorial-hospital",
];

const BATCH_4_SLICE_NEW_IDS = [
  "pilot-020-TN-vanderbilt-university-medical-center",
  "pilot-021-CA-ucsf-medical-center",
];

// Batch-3 staged rows that remain deferred after slice 2 — must NEVER appear
// in active runtime until a separate sprint explicitly authorizes them.
const DEFERRED_NOT_YET_ACTIVE_IDS = [
  "pilot-013-FL-jackson-memorial-hospital",
  "pilot-018-TX-methodist-hospital-san-antonio",
];

const ALLOWED_RUNTIME_FIELDS = new Set([
  "listing_id", "institution_name", "campus_name", "state", "county",
  "specialty", "opportunity_type", "source_page_type", "listing_role",
  "display_bucket", "eligible_audiences", "excluded_audiences",
  "unknown_audiences", "restriction_tags", "fit_warnings",
  "audience_detail", "application_url", "official_source_url",
  "source_status", "last_reviewed_at",
]);

const FORBIDDEN_RUNTIME_KEYS_EXACT = new Set([
  "screenshot_path", "reviewer_notes", "must_not_claim", "not_allowed_actions",
  "bridge_row_id", "internal_evidence_ref", "internal_reviewer_notes",
  "p97_readiness_status", "bridge_review_status", "human_reviewer_required",
  "archive_url",
  "npi", "ccn", "cms_facility_id", "nppes_npi", "ein", "aamc_id", "nrmp_id", "acgme_id",
  "completeness_score", "max_possible_score", "identity_status",
]);

const BANNED_PUBLIC_PHRASES = [
  /\bguarantee/i,
  /\bguaranteed\b/i,
  /\bhospital[- ]approved\b/i,
  /\bofficially approved by\b/i,
  /\bIMG[- ]friendly\b/i,
  /\bapply through USCEHub\b/i,
  /\bofficial application system\b/i,
  /\bverified by hospital\b/i,
  /\bcomplete national directory\b/i,
];

const PUBLIC_LAUNCH_BANNED = [
  /\blaunch\b/i,
  /\bnationwide\b/i,
  /\ball USCE rotations\b/i,
  /\bcomplete (national )?directory\b/i,
];

interface Failure { rule: string; detail: string }

function checkBannedPhrases(value: unknown, field: string, failures: Failure[]) {
  const s = typeof value === "string" ? value : Array.isArray(value) ? value.join(" ") : "";
  for (const re of BANNED_PUBLIC_PHRASES) {
    if (re.test(s)) {
      // Allow negation context ("no guaranteed rotation", "not approved by hospital")
      if (/\b(no |never |not )(guarantee|hospital[- ]approved|officially approved by|IMG[- ]friendly|apply through USCEHub|official application system|verified by hospital|complete national directory)/i.test(s)) continue;
      failures.push({ rule: "BANNED_PUBLIC_PHRASE", detail: `field '${field}' contains '${re.source}': '${s.slice(0, 80)}'` });
    }
  }
}

function main() {
  const failures: Failure[] = [];

  console.log("=".repeat(60));
  console.log("P99-P97 Micro-Pilot Runtime Validator");
  console.log("=".repeat(60));

  // 1. Runtime file
  if (!fs.existsSync(RUNTIME_JSON)) {
    console.error(`Runtime file not found: ${RUNTIME_JSON}`);
    process.exit(1);
  }
  const raw = JSON.parse(fs.readFileSync(RUNTIME_JSON, "utf8"));
  const cards: Record<string, unknown>[] = raw.cards ?? [];

  console.log(`Runtime file: ${RUNTIME_JSON}`);
  console.log(`  Cards: ${cards.length} (expected ${EXPECTED_CARD_COUNT})`);

  if (cards.length !== EXPECTED_CARD_COUNT) {
    failures.push({ rule: "WRONG_CARD_COUNT", detail: `Expected exactly ${EXPECTED_CARD_COUNT}; got ${cards.length}` });
  }

  // ID-set sanity: original 5 preserved, slice-1 3 present, deferred absent
  const presentIds = new Set(cards.map(c => String(c.listing_id ?? "")));
  for (const id of ORIGINAL_PILOT_IDS) {
    if (!presentIds.has(id)) {
      failures.push({ rule: "ORIGINAL_PILOT_ID_MISSING", detail: `Original active id '${id}' not present` });
    }
  }
  for (const id of SLICE_1_NEW_IDS) {
    if (!presentIds.has(id)) {
      failures.push({ rule: "SLICE_1_ID_MISSING", detail: `Slice-1 new id '${id}' not present` });
    }
  }
  for (const id of SLICE_2_NEW_IDS) {
    if (!presentIds.has(id)) {
      failures.push({ rule: "SLICE_2_ID_MISSING", detail: `Slice-2 new id '${id}' not present` });
    }
  }
  for (const id of BATCH_4_SLICE_NEW_IDS) {
    if (!presentIds.has(id)) {
      failures.push({ rule: "BATCH_4_SLICE_ID_MISSING", detail: `Batch-4 slice new id '${id}' not present` });
    }
  }
  for (const id of DEFERRED_NOT_YET_ACTIVE_IDS) {
    if (presentIds.has(id)) {
      failures.push({ rule: "DEFERRED_ID_PRESENT_IN_ACTIVE", detail: `Deferred batch-3 id '${id}' must not be in active runtime — needs its own sprint authorization` });
    }
  }
  // No duplicates
  if (presentIds.size !== cards.length) {
    failures.push({ rule: "DUPLICATE_LISTING_ID", detail: `${cards.length} cards but only ${presentIds.size} unique listing_ids` });
  }

  // 2. Per-card checks
  for (const c of cards) {
    const id = String(c.listing_id ?? "(no id)");

    // Allow-list keys only
    for (const key of Object.keys(c)) {
      if (!ALLOWED_RUNTIME_FIELDS.has(key)) {
        failures.push({ rule: "UNEXPECTED_FIELD", detail: `card ${id}: field '${key}' not in allow-list` });
      }
      if (FORBIDDEN_RUNTIME_KEYS_EXACT.has(key)) {
        failures.push({ rule: "FORBIDDEN_KEY", detail: `card ${id}: field '${key}' is explicitly forbidden in runtime` });
      }
    }

    // Required fields present + non-empty
    for (const required of ["listing_id", "institution_name", "state", "specialty", "opportunity_type", "display_bucket", "official_source_url", "source_status", "last_reviewed_at", "audience_detail"]) {
      const v = c[required];
      if (v === undefined || v === null || (typeof v === "string" && v.trim() === "") || (Array.isArray(v) && v.length === 0 && required === "audience_detail")) {
        failures.push({ rule: "MISSING_REQUIRED_FIELD", detail: `card ${id}: '${required}' is missing or empty` });
      }
    }

    // No blocked institutions
    const inst = String(c.institution_name ?? "");
    for (const blocked of BLOCKED_INSTITUTION_SUBSTRINGS) {
      if (inst.includes(blocked)) {
        failures.push({ rule: "BLOCKED_INSTITUTION", detail: `card ${id}: institution '${inst}' contains blocked substring '${blocked}'` });
      }
    }

    // Bucket allow-list
    if (c.display_bucket !== "READY_PUBLIC_IMG_RELEVANT" && c.display_bucket !== "READY_PUBLIC_US_STUDENT_ONLY") {
      failures.push({ rule: "BAD_BUCKET", detail: `card ${id}: display_bucket '${c.display_bucket}' not allowed` });
    }

    // URL format
    const url = String(c.official_source_url ?? "");
    if (!/^https?:\/\//.test(url)) {
      failures.push({ rule: "BAD_URL", detail: `card ${id}: official_source_url '${url}' must start with http(s)://` });
    }

    // Banned phrases on each public field
    for (const [k, v] of Object.entries(c)) {
      checkBannedPhrases(v, k, failures);
    }
  }

  // 3. Route file
  if (!fs.existsSync(ROUTE_PAGE)) {
    failures.push({ rule: "ROUTE_PAGE_MISSING", detail: `Route file not found: ${ROUTE_PAGE}` });
  } else {
    const routeText = fs.readFileSync(ROUTE_PAGE, "utf8");
    if (!/index:\s*false/.test(routeText)) {
      failures.push({ rule: "ROUTE_NOT_NOINDEX", detail: `Route file ${ROUTE_PAGE} does not contain 'index: false' in metadata.robots` });
    }
    if (!/follow:\s*false/.test(routeText)) {
      failures.push({ rule: "ROUTE_NOT_NOFOLLOW", detail: `Route file ${ROUTE_PAGE} does not contain 'follow: false' in metadata.robots` });
    }
    for (const re of PUBLIC_LAUNCH_BANNED) {
      if (re.test(routeText)) {
        // Allow negation
        if (/\b(no |not |never )(launch|nationwide|all USCE rotations|complete (national )?directory)/i.test(routeText)) continue;
        failures.push({ rule: "BANNED_LAUNCH_LANGUAGE_IN_ROUTE", detail: `Route file contains '${re.source}'` });
      }
    }
    for (const re of BANNED_PUBLIC_PHRASES) {
      if (re.test(routeText)) {
        if (/\b(no |never |not )(guarantee|hospital[- ]approved|officially approved by|IMG[- ]friendly|apply through USCEHub|official application system|verified by hospital|complete national directory)/i.test(routeText)) continue;
        failures.push({ rule: "BANNED_PHRASE_IN_ROUTE", detail: `Route file contains '${re.source}'` });
      }
    }
  }

  // ── Summary ────────────────────────────────────────────────────────────
  if (failures.length === 0) {
    console.log("\nOverall: PASSED");
    console.log(`  ${cards.length} pilot card(s) passed all runtime gates.`);
    console.log("  Route is noindex+nofollow.");
    console.log("  No deploy. No public promotion.");
    process.exit(0);
  }
  console.log(`\nOverall: FAILED — ${failures.length} issue(s):`);
  for (const f of failures) {
    console.log(`  [${f.rule}] ${f.detail}`);
  }
  process.exit(1);
}

main();
