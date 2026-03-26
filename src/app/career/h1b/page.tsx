import type { Metadata } from "next";
import Link from "next/link";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import {
  Globe,
  Clock,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Building2,
  FileText,
  Shield,
  ArrowRight,
  Info,
  Users,
} from "lucide-react";

export const metadata: Metadata = {
  title: "H-1B Visa Guide for Physicians — Cap-Exempt, Transfer, Fees — USCEHub",
  description:
    "Complete H-1B guide for physicians: cap-exempt employers, transfer rules, filing fees, premium processing, and what happens after your J-1 waiver. Updated for 2026.",
  alternates: {
    canonical: "https://uscehub.com/career/h1b",
  },
};

const CAP_EXEMPT_CATEGORIES = [
  {
    category: "Nonprofit Hospitals (501(c)(3))",
    description: "Most academic medical centers, community hospitals, and health systems organized as nonprofits. This includes the majority of large hospital systems in the US.",
    examples: "Cleveland Clinic, Mayo Clinic, Johns Hopkins, Massachusetts General, UPMC, Kaiser Permanente, Intermountain, Geisinger, NewYork-Presbyterian",
    icon: Building2,
  },
  {
    category: "Higher Education Institutions",
    description: "Medical schools and university-affiliated hospitals. Any employer that is an institution of higher education or a related/affiliated nonprofit entity.",
    examples: "All university medical centers: Harvard/Partners, Stanford, UCSF, Columbia, NYU, University of Michigan, Ohio State, etc.",
    icon: Users,
  },
  {
    category: "Government Research Organizations",
    description: "Federal agencies whose primary mission includes research. Important: VA Medical Centers are NOT cap-exempt (patient care is primary mission, not research). Pending legislation (Expanding Health Care Providers for Veterans Act) would change this.",
    examples: "NIH Clinical Center, CDC, national labs. NOT VA hospitals (contrary to common belief).",
    icon: Shield,
  },
  {
    category: "Nonprofit Research Organizations",
    description: "Nonprofit entities whose primary mission includes research. Must be affiliated with or related to a higher education institution.",
    examples: "Research institutes affiliated with universities, some independent research hospitals",
    icon: FileText,
  },
];

const H1B_FACTS = [
  { label: "Standard filing fee (employer ≤25 employees)", value: "$1,710", note: "I-129 base + ACWIA fee + Fraud Prevention fee" },
  { label: "Standard filing fee (employer >25 employees)", value: "$2,460", note: "Higher ACWIA fee for larger employers" },
  { label: "Premium processing fee", value: "$2,965", note: "15-day processing guarantee (increased March 1, 2026). Strongly recommended." },
  { label: "H-1B cap-exempt: filing window", value: "Year-round", note: "No lottery. No October 1 start date requirement. File anytime." },
  { label: "H-1B cap-subject: filing window", value: "April lottery only", note: "Must win lottery first. Very rare for physician employers." },
  { label: "Maximum H-1B duration", value: "6 years", note: "3 years initial, renewable for 3 more. Extensions possible if I-140 approved." },
  { label: "H-1B portability (transfer)", value: "Yes — can start working for new employer when petition is filed", note: "Don't need to wait for approval. Key protection for physician mobility." },
];

const TRANSFER_STEPS = [
  {
    step: 1,
    title: "New employer files H-1B transfer petition",
    detail: "Your new employer files Form I-129 with USCIS requesting a 'change of employer' H-1B. They should use premium processing ($2,805) for 15-day adjudication.",
  },
  {
    step: 2,
    title: "You can begin working for the new employer immediately",
    detail: "Under H-1B portability rules (AC21), you can start working for the new employer as soon as the petition is filed (not approved). This is one of the most physician-friendly features of H-1B.",
  },
  {
    step: 3,
    title: "USCIS adjudicates the transfer",
    detail: "With premium processing: 15 business days. Without: 3-6 months. If approved, you get a new I-797 approval notice for the new employer.",
  },
  {
    step: 4,
    title: "Update your records",
    detail: "New I-797 serves as work authorization. If you need to travel internationally, you may need a new visa stamp at a US consulate.",
  },
];

