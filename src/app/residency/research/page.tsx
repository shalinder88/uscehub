import type { Metadata } from "next";
import Link from "next/link";
import {
  FlaskConical,
  FileText,
  BarChart3,
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  BookOpen,
  Search,
  Award,
  ArrowRight,
  Globe,
  Lightbulb,
  GraduationCap,
  Shield,
  TrendingUp,
} from "lucide-react";

export const metadata: Metadata = {
  title:
    "Research During Residency — How to Publish, Find Projects & Build Your CV — USCEHub",
  description:
    "Actionable guide to doing research during residency: types of research, finding opportunities, navigating IRB, getting published, and IMG-specific advice for fellowship applications.",
  alternates: {
    canonical: "https://uscehub.com/residency/research",
  },
  openGraph: {
    title: "Research During Residency — USCEHub",
    description:
      "How to publish during residency: case reports, chart reviews, systematic reviews, IRB process, and realistic timelines.",
    url: "https://uscehub.com/residency/research",
  },
};

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const fellowshipPubExpectations = [
  {
    specialty: "Cardiology",
    publications: "5+",
    notes: "Original research strongly preferred. Competitive applicants have 10+.",
    competitiveness: "Very High",
  },
  {
    specialty: "Gastroenterology",
    publications: "3+",
    notes: "Quality matters more than quantity. First-author originals stand out.",
    competitiveness: "High",
  },
  {
    specialty: "Hematology/Oncology",
    publications: "3-5",
    notes: "Clinical trials participation valued highly.",
    competitiveness: "High",
  },
  {
    specialty: "Pulm/Critical Care",
    publications: "2-4",
    notes: "QI projects and chart reviews are common and accepted.",
    competitiveness: "Moderate-High",
  },
  {
    specialty: "Nephrology",
    publications: "1-2",
    notes: "Less competitive. Case reports and reviews are fine to start.",
    competitiveness: "Moderate",
  },
  {
    specialty: "Infectious Disease",
    publications: "1-2",
    notes: "Case reports are very common in ID. Clinical relevance valued.",
    competitiveness: "Moderate",
  },
  {
    specialty: "Endocrinology",
    publications: "1-3",
    notes: "Becoming more competitive. Original research helps differentiate.",
    competitiveness: "Moderate",
  },
  {
    specialty: "Rheumatology",
    publications: "1-2",
    notes: "Still relatively accessible. Quality improvement projects count.",
    competitiveness: "Moderate",
  },
];

