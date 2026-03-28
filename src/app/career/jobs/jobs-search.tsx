"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  MapPin,
  Briefcase,
  DollarSign,
  Shield,
  CheckCircle2,
  ExternalLink,
  Filter,
  X,
  Clock,
  AlertTriangle,
  Star,
  ChevronDown,
} from "lucide-react";
import {
  WAIVER_JOBS,
  getUniqueSpecialties,
  getUniqueStates,
  formatSalary,
  type WaiverJob,
} from "@/lib/waiver-jobs-data";

const US_STATE_NAMES: Record<string, string> = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California",
  CO: "Colorado", CT: "Connecticut", DE: "Delaware", FL: "Florida", GA: "Georgia",
  HI: "Hawaii", ID: "Idaho", IL: "Illinois", IN: "Indiana", IA: "Iowa",
  KS: "Kansas", KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland",
  MA: "Massachusetts", MI: "Michigan", MN: "Minnesota", MS: "Mississippi",
  MO: "Missouri", MT: "Montana", NE: "Nebraska", NV: "Nevada", NH: "New Hampshire",
  NJ: "New Jersey", NM: "New Mexico", NY: "New York", NC: "North Carolina",
  ND: "North Dakota", OH: "Ohio", OK: "Oklahoma", OR: "Oregon", PA: "Pennsylvania",
  RI: "Rhode Island", SC: "South Carolina", SD: "South Dakota", TN: "Tennessee",
  TX: "Texas", UT: "Utah", VT: "Vermont", VA: "Virginia", WA: "Washington",
  WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming", MULTI: "Nationwide",
};

