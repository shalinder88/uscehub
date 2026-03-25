"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Briefcase,
  MapPin,
  DollarSign,
  Search,
  Star,
  Clock,
  Filter,
} from "lucide-react";

const SAMPLE_JOBS = [
  {
    id: 1,
    title: "Family Medicine Physician",
    employer: "Valley Community Health Center",
    city: "McAllen",
    state: "TX",
    specialty: "Family Medicine",
    waiverType: "J-1" as const,
    salaryMin: 220000,
    salaryMax: 260000,
    hpsaScore: 18,
    posted: "2 days ago",
    highlights: ["Loan Repayment", "Signing Bonus"],
  },
  {
    id: 2,
    title: "Internal Medicine — Outpatient",
    employer: "Appalachian Regional Healthcare",
    city: "Hazard",
    state: "KY",
    specialty: "Internal Medicine",
    waiverType: "J-1" as const,
    salaryMin: 240000,
    salaryMax: 280000,
    hpsaScore: 21,
    posted: "3 days ago",
    highlights: ["Green Card Support", "Rural Bonus"],
  },
  {
    id: 3,
    title: "Psychiatrist — Inpatient/Outpatient",
    employer: "Great Plains Health",
    city: "North Platte",
    state: "NE",
    specialty: "Psychiatry",
    waiverType: "J-1" as const,
    salaryMin: 280000,
    salaryMax: 320000,
    hpsaScore: 24,
    posted: "1 week ago",
    highlights: ["Loan Repayment", "CME Allowance"],
  },
  {
    id: 4,
    title: "OB/GYN Physician",
    employer: "Delta Health System",
    city: "Greenville",
    state: "MS",
    specialty: "OB/GYN",
    waiverType: "J-1" as const,
    salaryMin: 300000,
    salaryMax: 360000,
    hpsaScore: 19,
    posted: "5 days ago",
    highlights: ["Signing Bonus", "Housing Assistance"],
  },
  {
    id: 5,
    title: "Family Medicine — Rural Clinic",
    employer: "Michigan Primary Care Association",
    city: "Marquette",
    state: "MI",
    specialty: "Family Medicine",
    waiverType: "J-1" as const,
    salaryMin: 210000,
    salaryMax: 250000,
    hpsaScore: 16,
    posted: "1 week ago",
    highlights: ["Loan Repayment", "Green Card Support"],
  },
  {
    id: 6,
    title: "Hospitalist — H-1B Sponsor",
    employer: "Cleveland Clinic — Akron General",
    city: "Akron",
    state: "OH",
    specialty: "Internal Medicine",
    waiverType: "H-1B" as const,
    salaryMin: 260000,
    salaryMax: 300000,
    hpsaScore: 14,
    posted: "4 days ago",
    highlights: ["Academic Affiliation", "Green Card Support"],
  },
  {
    id: 7,
    title: "Pediatrician — Community Health",
    employer: "Bronx Community Health Network",
    city: "Bronx",
    state: "NY",
    specialty: "Pediatrics",
    waiverType: "J-1" as const,
    salaryMin: 200000,
    salaryMax: 240000,
    hpsaScore: 22,
    posted: "6 days ago",
    highlights: ["Loan Repayment", "Urban Underserved"],
  },
  {
    id: 8,
    title: "Emergency Medicine Physician",
    employer: "Southwest Indian Health Service",
    city: "Gallup",
    state: "NM",
    specialty: "Emergency Medicine",
    waiverType: "J-1" as const,
    salaryMin: 290000,
    salaryMax: 340000,
    hpsaScore: 25,
    posted: "3 days ago",
    highlights: ["Federal Benefits", "Loan Repayment"],
  },
  {
    id: 9,
    title: "General Surgeon — Rural Hospital",
    employer: "Ozarks Healthcare",
    city: "West Plains",
    state: "MO",
    specialty: "General Surgery",
    waiverType: "J-1" as const,
    salaryMin: 350000,
    salaryMax: 420000,
    hpsaScore: 20,
    posted: "1 week ago",
    highlights: ["Signing Bonus", "Relocation Package"],
  },
  {
    id: 10,
    title: "Cardiologist — H-1B Sponsor",
    employer: "University Health System",
    city: "San Antonio",
    state: "TX",
    specialty: "Cardiology",
    waiverType: "H-1B" as const,
    salaryMin: 380000,
    salaryMax: 450000,
    hpsaScore: 12,
    posted: "2 days ago",
    highlights: ["Academic Position", "Green Card Support"],
  },
];

const ALL_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY",
];

const SPECIALTIES = [
  "Family Medicine",
  "Internal Medicine",
  "Psychiatry",
  "Pediatrics",
  "OB/GYN",
  "General Surgery",
  "Emergency Medicine",
  "Cardiology",
];

function formatSalary(amount: number) {
  return `$${(amount / 1000).toFixed(0)}K`;
}

