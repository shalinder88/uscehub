import type { Metadata } from "next";
import Link from "next/link";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import {
  Flag,
  Clock,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  FileText,
  Shield,
  Building2,
  Users,
  Globe,
  Info,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Green Card Pathway for Physicians — EB-2 NIW, EB-1, PERM — USCEHub",
  description:
    "Complete guide to green card pathways for J-1 waiver physicians after completing their 3-year service commitment. EB-2 NIW, EB-1, PERM employer sponsorship, timelines, and costs.",
  alternates: {
    canonical: "https://uscehub.com/career/greencard",
  },
};

const pathways = [
  {
    name: "EB-2 National Interest Waiver (NIW)",
    icon: Flag,
    timeline: "1-3 years (country dependent)",
    cost: "$5,000-15,000 attorney fees + USCIS filing fees",
    selfPetition: true,
    employerRequired: false,
    description:
      "The most common green card pathway for physicians. You can self-petition (no employer sponsor required) if you can demonstrate that your work serves the national interest. Physicians in HPSA/MUA areas have a strong argument — the DOJ and USCIS have established that practicing medicine in underserved areas qualifies.",
    requirements: [
      "Advanced degree (MD qualifies) OR exceptional ability in sciences",
      "Proposed endeavor has substantial merit and national importance",
      "You are well-positioned to advance the endeavor",
      "On balance, it benefits the US to waive the job offer requirement",
      "For physicians: practicing in a HPSA/MUA is strong evidence of national interest",
    ],
    pros: [
      "Self-petition — no employer sponsorship needed",
      "Can file even during waiver service (I-140 petition)",
      "Physicians in underserved areas have established precedent",
      "No PERM labor certification required",
      "Can change employers after I-140 approval",
    ],
    cons: [
      "Processing time depends on country of birth (India/China backlog is years)",
      "Attorney fees $5,000-15,000",
      "Requires strong documentation of national interest",
      "I-485 (adjustment of status) cannot be filed until priority date is current",
    ],
    color: "text-accent",
  },
  {
    name: "EB-1 Extraordinary Ability / Outstanding Researcher",
    icon: Shield,
    timeline: "6 months - 2 years",
    cost: "$10,000-20,000 attorney fees + USCIS filing fees",
    selfPetition: true,
    employerRequired: false,
    description:
      "For physicians with exceptional achievements — significant publications, research contributions, awards, or leadership in their specialty. EB-1A (Extraordinary Ability) is self-petitioned. EB-1B (Outstanding Researcher) requires employer sponsorship but is faster.",
    requirements: [
      "EB-1A: Evidence of extraordinary ability (publications, awards, media, high salary, original contributions)",
      "EB-1B: Offer from employer with established research program + 3 years research experience",
      "Must meet at least 3 of 10 criteria (publications, judging others' work, awards, etc.)",
    ],
    pros: [
      "Minimal backlog — generally current for all countries (India may experience brief retrogression periods)",
      "Fastest green card pathway when eligible",
      "No PERM labor certification required",
      "Premium processing available (15 days for I-140)",
    ],
    cons: [
      "High evidentiary bar — not all physicians qualify",
      "Requires extensive documentation of achievements",
      "Higher attorney fees due to case complexity",
      "Denial rate higher than EB-2 NIW for borderline cases",
    ],
    color: "text-success",
  },
  {
    name: "EB-2/EB-3 PERM (Employer Sponsored)",
    icon: Building2,
    timeline: "2-5+ years (country dependent)",
    cost: "$8,000-20,000+ (employer usually pays PERM costs)",
    selfPetition: false,
    employerRequired: true,
    description:
      "Traditional employer-sponsored green card. Employer files PERM labor certification proving no qualified US worker is available, then files I-140 petition. Most secure pathway but slowest and employer-dependent.",
    requirements: [
      "Job offer from sponsoring employer",
      "Employer completes PERM labor certification (recruitment process)",
      "Employer files I-140 immigrant petition",
      "Employee maintains H-1B status until I-485 filed and approved",
    ],
    pros: [
      "Most straightforward process — employer handles most of it",
      "Strong for physicians with long-term employer relationships",
      "Employer typically pays PERM and I-140 costs",
      "Well-established process with clear precedent",
    ],
    cons: [
      "Tied to employer — changing jobs complicates the process",
      "PERM process takes 6-18 months alone",
      "Per-country backlog can add years (India, China)",
      "If employer withdraws, you may lose your place in line",
      "Total timeline often 3-7+ years for India/China-born physicians",
    ],
    color: "text-warning",
  },
];

