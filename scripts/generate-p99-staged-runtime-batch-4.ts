/**
 * P99-P97 Staged Runtime Batch 4 — Data-Only Generator
 *
 * Reads:
 *   - src/data/usce/public-listings-pilot.generated.json (active 10)
 *   - 2 new bridge-validated rows: Vanderbilt + UCSF
 *
 * Writes:
 *   - src/data/usce/public-listings-pilot-staged-batch-4.generated.json
 *   - src/data/usce/public-listings-pilot-staged-batch-4.generated.ts
 *
 * Hard contracts:
 *   - Active 10 cards copied verbatim — no mutation.
 *   - 2 new cards built deterministically from bridge-validation outputs.
 *   - Output is data-only and not imported by any app code.
 *   - No PUBLIC_NOW / IMPORT_READY / banned-phrase content.
 *
 * Run:
 *   npx tsx scripts/generate-p99-staged-runtime-batch-4.ts
 */

import * as fs from "fs";
import * as path from "path";

const REPO_ROOT = path.resolve(__dirname, "..");
const ACTIVE_PATH = path.join(REPO_ROOT, "src/data/usce/public-listings-pilot.generated.json");
const OUT_JSON = path.join(REPO_ROOT, "src/data/usce/public-listings-pilot-staged-batch-4.generated.json");
const OUT_TS = path.join(REPO_ROOT, "src/data/usce/public-listings-pilot-staged-batch-4.generated.ts");

const STAGED_AT = "2026-05-10T02:00:00Z";

const ACTIVE_IDS = [
  "pilot-001-NJ-morristown-medical-center",
  "pilot-002-NJ-overlook-medical-center",
  "pilot-003-OH-cleveland-clinic-mercy-hospital",
  "pilot-004-OH-cleveland-clinic-hillcrest-hospital",
  "pilot-007-CA-highland-hospital-alameda-health-system",
  "pilot-014-NC-duke-university-hospital",
  "pilot-017-NY-nyu-langone-tisch-hospital",
  "pilot-019-IN-iu-health-methodist-hospital",
  "pilot-016-PA-hospital-of-the-university-of-pennsylvania",
  "pilot-015-IL-northwestern-memorial-hospital",
];

interface Card {
  listing_id: string;
  institution_name: string;
  campus_name: string;
  state: string;
  county: string;
  specialty: string;
  opportunity_type: string;
  source_page_type: string;
  listing_role: string;
  display_bucket: string;
  eligible_audiences: string[];
  excluded_audiences: string[];
  unknown_audiences: string[];
  restriction_tags: string[];
  fit_warnings: string[];
  audience_detail: {
    us_md_do: string;
    international_student: string;
    img_graduate: string;
    caribbean_student: string;
  };
  application_url: string;
  official_source_url: string;
  source_status: string;
  last_reviewed_at: string;
}

