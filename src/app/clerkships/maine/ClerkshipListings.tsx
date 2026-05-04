"use client";

import { useState } from "react";
import {
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Flag,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  USCE_MAINE_CARDS,
  SPECIALTY_LABELS,
  NEEDS_REVIEW_COUNT,
  IMG_RELEVANT_COUNT,
  US_ONLY_COUNT,
  type UsceCard,
} from "@/lib/usce-maine-data";

// ── Types ─────────────────────────────────────────────────────────────────────

type AudienceFilter = "all" | "img_relevant" | "us_only";

interface Filters {
  audience: AudienceFilter;
  specialty: string;
  type: string;
  vsloOnly: boolean;
  unknownOnly: boolean;
}

const DEFAULT_FILTERS: Filters = {
  audience: "all",
  specialty: "all",
  type: "all",
  vsloOnly: false,
  unknownOnly: false,
};

// ── Static data ───────────────────────────────────────────────────────────────

function specialtyLabel(s: string) {
  return SPECIALTY_LABELS[s] ?? s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

const ALL_SPECIALTIES = Array.from(new Set(USCE_MAINE_CARDS.map((c) => c.specialty))).sort();
const ALL_TYPES = Array.from(new Set(USCE_MAINE_CARDS.map((c) => c.opportunity_type))).sort();

// ── Small presentational components ──────────────────────────────────────────

function AudienceRow({ label, status }: { label: string; status: string }) {
  const isEligible = status === "ELIGIBLE_EXPLICIT";
  const isExcluded = status === "EXCLUDED_EXPLICIT";
  const isUnknown = status === "UNKNOWN_NOT_STATED";

  return (
    <div className="flex items-start gap-2 text-xs">
      {isEligible && <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />}
      {isExcluded && <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-500" />}
      {isUnknown && <HelpCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />}
      <span
        className={
          isEligible
            ? "text-emerald-700 dark:text-emerald-400"
            : isExcluded
            ? "text-red-600 dark:text-red-400 line-through"
            : "text-amber-700 dark:text-amber-400"
        }
      >
        {label}
      </span>
      {isUnknown && (
        <span className="text-slate-400 dark:text-slate-500">— not stated by program</span>
      )}
    </div>
  );
}

function ReportIssuePlaceholder({ onClose }: { onClose: () => void }) {
  return (
    <div className="mt-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/60 p-3 text-xs">
      <p className="font-medium text-slate-700 dark:text-slate-300 mb-2">Report an issue</p>
      <div className="flex flex-col gap-1.5 mb-3">
        {[
          "Wrong eligibility",
          "Broken or changed link",
          "Program no longer available",
          "Fee or deadline incorrect",
          "Institution name correction",
        ].map((label) => (
          <label key={label} className="flex items-center gap-2 text-slate-500 dark:text-slate-400 cursor-not-allowed">
            <input type="radio" name="issue-type" disabled className="opacity-40" />
            {label}
          </label>
        ))}
      </div>
      <p className="text-slate-400 dark:text-slate-500 italic">
        Correction submissions are not yet active. Verify directly at the official program source link.
      </p>
      <button
        onClick={onClose}
        className="mt-2 text-xs text-slate-500 underline hover:text-slate-700 dark:hover:text-slate-300"
      >
        Close
      </button>
    </div>
  );
}

// ── Card ──────────────────────────────────────────────────────────────────────

function ClerkshipCard({ card }: { card: UsceCard }) {
  const [showReport, setShowReport] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const isImgRelevant = card.display_bucket === "READY_PUBLIC_IMG_RELEVANT";
  const hasVslo = card.restriction_tags.includes("VSLO_REQUIRED");
  const hasImgExcluded = card.restriction_tags.includes("IMG_EXCLUDED");
  const hasUnknown = card.unknown_audiences.length > 0;

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-white leading-snug">
            {specialtyLabel(card.specialty)}
          </p>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-1.5">
            {card.opportunity_type}
            {hasVslo && (
              <span className="inline-flex items-center rounded bg-amber-100 dark:bg-amber-900/30 px-1.5 py-0.5 text-amber-700 dark:text-amber-400 font-medium">
                VSLO required
              </span>
            )}
            {hasImgExcluded && !hasVslo && (
              <span className="inline-flex items-center rounded bg-red-100 dark:bg-red-900/30 px-1.5 py-0.5 text-red-700 dark:text-red-400 font-medium">
                IMG excluded
              </span>
            )}
          </p>
        </div>
        {isImgRelevant ? (
          <Badge variant="success" className="shrink-0 whitespace-nowrap">Intl. eligible</Badge>
        ) : (
          <Badge variant="warning" className="shrink-0 whitespace-nowrap">US MD/DO only</Badge>
        )}
      </div>

      {/* Audience breakdown */}
      <div className="flex flex-col gap-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 px-3 py-2.5">
        <AudienceRow label="US MD/DO student" status={card.audience_detail.us_md_do} />
        <AudienceRow label="International med student" status={card.audience_detail.international_student} />
        <AudienceRow label="IMG graduate" status={card.audience_detail.img_graduate} />
        <AudienceRow label="Caribbean-school student" status={card.audience_detail.caribbean_student} />
      </div>

      {/* Fit warnings (if any beyond the always-shown audience rows) */}
      {hasUnknown && (
        <p className="text-xs text-amber-600 dark:text-amber-400 flex items-start gap-1.5">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          IMG graduate and Caribbean-school eligibility not stated. Contact program to confirm.
        </p>
      )}

      {/* Links */}
      <div className="flex flex-wrap items-center gap-2">
        {card.application_url && (
          <a
            href={card.application_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 dark:bg-slate-100 px-3 py-1.5 text-xs font-medium text-white dark:text-slate-900 hover:bg-slate-700 dark:hover:bg-slate-200 transition-colors"
          >
            Apply
            <ExternalLink className="h-3 w-3" />
          </a>
        )}
        <a
          href={card.official_source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-600 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          Program page
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      {/* Expandable details */}
      <div className="border-t border-slate-100 dark:border-slate-800 pt-2">
        <button
          onClick={() => setShowDetails((v) => !v)}
          className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
        >
          {showDetails ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          {showDetails ? "Less" : "Details"}
        </button>

        {showDetails && (
          <div className="mt-2 flex flex-col gap-1 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex gap-2">
              <span className="text-slate-400 dark:text-slate-500 w-28 shrink-0">Source type</span>
              <span>{card.source_status.replace(/_/g, " ").toLowerCase()}</span>
            </div>
            <div className="flex gap-2">
              <span className="text-slate-400 dark:text-slate-500 w-28 shrink-0">Last reviewed</span>
              <span>{card.last_reviewed_at}</span>
            </div>
            <div className="flex gap-2">
              <span className="text-slate-400 dark:text-slate-500 w-28 shrink-0">Listing ID</span>
              <span className="font-mono">{card.listing_id}</span>
            </div>
            <p className="mt-1.5 text-slate-400 dark:text-slate-500 italic leading-snug">
              Eligibility is shown only when supported by reviewed public source evidence.
            </p>
          </div>
        )}

        {/* Report issue */}
        {!showReport ? (
          <button
            onClick={() => setShowReport(true)}
            className="mt-1.5 flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            <Flag className="h-3 w-3" />
            Report issue
          </button>
        ) : (
          <ReportIssuePlaceholder onClose={() => setShowReport(false)} />
        )}
      </div>
    </div>
  );
}

// ── Institution group ─────────────────────────────────────────────────────────

interface InstitutionGroupProps {
  name: string;
  city: string;
  cards: UsceCard[];
  note: React.ReactNode;
}

function InstitutionGroup({ name, city, cards, note }: InstitutionGroupProps) {
  if (cards.length === 0) return null;
  return (
    <section>
      <div className="mb-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">{name}</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">{city}</p>
        <div className="mt-2">{note}</div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <ClerkshipCard key={card.listing_id} card={card} />
        ))}
      </div>
    </section>
  );
}

// ── Filter bar ────────────────────────────────────────────────────────────────

function FilterBar({
  filters,
  onChange,
}: {
  filters: Filters;
  onChange: (f: Filters) => void;
}) {
  const set = (patch: Partial<Filters>) => onChange({ ...filters, ...patch });

  const audienceTabs: { key: AudienceFilter; label: string; count: number }[] = [
    { key: "all", label: "All programs", count: USCE_MAINE_CARDS.length },
    { key: "img_relevant", label: "International-eligible", count: IMG_RELEVANT_COUNT },
    { key: "us_only", label: "US MD/DO only", count: US_ONLY_COUNT },
  ];

  return (
    <div className="mb-8 flex flex-col gap-3">
      {/* Audience tabs */}
      <div className="flex flex-wrap gap-2">
        {audienceTabs.map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => set({ audience: key })}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              filters.audience === key
                ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900"
                : "border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            {label}
            <span className="ml-2 text-xs opacity-70">{count}</span>
          </button>
        ))}
      </div>

      {/* Secondary filters */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Specialty */}
        <select
          value={filters.specialty}
          onChange={(e) => set({ specialty: e.target.value })}
          className="rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400"
        >
          <option value="all">All specialties</option>
          {ALL_SPECIALTIES.map((s) => (
            <option key={s} value={s}>
              {specialtyLabel(s)}
            </option>
          ))}
        </select>

        {/* Opportunity type */}
        <select
          value={filters.type}
          onChange={(e) => set({ type: e.target.value })}
          className="rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400"
        >
          <option value="all">All types</option>
          {ALL_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        {/* VSLO toggle */}
        <button
          onClick={() => set({ vsloOnly: !filters.vsloOnly })}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors border ${
            filters.vsloOnly
              ? "bg-amber-100 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300"
              : "border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
          }`}
        >
          VSLO required
        </button>

        {/* Unknown eligibility toggle */}
        <button
          onClick={() => set({ unknownOnly: !filters.unknownOnly })}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors border ${
            filters.unknownOnly
              ? "bg-amber-100 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300"
              : "border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
          }`}
        >
          Unknown eligibility
        </button>

        {/* Clear */}
        {(filters.specialty !== "all" ||
          filters.type !== "all" ||
          filters.vsloOnly ||
          filters.unknownOnly) && (
          <button
            onClick={() =>
              set({ specialty: "all", type: "all", vsloOnly: false, unknownOnly: false })
            }
            className="text-xs text-slate-400 underline hover:text-slate-600 dark:hover:text-slate-300"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function ClerkshipListings() {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);

  const filtered = USCE_MAINE_CARDS.filter((c) => {
    if (filters.audience === "img_relevant" && c.display_bucket !== "READY_PUBLIC_IMG_RELEVANT")
      return false;
    if (filters.audience === "us_only" && c.display_bucket !== "READY_PUBLIC_US_STUDENT_ONLY")
      return false;
    if (filters.specialty !== "all" && c.specialty !== filters.specialty) return false;
    if (filters.type !== "all" && c.opportunity_type !== filters.type) return false;
    if (filters.vsloOnly && !c.restriction_tags.includes("VSLO_REQUIRED")) return false;
    if (filters.unknownOnly && c.unknown_audiences.length === 0) return false;
    return true;
  });

  const imgCards = filtered.filter((c) => c.display_bucket === "READY_PUBLIC_IMG_RELEVANT");
  const usCards = filtered.filter((c) => c.display_bucket === "READY_PUBLIC_US_STUDENT_ONLY");
  const isEmpty = filtered.length === 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <FilterBar filters={filters} onChange={setFilters} />

      {isEmpty ? (
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-6 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
          No programs match the selected filters.{" "}
          <button
            onClick={() => setFilters(DEFAULT_FILTERS)}
            className="underline hover:text-slate-700 dark:hover:text-slate-300"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-12">
          <InstitutionGroup
            name="Central Maine Medical Center (CMHC)"
            city="Lewiston, ME — Androscoggin County"
            cards={imgCards}
            note={
              <div className="flex items-start gap-2 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-2 text-xs text-emerald-800 dark:text-emerald-300">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>
                  International medical students explicitly accepted. Single Smartsheet application for
                  all specialties. IMG graduate eligibility is not stated — contact the program to
                  confirm.
                </span>
              </div>
            }
          />

          <InstitutionGroup
            name="Maine Medical Center (MMC)"
            city="Portland, ME — Cumberland County"
            cards={usCards}
            note={
              <div className="flex items-start gap-2 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-3 py-2 text-xs text-red-800 dark:text-red-300">
                <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>
                  LCME/AOA-accredited US schools only. Rotations route through the MMC VSLO hub.
                  International students, IMG graduates, and Caribbean-school students are excluded
                  by hub policy.
                </span>
              </div>
            }
          />
        </div>
      )}

      {/* Under-review notice */}
      <div className="mt-12 flex items-start gap-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-5 py-4 text-sm text-slate-600 dark:text-slate-400">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
        <p>
          <span className="font-medium text-slate-700 dark:text-slate-300">
            {NEEDS_REVIEW_COUNT} additional programs in Maine are under eligibility review
          </span>{" "}
          and will appear here once confirmed. This includes several MMC specialty pages and Northern
          Light EMMC programs where eligibility could not be verified from public sources alone.
        </p>
      </div>

      {/* Methodology */}
      <div className="mt-8 border-t border-slate-100 dark:border-slate-800 pt-6 text-xs text-slate-400 dark:text-slate-500 space-y-1.5">
        <p>
          Eligibility classifications are derived from official program pages, sourced and reviewed on{" "}
          <span className="font-medium">2026-05-03</span>. Classifications reflect what is stated on
          each page at time of review and may not reflect unpublished changes.
        </p>
        <p>
          &ldquo;International student&rdquo; refers to currently-enrolled international medical
          students. IMG graduate eligibility (post-graduation) is tracked separately and defaults to{" "}
          <span className="italic">not stated</span> unless the program page explicitly confirms it.
          These are different applicant cohorts.
        </p>
        <p>
          Source links open official program pages directly. No NPI, CMS, NPPES, or AAMC record data
          appears on this page.
        </p>
      </div>
    </div>
  );
}
