/**
 * Platform v2 design tokens — labels, keys, conservative copy strings.
 *
 * This file is the single source of truth for v2 user-facing wording in
 * primitives. Goals:
 *
 *   1. Naming converged through Phase 0 audits — `usce_match`,
 *      `residency_fellowship`, `practice_career`, `all_pathways` —
 *      stays consistent everywhere.
 *
 *   2. Conservative trust language: never says "verified" unless the
 *      status genuinely is. Aligns with PR #42 (review trust copy
 *      fix), PR #44 (community placeholder), PR #47 (recommend/cost
 *      truth fix). See:
 *        - docs/platform-v2/TRUST_AND_MONETIZATION_POLICY.md
 *        - docs/platform-v2/audits/REVIEW_FLOW_AUDIT.md §9
 *
 *   3. Module names match what is real-functional today (saved /
 *      compare / suggested listings / cost estimator) and reserve
 *      "Checklist" / "Alerts preview" for upcoming Pathway #1 work
 *      WITHOUT shipping fake versions. See PR P1-3 plan.
 *
 * Pure constants. No React. No DB. No I/O. Safe for any runtime.
 */

// ---------------------------------------------------------------------------
// Pathways
// ---------------------------------------------------------------------------

/**
 * Stable machine keys for the four pathway buckets. NEVER renamed
 * without a coordinated migration of localStorage values, analytics
 * events, and any persisted preference. See
 * docs/platform-v2/PATHWAY_DASHBOARD_ARCHITECTURE.md.
 */
export const PATHWAY_KEYS = {
  USCE_MATCH: "usce_match",
  RESIDENCY_FELLOWSHIP: "residency_fellowship",
  PRACTICE_CAREER: "practice_career",
  ALL_PATHWAYS: "all_pathways",
} as const;

export type PathwayKey = (typeof PATHWAY_KEYS)[keyof typeof PATHWAY_KEYS];

/**
 * User-facing labels. These are the canonical names finalized in
 * PR #33 (PATHWAY_DASHBOARD_ARCHITECTURE) — symmetric `[noun] &
 * [noun]` form. Do not abbreviate or rename without re-running the
 * naming-convergence discussion.
 */
export const PATHWAY_LABELS: Record<PathwayKey, string> = {
  [PATHWAY_KEYS.USCE_MATCH]: "USCE & Match",
  [PATHWAY_KEYS.RESIDENCY_FELLOWSHIP]: "Residency & Fellowship",
  [PATHWAY_KEYS.PRACTICE_CAREER]: "Practice & Career",
  [PATHWAY_KEYS.ALL_PATHWAYS]: "Show All Pathways",
};

/**
 * Short descriptions used on selector cards / homepage tiles.
 * Conservative — no "best", no "complete", no "guaranteed".
 */
export const PATHWAY_DESCRIPTIONS: Record<PathwayKey, string> = {
  [PATHWAY_KEYS.USCE_MATCH]:
    "Observerships, externships, research, application planning, and Match strategy.",
  [PATHWAY_KEYS.RESIDENCY_FELLOWSHIP]:
    "Boards, fellowship planning, moonlighting, research, and program logistics.",
  [PATHWAY_KEYS.PRACTICE_CAREER]:
    "Jobs, contracts, visa pathways, licensing, malpractice, and post-residency planning.",
  [PATHWAY_KEYS.ALL_PATHWAYS]:
    "Show everything across pathways without scoping.",
};

/**
 * Ordered list for selector UI. Order: launch-pathway first
 * (USCE & Match, Pathway #1), then Pathway #2, Pathway #3, then the
 * meta "show all".
 */
