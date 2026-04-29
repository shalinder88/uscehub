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
 *
 * Phase 3.9 trust-language refactor (PR #25): the legacy field name
 * `activeVerifiedListings` was renamed to `listingsWithOfficialSource`.
 * After PR #11 / #13 / #16 / #17 + #21 / #22, "verified" on USCEHub
 * means freshly cron-verified or admin-verified within the
 * verification engine — i.e. `linkVerificationStatus = VERIFIED` AND
 * `lastVerifiedAt IS NOT NULL`. The legacy `linkVerified = true`
 * Boolean predates that and includes ~136 backfilled rows whose URL
 * is on file but has not been re-checked. Rather than silently
 * narrow the public count to ~20 (the freshly-verified cohort) and
 * make the homepage look artificially weaker, we keep the broader
 * count as a separate, honestly-named metric ("listings with an
 * official source on file") and reserve the word "verified" for
 * the strict cohort, surfaced separately in admin/quality contexts.
 */

export const SITE_METRICS = {
  /** Total opportunities indexed across all sources (active + historical). */
  opportunitiesIndexed: 304,

  /**
   * Listings whose official source URL is on file (legacy
   * `linkVerified = true` count, equivalent to current
   * `linkVerificationStatus = VERIFIED` count regardless of
   * whether `lastVerifiedAt` is set). NOT the same as "freshly
   * verified by the cron" — see header docstring. Updated to 156
   * to match current DB state as of 2026-04-29.
   */
  listingsWithOfficialSource: 156,

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
  listingsWithOfficialSource: `${SITE_METRICS.listingsWithOfficialSource} listings with an official source on file`,
  statesCovered: `${SITE_METRICS.statesCovered} states`,
  lastUpdated: `Updated ${SITE_METRICS.lastUpdatedLabel}`,
} as const;
