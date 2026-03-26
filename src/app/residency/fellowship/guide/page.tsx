import type { Metadata } from "next";
import Link from "next/link";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import {
  GraduationCap,
  Calendar,
  FileText,
  Users,
  FlaskConical,
  Target,
  Globe,
  AlertTriangle,
  ArrowRight,
  CheckCircle,
  Clock,
  Star,
  TrendingUp,
  BookOpen,
  MessageSquare,
  Shield,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Fellowship Timeline & Strategy Guide — USCEHub",
  description:
    "The definitive fellowship application guide — year-by-year timeline from PGY-1 through Match Day, specialty-specific competitiveness tiers, IMG considerations, and what programs actually look for.",
  alternates: {
    canonical: "https://uscehub.com/residency/fellowship/guide",
  },
  openGraph: {
    title: "Fellowship Timeline & Strategy Guide — USCEHub",
    description:
      "Year-by-year fellowship application timeline, specialty competitiveness tiers, and IMG-specific strategies.",
    url: "https://uscehub.com/residency/fellowship/guide",
  },
};

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const pgy1Tasks = [
  {
    icon: Target,
    title: "Identify Your Specialty Interest",
    details: [
      "Shadow attendings in specialties you're curious about — even one half-day clinic can clarify whether you'd enjoy doing it for 30 years.",
      "Request elective rotations strategically. A month on cardiology consults tells you more than reading about it.",
      "Talk to current fellows honestly: ask about work-life balance, job market, and what they wish they'd known.",
      "It's okay to not know yet. But start narrowing from 5 options to 2-3 by mid-PGY-1.",
    ],
  },
  {
    icon: FlaskConical,
    title: "Start Research Early",
    details: [
      "Even case reports count. A published case report shows you can see a project through to completion.",
      "Target 2-3 publications minimum for competitive fellowships (Cards, GI). For less competitive fellowships, 1-2 is sufficient.",
      "Quality improvement projects are underrated — they show systems thinking and are easier to complete during residency.",
      "Collaborate with fellows and attendings who already have active research. Joining an existing project is faster than starting your own.",
      "Abstract submissions to national conferences (ACP, AHA, ACG, CHEST) give you poster presentations for your CV.",
    ],
  },
  {
    icon: Users,
    title: "Find a Mentor",
    details: [
      "You need at least one mentor in your target specialty — someone who will write you a strong letter and advocate for you.",
      "Don't just pick the most famous attending. Pick someone who knows your work, responds to emails, and has connections at programs you're interested in.",
      "If your program doesn't have a strong division in your target specialty, reach out externally. Many attendings are happy to mentor residents from other institutions.",
      "Schedule regular meetings (even quarterly) to keep the relationship active.",
    ],
  },
  {
    icon: MessageSquare,
    title: "Begin Networking",
    details: [
      "Attend national and regional conferences in your target specialty.",
      "Present posters — it forces you to be at the conference and gives you something to talk about with program directors.",
      "Introduce yourself to fellowship directors at conference receptions. A 2-minute conversation can become a future interview.",
      "Join specialty-specific societies (ACC, AGA, ATS, ASH, etc.). Student/resident memberships are usually discounted or free.",
    ],
  },
];