const WAIVER_SPECIFIC = [
  {
    title: "Can I transfer H-1B during my 3-year waiver commitment?",
    answer: "Technically yes, but practically very risky. Your waiver obligation is to work at the specific HPSA site for 3 years. Leaving before completion may trigger the 2-year home residency requirement. Only transfer after completing the full 3 years unless you have explicit legal guidance.",
    risk: "high",
  },
  {
    title: "What happens after my 3-year waiver commitment ends?",
    answer: "You are free to transfer your H-1B to any employer (cap-exempt or cap-subject, since you're already in H-1B status). Most physicians stay with their waiver employer for a total of 4-5 years while the green card processes, then transfer.",
    risk: "low",
  },
  {
    title: "Can I moonlight on H-1B during my waiver?",
    answer: "Generally no, unless the moonlighting is at the same waiver-designated site. Working at a different location requires a separate H-1B petition for that employer. Unauthorized employment can jeopardize your immigration status.",
    risk: "high",
  },
  {
    title: "What if my waiver employer closes or breaches the contract?",
    answer: "This is a serious situation. Contact an immigration attorney immediately. You may have a 60-day grace period to find a new H-1B sponsor. USCIS may allow you to transfer your waiver obligation to a new qualifying employer, but this requires legal intervention.",
    risk: "high",
  },
  {
    title: "Can I do a fellowship after waiver completion on H-1B?",
    answer: "Yes, if the fellowship institution sponsors your H-1B (most academic centers are cap-exempt). The fellowship counts as a new H-1B petition. You need to ensure your H-1B duration hasn't expired (6-year max, with extensions if I-140 is approved).",
    risk: "low",
  },
];

