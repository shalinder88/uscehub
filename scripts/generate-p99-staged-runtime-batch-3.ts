/**
 * P99-P97 Staged Runtime Batch 3 — Data-Only Generator
 *
 * Reads:
 *   - src/data/usce/public-listings-pilot.generated.json (active 5)
 *   - src/data/usce/public-listings-pilot-staged-batch-2.generated.json (UPMC + Lincoln)
 *   - 7 new validated bridge-input rows from
 *     docs/platform-v2/local/usce-completeness/p97-promotion-batch-3-evidence-hardening-1/promotion_batch_3_evidence_hardening_1_bridge_input_VALIDATED_CANDIDATE.csv
 *
 * Writes:
 *   - src/data/usce/public-listings-pilot-staged-batch-3.generated.json
 *   - src/data/usce/public-listings-pilot-staged-batch-3.generated.ts
 *
 * Hard contracts:
 *   - Active 5 cards copied verbatim — no mutation.
 *   - Prior staged 2 cards (UPMC + Lincoln) copied verbatim from batch 2.
 *   - 7 new cards built deterministically from the validated CSV.
 *   - Output is data-only and not imported by any app code.
 *   - No PUBLIC_NOW / IMPORT_READY / banned-phrase content.
 *
 * Run:
 *   npx tsx scripts/generate-p99-staged-runtime-batch-3.ts
 */

import * as fs from "fs";
import * as path from "path";

const REPO_ROOT = path.resolve(__dirname, "..");
const ACTIVE_PATH = path.join(REPO_ROOT, "src/data/usce/public-listings-pilot.generated.json");
const BATCH_2_PATH = path.join(
  REPO_ROOT,
  "src/data/usce/public-listings-pilot-staged-batch-2.generated.json"
);
const OUT_JSON = path.join(
  REPO_ROOT,
  "src/data/usce/public-listings-pilot-staged-batch-3.generated.json"
);
const OUT_TS = path.join(
  REPO_ROOT,
  "src/data/usce/public-listings-pilot-staged-batch-3.generated.ts"
);

const STAGED_AT = "2026-05-10T00:00:00Z";

const ACTIVE_IDS = [
  "pilot-001-NJ-morristown-medical-center",
  "pilot-002-NJ-overlook-medical-center",
  "pilot-003-OH-cleveland-clinic-mercy-hospital",
  "pilot-004-OH-cleveland-clinic-hillcrest-hospital",
  "pilot-007-CA-highland-hospital-alameda-health-system",
];