const pgy2Tasks = [
  {
    icon: FileText,
    title: "Letters of Recommendation",
    details: [
      "You need 3-4 letters. At least 2 should be from attendings in your target fellowship specialty.",
      "Ask early — by April/May of PGY-2 for a September ERAS submission. Attendings need time to write strong letters.",
      "The best letters come from people you've worked closely with. A glowing letter from a community attending who saw you daily beats a lukewarm letter from a famous name who barely knows you.",
      "Give your letter writers your CV, personal statement draft, and a list of programs you're applying to. Make their job easy.",
      "The department chair letter: most programs expect one. Talk to your program director about this early.",
    ],
  },
  {
    icon: BookOpen,
    title: "Personal Statement",
    details: [
      "Start drafting in June/July. You'll need multiple revisions.",
      "Answer the real question: why THIS specialty, and why are YOU the right person for it?",
      "Be specific. A generic statement about 'loving the complexity of cardiology' says nothing. Describe a specific patient encounter or research finding that crystallized your interest.",
      "Have 3-4 people review it: your mentor, a trusted co-resident, and someone outside medicine (for readability).",
      "Keep it under one page. Fellowship directors read hundreds of these.",
    ],
  },
  {
    icon: Calendar,
    title: "ERAS Application Preparation",
    details: [
      "ERAS opens in September for most IM subspecialties. Have everything ready by August.",
      "Your CV should be polished and complete: education, research, publications, presentations, awards, leadership, volunteer work.",
      "ERAS allows you to list works 'in preparation' or 'submitted' — use this if you have manuscripts under review.",
      "How many programs to apply to depends on competitiveness: Cards/GI applicants often apply to 50-80+ programs. Less competitive specialties: 20-40 may suffice.",
      "Application fees add up fast. Budget $2,000-5,000+ depending on how many programs you apply to.",
    ],
  },
  {
    icon: Target,
    title: "Interview Preparation",
    details: [
      "Common questions: Why this specialty? Why our program? Where do you see yourself in 10 years? Tell me about your research.",
      "Prepare 2-3 'stories' about challenging patients, research insights, or leadership moments.",
      "Know the program before you interview. Read their website, know their faculty's research, and understand their clinical volume.",
      "Ask thoughtful questions: What does the average fellow's week look like? What is your approach to fellow autonomy? Where do your graduates end up?",
      "Send thank-you emails within 24 hours. Brief and genuine — don't overdo it.",
    ],
  },
];

const pgy3Tasks = [
  {
    icon: Calendar,
    title: "ERAS Submission Timeline",
    details: [
      "Most IM subspecialties: ERAS opens early September, applications reviewed on a rolling basis.",
      "Submit as early as possible. Programs start reviewing applications and sending interview invitations within weeks.",
      "Signals/Preferences: ERAS now allows you to signal programs you're genuinely interested in. Use these wisely — signal programs where you'd actually go.",
      "Update ERAS if you have new publications or presentations during interview season.",
    ],
  },
  {
    icon: Clock,
    title: "Interview Season",
    details: [
      "October through January for most IM subspecialties.",
      "Aim for 10-15 interviews for competitive specialties, 8-12 for less competitive ones.",
      "Virtual interviews may still be offered by some programs. In-person interviews are preferred by most programs and candidates.",
      "Keep a spreadsheet tracking every program: interview date, impressions, pros/cons, people you met. You will forget details by rank list time.",
      "Second looks: if you're seriously considering a program, ask about visiting again. It shows interest and helps you decide.",
    ],
  },
  {
    icon: Star,
    title: "Rank List Strategy",
    details: [
      "Rank by genuine preference, not by where you think you'll match. The algorithm favors your preferences.",
      "Consider: clinical training quality, research opportunities, faculty mentorship, location, fellow happiness, call schedule, moonlighting policy.",
      "For couples matching: this adds complexity. Start rank list discussions early and be prepared to compromise.",
      "Rank list deadline is typically in February. Don't wait until the last day.",
    ],
  },
  {
    icon: Shield,
    title: "Match Day & Backup Plans",
    details: [
      "Fellowship Match Day is typically in December (NRMP Medical Specialties Match) for most IM subspecialties.",
      "If you don't match: don't panic. This happens to qualified applicants every year.",
      "SOAP (Supplemental Offer and Acceptance Program): unfilled positions are offered through SOAP after Match.",
      "Alternative paths: reapply next year with a stronger application, consider a research year, or look at less competitive but related specialties.",
      "Some programs fill outside the match. Networking and cold-emailing program directors can yield results.",
    ],
  },
];

