import type { Metadata } from "next";
import Link from "next/link";
import {
  BookOpen,
  GraduationCap,
  ClipboardCheck,
  Users,
  HeartPulse,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Residency Command Center",
  description:
    "Your residency command center — teaching materials, fellowship intelligence, board exam prep, survival guides, and community for all residents.",
  alternates: {
    canonical: "https://uscehub.com/residency",
  },
  openGraph: {
    title: "Residency Command Center — USCEHub",
    description:
      "Teaching materials, fellowship intelligence, board prep, and community — for ALL residents.",
    url: "https://uscehub.com/residency",
  },
};

const statCards = [
  {
    title: "Fellowship Strategy Guide",
    count: "Complete",
    description: "PGY-1 to Match Day — timeline, tiers, IMG advice",
    icon: GraduationCap,
    href: "/residency/fellowship/guide",
    color: "text-cyan",
    bgColor: "bg-cyan/10",
  },
  {
    title: "Board Exam Guides",
    count: "6 Boards",
    description: "ABIM, ABFM, ABP, ABS, ABPsych, ABPath",
    icon: ClipboardCheck,
    href: "/residency/boards",
    color: "text-success",
    bgColor: "bg-success/10",
  },
  {
    title: "Survival Guide",
    count: "Deep",
    description: "First week, rounds, ICU, burnout, PGY-1 to PGY-3+",
    icon: HeartPulse,
    href: "/residency/survival",
    color: "text-danger",
    bgColor: "bg-danger/10",
  },
  {
    title: "Salary & Contracts",
    count: "12 Specialties",
    description: "Compensation, RVUs, negotiation, red flags",
    icon: BookOpen,
    href: "/residency/salary",
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
] as const;

const recentUpdates = [
  {
    title: "Fellowship Strategy Guide Published",
    description:
      "Complete PGY-1 through Match Day timeline with competitiveness tiers, IMG-specific strategies, and what programs actually look for.",
    date: "March 2026",
  },
  {
    title: "Board Exam Guides Added",
    description:
      "Comprehensive guides for ABIM, ABFM, ABP, ABS, ABPsych, and ABPath with format, timeline, and resources.",
    date: "March 2026",
  },
  {
    title: "Survival Guide Published",
    description:
      "PGY-year-by-year survival tips covering wellness, financial basics, job search, and contract negotiation.",
    date: "March 2026",
  },
  {
    title: "Teaching Resources Curated",
    description:
      "20+ hand-picked resources across 6 categories: pocketbook medicine, POCUS, procedures, EBM, ICU, and communication.",
    date: "March 2026",
  },
];

export default function ResidencyPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Residency Command Center — USCEHub",
    description:
      "Teaching materials, fellowship intelligence, board exam prep, survival guides, and community for all residents.",
    url: "https://uscehub.com/residency",
    isPartOf: {
      "@type": "WebSite",
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

      {/* Hero */}
      <section className="py-12 sm:py-16 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-1.5 text-sm font-medium text-accent mb-6">
            <Sparkles className="h-4 w-4" />
            Phase 2 — Residency
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight">
            Your Residency Command Center
          </h1>
          <p className="mt-4 text-lg sm:text-xl text-muted max-w-2xl mx-auto">
            Teaching materials, fellowship intelligence, board prep, and
            community — for <strong className="text-foreground">ALL</strong>{" "}
            residents.
          </p>
        </div>
      </section>

      {/* Stat Cards */}
      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
            {statCards.map((card) => {
              const Icon = card.icon;
              return (
                <Link
                  key={card.href}
                  href={card.href}
                  className="rounded-xl border border-border bg-surface p-6 hover-glow group"
                >
                  <div
                    className={`inline-flex items-center justify-center rounded-lg ${card.bgColor} p-2.5 mb-4`}
                  >
                    <Icon className={`h-5 w-5 ${card.color}`} />
                  </div>
                  <p className="text-2xl font-bold text-foreground">
                    {card.count}
                  </p>
                  <h2 className="text-sm font-semibold text-foreground mt-1">
                    {card.title}
                  </h2>
                  <p className="text-xs text-muted mt-1">{card.description}</p>
                  <div className="mt-3 inline-flex items-center gap-1 text-xs text-accent opacity-0 group-hover:opacity-100 transition-opacity">
                    Explore <ArrowRight className="h-3 w-3" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* What's New */}
      <section className="py-12 sm:py-16 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-foreground mb-8">
            What&apos;s New
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentUpdates.map((update, i) => (
              <div
                key={i}
                className="rounded-xl border border-border bg-surface p-6 hover-glow"
              >
                <span className="inline-flex rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent mb-3">
                  {update.date}
                </span>
                <h3 className="text-base font-semibold text-foreground">
                  {update.title}
                </h3>
                <p className="text-sm text-muted mt-2">{update.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
