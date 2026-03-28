/**
 * ════════════════════════════════════════════════════════════════
 * USCEHub Job Source Compliance Registry
 * ════════════════════════════════════════════════════════════════
 *
 * Every job listing on USCEHub must come from a verified, legally
 * compliant source. This file documents the legal basis for each
 * data source and enforces compliance in code.
 *
 * LEGAL PRINCIPLES:
 * 1. Job FACTS (employer, location, specialty, salary range) are
 *    not copyrightable — they are factual information.
 *    (Feist Publications v. Rural Telephone, 1991)
 *
 * 2. Full job DESCRIPTIONS (the creative text written by the
 *    employer/recruiter) ARE copyrightable. We do NOT copy these.
 *    We write our own descriptions based on facts.
 *
 * 3. Linking to a public URL is always legal.
 *
 * 4. Automated scraping may violate Terms of Service even if the
 *    data itself is factual. We do NOT scrape any private site.
 *
 * 5. Public government data (DOL, USCIS, HRSA) has no copyright
 *    restrictions — it is in the public domain.
 *
 * OUR APPROACH:
 * - Government data: Import freely (DOL LCA, USCIS, HRSA)
 * - Hospital career pages: Manual research, write own descriptions
 * - Job boards: Use as DISCOVERY tool, verify on employer site,
 *   source the employer directly
 * - We NEVER copy job description text from any source
 * - We ALWAYS link to the original source
 * - Every job shows its source and verification date
 *
 * ════════════════════════════════════════════════════════════════
 */

export type ComplianceStatus = "safe" | "safe-with-attribution" | "caution" | "avoid";

export interface SourceCompliance {
  name: string;
  url: string;
  status: ComplianceStatus;
  legalBasis: string;
  whatWeCanDo: string[];
  whatWeCannotDo: string[];
  termsUrl?: string;
  lastReviewed: string;
}

