import type { Metadata } from "next";
import Link from "next/link";
import {
  Briefcase,
  DollarSign,
  Clock,
  MapPin,
  AlertTriangle,
  CheckCircle,
  Globe,
  Building2,
  FileText,
  Shield,
  Calculator,
  Users,
  ArrowRight,
  Ban,
  Phone,
  XCircle,
  Lightbulb,
  TrendingUp,
} from "lucide-react";

export const metadata: Metadata = {
  title:
    "Locum Tenens Guide for New Attendings — Pay Rates, Agencies & Tax Tips — USCEHub",
  description:
    "Complete locum tenens guide for physicians: pay rates by specialty (2025-2026), top agencies, how it works, visa restrictions, 1099 tax strategies, common mistakes, and whether locums is right for you.",
  alternates: {
    canonical: "https://uscehub.com/career/locums",
  },
  openGraph: {
    title: "Locum Tenens Guide for Physicians — USCEHub",
    description:
      "Locum tenens pay rates, agencies, visa rules, and tax strategies for new attending physicians.",
    url: "https://uscehub.com/career/locums",
  },
};

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const whyLocums = [
  {
    icon: Clock,
    reason: "Income While Waiting for Credentialing",
    detail:
      "Permanent job credentialing takes 3-6 months. Locums lets you earn income instead of sitting idle. Many new attendings do locums specifically to bridge this gap.",
  },
  {
    icon: MapPin,
    reason: "Explore Different Practice Settings",
    detail:
      "Not sure if you want academic, community, rural, or urban practice? Locums lets you try different settings before committing to a permanent position.",
  },
  {
    icon: DollarSign,
    reason: "Higher Hourly Pay",
    detail:
      "Locum rates are typically 1.5-2.5x the hourly equivalent of employed positions. Plus housing and travel are often covered by the agency.",
  },
  {
    icon: Globe,
    reason: "Geographic Flexibility",
    detail:
      "Work in different states, experience different patient populations, and figure out where you want to live long-term.",
  },
  {
    icon: Briefcase,
    reason: "During Waiver Job Search",
    detail:
      "For physicians who have completed their waiver obligation and are searching for their next permanent position.",
  },
  {
    icon: TrendingUp,
    reason: "Between Jobs",
    detail:
      "Contract ended, relocating, or taking a career pause? Locums fills the income gap without a long-term commitment.",
  },
];

const payRates = [
  { specialty: "Internal Medicine", rate: "$150 - $250/hr", notes: "General outpatient. Higher for hospitalist shifts." },
  { specialty: "Hospital Medicine", rate: "$175 - $300/hr", notes: "Night and weekend differentials can push above $300." },
  { specialty: "Psychiatry", rate: "$200 - $350/hr", notes: "Telepsych especially in demand. Some of the highest locum rates." },
  { specialty: "Emergency Medicine", rate: "$200 - $350/hr", notes: "Varies significantly by location and shift timing." },
  { specialty: "Surgery (General)", rate: "$250 - $400/hr", notes: "Call coverage and trauma centers pay premium rates." },
  { specialty: "Anesthesiology", rate: "$250 - $400/hr", notes: "CRNAs have compressed the lower end in some markets." },
  { specialty: "Primary Care (FM/IM)", rate: "$125 - $200/hr", notes: "Rural locations pay at the higher end." },
  { specialty: "Radiology", rate: "$200 - $350/hr", notes: "Teleradiology has expanded locum opportunities significantly." },
];