const NEW_CARDS: Card[] = [
  {
    listing_id: "pilot-020-TN-vanderbilt-university-medical-center",
    institution_name: "Vanderbilt University Medical Center",
    campus_name:
      "System-level Vanderbilt SOM source — Vanderbilt University Medical Center site placement not separately enumerated",
    state: "TN",
    county: "",
    specialty: "multispecialty_visiting",
    opportunity_type: "Visiting elective",
    source_page_type: "SYSTEM_PAGE",
    listing_role: "PUBLIC_OPPORTUNITY",
    display_bucket: "READY_PUBLIC_US_STUDENT_ONLY",
    eligible_audiences: ["US_MD_DO"],
    excluded_audiences: ["INTERNATIONAL_STUDENT", "IMG_GRADUATE", "CARIBBEAN_STUDENT"],
    unknown_audiences: [],
    restriction_tags: [
      "LCME_AOA_ONLY",
      "MS4_ONLY",
      "STEP_1_OR_2_OR_COMLEX_REQUIRED",
      "VSLO_REQUIRED",
      "AFFILIATION_AGREEMENT_REQUIRED",
      "FEE_REQUIRED_180",
      "WINDOW_JUNE_TO_DECEMBER",
      "VISA_NOT_MENTIONED_US_ONLY_AUDIENCE",
      "NO_J1_VERIFIED",
      "NO_H1B_VERIFIED",
      "SYSTEM_PAGE_SOURCE_NO_VANDERBILT_UMC_SPECIFIC_GUARANTEE",
    ],
    fit_warnings: [
      "LCME_AOA_ONLY",
      "MS4_ONLY",
      "FEE_REQUIRED_180",
      "WINDOW_JUNE_TO_DECEMBER",
      "SYSTEM_PAGE_SOURCE_NO_VANDERBILT_UMC_SPECIFIC_GUARANTEE",
    ],
    audience_detail: {
      us_md_do: "ELIGIBLE_EXPLICIT",
      international_student: "EXCLUDED_EXPLICIT",
      img_graduate: "EXCLUDED_EXPLICIT",
      caribbean_student: "EXCLUDED_EXPLICIT",
    },
    application_url: "",
    official_source_url: "https://medschool.vanderbilt.edu/md/visiting-students/",
    source_status: "OFFICIAL_SOURCE_FETCHED",
    last_reviewed_at: "2026-05-10T00:00:00Z",
  },
  {
    listing_id: "pilot-021-CA-ucsf-medical-center",
    institution_name: "UCSF Medical Center",
    campus_name:
      "System-level UCSF SOM source — UCSF Medical Center site placement not separately enumerated",
    state: "CA",
    county: "",
    specialty: "multispecialty_visiting",
    opportunity_type: "Visiting elective",
    source_page_type: "SYSTEM_PAGE",
    listing_role: "PUBLIC_OPPORTUNITY",
    display_bucket: "READY_PUBLIC_US_STUDENT_ONLY",
    eligible_audiences: ["US_MD_DO"],
    excluded_audiences: ["INTERNATIONAL_STUDENT", "IMG_GRADUATE", "CARIBBEAN_STUDENT"],
    unknown_audiences: [],
    restriction_tags: [
      "LCME_AOA_ONLY",
      "VSLO_REQUIRED",
      "GOOD_ACADEMIC_STANDING_REQUIRED",
      "VISA_NOT_MENTIONED_US_ONLY_AUDIENCE",
      "NO_J1_VERIFIED",
      "NO_H1B_VERIFIED",
      "COST_NOT_STATED",
      "WINDOW_NOT_STATED",
      "SYSTEM_PAGE_SOURCE_NO_UCSF_MEDICAL_CENTER_SPECIFIC_GUARANTEE",
    ],
    fit_warnings: [
      "LCME_AOA_ONLY",
      "GOOD_ACADEMIC_STANDING_REQUIRED",
      "COST_NOT_STATED",
      "SYSTEM_PAGE_SOURCE_NO_UCSF_MEDICAL_CENTER_SPECIFIC_GUARANTEE",
    ],
    audience_detail: {
      us_md_do: "ELIGIBLE_EXPLICIT",
      international_student: "EXCLUDED_EXPLICIT",
      img_graduate: "EXCLUDED_EXPLICIT",
      caribbean_student: "EXCLUDED_EXPLICIT",
    },
    application_url: "",
    official_source_url: "https://meded.ucsf.edu/visiting-student-program",
    source_status: "OFFICIAL_SOURCE_FETCHED",
    last_reviewed_at: "2026-05-10T00:00:00Z",
  },
];

const NEW_IDS = NEW_CARDS.map((c) => c.listing_id);

interface BatchEnvelope { cards: Card[] }

function loadJson<T>(p: string): T { return JSON.parse(fs.readFileSync(p, "utf8")) as T; }

