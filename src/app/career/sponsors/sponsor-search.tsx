"use client";

import { useState, useMemo, useEffect } from "react";
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
  Zap,
} from "lucide-react";
import { SPONSOR_DATA, type SponsorRecord } from "@/lib/sponsor-data";
import {
  LIVE_NOTICE_EMPLOYERS,
  CAP_EXEMPT_KEYS,
  normEmployerKey,
  type LiveNoticeEmployer,
} from "@/lib/sponsor-truth-overlay";
import { employerSlug } from "@/lib/sponsor-page-utils";

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

const PAGE_SIZE = 50;

// Live notice keys for fast sort (2 entries — iterating is negligible)
const LIVE_KEYS = [...LIVE_NOTICE_EMPLOYERS.keys()];

function getLiveData(employerName: string): LiveNoticeEmployer | null {
  const k = normEmployerKey(employerName);
  if (LIVE_NOTICE_EMPLOYERS.has(k)) return LIVE_NOTICE_EMPLOYERS.get(k)!;
  // Prefix match: "university of pittsburgh physicians" → "university of pittsburgh"
  for (const lk of LIVE_KEYS) {
    if (k.startsWith(lk) && lk.length >= 18) return LIVE_NOTICE_EMPLOYERS.get(lk)!;
  }
  return null;
}

function isCapExempt(employerName: string): boolean {
  return CAP_EXEMPT_KEYS.has(normEmployerKey(employerName));
}

function isLive(employerName: string): boolean {
  return getLiveData(employerName) !== null;
}

