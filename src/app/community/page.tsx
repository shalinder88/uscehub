import type { Metadata } from "next";
import { Users } from "lucide-react";
import { CommunityTabs } from "@/components/community/community-tabs";
import { BreadcrumbSchema } from "@/components/seo/breadcrumb-schema";

// PR 0e-fix: page softened to honest "Coming Soon" pattern matching
// /residency/community. Metadata + h1 no longer claim an active forum.
// `DiscussionForumPosting` JSON-LD removed (PR 0e audit C2). The page
// emits noindex until a real moderated community surface ships, so
// search engines cannot index a placeholder as a live forum (PR 0e
// audit H2). External community links (Reddit, SDN, etc.) remain — they
// are real third-party destinations, not USCEHub forum content.
export const metadata: Metadata = {
  title: "IMG Community — Coming Soon",
  description:
    "USCEHub's community features are being planned. For now, browse verified listings, use official IMG resources, and follow links to established external communities.",
  alternates: {
    canonical: "https://uscehub.com/community",
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function CommunityPage() {
  return (
    <div className="bg-white dark:bg-slate-950">
      <BreadcrumbSchema
        items={[
          { name: "Home", url: "https://uscehub.com" },
          { name: "Community", url: "https://uscehub.com/community" },
        ]}
      />
      <div className="bg-slate-900 text-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <Users className="mx-auto mb-4 h-10 w-10 text-blue-400" />
            <h1 className="text-3xl font-bold sm:text-4xl">IMG Community</h1>
            <p className="mt-3 text-base text-slate-400">
              Community features are being planned. Discussion boards, swap
              boards, and program suggestion intake are not live yet — they
              will launch only after moderation and safety controls are
              ready. For now, use the resources and external communities
              below.
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
        <CommunityTabs />
      </div>
    </div>
  );
}
