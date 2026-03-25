import type { Metadata } from "next";
import Link from "next/link";
import {
  Calculator,
  DollarSign,
  Building2,
  FileText,
  Shield,
  Globe,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  TrendingUp,
  MapPin,
  Clock,
  Users,
  Lightbulb,
  PiggyBank,
  XCircle,
} from "lucide-react";

export const metadata: Metadata = {
  title:
    "Tax Planning for Physicians — W-2, 1099, Deductions & Retirement Strategies — USCEHub",
  description:
    "Real tax strategies for physicians: W-2 vs 1099 structures, key deductions physicians miss, retirement account strategies (backdoor Roth, mega backdoor, SEP IRA), state tax comparison, and IMG-specific tax considerations.",
  alternates: {
    canonical: "https://uscehub.com/career/taxes",
  },
  openGraph: {
    title: "Tax Planning for Physicians — USCEHub",
    description:
      "Actionable tax strategies: deductions, retirement accounts, state tax comparison, and IMG-specific considerations.",
    url: "https://uscehub.com/career/taxes",
  },
};

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const incomeStructures = [
  {
    type: "W-2 (Employed)",
    icon: Building2,
    color: "text-accent",
    bgColor: "bg-accent/10",
    pros: [
      "Employer withholds taxes — no quarterly payments needed",
      "Employer provides benefits (health, retirement match, malpractice)",
      "Simpler tax filing",
      "Employer pays half of FICA (7.65%)",
    ],
    cons: [
      "Fewer deductions available",
      "Less control over retirement contributions",
      "Limited tax optimization strategies",
    ],
    bestFor: "Most employed physicians at hospitals and group practices.",
  },
  {
    type: "1099 (Independent Contractor)",
    icon: FileText,
    color: "text-cyan",
    bgColor: "bg-cyan/10",
    pros: [
      "More deductions available (travel, home office, equipment)",
      "SEP IRA allows up to $69,000 in retirement contributions",
      "S-corp structure can reduce self-employment tax",
      "Greater flexibility and control",
    ],
    cons: [
      "Self-employment tax (15.3% on first $168,600)",
      "No benefits — you pay for everything yourself",
      "Quarterly estimated tax payments required",
      "More complex tax filing (Schedule C, SE)",
    ],
    bestFor: "Locum tenens, independent contractors, moonlighting, expert witness work.",
  },
  {
    type: "S-Corporation",
    icon: Shield,
    color: "text-success",
    bgColor: "bg-success/10",
    pros: [
      "Reduces self-employment tax on 1099 income above reasonable salary",
      "Pass-through taxation (no double taxation)",
      "Can save $10,000-30,000+/year in SE tax for high earners",
      "Professional appearance for consulting work",
    ],
    cons: [
      "Setup costs ($1,000-3,000) and annual compliance",
      "Must pay yourself a 'reasonable salary' (subject to FICA)",
      "Payroll requirements and additional filings",
      "Only worth it if 1099 income exceeds ~$100K/year",
    ],
    bestFor: "Physicians with significant 1099 income (locums, consulting, private practice).",
  },
];

const missedDeductions = [
  { deduction: "CME courses and travel", detail: "Conference fees, flights, hotels (if not employer-reimbursed). Must be directly related to your specialty.", category: "Education" },
  { deduction: "Medical license fees (all states)", detail: "Every state license renewal. If you hold licenses in 3 states, all 3 are deductible.", category: "Professional" },
  { deduction: "DEA registration", detail: "$888 for 3 years (2025). Required for practice. Fully deductible if you pay it.", category: "Professional" },
  { deduction: "Board certification / MOC fees", detail: "Initial certification and Maintenance of Certification. Includes exam fees and required courses.", category: "Professional" },
  { deduction: "Professional society dues", detail: "AMA, ACP, specialty societies, county medical society. All deductible.", category: "Professional" },
  { deduction: "Malpractice insurance", detail: "If you pay it (not employer-paid). Includes tail coverage when leaving a job.", category: "Insurance" },
  { deduction: "Medical journals and subscriptions", detail: "UpToDate, DynaMed, specialty journals, medical reference apps. Anything you use for clinical practice.", category: "Education" },
  { deduction: "Home office", detail: "If you do legitimate work from home (telehealth, charting, admin). Must be a dedicated space used regularly and exclusively for work.", category: "Workspace" },
  { deduction: "Student loan interest", detail: "Up to $2,500/year — but phases out at higher incomes ($90K-$105K MAGI for single filers). Most attendings exceed the limit.", category: "Debt" },
  { deduction: "SALT (State and Local Tax)", detail: "State income tax and property tax combined, capped at $10,000 federal deduction. Painful in high-tax states.", category: "Taxes" },
];

