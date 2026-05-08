import type { Metadata } from "next";
import { siteUrl } from "@/lib/site-config";
import { PilotClerkshipListings } from "./PilotClerkshipListings";
import {
  PILOT_TOTAL_COUNT,
  PILOT_IMG_RELEVANT_COUNT,
  PILOT_US_ONLY_COUNT,
} from "@/lib/usce-pilot-data";

export const metadata: Metadata = {
  title: "USCE Pilot Listings — Source-Reviewed Preview",
  description:
    "A small noindex preview of source-reviewed clinical-experience listings covering selected programs only. Verify all details on the official source before applying.",
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: siteUrl("/clerkships/pilot"),
  },
};

export default function PilotClerkshipsPage() {
  return (
    <div className="bg-white dark:bg-slate-950">
      <div className="bg-slate-900 text-white">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-3 flex flex-wrap gap-2">
            <span className="inline-flex items-center rounded-full bg-amber-900/60 px-2.5 py-0.5 text-xs font-medium text-amber-200">
              Source-reviewed pilot · multi-state preview
            </span>
            <span className="inline-flex items-center rounded-full bg-slate-700 px-2.5 py-0.5 text-xs font-medium text-slate-300">
              {PILOT_TOTAL_COUNT} listings · {PILOT_IMG_RELEVANT_COUNT} open to international students per source · {PILOT_US_ONLY_COUNT} US MD/DO per source
            </span>
          </div>
          <h1 className="text-3xl font-bold sm:text-4xl">USCE Pilot Listings</h1>
          <p className="mt-4 text-base text-slate-400 leading-relaxed">
            A small set of clinical-experience listings reviewed against each program&apos;s official source page. Eligibility, fees, visa policies, and application rules are taken directly from the source on the date listed.
          </p>
          <p className="mt-3 text-xs text-slate-500 leading-relaxed">
            This pilot covers selected programs only. Listings appear here after explicit eligibility evidence is found on the institution&apos;s own program page. Always verify on the official source before applying. This page does not act as an application system.
          </p>
        </div>
      </div>

      <PilotClerkshipListings />
    </div>
  );
}
