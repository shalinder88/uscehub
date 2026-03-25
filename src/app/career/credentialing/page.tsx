import type { Metadata } from "next";
import {
  ClipboardCheck,
  Clock,
  FileText,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Lightbulb,
  Building2,
  GraduationCap,
  Globe,
  XCircle,
  Info,
  Calendar,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Credentialing & Privileging Guide — Start 6 Months Early",
  description:
    "Complete guide to hospital credentialing, clinical privileging, and insurance paneling for new attending physicians. Timelines, required documents, common pitfalls, and IMG-specific guidance. Start early or you cannot see patients on day one.",
  alternates: {
    canonical: "https://uscehub.com/career/credentialing",
  },
  openGraph: {
    title: "Credentialing & Privileging Guide — USCEHub",
    description:
      "Hospital credentialing takes 3-6 months. Documents checklist, timeline, insurance paneling, and IMG-specific tips so you can see patients on day one.",
    url: "https://uscehub.com/career/credentialing",
  },
};

/* ─── Data ─── */

interface TimelineStep {
  monthsBefore: string;
  title: string;
  details: string;
  status: "action" | "waiting" | "milestone";
}

const TIMELINE: TimelineStep[] = [
  {
    monthsBefore: "6 months",
    title: "Begin Application & Gather Documents",
    details:
      "Request your credentialing application packet. Start collecting every document on the checklist. Order official transcripts, updated CV, and contact your references to warn them.",
    status: "action",
  },
  {
    monthsBefore: "5 months",
    title: "Submit Completed Application",
    details:
      "Submit the full application with ALL supporting documents. Incomplete submissions go to the bottom of the pile. One missing document can delay you by weeks.",
    status: "action",
  },
  {
    monthsBefore: "4 months",
    title: "Primary Source Verification",
    details:
      "The hospital verifies your medical school, residency, licenses, DEA, board certification, and queries the NPDB (National Practitioner Data Bank). This is out of your hands but you can follow up.",
    status: "waiting",
  },
  {
    monthsBefore: "3 months",
    title: "Medical Staff Committee Review",
    details:
      "Your application goes before the credentials committee. They review everything and make a recommendation. Gaps or discrepancies trigger additional review.",
    status: "waiting",
  },
  {
    monthsBefore: "2 months",
    title: "Provisional Privileges May Be Granted",
    details:
      "Some hospitals grant provisional privileges at this stage, allowing you to start seeing patients under supervision while final approval is pending.",
    status: "milestone",
  },
  {
    monthsBefore: "1 month",
    title: "Board of Directors Final Approval",
    details:
      "The hospital board gives final sign-off. This is usually a formality if the committee approved, but board meetings may only happen monthly.",
    status: "milestone",
  },
  {
    monthsBefore: "Day 1",
    title: "You Can See Patients",
    details:
      "If everything went smoothly, you are fully credentialed and privileged. If not, you may be sitting in orientation unable to generate revenue.",
    status: "milestone",
  },
];

const statusColor: Record<string, string> = {
  action: "border-accent bg-accent/10 text-accent",
  waiting: "border-warning bg-warning/10 text-warning",
  milestone: "border-success bg-success/10 text-success",
};

interface Document {
  name: string;
  note: string;
  category: "education" | "license" | "professional" | "personal" | "clinical";
}

const DOCUMENTS: Document[] = [
  { name: "Medical school diploma", note: "Official copy; IMGs also need ECFMG certificate", category: "education" },
  { name: "Residency completion letter", note: "From your program director on institutional letterhead", category: "education" },
  { name: "Board certification or eligibility letter", note: "From ABMS member board; eligibility letter if not yet certified", category: "education" },
  { name: "USMLE/COMLEX transcripts", note: "Official score reports from NBME/NBOME", category: "education" },
  { name: "State medical license", note: "Must be active in the state where you will practice", category: "license" },
  { name: "DEA registration", note: "Apply early — processing takes 4-6 weeks", category: "license" },
  { name: "CDS registration", note: "State controlled substance registration if your state requires it", category: "license" },
  { name: "NPI number", note: "Apply via NPPES if you do not already have one", category: "license" },
  { name: "Malpractice insurance face sheet", note: "Shows coverage type, limits, and policy period", category: "professional" },
  { name: "Curriculum vitae (CV)", note: "Chronological, no gaps — explain every gap with dates and reason", category: "professional" },
  { name: "3-5 professional references", note: "Attendings and program director; warn them in advance", category: "professional" },
  { name: "CME credits", note: "If required by your state or specialty board for initial credentialing", category: "professional" },
  { name: "Procedure log", note: "If privileging requires minimum procedure numbers for your specialty", category: "clinical" },
  { name: "Immunization records", note: "Hep B titer, TB test, flu, COVID — varies by hospital", category: "personal" },
  { name: "Photo ID and SSN", note: "Government-issued photo identification", category: "personal" },
  { name: "Proof of work authorization", note: "Citizenship, green card, or valid work visa documentation", category: "personal" },
];

