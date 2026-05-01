import { prisma } from "@/lib/prisma";
import { ListingCard } from "@/components/listings/listing-card";
import Link from "next/link";
import { ArrowRight, Star, DollarSign } from "lucide-react";
import { LISTING_TYPE_LABELS } from "@/lib/utils";

const SERIF =
  "Charter, 'Iowan Old Style', 'New York', 'Source Serif Pro', ui-serif, Georgia, serif";

// Top-cap accent matches ListingCard's hue map (teal / gold / coral) so the
// spotlight visually belongs to the grid below it.
function spotlightAccent(type: string): string {
  const t = (type || "").toUpperCase();
  if (t === "RESEARCH" || t === "POSTDOC") {
    return "border-t-[3px] border-t-[#a87b2e] dark:border-t-[#d8a978]";
  }
  if (t === "VOLUNTEER") {
    return "border-t-[3px] border-t-[#9c3a2c] dark:border-t-[#e7958a]";
  }
  return "border-t-[3px] border-t-[#1a5454] dark:border-t-[#0fa595]";
}

// P1-2B: ProgramSpotlight + FeaturedListings combined into one editorial
// section per user feedback ("Keep spotlight above the featured listing
// but in the featured listing"). Section is transparent — only MatchCounter
// uses panel-tint elsewhere; warm paper texture flows through here.
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

  // Spotlight: pseudo-random verified listing rotated daily.
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
  // eslint-disable-next-line react-hooks/purity
  const dayIndex = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  const spotlight =
    verifiedListings.length > 0
      ? verifiedListings[dayIndex % verifiedListings.length]
      : null;

  if (listings.length === 0 && !spotlight) return null;

  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rule-double mb-8 pt-4" />
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="mb-2 font-mono text-[10.5px] font-medium uppercase tracking-[0.22em] text-[#1a5454] dark:text-[#0fa595]">
              — The editorial desk —
            </p>
            <h2
              className="font-serif text-3xl font-normal tracking-tight text-[#0d1418] dark:text-[#f7f5ec] sm:text-[36px]"
              style={{ fontFamily: SERIF, letterSpacing: "-0.022em" }}
            >
              Featured <em className="italic font-medium text-[#1a5454] dark:text-[#0fa595]">opportunities</em>
            </h2>
            <p className="mt-1 text-sm italic text-[#4a5057] dark:text-[#bfc1c9]" style={{ fontFamily: SERIF }}>
              Hand-picked programs with the strongest USMLE Match credibility.
            </p>
          </div>
          <Link
            href="/browse"
            className="hidden items-center gap-1 font-mono text-xs font-medium uppercase tracking-[0.08em] text-[#1a5454] hover:underline dark:text-[#0fa595] sm:flex"
          >
            View all
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Spotlight — wider editorial card. Two-column layout: prose body on
            the left, mono spec column on the right. Colored top cap matches
            the card-grid accent. Reads more like a feature article than an
            isolated cap. */}
        {spotlight && (
          <div className="mb-12">
            <div className="mb-3 flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1a5454] dark:text-[#0fa595]">
              <Star className="h-3.5 w-3.5 fill-[#1a5454] text-[#1a5454] dark:fill-[#0fa595] dark:text-[#0fa595]" />
              Featured program of the day
            </div>
            <Link
              href={`/listing/${spotlight.id}`}
              className={`group block w-full overflow-hidden rounded-xl border border-[#dfd5b8] ${spotlightAccent(spotlight.listingType)} bg-[#fcf9eb] shadow-plush shadow-plush-hover transition-all hover:-translate-y-0.5 dark:border-[#34373f] dark:bg-[#23262e]`}
            >
              <div className="grid grid-cols-1 gap-0 md:grid-cols-[1.6fr_1fr]">
                {/* Prose body */}
                <div className="p-6 md:p-7">
                  <span className="inline-block rounded-full border border-[#dfd5b8] bg-[#f0e9d3] px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-[0.12em] text-[#4a5057] dark:border-[#34373f] dark:bg-[#2a2d36] dark:text-[#bfc1c9]">
                    {LISTING_TYPE_LABELS[spotlight.listingType] ||
                      spotlight.listingType}
                  </span>
                  <h3
                    className="mt-3 font-serif text-2xl font-medium leading-tight text-[#0d1418] group-hover:text-[#1a5454] dark:text-[#f7f5ec] dark:group-hover:text-[#0fa595]"
                    style={{ fontFamily: SERIF, letterSpacing: "-0.012em" }}
                  >
                    {spotlight.title}
                  </h3>
                  <p
                    className="mt-1 text-[14px] italic text-[#4a5057] dark:text-[#bfc1c9]"
                    style={{ fontFamily: SERIF }}
                  >
                    {spotlight.city}, {spotlight.state}
                  </p>
                  {spotlight.shortDescription && (
                    <p className="mt-4 line-clamp-3 text-[14.5px] leading-relaxed text-[#4a5057] dark:text-[#bfc1c9]">
                      {spotlight.shortDescription}
                    </p>
                  )}
                  <span className="mt-5 inline-flex items-center gap-1 font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-[#1a5454] group-hover:underline dark:text-[#0fa595]">
                    Learn more
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
                {/* Spec column */}
                <div className="border-t border-[#dfd5b8] bg-[#f0e9d3]/40 p-6 md:border-l md:border-t-0 md:p-7 dark:border-[#34373f] dark:bg-[#1d1f26]/40">
                  <dl className="space-y-4">
                    <div>
                      <dt className="font-mono text-[9.5px] font-semibold uppercase tracking-[0.18em] text-[#7a7f88] dark:text-[#7e8089]">
                        Cost
                      </dt>
                      <dd
                        className="mt-1 flex items-center gap-1 text-[14px] text-[#0d1418] dark:text-[#f7f5ec]"
                        style={{ fontFamily: SERIF }}
                      >
                        <DollarSign className="h-3.5 w-3.5 text-[#a87b2e] dark:text-[#d8a978]" />
                        {spotlight.cost || "—"}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-mono text-[9.5px] font-semibold uppercase tracking-[0.18em] text-[#7a7f88] dark:text-[#7e8089]">
                        Location
                      </dt>
                      <dd
                        className="mt-1 text-[14px] text-[#0d1418] dark:text-[#f7f5ec]"
                        style={{ fontFamily: SERIF }}
                      >
                        {spotlight.city}, {spotlight.state}
                      </dd>
                    </div>
                    <div>
                      <dt className="font-mono text-[9.5px] font-semibold uppercase tracking-[0.18em] text-[#7a7f88] dark:text-[#7e8089]">
                        Type
                      </dt>
                      <dd
                        className="mt-1 text-[14px] text-[#0d1418] dark:text-[#f7f5ec]"
                        style={{ fontFamily: SERIF }}
                      >
                        {LISTING_TYPE_LABELS[spotlight.listingType] || spotlight.listingType}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} accent />
          ))}
        </div>

        <div className="mt-6 text-center sm:hidden">
          <Link
            href="/browse"
            className="inline-flex items-center gap-1 font-mono text-xs font-medium uppercase tracking-[0.08em] text-[#1a5454] hover:underline dark:text-[#0fa595]"
          >
            View all opportunities
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}
