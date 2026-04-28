/**
 * Pure classification: HTTP outcome → LinkVerificationStatus + reason.
 *
 * Extracted from `src/app/api/cron/verify-listings/route.ts` so the
 * decision table is unit-testable without a network or a database.
 *
 * Conservative-by-design (Phase 3.3 contract):
 *   - SOURCE_DEAD is never emitted here. A single failed HEAD does not
 *     prove a program is gone; that escalation belongs to the admin
 *     queue (PR 3.4) once a human can review repeated failures.
 *   - PROGRAM_CLOSED and NO_OFFICIAL_SOURCE are admin-only states.
 *     This module never returns either.
 *
 * See docs/codebase-audit/PHASE_3_3_VERIFICATION_CRON_DESIGN.md for the
 * full classification table this module implements.
 */

import type { LinkVerificationStatus } from "@prisma/client";

/**
 * Outcome of a single HEAD probe — the input to classification.
 *
 * `httpStatus = 0` is the convention used elsewhere in this codebase
 * (see `scripts/verify-jobs.ts`) to mean "no response, network error".
 * `408` is the convention for "fetch was aborted by our timeout".
 */
export interface ProbeOutcome {
  httpStatus: number;
  redirected: boolean;
  finalUrl: string | null;
  errorKind: "none" | "timeout" | "network";
}

/**
 * Classification result. `null` reason means the URL passed verification.
 */
export interface Classification {
  status: LinkVerificationStatus;
  reason: string | null;
}

const STATUSES = {
  VERIFIED: "VERIFIED" as LinkVerificationStatus,
  REVERIFYING: "REVERIFYING" as LinkVerificationStatus,
  NEEDS_MANUAL_REVIEW: "NEEDS_MANUAL_REVIEW" as LinkVerificationStatus,
};

export function classifyProbeOutcome(outcome: ProbeOutcome): Classification {
  // Timeout / network: temporary by default, retry next day.
  if (outcome.errorKind === "timeout") {
    return { status: STATUSES.REVERIFYING, reason: "timeout_10s" };
  }
  if (outcome.errorKind === "network") {
    return { status: STATUSES.REVERIFYING, reason: "network_error" };
  }

  const code = outcome.httpStatus;

  // 2xx — live URL.
  if (code >= 200 && code < 300) {
    return { status: STATUSES.VERIFIED, reason: null };
  }

  // 3xx after redirect:follow can only land here if the redirect itself
  // returned a non-2xx final response that fetch did not transparently
  // resolve (e.g. redirect loop reaching the cap). Treat as needing
  // human eyes — not as verified.
  if (code >= 300 && code < 400) {
    return {
      status: STATUSES.NEEDS_MANUAL_REVIEW,
      reason: `http_3xx_${code}_unresolved_redirect`,
    };
  }

  // 405 falls through to the "Other 4xx" rule below. The route's
  // probeUrl performs a HEAD→GET fallback when HEAD returns 405 (PR
  // 3.3a) — so any 405 reaching classification means the GET retry
  // also returned 405. In that case it is genuinely unusual and goes
  // to the human queue rather than being silently treated as live.

  // 401 / 403 — auth or permission wall. Could be intentional (career
  // portal behind login) or bot blocking. Human review.
  if (code === 401) {
    return { status: STATUSES.NEEDS_MANUAL_REVIEW, reason: "http_401_unauthorized" };
  }
  if (code === 403) {
    return { status: STATUSES.NEEDS_MANUAL_REVIEW, reason: "http_403_forbidden" };
  }

  // 404 / 410 — missing. NOT auto-routed to SOURCE_DEAD. A single 404
  // can be a deploy artifact, transient unpublish, or path drift; the
  // human queue decides whether to demote.
  if (code === 404) {
    return { status: STATUSES.NEEDS_MANUAL_REVIEW, reason: "http_404_not_found" };
  }
  if (code === 410) {
    return { status: STATUSES.NEEDS_MANUAL_REVIEW, reason: "http_410_gone" };
  }

  // 408 (returned by upstream) and 429 — rate-limited / timeout-from-server.
  // Try again next day rather than churning the human queue.
  if (code === 408 || code === 429) {
    return { status: STATUSES.REVERIFYING, reason: `http_${code}_transient` };
  }

  // Other 4xx (e.g. 451 Unavailable for Legal Reasons) — surface to human.
  if (code >= 400 && code < 500) {
    return { status: STATUSES.NEEDS_MANUAL_REVIEW, reason: `http_4xx_${code}` };
  }

  // 5xx — server-side problem; transient by default.
  if (code >= 500 && code < 600) {
    return { status: STATUSES.REVERIFYING, reason: `http_5xx_${code}` };
  }

  // Unknown / unexpected (including 0 if errorKind was set wrong) —
  // surface to human rather than silently verifying.
  return { status: STATUSES.NEEDS_MANUAL_REVIEW, reason: `http_unexpected_${code}` };
}

/**
 * Pick the URL the cron should probe for a listing, in priority order:
 * sourceUrl > applicationUrl > websiteUrl. Returns null when no URL is
 * present, signaling the listing should be skipped entirely.
 *
 * Defined here (not at the call site) so the resolution rule is
 * unit-testable.
 */
export interface ListingUrls {
  sourceUrl: string | null;
  applicationUrl: string | null;
  websiteUrl: string | null;
}

export function pickProbeUrl(urls: ListingUrls): string | null {
  if (urls.sourceUrl && urls.sourceUrl.trim().length > 0) return urls.sourceUrl;
  if (urls.applicationUrl && urls.applicationUrl.trim().length > 0) return urls.applicationUrl;
  if (urls.websiteUrl && urls.websiteUrl.trim().length > 0) return urls.websiteUrl;
  return null;
}
