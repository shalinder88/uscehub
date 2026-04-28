/**
 * Centralized public-facing metrics for USCEHub display copy.
 *
 * "Controlled live" model: these are the conservative, approved numbers
 * used in page titles, OG metadata, marketing copy, and footer claims.
 *
 * They do NOT replace live database queries. The Prisma `Listing` table
 * stays the source of truth for per-page dynamic stats (homepage stat
 * cards, browse "{n} listings found", per-state counts). This file is
 * the source of truth for PUBLIC CLAIMS that previously drifted because
 * the same number was hardcoded in 4+ files (see audit P1-2).
 *
 * When the underlying numbers change materially, update this file once
 * and every public claim updates with it. Do not scatter hardcoded
 * counts across page metadata anymore.
 *
 * Per docs/codebase-audit/RULES.md: this file does not change /career
 * counts; those live inside the protected /career area and are owned
 * by the unfinished careers backend work.
 */

export const SITE_METRICS = {
  /** Total opportunities indexed across all sources (active + historical). */
  opportunitiesIndexed: 304,

  /** Currently active, verified listings displayed publicly. */
  activeVerifiedListings: 207,

  /** US states with at least one indexed program. */
  statesCovered: 37,

  /** Last public-data refresh label, free-form, e.g. "April 2026". */
  lastUpdatedLabel: "April 2026",
} as const;

/**
 * Pre-formatted display strings for common claim sites.
 * Use these in page titles / OG / hero copy instead of hand-formatting.
 */
export const SITE_METRICS_DISPLAY = {
  opportunitiesIndexed: `${SITE_METRICS.opportunitiesIndexed}+ opportunities indexed`,
  activeVerifiedListings: `${SITE_METRICS.activeVerifiedListings} verified listings`,
  statesCovered: `${SITE_METRICS.statesCovered} states`,
  lastUpdated: `Updated ${SITE_METRICS.lastUpdatedLabel}`,
} as const;
