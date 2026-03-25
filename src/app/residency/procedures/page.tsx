import type { Metadata } from "next";
import Link from "next/link";
import {
  ClipboardList,
  Target,
  TrendingUp,
  Stethoscope,
  Siren,
  Heart,
  Syringe,
  ArrowRight,
  BadgeCheck,
  AlertTriangle,
  BookOpen,
  Star,
  Users,
  Brain,
  Shield,
  Activity,
  CheckCircle,
} from "lucide-react";

export const metadata: Metadata = {
  title:
    "ACGME Procedure Minimums & Milestone Guide by Specialty — USCEHub",
  description:
    "ACGME procedure logging minimums for internal medicine, surgery, emergency medicine, and family medicine. Milestone levels explained, CCC review tips, and how to hit your numbers before graduation.",
  alternates: {
    canonical: "https://uscehub.com/residency/procedures",
  },
  openGraph: {
    title: "ACGME Procedure & Milestone Guide — USCEHub",
    description:
      "Procedure minimums by specialty, milestone levels explained, and real strategies to hit your numbers before graduation.",
    url: "https://uscehub.com/residency/procedures",
  },
};

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const specialtyProcedures = [
  {
    specialty: "Internal Medicine",
    icon: Stethoscope,
    color: "text-accent",
    bgColor: "bg-accent/10",
    procedures: [
      { name: "Central venous catheter", minimum: "5" },
      { name: "Arterial line", minimum: "5" },
      { name: "Lumbar puncture", minimum: "5" },
      { name: "Thoracentesis", minimum: "5" },
      { name: "Paracentesis", minimum: "5" },
      { name: "Intubation", minimum: "Facility dependent" },
      { name: "ABG (arterial blood gas)", minimum: "5" },
      { name: "Knee/joint aspiration", minimum: "Recommended" },
    ],
  },
  {
    specialty: "Surgery (General)",
    icon: Syringe,
    color: "text-cyan",
    bgColor: "bg-cyan/10",
    procedures: [
      { name: "Total operative cases", minimum: "750+" },
      {
        name: "ACGME case log system",
        minimum: "Must log every case",
      },
      {
        name: "Chief year categories",
        minimum: "Complex GI, trauma, etc.",
      },
    ],
    note: "Chief year expectations are higher. Minimum categories include complex GI, trauma, endocrine, and others. Detailed category breakdowns are in the ACGME surgery milestones document.",
  },
  {
    specialty: "Family Medicine",
    icon: Heart,
    color: "text-success",
    bgColor: "bg-success/10",
    procedures: [
      {
        name: "Deliveries",
        minimum: "~80 (40 continuity + 40 other)",
      },
      { name: "First assists in surgery", minimum: "Recommended" },
      { name: "Joint injection", minimum: "Program-specific" },
      { name: "Skin biopsy", minimum: "Program-specific" },
      { name: "IUD placement", minimum: "Program-specific" },
    ],
    note: "Delivery numbers vary significantly by program. Some programs are moving away from OB requirements, while others maintain strong OB training.",
  },
  {
    specialty: "Emergency Medicine",
    icon: Siren,
    color: "text-warning",
    bgColor: "bg-warning/10",
    procedures: [
      { name: "Adult resuscitation", minimum: "45" },
      { name: "Pediatric resuscitation", minimum: "15" },
      { name: "Central line", minimum: "20" },
      { name: "Intubation", minimum: "35" },
      { name: "Lumbar puncture", minimum: "15" },
      { name: "Procedural sedation", minimum: "15" },
    ],
  },
];

const getNumbersTips = [
  {
    icon: Activity,
    title: "ICU Rotations Are Procedure Goldmines",
    content:
      "Central lines, art lines, intubation — ICU months are where you rack up the most procedures. Volunteer for every opportunity. Ask the fellow or attending if you can do the next line.",
  },
  {
    icon: ClipboardList,
    title: "Start Logging PGY-1, Not PGY-3",
    content:
      "Do not wait until your senior year to start logging procedures. Every procedure from day one counts. If you wait, you will be scrambling in your final year to hit minimums.",
  },
  {
    icon: Target,
    title: "Night Shift = More Procedures",
    content:
      "Attendings are home, seniors are busy with admissions. Night shifts are your opportunity to be the person called for every bedside procedure. Make yourself available.",
  },
  {
    icon: TrendingUp,
    title: "Elective Rotations in Procedure-Heavy Services",
    content:
      "Pulmonology (thoracentesis, bronchoscopy), cardiology cath lab, GI (paracentesis), and interventional radiology are all procedure-heavy rotations. Pick electives strategically.",
  },
  {
    icon: Star,
    title: "Ask to Be Called Even Off-Service",
    content:
      "Tell the charge nurse and your co-residents: if a procedure needs to be done and nobody is jumping on it, call you. This simple step can double your procedure numbers.",
  },
  {
    icon: BookOpen,
    title: "Simulation Lab Counts (Sometimes)",
    content:
      "Some programs allow simulation lab procedures to count toward your minimums. Check with your program director. Even if they do not count, sim time builds confidence and speed.",
  },
];

