import type { Metadata } from "next";
import Link from "next/link";
import { readFileSync } from "node:fs";
import * as path from "node:path";
import { loadDecisions, getDecisionCounts } from "@/lib/p102-operator-review-decisions";
import { VERIFIED_LINKS } from "../../../../../../prisma/verified-links";
import { OperatorRow } from "./operator-row";

/**
 * P102 Operator Review Dashboard — internal-only review surface.
 *
 * Lists every row from the classifier output (207) with per-row
 * dropdowns for type + status and a note field. Each save writes to
 * a local JSON file at
 *   docs/.../p102/exports/operator_review_decisions.json
 *
 * Does NOT mutate Prisma, the seed, the schema, or verified-links.ts /
 * listings-hidelist.ts directly. A follow-up sprint will read this
 * file and apply the operator's "hide" / "verify" / "link dead" /
 * "not USCE" decisions back into verified-links.ts and
 * listings-hidelist.ts.
 *
 * SEO: noindex. Local-only — Server Actions throw in production.
 */
export const metadata: Metadata = {
  title: "P102 operator review — internal",
  description:
    "Internal operator review dashboard for the 207 data.js programs. Mark each row's type + status + optional note. Local-only.",
  robots: { index: false, follow: false, nocache: true },
};

export const dynamic = "force-dynamic";

interface ClassifierRow {
  listingTitle: string;
  institution: string;
  state: string;
  currentUrl: string;
  finalUrl: string;
  classification: string;
  countsAsTrueUSCE: boolean;
  countsAsResearch: boolean;
  isHidden: boolean;
}

const CLASSIFIER_PATH = path.resolve(
  process.cwd(),
  "docs/platform-v2/local/usce-discovery-command-center/p102/exports/live_listings_classification.json"
);

function loadClassifierRows(): ClassifierRow[] {
  try {
    const parsed = JSON.parse(readFileSync(CLASSIFIER_PATH, "utf8"));
    return Array.isArray(parsed) ? parsed : parsed.rows ?? [];
  } catch {
    return [];
  }
}

function badgeFor(c: string): "DIRECT" | "REORIENTED" | "PROTECTED" | "RESEARCH" | "HOLD" | "HIDDEN" {
  switch (c) {
    case "DIRECT_TRUE_USCE_LINK": return "DIRECT";
    case "MOVED_REORIENTED_TO_TRUE_USCE_LINK": return "REORIENTED";
    case "PROTECTED_BROWSER_REQUIRED": return "PROTECTED";
    case "RESEARCH_VALID_INSTITUTIONAL_PATHWAY":
    case "RESEARCH_DIRECT_PROGRAM":
    case "RESEARCH_GENERIC_BUT_ACCEPTABLE":
    case "RESEARCH_TOO_GENERIC_REVERIFY": return "RESEARCH";
    case "BORDERLINE_KEEP_REVERIFY":
    case "BROKEN_REQUIRES_MANUAL_BROWSER": return "HOLD";
    case "NO_PROGRAM_FOUND_HIDE":
    case "NEGATIVE_INFO_ROW_KEEP_OR_SEPARATE": return "HIDDEN";
    default: return "HOLD";
  }
}

interface PageProps {
  searchParams: Promise<{ filter?: string; q?: string }>;
}

