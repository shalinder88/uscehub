"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  ExternalLink,
  ArrowLeft,
  Info,
  MapPin,
  AlertTriangle,
} from "lucide-react";

export default function HPSALookupPage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
          HPSA Score Lookup Tool
        </h1>
        <p className="text-muted max-w-2xl">
          Check if a facility or address qualifies as a Health Professional
          Shortage Area. HPSA scores range from 1-25 (higher = greater need).
          Most waiver programs require a designated HPSA. HHS Clinical Care
          Waivers require a score of 7+.
        </p>
      </div>

      {/* HRSA Tool Embed */}
      <div className="rounded-xl border border-border bg-surface p-6 sm:p-8 mb-8">
        <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
          <MapPin className="h-5 w-5 text-accent" />
          Official HRSA HPSA Finder
        </h2>
        <p className="text-sm text-muted mb-4">
          HRSA maintains the official HPSA designation database. Use their tool
          to look up any address, facility, or county:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <a
            href="https://data.hrsa.gov/tools/shortage-area/hpsa-find"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl border border-accent/30 bg-accent/5 p-5 hover:bg-accent/10 transition-colors group"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-foreground group-hover:text-accent">
                HPSA Finder Tool
              </h3>
              <ExternalLink className="h-4 w-4 text-accent" />
            </div>
            <p className="text-xs text-muted">
              Search by address, county, or facility name. Returns HPSA type
              (primary care, mental health, dental), score, and designation
              status.
            </p>
          </a>

          <a
            href="https://data.hrsa.gov/tools/shortage-area/mua-find"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl border border-cyan/30 bg-cyan/5 p-5 hover:bg-cyan/10 transition-colors group"
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-foreground group-hover:text-cyan">
                MUA/MUP Finder Tool
              </h3>
              <ExternalLink className="h-4 w-4 text-cyan" />
            </div>
            <p className="text-xs text-muted">
              Search for Medically Underserved Areas (MUA) and Medically
              Underserved Populations (MUP). Some waiver programs accept MUA
              even without HPSA.
            </p>
          </a>
        </div>

        <a
          href="https://data.hrsa.gov/tools/shortage-area"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-xl border border-success/30 bg-success/5 p-5 hover:bg-success/10 transition-colors group block mb-4"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-foreground group-hover:text-success">
              HRSA Shortage Area Map
            </h3>
            <ExternalLink className="h-4 w-4 text-success" />
          </div>
          <p className="text-xs text-muted">
            Interactive map showing all HPSA and MUA designations across the US.
            Color-coded by type and severity. Zoom to county level.
          </p>
        </a>
      </div>

      {/* HPSA Score Guide */}
      <div className="rounded-xl border border-border bg-surface p-6 sm:p-8 mb-8">
        <h2 className="text-lg font-bold text-foreground mb-4">
          Understanding HPSA Scores
        </h2>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-lg bg-red-500/5 border border-red-500/20 p-4 text-center">
              <div className="text-2xl font-bold text-red-400">18-25</div>
              <div className="text-xs font-semibold text-red-400 mt-1">
                Critical Shortage
              </div>
              <p className="text-[10px] text-muted mt-2">
                Highest need areas. Strongest waiver applications. Often rural
                or very underserved urban areas.
              </p>
            </div>
            <div className="rounded-lg bg-orange-500/5 border border-orange-500/20 p-4 text-center">
              <div className="text-2xl font-bold text-orange-400">10-17</div>
              <div className="text-xs font-semibold text-orange-400 mt-1">
                Significant Shortage
              </div>
              <p className="text-[10px] text-muted mt-2">
                Strong waiver prospects. HPSA 14+ recommended for competitive
                states (CA, NY, FL). Score 7+ required for HHS waivers.
              </p>
            </div>
            <div className="rounded-lg bg-yellow-500/5 border border-yellow-500/20 p-4 text-center">
              <div className="text-2xl font-bold text-yellow-400">1-9</div>
              <div className="text-xs font-semibold text-yellow-400 mt-1">
                Moderate Shortage
              </div>
              <p className="text-[10px] text-muted mt-2">
                Designated but lower priority. Score 7+ needed for HHS Clinical
                Care Waiver. Conrad 30 may still work depending on state.
              </p>
            </div>
          </div>

          <div className="rounded-lg bg-surface-alt p-4">
            <h3 className="text-sm font-semibold text-foreground mb-2">
              HPSA Types
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-muted">
              <div>
                <strong className="text-foreground">Primary Care HPSA</strong>
                <br />
                Shortage of primary care physicians (FM, IM, Peds, OB/GYN).
                Most relevant for J-1 waivers.
              </div>
              <div>
                <strong className="text-foreground">Mental Health HPSA</strong>
                <br />
                Shortage of psychiatrists and mental health professionals.
                Relevant for psychiatry waiver applicants.
              </div>
              <div>
                <strong className="text-foreground">Dental HPSA</strong>
                <br />
                Shortage of dentists. Not relevant for physician waivers.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Waiver Pathway Requirements */}
      <div className="rounded-xl border border-border bg-surface p-6 sm:p-8 mb-8">
        <h2 className="text-lg font-bold text-foreground mb-4">
          HPSA Score Requirements by Pathway
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-3 py-2 text-left font-semibold text-foreground">
                  Pathway
                </th>
                <th className="px-3 py-2 text-left font-semibold text-foreground">
                  HPSA Required?
                </th>
                <th className="px-3 py-2 text-left font-semibold text-foreground">
                  Minimum Score
                </th>
                <th className="px-3 py-2 text-left font-semibold text-foreground">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border/50">
                <td className="px-3 py-2 font-medium text-foreground">
                  Conrad 30
                </td>
                <td className="px-3 py-2 text-muted">
                  Yes (or MUA/MUP)
                </td>
                <td className="px-3 py-2 text-muted">No federal minimum</td>
                <td className="px-3 py-2 text-xs text-muted">
                  States may set own thresholds. Flex slots exempt from HPSA.
                </td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="px-3 py-2 font-medium text-foreground">
                  HHS Clinical Care
                </td>
                <td className="px-3 py-2 text-muted">Yes</td>
                <td className="px-3 py-2 text-accent font-bold">7+</td>
                <td className="px-3 py-2 text-xs text-muted">
                  &quot;Proposed for Withdrawal&quot; HPSAs NOT eligible since Oct
                  2023.
                </td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="px-3 py-2 font-medium text-foreground">ARC</td>
                <td className="px-3 py-2 text-muted">
                  Yes (Appalachian HPSA)
                </td>
                <td className="px-3 py-2 text-muted">No explicit minimum</td>
                <td className="px-3 py-2 text-xs text-muted">
                  Must be in an ARC-eligible Appalachian county.
                </td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="px-3 py-2 font-medium text-foreground">DRA</td>
                <td className="px-3 py-2 text-muted">
                  Need demonstrated
                </td>
                <td className="px-3 py-2 text-muted">No explicit minimum</td>
                <td className="px-3 py-2 text-xs text-muted">
                  Must be in DRA-eligible county. Proof of community need.
                </td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="px-3 py-2 font-medium text-foreground">SCRC</td>
                <td className="px-3 py-2 text-muted">
                  Need demonstrated
                </td>
                <td className="px-3 py-2 text-muted">No explicit minimum</td>
                <td className="px-3 py-2 text-xs text-muted">
                  Must be in SCRC-eligible county. $3,000 application fee.
                </td>
              </tr>
              <tr>
                <td className="px-3 py-2 font-medium text-foreground">VA</td>
                <td className="px-3 py-2 text-muted">No</td>
                <td className="px-3 py-2 text-muted">N/A</td>
                <td className="px-3 py-2 text-xs text-muted">
                  VA justification based on facility staffing needs.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Warning */}
      <div className="rounded-xl border border-warning/30 bg-warning/5 p-5 flex gap-3">
        <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
        <div className="text-sm text-muted">
          <strong className="text-foreground">Important:</strong> HPSA
          designations change. A facility that was HPSA-designated last year may
          lose its designation. Always verify current HPSA status on the HRSA
          website before making employment decisions. Sites marked
          &quot;Proposed for Withdrawal&quot; are no longer eligible for HHS waivers.
        </div>
      </div>
    </div>
  );
}
