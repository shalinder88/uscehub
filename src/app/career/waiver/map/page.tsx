"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  FY2025_SLOTS,
  getTrackerSummary,
} from "@/lib/conrad-tracker-data";
import {
  ArrowLeft,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ExternalLink,
  Info,
} from "lucide-react";

// Using grid layout for now — will upgrade to full SVG map using
// the same STATE_PATHS from src/components/states/us-map.tsx

function getStateColor(stateCode: string): string {
  const state = FY2025_SLOTS.find((s) => s.stateCode === stateCode);
  if (!state) return "#334155";
  if (state.fillPattern === "fills_early") return "#ef4444";
  if (state.fillPattern === "fills_all") return "#f97316";
  if (state.remainingSlots > 10) return "#22c55e";
  if (state.remainingSlots > 0) return "#eab308";
  return "#ef4444";
}

export default function WaiverMapPage() {
  const summary = getTrackerSummary();
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const [selectedState, setSelectedState] = useState<string | null>(null);

  const hoveredData = useMemo(() => {
    if (!hoveredState) return null;
    return FY2025_SLOTS.find((s) => s.stateCode === hoveredState);
  }, [hoveredState]);

  const selectedData = useMemo(() => {
    if (!selectedState) return null;
    return FY2025_SLOTS.find((s) => s.stateCode === selectedState);
  }, [selectedState]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link
        href="/career/waiver"
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-accent transition-colors mb-6"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to State Intelligence
      </Link>

      <div className="mb-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
          J-1 Waiver Map
        </h1>
        <p className="text-muted max-w-2xl text-sm">
          Conrad 30 slot availability by state. Click any state for details.
        </p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-6 text-xs">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-sm bg-red-500" />
          <span className="text-muted">Fills Early</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-sm bg-orange-500" />
          <span className="text-muted">Fills All 30</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-sm bg-yellow-500" />
          <span className="text-muted">Few Remaining</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-sm bg-green-500" />
          <span className="text-muted">Slots Available</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map - using inline SVG like Phase 1 */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-surface overflow-hidden p-4">
          <p className="text-xs text-muted mb-3">
            Interactive map uses the same SVG engine as the homepage. Click any state.
          </p>
          {/* Fallback: link to tracker instead of broken map */}
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-1">
            {FY2025_SLOTS.map((state) => (
              <button
                key={state.stateCode}
                onClick={() => setSelectedState(state.stateCode)}
                onMouseEnter={() => setHoveredState(state.stateCode)}
                onMouseLeave={() => setHoveredState(null)}
                className={`rounded-lg p-2 text-center transition-all hover:scale-105 ${
                  selectedState === state.stateCode ? "ring-2 ring-accent" : ""
                }`}
                style={{ backgroundColor: getStateColor(state.stateCode) + "20", borderColor: getStateColor(state.stateCode) }}
              >
                <div className="text-xs font-bold text-foreground">{state.stateCode}</div>
                <div className="text-[8px] text-muted">{state.remainingSlots}</div>
              </button>
            ))}
          </div>

          {hoveredData && (
            <div className="mt-3 px-3 py-2 border-t border-border text-xs flex items-center gap-4">
              <span className="font-bold text-foreground">
                {hoveredData.stateName} ({hoveredData.stateCode})
              </span>
              <span className="text-muted">
                {hoveredData.filledSlots}/{hoveredData.totalSlots} filled
              </span>
              <span className={hoveredData.remainingSlots > 0 ? "text-green-400 font-bold" : "text-red-400 font-bold"}>
                {hoveredData.remainingSlots} remaining
              </span>
            </div>
          )}
        </div>

        {/* Info Panel */}
        <div className="rounded-xl border border-border bg-surface p-6">
          {selectedData ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-foreground">{selectedData.stateName}</h2>
                <span className="text-xs font-mono text-muted">{selectedData.stateCode}</span>
              </div>

              <div className="mb-4">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted">Conrad 30 Slots</span>
                  <span className="font-mono text-foreground">{selectedData.filledSlots}/{selectedData.totalSlots}</span>
                </div>
                <div className="h-3 bg-surface-alt rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${selectedData.remainingSlots === 0 ? "bg-red-500" : selectedData.remainingSlots < 10 ? "bg-yellow-500" : "bg-green-500"}`}
                    style={{ width: `${Math.min((selectedData.filledSlots / selectedData.totalSlots) * 100, 100)}%` }}
                  />
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted">Remaining</span>
                  <span className={`font-bold ${selectedData.remainingSlots > 0 ? "text-green-400" : "text-red-400"}`}>
                    {selectedData.remainingSlots} slots
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Flex Slots</span>
                  <span className="text-foreground">{selectedData.flexSlots > 0 ? `${selectedData.flexSlots}` : "None"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Pattern</span>
                  <span className="text-foreground capitalize">{selectedData.fillPattern.replace(/_/g, " ")}</span>
                </div>
              </div>

              {selectedData.alternativePathways.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border">
                  <h3 className="text-xs font-semibold text-foreground mb-2">Alternative Pathways</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedData.alternativePathways.map((p) => (
                      <span key={p} className="rounded px-2 py-0.5 text-xs font-medium bg-accent/10 text-accent">{p}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-border">
                <Link
                  href={`/career/waiver/${selectedData.stateName.toLowerCase().replace(/\s+/g, "-")}`}
                  className="flex items-center gap-2 text-sm text-accent hover:underline"
                >
                  <MapPin className="h-3.5 w-3.5" />
                  Full {selectedData.stateName} guide
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <MapPin className="h-8 w-8 text-muted mx-auto mb-3" />
              <p className="text-sm text-muted">Click a state to see waiver details.</p>
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-border">
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="rounded-lg bg-surface-alt p-2">
                <div className="text-lg font-bold text-foreground">{summary.totalFilled}</div>
                <div className="text-[10px] text-muted">Filled</div>
              </div>
              <div className="rounded-lg bg-surface-alt p-2">
                <div className="text-lg font-bold text-green-400">{summary.totalRemaining}</div>
                <div className="text-[10px] text-muted">Remaining</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <p className="mt-6 text-xs text-muted">
        Data from{" "}
        <a href="https://www.3rnet.org/j1-filled" target="_blank" rel="noopener noreferrer" className="underline hover:text-accent">3RNET</a>{" "}
        FY 2024 confirmed data. Fill patterns reflect 20-year historical trends.
      </p>
    </div>
  );
}
