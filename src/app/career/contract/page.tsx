import type { Metadata } from "next";
import Link from "next/link";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import {
  FileSignature,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  DollarSign,
  Shield,
  Clock,
  MapPin,
  Globe,
  Scale,
  Users,
  ArrowRight,
  Info,
} from "lucide-react";

export const metadata: Metadata = {
  title: "J-1 Waiver Employment Contract Checklist — What Must Be Included",
  description:
    "Complete checklist for J-1 waiver physician employment contracts. Required clauses, prohibited terms, red flags, and what to negotiate. Protect yourself before signing.",
  alternates: {
    canonical: "https://uscehub.com/career/contract",
  },
};

const REQUIRED_CLAUSES = [
  {
    title: "HPSA/MUA Site Designation",
    detail: "Contract must specify the exact HPSA or MUA designated site(s) where you will practice. Include HPSA ID numbers. If the employer has multiple locations, clarify which one(s) are waiver-eligible.",
    critical: true,
  },
  {
    title: "3-Year Full-Time Commitment",
    detail: "Must state a minimum 3-year, full-time (40+ hours/week) service commitment. This is a federal requirement. Part-time arrangements do NOT satisfy the waiver obligation.",
    critical: true,
  },
  {
    title: "No Non-Compete Clause",
    detail: "Conrad 30 program rules prohibit restrictive covenants (non-compete clauses) in waiver contracts. State DOHs and DOS require removal before approval. If your employer includes one, it must be removed via addendum. After the 3-year waiver period, non-compete enforceability depends on state law.",
    critical: true,
  },
  {
    title: "Base Salary Amount",
    detail: "Exact guaranteed base salary in dollar amount. Not 'competitive' or 'market rate' — a number. This protects you if the employer tries to change compensation after your waiver is filed.",
    critical: true,
  },
  {
    title: "Benefits Package Details",
    detail: "Health insurance, malpractice insurance (occurrence vs claims-made), CME allowance, PTO/vacation days, retirement plan, relocation assistance, sign-on bonus (if any). All in writing.",
    critical: false,
  },
  {
    title: "Malpractice Insurance Type and Limits",
    detail: "Specify whether occurrence or claims-made. If claims-made, who pays tail coverage if you leave? Tail coverage can cost $10,000-50,000+. This must be addressed in the contract.",
    critical: true,
  },
  {
    title: "Termination Clauses",
    detail: "Under what conditions can the employer terminate you? 'For cause' is standard. 'Without cause' termination during your 3-year waiver period is a serious problem — it can jeopardize your immigration status. The contract should address what happens to your waiver obligation if terminated.",
    critical: true,
  },
  {
    title: "Visa Sponsorship Commitment",
    detail: "Employer agrees to: sponsor H-1B petition, pay H-1B filing fees, support green card process (if applicable). Get this in writing — verbal promises about visa support are worthless.",
    critical: true,
  },
  {
    title: "Immigration Attorney Fees",
    detail: "Who pays? Most reputable employers cover the J-1 waiver filing, H-1B petition, and related immigration costs. If they expect you to pay, budget $5,000-15,000.",
    critical: false,
  },
  {
    title: "Practice Details",
    detail: "Call schedule, patient volume expectations, clinic vs hospital vs both, administrative duties, teaching obligations, research time (if any). The more specific, the better.",
    critical: false,
  },
];

const PROHIBITED_TERMS = [
  {
    title: "Non-compete clauses",
    detail: "Conrad 30 program rules prohibit non-competes in waiver contracts. State health departments require their removal before approving the waiver. During the 3-year commitment, non-competes are unenforceable. After the waiver period, enforceability depends on your state's law.",
  },
  {
    title: "Salary reduction tied to productivity in year 1",
    detail: "Some contracts have a 'guaranteed base' that drops after 6 months if RVU targets aren't met. For a physician building a new patient panel in an underserved area, this is unreasonable. Negotiate a guaranteed base for at least the first year.",
  },
  {
    title: "Unilateral contract modification",
    detail: "Clauses allowing the employer to 'modify terms at any time' or 'change compensation structure with notice' are red flags. Your contract should be stable for the 3-year commitment.",
  },
  {
    title: "Requirement to repay visa costs if you leave",
    detail: "Some employers include clauses requiring repayment of immigration costs if you leave before a certain period. While common in private industry, these can be exploitative for waiver physicians who are already locked in for 3 years by federal law.",
  },
];

