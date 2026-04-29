/**
 * Pathway helpers — typed lookups + guards.
 *
 * Pure functions. No DB, no I/O, no React. Safe to import from any
 * runtime including server components and the edge runtime.
 *
 * Boundary rules:
 *   - This file does NOT read or write localStorage.
 *   - This file does NOT navigate or set search params.
 *   - This file does NOT make decisions about the URL — per the
 *     URL-wins doctrine in
 *     docs/platform-v2/SHARED_ENTRY_AND_SOCIAL_DISTRIBUTION_ARCHITECTURE.md,
 *     the URL always wins over a pathway preference. Helpers here
 *     just describe pathways; consumers wire them to UI.
 */

import {
  PATHWAYS,
  PATHWAY_KEYS,
  PATHWAY_LABELS,
  PATHWAY_DESCRIPTIONS,
  type PathwayKey,
} from "./tokens";

/**
 * Type guard — true when the input is a known pathway key.
 *
 * Use this when reading a value of unknown provenance (URL param,
 * localStorage, request body) to safely narrow the type.
 */
export function isPathwayKey(value: unknown): value is PathwayKey {
  if (typeof value !== "string") return false;
  return (Object.values(PATHWAY_KEYS) as string[]).includes(value);
}

/**
 * Look up a pathway descriptor by key. Returns `null` if the key is
 * unknown — callers decide whether to fall back to a default
 * pathway or render an empty state.
 */
export function getPathway(
  key: PathwayKey | string | null | undefined,
): {
  key: PathwayKey;
  label: string;
  description: string;
} | null {
  if (!isPathwayKey(key)) return null;
  return {
    key,
    label: PATHWAY_LABELS[key],
    description: PATHWAY_DESCRIPTIONS[key],
  };
}

/**
 * Default pathway for v2 launch. USCE & Match is Pathway #1 — the
 * pathway with real-functional listings, recommend, compare,
 * cost-estimator, and saved modules.
 */
export const DEFAULT_PATHWAY_KEY: PathwayKey = PATHWAY_KEYS.USCE_MATCH;

/**
 * Resolve a pathway key from an unknown input, falling back to the
 * default. Never throws.
 */
export function resolvePathwayKey(
  value: PathwayKey | string | null | undefined,
): PathwayKey {
  return isPathwayKey(value) ? value : DEFAULT_PATHWAY_KEY;
}

/**
 * Re-export for callers that want one entry point.
 */
export { PATHWAYS, PATHWAY_KEYS, PATHWAY_LABELS, PATHWAY_DESCRIPTIONS };
export type { PathwayKey };
