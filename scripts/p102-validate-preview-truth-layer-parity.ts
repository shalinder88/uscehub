#!/usr/bin/env tsx
/**
 * P102 preview-route truth-layer parity validator.
 *
 * After the Shape C cutover, three preview surfaces and production
 * /browse should all read the same display-eligibility truth layer:
 *
 *   /browse                             (Prisma + IN filter)
 *   /usce/verified-preview              (adapter, post-Shape-C)
 *   /usce/verified-preview/browse       (adapter, sandbox preview)
 *   /usce/verified-preview/display-readiness (adapter, diagnostic)
 *
 * Validating route output directly requires a running server, which
 * isn't always available in CI. This validator instead asserts the
 * underlying invariants on the shared adapter / export, plus a few
 * spot-checks operators care about.
 *
 * Run:
 *   npx tsx scripts/p102-validate-preview-truth-layer-parity.ts
 *
 * Exits 0 on PASS, 1 on FAIL.
 */

import { readFileSync } from "node:fs";
import * as path from "node:path";

const EXPORTS_DIR = path.resolve(
  process.cwd(),
  "docs/platform-v2/local/usce-discovery-command-center/p102/exports"
);

interface DisplayRow {
  programName: string;
  state: string;
  finalUrl: string;
  badge: string;
  classification: string;
  subType: string;
  specialtyLimited?: string;
}

function load(file: string): DisplayRow[] {
  return JSON.parse(readFileSync(path.join(EXPORTS_DIR, file), "utf8")) as DisplayRow[];
}

interface CheckResult { ok: boolean; label: string; detail?: string }
const results: CheckResult[] = [];
const pass = (label: string) => results.push({ ok: true, label });
const fail = (label: string, detail?: string) => results.push({ ok: false, label, detail });

