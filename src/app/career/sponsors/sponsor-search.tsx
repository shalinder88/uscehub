"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Building2,
  MapPin,
  DollarSign,
  Briefcase,
  Filter,
  ChevronDown,
  X,
  CheckCircle2,
  Info,
  ExternalLink,
  Shield,
  Users,
  TrendingUp,
} from "lucide-react";
import { SPONSOR_DATA, type SponsorRecord } from "@/lib/sponsor-data";

const US_STATES: Record<string, string> = {
  AL:"Alabama",AK:"Alaska",AZ:"Arizona",AR:"Arkansas",CA:"California",CO:"Colorado",
  CT:"Connecticut",DE:"Delaware",DC:"Washington DC",FL:"Florida",GA:"Georgia",HI:"Hawaii",
  ID:"Idaho",IL:"Illinois",IN:"Indiana",IA:"Iowa",KS:"Kansas",KY:"Kentucky",LA:"Louisiana",
  ME:"Maine",MD:"Maryland",MA:"Massachusetts",MI:"Michigan",MN:"Minnesota",MS:"Mississippi",
  MO:"Missouri",MT:"Montana",NE:"Nebraska",NV:"Nevada",NH:"New Hampshire",NJ:"New Jersey",
  NM:"New Mexico",NY:"New York",NC:"North Carolina",ND:"North Dakota",OH:"Ohio",OK:"Oklahoma",
  OR:"Oregon",PA:"Pennsylvania",PR:"Puerto Rico",RI:"Rhode Island",SC:"South Carolina",
  SD:"South Dakota",TN:"Tennessee",TX:"Texas",UT:"Utah",VT:"Vermont",VA:"Virginia",
  WA:"Washington",WV:"West Virginia",WI:"Wisconsin",WY:"Wyoming",
};

const ALL_SPECIALTIES = [
  "Anesthesiology","Cardiology","Dermatology","Emergency Medicine","Family Medicine",
  "Internal Medicine","Neurology","OB/GYN","Other Physician","Pathology","Pediatrics",
  "Psychiatry","Radiology",
];