const countryBacklog = [
  { country: "India", eb2Wait: "8-12+ years", eb1Wait: "Current (no wait)", notes: "Longest backlog. EB-1 or NIW strongly recommended." },
  { country: "China", eb2Wait: "3-5+ years", eb1Wait: "Current to 1 year", notes: "Significant backlog. EB-1 preferred if eligible." },
  { country: "Philippines", eb2Wait: "Current to 2 years", eb1Wait: "Current", notes: "Relatively shorter wait." },
  { country: "All other countries", eb2Wait: "Current to 2 years", eb1Wait: "Current", notes: "Most physicians from other countries have minimal wait." },
];

export default function GreenCardPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="rounded-lg bg-success/10 p-2.5">
            <Flag className="h-6 w-6 text-success" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
            Green Card Pathways for Physicians
          </h1>
        </div>
        <p className="text-muted max-w-3xl text-base leading-relaxed">
          After completing your 3-year J-1 waiver service commitment, the next
          step is permanent residency. Here are the three main pathways, with
          honest timelines and what to actually expect.
        </p>
        <div className="mt-3">
          <VerifiedBadge date="March 2026" sources={["USCIS", "DOS Visa Bulletin", "AILA"]} />
        </div>
      </div>

      {/* Critical timing note */}
      <div className="rounded-xl border border-accent/30 bg-accent/5 p-5 mb-8 flex gap-3">
        <Info className="h-5 w-5 text-accent shrink-0 mt-0.5" />
        <div className="text-sm text-muted">
          <strong className="text-foreground">When to start:</strong> File your
          I-140 petition (EB-2 NIW or EB-1) as early as possible — even during
          your waiver service. The priority date locks in when you file, and for
          countries with backlogs (India, China), every month matters. You
          don&apos;t need to wait until your 3 years are done to file I-140.
        </div>
      </div>

      {/* Pathway Cards */}
      <div className="space-y-8 mb-12">
        {pathways.map((pathway) => {
          const Icon = pathway.icon;
          return (
            <section
              key={pathway.name}
              className="rounded-xl border border-border bg-surface p-6 sm:p-8"
            >
              <div className="flex items-start gap-4 mb-6">
                <div className="rounded-lg bg-surface-alt p-3 shrink-0">
                  <Icon className={`h-6 w-6 ${pathway.color}`} />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-foreground">
                    {pathway.name}
                  </h2>
                  <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {pathway.timeline}
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3" />
                      {pathway.cost}
                    </span>
                    <span className="flex items-center gap-1">
                      {pathway.selfPetition ? (
                        <>
                          <CheckCircle2 className="h-3 w-3 text-success" />
                          Self-petition OK
                        </>
                      ) : (
                        <>
                          <Building2 className="h-3 w-3 text-warning" />
                          Employer required
                        </>
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-sm text-muted mb-6 leading-relaxed">
                {pathway.description}
              </p>

              <div className="mb-6">
                <h3 className="text-sm font-semibold text-foreground mb-2">
                  Requirements
                </h3>
                <ul className="space-y-1.5">
                  {pathway.requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-muted">
                      <span className="h-1.5 w-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                      {req}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-lg bg-success/5 border border-success/20 p-4">
                  <h4 className="text-xs font-semibold text-success mb-2 uppercase tracking-wider">
                    Advantages
                  </h4>
                  <ul className="space-y-1.5">
                    {pathway.pros.map((pro, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-muted">
                        <CheckCircle2 className="h-3 w-3 text-success mt-0.5 shrink-0" />
                        {pro}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-lg bg-warning/5 border border-warning/20 p-4">
                  <h4 className="text-xs font-semibold text-warning mb-2 uppercase tracking-wider">
                    Limitations
                  </h4>
                  <ul className="space-y-1.5">
                    {pathway.cons.map((con, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-muted">
                        <AlertTriangle className="h-3 w-3 text-warning mt-0.5 shrink-0" />
                        {con}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          );
        })}
      </div>

      {/* Country of Birth Backlog */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
          <Globe className="h-5 w-5 text-accent" />
          Per-Country Backlog (The Elephant in the Room)
        </h2>
        <p className="text-sm text-muted mb-6">
          Green card wait times depend heavily on your country of birth — not
          citizenship, not where you trained, but where you were born. This is
          the most frustrating part of physician immigration.
        </p>
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-alt">
                <th className="px-4 py-3 text-left font-semibold text-foreground">
                  Country of Birth
                </th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">
                  EB-2 Wait
                </th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">
                  EB-1 Wait
                </th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">
                  Notes
                </th>
              </tr>
            </thead>
            <tbody>
              {countryBacklog.map((row) => (
                <tr key={row.country} className="border-b border-border/50">
                  <td className="px-4 py-3 font-medium text-foreground">
                    {row.country}
                  </td>
                  <td className="px-4 py-3 text-muted font-mono">
                    {row.eb2Wait}
                  </td>
                  <td className="px-4 py-3 text-success font-mono font-bold">
                    {row.eb1Wait}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted">{row.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-muted">
          Wait times based on current DOS Visa Bulletin trends. These are
          estimates — actual wait times depend on filing date, case volume, and
          legislative changes. Check the monthly Visa Bulletin at
          travel.state.gov for current priority dates.
        </p>
      </section>

      {/* Recommendation */}
      <div className="rounded-xl border border-border bg-surface-alt p-6 sm:p-8">
        <h2 className="text-lg font-bold text-foreground mb-3">
          What We Recommend
        </h2>
        <div className="space-y-3 text-sm text-muted">
          <p>
            <strong className="text-foreground">If you&apos;re from India:</strong>{" "}
            File EB-2 NIW AND EB-1 simultaneously. The EB-1 has no backlog. Even
            if your EB-1 case is borderline, it&apos;s worth trying. The EB-2 NIW
            locks in your priority date while the EB-1 may get you there faster.
          </p>
          <p>
            <strong className="text-foreground">If you&apos;re from any other country:</strong>{" "}
            EB-2 NIW is usually the best option. File during your waiver service
            to lock in the priority date. Most non-India/China physicians get
            their green card within 1-2 years of filing.
          </p>
          <p>
            <strong className="text-foreground">For everyone:</strong> Hire a
            physician immigration attorney. This is not DIY territory. The
            consequences of a denial or missed deadline can cost you years.
          </p>
        </div>
      </div>

      {/* Related Tools */}
      <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/career/visa-bulletin" className="rounded-xl border border-border bg-surface p-5 hover:border-accent/50 transition-colors group">
          <h3 className="font-semibold text-foreground group-hover:text-accent text-sm">Visa Bulletin Tracker</h3>
          <p className="text-xs text-muted mt-1">Check your EB-2/EB-1 priority date movement</p>
        </Link>
        <Link href="/career/h1b" className="rounded-xl border border-border bg-surface p-5 hover:border-accent/50 transition-colors group">
          <h3 className="font-semibold text-foreground group-hover:text-accent text-sm">H-1B Guide</h3>
          <p className="text-xs text-muted mt-1">Cap-exempt rules, transfers, and fees</p>
        </Link>
        <Link href="/career/attorneys" className="rounded-xl border border-border bg-surface p-5 hover:border-accent/50 transition-colors group">
          <h3 className="font-semibold text-foreground group-hover:text-accent text-sm">Immigration Attorneys</h3>
          <p className="text-xs text-muted mt-1">Vetted attorneys who specialize in physician cases</p>
        </Link>
      </div>
    </div>
  );
}