export const PATHWAYS: ReadonlyArray<{
  key: PathwayKey;
  label: string;
  description: string;
}> = [
  {
    key: PATHWAY_KEYS.USCE_MATCH,
    label: PATHWAY_LABELS[PATHWAY_KEYS.USCE_MATCH],
    description: PATHWAY_DESCRIPTIONS[PATHWAY_KEYS.USCE_MATCH],
  },
  {
    key: PATHWAY_KEYS.RESIDENCY_FELLOWSHIP,
    label: PATHWAY_LABELS[PATHWAY_KEYS.RESIDENCY_FELLOWSHIP],
    description: PATHWAY_DESCRIPTIONS[PATHWAY_KEYS.RESIDENCY_FELLOWSHIP],
  },
  {
    key: PATHWAY_KEYS.PRACTICE_CAREER,
    label: PATHWAY_LABELS[PATHWAY_KEYS.PRACTICE_CAREER],
    description: PATHWAY_DESCRIPTIONS[PATHWAY_KEYS.PRACTICE_CAREER],
  },
  {
    key: PATHWAY_KEYS.ALL_PATHWAYS,
    label: PATHWAY_LABELS[PATHWAY_KEYS.ALL_PATHWAYS],
    description: PATHWAY_DESCRIPTIONS[PATHWAY_KEYS.ALL_PATHWAYS],
  },
];

// ---------------------------------------------------------------------------
// Trust / source language
// ---------------------------------------------------------------------------

/**
 * Trust-cue status values. Conservative by design — there is NO
 * "verified by user reviews" status because reviews are not part
 * of the source-link verification system (PR #41 audit §9, PR #42
 * fix added the listing-detail separator copy).
 */
export const TRUST_STATUSES = {
  /** Source link confirmed working by admin or cron at `lastReviewed`. */
  VERIFIED: "verified",
  /** A `websiteUrl` exists on file but has not been freshly verified. */
  ON_FILE: "on-file",
  /** Recently re-verified in the last verification window. */
  RECENTLY_VERIFIED: "recently-verified",
  /** Cron flagged the link for manual review. */
  NEEDS_RECHECK: "needs-recheck",
  /** Re-verification in progress. */
  REVERIFYING: "reverifying",
  /** No source link known. Most conservative; never use lighter word. */
  UNVERIFIED: "unverified",
} as const;

export type TrustStatus = (typeof TRUST_STATUSES)[keyof typeof TRUST_STATUSES];

/**
 * User-facing labels for trust statuses. NEVER use the word
 * "verified" for `on-file`, `unverified`, or `needs-recheck`. The
 * reverifying / needs-recheck / unverified copy here matches the
 * Phase 3 verification-engine doctrine (`LinkVerificationStatus`).
 */
export const TRUST_LABELS: Record<TrustStatus, string> = {
  [TRUST_STATUSES.VERIFIED]: "Source verified",
  [TRUST_STATUSES.ON_FILE]: "Source on file",
  [TRUST_STATUSES.RECENTLY_VERIFIED]: "Recently verified",
  [TRUST_STATUSES.NEEDS_RECHECK]: "Needs recheck",
  [TRUST_STATUSES.REVERIFYING]: "Re-checking",
  [TRUST_STATUSES.UNVERIFIED]: "Source not on file",
};

/** Short hint copy under the chip. Optional. */
export const TRUST_HINTS: Record<TrustStatus, string | null> = {
  [TRUST_STATUSES.VERIFIED]: "Source link confirmed working.",
  [TRUST_STATUSES.ON_FILE]:
    "Source URL on file but not freshly verified — confirm details on the institution page.",
  [TRUST_STATUSES.RECENTLY_VERIFIED]: "Source link confirmed in the last verification window.",
  [TRUST_STATUSES.NEEDS_RECHECK]:
    "Link returned an error during the last check — verify with the institution.",
  [TRUST_STATUSES.REVERIFYING]: "We're re-checking this link. Try again shortly.",
  [TRUST_STATUSES.UNVERIFIED]:
    "We don't have a verified source URL — search the institution's website to confirm.",
};

/** Generic "report issue / broken link" affordance label. */
export const REPORT_ISSUE_LABEL = "Report issue";
export const REPORT_BROKEN_LINK_LABEL = "Report broken link";

// ---------------------------------------------------------------------------
// Module names (for dashboard / home / pathway shells)
// ---------------------------------------------------------------------------

/**
 * Stable machine keys for Pathway #1 modules. Used by upcoming
 * PR P1-3 (USCE & Match dashboard shell).
 */