const categoryLabels: Record<string, string> = {
  education: "Education & Training",
  license: "Licenses & Registrations",
  professional: "Professional Documents",
  clinical: "Clinical Documentation",
  personal: "Personal Identification",
};

const categoryColors: Record<string, string> = {
  education: "text-accent",
  license: "text-cyan",
  professional: "text-success",
  clinical: "text-warning",
  personal: "text-muted",
};

/* ─── Page ─── */

export default function CredentialingPage() {
  const grouped = DOCUMENTS.reduce(
    (acc, doc) => {
      if (!acc[doc.category]) acc[doc.category] = [];
      acc[doc.category].push(doc);
      return acc;
    },
    {} as Record<string, Document[]>,
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="rounded-lg bg-accent/10 p-2.5">
            <ClipboardCheck className="h-6 w-6 text-accent" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
            Credentialing &amp; Privileging Guide
          </h1>
        </div>
        <p className="text-muted max-w-3xl text-base leading-relaxed">
          Nobody warns you that credentialing takes 3 to 6 months. If you do not
          start early enough, you literally cannot see patients on day one. That
          means zero revenue for your employer and a terrible first impression.
          Start in PGY-3 if you can.
        </p>
      </div>

      {/* ═══ SECTION 1: What Is What ═══ */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
          <Info className="h-5 w-5 text-accent" />
          Credentialing vs Privileging vs Paneling
        </h2>
        <p className="text-muted mb-8 max-w-3xl">
          These are three separate processes. All three must be complete before
          you can independently see patients and generate revenue.
        </p>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="rounded-xl border border-accent/30 bg-surface p-6">
            <div className="flex items-center gap-2 mb-3">
              <ClipboardCheck className="h-5 w-5 text-accent" />
              <h3 className="font-bold text-accent">Credentialing</h3>
            </div>
            <p className="text-sm text-muted leading-relaxed">
              Verification of your education, training, licenses, board
              certification, malpractice history, work history, and references.
              Done by the hospital or health system medical staff office.
            </p>
          </div>

          <div className="rounded-xl border border-cyan/30 bg-surface p-6">
            <div className="flex items-center gap-2 mb-3">
              <Building2 className="h-5 w-5 text-cyan" />
              <h3 className="font-bold text-cyan">Privileging</h3>
            </div>
            <p className="text-sm text-muted leading-relaxed">
              Granting specific clinical privileges — what procedures you can
              perform, what patients you can admit, what level of independent
              practice you have. Based on your training and procedure logs.
            </p>
          </div>

          <div className="rounded-xl border border-success/30 bg-surface p-6">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="h-5 w-5 text-success" />
              <h3 className="font-bold text-success">Insurance Paneling</h3>
            </div>
            <p className="text-sm text-muted leading-relaxed">
              Enrollment with insurance companies (Medicare, Medicaid, private
              payers) so the hospital can bill for your patients. Done by the
              billing department. This is the one nobody talks about.
            </p>
          </div>
        </div>
      </section>

      {/* ═══ SECTION 2: Timeline ═══ */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-warning" />
          The Timeline — Start 6 Months Before Day One
        </h2>
        <p className="text-muted mb-8 max-w-3xl">
          This is the typical timeline for a smooth credentialing process. Every
          delay compounds — a missing document at month 5 can push your start
          date back by weeks.
        </p>

        <div className="relative">
          {/* Timeline line */}
          <div className="absolute left-[39px] top-0 bottom-0 w-px bg-border hidden sm:block" />

          <div className="space-y-4">
            {TIMELINE.map((step, i) => (
              <div key={i} className="flex items-start gap-4">
                {/* Timeline dot */}
                <div className="hidden sm:flex shrink-0 w-20 justify-end">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusColor[step.status]}`}
                  >
                    {step.monthsBefore}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 rounded-xl border border-border bg-surface p-5">
                  <div className="sm:hidden mb-2">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-bold ${statusColor[step.status]}`}
                    >
                      {step.monthsBefore}
                    </span>
                  </div>
                  <h3 className="font-bold text-foreground text-sm mb-1">
                    {step.title}
                  </h3>
                  <p className="text-sm text-muted leading-relaxed">
                    {step.details}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ SECTION 3: Documents Checklist ═══ */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
          <FileText className="h-5 w-5 text-cyan" />
          Documents You Need (Start Collecting in PGY-3)
        </h2>
        <p className="text-muted mb-8 max-w-3xl">
          Missing one document can stall the entire process. Start collecting
          these early and keep digital copies of everything.
        </p>

        <div className="space-y-8">
          {(["education", "license", "professional", "clinical", "personal"] as const).map(
            (cat) => (
              <div key={cat}>
                <h3
                  className={`font-bold text-sm mb-3 ${categoryColors[cat]}`}
                >
                  {categoryLabels[cat]}
                </h3>
                <div className="space-y-2">
                  {grouped[cat]?.map((doc) => (
                    <div
                      key={doc.name}
                      className="flex items-start gap-3 rounded-lg border border-border bg-surface px-4 py-3"
                    >
                      <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                      <div>
                        <span className="text-sm font-medium text-foreground">
                          {doc.name}
                        </span>
                        <p className="text-xs text-muted mt-0.5">{doc.note}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ),
          )}
        </div>
      </section>

      {/* ═══ SECTION 4: Insurance Credentialing ═══ */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
          <Building2 className="h-5 w-5 text-warning" />
          Insurance Credentialing — The One Nobody Talks About
        </h2>
        <p className="text-muted mb-8 max-w-3xl">
          Even if you are fully credentialed and privileged at the hospital, you
          cannot generate revenue until insurance companies recognize you as a
          provider.
        </p>

        <div className="grid sm:grid-cols-2 gap-4 mb-6">
          <div className="rounded-xl border border-warning/30 bg-surface p-5">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-5 w-5 text-warning" />
              <h3 className="font-bold text-foreground text-sm">
                60–120 Days Per Payer
              </h3>
            </div>
            <p className="text-sm text-muted leading-relaxed">
              Each insurance company takes 60 to 120 days to process your
              enrollment. You need to be paneled with every payer the hospital
              accepts. Apply to all of them simultaneously.
            </p>
          </div>

          <div className="rounded-xl border border-danger/30 bg-surface p-5">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-5 w-5 text-danger" />
              <h3 className="font-bold text-foreground text-sm">
                Zero Revenue Until Paneled
              </h3>
            </div>
            <p className="text-sm text-muted leading-relaxed">
              If you are not credentialed with an insurance company, the hospital
              cannot bill for your patients under your NPI. You are working for
              free until paneling is complete.
            </p>
          </div>

          <div className="rounded-xl border border-accent/30 bg-surface p-5">
            <div className="flex items-center gap-2 mb-3">
              <Info className="h-5 w-5 text-accent" />
              <h3 className="font-bold text-foreground text-sm">
                Medicare Retroactivity Limit
              </h3>
            </div>
            <p className="text-sm text-muted leading-relaxed">
              Medicare credentialing can be retroactive for only 30 days — not
              more. If your Medicare enrollment is delayed by 3 months, those
              first 2 months of Medicare patients generated zero reimbursement.
            </p>
          </div>

          <div className="rounded-xl border border-cyan/30 bg-surface p-5">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="h-5 w-5 text-cyan" />
              <h3 className="font-bold text-foreground text-sm">
                Ramp-Up Period Exists for a Reason
              </h3>
            </div>
            <p className="text-sm text-muted leading-relaxed">
              This is why some contracts have a &ldquo;ramp-up&rdquo; period
              with lower productivity expectations. It is not a gift — it is
              because you literally cannot see a full panel until paneling is
              done.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-accent/30 bg-accent/5 p-5">
          <div className="flex items-start gap-3">
            <Lightbulb className="h-5 w-5 text-accent shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-foreground text-sm mb-1">
                Private payer tip
              </h4>
              <p className="text-sm text-muted leading-relaxed">
                Apply early and follow up aggressively with every private payer.
                Enrollment departments are understaffed and applications get lost.
                Call every 2 weeks for status updates. Medicaid timelines vary
                significantly by state.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ SECTION 5: Common Pitfalls ═══ */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
          <XCircle className="h-5 w-5 text-danger" />
          Common Credentialing Pitfalls
        </h2>
        <p className="text-muted mb-8 max-w-3xl">
          Each of these has delayed real physicians by weeks or months. Avoid
          them all.
        </p>

        <div className="space-y-3">
          {[
            {
              pitfall: "CV gaps without explanation",
              detail:
                "If you took 6 months off between residency and fellowship, explain it with exact dates and reason. Unexplained gaps trigger additional review and delay credentialing.",
            },
            {
              pitfall: "Address mismatches across documents",
              detail:
                "Your license address, DEA registration address, and practice address must match. Mismatches create verification failures that stall your application.",
            },
            {
              pitfall: "Expired documents in your application",
              detail:
                "Nothing in your application packet should be expired when you submit. Check expiration dates on your license, DEA, board certification, and immunizations.",
            },
            {
              pitfall: "References who do not respond",
              detail:
                "If your reference does not respond to the verification request, your entire process stalls. Warn every reference in advance, give them a timeline, and provide a backup reference.",
            },
            {
              pitfall: "Name changes without documentation",
              detail:
                "If your name has changed due to marriage or other reasons, have legal documentation (marriage certificate, court order) ready. Name discrepancies between documents create verification nightmares.",
            },
            {
              pitfall: "Undisclosed malpractice claims",
              detail:
                "Having a past claim does not disqualify you. But NOT disclosing a claim that shows up in the NPDB query can. Always disclose and provide context.",
            },
            {
              pitfall: "Late state license application",
              detail:
                "Some states take 3 to 4 months to process a medical license. Apply 6+ months before your start date. You cannot be credentialed without an active state license.",
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
                    {item.pitfall}
                  </h3>
                  <p className="text-sm text-muted leading-relaxed">
                    {item.detail}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ SECTION 6: IMG-Specific ═══ */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
          <Globe className="h-5 w-5 text-accent" />
          For International Medical Graduates
        </h2>
        <p className="text-muted mb-8 max-w-3xl">
          IMGs face additional credentialing requirements and longer timelines.
          Plan for these from the beginning.
        </p>

        <div className="grid sm:grid-cols-2 gap-4">
          {[
            {
              title: "ECFMG Certificate Required",
              desc: "Every hospital in the United States requires an ECFMG certificate for IMG credentialing. No exceptions. Make sure yours is current and accessible.",
              icon: GraduationCap,
              color: "text-accent",
              bg: "bg-accent/10",
            },
            {
              title: "Visa Status Verification",
              desc: "Hospitals must verify your visa status with immigration counsel. Have your visa documents, I-94, and employment authorization readily available.",
              icon: Globe,
              color: "text-cyan",
              bg: "bg-cyan/10",
            },
            {
              title: "J-1 Waiver Physicians",
              desc: "Credentialing can sometimes move faster if the hospital urgently needs to fill an HPSA position. Some states also have expedited licensing for waiver physicians.",
              icon: ArrowRight,
              color: "text-success",
              bg: "bg-success/10",
            },
            {
              title: "International Verification Takes Longer",
              desc: "Primary source verification of international medical schools takes longer than domestic schools. Add 2-4 extra weeks to your timeline for this step alone.",
              icon: Clock,
              color: "text-warning",
              bg: "bg-warning/10",
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

      {/* ═══ SECTION 7: Pro Tips ═══ */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-success" />
          Pro Tips
        </h2>
        <p className="text-muted mb-8 max-w-3xl">
          These are the things that separate physicians who start on time from
          those who sit in orientation for a month.
        </p>

        <div className="space-y-3">
          {[
            {
              tip: "Create a credentialing folder in PGY-2",
              detail:
                "Start collecting documents early. By the time you are signing contracts in PGY-3, you should have 80% of what you need already organized.",
            },
            {
              tip: "Keep digital copies of EVERYTHING",
              detail:
                "Scan every document, upload to a secure cloud drive, and back it up. You will need to send the same documents to multiple hospitals, payers, and state boards.",
            },
            {
              tip: "Use CAQH ProView",
              detail:
                "CAQH ProView is a physician data management system that most hospitals and insurance companies pull from. Apply as soon as you have your NPI number. Keep your profile current — it eliminates redundant paperwork.",
            },
            {
              tip: "Apply to CAQH as soon as you have your NPI",
              detail:
                "Do not wait until you have a job. Having an active, complete CAQH profile dramatically speeds up insurance paneling at any employer.",
            },
            {
              tip: "Follow up every 2 weeks",
              detail:
                "Call the medical staff office every 2 weeks for status updates. Applications get buried. The squeaky wheel gets processed first. Be polite but persistent.",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="rounded-xl border border-success/30 bg-surface p-5"
            >
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-success/10 p-1.5 shrink-0 mt-0.5">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground text-sm mb-1">
                    {item.tip}
                  </h3>
                  <p className="text-sm text-muted leading-relaxed">
                    {item.detail}
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
          Credentialing is not glamorous but it is a prerequisite for everything
          else. Start 6 months early, keep every document organized, follow up
          relentlessly, and apply to CAQH the moment you have your NPI. The
          physicians who start seeing patients on day one are the ones who
          treated credentialing like a clinical rotation — with preparation and
          urgency.
        </p>
      </section>
    </div>
  );
}
