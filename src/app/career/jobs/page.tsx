import type { Metadata } from "next";
import Link from "next/link";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { Briefcase, AlertTriangle, Building2, Clock, ArrowRight } from "lucide-react";
import { JobsSearch } from "./jobs-search";
import { getJobCount, getUniqueSpecialties } from "@/lib/waiver-jobs-data";

export const metadata: Metadata = {
  title: "J-1 Waiver Physician Jobs — Verified Positions — USCEHub",
  description:
    "Search verified J-1 waiver and H-1B physician jobs from real hospitals. Salary data, HPSA status, waiver pathway eligibility — all on one page. No stale data, no recruiter spam.",
  alternates: {
    canonical: "https://uscehub.com/career/jobs",
  },
  openGraph: {
    title: "J-1 Waiver Physician Jobs — USCEHub",
    description:
      "Verified physician positions with J-1 waiver and H-1B sponsorship. Real employers, real salaries, updated 3x daily.",
    url: "https://uscehub.com/career/jobs",
  },
};

export default function WaiverJobsPage() {
  const jobCount = getJobCount();
  const specialtyCount = getUniqueSpecialties().length;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="rounded-lg bg-accent/10 p-2.5">
            <Briefcase className="h-6 w-6 text-accent" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              J-1 Waiver Physician Jobs
            </h1>
            <p className="text-xs text-muted mt-0.5">
              {jobCount} verified positions · {specialtyCount} specialties · Updated 3x daily
            </p>
          </div>
        </div>
        <div className="mt-2">
          <VerifiedBadge
            date="March 2026"
            sources={["Hospital career pages", "DOL LCA Public Data", "Employer career sites"]}
          />
        </div>
      </div>

      {/* Section rail — the rest of the Jobs lane */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
        <Link
          href="/career/sponsors"
          className="rounded-xl border border-border bg-surface p-4 hover:border-accent/50 transition-colors group"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <Building2 className="h-5 w-5 text-accent shrink-0 mt-0.5" />
              <div>
                <h2 className="text-sm font-semibold text-foreground group-hover:text-accent transition-colors">
                  H-1B Sponsor Database
                </h2>
                <p className="text-xs text-muted mt-0.5">
                  Which hospitals actually sponsor H-1B physicians — verified employers.
                </p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-muted group-hover:text-accent transition-colors shrink-0" />
          </div>
        </Link>
        <Link
          href="/career/locums"
          className="rounded-xl border border-border bg-surface p-4 hover:border-accent/50 transition-colors group"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-accent shrink-0 mt-0.5" />
              <div>
                <h2 className="text-sm font-semibold text-foreground group-hover:text-accent transition-colors">
                  Locum Tenens
                </h2>
                <p className="text-xs text-muted mt-0.5">
                  Pay rates, agencies, visa limits, and 1099 tax strategy.
                </p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-muted group-hover:text-accent transition-colors shrink-0" />
          </div>
        </Link>
      </div>

      {/* $100K H-1B Fee Alert */}
      <div className="rounded-lg border border-danger/30 bg-danger/5 p-3 mb-6 flex items-start gap-2">
        <AlertTriangle className="h-4 w-4 text-danger shrink-0 mt-0.5" />
        <p className="text-xs text-muted">
          <strong className="text-foreground">$100K H-1B Fee Alert:</strong>{" "}
          Proclamation 10973 (Sept 2025) adds $100K to new H-1B petitions requiring
          consular processing. Does NOT apply to change-of-status or extensions.
          Physician exemption bill introduced. Some smaller employers reducing sponsorship.
        </p>
      </div>

      {/* Job Search UI */}
      <JobsSearch />
    </div>
  );
}
