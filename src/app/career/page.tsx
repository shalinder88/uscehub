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

// Immigration & Visa Tools
const immigrationTools = [
  { label: "J-1 Waiver State Intel", value: "50 States", href: "/career/waiver", icon: MapPin, color: "text-cyan", bg: "bg-cyan/10", description: "Conrad 30 guides, slot tracker, interactive map" },
  { label: "Interactive Waiver Map", value: "Live", href: "/career/waiver/map", icon: MapPin, color: "text-accent", bg: "bg-accent/10", description: "Visual US map — click any state for details" },
  { label: "Conrad 30 Slot Tracker", value: "Real-time", href: "/career/waiver/tracker", icon: Clock, color: "text-warning", bg: "bg-warning/10", description: "Which states still have slots available" },
  { label: "Waiver Pathways", value: "6 Paths", href: "/career/waiver/pathways", icon: GitCompare, color: "text-success", bg: "bg-success/10", description: "Conrad, HHS, ARC, DRA, SCRC, VA compared" },
  { label: "Timeline Calculator", value: "Personal", href: "/career/waiver/timeline", icon: Clock, color: "text-muted", bg: "bg-surface-alt", description: "Enter J-1 end date → get your timeline" },
  { label: "HPSA Score Lookup", value: "Official", href: "/career/waiver/hpsa-lookup", icon: MapPin, color: "text-danger", bg: "bg-danger/10", description: "Check if a facility qualifies as shortage area" },
  { label: "Visa Journey Map", value: "7 Stages", href: "/career/visa-journey", icon: Flag, color: "text-success", bg: "bg-success/10", description: "Interactive flowchart: J-1 → H-1B → Green Card" },
  { label: "Process Step-by-Step", value: "6 Paths", href: "/career/waiver/process", icon: Clock, color: "text-muted", bg: "bg-surface-alt", description: "Exact agency flow for each waiver pathway" },
  { label: "Visa Bulletin Tracker", value: "Monthly", href: "/career/visa-bulletin", icon: TrendingUp, color: "text-warning", bg: "bg-warning/10", description: "EB-2/EB-3 priority date movement + wait calculator" },
  { label: "Policy Alerts", value: "Weekly", href: "/career/alerts", icon: AlertCircle, color: "text-danger", bg: "bg-danger/10", description: "H-1B fees, Conrad reauth, USCIS changes" },
];

// Add state compare to career tools
const financeTools = [
  { label: "State Financial Compare", value: "25 States", href: "/career/state-compare", icon: TrendingUp, color: "text-success", bg: "bg-success/10", description: "Salary + tax + COL = real take-home by state" },
];

// Career & Contract Tools
const careerTools = [
  { label: "H-1B Visa Guide", value: "Complete", href: "/career/h1b", icon: Flag, color: "text-accent", bg: "bg-accent/10", description: "Cap-exempt employers, transfers, fees" },
  { label: "Green Card Pathways", value: "3 Paths", href: "/career/greencard", icon: Flag, color: "text-success", bg: "bg-success/10", description: "EB-2 NIW, EB-1, PERM — timelines & costs" },
  { label: "Contract Checklist", value: "Critical", href: "/career/contract", icon: Scale, color: "text-warning", bg: "bg-warning/10", description: "Must-have clauses, red flags, negotiation" },
  { label: "Offer Comparison", value: "4-way", href: "/career/offers", icon: GitCompare, color: "text-cyan", bg: "bg-cyan/10", description: "Compare contracts side by side" },
  { label: "Salary Benchmarks", value: "26 Specs", href: "/career/salary", icon: TrendingUp, color: "text-success", bg: "bg-success/10", description: "Sourced from Medscape, MGMA, Doximity" },
  { label: "Malpractice Guide", value: "8 Tiers", href: "/career/malpractice", icon: Scale, color: "text-danger", bg: "bg-danger/10", description: "Occurrence vs claims-made explained" },
];