// Fellowship match data sourced from NRMP Specialties Matching Service reports.
// Positions and fill rates reflect 2025-2026 appointment year data.
// IMG rates reflect Non-US IMG applicant match rates where available.
// Last verified: March 2026.
const fellowshipSpecialties = [
  {
    name: "Cardiology (Cardiovascular Disease)",
    tier: 1,
    duration: "3 years",
    timeline: "ERAS, September — Match in December",
    notes:
      "Most competitive IM fellowship. ~900-950 positions offered, ~97-99% fill rate. IMG match rate ~30-35%. Research is essentially mandatory (5+ publications expected for competitive programs). Strong Step/COMLEX scores and program prestige matter significantly. Many applicants do a research year between PGY-2 and PGY-3. Interventional cards adds 1 year after general cardiology.",
    competitiveness: "Very High",
  },
  {
    name: "Gastroenterology",
    tier: 1,
    duration: "3 years",
    timeline: "ERAS, September — Match in December",
    notes:
      "Second most competitive IM fellowship. ~550-600 positions offered, ~98-99% fill rate. IMG match rate ~25-30%. Research expected (3-5+ publications). Procedural skills valued — endoscopy experience a plus. GI fellowship interviews focus heavily on why GI specifically. Advanced endoscopy and hepatology are additional years after GI.",
    competitiveness: "Very High",
  },
  {
    name: "Pulmonary & Critical Care",
    tier: 2,
    duration: "3 years",
    timeline: "ERAS, September — Match in December",
    notes:
      "Combined Pulm/CCM is standard. ~550-600 positions offered, ~95-97% fill rate. IMG match rate ~35-40%. Competitive but more accessible than Cards/GI. Research important (3+ publications). ICU experience and ventilator management skills highly valued. Strong job market post-fellowship.",
    competitiveness: "High",
  },
  {
    name: "Hematology-Oncology",
    tier: 2,
    duration: "3 years",
    timeline: "ERAS, September — Match in December",
    notes:
      "~550-600 positions offered, ~95-97% fill rate. IMG match rate ~30-35%. Research-heavy field — many programs want fellows who will pursue academic careers. Clinical trial experience is a plus. Emotional resilience discussed in interviews. Excellent compensation post-fellowship.",
    competitiveness: "High",
  },
  {
    name: "Nephrology",
    tier: 3,
    duration: "2 years",
    timeline: "ERAS, September — Match in December",
    notes:
      "~500-550 positions offered, ~75-85% fill rate — one of the least competitive IM fellowships. IMG match rate ~50-60%. More available positions relative to applicants. Strong job market after fellowship (high demand nationally). Research helpful but not required. Genuine interest in kidney physiology and dialysis management is what programs look for.",
    competitiveness: "Moderate",
  },
  {
    name: "Rheumatology",
    tier: 3,
    duration: "2 years",
    timeline: "ERAS, September — Match in December",
    notes:
      "~200-220 positions offered, ~90-95% fill rate. IMG match rate ~35-40%. Moderate competition. Smaller field with good work-life balance. Research helpful but personality fit and genuine interest matter more. Strong clinical reasoning skills valued. Growing demand due to aging population.",
    competitiveness: "Moderate",
  },
  {
    name: "Endocrinology",
    tier: 3,
    duration: "2 years",
    timeline: "ERAS, September — Match in December",
    notes:
      "~250-280 positions offered, ~80-90% fill rate. IMG match rate ~40-50%. Moderate competition. Outpatient-heavy specialty with excellent lifestyle. Research helpful but not mandatory. Diabetes and thyroid management experience universally valued. Growing demand driven by diabetes/obesity epidemic.",
    competitiveness: "Moderate",
  },
  {
    name: "Infectious Disease",
    tier: 3,
    duration: "2 years",
    timeline: "ERAS, September — Match in December",
    notes:
      "~400-450 positions offered, ~65-75% fill rate — consistently among the least competitive IM fellowships. IMG match rate ~55-65%. More positions than qualified applicants in recent years. Antimicrobial stewardship experience is a plus. Academic interest and diagnostic reasoning valued over research volume. Lower compensation post-fellowship compared to procedural specialties.",
    competitiveness: "Low-Moderate",
  },
  {
    name: "Allergy & Immunology",
    tier: 3,
    duration: "2 years",
    timeline: "ERAS, September — Match in December",
    notes:
      "~100-120 positions offered, ~90-95% fill rate. IMG match rate ~30-35%. Can apply from IM or pediatrics residency. Moderate competition — small field. Outpatient-focused with excellent lifestyle. Procedural component (allergy testing, immunotherapy) differentiates it. Growing demand due to rising allergy/asthma prevalence.",
    competitiveness: "Moderate",
  },
  {
    name: "Geriatric Medicine",
    tier: 3,
    duration: "1 year",
    timeline: "ERAS, September",
    notes:
      "Low competition with high availability. Growing demand due to aging population. Only 1-year fellowship. Excellent job market. If you enjoy comprehensive care for older adults, this is an underappreciated path.",
    competitiveness: "Low",
  },
  {
    name: "Sports Medicine",
    tier: 3,
    duration: "1 year",
    timeline: "Separate match (NRMP)",
    notes:
      "Can apply from IM, FM, EM, or PM&R. Separate application timeline from standard IM subspecialties. MSK ultrasound and procedure skills are important. Team physician experience is valued.",
    competitiveness: "Moderate",
  },
  {
    name: "Hospice & Palliative Medicine",
    tier: 3,
    duration: "1 year",
    timeline: "Separate match (NRMP)",
    notes:
      "Open to graduates from many specialties (IM, FM, EM, Peds, Surgery, others). Only 1-year fellowship. Growing field with increasing demand. Communication skills and emotional intelligence are key.",
    competitiveness: "Low",
  },
];

