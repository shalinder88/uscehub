import type { Metadata } from "next";
import Link from "next/link";
import {
  DollarSign,
  TrendingUp,
  AlertTriangle,
  FileSignature,
  Handshake,
  Shield,
  ArrowRight,
  Building2,
  GraduationCap,
  Heart,
  BookOpen,
  MapPin,
  Clock,
  Scale,
  Banknote,
  BadgeCheck,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Physician Salary & Contract Guide for Graduating Residents — USCEHub",
  description:
    "Physician salary ranges by specialty (2025-2026), compensation structures explained (RVUs, bonuses, PSLF), contract red flags, and what to negotiate in your first attending contract.",
  alternates: {
    canonical: "https://uscehub.com/residency/salary",
  },
  openGraph: {
    title: "Physician Salary & Contract Guide — USCEHub",
    description:
      "Salary ranges by specialty, compensation structures, contract red flags, and negotiation strategies for graduating residents.",
    url: "https://uscehub.com/residency/salary",
  },
};

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const compensationStructure = [
  {
    icon: DollarSign,
    title: "Base Salary vs. Total Compensation",
    content: [
      "Base salary is your guaranteed pay. Total compensation includes base salary PLUS bonuses, benefits, retirement contributions, CME, and other perks.",
      "A job listing saying '$350,000 compensation' might mean $280,000 base + $40,000 productivity bonus + $30,000 retirement. Know the breakdown.",
      "Ask for the total compensation breakdown in writing before signing. The difference between base and total can be $50,000-150,000.",
      "Academic positions typically have lower base salaries but include protected research time, teaching, and better benefits packages.",
    ],
  },
  {
    icon: TrendingUp,
    title: "What RVUs Are & Why They Matter",
    content: [
      "RVU (Relative Value Unit) is how physicians' work is measured for billing. Every CPT code has an assigned RVU value.",
      "A typical office visit (99214) generates about 1.92 wRVUs. A complex visit (99215) generates about 2.80 wRVUs. Hospital admission (99223) generates about 3.86 wRVUs.",
      "Most employed physicians have an RVU target (e.g., 4,500-6,000 wRVUs/year for internal medicine). Meeting or exceeding this triggers productivity bonuses.",
      "The dollar-per-RVU rate varies by specialty and region. Internal medicine typically pays $52-53/wRVU. Psychiatry and orthopedics pay highest at ~$67/wRVU. Anesthesiology pays lowest at ~$43/wRVU. Medicare conversion factor for CY 2026: $33.40/RVU (standard). Source: MGMA 2025, CMS CY 2026 PFS.",
      "Ask about what happens if you don't hit your RVU target. Some contracts reduce your salary. Others just withhold the bonus. This matters enormously.",
    ],
  },
  {
    icon: Banknote,
    title: "Productivity Bonuses",
    content: [
      "Most employed positions offer bonuses above a baseline RVU threshold. For example: base salary covers first 4,000 wRVUs, then $50/wRVU for everything above.",
      "Realistic bonus range: $20,000-100,000+ per year depending on specialty and work volume.",
      "Some contracts use quality metrics (patient satisfaction, readmission rates, HEDIS measures) for a portion of the bonus. Understand the formula.",
      "Be cautious of contracts where a large percentage of your compensation is 'productivity-based' with no guaranteed base. You need income stability in your first year while building a patient panel.",
    ],
  },
];

const additionalComp = [
  {
    icon: GraduationCap,
    title: "Sign-On Bonus",
    range: "$10,000 - $100,000+",
    details:
      "Almost always negotiable. Higher in underserved areas and for in-demand specialties. Usually requires 2-3 year commitment — if you leave early, you repay a prorated portion. Get the repayment terms in writing.",
  },
  {
    icon: Heart,
    title: "Loan Repayment",
    range: "$0 - $200,000+",
    details:
      "PSLF (Public Service Loan Forgiveness): work at a 501(c)(3) employer, make 120 qualifying payments, remaining balance forgiven tax-free. Many academic and hospital systems qualify. Employer loan repayment programs: some offer $20,000-50,000/year toward loans. NHSC (National Health Service Corps): up to $50,000 for 2 years in underserved areas.",
  },
  {
    icon: BookOpen,
    title: "CME Allowance",
    range: "$2,000 - $5,000/year",
    details:
      "Covers conference registration, travel, and educational materials. Some employers offer $3,000-5,000 plus 5-7 days of CME time off. This is separate from vacation and often negotiable upward.",
  },
  {
    icon: MapPin,
    title: "Relocation Assistance",
    range: "$5,000 - $15,000",
    details:
      "Covers moving expenses for your first attending position. Some employers offer a flat stipend, others reimburse actual costs. Ask if it's taxable income (most is) and whether there's a repayment clause if you leave early.",
  },
];

