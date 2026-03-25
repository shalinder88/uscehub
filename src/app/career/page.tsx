import type { Metadata } from "next";
import Link from "next/link";
import {
  Briefcase,
  MapPin,
  Scale,
  GitCompare,
  Flag,
  Users,
  ArrowRight,
  Clock,
  TrendingUp,
  AlertCircle,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Career & Immigration — USCEHub",
  description:
    "Navigate your attending career with J-1 waiver intelligence, job search tools, immigration lawyer directory, contract comparison, and citizenship pathway guidance for IMG physicians.",
  alternates: {
    canonical: "https://uscehub.com/career",
  },
  openGraph: {
    title: "Career & Immigration — USCEHub",
    description:
      "J-1 waiver intelligence, job search, immigration guidance, and contract tools for IMG attending physicians.",
    url: "https://uscehub.com/career",
  },
};

const statCards = [
  {
    label: "Waiver Jobs",
    value: "250+",
    description: "J-1 & H-1B positions",
    href: "/career/jobs",
    icon: Briefcase,
    color: "text-accent",
    bg: "bg-accent/10",
  },
  {
    label: "States Covered",
    value: "50",
    description: "Conrad 30 intelligence",
    href: "/career/waiver",
    icon: MapPin,
    color: "text-cyan",
    bg: "bg-cyan/10",
  },
  {
    label: "Immigration Lawyers",
    value: "50+",
    description: "Verified directory",
    href: "/career/lawyers",
    icon: Scale,
    color: "text-success",
    bg: "bg-success/10",
  },
  {
    label: "Offer Comparisons",
    value: "4-way",
    description: "Side-by-side contracts",
    href: "/career/offers",
    icon: GitCompare,
    color: "text-warning",
    bg: "bg-warning/10",
  },
  {
    label: "Citizenship Guides",
    value: "4",
    description: "Pathway timelines",
    href: "/career/citizenship",
    icon: Flag,
    color: "text-danger",
    bg: "bg-danger/10",
  },
  {
    label: "Community Posts",
    value: "Soon",
    description: "Discussions & reviews",
    href: "/career/community",
    icon: Users,
    color: "text-muted",
    bg: "bg-surface-alt",
  },
];

const latestUpdates = [
  {
    title: "Conrad 30 Reauthorization Update",
    description:
      "The Conrad State 30 program continues to be reauthorized. Stay informed about legislative changes that may affect J-1 waiver availability.",
    date: "Mar 2026",
    type: "Legislative",
    icon: AlertCircle,
  },
  {
    title: "USCIS Processing Time Changes",
    description:
      "Recent USCIS processing time updates for I-140 and I-485 applications may affect green card timelines for physicians.",
    date: "Mar 2026",
    type: "Immigration",
    icon: Clock,
  },
  {
    title: "Physician Salary Trends 2026",
    description:
      "Primary care physician salaries continue to rise in underserved areas, with many employers offering enhanced signing bonuses and loan repayment.",
    date: "Feb 2026",
    type: "Market",
    icon: TrendingUp,
  },
];

export default function CareerPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Career & Immigration — USCEHub",
    description:
      "Navigate your attending career with J-1 waiver intelligence, job search tools, immigration guidance, and contract comparison for IMG physicians.",
    url: "https://uscehub.com/career",
    provider: {
      "@type": "Organization",
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
            Navigate Your Attending Career
          </h1>
          <p className="text-lg text-muted max-w-3xl mx-auto">
            J-1 waiver intelligence, job search, immigration guidance, and
            contract tools for physicians transitioning from residency to
            independent practice.
          </p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link key={card.href} href={card.href} className="group">
                <div className="rounded-xl border border-border bg-surface p-6 hover-glow h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`${card.bg} ${card.color} rounded-lg p-2.5`}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="text-3xl font-bold text-foreground mb-1">
                    {card.value}
                  </div>
                  <div className="text-sm font-medium text-foreground mb-1">
                    {card.label}
                  </div>
                  <div className="text-xs text-muted">{card.description}</div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Latest Updates */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-6">
            Latest Waiver Updates
          </h2>
          <div className="space-y-4">
            {latestUpdates.map((update, i) => {
              const Icon = update.icon;
              return (
                <div
                  key={i}
                  className="rounded-xl border border-border bg-surface p-6 hover-glow"
                >
                  <div className="flex items-start gap-4">
                    <div className="rounded-lg bg-accent/10 p-2.5 shrink-0">
                      <Icon className="h-5 w-5 text-accent" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2 flex-wrap">
                        <h3 className="text-base font-semibold text-foreground">
                          {update.title}
                        </h3>
                        <span className="rounded-full px-3 py-1 text-xs font-medium bg-accent/10 text-accent">
                          {update.type}
                        </span>
                      </div>
                      <p className="text-sm text-muted mb-2">
                        {update.description}
                      </p>
                      <span className="text-xs text-muted">{update.date}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
