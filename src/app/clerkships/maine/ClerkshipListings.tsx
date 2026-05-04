"use client";

import { useState, useCallback, useEffect } from "react";
import {
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Flag,
  ChevronDown,
  ChevronUp,
  Bookmark,
  BookmarkCheck,
  X,
  Download,
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
type SaveFilter = "all" | "saved_only" | "unsaved_only";

interface Filters {
  audience: AudienceFilter;
  saveFilter: SaveFilter;
  specialty: string;
  type: string;
  vsloOnly: boolean;
  unknownOnly: boolean;
}

const DEFAULT_FILTERS: Filters = {
  audience: "all",
  saveFilter: "all",
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

const AUDIENCE_LABELS: Record<string, string> = {
  US_MD_DO: "US MD/DO student",
  INTERNATIONAL_STUDENT: "International med student",
  IMG_GRADUATE: "IMG graduate",
  CARIBBEAN_STUDENT: "Caribbean-school student",
};

const RESTRICTION_LABELS: Record<string, string> = {
  VSLO_REQUIRED: "VSLO required",
  IMG_EXCLUDED: "IMG excluded",
};

function audienceLabel(a: string) {
  return AUDIENCE_LABELS[a] ?? a.replace(/_/g, " ");
}

function restrictionLabel(t: string) {
  return RESTRICTION_LABELS[t] ?? t.replace(/_/g, " ");
}

// ── Export ────────────────────────────────────────────────────────────────────

// Allowed export fields — no NPI, CCN, CMS, NPPES, AAMC, NRMP, ACGME, or scoring internals
const EXPORT_FIELDS = [
  "listing_id",
  "institution_name",
  "specialty",
  "opportunity_type",
  "display_bucket",
  "eligible_audiences",
  "excluded_audiences",
  "unknown_audiences",
  "restriction_tags",
  "official_source_url",
  "application_url",
  "last_reviewed_at",
] as const;

type ExportRecord = {
  listing_id: string;
  institution_name: string;
  specialty: string;
  opportunity_type: string;
  display_bucket: string;
  eligible_audiences: string[];
  excluded_audiences: string[];
  unknown_audiences: string[];
  restriction_tags: string[];
  official_source_url: string;
  application_url: string;
  last_reviewed_at: string;
};

function buildExportPayload(cards: UsceCard[]): ExportRecord[] {
  return cards.map((c) => ({
    listing_id: c.listing_id,
    institution_name: c.institution_name,
    specialty: c.specialty,
    opportunity_type: c.opportunity_type,
    display_bucket: c.display_bucket,
    eligible_audiences: c.eligible_audiences,
    excluded_audiences: c.excluded_audiences,
    unknown_audiences: c.unknown_audiences,
    restriction_tags: c.restriction_tags,
    official_source_url: c.official_source_url,
    application_url: c.application_url,
    last_reviewed_at: c.last_reviewed_at,
  }));
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function downloadSavedJson(cards: UsceCard[]) {
  const data = {
    exported_at: new Date().toISOString(),
    source: "usce-maine-pilot",
    cards: buildExportPayload(cards),
  };
  triggerDownload(
    new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }),
    "usce-saved-listings.json"
  );
}

function downloadSavedCsv(cards: UsceCard[]) {
  const payload = buildExportPayload(cards);
  const headers = [...EXPORT_FIELDS].join(",");
  const rows = payload.map((r) =>
    EXPORT_FIELDS.map((f) => {
      const val = r[f] as string | string[];
      const str = Array.isArray(val) ? val.join(";") : String(val ?? "");
      return `"${str.replace(/"/g, '""')}"`;
    }).join(",")
  );
  triggerDownload(
    new Blob([[headers, ...rows].join("\n")], { type: "text/csv" }),
    "usce-saved-listings.csv"
  );
}

// ── useSavedListings ──────────────────────────────────────────────────────────

const LS_KEY = "usce-saved-listings";

function useSavedListings() {
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) setSavedIds(new Set(JSON.parse(raw) as string[]));
    } catch {}
  }, []);

  const toggle = useCallback((id: string) => {
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      try {
        localStorage.setItem(LS_KEY, JSON.stringify([...next]));
      } catch {}
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setSavedIds(new Set());
    try {
      localStorage.removeItem(LS_KEY);
    } catch {}
  }, []);

  return { savedIds, toggle, clear };
}

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
          "Other",
        ].map((label) => (
          <label
            key={label}
            className="flex items-center gap-2 text-slate-500 dark:text-slate-400 cursor-not-allowed"
          >
            <input type="radio" name="issue-type" disabled className="opacity-40" />
            {label}
          </label>
        ))}
      </div>
      <p className="text-slate-400 dark:text-slate-500 italic">
        Pilot placeholder — no submission is sent yet. Verify directly at the official program
        source link.
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

