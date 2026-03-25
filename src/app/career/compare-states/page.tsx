"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  MapPin,
  ArrowRight,
  ChevronDown,
  DollarSign,
  Clock,
  Shield,
  Plane,
  Thermometer,
  Scale,
  Building2,
  Plus,
  X,
} from "lucide-react";
import { WAIVER_STATES } from "@/lib/waiver-data";
import {
  STATE_COMPARISON_DATA,
  type StateComparisonData,
} from "@/lib/state-comparison-data";

/* ─── Merged state data ─── */

interface MergedState {
  code: string;
  name: string;
  conradSlots: number;
  flexSlots: number;
  processingTime: string;
  taxRate: number;
  costOfLivingIndex: number;
  avgPhysicianSalary: number;
  malpracticeEnvironment: "favorable" | "moderate" | "challenging";
  majorAirports: string[];
  climate: string;
  effectiveSalary: number;
}

function buildMerged(code: string): MergedState | null {
  const waiver = WAIVER_STATES[code];
  const comp = STATE_COMPARISON_DATA[code];
  if (!waiver || !comp) return null;

  const afterTax = comp.avgPhysicianSalary * (1 - comp.taxRate / 100);
  const effective = Math.round(afterTax / (comp.costOfLivingIndex / 100));

  return {
    code: waiver.stateCode,
    name: waiver.stateName,
    conradSlots: waiver.conradSlots,
    flexSlots: waiver.flexSlots,
    processingTime: waiver.processingTime,
    taxRate: comp.taxRate,
    costOfLivingIndex: comp.costOfLivingIndex,
    avgPhysicianSalary: comp.avgPhysicianSalary,
    malpracticeEnvironment: comp.malpracticeEnvironment,
    majorAirports: comp.majorAirports,
    climate: comp.climate,
    effectiveSalary: effective,
  };
}

const ALL_STATES = Object.keys(STATE_COMPARISON_DATA).sort((a, b) =>
  STATE_COMPARISON_DATA[a].stateName.localeCompare(
    STATE_COMPARISON_DATA[b].stateName
  )
);

/* ─── Helper functions ─── */

function fmt(n: number): string {
  return "$" + (n / 1000).toFixed(0) + "K";
}

function malpColor(env: string): string {
  if (env === "favorable") return "text-success";
  if (env === "moderate") return "text-foreground";
  return "text-danger";
}

function malpBg(env: string): string {
  if (env === "favorable") return "bg-success/10";
  if (env === "moderate") return "bg-surface-alt";
  return "bg-danger/10";
}

type MetricKey =
  | "conradSlots"
  | "flexSlots"
  | "processingTime"
  | "taxRate"
  | "costOfLivingIndex"
  | "avgPhysicianSalary"
  | "effectiveSalary"
  | "malpracticeEnvironment"
  | "majorAirports"
  | "climate";

interface MetricDef {
  key: MetricKey;
  label: string;
  icon: React.ReactNode;
  format: (s: MergedState) => string;
  winner: (states: MergedState[]) => string | null; // code of winner
}

