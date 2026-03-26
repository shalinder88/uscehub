import type { Metadata } from "next";
import Link from "next/link";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import {
  FileText,
  Clock,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Globe,
  Shield,
  MapPin,
  ArrowRight,
  Info,
  ExternalLink,
} from "lucide-react";

export const metadata: Metadata = {
  title: "State Medical Licensing Guide for Physicians — USCEHub",
  description:
    "Complete guide to state medical licensing — processing times, fees, IMG requirements, IMLC Compact, FCVS, DEA registration, and the most common mistakes that delay your license.",
  alternates: {
    canonical: "https://uscehub.com/career/licensing",
  },
};

const SPEED_TIERS = [
  {
    tier: "Fast (2-6 weeks)",
    color: "text-success",
    bg: "bg-success/10",
    states: "Colorado, Florida, Indiana, Montana, Nebraska, Utah",
    tip: "Have FCVS profile ready before applying. Florida can process in under a week with FCVS.",
  },
  {
    tier: "Medium (6-12 weeks)",
    color: "text-warning",
    bg: "bg-warning/10",
    states: "Most IMLC states, Ohio, Michigan, Georgia, New York, Pennsylvania",
    tip: "Standard timeline. Submit complete applications to avoid delays. Apply 3-4 months before needed.",
  },
  {
    tier: "Slow (4-8+ months)",
    color: "text-danger",
    bg: "bg-danger/10",
    states: "California, Massachusetts, Texas, Nevada, Illinois",
    tip: "Start 6+ months early. CA requires 36 months GME for everyone. TX requires jurisprudence exam. MA rejects incomplete packages.",
  },
];

const IMG_EXTRAS = [
  "ECFMG certification (mandatory in all states)",
  "ECFMG Certification Status Report ($66 per state, valid 1 year)",
  "Medical diploma verified by ECFMG with issuing school",
  "Medical school transcripts verified by ECFMG",
  "World Directory of Medical Schools listing confirmation",
  "Translation of documents (if originals not in English)",
  "Visa/immigration status documentation (work authorization proof)",
  "Some states require 3 years GME (vs 1 year for US graduates)",
  "Detailed chronological history since graduation (every gap >30 days explained)",
];

const COMMON_MISTAKES = [
  { mistake: "Incomplete applications", detail: "Missing documents, outdated forms, unsigned pages. Double-check everything before submission." },
  { mistake: "Unexplained timeline gaps", detail: "Every gap of 30+ days since graduation must be explained — travel, unemployment, visa processing. Boards flag unexplained gaps." },
  { mistake: "Failure to disclose", detail: "Not reporting disciplinary actions, malpractice claims, criminal charges, or substance issues — even minor ones. Non-disclosure is worse than the issue itself." },
  { mistake: "Not chasing third-party verifications", detail: "Training programs, medical schools, and previous employers often ignore verification requests. YOU must follow up. Set calendar reminders." },
  { mistake: "Waiting until the last minute", detail: "Peak season (April-September) adds weeks to processing. Start 4-6 months before you need the license." },
  { mistake: "Not using FCVS", detail: "FCVS creates a permanent credential profile that follows you for life. $395 upfront but saves enormous time on subsequent state applications." },
];

