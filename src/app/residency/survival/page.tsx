import type { Metadata } from "next";
import Link from "next/link";
import {
  Stethoscope,
  Shirt,
  MonitorSmartphone,
  Utensils,
  FileText,
  Phone,
  Presentation,
  AlertTriangle,
  Moon,
  Brain,
  Heart,
  Users,
  GraduationCap,
  Briefcase,
  Scale,
  Shield,
  Clock,
  ArrowRight,
  CheckCircle,
  XCircle,
  Siren,
  Activity,
  Bed,
  Coffee,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Residency Survival Guide — The Real Playbook — USCEHub",
  description:
    "The residency survival guide you actually need — first week checklist, how to present on rounds, common intern mistakes, night float survival, burnout prevention, and the transition to attending life.",
  alternates: {
    canonical: "https://uscehub.com/residency/survival",
  },
  openGraph: {
    title: "Residency Survival Guide — USCEHub",
    description:
      "Actionable residency survival advice from PGY-1 through graduating — written like a senior resident talking to an intern.",
    url: "https://uscehub.com/residency/survival",
  },
};

/* ------------------------------------------------------------------ */
/*  Data                                                               */
/* ------------------------------------------------------------------ */

const firstWeekItems = [
  {
    icon: Shirt,
    title: "What to Wear & Bring",
    content: [
      "Business casual under your white coat. Comfortable shoes — you will walk 5-8 miles a day. Many residents swear by running shoes with insoles.",
      "Stethoscope (Littmann Cardiology IV is the standard, but a Classic III works fine). Penlight. Reflex hammer if you're on neuro.",
      "Phone charger — non-negotiable. Your phone is your pager, calculator, reference, and lifeline. Bring a portable battery pack.",
      "Pocket references: a small notebook or cards with common medication doses, ventilator settings, and your personal sign-out template.",
      "Snacks. You will forget to eat. Protein bars in your white coat pocket will save you at 3pm when you haven't eaten since 7am.",
    ],
  },
  {
    icon: MonitorSmartphone,
    title: "The EMR Reality",
    content: [
      "You will spend more time on Epic or Cerner than with patients. This is not a joke. Accept it and get efficient.",
      "Ask senior residents about dot phrases and smart phrases immediately. A good note template saves 20-30 minutes per patient per day.",
      "Learn the keyboard shortcuts: in Epic, Ctrl+G opens patient search, F2 opens chart review. These add up to hours saved per week.",
      "Set up your note templates in the first week. Don't wait. Your first admission note will take 2 hours. By month two, it should take 30 minutes.",
      "Order sets exist for a reason. Learn which ones your program uses for common admissions (CHF exacerbation, COPD, pneumonia, DKA).",
    ],
  },
  {
    icon: Utensils,
    title: "Logistics: Food, Sleep, Survival",
    content: [
      "Find the cafeteria hours, the closest vending machines, and which floors have microwaves. Know where the free food shows up (conference leftovers, drug rep lunches).",
      "Locate the call rooms and know how to access them. Even 20 minutes of sleep on a 28-hour call makes a difference.",
      "Know the parking situation. Where to park, what time lots fill up, where the overflow is. Getting a parking spot at 5:45am shouldn't be stressful.",
      "Find the resident lounge. This is where you will decompress, vent, and eat sad meals at 11pm. It becomes sacred space.",
    ],
  },
  {
    icon: FileText,
    title: "Writing Your First Note",
    content: [
      "H&P structure: Chief Complaint, HPI (be concise — tell the story in 4-6 sentences), ROS, PMH/PSH/Meds/Allergies/Social/Family, Physical Exam, Labs/Imaging, Assessment & Plan.",
      "The Assessment & Plan is the only part most attendings read carefully. Organize by problem. For each problem: what you think it is, why, and what you're doing about it.",
      "Don't copy-forward old notes without reading them. Stale information in notes leads to real clinical errors.",
      "Progress notes should be focused: overnight events, current vitals/exam changes, new labs/imaging, updated A&P. Not a rehash of the entire history.",
      "Document your clinical reasoning. 'Continuing antibiotics' is weak. 'Day 3 of ceftriaxone for CAP, improving clinically — will complete 5-day course per ATS guidelines' is what you want.",
    ],
  },
  {
    icon: Phone,
    title: "Paging Etiquette",
    content: [
      "When you page someone: state who you are, which patient, what you need, and how urgent it is. 'Hi, this is Dr. X, PGY-1 on 7 South. I'm calling about Mr. Y in room 712. He has a new fever to 101.4 and I'd like to discuss empiric antibiotics.'",
      "When paging consults: have the patient's story ready. Know the specific question you're asking. 'Please evaluate' is not a consult question. 'Does this patient need an ERCP for a 12mm CBD stone with cholangitis?' is.",
      "Urgent pages: chest pain, acute respiratory distress, altered mental status, active bleeding, code blue. These get answered immediately.",
      "Non-urgent pages: medication refills, diet orders, non-critical lab results, discharge planning questions. These can wait and should be batched when possible.",
      "Never hesitate to page your senior or attending for a sick patient. They would rather get a 2am call than find out at 7am that a patient deteriorated overnight.",
    ],
  },
];

