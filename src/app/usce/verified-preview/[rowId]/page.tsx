import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin } from "lucide-react";
import {
  OPPORTUNITY_TYPE_LABELS,
  SOURCE_SCOPE_LABELS,
  audienceLabel,
} from "@/lib/p102-approved-usce";
import {
  getAllPreviewRows,
  getPreviewRowById,
} from "@/lib/p102-preview-rows";
import { Badge } from "@/components/ui/badge";
import { P102SourceQuoteEvidenceBox } from "@/components/listings/p102-source-quote-evidence-box";
import { ListingDisclaimer } from "@/components/listings/listing-disclaimer";

/**
 * P102 Verified-Preview Detail Page.
 *
 * Renders one approved opportunity row from the static snapshot. The
 * source quote evidence box is the centerpiece — verbatim quote +
 * official source URL + last-reviewed date + review status.
 *
 * Local preview ONLY. noindex via robots meta.
 */

interface DetailPageParams {
  params: Promise<{ rowId: string }>;
}

export async function generateStaticParams() {
  return getAllPreviewRows().map((row) => ({ rowId: row.rowId }));
}

export async function generateMetadata({ params }: DetailPageParams): Promise<Metadata> {
  const { rowId } = await params;
  const row = getPreviewRowById(rowId);
  if (!row) {
    return {
      title: "Preview row not found — internal",
      robots: { index: false, follow: false },
    };
  }
  return {
    title: `${row.opportunityName} — ${row.institutionName} — internal preview`,
    description: `Source-linked ${OPPORTUNITY_TYPE_LABELS[row.opportunityType]} at ${row.institutionName}, ${row.city}, ${row.state}.`,
    robots: { index: false, follow: false, nocache: true },
  };
}

export default async function VerifiedPreviewDetailPage({ params }: DetailPageParams) {
  const { rowId } = await params;
  const row = getPreviewRowById(rowId);
  if (!row) notFound();

  const typeLabel = OPPORTUNITY_TYPE_LABELS[row.opportunityType] ?? row.opportunityType;
  const scopeLabel = SOURCE_SCOPE_LABELS[row.sourceScope] ?? row.sourceScope;
  const audience = audienceLabel(row.audience);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-4 text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
        Internal preview · not indexed
      </div>

      <Link
        href="/usce/verified-preview"
        className="mb-6 inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to preview listing
      </Link>

      <header className="mb-6">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <Badge variant="default">{typeLabel}</Badge>
          {row.specialty ? (
            <Badge variant="default">{row.specialty}</Badge>
          ) : null}
        </div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          {row.opportunityName}
        </h1>
        <p className="mt-2 text-base text-slate-700 dark:text-slate-300">
          {row.institutionName}
          {row.campus ? ` — ${row.campus}` : ""}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
            {row.city}, {row.state}
          </span>
        </div>
      </header>

      <ListingDisclaimer className="mb-6" />

      <P102SourceQuoteEvidenceBox
        sourceQuote={row.sourceQuote}
        sourceUrl={row.sourceUrl}
        lastReviewed={row.reviewedAt}
        reviewStatus={row.reviewStatus}
        reviewer={row.reviewer}
        campusApplicabilityProof={row.campusApplicabilityProof}
      />

      <section className="mt-6 grid gap-4 sm:grid-cols-2">
        <Field label="Audience" value={audience} />
        <Field
          label="Eligibility"
          value={row.eligibility ?? "Not stated on source"}
        />
        <Field
          label="Application route"
          value={row.applicationRoute ?? "Not stated on source"}
        />
        <Field label="Cost" value={row.cost ?? "Not stated on source"} />
        <Field
          label="Duration"
          value={row.duration ?? "Not stated on source"}
        />
        <Field
          label="Deadline"
          value={row.deadline ?? "Not stated on source"}
        />
        {row.contact ? (
          <Field
            label="Contact"
            value={[
              row.contact.name,
              row.contact.title,
              row.contact.email,
              row.contact.phone,
            ]
              .filter(Boolean)
              .join(" · ") || "Not stated on source"}
          />
        ) : (
          <Field label="Contact" value="Not stated on source" />
        )}
      </section>

      <section className="mt-8 rounded-lg border border-slate-200 bg-white p-4 text-xs text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
        <div className="mb-2 font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Provenance
        </div>
        <dl className="grid gap-1 sm:grid-cols-2">
          <Detail label="Source scope" value={scopeLabel} />
          <Detail
            label="Review status"
            value={
              row.reviewStatus === "AUTO_PUBLIC_SAFE"
                ? "Auto-promoted (framework safety gates passed)"
                : `Reviewer-approved (${row.reviewer ?? "anonymous"})`
            }
          />
          <Detail label="Extracted from run" value={row.extractedFromRunId} />
          <Detail label="Source hash" value={row.sourceHash} />
        </dl>
        {row.warnings && row.warnings.length > 0 ? (
          <div className="mt-3 rounded border border-amber-200 bg-amber-50 p-2 text-xs text-amber-800 dark:border-amber-700 dark:bg-amber-900/40 dark:text-amber-200">
            <div className="mb-1 font-medium">Notes</div>
            <ul className="list-inside list-disc">
              {row.warnings.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

      <section className="mt-8">
        <Link
          href={`mailto:report@uscehub.com?subject=Report%20issue%20with%20preview%20row%20${row.rowId}&body=Row: ${encodeURIComponent(row.opportunityName)} at ${encodeURIComponent(row.institutionName)}%0ASource: ${encodeURIComponent(row.sourceUrl)}%0A%0ADescription of issue:%0A`}
          className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 transition hover:border-slate-400 hover:text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-slate-400 dark:hover:text-slate-50"
        >
          Report an issue with this row
        </Link>
      </section>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800">
      <div className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </div>
      <div className="mt-1 text-sm text-slate-800 dark:text-slate-200">
        {value}
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] font-medium uppercase tracking-wide text-slate-500 dark:text-slate-500">
        {label}
      </dt>
      <dd className="mt-0.5 break-all text-xs text-slate-700 dark:text-slate-300">
        {value}
      </dd>
    </div>
  );
}