const retirementAccounts = [
  {
    account: "401(k) / 403(b)",
    limit: "$23,500 (2025), $31,000 if 50+",
    description:
      "Most employers offer this. Always contribute enough to get the full employer match — that is an immediate 50-100% return on your money.",
    priority: 1,
    color: "text-accent",
    tip: "If your employer offers a Roth 401(k) option, consider it. You pay tax now at your current rate, but withdrawals in retirement are completely tax-free.",
  },
  {
    account: "Backdoor Roth IRA",
    limit: "$7,000 (2025)",
    description:
      "Contribute $7,000 to a traditional IRA (non-deductible), then immediately convert to Roth. Legal and widely used by physicians who exceed direct Roth IRA income limits. Every physician should do this.",
    priority: 2,
    color: "text-success",
    tip: "Do NOT have money in a traditional IRA when doing this (pro-rata rule). Roll any existing traditional IRA into your 401(k) first.",
  },
  {
    account: "Mega Backdoor Roth",
    limit: "Up to $69,000 total (2025)",
    description:
      "If your 403(b) plan allows after-tax contributions AND in-plan Roth conversion, you can contribute far beyond the normal limit. Not all plans allow this — check with your HR department.",
    priority: 3,
    color: "text-cyan",
    tip: "This is the holy grail of physician retirement planning. If your plan allows it, you can shelter up to $69,000/year in Roth (tax-free growth) accounts.",
  },
  {
    account: "SEP IRA (for 1099 income)",
    limit: "25% of net, max ~$69,000 (2025)",
    description:
      "For self-employed / 1099 income (locums, consulting, private practice). Massive contribution limits make this the biggest tax advantage of independent contractor work.",
    priority: 4,
    color: "text-warning",
    tip: "Can be opened and funded up until your tax filing deadline (including extensions). If you had 1099 income last year, you can still open one.",
  },
  {
    account: "Defined Benefit Plan",
    limit: "$200,000+ per year",
    description:
      "For high-income practice owners. Essentially a personal pension. Can shelter enormous amounts but requires actuarial calculations and ongoing contributions. Complex but powerful.",
    priority: 5,
    color: "text-danger",
    tip: "Only makes sense for stable, high-income practice owners (typically $400K+ 1099 income). Requires a TPA (third-party administrator) to manage.",
  },
];

const stateTaxComparison = [
  { state: "Texas", rate: "0%", notes: "No income tax. Large physician market. Moderate COL outside Austin.", category: "zero" },
  { state: "Florida", rate: "0%", notes: "No income tax. Higher COL in Miami/Tampa. Large elderly population (high demand).", category: "zero" },
  { state: "Tennessee", rate: "0%", notes: "No earned income tax. Low COL. Growing healthcare market (Nashville).", category: "zero" },
  { state: "Washington", rate: "0%", notes: "No income tax but high COL in Seattle. Strong hospital systems.", category: "zero" },
  { state: "Nevada", rate: "0%", notes: "No income tax. Las Vegas has growing medical infrastructure.", category: "zero" },
  { state: "Wyoming", rate: "0%", notes: "No income tax. Rural. Limited practice opportunities but high pay.", category: "zero" },
  { state: "South Dakota", rate: "0%", notes: "No income tax. Rural. Underserved areas pay premium salaries.", category: "zero" },
  { state: "California", rate: "13.3%", notes: "Highest state tax. A $300K salary loses ~$28K-40K to state tax vs Texas.", category: "high" },
  { state: "New York", rate: "10.9%", notes: "Plus NYC has additional ~3.9% city tax. NYC physician effective rate can exceed 14%.", category: "high" },
  { state: "New Jersey", rate: "10.75%", notes: "High tax + high COL. Many physicians commute from PA.", category: "high" },
  { state: "Oregon", rate: "9.9%", notes: "No sales tax but high income tax. Portland has competitive physician market.", category: "high" },
  { state: "Minnesota", rate: "9.85%", notes: "High tax but excellent healthcare systems (Mayo Clinic, etc.).", category: "high" },
];

