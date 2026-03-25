import type { Metadata } from "next";
import Link from "next/link";
import {
  DollarSign,
  Clock,
  AlertTriangle,
  Shield,
  Briefcase,
  Building2,
  Globe,
  Phone,
  Users,
  FileText,
  Calculator,
  ArrowRight,
  BadgeCheck,
  Ban,
  CheckCircle,
  XCircle,
  Heart,
  Scale,
  Banknote,
} from "lucide-react";

export const metadata: Metadata = {
  title:
    "Moonlighting During Residency — Pay Rates, Visa Rules & Duty Hours — USCEHub",
  description:
    "Complete guide to moonlighting during residency: who can moonlight, J-1 and H-1B visa restrictions, typical pay rates by specialty (2025-2026), how to find shifts, tax implications, and whether it's worth it.",
  alternates: {
    canonical: "https://uscehub.com/residency/moonlighting",
  },
  openGraph: {
    title: "Moonlighting During Residency — USCEHub",
    description:
      "Pay rates, visa restrictions, duty hour rules, and practical advice for moonlighting during residency.",
    url: "https://uscehub.com/residency/moonlighting",
  },
};

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const eligibilityRequirements = [
  {
    icon: CheckCircle,
    text: "Must be PGY-2 or higher at most programs (PGY-1 interns usually cannot moonlight)",
    type: "requirement" as const,
  },
  {
    icon: FileText,
    text: "Must have an unrestricted medical license in the state",
    type: "requirement" as const,
  },
  {
    icon: Shield,
    text: "Program must approve moonlighting in writing — verbal approval is not sufficient",
    type: "requirement" as const,
  },
  {
    icon: Clock,
    text: "ACGME duty hours still apply to ALL clinical hours, including moonlighting shifts",
    type: "requirement" as const,
  },
  {
    icon: AlertTriangle,
    text: "Some programs prohibit all moonlighting entirely — check your contract before making plans",
    type: "warning" as const,
  },
];

const visaRestrictions = [
  {
    visa: "J-1 Visa",
    canMoonlight: false,
    severity: "critical",
    details:
      "CANNOT moonlight. Period. This is a federal restriction, not a program policy. Violating it risks visa revocation and deportation. There are no exceptions or workarounds. If you are on J-1, this entire page does not apply to you.",
  },
  {
    visa: "H-1B Visa",
    canMoonlight: false,
    severity: "high",
    details:
      "CAN moonlight in theory, BUT only if your employer files a concurrent H-1B petition with the moonlighting employer. This is expensive ($5,000-10,000+) and rare. Most moonlighting employers will not do this. Practically, H-1B moonlighting almost never happens.",
  },
  {
    visa: "Green Card",
    canMoonlight: true,
    severity: "none",
    details:
      "Can moonlight freely. No immigration-related restrictions. You have the same work authorization as a U.S. citizen for employment purposes.",
  },
  {
    visa: "OPT / EAD",
    canMoonlight: true,
    severity: "low",
    details:
      "Can work, but check specific restrictions on your EAD card. OPT employment must be related to your field of study. Consult your program's immigration office before starting.",
  },
];

const moonlightingTypes = [
  {
    icon: Building2,
    type: "Internal Moonlighting",
    description: "Extra shifts at your own hospital",
    pros: [
      "Easier to get program approval",
      "Already credentialed at the facility",
      "Malpractice usually covered by your hospital",
      "Familiar EMR, staff, and workflows",
    ],
    cons: [
      "Hours count toward ACGME duty hours (this is the big one)",
      "May feel like you never leave the hospital",
      "Pay is sometimes lower than external",
    ],
  },
  {
    icon: Globe,
    type: "External Moonlighting",
    description: "Shifts at outside facilities",
    pros: [
      "Often higher pay rates",
      "Broader clinical experience",
      "May NOT count toward duty hours at some programs (verify with your PD)",
      "Builds your CV and network",
    ],
    cons: [
      "Requires separate credentialing (takes 2-4 months)",
      "Requires separate malpractice insurance",
      "Unfamiliar EMR and workflows",
      "Travel time adds to fatigue",
    ],
  },
  {
    icon: Phone,
    type: "Telemedicine Moonlighting",
    description: "Virtual visits from home",
    pros: [
      "No commute — work from home",
      "Growing market with increasing demand",
      "Flexible scheduling",
      "Good for lighter clinical load",
    ],
    cons: [
      "State licensing requirements apply (must be licensed where patient is located)",
      "Pay can be lower than in-person",
      "Limited clinical scope",
      "Technology requirements and platform training",
    ],
  },
];

