import type { Metadata } from "next";
import Link from "next/link";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import {
  AlertTriangle,
  Shield,
  XCircle,
  CheckCircle2,
  Clock,
  FileText,
  Scale,
  ArrowRight,
  Info,
  Building2,
} from "lucide-react";

export const metadata: Metadata = {
  title: "When Things Go Wrong During Your J-1 Waiver — USCEHub",
  description:
    "What to do when your J-1 waiver employer breaches the contract, goes bankrupt, or creates a hostile work environment. Extenuating circumstances transfers, non-compete violations, and how to protect yourself.",
  alternates: {
    canonical: "https://uscehub.com/career/waiver-problems",
  },
};

const NON_COMPETE_BAN_STATES = [
  { state: "California", detail: "Complete ban on all non-competes" },
  { state: "Minnesota", detail: "Complete ban on all non-competes" },
  { state: "North Dakota", detail: "Complete ban on all non-competes" },
  { state: "Oklahoma", detail: "Complete ban on all non-competes" },
  { state: "Arkansas", detail: "Physician-specific ban (effective mid-July 2025)" },
  { state: "Colorado", detail: "Broad ban with limited exceptions" },
  { state: "Indiana", detail: "Bans physician-hospital non-competes (effective July 2025)" },
  { state: "Louisiana", detail: "3yr limit primary care, 5yr limit specialists then ban (effective Jan 2025)" },
  { state: "Maryland", detail: "Void for healthcare workers earning $350K or less (effective July 2025)" },
  { state: "Montana", detail: "Expanded ban to all licensed physicians (signed May 2025)" },
  { state: "Oregon", detail: "Emergency restrictions for physicians, PAs, NPs (effective June 2025)" },
  { state: "Pennsylvania", detail: "Fair Contracting for Health Care Practitioners Act (effective Jan 2025)" },
  { state: "South Dakota", detail: "Void for most healthcare practitioners (effective July 2023)" },
  { state: "Texas", detail: "Buyout cap limited to annual salary (effective Sept 2025)" },
  { state: "Wyoming", detail: "Broad non-compete prohibition" },
];

