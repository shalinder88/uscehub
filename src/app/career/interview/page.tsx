import type { Metadata } from "next";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import {
  MessageSquare,
  ClipboardCheck,
  AlertTriangle,
  Search,
  FileText,
  Shield,
  Globe,
  CheckCircle2,
  XCircle,
  ArrowRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Interview Prep for Attending Jobs — USCEHub",
  description:
    "Comprehensive interview preparation guide for physicians seeking attending positions. Questions to ask employers, red flags to watch for, contract review checklist, and immigration-specific interview tips.",
  alternates: {
    canonical: "https://uscehub.com/career/interview",
  },
  openGraph: {
    title: "Interview Prep for Attending Jobs — USCEHub",
    description:
      "Real interview preparation for physician job seekers. Questions, red flags, and contract negotiation tips from physicians who have been through the process.",
    url: "https://uscehub.com/career/interview",
  },
};

function Section({
  icon,
  title,
  children,
  accent = "accent",
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  accent?: string;
}) {
  return (
    <section className="mb-12">
      <div className="flex items-center gap-3 mb-6">
        <div className={`rounded-lg bg-${accent}/10 p-2.5`}>{icon}</div>
        <h2 className="text-2xl font-bold text-foreground">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function QuestionCard({
  category,
  questions,
  icon,
}: {
  category: string;
  questions: { q: string; why: string }[];
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-6">
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h3 className="text-lg font-semibold text-foreground">{category}</h3>
      </div>
      <div className="space-y-4">
        {questions.map((item, i) => (
          <div key={i} className="border-l-2 border-accent/30 pl-4">
            <p className="text-sm font-medium text-foreground mb-1">
              &ldquo;{item.q}&rdquo;
            </p>
            <p className="text-xs text-muted">{item.why}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function InterviewPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    name: "Interview Prep for Attending Physician Jobs",
    description:
      "Comprehensive guide to interviewing for attending physician positions, including questions to ask, red flags, and contract negotiation tips.",
    url: "https://uscehub.com/career/interview",
    publisher: {
      "@type": "Organization",
      name: "USCEHub",
      url: "https://uscehub.com",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="rounded-lg bg-accent/10 p-2.5">
              <MessageSquare className="h-6 w-6 text-accent" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
              Interview Prep for Attending Jobs
            </h1>
          </div>
          <p className="text-muted max-w-3xl text-base leading-relaxed">
            The attending job interview is not like residency interviews. You are
            evaluating them as much as they are evaluating you. The questions you
            ask reveal more about your judgment than any answer you give. This
            guide is written by physicians who have been through the process and
            learned what matters — and what to walk away from.
          </p>
          <div className="mt-3">
            <VerifiedBadge date="March 2026" sources={["AMA", "AAFP", "Physician contracts"]} />
          </div>
        </div>

        {/* ═══ BEFORE THE INTERVIEW ═══ */}
        <Section
          icon={<Search className="h-5 w-5 text-cyan" />}
          title="Before the Interview"
          accent="cyan"
        >
          <div className="space-y-4">
            <div className="rounded-xl border border-border bg-surface p-6">
              <h3 className="text-base font-semibold text-foreground mb-4">
                Research the Employer
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-lg bg-surface-alt p-4">
                  <h4 className="text-sm font-semibold text-foreground mb-2">
                    CMS Open Payments
                  </h4>
                  <p className="text-xs text-muted">
                    Search openpaymentsdata.cms.gov to see what pharmaceutical
                    and device companies are paying physicians at the practice.
                    Not a dealbreaker, but useful context about the practice
                    culture and revenue sources.
                  </p>
                </div>
                <div className="rounded-lg bg-surface-alt p-4">
                  <h4 className="text-sm font-semibold text-foreground mb-2">
                    Physician Reviews
                  </h4>
                  <p className="text-xs text-muted">
                    Check Glassdoor, Doximity, and physician-specific forums.
                    Filter for reviews from physicians, not admin staff. Look for
                    patterns — one bad review is noise, five saying the same
                    thing is signal.
                  </p>
                </div>
                <div className="rounded-lg bg-surface-alt p-4">
                  <h4 className="text-sm font-semibold text-foreground mb-2">
                    Malpractice History
                  </h4>
                  <p className="text-xs text-muted">
                    Search the NPDB (National Practitioner Data Bank) and state
                    medical board for disciplinary actions against the practice
                    or its physicians. Check for patterns of lawsuits.
                  </p>
                </div>
                <div className="rounded-lg bg-surface-alt p-4">
                  <h4 className="text-sm font-semibold text-foreground mb-2">
                    Know the Market
                  </h4>
                  <p className="text-xs text-muted">
                    Before you walk in, know the salary range for your specialty
                    in that geography. Use MGMA data, Doximity reports, and our
                    salary guide. An informed candidate gets a better offer.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-accent/20 bg-accent/5 p-6">
              <h3 className="text-base font-semibold text-accent mb-2">
                The Golden Rule of Attending Interviews
              </h3>
              <p className="text-sm text-muted leading-relaxed">
                The questions you ask matter more than the answers you give. An
                employer asking you clinical questions is testing for
                competence — you proved that in boards and residency. What they
                are really assessing is whether you will fit, stay, and not
                cause problems. What YOU should be assessing is whether this job
                will make your life better or worse in 3 years.
              </p>
            </div>
          </div>
        </Section>

        {/* ═══ QUESTIONS TO ASK ═══ */}
        <Section
          icon={<ClipboardCheck className="h-5 w-5 text-accent" />}
          title="Questions to Ask the Employer"
        >
          <p className="text-sm text-muted mb-6">
            Bring a printed list. Asking good questions signals that you are
            serious, informed, and not desperate. Every question below has a
            reason.
          </p>

          <div className="space-y-6">
            <QuestionCard
              category="Compensation & Contract"
              icon={
                <FileText className="h-4 w-4 text-success" />
              }
              questions={[
                {
                  q: "What is the base salary and is there a productivity component?",
                  why: "Establishes whether compensation is guaranteed or performance-based. Many offers advertise the productivity ceiling, not the guarantee.",
                },
                {
                  q: "What are the RVU expectations? What happens if I exceed or fall short?",
                  why: "You need to know the threshold AND the consequence. Some employers reduce salary if you fall below target. Others have no penalty but no upside either.",
                },
                {
                  q: "Is the salary guaranteed, and for how long?",
                  why: "Most employed positions guarantee salary for 1-2 years, then switch to productivity. Know when the safety net ends.",
                },
                {
                  q: "Is there a signing bonus? Is it repaid if I leave early?",
                  why: "Almost all signing bonuses have payback clauses. Push for prorated payback (1/36th forgiven per month) rather than a cliff (full payback if you leave before 3 years).",
                },
                {
                  q: "What is the malpractice coverage? Occurrence or claims-made? Who pays for tail?",
                  why: "This is a $20K-$100K+ question. Claims-made without tail coverage means YOU pay a massive premium when you leave. Occurrence-based is far better.",
                },
              ]}
            />

            <QuestionCard
              category="Practice & Clinical"
              icon={
                <Shield className="h-4 w-4 text-cyan" />
              }
              questions={[
                {
                  q: "What is the average daily patient volume?",
                  why: "20 patients/day is manageable. 30+ is a grind. Know what you are walking into and whether it is sustainable long-term.",
                },
                {
                  q: "What is the call schedule? Is call compensated separately?",
                  why: "Uncompensated call is effectively a pay cut. 1:3 call as a new attending is brutal. Know the schedule AND whether it changes with seniority.",
                },
                {
                  q: "Is there APP (NP/PA) support?",
                  why: "APP support can dramatically improve your quality of life. It also means you can see more complex patients while APPs handle follow-ups.",
                },
                {
                  q: "Who handles prior authorizations?",
                  why: "If the answer is 'you,' factor in 30-60 minutes of unpaid administrative work per day. Dedicated prior auth staff is a significant quality-of-life factor.",
                },
                {
                  q: "What EMR do you use?",
                  why: "Epic is the gold standard for future mobility — your experience transfers. Smaller EMRs mean retraining every time you move. Also assess Epic vs. Cerner vs. others for daily workflow impact.",
                },
                {
                  q: "What is the average time from referral to consult?",
                  why: "Long wait times (>4 weeks for non-urgent) suggest the practice is understaffed. You may inherit a large backlog.",
                },
                {
                  q: "Is teaching expected? If so, is it compensated?",
                  why: "Teaching adds hours to your week. Academic appointments can be fulfilling but should be reflected in your compensation or protected time.",
                },
              ]}
            />

            <QuestionCard
              category="Culture & Environment"
              icon={
                <MessageSquare className="h-4 w-4 text-accent" />
              }
              questions={[
                {
                  q: "What is the physician turnover rate in the last 3 years?",
                  why: "This is the single most important question. A turnover rate above 20% is a red flag. If physicians are leaving, there is a reason — and you will discover it after you sign.",
                },
                {
                  q: "How many physicians have left in the last 2 years and why?",
                  why: "Forces a specific answer. Vague responses ('a few moved for personal reasons') are a warning sign. Good employers are transparent about departures.",
                },
                {
                  q: "Can I speak with current physicians privately?",
                  why: "If they refuse, walk away. Any employer confident in their culture will let you talk to existing physicians without supervision.",
                },
                {
                  q: "What does partnership track look like?",
                  why: "For private practice: when, how much buy-in, what do you get for it, and what happens if you leave before or after partnership. Get specifics, not 'we will discuss that later.'",
                },
                {
                  q: "How are scheduling conflicts resolved?",
                  why: "Reveals the power dynamics. Do senior physicians always get first pick? Is there a fair rotation system? This affects your life for the next 3+ years.",
                },
              ]}
            />

            <QuestionCard
              category="Immigration (J-1/H-1B Physicians)"
              icon={
                <Globe className="h-4 w-4 text-success" />
              }
              questions={[
                {
                  q: "Do you sponsor J-1 waiver?",
                  why: "Confirms they have done this before and understand the process. An employer new to J-1 waivers may not understand their obligations.",
                },
                {
                  q: "Will you file H-1B?",
                  why: "H-1B provides work authorization while green card is pending. Ensures you are not stuck if the waiver job does not work out long-term.",
                },
                {
                  q: "Do you support green card (PERM/EB-2)?",
                  why: "The most important long-term question for IMGs. If they will not sponsor your green card, you will need to find another employer who will — and restart the clock.",
                },
                {
                  q: "What is the typical green card timeline for physicians here?",
                  why: "Tests whether they have actually processed green cards before. A knowledgeable employer will give you a range (typically 2-5 years depending on country of birth).",
                },
                {
                  q: "Is there a J-1 waiver payback requirement beyond the 3-year commitment?",
                  why: "Some employers add additional service requirements (4-5 years total) on top of the mandatory 3-year waiver commitment. Know this before you sign.",
                },
              ]}
            />
          </div>
        </Section>

        {/* ═══ RED FLAGS ═══ */}
        <Section
          icon={<AlertTriangle className="h-5 w-5 text-danger" />}
          title="Red Flags During Interviews"
          accent="danger"
        >
          <p className="text-sm text-muted mb-6">
            These are the warning signs that experienced physicians wish they had
            recognized before signing. Any one of these should make you pause.
            Two or more should make you walk.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                flag: "They will not let you talk to current physicians",
                detail:
                  "The single biggest red flag. If they are hiding their own physicians from you, imagine what they are hiding from patients.",
              },
              {
                flag: "High turnover or vague answers about departures",
                detail:
                  "\"People come and go\" is not an answer. Press for specifics. If 3+ physicians have left in 2 years from a small group, there is a systemic problem.",
              },
              {
                flag: "\"We will discuss compensation later\"",
                detail:
                  "Compensation should be transparent from the first serious conversation. Employers who delay this discussion are either disorganized or planning to lowball you.",
              },
              {
                flag: "Non-compete exceeds 25 miles or 2 years",
                detail:
                  "A 50-mile, 3-year non-compete means you would have to uproot your family if the job does not work out. Push back hard or walk away.",
              },
              {
                flag: "Claims-made malpractice with no tail provision",
                detail:
                  "Tail coverage costs $20K-$100K+ depending on specialty. If the employer will not pay tail, you are trapped — leaving means a massive out-of-pocket cost.",
              },
              {
                flag: "Pressure to sign quickly",
                detail:
                  "\"This offer expires Friday\" is a manipulation tactic. Legitimate employers give 2-4 weeks minimum. Any employer that pressures you will pressure you as an employee too.",
              },
              {
                flag: "At-will termination with no notice period",
                detail:
                  "You need at least 90-180 days without-cause termination notice. At-will means they can fire you tomorrow with no recourse — devastating if you are on a visa.",
              },
              {
                flag: "No clear path to green card support after waiver",
                detail:
                  "For IMG physicians: if the employer is vague about green card sponsorship, you may complete your 3-year waiver and then need to start over elsewhere.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="rounded-xl border border-danger/20 bg-danger/5 p-5"
              >
                <div className="flex items-start gap-2 mb-2">
                  <XCircle className="h-4 w-4 text-danger shrink-0 mt-0.5" />
                  <h3 className="text-sm font-semibold text-foreground">
                    {item.flag}
                  </h3>
                </div>
                <p className="text-xs text-muted leading-relaxed pl-6">
                  {item.detail}
                </p>
              </div>
            ))}
          </div>
        </Section>

        {/* ═══ AFTER THE INTERVIEW ═══ */}
        <Section
          icon={<CheckCircle2 className="h-5 w-5 text-success" />}
          title="After the Interview"
          accent="success"
        >
          <div className="space-y-4">
            {[
              {
                step: "Get everything in writing",
                detail:
                  "Verbal promises mean nothing. If the recruiter said \"we usually sponsor green cards\" or \"call is only 1:5,\" it needs to be in the contract. If they refuse to put it in writing, it was never real.",
              },
              {
                step: "Have a healthcare attorney review the contract",
                detail:
                  "Budget $500-$1,000 for a physician contract attorney. This is not optional — it is the best money you will spend. A good attorney will catch non-compete traps, malpractice gaps, and termination clauses that cost you $50K+.",
              },
              {
                step: "Negotiate — always",
                detail:
                  "Do not accept the first offer. At minimum, negotiate the signing bonus and start date. Most employers expect negotiation and build in room. Even a $5K increase in signing bonus costs you nothing to ask for.",
              },
              {
                step: "Check the NPPES NPI database",
                detail:
                  "Verify the practice and its physicians are in good standing. Search npiregistry.cms.hhs.gov for the organization NPI and individual NPIs.",
              },
              {
                step: "Talk to the prior physician who held the position",
                detail:
                  "If possible, find and contact the physician who last held the role. LinkedIn, Doximity, or state medical board records can help you find them. Ask why they left — their answer will tell you more than the entire interview.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="rounded-xl border border-border bg-surface p-5 flex items-start gap-4"
              >
                <div className="rounded-full bg-success/10 text-success w-8 h-8 flex items-center justify-center text-sm font-bold shrink-0">
                  {i + 1}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-1">
                    {item.step}
                  </h3>
                  <p className="text-xs text-muted leading-relaxed">
                    {item.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-accent/20 bg-accent/5 p-6 mt-6">
            <div className="flex items-center gap-2 mb-3">
              <ArrowRight className="h-4 w-4 text-accent" />
              <h3 className="text-sm font-semibold text-accent">
                Ready to Compare Offers?
              </h3>
            </div>
            <p className="text-xs text-muted leading-relaxed">
              Use our Offer Compare tool to evaluate up to 4 job offers side by
              side, including salary, RVU targets, benefits, non-compete terms,
              and immigration support. Red flags are automatically highlighted.
            </p>
          </div>
        </Section>
      </div>
    </>
  );
}