const payRates = [
  {
    type: "Internal medicine hospitalist",
    rate: "$100 - $175/hour",
    notes: "Higher for night shifts and weekends",
  },
  {
    type: "Emergency medicine",
    rate: "$150 - $250/hour",
    notes: "Varies significantly by location and shift timing",
  },
  {
    type: "Urgent care",
    rate: "$100 - $150/hour",
    notes: "Lower acuity, predictable hours",
  },
  {
    type: "Telemedicine",
    rate: "$75 - $150/hour",
    notes: "Platform-dependent; some pay per patient seen",
  },
  {
    type: "ICU coverage",
    rate: "$150 - $250/hour",
    notes: "Higher acuity commands premium rates",
  },
  {
    type: "Psychiatry (telepsych)",
    rate: "$150 - $250/hour",
    notes: "High demand; telepsych has expanded access significantly",
  },
];

const findShiftsSources = [
  {
    icon: Users,
    source: "Program Coordinator",
    detail:
      "Many programs maintain internal moonlighting pools. Your coordinator is the first person to ask — they often know of open shifts before anyone else.",
  },
  {
    icon: Building2,
    source: "Hospital Staffing Office",
    detail:
      "The hospital's staffing or scheduling office often has moonlighting needs that are not widely advertised. Walk in and introduce yourself.",
  },
  {
    icon: Briefcase,
    source: "Locum Agencies",
    detail:
      "Some locum tenens agencies work specifically with residents for moonlighting. They handle credentialing and malpractice, but take a cut of your rate.",
  },
  {
    icon: Globe,
    source: "Physician Facebook Groups",
    detail:
      "Search for physician and resident groups in your area. Posts for moonlighting shifts are common, especially for urgent care and hospitalist coverage.",
  },
  {
    icon: Users,
    source: "Senior Residents (Word of Mouth)",
    detail:
      "The most reliable source. Upper-level residents who moonlight will know the best-paying gigs, which facilities to avoid, and how to get started.",
  },
];