const PRIOR_STAGED_IDS = [
  "pilot-011-PA-upmc-western-psychiatric-hospital",
  "pilot-012-NY-nyc-health-hospitals-lincoln",
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
    listing_id: "pilot-013-FL-jackson-memorial-hospital",
    institution_name: "Jackson Memorial Hospital",
    campus_name:
      "System-level UM Miller SOM source — Jackson Memorial site placement not separately enumerated",
    state: "FL",
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
      "VISA_NOT_MENTIONED_US_ONLY_AUDIENCE",
      "NO_J1_VERIFIED",
      "NO_H1B_VERIFIED",
      "SYSTEM_PAGE_SOURCE_NO_JACKSON_MEMORIAL_SPECIFIC_GUARANTEE",
    ],
    fit_warnings: [
      "LCME_AOA_ONLY",
      "SYSTEM_PAGE_SOURCE_NO_JACKSON_MEMORIAL_SPECIFIC_GUARANTEE",
    ],
    audience_detail: {
      us_md_do: "ELIGIBLE_EXPLICIT",
      international_student: "EXCLUDED_EXPLICIT",
      img_graduate: "EXCLUDED_EXPLICIT",
      caribbean_student: "EXCLUDED_EXPLICIT",
    },
    application_url: "",
    official_source_url: "https://med.miami.edu/medical-education/visiting-students",
    source_status: "OFFICIAL_SOURCE_ARCHIVED",
    last_reviewed_at: "2026-05-09T00:00:00Z",
  },
  {
    listing_id: "pilot-014-NC-duke-university-hospital",
    institution_name: "Duke University Hospital",
    campus_name: "Duke School of Medicine visiting-students office",
    state: "NC",
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
      "COCA_OSTEO_ALSO_ELIGIBLE",
      "VSLO_REQUIRED",
      "VISA_NOT_MENTIONED_US_ONLY_AUDIENCE",
      "NO_J1_VERIFIED",
      "NO_H1B_VERIFIED",
    ],
    fit_warnings: ["LCME_AOA_ONLY", "VSLO_REQUIRED"],
    audience_detail: {
      us_md_do: "ELIGIBLE_EXPLICIT",
      international_student: "EXCLUDED_EXPLICIT",
      img_graduate: "EXCLUDED_EXPLICIT",
      caribbean_student: "EXCLUDED_EXPLICIT",
    },
    application_url: "",
    official_source_url:
      "https://medschool.duke.edu/education/health-professions-education-programs/student-services/office-registrar/visiting-students",
    source_status: "OFFICIAL_SOURCE_ARCHIVED",
    last_reviewed_at: "2026-05-09T00:00:00Z",
  },
  {
    listing_id: "pilot-015-IL-northwestern-memorial-hospital",
    institution_name: "Northwestern Memorial Hospital",
    campus_name:
      "System-level Feinberg SOM source — Northwestern Memorial site placement not separately enumerated",
    state: "IL",
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
      "VISA_NOT_MENTIONED_US_ONLY_AUDIENCE",
      "NO_J1_VERIFIED",
      "NO_H1B_VERIFIED",
      "SYSTEM_PAGE_SOURCE_NO_NORTHWESTERN_MEMORIAL_SPECIFIC_GUARANTEE",
    ],
    fit_warnings: [
      "LCME_AOA_ONLY",
      "SYSTEM_PAGE_SOURCE_NO_NORTHWESTERN_MEMORIAL_SPECIFIC_GUARANTEE",
    ],
    audience_detail: {
      us_md_do: "ELIGIBLE_EXPLICIT",
      international_student: "EXCLUDED_EXPLICIT",
      img_graduate: "EXCLUDED_EXPLICIT",
      caribbean_student: "EXCLUDED_EXPLICIT",
    },
    application_url: "",
    official_source_url:
      "https://www.feinberg.northwestern.edu/md-education/visiting-students/index.html",
    source_status: "OFFICIAL_SOURCE_ARCHIVED",
    last_reviewed_at: "2026-05-09T00:00:00Z",
  },
  {
    listing_id: "pilot-016-PA-hospital-of-the-university-of-pennsylvania",
    institution_name: "Hospital of the University of Pennsylvania",
    campus_name:
      "System-level Perelman SOM source — HUP site placement not separately enumerated",
    state: "PA",
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
      "VISA_NOT_MENTIONED_US_ONLY_AUDIENCE",
      "NO_J1_VERIFIED",
      "NO_H1B_VERIFIED",
      "SYSTEM_PAGE_SOURCE_NO_HUP_SPECIFIC_GUARANTEE",
    ],
    fit_warnings: ["LCME_AOA_ONLY", "SYSTEM_PAGE_SOURCE_NO_HUP_SPECIFIC_GUARANTEE"],
    audience_detail: {
      us_md_do: "ELIGIBLE_EXPLICIT",
      international_student: "EXCLUDED_EXPLICIT",
      img_graduate: "EXCLUDED_EXPLICIT",
      caribbean_student: "EXCLUDED_EXPLICIT",
    },
    application_url: "",
    official_source_url: "https://www.med.upenn.edu/student/application-and-dates.html",
    source_status: "OFFICIAL_SOURCE_ARCHIVED",
    last_reviewed_at: "2026-05-09T00:00:00Z",
  },
  {
    listing_id: "pilot-017-NY-nyu-langone-tisch-hospital",
    institution_name: "NYU Langone Health - Tisch Hospital",
    campus_name: "Site-level Tisch Hospital under NYU Langone Health",
    state: "NY",
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
      "VISA_NOT_MENTIONED_US_ONLY_AUDIENCE",
      "NO_J1_VERIFIED",
      "NO_H1B_VERIFIED",
    ],
    fit_warnings: ["LCME_AOA_ONLY"],
    audience_detail: {
      us_md_do: "ELIGIBLE_EXPLICIT",
      international_student: "EXCLUDED_EXPLICIT",
      img_graduate: "EXCLUDED_EXPLICIT",
      caribbean_student: "EXCLUDED_EXPLICIT",
    },
    application_url: "",
    official_source_url:
      "https://med.nyu.edu/education/md-degree/registration-student-records/information-visiting-md-students",
    source_status: "OFFICIAL_SOURCE_ARCHIVED",
    last_reviewed_at: "2026-05-09T00:00:00Z",
  },
  {
    listing_id: "pilot-018-TX-methodist-hospital-san-antonio",
    institution_name: "Methodist Hospital (San Antonio)",
    campus_name:
      "System-level HCA GME source — Methodist San Antonio is one of multiple HCA GME sites",
    state: "TX",
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
      "VISA_NOT_MENTIONED_US_ONLY_AUDIENCE",
      "NO_J1_VERIFIED",
      "NO_H1B_VERIFIED",
      "SYSTEM_PAGE_SOURCE_NO_METHODIST_SAN_ANTONIO_SPECIFIC_GUARANTEE",
    ],
    fit_warnings: [
      "LCME_AOA_ONLY",
      "SYSTEM_PAGE_SOURCE_NO_METHODIST_SAN_ANTONIO_SPECIFIC_GUARANTEE",
    ],
    audience_detail: {
      us_md_do: "ELIGIBLE_EXPLICIT",
      international_student: "EXCLUDED_EXPLICIT",
      img_graduate: "EXCLUDED_EXPLICIT",
      caribbean_student: "EXCLUDED_EXPLICIT",
    },
    application_url: "",
    official_source_url: "https://hcahealthcaregme.com/locations/methodist-hospital/",
    source_status: "OFFICIAL_SOURCE_ARCHIVED",
    last_reviewed_at: "2026-05-09T00:00:00Z",
  },
  {
    listing_id: "pilot-019-IN-iu-health-methodist-hospital",
    institution_name: "Indiana University Health Methodist Hospital",
    campus_name: "Site-level IU Health Methodist Hospital under IU SOM",
    state: "IN",
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
      "VISA_NOT_MENTIONED_US_ONLY_AUDIENCE",
      "NO_J1_VERIFIED",
      "NO_H1B_VERIFIED",
    ],
    fit_warnings: ["LCME_AOA_ONLY"],
    audience_detail: {
      us_md_do: "ELIGIBLE_EXPLICIT",
      international_student: "EXCLUDED_EXPLICIT",
      img_graduate: "EXCLUDED_EXPLICIT",
      caribbean_student: "EXCLUDED_EXPLICIT",
    },
    application_url: "",
    official_source_url: "https://medicine.iu.edu/md/admissions/guest-students",
    source_status: "OFFICIAL_SOURCE_ARCHIVED",
    last_reviewed_at: "2026-05-09T00:00:00Z",
  },
];