const researchTypes = [
  {
    icon: FileText,
    type: "Case Reports / Case Series",
    difficulty: "Easiest",
    timeline: "2-4 weeks to write",
    impact: "Lowest impact factor",
    color: "text-success",
    bgColor: "bg-success/10",
    description:
      "The entry point for most residents. You see an interesting case, write it up, and submit. Case series (3+ similar cases) carry slightly more weight.",
    journals: [
      "BMJ Case Reports",
      "American Journal of Case Reports",
      "Cureus",
      "SAGE Open Medical Case Reports",
    ],
    goodFor: [
      "IMG applicants building publication list",
      "Learning academic writing for the first time",
      "Documenting rare presentations",
      "Quick turnaround before application deadlines",
    ],
  },
  {
    icon: BarChart3,
    type: "Chart Review / Retrospective Studies",
    difficulty: "Moderate",
    timeline: "2-6 months",
    impact: "Medium impact",
    color: "text-accent",
    bgColor: "bg-accent/10",
    description:
      "Use existing patient data to answer a clinical question. No patient enrollment needed. Most can be completed alongside clinical duties without dedicated research time.",
    journals: [
      "Specialty-specific journals",
      "Journal of Hospital Medicine",
      "Journal of Graduate Medical Education",
    ],
    goodFor: [
      "Answering a clinical question with existing data",
      "Programs that require a scholarly project",
      "Building data analysis skills (Excel, SPSS, R)",
      "Generating preliminary data for larger studies",
    ],
  },
  {
    icon: TrendingUp,
    type: "Quality Improvement (QI) Projects",
    difficulty: "Moderate",
    timeline: "3-6 months",
    impact: "Medium impact",
    color: "text-cyan",
    bgColor: "bg-cyan/10",
    description:
      "Many programs require a QI project for graduation. The best ones become publications. Use Plan-Do-Study-Act (PDSA) cycles and track measurable outcomes.",
    journals: [
      "BMJ Open Quality",
      "Journal for Healthcare Quality",
      "Quality Management in Health Care",
    ],
    goodFor: [
      "Meeting graduation requirements (systems-based practice milestone)",
      "Demonstrating leadership and initiative",
      "Making real improvements in patient care",
      "Publishable with proper methodology",
    ],
  },
  {
    icon: Search,
    type: "Systematic Reviews / Meta-Analyses",
    difficulty: "Moderate-High",
    timeline: "3-6 months",
    impact: "Medium-High impact",
    color: "text-warning",
    bgColor: "bg-warning/10",
    description:
      "No IRB needed, no patient data needed. You synthesize existing literature. Follow PRISMA guidelines and Cochrane methodology. Requires a team of at least 2 reviewers for screening.",
    journals: [
      "Cochrane Database of Systematic Reviews",
      "Systematic Reviews journal",
      "Specialty-specific journals",
    ],
    goodFor: [
      "Building methodological skills",
      "Working remotely (no clinical access needed)",
      "Addressing gaps in literature",
      "Medium impact without needing IRB or patient access",
    ],
  },
  {
    icon: FlaskConical,
    type: "Prospective / Clinical Trials",
    difficulty: "Hardest",
    timeline: "1-3+ years",
    impact: "Highest impact",
    color: "text-danger",
    bgColor: "bg-danger/10",
    description:
      "Requires significant time commitment, often a dedicated research year. Involves patient enrollment, complex IRB review, and sometimes funding. The highest impact but the hardest to complete during clinical residency.",
    journals: [
      "NEJM, Lancet, JAMA (top tier)",
      "Specialty flagship journals",
      "Clinical trial registries (ClinicalTrials.gov)",
    ],
    goodFor: [
      "Academic career track",
      "Competitive fellowship applications",
      "Programs with dedicated research years",
      "Residents considering physician-scientist careers",
    ],
  },
];

const researchHierarchy = [
  { type: "Original prospective research", weight: "Highest", icon: "5" },
  { type: "Retrospective studies / chart reviews", weight: "High", icon: "4" },
  { type: "Systematic reviews / meta-analyses", weight: "Medium-High", icon: "3" },
  { type: "Case series (3+ cases)", weight: "Medium", icon: "2" },
  { type: "Case reports", weight: "Lower", icon: "1" },
];

const findOpportunities = [
  {
    icon: Users,
    method: "Ask Your Attending After a Good Case",
    detail:
      "After an interesting clinical encounter, ask: 'Would this make a good case report?' Most attendings are flattered and willing to mentor. This is the single easiest way to start.",
  },
  {
    icon: GraduationCap,
    method: "Approach Division Chiefs in Your Target Specialty",
    detail:
      "If you want cardiology fellowship, go to the cardiology division chief and say: 'I am interested in fellowship. Do you have any ongoing research projects that need help?' Be direct about your goals.",
  },
  {
    icon: Search,
    method: "Research Coordinators in Your Department",
    detail:
      "Every academic department has research coordinators managing ongoing studies. They know which PIs need help with data collection, chart reviews, or manuscript writing. Introduce yourself.",
  },
  {
    icon: Globe,
    method: "National Research Networks",
    detail:
      "ACP, AAFP, and specialty societies have research networks. ACGME Back to Bedside grants fund resident-led projects. These give you mentorship and sometimes funding.",
  },
  {
    icon: Users,
    method: "Collaborate with Medical Students",
    detail:
      "Med students have more time for literature searches and data collection. You have clinical context and patient access. It is a natural partnership. You get senior author credit, they get mentorship.",
  },
  {
    icon: BookOpen,
    method: "Look for Gaps During Journal Club",
    detail:
      "When you read papers for journal club, note what questions remain unanswered. 'Has anyone studied X in Y population?' If not, that is your project.",
  },
];