const salaryRanges = [
  {
    specialty: "Internal Medicine",
    range: "$250,000 - $350,000",
    median: "$290,000",
    notes: "Outpatient vs. hospitalist matters. Hospitalists trend higher with shift differentials.",
  },
  {
    specialty: "Family Medicine",
    range: "$230,000 - $320,000",
    median: "$275,000",
    notes: "Rural and underserved areas often pay 15-25% more. OB-trained FM commands premium.",
  },
  {
    specialty: "Hospital Medicine",
    range: "$280,000 - $380,000",
    median: "$320,000",
    notes: "Nocturnist positions typically pay $20,000-40,000 more. Seven-on/seven-off schedules common.",
  },
  {
    specialty: "Pediatrics",
    range: "$220,000 - $300,000",
    median: "$260,000",
    notes: "Historically lower compensation. Subspecialty pediatrics (NICU, cards) pays significantly more.",
  },
  {
    specialty: "Psychiatry",
    range: "$280,000 - $400,000",
    median: "$320,000",
    notes: "Demand has pushed salaries up significantly. Telepsychiatry has expanded opportunities and pay.",
  },
  {
    specialty: "Emergency Medicine",
    range: "$300,000 - $420,000",
    median: "$350,000",
    notes: "Shift-based work. Consider hourly rate, not annual salary. Night/weekend differentials matter.",
  },
  {
    specialty: "General Surgery",
    range: "$350,000 - $500,000",
    median: "$420,000",
    notes: "Academic vs. private practice is a large split. Call burden varies enormously by practice.",
  },
  {
    specialty: "Cardiology",
    range: "$450,000 - $700,000+",
    median: "$550,000",
    notes: "Interventional cardiologists at the high end. Non-invasive lower but still top-tier compensation.",
  },
  {
    specialty: "Gastroenterology",
    range: "$400,000 - $600,000+",
    median: "$490,000",
    notes: "Procedural volume drives income. High endoscopy volume practices command top compensation.",
  },
  {
    specialty: "Pulmonary & Critical Care",
    range: "$350,000 - $500,000",
    median: "$410,000",
    notes: "Combined Pulm/CCM. ICU call burden is significant. Academic positions lower but with research time.",
  },
  {
    specialty: "Orthopedic Surgery",
    range: "$500,000 - $800,000+",
    median: "$620,000",
    notes: "Subspecialty matters enormously. Sports medicine and spine at the top. Hand surgery lower but better lifestyle.",
  },
  {
    specialty: "Dermatology",
    range: "$400,000 - $600,000+",
    median: "$480,000",
    notes: "Mix of medical and procedural. Mohs surgeons at high end. Excellent lifestyle with high compensation.",
  },
];