const estimatedTaxInfo = [
  { date: "April 15", period: "Q1 (Jan-Mar)", note: "Coincides with annual tax return deadline" },
  { date: "June 15", period: "Q2 (Apr-May)", note: "Only covers 2 months, not 3" },
  { date: "September 15", period: "Q3 (Jun-Aug)", note: "Covers 3 months" },
  { date: "January 15", period: "Q4 (Sep-Dec)", note: "Covers 4 months. Due in the following year." },
];

const whenToGetCpa = [
  {
    scenario: "DIY (TurboTax, etc.)",
    icon: CheckCircle,
    color: "text-success",
    criteria: [
      "Pure W-2 income from one employer",
      "No 1099 income (no moonlighting or locums)",
      "No investments beyond retirement accounts",
      "Standard deduction (no itemizing)",
      "One state of residence and work",
    ],
  },
  {
    scenario: "CPA Recommended",
    icon: Users,
    color: "text-warning",
    criteria: [
      "Any 1099 income (locums, consulting, expert witness)",
      "Rental properties or real estate investments",
      "S-corp structure",
      "Stock options, RSUs, or deferred compensation",
      "Multiple state licenses (working across state lines)",
      "Complex deductions (home office, vehicle, etc.)",
    ],
  },
];

const imgTaxConsiderations = [
  {
    icon: Globe,
    title: "Tax Treaty Benefits",
    detail:
      "Some countries have tax treaties with the US that reduce taxation on certain income types. India, China, UK, and many others have treaties. Check IRS Publication 901 for your country. Benefits vary widely — some exempt scholarship/fellowship income, others reduce withholding rates.",
  },
  {
    icon: DollarSign,
    title: "J-1 FICA Exemption (Saves $5,000+/year)",
    detail:
      "J-1 visa holders may be exempt from FICA taxes (Social Security + Medicare, 7.65% of salary) for the first 2 years under certain tax treaties. On a $65,000 resident salary, that is nearly $5,000/year you keep. Your payroll office should know this — if they do not, bring IRS Publication 519.",
  },
  {
    icon: AlertTriangle,
    title: "FBAR Filing (Serious Penalties)",
    detail:
      "If you have bank accounts, investments, or other financial accounts abroad totaling more than $10,000 at ANY point during the year, you must file FBAR (FinCEN Form 114). This is separate from your tax return. Penalty for not filing: up to $100,000 per violation. File electronically through BSA E-Filing.",
  },
  {
    icon: FileText,
    title: "ITIN Holders: File Taxes",
    detail:
      "File taxes with your ITIN until your SSN is obtained. Once you have an SSN, file an amended return to consolidate your tax history. Do not skip filing — it creates problems for future green card and citizenship applications.",
  },
  {
    icon: MapPin,
    title: "Departure Year Taxes",
    detail:
      "If you leave the US permanently, complex rules apply. You may owe tax on worldwide income up to your departure date. File a dual-status return. If you have a green card, you may owe exit tax if your net worth exceeds certain thresholds. Consult a CPA experienced with expatriation.",
  },
  {
    icon: Shield,
    title: "Foreign Income and Asset Reporting",
    detail:
      "Beyond FBAR, you may need to file Form 8938 (FATCA) if foreign financial assets exceed $50,000 ($200,000 if filing jointly). Rental income from property abroad is taxable in the US. Foreign tax credits may offset some of this. Do not ignore foreign assets — the IRS has information-sharing agreements with most countries.",
  },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function TaxesPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline:
      "Tax Planning for Physicians — W-2, 1099, Deductions & Retirement Strategies",
    description:
      "Real tax strategies for physicians: income structures, deductions, retirement accounts, state tax comparison, and IMG-specific considerations.",
    url: "https://uscehub.com/career/taxes",
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
        name: "Tax Planning",
        item: "https://uscehub.com/career/taxes",
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
            <li className="text-foreground font-medium">Tax Planning</li>
          </ol>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-12 sm:py-16 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-success/10 px-4 py-1.5 text-sm font-medium text-success mb-6">
              <Calculator className="h-4 w-4" />
              Physician Tax Strategy
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
              Tax Planning for Physicians
            </h1>
            <p className="mt-4 text-lg text-muted leading-relaxed">
              A good CPA who specializes in physicians saves you
              $5,000-20,000 per year in tax optimization. This guide covers the
              strategies and deductions you should know about — whether you
              are W-2 employed, doing 1099 locum work, or both.
            </p>
          </div>
        </div>
      </section>

      {/* W-2 vs 1099 */}
      <section id="structures" className="py-12 sm:py-16 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-foreground mb-3">
            W-2 vs 1099 — Know Your Structure
          </h2>
          <p className="text-muted mb-8 max-w-3xl">
            Many physicians are W-2 for their primary job and 1099 for
            moonlighting, locums, or expert witness work. Understanding
            both structures is essential for proper tax planning.
          </p>

          <div className="space-y-6">
            {incomeStructures.map((structure) => {
              const Icon = structure.icon;
              return (
                <div
                  key={structure.type}
                  className="rounded-xl border border-border bg-surface p-6"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-lg ${structure.bgColor} shrink-0`}
                    >
                      <Icon className={`h-5 w-5 ${structure.color}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-foreground mb-3">
                        {structure.type}
                      </h3>
                      <div className="grid gap-4 sm:grid-cols-2 mb-3">
                        <div>
                          <h4 className="text-xs font-semibold text-success uppercase tracking-wider mb-2">
                            Advantages
                          </h4>
                          <ul className="space-y-1">
                            {structure.pros.map((pro) => (
                              <li
                                key={pro}
                                className="flex items-start gap-1.5 text-xs text-muted"
                              >
                                <CheckCircle className="h-3 w-3 mt-0.5 shrink-0 text-success" />
                                {pro}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="text-xs font-semibold text-danger uppercase tracking-wider mb-2">
                            Disadvantages
                          </h4>
                          <ul className="space-y-1">
                            {structure.cons.map((con) => (
                              <li
                                key={con}
                                className="flex items-start gap-1.5 text-xs text-muted"
                              >
                                <XCircle className="h-3 w-3 mt-0.5 shrink-0 text-danger" />
                                {con}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <p className="text-xs text-muted">
                        <span className="font-medium text-foreground">Best for:</span>{" "}
                        {structure.bestFor}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Key Deductions */}
      <section id="deductions" className="py-12 sm:py-16 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-foreground mb-3">
            Key Deductions Physicians Miss
          </h2>
          <p className="text-muted mb-8 max-w-3xl">
            These deductions apply primarily to 1099 income (Schedule C) or
            to itemized deductions. W-2 employees lost most
            unreimbursed employee expense deductions after the 2017 tax
            reform. If you have any 1099 income, these become available.
          </p>

          <div className="rounded-xl border border-border bg-surface overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface-alt">
                    <th className="text-left py-3 px-4 font-semibold text-foreground">
                      Deduction
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">
                      Details
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">
                      Category
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {missedDeductions.map((item, idx) => (
                    <tr
                      key={item.deduction}
                      className={idx % 2 === 0 ? "" : "bg-surface-alt/50"}
                    >
                      <td className="py-3 px-4 font-medium text-foreground whitespace-nowrap">
                        {item.deduction}
                      </td>
                      <td className="py-3 px-4 text-muted">{item.detail}</td>
                      <td className="py-3 px-4">
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-surface-alt text-muted">
                          {item.category}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Retirement Accounts */}
      <section id="retirement" className="py-12 sm:py-16 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-foreground mb-3">
            Retirement Accounts — The Big Tax Levers
          </h2>
          <p className="text-muted mb-8 max-w-3xl">
            Retirement contributions are the most powerful tax reduction
            tools available to physicians. The difference between using
            these optimally and not can be $20,000+ per year in tax savings.
          </p>

          <div className="space-y-4">
            {retirementAccounts.map((acct) => (
              <div
                key={acct.account}
                className="rounded-xl border border-border bg-surface p-6"
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-surface-alt text-xs font-bold text-muted">
                        {acct.priority}
                      </span>
                      <h3 className="text-lg font-semibold text-foreground">
                        {acct.account}
                      </h3>
                    </div>
                  </div>
                  <span className={`shrink-0 text-xs font-medium px-2 py-0.5 rounded-full bg-surface-alt ${acct.color}`}>
                    {acct.limit}
                  </span>
                </div>
                <p className="text-sm text-muted leading-relaxed mb-3">
                  {acct.description}
                </p>
                <div className="rounded-lg bg-surface-alt px-4 py-3">
                  <div className="flex items-start gap-2">
                    <Lightbulb className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                    <p className="text-xs text-muted">{acct.tip}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* State Tax Strategy */}
      <section id="state-tax" className="py-12 sm:py-16 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-foreground mb-3">
            State Tax Strategy
          </h2>
          <p className="text-muted mb-8 max-w-3xl">
            On a $300,000 salary, the difference between a zero-tax state
            and a high-tax state is $20,000-40,000 per year after state
            taxes alone. This is a real factor in where you practice —
            but it is not the only factor. Consider cost of living,
            malpractice environment, and practice opportunities as well.
          </p>

          <div className="grid gap-6 lg:grid-cols-2 mb-8">
            {/* Zero-tax states */}
            <div className="rounded-xl border border-success/30 bg-success/5 p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-success" />
                Zero Income Tax States
              </h3>
              <div className="space-y-3">
                {stateTaxComparison
                  .filter((s) => s.category === "zero")
                  .map((state) => (
                    <div key={state.state} className="flex items-start gap-3">
                      <span className="text-sm font-bold text-success w-6 shrink-0">
                        {state.rate}
                      </span>
                      <div>
                        <span className="text-sm font-medium text-foreground">
                          {state.state}
                        </span>
                        <p className="text-xs text-muted">{state.notes}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* High-tax states */}
            <div className="rounded-xl border border-danger/30 bg-danger/5 p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-danger" />
                Highest Income Tax States
              </h3>
              <div className="space-y-3">
                {stateTaxComparison
                  .filter((s) => s.category === "high")
                  .map((state) => (
                    <div key={state.state} className="flex items-start gap-3">
                      <span className="text-sm font-bold text-danger w-12 shrink-0">
                        {state.rate}
                      </span>
                      <div>
                        <span className="text-sm font-medium text-foreground">
                          {state.state}
                        </span>
                        <p className="text-xs text-muted">{state.notes}</p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface p-6">
            <div className="flex items-start gap-2">
              <Lightbulb className="h-5 w-5 text-accent mt-0.5 shrink-0" />
              <div>
                <h3 className="text-base font-semibold text-foreground mb-2">
                  Locums and State Taxes
                </h3>
                <p className="text-sm text-muted">
                  If you do locum work, you generally pay state income tax
                  based on WHERE you work, not where you live. Working
                  locums in Texas while living in California means the
                  locum income is taxed in Texas (0%) — but your California
                  W-2 income is still taxed by California. Some states have
                  reciprocal agreements. Consult a CPA if you work across
                  state lines.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Estimated Taxes */}
      <section id="estimated" className="py-12 sm:py-16 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-foreground mb-3">
            Estimated Taxes (for 1099 Income)
          </h2>
          <p className="text-muted mb-8 max-w-3xl">
            If you have any 1099 income, you must make quarterly estimated
            tax payments to avoid underpayment penalties. The penalty rate
            is currently ~8%.
          </p>

          <div className="rounded-xl border border-border bg-surface overflow-hidden mb-8">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface-alt">
                    <th className="text-left py-3 px-4 font-semibold text-foreground">
                      Due Date
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">
                      Period Covered
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">
                      Note
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {estimatedTaxInfo.map((item, idx) => (
                    <tr
                      key={item.date}
                      className={idx % 2 === 0 ? "" : "bg-surface-alt/50"}
                    >
                      <td className="py-3 px-4 font-medium text-accent">
                        {item.date}
                      </td>
                      <td className="py-3 px-4 text-foreground">{item.period}</td>
                      <td className="py-3 px-4 text-muted">{item.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-xl border border-warning/20 bg-warning/5 p-6">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-warning mt-0.5 shrink-0" />
              <div>
                <h3 className="text-base font-semibold text-foreground mb-2">
                  Safe Harbor Rule
                </h3>
                <p className="text-sm text-muted">
                  To avoid underpayment penalties, pay at least 110% of last
                  year&apos;s total tax liability through withholding +
                  estimated payments (100% if AGI was under $150K). Use IRS
                  Direct Pay or EFTPS (Electronic Federal Tax Payment System)
                  to make payments.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* When to Get a CPA */}
      <section id="cpa" className="py-12 sm:py-16 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-foreground mb-3">
            When to Get a CPA vs DIY
          </h2>
          <p className="text-muted mb-8 max-w-3xl">
            A physician-specialized CPA costs $500-2,000/year but typically
            saves $5,000-20,000/year in tax optimization. The ROI is
            almost always positive once your situation has any complexity.
          </p>

          <div className="grid gap-6 sm:grid-cols-2">
            {whenToGetCpa.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.scenario}
                  className="rounded-xl border border-border bg-surface p-6"
                >
                  <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Icon className={`h-5 w-5 ${item.color}`} />
                    {item.scenario}
                  </h3>
                  <ul className="space-y-2">
                    {item.criteria.map((criterion) => (
                      <li
                        key={criterion}
                        className="flex items-start gap-2 text-sm text-muted"
                      >
                        <ArrowRight className="h-3 w-3 mt-1.5 shrink-0 text-accent" />
                        {criterion}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          <div className="mt-6 rounded-xl border border-border bg-surface p-6">
            <h3 className="text-base font-semibold text-foreground mb-2">
              Finding a Physician-Specialized CPA
            </h3>
            <p className="text-sm text-muted leading-relaxed">
              They exist and they understand your specific deductions,
              retirement strategies, and career trajectory. Ask colleagues
              for referrals. White Coat Investor and physician financial
              planning communities often have recommendations by region.
              A CPA who does not understand physician compensation structures
              (RVUs, call pay, signing bonuses) will miss optimization
              opportunities.
            </p>
          </div>
        </div>
      </section>

      {/* IMG Tax Considerations */}
      <section id="img-taxes" className="py-12 sm:py-16 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-3">
            <Globe className="h-6 w-6 text-cyan" />
            <h2 className="text-2xl font-bold text-foreground">
              IMG-Specific Tax Considerations
            </h2>
          </div>
          <p className="text-muted mb-8 max-w-3xl">
            International medical graduates have unique tax obligations and
            opportunities that most accountants are not familiar with.
            Finding a CPA who understands international tax issues is
            especially important for IMGs.
          </p>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {imgTaxConsiderations.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="rounded-xl border border-border bg-surface p-6"
                >
                  <Icon className="h-5 w-5 text-cyan mb-3" />
                  <h3 className="text-base font-semibold text-foreground mb-2">
                    {item.title}
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

      {/* Disclaimer */}
      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-xl border border-border bg-surface-alt p-6">
            <p className="text-sm text-muted leading-relaxed">
              <span className="font-semibold text-foreground">Disclaimer:</span>{" "}
              This is general educational information, not tax advice. Tax
              laws change frequently, and individual situations vary
              significantly. Consult a qualified CPA or tax advisor for your
              specific situation. Dollar amounts, contribution limits, and
              tax rates reflect general guidance as of 2025-2026 and are
              subject to change.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