const roundsPresentation = {
  structure: [
    {
      step: "One-Liner",
      example:
        "Mr. Smith is a 68-year-old man with CHF and CKD3, admitted 2 days ago for acute decompensated heart failure.",
      tip: "Set the stage in one sentence. Age, key comorbidities, reason for admission, hospital day.",
    },
    {
      step: "Overnight Events",
      example:
        "Overnight he required an additional 40mg IV furosemide for worsening dyspnea. He had one episode of atrial fibrillation with RVR to 140s, rate-controlled with metoprolol.",
      tip: "What happened since the last time the team discussed this patient? Focus on changes, not routine.",
    },
    {
      step: "Vitals & Exam",
      example:
        "Vitals: afebrile, heart rate 78, BP 118/72, sating 95% on 2L. Weight down 1.2kg from yesterday. Exam notable for decreased bilateral crackles compared to admission, 1+ pitting edema down from 2+.",
      tip: "Hit the key numbers. Focus on what changed. Don't recite every normal finding.",
    },
    {
      step: "Labs & Imaging",
      example:
        "Creatinine stable at 1.8 from 2.1 on admission. BNP trending down to 1,200 from 3,400. Chest X-ray shows improved bilateral effusions.",
      tip: "Trends matter more than single values. Compare to admission or prior day.",
    },
    {
      step: "Assessment & Plan",
      example:
        "Overall improving with diuresis. I'd like to continue IV furosemide today with a goal of another 1-2 liters net negative, transition to oral when comfortable. Will uptitrate his lisinopril if BP tolerates. Discharge goal is tomorrow if he can ambulate and maintain oxygen on room air.",
      tip: "This is what attendings actually want to hear. Your thinking. Your plan. Own it — even if they change it.",
    },
  ],
  tips: [
    "Keep it under 2 minutes per patient. If the attending wants more detail, they'll ask.",
    "What attendings actually care about: your assessment and plan. Not a perfect data recitation.",
    "It's okay to be wrong. Every intern gets pimped and doesn't know the answer. The attending already knows the answer — they're testing your reasoning process, not your memory.",
    "'Thinking out loud' means walking through your differential. 'His troponin is elevated. This could be demand ischemia in the setting of his AFib with RVR, versus ACS, versus type 2 MI from his sepsis. I think demand ischemia is most likely because...'",
    "Never make up data. If you didn't check the morning labs yet, say so. Fabricating a number and getting caught is far worse than admitting you haven't looked.",
  ],
};

const internMistakes = [
  {
    mistake: "Not calling for help soon enough",
    reality:
      "This is the number one intern mistake and the most dangerous. You are not expected to manage a crashing patient alone. Call your senior. Call a rapid response. The worst thing that happens is they say the patient is fine. The worst thing that happens if you don't call is a patient dies.",
  },
  {
    mistake: "Not checking labs before rounds",
    reality:
      "Show up to rounds without knowing your patients' morning labs and you'll spend the day catching up. Pre-round at least 30 minutes before rounds start. Check vitals, overnight events, new labs, and imaging results.",
  },
  {
    mistake: "Forgetting to update the patient and family",
    reality:
      "Families get anxious when nobody talks to them. A 2-minute bedside update — 'Here's what we found, here's the plan for today' — prevents angry family members, complaints, and pages from nursing.",
  },
  {
    mistake: "Documentation shortcuts that bite you later",
    reality:
      "Copy-forwarding notes without updating the assessment. Documenting 'lungs clear' when you didn't listen. Writing 'patient doing well' when they're not. Notes are legal documents. They protect you, or they don't.",
  },
  {
    mistake: "Trying to do everything yourself",
    reality:
      "Delegate appropriately. Social work can handle discharge planning. Case management can arrange home health. Pharmacy can dose vancomycin. Your job is to coordinate care, not do every task personally.",
  },
  {
    mistake: "Not eating, not hydrating, not sleeping",
    reality:
      "You cannot provide good patient care when you're running on caffeine and adrenaline alone. Eat something every 4-5 hours even if it's just a protein bar. Drink water. Sleep when you can on call. This isn't weakness — it's basic physiology.",
  },
];

