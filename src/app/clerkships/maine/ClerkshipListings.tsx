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
  Inbox,
  Trash2,
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
type PageContext = "CARD" | "COMPARE" | "SAVED_VIEW";

type IssueType =
  | "WRONG_ELIGIBILITY"
  | "BROKEN_LINK"
  | "NO_LONGER_AVAILABLE"
  | "FEE_OR_DEADLINE_WRONG"
  | "APPLICATION_LINK_WRONG"
  | "INSTITUTION_CORRECTION"
  | "DUPLICATE_LISTING"
  | "OTHER";

const ISSUE_TYPE_LABELS: Record<IssueType, string> = {
  WRONG_ELIGIBILITY: "Wrong eligibility",
  BROKEN_LINK: "Broken or changed link",
  NO_LONGER_AVAILABLE: "Program no longer available",
  FEE_OR_DEADLINE_WRONG: "Fee or deadline incorrect",
  APPLICATION_LINK_WRONG: "Application link wrong",
  INSTITUTION_CORRECTION: "Institution name correction",
  DUPLICATE_LISTING: "Duplicate listing",
  OTHER: "Other",
};

const ISSUE_TYPES = Object.keys(ISSUE_TYPE_LABELS) as IssueType[];

interface LocalReport {
  report_id: string;
  listing_id: string;
  institution_name: string;
  specialty: string;
  opportunity_type: string;
  issue_type: IssueType;
  issue_detail: string;
  user_email_optional: string;
  source_url_seen: string;
  official_source_url: string;
  application_url: string;
  created_at: string;
  status: "LOCAL_DRAFT";
  page_context: PageContext;
}

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

// ── Saved-listing export ──────────────────────────────────────────────────────

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

// ── Report export ─────────────────────────────────────────────────────────────

const REPORT_EXPORT_FIELDS = [
  "report_id",
  "listing_id",
  "institution_name",
  "specialty",
  "opportunity_type",
  "issue_type",
  "issue_detail",
  "user_email_optional",
  "official_source_url",
  "application_url",
  "created_at",
  "page_context",
] as const;

type ReportExportRecord = Pick<LocalReport, typeof REPORT_EXPORT_FIELDS[number]>;

function buildReportExportPayload(reports: LocalReport[]): ReportExportRecord[] {
  return reports.map((r) => ({
    report_id: r.report_id,
    listing_id: r.listing_id,
    institution_name: r.institution_name,
    specialty: r.specialty,
    opportunity_type: r.opportunity_type,
    issue_type: r.issue_type,
    issue_detail: r.issue_detail,
    user_email_optional: r.user_email_optional,
    official_source_url: r.official_source_url,
    application_url: r.application_url,
    created_at: r.created_at,
    page_context: r.page_context,
  }));
}

function downloadReportsJson(reports: LocalReport[]) {
  const data = {
    exported_at: new Date().toISOString(),
    source: "uscehub-local-issue-reports-v1",
    reports: buildReportExportPayload(reports),
  };
  triggerDownload(
    new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }),
    "uscehub-issue-reports.json"
  );
}

function downloadReportsCsv(reports: LocalReport[]) {
  const payload = buildReportExportPayload(reports);
  const headers = [...REPORT_EXPORT_FIELDS].join(",");
  const rows = payload.map((r) =>
    REPORT_EXPORT_FIELDS.map((f) => {
      const val = r[f] as string;
      return `"${String(val ?? "").replace(/"/g, '""')}"`;
    }).join(",")
  );
  triggerDownload(
    new Blob([[headers, ...rows].join("\n")], { type: "text/csv" }),
    "uscehub-issue-reports.csv"
  );
}

// ── useSavedListings ──────────────────────────────────────────────────────────

const LS_KEY = "usce-saved-listings";

const VALID_LISTING_IDS = new Set(USCE_MAINE_CARDS.map((c) => c.listing_id));

function useSavedListings() {
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        // Dedup and strip IDs that no longer correspond to public cards
        const valid = Array.isArray(parsed)
          ? [...new Set((parsed as unknown[]).filter((id): id is string =>
              typeof id === "string" && VALID_LISTING_IDS.has(id)
            ))]
          : [];
        setSavedIds(new Set(valid));
        // Rewrite if we filtered anything out
        if (valid.length !== (parsed as unknown[]).length) {
          try { localStorage.setItem(LS_KEY, JSON.stringify(valid)); } catch {}
        }
      }
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

