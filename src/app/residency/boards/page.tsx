import type { Metadata } from "next";
import { BoardsAccordion } from "./boards-client";
import { VerifiedBadge } from "@/components/ui/verified-badge";

export const metadata: Metadata = {
  title: "Board Exam Guides",
  description:
    "Comprehensive guides for major specialty board certifications — ABIM, ABFM, ABP, ABS, ABPsych, and ABPath. Exam format, study timeline, pass rates, and recommended resources.",
  alternates: {
    canonical: "https://uscehub.com/residency/boards",
  },
  openGraph: {
    title: "Board Exam Guides — USCEHub",
    description:
      "Guides for ABIM, ABFM, ABP, ABS, ABPsych, and ABPath board certifications.",
    url: "https://uscehub.com/residency/boards",
  },
};

export default function BoardsPage() {
  return (
    <div className="py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-foreground">
            Board Exam Guides
          </h1>
          <p className="mt-2 text-lg text-muted max-w-3xl">
            Comprehensive guides for major specialty board certifications. Each
            section covers exam format, study timeline, pass rates, and
            recommended preparation resources.
          </p>
          <div className="mt-3">
            <VerifiedBadge date="March 2026" sources={["ABIM", "ABFM", "ABP", "ABS", "ABPN", "ABPath"]} />
          </div>
        </div>

        <BoardsAccordion />
      </div>
    </div>
  );
}
