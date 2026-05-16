import Link from "next/link";
import { MapPin, ShieldCheck } from "lucide-react";
import { CardRoot } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  OPPORTUNITY_TYPE_LABELS,
  audienceLabel,
  type P102ApprovedRow,
} from "@/lib/p102-approved-usce";

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
  row: P102ApprovedRow;
}

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

  return (
    <Link href={`/usce/verified-preview/${row.rowId}`}>
      <CardRoot className="group h-full transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
        <div className="p-5">
          <div className="mb-3 flex items-start justify-between gap-2">
            <Badge variant={opportunityTypeBadgeVariant(row.opportunityType)}>
              {typeLabel}
            </Badge>
            <Badge variant="default" className="inline-flex items-center gap-1 text-xs">
              <ShieldCheck className="h-3 w-3" aria-hidden="true" />
              Source-linked
            </Badge>
          </div>

          <h3 className="mb-1 line-clamp-2 text-base font-semibold text-slate-900 dark:text-slate-100 group-hover:text-slate-700 dark:group-hover:text-white">
            {row.opportunityName}
          </h3>

          <p className="mb-3 text-sm text-slate-600 dark:text-slate-300">
            {row.institutionName}
            {row.campus ? ` — ${row.campus}` : ""}
          </p>

          <div className="mb-3 space-y-1.5">
            <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span>
                {row.city}, {row.state}
              </span>
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400">
              {audience}
            </div>
          </div>

          {row.specialty ? (
            <Badge variant="default" className="text-xs">
              {row.specialty}
            </Badge>
          ) : null}
        </div>
      </CardRoot>
    </Link>
  );
}