export const MODULE_KEYS = {
  SAVED_LISTINGS: "saved_listings",
  COMPARE: "compare",
  SUGGESTED_LISTINGS: "suggested_listings",
  COST_ESTIMATOR: "cost_estimator",
  CHECKLIST: "checklist",
  ALERTS_PREVIEW: "alerts_preview",
} as const;

export type ModuleKey = (typeof MODULE_KEYS)[keyof typeof MODULE_KEYS];

/**
 * User-facing module names. "Suggested listings" replaces "Top
 * Matches" / "Best Programs" wording per PR #47. "Cost estimator"
 * is shorter than the page title "Cost Calculator — Estimate Your
 * Observership Trip Costs" but consistent in framing.
 */
export const MODULE_LABELS: Record<ModuleKey, string> = {
  [MODULE_KEYS.SAVED_LISTINGS]: "Saved listings",
  [MODULE_KEYS.COMPARE]: "Compare",
  [MODULE_KEYS.SUGGESTED_LISTINGS]: "Suggested listings",
  [MODULE_KEYS.COST_ESTIMATOR]: "Cost estimator",
  [MODULE_KEYS.CHECKLIST]: "Checklist",
  [MODULE_KEYS.ALERTS_PREVIEW]: "Alerts (preview)",
};

/** One-line descriptions for module cards. Conservative. */
export const MODULE_DESCRIPTIONS: Record<ModuleKey, string> = {
  [MODULE_KEYS.SAVED_LISTINGS]: "Listings you've saved for later review.",
  [MODULE_KEYS.COMPARE]: "Side-by-side comparison of up to three listings.",
  [MODULE_KEYS.SUGGESTED_LISTINGS]:
    "Listings matching your filters, prioritized by recently verified, source-linked, approved status.",
  [MODULE_KEYS.COST_ESTIMATOR]:
    "Trip-side cost estimator — housing, food, transport, insurance, program fee. IMG-cycle fees not included.",
  [MODULE_KEYS.CHECKLIST]: "Track documents, deadlines, and steps for your USCE plan.",
  [MODULE_KEYS.ALERTS_PREVIEW]:
    "Preview of upcoming listing alerts. No emails sent until launch.",
};

// ---------------------------------------------------------------------------
// Conservative empty-state copy fragments
// ---------------------------------------------------------------------------

/**
 * Empty-state copy variants. Always conservative — no fabricated
 * counts, no pretend activity, no fake "join the conversation" CTAs.
 */
export const EMPTY_STATE_COPY = {
  GENERIC: {
    title: "Nothing here yet",
    description: "Content will appear when it's available.",
  },
  SAVED_LISTINGS: {
    title: "No saved listings",
    description:
      "Save listings from search or browse to revisit them here. Saving is local to your account.",
  },
  COMPARE: {
    title: "Nothing to compare yet",
    description: "Add up to three listings from search or browse to see them side by side.",
  },
  SUGGESTED_LISTINGS: {
    title: "No matches yet",
    description: "Try broadening your filters or browse all listings.",
  },
  CHECKLIST: {
    title: "Checklist is empty",
    description:
      "Use the checklist to track documents, deadlines, and steps for your USCE plan.",
  },
  ALERTS_PREVIEW: {
    title: "No alerts yet",
    description:
      "When alerts ship, this is where you'll preview them. No emails are sent today.",
  },
} as const;

// ---------------------------------------------------------------------------
// URL-wins doctrine helpers
// ---------------------------------------------------------------------------

/**
 * Default redirect-after-login key used by the auth flow. Kept here
 * so primitives can reference it without hard-coding the string.
 * Matches the existing `returnTo` pattern from PR #39.
 */
export const RETURN_TO_PARAM = "returnTo";

/**
 * Hard rule: pathway preference is localStorage-only at v2 launch.
 * No URL preference, no cookie preference, no DB column. Primitives
 * MUST NOT touch this directly — they receive `pathwayKey` from
 * upstream and pass it back via `onSelect`.
 */
export const PATHWAY_LOCALSTORAGE_KEY = "uscehub.pathway.preference.v1";
