import type { Metadata } from "next";
import Link from "next/link";
import {
  DollarSign,
  CreditCard,
  Shield,
  PiggyBank,
  Calculator,
  AlertTriangle,
  CheckCircle,
  Globe,
  ArrowRight,
  TrendingUp,
  Building2,
  Heart,
  FileText,
  Lightbulb,
  Clock,
  Ban,
} from "lucide-react";

export const metadata: Metadata = {
  title:
    "Financial Planning for Residents — Loans, Insurance, Retirement & Budgeting — USCEHub",
  description:
    "Real financial planning guide for residents: student loan strategy (PSLF vs refinance), disability insurance, Roth IRA during residency, budgeting on $58K-78K, and IMG-specific tax and credit considerations.",
  alternates: {
    canonical: "https://uscehub.com/residency/finances",
  },
  openGraph: {
    title: "Financial Planning for Residents — USCEHub",
    description:
      "Student loans, disability insurance, retirement accounts, and budgeting — practical financial guidance for residents.",
    url: "https://uscehub.com/residency/finances",
  },
};

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const financialReality = [
  { label: "Resident Salary Range", value: "$58,000 - $78,000", note: "PGY-1 to PGY-3+, varies by city and program" },
  { label: "Average Med School Debt", value: "$200,000+", note: "Some graduates carry over $300,000" },
  { label: "Interest Rate on Loans", value: "5-8%", note: "Interest accrues during residency" },
  { label: "Monthly Take-Home (after taxes)", value: "~$3,500 - $4,500", note: "After taxes, insurance, and minimum loan payments" },
];

const idrPlans = [
  {
    plan: "SAVE (Saving on a Valuable Education)",
    payment: "5-10% of discretionary income",
    forgiveness: "20-25 years (taxable)",
    notes: "Replaced REPAYE. Potentially lowest payments. Undergraduate interest may not capitalize.",
    recommended: true,
  },
  {
    plan: "PAYE (Pay As You Earn)",
    payment: "10% of discretionary income",
    forgiveness: "20 years (taxable)",
    notes: "Capped at 10-year standard payment amount. Good if income stays moderate.",
    recommended: false,
  },
  {
    plan: "IBR (Income-Based Repayment)",
    payment: "10-15% of discretionary income",
    forgiveness: "20-25 years (taxable)",
    notes: "Available to most borrowers. Payments are higher than SAVE/PAYE for most residents.",
    recommended: false,
  },
];

const pslfSteps = [
  "Enroll in an income-driven repayment plan immediately upon starting residency",
  "Confirm your employer qualifies (most teaching hospitals and academic medical centers do — they are 501(c)(3) nonprofits)",
  "Submit the PSLF Employment Certification Form every year (do not wait until 120 payments)",
  "Make 120 qualifying monthly payments while working full-time for a qualifying employer",
  "Remaining balance is forgiven TAX-FREE after 120 payments",
  "Track everything — use the PSLF Help Tool at studentaid.gov",
];

const disabilityInsuranceInfo = [
  {
    icon: Shield,
    title: "Why You Need It",
    content:
      "Your future earning potential is your biggest asset. A physician earning $300K/year for 30 years will earn $9 million. If you cannot practice medicine, everything collapses. Disability is more common than you think — about 1 in 4 workers becomes disabled before retirement.",
  },
  {
    icon: FileText,
    title: "Own-Occupation Policy (Critical)",
    content:
      "Get an 'own-occupation' policy that pays if you cannot do YOUR specific specialty. An 'any-occupation' policy only pays if you cannot work ANY job — meaning you could lose your surgery career but get nothing because you could technically work at a desk. Own-occupation is non-negotiable.",
  },
  {
    icon: DollarSign,
    title: "Cost During Residency",
    content:
      "$100-200/month for a $5,000-7,500/month benefit during residency. Your premiums are lower now because you are younger and (presumably) healthier. You lock in your health status — if you develop a condition later, it may be excluded or uninsurable.",
  },
  {
    icon: Building2,
    title: "Group vs Individual",
    content:
      "Your hospital may offer a group disability plan — it is often cheap but inadequate. Group plans are usually 'any-occupation,' may not be portable, and cap benefits. Get your OWN individual policy in addition to any group coverage.",
  },
  {
    icon: Heart,
    title: "Recommended Companies",
    content:
      "Guardian, MassMutual, Principal, Ohio National, and Ameritas are the most commonly recommended for physician disability policies. Work with an independent insurance broker who specializes in physicians — they can compare across carriers.",
  },
];

