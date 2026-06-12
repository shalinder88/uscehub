// Convert a raw DOL LCA disclosure CSV (downloaded manually from OFLC) into the
// per-year employer-positions JSON that repeat-rate.ts expects.
//
// The DOL site blocks automated fetches (403), so the download is manual. This
// script handles the conversion so you don't have to touch Excel or write a
// one-off filter.
//
// USAGE
//   npx tsx scripts/visa-job-radar/process-dol-annual-csv.ts \
//     --file ~/Downloads/LCA_Disclosure_Data_FY2023.csv \
//     --year FY2023
//
// OUTPUT
//   docs/platform-v2/local/career/jobs/radar/sponsor-universe/by-year/FY2023.json
//   shape: [{"employer":"Mayo Clinic","positions":36}, ...]
//
// HOW TO GET THE FILES
//   1. Go to: https://www.dol.gov/agencies/eta/foreign-labor/performance
//   2. Under "LCA Program (H-1B, H-1B1, E-3)" → "Disclosure Data"
//   3. Download the annual Excel file for each fiscal year you want
//      (e.g. "LCA_Disclosure_Data_FY2023.xlsx", "...FY2022.xlsx", "...FY2024.xlsx")
//   4. Open each in Excel/Numbers/LibreOffice → File → Export as CSV → save.
//      Keep the default UTF-8 encoding.
//   5. Run this script once per file, e.g.:
//        npx tsx ... --file FY2023.csv --year FY2023
//   6. After all years are in by-year/, run: npx tsx .../repeat-rate.ts
//
// PHYSICIAN SOC CODES (29-12xx family — physicians and surgeons)
//   29-1210  Physicians (all)
//   29-1211  Anesthesiologists
//   29-1212  Cardiologists
//   29-1213  Dermatologists
//   29-1214  Emergency Medicine Physicians
//   29-1215  Family Medicine Physicians
//   29-1216  General Internal Medicine Physicians
//   29-1217  Hospitalists
//   29-1218  Obstetricians and Gynecologists
//   29-1221  Pediatricians
//   29-1222  Pathologists
//   29-1223  Psychiatrists
//   29-1224  Radiologists
//   29-1229  Physicians, All Other
//   29-1241  Ophthalmologists
//   29-1242  Orthopedic Surgeons
//   29-1243  Neurologists
//   29-1244  Neurological Surgeons
//   29-1248  Surgeons, All Other
//   29-1249  Plastic Surgeons
//   (also 29-1220 which covers older SOC 2010 "29-1062 Family & General Practitioners")
//
// DOL COLUMN NAMES (vary by year — this script tries several aliases)
//   Employer:  EMPLOYER_NAME, EMPLOYER_BUSINESS_NAME, EMPLOYER-NAME
//   SOC code:  SOC_CODE, SOC_TITLE (fallback for older files that merged them)
//   Status:    CASE_STATUS (keep only "Certified" / "CERTIFIED")
//   Workers:   TOTAL_WORKERS, NEW_EMPLOYMENT, CONTINUED_EMPLOYMENT
//              (script sums new+continued if TOTAL_WORKERS is absent)

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const BY_YEAR_DIR = join(
  process.cwd(),
  "docs/platform-v2/local/career/jobs/radar/sponsor-universe/by-year",
);

// ---- minimal CSV parser (handles quoted fields with embedded commas/newlines) ----

function parseCSV(raw: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let inQuotes = false;
  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i];
    if (inQuotes) {
      if (ch === '"' && raw[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        cell += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        row.push(cell);
        cell = "";
      } else if (ch === "\r" && raw[i + 1] === "\n") {
        row.push(cell);
        cell = "";
        rows.push(row);
        row = [];
        i++; // skip \n
      } else if (ch === "\n") {
        row.push(cell);
        cell = "";
        rows.push(row);
        row = [];
      } else {
        cell += ch;
      }
    }
  }
  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }
  return rows.filter((r) => r.some((c) => c.trim().length > 0));
}

// ---- column detection (DOL files use different names across years) ----

function findCol(headers: string[], ...candidates: string[]): number {
  const hLower = headers.map((h) => h.trim().toLowerCase().replace(/[-\s]+/g, "_"));
  for (const c of candidates) {
    const idx = hLower.indexOf(c.toLowerCase().replace(/[-\s]+/g, "_"));
    if (idx >= 0) return idx;
  }
  return -1;
}

// Some annual files encode SOC as "29-1216.00" — strip trailing ".00".
function normSoc(raw: string): string {
  return raw.trim().split(".")[0];
}

// DOL uses "Certified" or "CERTIFIED"; some years also have "Certified - Withdrawn"
// (counts as formerly certified, included).
function isCertified(status: string): boolean {
  const s = status.trim().toLowerCase();
  return s === "certified" || s.startsWith("certified");
}

