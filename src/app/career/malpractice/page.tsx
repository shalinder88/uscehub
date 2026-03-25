import type { Metadata } from "next";
import {
  Shield,
  AlertTriangle,
  DollarSign,
  CheckCircle2,
  XCircle,
  MapPin,
  Lightbulb,
  FileText,
  Scale,
  ArrowRight,
  Info,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Malpractice Insurance Deep Dive — What Every New Attending Must Know",
  description:
    "Occurrence vs claims-made malpractice insurance explained for new attending physicians. Tail coverage costs, specialty premiums, state variations, and contract red flags. The $50K-200K decision you can't afford to get wrong.",
  alternates: {
    canonical: "https://uscehub.com/career/malpractice",
  },
  openGraph: {
    title: "Malpractice Insurance Deep Dive — USCEHub",
    description:
      "Occurrence vs claims-made explained. Tail coverage costs by specialty, state premium variations, and the contract terms that protect your career.",
    url: "https://uscehub.com/career/malpractice",
  },
};

/* ─── Data ─── */

interface SpecialtyPremium {
  specialty: string;
  low: number;
  high: number;
  risk: "low" | "moderate" | "high" | "very-high";
}

const SPECIALTY_PREMIUMS: SpecialtyPremium[] = [
  { specialty: "Psychiatry", low: 5000, high: 15000, risk: "low" },
  { specialty: "Family Medicine", low: 8000, high: 20000, risk: "low" },
  { specialty: "Internal Medicine", low: 10000, high: 25000, risk: "moderate" },
  { specialty: "Emergency Medicine", low: 20000, high: 50000, risk: "moderate" },
  { specialty: "Orthopedics", low: 25000, high: 60000, risk: "high" },
  { specialty: "General Surgery", low: 30000, high: 80000, risk: "high" },
  { specialty: "OB/GYN", low: 50000, high: 200000, risk: "very-high" },
  { specialty: "Neurosurgery", low: 80000, high: 300000, risk: "very-high" },
];

const riskColor: Record<string, string> = {
  low: "text-success",
  moderate: "text-warning",
  high: "text-danger",
  "very-high": "text-danger",
};

const riskBg: Record<string, string> = {
  low: "bg-success/10",
  moderate: "bg-warning/10",
  high: "bg-danger/10",
  "very-high": "bg-danger/10",
};

function fmt(n: number): string {
  if (n >= 1000) {
    return `$${(n / 1000).toFixed(0)}K`;
  }
  return `$${n.toLocaleString()}`;
}

/* ─── Page ─── */