const nightFloatSurvival = [
  {
    icon: Siren,
    title: "Triage: The Mental Framework",
    content: [
      "Emergent (act now): chest pain with ECG changes, acute respiratory failure, stroke symptoms, GI bleed with hemodynamic instability, anaphylaxis, cardiac arrest.",
      "Urgent (within 30-60 minutes): new fever with neutropenia, acute kidney injury with dangerous potassium, change in mental status, significant new arrhythmia.",
      "Can wait (next few hours): stable low-grade fever, mild pain needing reassessment, routine medication questions, insomnia, constipation.",
      "The single most important skill on night float is knowing what you don't know. If something feels wrong, escalate. Your gut instinct develops over time.",
    ],
  },
  {
    icon: Bed,
    title: "The 2am Cross-Cover Calls",
    content: [
      "Pain: check the medication administration record first. Did they get their scheduled pain meds? Can you give a PRN dose? If they're post-surgical with escalating pain, think about complications.",
      "Insomnia: melatonin 3-5mg, trazodone 25-50mg, or hydroxyzine 25mg are common first-line. Avoid benzodiazepines in elderly patients (delirium risk).",
      "Fever: get vitals, blood cultures x2 (from different sites), urinalysis with culture, chest X-ray. Start empiric antibiotics if the patient looks septic. Don't wait for culture results.",
      "Fall: assess for injury (head, hip, spine). Check mental status. Check for orthostatic hypotension. CT head if on anticoagulation or hit their head. Document the event and fall risk assessment.",
      "Blood sugar: for hypoglycemia (<70), give D50 if IV access, glucagon if not. Recheck in 15 minutes. Hold insulin doses and adjust for morning. For hyperglycemia (>300), check ketones and consider insulin sliding scale vs. DKA protocol.",
    ],
  },
  {
    icon: Activity,
    title: "When to Call the Senior or Attending",
    content: [
      "Always call for: chest pain with ECG changes, acute desaturation, altered mental status, code blue/rapid response, new acute neurological deficits, massive GI bleed, anaphylaxis.",
      "Probably call for: patient requiring ICU transfer, family requesting goals-of-care discussion, unexpected critical lab value, medication error, patient wanting to leave AMA.",
      "The rule of thumb: if you're wondering whether you should call, you should call. Attendings and seniors would always rather be woken up for a false alarm than find out about a disaster in the morning.",
    ],
  },
  {
    icon: Coffee,
    title: "Managing Sleep Deprivation",
    content: [
      "Sleep before your shift if possible. Even a 2-3 hour nap before a night shift improves performance.",
      "Caffeine strategically: have coffee at the start of your shift and again around midnight. Avoid caffeine after 3am if your shift ends at 7am — you need to sleep after.",
      "Bright lights help keep you alert. Dim lights on your drive home signal your brain to sleep.",
      "Your off-days on night float are for sleeping, not for running errands. Protect your sleep. Blackout curtains, white noise, phone on silent.",
      "The post-night-float transition day is dangerous for driving. Seriously consider Uber/Lyft home after your last night shift if you're drowsy.",
    ],
  },
];

