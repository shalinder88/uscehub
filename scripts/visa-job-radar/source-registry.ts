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

export type Connector = "usajobs" | "greenhouse" | "none";

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
    id: "greenhouse-placeholder",
    tier: 1,
    connector: "greenhouse",
    label: "Greenhouse board (placeholder)",
    handle: "EXAMPLE_BOARD_TOKEN",
    employer: "Example Health (placeholder)",
    enabled: false,
    needsVerification: true,
    note: "Replace token + employer with a verified employer-direct board before enabling.",
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