const METRICS: MetricDef[] = [
  {
    key: "conradSlots",
    label: "Conrad 30 Slots",
    icon: <Building2 className="h-4 w-4" />,
    format: (s) => String(s.conradSlots),
    winner: (states) => {
      const max = Math.max(...states.map((s) => s.conradSlots));
      const winners = states.filter((s) => s.conradSlots === max);
      return winners.length === states.length ? null : winners[0]?.code ?? null;
    },
  },
  {
    key: "flexSlots",
    label: "Flex Slots",
    icon: <Plus className="h-4 w-4" />,
    format: (s) => String(s.flexSlots),
    winner: (states) => {
      const max = Math.max(...states.map((s) => s.flexSlots));
      const winners = states.filter((s) => s.flexSlots === max);
      return winners.length === states.length ? null : winners[0]?.code ?? null;
    },
  },
  {
    key: "processingTime",
    label: "Processing Time",
    icon: <Clock className="h-4 w-4" />,
    format: (s) => s.processingTime,
    winner: () => null, // text field, no auto-winner
  },
  {
    key: "taxRate",
    label: "State Income Tax",
    icon: <DollarSign className="h-4 w-4" />,
    format: (s) => (s.taxRate === 0 ? "0% (no state tax)" : `${s.taxRate}%`),
    winner: (states) => {
      const min = Math.min(...states.map((s) => s.taxRate));
      const winners = states.filter((s) => s.taxRate === min);
      return winners.length === states.length ? null : winners[0]?.code ?? null;
    },
  },
  {
    key: "costOfLivingIndex",
    label: "Cost of Living Index",
    icon: <Scale className="h-4 w-4" />,
    format: (s) => `${s.costOfLivingIndex} (100 = avg)`,
    winner: (states) => {
      const min = Math.min(...states.map((s) => s.costOfLivingIndex));
      const winners = states.filter((s) => s.costOfLivingIndex === min);
      return winners.length === states.length ? null : winners[0]?.code ?? null;
    },
  },
  {
    key: "avgPhysicianSalary",
    label: "Avg Physician Salary",
    icon: <DollarSign className="h-4 w-4" />,
    format: (s) => fmt(s.avgPhysicianSalary),
    winner: (states) => {
      const max = Math.max(...states.map((s) => s.avgPhysicianSalary));
      const winners = states.filter((s) => s.avgPhysicianSalary === max);
      return winners.length === states.length ? null : winners[0]?.code ?? null;
    },
  },
  {
    key: "effectiveSalary",
    label: "Effective Salary (tax + COL adjusted)",
    icon: <DollarSign className="h-4 w-4" />,
    format: (s) => fmt(s.effectiveSalary),
    winner: (states) => {
      const max = Math.max(...states.map((s) => s.effectiveSalary));
      const winners = states.filter((s) => s.effectiveSalary === max);
      return winners.length === states.length ? null : winners[0]?.code ?? null;
    },
  },
  {
    key: "malpracticeEnvironment",
    label: "Malpractice Environment",
    icon: <Shield className="h-4 w-4" />,
    format: (s) =>
      s.malpracticeEnvironment.charAt(0).toUpperCase() +
      s.malpracticeEnvironment.slice(1),
    winner: (states) => {
      const rank = { favorable: 3, moderate: 2, challenging: 1 };
      const max = Math.max(
        ...states.map((s) => rank[s.malpracticeEnvironment])
      );
      const winners = states.filter(
        (s) => rank[s.malpracticeEnvironment] === max
      );
      return winners.length === states.length ? null : winners[0]?.code ?? null;
    },
  },
  {
    key: "majorAirports",
    label: "Major Airports",
    icon: <Plane className="h-4 w-4" />,
    format: (s) => s.majorAirports.join(", "),
    winner: (states) => {
      const max = Math.max(...states.map((s) => s.majorAirports.length));
      const winners = states.filter((s) => s.majorAirports.length === max);
      return winners.length === states.length ? null : winners[0]?.code ?? null;
    },
  },
  {
    key: "climate",
    label: "Climate",
    icon: <Thermometer className="h-4 w-4" />,
    format: (s) => s.climate,
    winner: () => null, // subjective
  },
];

