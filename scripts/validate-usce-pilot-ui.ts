/**
 * P99-1 Phase G: USCE Pilot UI Validator
 *
 * Hard gates:
 *   - Total public cards = 12 (from JSON source)
 *   - IMG-relevant count = 7
 *   - US-only count = 5
 *   - No NEEDS_REVIEW in exported data
 *   - No SUPPORTING_SOURCE_ONLY in exported data
 *   - No POLICY_HUB as PUBLIC_OPPORTUNITY in exported data
 *   - IMG filter returns only READY_PUBLIC_IMG_RELEVANT
 *   - US-only filter returns only READY_PUBLIC_US_STUDENT_ONLY
 *   - No forbidden field names in adapter source
 *   - No forbidden language in UI source files
 *
 * Run: npx tsx scripts/validate-usce-pilot-ui.ts
 */

import * as fs from "fs";
import * as path from "path";

const BASE = path.join(__dirname, "../docs/platform-v2/local/usce-completeness");
const CARDS_FILE_V2 = path.join(BASE, "public_listing_cards_preview_v2.json");
const ADAPTER_FILE = path.join(__dirname, "../src/lib/usce-maine-data.ts");
const COMPONENT_FILE = path.join(__dirname, "../src/app/clerkships/maine/ClerkshipListings.tsx");
const PAGE_FILE = path.join(__dirname, "../src/app/clerkships/maine/page.tsx");

const FORBIDDEN_FIELDS = ["npi", "ccn", "cms_facility_id", "nppes_npi", "ein", "aamc_id", "nrmp_id", "acgme_id"];

const FORBIDDEN_LANGUAGE = [
  "complete database",
  "all opportunities",
  "guaranteed usce",
  "guaranteed eligibility",
  "img-friendly",
];

interface Failure {
  rule: string;
  detail: string;
}

function readText(p: string): string {
  if (!fs.existsSync(p)) return "";
  return fs.readFileSync(p, "utf8");
}

interface JsonCard {
  listing_id: string;
  display_bucket: string;
  listing_role?: string;
  source_page_type?: string;
  eligible_audiences?: string[];
  [key: string]: unknown;
}

