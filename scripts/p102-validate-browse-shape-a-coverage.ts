#!/usr/bin/env tsx
/**
 * P102 Shape A — /browse coverage validator.
 *
 * Verifies the invariant that production /browse will hold after the
 * Shape A cutover lands:
 *
 *   (set of APPROVED Prisma listing.title)
 *     ⊆  (set of active display-eligible program names)
 *
 *   AND
 *
 *   (set of active display-eligible program names that are NOT
 *      data.js duplicates and have a Prisma row)
 *     ⊆  (set of APPROVED Prisma listing.title)
 *
 * If a row is APPROVED in Prisma but NOT in the active display set,
 * the new `title IN (active set)` filter on /browse will silently hide
 * it. The first check catches that.
 *
 * If a row is in the active display set but NOT in Prisma, the seed
 * never wrote it. The second check catches that.
 *
 * Run modes:
 *   npx tsx scripts/p102-validate-browse-shape-a-coverage.ts          # offline check (export-only)
 *   npx tsx scripts/p102-validate-browse-shape-a-coverage.ts --with-db # full check (requires DATABASE_URL)
 *
 * Exits 0 if PASS, 1 if FAIL.
 */

import { readFileSync } from "node:fs";
import * as path from "node:path";

const EXPORTS_DIR = path.resolve(
  process.cwd(),
  "docs/platform-v2/local/usce-discovery-command-center/p102/exports"
);

interface DisplayRow {
  programName: string;
  classification: string;
  badge: string;
}

function loadExport(file: string): DisplayRow[] {
  const full = path.join(EXPORTS_DIR, file);
  return JSON.parse(readFileSync(full, "utf8")) as DisplayRow[];
}

function loadDataJsNameCounts(): Map<string, number> {
  const DATA_JS = "/Users/shelly/usmle-observerships/data.js";
  const t = readFileSync(DATA_JS, "utf8");
  const m = t.match(/const PROGRAMS = \[([\s\S]*?)\];/);
  if (!m) throw new Error("Could not parse PROGRAMS from data.js");
  // eslint-disable-next-line no-eval
  const progs = eval("[" + m[1] + "]") as { name: string }[];
  const counts = new Map<string, number>();
  for (const p of progs) counts.set(p.name, (counts.get(p.name) ?? 0) + 1);
  return counts;
}

interface CheckResult { ok: boolean; label: string; detail?: string }
const results: CheckResult[] = [];

function pass(label: string) { results.push({ ok: true, label }); }
function fail(label: string, detail?: string) { results.push({ ok: false, label, detail }); }

async function main(): Promise<void> {
  console.log("P102 Shape A /browse coverage validator");

  const clinical = loadExport("display_eligible_clinical_usce.json");
  const research = loadExport("display_eligible_research.json");
  const activeNames = new Set([
    ...clinical.map((r) => r.programName),
    ...research.map((r) => r.programName),
  ]);
  console.log(`  active display-eligible unique names: ${activeNames.size}`);
  console.log(`  active display-eligible row count:    ${clinical.length + research.length}`);

  // Offline check 1: every active name is also in data.js (sanity).
  const dataNames = loadDataJsNameCounts();
  const orphanedActive = [...activeNames].filter((n) => !dataNames.has(n));
  if (orphanedActive.length === 0) {
    pass("every active display-eligible name exists in data.js");
  } else {
    fail(
      "every active display-eligible name exists in data.js",
      `orphans: ${orphanedActive.slice(0, 5).join(", ")}${
        orphanedActive.length > 5 ? ` (+${orphanedActive.length - 5} more)` : ""
      }`
    );
  }

  // Offline check 2: no duplicate names within a single export bucket.
  const clinicalNames = new Map<string, number>();
  for (const r of clinical) clinicalNames.set(r.programName, (clinicalNames.get(r.programName) ?? 0) + 1);
  const clinicalOverflow = [...clinicalNames.entries()].filter(([n, c]) => c > (dataNames.get(n) ?? 0));
  if (clinicalOverflow.length === 0) pass("clinical bucket has no programName overflow vs data.js");
  else fail("clinical bucket has no programName overflow vs data.js", clinicalOverflow.map(([n, c]) => `${n}(${c})`).join(", "));

  // Optional DB check (requires DATABASE_URL).
  const wantDb = process.argv.includes("--with-db");
  if (wantDb) {
    try {
      const { PrismaClient } = await import("@prisma/client");
      const prisma = new PrismaClient();
      const approved = await prisma.listing.findMany({
        where: { status: "APPROVED" },
        select: { id: true, title: true },
      });
      const approvedTitles = new Set(approved.map((l) => l.title));
      console.log(`  Prisma APPROVED rows: ${approved.length}`);

      const ghostInProd = [...approvedTitles].filter((t) => !activeNames.has(t));
      if (ghostInProd.length === 0) {
        pass(`every APPROVED Prisma row is in the active display set (${approved.length} rows)`);
      } else {
        fail(
          "every APPROVED Prisma row is in the active display set",
          `would be silently hidden by Shape A filter: ${ghostInProd.slice(0, 5).join(", ")}${
            ghostInProd.length > 5 ? ` (+${ghostInProd.length - 5} more)` : ""
          }`
        );
      }

      const missingFromDb = [...activeNames].filter((n) => !approvedTitles.has(n));
      if (missingFromDb.length === 0) {
        pass(`every active display-eligible name has an APPROVED Prisma row`);
      } else {
        fail(
          "every active display-eligible name has an APPROVED Prisma row",
          `seed missed: ${missingFromDb.slice(0, 5).join(", ")}${
            missingFromDb.length > 5 ? ` (+${missingFromDb.length - 5} more)` : ""
          }`
        );
      }

      await prisma.$disconnect();
    } catch (e) {
      fail("Prisma connection", e instanceof Error ? e.message : String(e));
    }
  } else {
    console.log("  (skipping DB check; pass --with-db to enable)");
  }

  console.log("");
  for (const r of results) {
    console.log(`  ${r.ok ? "PASS" : "FAIL"}  ${r.label}${r.detail ? `: ${r.detail}` : ""}`);
  }
  const failed = results.filter((r) => !r.ok).length;
  console.log("");
  if (failed === 0) {
    console.log(`All ${results.length} checks PASS.`);
  } else {
    console.log(`FAIL — ${failed}/${results.length} checks failed.`);
    process.exit(1);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