const tierInfo: Record<
  number,
  { label: string; color: string; bg: string; desc: string }
> = {
  1: {
    label: "Tier 1 — Most Competitive",
    color: "text-red-400",
    bg: "bg-red-400/10",
    desc: "Research mandatory (5+ publications). Strong Step scores. Program prestige matters. Consider a research year.",
  },
  2: {
    label: "Tier 2 — Competitive",
    color: "text-amber-400",
    bg: "bg-amber-400/10",
    desc: "Research important (3+ publications). Good evaluations. Clinical performance weighted heavily.",
  },
  3: {
    label: "Tier 3 — Accessible",
    color: "text-success",
    bg: "bg-success/10",
    desc: "Research helpful but not required. Personality fit and genuine interest matter more. Better work-life balance in training.",
  },
};

const imgConsiderations = [
  {
    icon: Globe,
    title: "Visa Sponsorship",
    details: [
      "Not all fellowship programs sponsor visas. Verify this before applying — it saves time and money.",
      "H-1B is the most common visa for fellows. Some programs sponsor J-1 instead.",
      "Programs that sponsor visas often list this in FREIDA or on their website. If not listed, email the coordinator directly.",
      "Start the visa application process early. Delays can prevent you from starting on time.",
    ],
  },
  {
    icon: FlaskConical,
    title: "Research Year Expectations",
    details: [
      "Some competitive programs expect or prefer a dedicated research year before fellowship.",
      "A research year can strengthen your application significantly — especially for Cards and GI.",
      "Research positions are sometimes available at the institution where you want to do fellowship. This builds relationships with faculty.",
      "Funding: some research years are funded through the department or NIH T32 grants. Others require institutional support.",
    ],
  },
  {
    icon: AlertTriangle,
    title: "Green Card Timing",
    details: [
      "If you're on a J-1 waiver, starting fellowship can complicate the waiver obligation.",
      "Conrad-30 waiver requires 3 years of service in an underserved area. Starting fellowship before completing this can void the waiver.",
      "Plan your immigration timeline with an attorney before committing to fellowship dates.",
      "Some programs are experienced with these issues and can work with you on timing.",
    ],
  },
  {
    icon: TrendingUp,
    title: "Programs That Historically Take IMGs",
    details: [
      "Look at program websites and FREIDA data to see the percentage of current fellows who are IMGs.",
      "University-affiliated community programs often have higher IMG acceptance rates than standalone academic centers.",
      "Networking at specialty conferences is even more important for IMGs. Personal connections can overcome CV gaps.",
      "Programs in the Midwest and South are generally more IMG-friendly than those on the coasts, though this varies widely.",
    ],
  },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function FellowshipGuidePage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Fellowship Timeline & Strategy Guide",
    description:
      "Definitive year-by-year fellowship application guide for residents — PGY-1 through Match Day, specialty tiers, and IMG strategies.",
    url: "https://uscehub.com/residency/fellowship/guide",
    publisher: {
      "@type": "Organization",
      name: "USCEHub",
      url: "https://uscehub.com",
    },
    mainEntityOfPage: "https://uscehub.com/residency/fellowship/guide",
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
        name: "Fellowship",
        item: "https://uscehub.com/residency/fellowship",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "Guide",
        item: "https://uscehub.com/residency/fellowship/guide",
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
              <Link href="/residency" className="hover:text-foreground transition-colors">
                Residency
              </Link>
            </li>
            <li>/</li>
            <li>
              <Link href="/residency/fellowship" className="hover:text-foreground transition-colors">
                Fellowship
              </Link>
            </li>
            <li>/</li>
            <li className="text-foreground font-medium">Guide</li>
          </ol>
        </div>
      </nav>

      {/* Hero */}
      <section className="py-12 sm:py-16 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-1.5 text-sm font-medium text-accent mb-6">
              <GraduationCap className="h-4 w-4" />
              Fellowship Strategy
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
              Fellowship Timeline &amp; Strategy Guide
            </h1>
            <p className="mt-4 text-lg text-muted leading-relaxed">
              Everything you need to know about getting into fellowship — from
              when to start preparing in PGY-1 through Match Day and beyond.
              Built from the collective experience of residents and fellows who
              have been through the process.
            </p>
            <div className="mt-4">
              <VerifiedBadge date="March 2026" sources={["NRMP SMS Reports", "ERAS"]} />
            </div>
          </div>
        </div>
      </section>

      {/* Visual Timeline Overview */}
      <section className="py-12 sm:py-16 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-foreground mb-8">
            The 3-Year Fellowship Timeline
          </h2>

          <div className="relative">
            {/* Timeline line */}
            <div className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-border" />

            {/* PGY-1 */}
            <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 mb-12">
              <div className="lg:text-right lg:pr-12">
                <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-1.5 text-sm font-bold text-accent mb-4">
                  PGY-1
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  12-18 Months Before Application
                </h3>
                <p className="text-muted leading-relaxed">
                  Foundation building. Identify your specialty interest, start
                  research, find a mentor, and begin networking. Everything you
                  do this year compounds into your application.
                </p>
              </div>
              <div className="space-y-1 text-sm text-muted lg:pl-12">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-accent shrink-0" />
                  <span>Shadow attendings in target specialties</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-accent shrink-0" />
                  <span>Start first research project or case report</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-accent shrink-0" />
                  <span>Identify and approach a fellowship mentor</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-accent shrink-0" />
                  <span>Attend first specialty conference</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-accent shrink-0" />
                  <span>Join relevant specialty society</span>
                </div>
              </div>
            </div>

            {/* PGY-2 */}
            <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12 mb-12">
              <div className="lg:text-right lg:pr-12">
                <div className="inline-flex items-center gap-2 rounded-full bg-cyan/10 px-4 py-1.5 text-sm font-bold text-cyan mb-4">
                  PGY-2
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  6-12 Months Before Application
                </h3>
                <p className="text-muted leading-relaxed">
                  Application preparation. Secure letters of recommendation,
                  draft your personal statement, and get everything ERAS-ready by
                  August. This is the most intensive preparation period.
                </p>
              </div>
              <div className="space-y-1 text-sm text-muted lg:pl-12">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-cyan shrink-0" />
                  <span>Request 3-4 letters of recommendation</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-cyan shrink-0" />
                  <span>Draft personal statement (start June/July)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-cyan shrink-0" />
                  <span>Polish CV — publications, presentations, awards</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-cyan shrink-0" />
                  <span>Research programs and create target list</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-cyan shrink-0" />
                  <span>Budget for application fees ($2,000-5,000+)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-cyan shrink-0" />
                  <span>ERAS application ready by August</span>
                </div>
              </div>
            </div>

            {/* PGY-3 */}
            <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
              <div className="lg:text-right lg:pr-12">
                <div className="inline-flex items-center gap-2 rounded-full bg-success/10 px-4 py-1.5 text-sm font-bold text-success mb-4">
                  PGY-3
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">
                  Application Year
                </h3>
                <p className="text-muted leading-relaxed">
                  Execution. Submit ERAS in September, interview through January,
                  submit rank lists, and match. Also your busiest clinical year
                  — time management is critical.
                </p>
              </div>
              <div className="space-y-1 text-sm text-muted lg:pl-12">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success shrink-0" />
                  <span>Submit ERAS application (September)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success shrink-0" />
                  <span>Interview season (October-January)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success shrink-0" />
                  <span>Track programs in a comparison spreadsheet</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success shrink-0" />
                  <span>Submit rank list (February deadline)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success shrink-0" />
                  <span>Match Day (December for most IM subspecialties)</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success shrink-0" />
                  <span>SOAP/scramble if needed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PGY-1 Detail */}
      <section id="pgy1" className="py-12 sm:py-16 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-8">
            <span className="inline-flex rounded-full bg-accent/10 px-4 py-1.5 text-sm font-bold text-accent">
              PGY-1
            </span>
            <h2 className="text-2xl font-bold text-foreground">
              Building Your Foundation
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {pgy1Tasks.map((task) => {
              const Icon = task.icon;
              return (
                <div
                  key={task.title}
                  className="rounded-xl border border-border bg-surface p-6 hover-glow"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="inline-flex items-center justify-center rounded-lg bg-accent/10 p-2.5">
                      <Icon className="h-5 w-5 text-accent" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {task.title}
                    </h3>
                  </div>
                  <ul className="space-y-3">
                    {task.details.map((detail, i) => (
                      <li
                        key={i}
                        className="flex gap-3 text-sm text-muted leading-relaxed"
                      >
                        <span className="text-accent mt-1 shrink-0">&#8226;</span>
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* PGY-2 Detail */}
      <section id="pgy2" className="py-12 sm:py-16 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-8">
            <span className="inline-flex rounded-full bg-cyan/10 px-4 py-1.5 text-sm font-bold text-cyan">
              PGY-2
            </span>
            <h2 className="text-2xl font-bold text-foreground">
              Application Preparation
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {pgy2Tasks.map((task) => {
              const Icon = task.icon;
              return (
                <div
                  key={task.title}
                  className="rounded-xl border border-border bg-surface p-6 hover-glow"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="inline-flex items-center justify-center rounded-lg bg-cyan/10 p-2.5">
                      <Icon className="h-5 w-5 text-cyan" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {task.title}
                    </h3>
                  </div>
                  <ul className="space-y-3">
                    {task.details.map((detail, i) => (
                      <li
                        key={i}
                        className="flex gap-3 text-sm text-muted leading-relaxed"
                      >
                        <span className="text-cyan mt-1 shrink-0">&#8226;</span>
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* PGY-3 Detail */}
      <section id="pgy3" className="py-12 sm:py-16 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-8">
            <span className="inline-flex rounded-full bg-success/10 px-4 py-1.5 text-sm font-bold text-success">
              PGY-3
            </span>
            <h2 className="text-2xl font-bold text-foreground">
              Application Year
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {pgy3Tasks.map((task) => {
              const Icon = task.icon;
              return (
                <div
                  key={task.title}
                  className="rounded-xl border border-border bg-surface p-6 hover-glow"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="inline-flex items-center justify-center rounded-lg bg-success/10 p-2.5">
                      <Icon className="h-5 w-5 text-success" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {task.title}
                    </h3>
                  </div>
                  <ul className="space-y-3">
                    {task.details.map((detail, i) => (
                      <li
                        key={i}
                        className="flex gap-3 text-sm text-muted leading-relaxed"
                      >
                        <span className="text-success mt-1 shrink-0">&#8226;</span>
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Fellowship Specialties & Competitiveness Tiers */}
      <section id="specialties" className="py-12 sm:py-16 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-foreground mb-3">
            Fellowship Specialties &amp; Competitiveness
          </h2>
          <p className="text-muted mb-8 max-w-3xl">
            Not all fellowships are created equal. Competitiveness varies widely
            — understand where your target specialty falls so you can prepare
            accordingly.
          </p>

          {/* Tier Legend */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            {Object.entries(tierInfo).map(([tier, info]) => (
              <div
                key={tier}
                className={`rounded-xl border border-border ${info.bg} p-5`}
              >
                <p className={`text-sm font-bold ${info.color} mb-1`}>
                  {info.label}
                </p>
                <p className="text-xs text-muted leading-relaxed">
                  {info.desc}
                </p>
              </div>
            ))}
          </div>

          {/* Specialty Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {fellowshipSpecialties.map((spec) => {
              const tier = tierInfo[spec.tier];
              return (
                <div
                  key={spec.name}
                  className="rounded-xl border border-border bg-surface p-5 hover-glow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-base font-semibold text-foreground">
                      {spec.name}
                    </h3>
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${tier.bg} ${tier.color}`}
                    >
                      {spec.competitiveness}
                    </span>
                  </div>
                  <div className="flex gap-4 text-xs text-muted mb-3">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {spec.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {spec.timeline}
                    </span>
                  </div>
                  <p className="text-sm text-muted leading-relaxed">
                    {spec.notes}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* IMG Considerations */}
      <section id="img" className="py-12 sm:py-16 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-3">
            <Globe className="h-6 w-6 text-accent" />
            <h2 className="text-2xl font-bold text-foreground">
              IMG-Specific Fellowship Considerations
            </h2>
          </div>
          <p className="text-muted mb-8 max-w-3xl">
            International medical graduates face additional challenges in the
            fellowship application process. Planning ahead for visa and
            immigration issues is critical.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {imgConsiderations.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="rounded-xl border border-border bg-surface p-6 hover-glow"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="inline-flex items-center justify-center rounded-lg bg-accent/10 p-2.5">
                      <Icon className="h-5 w-5 text-accent" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {item.title}
                    </h3>
                  </div>
                  <ul className="space-y-3">
                    {item.details.map((detail, i) => (
                      <li
                        key={i}
                        className="flex gap-3 text-sm text-muted leading-relaxed"
                      >
                        <span className="text-accent mt-1 shrink-0">&#8226;</span>
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-xl border border-border bg-surface-alt p-8 sm:p-10 text-center">
            <h2 className="text-2xl font-bold text-foreground mb-3">
              Browse Fellowship Programs
            </h2>
            <p className="text-muted mb-6 max-w-xl mx-auto">
              Search our fellowship database with visa sponsorship and match
              participation data to find programs that fit your criteria.
            </p>
            <Link
              href="/residency/fellowship"
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-6 py-3 text-sm font-semibold text-white hover:bg-accent/90 transition-colors"
            >
              Fellowship Database
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
