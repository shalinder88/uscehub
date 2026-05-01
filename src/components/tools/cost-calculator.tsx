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

interface CostCalculatorProps {
  compact?: boolean;
}

const SERIF =
  "Charter, 'Iowan Old Style', 'New York', 'Source Serif Pro', ui-serif, Georgia, serif";

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
    <div
      className={
        compact
          ? ""
          : "rounded-xl border border-[#dfd5b8] bg-[#fcf9eb] p-6 shadow-plush dark:border-[#34373f] dark:bg-[#23262e]"
      }
    >
      {!compact && (
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-[#1a5454] dark:text-[#0fa595]" />
            <h3
              className="font-serif text-lg font-medium text-[#0d1418] dark:text-[#f7f5ec]"
              style={{ fontFamily: SERIF }}
            >
              Cost estimator
            </h3>
          </div>
          <p
            className="mt-1 text-sm italic text-[#4a5057] dark:text-[#bfc1c9]"
            style={{ fontFamily: SERIF }}
          >
            A rough estimate of all-in cost. Not financial advice.
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
          <label className="mb-1.5 block text-sm font-medium text-[#4a5057] dark:text-[#bfc1c9]">
            Program fee (optional)
          </label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7a7f88] dark:text-[#7e8089]" />
            <input
              type="number"
              placeholder="0"
              value={programFee}
              onChange={(e) => setProgramFee(e.target.value)}
              className="flex h-10 w-full rounded-lg border border-[#dfd5b8] bg-[#faf6e8] pl-9 pr-3 py-2 text-sm text-[#0d1418] placeholder:text-[#7a7f88] focus:border-[#a87b2e] focus:outline-none dark:border-[#34373f] dark:bg-[#1d1f26] dark:text-[#f7f5ec] dark:placeholder:text-[#7e8089] dark:focus:border-[#d8a978]"
            />
          </div>
        </div>
      </div>

      {showEstimate && (
        <div className="mt-6">
          <div className="rounded-lg border border-[#dfd5b8] bg-[#f0e9d3] p-5 shadow-plush dark:border-[#34373f] dark:bg-[#2a2d36]">
            <p className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[#1a5454] dark:text-[#0fa595]">
              — Breakdown —
            </p>
            <h4
              className="mb-4 font-serif text-base font-medium text-[#0d1418] dark:text-[#f7f5ec]"
              style={{ fontFamily: SERIF }}
            >
              Estimated cost ({durationData.label} in {city})
            </h4>

            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-[#4a5057] dark:text-[#bfc1c9]">
                  <DollarSign className="h-3.5 w-3.5 text-[#7a7f88] dark:text-[#7e8089]" />
                  Program fee
                </span>
                <span
                  className="text-[14px] text-[#0d1418] dark:text-[#f7f5ec]"
                  style={{ fontFamily: SERIF }}
                >
                  {fee > 0 ? formatUsd(fee) : "Varies"}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-[#4a5057] dark:text-[#bfc1c9]">
                  <Home className="h-3.5 w-3.5 text-[#7a7f88] dark:text-[#7e8089]" />
                  Housing
                </span>
                <span
                  className="text-[14px] text-[#0d1418] dark:text-[#f7f5ec]"
                  style={{ fontFamily: SERIF }}
                >
                  {formatUsd(housing)}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-[#4a5057] dark:text-[#bfc1c9]">
                  <Utensils className="h-3.5 w-3.5 text-[#7a7f88] dark:text-[#7e8089]" />
                  Food
                </span>
                <span
                  className="text-[14px] text-[#0d1418] dark:text-[#f7f5ec]"
                  style={{ fontFamily: SERIF }}
                >
                  {formatUsd(food)}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-[#4a5057] dark:text-[#bfc1c9]">
                  <Bus className="h-3.5 w-3.5 text-[#7a7f88] dark:text-[#7e8089]" />
                  Transportation
                </span>
                <span
                  className="text-[14px] text-[#0d1418] dark:text-[#f7f5ec]"
                  style={{ fontFamily: SERIF }}
                >
                  {formatUsd(transport)}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-[#4a5057] dark:text-[#bfc1c9]">
                  <Shield className="h-3.5 w-3.5 text-[#7a7f88] dark:text-[#7e8089]" />
                  Health insurance
                </span>
                <span
                  className="text-[14px] text-[#0d1418] dark:text-[#f7f5ec]"
                  style={{ fontFamily: SERIF }}
                >
                  {formatUsd(insuranceMin)} – {formatUsd(insuranceMax)}
                </span>
              </div>

              <div className="border-t border-[#dfd5b8] pt-2.5 dark:border-[#34373f]">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.16em] text-[#1a5454] dark:text-[#0fa595]">
                    Estimated total
                  </span>
                  <span
                    className="font-serif text-lg font-medium text-[#0d1418] dark:text-[#f7f5ec]"
                    style={{ fontFamily: SERIF }}
                  >
                    {formatUsd(totalMin)}
                    {totalMin !== totalMax && ` – ${formatUsd(totalMax)}`}
                  </span>
                </div>
              </div>
            </div>

            <p
              className="mt-3 text-xs italic text-[#7a7f88] dark:text-[#7e8089]"
              style={{ fontFamily: SERIF }}
            >
              Estimates based on average costs. Actual costs vary by neighborhood, lifestyle, and time of year.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