const retirementAccounts = [
  {
    account: "403(b)",
    limit: "$23,500/year (2025)",
    description: "Most hospitals offer this. At minimum, contribute enough to get the full employer match — that is free money you are leaving on the table.",
    priority: "1st — Get employer match",
    color: "text-accent",
  },
  {
    account: "Roth IRA",
    limit: "$7,000/year (2025)",
    description: "Your tax rate is LOW during residency. Put in post-tax dollars now, and it grows completely tax-free forever. Even $200/month during residency becomes $25,000+ by the time you reach attending salary thanks to compound interest.",
    priority: "2nd — Tax-free growth",
    color: "text-success",
  },
  {
    account: "Backdoor Roth IRA",
    limit: "$7,000/year (2025)",
    description: "If income exceeds Roth IRA limits (unlikely during residency but important for attending years): contribute to a traditional IRA, then convert to Roth. Legal and widely used by physicians. Learn the mechanics now.",
    priority: "Know for attending years",
    color: "text-cyan",
  },
];

const budgetBreakdown = [
  { category: "Housing", target: "<30% of take-home", amount: "$1,000 - $1,500", tip: "Get a roommate if in an expensive city. Your co-residents are natural roommates." },
  { category: "Emergency Fund", target: "3 months expenses", amount: "$5,000 - $10,000", tip: "Build slowly. Even $100/month adds up. This is non-negotiable — one car repair should not destroy you." },
  { category: "Student Loan Payments", target: "IDR minimum", amount: "$0 - $500", tip: "If pursuing PSLF, pay only the IDR minimum. Extra payments are wasted if the balance gets forgiven." },
  { category: "Disability Insurance", target: "Own-occupation policy", amount: "$100 - $200", tip: "Get this during PGY-1. Do not wait. Your health status is locked in at application." },
  { category: "Retirement (403b + Roth)", target: "Employer match + any extra", amount: "$200 - $600", tip: "At minimum: 403(b) match. Stretch goal: max Roth IRA ($583/month)." },
  { category: "Transportation", target: "Keep low", amount: "$200 - $500", tip: "Do not buy a new car. A reliable used car or public transit. Your attending salary is when you upgrade." },
];

const creditCardRules = [
  { icon: Ban, rule: "NEVER carry a balance", detail: "Credit card interest is 20-30%. This is financial self-harm. If you cannot pay in full, you cannot afford it." },
  { icon: CheckCircle, rule: "Use credit cards for everything (and pay in full)", detail: "Build credit score, earn rewards, get fraud protection. But ONLY if you pay the full statement balance every month." },
  { icon: AlertTriangle, rule: "Beware 'doctor loans'", detail: "0% down mortgages for physicians exist. They can be smart if you are staying 5+ years. But do not buy a house during residency unless you are certain you are staying — selling within 3 years usually loses money." },
];

