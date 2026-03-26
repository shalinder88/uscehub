import type { Metadata } from "next";
import Link from "next/link";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import {
  GraduationCap,
  FileText,
  DollarSign,
  Clock,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Info,
  Globe,
  BookOpen,
} from "lucide-react";

export const metadata: Metadata = {
  title: "ECFMG Certification Guide 2026 — Pathways, Fees, Timeline — USCEHub",
  description:
    "Complete ECFMG certification guide for IMGs. Six pathways, USMLE requirements, OET scores, fees ($4,000+ total), timeline to certification, and the 7-year rule explained.",
  alternates: {
    canonical: "https://uscehub.com/career/ecfmg",
  },
};

const PATHWAYS = [
  {
    number: 1,
    name: "Unrestricted Medical License",
    description: "Hold or recently held an unrestricted license to practice medicine in any country.",
    eligibility: "License held at any time on or after January 1, 2021 (for 2026 applicants). Training/resident licenses do NOT qualify.",
    bestFor: "Physicians who practiced independently before coming to the US.",
  },
  {
    number: 2,
    name: "OSCE-Requiring School",
    description: "Graduate of a medical school that administers an OSCE required for licensure.",
    eligibility: "Graduation on or after January 1, 2023. School's country must require OSCE for licensure.",
    bestFor: "UK, Canadian, Australian medical graduates.",
  },
  {
    number: 3,
    name: "WFME-Accredited School",
    description: "Graduate of a school accredited by a WFME-recognized agency.",
    eligibility: "Graduation on or after January 1, 2023.",
    bestFor: "Most common pathway for graduates of accredited schools worldwide.",
  },
  {
    number: 4,
    name: "NCFMEA-Comparable Accreditation",
    description: "Graduate of a school accredited by an agency with NCFMEA comparability.",
    eligibility: "Graduation on or after January 1, 2023.",
    bestFor: "Similar to Pathway 3 but via US-recognized (NCFMEA) accreditation.",
  },
  {
    number: 5,
    name: "Joint Degree with US Institution",
    description: "Graduate of a school issuing a joint degree with an LCME-accredited US institution.",
    eligibility: "Graduation on or after January 1, 2023.",
    bestFor: "Caribbean schools with US clinical partnerships (e.g., some SGU, Ross, AUC programs).",
  },
  {
    number: 6,
    name: "Mini-CEX (Catch-All)",
    description: "Six real, in-person clinical encounters evaluated by licensed physicians using the ECFMG Mini-CEX.",
    eligibility: "For anyone who does not qualify for Pathways 1-5. Also required for anyone who previously failed Step 2 CS.",
    bestFor: "IMGs from unaccredited schools or those who need a clinical skills demonstration.",
  },
];

const FEES = [
  { item: "MyIntealth Account", fee: "$100", note: "One-time setup" },
  { item: "ECFMG Certification Application", fee: "$560", note: "" },
  { item: "Credential Verification", fee: "$200", note: "Diploma + transcript" },
  { item: "Pathway Application", fee: "$925", note: "Annual — must reapply if expired" },
  { item: "USMLE Step 1", fee: "$695", note: "Pass/fail since Jan 2022" },
  { item: "Step 1 International Surcharge", fee: "$205", note: "Only if testing outside US" },
  { item: "USMLE Step 2 CK", fee: "$695", note: "Scored (3-digit score)" },
  { item: "Step 2 CK International Surcharge", fee: "$205-230", note: "Only if testing outside US" },
  { item: "OET Medicine", fee: "~$455", note: "AUD $587 — test globally" },
];

const OET_SCORES = [
  { subtest: "Listening", minimum: "350", note: "B grade equivalent" },
  { subtest: "Reading", minimum: "350", note: "B grade equivalent" },
  { subtest: "Speaking", minimum: "350", note: "B grade equivalent" },
  { subtest: "Writing", minimum: "300", note: "C+ grade equivalent" },
];

const TIMELINE_2027 = [
  { date: "Spring 2026", action: "Create MyIntealth account, start credential verification", note: "Schools may take 8-12 weeks to respond" },
  { date: "Summer-Fall 2026", action: "Pass USMLE Step 1", note: "Pass/fail — just need to pass" },
  { date: "Anytime", action: "Pass OET Medicine", note: "Can overlap with USMLE prep" },
  { date: "Winter 2026 - Spring 2027", action: "Pass USMLE Step 2 CK", note: "Your scored exam — score matters for matching" },
  { date: "As soon as eligible", action: "Apply to Pathway", note: "Process takes 2-4 weeks" },
  { date: "By August 2027", action: "Obtain ECFMG Certificate", note: "Required before ERAS opens" },
  { date: "September 2027", action: "Submit ERAS application", note: "Apply to residency programs" },
  { date: "Oct 2027 - Jan 2028", action: "Interview season", note: "" },
  { date: "March 2028", action: "Match Day", note: "" },
];