export default async function ReviewDashboardPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const filter = (params.filter || "").toLowerCase();
  const query = (params.q || "").toLowerCase().trim();

  const rows = loadClassifierRows();
  const store = loadDecisions();
  const decisionCounts = getDecisionCounts();

  // Apply filter chips
  const filtered = rows.filter((r) => {
    if (query) {
      const blob = `${r.listingTitle} ${r.institution} ${r.state}`.toLowerCase();
      if (!blob.includes(query)) return false;
    }
    if (!filter || filter === "all") return true;
    if (filter === "true_usce") return r.countsAsTrueUSCE;
    if (filter === "research") return r.countsAsResearch;
    if (filter === "hidden") return r.isHidden;
    if (filter === "hold")
      return r.classification === "BORDERLINE_KEEP_REVERIFY" ||
             r.classification === "BROKEN_REQUIRES_MANUAL_BROWSER" ||
             r.classification === "RESEARCH_TOO_GENERIC_REVERIFY";
    if (filter === "undecided") return !store.byProgramName[r.listingTitle];
    if (filter === "decided") return !!store.byProgramName[r.listingTitle];
    return true;
  });

  const totalRows = rows.length;
  const decided = decisionCounts.DECIDED ?? 0;
  const undecided = totalRows - decided;

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 text-stone-900 dark:text-slate-100">
      <header className="mb-6">
        <p className="text-xs uppercase tracking-wider text-stone-500 dark:text-slate-400">
          Internal review · noindex · local-only writes
        </p>
        <h1 className="text-3xl font-semibold mt-1">P102 Operator Review</h1>
        <p className="mt-2 text-sm text-stone-600 dark:text-slate-300">
          207 data.js rows. Each save writes to{" "}
          <code className="rounded bg-stone-100 dark:bg-slate-800 dark:text-slate-100 px-1 py-0.5 text-xs">
            docs/.../exports/operator_review_decisions.json
          </code>
          . No DB / seed / schema mutation.
        </p>
      </header>

      <section className="mb-5 flex flex-wrap items-center gap-2">
        <span className="text-xs uppercase tracking-wider text-stone-500 dark:text-slate-400">
          Filter:
        </span>
        {[
          { key: "all", label: `All (${totalRows})` },
          { key: "true_usce", label: `True USCE (${rows.filter((r) => r.countsAsTrueUSCE).length})` },
          { key: "research", label: `Research valid (${rows.filter((r) => r.countsAsResearch).length})` },
          { key: "hidden", label: `Hidden (${rows.filter((r) => r.isHidden).length})` },
          { key: "hold", label: `Holds (${rows.filter((r) =>
              r.classification === "BORDERLINE_KEEP_REVERIFY" ||
              r.classification === "BROKEN_REQUIRES_MANUAL_BROWSER" ||
              r.classification === "RESEARCH_TOO_GENERIC_REVERIFY"
            ).length})` },
          { key: "decided", label: `Decided (${decided})` },
          { key: "undecided", label: `Undecided (${undecided})` },
        ].map((chip) => {
          const isActive = (filter || "all") === chip.key;
          return (
            <Link
              key={chip.key}
              href={`/usce/verified-preview/display-readiness/review?filter=${chip.key}${query ? `&q=${encodeURIComponent(query)}` : ""}`}
              className={`inline-flex items-center rounded border px-2 py-1 text-xs font-semibold ${
                isActive
                  ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-slate-900 dark:border-slate-100"
                  : "border-stone-300 dark:border-slate-600 text-stone-700 dark:text-slate-200 hover:bg-stone-100 dark:hover:bg-slate-800"
              }`}
            >
              {chip.label}
            </Link>
          );
        })}
      </section>

      <section className="mb-5">
        <form method="get" className="flex items-center gap-2">
          <input type="hidden" name="filter" value={filter || "all"} />
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Search institution / state…"
            className="w-72 rounded border border-stone-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-stone-900 dark:text-slate-100 px-3 py-1 text-sm"
          />
          <button
            type="submit"
            className="rounded bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-3 py-1 text-sm font-semibold hover:bg-slate-700 dark:hover:bg-white"
          >
            Search
          </button>
          {query && (
            <Link
              href={`/usce/verified-preview/display-readiness/review?filter=${filter || "all"}`}
              className="text-sm text-stone-500 dark:text-slate-400 hover:underline"
            >
              clear
            </Link>
          )}
        </form>
      </section>

      <section className="mb-3 text-sm text-stone-600 dark:text-slate-300">
        Showing <strong>{filtered.length}</strong> of {totalRows} rows.{" "}
        <strong>{decided}</strong> decided · <strong>{undecided}</strong> undecided.{" "}
        <Link
          href="/usce/verified-preview/display-readiness"
          className="ml-3 underline decoration-stone-400 dark:decoration-slate-500"
        >
          ← back to display readiness
        </Link>
      </section>

      <div className="overflow-x-auto rounded border border-stone-200 dark:border-slate-700">
        <table className="min-w-full text-sm">
          <thead className="bg-stone-50 dark:bg-slate-900 sticky top-0">
            <tr className="text-left text-xs uppercase tracking-wider text-stone-500 dark:text-slate-400">
              <th className="py-2 px-3">Program</th>
              <th className="py-2 px-3">Final URL</th>
              <th className="py-2 px-3 w-44">Type</th>
              <th className="py-2 px-3 w-36">Status</th>
              <th className="py-2 px-3">Note</th>
              <th className="py-2 px-3 w-24">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r, i) => (
              <OperatorRow
                key={`${r.listingTitle}-${i}`}
                programName={r.listingTitle}
                institution={r.institution}
                state={r.state}
                currentBadge={badgeFor(r.classification)}
                currentClassification={r.classification}
                finalUrl={r.finalUrl || r.currentUrl}
                specialtyLimited={VERIFIED_LINKS[r.listingTitle]?.specialtyLimited}
                existingDecision={store.byProgramName[r.listingTitle] ?? null}
              />
            ))}
          </tbody>
        </table>
      </div>

      <footer className="mt-8 border-t border-stone-200 dark:border-slate-700 pt-4 text-xs text-stone-500 dark:text-slate-400">
        Decisions saved to{" "}
        <code>docs/platform-v2/local/usce-discovery-command-center/p102/exports/operator_review_decisions.json</code>
        . Server Actions throw in production (NODE_ENV !== &apos;production&apos; check).
      </footer>
    </main>
  );
}
