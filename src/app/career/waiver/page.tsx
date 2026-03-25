import type { Metadata } from "next";
import Link from "next/link";
import { MapPin, Clock, ArrowUpDown, ArrowRight } from "lucide-react";
import { WAIVER_STATES, type WaiverState } from "@/lib/waiver-data";

export const metadata: Metadata = {
  title: "J-1 Waiver State Guide — Conrad 30 Intelligence",
  description:
    "Comprehensive J-1 waiver guide for all 50 US states. Conrad 30 slot availability, processing times, specialty needs, and application tips for international medical graduates.",
  alternates: {
    canonical: "https://uscehub.com/career/waiver",
  },
  openGraph: {
    title: "J-1 Waiver State Guide — Conrad 30 Intelligence — USCEHub",
    description:
      "Comprehensive J-1 waiver guide for all 50 US states. Conrad 30 slots, timelines, and tips for IMGs.",
    url: "https://uscehub.com/career/waiver",
  },
};

function stateSlug(name: string) {
  return name.toLowerCase().replace(/\s+/g, "-");
}

function StateCard({ state }: { state: WaiverState }) {
  const slug = stateSlug(state.stateName);
  const totalSlots = state.conradSlots + state.flexSlots;

  return (
    <Link href={`/career/waiver/${slug}`} className="group">
      <div className="rounded-xl border border-border bg-surface p-5 hover-glow h-full flex flex-col">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="rounded-md bg-accent/10 px-2 py-1 text-xs font-bold text-accent">
              {state.stateCode}
            </span>
            <h3 className="text-sm font-semibold text-foreground">
              {state.stateName}
            </h3>
          </div>
          <ArrowRight className="h-3.5 w-3.5 text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>

        <div className="grid grid-cols-3 gap-3 mb-3 text-center">
          <div>
            <div className="text-lg font-bold text-foreground">
              {state.conradSlots}
            </div>
            <div className="text-[10px] text-muted uppercase tracking-wider">
              Conrad
            </div>
          </div>
          <div>
            <div className="text-lg font-bold text-cyan">
              {state.flexSlots}
            </div>
            <div className="text-[10px] text-muted uppercase tracking-wider">
              Flex
            </div>
          </div>
          <div>
            <div className="text-lg font-bold text-success">{totalSlots}</div>
            <div className="text-[10px] text-muted uppercase tracking-wider">
              Total
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-muted mt-auto">
          <Clock className="h-3 w-3" />
          <span>{state.processingTime}</span>
        </div>
      </div>
    </Link>
  );
}

export default function WaiverPage() {
  const statesArray = Object.values(WAIVER_STATES);

  // Default: sorted alphabetically
  const alphabetical = [...statesArray].sort((a, b) =>
    a.stateName.localeCompare(b.stateName)
  );

  // Sort by most total slots
  const bySlots = [...statesArray].sort(
    (a, b) =>
      b.conradSlots + b.flexSlots - (a.conradSlots + a.flexSlots) ||
      a.stateName.localeCompare(b.stateName)
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "J-1 Waiver State Guide — Conrad 30 Intelligence",
    description:
      "Comprehensive J-1 waiver guide for all 50 US states with Conrad 30 slot data, processing times, and application tips.",
    url: "https://uscehub.com/career/waiver",
    numberOfItems: statesArray.length,
    provider: {
      "@type": "Organization",
      name: "USCEHub",
      url: "https://uscehub.com",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero */}
        <div className="rounded-xl border border-border bg-surface p-8 sm:p-10 mb-10">
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-accent/10 p-3 shrink-0">
              <MapPin className="h-6 w-6 text-accent" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
                J-1 Waiver State Intelligence
              </h1>
              <p className="text-muted max-w-3xl">
                The Conrad State 30 program allows each US state to sponsor up
                to 30 J-1 physicians for a waiver of the two-year home residency
                requirement. Many states also have additional flex slots. Select
                a state below to view detailed Conrad 30 data, processing times,
                specialty needs, and application tips.
              </p>
            </div>
          </div>
        </div>

        {/* Sort Info */}
        <div className="flex items-center gap-2 mb-6 text-sm text-muted">
          <ArrowUpDown className="h-4 w-4" />
          <span>
            Showing all 50 states sorted alphabetically. States with more flex
            slots appear first when sorted by total slots.
          </span>
        </div>

        {/* States with most flex slots highlighted */}
        <div className="mb-10">
          <h2 className="text-xl font-bold text-foreground mb-4">
            Top States by Total Slots
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {bySlots.slice(0, 10).map((state) => (
              <StateCard key={state.stateCode} state={state} />
            ))}
          </div>
        </div>

        {/* All States Alphabetical */}
        <div>
          <h2 className="text-xl font-bold text-foreground mb-4">
            All 50 States
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {alphabetical.map((state) => (
              <StateCard key={state.stateCode} state={state} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
