"use client";

import { useState } from "react";
import Link from "next/link";

const applicantSteps = [
  {
    title: "Filter by what matters",
    description:
      "Specialty, state, fee range, visa note, time of year. Results prioritize source-linked, recently reviewed listings — across hundreds of institutions, refreshed every cron cycle so the link you click is the link the institution actually uses.",
  },
  {
    title: "Apply on the institution's terms",
    description:
      "We don't broker; we point. Each listing carries a verified primary source, contact path, and any application materials the program requires. Save what you're chasing, compare cost and visa posture side by side, plan a realistic rotation calendar.",
  },
  {
    title: "Rotate, then leave a record",
    description:
      "Complete your rotation, write a moderated review, and add to the public ledger so the next applicant sees what you saw. Reviews are separated from source verification — we don't conflate hearsay with policy.",
  },
];

const institutionSteps = [
  {
    title: "Establish your verified profile",
    description:
      "Register your hospital, clinic, or research center and verify NPI credentials. Your profile becomes the canonical source — applicants see your link, your fee schedule, your contact path, and the date you last reviewed it.",
  },
  {
    title: "Publish detailed listings",
    description:
      "Specify eligibility, costs, duration, USMLE step requirements, and what applicants can expect on day one. Listings carry an explicit source-status badge so candidates know your link is current and your terms are real.",
  },
  {
    title: "Receive serious inbound",
    description:
      "Direct applicants to your preferred application method — ERAS, VSLO, internal portal, or email. Filters mean only relevant candidates click through, which cuts inbound noise compared to general listing boards.",
  },
];

const SERIF =
  "Charter, 'Iowan Old Style', 'New York', 'Source Serif Pro', ui-serif, Georgia, serif";

// HowItWorks — paired with TrustSection. Same warm panel tint (#f0e9d3) so
// the two read as one trust band breaking from the paper Featured section
// above. Audience tabs let visitors flip between Applicants and Institutions
// without leaving the homepage; the active tab also links through to the
// dedicated /for-institutions page for the deep flow.
export function HowItWorks() {
  const [audience, setAudience] = useState<"applicants" | "institutions">("applicants");
  const steps = audience === "applicants" ? applicantSteps : institutionSteps;
  const deepLink = audience === "applicants" ? "/browse" : "/for-institutions";
  const deepLabel = audience === "applicants" ? "Browse opportunities" : "For institutions & physicians";

  return (
    <section className="border-y border-[#dfd5b8] bg-[#f0e9d3] py-20 dark:border-[#34373f] dark:bg-[#23262e]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-10 max-w-2xl text-center">
          <p className="mb-3 font-mono text-[10.5px] font-medium uppercase tracking-[0.22em] text-[#1a5454] dark:text-[#0fa595]">
            — How it works —
          </p>
          <h2
            className="font-serif text-3xl font-normal tracking-tight text-[#0d1418] dark:text-[#f7f5ec] sm:text-[36px]"
            style={{ fontFamily: SERIF, letterSpacing: "-0.022em" }}
          >
            How USCEHub <em className="italic font-medium text-[#1a5454] dark:text-[#0fa595]">works</em>
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-[14.5px] leading-snug text-[#4a5057] dark:text-[#bfc1c9]">
            A directory, not a placement service. We don&apos;t apply for you — we make sure every link works.
          </p>
        </div>

        {/* Audience toggle — segmented control. Active tab is a link
            through to the deep page; inactive tab is a button that
            flips the local state. */}
        <div className="mx-auto mb-10 flex max-w-md items-center justify-center">
          <div className="inline-flex rounded-full border border-[#dfd5b8] bg-[#fcf9eb] p-1 shadow-sm dark:border-[#34373f] dark:bg-[#23262e]">
            <button
              type="button"
              onClick={() => setAudience("applicants")}
              aria-pressed={audience === "applicants"}
              className={`rounded-full px-5 py-1.5 font-mono text-[10.5px] font-semibold uppercase tracking-[0.18em] transition-colors ${
                audience === "applicants"
                  ? "bg-[#0d1418] text-[#fcf9eb] dark:bg-[#f7f5ec] dark:text-[#0d1418]"
                  : "text-[#4a5057] hover:text-[#0d1418] dark:text-[#bfc1c9] dark:hover:text-[#f7f5ec]"
              }`}
            >
              For applicants
            </button>
            <button
              type="button"
              onClick={() => setAudience("institutions")}
              aria-pressed={audience === "institutions"}
              className={`rounded-full px-5 py-1.5 font-mono text-[10.5px] font-semibold uppercase tracking-[0.18em] transition-colors ${
                audience === "institutions"
                  ? "bg-[#0d1418] text-[#fcf9eb] dark:bg-[#f7f5ec] dark:text-[#0d1418]"
                  : "text-[#4a5057] hover:text-[#0d1418] dark:text-[#bfc1c9] dark:hover:text-[#f7f5ec]"
              }`}
            >
              For institutions
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-x-10 gap-y-8 lg:grid-cols-3">
          {steps.map((step, index) => {
            const num = String(index + 1).padStart(2, "0");
            const kicker = step.title.split(/[\s&]/)[0].toUpperCase();
            const dropCap = audience === "applicants" && index === 0 ? " drop-cap" : "";
            return (
              <div key={step.title}>
                <p className="mb-2 font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[#1a5454] dark:text-[#0fa595]">
                  Step {num} <span className="mx-1 text-[#7a7f88] dark:text-[#7e8089]">·</span> {kicker}
                </p>
                <h4
                  className="mb-2 font-serif text-xl font-semibold leading-tight text-[#0d1418] dark:text-[#f7f5ec]"
                  style={{ fontFamily: SERIF }}
                >
                  {step.title}
                </h4>
                <p className={`text-sm leading-relaxed text-[#4a5057] dark:text-[#bfc1c9]${dropCap}`}>
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-10 flex justify-center">
          <Link
            href={deepLink}
            className="inline-flex items-center gap-2 rounded-full border border-[#1a5454] px-5 py-2 font-mono text-[10.5px] font-semibold uppercase tracking-[0.16em] text-[#1a5454] transition-colors hover:bg-[#1a5454] hover:text-white dark:border-[#0fa595] dark:text-[#0fa595] dark:hover:bg-[#0fa595] dark:hover:text-[#0d1418]"
          >
            {deepLabel}
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
