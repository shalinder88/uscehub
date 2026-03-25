import type { Metadata } from "next";
import { CommunityTabs } from "./community-client";

export const metadata: Metadata = {
  title: "Resident Community",
  description:
    "Connect with fellow residents — discussions, rotation swap board, and resident-written articles. Join the USCEHub community.",
  alternates: {
    canonical: "https://uscehub.com/residency/community",
  },
  openGraph: {
    title: "Resident Community — USCEHub",
    description:
      "Discussions, rotation swap board, and resident-written articles for all residents.",
    url: "https://uscehub.com/residency/community",
  },
};

export default function CommunityPage() {
  return (
    <div className="py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-foreground">
            Resident Community
          </h1>
          <p className="mt-2 text-lg text-muted max-w-3xl">
            Connect with fellow residents, swap rotations, and share knowledge.
            Our community features are launching soon.
          </p>
        </div>

        <CommunityTabs />
      </div>
    </div>
  );
}
