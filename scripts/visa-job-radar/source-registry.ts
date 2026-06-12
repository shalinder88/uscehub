// Visa Job Radar — source registry.
//
// Tier 1 = clean, employer-direct or government provenance (publishable).
// Tier 2 = experimental / aggregated provenance (held as signal, reviewed).
// Tier 3 = never crawled; listed only so the engine can explicitly refuse.
//
// `enabled` stays false until a token/endpoint is verified by hand. The R1
// offline run touches none of these — they are wired by the connectors in a
// later phase. Greenhouse tokens below are placeholders pending verification.

import type { SourceTier } from "./types";

export type Connector =
  | "usajobs"
  | "usajobs-historic"
  | "greenhouse"
  | "workday"
  | "none";

export interface SourceDef {
  id: string;
  tier: SourceTier;
  connector: Connector;
  label: string;
  // connector-specific handle (USAJobs keyword, Greenhouse board token, etc.)
  handle: string;
  employer?: string;
  enabled: boolean;
  needsVerification: boolean;
  note: string;
}

export const SOURCES: SourceDef[] = [
  {
    id: "usajobs-va-0602",
    tier: 1,
    connector: "usajobs",
    label: "USAJobs — VA/IHS physicians (series 0602)",
    handle: "physician",
    enabled: false,
    needsVerification: true,
    note: "Keyed Search API. Requires USAJOBS_API_KEY + USAJOBS_USER_AGENT (unprovisioned → off). Preferred for guaranteed-live openings once keyed.",
  },
  {
    id: "usajobs-historic-va-0602",
    tier: 1,
    connector: "usajobs-historic",
    label: "USAJobs HistoricJoa — VHA physicians (series 0602, no key)",
    handle: "0602/VATA",
    employer: "Veterans Health Administration",
    enabled: true,
    needsVerification: true,
    note: "Public no-key endpoints (historicjoa + announcementtext), joined on control number. Verified 2026-06-10: HTTP 200, full body text, ~100% of 0602 VHA postings carry the 38 U.S.C. 7407 non-citizen-eligibility clause (445/445 in a Feb window). Eligibility tier only — engine caps FEDERAL_NONCITIZEN_ELIGIBLE at VISA_SIGNAL_ONLY (statutory 'may appoint', not affirmative sponsorship).",
  },
  {
    id: "greenhouse-onemedical",
    tier: 1,
    connector: "greenhouse",
    label: "One Medical — primary care (Greenhouse)",
    handle: "onemedical",
    employer: "One Medical",
    enabled: true,
    needsVerification: false,
    note: "Employer-direct ATS. Verified 2026-05-29: HTTP 200, ~273 postings, real physician titles.",
  },
  {
    id: "greenhouse-oscar",
    tier: 1,
    connector: "greenhouse",
    label: "Oscar Health — clinical (Greenhouse)",
    handle: "oscar",
    employer: "Oscar Health",
    enabled: true,
    needsVerification: false,
    note: "Employer-direct ATS. Verified 2026-05-29: HTTP 200, ~246 postings, mixed physician + APP titles (gate discrimination test).",
  },
  {
    id: "greenhouse-cerebral",
    tier: 1,
    connector: "greenhouse",
    label: "Cerebral — psychiatry (Greenhouse)",
    handle: "cerebral",
    employer: "Cerebral",
    enabled: true,
    needsVerification: false,
    note: "Employer-direct ATS. Verified 2026-05-29: HTTP 200, physician + psychiatrist postings.",
  },
  {
    id: "workday-sanford",
    tier: 1,
    connector: "workday",
    label: "Sanford Health — physicians (Workday)",
    handle: "sanford/wd5/SanfordHealth",
    employer: "Sanford Health",
    enabled: true,
    needsVerification: true,
    note: "Employer-direct Workday tenant (unofficial CXS endpoint). Verified 2026-05-29: HTTP 200, ~1712 'physician' search hits. Rural mission system.",
  },
  {
    id: "workday-wvu-uha",
    tier: 1,
    connector: "workday",
    label: "WVU Medicine (UHA) — physicians (Workday)",
    handle: "wvumedicine/wd1/UHA",
    employer: "WVU Medicine",
    enabled: false,
    needsVerification: true,
    note: "DISABLED 2026-05-30: tenant is behind bot-protection. Serves curl but returns HTTP 500 to a plain Node client; only a request forging a browser User-Agent + Origin + Referer + Accept-Language succeeds. Reaching it would mean spoofing a browser to defeat bot detection — refused (same posture as HRSA). H-1B cap-exempt academic system, underserved WV; revisit only via a sanctioned feed.",
  },
  {
    id: "workday-wvu-wvuh",
    tier: 1,
    connector: "workday",
    label: "WVU Medicine (WVUH) — physicians (Workday)",
    handle: "wvumedicine/wd1/WVUH",
    employer: "WVU Medicine",
    enabled: false,
    needsVerification: true,
    note: "DISABLED 2026-05-30: same bot-protection as the UHA site (HTTP 500 to a plain Node client). Not bypassed.",
  },
  {
    id: "workday-altamed",
    tier: 1,
    connector: "workday",
    label: "AltaMed Health Services — physicians (Workday)",
    handle: "altamed/wd1/Careers",
    employer: "AltaMed Health Services",
    enabled: true,
    needsVerification: true,
    note: "Employer-direct Workday tenant (unofficial CXS endpoint). Verified 2026-05-29: HTTP 200, ~58 hits. Large multi-site FQHC (CA), high J-1 density.",
  },
  // Auto-resolved from the DOL sponsor universe (build-sponsor-universe.ts) via the
  // ATS resolver (ats-resolver.ts): top physician H-1B sponsors whose own careers
  // page runs a reachable Workday tenant. Handle = tenant/dc/site extracted from
  // their careers HTML, then CXS-verified 2026-06-10. These are KNOWN sponsors
  // from public DOL LCA data, so even a visa-silent posting carries a strong
  // sponsor-history prior.
  {
    id: "workday-clevelandclinic",
    tier: 1,
    connector: "workday",
    label: "Cleveland Clinic — physicians (Workday)",
    handle: "ccf/wd1/clevelandcliniccareers",
    employer: "Cleveland Clinic",
    enabled: true,
    needsVerification: true,
    note: "DOL sponsor universe (top-4 physician H-1B sponsor, JAMA 2016) → ATS-resolved. Verified 2026-06-10: CXS HTTP 200, ~1005 'physician' hits.",
  },
  {
    id: "workday-uams",
    tier: 1,
    connector: "workday",
    label: "Univ. of Arkansas for Medical Sciences — physicians (Workday)",
    handle: "uasys/wd5/uams_all_careers",
    employer: "University of Arkansas for Medical Sciences",
    enabled: true,
    needsVerification: true,
    note: "DOL sponsor universe (top-5 physician H-1B sponsor) → ATS-resolved. Verified 2026-06-10: CXS HTTP 200, ~103 'physician' hits.",
  },
  {
    id: "workday-msk",
    tier: 1,
    connector: "workday",
    label: "Memorial Sloan Kettering — physicians (Workday)",
    handle: "msk/wd108/mskcc_careers_primary",
    employer: "Memorial Sloan Kettering Cancer Center",
    enabled: true,
    needsVerification: true,
    note: "DOL sponsor universe (top-3 physician H-1B sponsor) → ATS-resolved. Resolver found the wd108 datacenter (a manual wd1 guess 422'd). Verified 2026-06-10: CXS HTTP 200, ~22 'physician' hits.",
  },
  {
    id: "workday-ochsner",
    tier: 1,
    connector: "workday",
    label: "Ochsner Health — physicians (Workday)",
    handle: "ochsner/wd1/ochsner",
    employer: "Ochsner Health",
    enabled: true,
    needsVerification: true,
    note: "DOL sponsor universe → batch ATS-resolved (scale-sponsors.ts). Verified 2026-06-10: CXS HTTP 200, ~786 'physician' hits. Large LA/Gulf-South system, high J-1-waiver density.",
  },
  {
    id: "workday-vumc",
    tier: 1,
    connector: "workday",
    label: "Vanderbilt University Medical Center — physicians (Workday)",
    handle: "vumc/wd1/vumccareers",
    employer: "Vanderbilt University Medical Center",
    enabled: true,
    needsVerification: true,
    note: "DOL sponsor universe → batch ATS-resolved. Verified 2026-06-10: CXS HTTP 200, ~262 'physician' hits.",
  },
  {
    id: "workday-stanfordhealth",
    tier: 1,
    connector: "workday",
    label: "Stanford Health Care — physicians (Workday)",
    handle: "stanfordmedicine/wd115/shc_external_career_site",
    employer: "Stanford Health Care",
    enabled: true,
    needsVerification: true,
    note: "DOL sponsor universe → batch ATS-resolved. Verified 2026-06-10: CXS HTTP 200, ~152 'physician' hits.",
  },
  {
    id: "workday-jeffersonhealth",
    tier: 1,
    connector: "workday",
    label: "Thomas Jefferson University Hospitals — physicians (Workday)",
    handle: "jeffersonhealth/wd5/thomasjeffersonexternal",
    employer: "Thomas Jefferson University Hospitals",
    enabled: true,
    needsVerification: true,
    note: "DOL iron-core sponsor (7/7 years FY2019-FY2025) → batch ATS-resolved 2026-06-12. Verified: CXS HTTP 200, ~402 'physician' hits. PA academic medical center.",
  },
  {
    id: "workday-presbyterianhealthcare",
    tier: 1,
    connector: "workday",
    label: "Presbyterian Healthcare Services (NM) — physicians (Workday)",
    handle: "phsorg/wd1/careers",
    employer: "Presbyterian Healthcare Services",
    enabled: true,
    needsVerification: true,
    note: "DOL iron-core sponsor (7/7 years FY2019-FY2025) → batch ATS-resolved 2026-06-12. Verified: CXS HTTP 200, ~307 'physician' hits. NM safety-net system, high J-1-waiver density.",
  },
  {
    id: "tier3-practicelink",
    tier: 3,
    connector: "none",
    label: "PracticeLink",
    handle: "",
    enabled: false,
    needsVerification: false,
    note: "Never crawl. Discovery reference only; verify on employer site.",
  },
  {
    id: "tier3-practicematch",
    tier: 3,
    connector: "none",
    label: "PracticeMatch",
    handle: "",
    enabled: false,
    needsVerification: false,
    note: "Never crawl.",
  },
  {
    id: "tier3-doccafe",
    tier: 3,
    connector: "none",
    label: "DocCafe",
    handle: "",
    enabled: false,
    needsVerification: false,
    note: "Never used.",
  },
];

export function enabledSources(): SourceDef[] {
  return SOURCES.filter((s) => s.enabled && s.connector !== "none");
}
