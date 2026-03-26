// ---------------------------------------------------------------------------
// Static data for the Residency section of USCEHub
// ---------------------------------------------------------------------------

export interface TeachingResource {
  id: string;
  name: string;
  description: string;
  category: string;
  url: string;
  free: boolean;
}

export interface BoardExam {
  id: string;
  abbreviation: string;
  name: string;
  specialty: string;
  format: string;
  timeline: string;
  passRate: string;
  resources: string[];
}

export interface SurvivalSection {
  id: string;
  pgyYear: string;
  title: string;
  tips: { heading: string; description: string }[];
}

export interface FellowshipProgram {
  id: string;
  programName: string;
  institution: string;
  specialty: string;
  state: string;
  visaSponsorship: boolean;
  matchParticipation: boolean;
  city: string;
}

// ---------------------------------------------------------------------------
// Teaching Resources (~20 curated entries)
// ---------------------------------------------------------------------------
export const TEACHING_RESOURCES: TeachingResource[] = [
  {
    id: "res-1",
    name: "Pocket Medicine",
    description:
      "The Massachusetts General Hospital Handbook of Internal Medicine. Concise, evidence-based reference covering cardiology, pulmonology, GI, nephrology, hematology-oncology, infectious disease, endocrinology, and rheumatology.",
    category: "Pocketbook Medicine",
    url: "https://lww.com/pocket-medicine",
    free: false,
  },
  {
    id: "res-2",
    name: "Pocket ICU",
    description:
      "Compact critical care reference organized by organ system with ventilator management, sedation protocols, vasopressor dosing, and common ICU calculations.",
    category: "ICU & Critical Care",
    url: "https://lww.com/pocket-icu",
    free: false,
  },
  {
    id: "res-3",
    name: "The NephSAP (Nephrology Self-Assessment Program)",
    description:
      "ASN self-assessment modules covering electrolyte disorders, acid-base, AKI, CKD, glomerular disease, and transplant nephrology.",
    category: "Evidence-Based Medicine",
    url: "https://www.asn-online.org/education/nephsap/",
    free: false,
  },
  {
    id: "res-4",
    name: "POCUS Atlas",
    description:
      "Open-access library of point-of-care ultrasound clips organized by organ system. Covers cardiac, lung, abdominal, vascular, and procedural POCUS with annotated images.",
    category: "Ultrasound & POCUS",
    url: "https://www.pocusatlas.com",
    free: true,
  },
  {
    id: "res-5",
    name: "5 Minute Sono",
    description:
      "Short, high-yield ultrasound tutorials for bedside clinicians covering focused cardiac, lung, FAST, DVT, and soft tissue exams.",
    category: "Ultrasound & POCUS",
    url: "https://www.5minsono.com",
    free: true,
  },
  {
    id: "res-6",
    name: "The Procedural Pause",
    description:
      "NEJM-curated video library demonstrating common bedside procedures including central lines, thoracentesis, paracentesis, lumbar puncture, and arthrocentesis.",
    category: "Procedures & Skills",
    url: "https://www.nejm.org/multimedia/medical-videos",
    free: false,
  },
  {
    id: "res-7",
    name: "Roberts & Hedges: Clinical Procedures in Emergency Medicine",
    description:
      "Comprehensive procedural reference with step-by-step technique guides, anatomy review, and complication management for over 70 procedures.",
    category: "Procedures & Skills",
    url: "https://www.elsevier.com/books/roberts-and-hedges",
    free: false,
  },
  {
    id: "res-8",
    name: "UpToDate",
    description:
      "Evidence-based clinical decision resource with over 12,000 topics authored and edited by physician specialists. Updated continuously with new evidence.",
    category: "Evidence-Based Medicine",
    url: "https://www.uptodate.com",
    free: false,
  },
  {
    id: "res-9",
    name: "DynaMed",
    description:
      "Point-of-care clinical reference with systematic literature surveillance, evidence ratings, and guideline summaries across all specialties.",
    category: "Evidence-Based Medicine",
    url: "https://www.dynamed.com",
    free: false,
  },
  {
    id: "res-10",
    name: "Internet Book of Critical Care (IBCC)",
    description:
      "Free, open-access critical care reference by Josh Farkas covering ICU physiology, ventilator management, shock, sepsis, toxicology, and procedures with evidence-based summaries.",
    category: "ICU & Critical Care",
    url: "https://emcrit.org/ibcc/",
    free: true,
  },
  {
    id: "res-11",
    name: "Life in the Fast Lane (LITFL)",
    description:
      "Open-access medical education resource with ECG library, toxicology, critical care, and clinical case discussions. Excellent for rapid bedside review.",
    category: "ICU & Critical Care",
    url: "https://litfl.com",
    free: true,
  },
  {
    id: "res-12",
    name: "Tarascon Pocket Pharmacopoeia",
    description:
      "Compact drug dosing reference organized by therapeutic class with renal/hepatic adjustments, pregnancy categories, and cost information.",
    category: "Pocketbook Medicine",
    url: "https://www.tarascon.com",
    free: false,
  },
  {
    id: "res-13",
    name: "MKSAP (Medical Knowledge Self-Assessment Program)",
    description:
      "ACP gold-standard internal medicine self-assessment covering all 11 IM subspecialties. Widely used for ABIM board preparation and MOC.",
    category: "Evidence-Based Medicine",
    url: "https://mksap.acponline.org",
    free: false,
  },
  {
    id: "res-14",
    name: "The Core IM Podcast",
    description:
      "Evidence-based internal medicine podcast covering high-yield clinical topics with 5 Pearls format, visual abstracts, and teaching scripts.",
    category: "Pocketbook Medicine",
    url: "https://www.coreimpodcast.com",
    free: true,
  },
  {
    id: "res-15",
    name: "SMACC (Social Media and Critical Care)",
    description:
      "Conference talks and podcast episodes on critical care, resuscitation, and emergency medicine education from international thought leaders.",
    category: "ICU & Critical Care",
    url: "https://www.smacc.net.au",
    free: true,
  },
  {
    id: "res-16",
    name: "Vital Talk",
    description:
      "Evidence-based communication skills training for clinicians. Covers breaking bad news, goals-of-care conversations, responding to emotion, and end-of-life discussions.",
    category: "Communication & Documentation",
    url: "https://www.vitaltalk.org",
    free: false,
  },
  {
    id: "res-17",
    name: "SBAR Communication Template",
    description:
      "Structured communication framework (Situation, Background, Assessment, Recommendation) for clear patient handoffs, nurse-to-physician communication, and escalation.",
    category: "Communication & Documentation",
    url: "https://www.ihi.org/resources/Pages/Tools/SBARToolkit.aspx",
    free: true,
  },
  {
    id: "res-18",
    name: "Geeky Medics — OSCE Skills",
    description:
      "Free clinical examination guides with video demonstrations covering cardiovascular, respiratory, abdominal, neurological, and musculoskeletal exams.",
    category: "Procedures & Skills",
    url: "https://geekymedics.com",
    free: true,
  },
  {
    id: "res-19",
    name: "The Hospitalist Handbook",
    description:
      "Quick-reference guide for inpatient medicine covering admissions, common floor calls, code management, discharge planning, and transitions of care.",
    category: "Pocketbook Medicine",
    url: "https://www.hospitalisthandbook.com",
    free: false,
  },
  {
    id: "res-20",
    name: "I-PASS Handoff System",
    description:
      "Standardized patient handoff protocol (Illness severity, Patient summary, Action list, Situation awareness, Synthesis by receiver) shown to reduce medical errors by 23%.",
    category: "Communication & Documentation",
    url: "https://www.ipasshandoffstudy.com",
    free: true,
  },
];