export const JOB_SOURCE_COMPLIANCE: Record<string, SourceCompliance> = {
  // ═══ TIER 1: PUBLIC GOVERNMENT DATA — No restrictions ═══
  "dol-lca": {
    name: "DOL LCA Disclosure Data",
    url: "https://www.dol.gov/agencies/eta/foreign-labor/performance",
    status: "safe",
    legalBasis:
      "U.S. government data is in the public domain. The DOL publishes LCA disclosure files specifically for public access and transparency. No copyright, no ToS restrictions.",
    whatWeCanDo: [
      "Download and import bulk data files",
      "Display employer names, salaries, job titles, SOC codes",
      "Build search/filter tools on top of this data",
      "Publish analysis and aggregations",
    ],
    whatWeCannotDo: [
      "Nothing restricted — this is public domain data",
    ],
    lastReviewed: "2026-03-27",
  },

  "uscis-data-hub": {
    name: "USCIS H-1B Employer Data Hub",
    url: "https://www.uscis.gov/tools/reports-and-studies/h-1b-employer-data-hub",
    status: "safe",
    legalBasis:
      "U.S. government data, public domain. USCIS publishes this explicitly for public transparency.",
    whatWeCanDo: [
      "Download CSV files and import",
      "Display employer approval/denial rates",
      "Build search tools",
    ],
    whatWeCannotDo: [
      "Nothing restricted",
    ],
    lastReviewed: "2026-03-27",
  },

  "hrsa-hpsa": {
    name: "HRSA HPSA Data",
    url: "https://data.hrsa.gov/data/download",
    status: "safe",
    legalBasis:
      "U.S. government data, public domain. HRSA provides bulk downloads specifically for public use.",
    whatWeCanDo: [
      "Import HPSA designations, scores, boundaries",
      "Build interactive maps",
      "Cross-reference with job locations",
    ],
    whatWeCannotDo: [
      "Nothing restricted",
    ],
    lastReviewed: "2026-03-27",
  },

  "3rnet": {
    name: "3RNET (National Rural Recruitment)",
    url: "https://www.3rnet.org",
    status: "safe",
    legalBasis:
      "Federally-funded nonprofit (FORHP). Conrad 30 slot data is collected from state coordinators and published for public benefit. Job listings are free and intended for public access.",
    whatWeCanDo: [
      "Reference their Conrad 30 slot data with attribution",
      "Link to their job listings",
      "Cite their published statistics",
    ],
    whatWeCannotDo: [
      "Mass-scrape their job database",
      "Reproduce their proprietary reports without permission",
    ],
    lastReviewed: "2026-03-27",
  },

  // ═══ TIER 2: EMPLOYER CAREER PAGES — Safe with attribution ═══
  "hospital-careers": {
    name: "Hospital / Employer Career Pages",
    url: "Various",
    status: "safe-with-attribution",
    legalBasis:
      "Job facts (employer, location, specialty, salary range) are not copyrightable (Feist v. Rural, 1991). Hospitals publish career pages to attract applicants — they WANT visibility. We write our own descriptions and link to the original posting.",
    whatWeCanDo: [
      "List factual job information (employer, location, specialty, salary)",
      "Write our own description of the position",
      "Link to the employer's career page",
      "Note when the job was found and verified",
    ],
    whatWeCannotDo: [
      "Copy the full job description text verbatim",
      "Use employer logos without permission",
      "Imply endorsement or partnership",
    ],
    lastReviewed: "2026-03-27",
  },

  "sound-physicians": {
    name: "Sound Physicians",
    url: "https://careers.soundphysicians.com",
    status: "safe-with-attribution",
    legalBasis:
      "Sound Physicians publishes a dedicated J-1 visa careers page specifically to attract visa physicians. They want visibility for these positions.",
    whatWeCanDo: [
      "List their positions with factual details",
      "Link to their career page",
      "Reference their visa sponsorship policies",
    ],
    whatWeCannotDo: [
      "Copy their job descriptions verbatim",
      "Scrape their site automatically",
    ],
    lastReviewed: "2026-03-27",
  },

  "usacs": {
    name: "USACS",
    url: "https://www.usacs.com/j1-visa-careers",
    status: "safe-with-attribution",
    legalBasis:
      "USACS publishes a dedicated J-1 visa careers page. They actively recruit visa physicians and benefit from additional visibility.",
    whatWeCanDo: [
      "List their positions with factual details",
      "Link to their J-1 careers page",
      "Reference their physician ownership model",
    ],
    whatWeCannotDo: [
      "Copy descriptions verbatim",
      "Scrape automatically",
    ],
    lastReviewed: "2026-03-27",
  },

  // ═══ TIER 3: JOB BOARDS — Caution, use for discovery only ═══
  "practicelink": {
    name: "PracticeLink",
    url: "https://www.practicelink.com",
    status: "caution",
    legalBasis:
      "PracticeLink's ToS likely restricts data reuse. We use PracticeLink as a DISCOVERY tool — we find jobs there, then verify them on the employer's own career page, and source the employer directly.",
    whatWeCanDo: [
      "Use as a discovery/research tool to find positions",
      "Link to specific job listings on PracticeLink",
      "Cross-reference: find job on PracticeLink, verify on hospital site, source hospital",
    ],
    whatWeCannotDo: [
      "Scrape or bulk-download their listings",
      "Copy their job descriptions",
      "Present PracticeLink data as our own",
    ],
    termsUrl: "https://www.practicelink.com/terms",
    lastReviewed: "2026-03-27",
  },

  "practicematch": {
    name: "PracticeMatch",
    url: "https://www.practicematch.com",
    status: "caution",
    legalBasis:
      "Same approach as PracticeLink — use for discovery, verify on employer site, source employer.",
    whatWeCanDo: [
      "Use as discovery tool",
      "Link to listings",
      "Cross-reference with employer career pages",
    ],
    whatWeCannotDo: [
      "Scrape or copy their data",
    ],
    termsUrl: "https://www.practicematch.com/terms",
    lastReviewed: "2026-03-27",
  },

  "indeed": {
    name: "Indeed",
    url: "https://www.indeed.com",
    status: "caution",
    legalBasis:
      "Indeed is aggressive about data reuse. Their ToS prohibits scraping and republishing. We use Indeed for discovery only — find the job, verify on employer site, source employer.",
    whatWeCanDo: [
      "Use as discovery tool only",
      "Link to Indeed listings",
      "Find jobs on Indeed, verify on hospital site, source hospital",
    ],
    whatWeCannotDo: [
      "Scrape Indeed",
      "Copy Indeed job descriptions",
      "Display Indeed as the source (source the employer instead)",
      "Use Indeed's API without partnership",
    ],
    termsUrl: "https://www.indeed.com/legal",
    lastReviewed: "2026-03-27",
  },

  // ═══ TIER 4: EMPLOYER SELF-POSTS — Best case scenario ═══
  "employer-direct": {
    name: "Employer Self-Post",
    url: "https://uscehub.com/career/employers",
    status: "safe",
    legalBasis:
      "Employer posts the job directly on our platform. They own the content and grant us permission through our posting terms. This is the cleanest source possible.",
    whatWeCanDo: [
      "Everything — the employer posted it on our platform",
      "Display full details, descriptions, salary",
      "Feature the listing",
    ],
    whatWeCannotDo: [
      "Nothing restricted for employer-posted content",
    ],
    lastReviewed: "2026-03-27",
  },
};

/**
 * Validate that a job source is compliant before importing.
 */
export function isSourceCompliant(sourceKey: string): boolean {
  const source = JOB_SOURCE_COMPLIANCE[sourceKey];
  if (!source) return false;
  return source.status === "safe" || source.status === "safe-with-attribution";
}

/**
 * Get the compliance status for display in the UI.
 */
export function getSourceBadge(sourceKey: string): {
  label: string;
  color: string;
} {
  const source = JOB_SOURCE_COMPLIANCE[sourceKey];
  if (!source) return { label: "Unknown Source", color: "text-muted" };

  switch (source.status) {
    case "safe":
      return { label: "Public Data", color: "text-success" };
    case "safe-with-attribution":
      return { label: "Verified Source", color: "text-accent" };
    case "caution":
      return { label: "Cross-Referenced", color: "text-warning" };
    case "avoid":
      return { label: "Not Used", color: "text-danger" };
  }
}

/**
 * Our job sourcing workflow (enforced in code):
 *
 * 1. DISCOVERY: Find a job on any source (PracticeLink, Indeed, etc.)
 * 2. VERIFICATION: Go to the EMPLOYER'S own career page and confirm
 *    the position exists
 * 3. DESCRIPTION: Write our OWN description based on the facts
 *    (DO NOT copy from any source)
 * 4. SOURCE: Link to the employer's career page (not the job board
 *    where we discovered it, unless the employer page doesn't exist)
 * 5. ATTRIBUTION: Show "Verified [date] · Source: [employer name]"
 *
 * Exception: DOL LCA data can be imported directly (public domain).
 * Exception: Employer self-posts need no external verification.
 */