export default function WaiverProblemsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="rounded-lg bg-danger/10 p-2.5">
            <AlertTriangle className="h-6 w-6 text-danger" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
            When Things Go Wrong During Your Waiver
          </h1>
        </div>
        <p className="text-muted max-w-2xl text-base leading-relaxed">
          Nobody warns you about this. Your employer can breach the contract,
          go bankrupt, or create an unbearable work environment — and your
          immigration status hangs in the balance. Here&apos;s what to do.
        </p>
        <div className="mt-3">
          <VerifiedBadge
            date="March 2026"
            sources={["USCIS Policy Manual", "INA 214(l)", "AILA", "Immigration law firms"]}
          />
        </div>
      </div>

      {/* Critical warning */}
      <div className="rounded-xl border border-danger/30 bg-danger/5 p-5 mb-8">
        <h3 className="text-sm font-bold text-foreground mb-2 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-danger" />
          The #1 Rule: Do NOT Resign Without Legal Counsel
        </h3>
        <p className="text-xs text-muted">
          If you voluntarily leave your waiver position without qualifying
          extenuating circumstances, your waiver becomes invalid. The 212(e)
          two-year home residency requirement is reinstated — for you, your
          spouse, and your children. You are blocked from immigrant visas,
          green cards, and H/L visa categories until you fulfill 2 years in
          your home country. <strong className="text-foreground">Get an
          immigration attorney before taking any action.</strong>
        </p>
      </div>

      {/* Section 1: Extenuating Circumstances */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <Shield className="h-5 w-5 text-accent" />
          Extenuating Circumstances Transfer
        </h2>
        <p className="text-sm text-muted mb-6">
          You can transfer to a new employer without restarting your 3-year
          clock if you have &quot;extenuating circumstances involving hardship
          beyond the physician&apos;s control.&quot; USCIS decides case-by-case.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="rounded-xl border border-border bg-surface p-5">
            <h3 className="text-sm font-bold text-success mb-3">What Qualifies</h3>
            <div className="space-y-2 text-xs text-muted">
              {[
                "Facility closure or bankruptcy",
                "Non-payment of salary or prevailing wage",
                "Employer breach of contract",
                "Employer refusing full-time hours in authorized area",
                "Unsafe working conditions or malpractice exposure",
                "Marriage, birth of child, or serious illness",
                "Hostile work environment (harder to prove but accepted)",
              ].map((item) => (
                <div key={item} className="flex items-start gap-2">
                  <CheckCircle2 className="h-3.5 w-3.5 text-success mt-0.5 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-border bg-surface p-5">
            <h3 className="text-sm font-bold text-danger mb-3">What Does NOT Qualify</h3>
            <div className="space-y-2 text-xs text-muted">
              {[
                "Disliking the location or community",
                "Finding a better-paying position elsewhere",
                "Personality conflicts (without documented hostility)",
                "Wanting to change specialties",
                "General unhappiness with rural practice",
                "Wanting to move closer to family",
              ].map((item) => (
                <div key={item} className="flex items-start gap-2">
                  <XCircle className="h-3.5 w-3.5 text-danger mt-0.5 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* How to transfer */}
        <div className="rounded-xl border border-accent/30 bg-accent/5 p-5">
          <h3 className="text-sm font-bold text-foreground mb-3">How to File a Transfer</h3>
          <div className="space-y-2 text-xs text-muted">
            {[
              "Document everything: emails, pay stubs, schedules, witness statements",
              "Find a new employer in a designated HPSA/MUA/MUP area",
              "Get a new employment contract covering the REMAINING balance of your 3 years",
              "File a NEW H-1B petition with USCIS (not a new waiver application)",
              "Include detailed evidence of extenuating circumstances",
              "A letter of release from your state DOH is helpful but not legally required",
              "You can begin working for the new employer once the H-1B petition is filed (portability applies)",
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-accent/20 text-accent text-[10px] font-bold shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <span>{step}</span>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[10px] text-muted italic">
            The 3-year clock does NOT restart. Time already served counts
            toward the total obligation.
          </p>
        </div>
      </section>

      {/* Section 2: Employer Bankruptcy */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
          <Building2 className="h-5 w-5 text-warning" />
          Your Employer Goes Bankrupt
        </h2>
        <div className="rounded-xl border border-warning/30 bg-warning/5 p-5">
          <div className="space-y-3 text-sm text-muted">
            <p>
              <strong className="text-foreground">Your waiver is NOT automatically revoked.</strong>{" "}
              Facility closure is explicitly recognized by USCIS as an
              extenuating circumstance. You can transfer.
            </p>
            <p>
              <strong className="text-danger">Critical difference from regular H-1B:</strong>{" "}
              Standard H-1B holders get a 60-day grace period to find a new
              employer. J-1 waiver physicians may have as little as{" "}
              <strong className="text-foreground">10 days</strong> to file a new
              H-1B petition. Contact an attorney immediately.
            </p>
            <p>
              The closing facility must notify the USCIS Service Center that
              approved the original I-129 petition.
            </p>
          </div>
        </div>
      </section>

      {/* Section 3: Waiver Denied */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5 text-accent" />
          USCIS Denies Your Waiver
        </h2>
        <div className="space-y-3 text-sm text-muted">
          <div className="rounded-lg border border-border bg-surface p-4">
            <strong className="text-foreground">Can you appeal?</strong> If
            USCIS denied it before DOS referral: yes, appeal to AAO. If denied
            due to a negative DOS recommendation: no appeal. DOS does not
            reconsider. Motions to reopen are available only with new evidence.
          </div>
          <div className="rounded-lg border border-border bg-surface p-4">
            <strong className="text-foreground">Can you reapply to a different state?</strong>{" "}
            Not on the same basis with the same facts. But you can apply under
            a different pathway (e.g., switch from Conrad to HHS) or reapply
            with genuinely new circumstances.
          </div>
          <div className="rounded-lg border border-border bg-surface p-4">
            <strong className="text-foreground">What happens to your J-1 status?</strong>{" "}
            A denial does not mean immediate deportation. You remain in your
            current status until it expires. But the 212(e) two-year home
            residency requirement remains in effect, blocking H, L, and K
            visas and green cards.
          </div>
        </div>
      </section>

      {/* Section 4: Non-Compete States */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
          <Scale className="h-5 w-5 text-accent" />
          States That Ban Physician Non-Competes (2025-2026)
        </h2>
        <p className="text-sm text-muted mb-4">
          Conrad 30 program rules prohibit non-competes during the waiver period.
          After the 3-year commitment, enforceability depends on state law.
          These states ban or heavily restrict physician non-competes:
        </p>
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-alt">
                <th className="px-4 py-3 text-left font-semibold text-foreground">State</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {NON_COMPETE_BAN_STATES.map((s) => (
                <tr key={s.state} className="border-b border-border/50">
                  <td className="px-4 py-3 font-medium text-foreground">{s.state}</td>
                  <td className="px-4 py-3 text-xs text-muted">{s.detail}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-muted">
          Sources: AMA, Littler Employment, Foley &amp; Lardner, Jackson Lewis.
          The FTC&apos;s proposed federal non-compete ban was blocked in August
          2024 and never took effect. State law is your only protection.
        </p>
      </section>

      {/* Bottom line */}
      <div className="rounded-xl border border-border bg-surface-alt p-6 mb-8">
        <h3 className="text-lg font-bold text-foreground mb-3">The Bottom Line</h3>
        <div className="space-y-2 text-sm text-muted">
          <p>
            <strong className="text-foreground">Document everything</strong> from
            day one — even if things are going well. Emails, schedules, pay
            stubs, patient volumes, contract terms. If things go wrong, your
            evidence is your lifeline.
          </p>
          <p>
            <strong className="text-foreground">Hire an immigration attorney
            before signing</strong>, not after problems start. A $500 contract
            review is the cheapest insurance you&apos;ll ever buy.
          </p>
          <p>
            <strong className="text-foreground">Never resign without legal
            counsel.</strong> The consequences are irreversible.
          </p>
        </div>
      </div>

      {/* Related */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/career/contract" className="rounded-xl border border-border bg-surface p-5 hover:border-accent/50 transition-colors group">
          <h3 className="font-semibold text-foreground group-hover:text-accent text-sm">Contract Checklist</h3>
          <p className="text-xs text-muted mt-1">Prevent problems before they start</p>
        </Link>
        <Link href="/career/attorneys" className="rounded-xl border border-border bg-surface p-5 hover:border-accent/50 transition-colors group">
          <h3 className="font-semibold text-foreground group-hover:text-accent text-sm">Immigration Attorneys</h3>
          <p className="text-xs text-muted mt-1">Find a specialist before you need one</p>
        </Link>
        <Link href="/career/waiver/process" className="rounded-xl border border-border bg-surface p-5 hover:border-accent/50 transition-colors group">
          <h3 className="font-semibold text-foreground group-hover:text-accent text-sm">Waiver Process Guide</h3>
          <p className="text-xs text-muted mt-1">Understand the full pathway step by step</p>
        </Link>
      </div>
    </div>
  );
}
