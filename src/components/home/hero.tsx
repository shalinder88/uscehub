"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";
import { USMap } from "@/components/states/us-map";
import Link from "next/link";
import { parseSmartSearch, buildSearchUrl } from "@/lib/smart-search";

interface HeroProps {
  listingCount: number;
  stateCount: number;
  specialtyCount: number;
  typeCounts: {
    observerships: number;
    clerkships: number;
    visitingStudents: number;
    research: number;
  };
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

  // Mockup 127: 4 canonical category chips as the primary nav row below
  // the CTAs. Each links to /browse?category=<slug>.
  const categories = [
    { label: "Observerships", count: typeCounts.observerships, filter: "observership" },
    { label: "Clerkships", count: typeCounts.clerkships, filter: "clerkship" },
    { label: "MD/DO Visiting (VSLO)", count: typeCounts.visitingStudents, filter: "visiting" },
    { label: "Research", count: typeCounts.research, filter: "research" },
  ];

  const stats = [
    { value: listingCount, label: "Active Listings" },
    { value: stateCount, label: "States Covered" },
    { value: specialtyCount, label: "Specialties" },
  ];

  return (
    <section className="hero-127">
      <style>{`
        .hero-127 {
          background: var(--bg);
          color: var(--ink);
          font-family: var(--font-sans, system-ui, sans-serif);
          padding: 56px 16px 72px;
        }
        .hero-127 .h-inner { max-width: 1120px; margin: 0 auto; }
        .hero-127 .h-eyebrow {
          text-align: center;
          font-size: 11px;
          letter-spacing: .22em;
          text-transform: uppercase;
          color: var(--text-muted);
          margin-bottom: 24px;
        }
        .hero-127 h1.h-title {
          font-family: var(--font-serif);
          text-align: center;
          font-weight: 500;
          font-size: clamp(40px, 6vw, 78px);
          line-height: 1.05;
          letter-spacing: -.02em;
          color: var(--ink);
          margin: 0 0 28px;
        }
        .hero-127 h1.h-title em {
          font-style: italic;
          color: var(--teal);
          font-weight: 500;
        }
        .hero-127 h1.h-title { margin-bottom: 40px; }
        .hero-127 .h-search {
          max-width: 640px;
          margin: 0 auto 24px;
          display: flex;
          background: var(--paper);
          border: 1px solid var(--line);
          border-radius: 999px;
          padding: 6px 6px 6px 20px;
          box-shadow: 0 1px 3px rgba(0,0,0,.04);
        }
        .hero-127 .h-search:focus-within {
          border-color: var(--teal);
          box-shadow: 0 0 0 3px rgba(15,87,87,.10);
        }
        .hero-127 .h-search-icon { color: var(--text-muted); align-self: center; margin-right: 10px; }
        .hero-127 .h-search input {
          flex: 1;
          border: 0;
          outline: 0;
          background: transparent;
          font-size: 15px;
          color: var(--ink);
          padding: 12px 0;
        }
        .hero-127 .h-search input::placeholder { color: var(--text-muted); font-style: italic; }
        .hero-127 .h-search button {
          background: var(--teal);
          color: #fff;
          border: 0;
          border-radius: 999px;
          padding: 10px 22px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: background .15s;
        }
        .hero-127 .h-search button:hover { background: var(--teal-deep); }
        .hero-127 .h-ctas {
          display: flex;
          justify-content: center;
          gap: 12px;
          margin-bottom: 40px;
        }
        .hero-127 .h-cta {
          padding: 12px 22px;
          border-radius: 999px;
          font-size: 14px;
          font-weight: 500;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          transition: all .15s;
        }
        .hero-127 .h-cta-primary {
          background: var(--teal);
          color: #fff;
        }
        .hero-127 .h-cta-primary:hover { background: var(--teal-deep); }
        .hero-127 .h-cta-ghost {
          background: var(--paper);
          color: var(--ink);
          border: 1px solid var(--line);
        }
        .hero-127 .h-cta-ghost:hover { border-color: var(--teal); color: var(--teal); }

        /* 4 prominent category chips below CTAs */
        .hero-127 .h-cats {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          max-width: 720px;
          margin: 0 auto 56px;
        }
        @media (min-width: 640px) {
          .hero-127 .h-cats { grid-template-columns: repeat(4, 1fr); }
        }
        .hero-127 .h-cat {
          background: var(--paper);
          border: 1px solid var(--line);
          border-radius: 14px;
          padding: 18px 14px;
          text-align: center;
          text-decoration: none;
          color: var(--ink);
          transition: all .15s;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .hero-127 .h-cat:hover {
          border-color: var(--teal);
          background: var(--paper-soft);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px -8px rgba(15,87,87,.20);
        }
        .hero-127 .h-cat-count {
          font-family: var(--font-serif);
          font-size: 32px;
          line-height: 1;
          font-weight: 500;
          color: var(--teal);
          margin-bottom: 4px;
        }
        .hero-127 .h-cat-label {
          font-size: 12.5px;
          font-weight: 500;
          color: var(--ink-soft);
          letter-spacing: .01em;
        }

        /* Stats row (kept for credibility, sits under categories) */
        .hero-127 .h-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          max-width: 720px;
          margin: 0 auto 40px;
        }
        .hero-127 .h-stat {
          text-align: center;
          padding: 18px 12px;
          border-top: 1px solid var(--line);
        }
        .hero-127 .h-stat-val {
          font-family: var(--font-serif);
          font-size: 36px;
          line-height: 1;
          font-weight: 500;
          color: var(--ink);
        }
        .hero-127 .h-stat-val sup {
          color: var(--teal);
          font-size: .55em;
          vertical-align: super;
          margin-left: 2px;
        }
        .hero-127 .h-stat-label {
          margin-top: 6px;
          font-size: 11.5px;
          letter-spacing: .12em;
          text-transform: uppercase;
          color: var(--text-muted);
        }

        /* Map sits directly on cream — no card border */
        .hero-127 .h-map-card {
          max-width: 900px;
          margin: 0 auto;
          padding: 0;
        }
        .hero-127 .h-map-head {
          display: flex;
          justify-content: space-between;
          align-items: baseline;
          margin-bottom: 12px;
        }
        .hero-127 .h-map-title {
          font-family: var(--font-serif);
          font-size: 18px;
          color: var(--ink);
          margin: 0;
        }
        .hero-127 .h-map-link {
          font-size: 12.5px;
          color: var(--teal);
          text-decoration: none;
        }
        .hero-127 .h-map-link:hover { color: var(--teal-deep); text-decoration: underline; }
      `}</style>

      <div className="h-inner">
        <p className="h-eyebrow">Verified Directory · USCEHub</p>
        <h1 className="h-title">
          Find <em>verified</em> U.S. Clinical Experience.
        </h1>

        <form onSubmit={handleSearch} className="h-search">
          <Search className="h-search-icon" size={18} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder='Try "free observerships in New York"...'
            aria-label="Search clinical experience programs"
          />
          <button type="submit">Search →</button>
        </form>

        <div className="h-ctas">
          <Link href="/browse" className="h-cta h-cta-primary">
            Browse all programs →
          </Link>
          <Link href="/compare" className="h-cta h-cta-ghost">
            Compare programs →
          </Link>
        </div>

        {/* 4 PROMINENT category chips — primary nav row */}
        <div className="h-cats">
          {categories.map((c) => (
            <Link key={c.filter} href={`/browse?category=${c.filter}`} className="h-cat">
              <span className="h-cat-count">{c.count}</span>
              <span className="h-cat-label">{c.label}</span>
            </Link>
          ))}
        </div>

        {/* Credibility stats */}
        <div className="h-stats">
          {stats.map((s) => (
            <div key={s.label} className="h-stat">
              <div className="h-stat-val">
                {s.value}
                <sup>+</sup>
              </div>
              <div className="h-stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Opportunities by State map */}
        <div className="h-map-card">
          <div className="h-map-head">
            <h3 className="h-map-title">Opportunities by State</h3>
            <Link href="/browse" className="h-map-link">
              Browse all →
            </Link>
          </div>
          <USMap stateCounts={stateCounts} />
        </div>
      </div>
    </section>
  );
}
