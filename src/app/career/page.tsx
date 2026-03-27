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
  Globe,
  CheckCircle2,
  GraduationCap,
  DollarSign,
  Shield,
  Heart,
  FileText,
  AlertTriangle,
  ExternalLink,
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
        {/* Hero — tight, specific */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-1.5 text-xs font-medium text-accent mb-4">
            <Globe className="h-3.5 w-3.5" />
            Physician Immigration Intelligence
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
            J-1 Waiver · H-1B · Green Card
          </h1>
          <p className="text-lg text-muted max-w-2xl mx-auto">
            25+ tools built for physicians navigating US immigration.
            Every number sourced from official data. Every claim verified.
          </p>
        </div>

        {/* ═══ SECTION 1: Product Proof — Live Data Previews ═══ */}
        <div className="mb-16">
          <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-6">
            Live Intelligence
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Proof Block 1: Visa Bulletin */}
            <Link href="/career/visa-bulletin" className="group">
              <div className="rounded-xl border border-border bg-surface p-5 hover:border-accent/50 transition-all h-full">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-accent">Visa Bulletin — April 2026</span>
                  <ArrowRight className="h-3.5 w-3.5 text-muted group-hover:text-accent transition-colors" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted">EB-2 India</span>
                    <span className="font-mono font-bold text-warning">Jul 15, 2014</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted">EB-2 China</span>
                    <span className="font-mono font-bold text-foreground">Sep 1, 2021</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted">EB-2 ROW</span>
                    <span className="font-mono font-bold text-success">Current</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted">EB-1 India</span>
                    <span className="font-mono font-bold text-foreground">Apr 1, 2023</span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-border text-[10px] text-success flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  EB-2 India jumped 10 months this month (303 days)
                </div>
                <div className="mt-1 text-[10px] text-muted">Source: U.S. Department of State</div>
              </div>
            </Link>

            {/* Proof Block 2: Conrad 30 Slots */}
            <Link href="/career/waiver/tracker" className="group">
              <div className="rounded-xl border border-border bg-surface p-5 hover:border-accent/50 transition-all h-full">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-accent">Conrad 30 Slot Tracker — FY 2025</span>
                  <ArrowRight className="h-3.5 w-3.5 text-muted group-hover:text-accent transition-colors" />
                </div>
                <div className="space-y-2">
                  {[
                    { state: "Texas", filled: 30, total: 30, status: "Filled" },
                    { state: "California", filled: 28, total: 30, status: "2 left" },
                    { state: "New York", filled: 30, total: 30, status: "Filled" },
                    { state: "Alaska", filled: 5, total: 30, status: "25 left" },
                  ].map((s) => (
                    <div key={s.state} className="flex items-center justify-between text-xs">
                      <span className="text-muted">{s.state}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 rounded-full bg-border overflow-hidden">
                          <div
                            className={`h-full rounded-full ${s.filled === s.total ? "bg-danger" : s.filled > 20 ? "bg-warning" : "bg-success"}`}
                            style={{ width: `${(s.filled / s.total) * 100}%` }}
                          />
                        </div>
                        <span className={`font-mono text-[10px] ${s.filled === s.total ? "text-danger" : "text-success"}`}>
                          {s.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-border text-[10px] text-muted">
                  50 states tracked · 19 states filled all 30 in FY 2024 · Source: 3RNET
                </div>
              </div>
            </Link>

            {/* Proof Block 3: Salary Snapshot */}
            <Link href="/career/salary" className="group">
              <div className="rounded-xl border border-border bg-surface p-5 hover:border-accent/50 transition-all h-full">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-accent">J-1 Waiver Salary — 2026</span>
                  <ArrowRight className="h-3.5 w-3.5 text-muted group-hover:text-accent transition-colors" />
                </div>
                <div className="space-y-2">
                  {[
                    { spec: "GI", range: "$500-700K+", trend: "↑" },
                    { spec: "Interventional Radiology", range: "$575K+", trend: "↑" },
                    { spec: "Hospitalist (nocturnist)", range: "$380-400K", trend: "→" },
                    { spec: "Family Medicine", range: "$260-355K", trend: "↑" },
                  ].map((s) => (
                    <div key={s.spec} className="flex items-center justify-between text-xs">
                      <span className="text-muted">{s.spec}</span>
                      <span className="font-mono font-bold text-success">{s.range}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-border text-[10px] text-muted">
                  16 specialties · From real job postings · Sources: Medscape, MGMA, PracticeLink
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* ═══ SECTION 2: Quick Access — Most Important Tools ═══ */}
        <div className="mb-16">
          <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-6">
            Core Tools
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {[
              { label: "50 State Waiver Intel", href: "/career/waiver", icon: MapPin, color: "text-cyan" },
              { label: "Interactive Map", href: "/career/waiver/map", icon: Globe, color: "text-accent" },
              { label: "Conrad Slot Tracker", href: "/career/waiver/tracker", icon: Clock, color: "text-warning" },
              { label: "6 Waiver Pathways", href: "/career/waiver/pathways", icon: GitCompare, color: "text-success" },
              { label: "Visa Bulletin", href: "/career/visa-bulletin", icon: TrendingUp, color: "text-warning" },
              { label: "H-1B Guide", href: "/career/h1b", icon: Flag, color: "text-accent" },
              { label: "Green Card Paths", href: "/career/greencard", icon: Flag, color: "text-success" },
              { label: "Visa Journey Map", href: "/career/visa-journey", icon: ArrowRight, color: "text-cyan" },
              { label: "Process Step-by-Step", href: "/career/waiver/process", icon: FileText, color: "text-muted" },
              { label: "Contract Checklist", href: "/career/contract", icon: Scale, color: "text-warning" },
              { label: "Offer Comparison", href: "/career/offers", icon: GitCompare, color: "text-cyan" },
              { label: "Salary Benchmarks", href: "/career/salary", icon: DollarSign, color: "text-success" },
              { label: "Malpractice Guide", href: "/career/malpractice", icon: Shield, color: "text-danger" },
              { label: "State Licensing", href: "/career/licensing", icon: Scale, color: "text-cyan" },
              { label: "Jobs by Specialty", href: "/career/jobs", icon: Briefcase, color: "text-accent" },
              { label: "Interview Prep", href: "/career/interview", icon: Users, color: "text-muted" },
              { label: "ECFMG Certification", href: "/career/ecfmg", icon: GraduationCap, color: "text-cyan" },
              { label: "Loan Repayment", href: "/career/loan-repayment", icon: DollarSign, color: "text-success" },
              { label: "State Compare", href: "/career/state-compare", icon: TrendingUp, color: "text-success" },
              { label: "When Things Go Wrong", href: "/career/waiver-problems", icon: AlertTriangle, color: "text-danger" },
              { label: "H-4 Spouse Guide", href: "/career/h4-spouse", icon: Heart, color: "text-warning" },
              { label: "HPSA Lookup", href: "/career/waiver/hpsa-lookup", icon: MapPin, color: "text-danger" },
              { label: "Policy Alerts", href: "/career/alerts", icon: AlertCircle, color: "text-danger" },
              { label: "Find an Attorney", href: "/career/attorneys", icon: Scale, color: "text-accent" },
            ].map((tool) => {
              const Icon = tool.icon;
              return (
                <Link key={tool.href} href={tool.href} className="group">
                  <div className="rounded-lg border border-border bg-surface p-3 hover:border-accent/50 transition-all text-center h-full flex flex-col items-center justify-center gap-1.5">
                    <Icon className={`h-4 w-4 ${tool.color}`} />
                    <span className="text-xs font-medium text-foreground group-hover:text-accent transition-colors leading-tight">
                      {tool.label}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* ═══ SECTION 3: Intelligence Feed ═══ */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-semibold text-muted uppercase tracking-wider">
              Intelligence Feed
            </h2>
            <Link href="/career/alerts" className="text-xs text-accent hover:underline flex items-center gap-1">
              All alerts <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {[
              {
                type: "CRITICAL",
                typeColor: "bg-danger/10 text-danger",
                title: "Conrad 30 Authorization Has Lapsed",
                detail: "Program authorization expired Sept 30, 2025. Physicians who acquired J-1 status after Oct 1, 2025 may not be eligible. H.R. 1585 pending.",
                source: "USCIS, Congress.gov",
                date: "Mar 2026",
              },
              {
                type: "H-1B FEE",
                typeColor: "bg-warning/10 text-warning",
                title: "$100K H-1B Filing Fee (Proclamation 10973)",
                detail: "Applies to new petitions requiring consular processing. Does NOT apply to change-of-status or extensions. Physician exemption bill introduced. Expires Sept 2026.",
                source: "Federal Register, AMA",
                date: "Mar 2026",
              },
              {
                type: "VISA BULLETIN",
                typeColor: "bg-success/10 text-success",
                title: "EB-2 India Jumped 10 Months in April 2026",
                detail: "Final Action Date moved from Sep 15, 2013 to Jul 15, 2014 — the largest single-month advance in years. Driven by reduced consular processing. May retrogress later in FY2026.",
                source: "DOS Visa Bulletin",
                date: "Apr 2026",
              },
              {
                type: "SLOTS",
                typeColor: "bg-cyan/10 text-cyan",
                title: "FY 2024: 19 States Filled All 30 Conrad Slots",
                detail: "KY, MI, NY have filled every slot for 20+ years. TX and CA did not fill all 30 in FY2024 despite common belief. Total: 1,010 physicians placed nationally.",
                source: "3RNET, Health Affairs Scholar",
                date: "Feb 2026",
              },
            ].map((alert, i) => (
              <div key={i} className="rounded-lg border border-border bg-surface p-4">
                <div className="flex items-start gap-3">
                  <span className={`shrink-0 rounded-md px-2 py-0.5 text-[10px] font-bold ${alert.typeColor}`}>
                    {alert.type}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-foreground mb-1">{alert.title}</h3>
                    <p className="text-xs text-muted mb-1.5">{alert.detail}</p>
                    <div className="flex items-center gap-3 text-[10px] text-muted">
                      <span>Source: {alert.source}</span>
                      <span>·</span>
                      <span>{alert.date}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ═══ SECTION 4: For Employers ═══ */}
        <div className="rounded-xl border border-accent/30 bg-accent/5 p-6 text-center">
          <h2 className="text-lg font-bold text-foreground mb-2">
            Hiring J-1 Waiver Physicians?
          </h2>
          <p className="text-sm text-muted mb-4 max-w-lg mx-auto">
            Post your position to reach physicians actively searching for
            waiver-eligible positions. From $249/listing.
          </p>
          <Link
            href="/career/employers"
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-accent/90 transition-colors"
          >
            Post a Position <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </>
  );
}