const NEGOTIATE_ITEMS = [
  { item: "Sign-on bonus", typical: "$30,000-46,000 avg (up to $325K)", note: "2025 average: $38,315 (up 23% YoY). FM: ~$30K, IM: ~$32K, GI: ~$46K. 3% of physicians got >$100K. Standard — not a special request. Source: AMN Healthcare 2025." },
  { item: "Relocation allowance", typical: "$12,000 avg (up to $100K)", note: "2025 average: $12,019 (up 12% YoY). Competitive roles in rural areas go higher. Ask for temporary housing (1-2 months) if relocating cross-country." },
  { item: "Student loan repayment", typical: "$50,000-200,000", note: "16% of physician contracts include loan repayment averaging $104,200. Separate from NHSC (requires US citizenship). PSLF-eligible if employer is 501(c)(3)." },
  { item: "CME allowance", typical: "$2,000-5,000/yr + 5-7 days", note: "Combined avg (sign-on + relocation + CME): $58,854. Include both dollar amount and time off in writing. Source: AMN Healthcare." },
  { item: "Tail coverage", typical: "$80,000-120,000 (1.5-3x annual premium)", note: "Most commonly overlooked. Occurrence policy eliminates this entirely — negotiate for occurrence-based. If claims-made, get employer-paid tail in writing. Source: ACP, White Coat Investor." },
  { item: "Green card sponsorship", typical: "Employer pays I-140 + PERM fees", note: "Get written commitment with TIMELINE — 'within 6 months of employment' not 'at employer's discretion.' H-1B filing costs legally must be paid by employer. Source: AILA." },
  { item: "Malpractice insurance type", typical: "Occurrence vs Claims-Made", note: "Occurrence = no tail needed, better for you. Standard limits: $1M/$3M. If claims-made, tail is your biggest hidden cost. Clarify in writing before signing." },
  { item: "Partnership track (if private group)", typical: "2-3 year timeline in writing", note: "Waiver physicians are told 'partnership after 3 years' verbally — get it in the contract with specific terms, buy-in amount, and revenue share formula." },
  { item: "Prevailing wage verification", typical: "At least DOL Level 2", note: "Look up prevailing wage at flag.dol.gov/wage-data/wage-search. Your salary must equal or exceed the prevailing wage for your specialty in the area. Some states require Level 2 minimum." },
];