const contractRedFlags = [
  {
    flag: "Non-compete clauses with unreasonable scope",
    explanation:
      "A 2-year, 30-mile non-compete in a major city is one thing. A 2-year, 50-mile non-compete in a rural area could mean you have to leave the state if the job doesn't work out. Some states (California, North Dakota, Oklahoma) don't enforce non-competes at all. Know your state's law.",
    severity: "high",
  },
  {
    flag: "Claims-made malpractice without tail coverage",
    explanation:
      "Claims-made insurance only covers you if you have active coverage when a claim is filed. When you leave, you need 'tail coverage' to protect against future claims from past events. Tail can cost $30,000-100,000+. If your contract doesn't include employer-paid tail, you're on the hook. This is a dealbreaker issue — negotiate it upfront.",
    severity: "high",
  },
  {
    flag: "No guaranteed base salary (100% productivity)",
    explanation:
      "New physicians need 6-18 months to build a patient panel. A 100% productivity-based contract means you could earn very little in your first year. Insist on a guaranteed base for at least the first 1-2 years, with productivity kicking in after that.",
    severity: "high",
  },
  {
    flag: "Termination without cause with less than 90 days notice",
    explanation:
      "Some contracts allow the employer to terminate you without cause with only 30 days notice. That's not enough time to find a new position, especially with credentialing timelines. Push for 90-180 day notice requirements, applied equally to both parties.",
    severity: "high",
  },
  {
    flag: "Restrictive covenant that extends beyond waiver obligations",
    explanation:
      "For J-1 waiver physicians: if your non-compete extends beyond your 3-year waiver period, you could be contractually trapped even after completing your obligation. Ensure the non-compete starts after the waiver period ends, or negotiate it out entirely.",
    severity: "medium",
  },
  {
    flag: "No clear RVU bonus formula in writing",
    explanation:
      "If they promise a productivity bonus but the formula isn't in the contract, it doesn't exist. Get the exact threshold, the per-RVU rate, and the payment schedule (quarterly vs. annual) documented in the contract.",
    severity: "medium",
  },
  {
    flag: "Excessively long sign-on bonus repayment period",
    explanation:
      "A $50,000 sign-on bonus with a 4-year repayment obligation means you owe prorated repayment if you leave before year 4. Standard is 2-3 years. Anything longer is a yellow flag. Calculate the effective 'penalty' of leaving early.",
    severity: "medium",
  },
];

