"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { USMap } from "@/components/states/us-map";
import Link from "next/link";
import { parseSmartSearch, buildSearchUrl } from "@/lib/smart-search";

interface HeroProps {
  listingCount: number;
  stateCount: number;
  specialtyCount: number;
  typeCounts: { clinicalRotations: number; researchPositions: number; volunteer: number };
  stateCounts: Record<string, number>;
}

// P1-2B locked-design hero — Cream & Teal day / Cardiogram Charcoal night.
// Charter / Iowan / system serif. 80px eyebrow hairline, italic teal "verified",
// compact 1-line search + Browse opportunities CTA only (Estimate Trip cost
// lives elsewhere on the full site), 2 centered tooltip chips (Free / Source
// status), 3 stats clickable + hover lift (no border accents per user
// feedback), italic "as of April 2026" line, type tiles with distinct hues,
// flush US map (no card) with radial fade-out at edges.
export function Hero({
  listingCount,
  stateCount,
  specialtyCount,
  typeCounts,
  stateCounts,
}: HeroProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      const filters = parseSmartSearch(search.trim());
      router.push(buildSearchUrl(filters));
    } else {
      router.push("/browse");
    }
  };

  const stats = [
    { value: listingCount, label: "Active listings", href: "/browse" },
    { value: stateCount, label: "States covered", href: "/observerships" },
    { value: specialtyCount, label: "Specialties", href: "/browse" },
  ];

  // Type-bordered tiles — distinct hues. Clinical = teal, Research = gold/amber,
  // Volunteer = coral.
  const types = [
    { label: "Clinical rotations", count: typeCounts.clinicalRotations, tone: "border-[#1a5454] dark:border-[#0fa595]", filter: "clinical" },
    { label: "Research", count: typeCounts.researchPositions, tone: "border-[#a87b2e] dark:border-[#d8a978]", filter: "research" },
    { label: "Volunteer / Pre-Med", count: typeCounts.volunteer, tone: "border-[#9c3a2c] dark:border-[#e7958a]", filter: "volunteer" },
  ];

  const SERIF = "Charter, 'Iowan Old Style', 'New York', 'Source Serif Pro', ui-serif, Georgia, serif";

  return (
    <section className="relative overflow-hidden border-b border-[#dfd5b8] dark:border-[#34373f]">
      {/* Ambient radial lights — day */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 dark:hidden"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 25% 5%, rgba(26,84,84,.07), transparent 60%), radial-gradient(ellipse 55% 45% at 88% 25%, rgba(168,123,46,.05), transparent 70%)",
        }}
      />
      {/* Ambient radial lights — night */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 hidden dark:block"
        style={{
          background:
            "radial-gradient(ellipse 70% 55% at 25% 5%, rgba(15,165,149,.10), transparent 60%), radial-gradient(ellipse 55% 45% at 88% 25%, rgba(216,169,120,.05), transparent 70%)",
        }}
      />
      {/* Faint grid mask */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 dark:hidden"
        style={{
          backgroundImage:
            "linear-gradient(rgba(13,20,24,.025) 1px, transparent 1px), linear-gradient(90deg, rgba(13,20,24,.025) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse 70% 70% at 50% 30%, black 30%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse 70% 70% at 50% 30%, black 30%, transparent 75%)",
        }}
      />

      {/* Hero content */}
      <div className="relative mx-auto max-w-7xl px-4 pt-24 pb-10 sm:px-6 lg:px-8">
        <div className="mx-auto w-full text-center">
          {/* 80px eyebrow hairline */}
          <div className="mb-4 flex flex-col items-center gap-3.5">
            <span aria-hidden="true" className="block h-px w-20 bg-[#1a5454]/60 dark:bg-[#0fa595]/60" />
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.22em] text-[#1a5454] dark:text-[#0fa595]">
              <span aria-hidden="true" className="mr-2 inline-block h-1.5 w-1.5 -translate-y-[1px] rounded-full bg-[#1a5454] align-middle dark:bg-[#0fa595]" />
              Verified directory · April 2026
            </p>
          </div>

          {/* Headline — editorial serif, font-weight 400 for plush feel.
              Italic teal "verified" accent. -0.022em letter-spacing. */}
          <h1
            className="font-serif text-3xl font-normal leading-[1.04] text-[#0d1418] dark:text-[#f7f5ec] sm:text-4xl md:text-[44px] md:[white-space:nowrap] lg:text-[52px] xl:text-[58px]"
            style={{ fontFamily: SERIF, letterSpacing: "-0.022em" }}
          >
            Find <em className="italic font-medium text-[#1a5454] dark:text-[#0fa595]">verified</em> U.S. Clinical Experience.
          </h1>

          {/* Search row — inset card-surface input, brass focus ring. */}
          <form
            onSubmit={handleSearch}
            className="mx-auto mt-10 flex max-w-2xl flex-wrap items-center justify-center gap-x-3 gap-y-3 sm:flex-nowrap"
          >
            <label className="flex w-full max-w-lg flex-1 items-center gap-2 rounded-full border border-[#dfd5b8] bg-[#fcf9eb] px-4 py-2.5 shadow-plush transition-colors focus-within:border-[#a87b2e] sm:w-auto dark:border-[#34373f] dark:bg-[#23262e] dark:focus-within:border-[#d8a978]">
              <Search className="h-3.5 w-3.5 text-[#7a7f88] dark:text-[#7e8089]" aria-hidden="true" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder='Try "free observerships in New York"…'
                aria-label="Search clinical experience programs"
                className="flex-1 bg-transparent text-[13px] text-[#0d1418] outline-none placeholder:text-[#7a7f88] dark:text-[#f7f5ec] dark:placeholder:text-[#7e8089]"
              />
              <span className="hidden font-mono text-[9.5px] uppercase tracking-[0.1em] text-[#7a7f88] sm:inline dark:text-[#7e8089]">↵ Search</span>
            </label>
            <Link href="/browse" className="shrink-0">
              <Button
                type="button"
                size="default"
                className="h-10 rounded-full bg-[#1a5454] px-5 text-[13px] text-white shadow-plush hover:bg-[#0e3838] dark:bg-[#0fa595] dark:hover:bg-[#0b8378]"
              >
                Browse opportunities <span aria-hidden="true" className="ml-1">→</span>
              </Button>
            </Link>
          </form>

          {/* Subline — single italic Charter line, more refined than three
              staccato sentences. Bold "Free" + "source status". */}
          <p
            className="mx-auto mt-3 max-w-xl text-center text-[14px] italic text-[#4a5057] dark:text-[#bfc1c9]"
            style={{ fontFamily: SERIF }}
          >
            <strong className="font-semibold not-italic text-[#0d1418] dark:text-[#f7f5ec]">Free</strong>, no account &mdash; <strong className="font-semibold not-italic text-[#0d1418] dark:text-[#f7f5ec]">source status</strong> on every listing.
          </p>
        </div>
      </div>

      {/* Stats row — narrowed to ~map width for proportionate hero. Smaller
          tiles, brass corner tick, gold "+" accent. */}
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-[88%] grid-cols-3 gap-3 sm:gap-4">
          {stats.map((stat) => (
            <Link
              key={stat.label}
              href={stat.href}
              className="group relative rounded-xl border border-[#dfd5b8] bg-[#fcf9eb] px-3 py-4 text-center shadow-plush shadow-plush-hover transition-all hover:-translate-y-0.5 dark:border-[#34373f] dark:bg-[#23262e]"
            >
              <span aria-hidden="true" className="absolute left-3 top-3 flex items-center gap-1 font-mono text-[8.5px] font-medium uppercase tracking-[0.18em] text-[#a87b2e] dark:text-[#d8a978]">
                <span className="block h-px w-3 bg-[#a87b2e] dark:bg-[#d8a978]" />
              </span>
              <div
                className="text-2xl tracking-tight text-[#0d1418] dark:text-[#f7f5ec] sm:text-[26px]"
                style={{ fontFamily: SERIF, fontWeight: 400 }}
              >
                {stat.value}
                <span className="ml-0.5 align-[0.22em] text-[16px] font-medium text-[#a87b2e] dark:text-[#d8a978]">+</span>
              </div>
              <div className="mt-1 font-mono text-[9.5px] font-semibold uppercase tracking-[0.18em] text-[#7a7f88] dark:text-[#7e8089]">
                {stat.label}
              </div>
            </Link>
          ))}
        </div>
        <p
          className="mx-auto mt-2 max-w-[88%] text-center text-[12px] italic text-[#7a7f88] dark:text-[#7e8089]"
          style={{ fontFamily: SERIF }}
        >
          as of April 2026
        </p>

        {/* Type tiles — same ~88% width as stats; slightly wider than map.
            Distinct hues per program type. */}
        <div className="mx-auto mt-5 grid max-w-[88%] grid-cols-3 gap-2 sm:gap-3">
          {types.map((t) => (
            <Link
              key={t.label}
              href={`/browse?category=${t.filter}`}
              className={`group flex items-center gap-3 rounded-lg border-l-[3px] ${t.tone} bg-[#fcf9eb] px-4 py-3 shadow-sm transition-colors hover:bg-[#f0e9d3] dark:bg-[#23262e] dark:hover:bg-[#2a2d36]`}
            >
              <div className="min-w-0 flex-1">
                <div className="font-mono text-base font-semibold text-[#0d1418] dark:text-[#f7f5ec] sm:text-lg">
                  {t.count}
                </div>
                <div className="text-[10px] leading-tight text-[#4a5057] dark:text-[#bfc1c9] sm:text-xs">{t.label}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* US map — flush, no card, radial fade-out at edges */}
      <div className="relative mx-auto mt-12 max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mb-3 flex items-center justify-between border-b border-[#dfd5b8] pb-3 dark:border-[#34373f]">
          <h3 className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-[#1a5454] dark:text-[#0fa595]">
            Opportunities by state
          </h3>
          <Link
            href="/browse"
            className="font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-[#1a5454] hover:underline dark:text-[#0fa595]"
          >
            Browse all <span aria-hidden="true">→</span>
          </Link>
        </div>
        <div
          className="mx-auto max-w-[85%]"
          style={{
            maskImage: "radial-gradient(ellipse 110% 110% at 50% 50%, black 90%, transparent 100%)",
            WebkitMaskImage: "radial-gradient(ellipse 110% 110% at 50% 50%, black 90%, transparent 100%)",
          }}
        >
          <USMap stateCounts={stateCounts} />
        </div>
      </div>
    </section>
  );
}