export const RESOURCE_CATEGORIES = [
  "Pocketbook Medicine",
  "Ultrasound & POCUS",
  "Procedures & Skills",
  "Evidence-Based Medicine",
  "ICU & Critical Care",
  "Communication & Documentation",
] as const;

// ---------------------------------------------------------------------------
// Board Exams
// ---------------------------------------------------------------------------
export const BOARD_EXAMS: BoardExam[] = [
  {
    id: "board-abim",
    abbreviation: "ABIM",
    name: "American Board of Internal Medicine",
    specialty: "Internal Medicine",
    format:
      "Computer-based exam with 240 single-best-answer questions across two 5-hour sessions in a single day. Content spans all IM subspecialties weighted by clinical prevalence.",
    timeline:
      "Typically taken in August or October of PGY-3 year, within 2 years of residency completion. Registration opens January. 60-day focused study period is standard.",
    passRate: "First-time pass rate: ~92% for US MD graduates, ~87% for US DO graduates, ~78-82% for IMGs. Overall first-time rate approximately 89-91%. Retake pass rate drops significantly to ~50-60%. Source: ABIM publicly reported data.",
    resources: [
      "MKSAP 19 (ACP) — the gold standard, covers all 11 subspecialties",
      "UWorld Internal Medicine Qbank — best for question practice",
      "ABIM Board Basics — free from ABIM website",
      "ACP OEAP practice exams — closest format to actual exam",
      "The Core IM Podcast — audio review for commute time",
    ],
  },
  {
    id: "board-abfm",
    abbreviation: "ABFM",
    name: "American Board of Family Medicine",
    specialty: "Family Medicine",
    format:
      "Computer-based exam with approximately 300 questions over one day. Covers preventive care, chronic disease management, behavioral health, pediatrics, women's health, musculoskeletal, and emergency medicine.",
    timeline:
      "Taken after completing an ACGME-accredited family medicine residency. Exam offered in spring and fall. Most residents take it in July after PGY-3 graduation.",
    passRate: "First-time pass rate: ~89-92% for residency graduates. ABFM transitioned to longitudinal assessment (FMCLA) in 2024 as an alternative to the traditional 1-day exam. The 1-day exam is still available. Source: ABFM annual reports.",
    resources: [
      "AAFP Family Medicine Board Review — comprehensive review course",
      "UWorld Family Medicine Qbank — best question bank for FM boards",
      "ABFM Self-Assessment Modules (SAMs) — required for MOC",
      "Swanson's Family Medicine Review — classic textbook review",
      "ABFM Knowledge Self-Assessment (KSA) — new longitudinal option",
    ],
  },
  {
    id: "board-abp",
    abbreviation: "ABP",
    name: "American Board of Pediatrics",
    specialty: "Pediatrics",
    format:
      "Computer-based exam with approximately 330 questions over two days. Covers general pediatrics, neonatology, adolescent medicine, developmental-behavioral, emergency, and subspecialty pediatrics.",
    timeline:
      "Administered in October. Eligible after completing ACGME-accredited pediatrics residency. Registration opens in spring of PGY-3 year.",
    passRate: "First-time pass rate: ~83-87% for general pediatrics (varies by year). Subspecialty certification pass rates vary widely. ABP uses a single-day computer-based format administered in October. Source: ABP publicly reported data.",
    resources: [
      "PREP Self-Assessment (AAP) — official AAP question bank, essential",
      "UWorld Pediatrics Qbank — high-yield for board-style questions",
      "MedStudy Pediatrics Board Review — comprehensive, well-organized",
      "Palpal Pediatric Board Review — popular supplementary resource",
      "ABP Content Specifications — free outline of exam topics from ABP",
    ],
  },
  {
    id: "board-abs",
    abbreviation: "ABS",
    name: "American Board of Surgery",
    specialty: "Surgery",
    format:
      "Two-part certification: Qualifying Exam (QE) is a computer-based written exam with approximately 300 questions. Certifying Exam (CE) is an oral exam with standardized clinical scenarios and operative management discussions.",
    timeline:
      "QE taken in July after completing chief year. CE taken approximately 12-18 months later. QE must be passed before taking CE.",
    passRate:
      "QE first-time pass rate: ~80-85%. CE (oral exam) first-time pass rate: ~74-80%. The QE is one of the harder written board exams. ABS implemented continuous certification (ABS CC) starting 2023, with quarterly online assessments as alternative to 10-year recertification. Source: ABS publicly reported data.",
    resources: [
      "SCORE Curriculum — official ABS-endorsed learning platform, essential",
      "Surgical Council on Resident Education (SCORE) portal",
      "Schwartz's Principles of Surgery — classic comprehensive reference",
      "TrueLearn Surgery Qbank — closest to exam question style",
      "SESAP (Self-Education for Surgeons) — ACS self-assessment",
    ],
  },
  {
    id: "board-abpsych",
    abbreviation: "ABPsych",
    name: "American Board of Psychiatry and Neurology",
    specialty: "Psychiatry",
    format:
      "Computer-based exam with approximately 300 questions covering adult psychiatry, child psychiatry, neurology, psychopharmacology, psychotherapy, forensic psychiatry, and addiction medicine.",
    timeline:
      "Offered annually in spring and fall. Eligible after completing an ACGME-accredited psychiatry residency. Most take it within one year of graduation.",
    passRate: "First-time pass rate: ~86-90%. ABPN phased out the oral exam in 2010 — all certification is now via computer-based exam. Added article-based questions starting in recent years. Subspecialty certifications (addiction, forensic, child & adolescent, consult-liaison) have separate exams. Source: ABPN published data.",
    resources: [
      "Stahl's Essential Psychopharmacology — the bible of psychopharm",
      "UWorld Psychiatry Qbank — best question bank for ABPN boards",
      "PRITE practice exams — annual in-training exam, great predictor",
      "Kaplan & Sadock's Synopsis of Psychiatry — comprehensive reference",
      "First Aid for the Psychiatry Boards — concise high-yield review",
    ],
  },
  {
    id: "board-abpath",
    abbreviation: "ABPath",
    name: "American Board of Pathology",
    specialty: "Pathology",
    format:
      "Two-part exam: Part 1 covers anatomic and clinical pathology fundamentals. Part 2 focuses on subspecialty expertise. Both are computer-based with multiple-choice and image-based questions.",
    timeline:
      "Part 1 typically taken after PGY-3 year. Part 2 taken after completing residency. Exams offered annually.",
    passRate: "First-time pass rate: ~80-85% for AP/CP combined. AP-only and CP-only tracks have slightly different rates. ABPath has been modernizing with digital slide-based questions. Subspecialty certification exams (dermatopathology, hematopathology, neuropathology, etc.) have variable pass rates. Source: ABPath published data.",
    resources: [
      "Robbins & Cotran Pathologic Basis of Disease — the foundational text",
      "PathPrimer Qbank — pathology-specific question bank",
      "ASCP Case Studies — practical case-based learning",
      "Rosai and Ackerman's Surgical Pathology — surgical path gold standard",
      "Pathoma — Husain Sattar's video lectures (popular from Step 1 prep)",
    ],
  },
];