const howItWorks = [
  {
    step: 1,
    title: "Sign Up with Locum Agencies",
    detail:
      "Register with 3-5 agencies (never commit exclusively to one). Provide your CV, license info, and preferences for location, schedule, and rate. Each agency has different specialties and geographic coverage.",
  },
  {
    step: 2,
    title: "Get Matched with Assignments",
    detail:
      "Your recruiter will send you open assignments that match your profile. Assignments range from 1 week to 6 months. You choose which to pursue.",
  },
  {
    step: 3,
    title: "Negotiate Terms",
    detail:
      "Negotiate your rate, schedule, housing/travel arrangements, and malpractice coverage. Always counter-offer — agencies have margin built into their rates.",
  },
  {
    step: 4,
    title: "Agency Handles Credentialing",
    detail:
      "The agency credentials you at the facility. This still takes 4-8 weeks, so plan ahead. Some facilities have expedited credentialing for urgent needs.",
  },
  {
    step: 5,
    title: "Work the Assignment",
    detail:
      "Show up, do your job, submit timesheets, get paid. You are an independent contractor (1099 income). The agency pays you, not the facility.",
  },
  {
    step: 6,
    title: "Handle Your Own Taxes & Retirement",
    detail:
      "No taxes are withheld. You are responsible for quarterly estimated payments, self-employment tax, and your own retirement contributions (SEP IRA is the big advantage here).",
  },
];

const topAgencies = [
  {
    name: "CompHealth",
    detail: "One of the largest. Strong across most specialties and regions. Good reputation for recruiter quality.",
  },
  {
    name: "Weatherby Healthcare",
    detail: "Part of CHG Healthcare (same parent as CompHealth). Known for premium assignments and competitive rates.",
  },
  {
    name: "Staff Care",
    detail: "Another major player. Owned by AMN Healthcare. Large volume of assignments nationwide.",
  },
  {
    name: "Physician's Resource",
    detail: "Smaller but well-regarded. Known for personal attention and strong negotiation on behalf of physicians.",
  },
  {
    name: "Medicus Healthcare Solutions",
    detail: "Growing agency with good presence in hospital medicine and psychiatry.",
  },
];

const visaRestrictions = [
  {
    visa: "J-1 Waiver (During 3-Year Obligation)",
    canDoLocums: false,
    severity: "critical",
    detail:
      "You CANNOT do locums during your J-1 waiver obligation. You are contractually and legally committed to your waiver employer for 3 years. Leaving early has severe immigration consequences.",
  },
  {
    visa: "H-1B",
    canDoLocums: false,
    severity: "high",
    detail:
      "Your H-1B is employer-specific. You cannot independently contract with locum agencies. Each new work site would require a new or amended H-1B petition, which is impractical for locums.",
  },
  {
    visa: "Green Card (Permanent Resident)",
    canDoLocums: true,
    severity: "none",
    detail:
      "No restrictions. You can work as an independent contractor, sign up with any agency, and work in any state (with appropriate licenses).",
  },
  {
    visa: "US Citizen",
    canDoLocums: true,
    severity: "none",
    detail:
      "No restrictions whatsoever. Locums is fully available to you.",
  },
];

const taxImplications = [
  {
    icon: Calculator,
    title: "Set Aside 30-35% for Taxes",
    detail:
      "1099 income means no taxes are withheld. You owe federal income tax + state income tax + self-employment tax (15.3% on first $168,600 of net earnings). Set aside 30-35% of every payment immediately into a separate savings account.",
  },
  {
    icon: Clock,
    title: "Quarterly Estimated Tax Payments",
    detail:
      "Due April 15, June 15, September 15, and January 15. Miss these and you owe an underpayment penalty (~8% currently). Use IRS Direct Pay or EFTPS to submit. Safe harbor rule: pay 110% of last year's tax liability to avoid penalties.",
  },
  {
    icon: FileText,
    title: "Deductions You Can Claim",
    detail:
      "Travel expenses, housing (if away from tax home), meals (50% deductible), malpractice insurance, state licensing fees, CME courses, professional dues, equipment. Keep receipts for everything.",
  },
  {
    icon: Building2,
    title: "S-Corp for High Earners",
    detail:
      "If doing over $100K/year in locum income, an S-corp structure can reduce self-employment tax. You pay yourself a 'reasonable salary' (subject to FICA) and take the rest as distributions (no FICA). Consult a CPA — this saves thousands but requires proper setup.",
  },
  {
    icon: TrendingUp,
    title: "SEP IRA — The Big Advantage",
    detail:
      "As a self-employed physician, you can contribute up to 25% of net self-employment income to a SEP IRA (maximum ~$69,000 in 2025). This is FAR more than the $23,500 limit on a 401(k). This is the single biggest tax advantage of 1099 locum work.",
  },
];

