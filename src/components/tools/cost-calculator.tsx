"use client";

import { useState } from "react";
import { DollarSign, Home, Utensils, Bus, Shield, Calculator } from "lucide-react";
import { Select } from "@/components/ui/select";

const CITY_COSTS: Record<
  string,
  { housing: number; food: number; transport: number }
> = {
  "New York, NY": { housing: 2000, food: 400, transport: 130 },
  "Los Angeles, CA": { housing: 1800, food: 350, transport: 100 },
  "Chicago, IL": { housing: 1200, food: 300, transport: 100 },
  "Houston, TX": { housing: 1000, food: 300, transport: 80 },
  "Philadelphia, PA": { housing: 1200, food: 300, transport: 100 },
  "Boston, MA": { housing: 1800, food: 350, transport: 90 },
  "Cleveland, OH": { housing: 800, food: 250, transport: 70 },
  "Pittsburgh, PA": { housing: 900, food: 250, transport: 70 },
  "Detroit, MI": { housing: 700, food: 250, transport: 80 },
  "Miami, FL": { housing: 1500, food: 350, transport: 90 },
  "Other city": { housing: 1000, food: 300, transport: 80 },
};

const DURATIONS = [
  { label: "2 weeks", weeks: 2 },
  { label: "4 weeks", weeks: 4 },
  { label: "8 weeks", weeks: 8 },
  { label: "12 weeks", weeks: 12 },
];

const INSURANCE_MIN = 50;
const INSURANCE_MAX = 200;

// PR 0g-fix (audit M1): visible "last reviewed" line so users (and admins)
// know the city/insurance assumptions are dated and may drift. Update this
// constant when the underlying figures are reviewed.
const LAST_REVIEWED = "April 2026";

// PR 0g-fix (audit H1 / M2): IMG-cycle fees that are NOT modelled by this
// calculator. Surfaced near the total so a user reading "$X,XXX Estimated
// Total" understands the trip estimate is partial. Update when the
// calculator scope expands.
const NOT_INCLUDED_FEES = [
  "USMLE Step 1 / Step 2 CK / Step 3 fees",
  "ECFMG application + Pathways assessment fees",
  "ERAS / NRMP application + match fees",
  "Visa application + SEVIS / consular fees",
  "Round-trip airfare from origin country",
  "Malpractice insurance (if not program-covered)",
  "Background check + drug screen + immunizations",
  "Document translation / notarization (non-English source schools)",
  "TOEFL / IELTS, NPI registration, contingency buffer",
];

interface CostCalculatorProps {
  compact?: boolean;
}