// ── useLocalReports ───────────────────────────────────────────────────────────

const LS_REPORTS_KEY = "uscehub_local_issue_reports_v1";

function generateReportId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function useLocalReports() {
  const [reports, setReports] = useState<LocalReport[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_REPORTS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        // Guard: must be an array of objects with at minimum report_id and listing_id
        if (Array.isArray(parsed)) {
          setReports(
            parsed.filter(
              (r): r is LocalReport =>
                typeof r === "object" &&
                r !== null &&
                typeof r.report_id === "string" &&
                typeof r.listing_id === "string"
            )
          );
        }
      }
    } catch {}
  }, []);

  const persist = useCallback((next: LocalReport[]) => {
    try {
      localStorage.setItem(LS_REPORTS_KEY, JSON.stringify(next));
    } catch {}
  }, []);

  const addReport = useCallback(
    (
      card: UsceCard,
      issueType: IssueType,
      issueDetail: string,
      userEmail: string,
      pageContext: PageContext
    ) => {
      const report: LocalReport = {
        report_id: generateReportId(),
        listing_id: card.listing_id,
        institution_name: card.institution_name,
        specialty: card.specialty,
        opportunity_type: card.opportunity_type,
        issue_type: issueType,
        issue_detail: issueDetail,
        user_email_optional: userEmail,
        source_url_seen: typeof window !== "undefined" ? window.location.href : "",
        official_source_url: card.official_source_url,
        application_url: card.application_url,
        created_at: new Date().toISOString(),
        status: "LOCAL_DRAFT",
        page_context: pageContext,
      };
      setReports((prev) => {
        const next = [...prev, report];
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const deleteReport = useCallback(
    (reportId: string) => {
      setReports((prev) => {
        const next = prev.filter((r) => r.report_id !== reportId);
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const clearAll = useCallback(() => {
    setReports([]);
    try {
      localStorage.removeItem(LS_REPORTS_KEY);
    } catch {}
  }, []);

  return { reports, addReport, deleteReport, clearAll };
}

// ── AudienceRow ───────────────────────────────────────────────────────────────

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

// ── ReportIssueModal ──────────────────────────────────────────────────────────

function ReportIssueModal({
  card,
  pageContext,
  onSave,
  onCancel,
}: {
  card: UsceCard;
  pageContext: PageContext;
  onSave: (issueType: IssueType, detail: string, email: string) => void;
  onCancel: () => void;
}) {
  const [issueType, setIssueType] = useState<IssueType>("WRONG_ELIGIBILITY");
  const [detail, setDetail] = useState("");
  const [email, setEmail] = useState("");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onSave(issueType, detail, email);
    setSaved(true);
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
      role="dialog"
      aria-modal="true"
      aria-label="Report an issue"
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md flex flex-col gap-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Report an issue</h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5 leading-snug">
              {card.institution_name.split(" / ")[0]} — {specialtyLabel(card.specialty)}
            </p>
          </div>
          <button
            onClick={onCancel}
            aria-label="Close report form"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {saved ? (
          /* Confirmation state */
          <div className="px-5 py-8 text-center flex flex-col items-center gap-3">
            <div className="rounded-full bg-emerald-100 dark:bg-emerald-900/30 p-3">
              <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-white">Report saved to this device</p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Saved locally as a pilot draft. No data was sent to any server. Export when ready for reviewer processing.
              </p>
            </div>
            <button
              onClick={onCancel}
              className="mt-1 rounded-lg bg-slate-900 dark:bg-slate-100 px-4 py-2 text-xs font-medium text-white dark:text-slate-900 hover:bg-slate-700 dark:hover:bg-white transition-colors"
            >
              Close
            </button>
          </div>
        ) : (
          <div className="px-5 py-5 flex flex-col gap-4 max-h-[70vh] overflow-y-auto">
            {/* Issue type */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Issue type
              </label>
              <select
                value={issueType}
                onChange={(e) => setIssueType(e.target.value as IssueType)}
                className="rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400"
              >
                {ISSUE_TYPES.map((t) => (
                  <option key={t} value={t}>{ISSUE_TYPE_LABELS[t]}</option>
                ))}
              </select>
            </div>

            {/* Details */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Details <span className="font-normal text-slate-400">(optional)</span>
              </label>
              <textarea
                value={detail}
                onChange={(e) => setDetail(e.target.value)}
                rows={3}
                placeholder="Describe what you saw and what appears to be incorrect."
                className="rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-700 dark:text-slate-300 resize-none focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-slate-700 dark:text-slate-300">
                Email <span className="font-normal text-slate-400">(optional — for follow-up only)</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>

            {/* Source info — read-only */}
            <div className="rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 px-3 py-2.5 flex flex-col gap-1.5">
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Official source</p>
              <a
                href={card.official_source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 underline break-all"
              >
                {card.official_source_url.replace(/^https?:\/\//, "").slice(0, 60)}
                {card.official_source_url.length > 70 ? "…" : ""}
                <ExternalLink className="h-3 w-3 shrink-0" />
              </a>
              {card.application_url && (
                <>
                  <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-1">Application link</p>
                  <a
                    href={card.application_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 underline break-all"
                  >
                    {card.application_url.replace(/^https?:\/\//, "").slice(0, 60)}
                    {card.application_url.length > 70 ? "…" : ""}
                    <ExternalLink className="h-3 w-3 shrink-0" />
                  </a>
                </>
              )}
            </div>

            {/* Privacy copy */}
            <div className="rounded-lg bg-slate-50 dark:bg-slate-800/60 px-3 py-2.5 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              <p className="font-medium text-slate-600 dark:text-slate-300 mb-1">Before submitting</p>
              <ul className="list-disc list-inside space-y-0.5">
                <li>Do not include patient information or private medical details.</li>
                <li>Verify eligibility directly on the official source before applying.</li>
              </ul>
              <p className="mt-1.5 italic">
                Pilot local intake — this report is saved on this device only until export is enabled for review. No data is sent to any server.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleSave}
                className="flex-1 rounded-lg bg-slate-900 dark:bg-slate-100 px-4 py-2 text-xs font-medium text-white dark:text-slate-900 hover:bg-slate-700 dark:hover:bg-white transition-colors"
              >
                Save report locally
              </button>
              <button
                onClick={onCancel}
                className="rounded-lg border border-slate-200 dark:border-slate-600 px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── LocalReportsPanel ─────────────────────────────────────────────────────────

function LocalReportsPanel({
  reports,
  onDelete,
  onClearAll,
  onClose,
}: {
  reports: LocalReport[];
  onDelete: (id: string) => void;
  onClearAll: () => void;
  onClose: () => void;
}) {
  const [filterType, setFilterType] = useState<IssueType | "all">("all");

  const visibleTypes = Array.from(new Set(reports.map((r) => r.issue_type)));
  const filtered = filterType === "all" ? reports : reports.filter((r) => r.issue_type === filterType);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-label="Local issue reports"
    >
      <div className="flex-1 bg-black/40" onClick={onClose} />

      <div className="bg-white dark:bg-slate-900 rounded-t-2xl shadow-2xl border-t border-slate-200 dark:border-slate-700 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
              Local reports
              <span className="ml-2 inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs font-medium text-slate-600 dark:text-slate-300">
                {reports.length}
              </span>
            </h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              Stored on this device only. Export to share with reviewers.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close reports panel"
            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {reports.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-5 py-12 gap-3 text-center">
            <Inbox className="h-8 w-8 text-slate-300 dark:text-slate-600" />
            <p className="text-sm text-slate-400 dark:text-slate-500">No reports yet.</p>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Use the &ldquo;Report issue&rdquo; button on any listing card.
            </p>
          </div>
        ) : (
          <>
            {/* Filter + actions bar */}
            <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 shrink-0 flex flex-wrap items-center gap-2">
              {/* Issue type filter */}
              {visibleTypes.length > 1 && (
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as IssueType | "all")}
                  className="rounded border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-2 py-1 text-xs text-slate-600 dark:text-slate-300 focus:outline-none"
                >
                  <option value="all">All types</option>
                  {visibleTypes.map((t) => (
                    <option key={t} value={t}>{ISSUE_TYPE_LABELS[t]}</option>
                  ))}
                </select>
              )}

              <div className="ml-auto flex items-center gap-2">
                <button
                  onClick={() => downloadReportsJson(reports)}
                  className="inline-flex items-center gap-1 rounded border border-slate-200 dark:border-slate-600 px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <Download className="h-3 w-3" />
                  JSON
                </button>
                <button
                  onClick={() => downloadReportsCsv(reports)}
                  className="inline-flex items-center gap-1 rounded border border-slate-200 dark:border-slate-600 px-2.5 py-1 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <Download className="h-3 w-3" />
                  CSV
                </button>
                <button
                  onClick={onClearAll}
                  className="text-xs text-red-400 underline hover:text-red-600 transition-colors"
                >
                  Clear all
                </button>
              </div>
            </div>

            {/* Reports list */}
            <div className="overflow-auto flex-1 divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((r) => (
                <div key={r.report_id} className="px-5 py-3.5 flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">
                        {r.institution_name.split(" / ").slice(0, 2).join(" / ")}
                      </span>
                      <span className="shrink-0 rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs text-slate-500 dark:text-slate-400">
                        {ISSUE_TYPE_LABELS[r.issue_type]}
                      </span>
                      <span className="shrink-0 text-xs text-slate-400 dark:text-slate-500">
                        {r.page_context}
                      </span>
                    </div>
                    {r.issue_detail && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug mt-0.5 line-clamp-2">
                        {r.issue_detail}
                      </p>
                    )}
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                      {new Date(r.created_at).toLocaleDateString()} · {r.listing_id}
                    </p>
                  </div>
                  <button
                    onClick={() => onDelete(r.report_id)}
                    aria-label="Delete report"
                    className="shrink-0 rounded p-1 text-slate-300 hover:text-red-500 dark:text-slate-600 dark:hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── CompareTable ──────────────────────────────────────────────────────────────

function CompareTable({
  cards,
  onReportIssue,
}: {
  cards: UsceCard[];
  onReportIssue: (card: UsceCard) => void;
}) {
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
    <div className="overflow-x-auto -mx-1 px-1">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr>
            <th className="pr-5 pb-3 text-xs font-medium text-slate-400 dark:text-slate-500 w-24 sm:w-28 align-bottom" />
            {cards.map((c) => (
              <th
                key={c.listing_id}
                className="pr-5 pb-3 text-xs font-semibold text-slate-700 dark:text-slate-200 align-bottom min-w-[140px] max-w-[220px]"
              >
                <div className="leading-snug break-words">
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
                <button
                  onClick={() => onReportIssue(c)}
                  className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  <Flag className="h-3 w-3" />
                  Report issue
                </button>
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
  onReportIssue,
}: {
  cards: UsceCard[];
  onClose: () => void;
  onClear: () => void;
  onReportIssue: (card: UsceCard) => void;
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
      <div className="flex-1 bg-black/40" onClick={onClose} />

      <div className="bg-white dark:bg-slate-900 rounded-t-2xl shadow-2xl border-t border-slate-200 dark:border-slate-700 max-h-[80vh] flex flex-col">
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

        <div className="px-5 py-2.5 bg-amber-50 dark:bg-amber-950/30 border-b border-amber-100 dark:border-amber-900/40 shrink-0">
          <p className="text-xs text-amber-700 dark:text-amber-400">
            Source-reviewed pilot cohort — not a complete national database. Eligibility derived from
            official program pages at time of source review and may not reflect unpublished changes.
          </p>
        </div>

        <div className="overflow-auto flex-1 px-5 py-4">
          {displayCards.length < 2 ? (
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-8">
              Save at least 2 programs to use compare.
            </p>
          ) : (
            <CompareTable cards={displayCards} onReportIssue={onReportIssue} />
          )}
        </div>
      </div>
    </div>
  );
}

// ── ClerkshipCard ─────────────────────────────────────────────────────────────

function ClerkshipCard({
  card,
  isSaved,
  onToggleSave,
  onReportIssue,
}: {
  card: UsceCard;
  isSaved: boolean;
  onToggleSave: () => void;
  onReportIssue: () => void;
}) {
  const [showDetails, setShowDetails] = useState(false);

  const isImgRelevant = card.display_bucket === "READY_PUBLIC_IMG_RELEVANT";
  const hasVslo = card.restriction_tags.includes("VSLO_REQUIRED");
  const hasImgExcluded = card.restriction_tags.includes("IMG_EXCLUDED");
  const hasUnknown = card.unknown_audiences.length > 0;

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 flex flex-col gap-3">
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
            {isSaved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 px-3 py-2.5">
        <AudienceRow label="US MD/DO student" status={card.audience_detail.us_md_do} />
        <AudienceRow label="International med student" status={card.audience_detail.international_student} />
        <AudienceRow label="IMG graduate" status={card.audience_detail.img_graduate} />
        <AudienceRow label="Caribbean-school student" status={card.audience_detail.caribbean_student} />
      </div>

      {hasUnknown && (
        <p className="text-xs text-amber-600 dark:text-amber-400 flex items-start gap-1.5">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          IMG graduate and Caribbean-school eligibility not stated. Contact program to confirm.
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {card.application_url && (
          <a
            href={card.application_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 dark:bg-slate-100 px-3 py-1.5 text-xs font-medium text-white dark:text-slate-900 hover:bg-slate-700 dark:hover:bg-slate-200 transition-colors"
          >
            Apply <ExternalLink className="h-3 w-3" />
          </a>
        )}
        <a
          href={card.official_source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-600 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          Program page <ExternalLink className="h-3 w-3" />
        </a>
      </div>

      <div className="border-t border-slate-100 dark:border-slate-800 pt-2">
        <button
          onClick={() => setShowDetails((v) => !v)}
          aria-expanded={showDetails}
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

        <button
          onClick={onReportIssue}
          aria-label={`Report an issue with ${specialtyLabel(card.specialty)} at ${card.institution_name.split(" / ")[0]}`}
          className="mt-1.5 flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
        >
          <Flag className="h-3 w-3" />
          Report issue
        </button>
      </div>
    </div>
  );
}

// ── InstitutionGroup ──────────────────────────────────────────────────────────

interface InstitutionGroupProps {
  name: string;
  city: string;
  cards: UsceCard[];
  note: React.ReactNode;
  savedIds: Set<string>;
  onToggleSave: (id: string) => void;
  onReportIssue: (card: UsceCard) => void;
}

function InstitutionGroup({
  name,
  city,
  cards,
  note,
  savedIds,
  onToggleSave,
  onReportIssue,
}: InstitutionGroupProps) {
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
            onReportIssue={() => onReportIssue(card)}
          />
        ))}
      </div>
    </section>
  );
}

// ── FilterBar ─────────────────────────────────────────────────────────────────

function FilterBar({
  filters,
  onChange,
  savedCount,
  reportCount,
  onOpenCompare,
  onClearSaved,
  onExportJson,
  onExportCsv,
  onOpenReports,
}: {
  filters: Filters;
  onChange: (f: Filters) => void;
  savedCount: number;
  reportCount: number;
  onOpenCompare: () => void;
  onClearSaved: () => void;
  onExportJson: () => void;
  onExportCsv: () => void;
  onOpenReports: () => void;
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
    filters.audience !== "all" ||
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

        {/* Reports badge — shown when reports exist */}
        {reportCount > 0 && (
          <button
            onClick={onOpenReports}
            className="ml-auto flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-600 px-3 py-2 text-xs font-medium text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <Inbox className="h-3.5 w-3.5" />
            {reportCount} local report{reportCount !== 1 ? "s" : ""}
          </button>
        )}
      </div>

      {/* Secondary filters */}
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={filters.specialty}
          onChange={(e) => set({ specialty: e.target.value })}
          className="rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400"
        >
          <option value="all">All specialties</option>
          {ALL_SPECIALTIES.map((s) => (
            <option key={s} value={s}>{specialtyLabel(s)}</option>
          ))}
        </select>

        <select
          value={filters.type}
          onChange={(e) => set({ type: e.target.value })}
          className="rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400"
        >
          <option value="all">All types</option>
          {ALL_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        <button
          onClick={() => set({ vsloOnly: !filters.vsloOnly })}
          aria-pressed={filters.vsloOnly}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors border ${
            filters.vsloOnly
              ? "bg-amber-100 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300"
              : "border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
          }`}
        >
          VSLO required
        </button>

        <button
          onClick={() => set({ unknownOnly: !filters.unknownOnly })}
          aria-pressed={filters.unknownOnly}
          className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors border ${
            filters.unknownOnly
              ? "bg-amber-100 dark:bg-amber-900/30 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300"
              : "border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
          }`}
        >
          Unknown eligibility
        </button>

        {hasSecondaryFilter && (
          <button
            onClick={() =>
              set({ audience: "all", specialty: "all", type: "all", vsloOnly: false, unknownOnly: false, saveFilter: "all" })
            }
            className="text-xs text-slate-400 underline hover:text-slate-600 dark:hover:text-slate-300"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Saved shortlist */}
      {savedCount > 0 && (
        <>
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

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
              {savedCount} saved
            </span>

            {savedCount >= 2 ? (
              <button
                onClick={onOpenCompare}
                className="rounded-lg border border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 text-xs font-medium text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors"
              >
                Compare {Math.min(savedCount, 4)} →
              </button>
            ) : (
              <span className="text-xs text-slate-400 dark:text-slate-500">
                Save 1 more to compare
              </span>
            )}
            <span className="text-xs text-slate-400 dark:text-slate-500 ml-auto">
              Saved listings stay on this device
            </span>

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
  const [reportsOpen, setReportsOpen] = useState(false);
  const [reportModalTarget, setReportModalTarget] = useState<{
    card: UsceCard;
    pageContext: PageContext;
  } | null>(null);

  const { savedIds, toggle, clear } = useSavedListings();
  const { reports, addReport, deleteReport, clearAll: clearAllReports } = useLocalReports();

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

  const handleReportIssue = useCallback(
    (card: UsceCard, pageContext: PageContext) => {
      setCompareOpen(false);
      setReportsOpen(false);
      setReportModalTarget({ card, pageContext });
    },
    []
  );

  const handleSaveReport = useCallback(
    (issueType: IssueType, detail: string, email: string) => {
      if (!reportModalTarget) return;
      addReport(
        reportModalTarget.card,
        issueType,
        detail,
        email,
        reportModalTarget.pageContext
      );
    },
    [reportModalTarget, addReport]
  );

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
        reportCount={reports.length}
        onOpenCompare={() => setCompareOpen(true)}
        onClearSaved={handleClearSaved}
        onExportJson={handleExportJson}
        onExportCsv={handleExportCsv}
        onOpenReports={() => setReportsOpen(true)}
      />

      {isEmpty ? (
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-6 py-10 text-center text-sm text-slate-500 dark:text-slate-400">
          {filters.saveFilter === "saved_only" && savedIds.size === 0 ? (
            <>
              No saved programs yet.{" "}
              <span className="text-slate-400 dark:text-slate-500">
                Use the bookmark icon on any card to save a listing.
              </span>
            </>
          ) : (
            <>
              No programs match the selected filters.{" "}
              <button
                onClick={() => setFilters(DEFAULT_FILTERS)}
                className="underline hover:text-slate-700 dark:hover:text-slate-300"
              >
                Clear all filters
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-12">
          <InstitutionGroup
            name="Central Maine Medical Center (CMHC)"
            city="Lewiston, ME — Androscoggin County"
            cards={imgCards}
            savedIds={savedIds}
            onToggleSave={toggle}
            onReportIssue={(card) => handleReportIssue(card, "CARD")}
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
            onReportIssue={(card) => handleReportIssue(card, "CARD")}
            note={
              <div className="flex items-start gap-2 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-3 py-2 text-xs text-red-800 dark:text-red-300">
                <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>
                  LCME/AOA-accredited US schools only. Rotations route through the MMC VSLO hub.
                  International students, IMG graduates, and Caribbean-school students are excluded by
                  hub policy.
                </span>
              </div>
            }
          />
        </div>
      )}

      {/* NEEDS_REVIEW notice */}
      <p className="mt-10 text-xs text-slate-400 dark:text-slate-500 text-center">
        {NEEDS_REVIEW_COUNT} additional program{(NEEDS_REVIEW_COUNT as number) !== 1 ? "s" : ""} in Maine{" "}
        {(NEEDS_REVIEW_COUNT as number) !== 1 ? "are" : "is"} under eligibility review and will appear once
        confirmed.
      </p>

      {/* Compare panel */}
      {compareOpen && (
        <ComparePanel
          cards={savedCards}
          onClose={() => setCompareOpen(false)}
          onClear={() => { handleClearSaved(); setCompareOpen(false); }}
          onReportIssue={(card) => handleReportIssue(card, "COMPARE")}
        />
      )}

      {/* Local reports panel */}
      {reportsOpen && (
        <LocalReportsPanel
          reports={reports}
          onDelete={deleteReport}
          onClearAll={() => { clearAllReports(); }}
          onClose={() => setReportsOpen(false)}
        />
      )}

      {/* Report issue modal */}
      {reportModalTarget && (
        <ReportIssueModal
          card={reportModalTarget.card}
          pageContext={reportModalTarget.pageContext}
          onSave={handleSaveReport}
          onCancel={() => setReportModalTarget(null)}
        />
      )}
    </div>
  );
}
