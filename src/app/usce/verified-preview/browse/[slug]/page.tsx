import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, MapPin, ShieldCheck, Flag } from "lucide-react";
import {
  getDisplaySlugIndex,
  slugifyProgram,
  type DisplayEligibleRow,
} from "@/lib/p102-display-eligible-listings";
import {
  SOURCE_BADGE_CLASS,
  SOURCE_BADGE_LABEL,
  SUBTYPE_LABEL,
  AUDIENCE_LABEL,
  type SourceBadge,
} from "../badge-styles";

export const metadata: Metadata = {
  title: "Listing preview — internal",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function BrowsePreviewDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const idx = getDisplaySlugIndex();
  const row: DisplayEligibleRow | undefined = idx.get(slug);
  if (!row) notFound();

  const badge: SourceBadge =
    row.badge === "HIDDEN" || row.badge === "HOLD" ? "DIRECT" : (row.badge as SourceBadge);
  const subType = SUBTYPE_LABEL[row.subType] ?? row.subType;
  const audience = AUDIENCE_LABEL[row.audience] ?? row.audience;
  const showInstitution = row.institution && row.institution !== row.programName;

  return (
    <main className="bg-white dark:bg-slate-950 text-stone-900 dark:text-slate-100 min-h-screen">
      <div className="border-b border-stone-200 dark:border-slate-800 bg-stone-50 dark:bg-slate-900">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
          <Link
            href="/usce/verified-preview/browse"
            className="inline-flex items-center gap-1 text-sm text-stone-500 dark:text-slate-400 hover:text-stone-900 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to browse preview
          </Link>
          <p className="mt-4 text-xs uppercase tracking-wider text-stone-500 dark:text-slate-400">
            Internal preview · noindex
          </p>
          <h1 className="mt-1 text-3xl font-semibold">{row.programName}</h1>
          {showInstitution && (
            <p className="mt-1 text-sm text-stone-600 dark:text-slate-400">{row.institution}</p>
          )}

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 rounded border px-2.5 py-1 text-xs font-semibold uppercase tracking-wider ${SOURCE_BADGE_CLASS[badge]}`}
            >
              <ShieldCheck className="h-3 w-3" aria-hidden="true" />
              {SOURCE_BADGE_LABEL[badge]}
            </span>
            {row.specialtyLimited && (
              <span className="inline-flex items-center rounded border border-fuchsia-300 dark:border-fuchsia-700 bg-fuchsia-50 dark:bg-fuchsia-900/40 text-fuchsia-900 dark:text-fuchsia-200 px-2.5 py-1 text-xs font-semibold uppercase tracking-wider">
                Specialty: {row.specialtyLimited}
              </span>
            )}
            {row.state && (
              <span className="inline-flex items-center gap-1 rounded border border-stone-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-stone-700 dark:text-slate-200 px-2.5 py-1 text-xs font-medium">
                <MapPin className="h-3 w-3" aria-hidden="true" />
                {row.state}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
        <section className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-slate-400">
              Type
            </h2>
            <p className="mt-1 text-sm text-stone-900 dark:text-slate-100">{subType}</p>
          </div>
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-slate-400">
              Audience
            </h2>
            <p className="mt-1 text-sm text-stone-900 dark:text-slate-100">{audience}</p>
          </div>
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-slate-400">
              Cost
            </h2>
            <p className="mt-1 text-sm text-stone-500 dark:text-slate-400 italic">
              Not listed on source
            </p>
          </div>
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-slate-400">
              Duration
            </h2>
            <p className="mt-1 text-sm text-stone-500 dark:text-slate-400 italic">
              Not clearly listed — check official page
            </p>
          </div>
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-slate-400">
              Visa
            </h2>
            <p className="mt-1 text-sm text-stone-500 dark:text-slate-400 italic">
              Check official source
            </p>
          </div>
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-slate-400">
              Application
            </h2>
            <p className="mt-1 text-sm text-stone-500 dark:text-slate-400 italic">
              Verify on official page
            </p>
          </div>
        </section>

        <section className="mt-8 rounded-lg border border-stone-200 dark:border-slate-700 bg-stone-50 dark:bg-slate-900 p-5">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-slate-400">
            Source link
          </h2>
          <p className="mt-2 break-all text-sm text-stone-700 dark:text-slate-200">
            <a
              href={row.finalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-stone-400 dark:decoration-slate-500 hover:text-stone-900 dark:hover:text-white"
            >
              {row.finalUrl}
            </a>
          </p>
          <a
            href={row.finalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1.5 rounded bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-4 py-1.5 text-sm font-semibold hover:bg-slate-700 dark:hover:bg-white"
          >
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
            Verify on official source
          </a>
        </section>

        {row.evidenceQuote && (
          <section className="mt-8">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-slate-400">
              Source note / evidence
            </h2>
            <blockquote className="mt-2 border-l-2 border-stone-300 dark:border-slate-600 pl-3 text-sm text-stone-700 dark:text-slate-300">
              {row.evidenceQuote}
            </blockquote>
          </section>
        )}

        {row.provenanceNote && row.provenanceNote !== row.evidenceQuote && (
          <section className="mt-6">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-stone-500 dark:text-slate-400">
              Local review provenance
            </h2>
            <p className="mt-2 text-sm text-stone-600 dark:text-slate-300">{row.provenanceNote}</p>
          </section>
        )}

        <section
          id="report-issue"
          className="mt-10 rounded-lg border border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5"
        >
          <h2 className="flex items-center gap-2 text-sm font-semibold text-stone-900 dark:text-slate-100">
            <Flag className="h-4 w-4 text-stone-500 dark:text-slate-400" aria-hidden="true" />
            Report an issue
          </h2>
          <p className="mt-2 text-sm text-stone-600 dark:text-slate-300">
            See an outdated URL, a program that no longer accepts visiting students,
            or a wrong specialty? Tell us. We&apos;ll re-verify with the institution
            and update the source link. (Placeholder — report flow not wired in the
            local preview yet.)
          </p>
          <button
            type="button"
            disabled
            className="mt-3 inline-flex items-center gap-1.5 rounded border border-stone-300 dark:border-slate-600 bg-stone-100 dark:bg-slate-800 text-stone-500 dark:text-slate-400 px-3 py-1.5 text-xs font-medium opacity-70 cursor-not-allowed"
          >
            <Flag className="h-3 w-3" aria-hidden="true" />
            Report this listing (coming soon)
          </button>
        </section>

        <p className="mt-10 text-xs text-stone-500 dark:text-slate-400">
          Slug: <code>{slugifyProgram(row.programName, row.state)}</code> · This
          page is a local preview with <code>noindex</code>. No production data
          is read or mutated.
        </p>
      </div>
    </main>
  );
}