export default function MalpracticePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="rounded-lg bg-danger/10 p-2.5">
            <Shield className="h-6 w-6 text-danger" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
            Malpractice Insurance Deep Dive
          </h1>
        </div>
        <p className="text-muted max-w-3xl text-base leading-relaxed">
          Getting malpractice insurance wrong can cost you $50,000 to $200,000.
          This is one of the most important financial decisions you will make as
          a new attending, and almost nobody in residency teaches it. Read every
          word.
        </p>
      </div>

      {/* ═══ SECTION 1: The Two Types ═══ */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
          <Scale className="h-5 w-5 text-accent" />
          The Two Types of Coverage
        </h2>
        <p className="text-muted mb-8 max-w-3xl">
          This distinction matters more than your salary negotiation. Understanding
          the difference between occurrence-based and claims-made policies is the
          single most important thing in your malpractice education.
        </p>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Occurrence-Based */}
          <div className="rounded-xl border border-success/30 bg-surface p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-lg bg-success/10 p-2">
                <CheckCircle2 className="h-5 w-5 text-success" />
              </div>
              <h3 className="text-lg font-bold text-success">
                Occurrence-Based
              </h3>
              <span className="ml-auto rounded-full bg-success/10 px-3 py-1 text-xs font-semibold text-success">
                Gold Standard
              </span>
            </div>
            <p className="text-sm text-muted mb-4">
              Covers any incident that <strong className="text-foreground">occurred</strong> during
              the policy period, regardless of when the claim is filed.
            </p>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                <span className="text-foreground">
                  If you leave the job, you are <strong>still covered</strong> for everything
                  that happened while you worked there
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                <span className="text-foreground">
                  No tail coverage needed — ever
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                <span className="text-foreground">
                  Always prefer this if available in your contract
                </span>
              </li>
              <li className="flex items-start gap-2">
                <DollarSign className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                <span className="text-muted">
                  More expensive annually: <strong className="text-foreground">$15,000–$50,000/year</strong> depending
                  on specialty and state
                </span>
              </li>
            </ul>
          </div>

          {/* Claims-Made */}
          <div className="rounded-xl border border-warning/30 bg-surface p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-lg bg-warning/10 p-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
              </div>
              <h3 className="text-lg font-bold text-warning">
                Claims-Made
              </h3>
              <span className="ml-auto rounded-full bg-warning/10 px-3 py-1 text-xs font-semibold text-warning">
                Requires Tail
              </span>
            </div>
            <p className="text-sm text-muted mb-4">
              Covers claims <strong className="text-foreground">filed</strong> during
              the policy period. If someone sues you after you leave, you are
              NOT covered unless you have tail coverage.
            </p>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <XCircle className="h-4 w-4 text-danger shrink-0 mt-0.5" />
                <span className="text-foreground">
                  Leaving without tail coverage means <strong>zero protection</strong> for
                  past incidents
                </span>
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                <span className="text-foreground">
                  Tail coverage (extended reporting period) costs{" "}
                  <strong>1.5–2.5x your annual premium</strong>
                </span>
              </li>
              <li className="flex items-start gap-2">
                <DollarSign className="h-4 w-4 text-warning shrink-0 mt-0.5" />
                <span className="text-muted">
                  Example: $30,000/year premium ={" "}
                  <strong className="text-danger">$45,000–$75,000 tail</strong>
                </span>
              </li>
              <li className="flex items-start gap-2">
                <Info className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                <span className="text-muted">
                  WHO pays the tail is one of the most important terms in your
                  contract
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ═══ SECTION 2: Tail Coverage ═══ */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-danger" />
          Tail Coverage — The $50K–$200K Question
        </h2>
        <p className="text-muted mb-8 max-w-3xl">
          If your contract says &ldquo;claims-made&rdquo; and does not mention
          tail coverage, stop everything and ask. If they will not pay tail,
          negotiate hard or walk away.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Employer Pays */}
          <div className="rounded-xl border border-success/30 bg-surface p-5">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="h-5 w-5 text-success" />
              <h3 className="font-bold text-success text-sm">Employer Pays Tail</h3>
            </div>
            <p className="text-sm text-muted">
              Best scenario. <strong className="text-foreground">Get it in writing.</strong> This
              should be explicitly stated in your employment agreement.
            </p>
          </div>

          {/* You Pay */}
          <div className="rounded-xl border border-danger/30 bg-surface p-5">
            <div className="flex items-center gap-2 mb-3">
              <XCircle className="h-5 w-5 text-danger" />
              <h3 className="font-bold text-danger text-sm">You Pay Tail</h3>
            </div>
            <p className="text-sm text-muted">
              Worst scenario. <strong className="text-foreground">Budget for it from day one.</strong> You
              could owe $45K–$200K+ when you leave.
            </p>
          </div>

          {/* Split */}
          <div className="rounded-xl border border-warning/30 bg-surface p-5">
            <div className="flex items-center gap-2 mb-3">
              <Scale className="h-5 w-5 text-warning" />
              <h3 className="font-bold text-warning text-sm">Split Cost</h3>
            </div>
            <p className="text-sm text-muted">
              Some contracts split the cost, or the employer pays if you stay a
              minimum number of years (commonly 3–5 years).
            </p>
          </div>

          {/* Nose Coverage */}
          <div className="rounded-xl border border-accent/30 bg-surface p-5">
            <div className="flex items-center gap-2 mb-3">
              <Info className="h-5 w-5 text-accent" />
              <h3 className="font-bold text-accent text-sm">Nose Coverage</h3>
            </div>
            <p className="text-sm text-muted">
              Your <strong className="text-foreground">new</strong> employer&apos;s policy covers
              prior acts from your previous job. Rare but it exists — always ask.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-danger/30 bg-danger/5 p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-danger shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-danger mb-2">
                Non-Negotiable Contract Check
              </h4>
              <p className="text-sm text-foreground leading-relaxed">
                Before you sign any contract with a claims-made policy, you must
                have a clear, written answer to:{" "}
                <strong>&ldquo;Who pays the tail if I leave?&rdquo;</strong> If
                the answer is &ldquo;you,&rdquo; calculate the cost and factor
                it into your total compensation evaluation. A $300K salary with
                $75K tail responsibility is really a $225K salary if you leave
                before the vesting period.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ SECTION 3: Cost by Specialty ═══ */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-accent" />
          Annual Premiums by Specialty (2025–2026)
        </h2>
        <p className="text-muted mb-8 max-w-3xl">
          Premiums vary enormously by specialty, geographic location, and claims
          history. These ranges represent typical annual costs.
        </p>

        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-surface-alt border-b border-border">
                <th className="text-left px-4 py-3 font-semibold text-foreground">
                  Specialty
                </th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">
                  Annual Premium Range
                </th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">
                  Est. Tail Cost (1.5–2.5x)
                </th>
                <th className="text-left px-4 py-3 font-semibold text-foreground">
                  Risk Level
                </th>
              </tr>
            </thead>
            <tbody>
              {SPECIALTY_PREMIUMS.map((sp, i) => (
                <tr
                  key={sp.specialty}
                  className={`border-b border-border ${
                    i % 2 === 0 ? "bg-surface" : "bg-surface-alt/50"
                  }`}
                >
                  <td className="px-4 py-3 font-medium text-foreground">
                    {sp.specialty}
                  </td>
                  <td className="px-4 py-3 text-foreground">
                    {fmt(sp.low)} – {fmt(sp.high)}
                  </td>
                  <td className="px-4 py-3 text-muted">
                    {fmt(Math.round(sp.low * 1.5))} – {fmt(Math.round(sp.high * 2.5))}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${riskColor[sp.risk]} ${riskBg[sp.risk]}`}
                    >
                      {sp.risk === "very-high" ? "Very High" : sp.risk.charAt(0).toUpperCase() + sp.risk.slice(1)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-muted mt-3">
          OB/GYN and Neurosurgery carry the highest premiums due to catastrophic
          claim potential and longer statute of limitations for birth injuries.
        </p>
      </section>

      {/* ═══ SECTION 4: State Variations ═══ */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
          <MapPin className="h-5 w-5 text-cyan" />
          State Variations — Where You Practice Matters
        </h2>
        <p className="text-muted mb-8 max-w-3xl">
          Your malpractice premium can double or triple depending on the state.
          Tort reform status is a major driver.
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Tort Reform States */}
          <div className="rounded-xl border border-success/30 bg-surface p-6">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 className="h-5 w-5 text-success" />
              <h3 className="font-bold text-success">
                Tort Reform States — Lower Premiums
              </h3>
            </div>
            <p className="text-sm text-muted mb-4">
              These states have damage caps and other protections that keep
              premiums lower.
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              {["TX", "IN", "LA", "MS", "CA*", "CO", "WI"].map((st) => (
                <span
                  key={st}
                  className="rounded-lg bg-success/10 px-3 py-1 text-xs font-semibold text-success"
                >
                  {st}
                </span>
              ))}
            </div>
            <ul className="space-y-2 text-sm text-muted">
              <li className="flex items-start gap-2">
                <ArrowRight className="h-3.5 w-3.5 text-success shrink-0 mt-1" />
                Caps on non-economic damages (pain and suffering)
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="h-3.5 w-3.5 text-success shrink-0 mt-1" />
                Pre-suit screening panels reduce frivolous claims
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="h-3.5 w-3.5 text-success shrink-0 mt-1" />
                Texas reformed in 2003 and saw 50%+ premium drops
              </li>
            </ul>
            <p className="text-xs text-muted mt-3">
              *CA has MICRA caps on non-economic damages but high cost of living offsets some savings.
            </p>
          </div>

          {/* Plaintiff-Friendly States */}
          <div className="rounded-xl border border-danger/30 bg-surface p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="h-5 w-5 text-danger" />
              <h3 className="font-bold text-danger">
                Plaintiff-Friendly States — Higher Premiums
              </h3>
            </div>
            <p className="text-sm text-muted mb-4">
              No caps on damages. Juries can award unlimited non-economic
              damages. Premiums can be 2–3x higher.
            </p>
            <div className="flex flex-wrap gap-2 mb-4">
              {["NY", "PA", "FL", "IL", "NJ", "CT"].map((st) => (
                <span
                  key={st}
                  className="rounded-lg bg-danger/10 px-3 py-1 text-xs font-semibold text-danger"
                >
                  {st}
                </span>
              ))}
            </div>
            <ul className="space-y-2 text-sm text-muted">
              <li className="flex items-start gap-2">
                <ArrowRight className="h-3.5 w-3.5 text-danger shrink-0 mt-1" />
                New York and Florida are the most expensive states
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="h-3.5 w-3.5 text-danger shrink-0 mt-1" />
                No caps on jury awards — verdicts regularly exceed $10M
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="h-3.5 w-3.5 text-danger shrink-0 mt-1" />
                OB/GYN in NY can pay $200K+/year in premiums alone
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ═══ SECTION 5: What New Attendings Must Know ═══ */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-warning" />
          What Every New Attending Must Know
        </h2>
        <p className="text-muted mb-8 max-w-3xl">
          These are the things nobody teaches you in residency but can make a
          six-figure difference in your financial outcome.
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              title: "Read Your Actual Policy",
              desc: "Not the summary, not the HR overview — the full policy document. Know exactly what is and is not covered.",
              icon: FileText,
              color: "text-accent",
              bg: "bg-accent/10",
            },
            {
              title: "Know Your Coverage Limits",
              desc: "Typical limits are $1M per occurrence / $3M aggregate. Understand what these numbers mean and whether they are adequate for your specialty.",
              icon: Shield,
              color: "text-cyan",
              bg: "bg-cyan/10",
            },
            {
              title: "Understand Damage Caps",
              desc: "Know your state's cap on non-economic damages (if any). This directly affects your risk exposure and premium costs.",
              icon: Scale,
              color: "text-success",
              bg: "bg-success/10",
            },
            {
              title: "Consent-to-Settle Clauses",
              desc: "Can the insurer settle a case without your permission? Some policies allow this — which means a settlement appears on your record even if you disagree.",
              icon: AlertTriangle,
              color: "text-warning",
              bg: "bg-warning/10",
            },
            {
              title: "Report Incidents Immediately",
              desc: "Report ANY incident that might become a claim. Late reporting can void your coverage entirely, leaving you personally liable.",
              icon: Info,
              color: "text-danger",
              bg: "bg-danger/10",
            },
            {
              title: "Keep Your Own Records",
              desc: "Maintain personal records of clinical decisions, especially for complex or high-risk cases. Your memory will fade but documentation will not.",
              icon: FileText,
              color: "text-foreground",
              bg: "bg-surface-alt",
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="rounded-xl border border-border bg-surface p-5"
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className={`rounded-lg ${item.bg} p-1.5`}>
                    <Icon className={`h-4 w-4 ${item.color}`} />
                  </div>
                  <h3 className="font-bold text-foreground text-sm">
                    {item.title}
                  </h3>
                </div>
                <p className="text-sm text-muted leading-relaxed">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ═══ SECTION 6: Common Mistakes ═══ */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
          <XCircle className="h-5 w-5 text-danger" />
          Common Mistakes That Cost Physicians Thousands
        </h2>
        <p className="text-muted mb-8 max-w-3xl">
          Every one of these mistakes is something we have seen real physicians
          make. Do not be one of them.
        </p>

        <div className="space-y-4">
          {[
            {
              mistake: "Assuming your employer handles everything",
              reality:
                "Many employers carry only the bare minimum coverage. You may need supplemental or personal coverage, and you definitely need to understand what their policy actually covers.",
            },
            {
              mistake: "Not reading the tail provision in your contract",
              reality:
                "If your contract is claims-made, the tail provision is the most financially significant clause in your entire agreement. A missing or vague tail clause can cost you $50K-200K when you leave.",
            },
            {
              mistake: "Not budgeting for tail if you might leave within 3-5 years",
              reality:
                "If you are responsible for tail and you leave after 3 years, you need that money ready. Start saving from your first paycheck if tail is your responsibility.",
            },
            {
              mistake: "Assuming all claims-made policies are the same",
              reality:
                "Retroactive dates, prior acts coverage, consent-to-settle clauses, and coverage limits vary dramatically between policies. The details matter.",
            },
            {
              mistake: "Not getting personal umbrella coverage",
              reality:
                "Your employer's policy protects the employer. A personal umbrella policy provides an extra layer of protection for your personal assets beyond your professional coverage.",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="rounded-xl border border-border bg-surface p-5"
            >
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-danger/10 p-1.5 shrink-0 mt-0.5">
                  <XCircle className="h-4 w-4 text-danger" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-sm mb-1">
                    {item.mistake}
                  </h3>
                  <p className="text-sm text-muted leading-relaxed">
                    {item.reality}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ Bottom CTA ═══ */}
      <section className="rounded-xl border border-accent/30 bg-accent/5 p-8 text-center">
        <h2 className="text-xl font-bold text-foreground mb-3">
          Bottom Line
        </h2>
        <p className="text-muted max-w-2xl mx-auto text-sm leading-relaxed">
          Occurrence-based is always better if you can get it. If you are stuck
          with claims-made, make sure someone else is paying the tail — or at
          minimum that the cost is factored into your total compensation. This
          is not something you figure out later. Get it right before you sign.
        </p>
      </section>
    </div>
  );
}