function isPhysicianSoc(soc: string): boolean {
  return normSoc(soc).startsWith("29-12");
}

// ---- main ----

function main(): void {
  const args = process.argv.slice(2);
  const fileIdx = args.indexOf("--file");
  const yearIdx = args.indexOf("--year");

  if (fileIdx < 0 || yearIdx < 0) {
    console.error("Usage: npx tsx process-dol-annual-csv.ts --file <path.csv> --year FY2023");
    process.exitCode = 1;
    return;
  }
  const filePath = args[fileIdx + 1];
  const yearLabel = args[yearIdx + 1].toUpperCase().replace(/^(fy)?/, "FY");

  if (!existsSync(filePath)) {
    console.error("File not found: " + filePath);
    process.exitCode = 1;
    return;
  }

  console.log("Reading " + filePath + " ...");
  const raw = readFileSync(filePath, "utf8");
  const rows = parseCSV(raw);
  if (rows.length < 2) {
    console.error("CSV appears empty — check file encoding (must be UTF-8).");
    process.exitCode = 1;
    return;
  }

  const headers = rows[0];
  console.log("  Columns detected: " + headers.length);

  const colEmployer = findCol(
    headers,
    "EMPLOYER_NAME",
    "EMPLOYER_BUSINESS_NAME",
    "EMPLOYER-NAME",
    "EMPLOYER NAME",
    "EMPLOYER",
  );
  const colSoc = findCol(headers, "SOC_CODE", "SOC CODE", "SOC_CODE_ONET_DESIGNATION");
  const colStatus = findCol(headers, "CASE_STATUS", "STATUS");
  const colTotal = findCol(headers, "TOTAL_WORKERS", "TOTAL WORKERS", "TOTAL_WORKER_POSITIONS");
  const colNew = findCol(headers, "NEW_EMPLOYMENT", "NEW EMPLOYMENT");
  const colCont = findCol(headers, "CONTINUED_EMPLOYMENT", "CONTINUED EMPLOYMENT");

  if (colEmployer < 0) {
    console.error("Cannot find employer column. Headers: " + headers.slice(0, 10).join(", "));
    process.exitCode = 1;
    return;
  }
  if (colSoc < 0) {
    console.error("Cannot find SOC code column. Headers: " + headers.slice(0, 20).join(", "));
    process.exitCode = 1;
    return;
  }

  console.log(
    "  Using cols: employer=" + colEmployer + " soc=" + colSoc +
    (colStatus >= 0 ? " status=" + colStatus : " status=ABSENT(keep all)") +
    (colTotal >= 0 ? " total=" + colTotal : (colNew >= 0 ? " new=" + colNew + " cont=" + colCont : " workers=ABSENT(count 1/row)")),
  );

  const employers = new Map<string, number>(); // employer name → positions
  let rowsRead = 0;
  let rowsPhysician = 0;

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (row.length < 2) continue;
    rowsRead++;

    // Status filter
    if (colStatus >= 0) {
      const status = row[colStatus] ?? "";
      if (!isCertified(status)) continue;
    }

    // SOC filter
    const soc = row[colSoc] ?? "";
    if (!isPhysicianSoc(soc)) continue;
    rowsPhysician++;

    const employer = (row[colEmployer] ?? "").trim();
    if (!employer) continue;

    // Workers
    let workers = 1;
    if (colTotal >= 0) {
      const t = parseInt((row[colTotal] ?? "").replace(/,/g, ""), 10);
      if (!isNaN(t) && t > 0) workers = t;
    } else if (colNew >= 0 || colCont >= 0) {
      const n = parseInt((row[colNew >= 0 ? colNew : 0] ?? "0").replace(/,/g, ""), 10);
      const c = parseInt((row[colCont >= 0 ? colCont : 0] ?? "0").replace(/,/g, ""), 10);
      const sum = (isNaN(n) ? 0 : n) + (isNaN(c) ? 0 : c);
      if (sum > 0) workers = sum;
    }

    employers.set(employer, (employers.get(employer) ?? 0) + workers);
  }

  console.log(
    "  Rows processed: " + rowsRead + " total, " + rowsPhysician + " physician (SOC 29-12xx)",
  );
  console.log("  Distinct physician-sponsoring employers: " + employers.size);

  const out = Array.from(employers.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([employer, positions]) => ({ employer, positions }));

  mkdirSync(BY_YEAR_DIR, { recursive: true });
  const outPath = join(BY_YEAR_DIR, yearLabel + ".json");
  writeFileSync(outPath, JSON.stringify(out, null, 2) + "\n", "utf8");
  console.log("  Written: " + outPath);
  console.log("  Top 5 by positions:");
  for (const e of out.slice(0, 5)) console.log("    " + e.employer + " (" + e.positions + ")");
  console.log("Run repeat-rate.ts once you have >=2 year files in by-year/.");
}

main();
