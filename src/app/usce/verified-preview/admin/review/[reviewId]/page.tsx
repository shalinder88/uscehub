import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink, Quote } from "lucide-react";
import {
  getDecisionById,
  REVIEWER_DECISIONS,
  OPPORTUNITY_TYPES,
  AUDIENCES,
  DECISION_LABEL,
} from "@/lib/p102-review-csv";
import { saveReviewDecision } from "../../_actions";

/**
 * P102 Reviewer Admin — single-row edit form.
 *
 * Local-only. 404 in production. Renders one decision row with:
 *   - source quote (verbatim, scrollable)
 *   - "Verify on official source" external link
 *   - dropdown for reviewerDecision
 *   - text fields for reviewer, decisionReason, reviewedAt (default today)
 *   - conditional fields for APPROVE_PUBLIC_SAFE (opportunity name/type/
 *     audience/campus + campusApplicabilityProof)
 *   - conditional duplicateOfRowId for DUPLICATE_OF_APPROVED_ROW
 *
 * Server-side validation in `_actions.ts:saveReviewDecision`. After save,
 * redirects back here with ?saved=1.
 *
 * For deeper safety, the underlying build-time validator (`p102-validate-
 * approved-public-safe-export.ts`) still enforces every rule from
 * P102_REVIEWER_WORKFLOW_SPEC.md §6 when the reviewer clicks
 * "Rebuild approved export & sync website" on the list page.
 */
