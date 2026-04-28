import { prisma } from "@/lib/prisma";
import { Star, MapPin, DollarSign, ArrowRight } from "lucide-react";
import Link from "next/link";
import { LISTING_TYPE_LABELS } from "@/lib/utils";

export async function ProgramSpotlight() {
  const verifiedListings = await prisma.listing.findMany({
    where: { status: "APPROVED", linkVerified: true },
    select: {
      id: true,
      title: true,
      listingType: true,
      city: true,
      state: true,
      cost: true,
      shortDescription: true,
    },
  });

  if (verifiedListings.length === 0) return null;

  // Pick a pseudo-random listing based on the day. Date.now() is impure
  // by React-19 standards (react-hooks/purity) — but daily-rotation IS
  // the intended product behavior on this server component, and the
  // alternative (unstable_cache with revalidate: 86400) would change
  // SSR caching semantics for the surrounding listing fetch. Keeping
  // the call here and suppressing locally; future refactor candidate
  // if the SEO phase moves this off SSR.
  // eslint-disable-next-line react-hooks/purity
  const dayIndex = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  const listing = verifiedListings[dayIndex % verifiedListings.length];

  return (
    <section className="bg-white dark:bg-slate-900 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <div className="mb-3 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-amber-600">
            <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
            Featured Program
          </div>
          <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm transition-shadow hover:shadow-md">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-slate-900 dark:text-slate-100 dark:text-slate-100">{listing.title}</h3>
                <div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    {listing.city}, {listing.state}
                  </span>
                  <span className="flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    {listing.cost}
                  </span>
                  <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs font-medium text-slate-600 dark:text-slate-400 dark:text-slate-400">
                    {LISTING_TYPE_LABELS[listing.listingType] || listing.listingType}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-slate-600 dark:text-slate-400 dark:text-slate-400">
                  {listing.shortDescription}
                </p>
              </div>
            </div>
            <div className="mt-4">
              <Link
                href={`/listing/${listing.id}`}
                className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                Learn More
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
