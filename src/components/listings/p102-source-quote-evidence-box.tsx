import { ExternalLink, Quote } from "lucide-react";

/**
 * P102 Source Quote Evidence Box.
 *
 * Renders a verbatim quote from the official institution source page with
 * attribution and a "Verify on official source" external link. This is the
 * trust differentiator vs every other IMG-info site: we show the user the
 * exact words from the official page, not a paraphrase.
 *
 * Used only on the /usce/verified-preview/[rowId] detail page. Never on
 * cards (the card would be too noisy with full-quote display).
 *
 * Display rules (enforced via prop typing — the validator guarantees the
 * row never reaches here with NOT_STATED_ON_SOURCE):
 *   - quote rendered verbatim, no truncation, no paraphrase
 *   - sourceUrl always shown with explicit "Verify on official source" CTA
 *   - external link opens in new tab with rel=noopener noreferrer
 *   - "Last reviewed" date is the date the row entered the approved export
 *   - never claims "officially verified" / "hospital-approved" / etc.
 */
interface P102SourceQuoteEvidenceBoxProps {
  /** Verbatim quote from the source page. Never NOT_STATED_ON_SOURCE. */
  sourceQuote: string;
  /** Official institution source URL. http:// or https://. */
  sourceUrl: string;
  /** ISO date string the row was last reviewed (yyyy-mm-dd). */
  lastReviewed: string;
  /** AUTO_PUBLIC_SAFE or REVIEWER_APPROVED — used to render review status. */
  reviewStatus: "AUTO_PUBLIC_SAFE" | "REVIEWER_APPROVED";
  /** Optional name of the reviewer when REVIEWER_APPROVED. */
  reviewer?: string | null;
  /** Optional campus applicability proof when sourceScope is system/school. */
  campusApplicabilityProof?: string | null;
}

export function P102SourceQuoteEvidenceBox({
  sourceQuote,
  sourceUrl,
  lastReviewed,
  reviewStatus,
  reviewer,
  campusApplicabilityProof,
}: P102SourceQuoteEvidenceBoxProps) {
  const reviewBadge =
    reviewStatus === "AUTO_PUBLIC_SAFE"
      ? "Source-linked (auto)"
      : `Source-linked (reviewed${reviewer ? ` by ${reviewer}` : ""})`;

  return (
    <section
      aria-label="Source quote evidence"
      className="rounded-xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800/60"
    >
      <header className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
        <Quote className="h-3.5 w-3.5" aria-hidden="true" />
        Source quote
      </header>

      <blockquote className="border-l-2 border-slate-300 pl-4 italic text-slate-800 dark:border-slate-600 dark:text-slate-200">
        &ldquo;{sourceQuote}&rdquo;
      </blockquote>

      <div className="mt-4 flex flex-col gap-2 text-sm text-slate-600 dark:text-slate-400 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <a
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-slate-700 underline-offset-2 hover:underline dark:text-slate-300"
          >
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            Verify on official source
          </a>
          <span className="break-all text-xs text-slate-500 dark:text-slate-500">
            {sourceUrl}
          </span>
        </div>
        <div className="flex flex-col items-start gap-0.5 text-xs sm:items-end">
          <span className="font-medium text-slate-700 dark:text-slate-300">
            {reviewBadge}
          </span>
          <span>Last reviewed: {lastReviewed}</span>
        </div>
      </div>

      {campusApplicabilityProof ? (
        <div className="mt-4 rounded-md border border-slate-200 bg-white p-3 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
          <div className="mb-1 font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Campus applicability proof
          </div>
          <p className="leading-relaxed">{campusApplicabilityProof}</p>
        </div>
      ) : null}
    </section>
  );
}
