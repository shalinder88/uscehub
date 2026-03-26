// ---------------------------------------------------------------------------
// Visa Bulletin Data for Employment-Based Categories
//
// Source: U.S. Department of State, Bureau of Consular Affairs
// https://travel.state.gov/content/travel/en/legal/visa-law0/visa-bulletin.html
//
// CRITICAL: This data must be updated monthly when the new bulletin is released
// (typically mid-month for the following month).
//
// "C" = Current (no backlog, can file immediately)
// "U" = Unavailable
// Date format: "YYYY-MM-DD" for sorting, displayed as "Month Year"
//
// Trust is #1 — every number here must match the official DOS bulletin exactly.
// ---------------------------------------------------------------------------

export interface BulletinEntry {
  category: "EB-1" | "EB-2" | "EB-3";
  country: "India" | "China" | "All Other";
  finalActionDate: string; // "C" for current, or "YYYY-MM-DD"
  datesForFiling: string; // "C" for current, or "YYYY-MM-DD"
}

export interface MonthlyBulletin {
  month: string; // "April 2026"
  effectiveDate: string; // "2026-04-01"
  sourceUrl: string;
  entries: BulletinEntry[];
}

// Current bulletin — PLACEHOLDER: will be updated with exact data from research
// These are approximate based on trends — MUST be verified against official DOS data
export const CURRENT_BULLETIN: MonthlyBulletin = {
  month: "April 2026",
  effectiveDate: "2026-04-01",
  sourceUrl: "https://travel.state.gov/content/travel/en/legal/visa-law0/visa-bulletin/2026/visa-bulletin-for-april-2026.html",
  entries: [
    // EB-1
    { category: "EB-1", country: "India", finalActionDate: "C", datesForFiling: "C" },
    { category: "EB-1", country: "China", finalActionDate: "C", datesForFiling: "C" },
    { category: "EB-1", country: "All Other", finalActionDate: "C", datesForFiling: "C" },
    // EB-2 — PLACEHOLDER dates, will update with research
    { category: "EB-2", country: "India", finalActionDate: "2014-07-01", datesForFiling: "2015-01-01" },
    { category: "EB-2", country: "China", finalActionDate: "2021-06-01", datesForFiling: "2022-01-01" },
    { category: "EB-2", country: "All Other", finalActionDate: "C", datesForFiling: "C" },
    // EB-3 — PLACEHOLDER dates
    { category: "EB-3", country: "India", finalActionDate: "2013-01-01", datesForFiling: "2014-06-01" },
    { category: "EB-3", country: "China", finalActionDate: "2020-06-01", datesForFiling: "2021-06-01" },
    { category: "EB-3", country: "All Other", finalActionDate: "C", datesForFiling: "C" },
  ],
};

// Historical data for trend chart — last 12 months of EB-2 India Final Action Date
// PLACEHOLDER: will be updated with research
export const EB2_INDIA_HISTORY: { month: string; date: string }[] = [
  { month: "Apr 2025", date: "2013-12-01" },
  { month: "May 2025", date: "2013-12-01" },
  { month: "Jun 2025", date: "2014-01-01" },
  { month: "Jul 2025", date: "2014-01-01" },
  { month: "Aug 2025", date: "2014-02-01" },
  { month: "Sep 2025", date: "2014-03-01" },
  { month: "Oct 2025", date: "2014-03-01" },
  { month: "Nov 2025", date: "2014-04-01" },
  { month: "Dec 2025", date: "2014-05-01" },
  { month: "Jan 2026", date: "2014-05-01" },
  { month: "Feb 2026", date: "2014-06-01" },
  { month: "Mar 2026", date: "2014-06-01" },
  { month: "Apr 2026", date: "2014-07-01" },
];

// Estimated wait times (conservative estimates based on historical movement)
export const WAIT_ESTIMATES = {
  "EB-1": {
    India: "Current — no backlog",
    China: "Current to 6 months",
    "All Other": "Current — no backlog",
  },
  "EB-2": {
    India: "10-15+ years from filing date",
    China: "4-6 years from filing date",
    "All Other": "Current to 1 year",
  },
  "EB-3": {
    India: "10-15+ years from filing date",
    China: "5-7 years from filing date",
    "All Other": "Current to 1 year",
  },
};

// Helper functions
export function formatBulletinDate(dateStr: string): string {
  if (dateStr === "C") return "Current";
  if (dateStr === "U") return "Unavailable";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export function calculateWaitYears(filingDate: string, currentFinalAction: string): string {
  if (currentFinalAction === "C") return "Current — no wait";
  if (currentFinalAction === "U") return "Unavailable";

  const filing = new Date(filingDate + "T00:00:00");
  const current = new Date(currentFinalAction + "T00:00:00");

  if (filing <= current) return "Your date is current — eligible now";

  const diffMs = filing.getTime() - current.getTime();
  const diffYears = diffMs / (1000 * 60 * 60 * 24 * 365.25);

  // Estimate based on average movement of ~6-8 months per year for EB-2 India
  const estimatedYears = Math.ceil(diffYears / 0.6); // ~7 months movement per year

  if (estimatedYears <= 1) return "~1 year estimated";
  if (estimatedYears <= 2) return "~1-2 years estimated";
  return `~${estimatedYears - 1}-${estimatedYears + 1} years estimated`;
}