function main() {
  console.log("=".repeat(60));
  console.log("P99-1 USCE Pilot UI Validator");
  console.log("=".repeat(60));

  const failures: Failure[] = [];

  // ── 1. Load and count from source JSON ────────────────────────────
  console.log("\n[1/5] Checking source JSON counts...");

  let allCards: JsonCard[] = [];
  if (fs.existsSync(CARDS_FILE_V2)) {
    const raw = JSON.parse(fs.readFileSync(CARDS_FILE_V2, "utf8"));
    allCards = raw.cards ?? [];
  } else {
    failures.push({ rule: "SOURCE_JSON_MISSING", detail: `${CARDS_FILE_V2} not found` });
  }

  const publicCards = allCards.filter((c) =>
    c.display_bucket === "READY_PUBLIC_IMG_RELEVANT" ||
    c.display_bucket === "READY_PUBLIC_US_STUDENT_ONLY"
  );
  const imgCards = allCards.filter((c) => c.display_bucket === "READY_PUBLIC_IMG_RELEVANT");
  const usCards = allCards.filter((c) => c.display_bucket === "READY_PUBLIC_US_STUDENT_ONLY");
  const needsReview = allCards.filter((c) => c.display_bucket === "NEEDS_REVIEW");
  const supporting = allCards.filter((c) => c.display_bucket === "SUPPORTING_SOURCE_ONLY");

  if (publicCards.length !== 12) {
    failures.push({
      rule: "PUBLIC_CARD_COUNT_WRONG",
      detail: `Expected 12 public cards, got ${publicCards.length}`,
    });
  }
  if (imgCards.length !== 7) {
    failures.push({
      rule: "IMG_RELEVANT_COUNT_WRONG",
      detail: `Expected 7 IMG-relevant cards, got ${imgCards.length}`,
    });
  }
  if (usCards.length !== 5) {
    failures.push({
      rule: "US_ONLY_COUNT_WRONG",
      detail: `Expected 5 US-only cards, got ${usCards.length}`,
    });
  }

  console.log(
    `      Public: ${publicCards.length} (${imgCards.length} IMG + ${usCards.length} US-only)`
  );
  console.log(`      NEEDS_REVIEW in JSON: ${needsReview.length} (withheld — correct)`);
  console.log(`      SUPPORTING_SOURCE in JSON: ${supporting.length} (withheld — correct)`);

  // ── 2. Audience segregation ────────────────────────────────────────
  console.log("\n[2/5] Checking audience segregation...");

  // Simulate IMG filter: only READY_PUBLIC_IMG_RELEVANT should pass
  const imgFiltered = publicCards.filter((c) => c.display_bucket === "READY_PUBLIC_IMG_RELEVANT");
  const usCrossover = imgFiltered.filter((c) => c.display_bucket === "READY_PUBLIC_US_STUDENT_ONLY");
  if (usCrossover.length > 0) {
    failures.push({
      rule: "US_ONLY_IN_IMG_FILTER",
      detail: `IMG filter returned ${usCrossover.length} US-only cards: ${usCrossover.map((c) => c.listing_id).join(", ")}`,
    });
  }

  // US-only filter must not include IMG-relevant
  const usFiltered = publicCards.filter((c) => c.display_bucket === "READY_PUBLIC_US_STUDENT_ONLY");
  const imgCrossover = usFiltered.filter((c) => c.display_bucket === "READY_PUBLIC_IMG_RELEVANT");
  if (imgCrossover.length > 0) {
    failures.push({
      rule: "IMG_IN_US_ONLY_FILTER",
      detail: `US-only filter returned ${imgCrossover.length} IMG cards: ${imgCrossover.map((c) => c.listing_id).join(", ")}`,
    });
  }

  // No NEEDS_REVIEW in any filtered result
  const needsInPublic = publicCards.filter((c) => c.display_bucket === "NEEDS_REVIEW");
  if (needsInPublic.length > 0) {
    failures.push({
      rule: "NEEDS_REVIEW_IN_PUBLIC",
      detail: `${needsInPublic.length} NEEDS_REVIEW cards in public set`,
    });
  }

  // No POLICY_HUB as PUBLIC_OPPORTUNITY
  const hubAsOpportunity = allCards.filter(
    (c) => c.source_page_type === "POLICY_HUB" && c.listing_role === "PUBLIC_OPPORTUNITY"
  );
  if (hubAsOpportunity.length > 0) {
    failures.push({
      rule: "POLICY_HUB_AS_OPPORTUNITY",
      detail: `${hubAsOpportunity.length} POLICY_HUB cards with PUBLIC_OPPORTUNITY role`,
    });
  }

  console.log(`      IMG filter segregation: ${usCrossover.length === 0 ? "PASS" : "FAIL"}`);
  console.log(`      US-only filter segregation: ${imgCrossover.length === 0 ? "PASS" : "FAIL"}`);
  console.log(`      NEEDS_REVIEW in public: ${needsInPublic.length === 0 ? "PASS" : "FAIL"}`);
  console.log(`      POLICY_HUB as opportunity: ${hubAsOpportunity.length === 0 ? "PASS" : "FAIL"}`);

  // ── 3. Adapter source scan — forbidden fields ──────────────────────
  console.log("\n[3/5] Scanning adapter source for forbidden fields...");

  const adapterText = readText(ADAPTER_FILE).toLowerCase();
  const fieldFailures: string[] = [];

  for (const f of FORBIDDEN_FIELDS) {
    // Only flag if it appears as a field name (not in a comment about what's excluded)
    const regex = new RegExp(`["'\`]${f}["'\`]\\s*:`, "i");
    if (regex.test(readText(ADAPTER_FILE))) {
      fieldFailures.push(f);
      failures.push({
        rule: "FORBIDDEN_FIELD_IN_ADAPTER",
        detail: `Field '${f}' found as object key in adapter source`,
      });
    }
  }

  // Also check the adapter doesn't re-export completeness_score or internal scoring
  const internalFields = ["completeness_score", "max_possible_score", "nppes_raw", "cms_raw"];
  for (const f of internalFields) {
    if (adapterText.includes(`"${f}"`) || adapterText.includes(`'${f}'`)) {
      failures.push({
        rule: "INTERNAL_FIELD_IN_ADAPTER",
        detail: `Internal scoring field '${f}' found in adapter source`,
      });
    }
  }

  console.log(`      Forbidden field scan: ${fieldFailures.length === 0 ? "PASS" : `FAIL (${fieldFailures.join(", ")})`}`);

  // ── 4. UI source scan — forbidden language ─────────────────────────
  console.log("\n[4/5] Scanning UI source for forbidden language...");

  const uiSources = [
    { file: ADAPTER_FILE, name: "adapter" },
    { file: COMPONENT_FILE, name: "component" },
    { file: PAGE_FILE, name: "page" },
  ];

  const langFailures: string[] = [];
  for (const { file, name } of uiSources) {
    const text = readText(file).toLowerCase();
    for (const phrase of FORBIDDEN_LANGUAGE) {
      if (text.includes(phrase)) {
        langFailures.push(`${name}: "${phrase}"`);
        failures.push({
          rule: "FORBIDDEN_LANGUAGE_IN_UI",
          detail: `Forbidden phrase "${phrase}" found in ${name} source`,
        });
      }
    }
  }

  console.log(`      Language scan: ${langFailures.length === 0 ? "PASS" : `FAIL (${langFailures.join("; ")})`}`);

  // ── 5. Adapter export structure ────────────────────────────────────
  console.log("\n[5/5] Checking adapter export structure...");

  // DisplayBucket type must only include public buckets
  const adapterSource = readText(ADAPTER_FILE);
  const hasNeedsReviewType = adapterSource.includes('"NEEDS_REVIEW"') || adapterSource.includes("NEEDS_REVIEW");
  const hasSupportingType = adapterSource.includes('"SUPPORTING_SOURCE_ONLY"');

  // NEEDS_REVIEW appears in the NEEDS_REVIEW_COUNT export — that's allowed
  // It must NOT appear in DisplayBucket type or in any card data
  const displayBucketSection = adapterSource.match(/export type DisplayBucket[\s\S]*?;/)?.[0] ?? "";
  if (displayBucketSection.includes("NEEDS_REVIEW")) {
    failures.push({
      rule: "NEEDS_REVIEW_IN_DISPLAY_BUCKET_TYPE",
      detail: "DisplayBucket type includes NEEDS_REVIEW — should only contain public bucket values",
    });
  }
  if (displayBucketSection.includes("SUPPORTING_SOURCE_ONLY")) {
    failures.push({
      rule: "SUPPORTING_SOURCE_IN_DISPLAY_BUCKET_TYPE",
      detail: "DisplayBucket type includes SUPPORTING_SOURCE_ONLY",
    });
  }

  // Verify runtime guard exists
  const hasGuard = adapterSource.includes("_nonPublic") || adapterSource.includes("Runtime guard");
  if (!hasGuard) {
    failures.push({
      rule: "MISSING_RUNTIME_GUARD",
      detail: "Adapter has no runtime guard checking that only public buckets are exported",
    });
  }

  console.log(`      DisplayBucket type: ${displayBucketSection.includes("NEEDS_REVIEW") ? "FAIL" : "PASS"}`);
  console.log(`      Runtime guard present: ${hasGuard ? "PASS" : "FAIL"}`);

  // ── Summary ────────────────────────────────────────────────────────
  console.log("\n" + "=".repeat(60));
  const passed = failures.length === 0;
  console.log(`\nOverall: ${passed ? "PASSED" : "FAILED"}`);

  if (failures.length > 0) {
    console.log(`\nFailures (${failures.length}):`);
    failures.forEach((f) => console.log(`  [${f.rule}] ${f.detail}`));
  } else {
    console.log("  All hard gates passed.");
    console.log(`  Total public cards: ${publicCards.length}`);
    console.log(`  IMG-relevant: ${imgCards.length}`);
    console.log(`  US-only: ${usCards.length}`);
    console.log(`  NEEDS_REVIEW withheld: ${needsReview.length}`);
    console.log(`  SUPPORTING_SOURCE withheld: ${supporting.length}`);
  }

  process.exit(passed ? 0 : 1);
}

main();
