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

export type Connector = "usajobs" | "greenhouse" | "workday" | "none";

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
    note: "Government API. Requires USAJOBS_API_KEY + USAJOBS_USER_AGENT.",
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