export function CostCalculator({ compact = false }: CostCalculatorProps) {
  const [city, setCity] = useState("");
  const [duration, setDuration] = useState("");
  const [programFee, setProgramFee] = useState("");

  const cityData = city ? CITY_COSTS[city] : null;
  const durationData = duration
    ? DURATIONS.find((d) => d.label === duration)
    : null;
  const months = durationData ? durationData.weeks / 4 : 0;

  const fee = programFee ? parseInt(programFee, 10) || 0 : 0;
  const housing = cityData ? Math.round(cityData.housing * months) : 0;
  const food = cityData ? Math.round(cityData.food * months) : 0;
  const transport = cityData ? Math.round(cityData.transport * months) : 0;
  const insuranceMin = Math.round(INSURANCE_MIN * months);
  const insuranceMax = Math.round(INSURANCE_MAX * months);
  const totalMin = fee + housing + food + transport + insuranceMin;
  const totalMax = fee + housing + food + transport + insuranceMax;

  const showEstimate = cityData && durationData;

  const formatUsd = (n: number) =>
    "$" + n.toLocaleString("en-US");

  return (
    <div className={compact ? "" : "rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm"}>
      {!compact && (
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-slate-700 dark:text-slate-300 dark:text-slate-300" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 dark:text-slate-100">
              Cost Calculator
            </h3>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 dark:text-slate-400">
            Estimate the total cost of your clinical experience in the US
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Select
          label="City"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        >
          <option value="">Select city</option>
          {Object.keys(CITY_COSTS).map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>

        <Select
          label="Duration"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
        >
          <option value="">Select duration</option>
          {DURATIONS.map((d) => (
            <option key={d.label} value={d.label}>
              {d.label}
            </option>
          ))}
        </Select>

        <div className="w-full">
          <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300 dark:text-slate-300">
            Program Fee (optional)
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="number"
              placeholder="0"
              value={programFee}
              onChange={(e) => setProgramFee(e.target.value)}
              className="flex h-10 w-full rounded-lg border border-slate-300 bg-white dark:bg-slate-900 pl-9 pr-3 py-2 text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
          </div>
        </div>
      </div>

      {showEstimate && (
        <div className="mt-6">
          <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-4">
            <h4 className="mb-3 text-sm font-semibold text-slate-900 dark:text-slate-100 dark:text-slate-100">
              Estimated Cost Breakdown ({durationData.label} in {city})
            </h4>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-slate-600 dark:text-slate-400 dark:text-slate-400">
                  <DollarSign className="h-3.5 w-3.5" />
                  Program Fee
                </span>
                <span className="font-medium text-slate-900 dark:text-slate-100 dark:text-slate-100">
                  {fee > 0 ? formatUsd(fee) : "Varies"}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-slate-600 dark:text-slate-400 dark:text-slate-400">
                  <Home className="h-3.5 w-3.5" />
                  Housing
                </span>
                <span className="font-medium text-slate-900 dark:text-slate-100 dark:text-slate-100">
                  {formatUsd(housing)}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-slate-600 dark:text-slate-400 dark:text-slate-400">
                  <Utensils className="h-3.5 w-3.5" />
                  Food
                </span>
                <span className="font-medium text-slate-900 dark:text-slate-100 dark:text-slate-100">
                  {formatUsd(food)}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-slate-600 dark:text-slate-400 dark:text-slate-400">
                  <Bus className="h-3.5 w-3.5" />
                  Transportation
                </span>
                <span className="font-medium text-slate-900 dark:text-slate-100 dark:text-slate-100">
                  {formatUsd(transport)}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-slate-600 dark:text-slate-400 dark:text-slate-400">
                  <Shield className="h-3.5 w-3.5" />
                  Health Insurance
                </span>
                <span className="font-medium text-slate-900 dark:text-slate-100 dark:text-slate-100">
                  {formatUsd(insuranceMin)} - {formatUsd(insuranceMax)}
                </span>
              </div>

              <div className="border-t border-slate-200 dark:border-slate-700 pt-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 dark:text-slate-100">
                    Estimated Trip Total
                  </span>
                  <span className="text-lg font-bold text-slate-900 dark:text-slate-100 dark:text-slate-100">
                    {formatUsd(totalMin)}
                    {totalMin !== totalMax && ` - ${formatUsd(totalMax)}`}
                  </span>
                </div>
              </div>
            </div>

            {/*
             * PR 0g-fix (audit H1): "Other city" silently defaults to a
             * US-median proxy (housing $1000 / food $300 / transport $80).
             * Surface that assumption rather than letting users from
             * SF/Seattle/DC under-estimate.
             */}
            {city === "Other city" && (
              <p className="mt-3 rounded-md border border-amber-200 bg-amber-50 dark:border-amber-900/40 dark:bg-amber-950/30 px-3 py-2 text-xs text-amber-800 dark:text-amber-200">
                <strong>Heads up:</strong> &ldquo;Other city&rdquo; uses
                US-median assumptions. Higher-cost cities (San Francisco,
                Seattle, DC, etc.) will be under-estimated; lower-cost cities
                may be over-estimated. Verify locally.
              </p>
            )}

            {/*
             * PR 0g-fix (audit H1 + M1): strengthened disclaimer, last-reviewed
             * date, and "What's NOT included" list. Closes credibility-by-
             * omission gap from the prior single-line disclaimer.
             */}
            <div className="mt-3 space-y-2 text-xs text-slate-500 dark:text-slate-400">
              <p>
                <strong className="text-slate-700 dark:text-slate-300">Estimator only.</strong>{" "}
                Not financial, insurance, immigration, or legal advice. Costs
                are planning ranges; actual costs vary by neighborhood,
                lifestyle, time of year, program, travel origin, visa type,
                and required documents. City and insurance assumptions are
                internal estimates &mdash; verify locally and with the program.
              </p>
              <p>
                <strong className="text-slate-700 dark:text-slate-300">Last reviewed:</strong>{" "}
                {LAST_REVIEWED}.
              </p>
              <details className="group">
                <summary className="cursor-pointer text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100">
                  <strong>Common costs not included</strong> (verify with
                  ECFMG / USMLE / ERAS / NRMP / consular and institutional
                  sources):
                </summary>
                <ul className="mt-2 space-y-1 pl-4">
                  {NOT_INCLUDED_FEES.map((fee) => (
                    <li key={fee} className="list-disc list-outside">
                      {fee}
                    </li>
                  ))}
                </ul>
              </details>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
