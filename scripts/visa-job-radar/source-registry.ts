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
  | "jsonld"
  | "jibe"
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
    enabled: false,
    needsVerification: false,
    note: "DISABLED 2026-06-12: 301 fetched per run, 0 PUBLISH, 0 SPONSOR_LEAD. One Medical is an Amazon-owned primary care clinic; their DOL LCA history is marginal (5yr, 1 pos) and fails the quality gate. Greenhouse board returns full all-staff listing (nurses, MAs, receptionists) — physician:noise ratio ~5%. Zero useful signal at high fetch cost.",
  },
  {
    id: "greenhouse-oscar",
    tier: 1,
    connector: "greenhouse",
    label: "Oscar Health — clinical (Greenhouse)",
    handle: "oscar",
    employer: "Oscar Health",
    enabled: false,
    needsVerification: false,
    note: "DISABLED 2026-06-12: 235 fetched per run, 0 PUBLISH, 0 SPONSOR_LEAD. Oscar is an insurance company (managed care), not a physician employer. Their Greenhouse board is for tech, ops, and care coordination roles — not physician attendings. No DOL H1B physician LCA history.",
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
    enabled: false,
    needsVerification: true,
    note: "DISABLED 2026-06-12: clevelandcliniccareers Workday portal is for non-physician staff only. Full-portal scan: 1983 total jobs, only 10 in 'Physician - Job Family Group' — all Postdoctoral Fellows. Cleveland Clinic physician attending/faculty recruitment is through a separate WordPress portal at jobs.clevelandclinic.org. Probe that portal for physician attending postings.",
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
    enabled: false,
    needsVerification: false,
    note: "DISABLED 2026-06-12: vumccareers Workday portal does not expose attending/faculty physician postings. Full scan: 244 'physician' keyword hits, 0 actual MD/DO attending titles — every result is NP/PA, nursing, imaging tech, or support staff. The only isPhysician() pass was 'Pediatric Cardiac Sonographer II' (false positive on 'pediatric' PHYS token — fixed by adding 'sonographer' to NONPHYS_TOKENS). VUMC physician faculty are likely recruited via Vanderbilt University academic HR, not the clinical ATS. DOL iron-core sponsor (7yr). Revisit only if VUMC adds a physician-specific portal.",
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
    id: "workday-montefiore",
    tier: 1,
    connector: "workday",
    label: "Montefiore Medical Center — physicians (Workday)",
    handle: "montefiore/wd12/MMC",
    employer: "Montefiore Medical Center",
    enabled: true,
    needsVerification: true,
    note: "DOL iron-core sponsor (7/7 years). Workday discovered 2026-06-12 via careers page redirect (vizi.vizirecruiter.com → wd12). Verified: CXS HTTP 200, total=397, Physician facet=126 jobs (id=54e1565c3bfa10053f2dc8a0674b0000). Major Bronx academic system, high J-1-waiver density (Bronx HPSA).",
  },
  // ── JSON-LD sources — community/regional iron-core sponsors ────────────────
  // ATS confirmed by scale-sponsors.ts probe (2026-06-12). handle = full
  // physician-filtered search URL. Employer-direct: no board is involved.
  // These are all DOL iron-core (7/7 years), so every opening is a sponsor-backed lead.
  // All start disabled; enable after verifying the URL returns physician postings.
  {
    id: "jsonld-froedtert",
    tier: 1,
    connector: "jsonld",
    label: "Froedtert Health — physicians (Infor CloudSuite)",
    handle: "https://css-froedterthealth-prd.inforcloudsuite.com",
    employer: "Froedtert Health",
    enabled: false,
    needsVerification: true,
    note: "DISABLED 2026-06-12: Step 2 probe mis-detected Phenom from careers.froedtert.com landing page — actual ATS is Infor CloudSuite HCM (css-froedterthealth-prd.inforcloudsuite.com). That domain returns HTTP 403 to a plain Node client (bot protection). Disabled — same posture as WVU. DOL iron-core (7/7 years). Revisit only via sanctioned feed.",
  },
  {
    id: "jsonld-mercy",
    tier: 1,
    connector: "jsonld",
    label: "Mercy Health — physicians (Phenom)",
    handle: "https://careers.mercy.com/us/en/search-results?keywords=physician",
    employer: "Mercy Health",
    enabled: false,
    needsVerification: false,
    note: "DISABLED 2026-06-12: Mercy Health does not post attending physician (MD/DO) jobs on careers.mercy.com. Full sitemap scan: 1,163 URLs across 3 sub-sitemaps — zero actual physician attending titles. Every 'physician' URL match is support staff (RN, CMA, LPN, Patient Services Rep at a physician's office) or a department name (Orthopedics, Cardiology). NONPHYS_SLUG_RE correctly excludes all URL-slug matches. DOL iron-core (7yr/138pos) — sponsorship is real but ATS surface carries only clinical support staff. Revisit only if Mercy adds a physician-specific careers portal.",
  },
  {
    id: "jsonld-tufts",
    tier: 1,
    connector: "jsonld",
    label: "Tufts Medical Center — physicians (Phenom)",
    handle: "https://careers.tuftsmedicine.org/us/en/search-results?keywords=physician",
    employer: "Tufts Medical Center",
    enabled: true,
    needsVerification: true,
    note: "DOL iron-core sponsor (7/7 years). ATS = Phenom; search page is a React SPA so fetchJsonLd uses the sitemap fallback (flat sitemap.xml, 438 /job/ URLs, ~68 physician-slug matches). Verified 2026-06-12: /job/R21325/Internal-Medicine-Physician returns @type:JobPosting with 15KB description. Boston community-teaching hospital.",
  },
  {
    id: "jsonld-umms",
    tier: 1,
    connector: "jsonld",
    label: "University of Maryland Medical System — physicians (Phenom)",
    handle: "https://careers.umms.org/us/en/search-results?keywords=physician",
    employer: "University of Maryland Medical System",
    enabled: true,
    needsVerification: true,
    note: "DOL iron-core sponsor (7/7 years). ATS = Phenom; search page is a React SPA so fetchJsonLd uses the sitemap fallback (sitemap_index.xml → 3 sub-sitemaps → 1496 /job/ URLs, ~104 physician-slug matches). Verified 2026-06-12: Neurohospitalist posting returns @type:JobPosting, org=UMMS, 6KB description. MD state system.",
  },
  {
    id: "jsonld-uabmedicine",
    tier: 1,
    connector: "jsonld",
    label: "UAB Medicine — physicians (iCIMS)",
    handle: "https://uabmedicine.icims.com/jobs/search?ss=1&searchKeyword=physician",
    employer: "University of Alabama Birmingham Medicine",
    enabled: false,
    needsVerification: true,
    note: "DISABLED 2026-06-12: The Step 2 probe subdomain 'careers-uabmedicine.icims.com' is a CDN proxy for the UAB Medicine hospital website (WordPress), not the iCIMS job portal. Alternative portal 'uabmedicine.icims.com' timed out (connection refused). DOL iron-core (7/7 years, 93 FY2025 positions). Revisit if correct iCIMS portal URL found.",
  },
  {
    id: "workday-kumc",
    tier: 1,
    connector: "workday",
    label: "University of Kansas Medical Center — physicians (Workday)",
    handle: "kumc/wd5/kumc-jobs",
    employer: "University of Kansas Medical Center",
    enabled: true,
    needsVerification: true,
    note: "DOL iron-core sponsor (7/7 years FY2019-FY2025, 18 certified positions). Workday site confirmed 2026-06-12: kumc.wd5.myworkdayjobs.com/kumc-jobs, CXS HTTP 200, ~23 'physician' hits. jobFamilyGroup has no 'Physician' descriptor so keyword fallback is used (acceptable at this volume). Academic medical center, KS.",
  },
  {
    id: "workday-geisinger",
    tier: 1,
    connector: "workday",
    label: "Geisinger Clinic — physicians (Workday)",
    handle: "geisinger/wd5/GeisingerExternal",
    employer: "Geisinger Clinic",
    enabled: true,
    needsVerification: true,
    note: "DOL iron-core sponsor (7/7 years FY2019-FY2025, 78 certified positions FY2025). Workday site confirmed 2026-06-12: geisinger.wd5.myworkdayjobs.com/GeisingerExternal, CXS HTTP 200. No jobFamilyGroup facets exposed (0 values) → keyword 'physician' fallback (~888 results, scanned up to 500). 6-10 physician-titled jobs confirmed in sample. PA academic health system; specialties span all major physician SOCs.",
  },
  {
    id: "jibe-emory",
    tier: 1,
    connector: "jibe",
    label: "Emory University — physician faculty (Jibe/iCIMS)",
    handle: "https://careers.emory.edu",
    employer: "Emory University",
    enabled: true,
    needsVerification: true,
    note: "DOL iron-core sponsor (7/7 years FY2019-FY2025, 40 certified positions). ATS = Jibe (iCIMS wrapper). Physician faculty jobs at faculty-emory.icims.com — individual job pages are SPA-rendered (no JSON-LD), but careers.emory.edu/api/jobs returns full JSON with title, HTML description, city/state, apply_url. Verified 2026-06-12: API returns 200, totalCount ~1860 for keyword=physician. Jibe connector fetches pages, filters by isPhysician(), collects up to 40 physician-titled jobs. GA academic system, high J-1/H-1B density.",
  },
  {
    id: "jsonld-guthrie",
    tier: 1,
    connector: "jsonld",
    label: "Guthrie Clinic — physicians (Oracle HCM)",
    handle: "https://careers.guthrie.org/search-results?keyword=physician",
    employer: "Guthrie Medical Group",
    enabled: false,
    needsVerification: true,
    note: "DOL iron-core sponsor (7/7 years FY2019-FY2025, 12 certified positions) under 'Guthrie Medical Group, P.C.'. ATS = Oracle HCM (detected via scale-sponsors.ts probe 2026-06-12). fetchJsonLd SPA fallback will attempt sitemap enumeration for /job/ URLs. DISABLED pending manual verification that sitemap at careers.guthrie.org includes physician job URLs with JSON-LD. PA/NY regional health system.",
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
