import type { Metadata } from "next";
import { FellowshipBrowser } from "./fellowship-client";
import { VerifiedBadge } from "@/components/ui/verified-badge";

export const metadata: Metadata = {
  title: "Fellowship Database",
  description:
    "Browse fellowship programs with visa sponsorship and match participation data. Filter by specialty, state, or search by institution name.",
  alternates: {
    canonical: "https://uscehub.com/residency/fellowship",
  },
  openGraph: {
    title: "Fellowship Database — USCEHub",
    description:
      "Browse fellowship programs with visa sponsorship and match participation data.",
    url: "https://uscehub.com/residency/fellowship",
  },
};

export default function FellowshipPage() {
  return (
    <div className="py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">
            Fellowship Database
          </h1>
          <p className="mt-2 text-lg text-muted max-w-3xl">
            Browse fellowship programs with visa sponsorship and match
            participation data. Filter by specialty, state, or search by name.
          </p>
          <div className="mt-3">
            <VerifiedBadge date="May 2026" sources={["NRMP", "ACGME", "AMA FREIDA"]} />
          </div>
        </div>

        <FellowshipBrowser />
      </div>
    </div>
  );
}