const imgFinancialTips = [
  {
    icon: Globe,
    title: "Tax Treaty Benefits (J-1 Residents)",
    detail:
      "J-1 residents may be exempt from FICA taxes (Social Security + Medicare, ~7.65% of salary) for up to 2 years depending on your home country's tax treaty with the US. This saves $4,400-6,000 per year. Check IRS Publication 519 or ask your program's payroll office.",
  },
  {
    icon: CreditCard,
    title: "Build US Credit History Immediately",
    detail:
      "Get a secured credit card your first month in the US. Use it for small purchases and pay in full. After 6-12 months, apply for a regular card. Your credit score matters for apartments, car loans, and attending-year mortgages. Start at zero, not behind.",
  },
  {
    icon: FileText,
    title: "Get Your SSN Immediately",
    detail:
      "Apply for your Social Security Number as soon as you start work authorization. You need it for everything: bank accounts, credit cards, tax filing, state licenses. Do not use an ITIN longer than necessary.",
  },
  {
    icon: DollarSign,
    title: "Foreign Student Loans",
    detail:
      "Loans from foreign medical schools are NOT eligible for PSLF or US income-driven repayment plans. Budget for these separately. Refinancing with a US lender may lower your rate but check terms carefully.",
  },
  {
    icon: ArrowRight,
    title: "Sending Money Home (Remittances)",
    detail:
      "Use Wise (formerly TransferWise) or similar services — not Western Union. Bank wire transfers charge $25-50 per transfer plus unfavorable exchange rates. Wise typically saves 3-5% per transfer compared to traditional methods.",
  },
  {
    icon: Calculator,
    title: "ITIN vs SSN for Tax Filing",
    detail:
      "File taxes with your ITIN until your SSN is obtained. Once you have an SSN, file an amended return to link prior ITIN filings. This ensures you do not lose credit for payments made under your ITIN.",
  },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function FinancesPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline:
      "Financial Planning for Residents — Loans, Insurance, Retirement & Budgeting",
    description:
      "Real financial planning guide for medical residents: student loan strategy, disability insurance, retirement accounts, and IMG-specific financial considerations.",
    url: "https://uscehub.com/residency/finances",
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
        name: "Finances",
        item: "https://uscehub.com/residency/finances",
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
            <li className="text-foreground font-medium">Finances</li>
          </ol>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-12 sm:py-16 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-success/10 px-4 py-1.5 text-sm font-medium text-success mb-6">
              <DollarSign className="h-4 w-4" />
              Money During Training
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
              Financial Planning for Residents
            </h1>
            <p className="mt-4 text-lg text-muted leading-relaxed">
              You are technically in the top income tier with a bottom-tier
              net worth. The financial decisions you make during residency —
              especially around student loans and disability insurance — can
              save or cost you over $100,000. This is not about
              budgeting tips. This is about the big decisions that matter.
            </p>
          </div>
        </div>
      </section>

      {/* Your Financial Reality */}
      <section id="reality" className="py-12 sm:py-16 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-foreground mb-3">
            Your Financial Reality
          </h2>
          <p className="text-muted mb-8 max-w-3xl">
            Before making any financial decisions, understand where you actually
            stand. These numbers are real for most residents.
          </p>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {financialReality.map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-border bg-surface p-6"
              >
                <p className="text-xs text-muted uppercase tracking-wider mb-1">
                  {item.label}
                </p>
                <p className="text-2xl font-bold text-foreground mb-2">
                  {item.value}
                </p>
                <p className="text-xs text-muted">{item.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Student Loans */}
      <section id="loans" className="py-12 sm:py-16 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-foreground mb-3">
            Student Loans — The Decision That Can Save You $100,000+
          </h2>
          <p className="text-muted mb-8 max-w-3xl">
            This is the single most important financial decision of your
            residency. Get it right and you save six figures. Get it wrong
            and you pay for it for decades.
          </p>

          {/* IDR Plans */}
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Income-Driven Repayment Plans
          </h3>
          <div className="space-y-3 mb-8">
            {idrPlans.map((plan) => (
              <div
                key={plan.plan}
                className={`rounded-xl border p-5 ${
                  plan.recommended
                    ? "border-accent/30 bg-accent/5"
                    : "border-border bg-surface"
                }`}
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h4 className="text-base font-semibold text-foreground">
                    {plan.plan}
                  </h4>
                  {plan.recommended && (
                    <span className="shrink-0 text-xs font-medium px-2 py-0.5 rounded-full bg-accent/10 text-accent">
                      Most Common
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-4 text-xs text-muted mb-2">
                  <span>
                    <span className="font-medium text-foreground">Payment:</span>{" "}
                    {plan.payment}
                  </span>
                  <span>
                    <span className="font-medium text-foreground">Forgiveness:</span>{" "}
                    {plan.forgiveness}
                  </span>
                </div>
                <p className="text-sm text-muted">{plan.notes}</p>
              </div>
            ))}
          </div>

          {/* PSLF */}
          <div className="rounded-xl border border-success/30 bg-success/5 p-6 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="h-5 w-5 text-success" />
              <h3 className="text-lg font-semibold text-foreground">
                Public Service Loan Forgiveness (PSLF)
              </h3>
            </div>
            <p className="text-sm text-muted mb-4">
              MOST residency programs at teaching hospitals qualify. 120
              qualifying payments while working for a nonprofit or government
              employer, then the remaining balance is forgiven tax-free. This
              is the path for most residents.
            </p>
            <ol className="space-y-2">
              {pslfSteps.map((step, idx) => (
                <li key={step} className="flex items-start gap-3 text-sm text-muted">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-success/10 text-success text-xs font-bold shrink-0">
                    {idx + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </div>

          {/* Critical Warning */}
          <div className="rounded-xl border border-danger/30 bg-danger/5 p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-danger mt-0.5 shrink-0" />
              <div>
                <h3 className="text-base font-semibold text-foreground mb-2">
                  Critical: Do NOT Refinance if Pursuing PSLF
                </h3>
                <p className="text-sm text-muted">
                  If you refinance federal loans to private loans, you permanently
                  lose PSLF eligibility. Private lenders like SoFi and Earnest
                  will aggressively market to you. Their lower interest rates
                  seem attractive, but they cannot be forgiven. If you are
                  pursuing PSLF, keep your federal loans federal.
                </p>
                <p className="text-sm text-muted mt-2">
                  <span className="font-medium text-foreground">Exception:</span>{" "}
                  If you are NOT pursuing PSLF (planning private practice, no
                  qualifying employer), refinancing after PGY-1 can lower your
                  rate and save interest.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Disability Insurance */}
      <section id="disability" className="py-12 sm:py-16 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-3">
            <Shield className="h-6 w-6 text-warning" />
            <h2 className="text-2xl font-bold text-foreground">
              Disability Insurance (You NEED This)
            </h2>
          </div>
          <p className="text-muted mb-8 max-w-3xl">
            Nobody tells residents about disability insurance. Your program
            will not mention it. But this is arguably the most important
            financial product you will buy during residency.
          </p>

          <div className="space-y-4">
            {disabilityInsuranceInfo.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="rounded-xl border border-border bg-surface p-6"
                >
                  <div className="flex items-start gap-4">
                    <Icon className="h-5 w-5 text-warning mt-0.5 shrink-0" />
                    <div>
                      <h3 className="text-base font-semibold text-foreground mb-2">
                        {item.title}
                      </h3>
                      <p className="text-sm text-muted leading-relaxed">
                        {item.content}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Retirement */}
      <section id="retirement" className="py-12 sm:py-16 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-foreground mb-3">
            Retirement — Start Even If It Feels Impossible
          </h2>
          <p className="text-muted mb-8 max-w-3xl">
            Compound interest is the most powerful force in personal finance.
            Even small contributions during residency grow significantly by the
            time you retire. The earlier you start, the less you need to
            contribute later.
          </p>

          <div className="space-y-4 mb-8">
            {retirementAccounts.map((acct) => (
              <div
                key={acct.account}
                className="rounded-xl border border-border bg-surface p-6"
              >
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {acct.account}
                    </h3>
                    <span className="text-xs text-muted">
                      Limit: {acct.limit}
                    </span>
                  </div>
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full bg-surface-alt ${acct.color}`}>
                    {acct.priority}
                  </span>
                </div>
                <p className="text-sm text-muted leading-relaxed">
                  {acct.description}
                </p>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-accent/20 bg-accent/5 p-6">
            <div className="flex items-start gap-2">
              <Lightbulb className="h-5 w-5 text-accent mt-0.5 shrink-0" />
              <div>
                <h3 className="text-base font-semibold text-foreground mb-2">
                  The Math on Starting Early
                </h3>
                <p className="text-sm text-muted">
                  $200/month in a Roth IRA during 3 years of residency at 7%
                  average return = ~$8,000 contributed, growing to ~$25,000 by
                  age 65 even if you never add another dollar. But you will add
                  more. The habit matters as much as the amount.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Budgeting Reality */}
      <section id="budgeting" className="py-12 sm:py-16 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-foreground mb-3">
            Budgeting Reality
          </h2>
          <p className="text-muted mb-8 max-w-3xl">
            After taxes, insurance, and loan payments, you are living on
            $3,500-4,500 per month. Here is how to allocate it without
            losing your mind.
          </p>

          <div className="space-y-3 mb-8">
            {budgetBreakdown.map((item) => (
              <div
                key={item.category}
                className="rounded-xl border border-border bg-surface p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-base font-semibold text-foreground">
                      {item.category}
                    </h3>
                    <span className="text-xs text-muted">
                      Target: {item.target}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-accent">
                    {item.amount}/mo
                  </span>
                </div>
                <p className="text-sm text-muted">{item.tip}</p>
              </div>
            ))}
          </div>

          {/* Credit Card Rules */}
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Credit Card Rules
          </h3>
          <div className="space-y-3">
            {creditCardRules.map((rule) => {
              const Icon = rule.icon;
              return (
                <div
                  key={rule.rule}
                  className="rounded-xl border border-border bg-surface p-5"
                >
                  <div className="flex items-start gap-3">
                    <Icon className={`h-5 w-5 mt-0.5 shrink-0 ${
                      rule.icon === Ban ? "text-danger" : rule.icon === AlertTriangle ? "text-warning" : "text-success"
                    }`} />
                    <div>
                      <h4 className="text-sm font-semibold text-foreground mb-1">
                        {rule.rule}
                      </h4>
                      <p className="text-sm text-muted">{rule.detail}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* IMG Financial Considerations */}
      <section id="img-finances" className="py-12 sm:py-16 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-3">
            <Globe className="h-6 w-6 text-cyan" />
            <h2 className="text-2xl font-bold text-foreground">
              What IMGs Need to Know
            </h2>
          </div>
          <p className="text-muted mb-8 max-w-3xl">
            International medical graduates face unique financial challenges
            in the US — from building credit from zero to navigating tax
            treaties and sending money home.
          </p>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {imgFinancialTips.map((item) => {
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
              This is general educational information about financial planning
              during residency. It is not financial advice, tax advice, or
              legal advice. Student loan programs, tax laws, and insurance
              products change frequently. Consult a qualified financial advisor
              or CPA for your specific situation. Information reflects general
              guidance as of 2025-2026.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