const icuEssentials = [
  {
    label: "MAP Calculation",
    formula: "MAP = (SBP + 2 x DBP) / 3",
    note: "Target MAP > 65 mmHg in most patients. Sepsis guidelines recommend MAP > 65 as initial target.",
  },
  {
    label: "FiO2 Titration",
    formula: "Target SpO2 92-96% (88-92% in COPD)",
    note: "Increase FiO2 in 10% increments. If FiO2 > 60% and not maintaining sats, consider PEEP increase or escalation to BiPAP/intubation.",
  },
  {
    label: "Vasopressor Basics",
    formula: "Norepinephrine first line for septic shock",
    note: "Start at 0.05-0.1 mcg/kg/min. Titrate to MAP > 65. If maxing out norepinephrine (>0.5 mcg/kg/min), add vasopressin 0.04 units/min as second agent.",
  },
  {
    label: "Corrected Sodium",
    formula: "Na + 1.6 x [(glucose - 100) / 100]",
    note: "Use when glucose is elevated. Corrected sodium tells you the true sodium status.",
  },
  {
    label: "A-a Gradient",
    formula: "A-a = (FiO2 x 713 - PaCO2/0.8) - PaO2",
    note: "Normal A-a gradient = (Age/4) + 4. Elevated gradient suggests V/Q mismatch, shunt, or diffusion impairment.",
  },
];

const burnoutContent = {
  signs: [
    "Dreading going to work every single day (beyond normal tiredness)",
    "Feeling emotionally numb toward patients",
    "Cynicism that wasn't there before — making fun of patients, detaching",
    "Difficulty sleeping even when you have time (racing thoughts, anxiety)",
    "Losing interest in things you used to enjoy outside of medicine",
    "Increased irritability with co-workers, friends, or family",
    "Feeling like nothing you do matters or makes a difference",
  ],
  vs_tired: [
    "Tired: you recover after a day off. Burned out: a week off doesn't help.",
    "Tired: you still care about patients. Burned out: you feel nothing.",
    "Tired: you can identify what's exhausting you. Burned out: everything feels equally draining.",
    "Tired: sleep helps. Burned out: you sleep but wake up still feeling empty.",
  ],
  resources: [
    "Employee Assistance Program (EAP) — every hospital has one. It's free and confidential. Your program director does not find out you used it.",
    "Physician Support Line: 1-888-409-0141. Free, confidential, staffed by psychiatrists who understand physician culture.",
    "Dr. Lorna Breen Heroes' Foundation — named after an ER physician lost to suicide. Resources specifically for healthcare workers.",
    "Your state medical board cannot ask about mental health treatment that doesn't impair your ability to practice. Most states have updated their licensing questions. Don't let fear of reporting stop you from getting help.",
  ],
  realistic: [
    "Exercise: even 20 minutes 3x per week makes a measurable difference in mood. A walk counts. It doesn't have to be CrossFit.",
    "Sleep: protect it ruthlessly on your days off. No, you can't 'make up' sleep debt completely. But consistent sleep on off-days helps.",
    "Relationships: schedule time with people you care about. Put it in your calendar like a shift. Otherwise residency will consume all your time.",
    "Hobbies: maintain at least one thing that has nothing to do with medicine. Cooking, gaming, running, reading fiction — something that's just yours.",
    "It's okay to not love every rotation. It's okay to not love medicine every day. That doesn't mean you chose wrong. It means you're human.",
  ],
};

const pgy2Content = [
  {
    icon: Users,
    title: "Teaching Interns",
    details: [
      "You are now responsible for your interns' education and wellbeing. They will look to you for clinical guidance, emotional support, and modeling of professionalism.",
      "Teach on rounds: a 3-minute teaching point connected to a real patient sticks better than any lecture. 'This patient has low-albumin edema — let me explain why we use albumin-corrected calcium.'",
      "Give feedback in private. Praise in public, correct in private. Be specific: 'Your presentation was too long — try trimming the HPI to 3 sentences' is better than 'work on your presentations.'",
      "The senior resident's most important role: buffer between interns and attendings. Shield your interns from unreasonable demands. Advocate for them when they're struggling.",
      "Check in on your interns personally. Ask how they're doing. Notice when someone seems off. A 5-minute conversation can prevent a crisis.",
    ],
  },
  {
    icon: GraduationCap,
    title: "Fellowship Planning",
    details: [
      "If you're considering fellowship, PGY-2 is when preparation intensifies. See our comprehensive guide for the full timeline.",
      "Start identifying mentors and building research. By mid-PGY-2, you should have a clear target specialty.",
      "Letters of recommendation: approach potential letter writers by spring of PGY-2.",
    ],
    link: { href: "/residency/fellowship/guide", label: "Fellowship Strategy Guide" },
  },
];

