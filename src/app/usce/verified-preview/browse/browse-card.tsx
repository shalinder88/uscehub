import Link from "next/link";
import { MapPin, ExternalLink, Flag } from "lucide-react";
import {
  SOURCE_BADGE_CLASS,
  SOURCE_BADGE_LABEL,
  SUBTYPE_LABEL,
  AUDIENCE_LABEL,
  type SourceBadge,
} from "./badge-styles";
import { slugifyProgram, type DisplayEligibleRow } from "@/lib/p102-display-eligible-listings";

interface BrowseCardProps {
  row: DisplayEligibleRow;
}

/**
 * Browse card for the local preview. Mirrors the visual feel of the
 * production `<ListingCard>` but driven entirely by the display-
 * eligibility export — never the Prisma DB. Honest sentinels for
 * fields the export doesn't carry.
 */
export function BrowseCard({ row }: BrowseCardProps) {
  const slug = slugifyProgram(row.programName, row.state);
  const badge: SourceBadge = (row.badge === "HIDDEN" || row.badge === "HOLD") ? "DIRECT" : (row.badge as SourceBadge);
  const subType = SUBTYPE_LABEL[row.subType] ?? row.subType;
  const audience = AUDIENCE_LABEL[row.audience] ?? row.audience;
  const showInstitution = row.institution && row.institution !== row.programName;

  return (
    <article className="flex h-full flex-col rounded-lg border border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 transition-all hover:border-stone-300 dark:hover:border-slate-600 hover:shadow-md dark:hover:shadow-slate-950/60">
      <div className="mb-3 flex flex-wrap items-center gap-1.5">
        <span
          className={`inline-flex items-center rounded border px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${SOURCE_BADGE_CLASS[badge]}`}
          title={SOURCE_BADGE_LABEL[badge]}
        >
          {badge}
        </span>
        {row.specialtyLimited && (
          <span
            className="inline-flex items-center rounded border border-fuchsia-300 dark:border-fuchsia-700 bg-fuchsia-50 dark:bg-fuchsia-900/40 text-fuchsia-900 dark:text-fuchsia-200 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider"
            title={`Specialty-limited: ${row.specialtyLimited}`}
          >
            Specialty: {row.specialtyLimited}
          </span>
        )}
      </div>

      <Link
        href={`/usce/verified-preview/browse/${slug}`}
        className="group"
      >
        <h3 className="line-clamp-2 text-base font-semibold text-stone-900 dark:text-slate-50 group-hover:text-stone-700 dark:group-hover:text-white">
          {row.programName}
        </h3>
        {showInstitution && (
          <p className="mt-0.5 text-xs text-stone-500 dark:text-slate-400 line-clamp-1">
            {row.institution}
          </p>
        )}
      </Link>

      <dl className="mt-3 space-y-1 text-xs text-stone-600 dark:text-slate-300">
        <div className="flex items-center gap-1.5">
          <MapPin className="h-3 w-3 text-stone-400 dark:text-slate-500" aria-hidden="true" />
          <span>{row.state || "Verify on official page"}</span>
        </div>
        <div>
          <span className="text-stone-500 dark:text-slate-400">Type:</span>{" "}
          <span className="font-medium text-stone-700 dark:text-slate-200">{subType}</span>
        </div>
        <div>
          <span className="text-stone-500 dark:text-slate-400">Audience:</span>{" "}
          <span className="text-stone-700 dark:text-slate-200">{audience}</span>
        </div>
      </dl>

      <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] text-stone-500 dark:text-slate-400">
        <div>Cost: Not listed on source</div>
        <div>Duration: Not clearly listed</div>
        <div>Visa: Check official source</div>
        <div>Application: Verify on official page</div>
      </div>

      <div className="mt-auto pt-4 flex items-center gap-2">
        <a
          href={row.finalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 rounded border border-stone-300 dark:border-slate-600 bg-stone-50 dark:bg-slate-800 text-stone-700 dark:text-slate-200 hover:bg-stone-100 dark:hover:bg-slate-700 px-2.5 py-1 text-xs font-medium"
        >
          <ExternalLink className="h-3 w-3" aria-hidden="true" />
          Verify on official source
        </a>
        <Link
          href={`/usce/verified-preview/browse/${slug}#report-issue`}
          className="inline-flex items-center gap-1 text-xs text-stone-500 dark:text-slate-400 hover:text-stone-700 dark:hover:text-slate-200"
        >
          <Flag className="h-3 w-3" aria-hidden="true" />
          Report issue
        </Link>
      </div>
    </article>
  );
}
