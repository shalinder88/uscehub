import { prisma } from "@/lib/prisma";
import { ListingCard } from "@/components/listings/listing-card";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export async function FeaturedListings() {
  const listings = await prisma.listing.findMany({
    where: { status: "APPROVED" },
    orderBy: [{ linkVerified: "desc" }, { views: "desc" }],
    take: 6,
    include: {
      reviews: {
        where: { moderationStatus: "APPROVED" },
        select: { overallRating: true },
      },
    },
  });

  if (listings.length === 0) return null;

  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Featured Opportunities
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Most viewed listings on the platform
            </p>
          </div>
          <Link
            href="/browse"
            className="hidden items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-900 sm:flex"
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
            className="inline-flex items-center gap-1 text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            View all opportunities
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
