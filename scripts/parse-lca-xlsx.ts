#!/usr/bin/env npx tsx
/**
 * Parse DOL LCA disclosure Excel file and extract physician H-1B records.
 *
 * Usage: npx tsx scripts/parse-lca-xlsx.ts /tmp/lca-fy2025-q3.xlsx
 *
 * Output: scripts/output/physician-sponsors.json
 */
import * as XLSX from "xlsx";
import * as fs from "fs";
import * as path from "path";

const PHYSICIAN_SOC_PREFIX = "29-12";

const SOC_TO_SPECIALTY: Record<string, string> = {
  "29-1211": "Anesthesiology",
  "29-1212": "Cardiology",
  "29-1213": "Dermatology",
  "29-1214": "Emergency Medicine",
  "29-1215": "Family Medicine",
  "29-1216": "Internal Medicine",
  "29-1217": "Neurology",
  "29-1218": "OB/GYN",
  "29-1221": "Pediatrics",
  "29-1222": "Pathology",
  "29-1223": "Psychiatry",
  "29-1224": "Radiology",
  "29-1229": "Physician (Other)",
};

interface PhysicianRecord {
  employer: string;
  employerCity: string;
  employerState: string;
  worksiteCity: string;
  worksiteState: string;
  socCode: string;
  specialty: string;
  jobTitle: string;
  salaryFrom: number;
  salaryTo: number;
  salaryUnit: string;
  prevailingWage: number;
  caseStatus: string;
  visaClass: string;
  fullTime: boolean;
  naicsCode: string;
}