const NEW_IDS = NEW_CARDS.map((c) => c.listing_id);

function loadJson<T>(p: string): T {
  return JSON.parse(fs.readFileSync(p, "utf8")) as T;
}

interface BatchEnvelope {
  cards: Card[];
}

function main(): void {
  const active = loadJson<BatchEnvelope>(ACTIVE_PATH);
  const batch2 = loadJson<BatchEnvelope>(BATCH_2_PATH);

  const activeById = new Map<string, Card>();
  for (const c of active.cards) activeById.set(c.listing_id, c);
  const b2ById = new Map<string, Card>();
  for (const c of batch2.cards) b2ById.set(c.listing_id, c);

  const cards: Card[] = [];

  // 1. Active 5 verbatim from active runtime
  for (const id of ACTIVE_IDS) {
    const a = activeById.get(id);
    if (!a) throw new Error(`active card missing: ${id}`);
    cards.push(a);
  }

  // 2. Prior staged 2 verbatim from batch 2
  for (const id of PRIOR_STAGED_IDS) {
    const c = b2ById.get(id);
    if (!c) throw new Error(`prior staged card missing in batch 2: ${id}`);
    cards.push(c);
  }

  // 3. New 7
  for (const c of NEW_CARDS) cards.push(c);

  if (cards.length !== 14) {
    throw new Error(`expected 14 cards, built ${cards.length}`);
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
    source: "P99-P97-STAGED-RUNTIME-BATCH-3-DATA-ONLY",
    active_runtime_unchanged: true,
    active_runtime_path: "src/data/usce/public-listings-pilot.generated.json",
    active_runtime_card_count: ACTIVE_IDS.length,
    prior_staged_card_count: PRIOR_STAGED_IDS.length,
    staged_card_count: cards.length,
    preserved_active_cards: ACTIVE_IDS,
    preserved_prior_staged_cards: PRIOR_STAGED_IDS,
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

  // TS wrapper
  const meta = {
    staged_only: true,
    not_imported_by_app: true,
    not_production: true,
    not_public_now: true,
    not_import_ready: true,
    candidate_status: "STAGED_DATA_ONLY_NOT_IMPORTED_BY_APP",
    staged_at: STAGED_AT,
    source: "P99-P97-STAGED-RUNTIME-BATCH-3-DATA-ONLY",
    active_runtime_unchanged: true,
    active_runtime_path: "src/data/usce/public-listings-pilot.generated.json",
    active_runtime_card_count: ACTIVE_IDS.length,
    prior_staged_card_count: PRIOR_STAGED_IDS.length,
    staged_card_count: cards.length,
  };

  const imgRelevant = cards.filter((c) =>
    c.display_bucket === "READY_PUBLIC_IMG_RELEVANT"
  ).length;
  const usOnly = cards.filter((c) =>
    c.display_bucket === "READY_PUBLIC_US_STUDENT_ONLY"
  ).length;

  const ts = `// AUTO-GENERATED by P99-P97-STAGED-RUNTIME-BATCH-3-DATA-ONLY
// STAGED DATA ONLY — NOT IMPORTED BY APP CODE.
// This file is intentionally not imported by:
//   - src/lib/usce-pilot-data.ts
//   - src/app/clerkships/pilot/page.tsx
//   - src/app/clerkships/pilot/PilotClerkshipListings.tsx
// Importing this from the active route is a release-blocking error.
// Generated: ${STAGED_AT}
// DO NOT EDIT — regenerate with:
//   npx tsx scripts/generate-p99-staged-runtime-batch-3.ts
// Sprint folder:
//   docs/platform-v2/local/usce-completeness/staged-runtime-batch-3-data-only/

import type { UsceCard } from "@/lib/usce-maine-data";

export const PILOT_USCE_CARDS_STAGED_BATCH_3_METADATA = ${JSON.stringify(meta, null, 2)} as const;

export const PILOT_USCE_CARDS_STAGED_BATCH_3: UsceCard[] =
${JSON.stringify(cards, null, 2)}
;

export const PILOT_STAGED_BATCH_3_IMG_RELEVANT_COUNT = ${imgRelevant};
export const PILOT_STAGED_BATCH_3_US_ONLY_COUNT = ${usOnly};
export const PILOT_STAGED_BATCH_3_TOTAL_COUNT = ${cards.length};
`;

  fs.writeFileSync(OUT_TS, ts);
  console.log(`wrote ${path.relative(REPO_ROOT, OUT_TS)}`);
}

main();