export default function H1BPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="rounded-lg bg-accent/10 p-2.5">
            <Globe className="h-6 w-6 text-accent" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
            H-1B Visa Guide for Physicians
          </h1>
        </div>
        <p className="text-muted max-w-3xl text-base leading-relaxed">
          Everything physicians need to know about H-1B status — cap-exempt
          employers, transfer rules, filing fees (including the $100K
          supplemental fee), and navigating the system after your J-1 waiver.
        </p>

        {/* $100K Fee Alert */}
        <div className="mt-4 rounded-xl border border-danger/30 bg-danger/5 p-4 flex gap-3">
          <AlertTriangle className="h-5 w-5 text-danger shrink-0 mt-0.5" />
          <div className="text-xs text-muted">
            <strong className="text-danger">$100,000 H-1B Fee Is Now Law</strong> — Presidential Proclamation 10973 (signed Sept 19, 2025) imposes a $100K supplemental fee on new H-1B petitions requiring consular processing. Applies to cap-exempt employers too. Does NOT apply to change-of-status, extensions, or many transfers for people already in the US. Expires Sept 2026 unless renewed. Physician exemption bill (H-1Bs for Physicians Act) has been introduced. Litigation ongoing in multiple courts. Source: Federal Register, AMA, AHA.
          </div>
        </div>
        <div className="mt-3">
          <VerifiedBadge date="March 2026" sources={["USCIS", "DOL", "AILA"]} />
        </div>
      </div>

      {/* Key Facts */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-foreground mb-6">
          H-1B Key Facts for Physicians
        </h2>
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-alt">
                <th className="px-4 py-3 text-left font-semibold text-foreground">Item</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">Value</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">Notes</th>
              </tr>
            </thead>
            <tbody>
              {H1B_FACTS.map((fact) => (
                <tr key={fact.label} className="border-b border-border/50">
                  <td className="px-4 py-3 font-medium text-foreground">{fact.label}</td>
                  <td className="px-4 py-3 text-accent font-mono font-bold">{fact.value}</td>
                  <td className="px-4 py-3 text-xs text-muted">{fact.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Cap-Exempt Employers */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
          <Building2 className="h-5 w-5 text-success" />
          H-1B Cap-Exempt Employer Categories
        </h2>
        <p className="text-sm text-muted mb-6">
          Most physician employers are cap-exempt — meaning they can file H-1B
          petitions year-round without going through the April lottery. This is
          a huge advantage for physician immigration.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {CAP_EXEMPT_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <div key={cat.category} className="rounded-xl border border-border bg-surface p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Icon className="h-4 w-4 text-success" />
                  <h3 className="text-sm font-semibold text-foreground">{cat.category}</h3>
                </div>
                <p className="text-xs text-muted mb-2">{cat.description}</p>
                <p className="text-xs text-accent">
                  <strong>Examples:</strong> {cat.examples}
                </p>
              </div>
            );
          })}
        </div>
        <div className="mt-4 rounded-lg bg-success/5 border border-success/20 p-4">
          <p className="text-xs text-muted">
            <strong className="text-success">Key insight:</strong> Academic
            medical centers affiliated with universities are the safest bet for
            confirmed cap-exempt status. Being a 501(c)(3) nonprofit alone is
            NOT sufficient — the employer must have a formal affiliation with a
            higher education institution or qualify as a research organization.
            VA hospitals are NOT currently cap-exempt (contrary to common
            belief). Private for-profit practice groups are cap-subject.
          </p>
        </div>
      </section>

      {/* H-1B Transfer */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
          <ArrowRight className="h-5 w-5 text-accent" />
          H-1B Transfer (Changing Employers)
        </h2>
        <div className="space-y-4">
          {TRANSFER_STEPS.map((step) => (
            <div key={step.step} className="flex gap-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10 text-accent text-sm font-bold shrink-0">
                {step.step}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">{step.title}</h3>
                <p className="text-xs text-muted mt-1">{step.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Waiver-Specific Q&A */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-warning" />
          J-1 Waiver Physicians: Common H-1B Questions
        </h2>
        <div className="space-y-4">
          {WAIVER_SPECIFIC.map((qa) => (
            <div
              key={qa.title}
              className={`rounded-xl border p-5 ${
                qa.risk === "high"
                  ? "border-danger/20 bg-danger/5"
                  : "border-border bg-surface"
              }`}
            >
              <h3 className="text-sm font-semibold text-foreground mb-2">
                {qa.title}
                {qa.risk === "high" && (
                  <span className="ml-2 text-[10px] font-medium text-danger bg-danger/10 rounded px-1.5 py-0.5">
                    HIGH RISK
                  </span>
                )}
              </h3>
              <p className="text-xs text-muted leading-relaxed">{qa.answer}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Warning */}
      <div className="rounded-xl border border-warning/30 bg-warning/5 p-6 mb-8 flex gap-3">
        <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
        <div className="text-sm text-muted">
          <strong className="text-foreground">Immigration law is complex and changes frequently.</strong>{" "}
          This guide provides general information. Your specific situation may
          differ. Always consult an immigration attorney who specializes in
          physician immigration before making decisions that affect your
          status.
        </div>
      </div>

      {/* Related */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/career/waiver" className="rounded-xl border border-border bg-surface p-5 hover:border-accent/50 transition-colors group">
          <h3 className="font-semibold text-foreground group-hover:text-accent text-sm">J-1 Waiver Guide</h3>
          <p className="text-xs text-muted mt-1">Conrad 30 and alternative pathways</p>
        </Link>
        <Link href="/career/greencard" className="rounded-xl border border-border bg-surface p-5 hover:border-accent/50 transition-colors group">
          <h3 className="font-semibold text-foreground group-hover:text-accent text-sm">Green Card Pathways</h3>
          <p className="text-xs text-muted mt-1">EB-2 NIW, EB-1, PERM after waiver</p>
        </Link>
        <Link href="/career/contract" className="rounded-xl border border-border bg-surface p-5 hover:border-accent/50 transition-colors group">
          <h3 className="font-semibold text-foreground group-hover:text-accent text-sm">Contract Checklist</h3>
          <p className="text-xs text-muted mt-1">What must be in your waiver contract</p>
        </Link>
      </div>
    </div>
  );
}
