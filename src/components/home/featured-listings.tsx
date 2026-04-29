import { prisma } from "@/lib/prisma";
import { ListingCard } from "@/components/listings/listing-card";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export async function FeaturedListings() {
  // Prefer listings explicitly flagged `featured: true` (admin-curated for
  // USMLE-IMG credibility — LOR offered, academic sponsor, published Step
  // requirements). Fall back to most-viewed if fewer than 6 featured exist.
  const featured = await prisma.listing.findMany({
    where: { status: "APPROVED", featured: true },
    orderBy: [{ createdAt: "desc" }],
    take: 6,
    include: {
      reviews: {
        where: { moderationStatus: "APPROVED" },
        select: { overallRating: true },
      },
    },
  });

  let listings = featured;
  if (listings.length < 6) {
    const fallback = await prisma.listing.findMany({
      where: {
        status: "APPROVED",
        featured: false,
      },
      // Phase 3.7: prioritize freshly cron/admin-verified rows
      // (real lastVerifiedAt timestamp), then legacy verified-on-file,
      // then by views. Matches the badge precedence on cards.
      orderBy: [
        { lastVerifiedAt: { sort: "desc", nulls: "last" } },
        { linkVerified: "desc" },
        { views: "desc" },
      ],
      take: 6 - listings.length,
      include: {
        reviews: {
          where: { moderationStatus: "APPROVED" },
          select: { overallRating: true },
        },
      },
    });
    listings = [...listings, ...fallback];
  }

  if (listings.length === 0) return null;

  return (
    <section className="bg-white dark:bg-slate-950 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Featured Opportunities
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Hand-picked programs with the strongest USMLE Match credibility
            </p>
          </div>
          <Link
            href="/browse"
            className="hidden items-center gap-1 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white sm:flex"
          >
            View all
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>

        <div className="mt-6 text-center sm:hidden">
          <Link
            href="/browse"
            className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
          >
            View all opportunities
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