const negotiationItems = [
  {
    item: "Base Salary",
    negotiable: true,
    tip: "Usually has a defined range. Push to the top of the range with data from MGMA, AMGA, or Doximity salary surveys. Know the median for your specialty in that region.",
  },
  {
    item: "Sign-On Bonus",
    negotiable: true,
    tip: "Almost always negotiable. Start by asking for more than you expect. Many employers have budget for this that they don't initially offer.",
  },
  {
    item: "Loan Repayment",
    negotiable: true,
    tip: "Ask even if it's not listed in the initial offer. Many employers will add $20,000-50,000 in loan repayment to close a deal. Document the terms clearly.",
  },
  {
    item: "Start Date",
    negotiable: true,
    tip: "You can often push your start date by 2-4 weeks. This gives you time to move, decompress after residency, and prepare for credentialing. Take the break if you can.",
  },
  {
    item: "CME Time and Funds",
    negotiable: true,
    tip: "Push for 5-7 days and $3,000-5,000 minimum. Some employers will go higher. This is low-cost for them and high-value for you.",
  },
  {
    item: "Non-Compete Clause",
    negotiable: true,
    tip: "Push for shorter duration (1 year vs. 2), smaller radius (10-15 miles vs. 30), and carve-outs (academic positions, locum tenens, telemedicine). Some employers will remove it entirely if pressed.",
  },
  {
    item: "Tail Coverage",
    negotiable: true,
    tip: "If on claims-made malpractice, insist the employer covers tail. This should be a non-negotiable for you. Walk away if they refuse and it's claims-made.",
  },
  {
    item: "Benefits Package",
    negotiable: false,
    tip: "Usually standardized across the organization. Health insurance, dental, vision, disability, and life insurance are typically take-it-or-leave-it. Review what's included, especially disability insurance (own-occupation vs. any-occupation).",
  },
  {
    item: "PTO in Year 1",
    negotiable: false,
    tip: "Usually set by organizational policy. Standard is 3-4 weeks PTO plus holidays plus CME time. Some employers allow negotiation of additional days, but most don't.",
  },
  {
    item: "Call Schedule",
    negotiable: false,
    tip: "Typically determined by group structure and coverage needs. You can ask about it and factor it into your decision, but it's rarely negotiable for a new hire.",
  },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function SalaryPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Physician Salary & Contract Guide for Graduating Residents",
    description:
      "Comprehensive guide to physician compensation, salary ranges by specialty, contract red flags, and negotiation strategies.",
    url: "https://uscehub.com/residency/salary",
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
        name: "Salary & Contracts",
        item: "https://uscehub.com/residency/salary",
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
              <Link href="/residency" className="hover:text-foreground transition-colors">
                Residency
              </Link>
            </li>
            <li>/</li>
            <li className="text-foreground font-medium">Salary &amp; Contracts</li>
          </ol>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-12 sm:py-16 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-1.5 text-sm font-medium text-accent mb-6">
              <DollarSign className="h-4 w-4" />
              For Graduating Residents
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
              Salary &amp; Contract Guide
            </h1>
            <p className="mt-4 text-lg text-muted leading-relaxed">
              The compensation and contract knowledge you need before signing
              your first attending contract. Salary ranges, what RVUs actually
              are, red flags that cost physicians thousands, and what&apos;s
              actually negotiable.
            </p>
          </div>
        </div>
      </section>

      {/* Compensation Structure */}
      <section id="compensation" className="py-12 sm:py-16 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-foreground mb-3">
            Understanding Physician Compensation
          </h2>
          <p className="text-muted mb-8 max-w-3xl">
            Physician pay is more complex than a single salary number. Here&apos;s
            how it actually works.
          </p>

          <div className="space-y-6">
            {compensationStructure.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="rounded-xl border border-border bg-surface p-6 hover-glow"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="inline-flex items-center justify-center rounded-lg bg-accent/10 p-2.5">
                      <Icon className="h-5 w-5 text-accent" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {item.title}
                    </h3>
                  </div>
                  <ul className="space-y-3">
                    {item.content.map((line, i) => (
                      <li
                        key={i}
                        className="flex gap-3 text-sm text-muted leading-relaxed"
                      >
                        <span className="text-accent mt-1 shrink-0">&#8226;</span>
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          {/* Additional Compensation Components */}
          <h3 className="text-xl font-bold text-foreground mt-10 mb-6">
            Additional Compensation Components
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {additionalComp.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="rounded-xl border border-border bg-surface p-5 hover-glow"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="inline-flex items-center justify-center rounded-lg bg-accent/10 p-2">
                      <Icon className="h-4 w-4 text-accent" />
                    </div>
                    <div>
                      <h4 className="text-base font-semibold text-foreground">
                        {item.title}
                      </h4>
                      <span className="text-xs text-cyan font-medium">
                        {item.range}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-muted leading-relaxed">
                    {item.details}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Salary Ranges by Specialty */}
      <section id="salaries" className="py-12 sm:py-16 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-foreground mb-3">
            Salary Ranges by Specialty (2025-2026)
          </h2>
          <p className="text-muted mb-8 max-w-3xl">
            Ranges reflect employed physician compensation in the United States.
            Private practice, academic, and locum tenens positions may differ.
            Data sourced from MGMA, Doximity, and Medscape surveys.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-foreground font-semibold">
                    Specialty
                  </th>
                  <th className="text-left py-3 px-4 text-foreground font-semibold">
                    Range
                  </th>
                  <th className="text-left py-3 px-4 text-foreground font-semibold hidden sm:table-cell">
                    Median
                  </th>
                  <th className="text-left py-3 px-4 text-foreground font-semibold hidden md:table-cell">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody>
                {salaryRanges.map((row) => (
                  <tr
                    key={row.specialty}
                    className="border-b border-border/50 hover:bg-surface transition-colors"
                  >
                    <td className="py-3 px-4 text-foreground font-medium">
                      {row.specialty}
                    </td>
                    <td className="py-3 px-4 text-cyan font-mono text-xs">
                      {row.range}
                    </td>
                    <td className="py-3 px-4 text-muted hidden sm:table-cell">
                      {row.median}
                    </td>
                    <td className="py-3 px-4 text-muted text-xs hidden md:table-cell max-w-xs">
                      {row.notes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-xs text-muted mt-4">
            Salary ranges are approximate and vary by region, practice setting,
            and experience. Verify current data with MGMA, Doximity, or Medscape
            salary surveys for your specific situation.
          </p>
        </div>
      </section>

      {/* Contract Red Flags */}
      <section id="red-flags" className="py-12 sm:py-16 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-3">
            <AlertTriangle className="h-6 w-6 text-red-400" />
            <h2 className="text-2xl font-bold text-foreground">
              Contract Red Flags
            </h2>
          </div>
          <p className="text-muted mb-8 max-w-3xl">
            These are the issues that cost physicians tens or hundreds of
            thousands of dollars. A physician contract attorney ($500-1,500) is
            the best investment you&apos;ll make.
          </p>

          <div className="space-y-4">
            {contractRedFlags.map((item) => (
              <div
                key={item.flag}
                className={`rounded-xl border p-6 hover-glow ${
                  item.severity === "high"
                    ? "border-red-400/30 bg-red-400/5"
                    : "border-amber-400/30 bg-amber-400/5"
                }`}
              >
                <div className="flex items-start gap-3 mb-2">
                  <AlertTriangle
                    className={`h-5 w-5 mt-0.5 shrink-0 ${
                      item.severity === "high"
                        ? "text-red-400"
                        : "text-amber-400"
                    }`}
                  />
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-semibold text-foreground">
                        {item.flag}
                      </h3>
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                          item.severity === "high"
                            ? "bg-red-400/10 text-red-400"
                            : "bg-amber-400/10 text-amber-400"
                        }`}
                      >
                        {item.severity === "high"
                          ? "High Risk"
                          : "Medium Risk"}
                      </span>
                    </div>
                    <p className="text-sm text-muted leading-relaxed">
                      {item.explanation}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What to Negotiate */}
      <section id="negotiate" className="py-12 sm:py-16 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-3">
            <Handshake className="h-6 w-6 text-success" />
            <h2 className="text-2xl font-bold text-foreground">
              What to Negotiate (And What You Can&apos;t)
            </h2>
          </div>
          <p className="text-muted mb-8 max-w-3xl">
            Everything is negotiable until you sign. Here&apos;s what typically
            has room to move and what doesn&apos;t.
          </p>

          <div className="space-y-3">
            {negotiationItems.map((item) => (
              <div
                key={item.item}
                className="rounded-xl border border-border bg-surface p-5 hover-glow"
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`inline-flex items-center justify-center rounded-full h-6 w-6 text-xs font-bold shrink-0 mt-0.5 ${
                      item.negotiable
                        ? "bg-success/10 text-success"
                        : "bg-red-400/10 text-red-400"
                    }`}
                  >
                    {item.negotiable ? "Y" : "N"}
                  </span>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-semibold text-foreground">
                        {item.item}
                      </h3>
                      <span
                        className={`text-xs font-medium ${
                          item.negotiable ? "text-success" : "text-red-400"
                        }`}
                      >
                        {item.negotiable
                          ? "Usually Negotiable"
                          : "Rarely Negotiable"}
                      </span>
                    </div>
                    <p className="text-sm text-muted leading-relaxed">
                      {item.tip}
                    </p>
                  </div>
                </div>
              </div>
            ))}
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
                  Always get a physician contract attorney to review before
                  signing. The $500-1,500 cost can save you tens of thousands.
                </span>
              </div>
              <div className="flex gap-3 text-sm text-muted leading-relaxed">
                <span className="text-accent mt-1 shrink-0">2.</span>
                <span>
                  Understand the difference between base salary and total
                  compensation. Ask for the full breakdown in writing.
                </span>
              </div>
              <div className="flex gap-3 text-sm text-muted leading-relaxed">
                <span className="text-accent mt-1 shrink-0">3.</span>
                <span>
                  Tail coverage on claims-made malpractice is a dealbreaker.
                  Never accept a contract without employer-paid tail.
                </span>
              </div>
              <div className="flex gap-3 text-sm text-muted leading-relaxed">
                <span className="text-accent mt-1 shrink-0">4.</span>
                <span>
                  Non-compete clauses can trap you geographically. Know your
                  state&apos;s laws and negotiate the terms down.
                </span>
              </div>
              <div className="flex gap-3 text-sm text-muted leading-relaxed">
                <span className="text-accent mt-1 shrink-0">5.</span>
                <span>
                  Sign-on bonus, loan repayment, and CME are almost always
                  negotiable. Ask for more — the worst they can say is no.
                </span>
              </div>
              <div className="flex gap-3 text-sm text-muted leading-relaxed">
                <span className="text-accent mt-1 shrink-0">6.</span>
                <span>
                  Start credentialing 6 months before your planned start date.
                  Delays in credentialing mean delays in income.
                </span>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="rounded-xl border border-border bg-surface-alt p-8 sm:p-10 text-center">
            <h2 className="text-2xl font-bold text-foreground mb-3">
              Compare Job Offers Side by Side
            </h2>
            <p className="text-muted mb-6 max-w-xl mx-auto">
              Use our job offer comparison tool to evaluate multiple offers
              across salary, benefits, non-compete terms, and more.
            </p>
            <Link
              href="/career/offers"
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-white hover:bg-accent/90 transition-colors"
            >
              Compare Offers
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