const milestoneLevels = [
  {
    level: "Level 1",
    label: "Novice",
    description: "Early PGY-1. Needs direct supervision for most tasks. Expected at the start of residency.",
    color: "text-muted",
    bgColor: "bg-surface",
  },
  {
    level: "Level 2",
    label: "Advanced Beginner",
    description:
      "Late PGY-1 to early PGY-2. Can perform tasks with indirect supervision. Developing clinical judgment.",
    color: "text-accent",
    bgColor: "bg-accent/5",
  },
  {
    level: "Level 3",
    label: "Competent",
    description:
      "Expected at graduation. Can practice independently. This is the target for every graduating resident.",
    color: "text-success",
    bgColor: "bg-success/5",
  },
  {
    level: "Level 4",
    label: "Proficient",
    description:
      "Above expected. Can supervise others. Demonstrates advanced clinical reasoning and leadership.",
    color: "text-cyan",
    bgColor: "bg-cyan/5",
  },
  {
    level: "Level 5",
    label: "Expert",
    description:
      "Aspirational. Very few residents reach this level. Indicates exceptional mastery, typically seen in faculty.",
    color: "text-warning",
    bgColor: "bg-warning/5",
  },
];

const competencyDomains = [
  {
    domain: "Patient Care",
    description:
      "Clinical reasoning, procedural skills, and ability to provide compassionate, appropriate care.",
  },
  {
    domain: "Medical Knowledge",
    description:
      "Application of biomedical, clinical, and social sciences to patient care and education.",
  },
  {
    domain: "Practice-Based Learning & Improvement",
    description:
      "Self-assessment, continuous improvement, and using evidence to improve practice.",
  },
  {
    domain: "Interpersonal & Communication Skills",
    description:
      "Effective communication with patients, families, and the healthcare team.",
  },
  {
    domain: "Professionalism",
    description:
      "Ethical practice, accountability, responsiveness to patient needs, and commitment to excellence.",
  },
  {
    domain: "Systems-Based Practice",
    description:
      "Understanding healthcare systems, patient safety, quality improvement, and cost-effective care.",
  },
];

