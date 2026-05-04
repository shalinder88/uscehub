import type { Metadata } from "next";
import { siteUrl } from "@/lib/site-config";
import { ClerkshipListings } from "./ClerkshipListings";
import { USCE_MAINE_CARDS } from "@/lib/usce-maine-data";

export const metadata: Metadata = {
  title: "Elective Clerkships in Maine",
  description:
    "Source-verified elective clerkship and sub-internship programs in Maine. Eligibility clearly labeled for international medical students, IMGs, and US MD/DO students.",
  alternates: {
    canonical: siteUrl("/clerkships/maine"),
  },
  openGraph: {
    title: "Elective Clerkships in Maine — USCEHub",
    description:
      "12 verified clerkship programs in Maine with explicit eligibility labels for IMGs and international students.",
    url: siteUrl("/clerkships/maine"),
  },
};

const imgCount = USCE_MAINE_CARDS.filter(
  (c) => c.display_bucket === "READY_PUBLIC_IMG_RELEVANT"
).length;
const usCount = USCE_MAINE_CARDS.filter(
  (c) => c.display_bucket === "READY_PUBLIC_US_STUDENT_ONLY"
).length;

export default function MaineClerkshipsPage() {
  return (
    <div className="bg-white dark:bg-slate-950">
      {/* Hero */}
      <div className="bg-slate-900 text-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Maine · Pilot cohort
            </p>
            <h1 className="text-3xl font-bold sm:text-4xl">
              Elective Clerkships in Maine
            </h1>
            <p className="mt-4 text-base text-slate-400 leading-relaxed">
              {USCE_MAINE_CARDS.length} source-verified programs.{" "}
              <span className="text-emerald-400 font-medium">{imgCount} open to international students</span>
              {" · "}
              <span className="text-slate-300">{usCount} US MD/DO only</span>.
              Eligibility derived from official program pages, not inferred.
            </p>
          </div>
        </div>
      </div>

      <ClerkshipListings />
    </div>
  );
}
