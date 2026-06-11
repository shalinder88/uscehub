// Phase A: measure the year-over-year SPONSOR REPEAT RATE — the one number the
// whole >=90% coverage thesis rests on. If employers that sponsored a physician
// H-1B last year overwhelmingly sponsor again this year, then monitoring the
// known-sponsor universe captures ~90% of next year's jobs.
//
//   npx tsx scripts/visa-job-radar/repeat-rate.ts
//
// BLOCKER (honest): the DOL data already in the repo is a single combined
// snapshot (FY2024 Q4 + FY2025 Q3) with NO per-record year tag, so the repeat
// rate CANNOT be computed from it. This tool is the "way to make it work": it runs
// the moment the operator drops per-year employer lists into the by-year dir. The
// DOL site 403s automated fetches, so the files are produced by a manual download
// of the annual LCA disclosure files, filtered to physician SOC codes.

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { normEmployer } from "./sponsor-universe";

const BY_YEAR_DIR = join(
  process.cwd(),
  "docs/platform-v2/local/career/jobs/radar/sponsor-universe/by-year",
);

interface YearFile {
  year: number;
  employers: Map<string, number>; // normKey -> positions (or 1 if unknown)
}

function loadYears(): YearFile[] {
  if (!existsSync(BY_YEAR_DIR)) return [];
  const out: YearFile[] = [];
  for (const f of readdirSync(BY_YEAR_DIR)) {
    if (!f.endsWith(".json")) continue;
    const yearMatch = f.match(/(\d{4})/);
    if (!yearMatch) continue;
    const year = Number(yearMatch[1]);
    let rows: Array<{ employer?: string; e?: string; positions?: number; p?: number }>;
    try {
      rows = JSON.parse(readFileSync(join(BY_YEAR_DIR, f), "utf8"));
    } catch {
      continue;
    }
    const employers = new Map<string, number>();
    for (const r of rows) {
      const name = r.employer ?? r.e;
      if (!name) continue;
      const key = normEmployer(name);
      if (!key) continue;
      employers.set(key, (employers.get(key) ?? 0) + (r.positions ?? r.p ?? 1));
    }
    if (employers.size > 0) out.push({ year, employers });
  }
  out.sort((a, b) => a.year - b.year);
  return out;
}

function instructions(): string {
  return [
    "# Phase A — Sponsor repeat-rate: AWAITING DATA",
    "",
    "The repeat rate cannot be computed from the repo's single combined DOL snapshot",
    "(FY2024 Q4 + FY2025 Q3, no per-record year tag). To run this validation:",
    "",
    "1. Download the annual LCA disclosure files (one per fiscal year, e.g. FY2022,",
    "   FY2023, FY2024) from DOL OFLC: https://www.dol.gov/agencies/eta/foreign-labor/performance",
    "   (manual download — the site 403s automated fetches).",
    "2. Filter each to physician SOC codes (29-1210 family incl 29-1215/29-1216,",
    "   29-122x, 29-124x surgeons).",
    "3. Export each year as JSON to:",
    "     " + BY_YEAR_DIR + "/FY2022.json  (etc.)",
    "   shape: [{\"employer\":\"Mayo Clinic\",\"positions\":36}, ...]",
    "4. Re-run: npx tsx scripts/visa-job-radar/repeat-rate.ts",
    "",
    "The tool then reports the unweighted and position-weighted year-over-year repeat",
    "rate. If the volume-weighted repeat is >=~80%, the >=90% coverage thesis is",
    "validated: monitoring the known-sponsor universe captures most of next year's jobs.",
    "",
  ].join("\n");
}

function main(): void {
  const years = loadYears();
  mkdirSync(BY_YEAR_DIR, { recursive: true });

  if (years.length < 2) {
    const msg = instructions();
    writeFileSync(join(BY_YEAR_DIR, "_REPEAT_RATE_README.md"), msg, "utf8");
    console.log("Phase A repeat-rate analyzer: ready, but AWAITING DATA (" + years.length + " year file(s) found, need >=2).");
    console.log("Wrote drop-in instructions to " + join(BY_YEAR_DIR, "_REPEAT_RATE_README.md"));
    return;
  }

  const lines: string[] = ["# Phase A — Sponsor repeat-rate results", ""];
  for (let i = 1; i < years.length; i++) {
    const prev = years[i - 1];
    const cur = years[i];
    let repeatEmployers = 0;
    let curPositions = 0;
    let repeatPositions = 0;
    for (const [key, pos] of cur.employers) {
      curPositions += pos;
      if (prev.employers.has(key)) {
        repeatEmployers++;
        repeatPositions += pos;
      }
    }
    const unweighted = Math.round((repeatEmployers / cur.employers.size) * 1000) / 10;
    const weighted = Math.round((repeatPositions / curPositions) * 1000) / 10;
    lines.push("## FY" + cur.year + " vs FY" + prev.year);
    lines.push("- Sponsors in FY" + cur.year + ": " + cur.employers.size);
    lines.push("- Also sponsored in FY" + prev.year + ": " + repeatEmployers + " (" + unweighted + "% unweighted)");
    lines.push("- **Position-weighted repeat rate: " + weighted + "%**");
    lines.push("- Verdict: " + (weighted >= 80 ? "PASS — monitoring the universe captures most of next year's jobs (>=90% thesis holds)" : weighted >= 60 ? "PARTIAL — head is persistent; expect a meaningful new-sponsor tail" : "WEAK — high churn; the enumerate-and-monitor thesis needs rework"));
    lines.push("");
    console.log("FY" + cur.year + " vs FY" + prev.year + ": " + weighted + "% position-weighted repeat (" + unweighted + "% unweighted)");
  }
  writeFileSync(join(BY_YEAR_DIR, "repeat_rate_results.md"), lines.join("\n"), "utf8");
  console.log("Wrote " + join(BY_YEAR_DIR, "repeat_rate_results.md"));
}

main();