function main() {
  const inputFile = process.argv[2];
  if (!inputFile) {
    console.error("Usage: npx tsx scripts/parse-lca-xlsx.ts <path-to-xlsx>");
    process.exit(1);
  }

  console.log(`Reading ${inputFile}...`);
  console.log("This may take a minute for large files (100MB+)...\n");

  const workbook = XLSX.readFile(inputFile, { dense: false });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  console.log(`Sheet: ${sheetName}`);

  // Convert to JSON rows
  const rows = XLSX.utils.sheet_to_json<Record<string, string | number>>(sheet);
  console.log(`Total rows: ${rows.length.toLocaleString()}\n`);

  // Find physician records
  const physicianRecords: PhysicianRecord[] = [];
  let socColumnName = "";

  // Detect SOC code column name (varies by year)
  const firstRow = rows[0];
  for (const key of Object.keys(firstRow)) {
    if (key.toUpperCase().includes("SOC_CODE") || key.toUpperCase().includes("SOC CODE")) {
      socColumnName = key;
      break;
    }
  }

  if (!socColumnName) {
    console.error("Could not find SOC_CODE column. Available columns:");
    console.error(Object.keys(firstRow).join(", "));
    process.exit(1);
  }

  console.log(`SOC code column: "${socColumnName}"`);

  // Find other column names
  const cols = Object.keys(firstRow);
  const findCol = (patterns: string[]): string => {
    for (const p of patterns) {
      const found = cols.find((c) => c.toUpperCase().includes(p.toUpperCase()));
      if (found) return found;
    }
    return "";
  };

  const employerCol = findCol(["EMPLOYER_NAME", "EMPLOYER NAME"]);
  const empCityCol = findCol(["EMPLOYER_CITY", "EMPLOYER CITY"]);
  const empStateCol = findCol(["EMPLOYER_STATE", "EMPLOYER STATE"]);
  const worksiteCityCol = findCol(["WORKSITE_CITY", "WORKSITE CITY"]);
  const worksiteStateCol = findCol(["WORKSITE_STATE", "WORKSITE STATE"]);
  const jobTitleCol = findCol(["JOB_TITLE", "JOB TITLE"]);
  const salaryFromCol = findCol(["WAGE_RATE_OF_PAY_FROM", "WAGE RATE OF PAY FROM"]);
  const salaryToCol = findCol(["WAGE_RATE_OF_PAY_TO", "WAGE RATE OF PAY TO"]);
  const salaryUnitCol = findCol(["WAGE_UNIT_OF_PAY", "WAGE UNIT OF PAY"]);
  const prevWageCol = findCol(["PREVAILING_WAGE", "PREVAILING WAGE"]);
  const caseStatusCol = findCol(["CASE_STATUS", "CASE STATUS"]);
  const visaClassCol = findCol(["VISA_CLASS", "VISA CLASS"]);
  const fullTimeCol = findCol(["FULL_TIME_POSITION", "FULL TIME POSITION"]);
  const naicsCol = findCol(["NAICS_CODE", "NAICS CODE"]);

  console.log(`Employer: "${employerCol}"`);
  console.log(`Salary: "${salaryFromCol}" to "${salaryToCol}"`);
  console.log(`Case Status: "${caseStatusCol}"\n`);

  // Filter physician records
  for (const row of rows) {
    const socCode = String(row[socColumnName] || "").trim();
    if (!socCode.startsWith(PHYSICIAN_SOC_PREFIX)) continue;

    const salaryFrom = parseFloat(String(row[salaryFromCol] || "0").replace(/[,$]/g, ""));
    const salaryTo = parseFloat(String(row[salaryToCol] || "0").replace(/[,$]/g, ""));
    const prevWage = parseFloat(String(row[prevWageCol] || "0").replace(/[,$]/g, ""));

    physicianRecords.push({
      employer: String(row[employerCol] || "").trim(),
      employerCity: String(row[empCityCol] || "").trim(),
      employerState: String(row[empStateCol] || "").trim(),
      worksiteCity: String(row[worksiteCityCol] || "").trim(),
      worksiteState: String(row[worksiteStateCol] || "").trim(),
      socCode,
      specialty: SOC_TO_SPECIALTY[socCode] || "Physician (Other)",
      jobTitle: String(row[jobTitleCol] || "").trim(),
      salaryFrom,
      salaryTo: salaryTo || salaryFrom,
      salaryUnit: String(row[salaryUnitCol] || "Year").trim(),
      prevailingWage: prevWage,
      caseStatus: String(row[caseStatusCol] || "").trim(),
      visaClass: String(row[visaClassCol] || "").trim(),
      fullTime: String(row[fullTimeCol] || "").toUpperCase() === "Y",
      naicsCode: String(row[naicsCol] || "").trim(),
    });
  }

  console.log(`Physician records found: ${physicianRecords.length.toLocaleString()}`);

  // Stats
  const bySoc: Record<string, number> = {};
  const byState: Record<string, number> = {};
  const byStatus: Record<string, number> = {};
  const uniqueEmployers = new Set<string>();

  for (const r of physicianRecords) {
    bySoc[r.specialty] = (bySoc[r.specialty] || 0) + 1;
    byState[r.worksiteState] = (byState[r.worksiteState] || 0) + 1;
    byStatus[r.caseStatus] = (byStatus[r.caseStatus] || 0) + 1;
    uniqueEmployers.add(r.employer);
  }

  console.log(`\nUnique employers: ${uniqueEmployers.size.toLocaleString()}`);
  console.log("\n─── By Specialty ───");
  for (const [spec, count] of Object.entries(bySoc).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${spec}: ${count}`);
  }

  console.log("\n─── By Status ───");
  for (const [status, count] of Object.entries(byStatus).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${status}: ${count}`);
  }

  console.log("\n─── Top 10 States ───");
  const statesSorted = Object.entries(byState).sort((a, b) => b[1] - a[1]).slice(0, 10);
  for (const [state, count] of statesSorted) {
    console.log(`  ${state}: ${count}`);
  }

  // Salary stats for certified records
  const certified = physicianRecords.filter((r) => r.caseStatus === "Certified" && r.salaryUnit === "Year" && r.salaryFrom > 0);
  if (certified.length > 0) {
    const salaries = certified.map((r) => r.salaryFrom).sort((a, b) => a - b);
    const median = salaries[Math.floor(salaries.length / 2)];
    const p25 = salaries[Math.floor(salaries.length * 0.25)];
    const p75 = salaries[Math.floor(salaries.length * 0.75)];

    console.log("\n─── Salary Stats (Certified, Annual) ───");
    console.log(`  Records: ${certified.length}`);
    console.log(`  25th %ile: $${p25.toLocaleString()}`);
    console.log(`  Median: $${median.toLocaleString()}`);
    console.log(`  75th %ile: $${p75.toLocaleString()}`);
    console.log(`  Min: $${salaries[0].toLocaleString()}`);
    console.log(`  Max: $${salaries[salaries.length - 1].toLocaleString()}`);
  }

  // Save output
  const outputDir = path.join(__dirname, "output");
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  const outputFile = path.join(outputDir, `physician-sponsors-${path.basename(inputFile, ".xlsx")}.json`);
  fs.writeFileSync(outputFile, JSON.stringify(physicianRecords, null, 2));
  console.log(`\nSaved ${physicianRecords.length} records to ${outputFile}`);

  // Also save unique employer list
  const employerList = [...uniqueEmployers].sort().map((name) => {
    const records = physicianRecords.filter((r) => r.employer === name);
    const specialties = [...new Set(records.map((r) => r.specialty))];
    const states = [...new Set(records.map((r) => r.worksiteState))];
    const avgSalary = records.filter((r) => r.salaryFrom > 0 && r.salaryUnit === "Year").reduce((sum, r) => sum + r.salaryFrom, 0) / (records.filter((r) => r.salaryFrom > 0 && r.salaryUnit === "Year").length || 1);

    return {
      employer: name,
      states,
      specialties,
      totalPositions: records.length,
      certifiedPositions: records.filter((r) => r.caseStatus === "Certified").length,
      avgAnnualSalary: Math.round(avgSalary),
    };
  });

  const employerFile = path.join(outputDir, `physician-employers-${path.basename(inputFile, ".xlsx")}.json`);
  fs.writeFileSync(employerFile, JSON.stringify(employerList, null, 2));
  console.log(`Saved ${employerList.length} unique employers to ${employerFile}`);
}

main();
