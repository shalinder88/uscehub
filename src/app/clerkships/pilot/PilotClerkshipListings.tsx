"use client";

import { ExternalLink } from "lucide-react";
import { USCE_PILOT_CARDS, type UsceCard } from "@/lib/usce-pilot-data";

const RESTRICTION_TAG_LABELS: Record<string, string> = {
  NAMED_SCHOOLS_ONLY: "Named-school MS3 list only",
  MS3_AND_MS4: "MS3 + MS4 access",
  MS4_SPACE_PERMITTING: "MS4 electives space-permitting",
  HOUSING_NOT_PROVIDED: "Housing not provided",
  VSLO_EXCEPT_SGUSOM: "VSLO (SGU students apply directly)",
  NO_BROAD_IMG_CLAIM: "Not a broad IMG pathway",
  NAMED_PARTNER_SGU_SOM: "SGU named partner only",
  SIBLING_SITE_TO_MORRISTOWN: "Sibling site to Morristown",
  LCME_AOA_ONLY: "LCME / AOA accredited schools only",
  VISA_APPLICANT_OBTAINED_B1: "B-1/B-2 visa obtained by applicant",
  NO_J1_SPONSORSHIP: "No J-1 sponsorship",
  NO_H1B_SPONSORSHIP: "No H-1B sponsorship",
  FEE_REQUIRED: "Application fee required",
  MAX_TWO_APPLICATIONS: "Max two applications per student",
  SYSTEM_PAGE_SOURCE_NO_HILLCREST_SPECIFIC_GUARANTEE: "System-level source — site-specific availability not separately enumerated",
  DIVERSITY_SCHOLARSHIP_AVAILABLE: "Diversity scholarship pathway",
  MS4_ONLY: "Fourth-year only",
  DIVERSITY_ELIGIBILITY_REQUIRED: "Underrepresented-in-medicine eligibility required",
  GOOD_ACADEMIC_STANDING_REQUIRED: "Good academic standing required",
  FEE_NOT_MENTIONED: "Source does not list fees",
};

function formatRestrictionTag(t: string): string {
  return RESTRICTION_TAG_LABELS[t] || t.toLowerCase().replace(/_/g, " ");
}

function formatAudience(a: string): string {
  return a.replace(/_/g, " ").toLowerCase();
}

function audienceSummary(c: UsceCard): string {
  const parts: string[] = [];
  if (c.eligible_audiences.length > 0) parts.push(`Eligible (per source): ${c.eligible_audiences.map(formatAudience).join(", ")}`);
  if (c.unknown_audiences.length > 0) parts.push(`Not stated on source: ${c.unknown_audiences.map(formatAudience).join(", ")}`);
  if (c.excluded_audiences.length > 0) parts.push(`Excluded by source: ${c.excluded_audiences.map(formatAudience).join(", ")}`);
  return parts.join(" · ");
}

export function PilotClerkshipListings() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
        <p className="font-medium">Source-reviewed pilot covering selected programs only.</p>
        <p className="mt-1 text-xs leading-relaxed">
          Eligibility, fees, visa policies, and application rules can change. Always verify on the official source before applying.
          Programs without confirmed source-level eligibility are withheld.
        </p>
      </div>

      <ul className="space-y-6">
        {USCE_PILOT_CARDS.map((c) => (
          <li
            key={c.listing_id}
            className="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-900"
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {c.institution_name}
                </h2>
                {c.campus_name ? (
                  <p className="text-sm text-slate-600 dark:text-slate-400">{c.campus_name}</p>
                ) : null}
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {c.county ? `${c.county} County, ` : ""}
                  {c.state}
                  {" · "}
                  {c.opportunity_type}
                </p>
              </div>
              <span className="inline-flex items-center self-start rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                {c.display_bucket === "READY_PUBLIC_IMG_RELEVANT" ? "Open to international students per source" : "US MD/DO per source"}
              </span>
            </div>

            <p className="mt-3 text-sm text-slate-700 dark:text-slate-300">
              {audienceSummary(c)}
            </p>

            {c.fit_warnings.length > 0 ? (
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {c.fit_warnings.map((w) => (
                  <li
                    key={w}
                    className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900 dark:bg-amber-900/40 dark:text-amber-300"
                  >
                    {formatRestrictionTag(w)}
                  </li>
                ))}
              </ul>
            ) : null}

            {c.restriction_tags.length > 0 ? (
              <details className="mt-3 text-xs text-slate-600 dark:text-slate-400">
                <summary className="cursor-pointer font-medium">Source caveats</summary>
                <ul className="mt-2 ml-4 list-disc space-y-1">
                  {c.restriction_tags.map((t) => (
                    <li key={t}>{formatRestrictionTag(t)}</li>
                  ))}
                </ul>
              </details>
            ) : null}

            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-600 dark:text-slate-400">
              <a
                href={c.official_source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-blue-700 hover:underline dark:text-blue-400"
              >
                Official source
                <ExternalLink className="h-3 w-3" aria-hidden="true" />
              </a>
              <span>
                Last reviewed {new Date(c.last_reviewed_at).toLocaleDateString()}
              </span>
              <span>{c.source_status.replace(/_/g, " ").toLowerCase()}</span>
            </div>
          </li>
        ))}
      </ul>

      <p className="mt-8 text-xs text-slate-500 dark:text-slate-500">
        See an issue? This is a source-reviewed pilot. Email corrections to the program directly via their official source page; this page does not act as an application system.
      </p>
    </div>
  );
}
