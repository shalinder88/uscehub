import type { Metadata } from "next";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import { Briefcase, AlertTriangle } from "lucide-react";
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
            sources={["Hospital career pages", "PracticeLink", "PracticeMatch", "Sound Physicians", "USACS"]}
          />
        </div>
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
