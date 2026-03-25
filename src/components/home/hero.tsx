"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search, Building2, FlaskConical, Stethoscope, GraduationCap, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { USMap } from "@/components/states/us-map";
import Link from "next/link";
import { parseSmartSearch, buildSearchUrl } from "@/lib/smart-search";

interface HeroProps {
  listingCount: number;
  stateCount: number;
  specialtyCount: number;
  typeCounts: { observerships: number; externships: number; research: number; postdoc: number };
  stateCounts: Record<string, number>;
}

export function Hero({ listingCount, stateCount, specialtyCount, typeCounts, stateCounts }: HeroProps) {
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
    { value: listingCount, label: "Active Listings", icon: Building2 },
    { value: stateCount, label: "States Covered", icon: null },
    { value: specialtyCount, label: "Specialties", icon: Stethoscope },
  ];

  const types = [
    { label: "Observerships", count: typeCounts.observerships, color: "bg-blue-500", filter: "OBSERVERSHIP" },
    { label: "Externships", count: typeCounts.externships, color: "bg-emerald-500", filter: "EXTERNSHIP" },
    { label: "Research Fellowships", count: typeCounts.research + typeCounts.postdoc, color: "bg-violet-500", filter: "RESEARCH" },
  ];

  return (
    <section className="bg-gradient-to-b from-background via-background to-surface">
      {/* Top Hero */}
      <div className="mx-auto max-w-7xl px-4 pt-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-medium uppercase tracking-widest text-muted">
            Verified Directory — Updated March 2026
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            Verified U.S. Clinical Experience{" "}
            <span className="bg-gradient-to-r from-accent to-cyan bg-clip-text text-transparent">
              Programs for IMGs
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
            Search {listingCount}+ observerships, externships, research roles, and postdoc opportunities across {stateCount} states — with direct source links, visa notes, fee ranges, and verification status.
          </p>

          <form onSubmit={handleSearch} className="mx-auto mt-8 max-w-xl">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Try &quot;free observerships in New York&quot; or &quot;pediatrics research&quot;..."
                  aria-label="Search observership and clinical experience programs"
                  className="h-12 w-full rounded-lg border-0 bg-surface pl-10 pr-4 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>
              <Button type="submit" size="lg" className="shrink-0">
                Search
              </Button>
            </div>
          </form>

          <div className="mt-5 flex items-center justify-center gap-3">
            <Link href="/browse">
              <Button variant="outline" size="lg" className="border-border bg-transparent text-foreground hover:bg-surface-alt hover:text-foreground">
                Browse All
              </Button>
            </Link>
            <Link href="/for-institutions">
              <Button size="lg" className="bg-surface text-foreground hover:bg-surface-alt">
                Post a Listing
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="mx-auto mt-10 max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-3 gap-4 sm:gap-6">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-xl bg-surface/60 px-4 py-5 text-center backdrop-blur-sm">
              <div className="text-2xl font-bold text-foreground sm:text-3xl lg:text-4xl">
                {stat.value}
                <span className="text-accent">+</span>
              </div>
              <div className="mt-1 text-xs font-medium text-muted sm:text-sm">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Type Breakdown */}
        <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
          {types.map((t) => (
            <Link
              key={t.label}
              href={`/browse?type=${t.filter}`}
              className="group flex items-center gap-2 rounded-lg bg-surface/40 px-3 py-3 transition-colors hover:bg-surface-alt/60"
            >
              <span className={`h-2.5 w-2.5 rounded-full ${t.color}`} />
              <div className="min-w-0">
                <div className="text-sm font-semibold text-foreground sm:text-base">{t.count}</div>
                <div className="truncate text-[10px] text-muted sm:text-xs">{t.label}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* US Map */}
      <div className="mx-auto mt-8 max-w-4xl px-4 pb-8 sm:px-6 lg:px-8">
        <div className="rounded-xl bg-surface/30 p-4 backdrop-blur-sm sm:p-6">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-medium text-foreground">
              Opportunities by State
            </h3>
            <Link href="/browse" className="text-xs text-accent hover:text-accent">
              Browse all &rarr;
            </Link>
          </div>
          <USMap stateCounts={stateCounts} />
        </div>
      </div>
    </section>
  );
}
