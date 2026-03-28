#!/usr/bin/env npx tsx
/**
 * ════════════════════════════════════════════════════════════════
 * USCEHub DOL LCA Data Importer
 * ════════════════════════════════════════════════════════════════
 *
 * Downloads DOL Labor Condition Application (LCA) disclosure data
 * and extracts physician-specific H-1B records.
 *
 * Data source: U.S. Department of Labor, OFLC Performance Data
 * URL pattern: https://www.dol.gov/sites/dolgov/files/ETA/oflc/pdfs/LCA_Disclosure_Data_FY{YEAR}_Q{QUARTER}.xlsx
 *
 * Physician SOC codes (29-1211 through 29-1229):
 *   29-1211 Anesthesiologists
 *   29-1212 Cardiologists
 *   29-1213 Dermatologists
 *   29-1214 Emergency Medicine Physicians
 *   29-1215 Family Medicine Physicians
 *   29-1216 General Internal Medicine Physicians
 *   29-1217 Neurologists
 *   29-1218 Obstetricians and Gynecologists
 *   29-1221 Pediatricians, General
 *   29-1222 Physicians, Pathologists
 *   29-1223 Psychiatrists
 *   29-1224 Radiologists
 *   29-1229 Physicians, All Other
 *
 * What this script does:
 * 1. Downloads the LCA disclosure Excel file for a given FY/quarter
 * 2. Filters rows where SOC code starts with "29-12" (physicians)
 * 3. Extracts: employer, worksite, job title, salary, case status
 * 4. Outputs a JSON file of physician H-1B sponsor data
 *
 * Usage:
 *   npx tsx scripts/import-lca-data.ts --fy 2025 --quarter 3
 *   npx tsx scripts/import-lca-data.ts --fy 2026 --quarter 1
 *
 * Requirements:
 *   npm install xlsx (for Excel parsing)
 *
 * Output: scripts/output/physician-h1b-sponsors-FY{YEAR}-Q{QUARTER}.json
 */

// NOTE: This script requires the 'xlsx' package.
// Install with: npm install xlsx
// The actual download and parse is commented out until xlsx is installed.
// For now, this serves as documentation of the approach and data model.

const PHYSICIAN_SOC_CODES = [
  "29-1211", // Anesthesiologists
  "29-1212", // Cardiologists
  "29-1213", // Dermatologists
  "29-1214", // Emergency Medicine Physicians
  "29-1215", // Family Medicine Physicians
  "29-1216", // General Internal Medicine Physicians
  "29-1217", // Neurologists
  "29-1218", // Obstetricians and Gynecologists
  "29-1221", // Pediatricians, General
  "29-1222", // Physicians, Pathologists
  "29-1223", // Psychiatrists
  "29-1224", // Radiologists
  "29-1229", // Physicians, All Other (includes hospitalists, subspecialists)
];

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

interface PhysicianLCA {
  employer: string;
  city: string;
  state: string;
  specialty: string;
  socCode: string;
  jobTitle: string;
  salaryFrom: number;
  salaryTo: number;
  salaryUnit: string; // "Year", "Hour", etc.
  prevailingWage: number;
  caseStatus: string; // "Certified", "Denied", "Certified-Withdrawn"
  visaClass: string; // "H-1B", "E-3", "H-1B1"
  fullTime: boolean;
  employmentStart: string;
  employmentEnd: string;
  fiscalYear: string;
}

function getLCADownloadUrl(fy: number, quarter: number): string {
  return `https://www.dol.gov/sites/dolgov/files/ETA/oflc/pdfs/LCA_Disclosure_Data_FY${fy}_Q${quarter}.xlsx`;
}

/**
 * Key LCA columns to extract (from the Record Layout documentation):
 *
 * CASE_STATUS              — "Certified", "Denied", "Withdrawn", "Certified-Withdrawn"
 * EMPLOYER_NAME            — e.g., "JOHNS HOPKINS HOSPITAL"
 * EMPLOYER_CITY            — Employer HQ city
 * EMPLOYER_STATE           — Employer HQ state
 * SOC_CODE                 — e.g., "29-1216"
 * SOC_TITLE                — e.g., "General Internal Medicine Physicians"
 * JOB_TITLE                — e.g., "Hospitalist" or "Staff Physician"
 * FULL_TIME_POSITION       — "Y" or "N"
 * WAGE_RATE_OF_PAY_FROM    — Lower end of salary range
 * WAGE_RATE_OF_PAY_TO      — Upper end (may equal FROM)
 * WAGE_UNIT_OF_PAY         — "Year", "Hour", "Week", "Month"
 * PREVAILING_WAGE          — DOL prevailing wage for this occupation/area
 * PW_UNIT_OF_PAY           — Unit for prevailing wage
 * WORKSITE_CITY            — Actual work location city
 * WORKSITE_STATE           — Actual work location state
 * VISA_CLASS               — "H-1B", "E-3", "H-1B1"
 * EMPLOYMENT_START_DATE    — Start date
 * EMPLOYMENT_END_DATE      — End date
 * NAICS_CODE               — Industry code (622110 = General Medical and Surgical Hospitals)
 */

async function main() {
  const args = process.argv.slice(2);
  const fyIndex = args.indexOf("--fy");
  const qIndex = args.indexOf("--quarter");

  const fy = fyIndex >= 0 ? parseInt(args[fyIndex + 1]) : 2025;
  const quarter = qIndex >= 0 ? parseInt(args[qIndex + 1]) : 3;

  const url = getLCADownloadUrl(fy, quarter);

  console.log("═══════════════════════════════════════════");
  console.log("USCEHub DOL LCA Data Importer");
  console.log(`Fiscal Year: ${fy}, Quarter: ${quarter}`);
  console.log(`Download URL: ${url}`);
  console.log("═══════════════════════════════════════════\n");

  console.log("To run the actual import:");
  console.log("1. Install xlsx: npm install xlsx");
  console.log("2. Download the file manually or via curl:");
  console.log(`   curl -o lca-data.xlsx "${url}"`);
  console.log("3. Run: npx tsx scripts/parse-lca-xlsx.ts lca-data.xlsx");
  console.log("\nPhysician SOC codes to filter:");
  for (const [code, specialty] of Object.entries(SOC_TO_SPECIALTY)) {
    console.log(`  ${code} → ${specialty}`);
  }

  console.log(`\n═══════════════════════════════════════════`);
  console.log("Expected output: JSON file with physician H-1B sponsor data");
  console.log("Fields: employer, city, state, specialty, salary, prevailing wage");
  console.log("═══════════════════════════════════════════");
}

main().catch(console.error);

export {
  PHYSICIAN_SOC_CODES,
  SOC_TO_SPECIALTY,
  getLCADownloadUrl,
  type PhysicianLCA,
};