function main() {
  console.log("P102 preview-route truth-layer parity validator");

  const clinical = load("display_eligible_clinical_usce.json");
  const research = load("display_eligible_research.json");
  const hidden = load("display_hidden_or_removed.json");
  const archive = load("display_archive_negative_info.json");
  const outreach = load("display_hold_outreach.json");
  const reverify = load("display_hold_research_reverify.json");
  const manual = load("display_hold_manual_browser.json");

  const activeCount = clinical.length + research.length;

  // 1. Active count is 176 (167 clinical + 9 research).
  if (activeCount === 176) {
    pass(`active display count is 176 (got ${activeCount})`);
  } else {
    fail(`active display count is 176`, `got ${activeCount} (clinical=${clinical.length}, research=${research.length})`);
  }
  if (clinical.length === 167) pass(`clinical count is 167`);
  else fail(`clinical count is 167`, `got ${clinical.length}`);
  if (research.length === 9) pass(`research count is 9`);
  else fail(`research count is 9`, `got ${research.length}`);

  // 2. Hidden + archive + held buckets are mutually exclusive from active.
  const activeNames = new Set([...clinical, ...research].map((r) => r.programName));
  const leakageHidden = hidden.filter((r) => activeNames.has(r.programName));
  if (leakageHidden.length === 0) pass(`no hidden row leaks into active display`);
  else fail(`no hidden row leaks into active display`, leakageHidden.map((r) => r.programName).join(", "));

  const leakageArchive = archive.filter((r) => activeNames.has(r.programName));
  if (leakageArchive.length === 0) pass(`no archive (negative info) row leaks into active display`);
  else fail(`no archive (negative info) row leaks into active display`, leakageArchive.map((r) => r.programName).join(", "));

  const leakageHolds = [...outreach, ...reverify, ...manual].filter((r) => activeNames.has(r.programName));
  if (leakageHolds.length === 0) pass(`no held row leaks into active display`);
  else fail(`no held row leaks into active display`, leakageHolds.map((r) => r.programName).join(", "));

  // 3. Specialty count is 2.
  const specialty = clinical.filter((r) => r.specialtyLimited);
  if (specialty.length === 2) pass(`specialty-limited count is 2`);
  else fail(`specialty-limited count is 2`, `got ${specialty.length}: ${specialty.map((r) => r.programName).join(", ")}`);

  // 4. Operator spot-checks.
  const gw = clinical.find((r) => r.programName === "George Washington University Hospital");
  if (gw) {
    if (/visiting-students/.test(gw.finalUrl)) pass(`GW URL points at visiting-students path`);
    else fail(`GW URL points at visiting-students path`, gw.finalUrl);
    if (gw.subType === "visiting-student-elective" || gw.subType === "visiting-student-clerkship") {
      pass(`GW subType is visiting-student-elective/clerkship (not observership)`);
    } else {
      fail(`GW subType is visiting-student-elective/clerkship`, `got ${gw.subType}`);
    }
  } else {
    fail(`GW is in clinical bucket`);
  }

  const hennepin = clinical.find((r) => r.programName === "Hennepin Healthcare — Minneapolis");
  if (hennepin) {
    if (hennepin.badge === "DIRECT") pass(`Hennepin badge is DIRECT`);
    else fail(`Hennepin badge is DIRECT`, `got ${hennepin.badge}`);
  } else {
    fail(`Hennepin is in clinical bucket`);
  }

  const dmc = clinical.find((r) => r.programName === "Wayne State University / Detroit Medical Center");
  if (dmc) {
    if (/visiting-medical-student-policy|undergraduate-medical-education/.test(dmc.finalUrl)) {
      pass(`DMC URL points at UME visiting-medical-student-policy or UME landing`);
    } else {
      fail(`DMC URL points at UME visiting-medical-student-policy`, dmc.finalUrl);
    }
  } else {
    fail(`DMC is in clinical bucket`);
  }

  const bronxcare = clinical.find((r) => r.programName === "BronxCare Health System");
  if (bronxcare?.specialtyLimited) pass(`BronxCare has specialtyLimited`);
  else fail(`BronxCare has specialtyLimited`, bronxcare?.specialtyLimited);

  const carolinas = clinical.find((r) => r.programName === "Carolinas Medical Center — Atrium Health");
  if (carolinas?.specialtyLimited) pass(`Carolinas has specialtyLimited`);
  else fail(`Carolinas has specialtyLimited`, carolinas?.specialtyLimited);

  // 5. Every active row has a non-empty finalUrl that's not `#`.
  const bad = [...clinical, ...research].filter((r) => !r.finalUrl || r.finalUrl === "#");
  if (bad.length === 0) pass(`every active row has a non-empty finalUrl`);
  else fail(`every active row has a non-empty finalUrl`, bad.map((r) => r.programName).join(", "));

  // 6. Every active row's badge is in the truth-layer vocabulary.
  const validBadges = new Set(["DIRECT", "REORIENTED", "PROTECTED", "RESEARCH"]);
  const badBadges = [...clinical, ...research].filter((r) => !validBadges.has(r.badge));
  if (badBadges.length === 0) pass(`every active row's badge is in {DIRECT, REORIENTED, PROTECTED, RESEARCH}`);
  else fail(`every active row's badge is in valid set`, badBadges.map((r) => `${r.programName}=${r.badge}`).join(", "));

  // 7. Research rows all have badge=RESEARCH.
  const researchBadgeWrong = research.filter((r) => r.badge !== "RESEARCH");
  if (researchBadgeWrong.length === 0) pass(`every research row carries badge=RESEARCH`);
  else fail(`every research row carries badge=RESEARCH`, researchBadgeWrong.map((r) => `${r.programName}=${r.badge}`).join(", "));

  console.log("");
  for (const r of results) {
    console.log(`  ${r.ok ? "PASS" : "FAIL"}  ${r.label}${r.detail ? `: ${r.detail}` : ""}`);
  }
  const failed = results.filter((r) => !r.ok).length;
  console.log("");
  if (failed === 0) {
    console.log(`All ${results.length} parity checks PASS.`);
  } else {
    console.log(`FAIL — ${failed}/${results.length} checks failed.`);
    process.exit(1);
  }
}

main();
