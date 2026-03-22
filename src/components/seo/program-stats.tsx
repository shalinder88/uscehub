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
    verifiedCount,
    stateData,
    observerships,
    externships,
    research,
    allListings,
    freeListings,
  ] = await Promise.all([
    prisma.listing.count({ where: { status: "APPROVED" } }),
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
      label: "Verified Programs",
      value: verifiedCount.toString(),
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
    <section className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-10 text-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white dark:text-white">
            USCEHub by the Numbers
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Real-time statistics from the largest IMG opportunities database
          </p>
        </div>

        {/* Key Stats Grid */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {highlights.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 text-center"
              >
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700">
                  <Icon className="h-5 w-5 text-slate-700" />
                </div>
                <div className="text-2xl font-bold text-slate-900 dark:text-white">
                  {stat.value}
                </div>
                <div className="mt-1 text-xs font-medium text-slate-500">
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* Type Breakdown and Top States */}
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Program Types */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
            <h3 className="mb-4 text-sm font-semibold text-slate-900 dark:text-slate-100">
              Programs by Type
            </h3>
            <div className="space-y-3">
              {typeBreakdown.map((type) => {
                const Icon = type.icon;
                const percentage =
                  totalListings > 0
                    ? Math.round((type.value / totalListings) * 100)
                    : 0;
                return (
                  <div key={type.label} className="flex items-center gap-3">
                    <Icon className="h-4 w-4 shrink-0 text-slate-500" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-700 dark:text-slate-300">
                          {type.label}
                        </span>
                        <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {type.value}
                        </span>
                      </div>
                      <div className="mt-1 h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-600">
                        <div
                          className="h-1.5 rounded-full bg-slate-700"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 rounded-lg bg-slate-50 dark:bg-slate-700 px-4 py-3">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-slate-500" />
                <span className="text-xs text-slate-600">
                  Average observership cost range:{" "}
                  <span className="font-semibold text-slate-900">
                    Free - $2,500
                  </span>
                </span>
              </div>
            </div>
          </div>

          {/* Top States */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
            <div className="mb-4 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-slate-500" />
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Most Popular States for Observerships
              </h3>
            </div>
            <div className="space-y-3">
              {topStates.map(([state, count], index) => {
                const maxCount = topStates[0][1] as number;
                const percentage =
                  maxCount > 0 ? Math.round((count / maxCount) * 100) : 0;
                return (
                  <div key={state} className="flex items-center gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-700 text-xs font-semibold text-slate-600">
                      {index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-700 dark:text-slate-300">{state}</span>
                        <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                          {count} programs
                        </span>
                      </div>
                      <div className="mt-1 h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-600">
                        <div
                          className="h-1.5 rounded-full bg-blue-500"
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