const commonMistakes = [
  {
    icon: DollarSign,
    mistake: "Not Negotiating Your Rate",
    detail: "Agencies have 20-40% margin built into rates. Always counter-offer. If they offer $200/hr, counter at $240. They will often meet in the middle. The worst they can say is no.",
  },
  {
    icon: FileText,
    mistake: "Signing an Exclusive Contract",
    detail: "Never commit exclusively to one agency. Different agencies have different assignments. Exclusivity only benefits the agency, never you.",
  },
  {
    icon: Shield,
    mistake: "Not Verifying Malpractice Coverage",
    detail: "Confirm: who provides it (agency or facility), what type (occurrence vs claims-made), coverage limits, and tail coverage. Get it in writing before your first shift.",
  },
  {
    icon: MapPin,
    mistake: "Forgetting State Licensing",
    detail: "Every state you work in requires a medical license. Apply 2-3 months early. Some states have expedited licensing for locum physicians. The IMLC (Interstate Medical Licensure Compact) covers 40+ states with one expedited process.",
  },
  {
    icon: Calculator,
    mistake: "Not Setting Aside Taxes",
    detail: "The IRS penalty for underpayment compounds. If you earned $200K in locums and did not pay quarterly estimates, you could owe $6,000+ in penalties alone — on top of the tax bill.",
  },
  {
    icon: AlertTriangle,
    mistake: "Not Asking About the EMR",
    detail: "Working at a facility with a terrible or unfamiliar EMR will make your shifts miserable. Ask which EMR they use before accepting an assignment. Epic and Cerner are standard; anything else, do your research.",
  },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function LocumsPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline:
      "Locum Tenens Guide for New Attendings — Pay Rates, Agencies & Tax Tips",
    description:
      "Complete locum tenens guide for physicians: pay rates, agencies, visa restrictions, and tax strategies.",
    url: "https://uscehub.com/career/locums",
    publisher: {
      "@type": "Organization",
      name: "USCEHub",
      url: "https://uscehub.com",
    },
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Career",
        item: "https://uscehub.com/career",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Locum Tenens",
        item: "https://uscehub.com/career/locums",
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="py-4 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ol className="flex items-center gap-2 text-sm text-muted">
            <li>
              <Link
                href="/career"
                className="hover:text-foreground transition-colors"
              >
                Career
              </Link>
            </li>
            <li>/</li>
            <li className="text-foreground font-medium">Locum Tenens</li>
          </ol>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-12 sm:py-16 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-1.5 text-sm font-medium text-accent mb-6">
              <Briefcase className="h-4 w-4" />
              Temporary Physician Placements
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
              Locum Tenens Guide
            </h1>
            <p className="mt-4 text-lg text-muted leading-relaxed">
              Temporary physician assignments arranged through staffing
              agencies — often at 1.5-2.5x the hourly rate of employed
              positions. Many new attendings do locums while waiting for
              credentialing, exploring practice settings, or bridging
              between jobs. Here is everything you need to know.
            </p>
          </div>
        </div>
      </section>

      {/* Why New Attendings Do Locums */}
      <section id="why-locums" className="py-12 sm:py-16 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-foreground mb-3">
            Why New Attendings Do Locums
          </h2>
          <p className="text-muted mb-8 max-w-3xl">
            Locum tenens is not just for semi-retired physicians. New
            attendings are one of the fastest-growing segments of the
            locum market.
          </p>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {whyLocums.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.reason}
                  className="rounded-xl border border-border bg-surface p-6"
                >
                  <Icon className="h-5 w-5 text-accent mb-3" />
                  <h3 className="text-base font-semibold text-foreground mb-2">
                    {item.reason}
                  </h3>
                  <p className="text-sm text-muted leading-relaxed">
                    {item.detail}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pay Rates */}
      <section id="pay-rates" className="py-12 sm:py-16 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-foreground mb-3">
            Locum Pay Rates (2025-2026)
          </h2>
          <p className="text-muted mb-8 max-w-3xl">
            These are typical hourly rates. Actual rates vary by location,
            urgency, facility type, and your negotiation skills. Housing and
            travel are often covered separately, which effectively increases
            total compensation.
          </p>

          <div className="rounded-xl border border-border bg-surface overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface-alt">
                    <th className="text-left py-3 px-4 font-semibold text-foreground">
                      Specialty
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">
                      Hourly Rate
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">
                      Notes
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {payRates.map((rate, idx) => (
                    <tr
                      key={rate.specialty}
                      className={idx % 2 === 0 ? "" : "bg-surface-alt/50"}
                    >
                      <td className="py-3 px-4 font-medium text-foreground">
                        {rate.specialty}
                      </td>
                      <td className="py-3 px-4 text-accent font-semibold">
                        {rate.rate}
                      </td>
                      <td className="py-3 px-4 text-muted">{rate.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-12 sm:py-16 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-foreground mb-3">
            How Locum Tenens Works
          </h2>
          <p className="text-muted mb-8 max-w-3xl">
            The process from sign-up to getting paid. It is more
            straightforward than most people expect.
          </p>

          <div className="space-y-4">
            {howItWorks.map((item) => (
              <div
                key={item.step}
                className="rounded-xl border border-border bg-surface p-6"
              >
                <div className="flex items-start gap-4">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10 text-accent text-sm font-bold shrink-0">
                    {item.step}
                  </span>
                  <div>
                    <h3 className="text-base font-semibold text-foreground mb-1">
                      {item.title}
                    </h3>
                    <p className="text-sm text-muted leading-relaxed">
                      {item.detail}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Top Agencies */}
      <section id="agencies" className="py-12 sm:py-16 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-foreground mb-3">
            Top Locum Tenens Agencies
          </h2>
          <p className="text-muted mb-8 max-w-3xl">
            Sign up with 3-5 agencies. Each has different specialties,
            regions, and assignment types. Never commit exclusively to
            one agency.
          </p>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {topAgencies.map((agency) => (
              <div
                key={agency.name}
                className="rounded-xl border border-border bg-surface p-6"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="h-5 w-5 text-accent" />
                  <h3 className="text-base font-semibold text-foreground">
                    {agency.name}
                  </h3>
                </div>
                <p className="text-sm text-muted leading-relaxed">
                  {agency.detail}
                </p>
              </div>
            ))}
            <div className="rounded-xl border border-border bg-surface-alt p-6 flex items-center">
              <div>
                <p className="text-sm text-muted leading-relaxed">
                  <span className="font-medium text-foreground">Pro tip:</span>{" "}
                  Each agency has different specialties and regions they
                  serve well. Signing with multiple agencies maximizes your
                  options and gives you leverage in rate negotiations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Visa Restrictions */}
      <section id="visa" className="py-12 sm:py-16 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-3">
            <AlertTriangle className="h-6 w-6 text-danger" />
            <h2 className="text-2xl font-bold text-foreground">
              Visa Considerations
            </h2>
          </div>
          <p className="text-muted mb-8 max-w-3xl">
            Locum tenens is primarily available to physicians without visa
            restrictions. If you are on a J-1 waiver or H-1B, locums is
            not an option. Understand your status before pursuing this path.
          </p>

          <div className="space-y-4">
            {visaRestrictions.map((visa) => (
              <div
                key={visa.visa}
                className={`rounded-xl border p-6 ${
                  visa.severity === "critical"
                    ? "border-red-400/30 bg-red-400/5"
                    : visa.severity === "high"
                      ? "border-amber-400/30 bg-amber-400/5"
                      : "border-border bg-surface"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="shrink-0 mt-0.5">
                    {visa.canDoLocums ? (
                      <CheckCircle className="h-5 w-5 text-success" />
                    ) : visa.severity === "critical" ? (
                      <XCircle className="h-5 w-5 text-red-400" />
                    ) : (
                      <Ban className="h-5 w-5 text-amber-400" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-semibold text-foreground">
                        {visa.visa}
                      </h3>
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          visa.canDoLocums
                            ? "bg-success/10 text-success"
                            : visa.severity === "critical"
                              ? "bg-red-400/10 text-red-400"
                              : "bg-amber-400/10 text-amber-400"
                        }`}
                      >
                        {visa.canDoLocums ? "Can Do Locums" : "Cannot Do Locums"}
                      </span>
                    </div>
                    <p className="text-sm text-muted leading-relaxed">
                      {visa.detail}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tax Implications */}
      <section id="taxes" className="py-12 sm:py-16 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-foreground mb-3">
            Tax Implications of Locum Work
          </h2>
          <p className="text-muted mb-8 max-w-3xl">
            As an independent contractor, you are responsible for your own
            taxes. This is the part that trips up most new locum physicians.
            Get it right from the start.
          </p>

          <div className="space-y-4">
            {taxImplications.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="rounded-xl border border-border bg-surface p-6"
                >
                  <div className="flex items-start gap-4">
                    <Icon className="h-5 w-5 text-accent mt-0.5 shrink-0" />
                    <div>
                      <h3 className="text-base font-semibold text-foreground mb-2">
                        {item.title}
                      </h3>
                      <p className="text-sm text-muted leading-relaxed">
                        {item.detail}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Common Mistakes */}
      <section id="mistakes" className="py-12 sm:py-16 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-foreground mb-3">
            Common Mistakes to Avoid
          </h2>
          <p className="text-muted mb-8 max-w-3xl">
            These mistakes cost new locum physicians thousands of dollars
            or create headaches that could have been easily avoided.
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            {commonMistakes.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.mistake}
                  className="rounded-xl border border-border bg-surface p-6"
                >
                  <div className="flex items-start gap-3">
                    <Icon className="h-5 w-5 text-warning mt-0.5 shrink-0" />
                    <div>
                      <h3 className="text-sm font-semibold text-foreground mb-1">
                        {item.mistake}
                      </h3>
                      <p className="text-sm text-muted leading-relaxed">
                        {item.detail}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Is Locums Right for You */}
      <section id="decision" className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-foreground mb-8">
            Is Locum Tenens Right for You?
          </h2>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="rounded-xl border border-success/30 bg-success/5 p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-success" />
                Locums Might Be Right If...
              </h3>
              <ul className="space-y-2">
                {[
                  "You are a US citizen or green card holder (no visa restrictions)",
                  "You want higher hourly pay and are comfortable with 1099 taxes",
                  "You are between jobs or waiting for permanent credentialing",
                  "You want to explore different practice settings before committing",
                  "You value flexibility and are comfortable with less predictability",
                  "You are disciplined about setting aside taxes and managing your own benefits",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-muted">
                    <ArrowRight className="h-3 w-3 mt-1.5 shrink-0 text-success" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-xl border border-danger/30 bg-danger/5 p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <XCircle className="h-5 w-5 text-danger" />
                Locums Might NOT Be Right If...
              </h3>
              <ul className="space-y-2">
                {[
                  "You are on a J-1 waiver or H-1B visa (you legally cannot do locums)",
                  "You want stable, predictable income with benefits",
                  "You dislike managing your own taxes and retirement",
                  "You want to build long-term patient relationships",
                  "You need employer-provided health insurance and benefits",
                  "You are not comfortable with unfamiliar hospitals and EMR systems",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-muted">
                    <ArrowRight className="h-3 w-3 mt-1.5 shrink-0 text-danger" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
