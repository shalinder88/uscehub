"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from "react-simple-maps";
import {
  FY2025_SLOTS,
  getTrackerSummary,
} from "@/lib/conrad-tracker-data";
import {
  ArrowLeft,
  Info,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ExternalLink,
} from "lucide-react";

const GEO_URL = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json";

// Map state FIPS to state codes
const FIPS_TO_STATE: Record<string, string> = {
  "01": "AL", "02": "AK", "04": "AZ", "05": "AR", "06": "CA",
  "08": "CO", "09": "CT", "10": "DE", "12": "FL", "13": "GA",
  "15": "HI", "16": "ID", "17": "IL", "18": "IN", "19": "IA",
  "20": "KS", "21": "KY", "22": "LA", "23": "ME", "24": "MD",
  "25": "MA", "26": "MI", "27": "MN", "28": "MS", "29": "MO",
  "30": "MT", "31": "NE", "32": "NV", "33": "NH", "34": "NJ",
  "35": "NM", "36": "NY", "37": "NC", "38": "ND", "39": "OH",
  "40": "OK", "41": "OR", "42": "PA", "44": "RI", "45": "SC",
  "46": "SD", "47": "TN", "48": "TX", "49": "UT", "50": "VT",
  "51": "VA", "53": "WA", "54": "WV", "55": "WI", "56": "WY",
};

function getStateColor(stateCode: string): string {
  const state = FY2025_SLOTS.find((s) => s.stateCode === stateCode);
  if (!state) return "#334155"; // slate-700

  if (state.fillPattern === "fills_early") return "#ef4444"; // red-500
  if (state.fillPattern === "fills_all") return "#f97316"; // orange-500
  if (state.remainingSlots > 10) return "#22c55e"; // green-500
  if (state.remainingSlots > 0) return "#eab308"; // yellow-500
  return "#ef4444"; // red-500
}