export default function ECFMGGuidePage() {
  const totalMin = 100 + 560 + 200 + 925 + 695 + 205 + 695 + 205 + 455;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="rounded-lg bg-accent/10 p-2.5">
            <GraduationCap className="h-6 w-6 text-accent" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
            ECFMG Certification Guide
          </h1>
        </div>
        <p className="text-muted max-w-2xl text-base leading-relaxed">
          Everything you need to know about ECFMG certification in 2026.
          Six pathways, USMLE requirements, OET scores, fees, timeline,
          and the 7-year rule — all verified from official sources.
        </p>
        <div className="mt-3">
          <VerifiedBadge
            date="March 2026"
            sources={["ECFMG", "USMLE.org", "OET", "FSMB"]}
          />
        </div>
      </div>

      {/* Key change alert */}
      <div className="rounded-xl border border-warning/30 bg-warning/5 p-5 mb-8">
        <h3 className="text-sm font-bold text-warning mb-2 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          2026 Change: USMLE Registration Moved to FSMB
        </h3>
        <p className="text-xs text-muted">
          As of January 12, 2026, USMLE exam registration for IMGs is handled
          through <strong className="text-foreground">FSMB</strong>, not ECFMG/MyIntealth.
          Everything else (credential verification, Pathways, certification)
          remains with ECFMG. Source: ECFMG.org.
        </p>
      </div>

      {/* What you need */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-foreground mb-6">
          Four Requirements for ECFMG Certification
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { title: "USMLE Step 1", detail: "Pass/fail since Jan 2022. Tests basic medical science knowledge.", icon: BookOpen },
            { title: "USMLE Step 2 CK", detail: "Scored exam. Your score matters for residency matching.", icon: FileText },
            { title: "OET Medicine", detail: "English proficiency. Listening, Reading, Speaking, Writing.", icon: Globe },
            { title: "One Pathway", detail: "Clinical skills verification. Six options — most IMGs use Pathway 3 or 6.", icon: CheckCircle2 },
          ].map((req) => (
            <div key={req.title} className="rounded-xl border border-border bg-surface p-5">
              <div className="flex items-center gap-2 mb-2">
                <req.icon className="h-4 w-4 text-accent" />
                <h3 className="font-bold text-foreground text-sm">{req.title}</h3>
              </div>
              <p className="text-xs text-muted">{req.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 7-year rule */}
      <div className="rounded-xl border border-danger/30 bg-danger/5 p-5 mb-8 flex gap-3">
        <AlertTriangle className="h-5 w-5 text-danger shrink-0 mt-0.5" />
        <div>
          <h3 className="text-sm font-bold text-foreground mb-1">The 7-Year Rule</h3>
          <p className="text-xs text-muted">
            All examination requirements must be completed within <strong className="text-foreground">7 years</strong> of
            passing your first USMLE exam. If you pass Step 1 in 2025, you must
            complete all remaining requirements by 2032. If you exceed 7 years,
            you must retake all exams.
          </p>
        </div>
      </div>

      {/* Six Pathways */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          The Six Pathways (Replaced Step 2 CS)
        </h2>
        <p className="text-sm text-muted mb-6">
          Step 2 CS was permanently discontinued in January 2021. These six
          pathways now fulfill the clinical skills requirement. You only need one.
        </p>
        <div className="space-y-3">
          {PATHWAYS.map((p) => (
            <div key={p.number} className="rounded-xl border border-border bg-surface p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10 text-accent text-sm font-bold shrink-0">
                  {p.number}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-foreground text-sm mb-1">{p.name}</h3>
                  <p className="text-xs text-muted mb-2">{p.description}</p>
                  <p className="text-xs text-muted">
                    <strong className="text-foreground">Eligibility:</strong> {p.eligibility}
                  </p>
                  <p className="text-xs text-accent mt-1">Best for: {p.bestFor}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* OET Scores */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
          <Globe className="h-5 w-5 text-accent" />
          OET Medicine — Required Scores
        </h2>
        <p className="text-sm text-muted mb-4">
          All four sub-tests must be passed in a <strong className="text-foreground">single sitting</strong>.
          If you fail any one, you retake all four.
        </p>
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-alt">
                <th className="px-4 py-3 text-left font-semibold text-foreground">Sub-test</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">Minimum Score</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">Grade</th>
              </tr>
            </thead>
            <tbody>
              {OET_SCORES.map((s) => (
                <tr key={s.subtest} className="border-b border-border/50">
                  <td className="px-4 py-3 font-medium text-foreground">{s.subtest}</td>
                  <td className="px-4 py-3 text-accent font-bold font-mono">{s.minimum}</td>
                  <td className="px-4 py-3 text-xs text-muted">{s.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-muted">
          OET costs ~$455 USD (AUD $587). Available at Prometric centers worldwide
          and OET@Home (remote proctored). Results in ~10 business days.
          For 2026 Pathways: score must be from on or after January 1, 2024.
        </p>
      </section>

      {/* Fees */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-success" />
          Total Cost Breakdown
        </h2>
        <p className="text-sm text-muted mb-4">
          Testing internationally (with surcharges). Testing in the US saves ~$410.
        </p>
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-alt">
                <th className="px-4 py-3 text-left font-semibold text-foreground">Item</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">Fee</th>
                <th className="px-4 py-3 text-left font-semibold text-foreground">Note</th>
              </tr>
            </thead>
            <tbody>
              {FEES.map((f) => (
                <tr key={f.item} className="border-b border-border/50">
                  <td className="px-4 py-3 text-foreground">{f.item}</td>
                  <td className="px-4 py-3 text-success font-bold font-mono">{f.fee}</td>
                  <td className="px-4 py-3 text-xs text-muted">{f.note}</td>
                </tr>
              ))}
              <tr className="bg-surface-alt">
                <td className="px-4 py-3 font-bold text-foreground">Estimated Total</td>
                <td className="px-4 py-3 text-success font-bold font-mono text-lg">~$4,040</td>
                <td className="px-4 py-3 text-xs text-muted">Does not include study materials or retake fees</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Timeline for 2027 Match */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
          <Clock className="h-5 w-5 text-accent" />
          Timeline to Match in 2028 (Starting Now)
        </h2>
        <p className="text-sm text-muted mb-6">
          Best case: 12-18 months. Typical: 18-24 months. Allow extra time for
          credential verification delays.
        </p>
        <div className="space-y-3">
          {TIMELINE_2027.map((step, i) => (
            <div key={i} className="flex gap-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/10 text-accent text-xs font-bold shrink-0">
                {i + 1}
              </div>
              <div className="flex-1 border-b border-border pb-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">{step.action}</span>
                  <span className="text-xs text-accent shrink-0 ml-2">{step.date}</span>
                </div>
                {step.note && <p className="text-xs text-muted mt-0.5">{step.note}</p>}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Certificate expiration */}
      <div className="rounded-xl border border-border bg-surface-alt p-5 mb-8 flex gap-3">
        <Info className="h-5 w-5 text-accent shrink-0 mt-0.5" />
        <div className="text-xs text-muted">
          <strong className="text-foreground">Certificate Expiration:</strong> Pathway-based
          certificates expire 2 years after the pathway year (2026 pathway → expires Dec 31, 2028).
          Your certificate becomes <strong className="text-foreground">permanent</strong> after
          completing 12 months in an ACGME program or obtaining an unrestricted US license.
          Pre-2021 certificates (Step 2 CS-based) never expire.
        </div>
      </div>

      {/* Related tools */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/career/waiver" className="rounded-xl border border-border bg-surface p-5 hover:border-accent/50 transition-colors group">
          <h3 className="font-semibold text-foreground group-hover:text-accent text-sm">J-1 Waiver Guide</h3>
          <p className="text-xs text-muted mt-1">After certification — navigate the waiver process</p>
        </Link>
        <Link href="/career/visa-journey" className="rounded-xl border border-border bg-surface p-5 hover:border-accent/50 transition-colors group">
          <h3 className="font-semibold text-foreground group-hover:text-accent text-sm">Full Visa Journey</h3>
          <p className="text-xs text-muted mt-1">ECFMG → Match → Waiver → Green Card timeline</p>
        </Link>
        <Link href="/career/licensing" className="rounded-xl border border-border bg-surface p-5 hover:border-accent/50 transition-colors group">
          <h3 className="font-semibold text-foreground group-hover:text-accent text-sm">State Licensing</h3>
          <p className="text-xs text-muted mt-1">State medical board requirements after ECFMG</p>
        </Link>
      </div>
    </div>
  );
}
