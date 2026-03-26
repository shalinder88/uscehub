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

// VERIFIED April 2026 Visa Bulletin from U.S. Department of State
// Source: https://travel.state.gov/content/travel/en/legal/visa-law0/visa-bulletin/2026/visa-bulletin-for-april-2026.html
// USCIS designated Dates for Filing chart for April 2026.
// Notable: EB-2 India jumped 10 months (303 days) from Mar to Apr 2026.
// Warning: DOS warns dates may retrogress later in FY2026.
export const CURRENT_BULLETIN: MonthlyBulletin = {
  month: "April 2026",
  effectiveDate: "2026-04-01",
  sourceUrl: "https://travel.state.gov/content/travel/en/legal/visa-law0/visa-bulletin/2026/visa-bulletin-for-april-2026.html",
  entries: [
    // EB-1 — India and China at Apr 2023, ROW current
    { category: "EB-1", country: "India", finalActionDate: "2023-04-01", datesForFiling: "2023-12-01" },
    { category: "EB-1", country: "China", finalActionDate: "2023-04-01", datesForFiling: "2023-12-01" },
    { category: "EB-1", country: "All Other", finalActionDate: "C", datesForFiling: "C" },
    // EB-2 — India at Jul 2014 (jumped 10 months!), China Sep 2021, ROW current
    { category: "EB-2", country: "India", finalActionDate: "2014-07-15", datesForFiling: "2015-01-15" },
    { category: "EB-2", country: "China", finalActionDate: "2021-09-01", datesForFiling: "2022-01-01" },
    { category: "EB-2", country: "All Other", finalActionDate: "C", datesForFiling: "C" },
    // EB-3 — India Nov 2013, China Jun 2021, ROW Jun 2024
    { category: "EB-3", country: "India", finalActionDate: "2013-11-15", datesForFiling: "2015-01-15" },
    { category: "EB-3", country: "China", finalActionDate: "2021-06-15", datesForFiling: "2022-01-01" },
    { category: "EB-3", country: "All Other", finalActionDate: "2024-06-01", datesForFiling: "C" },
  ],
};

// VERIFIED historical EB-2 India Final Action Date movement
// Source: ImmiHelp, Boundless, Manifest Law cross-referenced with DOS bulletins
// Notable: 5-month freeze May-Sep 2025, then massive acceleration in FY2026
export const EB2_INDIA_HISTORY: { month: string; date: string }[] = [
  { month: "Oct 2024", date: "2012-07-15" },
  { month: "Nov 2024", date: "2012-07-15" },
  { month: "Dec 2024", date: "2012-08-01" },
  { month: "Jan 2025", date: "2012-10-01" },
  { month: "Feb 2025", date: "2012-10-15" },
  { month: "Mar 2025", date: "2012-12-01" },
  { month: "Apr 2025", date: "2013-01-01" },
  { month: "May 2025", date: "2013-01-01" }, // FROZEN
  { month: "Jun 2025", date: "2013-01-01" }, // FROZEN
  { month: "Jul 2025", date: "2013-01-01" }, // FROZEN
  { month: "Aug 2025", date: "2013-01-01" }, // FROZEN
  { month: "Sep 2025", date: "2013-01-01" }, // FROZEN
  { month: "Oct 2025", date: "2013-04-01" }, // Movement resumes
  { month: "Nov 2025", date: "2013-04-01" },
  { month: "Dec 2025", date: "2013-05-15" },
  { month: "Jan 2026", date: "2013-07-15" },
  { month: "Feb 2026", date: "2013-07-15" },
  { month: "Mar 2026", date: "2013-09-15" },
  { month: "Apr 2026", date: "2014-07-15" }, // +10 MONTHS in one jump!
];

// VERIFIED wait estimates based on current bulletin position and historical movement
// Source: Fragomen, BeyondBorder, Manifest Law analyses of April 2026 bulletin
export const WAIT_ESTIMATES = {
  "EB-1": {
    India: "~3-4 years from filing (Final Action at Apr 2023)",
    China: "~2.5-3 years from filing (Final Action at Apr 2023)",
    "All Other": "Current — processing time only (~12-18 months)",
  },
  "EB-2": {
    India: "12-15+ years from filing (Final Action at Jul 2014, ~400K in queue)",
    China: "~4-5 years from filing (Final Action at Sep 2021)",
    "All Other": "Current — processing time only (~6-12 months)",
  },
  "EB-3": {
    India: "12-15+ years from filing (Final Action at Nov 2013)",
    China: "~4-5 years from filing (Final Action at Jun 2021)",
    "All Other": "~1-2 years from filing (Final Action at Jun 2024)",
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