export function SponsorSearch() {
  const [query, setQuery] = useState("");
  const [stateFilter, setStateFilter] = useState("all");
  const [specFilter, setSpecFilter] = useState("all");
  const [capExemptOnly, setCapExemptOnly] = useState(false);
  const [sortBy, setSortBy] = useState<"active" | "salary" | "positions" | "name">("active");
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(0);

  const states = useMemo(() => {
    const s = new Set(SPONSOR_DATA.map((d) => d.s));
    return [...s].sort();
  }, []);

  useEffect(() => { setPage(0); }, [query, stateFilter, specFilter, capExemptOnly, sortBy]);

  const filtered = useMemo(() => {
    let results: SponsorRecord[] = SPONSOR_DATA;

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

    if (capExemptOnly) {
      results = results.filter((r) => isCapExempt(r.e));
    }

    if (sortBy === "active") {
      results = [...results].sort((a, b) => {
        const aL = isLive(a.e) ? 1 : 0;
        const bL = isLive(b.e) ? 1 : 0;
        return bL - aL || b.a - a.a;
      });
    } else if (sortBy === "salary") {
      results = [...results].sort((a, b) => b.a - a.a);
    } else if (sortBy === "positions") {
      results = [...results].sort((a, b) => b.p - a.p);
    } else {
      results = [...results].sort((a, b) => a.e.localeCompare(b.e));
    }

    return results;
  }, [query, stateFilter, specFilter, capExemptOnly, sortBy]);

  const totalPositions = filtered.reduce((sum, r) => sum + r.p, 0);
  const avgSalary =
    filtered.length > 0
      ? Math.round(
          filtered.filter((r) => r.a > 0).reduce((sum, r) => sum + r.a, 0) /
            filtered.filter((r) => r.a > 0).length
        )
      : 0;

  const liveCount = useMemo(() => SPONSOR_DATA.filter((r) => isLive(r.e)).length, []);

  const page0 = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

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
        <div className="flex flex-wrap gap-2 mt-2">
          <div className="inline-flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/5 px-3 py-1.5 text-xs text-green-700">
            <Shield className="h-3.5 w-3.5" />
            <span>Source: <strong>U.S. Department of Labor</strong> LCA Public Data (FY2025 Q3)</span>
            <span className="text-slate-500">· Public domain · No paywall</span>
          </div>
          {liveCount > 0 && (
            <div className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-xs text-amber-700 font-medium">
              <Zap className="h-3.5 w-3.5" />
              {liveCount} employer{liveCount !== 1 ? "s" : ""} actively filing H-1B now
            </div>
          )}
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
          Employers marked <strong className="text-amber-700">ACTIVELY FILING</strong> have
          a current public LCA-notice posted on their own site — the freshest legal
          signal (20 CFR 655.734), months ahead of DOL disclosure files.
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
          {(stateFilter !== "all" || specFilter !== "all" || capExemptOnly) && (
            <span className="rounded-full bg-accent text-white text-[9px] font-bold w-4 h-4 flex items-center justify-center">
              {[stateFilter !== "all", specFilter !== "all", capExemptOnly].filter(Boolean).length}
            </span>
          )}
          <ChevronDown className={`h-3 w-3 transition-transform ${showFilters ? "rotate-180" : ""}`} />
        </button>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className="rounded-lg border border-border bg-surface px-3 py-2 text-xs text-foreground focus:outline-none focus:border-accent"
        >
          <option value="active">Sort: Active Notices First</option>
          <option value="salary">Sort: Highest Salary</option>
          <option value="positions">Sort: Most Positions</option>
          <option value="name">Sort: A-Z</option>
        </select>

        {(stateFilter !== "all" || specFilter !== "all" || capExemptOnly) && (
          <button
            onClick={() => { setStateFilter("all"); setSpecFilter("all"); setCapExemptOnly(false); }}
            className="rounded-lg border border-danger/30 bg-danger/5 px-3 py-2 text-xs text-danger hover:bg-danger/10 transition-colors"
          >
            Clear filters
          </button>
        )}
      </div>

      {showFilters && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4 p-4 rounded-xl border border-border bg-surface-alt">
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
          <div>
            <label className="block text-[10px] font-semibold text-muted uppercase tracking-wider mb-1.5">Sponsorship Type</label>
            <button
              onClick={() => setCapExemptOnly(!capExemptOnly)}
              className={`w-full rounded-lg border px-3 py-2 text-xs font-medium text-left transition-colors ${
                capExemptOnly
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-border bg-surface text-muted hover:text-foreground"
              }`}
            >
              {capExemptOnly ? "✓ " : ""}Cap-Exempt Only
              <span className="ml-1 text-[10px] opacity-60">(148 employers · no lottery)</span>
            </button>
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
        {page0.map((r, i) => {
          const live = getLiveData(r.e);
          const capEx = isCapExempt(r.e);
          return (
            <div
              key={`${r.e}-${r.s}-${i}`}
              className={`rounded-lg border bg-surface p-4 transition-colors ${
                live
                  ? "border-amber-400/40 hover:border-amber-400/70"
                  : "border-border hover:border-accent/30"
              }`}
            >
              {/* Live notice banner */}
              {live && (
                <div className="flex items-center gap-2 mb-3 -mt-0.5">
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-[11px] font-bold text-amber-700 tracking-wide">
                    <Zap className="h-3 w-3" />
                    ACTIVELY FILING H-1B
                  </span>
                  <span className="text-[10px] text-muted">
                    Public LCA notice on employer site · 20 CFR 655.734
                  </span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-foreground truncate">
                    <Link
                      href={`/career/sponsors/${employerSlug(r.e)}`}
                      className="hover:text-accent transition-colors"
                    >
                      {r.e}
                    </Link>
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-muted mt-0.5">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {r.c}, {r.s}
                    </span>
                    <span className="flex items-center gap-1">
                      <Briefcase className="h-3 w-3" />
                      {r.p} position{r.p !== 1 ? "s" : ""}
                      {r.n > 0 && <span className="text-success ml-1">({r.n} new)</span>}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {r.sp.map((sp) => (
                      <span key={sp} className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-medium text-accent">
                        {sp}
                      </span>
                    ))}
                    {capEx && (
                      <span className="rounded-full bg-green-500/10 border border-green-500/20 px-2 py-0.5 text-[10px] font-medium text-green-700">
                        Cap-Exempt
                      </span>
                    )}
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

              {/* Live notice detail */}
              {live && live.notices.map((n, ni) => (
                <div
                  key={ni}
                  className="mt-3 rounded-lg bg-amber-500/5 border border-amber-500/20 p-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <p className="text-xs font-semibold text-foreground">{n.role}</p>
                      <p className="text-[11px] text-muted mt-0.5">
                        <span className="text-success font-mono font-bold">{n.salaryText}</span>
                        {n.periodText && (
                          <span className="ml-2 text-muted">{n.periodText}</span>
                        )}
                      </p>
                    </div>
                    <a
                      href={n.noticeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-md bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-2.5 py-1 text-[11px] font-medium text-amber-700 transition-colors whitespace-nowrap shrink-0"
                    >
                      View LCA Notice
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                  <p className="mt-2 text-[10px] text-muted italic">
                    Employer history does not guarantee sponsorship for any specific role — always verify directly.
                  </p>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {filtered.length > PAGE_SIZE && (
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted">
            Showing{" "}
            <strong className="text-foreground">
              {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)}
            </strong>{" "}
            of{" "}
            <strong className="text-foreground">{filtered.length.toLocaleString()}</strong>{" "}
            employers
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 0}
              className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs text-muted hover:text-foreground hover:border-accent/50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-xs text-muted tabular-nums">
              {page + 1} / {Math.ceil(filtered.length / PAGE_SIZE)}
            </span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={(page + 1) * PAGE_SIZE >= filtered.length}
              className="rounded-lg border border-border bg-surface px-3 py-1.5 text-xs text-muted hover:text-foreground hover:border-accent/50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
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
            <strong className="text-foreground">DOL history (all employers):</strong>{" "}
            U.S. Department of Labor, LCA Disclosure Data, FY2025 Q3. Public domain.
            Every employer that filed an LCA for a physician H-1B (SOC 29-1211–29-1229).
          </p>
          <p>
            <strong className="text-foreground">Active LCA notices:</strong>{" "}
            Employers marked ACTIVELY FILING have a current public LCA notice on their
            own website — required by 20 CFR 655.734 for approximately 10 business days
            per filing. This is months ahead of DOL quarterly disclosure files and is
            the most direct evidence an employer is sponsoring H-1B right now.
          </p>
          <p>
            <strong className="text-foreground">Cap-exempt:</strong>{" "}
            These employers (typically hospitals and universities) are exempt from the
            annual H-1B lottery cap, meaning they can sponsor year-round without lottery
            risk. Highly favorable for J-1 waiver physicians converting to H-1B.
          </p>
          <p>
            <strong className="text-foreground">Limitations:</strong>{" "}
            LCA filing ≠ guaranteed H-1B approval. Employer-level history does not
            guarantee any specific role sponsors. Some entries include fellowship/training
            positions. Always verify visa terms directly with the employer&apos;s HR or
            immigration counsel.
          </p>
        </div>
      </div>
    </div>
  );
}