function main(): void {
  const active = loadJson<BatchEnvelope>(ACTIVE_PATH);

  const activeById = new Map<string, Card>();
  for (const c of active.cards) activeById.set(c.listing_id, c);

  const cards: Card[] = [];
  for (const id of ACTIVE_IDS) {
    const a = activeById.get(id);
    if (!a) throw new Error(`active card missing: ${id}`);
    cards.push(a);
  }
  for (const c of NEW_CARDS) cards.push(c);

  if (cards.length !== 12) {
    throw new Error(`expected 12 cards, built ${cards.length}`);
  }

  const envelope = {
    staged_only: true,
    not_imported_by_app: true,
    not_production: true,
    not_public_now: true,
    not_import_ready: true,
    candidate_status: "STAGED_DATA_ONLY_NOT_IMPORTED_BY_APP",
    promoted_at: null as string | null,
    staged_at: STAGED_AT,
    source: "P99-P97-STAGED-RUNTIME-BATCH-4-DATA-ONLY",
    active_runtime_unchanged: true,
    active_runtime_path: "src/data/usce/public-listings-pilot.generated.json",
    active_runtime_card_count: ACTIVE_IDS.length,
    staged_card_count: cards.length,
    preserved_active_cards: ACTIVE_IDS,
    added_staged_cards: NEW_IDS,
    must_not_be_imported_by: [
      "src/lib/usce-pilot-data.ts",
      "src/app/clerkships/pilot/page.tsx",
      "src/app/clerkships/pilot/PilotClerkshipListings.tsx",
    ],
    cards,
  };

  fs.writeFileSync(OUT_JSON, JSON.stringify(envelope, null, 2) + "\n");
  console.log(`wrote ${path.relative(REPO_ROOT, OUT_JSON)} (${cards.length} cards)`);

  const meta = {
    staged_only: true,
    not_imported_by_app: true,
    not_production: true,
    not_public_now: true,
    not_import_ready: true,
    candidate_status: "STAGED_DATA_ONLY_NOT_IMPORTED_BY_APP",
    staged_at: STAGED_AT,
    source: "P99-P97-STAGED-RUNTIME-BATCH-4-DATA-ONLY",
    active_runtime_unchanged: true,
    active_runtime_path: "src/data/usce/public-listings-pilot.generated.json",
    active_runtime_card_count: ACTIVE_IDS.length,
    staged_card_count: cards.length,
  };

  const imgRelevant = cards.filter((c) => c.display_bucket === "READY_PUBLIC_IMG_RELEVANT").length;
  const usOnly = cards.filter((c) => c.display_bucket === "READY_PUBLIC_US_STUDENT_ONLY").length;

  const ts = `// AUTO-GENERATED by P99-P97-STAGED-RUNTIME-BATCH-4-DATA-ONLY
// STAGED DATA ONLY — NOT IMPORTED BY APP CODE.
// This file is intentionally not imported by:
//   - src/lib/usce-pilot-data.ts
//   - src/app/clerkships/pilot/page.tsx
//   - src/app/clerkships/pilot/PilotClerkshipListings.tsx
// Importing this from the active route is a release-blocking error.
// Generated: ${STAGED_AT}
// DO NOT EDIT — regenerate with:
//   npx tsx scripts/generate-p99-staged-runtime-batch-4.ts
// Sprint folder:
//   docs/platform-v2/local/usce-completeness/staged-runtime-batch-4-data-only/

import type { UsceCard } from "@/lib/usce-maine-data";

export const PILOT_USCE_CARDS_STAGED_BATCH_4_METADATA = ${JSON.stringify(meta, null, 2)} as const;

export const PILOT_USCE_CARDS_STAGED_BATCH_4: UsceCard[] =
${JSON.stringify(cards, null, 2)}
;

export const PILOT_STAGED_BATCH_4_IMG_RELEVANT_COUNT = ${imgRelevant};
export const PILOT_STAGED_BATCH_4_US_ONLY_COUNT = ${usOnly};
export const PILOT_STAGED_BATCH_4_TOTAL_COUNT = ${cards.length};
`;

  fs.writeFileSync(OUT_TS, ts);
  console.log(`wrote ${path.relative(REPO_ROOT, OUT_TS)}`);
}

main();
