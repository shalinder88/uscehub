import type { Metadata } from "next";
import Link from "next/link";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import {
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  Info,
  ArrowRight,
  Shield,
  GraduationCap,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Physician Loan Repayment Programs — NHSC, PSLF, State Programs — USCEHub",
  description:
    "Complete guide to physician loan repayment: NHSC ($75K-$160K tax-free), PSLF (full forgiveness after 120 payments), state programs (up to $300K), and how to stack them strategically.",
  alternates: {
    canonical: "https://uscehub.com/career/loan-repayment",
  },
};

const NHSC_PROGRAMS = [
  {
    name: "NHSC Loan Repayment Program (LRP)",
    amount: "Up to $75,000",
    commitment: "2 years full-time",
    extras: "Spanish Enhancement: +$5K. Continuation: $20K/yr after initial term.",
    eligible: "Primary care, mental health, dental",
    deadline: "March 31, 2026",
  },
  {
    name: "NHSC Students to Service (S2S)",
    amount: "Up to $120,000",
    commitment: "3 years full-time",
    extras: "Maternity Care Supplement: +$40K (total $160K). HPSA score 14+ required.",
    eligible: "Final-year medical students in primary care/dental/mental health",
    deadline: "Check nhsc.hrsa.gov",
  },
  {
    name: "NHSC SUD Workforce LRP",
    amount: "Up to $75,000",
    commitment: "3 years",
    extras: "Spanish Enhancement: +$5K. For substance use disorder treatment providers.",
    eligible: "Physicians, NPs, PAs, psychologists at SUD treatment facilities",
    deadline: "March 31, 2026",
  },
];

const STATE_PROGRAMS = [
  { state: "California", program: "CalHealthCares", max: "$300,000", years: "5 years" },
  { state: "Iowa", program: "Rural Primary LRP", max: "$200,000", years: "5 years" },
  { state: "Nebraska", program: "Rural Health LRP", max: "$200,000", years: "Varies" },
  { state: "Texas", program: "PELRP", max: "$180,000", years: "4 years" },
  { state: "Georgia", program: "Physician Education LRP", max: "$150,000", years: "4 years" },
  { state: "New York", program: "Doctors Across NY", max: "$150,000", years: "5 years" },
  { state: "Virginia", program: "State LRP", max: "$140,000", years: "4 years" },
  { state: "New Hampshire", program: "State LRP", max: "$115,000", years: "3-5 years" },
  { state: "Delaware", program: "State LRP", max: "$100,000", years: "Varies" },
  { state: "Idaho", program: "Rural Physician Incentive", max: "$100,000", years: "4 years" },
];