export function SponsorSearch() {
  const [query, setQuery] = useState("");
  const [stateFilter, setStateFilter] = useState("all");
  const [specFilter, setSpecFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"salary" | "positions" | "name">("salary");
  const [showFilters, setShowFilters] = useState(false);

  const states = useMemo(() => {
    const s = new Set(SPONSOR_DATA.map((d) => d.s));
    return [...s].sort();
  }, []);

  const filtered = useMemo(() => {
    let results = SPONSOR_DATA;

    if (query) {
      const q = query.toLowerCase();
      results = results.filter(
        (r) =>
          r.e.toLowerCase().includes(q) ||
          r.c.toLowerCase().includes(q) ||
          r.s.toLowerCase().includes(q) ||
          r.sp.some((sp) => sp.toLowerCase().includes(q))
      );
    }

    if (stateFilter !== "all") {
      results = results.filter((r) => r.s === stateFilter);
    }

    if (specFilter !== "all") {
      results = results.filter((r) => r.sp.some((sp) => sp.toLowerCase().includes(specFilter.toLowerCase())));
    }

    // Sort
    if (sortBy === "salary") {
      results = [...results].sort((a, b) => b.a - a.a);
    } else if (sortBy === "positions") {
      results = [...results].sort((a, b) => b.p - a.p);
    } else {
      results = [...results].sort((a, b) => a.e.localeCompare(b.e));
    }

    return results;
  }, [query, stateFilter, specFilter, sortBy]);

  // Stats
  const totalPositions = filtered.reduce((sum, r) => sum + r.p, 0);
  const avgSalary = filtered.length > 0
    ? Math.round(filtered.filter((r) => r.a > 0).reduce((sum, r) => sum + r.a, 0) / filtered.filter((r) => r.a > 0).length)
    : 0;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="rounded-lg bg-accent/10 p-2.5">
            <Building2 className="h-6 w-6 text-accent" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              H-1B Physician Sponsor Database
            </h1>
            <p className="text-xs text-muted mt-0.5">
              {SPONSOR_DATA.length.toLocaleString()} verified employers · Real salary data · Free
            </p>
          </div>
        </div>
        <div className="mt-2 inline-flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/5 px-3 py-1.5 text-xs text-green-400">
          <Shield className="h-3.5 w-3.5" />
          <span>Source: <strong>U.S. Department of Labor</strong> LCA Public Data (FY2025 Q3)</span>
          <span className="text-slate-500">· Public domain · No paywall</span>
        </div>
      </div>

      {/* Why this matters */}
      <div className="rounded-xl border border-border bg-surface-alt p-4 mb-6 flex gap-3">
        <Info className="h-5 w-5 text-accent shrink-0 mt-0.5" />
        <div className="text-xs text-muted">
          <strong className="text-foreground">How we got this data:</strong>{" "}
          Every H-1B employer must file a Labor Condition Application (LCA) with
          the Department of Labor. The DOL publishes all filings as public data.
          We filtered 683,535 total records to extract 5,311 physician-specific
          filings (SOC codes 29-1211 through 29-1229), then identified{" "}
          {SPONSOR_DATA.length.toLocaleString()} unique attending-level employers.
          This is the same data other sites charge for. We provide it free.
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted" />
          <input
            type="text"
            placeholder='Search by hospital, city, state, or specialty (e.g. "Mayo Clinic" or "cardiology Texas")'
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-xl border border-border bg-surface pl-12 pr-4 py-3.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
          />
          {query && (
            <button onClick={() => setQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-foreground">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-xs font-medium text-muted hover:text-foreground transition-colors"
        >
          <Filter className="h-3.5 w-3.5" />
          Filters
          <ChevronDown className={`h-3 w-3 transition-transform ${showFilters ? "rotate-180" : ""}`} />
        </button>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as "salary" | "positions" | "name")}
          className="rounded-lg border border-border bg-surface px-3 py-2 text-xs text-foreground focus:outline-none focus:border-accent"
        >
          <option value="salary">Sort: Highest Salary</option>
          <option value="positions">Sort: Most Positions</option>
          <option value="name">Sort: A-Z</option>
        </select>

        {(stateFilter !== "all" || specFilter !== "all") && (
          <button
            onClick={() => { setStateFilter("all"); setSpecFilter("all"); }}
            className="rounded-lg border border-danger/30 bg-danger/5 px-3 py-2 text-xs text-danger hover:bg-danger/10 transition-colors"
          >
            Clear filters
          </button>
        )}
      </div>

      {showFilters && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4 p-4 rounded-xl border border-border bg-surface-alt">
          <div>
            <label className="block text-[10px] font-semibold text-muted uppercase tracking-wider mb-1.5">State</label>
            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-xs text-foreground focus:outline-none focus:border-accent"
            >
              <option value="all">All States</option>
              {states.map((s) => (
                <option key={s} value={s}>{US_STATES[s] || s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-muted uppercase tracking-wider mb-1.5">Specialty</label>
            <select
              value={specFilter}
              onChange={(e) => setSpecFilter(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-xs text-foreground focus:outline-none focus:border-accent"
            >
              <option value="all">All Specialties</option>
              {ALL_SPECIALTIES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Stats bar */}
      <div className="flex flex-wrap items-center gap-4 mb-6 text-xs text-muted">
        <span className="flex items-center gap-1.5">
          <Building2 className="h-3.5 w-3.5 text-accent" />
          <strong className="text-foreground">{filtered.length.toLocaleString()}</strong> employers
        </span>
        <span className="flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5 text-accent" />
          <strong className="text-foreground">{totalPositions.toLocaleString()}</strong> positions
        </span>
        {avgSalary > 0 && (
          <span className="flex items-center gap-1.5">
            <DollarSign className="h-3.5 w-3.5 text-success" />
            <strong className="text-success">${avgSalary.toLocaleString()}</strong> avg salary
          </span>
        )}
        <span className="flex items-center gap-1 ml-auto">
          <CheckCircle2 className="h-3 w-3 text-success" />
          DOL public data · FY2025
        </span>
      </div>

      {/* Results */}
      <div className="space-y-2">
        {filtered.slice(0, 50).map((r, i) => (
          <div
            key={`${r.e}-${r.s}-${i}`}
            className="rounded-lg border border-border bg-surface p-4 hover:border-accent/30 transition-colors"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-foreground truncate">{r.e}</h3>
                <div className="flex items-center gap-3 text-xs text-muted mt-0.5">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {r.c}, {r.s}
                  </span>
                  <span className="flex items-center gap-1">
                    <Briefcase className="h-3 w-3" />
                    {r.p} position{r.p !== 1 ? "s" : ""}
                    {r.n > 0 && <span className="text-success">({r.n} new)</span>}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {r.sp.map((sp) => (
                    <span key={sp} className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-medium text-accent">
                      {sp}
                    </span>
                  ))}
                </div>
              </div>
              <div className="sm:text-right shrink-0">
                {r.a > 0 ? (
                  <div className="text-lg font-bold text-success font-mono">
                    ${r.a.toLocaleString()}
                  </div>
                ) : (
                  <div className="text-xs text-muted">Salary not in filing</div>
                )}
                <div className="text-[10px] text-muted">avg from LCA filings</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filtered.length > 50 && (
        <div className="mt-4 text-center text-xs text-muted">
          Showing 50 of {filtered.length.toLocaleString()} results. Refine your search to see more.
        </div>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <Search className="h-8 w-8 text-muted mx-auto mb-3" />
          <p className="text-sm text-foreground font-medium mb-1">No employers match your search</p>
          <p className="text-xs text-muted">Try a different specialty, state, or employer name.</p>
        </div>
      )}

      {/* Data note */}
      <div className="mt-10 rounded-xl border border-border bg-surface-alt p-5">
        <h3 className="text-sm font-bold text-foreground mb-2">About This Data</h3>
        <div className="space-y-2 text-xs text-muted">
          <p>
            <strong className="text-foreground">Source:</strong> U.S. Department of Labor,
            Labor Condition Application (LCA) Disclosure Data, FY2025 Q3.
            This is public domain government data — no copyright restrictions.
          </p>
          <p>
            <strong className="text-foreground">What it shows:</strong> Every employer that
            filed an LCA for a physician H-1B position (SOC codes 29-1211 through 29-1229).
            Salary data comes directly from the employer&apos;s LCA filing — it is the wage
            they offered to the Department of Labor.
          </p>
          <p>
            <strong className="text-foreground">Limitations:</strong> LCA filing ≠ guaranteed
            H-1B approval (~80% of certified LCAs result in approved H-1B petitions).
            Some entries include fellowship/training positions at lower salaries. Salary
            represents the base offered — actual compensation may be higher with bonuses
            and incentives.
          </p>
          <p>
            <strong className="text-foreground">Why this is free:</strong> Other sites charge
            $50-200+ for access to this same government data. We believe physicians navigating
            immigration should not pay for information that is already publicly available.
          </p>
        </div>
      </div>
    </div>
  );
}