const practicalConsiderations = [
  {
    icon: Shield,
    title: "Malpractice Insurance",
    content:
      "Internal moonlighting is usually covered by your hospital's malpractice policy. External moonlighting requires separate coverage. Some moonlighting employers provide their own coverage. If not, expect to pay $1,000-3,000/year for a claims-made policy. Always verify coverage BEFORE your first shift.",
  },
  {
    icon: Calculator,
    title: "Taxes: Set Aside 25-30%",
    content:
      "Moonlighting income is almost always 1099 (independent contractor), not W-2. That means no taxes are withheld. You owe both income tax AND self-employment tax (15.3%). Set aside 25-30% of every moonlighting paycheck immediately. Consider quarterly estimated tax payments to avoid penalties.",
  },
  {
    icon: Clock,
    title: "Duty Hours: Every Clinical Hour Counts",
    content:
      "ALL clinical hours count toward ACGME's 80-hour weekly limit (averaged over 4 weeks). If you moonlight 8 hours on Saturday and work 60 hours during the week, that is 68 hours. Go over 80 averaged and you put yourself and your program at risk. Track meticulously.",
  },
  {
    icon: Heart,
    title: "Burnout Risk Is Real",
    content:
      "Moonlighting during a busy rotation (ICU, wards, nights) is a recipe for clinical mistakes and burnout. The extra $1,200 from a shift is not worth a medical error or your mental health. Be honest about your capacity.",
  },
  {
    icon: FileText,
    title: "DEA Number for External Prescribing",
    content:
      "You need your own DEA number to prescribe controlled substances at an external facility. Your training DEA number may not be valid outside your institution. Apply early — it takes 4-6 weeks and costs ~$888 for 3 years.",
  },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function MoonlightingPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline:
      "Moonlighting During Residency — Pay Rates, Visa Rules & Duty Hours",
    description:
      "Complete guide to moonlighting during residency including eligibility, visa restrictions, pay rates, tax implications, and practical considerations.",
    url: "https://uscehub.com/residency/moonlighting",
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
        name: "Residency",
        item: "https://uscehub.com/residency",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Moonlighting",
        item: "https://uscehub.com/residency/moonlighting",
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
                href="/residency"
                className="hover:text-foreground transition-colors"
              >
                Residency
              </Link>
            </li>
            <li>/</li>
            <li className="text-foreground font-medium">Moonlighting</li>
          </ol>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-12 sm:py-16 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-1.5 text-sm font-medium text-accent mb-6">
              <DollarSign className="h-4 w-4" />
              Extra Income During Training
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
              Moonlighting Guide
            </h1>
            <p className="mt-4 text-lg text-muted leading-relaxed">
              Everything you need to know about moonlighting during
              residency — who can do it, visa restrictions that could end
              your career, typical pay rates, how to find shifts, and
              whether the extra income is actually worth the tradeoff.
            </p>
          </div>
        </div>
      </section>

      {/* Who Can Moonlight */}
      <section
        id="eligibility"
        className="py-12 sm:py-16 border-b border-border"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-foreground mb-3">
            Who Can Moonlight
          </h2>
          <p className="text-muted mb-8 max-w-3xl">
            Moonlighting is not available to everyone. These are the
            baseline requirements you must meet before considering extra
            shifts.
          </p>

          <div className="space-y-3">
            {eligibilityRequirements.map((req) => {
              const Icon = req.icon;
              return (
                <div
                  key={req.text}
                  className={`rounded-xl border p-5 hover-glow ${
                    req.type === "warning"
                      ? "border-amber-400/30 bg-amber-400/5"
                      : "border-border bg-surface"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <Icon
                      className={`h-5 w-5 mt-0.5 shrink-0 ${
                        req.type === "warning"
                          ? "text-warning"
                          : "text-accent"
                      }`}
                    />
                    <p className="text-sm text-muted leading-relaxed">
                      {req.text}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Visa Restrictions */}
      <section
        id="visa"
        className="py-12 sm:py-16 border-b border-border"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-3">
            <AlertTriangle className="h-6 w-6 text-red-400" />
            <h2 className="text-2xl font-bold text-foreground">
              Visa Restrictions (Critical)
            </h2>
          </div>
          <p className="text-muted mb-8 max-w-3xl">
            Visa status determines whether you can moonlight at all. Getting
            this wrong can end your medical career in the United States.
            There is no gray area here.
          </p>

          <div className="space-y-4">
            {visaRestrictions.map((visa) => (
              <div
                key={visa.visa}
                className={`rounded-xl border p-6 hover-glow ${
                  visa.severity === "critical"
                    ? "border-red-400/30 bg-red-400/5"
                    : visa.severity === "high"
                      ? "border-amber-400/30 bg-amber-400/5"
                      : "border-border bg-surface"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="shrink-0 mt-0.5">
                    {visa.canMoonlight ? (
                      <CheckCircle className="h-5 w-5 text-success" />
                    ) : visa.severity === "critical" ? (
                      <XCircle className="h-5 w-5 text-red-400" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-amber-400" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-semibold text-foreground">
                        {visa.visa}
                      </h3>
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          visa.canMoonlight
                            ? "bg-success/10 text-success"
                            : visa.severity === "critical"
                              ? "bg-red-400/10 text-red-400"
                              : "bg-amber-400/10 text-amber-400"
                        }`}
                      >
                        {visa.canMoonlight
                          ? "Can Moonlight"
                          : visa.severity === "critical"
                            ? "Cannot Moonlight"
                            : "Restricted"}
                      </span>
                    </div>
                    <p className="text-sm text-muted leading-relaxed">
                      {visa.details}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-xl border border-red-400/30 bg-red-400/5 p-5">
            <p className="text-sm text-muted leading-relaxed">
              <strong className="text-foreground">Bottom line:</strong> If
              you are on a J-1 visa, moonlighting is not an option. Do not
              risk it. The consequences — visa revocation and potential
              deportation — are career-ending. Consult your program&apos;s
              immigration office if you have any questions about your
              specific visa status.
            </p>
          </div>
        </div>
      </section>

      {/* Types of Moonlighting */}
      <section
        id="types"
        className="py-12 sm:py-16 border-b border-border"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-foreground mb-3">
            Types of Moonlighting
          </h2>
          <p className="text-muted mb-8 max-w-3xl">
            Three main categories, each with distinct logistics, pay, and
            considerations.
          </p>

          <div className="space-y-6">
            {moonlightingTypes.map((mt) => {
              const Icon = mt.icon;
              return (
                <div
                  key={mt.type}
                  className="rounded-xl border border-border bg-surface p-6 hover-glow"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="inline-flex items-center justify-center rounded-lg bg-accent/10 p-2.5">
                      <Icon className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">
                        {mt.type}
                      </h3>
                      <p className="text-xs text-muted">{mt.description}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <h4 className="text-xs font-semibold text-success mb-2 uppercase tracking-wider">
                        Pros
                      </h4>
                      <ul className="space-y-2">
                        {mt.pros.map((pro, i) => (
                          <li
                            key={i}
                            className="flex gap-2 text-sm text-muted leading-relaxed"
                          >
                            <CheckCircle className="h-4 w-4 text-success shrink-0 mt-0.5" />
                            <span>{pro}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-red-400 mb-2 uppercase tracking-wider">
                        Cons
                      </h4>
                      <ul className="space-y-2">
                        {mt.cons.map((con, i) => (
                          <li
                            key={i}
                            className="flex gap-2 text-sm text-muted leading-relaxed"
                          >
                            <XCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                            <span>{con}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pay Rates */}
      <section
        id="pay-rates"
        className="py-12 sm:py-16 border-b border-border"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-foreground mb-3">
            Typical Pay Rates (2025-2026)
          </h2>
          <p className="text-muted mb-8 max-w-3xl">
            Rates vary by location, facility, shift timing, and your level
            of training. Night and weekend shifts typically pay 15-30% more.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-foreground font-semibold">
                    Moonlighting Type
                  </th>
                  <th className="text-left py-3 px-4 text-foreground font-semibold">
                    Hourly Rate
                  </th>
                  <th className="text-left py-3 px-4 text-foreground font-semibold hidden sm:table-cell">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody>
                {payRates.map((row) => (
                  <tr
                    key={row.type}
                    className="border-b border-border/50 hover:bg-surface transition-colors"
                  >
                    <td className="py-3 px-4 text-foreground font-medium">
                      {row.type}
                    </td>
                    <td className="py-3 px-4 text-cyan font-mono text-xs font-medium">
                      {row.rate}
                    </td>
                    <td className="py-3 px-4 text-muted text-xs hidden sm:table-cell">
                      {row.notes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-xs text-muted mt-4">
            Rates are approximate and vary significantly by region and
            facility. Urban academic centers may pay less than rural
            community hospitals. Always negotiate.
          </p>
        </div>
      </section>

      {/* How to Find Moonlighting */}
      <section
        id="find-shifts"
        className="py-12 sm:py-16 border-b border-border"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-foreground mb-3">
            How to Find Moonlighting Shifts
          </h2>
          <p className="text-muted mb-8 max-w-3xl">
            Moonlighting opportunities rarely come to you — you have to seek
            them out. Here are the most reliable channels.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {findShiftsSources.map((src) => {
              const Icon = src.icon;
              return (
                <div
                  key={src.source}
                  className="rounded-xl border border-border bg-surface p-5 hover-glow"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="inline-flex items-center justify-center rounded-lg bg-accent/10 p-2">
                      <Icon className="h-4 w-4 text-accent" />
                    </div>
                    <h3 className="text-base font-semibold text-foreground">
                      {src.source}
                    </h3>
                  </div>
                  <p className="text-sm text-muted leading-relaxed">
                    {src.detail}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Practical Considerations */}
      <section
        id="practical"
        className="py-12 sm:py-16 border-b border-border"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-foreground mb-3">
            Practical Considerations
          </h2>
          <p className="text-muted mb-8 max-w-3xl">
            The logistics that matter — malpractice, taxes, duty hours, and
            burnout risk.
          </p>

          <div className="space-y-4">
            {practicalConsiderations.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="rounded-xl border border-border bg-surface p-6 hover-glow"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="inline-flex items-center justify-center rounded-lg bg-accent/10 p-2.5">
                      <Icon className="h-5 w-5 text-accent" />
                    </div>
                    <h3 className="text-base font-semibold text-foreground">
                      {item.title}
                    </h3>
                  </div>
                  <p className="text-sm text-muted leading-relaxed">
                    {item.content}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Is It Worth It? */}
      <section
        id="worth-it"
        className="py-12 sm:py-16 border-b border-border"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-foreground mb-3">
            Is It Worth It?
          </h2>
          <p className="text-muted mb-8 max-w-3xl">
            The math and the reality check.
          </p>

          <div className="rounded-xl border border-border bg-surface p-6 sm:p-8">
            {/* The Math */}
            <h3 className="text-lg font-semibold text-foreground mb-4">
              The Math
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="rounded-lg border border-border bg-surface-alt p-4 text-center">
                <p className="text-xs text-muted mb-1">
                  Resident Salary
                </p>
                <p className="text-xl font-bold text-foreground">
                  ~$60-70K
                </p>
                <p className="text-xs text-muted mt-1">/year</p>
              </div>
              <div className="rounded-lg border border-border bg-surface-alt p-4 text-center">
                <p className="text-xs text-muted mb-1">
                  Moonlighting Income
                </p>
                <p className="text-xl font-bold text-cyan">~$28,800</p>
                <p className="text-xs text-muted mt-1">
                  $150/hr x 8hrs x 2 shifts/month
                </p>
              </div>
              <div className="rounded-lg border border-border bg-surface-alt p-4 text-center">
                <p className="text-xs text-muted mb-1">Pay Increase</p>
                <p className="text-xl font-bold text-success">40-45%</p>
                <p className="text-xs text-muted mt-1">
                  significant boost
                </p>
              </div>
            </div>

            {/* The Reality */}
            <h3 className="text-lg font-semibold text-foreground mb-4">
              The Reality Check
            </h3>
            <ul className="space-y-3">
              <li className="flex gap-3 text-sm text-muted leading-relaxed">
                <span className="text-accent mt-1 shrink-0">&#8226;</span>
                <span>
                  After taxes (remember, 25-30% for 1099 income), that
                  $28,800 becomes roughly $20,000-22,000 take-home.
                </span>
              </li>
              <li className="flex gap-3 text-sm text-muted leading-relaxed">
                <span className="text-accent mt-1 shrink-0">&#8226;</span>
                <span>
                  That is real money — it can cover loan payments, build an
                  emergency fund, or reduce financial stress significantly.
                </span>
              </li>
              <li className="flex gap-3 text-sm text-muted leading-relaxed">
                <span className="text-accent mt-1 shrink-0">&#8226;</span>
                <span>
                  BUT: the cost is your limited free time, sleep, and
                  recovery. Residency is already exhausting.
                </span>
              </li>
              <li className="flex gap-3 text-sm text-muted leading-relaxed">
                <span className="text-accent mt-1 shrink-0">&#8226;</span>
                <span>
                  A medical error made while fatigued from moonlighting can
                  end your career. The risk-reward calculation is personal.
                </span>
              </li>
              <li className="flex gap-3 text-sm text-muted leading-relaxed">
                <span className="text-accent mt-1 shrink-0">&#8226;</span>
                <span>
                  <strong className="text-foreground">
                    Best strategy:
                  </strong>{" "}
                  moonlight during lighter rotations (electives, ambulatory
                  months) and skip it during demanding ones (ICU, wards,
                  nights).
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Key Takeaways + CTA */}
      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Key Takeaways */}
          <div className="rounded-xl border border-border bg-surface p-6 sm:p-8 mb-8">
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <BadgeCheck className="h-5 w-5 text-accent" />
              Key Takeaways
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex gap-3 text-sm text-muted leading-relaxed">
                <span className="text-accent mt-1 shrink-0">1.</span>
                <span>
                  J-1 visa holders cannot moonlight under any
                  circumstances. This is federal law, not negotiable.
                </span>
              </div>
              <div className="flex gap-3 text-sm text-muted leading-relaxed">
                <span className="text-accent mt-1 shrink-0">2.</span>
                <span>
                  Get program approval in writing before your first shift.
                  Unauthorized moonlighting can lead to dismissal.
                </span>
              </div>
              <div className="flex gap-3 text-sm text-muted leading-relaxed">
                <span className="text-accent mt-1 shrink-0">3.</span>
                <span>
                  All clinical hours count toward the ACGME 80-hour weekly
                  limit. Track every hour meticulously.
                </span>
              </div>
              <div className="flex gap-3 text-sm text-muted leading-relaxed">
                <span className="text-accent mt-1 shrink-0">4.</span>
                <span>
                  Set aside 25-30% of moonlighting income for taxes.
                  1099 income is not like your W-2 residency salary.
                </span>
              </div>
              <div className="flex gap-3 text-sm text-muted leading-relaxed">
                <span className="text-accent mt-1 shrink-0">5.</span>
                <span>
                  Moonlight on light rotations, not demanding ones.
                  Fatigue-related errors are not worth the extra income.
                </span>
              </div>
              <div className="flex gap-3 text-sm text-muted leading-relaxed">
                <span className="text-accent mt-1 shrink-0">6.</span>
                <span>
                  Verify malpractice coverage before every external shift.
                  One uncovered claim can cost you everything.
                </span>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="rounded-xl border border-border bg-surface-alt p-8 sm:p-10 text-center">
            <h2 className="text-2xl font-bold text-foreground mb-3">
              Know Your Worth as an Attending
            </h2>
            <p className="text-muted mb-6 max-w-xl mx-auto">
              Understand salary ranges, contract red flags, and what to
              negotiate in your first attending contract.
            </p>
            <Link
              href="/residency/salary"
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-white hover:bg-accent/90 transition-colors"
            >
              Salary &amp; Contract Guide
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