const irbProcess = [
  {
    level: "Exempt",
    risk: "No risk to subjects",
    examples: "Most chart reviews, QI projects, de-identified data analysis",
    timeline: "1-2 weeks",
    color: "text-success",
  },
  {
    level: "Expedited",
    risk: "Minimal risk",
    examples: "Surveys, some retrospective studies, blood draws from routine care",
    timeline: "2-4 weeks",
    color: "text-warning",
  },
  {
    level: "Full Board Review",
    risk: "Significant risk",
    examples: "Prospective trials, vulnerable populations, experimental interventions",
    timeline: "1-3 months",
    color: "text-danger",
  },
];

const publicationTimeline = [
  { step: "Write manuscript", duration: "2-6 weeks", icon: FileText },
  { step: "Internal review & co-author feedback", duration: "2-4 weeks", icon: Users },
  { step: "Submit to journal", duration: "Immediate", icon: ArrowRight },
  { step: "Peer review", duration: "2-8 weeks (some take months)", icon: Clock },
  { step: "Revisions & resubmission", duration: "1-4 weeks", icon: FileText },
  { step: "Accepted to published", duration: "1-6 months", icon: Award },
];

const imgResearchTips = [
  {
    icon: Clock,
    tip: "Start research BEFORE residency if possible",
    detail:
      "Even from your home country, you can do systematic reviews, meta-analyses, or collaborate remotely with US-based researchers. This gives you publications before you even start.",
  },
  {
    icon: Globe,
    tip: "US-based research is valued more for fellowship apps",
    detail:
      "Research conducted at US institutions carries more weight than international publications in most fellowship application reviews. Prioritize US collaborations once here.",
  },
  {
    icon: GraduationCap,
    tip: "Collaborative research with your target specialty shows intent",
    detail:
      "If you want cardiology, do cardiology research. It shows the fellowship program you are serious and already thinking about the field.",
  },
  {
    icon: FileText,
    tip: "Even 1-2 case reports demonstrate academic capability",
    detail:
      "Case reports show you can write in English, follow academic conventions, navigate peer review, and complete a project. That signal matters for IMGs.",
  },
  {
    icon: Search,
    tip: "Research during observership: ask your preceptor",
    detail:
      "If you are doing an observership, ask your preceptor if they have ongoing projects that need help. This can turn a passive experience into a publication.",
  },
  {
    icon: Award,
    tip: "Preprint servers let you claim credit while waiting",
    detail:
      "Upload to medRxiv or SSRN before or during peer review. You can list preprints on your CV and ERAS. This is especially useful when timing is tight for application season.",
  },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function ResearchPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline:
      "Research During Residency — How to Publish, Find Projects & Build Your CV",
    description:
      "Actionable guide to doing research during residency: types of research, finding opportunities, navigating IRB, getting published, and IMG-specific advice.",
    url: "https://uscehub.com/residency/research",
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
        name: "Research",
        item: "https://uscehub.com/residency/research",
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
            <li className="text-foreground font-medium">Research</li>
          </ol>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-12 sm:py-16 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-1.5 text-sm font-medium text-accent mb-6">
              <FlaskConical className="h-4 w-4" />
              Fellowship-Bound Research
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
              Research During Residency
            </h1>
            <p className="mt-4 text-lg text-muted leading-relaxed">
              If you want a competitive fellowship, you need publications. But
              not all research is equal, and knowing what to do — and what
              counts — can save you months of wasted effort. This guide covers
              everything from finding your first case report to navigating
              IRB and getting published.
            </p>
          </div>
        </div>
      </section>

      {/* Why Research Matters */}
      <section id="why-research" className="py-12 sm:py-16 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-foreground mb-3">
            Why Research Matters for Fellowship
          </h2>
          <p className="text-muted mb-8 max-w-3xl">
            Fellowship programs use publications as a proxy for academic
            potential, writing ability, and dedication to the specialty.
            Here is what competitive applicants typically have.
          </p>

          {/* Research Hierarchy */}
          <div className="rounded-xl border border-border bg-surface p-6 mb-8">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              Research Impact Hierarchy
            </h3>
            <p className="text-sm text-muted mb-4">
              Not all research is equal. One first-author original study
              outweighs five middle-author case reports.
            </p>
            <div className="space-y-2">
              {researchHierarchy.map((item) => (
                <div
                  key={item.type}
                  className="flex items-center gap-3 rounded-lg bg-surface-alt px-4 py-3"
                >
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10 text-accent text-sm font-bold shrink-0">
                    {item.icon}
                  </span>
                  <div className="flex-1">
                    <span className="text-sm text-foreground font-medium">
                      {item.type}
                    </span>
                  </div>
                  <span className="text-xs text-muted font-medium">
                    {item.weight}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-lg bg-accent/5 border border-accent/20 p-4">
              <div className="flex items-start gap-2">
                <Lightbulb className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                <p className="text-sm text-muted">
                  Case reports are how most residents start — and that is
                  perfectly fine. They teach you the mechanics of academic
                  writing, peer review, and collaboration. Start there, then
                  build toward higher-impact work.
                </p>
              </div>
            </div>
          </div>

          {/* Fellowship Publication Expectations */}
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Publication Expectations by Specialty
          </h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {fellowshipPubExpectations.map((spec) => (
              <div
                key={spec.specialty}
                className="rounded-xl border border-border bg-surface p-5"
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-foreground">
                    {spec.specialty}
                  </h4>
                  <span className="text-lg font-bold text-accent">
                    {spec.publications}
                  </span>
                </div>
                <p className="text-xs text-muted leading-relaxed mb-2">
                  {spec.notes}
                </p>
                <span
                  className={`inline-block text-xs font-medium px-2 py-0.5 rounded-full ${
                    spec.competitiveness.includes("Very")
                      ? "bg-danger/10 text-danger"
                      : spec.competitiveness.includes("High")
                        ? "bg-warning/10 text-warning"
                        : "bg-success/10 text-success"
                  }`}
                >
                  {spec.competitiveness}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Types of Research */}
      <section id="types" className="py-12 sm:py-16 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-foreground mb-3">
            Types of Research You Can Do During Residency
          </h2>
          <p className="text-muted mb-8 max-w-3xl">
            From easiest to hardest. Most residents should start at the top
            and work down as time and opportunities allow.
          </p>

          <div className="space-y-6">
            {researchTypes.map((research) => {
              const Icon = research.icon;
              return (
                <div
                  key={research.type}
                  className="rounded-xl border border-border bg-surface p-6"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-lg ${research.bgColor} shrink-0`}
                    >
                      <Icon className={`h-5 w-5 ${research.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold text-foreground">
                          {research.type}
                        </h3>
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${research.bgColor} ${research.color}`}>
                          {research.difficulty}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-4 text-xs text-muted mb-3">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {research.timeline}
                        </span>
                        <span className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          {research.impact}
                        </span>
                      </div>
                      <p className="text-sm text-muted leading-relaxed mb-4">
                        {research.description}
                      </p>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                            Target Journals
                          </h4>
                          <ul className="space-y-1">
                            {research.journals.map((journal) => (
                              <li
                                key={journal}
                                className="text-xs text-muted flex items-start gap-1.5"
                              >
                                <BookOpen className="h-3 w-3 mt-0.5 shrink-0 text-accent" />
                                {journal}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                            Good For
                          </h4>
                          <ul className="space-y-1">
                            {research.goodFor.map((item) => (
                              <li
                                key={item}
                                className="text-xs text-muted flex items-start gap-1.5"
                              >
                                <CheckCircle className="h-3 w-3 mt-0.5 shrink-0 text-success" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How to Find Research Opportunities */}
      <section id="find-opportunities" className="py-12 sm:py-16 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-foreground mb-3">
            How to Find Research Opportunities
          </h2>
          <p className="text-muted mb-8 max-w-3xl">
            Research rarely falls into your lap. You have to actively seek it
            out. Here are the most effective approaches, roughly ordered by
            how easy they are to execute.
          </p>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {findOpportunities.map((opp) => {
              const Icon = opp.icon;
              return (
                <div
                  key={opp.method}
                  className="rounded-xl border border-border bg-surface p-6"
                >
                  <Icon className="h-5 w-5 text-accent mb-3" />
                  <h3 className="text-base font-semibold text-foreground mb-2">
                    {opp.method}
                  </h3>
                  <p className="text-sm text-muted leading-relaxed">
                    {opp.detail}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* The IRB Process */}
      <section id="irb" className="py-12 sm:py-16 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-foreground mb-3">
            The IRB Process (Demystified)
          </h2>
          <p className="text-muted mb-8 max-w-3xl">
            The Institutional Review Board sounds intimidating, but most
            resident research qualifies for the simplest review levels. Your
            institution&apos;s research office will walk you through it — do not
            let IRB anxiety stop you from starting.
          </p>

          <div className="space-y-4 mb-8">
            {irbProcess.map((level) => (
              <div
                key={level.level}
                className="rounded-xl border border-border bg-surface p-6"
              >
                <div className="flex items-start gap-4">
                  <div className="shrink-0">
                    <Shield className={`h-5 w-5 ${level.color}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-2">
                      <h3 className="text-base font-semibold text-foreground">
                        {level.level}
                      </h3>
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-surface-alt text-muted">
                        {level.timeline}
                      </span>
                    </div>
                    <p className="text-sm text-muted mb-1">
                      <span className="font-medium text-foreground">Risk level:</span>{" "}
                      {level.risk}
                    </p>
                    <p className="text-sm text-muted">
                      <span className="font-medium text-foreground">Examples:</span>{" "}
                      {level.examples}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-border bg-surface p-6">
            <h3 className="text-base font-semibold text-foreground mb-3">
              IRB Pro Tips
            </h3>
            <ul className="space-y-2">
              {[
                "Most resident research (chart reviews, QI, case reports) qualifies for exempt or expedited review.",
                "Your institution's research office exists to help you. Book an appointment before you start — they prevent common mistakes.",
                "Start the IRB application BEFORE you start collecting data. Retroactive approval is much harder.",
                "CITI training (online) is usually required before IRB submission. Complete it during intern year so it is ready when you need it.",
                "Systematic reviews and meta-analyses do not need IRB approval — they use published data only.",
              ].map((tip) => (
                <li key={tip} className="flex items-start gap-2 text-sm text-muted">
                  <CheckCircle className="h-4 w-4 mt-0.5 shrink-0 text-success" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Getting Published — Realistic Timeline */}
      <section id="timeline" className="py-12 sm:py-16 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-foreground mb-3">
            Getting Published — Realistic Timeline
          </h2>
          <p className="text-muted mb-8 max-w-3xl">
            From writing to publication typically takes 3-12 months. Plan
            accordingly, especially if you need publications for fellowship
            applications in September of your PGY-2 or PGY-3 year.
          </p>

          <div className="rounded-xl border border-border bg-surface p-6 mb-8">
            <div className="space-y-4">
              {publicationTimeline.map((step, idx) => {
                const Icon = step.icon;
                return (
                  <div key={step.step} className="flex items-center gap-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10 text-accent text-sm font-bold shrink-0">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-sm font-medium text-foreground flex items-center gap-2">
                          <Icon className="h-4 w-4 text-muted" />
                          {step.step}
                        </span>
                        <span className="text-xs text-accent font-medium bg-accent/10 px-2 py-0.5 rounded-full">
                          {step.duration}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-6 pt-4 border-t border-border">
              <p className="text-sm font-semibold text-foreground">
                Total: 3-12 months from writing to publication
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-border bg-surface p-6">
              <h3 className="text-base font-semibold text-foreground mb-3">
                Speed Up the Process
              </h3>
              <ul className="space-y-2">
                {[
                  "Choose journals with fast peer review (Cureus: 1-2 weeks; BMJ Case Reports: 2-4 weeks)",
                  "Have your manuscript reviewed internally BEFORE submitting — co-authors catch errors journals would reject for",
                  "Preprint servers (medRxiv, SSRN) let you claim credit on your CV while waiting for peer review",
                  "Use reference managers (Zotero, Mendeley) from the start — reformatting references wastes hours",
                ].map((tip) => (
                  <li key={tip} className="flex items-start gap-2 text-sm text-muted">
                    <ArrowRight className="h-3 w-3 mt-1.5 shrink-0 text-accent" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-border bg-surface p-6">
              <h3 className="text-base font-semibold text-foreground mb-3">
                Common Mistakes
              </h3>
              <ul className="space-y-2">
                {[
                  "Submitting to multiple journals simultaneously when their policies prohibit it (most do)",
                  "Starting a project without confirming co-author roles and expectations upfront",
                  "Waiting until PGY-3 to start research when fellowship apps are due that September",
                  "Picking a project that is too ambitious for available time — a completed case report beats an unfinished trial",
                ].map((tip) => (
                  <li key={tip} className="flex items-start gap-2 text-sm text-muted">
                    <AlertTriangle className="h-3 w-3 mt-1.5 shrink-0 text-warning" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* IMG-Specific Research Advice */}
      <section id="img-advice" className="py-12 sm:py-16 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-3">
            <Globe className="h-6 w-6 text-cyan" />
            <h2 className="text-2xl font-bold text-foreground">
              IMG-Specific Research Advice
            </h2>
          </div>
          <p className="text-muted mb-8 max-w-3xl">
            International medical graduates face unique challenges and
            advantages in the research landscape. These tips address the
            specific situations IMGs commonly encounter.
          </p>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {imgResearchTips.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.tip}
                  className="rounded-xl border border-border bg-surface p-6"
                >
                  <Icon className="h-5 w-5 text-cyan mb-3" />
                  <h3 className="text-base font-semibold text-foreground mb-2">
                    {item.tip}
                  </h3>
                  <p className="text-sm text-muted leading-relaxed">
                    {item.detail}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Essential Resources */}
      <section id="resources" className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-foreground mb-3">
            Essential Resources
          </h2>
          <p className="text-muted mb-8 max-w-3xl">
            Bookmark these. You will use them throughout your research career.
          </p>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                name: "PubMed",
                url: "https://pubmed.ncbi.nlm.nih.gov/",
                description:
                  "The primary search engine for biomedical literature. Start every literature review here.",
              },
              {
                name: "Cochrane Library",
                url: "https://www.cochranelibrary.com/",
                description:
                  "Gold standard for systematic reviews. Essential resource for evidence-based methodology.",
              },
              {
                name: "PRISMA Checklist",
                url: "http://www.prisma-statement.org/",
                description:
                  "Required reporting guidelines for systematic reviews and meta-analyses. Follow this exactly.",
              },
              {
                name: "medRxiv",
                url: "https://www.medrxiv.org/",
                description:
                  "Preprint server for health sciences. Post your manuscript before or during peer review.",
              },
              {
                name: "Zotero",
                url: "https://www.zotero.org/",
                description:
                  "Free reference manager. Set this up from day one. Saves hours of reformatting citations.",
              },
              {
                name: "CITI Program",
                url: "https://about.citiprogram.org/",
                description:
                  "Required ethics training for IRB submissions. Complete during intern year so it is ready.",
              },
            ].map((resource) => (
              <a
                key={resource.name}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl border border-border bg-surface p-6 hover:border-accent/50 transition-colors group"
              >
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-base font-semibold text-foreground group-hover:text-accent transition-colors">
                    {resource.name}
                  </h3>
                  <ArrowRight className="h-4 w-4 text-muted group-hover:text-accent transition-colors" />
                </div>
                <p className="text-sm text-muted leading-relaxed">
                  {resource.description}
                </p>
              </a>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
