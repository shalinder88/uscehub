"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  FY2025_SLOTS,
  getTrackerSummary,
  type ConradSlotStatus,
} from "@/lib/conrad-tracker-data";
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowUpDown,
  ExternalLink,
  MapPin,
  Info,
} from "lucide-react";

type SortField = "stateName" | "filledSlots" | "remainingSlots" | "fillPattern";

function SlotBar({ filled, total }: { filled: number; total: number }) {
  const pct = Math.round((filled / total) * 100);
  const color =
    pct >= 100
      ? "bg-red-500"
      : pct >= 80
      ? "bg-orange-500"
      : pct >= 50
      ? "bg-yellow-500"
      : "bg-green-500";

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2.5 bg-surface-alt rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${color} transition-all`}
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
      <span className="text-xs text-muted w-12 text-right font-mono">
        {filled}/{total}
      </span>
    </div>
  );
}

function StatusBadge({ pattern }: { pattern: ConradSlotStatus["fillPattern"] }) {
  if (pattern === "fills_early") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium bg-red-500/10 text-red-400">
        <XCircle className="h-2.5 w-2.5" />
        Fills Early
      </span>
    );
  }
  if (pattern === "fills_all") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium bg-orange-500/10 text-orange-400">
        <AlertTriangle className="h-2.5 w-2.5" />
        Fills All
      </span>
    );
  }
  if (pattern === "has_remaining") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium bg-green-500/10 text-green-400">
        <CheckCircle2 className="h-2.5 w-2.5" />
        Slots Available
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium bg-slate-500/10 text-slate-400">
      Unknown
    </span>
  );
}

export default function ConradTrackerPage() {
  const summary = getTrackerSummary();
  const [sortField, setSortField] = useState<SortField>("fillPattern");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [filter, setFilter] = useState<"all" | "available" | "full">("all");

  const filtered = useMemo(() => {
    let list = [...FY2025_SLOTS];

    if (filter === "available") {
      list = list.filter((s) => s.remainingSlots > 0);
    } else if (filter === "full") {
      list = list.filter((s) => s.remainingSlots === 0);
    }

    list.sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortField === "stateName") {
        return a.stateName.localeCompare(b.stateName) * dir;
      }
      if (sortField === "filledSlots") {
        return (a.filledSlots - b.filledSlots) * dir;
      }
      if (sortField === "remainingSlots") {
        return (a.remainingSlots - b.remainingSlots) * dir;
      }
      // fillPattern sort: fills_early > fills_all > has_remaining
      const order = { fills_early: 3, fills_all: 2, has_remaining: 1, unknown: 0 };
      return (order[a.fillPattern] - order[b.fillPattern]) * dir;
    });

    return list;
  }, [sortField, sortDir, filter]);

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("desc");
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb */}
      <Link
        href="/career/waiver"
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-accent transition-colors mb-6"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to State Intelligence
      </Link>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
          Conrad 30 Slot Tracker
        </h1>
        <p className="text-muted max-w-2xl">
          Real-time tracking of Conrad 30 waiver slot availability by state.
          Each state gets 30 slots per federal fiscal year (October 1 -
          September 30).
        </p>
        <div className="mt-3 inline-flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/5 px-3 py-1.5 text-xs text-green-400">
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span>
            Last updated: <strong>{summary.lastUpdated}</strong>
          </span>
          <span className="text-slate-500">· Source: 3RNET, State DOH offices</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="rounded-xl border border-border bg-surface p-5 text-center">
          <div className="text-3xl font-bold text-foreground">
            {summary.totalFilled.toLocaleString()}
          </div>
          <div className="text-xs text-muted mt-1">Total Filled</div>
          <div className="text-xs text-accent mt-0.5">
            of {summary.totalSlots.toLocaleString()} ({summary.fillPercentage}%)
          </div>
        </div>
        <div className="rounded-xl border border-border bg-surface p-5 text-center">
          <div className="text-3xl font-bold text-green-400">
            {summary.totalRemaining}
          </div>
          <div className="text-xs text-muted mt-1">Slots Remaining</div>
          <div className="text-xs text-muted mt-0.5">across all states</div>
        </div>
        <div className="rounded-xl border border-border bg-surface p-5 text-center">
          <div className="text-3xl font-bold text-red-400">
            {summary.statesFull}
          </div>
          <div className="text-xs text-muted mt-1">States Full</div>
          <div className="text-xs text-muted mt-0.5">all slots used</div>
        </div>
        <div className="rounded-xl border border-border bg-surface p-5 text-center">
          <div className="text-3xl font-bold text-green-400">
            {summary.statesWithSlots}
          </div>
          <div className="text-xs text-muted mt-1">States Available</div>
          <div className="text-xs text-muted mt-0.5">still accepting</div>
        </div>
      </div>

      {/* Fiscal Year and Info */}
      <div className="rounded-xl border border-border bg-surface-alt p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <Info className="h-4 w-4 text-accent shrink-0 mt-0.5" />
        <div className="text-sm text-muted">
          <strong className="text-foreground">{summary.fiscalYear}</strong> —
          Federal fiscal year runs October 1 to September 30. All 50 states
          receive exactly 30 Conrad slots. Slots reset on October 1.
          States marked &quot;Fills Early&quot; exhaust slots within the first
          weeks. Consider{" "}
          <Link
            href="/career/waiver/pathways"
            className="text-accent hover:underline"
          >
            alternative pathways (HHS, ARC, DRA, SCRC)
          </Link>{" "}
          with unlimited slots.
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        {(["all", "available", "full"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              filter === f
                ? "bg-accent text-white"
                : "bg-surface border border-border text-muted hover:text-foreground"
            }`}
          >
            {f === "all"
              ? `All States (${FY2025_SLOTS.length})`
              : f === "available"
              ? `Slots Available (${FY2025_SLOTS.filter((s) => s.remainingSlots > 0).length})`
              : `Full (${FY2025_SLOTS.filter((s) => s.remainingSlots === 0).length})`}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-alt">
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => toggleSort("stateName")}
                  className="flex items-center gap-1 font-semibold text-foreground hover:text-accent"
                >
                  State <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => toggleSort("fillPattern")}
                  className="flex items-center gap-1 font-semibold text-foreground hover:text-accent"
                >
                  Status <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="px-4 py-3 text-left min-w-[200px]">
                <button
                  onClick={() => toggleSort("filledSlots")}
                  className="flex items-center gap-1 font-semibold text-foreground hover:text-accent"
                >
                  Slots <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={() => toggleSort("remainingSlots")}
                  className="flex items-center gap-1 font-semibold text-foreground hover:text-accent"
                >
                  Remaining <ArrowUpDown className="h-3 w-3" />
                </button>
              </th>
              <th className="px-4 py-3 text-left">Flex</th>
              <th className="px-4 py-3 text-left">Alt. Pathways</th>
              <th className="px-4 py-3 text-left">Details</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((state) => {
              const slug = state.stateName
                .toLowerCase()
                .replace(/\s+/g, "-");
              return (
                <tr
                  key={state.stateCode}
                  className="border-b border-border/50 hover:bg-surface/50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-muted w-6">
                        {state.stateCode}
                      </span>
                      <span className="font-medium text-foreground">
                        {state.stateName}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge pattern={state.fillPattern} />
                  </td>
                  <td className="px-4 py-3 min-w-[200px]">
                    <SlotBar
                      filled={state.filledSlots}
                      total={state.totalSlots}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`font-mono text-sm font-bold ${
                        state.remainingSlots > 0
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {state.remainingSlots}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-muted">
                      {state.flexSlots > 0 ? `${state.flexSlots} flex` : "None"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {state.alternativePathways.length > 0 ? (
                        state.alternativePathways.map((p) => (
                          <span
                            key={p}
                            className="inline-flex rounded px-1.5 py-0.5 text-[10px] font-medium bg-accent/10 text-accent"
                          >
                            {p}
                          </span>
                        ))
                      ) : (
                        <span className="text-[10px] text-muted">—</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/career/waiver/${slug}`}
                      className="inline-flex items-center gap-1 text-xs text-accent hover:underline"
                    >
                      View <ExternalLink className="h-3 w-3" />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Source note */}
      <p className="mt-4 text-xs text-muted">
        Data sourced from 3RNET Conrad 30 slot tracking and state health
        department offices. Fill pattern based on FY 2024 confirmed data and
        historical 20-year trends. Exact current-year slot counts are
        approximate and updated as state DOH offices report. For the most
        current slot availability, contact the specific state health department
        directly.
      </p>
    </div>
  );
}