export default function ContractChecklistPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="rounded-lg bg-accent/10 p-2.5">
            <FileSignature className="h-6 w-6 text-accent" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
            J-1 Waiver Contract Checklist
          </h1>
        </div>
        <p className="text-muted max-w-2xl text-base leading-relaxed">
          Your employment contract is the most important document in the waiver
          process. It protects you for 3 years. Don&apos;t sign anything until
          you&apos;ve checked every item on this list — and had an immigration
          attorney review it.
        </p>
        <div className="mt-3">
          <VerifiedBadge date="March 2026" sources={["USCIS", "ABA", "AILA"]} />
        </div>
      </div>

      {/* Required Clauses */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-success" />
          Must-Have Contract Clauses
        </h2>
        <p className="text-sm text-muted mb-6">
          Every J-1 waiver employment contract should include these. If any
          are missing, ask your attorney to add them before signing.
        </p>
        <div className="space-y-3">
          {REQUIRED_CLAUSES.map((clause) => (
            <div
              key={clause.title}
              className={`rounded-lg border p-4 ${
                clause.critical
                  ? "border-success/30 bg-success/5"
                  : "border-border bg-surface"
              }`}
            >
              <h3 className="text-sm font-semibold text-foreground mb-1 flex items-center gap-2">
                <CheckCircle2 className={`h-4 w-4 shrink-0 ${clause.critical ? "text-success" : "text-muted"}`} />
                {clause.title}
                {clause.critical && (
                  <span className="text-[10px] font-medium text-success bg-success/10 rounded px-1.5 py-0.5">
                    CRITICAL
                  </span>
                )}
              </h3>
              <p className="text-xs text-muted ml-6">{clause.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Prohibited Terms */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
          <XCircle className="h-5 w-5 text-danger" />
          Red Flags — Remove These Before Signing
        </h2>
        <p className="text-sm text-muted mb-6">
          If you see any of these in your contract, have your attorney
          negotiate their removal or modification.
        </p>
        <div className="space-y-3">
          {PROHIBITED_TERMS.map((term) => (
            <div
              key={term.title}
              className="rounded-lg border border-danger/20 bg-danger/5 p-4"
            >
              <h3 className="text-sm font-semibold text-danger mb-1 flex items-center gap-2">
                <XCircle className="h-4 w-4 shrink-0" />
                {term.title}
              </h3>
              <p className="text-xs text-muted ml-6">{term.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Negotiation Items */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-warning" />
          What to Negotiate
        </h2>
        <p className="text-sm text-muted mb-6">
          Everything below is negotiable. Waiver physicians have more leverage
          than they think — the employer filed for your waiver because they
          need you.
        </p>
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-alt">
                <th className="px-4 py-3 text-left font-semibold text-foreground">Item</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">Typical Range</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">Notes</th>
              </tr>
            </thead>
            <tbody>
              {NEGOTIATE_ITEMS.map((row) => (
                <tr key={row.item} className="border-b border-border/50">
                  <td className="px-4 py-3 font-medium text-foreground">{row.item}</td>
                  <td className="px-4 py-3 text-accent font-mono text-xs">{row.typical}</td>
                  <td className="px-4 py-3 text-xs text-muted">{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Final Warning */}
      <div className="rounded-xl border border-warning/30 bg-warning/5 p-6 flex gap-3">
        <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
        <div className="text-sm text-muted">
          <strong className="text-foreground">
            Do not sign without attorney review.
          </strong>{" "}
          This checklist is a guide, not legal advice. An immigration attorney
          who specializes in physician immigration should review your specific
          contract before you sign. The $3,000-5,000 for an attorney review
          is the best money you&apos;ll spend in this process — it protects you
          for the next 3 years.
        </div>
      </div>

      {/* Contract Review Stats */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
          <Scale className="h-5 w-5 text-accent" />
          Why Professional Contract Review Matters
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="rounded-xl border border-border bg-surface p-5 text-center">
            <div className="text-2xl font-bold text-accent">$7,000</div>
            <div className="text-xs text-muted mt-1">Average improvement per contract (Physicians Thrive, 20K+ reviewed)</div>
          </div>
          <div className="rounded-xl border border-border bg-surface p-5 text-center">
            <div className="text-2xl font-bold text-success">0%</div>
            <div className="text-xs text-muted mt-1">Offers lost due to negotiation (Physicians Thrive reports zero)</div>
          </div>
          <div className="rounded-xl border border-border bg-surface p-5 text-center">
            <div className="text-2xl font-bold text-warning">$80-120K</div>
            <div className="text-xs text-muted mt-1">Hidden tail coverage cost if not negotiated upfront</div>
          </div>
        </div>
        <div className="rounded-lg border border-border bg-surface-alt p-4 flex gap-3">
          <Info className="h-4 w-4 text-accent shrink-0 mt-0.5" />
          <p className="text-xs text-muted">
            <strong className="text-foreground">Prevailing wage lookup:</strong>{" "}
            Verify your offered salary meets DOL prevailing wage requirements at{" "}
            <a href="https://flag.dol.gov/wage-data/wage-search" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">flag.dol.gov/wage-data/wage-search</a>.
            Use SOC code 29-1215 (Family Medicine), 29-1216 (Internal Medicine), etc.
            Your H-1B salary must equal or exceed this — paying below prevailing wage
            can result in back wages, fines, and employer debarment from the H-1B program.
          </p>
        </div>
      </section>

      {/* Related */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          href="/career/waiver/timeline"
          className="rounded-xl border border-border bg-surface p-5 hover:border-accent/50 transition-colors group"
        >
          <h3 className="font-semibold text-foreground group-hover:text-accent text-sm">
            Timeline Calculator
          </h3>
          <p className="text-xs text-muted mt-1">
            See when to sign your contract relative to your J-1 end date
          </p>
        </Link>
        <Link
          href="/career/waiver-problems"
          className="rounded-xl border border-border bg-surface p-5 hover:border-accent/50 transition-colors group"
        >
          <h3 className="font-semibold text-foreground group-hover:text-accent text-sm">
            When Things Go Wrong
          </h3>
          <p className="text-xs text-muted mt-1">
            Employer breach, extenuating circumstances, non-compete bans
          </p>
        </Link>
        <Link
          href="/career/greencard"
          className="rounded-xl border border-border bg-surface p-5 hover:border-accent/50 transition-colors group"
        >
          <h3 className="font-semibold text-foreground group-hover:text-accent text-sm">
            Green Card Pathways
          </h3>
          <p className="text-xs text-muted mt-1">
            Plan your green card strategy while negotiating your contract
          </p>
        </Link>
      </div>
    </div>
  );
}