// ── CompareTable ──────────────────────────────────────────────────────────────

function CompareTable({ cards }: { cards: UsceCard[] }) {
  const [openReportId, setOpenReportId] = useState<string | null>(null);

  const rows: { label: string; render: (c: UsceCard) => React.ReactNode }[] = [
    {
      label: "Institution",
      render: (c) => (
        <span className="text-xs text-slate-700 dark:text-slate-300 leading-snug">
          {c.institution_name}
        </span>
      ),
    },
    {
      label: "Specialty",
      render: (c) => <span className="text-xs">{specialtyLabel(c.specialty)}</span>,
    },
    {
      label: "Type",
      render: (c) => <span className="text-xs">{c.opportunity_type}</span>,
    },
    {
      label: "Open to",
      render: (c) =>
        c.eligible_audiences.length > 0 ? (
          <div className="flex flex-col gap-0.5">
            {c.eligible_audiences.map((a) => (
              <span key={a} className="text-xs text-emerald-700 dark:text-emerald-400">
                {audienceLabel(a)}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-xs text-slate-400">—</span>
        ),
    },
    {
      label: "Excluded",
      render: (c) =>
        c.excluded_audiences.length > 0 ? (
          <div className="flex flex-col gap-0.5">
            {c.excluded_audiences.map((a) => (
              <span key={a} className="text-xs text-red-600 dark:text-red-400">
                {audienceLabel(a)}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-xs text-slate-400">—</span>
        ),
    },
    {
      label: "Not stated",
      render: (c) =>
        c.unknown_audiences.length > 0 ? (
          <div className="flex flex-col gap-0.5">
            {c.unknown_audiences.map((a) => (
              <span key={a} className="text-xs text-amber-700 dark:text-amber-400">
                {audienceLabel(a)}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-xs text-slate-400">—</span>
        ),
    },
    {
      label: "Restrictions",
      render: (c) =>
        c.restriction_tags.length > 0 ? (
          <div className="flex flex-col gap-0.5">
            {c.restriction_tags.map((t) => (
              <span key={t} className="text-xs text-amber-700 dark:text-amber-400">
                {restrictionLabel(t)}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-xs text-slate-400">—</span>
        ),
    },
    {
      label: "Apply",
      render: (c) =>
        c.application_url ? (
          <a
            href={c.application_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 underline"
          >
            Apply <ExternalLink className="h-3 w-3" />
          </a>
        ) : (
          <span className="text-xs text-slate-400">Via program page</span>
        ),
    },
    {
      label: "Source",
      render: (c) => (
        <a
          href={c.official_source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 underline"
        >
          View <ExternalLink className="h-3 w-3" />
        </a>
      ),
    },
    {
      label: "Last reviewed",
      render: (c) => (
        <span className="text-xs text-slate-500 dark:text-slate-400">{c.last_reviewed_at}</span>
      ),
    },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr>
            <th className="pr-5 pb-3 text-xs font-medium text-slate-400 dark:text-slate-500 w-28 align-bottom" />
            {cards.map((c) => (
              <th
                key={c.listing_id}
                className="pr-5 pb-3 text-xs font-semibold text-slate-700 dark:text-slate-200 align-bottom min-w-[160px]"
              >
                <div className="leading-snug">
                  <span className="block">{c.institution_name.split(" / ")[0]}</span>
                  <span className="block font-normal text-slate-400 dark:text-slate-500">
                    {c.institution_name.split(" / ").slice(1).join(" / ")}
                  </span>
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(({ label, render }) => (
            <tr key={label} className="border-t border-slate-100 dark:border-slate-800">
              <td className="py-2.5 pr-5 text-xs font-medium text-slate-400 dark:text-slate-500 align-top whitespace-nowrap">
                {label}
              </td>
              {cards.map((c) => (
                <td key={c.listing_id} className="py-2.5 pr-5 align-top">
                  {render(c)}
                </td>
              ))}
            </tr>
          ))}

          {/* Report issue row */}
          <tr className="border-t border-slate-100 dark:border-slate-800">
            <td className="py-2.5 pr-5 text-xs font-medium text-slate-400 dark:text-slate-500 align-top whitespace-nowrap">
              Report
            </td>
            {cards.map((c) => (
              <td key={c.listing_id} className="py-2.5 pr-5 align-top">
                {openReportId === c.listing_id ? (
                  <ReportIssuePlaceholder onClose={() => setOpenReportId(null)} />
                ) : (
                  <button
                    onClick={() => setOpenReportId(c.listing_id)}
                    className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  >
                    <Flag className="h-3 w-3" />
                    Report issue
                  </button>
                )}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

// ── ComparePanel ──────────────────────────────────────────────────────────────

function ComparePanel({
  cards,
  onClose,
  onClear,
}: {
  cards: UsceCard[];
  onClose: () => void;
  onClear: () => void;
}) {
  const displayCards = cards.slice(0, 4);
  const hasMore = cards.length > 4;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-label="Compare saved programs"
    >
      {/* Backdrop */}
      <div className="flex-1 bg-black/40" onClick={onClose} />

      {/* Sheet */}
      <div className="bg-white dark:bg-slate-900 rounded-t-2xl shadow-2xl border-t border-slate-200 dark:border-slate-700 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              Comparing {displayCards.length} program{displayCards.length !== 1 ? "s" : ""}
            </h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              {hasMore
                ? `Showing first 4 of ${cards.length} saved. Remove some to compare others.`
                : "Compare shows up to 4 saved listings at a time."}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onClear}
              className="text-xs text-slate-400 underline hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              Clear all saved
            </button>
            <button
              onClick={onClose}
              aria-label="Close compare panel"
              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Pilot disclaimer */}
        <div className="px-5 py-2.5 bg-amber-50 dark:bg-amber-950/30 border-b border-amber-100 dark:border-amber-900/40 shrink-0">
          <p className="text-xs text-amber-700 dark:text-amber-400">
            Source-reviewed pilot cohort — not a complete national database. Eligibility derived from
            official program pages at time of source review and may not reflect unpublished changes.
          </p>
        </div>

        {/* Content */}
        <div className="overflow-auto flex-1 px-5 py-4">
          {displayCards.length < 2 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-8">
              Save at least 2 programs to use compare.
            </p>
          ) : (
            <CompareTable cards={displayCards} />
          )}
        </div>
      </div>
    </div>
  );
}

// ── Card ──────────────────────────────────────────────────────────────────────

function ClerkshipCard({
  card,
  isSaved,
  onToggleSave,
}: {
  card: UsceCard;
  isSaved: boolean;
  onToggleSave: () => void;
}) {
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
        <div className="flex items-center gap-1.5 shrink-0">
          {isImgRelevant ? (
            <Badge variant="success" className="whitespace-nowrap">Intl. eligible</Badge>
          ) : (
            <Badge variant="warning" className="whitespace-nowrap">US MD/DO only</Badge>
          )}
          <button
            onClick={onToggleSave}
            aria-label={isSaved ? "Remove from saved" : "Save this program"}
            className={`rounded p-1 transition-colors ${
              isSaved
                ? "text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                : "text-slate-300 dark:text-slate-600 hover:text-slate-500 dark:hover:text-slate-400"
            }`}
          >
            {isSaved ? (
              <BookmarkCheck className="h-4 w-4" />
            ) : (
              <Bookmark className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Audience breakdown */}
      <div className="flex flex-col gap-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 px-3 py-2.5">
        <AudienceRow label="US MD/DO student" status={card.audience_detail.us_md_do} />
        <AudienceRow label="International med student" status={card.audience_detail.international_student} />
        <AudienceRow label="IMG graduate" status={card.audience_detail.img_graduate} />
        <AudienceRow label="Caribbean-school student" status={card.audience_detail.caribbean_student} />
      </div>

      {/* Fit warnings */}
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
  savedIds: Set<string>;
  onToggleSave: (id: string) => void;
}

function InstitutionGroup({ name, city, cards, note, savedIds, onToggleSave }: InstitutionGroupProps) {
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
          <ClerkshipCard
            key={card.listing_id}
            card={card}
            isSaved={savedIds.has(card.listing_id)}
            onToggleSave={() => onToggleSave(card.listing_id)}
          />
        ))}
      </div>
    </section>
  );
}

// ── Filter bar ────────────────────────────────────────────────────────────────

function FilterBar({
  filters,
  onChange,
  savedCount,
  onOpenCompare,
  onClearSaved,
  onExportJson,
  onExportCsv,
}: {
  filters: Filters;
  onChange: (f: Filters) => void;
  savedCount: number;
  onOpenCompare: () => void;
  onClearSaved: () => void;
  onExportJson: () => void;
  onExportCsv: () => void;
}) {
  const set = (patch: Partial<Filters>) => onChange({ ...filters, ...patch });

  const audienceTabs: { key: AudienceFilter; label: string; count: number }[] = [
    { key: "all", label: "All programs", count: USCE_MAINE_CARDS.length },
    { key: "img_relevant", label: "International-eligible", count: IMG_RELEVANT_COUNT },
    { key: "us_only", label: "US MD/DO only", count: US_ONLY_COUNT },
  ];

  const saveFilterTabs: { key: SaveFilter; label: string; count: number }[] = [
    { key: "all", label: "All", count: USCE_MAINE_CARDS.length },
    { key: "saved_only", label: "Saved only", count: savedCount },
    { key: "unsaved_only", label: "Unsaved only", count: USCE_MAINE_CARDS.length - savedCount },
  ];

  const hasSecondaryFilter =
    filters.specialty !== "all" ||
    filters.type !== "all" ||
    filters.vsloOnly ||
    filters.unknownOnly ||
    filters.saveFilter !== "all";

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

        {/* Clear all secondary filters */}
        {hasSecondaryFilter && (
          <button
            onClick={() =>
              set({ specialty: "all", type: "all", vsloOnly: false, unknownOnly: false, saveFilter: "all" })
            }
            className="text-xs text-slate-400 underline hover:text-slate-600 dark:hover:text-slate-300"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Saved shortlist — only when something is saved */}
      {savedCount > 0 && (
        <>
          {/* Save state filter tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {saveFilterTabs.map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => set({ saveFilter: key })}
                className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
                  filters.saveFilter === key
                    ? "bg-blue-600 dark:bg-blue-500 text-white"
                    : "border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                {label}
                <span className="ml-1.5 opacity-70">{count}</span>
              </button>
            ))}
          </div>

          {/* Saved actions */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
              {savedCount} saved
            </span>

            {savedCount >= 2 && (
              <button
                onClick={onOpenCompare}
                className="rounded-lg border border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 text-xs font-medium text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
              >
                Compare {Math.min(savedCount, 4)} →
              </button>
            )}

            <button
              onClick={onExportJson}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-600 px-2.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <Download className="h-3 w-3" />
              JSON
            </button>

            <button
              onClick={onExportCsv}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-600 px-2.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <Download className="h-3 w-3" />
              CSV
            </button>

            <button
              onClick={onClearSaved}
              className="text-xs text-slate-400 underline hover:text-slate-600 dark:hover:text-slate-300"
            >
              Clear saved
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export function ClerkshipListings() {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [compareOpen, setCompareOpen] = useState(false);
  const { savedIds, toggle, clear } = useSavedListings();

  const savedCards = USCE_MAINE_CARDS.filter((c) => savedIds.has(c.listing_id));

  const handleClearSaved = useCallback(() => {
    clear();
    setCompareOpen(false);
    setFilters((prev) => ({ ...prev, saveFilter: "all" }));
  }, [clear]);

  const handleExportJson = useCallback(() => {
    downloadSavedJson(savedCards);
  }, [savedCards]);

  const handleExportCsv = useCallback(() => {
    downloadSavedCsv(savedCards);
  }, [savedCards]);

  const filtered = USCE_MAINE_CARDS.filter((c) => {
    if (filters.audience === "img_relevant" && c.display_bucket !== "READY_PUBLIC_IMG_RELEVANT")
      return false;
    if (filters.audience === "us_only" && c.display_bucket !== "READY_PUBLIC_US_STUDENT_ONLY")
      return false;
    if (filters.saveFilter === "saved_only" && !savedIds.has(c.listing_id)) return false;
    if (filters.saveFilter === "unsaved_only" && savedIds.has(c.listing_id)) return false;
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
      <FilterBar
        filters={filters}
        onChange={setFilters}
        savedCount={savedIds.size}
        onOpenCompare={() => setCompareOpen(true)}
        onClearSaved={handleClearSaved}
        onExportJson={handleExportJson}
        onExportCsv={handleExportCsv}
      />

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
            savedIds={savedIds}
            onToggleSave={toggle}
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
            savedIds={savedIds}
            onToggleSave={toggle}
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

      {/* Compare panel */}
      {compareOpen && (
        <ComparePanel
          cards={savedCards}
          onClose={() => setCompareOpen(false)}
          onClear={handleClearSaved}
        />
      )}
    </div>
  );
}
