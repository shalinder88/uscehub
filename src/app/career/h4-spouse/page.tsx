import type { Metadata } from "next";
import Link from "next/link";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import {
  Heart,
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Briefcase,
  Home,
  GraduationCap,
  Users,
  Info,
  ExternalLink,
} from "lucide-react";

export const metadata: Metadata = {
  title: "H-4 Visa Spouse Guide — Work Authorization, EAD, Resources",
  description:
    "Guide for H-4 visa spouses of physician H-1B holders. EAD eligibility, processing times, career options, mental health resources, and what to expect during the waiver years.",
  alternates: {
    canonical: "https://uscehub.com/career/h4-spouse",
  },
};

export default function H4SpousePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="rounded-lg bg-accent/10 p-2.5">
            <Heart className="h-6 w-6 text-accent" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
            H-4 Visa Spouse Guide
          </h1>
        </div>
        <p className="text-muted max-w-2xl text-base leading-relaxed">
          If your spouse is a physician on H-1B, this page is for you.
          Work authorization, career options, mental health resources, and
          what to expect during the waiver years — written honestly.
        </p>
        <div className="mt-3">
          <VerifiedBadge date="March 2026" sources={["USCIS", "DHS", "PMC Research"]} />
        </div>
      </div>

      {/* The reality */}
      <div className="rounded-xl border border-warning/30 bg-warning/5 p-6 mb-8">
        <h2 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-warning" />
          The Honest Reality
        </h2>
        <p className="text-sm text-muted leading-relaxed">
          The H-4 visa has been called &quot;the depression visa&quot; by
          researchers. Studies published in PMC found significantly higher
          levels of stress, anxiety, and depression among H-4 holders,
          driven by unemployment, identity loss, and dependency. This is
          not weakness — it&apos;s the predictable result of a system that
          strips professional identity from accomplished people. If you&apos;re
          struggling, you are not alone, and it is not your fault.
        </p>
      </div>

      {/* Can I work? */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-accent" />
          Can I Work on H-4?
        </h2>
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-surface p-5">
            <h3 className="text-sm font-bold text-foreground mb-2">
              With EAD (Employment Authorization Document) — Yes
            </h3>
            <p className="text-xs text-muted mb-3">
              H-4 spouses can work if they obtain an EAD. Eligibility requires
              that your H-1B spouse has an approved I-140 petition.
            </p>
            <div className="space-y-2 text-xs text-muted">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-success mt-0.5 shrink-0" />
                <span>File Form I-765 with USCIS ($410 filing fee)</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-success mt-0.5 shrink-0" />
                <span>Requires approved I-140 for your H-1B spouse</span>
              </div>
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-3.5 w-3.5 text-warning mt-0.5 shrink-0" />
                <span>Current processing: 5.5-12+ months (standalone applications taking longest)</span>
              </div>
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-3.5 w-3.5 text-warning mt-0.5 shrink-0" />
                <span>Automatic extension settlement expired January 2025 — renewals may have gaps</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface p-5">
            <h3 className="text-sm font-bold text-foreground mb-2">
              Without EAD — No Traditional Employment
            </h3>
            <p className="text-xs text-muted mb-3">
              Without an EAD, you cannot be employed by a US employer.
              However, you can:
            </p>
            <div className="space-y-2 text-xs text-muted">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-accent mt-0.5 shrink-0" />
                <span>Volunteer (unpaid, for nonprofit organizations)</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-accent mt-0.5 shrink-0" />
                <span>Study full-time (change to F-1 status or enroll as H-4)</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-accent mt-0.5 shrink-0" />
                <span>Start an online business in your home country</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-accent mt-0.5 shrink-0" />
                <span>Get certifications and professional development</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline to EAD */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <Clock className="h-5 w-5 text-accent" />
          When Can I Get an EAD?
        </h2>
        <div className="space-y-3">
          {[
            { step: "Spouse starts waiver service on H-1B", time: "Day 1 of 3-year waiver" },
            { step: "Spouse files I-140 (EB-2 NIW or EB-1)", time: "Year 1-2 of waiver (recommended)" },
            { step: "I-140 is approved by USCIS", time: "4-12 months after filing" },
            { step: "YOU file I-765 (EAD application)", time: "Immediately after I-140 approval" },
            { step: "USCIS processes your EAD", time: "5.5-12+ months currently" },
            { step: "You receive EAD — can legally work", time: "Total: ~2-3 years from waiver start" },
          ].map((item, i) => (
            <div key={i} className="flex gap-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/10 text-accent text-xs font-bold shrink-0">
                {i + 1}
              </div>
              <div className="flex-1 flex items-center justify-between border-b border-border pb-3">
                <span className="text-sm text-foreground">{item.step}</span>
                <span className="text-xs text-muted shrink-0 ml-2">{item.time}</span>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-xs text-muted">
          This is why your spouse should file I-140 early — it unlocks YOUR
          ability to work. Every month of delay on I-140 is a month added
          to your wait for work authorization.
        </p>
      </section>

      {/* Practical advice */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
          <GraduationCap className="h-5 w-5 text-accent" />
          What to Do While Waiting
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-border bg-surface p-5">
            <h3 className="text-sm font-bold text-foreground mb-2">Build Skills</h3>
            <ul className="space-y-1.5 text-xs text-muted">
              <li>• Online certifications (Google, AWS, Coursera)</li>
              <li>• Learn coding, data science, or digital marketing</li>
              <li>• Get a US degree (community college → university)</li>
              <li>• Professional license prep for your field</li>
            </ul>
          </div>
          <div className="rounded-xl border border-border bg-surface p-5">
            <h3 className="text-sm font-bold text-foreground mb-2">Build Community</h3>
            <ul className="space-y-1.5 text-xs text-muted">
              <li>• Join local physician spouse groups</li>
              <li>• Volunteer at organizations you care about</li>
              <li>• Connect with other H-4 spouses online</li>
              <li>• Join cultural organizations in your area</li>
            </ul>
          </div>
          <div className="rounded-xl border border-border bg-surface p-5">
            <h3 className="text-sm font-bold text-foreground mb-2">Protect Your Mental Health</h3>
            <ul className="space-y-1.5 text-xs text-muted">
              <li>• Therapy is not weakness — it&apos;s strategic</li>
              <li>• Many therapists offer sliding scale fees</li>
              <li>• Open Path Collective: therapy from $30-80/session</li>
              <li>• SAMHSA helpline: 1-800-662-4357 (free)</li>
            </ul>
          </div>
          <div className="rounded-xl border border-border bg-surface p-5">
            <h3 className="text-sm font-bold text-foreground mb-2">Plan for the EAD</h3>
            <ul className="space-y-1.5 text-xs text-muted">
              <li>• Update your resume for US market</li>
              <li>• Build LinkedIn profile and network</li>
              <li>• Apply for SSN when EAD is approved</li>
              <li>• Open a personal bank account with SSN</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Financial */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
          <Home className="h-5 w-5 text-accent" />
          Practical Matters
        </h2>
        <div className="space-y-3 text-sm text-muted">
          <div className="rounded-lg border border-border bg-surface p-4">
            <strong className="text-foreground">Driver&apos;s license:</strong> Most
            states issue driver&apos;s licenses to H-4 holders. Bring: passport,
            I-94, I-797 (spouse&apos;s), marriage certificate, proof of address.
            Some states require SSN — you can get an ITIN or apply for SSN
            if you have pending EAD.
          </div>
          <div className="rounded-lg border border-border bg-surface p-4">
            <strong className="text-foreground">Banking:</strong> You can open a
            bank account with H-4 status using passport + ITIN. Chase,
            Citibank, and HSBC are generally H-4 friendly.
          </div>
          <div className="rounded-lg border border-border bg-surface p-4">
            <strong className="text-foreground">Credit history:</strong> Difficult
            to build without SSN. Secured credit cards (Discover, Capital One)
            accept ITIN. Building credit early helps when you eventually get
            work authorization and want to rent, buy, or finance.
          </div>
        </div>
      </section>

      {/* Info */}
      <div className="rounded-xl border border-border bg-surface-alt p-5 flex gap-3">
        <Info className="h-5 w-5 text-accent shrink-0 mt-0.5" />
        <div className="text-xs text-muted">
          <strong className="text-foreground">This page exists because
          nobody talks about this.</strong> The H-4 spouse experience is one
          of the hardest parts of physician immigration, and it&apos;s almost
          completely invisible in immigration resources. If you found this
          helpful, share it with someone who needs it.
        </div>
      </div>

      {/* Related Tools */}
      <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/career/visa-bulletin" className="rounded-xl border border-border bg-surface p-5 hover:border-accent/50 transition-colors group">
          <h3 className="font-semibold text-foreground group-hover:text-accent text-sm">Visa Bulletin Tracker</h3>
          <p className="text-xs text-muted mt-1">Track your spouse&apos;s EB-2/EB-1 priority date</p>
        </Link>
        <Link href="/career/greencard" className="rounded-xl border border-border bg-surface p-5 hover:border-accent/50 transition-colors group">
          <h3 className="font-semibold text-foreground group-hover:text-accent text-sm">Green Card Pathways</h3>
          <p className="text-xs text-muted mt-1">EB-2 NIW, EB-1, PERM — which unlocks your EAD</p>
        </Link>
        <Link href="/career/h1b" className="rounded-xl border border-border bg-surface p-5 hover:border-accent/50 transition-colors group">
          <h3 className="font-semibold text-foreground group-hover:text-accent text-sm">H-1B Guide</h3>
          <p className="text-xs text-muted mt-1">Your spouse&apos;s visa status affects your EAD eligibility</p>
        </Link>
      </div>
    </div>
  );
}
