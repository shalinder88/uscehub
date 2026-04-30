import { prisma } from "@/lib/prisma";
import {
  Building2,
  BadgeCheck,
  MapPin,
  DollarSign,
  Stethoscope,
  FlaskConical,
  GraduationCap,
  TrendingUp,
} from "lucide-react";

export async function ProgramStats() {
  const [
    totalListings,
    listingsWithOfficialSource,
    stateData,
    observerships,
    externships,
    research,
    allListings,
    freeListings,
  ] = await Promise.all([
    prisma.listing.count({ where: { status: "APPROVED" } }),
    // Phase 3.9 trust language: this count is broad — it includes the
    // legacy backfilled rows whose URL is on file but has not been
    // freshly cron-verified. Labeled accordingly in the highlights
    // grid below ("Official Source on File", not "Verified Programs").
    prisma.listing.count({
      where: { status: "APPROVED", linkVerified: true },
    }),
    prisma.listing.findMany({
      where: { status: "APPROVED" },
      select: { state: true },
      distinct: ["state"],
    }),
    prisma.listing.count({
      where: { status: "APPROVED", listingType: "OBSERVERSHIP" },
    }),
    prisma.listing.count({
      where: { status: "APPROVED", listingType: "EXTERNSHIP" },
    }),
    prisma.listing.count({
      where: {
        status: "APPROVED",
        listingType: { in: ["RESEARCH", "POSTDOC"] },
      },
    }),
    prisma.listing.findMany({
      where: { status: "APPROVED" },
      select: { state: true },
    }),
    prisma.listing.count({
      where: {
        status: "APPROVED",
        OR: [
          { cost: { contains: "Free" } },
          { cost: { contains: "free" } },
          { cost: { contains: "$0" } },
          { cost: { contains: "No fee" } },
        ],
      },
    }),
  ]);

  // Calculate top states
  const stateCounts: Record<string, number> = {};
  allListings.forEach((l) => {
    if (l.state) stateCounts[l.state] = (stateCounts[l.state] || 0) + 1;
  });
  const topStates = Object.entries(stateCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const highlights = [
    {
      icon: Building2,
      label: "Total Programs",
      value: totalListings.toString(),
    },
    {
      icon: BadgeCheck,
      label: "Programs with Official Source",
      value: listingsWithOfficialSource.toString(),
    },
    {
      icon: MapPin,
      label: "States Covered",
      value: stateData.length.toString(),
    },
    {
      icon: DollarSign,
      label: "Free Programs",
      value: freeListings.toString(),
    },
  ];

  const typeBreakdown = [
    {
      icon: Stethoscope,
      label: "Observerships",
      value: observerships,
    },
    {
      icon: GraduationCap,
      label: "Externships",
      value: externships,
    },
    {
      icon: FlaskConical,
      label: "Research & Postdoc",
      value: research,
    },
  ];

  return (
    <section className="border-t border-[#dfd5b8] py-16 dark:border-[#34373f]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <p className="mb-3 font-mono text-[10.5px] font-medium uppercase tracking-[0.22em] text-[#1a5454] dark:text-[#0fa595]">
            — By the numbers —
          </p>
          <h2 className="font-serif text-3xl font-normal tracking-tight text-[#0d1418] dark:text-[#f7f5ec] sm:text-[36px]" style={{ fontFamily: "Charter, 'Iowan Old Style', 'Source Serif Pro', ui-serif, Georgia, serif", letterSpacing: "-0.022em" }}>
            USCEHub <em className="italic font-medium text-[#1a5454] dark:text-[#0fa595]">in figures</em>
          </h2>
          <p className="mt-2 text-sm italic text-[#4a5057] dark:text-[#bfc1c9]" style={{ fontFamily: "Charter, 'Iowan Old Style', 'Source Serif Pro', ui-serif, Georgia, serif" }}>
            Real-time statistics from the largest verified U.S. clinical experience database.
          </p>
        </div>

        {/* Key Stats Grid */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {highlights.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="group rounded-xl border border-[#dfd5b8] bg-[#fcf9eb] p-5 text-center shadow-plush shadow-plush-hover transition-all hover:-translate-y-0.5 dark:border-[#34373f] dark:bg-[#23262e]"
              >
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-[#dfd5b8] bg-[#f0e9d3] dark:border-[#34373f] dark:bg-[#2a2d36]">
                  <Icon className="h-5 w-5 text-[#1a5454] dark:text-[#0fa595]" />
                </div>
                <div className="font-serif text-3xl font-semibold tracking-tight text-[#0d1418] dark:text-[#f7f5ec]" style={{ fontFamily: "Charter, 'Iowan Old Style', 'Source Serif Pro', ui-serif, Georgia, serif" }}>
                  {stat.value}
                </div>
                <div className="mt-1 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-[#7a7f88] dark:text-[#bfc1c9]">
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* Type Breakdown and Top States */}
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Program Types */}
          <div className="rounded-xl border border-[#dfd5b8] bg-[#fcf9eb] p-6 shadow-plush dark:border-[#34373f] dark:bg-[#23262e]">
            <h3 className="mb-4 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-[#1a5454] dark:text-[#0fa595]">
              Programs by type
            </h3>
            <div className="space-y-3">
              {typeBreakdown.map((type) => {
                const Icon = type.icon;
                const percentage =
                  totalListings > 0
                    ? Math.round((type.value / totalListings) * 100)
                    : 0;
                return (
                  <div key={type.label} className="group/row -mx-2 flex cursor-pointer items-center gap-3 rounded px-2 py-1 transition-colors hover:bg-[#f0e9d3] dark:hover:bg-[#2a2d36]">
                    <Icon className="h-4 w-4 shrink-0 text-[#1a5454] dark:text-[#0fa595]" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-[#4a5057] dark:text-[#bfc1c9]">
                          {type.label}
                        </span>
                        <span className="font-mono text-sm font-semibold text-[#0d1418] dark:text-[#f7f5ec]">
                          {type.value}
                        </span>
                      </div>
                      <div className="mt-1 h-1.5 w-full rounded-full bg-[#f0e9d3] dark:bg-[#2a2d36]">
                        <div
                          className="h-1.5 rounded-full bg-[#1a5454] dark:bg-[#0fa595]"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 rounded-lg border border-[#dfd5b8] bg-[#f0e9d3] px-4 py-3 dark:border-[#34373f] dark:bg-[#2a2d36]">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-[#1a5454] dark:text-[#0fa595]" />
                <span className="text-xs text-[#4a5057] dark:text-[#bfc1c9]">
                  Average observership cost range:{" "}
                  <span className="font-semibold text-[#0d1418] dark:text-[#f7f5ec]">
                    Free – $2,500
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Top States */}
          <div className="rounded-xl border border-[#dfd5b8] bg-[#fcf9eb] p-6 shadow-plush dark:border-[#34373f] dark:bg-[#23262e]">
            <div className="mb-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-[#1a5454] dark:text-[#0fa595]" />
              <h3 className="font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-[#1a5454] dark:text-[#0fa595]">
                Most popular states for observerships
              </h3>
            </div>
            <div className="space-y-3">
              {topStates.map(([state, count], index) => {
                const maxCount = topStates[0][1] as number;
                const percentage =
                  maxCount > 0 ? Math.round((count / maxCount) * 100) : 0;
                return (
                  <div key={state} className="group/row -mx-2 flex cursor-pointer items-center gap-3 rounded px-2 py-1 transition-colors hover:bg-[#f0e9d3] dark:hover:bg-[#2a2d36]">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#dfd5b8] bg-[#f0e9d3] font-mono text-xs font-semibold text-[#4a5057] dark:border-[#34373f] dark:bg-[#2a2d36] dark:text-[#bfc1c9]">
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-[#4a5057] dark:text-[#bfc1c9]">{state}</span>
                        <span className="font-mono text-sm font-semibold text-[#0d1418] dark:text-[#f7f5ec]">
                          {count} programs
                        </span>
                      </div>
                      <div className="mt-1 h-1.5 w-full rounded-full bg-[#f0e9d3] dark:bg-[#2a2d36]">
                        <div
                          className="h-1.5 rounded-full bg-[#1a5454] dark:bg-[#0fa595]"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