export function JobsSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("all");
  const [selectedState, setSelectedState] = useState("all");
  const [selectedVisa, setSelectedVisa] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  const specialties = getUniqueSpecialties();
  const states = getUniqueStates();

  const filteredJobs = useMemo(() => {
    return WAIVER_JOBS.filter((job) => {
      // Search query
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesSearch =
          job.employer.toLowerCase().includes(q) ||
          job.specialty.toLowerCase().includes(q) ||
          job.city.toLowerCase().includes(q) ||
          job.state.toLowerCase().includes(q) ||
          (job.subspecialty?.toLowerCase().includes(q) ?? false) ||
          (job.description?.toLowerCase().includes(q) ?? false);
        if (!matchesSearch) return false;
      }

      // Specialty filter
      if (selectedSpecialty !== "all" && !job.specialty.toLowerCase().includes(selectedSpecialty.toLowerCase())) {
        return false;
      }

      // State filter
      if (selectedState !== "all" && job.state !== selectedState && job.state !== "MULTI") {
        return false;
      }

      // Visa filter
      if (selectedVisa !== "all") {
        if (selectedVisa === "j1" && !job.visaTypes.includes("j1") && !job.visaTypes.includes("both")) return false;
        if (selectedVisa === "h1b" && !job.visaTypes.includes("h1b") && !job.visaTypes.includes("both")) return false;
        if (selectedVisa === "greencard" && !job.visaTypes.includes("greencard")) return false;
      }

      return true;
    });
  }, [searchQuery, selectedSpecialty, selectedState, selectedVisa]);

  const featuredJobs = filteredJobs.filter((j) => j.featured);
  const regularJobs = filteredJobs.filter((j) => !j.featured);

  return (
    <div>
      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted" />
          <input
            type="text"
            placeholder='Search by specialty, employer, city, or state (e.g. "pulmonology Texas")'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-border bg-surface pl-12 pr-4 py-3.5 text-sm text-foreground placeholder:text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-xs font-medium text-muted hover:text-foreground hover:border-accent/50 transition-colors"
        >
          <Filter className="h-3.5 w-3.5" />
          Filters
          <ChevronDown className={`h-3 w-3 transition-transform ${showFilters ? "rotate-180" : ""}`} />
        </button>

        {/* Quick filter chips */}
        {[
          { label: "All", value: "all" },
          { label: "HPSA Only", value: "hpsa" },
          { label: "Cap-Exempt", value: "capexempt" },
        ].map((chip) => (
          <button
            key={chip.value}
            onClick={() => {
              if (chip.value === "hpsa") {
                setSearchQuery(searchQuery === "HPSA" ? "" : "");
              }
            }}
            className="rounded-lg border border-border bg-surface px-3 py-2 text-xs text-muted hover:text-foreground hover:border-accent/50 transition-colors"
          >
            {chip.label}
          </button>
        ))}

        {/* Active filter count */}
        {(selectedSpecialty !== "all" || selectedState !== "all" || selectedVisa !== "all") && (
          <button
            onClick={() => {
              setSelectedSpecialty("all");
              setSelectedState("all");
              setSelectedVisa("all");
            }}
            className="rounded-lg border border-danger/30 bg-danger/5 px-3 py-2 text-xs text-danger hover:bg-danger/10 transition-colors"
          >
            Clear filters
          </button>
        )}
      </div>

      {showFilters && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 p-4 rounded-xl border border-border bg-surface-alt">
          <div>
            <label className="block text-[10px] font-semibold text-muted uppercase tracking-wider mb-1.5">Specialty</label>
            <select
              value={selectedSpecialty}
              onChange={(e) => setSelectedSpecialty(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-xs text-foreground focus:outline-none focus:border-accent"
            >
              <option value="all">All Specialties</option>
              {specialties.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-muted uppercase tracking-wider mb-1.5">State</label>
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-xs text-foreground focus:outline-none focus:border-accent"
            >
              <option value="all">All States</option>
              {states.map((s) => (
                <option key={s} value={s}>{US_STATE_NAMES[s] || s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-muted uppercase tracking-wider mb-1.5">Visa Type</label>
            <select
              value={selectedVisa}
              onChange={(e) => setSelectedVisa(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-xs text-foreground focus:outline-none focus:border-accent"
            >
              <option value="all">All Visa Types</option>
              <option value="j1">J-1 Waiver</option>
              <option value="h1b">H-1B</option>
              <option value="greencard">Green Card Sponsorship</option>
            </select>
          </div>
        </div>
      )}

      {/* Results count */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-muted">
          <strong className="text-foreground">{filteredJobs.length}</strong> verified positions
          {selectedSpecialty !== "all" && <span> in <strong className="text-foreground">{selectedSpecialty}</strong></span>}
          {selectedState !== "all" && <span> in <strong className="text-foreground">{US_STATE_NAMES[selectedState]}</strong></span>}
        </p>
        <div className="flex items-center gap-1.5 text-[10px] text-success">
          <CheckCircle2 className="h-3 w-3" />
          All verified March 2026
        </div>
      </div>

      {/* Featured Jobs */}
      {featuredJobs.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xs font-semibold text-warning uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Star className="h-3.5 w-3.5" />
            Featured Positions
          </h2>
          <div className="space-y-3">
            {featuredJobs.map((job) => (
              <JobCard key={job.id} job={job} featured />
            ))}
          </div>
        </div>
      )}

      {/* Regular Jobs */}
      <div className="space-y-3">
        {regularJobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>

      {filteredJobs.length === 0 && (
        <div className="text-center py-12">
          <Search className="h-8 w-8 text-muted mx-auto mb-3" />
          <p className="text-sm text-foreground font-medium mb-1">No positions match your filters</p>
          <p className="text-xs text-muted">
            Try broadening your search or removing filters. We add new verified positions regularly.
          </p>
        </div>
      )}

      {/* Employer CTA */}
      <div className="mt-10 rounded-xl border border-accent/30 bg-accent/5 p-6 text-center">
        <h3 className="text-base font-bold text-foreground mb-2">
          Your hospital not listed? Post directly.
        </h3>
        <p className="text-xs text-muted mb-4 max-w-lg mx-auto">
          If you&apos;re a hospital, clinic, or authorized recruiter with J-1 waiver
          positions, post directly on USCEHub. From $249/listing. Reach physicians
          actively searching for waiver-eligible positions.
        </p>
        <Link
          href="/career/employers"
          className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-accent/90 transition-colors"
        >
          Post a Position
        </Link>
      </div>
    </div>
  );
}

function JobCard({ job, featured }: { job: WaiverJob; featured?: boolean }) {
  const visaLabel = job.visaTypes.includes("both")
    ? "J-1 + H-1B"
    : job.visaTypes.includes("j1")
    ? "J-1 Waiver"
    : job.visaTypes.includes("h1b")
    ? "H-1B"
    : "Green Card";

  return (
    <div
      className={`rounded-xl border bg-surface p-5 transition-all hover:shadow-lg ${
        featured ? "border-warning/40 bg-warning/[0.02]" : "border-border hover:border-accent/30"
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start gap-4">
        {/* Left: Job info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h3 className="text-sm font-bold text-foreground">{job.employer}</h3>
            {featured && (
              <span className="rounded-full bg-warning/10 px-2 py-0.5 text-[9px] font-bold text-warning">FEATURED</span>
            )}
            {job.capExempt && (
              <span className="rounded-full bg-success/10 px-2 py-0.5 text-[9px] font-bold text-success">CAP-EXEMPT</span>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs text-muted mb-2 flex-wrap">
            <span className="flex items-center gap-1">
              <Briefcase className="h-3 w-3" />
              {job.specialty}
              {job.subspecialty && <span className="text-muted"> · {job.subspecialty}</span>}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {job.city}, {job.state}
            </span>
          </div>

          <p className="text-xs text-muted mb-3 line-clamp-2">{job.description}</p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1.5">
            <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-medium text-accent">
              {visaLabel}
            </span>
            {job.hpsa && (
              <span className="rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-medium text-success flex items-center gap-0.5">
                <Shield className="h-2.5 w-2.5" />
                HPSA
              </span>
            )}
            {job.waiverPathways && job.waiverPathways.map((p) => (
              <span key={p} className="rounded-full bg-surface-alt border border-border px-2 py-0.5 text-[10px] text-muted">
                {p}
              </span>
            ))}
            {job.schedule && (
              <span className="rounded-full bg-surface-alt border border-border px-2 py-0.5 text-[10px] text-muted flex items-center gap-0.5">
                <Clock className="h-2.5 w-2.5" />
                {job.schedule}
              </span>
            )}
          </div>
        </div>

        {/* Right: Salary + Action */}
        <div className="sm:text-right shrink-0">
          {(job.salaryMin || job.salaryMax) ? (
            <div className="text-lg font-bold text-success font-mono">
              {formatSalary(job.salaryMin, job.salaryMax)}
            </div>
          ) : (
            <div className="text-xs text-muted">Contact for salary</div>
          )}
          {job.signOnBonus && (
            <div className="text-xs text-warning font-medium">
              +${(job.signOnBonus / 1000).toFixed(0)}K sign-on
            </div>
          )}
          {job.salaryNote && (
            <p className="text-[10px] text-muted mt-1 max-w-[200px] sm:ml-auto">{job.salaryNote}</p>
          )}

          <a
            href={job.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent hover:bg-accent/20 transition-colors"
          >
            View & Apply <ExternalLink className="h-3 w-3" />
          </a>

          <div className="mt-2 flex items-center gap-1 text-[9px] text-muted sm:justify-end">
            <CheckCircle2 className="h-2.5 w-2.5 text-success" />
            Verified {job.lastVerified} · {job.sourceName}
          </div>
        </div>
      </div>
    </div>
  );
}