export default function JobsPage() {
  const [stateFilter, setStateFilter] = useState("");
  const [specialtyFilter, setSpecialtyFilter] = useState("");
  const [waiverFilter, setWaiverFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredJobs = useMemo(() => {
    return SAMPLE_JOBS.filter((job) => {
      if (stateFilter && job.state !== stateFilter) return false;
      if (specialtyFilter && job.specialty !== specialtyFilter) return false;
      if (waiverFilter && job.waiverType !== waiverFilter) return false;
      if (
        searchQuery &&
        !job.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !job.employer.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !job.city.toLowerCase().includes(searchQuery.toLowerCase())
      )
        return false;
      return true;
    });
  }, [stateFilter, specialtyFilter, waiverFilter, searchQuery]);

  return (
    <>
      <head>
        <title>Waiver Job Listings — USCEHub</title>
        <meta
          name="description"
          content="Browse J-1 waiver and H-1B physician job opportunities across the United States. Filter by state, specialty, and visa type."
        />
        <link
          rel="canonical"
          href="https://uscehub.com/career/jobs"
        />
      </head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
            Waiver Job Listings
          </h1>
          <p className="text-muted max-w-2xl">
            Browse J-1 waiver and H-1B sponsored physician positions. Filter by
            state, specialty, and visa type to find the right opportunity.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="rounded-xl border border-border bg-surface p-4 mb-8">
          <div className="flex items-center gap-2 mb-3 text-sm text-muted">
            <Filter className="h-4 w-4" />
            <span>Filter Jobs</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Search */}
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
              <input
                type="text"
                placeholder="Search jobs, employers, cities..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-border bg-background pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-muted focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
              />
            </div>

            {/* State */}
            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            >
              <option value="">All States</option>
              {ALL_STATES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            {/* Specialty */}
            <select
              value={specialtyFilter}
              onChange={(e) => setSpecialtyFilter(e.target.value)}
              className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            >
              <option value="">All Specialties</option>
              {SPECIALTIES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            {/* Waiver Type */}
            <select
              value={waiverFilter}
              onChange={(e) => setWaiverFilter(e.target.value)}
              className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            >
              <option value="">All Visa Types</option>
              <option value="J-1">J-1 Waiver</option>
              <option value="H-1B">H-1B</option>
            </select>
          </div>
        </div>

        {/* Results */}
        <div className="mb-4 text-sm text-muted">
          Showing {filteredJobs.length} of {SAMPLE_JOBS.length} positions
        </div>

        <div className="space-y-4 mb-12">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              className="rounded-xl border border-border bg-surface p-6 hover-glow"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <h3 className="text-base font-semibold text-foreground">
                      {job.title}
                    </h3>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-medium ${
                        job.waiverType === "J-1"
                          ? "bg-accent/10 text-accent"
                          : "bg-cyan/10 text-cyan"
                      }`}
                    >
                      {job.waiverType}
                    </span>
                  </div>
                  <p className="text-sm text-muted mb-2">{job.employer}</p>
                  <div className="flex items-center gap-4 text-sm text-muted flex-wrap">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {job.city}, {job.state}
                    </span>
                    <span className="flex items-center gap-1">
                      <Briefcase className="h-3.5 w-3.5" />
                      {job.specialty}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {job.posted}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {job.highlights.map((h) => (
                      <span
                        key={h}
                        className="rounded-full px-2 py-0.5 text-[10px] font-medium bg-success/10 text-success"
                      >
                        {h}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="sm:text-right shrink-0">
                  <div className="flex items-center gap-1 text-lg font-bold text-foreground">
                    <DollarSign className="h-4 w-4" />
                    {formatSalary(job.salaryMin)} - {formatSalary(job.salaryMax)}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted mt-1 sm:justify-end">
                    <Star className="h-3 w-3 text-warning" />
                    HPSA Score: {job.hpsaScore}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {filteredJobs.length === 0 && (
            <div className="rounded-xl border border-border bg-surface p-12 text-center">
              <Search className="h-8 w-8 text-muted mx-auto mb-3" />
              <h3 className="text-base font-semibold text-foreground mb-1">
                No jobs match your filters
              </h3>
              <p className="text-sm text-muted">
                Try adjusting your search criteria or removing filters.
              </p>
            </div>
          )}
        </div>

        {/* More jobs notice */}
        <div className="rounded-xl border border-border bg-surface-alt p-8 text-center">
          <Briefcase className="h-8 w-8 text-accent mx-auto mb-3" />
          <h3 className="text-lg font-bold text-foreground mb-2">
            More Jobs Coming Soon
          </h3>
          <p className="text-sm text-muted max-w-lg mx-auto">
            We are actively building partnerships with healthcare employers and
            recruitment firms across the country. Sign up to be notified when new
            positions are posted.
          </p>
          <Link
            href="/auth/signup"
            className="inline-flex items-center gap-2 mt-4 rounded-lg bg-accent px-6 py-2.5 text-sm font-medium text-white hover:bg-accent/90 transition-colors"
          >
            Get Notified
          </Link>
        </div>
      </div>
    </>
  );
}
