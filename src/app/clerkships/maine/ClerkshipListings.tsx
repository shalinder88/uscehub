"use client";

import { useState } from "react";
import Link from "next/link";
import { ExternalLink, AlertCircle, CheckCircle2, XCircle, HelpCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { USCE_MAINE_CARDS, SPECIALTY_LABELS, NEEDS_REVIEW_COUNT, type UsceCard } from "@/lib/usce-maine-data";

type Filter = "all" | "img_relevant" | "us_only";

const FILTER_LABELS: Record<Filter, string> = {
  all: "All programs",
  img_relevant: "International-eligible",
  us_only: "US MD/DO only",
};

function specialtyLabel(s: string) {
  return SPECIALTY_LABELS[s] ?? s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function AudienceRow({ label, status }: { label: string; status: string }) {
  const isEligible = status === "ELIGIBLE_EXPLICIT";
  const isExcluded = status === "EXCLUDED_EXPLICIT";
  const isUnknown = status === "UNKNOWN_NOT_STATED";

  return (
    <div className="flex items-center gap-2 text-xs">
      {isEligible && <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />}
      {isExcluded && <XCircle className="h-3.5 w-3.5 shrink-0 text-red-500" />}
      {isUnknown && <HelpCircle className="h-3.5 w-3.5 shrink-0 text-amber-500" />}
      <span
        className={
          isEligible
            ? "text-emerald-700 dark:text-emerald-400"
            : isExcluded
            ? "text-red-700 dark:text-red-400 line-through"
            : "text-amber-700 dark:text-amber-400"
        }
      >
        {label}
      </span>
      {isUnknown && (
        <span className="text-slate-400 dark:text-slate-500 normal-case">— not stated by program</span>
      )}
    </div>
  );
}

function ClerkshipCard({ card }: { card: UsceCard }) {
  const isImgRelevant = card.display_bucket === "READY_PUBLIC_IMG_RELEVANT";
  const hasVslo = card.restriction_tags.includes("VSLO_REQUIRED");

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-white leading-snug">
            {specialtyLabel(card.specialty)}
          </p>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            {card.opportunity_type}
            {hasVslo && (
              <span className="ml-2 inline-flex items-center gap-1 rounded bg-amber-100 dark:bg-amber-900/30 px-1.5 py-0.5 text-amber-700 dark:text-amber-400 font-medium">
                VSLO required
              </span>
            )}
          </p>
        </div>
        {isImgRelevant ? (
          <Badge variant="success" className="shrink-0 whitespace-nowrap">Intl. eligible</Badge>
        ) : (
          <Badge variant="warning" className="shrink-0 whitespace-nowrap">US MD/DO only</Badge>
        )}
      </div>

      {/* Audience detail */}
      <div className="flex flex-col gap-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 px-3 py-2.5">
        <AudienceRow label="US MD/DO student" status={card.audience_detail.us_md_do} />
        <AudienceRow label="International med student" status={card.audience_detail.international_student} />
        <AudienceRow label="IMG graduate" status={card.audience_detail.img_graduate} />
        <AudienceRow label="Caribbean-school student" status={card.audience_detail.caribbean_student} />
      </div>

      {/* Footer: links */}
      <div className="flex flex-wrap items-center gap-2 pt-1">
        {card.application_url ? (
          <a
            href={card.application_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 dark:bg-slate-100 px-3 py-1.5 text-xs font-medium text-white dark:text-slate-900 hover:bg-slate-700 dark:hover:bg-slate-200 transition-colors"
          >
            Apply
            <ExternalLink className="h-3 w-3" />
          </a>
        ) : null}
        <a
          href={card.official_source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-600 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          Program page
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
}

interface InstitutionGroupProps {
  name: string;
  city: string;
  cards: UsceCard[];
  note?: React.ReactNode;
}

function InstitutionGroup({ name, city, cards, note }: InstitutionGroupProps) {
  return (
    <section>
      <div className="mb-4">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">{name}</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">{city}</p>
        {note && <div className="mt-2">{note}</div>}
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <ClerkshipCard key={card.listing_id} card={card} />
        ))}
      </div>
    </section>
  );
}

export function ClerkshipListings() {
  const [filter, setFilter] = useState<Filter>("all");

  const imgCards = USCE_MAINE_CARDS.filter((c) => c.display_bucket === "READY_PUBLIC_IMG_RELEVANT");
  const usCards = USCE_MAINE_CARDS.filter((c) => c.display_bucket === "READY_PUBLIC_US_STUDENT_ONLY");

  const showImg = filter === "all" || filter === "img_relevant";
  const showUs = filter === "all" || filter === "us_only";

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Filter tabs */}
      <div className="mb-8 flex flex-wrap gap-2">
        {(["all", "img_relevant", "us_only"] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              filter === f
                ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900"
                : "border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            {FILTER_LABELS[f]}
            <span className="ml-2 text-xs opacity-70">
              {f === "all"
                ? USCE_MAINE_CARDS.length
                : f === "img_relevant"
                ? imgCards.length
                : usCards.length}
            </span>
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-12">
        {/* CMHC — international-eligible */}
        {showImg && (
          <InstitutionGroup
            name="Central Maine Medical Center (CMHC)"
            city="Lewiston, ME — Androscoggin County"
            cards={imgCards}
            note={
              <div className="flex items-start gap-2 rounded-lg border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-2 text-xs text-emerald-800 dark:text-emerald-300">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>
                  International medical students explicitly accepted. Apply via a single Smartsheet form
                  for all specialties. IMG graduate eligibility is not stated on program pages — contact
                  the program directly to confirm.
                </span>
              </div>
            }
          />
        )}

        {/* MMC — US only */}
        {showUs && (
          <InstitutionGroup
            name="Maine Medical Center (MMC)"
            city="Portland, ME — Cumberland County"
            cards={usCards}
            note={
              <div className="flex items-start gap-2 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 px-3 py-2 text-xs text-red-800 dark:text-red-300">
                <XCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <span>
                  LCME/AOA-accredited US medical schools only. Rotations route through the MMC VSLO hub
                  (me-001). International students, IMG graduates, and Caribbean-school students are
                  excluded by hub policy.
                </span>
              </div>
            }
          />
        )}
      </div>

      {/* Under-review notice */}
      <div className="mt-12 flex items-start gap-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-5 py-4 text-sm text-slate-600 dark:text-slate-400">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
        <p>
          <span className="font-medium text-slate-700 dark:text-slate-300">
            {NEEDS_REVIEW_COUNT} additional programs in Maine are under eligibility review
          </span>{" "}
          and will appear here once eligibility is confirmed. This includes several MMC specialties and
          Northern Light EMMC programs.
        </p>
      </div>

      {/* Methodology */}
      <div className="mt-8 border-t border-slate-100 dark:border-slate-800 pt-6 text-xs text-slate-400 dark:text-slate-500 space-y-1">
        <p>
          Eligibility classifications are derived from official program pages, sourced and reviewed on{" "}
          <span className="font-medium">2026-05-03</span>. Classifications reflect what is stated
          on each program page at time of review — they may not reflect unpublished policy.
        </p>
        <p>
          &ldquo;International student&rdquo; refers to currently-enrolled international medical students.
          IMG graduate eligibility (post-graduation) is tracked separately and defaults to{" "}
          <span className="italic">not stated</span> unless the program page explicitly confirms it.
        </p>
        <p>
          Source links open the original program pages. No data from NPI, CMS, or NPPES records
          appears on this page.
        </p>
      </div>
    </div>
  );
}