const milestoneReviewTips = [
  {
    icon: CheckCircle,
    title: "Self-Assess Before Each CCC Review",
    content:
      "The Clinical Competency Committee (CCC) reviews you every 6 months. Before each review, honestly self-assess where you are in each milestone. This helps you identify gaps and shows maturity.",
  },
  {
    icon: ClipboardList,
    title: "Keep a Brag File",
    content:
      "Maintain a running document of accomplishments: positive feedback, quality improvement projects, conference presentations, interesting cases, and teaching activities. When CCC time comes, you will have evidence.",
  },
  {
    icon: Users,
    title: "Be Proactive About Faculty Evaluations",
    content:
      "Faculty evaluations are the primary data source for milestone assessments. Do not wait for evaluations to come to you. Remind attendings after rotations. A brief email requesting feedback goes a long way.",
  },
  {
    icon: Target,
    title: "Mini-CEX and DOPS Count",
    content:
      "Mini-Clinical Evaluation Exercise (Mini-CEX) and Directly Observed Procedural Skills (DOPS) are formal assessment tools. Request them during procedures and clinical encounters. They provide documented evidence of competency.",
  },
  {
    icon: Brain,
    title: "Research or QI Project Required",
    content:
      "Most programs require at least one scholarly activity — research project, quality improvement initiative, or case series. Start early (PGY-1 ideally). QI projects are often easier to complete and have direct patient impact.",
  },
  {
    icon: AlertTriangle,
    title: "Below Level 3 at Graduation = Remediation",
    content:
      "If the CCC determines you are below Level 3 in any milestone at the time of graduation, you may face remediation, extended training, or issues with board certification. Take milestone progression seriously.",
  },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function ProceduresPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline:
      "ACGME Procedure Minimums & Milestone Guide by Specialty",
    description:
      "ACGME procedure logging minimums for internal medicine, surgery, emergency medicine, and family medicine. Milestone levels explained, CCC review tips, and strategies to hit your numbers.",
    url: "https://uscehub.com/residency/procedures",
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
        name: "Procedures & Milestones",
        item: "https://uscehub.com/residency/procedures",
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
            <li className="text-foreground font-medium">
              Procedures &amp; Milestones
            </li>
          </ol>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-12 sm:py-16 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-1.5 text-sm font-medium text-accent mb-6">
              <ClipboardList className="h-4 w-4" />
              ACGME Requirements
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
              Procedure &amp; Milestone Guide
            </h1>
            <p className="mt-4 text-lg text-muted leading-relaxed">
              ACGME requires residents to log procedures and meet milestones
              before graduation. Missing minimums means remediation or
              delayed graduation. Here are the exact numbers, how to hit
              them, and how the milestone system actually works.
            </p>
          </div>
        </div>
      </section>

      {/* Procedure Minimums by Specialty */}
      <section
        id="procedure-minimums"
        className="py-12 sm:py-16 border-b border-border"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-foreground mb-3">
            ACGME Procedure Minimums by Specialty
          </h2>
          <p className="text-muted mb-8 max-w-3xl">
            These are the minimum procedure numbers ACGME expects you to log
            before graduating. Your program may set higher targets. Always
            verify with your program director for the most current
            requirements.
          </p>

          <div className="space-y-6">
            {specialtyProcedures.map((spec) => {
              const Icon = spec.icon;
              return (
                <div
                  key={spec.specialty}
                  className="rounded-xl border border-border bg-surface p-6 hover-glow"
                >
                  <div className="flex items-center gap-3 mb-5">
                    <div
                      className={`inline-flex items-center justify-center rounded-lg ${spec.bgColor} p-2.5`}
                    >
                      <Icon className={`h-5 w-5 ${spec.color}`} />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {spec.specialty}
                    </h3>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-2 px-3 text-foreground font-semibold">
                            Procedure
                          </th>
                          <th className="text-left py-2 px-3 text-foreground font-semibold">
                            Minimum
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {spec.procedures.map((proc) => (
                          <tr
                            key={proc.name}
                            className="border-b border-border/50"
                          >
                            <td className="py-2.5 px-3 text-muted">
                              {proc.name}
                            </td>
                            <td className="py-2.5 px-3 text-cyan font-mono text-xs font-medium">
                              {proc.minimum}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {spec.note && (
                    <p className="mt-4 text-xs text-muted leading-relaxed border-t border-border/50 pt-3">
                      {spec.note}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How to Get Your Numbers */}
      <section
        id="get-numbers"
        className="py-12 sm:py-16 border-b border-border"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-foreground mb-3">
            How to Get Your Numbers
          </h2>
          <p className="text-muted mb-8 max-w-3xl">
            Hitting procedure minimums does not happen by accident. You need
            a strategy from day one. Here is what actually works.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {getNumbersTips.map((tip) => {
              const Icon = tip.icon;
              return (
                <div
                  key={tip.title}
                  className="rounded-xl border border-border bg-surface p-5 hover-glow"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="inline-flex items-center justify-center rounded-lg bg-accent/10 p-2">
                      <Icon className="h-4 w-4 text-accent" />
                    </div>
                    <h3 className="text-base font-semibold text-foreground">
                      {tip.title}
                    </h3>
                  </div>
                  <p className="text-sm text-muted leading-relaxed">
                    {tip.content}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ACGME Milestones Explained */}
      <section
        id="milestones"
        className="py-12 sm:py-16 border-b border-border"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-foreground mb-3">
            ACGME Milestones Explained
          </h2>
          <p className="text-muted mb-8 max-w-3xl">
            The milestone system is how your program tracks your development.
            The Clinical Competency Committee (CCC) reviews you every 6
            months and assigns levels across 6 competency domains.
          </p>

          {/* Milestone Levels */}
          <h3 className="text-xl font-bold text-foreground mb-5">
            The 5 Milestone Levels
          </h3>
          <div className="space-y-3 mb-10">
            {milestoneLevels.map((ml) => (
              <div
                key={ml.level}
                className={`rounded-xl border border-border ${ml.bgColor} p-5 hover-glow`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`inline-flex items-center justify-center rounded-full h-8 w-8 text-xs font-bold shrink-0 bg-surface border border-border ${ml.color}`}
                  >
                    {ml.level.replace("Level ", "")}
                  </span>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-base font-semibold text-foreground">
                        {ml.level}: {ml.label}
                      </h4>
                      {ml.label === "Competent" && (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-success/10 text-success">
                          Graduation Target
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted leading-relaxed">
                      {ml.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 6 Competency Domains */}
          <h3 className="text-xl font-bold text-foreground mb-5">
            The 6 Competency Domains
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {competencyDomains.map((cd) => (
              <div
                key={cd.domain}
                className="rounded-xl border border-border bg-surface p-5 hover-glow"
              >
                <h4 className="text-sm font-semibold text-foreground mb-2">
                  {cd.domain}
                </h4>
                <p className="text-xs text-muted leading-relaxed">
                  {cd.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tips for Milestone Reviews */}
      <section
        id="milestone-tips"
        className="py-12 sm:py-16 border-b border-border"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-foreground mb-3">
            Tips for Milestone Reviews
          </h2>
          <p className="text-muted mb-8 max-w-3xl">
            The CCC review is not something to fear — it is something to
            prepare for. Here is how to set yourself up for good milestone
            evaluations.
          </p>

          <div className="space-y-4">
            {milestoneReviewTips.map((tip) => {
              const Icon = tip.icon;
              return (
                <div
                  key={tip.title}
                  className="rounded-xl border border-border bg-surface p-6 hover-glow"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="inline-flex items-center justify-center rounded-lg bg-accent/10 p-2.5">
                      <Icon className="h-5 w-5 text-accent" />
                    </div>
                    <h3 className="text-base font-semibold text-foreground">
                      {tip.title}
                    </h3>
                  </div>
                  <p className="text-sm text-muted leading-relaxed">
                    {tip.content}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Key Takeaways + CTA */}
      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Key Takeaways */}
          <div className="rounded-xl border border-border bg-surface p-6 sm:p-8 mb-8">
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <BadgeCheck className="h-5 w-5 text-accent" />
              Key Takeaways
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex gap-3 text-sm text-muted leading-relaxed">
                <span className="text-accent mt-1 shrink-0">1.</span>
                <span>
                  Start logging procedures from PGY-1 day one. Do not wait
                  until your senior year to discover you are behind on
                  numbers.
                </span>
              </div>
              <div className="flex gap-3 text-sm text-muted leading-relaxed">
                <span className="text-accent mt-1 shrink-0">2.</span>
                <span>
                  ICU rotations and night shifts are your best opportunities
                  for procedures. Volunteer for every line and intubation.
                </span>
              </div>
              <div className="flex gap-3 text-sm text-muted leading-relaxed">
                <span className="text-accent mt-1 shrink-0">3.</span>
                <span>
                  Level 3 (Competent) is the graduation target. Below Level
                  3 in any domain at graduation means remediation risk.
                </span>
              </div>
              <div className="flex gap-3 text-sm text-muted leading-relaxed">
                <span className="text-accent mt-1 shrink-0">4.</span>
                <span>
                  Keep a brag file and request faculty evaluations
                  proactively. The CCC relies on documented evidence.
                </span>
              </div>
              <div className="flex gap-3 text-sm text-muted leading-relaxed">
                <span className="text-accent mt-1 shrink-0">5.</span>
                <span>
                  Start your research or QI project in PGY-1. Most programs
                  require scholarly activity for graduation.
                </span>
              </div>
              <div className="flex gap-3 text-sm text-muted leading-relaxed">
                <span className="text-accent mt-1 shrink-0">6.</span>
                <span>
                  Choose electives strategically — pulmonology, GI, and cath
                  lab rotations provide high-volume procedure experience.
                </span>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="rounded-xl border border-border bg-surface-alt p-8 sm:p-10 text-center">
            <h2 className="text-2xl font-bold text-foreground mb-3">
              Explore the Full Residency Survival Guide
            </h2>
            <p className="text-muted mb-6 max-w-xl mx-auto">
              From first-week checklists to burnout prevention — the
              playbook you actually need for residency.
            </p>
            <Link
              href="/residency/survival"
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-white hover:bg-accent/90 transition-colors"
            >
              Survival Guide
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