export default function LicensingPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="rounded-lg bg-accent/10 p-2.5">
            <FileText className="h-6 w-6 text-accent" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
            State Medical Licensing Guide
          </h1>
        </div>
        <p className="text-muted max-w-2xl text-base leading-relaxed">
          50 states, 50 different processes. Here&apos;s what you need to know
          about getting licensed — processing times, fees, IMG-specific
          requirements, and the mistakes that cost physicians months of delay.
        </p>
        <div className="mt-3">
          <VerifiedBadge date="March 2026" sources={["FSMB", "IMLCC", "State Medical Boards"]} />
        </div>
      </div>

      {/* Processing Speed */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
          <Clock className="h-5 w-5 text-accent" />
          Processing Speed by State
        </h2>
        <div className="space-y-4">
          {SPEED_TIERS.map((tier) => (
            <div key={tier.tier} className={`rounded-xl border border-border bg-surface p-5`}>
              <div className="flex items-center gap-2 mb-2">
                <div className={`h-3 w-3 rounded-full ${tier.bg.replace("/10", "")}`} />
                <h3 className={`text-sm font-bold ${tier.color}`}>{tier.tier}</h3>
              </div>
              <p className="text-sm text-foreground mb-2">{tier.states}</p>
              <p className="text-xs text-muted">{tier.tip}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted">
          IMGs: add 2-8 weeks to all timelines for ECFMG verification and
          international document verification. Peak season (April-September)
          adds additional delays.
        </p>
      </section>

      {/* Key Numbers */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-success" />
          Key Numbers
        </h2>
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-alt">
                <th className="px-4 py-3 text-left font-semibold text-foreground">Item</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">Cost</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">Notes</th>
              </tr>
            </thead>
            <tbody>
              {[
                { item: "State license fee (range)", cost: "$35 - $1,425", note: "PA lowest ($35), NV highest ($1,425). Average ~$500." },
                { item: "FCVS initial application", cost: "$395", note: "Includes 1 profile to 1 state. Additional profiles $99 each. Worth it." },
                { item: "IMLC Compact fee", cost: "$700", note: "Plus individual state license fees. 44 member jurisdictions." },
                { item: "ECFMG Status Report (IMGs)", cost: "$66/state", note: "Valid 1 year. Required by most states for IMG applicants." },
                { item: "DEA registration", cost: "$888", note: "3-year registration. Separate registration per state. Apply AFTER license." },
                { item: "CDS registration", cost: "Up to $200", note: "Required in ~23 states. Apply through state pharmacy or medical board." },
                { item: "TX Jurisprudence Exam", cost: "~$58", note: "Online, open-book, 40 questions. Required for TX license." },
                { item: "SPEX exam (if required)", cost: "$1,400", note: "For physicians with gap in practice (12+ months). 200 questions, 6 hours." },
              ].map((row) => (
                <tr key={row.item} className="border-b border-border/50">
                  <td className="px-4 py-3 font-medium text-foreground">{row.item}</td>
                  <td className="px-4 py-3 text-accent font-mono font-bold">{row.cost}</td>
                  <td className="px-4 py-3 text-xs text-muted">{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* IMLC */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-foreground mb-3 flex items-center gap-2">
          <Globe className="h-5 w-5 text-cyan" />
          Interstate Medical Licensure Compact (IMLC)
        </h2>
        <p className="text-sm text-muted mb-4">
          The IMLC lets you get licenses in multiple states through one
          application. 44 jurisdictions (42 states + DC + Guam) are members.
          ~80% of physicians qualify.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="rounded-lg bg-success/5 border border-success/20 p-4">
            <h3 className="text-xs font-semibold text-success mb-2">HOW IT WORKS</h3>
            <ol className="space-y-1 text-xs text-muted list-decimal list-inside">
              <li>Designate your State of Principal License (where you primarily practice)</li>
              <li>Submit one application through IMLC ($700)</li>
              <li>IMLC verifies eligibility</li>
              <li>Select additional states — each issues its own license</li>
              <li>Pay each state&apos;s individual license fee</li>
              <li>Process takes weeks instead of months</li>
            </ol>
          </div>
          <div className="rounded-lg bg-warning/5 border border-warning/20 p-4">
            <h3 className="text-xs font-semibold text-warning mb-2">NOT MEMBERS (Important)</h3>
            <ul className="space-y-1 text-xs text-muted">
              <li><strong>California</strong> — not a member. Must apply directly.</li>
              <li><strong>Florida</strong> — not a member. Must apply directly.</li>
              <li><strong>New York</strong> — legislation passed but not yet implemented</li>
              <li>Hawaii, Vermont, Connecticut — limited participation</li>
            </ul>
            <p className="mt-2 text-xs text-muted">
              <a href="https://imlcc.com" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                Full member list at imlcc.com →
              </a>
            </p>
          </div>
        </div>
      </section>

      {/* IMG Requirements */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5 text-warning" />
          Additional IMG Requirements
        </h2>
        <p className="text-sm text-muted mb-4">
          Beyond what US graduates submit, IMGs need these additional documents:
        </p>
        <div className="space-y-2">
          {IMG_EXTRAS.map((req, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-muted">
              <CheckCircle2 className="h-4 w-4 text-accent mt-0.5 shrink-0" />
              {req}
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-lg bg-accent/5 border border-accent/20 p-4">
          <p className="text-xs text-muted">
            <strong className="text-accent">New in 2024-2026:</strong> At least 18 states
            have created alternative licensing pathways for IMGs without US
            residency — typically provisional/limited licenses with supervision
            requirements in underserved areas. States include: AZ, AR, IL, IA,
            NC, TN, VA, WI, FL, IN, LA, MN, NV, OK, OR, TX, and others. Check
            individual state medical board websites for current eligibility.
          </p>
        </div>
      </section>

      {/* Common Mistakes */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-danger" />
          Most Common Licensing Mistakes
        </h2>
        <div className="space-y-3">
          {COMMON_MISTAKES.map((m) => (
            <div key={m.mistake} className="rounded-lg border border-danger/20 bg-danger/5 p-4">
              <h3 className="text-sm font-semibold text-danger mb-1">{m.mistake}</h3>
              <p className="text-xs text-muted">{m.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FCVS */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-foreground mb-3">
          Should You Use FCVS?
        </h2>
        <div className="rounded-xl border border-border bg-surface p-6">
          <p className="text-sm text-muted mb-4">
            <strong className="text-foreground">Yes.</strong> FCVS creates a
            permanent, lifetime credential profile verified at the source. You
            do it once and it follows you forever. Every time you need a new
            state license, you pay $99 to send your FCVS profile instead of
            starting from scratch.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div className="rounded-lg bg-surface-alt p-3">
              <div className="text-lg font-bold text-accent">$395</div>
              <div className="text-xs text-muted">Initial setup</div>
            </div>
            <div className="rounded-lg bg-surface-alt p-3">
              <div className="text-lg font-bold text-accent">$99</div>
              <div className="text-xs text-muted">Each additional state</div>
            </div>
            <div className="rounded-lg bg-surface-alt p-3">
              <div className="text-lg font-bold text-accent">~35 days</div>
              <div className="text-xs text-muted">Initial processing</div>
            </div>
          </div>
          <p className="mt-4 text-xs text-muted">
            <a href="https://www.fsmb.org/fcvs/" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
              Apply at fsmb.org/fcvs →
            </a>
          </p>
        </div>
      </section>

      {/* DEA + CDS */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-foreground mb-4">
          DEA & CDS Registration
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-border bg-surface p-5">
            <h3 className="text-sm font-bold text-foreground mb-2">DEA (Federal)</h3>
            <ul className="space-y-1.5 text-xs text-muted">
              <li>Required to prescribe controlled substances (Schedules I-V)</li>
              <li>Apply AFTER getting state license: <a href="https://www.deadiversion.usdoj.gov/drugreg/registration.html" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">DEA Form 224</a></li>
              <li>Fee: $888 for 3 years</li>
              <li>Processing: 4-6 weeks</li>
              <li>Separate registration per state of principal practice</li>
              <li>Set renewal reminder — expired DEA = criminal risk</li>
            </ul>
          </div>
          <div className="rounded-xl border border-border bg-surface p-5">
            <h3 className="text-sm font-bold text-foreground mb-2">CDS (State — ~23 states)</h3>
            <ul className="space-y-1.5 text-xs text-muted">
              <li>State-level controlled substance registration</li>
              <li>Required in: AL, CT, DE, DC, HI, ID, IL, IN, IA, LA, MD, MA, MI, MO, NV, NJ, NM, OK, RI, SC, SD, UT, WY</li>
              <li>Fee: up to $200</li>
              <li>Apply through state pharmacy or medical board</li>
              <li>Need both DEA + CDS in these states</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Related */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link href="/career/waiver" className="rounded-xl border border-border bg-surface p-5 hover:border-accent/50 transition-colors group">
          <h3 className="font-semibold text-foreground group-hover:text-accent text-sm">J-1 Waiver Intelligence</h3>
          <p className="text-xs text-muted mt-1">State license is required before waiver filing in most states</p>
        </Link>
        <Link href="/residency/post-match" className="rounded-xl border border-border bg-surface p-5 hover:border-accent/50 transition-colors group">
          <h3 className="font-semibold text-foreground group-hover:text-accent text-sm">Post-Match Checklist</h3>
          <p className="text-xs text-muted mt-1">Licensing steps for new residents starting training</p>
        </Link>
      </div>
    </div>
  );
}
