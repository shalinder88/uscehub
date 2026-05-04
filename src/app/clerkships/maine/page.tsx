import type { Metadata } from "next";
import { siteUrl } from "@/lib/site-config";
import { ClerkshipListings } from "./ClerkshipListings";
import { USCE_MAINE_CARDS, IMG_RELEVANT_COUNT, US_ONLY_COUNT } from "@/lib/usce-maine-data";

export const metadata: Metadata = {
  title: "Elective Clerkships in Maine — Verified Pilot Listings",
  description:
    "Source-reviewed elective clerkship and sub-internship programs in Maine. Eligibility clearly labeled for international medical students, IMGs, and US MD/DO students. Pilot cohort — not a complete national database.",
  alternates: {
    canonical: siteUrl("/clerkships/maine"),
  },
  openGraph: {
    title: "Elective Clerkships in Maine — Verified Pilot",
    description:
      `${USCE_MAINE_CARDS.length} source-reviewed clerkship programs in Maine. ${IMG_RELEVANT_COUNT} open to international students. Eligibility derived from official program pages, not inferred.`,
    url: siteUrl("/clerkships/maine"),
  },
};

export default function MaineClerkshipsPage() {
  return (
    <div className="bg-white dark:bg-slate-950">
      {/* Hero */}
      <div className="bg-slate-900 text-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl">
            <div className="mb-3 flex flex-wrap gap-2">
              <span className="inline-flex items-center rounded-full bg-blue-900/60 px-2.5 py-0.5 text-xs font-medium text-blue-300">
                Verified pilot · Maine
              </span>
              <span className="inline-flex items-center rounded-full bg-slate-700 px-2.5 py-0.5 text-xs font-medium text-slate-300">
                {USCE_MAINE_CARDS.length} listings · source-reviewed
              </span>
            </div>
            <h1 className="text-3xl font-bold sm:text-4xl">
              Elective Clerkships in Maine
            </h1>
            <p className="mt-4 text-base text-slate-400 leading-relaxed">
              <span className="text-emerald-400 font-medium">{IMG_RELEVANT_COUNT} programs open to international students</span>
              {" · "}
              <span className="text-slate-300">{US_ONLY_COUNT} US MD/DO only</span>.{" "}
              Eligibility is derived from official program pages at time of source review — not inferred, not generalized.
            </p>
            <p className="mt-3 text-xs text-slate-500 leading-relaxed">
              This is a source-reviewed pilot cohort, not a complete national database. Listings
              appear here only after explicit eligibility evidence is found on the institution&apos;s
              own program page. Programs without confirmed eligibility are withheld until reviewed.
            </p>
          </div>
        </div>
      </div>

      <ClerkshipListings />
    </div>
  );
}
