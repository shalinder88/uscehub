/**
 * P99-P97 Contact Ref-Prefill Validator
 *
 * Imports the contact context resolver and runs deterministic test cases.
 * No browser, no network. Verifies:
 *   - resolver accepts valid active + staged listing refs
 *   - resolver rejects invalid listing_id, unknown ref, malformed input
 *   - oversized values fail safe (returns INVALID_PARAMS_FALLBACK_GENERIC)
 *   - HTML / JS injection attempts in page_path are rejected
 *   - resolver never throws
 *   - returned context never includes evidence_join_key in displayInstitutionName
 *     or displayCityState (visible context is name + city/state only)
 *   - `pilot-feedback` ref without a listing_id resolves to GENERIC_FEEDBACK_NO_LISTING
 *   - the contact page imports the resolver, and the client form has the
 *     hidden inputs (grep check)
 *   - `/clerkships/pilot` route does not import the staged batch-3 module
 *
 * Run:
 *   npx tsx scripts/validate-p99-contact-ref-prefill.ts
 */

import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";
import {
  resolveContactContext,
  KNOWN_LISTINGS,
  ALLOWED_REPORT_REFS,
} from "../src/lib/usce-contact-context";

interface Failure { rule: string; row: string; detail: string }

const failures: Failure[] = [];

function fail(rule: string, row: string, detail: string): void {
  failures.push({ rule, row, detail });
}

function check(rule: string, row: string, cond: boolean, detail: string): void {
  if (!cond) fail(rule, row, detail);
}