export const metadata: Metadata = {
  title: "P102 Review — internal",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

const SYSTEM_OR_SCHOOL_SCOPES = new Set([
  "HEALTH_SYSTEM_LEVEL",
  "MEDICAL_SCHOOL_LEVEL",
]);

const AUDIENCE_LABEL: Record<string, string> = {
  "us-md-do": "US MD/DO visiting student (VMS)",
  "img-observer": "IMG observer/extern",
  "international": "International medical student",
  "unknown": "Unknown",
};

interface PageProps {
  params: Promise<{ reviewId: string }>;
  searchParams: Promise<{ saved?: string }>;
}

export default async function ReviewEditPage({
  params,
  searchParams,
}: PageProps) {
  if (process.env.NODE_ENV === "production") notFound();
  const { reviewId } = await params;
  const search = await searchParams;
  const row = getDecisionById(reviewId);
  if (!row) notFound();

  const requiresCampusProof = SYSTEM_OR_SCHOOL_SCOPES.has(row.sourceScope);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-2 text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
        Internal admin · not indexed · dev-only
      </div>

      <Link
        href="/usce/verified-preview/admin/review"
        className="mb-6 inline-flex items-center gap-1 text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to review queue
      </Link>

      {search.saved === "1" ? (
        <div className="mb-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200">
          Saved. The new decision is live in the CSV. Run{" "}
          <strong>Rebuild approved export &amp; sync website</strong> from the queue page when you&apos;re done with this batch.
        </div>
      ) : null}

      <header className="mb-6">
        <div className="mb-1 text-xs text-slate-500 dark:text-slate-400">
          Review #{row.reviewId} · run {row.runId}
        </div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
          {row.institutionName}
        </h1>
        <div className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          {row.city}, {row.state} · scope: <code className="rounded bg-slate-100 px-1 text-xs dark:bg-slate-700">{row.sourceScope}</code> · deep family: <code className="rounded bg-slate-100 px-1 text-xs dark:bg-slate-700">{row.deepSourceFamily}</code> · priority {row.priorityScore}
        </div>
      </header>

      <section className="mb-6 rounded-lg border border-slate-200 bg-slate-50 p-5 dark:border-slate-700 dark:bg-slate-800/60">
        <header className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
          <Quote className="h-3.5 w-3.5" aria-hidden="true" />
          Source quote (verbatim, do not paraphrase when approving)
        </header>
        <blockquote className="border-l-2 border-slate-300 pl-4 italic text-slate-800 dark:border-slate-600 dark:text-slate-200">
          &ldquo;{row.quote}&rdquo;
        </blockquote>
        <div className="mt-4 flex flex-col gap-1 text-sm text-slate-600 dark:text-slate-400">
          <a
            href={row.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 self-start text-slate-700 underline-offset-2 hover:underline dark:text-slate-300"
          >
            <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
            Open official source
          </a>
          <code className="break-all text-xs text-slate-500 dark:text-slate-500">
            {row.sourceUrl}
          </code>
        </div>
        {row.warnings ? (
          <div className="mt-4 rounded border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-700 dark:bg-amber-900/40 dark:text-amber-200">
            <div className="mb-1 font-medium">Reviewer notes from extraction</div>
            <p className="leading-relaxed">{row.warnings}</p>
          </div>
        ) : null}
      </section>

      {requiresCampusProof ? (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-700 dark:bg-amber-900/40 dark:text-amber-200">
          <strong>This source is {row.sourceScope}.</strong> To approve as public-safe, you must paste a verbatim ≥30-char campusApplicabilityProof that names the specific hospital — see the textarea below.
        </div>
      ) : null}

      <form action={saveReviewDecision} className="space-y-5">
        <input type="hidden" name="reviewId" value={row.reviewId} />

        <Field label="Decision">
          <select
            name="reviewerDecision"
            defaultValue={row.reviewerDecision || "KEEP_HUMAN_REVIEW"}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          >
            {REVIEWER_DECISIONS.map((d) => (
              <option key={d} value={d}>
                {(DECISION_LABEL as Record<string, string>)[d]}
              </option>
            ))}
          </select>
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Reviewer (your name)">
            <input
              type="text"
              name="reviewer"
              defaultValue={row.reviewer}
              placeholder="Your full name — not 'auto'/'AI'/'Claude'"
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            />
          </Field>
          <Field label="Reviewed at (YYYY-MM-DD)">
            <input
              type="text"
              name="reviewedAt"
              defaultValue={row.reviewedAt || today}
              pattern="\d{4}-\d{2}-\d{2}"
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            />
          </Field>
        </div>

        <Field
          label="Decision reason (≥10 chars; not 'TBD'/'TODO'/'unknown')"
        >
          <textarea
            name="decisionReason"
            defaultValue={row.decisionReason}
            rows={3}
            placeholder="Explain what convinced you. E.g.: 'The quote names this hospital as the rotation site and lists the application route as VSLO via med.example.edu/visiting-students.'"
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          />
        </Field>

        <details className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800" open>
          <summary className="cursor-pointer text-sm font-medium text-slate-700 dark:text-slate-300">
            APPROVE fields (required when decision = Approve as public-safe)
          </summary>
          <div className="mt-4 grid gap-4">
            <Field label="Proposed opportunity name (≥3 chars)">
              <input
                type="text"
                name="proposedOpportunityName"
                defaultValue={row.proposedOpportunityName}
                placeholder="e.g. International Visiting Medical Student Program"
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Opportunity type">
                <select
                  name="proposedOpportunityType"
                  defaultValue={row.proposedOpportunityType}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
                >
                  <option value="">— select —</option>
                  {OPPORTUNITY_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Audience (check all that apply)">
                <div className="flex flex-wrap gap-3 rounded-md border border-slate-300 bg-white px-3 py-2 dark:border-slate-600 dark:bg-slate-800">
                  {AUDIENCES.filter((a) => a !== "unknown").map((a) => {
                    const selected = (row.proposedAudience || "")
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean);
                    return (
                      <label
                        key={a}
                        className="inline-flex items-center gap-2 text-sm text-slate-700 dark:text-slate-200"
                      >
                        <input
                          type="checkbox"
                          name="proposedAudience"
                          value={a}
                          defaultChecked={selected.includes(a)}
                          className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-500 dark:border-slate-500 dark:bg-slate-700"
                        />
                        {AUDIENCE_LABEL[a]}
                      </label>
                    );
                  })}
                </div>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">
                  When the same page serves both VMS and IMG (e.g.&nbsp;Houston Methodist Medical Student Rotations), check both.
                </p>
              </Field>
            </div>
            <Field label="Proposed campus (name the specific hospital for system/school scope)">
              <input
                type="text"
                name="proposedCampus"
                defaultValue={row.proposedCampus}
                placeholder="e.g. Memorial Regional Hollywood"
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              />
            </Field>
            <Field
              label={
                requiresCampusProof
                  ? "Campus applicability proof (REQUIRED for system/school scope, ≥30 chars)"
                  : "Campus applicability proof (optional for institution-specific scope)"
              }
            >
              <textarea
                name="campusApplicabilityProof"
                defaultValue={row.campusApplicabilityProof}
                rows={4}
                placeholder={
                  'e.g. "Teaching site list at medschool.example.edu/clinical-affiliates names Memorial Regional Hollywood as a primary teaching hospital for OB/GYN clerkships."'
                }
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              />
            </Field>
          </div>
        </details>

        <details className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
          <summary className="cursor-pointer text-sm font-medium text-slate-700 dark:text-slate-300">
            Duplicate / notes (optional)
          </summary>
          <div className="mt-4 grid gap-4">
            <Field label="Duplicate of approved rowId (when decision = Duplicate)">
              <input
                type="text"
                name="duplicateOfRowId"
                defaultValue={row.duplicateOfRowId}
                placeholder="16-char approved rowId"
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              />
            </Field>
            <Field label="Notes (free text, optional)">
              <textarea
                name="notes"
                defaultValue={row.notes}
                rows={2}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              />
            </Field>
          </div>
        </details>

        <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4 dark:border-slate-700">
          <Link
            href="/usce/verified-preview/admin/review"
            className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:border-slate-400 hover:text-slate-900 dark:border-slate-600 dark:text-slate-200 dark:hover:border-slate-400 dark:hover:text-slate-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
          >
            Save decision
          </button>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-500">
          Saving updates the CSV row only. Run <strong>Rebuild approved export &amp; sync website</strong> on the queue page when you&apos;re done with this batch — it runs the four scripts (build / validate / sync / validate) and refreshes the public preview.
        </p>
      </form>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </span>
      {children}
    </label>
  );
}