// Job & Employer Tools
const jobTools = [
  { label: "J-1 Waiver Jobs", value: "6 Sources", href: "/career/jobs", icon: Briefcase, color: "text-accent", bg: "bg-accent/10", description: "Verified job boards with salary benchmarks" },
  { label: "Interview Prep", value: "Deep", href: "/career/interview", icon: Users, color: "text-muted", bg: "bg-surface-alt", description: "Questions, red flags, negotiation tips" },
  { label: "State Licensing Guide", value: "50 States", href: "/career/licensing", icon: Scale, color: "text-cyan", bg: "bg-cyan/10", description: "Fees, timelines, IMLC Compact, DEA, CDS" },
  { label: "Find an Attorney", value: "Vetted", href: "/career/attorneys", icon: Scale, color: "text-accent", bg: "bg-accent/10", description: "Physician immigration specialists directory" },
  { label: "For Employers", value: "Post Jobs", href: "/career/employers", icon: Briefcase, color: "text-success", bg: "bg-success/10", description: "Reach waiver physicians \u2014 from $249/listing" },
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

        {/* Immigration & Visa Tools */}
        <div className="mb-12">
          <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <MapPin className="h-5 w-5 text-cyan" />
            Immigration & Visa Intelligence
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {immigrationTools.map((card) => {
              const Icon = card.icon;
              return (
                <Link key={card.href} href={card.href} className="group">
                  <div className="rounded-xl border border-border bg-surface p-5 hover:border-accent/50 transition-all h-full">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`${card.bg} ${card.color} rounded-lg p-2`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="text-xs font-mono font-bold text-accent">{card.value}</span>
                    </div>
                    <div className="text-sm font-semibold text-foreground group-hover:text-accent transition-colors mb-1">
                      {card.label}
                    </div>
                    <div className="text-xs text-muted">{card.description}</div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Career & Contract Tools */}
        <div className="mb-12">
          <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Scale className="h-5 w-5 text-warning" />
            Career & Contract Tools
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {careerTools.map((card) => {
              const Icon = card.icon;
              return (
                <Link key={card.href} href={card.href} className="group">
                  <div className="rounded-xl border border-border bg-surface p-5 hover:border-accent/50 transition-all h-full">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`${card.bg} ${card.color} rounded-lg p-2`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="text-xs font-mono font-bold text-accent">{card.value}</span>
                    </div>
                    <div className="text-sm font-semibold text-foreground group-hover:text-accent transition-colors mb-1">
                      {card.label}
                    </div>
                    <div className="text-xs text-muted">{card.description}</div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Financial Tools */}
        <div className="mb-12">
          <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-success" />
            Financial Analysis
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {financeTools.map((card) => {
              const Icon = card.icon;
              return (
                <Link key={card.href} href={card.href} className="group">
                  <div className="rounded-xl border border-border bg-surface p-5 hover:border-accent/50 transition-all h-full">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`${card.bg} ${card.color} rounded-lg p-2`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="text-xs font-mono font-bold text-accent">{card.value}</span>
                    </div>
                    <div className="text-sm font-semibold text-foreground group-hover:text-accent transition-colors mb-1">
                      {card.label}
                    </div>
                    <div className="text-xs text-muted">{card.description}</div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Job & Employer Tools */}
        <div className="mb-12">
          <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-accent" />
            Job Search & Preparation
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {jobTools.map((card) => {
              const Icon = card.icon;
              return (
                <Link key={card.href} href={card.href} className="group">
                  <div className="rounded-xl border border-border bg-surface p-5 hover:border-accent/50 transition-all h-full">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`${card.bg} ${card.color} rounded-lg p-2`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="text-xs font-mono font-bold text-accent">{card.value}</span>
                    </div>
                    <div className="text-sm font-semibold text-foreground group-hover:text-accent transition-colors mb-1">
                      {card.label}
                    </div>
                    <div className="text-xs text-muted">{card.description}</div>
                  </div>
                </Link>
              );
            })}
          </div>
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