const pgy3Content = [
  {
    icon: Briefcase,
    title: "Job Search Reality",
    details: [
      "Recruiters will start contacting you mid-PGY-2 and it ramps up significantly in PGY-3. Most have legitimate offers, but they're working for the employer, not you.",
      "Use multiple channels: PracticeLink, PracticeMatch, NEJM Career Center, specialty-specific job boards, and your professional network.",
      "Questions to ask about every opportunity: What's the call schedule? How many patients per day? What's the payer mix? Is there partnership track? What happened to the last person in this role?",
      "Red flags: the position has been open for a long time, they can't answer basic compensation questions, they pressure you to sign quickly, the current physicians seem unhappy or are all leaving.",
    ],
    link: { href: "/career", label: "Career Section" },
  },
  {
    icon: Scale,
    title: "Transition to Attending",
    details: [
      "Your first month as an attending is harder than intern year — but for different reasons. As an intern, someone checked your work. As an attending, the buck stops with you.",
      "Malpractice insurance: occurrence vs. claims-made is the most important distinction you'll encounter. Occurrence covers you for events that happened during the policy period regardless of when the claim is filed. Claims-made only covers you if you have active coverage when the claim is filed — meaning you need 'tail coverage' when you leave a job.",
      "Tail coverage can cost $30,000-100,000+ depending on specialty and region. ALWAYS negotiate for the employer to cover tail in your contract. This is a dealbreaker issue.",
      "Credentialing at hospitals takes 3-6 months. Start the process immediately after signing a contract. Delays in credentialing mean delays in starting work and getting paid.",
      "Non-compete clauses: know exactly what yours says. A 20-mile, 2-year non-compete in a rural area could mean moving to a different state if the job doesn't work out.",
    ],
    link: { href: "/residency/salary", label: "Salary & Contract Guide" },
  },
];

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function SurvivalPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Residency Survival Guide — The Real Playbook",
    description:
      "Actionable residency survival guide from PGY-1 through attending transition — first week, rounds, night float, burnout, and career.",
    url: "https://uscehub.com/residency/survival",
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
        name: "Survival Guide",
        item: "https://uscehub.com/residency/survival",
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

      {/* Hero */}
      <section className="py-12 sm:py-16 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-1.5 text-sm font-medium text-accent mb-6">
              <Stethoscope className="h-4 w-4" />
              Written by residents, for residents
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
              Residency Survival Guide
            </h1>
            <p className="mt-4 text-lg text-muted leading-relaxed">
              This isn&apos;t a generic list of tips. This is the playbook your
              senior resident would give you on day one — specific, actionable,
              and honest about what residency is actually like.
            </p>
          </div>
        </div>
      </section>

      {/* ========== PGY-1 ========== */}

      {/* First Week Survival */}
      <section id="first-week" className="py-12 sm:py-16 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-8">
            <span className="inline-flex rounded-full bg-accent/10 px-4 py-1.5 text-sm font-bold text-accent">
              PGY-1
            </span>
            <h2 className="text-2xl font-bold text-foreground">
              First Week Survival
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {firstWeekItems.map((item) => {
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
                    {item.content.map((line, i) => (
                      <li
                        key={i}
                        className="flex gap-3 text-sm text-muted leading-relaxed"
                      >
                        <span className="text-accent mt-1 shrink-0">&#8226;</span>
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How to Present on Rounds */}
      <section id="rounds" className="py-12 sm:py-16 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-3">
            <span className="inline-flex rounded-full bg-accent/10 px-4 py-1.5 text-sm font-bold text-accent">
              PGY-1
            </span>
            <h2 className="text-2xl font-bold text-foreground">
              How to Present on Rounds
            </h2>
          </div>
          <p className="text-muted mb-8 max-w-3xl">
            The 2-minute presentation is an art. Here&apos;s the structure, with
            examples of what good sounds like.
          </p>

          {/* Presentation Structure */}
          <div className="space-y-4 mb-10">
            {roundsPresentation.structure.map((step, i) => (
              <div
                key={step.step}
                className="rounded-xl border border-border bg-surface p-6"
              >
                <div className="flex items-start gap-4">
                  <span className="inline-flex items-center justify-center rounded-lg bg-accent/10 h-8 w-8 text-sm font-bold text-accent shrink-0">
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-base font-semibold text-foreground mb-2">
                      {step.step}
                    </h3>
                    <div className="rounded-lg bg-surface-alt border border-border p-4 mb-3">
                      <p className="text-sm text-foreground italic leading-relaxed">
                        &ldquo;{step.example}&rdquo;
                      </p>
                    </div>
                    <p className="text-sm text-muted leading-relaxed">
                      {step.tip}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Rounds Tips */}
          <div className="rounded-xl border border-border bg-surface p-6">
            <h3 className="text-base font-semibold text-foreground mb-4">
              Things Nobody Tells You About Rounds
            </h3>
            <ul className="space-y-3">
              {roundsPresentation.tips.map((tip, i) => (
                <li
                  key={i}
                  className="flex gap-3 text-sm text-muted leading-relaxed"
                >
                  <span className="text-accent mt-1 shrink-0">&#8226;</span>
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Common Intern Mistakes */}
      <section id="mistakes" className="py-12 sm:py-16 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-3">
            <span className="inline-flex rounded-full bg-accent/10 px-4 py-1.5 text-sm font-bold text-accent">
              PGY-1
            </span>
            <h2 className="text-2xl font-bold text-foreground">
              Common Intern Mistakes
            </h2>
          </div>
          <p className="text-muted mb-8 max-w-3xl">
            Every intern makes these. Knowing about them beforehand doesn&apos;t
            guarantee you won&apos;t — but it helps you catch yourself faster.
          </p>

          <div className="space-y-4">
            {internMistakes.map((item) => (
              <div
                key={item.mistake}
                className="rounded-xl border border-border bg-surface p-6 hover-glow"
              >
                <div className="flex items-start gap-3 mb-2">
                  <XCircle className="h-5 w-5 text-red-400 mt-0.5 shrink-0" />
                  <h3 className="text-base font-semibold text-foreground">
                    {item.mistake}
                  </h3>
                </div>
                <p className="text-sm text-muted leading-relaxed pl-8">
                  {item.reality}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Night Float / ICU Survival */}
      <section id="night-float" className="py-12 sm:py-16 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-3">
            <span className="inline-flex rounded-full bg-accent/10 px-4 py-1.5 text-sm font-bold text-accent">
              PGY-1
            </span>
            <h2 className="text-2xl font-bold text-foreground">
              Night Float &amp; ICU Survival
            </h2>
          </div>
          <p className="text-muted mb-8 max-w-3xl">
            Night float is where you learn to triage, think independently, and
            manage fear. Here&apos;s how to survive it.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
            {nightFloatSurvival.map((item) => {
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
                    {item.content.map((line, i) => (
                      <li
                        key={i}
                        className="flex gap-3 text-sm text-muted leading-relaxed"
                      >
                        <span className="text-accent mt-1 shrink-0">&#8226;</span>
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          {/* ICU Quick Reference */}
          <div className="rounded-xl border border-border bg-surface p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5 text-cyan" />
              Essential ICU Quick Reference
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {icuEssentials.map((calc) => (
                <div
                  key={calc.label}
                  className="rounded-lg border border-border bg-surface-alt p-4"
                >
                  <p className="text-sm font-semibold text-foreground mb-1">
                    {calc.label}
                  </p>
                  <p className="text-sm text-cyan font-mono mb-2">
                    {calc.formula}
                  </p>
                  <p className="text-xs text-muted leading-relaxed">
                    {calc.note}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Burnout Prevention */}
      <section id="burnout" className="py-12 sm:py-16 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-3">
            <span className="inline-flex rounded-full bg-amber-400/10 px-4 py-1.5 text-sm font-bold text-amber-400">
              All Years
            </span>
            <h2 className="text-2xl font-bold text-foreground">
              Burnout Prevention — Real Talk
            </h2>
          </div>
          <p className="text-muted mb-8 max-w-3xl">
            Burnout isn&apos;t weakness. It&apos;s the predictable result of an
            unsustainable system. Recognizing it early is the first step.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Signs */}
            <div className="rounded-xl border border-border bg-surface p-6">
              <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-400" />
                Signs You&apos;re Burning Out
              </h3>
              <ul className="space-y-2">
                {burnoutContent.signs.map((sign, i) => (
                  <li
                    key={i}
                    className="flex gap-3 text-sm text-muted leading-relaxed"
                  >
                    <span className="text-amber-400 mt-1 shrink-0">&#8226;</span>
                    <span>{sign}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tired vs Burned Out */}
            <div className="rounded-xl border border-border bg-surface p-6">
              <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                <Brain className="h-5 w-5 text-accent" />
                Tired vs. Burned Out
              </h3>
              <ul className="space-y-2">
                {burnoutContent.vs_tired.map((line, i) => (
                  <li
                    key={i}
                    className="flex gap-3 text-sm text-muted leading-relaxed"
                  >
                    <span className="text-accent mt-1 shrink-0">&#8226;</span>
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Resources */}
            <div className="rounded-xl border border-border bg-surface p-6">
              <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                <Shield className="h-5 w-5 text-success" />
                Confidential Resources
              </h3>
              <ul className="space-y-2">
                {burnoutContent.resources.map((resource, i) => (
                  <li
                    key={i}
                    className="flex gap-3 text-sm text-muted leading-relaxed"
                  >
                    <span className="text-success mt-1 shrink-0">&#8226;</span>
                    <span>{resource}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* What's Realistic */}
            <div className="rounded-xl border border-border bg-surface p-6">
              <h3 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-400" />
                What&apos;s Actually Realistic
              </h3>
              <ul className="space-y-2">
                {burnoutContent.realistic.map((tip, i) => (
                  <li
                    key={i}
                    className="flex gap-3 text-sm text-muted leading-relaxed"
                  >
                    <span className="text-red-400 mt-1 shrink-0">&#8226;</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ========== PGY-2 ========== */}
      <section id="pgy2" className="py-12 sm:py-16 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-8">
            <span className="inline-flex rounded-full bg-cyan/10 px-4 py-1.5 text-sm font-bold text-cyan">
              PGY-2
            </span>
            <h2 className="text-2xl font-bold text-foreground">
              Junior Resident Growth
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {pgy2Content.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="rounded-xl border border-border bg-surface p-6 hover-glow"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="inline-flex items-center justify-center rounded-lg bg-cyan/10 p-2.5">
                      <Icon className="h-5 w-5 text-cyan" />
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
                        <span className="text-cyan mt-1 shrink-0">&#8226;</span>
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                  {item.link && (
                    <Link
                      href={item.link.href}
                      className="inline-flex items-center gap-1 mt-4 text-sm font-medium text-accent hover:text-accent/80 transition-colors"
                    >
                      {item.link.label}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========== PGY-3+ ========== */}
      <section id="pgy3" className="py-12 sm:py-16 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-8">
            <span className="inline-flex rounded-full bg-success/10 px-4 py-1.5 text-sm font-bold text-success">
              PGY-3+
            </span>
            <h2 className="text-2xl font-bold text-foreground">
              Senior Year &amp; Graduating
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {pgy3Content.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="rounded-xl border border-border bg-surface p-6 hover-glow"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="inline-flex items-center justify-center rounded-lg bg-success/10 p-2.5">
                      <Icon className="h-5 w-5 text-success" />
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
                        <span className="text-success mt-1 shrink-0">&#8226;</span>
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                  {item.link && (
                    <Link
                      href={item.link.href}
                      className="inline-flex items-center gap-1 mt-4 text-sm font-medium text-accent hover:text-accent/80 transition-colors"
                    >
                      {item.link.label}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Link
              href="/residency/fellowship/guide"
              className="rounded-xl border border-border bg-surface p-6 hover-glow group"
            >
              <GraduationCap className="h-6 w-6 text-accent mb-3" />
              <h3 className="text-base font-semibold text-foreground mb-1">
                Fellowship Strategy Guide
              </h3>
              <p className="text-sm text-muted mb-3">
                The definitive timeline and strategy for getting into fellowship
                — PGY-1 through Match Day.
              </p>
              <span className="inline-flex items-center gap-1 text-sm text-accent opacity-0 group-hover:opacity-100 transition-opacity">
                Read Guide <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>
            <Link
              href="/residency/salary"
              className="rounded-xl border border-border bg-surface p-6 hover-glow group"
            >
              <Briefcase className="h-6 w-6 text-cyan mb-3" />
              <h3 className="text-base font-semibold text-foreground mb-1">
                Salary &amp; Contract Guide
              </h3>
              <p className="text-sm text-muted mb-3">
                Compensation structures, salary ranges by specialty, contract
                red flags, and what to negotiate.
              </p>
              <span className="inline-flex items-center gap-1 text-sm text-accent opacity-0 group-hover:opacity-100 transition-opacity">
                Read Guide <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
