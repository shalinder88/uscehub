import Link from "next/link";
import { MapPin, ShieldCheck } from "lucide-react";
import { CardRoot } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  OPPORTUNITY_TYPE_LABELS,
  audienceLabel,
  type P102ApprovedRow,
} from "@/lib/p102-approved-usce";
import type { PreviewRow, PreviewSource } from "@/lib/p102-preview-rows";

/**
 * P102 Preview Listing Card.
 *
 * Visually inspired by the existing `<ListingCard>` but routes to
 * `/usce/verified-preview/[rowId]` (not `/listing/[id]`) because the
 * preview rows do NOT live in the Prisma `listing` table — they are
 * sourced from the local static snapshot
 * `src/data/generated/p102-approved-usce.generated.json`.
 *
 * Card surface intentionally minimal: institution, opportunity, location,
 * audience, type. No star ratings (no reviews yet). No save / apply CTA
 * (those mutate the DB). No source quote on the card itself — the quote
 * appears on the detail page in the evidence box, never truncated.
 */
interface P102PreviewListingCardProps {
  row: P102ApprovedRow | PreviewRow;
}

const SOURCE_BADGE_CLS: Record<PreviewSource, string> = {
  AUTO_REVIEWED: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  EXACT_SEED: "bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  INTELLIGENT_GATE: "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300",
};
const SOURCE_BADGE_LABEL: Record<PreviewSource, string> = {
  AUTO_REVIEWED: "Reviewed",
  EXACT_SEED: "Exact seed",
  INTELLIGENT_GATE: "Intelligent gate",
};

function opportunityTypeBadgeVariant(
  type: string,
): "observership" | "elective" | "research" | "externship" | "default" {
  if (type === "OBSERVERSHIP") return "observership";
  if (type === "CLINICAL_ELECTIVE" || type === "VISITING_MEDICAL_STUDENT" || type === "SUB_INTERNSHIP" || type === "AWAY_ROTATION" || type === "INTERNATIONAL_VISITING_STUDENT") return "elective";
  if (type === "RESEARCH_OPPORTUNITY") return "research";
  if (type === "EXTERNSHIP") return "externship";
  return "default";
}

export function P102PreviewListingCard({ row }: P102PreviewListingCardProps) {
  const typeLabel = OPPORTUNITY_TYPE_LABELS[row.opportunityType] ?? row.opportunityType;
  const audience = audienceLabel(row.audience);
  const previewSource = "previewSource" in row ? row.previewSource : "AUTO_REVIEWED";
  const quoteSnippet = truncateAtSentence(row.sourceQuote, 140);

  return (
    <Link href={`/usce/verified-preview/${row.rowId}`}>
      <CardRoot className="group h-full transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
        <div className="flex h-full flex-col p-5">
          <div className="mb-3 flex items-start justify-between gap-2">
            <Badge variant={opportunityTypeBadgeVariant(row.opportunityType)}>
              {typeLabel}
            </Badge>
            <span className={`inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-medium ${SOURCE_BADGE_CLS[previewSource]}`}>
              <ShieldCheck className="h-3 w-3" aria-hidden="true" />
              {SOURCE_BADGE_LABEL[previewSource]}
            </span>
          </div>

          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {row.institutionName}
            {row.campus ? ` · ${row.campus}` : ""}
          </p>

          <h3 className="mb-3 line-clamp-2 text-base font-semibold text-slate-900 dark:text-slate-100 group-hover:text-slate-700 dark:group-hover:text-white">
            {row.opportunityName}
          </h3>

          {quoteSnippet ? (
            <blockquote className="mb-3 border-l-2 border-slate-200 pl-3 text-sm italic text-slate-600 dark:border-slate-700 dark:text-slate-300 line-clamp-3">
              &ldquo;{quoteSnippet}&rdquo;
            </blockquote>
          ) : null}

          <div className="mt-auto space-y-1.5 border-t border-slate-100 pt-3 dark:border-slate-700">
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span>{row.city}, {row.state}</span>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {audience}
            </div>
            {row.specialty ? (
              <Badge variant="default" className="text-xs">
                {row.specialty}
              </Badge>
            ) : null}
          </div>
        </div>
      </CardRoot>
    </Link>
  );
}

/** Trim a quote to <= maxLen at a sentence/clause boundary if possible. */
function truncateAtSentence(quote: string | null | undefined, maxLen: number): string {
  if (!quote) return "";
  const q = quote.trim();
  if (q.length <= maxLen) return q;
  // Prefer cutting at a period, then comma, then word
  const window = q.slice(0, maxLen);
  const period = window.lastIndexOf(". ");
  if (period > maxLen * 0.5) return window.slice(0, period + 1);
  const comma = window.lastIndexOf(", ");
  if (comma > maxLen * 0.6) return window.slice(0, comma) + "…";
  const space = window.lastIndexOf(" ");
  return (space > 0 ? window.slice(0, space) : window) + "…";
}
