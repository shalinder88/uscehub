import type { Metadata } from "next";
import { Users } from "lucide-react";
import { CommunityTabs } from "@/components/community/community-tabs";

export const metadata: Metadata = {
  title: "Community — USCEHub",
  description:
    "Connect with fellow IMGs, share experiences, and find support in the USCEHub community.",
};

export default function CommunityPage() {
  return (
    <div className="bg-white">
      <div className="bg-slate-900 text-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <Users className="mx-auto mb-4 h-10 w-10 text-blue-400" />
            <h1 className="text-3xl font-bold sm:text-4xl">IMG Community</h1>
            <p className="mt-3 text-base text-slate-400">
              Connect with fellow IMGs, share experiences, ask questions, and
              find the support you need on your journey.
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
