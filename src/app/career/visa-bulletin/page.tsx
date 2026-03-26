"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  CURRENT_BULLETIN,
  EB2_INDIA_HISTORY,
  WAIT_ESTIMATES,
  formatBulletinDate,
  calculateWaitYears,
} from "@/lib/visa-bulletin-data";
import {
  Calendar,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Globe,
  Info,
  ExternalLink,
  ArrowLeft,
} from "lucide-react";

type Category = "EB-1" | "EB-2" | "EB-3";
type Country = "India" | "China" | "All Other";

export default function VisaBulletinPage() {
  const [selectedCategory, setSelectedCategory] = useState<Category>("EB-2");
  const [selectedCountry, setSelectedCountry] = useState<Country>("India");
  const [filingDate, setFilingDate] = useState("");

  const currentEntry = useMemo(() => {
    return CURRENT_BULLETIN.entries.find(
      (e) => e.category === selectedCategory && e.country === selectedCountry
    );
  }, [selectedCategory, selectedCountry]);

  const waitEstimate = useMemo(() => {
    if (!filingDate || !currentEntry) return null;
    return calculateWaitYears(filingDate, currentEntry.finalActionDate);
  }, [filingDate, currentEntry]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link
        href="/career"
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-accent transition-colors mb-6"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Career Dashboard
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="rounded-lg bg-accent/10 p-2.5">
            <Calendar className="h-6 w-6 text-accent" />
          </div>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
              Visa Bulletin Tracker
            </h1>
            <p className="text-xs text-muted mt-1">
              {CURRENT_BULLETIN.month} · Updated monthly from{" "}
              <a
                href={CURRENT_BULLETIN.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                DOS Visa Bulletin
              </a>
            </p>
          </div>
        </div>
        <p className="text-muted max-w-2xl text-sm">
          Track employment-based green card priority date movement. Select your
          category and country of birth to see where you stand.
        </p>
      </div>

      {/* Category + Country Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <div>
          <label className="block text-xs font-semibold text-foreground mb-2">
            Category
          </label>
          <div className="flex gap-2">
            {(["EB-1", "EB-2", "EB-3"] as Category[]).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`flex-1 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                  selectedCategory === cat
                    ? "bg-accent text-white"
                    : "bg-surface border border-border text-muted hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-foreground mb-2">
            Country of Birth
          </label>
          <div className="flex gap-2">
            {(["India", "China", "All Other"] as Country[]).map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCountry(c)}
                className={`flex-1 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                  selectedCountry === c
                    ? "bg-accent text-white"
                    : "bg-surface border border-border text-muted hover:text-foreground"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Current Status Card */}
      {currentEntry && (
        <div className="rounded-xl border border-border bg-surface p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground">
              {selectedCategory} — {selectedCountry}
            </h2>
            <span className="text-xs text-muted">{CURRENT_BULLETIN.month}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="rounded-lg bg-surface-alt p-4 text-center">
              <div className="text-xs text-muted mb-1 uppercase tracking-wider">
                Final Action Date
              </div>
              <div
                className={`text-2xl font-bold ${
                  currentEntry.finalActionDate === "C"
                    ? "text-success"
                    : "text-warning"
                }`}
              >
                {formatBulletinDate(currentEntry.finalActionDate)}
              </div>
              <p className="text-[10px] text-muted mt-1">
                Your priority date must be before this to get your green card
              </p>
            </div>

            <div className="rounded-lg bg-surface-alt p-4 text-center">
              <div className="text-xs text-muted mb-1 uppercase tracking-wider">
                Dates for Filing
              </div>
              <div
                className={`text-2xl font-bold ${
                  currentEntry.datesForFiling === "C"
                    ? "text-success"
                    : "text-cyan"
                }`}
              >
                {formatBulletinDate(currentEntry.datesForFiling)}
              </div>
              <p className="text-[10px] text-muted mt-1">
                Your priority date must be before this to FILE I-485
              </p>
            </div>
          </div>

          {/* Wait estimate */}
          <div className="mt-4 rounded-lg bg-warning/5 border border-warning/20 p-3 text-center">
            <span className="text-xs text-muted">Estimated wait: </span>
            <span className="text-sm font-bold text-warning">
              {WAIT_ESTIMATES[selectedCategory]?.[selectedCountry] || "Unknown"}
            </span>
          </div>
        </div>
      )}

      {/* Personal Calculator */}
      <div className="rounded-xl border border-accent/30 bg-accent/5 p-6 mb-8">
        <h2 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
          <Clock className="h-5 w-5 text-accent" />
          Check Your Priority Date
        </h2>
        <p className="text-sm text-muted mb-4">
          Enter your I-140 filing date (or PERM priority date) to see where you
          stand relative to the current bulletin.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 items-start">
          <div className="flex-1">
            <label
              htmlFor="filing-date"
              className="block text-xs font-semibold text-foreground mb-1"
            >
              Your I-140 / PERM Priority Date
            </label>
            <input
              id="filing-date"
              type="date"
              value={filingDate}
              onChange={(e) => setFilingDate(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          {waitEstimate && (
            <div className="flex-1 rounded-lg bg-surface border border-border p-4">
              <div className="text-xs text-muted mb-1">
                For {selectedCategory} — {selectedCountry}
              </div>
              <div
                className={`text-lg font-bold ${
                  waitEstimate.includes("current")
                    ? "text-success"
                    : "text-warning"
                }`}
              >
                {waitEstimate}
              </div>
              <p className="text-[10px] text-muted mt-1">
                Based on current bulletin and historical movement rates.
                Actual wait may vary.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* EB-2 India Trend Chart (simple visual) */}
      {selectedCategory === "EB-2" && selectedCountry === "India" && (
        <div className="rounded-xl border border-border bg-surface p-6 mb-8">
          <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-accent" />
            EB-2 India — 12-Month Priority Date Movement
          </h2>
          <div className="overflow-x-auto">
            <div className="flex items-end gap-1 h-40 min-w-[600px]">
              {EB2_INDIA_HISTORY.map((entry, i) => {
                const date = new Date(entry.date + "T00:00:00");
                const baseDate = new Date("2013-01-01T00:00:00");
                const monthsFromBase =
                  (date.getFullYear() - baseDate.getFullYear()) * 12 +
                  (date.getMonth() - baseDate.getMonth());
                const heightPct = Math.min(
                  Math.max((monthsFromBase / 30) * 100, 10),
                  100
                );
                const isLatest = i === EB2_INDIA_HISTORY.length - 1;

                return (
                  <div
                    key={entry.month}
                    className="flex-1 flex flex-col items-center"
                  >
                    <div className="text-[8px] text-muted mb-1">
                      {formatBulletinDate(entry.date)}
                    </div>
                    <div
                      className={`w-full rounded-t transition-all ${
                        isLatest ? "bg-accent" : "bg-accent/30"
                      }`}
                      style={{ height: `${heightPct}%` }}
                    />
                    <div className="text-[8px] text-muted mt-1 rotate-[-45deg] origin-top-left whitespace-nowrap">
                      {entry.month.split(" ")[0]}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          <p className="text-[10px] text-muted mt-4">
            Bar height represents the Final Action Date — taller = more recent
            date = more progress. EB-2 India has moved approximately 7-8 months
            in the past year.
          </p>
        </div>
      )}

      {/* Full Bulletin Table */}
      <div className="rounded-xl border border-border bg-surface p-6 mb-8">
        <h2 className="text-lg font-bold text-foreground mb-4">
          Complete {CURRENT_BULLETIN.month} Employment-Based Bulletin
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-3 py-2 text-left font-semibold text-foreground">
                  Category
                </th>
                <th className="px-3 py-2 text-left font-semibold text-foreground">
                  Country
                </th>
                <th className="px-3 py-2 text-left font-semibold text-foreground">
                  Final Action
                </th>
                <th className="px-3 py-2 text-left font-semibold text-foreground">
                  Dates for Filing
                </th>
                <th className="px-3 py-2 text-left font-semibold text-foreground">
                  Est. Wait
                </th>
              </tr>
            </thead>
            <tbody>
              {CURRENT_BULLETIN.entries.map((entry, i) => (
                <tr
                  key={`${entry.category}-${entry.country}`}
                  className={`border-b border-border/50 ${
                    entry.category === selectedCategory &&
                    entry.country === selectedCountry
                      ? "bg-accent/5"
                      : "hover:bg-surface-alt/50"
                  }`}
                >
                  <td className="px-3 py-2 font-medium text-foreground">
                    {entry.category}
                  </td>
                  <td className="px-3 py-2 text-muted">{entry.country}</td>
                  <td className="px-3 py-2">
                    <span
                      className={`font-mono font-bold ${
                        entry.finalActionDate === "C"
                          ? "text-success"
                          : "text-warning"
                      }`}
                    >
                      {formatBulletinDate(entry.finalActionDate)}
                    </span>
                  </td>
                  <td className="px-3 py-2">
                    <span
                      className={`font-mono ${
                        entry.datesForFiling === "C"
                          ? "text-success"
                          : "text-cyan"
                      }`}
                    >
                      {formatBulletinDate(entry.datesForFiling)}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-xs text-muted">
                    {WAIT_ESTIMATES[entry.category]?.[entry.country] || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* What This Means Section */}
      <div className="rounded-xl border border-border bg-surface p-6 mb-8">
        <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
          <Info className="h-5 w-5 text-accent" />
          How to Read the Visa Bulletin
        </h2>
        <div className="space-y-4 text-sm text-muted">
          <div>
            <h3 className="font-semibold text-foreground mb-1">
              Final Action Date
            </h3>
            <p>
              This is the date that determines when USCIS can actually approve
              your green card (I-485). If your priority date is BEFORE this
              date, you&apos;re eligible for final approval. This is the date
              most people track.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-1">
              Dates for Filing
            </h3>
            <p>
              This is usually more advanced (a later date) than Final Action.
              If USCIS announces they&apos;re accepting filings based on this
              chart, you can FILE your I-485 even if the Final Action Date
              hasn&apos;t reached your priority date yet. Check USCIS.gov
              monthly to see which chart they&apos;re using.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-1">
              Priority Date
            </h3>
            <p>
              Your place in line. For most physicians, this is the date your
              I-140 petition was filed (for NIW) or the date your PERM labor
              certification was filed (for employer-sponsored). Earlier date =
              earlier in line.
            </p>
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-1">
              Why It Matters for Physicians
            </h3>
            <p>
              If you&apos;re born in India, your EB-2 wait is 10-15+ years.
              This is why filing your I-140 early (during your waiver service)
              is critical — it locks in your priority date. And it&apos;s why
              EB-1 (no backlog for any country) is worth pursuing if you have
              the academic credentials.
            </p>
          </div>
        </div>
      </div>

      {/* What to do based on category */}
      <div className="rounded-xl border border-border bg-surface-alt p-6 mb-8">
        <h2 className="text-lg font-bold text-foreground mb-4">
          What Should You Do?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-lg bg-surface border border-border p-4">
            <h3 className="text-sm font-bold text-foreground mb-2">
              If born in India
            </h3>
            <ul className="space-y-1.5 text-xs text-muted">
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="h-3 w-3 text-success mt-0.5 shrink-0" />
                File I-140 ASAP — every month of delay adds to your wait
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="h-3 w-3 text-success mt-0.5 shrink-0" />
                Seriously consider EB-1 — no backlog for any country
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="h-3 w-3 text-success mt-0.5 shrink-0" />
                File EB-2 NIW AND EB-1 simultaneously
              </li>
              <li className="flex items-start gap-1.5">
                <AlertTriangle className="h-3 w-3 text-warning mt-0.5 shrink-0" />
                Plan for 10+ year wait on EB-2 — make financial decisions accordingly
              </li>
            </ul>
          </div>
          <div className="rounded-lg bg-surface border border-border p-4">
            <h3 className="text-sm font-bold text-foreground mb-2">
              If born in China
            </h3>
            <ul className="space-y-1.5 text-xs text-muted">
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="h-3 w-3 text-success mt-0.5 shrink-0" />
                File I-140 during waiver service
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="h-3 w-3 text-success mt-0.5 shrink-0" />
                EB-1 is also current — worth pursuing
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="h-3 w-3 text-success mt-0.5 shrink-0" />
                EB-2 wait: 4-6 years — manageable but plan ahead
              </li>
            </ul>
          </div>
          <div className="rounded-lg bg-surface border border-border p-4">
            <h3 className="text-sm font-bold text-foreground mb-2">
              If born elsewhere
            </h3>
            <ul className="space-y-1.5 text-xs text-muted">
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="h-3 w-3 text-success mt-0.5 shrink-0" />
                EB-2 NIW is usually current or near-current
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="h-3 w-3 text-success mt-0.5 shrink-0" />
                File I-140 during waiver and you&apos;ll likely have your green
                card within 1-2 years
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="h-3 w-3 text-success mt-0.5 shrink-0" />
                Still file early — dates can retrogress unexpectedly
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Source */}
      <div className="flex items-center justify-between text-xs text-muted">
        <p>
          Data from the{" "}
          <a
            href={CURRENT_BULLETIN.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent hover:underline"
          >
            U.S. Department of State Visa Bulletin
          </a>
          . Updated monthly. Estimates are based on historical movement and may
          not reflect future changes.
        </p>
        <Link
          href="/career/greencard"
          className="inline-flex items-center gap-1 text-accent hover:underline shrink-0 ml-4"
        >
          Green Card Guide <ExternalLink className="h-3 w-3" />
        </Link>
      </div>
    </div>
  );
}