function getStateHoverColor(stateCode: string): string {
  const state = FY2025_SLOTS.find((s) => s.stateCode === stateCode);
  if (!state) return "#475569";

  if (state.fillPattern === "fills_early") return "#dc2626";
  if (state.fillPattern === "fills_all") return "#ea580c";
  if (state.remainingSlots > 10) return "#16a34a";
  if (state.remainingSlots > 0) return "#ca8a04";
  return "#dc2626";
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
      {/* Breadcrumb */}
      <Link
        href="/career/waiver"
        className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-accent transition-colors mb-6"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to State Intelligence
      </Link>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
          J-1 Waiver Map
        </h1>
        <p className="text-muted max-w-2xl text-sm">
          Interactive map showing Conrad 30 slot availability by state.
          Click a state for detailed waiver intelligence.
        </p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mb-6 text-xs">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-sm bg-red-500" />
          <span className="text-muted">Fills Early (slots gone in days)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-sm bg-orange-500" />
          <span className="text-muted">Fills All (all 30 used)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-sm bg-yellow-500" />
          <span className="text-muted">Few Remaining (&lt;10)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-sm bg-green-500" />
          <span className="text-muted">Slots Available (10+)</span>
        </div>
      </div>

      {/* Map + Info Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-surface overflow-hidden">
          <ComposableMap
            projection="geoAlbersUsa"
            projectionConfig={{ scale: 1000 }}
            width={800}
            height={500}
            style={{ width: "100%", height: "auto" }}
          >
            <ZoomableGroup>
              <Geographies geography={GEO_URL}>
                {({ geographies }) =>
                  geographies.map((geo) => {
                    const fips = geo.id;
                    const stateCode = FIPS_TO_STATE[fips] || "";
                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill={getStateColor(stateCode)}
                        stroke="#1e293b"
                        strokeWidth={0.5}
                        onMouseEnter={() => setHoveredState(stateCode)}
                        onMouseLeave={() => setHoveredState(null)}
                        onClick={() => setSelectedState(stateCode)}
                        style={{
                          default: { outline: "none" },
                          hover: {
                            fill: getStateHoverColor(stateCode),
                            outline: "none",
                            cursor: "pointer",
                          },
                          pressed: { outline: "none" },
                        }}
                      />
                    );
                  })
                }
              </Geographies>
            </ZoomableGroup>
          </ComposableMap>

          {/* Hover tooltip */}
          {hoveredData && (
            <div className="px-4 py-2 border-t border-border bg-surface-alt text-xs flex items-center gap-4">
              <span className="font-bold text-foreground">
                {hoveredData.stateName} ({hoveredData.stateCode})
              </span>
              <span className="text-muted">
                {hoveredData.filledSlots}/{hoveredData.totalSlots} filled
              </span>
              <span
                className={
                  hoveredData.remainingSlots > 0
                    ? "text-green-400 font-bold"
                    : "text-red-400 font-bold"
                }
              >
                {hoveredData.remainingSlots} remaining
              </span>
              {hoveredData.alternativePathways.length > 0 && (
                <span className="text-accent">
                  Alt: {hoveredData.alternativePathways.join(", ")}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Info Panel */}
        <div className="rounded-xl border border-border bg-surface p-6">
          {selectedData ? (
            <>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-foreground">
                  {selectedData.stateName}
                </h2>
                <span className="text-xs font-mono text-muted">
                  {selectedData.stateCode}
                </span>
              </div>

              {/* Fill Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted">Conrad 30 Slots</span>
                  <span className="font-mono text-foreground">
                    {selectedData.filledSlots}/{selectedData.totalSlots}
                  </span>
                </div>
                <div className="h-3 bg-surface-alt rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      selectedData.remainingSlots === 0
                        ? "bg-red-500"
                        : selectedData.remainingSlots < 10
                        ? "bg-yellow-500"
                        : "bg-green-500"
                    }`}
                    style={{
                      width: `${Math.min(
                        (selectedData.filledSlots / selectedData.totalSlots) * 100,
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted">Remaining</span>
                  <span
                    className={`font-bold ${
                      selectedData.remainingSlots > 0
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    {selectedData.remainingSlots} slots
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Flex Slots</span>
                  <span className="text-foreground">
                    {selectedData.flexSlots > 0
                      ? `${selectedData.flexSlots} available`
                      : "None"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Fill Pattern</span>
                  <span className="text-foreground capitalize">
                    {selectedData.fillPattern.replace(/_/g, " ")}
                  </span>
                </div>
              </div>

              {/* Alternative Pathways */}
              {selectedData.alternativePathways.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border">
                  <h3 className="text-xs font-semibold text-foreground mb-2">
                    Alternative Pathways (Unlimited Slots)
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedData.alternativePathways.map((p) => (
                      <span
                        key={p}
                        className="inline-flex rounded px-2 py-0.5 text-xs font-medium bg-accent/10 text-accent"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Links */}
              <div className="mt-4 pt-4 border-t border-border space-y-2">
                <Link
                  href={`/career/waiver/${selectedData.stateName
                    .toLowerCase()
                    .replace(/\s+/g, "-")}`}
                  className="flex items-center gap-2 text-sm text-accent hover:underline"
                >
                  <MapPin className="h-3.5 w-3.5" />
                  Full {selectedData.stateName} waiver guide
                </Link>
                <Link
                  href="/career/waiver/pathways"
                  className="flex items-center gap-2 text-sm text-muted hover:text-accent"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Compare all waiver pathways
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <MapPin className="h-8 w-8 text-muted mx-auto mb-3" />
              <p className="text-sm text-muted">
                Click a state on the map to see detailed waiver information.
              </p>
            </div>
          )}

          {/* Summary stats */}
          <div className="mt-6 pt-4 border-t border-border">
            <h3 className="text-xs font-semibold text-foreground mb-3 uppercase tracking-wider">
              National Summary
            </h3>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="rounded-lg bg-surface-alt p-2">
                <div className="text-lg font-bold text-foreground">
                  {summary.totalFilled}
                </div>
                <div className="text-[10px] text-muted">Filled</div>
              </div>
              <div className="rounded-lg bg-surface-alt p-2">
                <div className="text-lg font-bold text-green-400">
                  {summary.totalRemaining}
                </div>
                <div className="text-[10px] text-muted">Remaining</div>
              </div>
              <div className="rounded-lg bg-surface-alt p-2">
                <div className="text-lg font-bold text-red-400">
                  {summary.statesFull}
                </div>
                <div className="text-[10px] text-muted">States Full</div>
              </div>
              <div className="rounded-lg bg-surface-alt p-2">
                <div className="text-lg font-bold text-green-400">
                  {summary.statesWithSlots}
                </div>
                <div className="text-[10px] text-muted">Available</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Source note */}
      <p className="mt-6 text-xs text-muted">
        Map data based on 3RNET Conrad 30 slot tracking and state DOH offices.
        Fill patterns reflect FY 2024 confirmed data and historical trends.
        For the most current slot availability, contact the specific state
        health department. HPSA county-level data coming soon (source: HRSA).
      </p>
    </div>
  );
}