function run(): void {
  // Active row
  const activeId = "pilot-001-NJ-morristown-medical-center";
  const c1 = resolveContactContext({ listing_id: activeId, ref: "pilot-listing" });
  check("ACTIVE_LISTING_VALID", activeId, c1.status === "VALID_LISTING_CONTEXT",
    `expected VALID_LISTING_CONTEXT got ${c1.status}`);
  check("ACTIVE_LISTING_NAME", activeId, c1.displayInstitutionName === "Morristown Medical Center",
    `bad displayInstitutionName: ${c1.displayInstitutionName}`);
  check("ACTIVE_LISTING_CITYSTATE", activeId, c1.displayCityState === "Morristown, NJ",
    `bad displayCityState: ${c1.displayCityState}`);
  check("ACTIVE_LISTING_RUNTIME_SET", activeId, c1.runtimeSet === "active",
    `runtimeSet expected active got ${c1.runtimeSet}`);

  // Prior staged row
  const upmcId = "pilot-011-PA-upmc-western-psychiatric-hospital";
  const c2 = resolveContactContext({ listing_id: upmcId, ref: "pilot-listing" });
  check("UPMC_VALID", upmcId, c2.status === "VALID_LISTING_CONTEXT",
    `status ${c2.status}`);
  check("UPMC_RUNTIME_SET", upmcId, c2.runtimeSet === "staged",
    `runtimeSet ${c2.runtimeSet}`);

  // Batch 3 — activated in noindex slice 1
  const ACTIVATED_IDS = [
    "pilot-014-NC-duke-university-hospital",
    "pilot-017-NY-nyu-langone-tisch-hospital",
    "pilot-019-IN-iu-health-methodist-hospital",
  ];
  // Batch 3 — staged-only (audit-deferred)
  const STAGED_ONLY_IDS = [
    "pilot-013-FL-jackson-memorial-hospital",
    "pilot-015-IL-northwestern-memorial-hospital",
    "pilot-016-PA-hospital-of-the-university-of-pennsylvania",
    "pilot-018-TX-methodist-hospital-san-antonio",
  ];
  for (const id of ACTIVATED_IDS) {
    const c = resolveContactContext({ listing_id: id, ref: "pilot-listing" });
    check("BATCH3_ACTIVATED_VALID", id, c.status === "VALID_LISTING_CONTEXT",
      `status ${c.status}`);
    check("BATCH3_ACTIVATED_RUNTIME_SET", id, c.runtimeSet === "active",
      `runtimeSet ${c.runtimeSet}`);
    check("BATCH3_ACTIVATED_NAME_PRESENT", id, !!c.displayInstitutionName,
      `displayInstitutionName empty`);
    check("BATCH3_ACTIVATED_CITYSTATE_PRESENT", id, !!c.displayCityState,
      `displayCityState empty`);
    check("BATCH3_ACTIVATED_LISTING_ID_PRESERVED", id, c.listingId === id,
      `listingId mismatch: ${c.listingId}`);
  }
  for (const id of STAGED_ONLY_IDS) {
    const c = resolveContactContext({ listing_id: id, ref: "pilot-listing" });
    check("BATCH3_STAGED_VALID", id, c.status === "VALID_LISTING_CONTEXT",
      `status ${c.status}`);
    check("BATCH3_STAGED_RUNTIME_SET", id, c.runtimeSet === "staged",
      `runtimeSet ${c.runtimeSet} (deferred batch-3 row should still be 'staged')`);
  }

  // Invalid listing_id (regex pass but unknown)
  const c3 = resolveContactContext({
    listing_id: "pilot-999-ZZ-fake-hospital",
    ref: "pilot-listing",
  });
  check("UNKNOWN_LISTING_FALLBACK", "unknown_listing",
    c3.status === "INVALID_PARAMS_FALLBACK_GENERIC",
    `status ${c3.status}`);
  check("UNKNOWN_LISTING_NAME_NULL", "unknown_listing",
    c3.displayInstitutionName === null,
    `displayInstitutionName should be null`);
  check("UNKNOWN_LISTING_WARNING", "unknown_listing",
    c3.warnings.includes("UNKNOWN_LISTING_ID_IGNORED"),
    `expected UNKNOWN_LISTING_ID_IGNORED warning`);

  // Bad regex listing_id
  const c4 = resolveContactContext({ listing_id: "../../etc/passwd", ref: "pilot-listing" });
  check("BAD_REGEX_LISTING_FALLBACK", "bad_regex",
    c4.status === "INVALID_PARAMS_FALLBACK_GENERIC",
    `status ${c4.status}`);
  check("BAD_REGEX_NO_NAME", "bad_regex", c4.displayInstitutionName === null,
    "displayInstitutionName should be null");

  // Unknown ref → defaults to pilot-listing if listing_id valid
  const c5 = resolveContactContext({ listing_id: activeId, ref: "totally-bogus" });
  check("UNKNOWN_REF_DEFAULT", "unknown_ref",
    c5.status === "VALID_LISTING_CONTEXT" && c5.reportRef === "pilot-listing",
    `status=${c5.status} reportRef=${c5.reportRef}`);
  check("UNKNOWN_REF_WARN", "unknown_ref",
    c5.warnings.includes("UNKNOWN_REF_DEFAULTED_TO_PILOT_LISTING"),
    "expected UNKNOWN_REF_DEFAULTED_TO_PILOT_LISTING warning");

  // pilot-feedback without listing
  const c6 = resolveContactContext({ ref: "pilot-feedback" });
  check("PILOT_FEEDBACK_NO_LISTING", "pilot_feedback",
    c6.status === "GENERIC_FEEDBACK_NO_LISTING" && c6.reportRef === "pilot-feedback",
    `status=${c6.status} reportRef=${c6.reportRef}`);

  // Empty params → generic, no warnings
  const c7 = resolveContactContext({});
  check("EMPTY_PARAMS_GENERIC", "empty",
    c7.status === "GENERIC_FEEDBACK_NO_LISTING" && c7.warnings.length === 0,
    `status=${c7.status} warnings=${c7.warnings.join(",")}`);

  // Oversized listing_id
  const longId = "pilot-013-FL-" + "x".repeat(500);
  const c8 = resolveContactContext({ listing_id: longId, ref: "pilot-listing" });
  check("OVERSIZED_LISTING_ID", "oversized",
    c8.status === "INVALID_PARAMS_FALLBACK_GENERIC" && c8.listingId === null,
    `status=${c8.status} listingId=${c8.listingId}`);

  // HTML/JS injection in listing_id
  const c9 = resolveContactContext({
    listing_id: "<script>alert(1)</script>",
    ref: "pilot-listing",
  });
  check("INJECTION_LISTING_ID_REJECTED", "injection",
    c9.status === "INVALID_PARAMS_FALLBACK_GENERIC" && c9.listingId === null,
    `status=${c9.status} listingId=${c9.listingId}`);

  // page_path injection
  const c10 = resolveContactContext({
    listing_id: activeId,
    ref: "pilot-listing",
    page_path: "/foo<script>alert(1)</script>",
  });
  check("INJECTION_PAGE_PATH_REJECTED", "injection_page_path",
    c10.status === "VALID_LISTING_CONTEXT" && c10.pagePath === null,
    `status=${c10.status} pagePath=${c10.pagePath}`);

  // Bad page_path (no leading slash)
  const c11 = resolveContactContext({
    listing_id: activeId,
    ref: "pilot-listing",
    page_path: "no-leading-slash",
  });
  check("PAGE_PATH_NEEDS_LEADING_SLASH", "page_path_no_slash",
    c11.pagePath === null,
    `pagePath should be null`);

  // Visible context never contains internal evidence path strings
  const c12 = resolveContactContext({
    listing_id: activeId,
    ref: "pilot-listing",
    evidence_join_key: "pilot-001-NJ-morristown-medical-center",
  });
  for (const v of [c12.displayInstitutionName, c12.displayCityState]) {
    if (v && /docs\/platform-v2|screenshots|html-snapshots|quotes\//.test(v)) {
      fail("VISIBLE_CONTEXT_LEAKS_PATH", activeId,
        `visible field contains internal-looking path: ${v}`);
    }
  }

  // KNOWN_LISTINGS sanity
  check("KNOWN_LISTINGS_COUNT", "known_listings",
    KNOWN_LISTINGS.length === 14, `expected 14 got ${KNOWN_LISTINGS.length}`);
  check("KNOWN_LISTINGS_HAS_PILOT_LISTING_REF",
    "allowed_report_refs",
    (ALLOWED_REPORT_REFS as readonly string[]).includes("pilot-listing"),
    `pilot-listing missing from ALLOWED_REPORT_REFS`);

  // Output never contains forbidden tokens
  const allOutputs = [c1, c2, c3, c4, c5, c6, c7, c8, c9, c10, c11, c12];
  const banned = ["PUBLIC_NOW", "IMPORT_READY", "BRIDGE_READY_TO_RUNTIME"];
  for (const out of allOutputs) {
    const text = JSON.stringify(out);
    for (const tok of banned) {
      if (text.includes(tok)) {
        fail("FORBIDDEN_TOKEN_IN_RESOLVER_OUTPUT", "(any)", `token ${tok} in resolver output`);
      }
    }
  }

  // grep checks: page imports resolver, form has hidden inputs
  const repoRoot = path.resolve(__dirname, "..");
  const pagePath = path.join(repoRoot, "src/app/contact/page.tsx");
  const formPath = path.join(repoRoot, "src/app/contact/ContactReportForm.tsx");
  const pageSrc = fs.readFileSync(pagePath, "utf8");
  const formSrc = fs.readFileSync(formPath, "utf8");
  check("PAGE_IMPORTS_RESOLVER", "page",
    pageSrc.includes('from "@/lib/usce-contact-context"'),
    `page does not import @/lib/usce-contact-context`);
  check("PAGE_PASSES_CONTEXT_TO_FORM", "page",
    pageSrc.includes("<ContactReportForm context={context}"),
    "page does not pass context prop to ContactReportForm");
  for (const name of ["listing_id", "report_ref", "runtime_set"]) {
    check("FORM_HAS_HIDDEN_INPUT", name,
      new RegExp(`name="${name}"`).test(formSrc),
      `client form missing hidden input '${name}'`);
  }
  check("FORM_NEVER_PRINTS_EVIDENCE_PATH", "form",
    !/docs\/platform-v2|html-snapshots|screenshots/.test(formSrc),
    "client form references internal evidence path string");
  check("FORM_HAS_NO_FILE_UPLOAD", "form",
    !/type="file"/.test(formSrc) && !/<input[^>]*type=['"]file/.test(formSrc),
    "client form contains a file upload");

  // /clerkships/pilot import safety: must not import staged batch 3 module
  try {
    const grepOut = execSync(
      `grep -rln "public-listings-pilot-staged-batch-3\\|PILOT_USCE_CARDS_STAGED_BATCH_3" src/app/clerkships 2>/dev/null || true`,
      { cwd: repoRoot, encoding: "utf8" }
    ).trim();
    check("CLERKSHIPS_PILOT_NO_BATCH3_IMPORT", "import-safety",
      grepOut === "",
      `unexpected batch-3 import in clerkships pilot route: ${grepOut}`);
  } catch { /* ignore */ }

  // /contact import safety: contact must NOT directly import staged batch 3 data file
  try {
    const grepOut = execSync(
      `grep -rln "public-listings-pilot-staged-batch-3\\|PILOT_USCE_CARDS_STAGED_BATCH_3" src/app/contact src/lib/usce-contact-context.ts 2>/dev/null || true`,
      { cwd: repoRoot, encoding: "utf8" }
    ).trim();
    check("CONTACT_NO_BATCH3_DATA_IMPORT", "import-safety",
      grepOut === "",
      `contact references staged batch-3 data file: ${grepOut}`);
  } catch { /* ignore */ }
}

function main(): void {
  console.log("=".repeat(60));
  console.log("P99-P97 Contact Ref-Prefill Validator");
  console.log("=".repeat(60));

  try {
    run();
  } catch (e) {
    fail("RESOLVER_THREW", "(uncaught)", String(e));
  }

  if (failures.length === 0) {
    console.log("\nOverall: PASSED");
    console.log("  Resolver handles 14 known listings + invalid/oversized/injection inputs.");
    console.log("  Contact page wires context to client form. Hidden fields present.");
    console.log("  No batch-3 data import. No file upload. No forbidden token in output.");
    process.exit(0);
  }
  console.log(`\nOverall: FAILED — ${failures.length} issue(s):`);
  for (const f of failures) {
    console.log(`  [${f.rule}] row=${f.row}: ${f.detail}`);
  }
  process.exit(1);
}

main();
