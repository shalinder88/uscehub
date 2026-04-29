/**
 * Pure helpers for the verified-listings digest preview (Phase 3.6
 * foundation — no-send only).
 *
 * Doctrine
 * --------
 * USCEHub's master blueprint §0 hard sequencing rule says the
 * conversion layer (saved/compare/alerts/digests) must come AFTER the
 * trust engine is stable. PR #11 → #13 → #16 → #17 made trust honest;
 * the cron has only been manually triggered once and the scheduled
 * tick is still pending. So for now this module is preview-only:
 *
 *   - Reads listings (or accepts already-loaded listings as input).
 *   - Formats a digest the way a future email could read.
 *   - Never sends anything. Never persists anything.
 *   - Never references subscribers, audiences, or recipient lists.
 *
 * When the cron has been clean for ~3-7 days and a subscriber model
 * is explicitly authorized via a schema PR, this module's
 * `formatDigestPlain()` and `selectDigestListings()` are reusable as
 * the content-generation half of the eventual send path.
 *
 * Pure functions. SSR-safe. No React. No DB calls in this module —
 * the caller (the script in scripts/preview-verified-listings-digest.ts)
 * does the Prisma read with the listing predicate documented below.
 */

/**
 * Conservative shape for a "digest-eligible" listing. A listing is
 * digest-eligible iff:
 *   - linkVerificationStatus === "VERIFIED" (not verified-on-file)
 *   - lastVerifiedAt is non-null (real timestamp, no fake dates)
 *   - status === "APPROVED" (not pending/rejected/hidden)
 *   - lastVerifiedAt within the configured window (default 7 days)
 *
 * The Prisma query that produces these rows is colocated in the
 * companion script, not here, so this module stays free of DB coupling.
 */
export interface DigestEligibleListing {
  id: string;
  title: string;
  listingType: string;
  specialty: string;
  city: string;
  state: string;
  duration: string | null;
  cost: string | null;
  sourceUrl: string | null;
  applicationUrl: string | null;
  websiteUrl: string | null;
  lastVerifiedAt: Date | string;
  /**
   * Optional URL precedence: caller can pre-resolve, or this module
   * picks per the same priority used by the cron and listing display:
   * sourceUrl > applicationUrl > websiteUrl.
   */
  preferredUrl?: string | null;
}

export interface DigestOptions {
  /** Default 7. Must be > 0. */
  windowDays?: number;
  /**
   * Optional max items in the rendered preview. The Prisma query is
   * still bounded by the caller; this is purely a render-cap. Default
   * 25 to mirror the cron's per-run cap.
   */
  maxItems?: number;
}

export interface DigestPreview {
  /** ISO timestamp at the moment the digest was generated. */
  generatedAt: string;
  /** Inclusive lower bound used to filter `lastVerifiedAt`. */
  sinceIso: string;
  /** Effective window in days. */
  windowDays: number;
  /** Effective render cap. */
  maxItems: number;
  /** How many eligible listings the caller passed in. */
  inputCount: number;
  /** How many made it into the rendered preview after sorting + cap. */
  renderedCount: number;
  /** Plain-text rendering, suitable for stdout or future email body. */
  plainText: string;
  /** The slice of input that was actually rendered (in display order). */
  rendered: DigestEligibleListing[];
}

const DEFAULT_WINDOW_DAYS = 7;
const DEFAULT_MAX_ITEMS = 25;

/**
 * Pick the most authoritative URL for a listing in the same priority
 * the cron uses (`sourceUrl > applicationUrl > websiteUrl`). Returns
 * null when no URL is on file.
 */
export function pickListingUrl(
  listing: Pick<DigestEligibleListing, "sourceUrl" | "applicationUrl" | "websiteUrl">,
): string | null {
  if (listing.sourceUrl && listing.sourceUrl.trim().length > 0) return listing.sourceUrl;
  if (listing.applicationUrl && listing.applicationUrl.trim().length > 0) return listing.applicationUrl;
  if (listing.websiteUrl && listing.websiteUrl.trim().length > 0) return listing.websiteUrl;
  return null;
}

/**
 * Format `lastVerifiedAt` (Date or ISO string) as a short YYYY-MM-DD
 * label for digest text. Returns `(unknown)` on bad input — never
 * fabricates a date.
 */
