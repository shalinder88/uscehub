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
    label: "State Intelligence",
    value: "50",
    description: "Conrad 30 guides with verified data",
    href: "/career/waiver",
    icon: MapPin,
    color: "text-cyan",
    bg: "bg-cyan/10",
  },
  {
    label: "Offer Comparison",
    value: "4-way",
    description: "Side-by-side contract analysis",
    href: "/career/offers",
    icon: GitCompare,
    color: "text-warning",
    bg: "bg-warning/10",
  },
  {
    label: "Malpractice Guide",
    value: "8 Tiers",
    description: "Premiums by specialty & state",
    href: "/career/malpractice",
    icon: Scale,
    color: "text-danger",
    bg: "bg-danger/10",
  },
  {
    label: "Salary Benchmarks",
    value: "26",
    description: "Specialties with sourced data",
    href: "/career/salary",
    icon: TrendingUp,
    color: "text-success",
    bg: "bg-success/10",
  },
  {
    label: "Interview Prep",
    value: "Deep",
    description: "Questions, red flags, negotiation",
    href: "/career/interview",
    icon: Briefcase,
    color: "text-accent",
    bg: "bg-accent/10",
  },
];

const latestUpdates = [
  {
    title: "Conrad 30 Reauthorization Act (H.R. 1585 / S. 709) Introduced",
    description:
      "Bipartisan bill introduced Feb 2025 in 119th Congress. Would increase slots from 30 to 35 per state, add automatic escalation if 90% used nationally, and create slot recapture when physicians leave a state. Currently in Senate Judiciary Committee. Critical: without extension, physicians who acquired J-1 status after Oct 1, 2025 may not be eligible. Source: Congress.gov",
    date: "Mar 2026",
    type: "Legislative",
    icon: AlertCircle,
  },
  {
    title: "CY 2026 Medicare Conversion Factor: $33.40/RVU",
    description:
      "CMS established two conversion factors for the first time: $33.57/RVU for qualifying APM participants, $33.40/RVU for standard. Includes temporary 2.5% statutory bump from H.R. 1. However, a -2.5% efficiency adjustment to wRVUs on non-timed services may reduce procedural specialty reimbursement. Source: CMS CY 2026 PFS Final Rule.",
    date: "Mar 2026",
    type: "Compensation",
    icon: TrendingUp,
  },
  {
    title: "FY 2024: 19 States Filled All 30 Conrad Slots",
    description:
      "Per 3RNET data, 19 states exhausted all Conrad 30 slots in FY 2024: AZ, AR, CT, GA, IN, KS, KY, LA, ME, MA, MI, MN, MO, NM, NY, OH, OR, PA, SC. Kentucky, Michigan, and New York have filled every slot every year for 20+ years. Total national placements: 1,010 physicians. Source: 3RNET, Health Affairs Scholar.",
    date: "Feb 2026",
    type: "Waiver Data",
    icon: Clock,
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
