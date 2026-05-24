import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, MapPin, ShieldCheck } from "lucide-react";
import {
  OPPORTUNITY_TYPE_LABELS,
  SOURCE_SCOPE_LABELS,
  audienceLabel,
} from "@/lib/p102-approved-usce";
import {
  getAllPreviewRows,
  getPreviewRowById,
  PREVIEW_SOURCE_LABELS,
  type PreviewSource,
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

      <header className="mb-6 border-b border-slate-200 pb-6 dark:border-slate-700">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Badge variant="default">{typeLabel}</Badge>
          {row.specialty ? (
            <Badge variant="default">{row.specialty}</Badge>
          ) : null}
          {"previewSource" in row ? (
            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${sourceBadgeCls(row.previewSource)}`}>
              <ShieldCheck className="h-3 w-3" aria-hidden="true" />
              {PREVIEW_SOURCE_LABELS[row.previewSource]}
            </span>
          ) : null}
        </div>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {row.institutionName}
          {row.campus ? ` · ${row.campus}` : ""}
        </p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          {row.opportunityName}
        </h1>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-600 dark:text-slate-400">
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
            {row.city}, {row.state}
          </span>
          <span>·</span>
          <span>{audience}</span>
        </div>
        <a
          href={row.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
        >
          <ExternalLink className="h-4 w-4" aria-hidden="true" />
          Apply on official source page
        </a>
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

      {/* Only render the Details grid if at least one field has data */}
      {hasAnyExtractedField(row) ? (
        <section className="mt-6">
          <h2 className="mb-3 text-sm font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Program details
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {row.eligibility ? <Field label="Eligibility" value={row.eligibility} /> : null}
            {row.applicationRoute ? <Field label="Application route" value={row.applicationRoute} /> : null}
            {row.cost ? <Field label="Cost" value={row.cost} /> : null}
            {row.duration ? <Field label="Duration" value={row.duration} /> : null}
            {row.deadline ? <Field label="Deadline" value={row.deadline} /> : null}
            {row.contact && contactString(row.contact) ? (
              <Field label="Contact" value={contactString(row.contact)} />
            ) : null}
          </div>
        </section>
      ) : (
        <section className="mt-6 rounded-md border border-slate-200 bg-white p-4 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
          <p>
            <strong>Program details (eligibility, cost, duration, deadline, contact)</strong> were
            not extracted into structured fields for this row. Use the
            &ldquo;Apply on official source page&rdquo; link above — the official
            page is the canonical source for application requirements.
          </p>
        </section>
      )}

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

function hasAnyExtractedField(row: { eligibility: string | null; applicationRoute: string | null; cost: string | null; duration: string | null; deadline: string | null; contact: { name: string | null; title: string | null; email: string | null; phone: string | null } | null }): boolean {
  if (row.eligibility || row.applicationRoute || row.cost || row.duration || row.deadline) return true;
  if (row.contact && contactString(row.contact)) return true;
  return false;
}

function contactString(c: { name: string | null; title: string | null; email: string | null; phone: string | null } | null): string {
  if (!c) return "";
  return [c.name, c.title, c.email, c.phone].filter(Boolean).join(" · ");
}

function sourceBadgeCls(s: PreviewSource): string {
  switch (s) {
    case "AUTO_REVIEWED": return "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300";
    case "EXACT_SEED": return "bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300";
    case "INTELLIGENT_GATE": return "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300";
  }
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