// ---------------------------------------------------------------------------
// Survival Tips by PGY Year
// ---------------------------------------------------------------------------
export const SURVIVAL_TIPS: SurvivalSection[] = [
  {
    id: "pgy1",
    pgyYear: "PGY-1",
    title: "Intern Year Survival",
    tips: [
      {
        heading: "What to Expect",
        description:
          "Intern year is the steepest learning curve of your career. You will transition from observer to primary decision-maker. Expect to feel overwhelmed initially — this is universal. Focus on building reliable clinical workflows: systematic admission notes, morning pre-rounding routines, and structured handoff processes. By month three, most interns find a rhythm.",
      },
      {
        heading: "Essential Apps & Tools",
        description:
          "UpToDate or DynaMed for clinical questions. MedCalc or MDCalc for bedside calculations. Epocrates or Lexicomp for drug dosing. Doximity for paging and secure messaging. A good note template system (dot phrases) will save hours each week.",
      },
      {
        heading: "Time Management",
        description:
          "Pre-round efficiently: vitals, overnight events, labs, imaging, then assessment and plan before seeing the patient. Use a structured patient list (printed or digital) updated at sign-out. Batch tasks when possible — labs, consults, family calls. Set hard boundaries on when you leave post-call.",
      },
      {
        heading: "Common Pitfalls",
        description:
          "Not asking for help early enough. Trying to read about everything instead of focusing on your current patients. Forgetting to eat, hydrate, and sleep. Not documenting clinical reasoning in notes. Avoiding difficult conversations with patients and families.",
      },
    ],
  },
  {
    id: "pgy2",
    pgyYear: "PGY-2",
    title: "Junior Resident Growth",
    tips: [
      {
        heading: "Leadership Transition",
        description:
          "As a PGY-2, you become a team leader and supervisor. You are responsible for triaging admissions, overseeing intern work, and making real-time clinical decisions. Practice delegating effectively — assign clear tasks, set expectations, and follow up. Learn to give feedback constructively.",
      },
      {
        heading: "Teaching Juniors",
        description:
          "Teaching is one of the best ways to solidify your own knowledge. Prepare 5-minute chalk talks on common topics. Use the One-Minute Preceptor model: get a commitment, probe for underlying reasoning, teach a general rule, reinforce what was done well, correct mistakes. Interns will mirror your work ethic.",
      },
      {
        heading: "Fellowship Planning",
        description:
          "If considering fellowship, start early in PGY-2. Identify mentors in your target specialty. Begin building your CV: case reports, quality improvement projects, and scholarly presentations. Request letters of recommendation by late PGY-2. Research programs through NRMP Charting Outcomes and FREIDA.",
      },
    ],
  },
  {
    id: "pgy3",
    pgyYear: "PGY-3+",
    title: "Senior Resident & Beyond",
    tips: [
      {
        heading: "Job Search Preparation",
        description:
          "Start job search 12-18 months before graduation. Use physician recruitment platforms (PracticeLink, PracticeMatch, NEJM Career Center). Understand practice models: academic, employed, private practice, locum tenens. Consider geography, call burden, partnership track, and loan repayment options.",
      },
      {
        heading: "Contract Basics",
        description:
          "Never sign without attorney review. Key terms: base salary vs. RVU compensation, sign-on bonus and repayment clauses, non-compete radius and duration, tail coverage for malpractice, call expectations, CME allowance, and termination clauses. A physician contract attorney costs $500-1500 and is worth every dollar.",
      },
      {
        heading: "Board Preparation Timeline",
        description:
          "Start dedicated board prep 4-6 months before the exam. Complete at least one full question bank (UWorld or equivalent). Take two practice exams to establish baseline and track progress. Join or form a study group. Schedule exam-day logistics early — hotel, transportation, ID requirements.",
      },
    ],
  },
  {
    id: "general",
    pgyYear: "General",
    title: "Wellness & Life Skills",
    tips: [
      {
        heading: "Burnout Prevention",
        description:
          "Recognize the signs: emotional exhaustion, depersonalization, and reduced personal accomplishment. Protect at least one non-medical activity or hobby. Maintain social connections outside of medicine. Use your EAP (Employee Assistance Program) — it is confidential and free. Peer support programs exist at most institutions.",
      },
      {
        heading: "Work-Life Balance",
        description:
          "Set boundaries on email and messaging after hours. Use vacation days — do not let them expire. Meal prep on days off to avoid relying on hospital cafeteria food exclusively. Exercise even briefly; 20 minutes of activity significantly impacts mood and cognitive function. Sleep hygiene matters, especially on night float rotations.",
      },
      {
        heading: "Financial Basics",
        description:
          "Enroll in employer 403(b)/401(k) for any match immediately — this is free money. Explore PSLF (Public Service Loan Forgiveness) if at a qualifying non-profit employer. Avoid lifestyle inflation in PGY-1. Disability insurance is critical and cheapest to purchase during residency. Consider term life insurance if you have dependents.",
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Sample Fellowship Programs (10 entries)
// ---------------------------------------------------------------------------
export const SAMPLE_FELLOWSHIPS: FellowshipProgram[] = [
  {
    id: "fel-1",
    programName: "Cardiovascular Disease Fellowship",
    institution: "Massachusetts General Hospital",
    specialty: "Cardiology",
    state: "MA",
    city: "Boston",
    visaSponsorship: true,
    matchParticipation: true,
  },
  {
    id: "fel-2",
    programName: "Gastroenterology Fellowship",
    institution: "Mayo Clinic",
    specialty: "Gastroenterology",
    state: "MN",
    city: "Rochester",
    visaSponsorship: true,
    matchParticipation: true,
  },
  {
    id: "fel-3",
    programName: "Pulmonary & Critical Care Fellowship",
    institution: "Johns Hopkins Hospital",
    specialty: "Pulmonary & Critical Care",
    state: "MD",
    city: "Baltimore",
    visaSponsorship: true,
    matchParticipation: true,
  },
  {
    id: "fel-4",
    programName: "Hematology-Oncology Fellowship",
    institution: "Memorial Sloan Kettering Cancer Center",
    specialty: "Hematology-Oncology",
    state: "NY",
    city: "New York",
    visaSponsorship: true,
    matchParticipation: true,
  },
  {
    id: "fel-5",
    programName: "Endocrinology Fellowship",
    institution: "Cleveland Clinic",
    specialty: "Endocrinology",
    state: "OH",
    city: "Cleveland",
    visaSponsorship: true,
    matchParticipation: true,
  },
  {
    id: "fel-6",
    programName: "Nephrology Fellowship",
    institution: "UCSF Medical Center",
    specialty: "Nephrology",
    state: "CA",
    city: "San Francisco",
    visaSponsorship: true,
    matchParticipation: true,
  },
  {
    id: "fel-7",
    programName: "Infectious Disease Fellowship",
    institution: "Emory University",
    specialty: "Infectious Disease",
    state: "GA",
    city: "Atlanta",
    visaSponsorship: true,
    matchParticipation: true,
  },
  {
    id: "fel-8",
    programName: "Rheumatology Fellowship",
    institution: "Hospital for Special Surgery",
    specialty: "Rheumatology",
    state: "NY",
    city: "New York",
    visaSponsorship: false,
    matchParticipation: true,
  },
  {
    id: "fel-9",
    programName: "Child & Adolescent Psychiatry Fellowship",
    institution: "Stanford University Medical Center",
    specialty: "Child & Adolescent Psychiatry",
    state: "CA",
    city: "Stanford",
    visaSponsorship: true,
    matchParticipation: true,
  },
  {
    id: "fel-10",
    programName: "Surgical Critical Care Fellowship",
    institution: "University of Michigan",
    specialty: "Surgical Critical Care",
    state: "MI",
    city: "Ann Arbor",
    visaSponsorship: false,
    matchParticipation: true,
  },
];

// Unique specialties from sample fellowships (for filter dropdown)
export const FELLOWSHIP_SPECIALTIES = [
  ...new Set(SAMPLE_FELLOWSHIPS.map((f) => f.specialty)),
].sort();

// Unique states from sample fellowships (for filter dropdown)
export const FELLOWSHIP_STATES = [
  ...new Set(SAMPLE_FELLOWSHIPS.map((f) => f.state)),
].sort();
