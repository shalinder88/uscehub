"use client";

import { useState, useMemo } from "react";
import {
  Search,
  GraduationCap,
  MapPin,
  ShieldCheck,
  CheckCircle,
  Info,
} from "lucide-react";
import {
  SAMPLE_FELLOWSHIPS,
  FELLOWSHIP_SPECIALTIES,
  FELLOWSHIP_STATES,
} from "@/lib/residency-data";

export function FellowshipBrowser() {
  const [specialty, setSpecialty] = useState("");
  const [state, setState] = useState("");
  const [visaOnly, setVisaOnly] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    return SAMPLE_FELLOWSHIPS.filter((f) => {
      if (specialty && f.specialty !== specialty) return false;
      if (state && f.state !== state) return false;
      if (visaOnly && !f.visaSponsorship) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          f.programName.toLowerCase().includes(q) ||
          f.institution.toLowerCase().includes(q) ||
          f.specialty.toLowerCase().includes(q) ||
          f.city.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [specialty, state, visaOnly, search]);

  return (
    <>
      {/* Coming Soon Banner */}
      <div className="rounded-xl border border-accent/30 bg-accent/5 p-4 mb-8 flex items-start gap-3">
        <Info className="h-5 w-5 text-accent shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-foreground">
            Database in development
          </p>
          <p className="text-sm text-muted mt-1">
            We are building the most comprehensive fellowship database for IMGs
            and all residents. The programs below are sample entries. Full
            database launching soon with 1,000+ programs.
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="rounded-xl border border-border bg-surface p-4 mb-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Specialty */}
          <div>
            <label
              htmlFor="specialty"
              className="block text-xs font-medium text-muted mb-1"
            >
              Specialty
            </label>
            <select
              id="specialty"
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface-alt px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="">All specialties</option>
              {FELLOWSHIP_SPECIALTIES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* State */}
          <div>
            <label
              htmlFor="state"
              className="block text-xs font-medium text-muted mb-1"
            >
              State
            </label>
            <select
              id="state"
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="w-full rounded-lg border border-border bg-surface-alt px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="">All states</option>
              {FELLOWSHIP_STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div>
            <label
              htmlFor="search"
              className="block text-xs font-medium text-muted mb-1"
            >
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
              <input
                id="search"
                type="text"
                placeholder="Program or institution..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface-alt pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
          </div>

          {/* Visa Toggle */}
          <div className="flex items-end">
            <button
              type="button"
              onClick={() => setVisaOnly(!visaOnly)}
              className={`
                w-full rounded-lg border px-3 py-2 text-sm font-medium transition-colors
                ${
                  visaOnly
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-border bg-surface-alt text-muted hover:text-foreground"
                }
              `}
            >
              <ShieldCheck className="inline h-4 w-4 mr-1.5" />
              Visa Sponsorship
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      {filtered.length === 0 ? (
        <div className="text-center py-16">
          <GraduationCap className="h-12 w-12 text-muted mx-auto mb-4" />
          <p className="text-lg font-medium text-foreground">
            No programs match your filters
          </p>
          <p className="text-sm text-muted mt-1">
            Try adjusting your search criteria or clearing filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((program) => (
            <div
              key={program.id}
              className="rounded-xl border border-border bg-surface p-6 hover-glow"
            >
              <h3 className="text-base font-semibold text-foreground">
                {program.programName}
              </h3>
              <p className="text-sm text-muted mt-1">{program.institution}</p>

              <div className="mt-3 flex items-center gap-2 text-sm text-muted">
                <MapPin className="h-4 w-4" />
                {program.city}, {program.state}
              </div>

              <div className="mt-4 flex items-center gap-2 flex-wrap">
                <span className="inline-flex rounded-full px-3 py-1 text-xs font-medium bg-accent/10 text-accent">
                  {program.specialty}
                </span>
                {program.visaSponsorship && (
                  <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium bg-success/10 text-success">
                    <ShieldCheck className="h-3 w-3" />
                    Visa Sponsorship
                  </span>
                )}
                {program.matchParticipation && (
                  <span className="inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium bg-cyan/10 text-cyan">
                    <CheckCircle className="h-3 w-3" />
                    NRMP Match
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-center text-xs text-muted mt-8">
        Showing {filtered.length} of {SAMPLE_FELLOWSHIPS.length} sample programs
      </p>
    </>
  );
}