export default function LoanRepaymentPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="rounded-lg bg-success/10 p-2.5">
            <DollarSign className="h-6 w-6 text-success" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
            Physician Loan Repayment Programs
          </h1>
        </div>
        <p className="text-muted max-w-2xl text-base leading-relaxed">
          NHSC, PSLF, and state programs can cover your entire $250K+ in
          medical school debt — tax-free. Here&apos;s how they work, who
          qualifies, and how to stack them strategically.
        </p>
        <div className="mt-3">
          <VerifiedBadge
            date="March 2026"
            sources={["NHSC/HRSA", "StudentAid.gov", "State DOH websites"]}
          />
        </div>
      </div>

      {/* Critical J-1 warning */}
      <div className="rounded-xl border border-danger/30 bg-danger/5 p-5 mb-8 flex gap-3">
        <AlertTriangle className="h-5 w-5 text-danger shrink-0 mt-0.5" />
        <div>
          <h3 className="text-sm font-bold text-foreground mb-1">
            J-1 Waiver Physicians: NHSC Requires US Citizenship
          </h3>
          <p className="text-xs text-muted">
            NHSC loan repayment programs require U.S. citizenship (born or
            naturalized) or U.S. national status. Physicians on J-1 waivers,
            H-1B visas, or green cards do <strong className="text-foreground">not qualify</strong>.
            You may become eligible after naturalization. PSLF has no
            citizenship requirement but requires federal Direct Loans (only
            available for US school attendance).
          </p>
        </div>
      </div>

      {/* NHSC Programs */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
          <Shield className="h-5 w-5 text-accent" />
          NHSC Federal Programs (Tax-Free)
        </h2>
        <div className="space-y-4">
          {NHSC_PROGRAMS.map((prog) => (
            <div key={prog.name} className="rounded-xl border border-border bg-surface p-6">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-bold text-foreground">{prog.name}</h3>
                <span className="text-success font-bold font-mono text-lg shrink-0 ml-3">
                  {prog.amount}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-muted">
                <div>
                  <strong className="text-foreground">Commitment:</strong> {prog.commitment}
                </div>
                <div>
                  <strong className="text-foreground">Deadline:</strong> {prog.deadline}
                </div>
                <div className="sm:col-span-2">
                  <strong className="text-foreground">Eligible:</strong> {prog.eligible}
                </div>
                <div className="sm:col-span-2">
                  <strong className="text-foreground">Extras:</strong> {prog.extras}
                </div>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted">
          All NHSC funds are exempt from federal income and employment taxes.
          NHSC covers both federal AND private loans (unlike PSLF which is federal-only).
          Source: nhsc.hrsa.gov.
        </p>
      </section>

      {/* PSLF */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-accent" />
          Public Service Loan Forgiveness (PSLF)
        </h2>
        <div className="rounded-xl border border-border bg-surface p-6">
          <div className="space-y-4 text-sm text-muted">
            <div>
              <strong className="text-foreground">How it works:</strong> Forgives
              your remaining federal Direct Loan balance after 120 qualifying
              monthly payments (10 years) while working full-time for a qualifying
              employer (501(c)(3) nonprofit, government). Tax-free.
            </div>
            <div>
              <strong className="text-foreground">Residency counts:</strong> Payments
              during residency and fellowship at qualifying hospitals currently
              count toward the 120 payments. However, the 2025 &quot;One Big Beautiful
              Bill&quot; may exclude residency years for new borrowers — existing
              participants may be grandfathered.
            </div>
            <div>
              <strong className="text-foreground">Requirements:</strong>
            </div>
            <div className="space-y-1.5 ml-4">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-success mt-0.5 shrink-0" />
                <span>Federal Direct Loans only (consolidate FFEL/Perkins if needed)</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-success mt-0.5 shrink-0" />
                <span>Income-Driven Repayment plan (IBR, PAYE, REPAYE/SAVE)</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-success mt-0.5 shrink-0" />
                <span>Full-time at qualifying employer (most hospitals and universities qualify)</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-success mt-0.5 shrink-0" />
                <span>120 qualifying payments (do not need to be consecutive)</span>
              </div>
              <div className="flex items-start gap-2">
                <XCircle className="h-3.5 w-3.5 text-danger mt-0.5 shrink-0" />
                <span>Private practice does NOT qualify (unless nonprofit)</span>
              </div>
              <div className="flex items-start gap-2">
                <XCircle className="h-3.5 w-3.5 text-danger mt-0.5 shrink-0" />
                <span>Forbearance/deferment months do NOT count</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* State Programs */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
          <MapPin className="h-5 w-5 text-accent" />
          Top 10 State Loan Repayment Programs
        </h2>
        <p className="text-sm text-muted mb-4">
          States with the most generous physician loan repayment. Most require
          service in underserved areas.
        </p>
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-alt">
                <th className="px-4 py-3 text-left font-semibold text-foreground">State</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">Program</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">Max Award</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">Commitment</th>
              </tr>
            </thead>
            <tbody>
              {STATE_PROGRAMS.map((sp) => (
                <tr key={sp.state} className="border-b border-border/50">
                  <td className="px-4 py-3 font-medium text-foreground">{sp.state}</td>
                  <td className="px-4 py-3 text-muted">{sp.program}</td>
                  <td className="px-4 py-3 text-success font-bold font-mono">{sp.max}</td>
                  <td className="px-4 py-3 text-xs text-muted">{sp.years}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Stacking */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-foreground mb-4">
          Can You Stack Programs?
        </h2>
        <div className="space-y-3">
          <div className="rounded-lg border border-border bg-surface p-4 flex items-start gap-3">
            <CheckCircle2 className="h-4 w-4 text-success mt-0.5 shrink-0" />
            <div className="text-sm text-muted">
              <strong className="text-foreground">NHSC + PSLF:</strong> Yes.
              Serve at an NHSC site that is also a PSLF-qualifying employer.
              NHSC reduces principal (tax-free lump sum) while your monthly
              payments count toward PSLF&apos;s 120.
            </div>
          </div>
          <div className="rounded-lg border border-border bg-surface p-4 flex items-start gap-3">
            <CheckCircle2 className="h-4 w-4 text-success mt-0.5 shrink-0" />
            <div className="text-sm text-muted">
              <strong className="text-foreground">State LRP + PSLF:</strong> Yes.
              PSLF is not a service obligation, so you can receive state
              funds while making qualifying PSLF payments.
            </div>
          </div>
          <div className="rounded-lg border border-border bg-surface p-4 flex items-start gap-3">
            <XCircle className="h-4 w-4 text-danger mt-0.5 shrink-0" />
            <div className="text-sm text-muted">
              <strong className="text-foreground">NHSC + State LRP:</strong> Not
              simultaneously. You can complete one and then apply for the other
              sequentially.
            </div>
          </div>
          <div className="rounded-lg border border-border bg-surface p-4 flex items-start gap-3">
            <XCircle className="h-4 w-4 text-danger mt-0.5 shrink-0" />
            <div className="text-sm text-muted">
              <strong className="text-foreground">IHS + NHSC:</strong> Not
              simultaneously. IHS LRP offers up to $25K/year. Complete one
              before starting the other.
            </div>
          </div>
        </div>
      </section>

      {/* Maximum scenario */}
      <div className="rounded-xl border border-accent/30 bg-accent/5 p-6 mb-8">
        <h3 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-success" />
          Maximum Strategy: $250K in Loans → $0
        </h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <tbody>
              <tr className="border-b border-border/30">
                <td className="py-2 text-muted">NHSC LRP (primary care, 2 years)</td>
                <td className="py-2 text-success font-mono font-bold text-right">$75,000</td>
              </tr>
              <tr className="border-b border-border/30">
                <td className="py-2 text-muted">Spanish Enhancement</td>
                <td className="py-2 text-success font-mono font-bold text-right">$5,000</td>
              </tr>
              <tr className="border-b border-border/30">
                <td className="py-2 text-muted">NHSC Continuation (3 years × $20K)</td>
                <td className="py-2 text-success font-mono font-bold text-right">$60,000</td>
              </tr>
              <tr className="border-b border-border/30">
                <td className="py-2 text-muted">IDR payments during residency (count toward PSLF)</td>
                <td className="py-2 text-muted font-mono text-right">Minimal</td>
              </tr>
              <tr className="bg-surface">
                <td className="py-2 font-bold text-foreground">PSLF forgives remaining balance</td>
                <td className="py-2 text-success font-mono font-bold text-right">$110,000+</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-muted">
          Timeline: ~10 years of service in underserved areas. All tax-free.
          Requires US citizenship for NHSC. Consult a physician financial advisor.
        </p>
      </div>

      {/* Related */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/career/salary" className="rounded-xl border border-border bg-surface p-5 hover:border-accent/50 transition-colors group">
          <h3 className="font-semibold text-foreground group-hover:text-accent text-sm">Salary Benchmarks</h3>
          <p className="text-xs text-muted mt-1">Know your earning potential by specialty</p>
        </Link>
        <Link href="/career/waiver/hpsa-lookup" className="rounded-xl border border-border bg-surface p-5 hover:border-accent/50 transition-colors group">
          <h3 className="font-semibold text-foreground group-hover:text-accent text-sm">HPSA Lookup</h3>
          <p className="text-xs text-muted mt-1">Check if your site qualifies for NHSC</p>
        </Link>
        <Link href="/career/state-compare" className="rounded-xl border border-border bg-surface p-5 hover:border-accent/50 transition-colors group">
          <h3 className="font-semibold text-foreground group-hover:text-accent text-sm">State Comparison</h3>
          <p className="text-xs text-muted mt-1">Compare states by salary, tax, and loan programs</p>
        </Link>
      </div>
    </div>
  );
}
