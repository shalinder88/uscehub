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

        {/* ═══ SECTION 2: Five Focus Cards ═══ */}
        <div className="mb-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Card 1: J-1 Waiver Jobs — THE MAIN PRODUCT */}
            <Link href="/career/jobs" className="group sm:col-span-2 lg:col-span-1">
              <div className="rounded-2xl border-2 border-accent/30 bg-gradient-to-br from-accent/5 to-surface p-6 hover:border-accent/60 transition-all h-full">
                <div className="flex items-center gap-3 mb-3">
                  <div className="rounded-xl bg-accent/15 p-3">
                    <Briefcase className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground group-hover:text-accent transition-colors">J-1 Waiver Jobs</h3>
                    <p className="text-[10px] text-accent font-medium">29 jobs + 1,087 H-1B sponsors · 13 specialties</p>
                  </div>
                </div>
                <p className="text-xs text-muted mb-3">
                  Verified job listings + 1,087 H-1B sponsor hospitals from DOL public data.
                  Salary data, HPSA status, visa type. Updated 3x daily.
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {["Jobs", "Sponsors", "Pulm/CC", "GI", "Cards", "Hospitalist"].map((s) => (
                    <span key={s} className="rounded-full bg-surface border border-border px-2 py-0.5 text-[10px] text-muted">{s}</span>
                  ))}
                </div>
              </div>
            </Link>

            {/* Card 2: Conrad 30 Intelligence — opens to map */}
            <Link href="/career/waiver/map" className="group">
              <div className="rounded-2xl border border-border bg-surface p-6 hover:border-cyan/50 transition-all h-full">
                <div className="flex items-center gap-3 mb-3">
                  <div className="rounded-xl bg-cyan/10 p-3">
                    <Globe className="h-6 w-6 text-cyan" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground group-hover:text-cyan transition-colors">Conrad 30 Map</h3>
                    <p className="text-[10px] text-cyan font-medium">Interactive · 50 states · Click any state</p>
                  </div>
                </div>
                <p className="text-xs text-muted">
                  Slot availability, application windows, HPSA data, processing times. Click a state to see everything.
                </p>
              </div>
            </Link>

            {/* Card 3: Immigration Knowledge */}
            <Link href="/career/visa-journey" className="group">
              <div className="rounded-2xl border border-border bg-surface p-6 hover:border-success/50 transition-all h-full">
                <div className="flex items-center gap-3 mb-3">
                  <div className="rounded-xl bg-success/10 p-3">
                    <Flag className="h-6 w-6 text-success" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground group-hover:text-success transition-colors">Immigration Pathways</h3>
                    <p className="text-[10px] text-success font-medium">J-1 → H-1B → Green Card</p>
                  </div>
                </div>
                <p className="text-xs text-muted">
                  6 waiver pathways, H-1B guide, green card routes, visa bulletin, ECFMG, step-by-step process.
                </p>
              </div>
            </Link>

            {/* Card 4: Career & Contract Tools */}
            <Link href="/career/salary" className="group">
              <div className="rounded-2xl border border-border bg-surface p-6 hover:border-warning/50 transition-all h-full">
                <div className="flex items-center gap-3 mb-3">
                  <div className="rounded-xl bg-warning/10 p-3">
                    <DollarSign className="h-6 w-6 text-warning" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground group-hover:text-warning transition-colors">Salary & Contracts</h3>
                    <p className="text-[10px] text-warning font-medium">26 specialties · Real benchmarks</p>
                  </div>
                </div>
                <p className="text-xs text-muted">
                  Salary data, offer comparison, contract red flags, malpractice, state licensing, negotiation.
                </p>
              </div>
            </Link>

            {/* Card 5: Your Journey */}
            <Link href="/career/waiver/timeline" className="group">
              <div className="rounded-2xl border border-border bg-surface p-6 hover:border-danger/50 transition-all h-full">
                <div className="flex items-center gap-3 mb-3">
                  <div className="rounded-xl bg-danger/10 p-3">
                    <Heart className="h-6 w-6 text-danger" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground group-hover:text-danger transition-colors">Your Journey</h3>
                    <p className="text-[10px] text-danger font-medium">Timeline · Alerts · Spouse · Problems</p>
                  </div>
                </div>
                <p className="text-xs text-muted">
                  Personal timeline calculator, policy alerts, H-4 spouse guide, what to do when things go wrong.
                </p>
              </div>
            </Link>
          </div>
        </div>

        {/* ═══ SECTION 3: Intelligence Feed (compact) ═══ */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-muted uppercase tracking-wider">
              Latest Intelligence
            </h2>
            <Link href="/career/alerts" className="text-xs text-accent hover:underline flex items-center gap-1">
              All alerts <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { type: "CRITICAL", color: "border-l-red-500", title: "Conrad 30 Authorization Lapsed", detail: "Physicians with J-1 status after Oct 1, 2025 may not be eligible. H.R. 1585 pending.", src: "USCIS" },
              { type: "H-1B FEE", color: "border-l-amber-500", title: "$100K H-1B Filing Fee Active", detail: "Proclamation 10973. Does NOT apply to change-of-status. Physician exemption bill introduced.", src: "Federal Register" },
              { type: "BULLETIN", color: "border-l-green-500", title: "EB-2 India: +10 Months in April", detail: "Jul 15, 2014 — largest single-month advance in years. May retrogress later in FY2026.", src: "DOS" },
              { type: "SLOTS", color: "border-l-blue-500", title: "19 States Filled All 30 Slots (FY2024)", detail: "KY, MI, NY: perfect fill record 20+ years. TX/CA did NOT fill all 30.", src: "3RNET" },
            ].map((a, i) => (
              <div key={i} className={`rounded-lg border border-border ${a.color} border-l-4 bg-surface p-3`}>
                <div className="flex items-start gap-2">
                  <span className="text-[9px] font-bold text-muted bg-surface-alt rounded px-1.5 py-0.5 shrink-0">{a.type}</span>
                  <div>
                    <h3 className="text-xs font-semibold text-foreground">{a.title}</h3>
                    <p className="text-[10px] text-muted mt-0.5">{a.detail}</p>
                    <p className="text-[9px] text-muted mt-1">Source: {a.src}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ═══ SECTION 4: For Employers ═══ */}
        <div className="rounded-xl border border-accent/30 bg-accent/5 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 mb-16">
          <div>
            <h2 className="text-lg font-bold text-foreground mb-1">
              Hiring J-1 Waiver Physicians?
            </h2>
            <p className="text-sm text-muted">
              Post your position. Reach physicians actively searching. From $249/listing.
            </p>
          </div>
          <Link
            href="/career/employers"
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white hover:bg-accent/90 transition-colors shrink-0"
          >
            Post a Position <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* ═══ SECTION 5: All Tools (collapsed, for power users) ═══ */}
        <details className="group mb-8">
          <summary className="cursor-pointer text-sm font-medium text-muted hover:text-foreground transition-colors flex items-center gap-2">
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-open:rotate-90" />
            All 25+ tools
          </summary>
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
            {[
              { label: "50 State Waiver Intel", href: "/career/waiver" },
              { label: "Interactive Map", href: "/career/waiver/map" },
              { label: "Conrad Slot Tracker", href: "/career/waiver/tracker" },
              { label: "6 Waiver Pathways", href: "/career/waiver/pathways" },
              { label: "Process Step-by-Step", href: "/career/waiver/process" },
              { label: "Timeline Calculator", href: "/career/waiver/timeline" },
              { label: "HPSA Lookup", href: "/career/waiver/hpsa-lookup" },
              { label: "Visa Bulletin", href: "/career/visa-bulletin" },
              { label: "H-1B Guide", href: "/career/h1b" },
              { label: "Green Card Paths", href: "/career/greencard" },
              { label: "Visa Journey Map", href: "/career/visa-journey" },
              { label: "ECFMG Certification", href: "/career/ecfmg" },
              { label: "Contract Checklist", href: "/career/contract" },
              { label: "Offer Comparison", href: "/career/offers" },
              { label: "Salary Benchmarks", href: "/career/salary" },
              { label: "Malpractice Guide", href: "/career/malpractice" },
              { label: "State Licensing", href: "/career/licensing" },
              { label: "State Compare", href: "/career/state-compare" },
              { label: "Jobs by Specialty", href: "/career/jobs" },
              { label: "H-1B Sponsor Database", href: "/career/sponsors" },
              { label: "Interview Prep", href: "/career/interview" },
              { label: "Loan Repayment", href: "/career/loan-repayment" },
              { label: "Policy Alerts", href: "/career/alerts" },
              { label: "H-4 Spouse Guide", href: "/career/h4-spouse" },
              { label: "When Things Go Wrong", href: "/career/waiver-problems" },
              { label: "Find an Attorney", href: "/career/attorneys" },
            ].map((t) => (
              <Link key={t.href} href={t.href} className="rounded-lg border border-border bg-surface px-3 py-2 text-xs text-muted hover:text-accent hover:border-accent/30 transition-colors">
                {t.label}
              </Link>
            ))}
          </div>
        </details>
      </div>
    </>
  );
}
// cache bust 1774693874
