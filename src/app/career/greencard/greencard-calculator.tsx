"use client";

import { useState, useMemo } from "react";
import { Clock, AlertTriangle, ExternalLink, CheckCircle2 } from "lucide-react";
import { CURRENT_BULLETIN } from "@/lib/visa-bulletin-data";

type Country = "India" | "China" | "All Other";
type Category = "EB-1" | "EB-2" | "EB-3";

const MONTHS = [
  "Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec",
];

const YEARS = Array.from({ length: 20 }, (_, i) => 2006 + i);

function parseDate(s: string): Date | null {
  if (s === "C" || s === "U") return null;
  return new Date(s);
}

function daysBetween(from: Date, to: Date): number {
  return Math.round((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
}

function formatDate(s: string): string {
  if (s === "C") return "Current";
  if (s === "U") return "Unavailable";
  const d = new Date(s);
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

export function GreencardCalculator() {
  const [country, setCountry] = useState<Country>("India");
  const [category, setCategory] = useState<Category>("EB-2");
  const [month, setMonth] = useState(0);
  const [year, setYear] = useState(2015);

  const entry = useMemo(
    () =>
      CURRENT_BULLETIN.entries.find(
        (e) => e.category === category && e.country === country
      ),
    [category, country]
  );

  const result = useMemo(() => {
    if (!entry) return null;
    const finalDate = parseDate(entry.finalActionDate);
    const filingDate = parseDate(entry.datesForFiling);
    const priorityDate = new Date(year, month, 1);

    if (entry.finalActionDate === "C") {
      return { status: "current" as const, finalDate: null, filingDate: null, priorityDate };
    }
    if (entry.finalActionDate === "U") {
      return { status: "unavailable" as const, finalDate: null, filingDate: null, priorityDate };
    }
    if (!finalDate) return null;

    const daysFromPriorityToCutoff = daysBetween(priorityDate, finalDate);
    const isCurrentForFiling = filingDate ? priorityDate <= filingDate : false;

    return {
      status: daysFromPriorityToCutoff >= 0 ? ("current" as const) : ("waiting" as const),
      daysAhead: daysFromPriorityToCutoff,
      yearsAhead: Math.abs(daysFromPriorityToCutoff) / 365,
      finalDate,
      filingDate,
      priorityDate,
      isCurrentForFiling,
    };
  }, [entry, month, year]);

  return (
    <div className="rounded-xl border border-border bg-surface p-6">
      <h2 className="text-lg font-bold text-foreground mb-1 flex items-center gap-2">
        <Clock className="h-5 w-5 text-accent" />
        Green Card Priority Date Checker
      </h2>
      <p className="text-xs text-muted mb-5">
        Based on{" "}
        <a
          href={CURRENT_BULLETIN.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent hover:underline inline-flex items-center gap-0.5"
        >
          {CURRENT_BULLETIN.month} Visa Bulletin
          <ExternalLink className="h-3 w-3" />
        </a>
        . Final action dates — the cutoff for adjustment of status.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-[10px] font-semibold text-muted uppercase tracking-wider mb-1.5">
            Country of Birth
          </label>
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value as Country)}
            className="w-full rounded-lg border border-border bg-surface-alt px-3 py-2 text-sm text-foreground focus:outline-none focus:border-accent"
          >
            <option value="India">India</option>
            <option value="China">China</option>
            <option value="All Other">All Other Countries</option>
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-muted uppercase tracking-wider mb-1.5">
            Visa Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
            className="w-full rounded-lg border border-border bg-surface-alt px-3 py-2 text-sm text-foreground focus:outline-none focus:border-accent"
          >
            <option value="EB-1">EB-1 (Priority Workers)</option>
            <option value="EB-2">EB-2 (Advanced Degree / NIW)</option>
            <option value="EB-3">EB-3 (Skilled Workers)</option>
          </select>
        </div>
        <div>
          <label className="block text-[10px] font-semibold text-muted uppercase tracking-wider mb-1.5">
            Your Priority Date
          </label>
          <div className="flex gap-2">
            <select
              value={month}
              onChange={(e) => setMonth(parseInt(e.target.value, 10))}
              className="flex-1 rounded-lg border border-border bg-surface-alt px-2 py-2 text-sm text-foreground focus:outline-none focus:border-accent"
            >
              {MONTHS.map((m, i) => (
                <option key={m} value={i}>{m}</option>
              ))}
            </select>
            <select
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value, 10))}
              className="flex-1 rounded-lg border border-border bg-surface-alt px-2 py-2 text-sm text-foreground focus:outline-none focus:border-accent"
            >
              {YEARS.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {entry && result && (
        <div className="space-y-3">
          {/* Current cutoff */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-surface-alt p-3">
              <div className="text-xs text-muted mb-0.5">Final Action Date (now)</div>
              <div className="font-bold text-foreground">
                {formatDate(entry.finalActionDate)}
              </div>
            </div>
            <div className="rounded-lg bg-surface-alt p-3">
              <div className="text-xs text-muted mb-0.5">Dates for Filing (now)</div>
              <div className="font-bold text-foreground">
                {formatDate(entry.datesForFiling)}
              </div>
            </div>
          </div>

          {/* Status */}
          {result.status === "current" && (
            <div className="rounded-xl border border-success/30 bg-success/5 p-4 flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
              <div>
                <div className="font-bold text-success">Priority date is current</div>
                <p className="text-xs text-muted mt-0.5">
                  Your priority date is already past the final action date. You may be
                  eligible to file I-485 (adjustment of status) now, subject to visa
                  number availability. Confirm with an immigration attorney.
                </p>
              </div>
            </div>
          )}

          {result.status === "unavailable" && (
            <div className="rounded-xl border border-danger/30 bg-danger/5 p-4 flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-danger shrink-0" />
              <div>
                <div className="font-bold text-danger">Category unavailable</div>
                <p className="text-xs text-muted mt-0.5">
                  This category is currently unavailable for new filings.
                </p>
              </div>
            </div>
          )}

          {result.status === "waiting" && result.daysAhead !== undefined && (
            <div className="rounded-xl border border-warning/30 bg-warning/5 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="font-bold text-foreground">
                  {Math.ceil(result.yearsAhead).toFixed(0)} year{result.yearsAhead > 1 ? "s" : ""}{" "}
                  {(result.yearsAhead % 1 * 12).toFixed(0)} months behind cutoff
                </div>
                {result.isCurrentForFiling && (
                  <span className="rounded-full bg-accent/10 text-accent px-2 py-0.5 text-[10px] font-medium">
                    Can file I-140 now
                  </span>
                )}
              </div>
              <p className="text-xs text-muted">
                Your priority date of{" "}
                <strong className="text-foreground">
                  {MONTHS[result.priorityDate.getMonth()]} {result.priorityDate.getFullYear()}
                </strong>{" "}
                is{" "}
                <strong className="text-foreground">
                  {Math.abs(result.daysAhead).toLocaleString()} days
                </strong>{" "}
                ({result.yearsAhead.toFixed(1)} years) before the current final action date of{" "}
                <strong className="text-foreground">
                  {formatDate(entry.finalActionDate)}
                </strong>.
                {result.isCurrentForFiling
                  ? " Your date is past the Dates for Filing cutoff — you can file I-485 concurrently if USCIS uses the Filing chart."
                  : " Your date has not yet reached the Dates for Filing cutoff."}
              </p>
            </div>
          )}

          <div className="rounded-lg bg-surface-alt border border-border p-3 text-[10px] text-muted">
            <AlertTriangle className="h-3 w-3 text-warning inline mr-1 mb-0.5" />
            <strong className="text-foreground">Important:</strong> Visa bulletin dates change monthly
            and can retrogress without warning. This tool uses the {CURRENT_BULLETIN.month} bulletin only.
            This is NOT legal advice — verify with an immigration attorney before filing.
          </div>
        </div>
      )}
    </div>
  );
}