export function formatVerifiedDate(input: Date | string | null | undefined): string {
  if (input == null) return "(unknown)";
  const d = typeof input === "string" ? new Date(input) : input;
  if (Number.isNaN(d.getTime())) return "(unknown)";
  // Use UTC YYYY-MM-DD so digest preview is timezone-stable across
  // local/server runs and across email clients.
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Sort listings for the digest: most recently verified first, then
 * (stable) by title. A future send-path can change the order by group
 * (e.g. by specialty); the preview keeps it simple.
 */
export function sortDigestListings(rows: DigestEligibleListing[]): DigestEligibleListing[] {
  return rows.slice().sort((a, b) => {
    const at = new Date(a.lastVerifiedAt).getTime();
    const bt = new Date(b.lastVerifiedAt).getTime();
    if (bt !== at) return bt - at;
    return a.title.localeCompare(b.title);
  });
}

/**
 * Render a plain-text digest preview. Format is intentionally bland —
 * no marketing copy, no CTA promises, no overclaiming verification
 * language. Each line names the listing, location, specialty, the
 * verified date, and the preferred URL.
 *
 * The first line is a one-line summary suitable for a future email
 * subject ("USCEHub — N verified listings this week (preview, no
 * email sent)"). Future code can split body and subject; for now both
 * live in the same string.
 */
export function formatDigestPlain(
  rows: DigestEligibleListing[],
  options: DigestOptions = {},
): DigestPreview {
  const windowDays = Math.max(1, Math.floor(options.windowDays ?? DEFAULT_WINDOW_DAYS));
  const maxItems = Math.max(1, Math.floor(options.maxItems ?? DEFAULT_MAX_ITEMS));
  const generatedAt = new Date().toISOString();
  const sinceIso = new Date(Date.now() - windowDays * 24 * 60 * 60 * 1000).toISOString();

  const sorted = sortDigestListings(rows);
  const rendered = sorted.slice(0, maxItems);

  const header = [
    `USCEHub — ${rendered.length} verified listing${rendered.length === 1 ? "" : "s"} (last ${windowDays} day${windowDays === 1 ? "" : "s"})`,
    `(preview, no email sent — Phase 3.6 foundation)`,
    `generated_at=${generatedAt}`,
    `window_since=${sinceIso}`,
    `input_count=${rows.length}  rendered_count=${rendered.length}  max_items=${maxItems}`,
    "",
  ].join("\n");

  const body = rendered.length === 0
    ? "(no verified listings in this window)\n"
    : rendered
        .map((l, i) => {
          const url = l.preferredUrl ?? pickListingUrl(l) ?? "(no URL on file)";
          const verifiedOn = formatVerifiedDate(l.lastVerifiedAt);
          return [
            `${String(i + 1).padStart(2, " ")}. ${l.title}`,
            `    ${l.specialty} · ${l.city}, ${l.state}${l.duration ? ` · ${l.duration}` : ""}${l.cost ? ` · ${l.cost}` : ""}`,
            `    verified ${verifiedOn} · ${url}`,
          ].join("\n");
        })
        .join("\n\n") + "\n";

  const footer = [
    "",
    "—",
    "Notes:",
    "  · This is a preview. No email was sent. No subscribers exist yet.",
    "  · Listings shown have linkVerificationStatus = VERIFIED with a real lastVerifiedAt timestamp.",
    "  · Future scheduled sends require: (a) cron clean for several ticks; (b) subscriber schema; (c) consent flow; (d) unsubscribe link.",
    "",
  ].join("\n");

  return {
    generatedAt,
    sinceIso,
    windowDays,
    maxItems,
    inputCount: rows.length,
    renderedCount: rendered.length,
    plainText: header + body + footer,
    rendered,
  };
}

/**
 * Convenience: predicate the script uses to decide whether a Prisma
 * row is digest-eligible after fetch. Kept here so the rule is in one
 * place. The Prisma `where` clause and this predicate must agree.
 */
export function isDigestEligible(
  row: {
    linkVerificationStatus: string | null | undefined;
    lastVerifiedAt: Date | string | null | undefined;
    status: string | null | undefined;
  },
  windowDays: number = DEFAULT_WINDOW_DAYS,
): boolean {
  if (row.linkVerificationStatus !== "VERIFIED") return false;
  if (row.status !== "APPROVED") return false;
  if (row.lastVerifiedAt == null) return false;
  const d = typeof row.lastVerifiedAt === "string" ? new Date(row.lastVerifiedAt) : row.lastVerifiedAt;
  if (Number.isNaN(d.getTime())) return false;
  const cutoff = Date.now() - Math.max(1, Math.floor(windowDays)) * 24 * 60 * 60 * 1000;
  return d.getTime() >= cutoff;
}
