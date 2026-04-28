/**
 * Type-safe analytics event taxonomy + safety guardrails.
 *
 * Wraps `@vercel/analytics`'s `track()` with:
 *  - Typed event names (TypeScript prevents tracking events outside the taxonomy)
 *  - PII / sensitive-data blocklist enforced at runtime
 *  - SSR-safe (no-op on server)
 *  - Non-primitive values rejected (no object / array dumping)
 *
 * No PII allowed in event properties. Forbidden examples:
 *   - email, name, phone, address, ip, userAgent
 *   - free-text user content (notes, message, comment, body)
 *   - immigration / visa status
 *   - medical / personal sensitive data
 *
 * Allowed property shape: low-cardinality primitives only. Examples:
 *   - listingId (already in public route URLs — not PII)
 *   - listingType, verificationStatus, state code, specialty (low-cardinality enums)
 *   - boolean flags (`isVerified`, `hasFilter`)
 *   - small counts (`activeFilters: 2`)
 *
 * Naming convention for legitimate "name-of-thing" properties: use `*Label`
 * (e.g. `programLabel`, `stateLabel`) not `*Name`. The blocklist treats any
 * key containing "name" as PII-adjacent and drops it. False-positive on a
 * legitimately-named-but-poorly-named key is acceptable; PII leak is not.
 *
 * Usage:
 *   import { trackEvent, ANALYTICS_EVENTS } from "@/lib/analytics";
 *
 *   function onApplyClick(listingId: string, status: string) {
 *     trackEvent(ANALYTICS_EVENTS.SOURCE_CLICK, {
 *       listingId,
 *       verificationStatus: status,
 *     });
 *   }
 */

import { track } from "@vercel/analytics";

// ─── Event taxonomy ──────────────────────────────────────────────────────

export const ANALYTICS_EVENTS = {
  /** Listing detail page mounted (fired client-side after hydration). */
  LISTING_VIEW: "listing_view",
  /** User clicked the apply / source link CTA on listing detail or card. */
  SOURCE_CLICK: "source_click",
  /** Generic CTA click for non-source CTAs (mailto contact, "Learn More", etc.). */
  CTA_CLICK: "cta_click",
  /** User submitted a "Report broken link" report (auth or mailto path). */
  BROKEN_LINK_REPORT: "broken_link_report",
  /** A verification badge mounted in the user's viewport (rate-limited). */
  VERIFICATION_BADGE_SEEN: "verification_badge_seen",
  /** User changed a filter on /browse, state pages, or specialty pages. */
  BROWSE_FILTER_USED: "browse_filter_used",
  /** User submitted the smart-search form. */
  SEARCH_SUBMITTED: "search_submitted",
  /** User landed on /observerships/[state]. */
  STATE_PAGE_VIEW: "state_page_view",
  /** User landed on /observerships/specialty/[specialty]. */
  SPECIALTY_PAGE_VIEW: "specialty_page_view",
} as const;

export type AnalyticsEventName = (typeof ANALYTICS_EVENTS)[keyof typeof ANALYTICS_EVENTS];

/** Allowed input value type per Vercel Analytics' track() signature. */
export type AnalyticsValue = string | number | boolean | null | undefined;

// ─── Forbidden-key blocklist ─────────────────────────────────────────────

/**
 * Property keys that MUST never be tracked. The check is intentionally
 * aggressive — any key whose normalized form contains a forbidden token
 * (after lowercasing + stripping `_-`) is dropped. False positives are
 * preferred over PII leaks.
 */
const FORBIDDEN_KEYS: readonly string[] = [
  // PII identifiers
  "email", "emailaddress",
  "name", "firstname", "lastname", "fullname",
  "phone", "phonenumber", "tel", "mobile",
  "address", "street", "zipcode", "postalcode",
  "ip", "ipaddress",
  "useragent", "ua",
  // Free-text user content
  "message", "messagetext", "body", "comment", "comments",
  "notes", "freetext",
  // Immigration / sensitive
  "visa", "visastatus",
  "immigration", "immigrationstatus",
  "nationality", "countryoforigin",
  // Health / medical
  "diagnosis", "medical", "health",
  "ssn", "socialsecurity",
];

function normalizeKey(key: string): string {
  return key.toLowerCase().replace(/[\s_-]/g, "");
}

function isForbiddenKey(key: string): boolean {
  const k = normalizeKey(key);
  for (const forbidden of FORBIDDEN_KEYS) {
    if (k === forbidden) return true;
    if (k.includes(forbidden)) return true;
  }
  return false;
}

// ─── Sanitizer ───────────────────────────────────────────────────────────

/**
 * Drops null/undefined, blocks forbidden keys, rejects object/array values.
 * Returns only string | number | boolean primitives.
 *
 * In development, dropped/blocked properties emit a `console.warn`. In
 * production, they're silently dropped — analytics must never throw and
 * never block user interactions.
 */
export function sanitizeAnalyticsProperties(
  properties: Record<string, AnalyticsValue> = {},
): Record<string, string | number | boolean> {
  const out: Record<string, string | number | boolean> = {};

  for (const [key, value] of Object.entries(properties)) {
    if (value === null || value === undefined) continue;

    if (isForbiddenKey(key)) {
      if (process.env.NODE_ENV !== "production") {
        console.warn(
          `[analytics] forbidden property key "${key}" dropped. ` +
            `PII / sensitive keys must never be tracked.`,
        );
      }
      continue;
    }

    if (typeof value === "object") {
      if (process.env.NODE_ENV !== "production") {
        console.warn(
          `[analytics] non-primitive value for key "${key}" dropped. ` +
            `Only string | number | boolean are allowed.`,
        );
      }
      continue;
    }

    if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean"
    ) {
      out[key] = value;
    }
  }

  return out;
}

// ─── Public API ──────────────────────────────────────────────────────────

/**
 * Track a typed analytics event. SSR-safe (no-op on the server).
 *
 * The event name MUST be one of `ANALYTICS_EVENTS` — TypeScript will
 * reject unknown event names at compile time. Properties are sanitized
 * at runtime: forbidden keys are dropped, non-primitive values are dropped,
 * null/undefined are dropped.
 *
 * @param eventName — must be a member of `ANALYTICS_EVENTS`
 * @param properties — optional bag of safe primitives (sanitized)
 */
export function trackEvent(
  eventName: AnalyticsEventName,
  properties?: Record<string, AnalyticsValue>,
): void {
  // SSR guard: track() reads from window.vaq. No-op on the server.
  if (typeof window === "undefined") return;

  const safeProps = sanitizeAnalyticsProperties(properties);
  track(eventName, safeProps);
}