export default function CompareStatesPage() {
  const [selected, setSelected] = useState<(string | null)[]>([null, null]);

  const mergedStates = useMemo(() => {
    return selected
      .filter((s): s is string => s !== null)
      .map(buildMerged)
      .filter((s): s is MergedState => s !== null);
  }, [selected]);

  function setStateAt(index: number, code: string | null) {
    const next = [...selected];
    next[index] = code;
    setSelected(next);
  }

  function addSlot() {
    if (selected.length < 3) {
      setSelected([...selected, null]);
    }
  }

  function removeSlot(index: number) {
    if (selected.length <= 2) return;
    const next = selected.filter((_, i) => i !== index);
    setSelected(next);
  }

  const usedCodes = new Set(selected.filter(Boolean));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="rounded-lg bg-cyan/10 p-2.5">
            <MapPin className="h-6 w-6 text-cyan" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
            Compare States for J-1 Waiver
          </h1>
        </div>
        <p className="text-muted max-w-3xl text-base leading-relaxed">
          Side-by-side comparison of waiver program details, tax environment,
          cost of living, malpractice climate, and quality-of-life factors.
          Select 2 or 3 states to compare.
        </p>
      </div>

      {/* ═══ State Selectors ═══ */}
      <div className="flex flex-wrap items-end gap-4 mb-8">
        {selected.map((code, i) => (
          <div key={i} className="flex-1 min-w-[200px] max-w-xs">
            <label className="block text-xs text-muted mb-1.5 font-medium">
              State {i + 1}
              {i === 2 && " (optional)"}
            </label>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <select
                  value={code ?? ""}
                  onChange={(e) =>
                    setStateAt(i, e.target.value || null)
                  }
                  className="w-full appearance-none rounded-lg border border-border bg-surface px-4 py-2.5 pr-10 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent/50 transition-colors"
                >
                  <option value="">Select a state...</option>
                  {ALL_STATES.map((sc) => (
                    <option
                      key={sc}
                      value={sc}
                      disabled={usedCodes.has(sc) && sc !== code}
                    >
                      {STATE_COMPARISON_DATA[sc].stateName}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted pointer-events-none" />
              </div>
              {i === 2 && (
                <button
                  onClick={() => removeSlot(i)}
                  className="rounded-lg border border-border bg-surface p-2.5 text-muted hover:text-danger hover:border-danger/30 transition-colors"
                  title="Remove third state"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        ))}
        {selected.length < 3 && (
          <button
            onClick={addSlot}
            className="rounded-lg border border-dashed border-border bg-surface px-4 py-2.5 text-sm text-muted hover:text-accent hover:border-accent/30 flex items-center gap-2 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add state
          </button>
        )}
      </div>

      {/* ═══ Comparison Table ═══ */}
      {mergedStates.length >= 2 ? (
        <>
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-surface-alt border-b border-border">
                  <th className="text-left px-4 py-3 font-semibold text-muted w-[200px]">
                    Metric
                  </th>
                  {mergedStates.map((s) => (
                    <th
                      key={s.code}
                      className="text-left px-4 py-3 font-semibold text-foreground min-w-[180px]"
                    >
                      {s.name}{" "}
                      <span className="text-muted font-normal">
                        ({s.code})
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {METRICS.map((metric, i) => {
                  const winnerCode = metric.winner(mergedStates);
                  return (
                    <tr
                      key={metric.key}
                      className={`border-b border-border/50 ${
                        i % 2 === 0 ? "bg-surface" : "bg-background"
                      }`}
                    >
                      <td className="px-4 py-3 text-muted font-medium whitespace-nowrap">
                        <span className="flex items-center gap-2">
                          {metric.icon}
                          {metric.label}
                        </span>
                      </td>
                      {mergedStates.map((s) => {
                        const isWinner = winnerCode === s.code;
                        const isMalp =
                          metric.key === "malpracticeEnvironment";
                        return (
                          <td
                            key={s.code}
                            className={`px-4 py-3 whitespace-nowrap ${
                              isWinner
                                ? "text-success font-semibold"
                                : isMalp
                                  ? malpColor(s.malpracticeEnvironment)
                                  : "text-foreground"
                            }`}
                          >
                            {isMalp ? (
                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${malpBg(s.malpracticeEnvironment)} ${malpColor(s.malpracticeEnvironment)}`}
                              >
                                {metric.format(s)}
                              </span>
                            ) : (
                              <>
                                {isWinner && (
                                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-success mr-2" />
                                )}
                                {metric.format(s)}
                              </>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* View detail links */}
          <div className="flex flex-wrap gap-3 mt-6">
            {mergedStates.map((s) => (
              <Link
                key={s.code}
                href={`/career/waiver/${s.code.toLowerCase()}`}
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-medium text-foreground hover:text-accent hover:border-accent/30 transition-colors"
              >
                View {s.name} detail
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            ))}
          </div>

          {/* Legend */}
          <div className="mt-6 rounded-lg border border-border/50 bg-surface-alt p-4">
            <p className="text-xs text-muted">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-success mr-1.5 align-middle" />
              Green dot indicates the state that scores best on that metric.
              Effective salary = (Salary x (1 - tax rate)) / (COL index / 100).
              Conrad 30 slots are per federal fiscal year (Oct 1 - Sep 30).
              Malpractice environment reflects tort reform status and historical
              award patterns.
            </p>
          </div>
        </>
      ) : (
        /* Empty state */
        <div className="rounded-xl border border-dashed border-border bg-surface p-12 text-center">
          <MapPin className="h-10 w-10 text-muted mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Select at Least 2 States
          </h3>
          <p className="text-sm text-muted max-w-md mx-auto">
            Choose states from the dropdowns above to see a side-by-side
            comparison of waiver programs, tax environment, cost of living, and
            more.
          </p>
        </div>
      )}
    </div>
  );
}
