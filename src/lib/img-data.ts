/**
 * IMG Resources Data — 2025
 * Sources: NRMP 2025 Main Residency Match, ECFMG, AMA FREIDA
 * Last updated: March 2025
 */

// ─── NRMP 2025 MATCH OVERVIEW ────────────────────────────────────────────────

export const NRMP_2025 = {
  year: 2025,
  totalPositions: 43237,
  pgy1Positions: 40041,
  totalApplicants: 52498,
  activeApplicants: 47208,
  filledByAlgorithm: 40764,
  fillRate: 94.3,
  afterSoapFillRate: 99.4,
  imgRegistrants: 20030,
  imgActive: 16052,
  imgFirstYearFilled: 9761,
  usImgMatchRate: 67.8,
  nonUsImgMatchRate: 58.0,
  usMdMatchRate: 93.5,
  usDoMatchRate: 92.6,
  visaRequiredMatchRate: 54.4,
  noVisaMatchRate: 67.9,
  imgGrowth5Year: 57.6,
  nonUsImgSurge: 14.4,
};

export const NRMP_HEADLINE_STATS = [
  { label: "Total Positions", value: "43,237", detail: "Up 4.2% — largest match ever", color: "blue" },
  { label: "IMG Match Rate", value: "60.8%", detail: "16,052 active → 9,761 matched", color: "emerald" },
  { label: "US IMG Rate", value: "67.8%", detail: "4,587 active applicants", color: "emerald" },
  { label: "Non-US IMG Rate", value: "58.0%", detail: "11,465 active applicants", color: "amber" },
  { label: "Visa-Required Rate", value: "54.4%", detail: "5-year low — rising competition", color: "red" },
  { label: "IMG Registrants", value: "20,030", detail: "57.6% growth over 5 years", color: "violet" },
];

// ─── NRMP TRENDS (2021-2025) ─────────────────────────────────────────────────

export const NRMP_TRENDS = [
  { year: 2021, imgApplicants: 12700, imgMatched: 7200, matchRate: 56.7, totalPositions: 38106 },
  { year: 2022, imgApplicants: 13700, imgMatched: 7900, matchRate: 57.7, totalPositions: 40375 },
  { year: 2023, imgApplicants: 14200, imgMatched: 8400, matchRate: 59.2, totalPositions: 40965 },
  { year: 2024, imgApplicants: 14772, imgMatched: 8900, matchRate: 60.2, totalPositions: 41503 },
  { year: 2025, imgApplicants: 16052, imgMatched: 9761, matchRate: 60.8, totalPositions: 43237 },
];

// ─── SPECIALTY DATA ──────────────────────────────────────────────────────────

export type SpecialtyLevel = "accessible" | "moderate" | "competitive" | "very-competitive" | "extremely-competitive";

export interface SpecialtyInfo {
  name: string;
  positions2025: number;
  imgMatched: number;
  imgFillRate: number;
  unfilled: number;
  step2Target: string;
  level: SpecialtyLevel;
  trend: "growing" | "stable" | "declining";
  notes: string;
}

export const SPECIALTY_DATA: SpecialtyInfo[] = [
  {
    name: "Internal Medicine",
    positions2025: 10941,
    imgMatched: 4718,
    imgFillRate: 44.6,
    unfilled: 357,
    step2Target: "238-248",
    level: "accessible",
    trend: "growing",
    notes: "Largest specialty for IMGs. Non-US IMGs fill 33.3% of categorical positions. Community programs highly IMG-friendly.",
  },
  {
    name: "Family Medicine",
    positions2025: 5357,
    imgMatched: 1427,
    imgFillRate: 31.3,
    unfilled: 805,
    step2Target: "228-235",
    level: "accessible",
    trend: "growing",
    notes: "Most unfilled spots of any specialty (805). Strong option for IMGs. Rural programs offer visa sponsorship.",
  },
  {
    name: "Pediatrics",
    positions2025: 3135,
    imgMatched: 841,
    imgFillRate: 28.1,
    unfilled: 147,
    step2Target: "235-245",
    level: "moderate",
    trend: "stable",
    notes: "Non-US IMGs filled 20.4% of positions. Community programs more accessible than university programs.",
  },
  {
    name: "Psychiatry",
    positions2025: 2388,
    imgMatched: 343,
    imgFillRate: 14.4,
    unfilled: 8,
    step2Target: "235-245",
    level: "moderate",
    trend: "growing",
    notes: "Growing demand due to mental health crisis. Nearly all positions filled. Increasing competition from US grads.",
  },
  {
    name: "Neurology",
    positions2025: 932,
    imgMatched: 269,
    imgFillRate: 29.1,
    unfilled: 7,
    step2Target: "240-250",
    level: "moderate",
    trend: "stable",
    notes: "Strong IMG representation at 29.1%. Research experience valued. Good fellowship opportunities.",
  },
  {
    name: "Pathology",
    positions2025: 622,
    imgMatched: 225,
    imgFillRate: 36.3,
    unfilled: 3,
    step2Target: "235-240",
    level: "moderate",
    trend: "stable",
    notes: "One of the highest IMG fill rates at 36.3%. Smaller specialty but consistently IMG-welcoming.",
  },
  {
    name: "Physical Medicine & Rehabilitation",
    positions2025: 595,
    imgMatched: 120,
    imgFillRate: 20.2,
    unfilled: 5,
    step2Target: "235-245",
    level: "moderate",
    trend: "stable",
    notes: "Moderate IMG representation. Growing field with good lifestyle balance.",
  },
  {
    name: "Preventive Medicine",
    positions2025: 120,
    imgMatched: 35,
    imgFillRate: 29.2,
    unfilled: 10,
    step2Target: "225-235",
    level: "accessible",
    trend: "stable",
    notes: "Small specialty with high IMG acceptance. MPH often required or preferred.",
  },
  {
    name: "Anesthesiology",
    positions2025: 1900,
    imgMatched: 190,
    imgFillRate: 10.0,
    unfilled: 2,
    step2Target: "245-255",
    level: "competitive",
    trend: "stable",
    notes: "Competitive for IMGs. Strong Step 2 CK scores and US clinical experience required.",
  },
  {
    name: "General Surgery",
    positions2025: 1778,
    imgMatched: 214,
    imgFillRate: 12.1,
    unfilled: 4,
    step2Target: "245-255",
    level: "competitive",
    trend: "stable",
    notes: "Categorical positions highly competitive. Preliminary surgery more accessible for IMGs.",
  },
  {
    name: "Emergency Medicine",
    positions2025: 3015,
    imgMatched: 180,
    imgFillRate: 6.0,
    unfilled: 550,
    step2Target: "245-255",
    level: "very-competitive",
    trend: "declining",
    notes: "Despite 550 unfilled spots, very few go to IMGs. Programs strongly prefer US grads. Major oversupply crisis.",
  },
  {
    name: "Radiology",
    positions2025: 1200,
    imgMatched: 72,
    imgFillRate: 6.0,
    unfilled: 0,
    step2Target: "250-260",
    level: "very-competitive",
    trend: "stable",
    notes: "Extremely competitive. Research-heavy CV needed. Very few IMG-friendly programs.",
  },
  {
    name: "Dermatology",
    positions2025: 750,
    imgMatched: 15,
    imgFillRate: 2.0,
    unfilled: 0,
    step2Target: "255+",
    level: "extremely-competitive",
    trend: "stable",
    notes: "Near-impossible for IMGs. Extensive research and US connections required.",
  },
  {
    name: "Orthopedic Surgery",
    positions2025: 929,
    imgMatched: 10,
    imgFillRate: 1.1,
    unfilled: 0,
    step2Target: "255+",
    level: "extremely-competitive",
    trend: "stable",
    notes: "Virtually closed to IMGs. 100% fill rate with US applicants.",
  },
];

// ─── ECFMG 2025-2026 ────────────────────────────────────────────────────────

export const ECFMG_REQUIREMENTS = {
  step1: { status: "Pass/Fail", passingScore: 196, note: "Pass/fail since January 26, 2022" },
  step2ck: { status: "Scored", passingScore: 218, note: "Passing score raised from 214 to 218 on July 1, 2025" },
  oet: {
    required: true,
    note: "Required for ALL IMGs regardless of native language",
    scores: { listening: 350, reading: 350, speaking: 350, writing: 300 },
    validity: "Tests taken on or after January 1, 2024",
  },
  sevenYearRule: "All exam requirements must be completed within 7 years of first exam passed",
  canadianChange: "Graduates of Canadian medical schools on or after July 1, 2025 are now considered IMGs",
};

export const ECFMG_PATHWAYS = [
  {
    number: 1,
    name: "Clinical Skills Assessment",
    description: "Completion of clinical skills assessment by accrediting authority.",
    status: "Permanent" as const,
    details: "Most straightforward pathway. Requires medical school accreditation by recognized authority.",
  },
  {
    number: 2,
    name: "OSCE Attestation",
    description: "OSCE attestation by medical school.",
    status: "Available" as const,
    details: "Medical school must attest that graduate completed an OSCE.",
  },
  {
    number: 3,
    name: "Clinical Skills Attestation (Medical School)",
    description: "Clinical skills attestation by medical school.",
    status: "Available" as const,
    details: "Medical school attests to clinical skills competency.",
  },
  {
    number: 4,
    name: "Clinical Skills Attestation (Experience)",
    description: "Clinical skills attestation based on professional experience.",
    status: "Available" as const,
    details: "Requires 2+ years of licensed medical practice.",
  },
  {
    number: 5,
    name: "Clinical Skills Attestation (Medical School)",
    description: "Alternative clinical skills attestation pathway.",
    status: "Available" as const,
    details: "Similar to Pathway 3 with different attestation requirements.",
  },
  {
    number: 6,
    name: "Mini-CEX Evaluations",
    description: "Mini-CEX evaluations by licensed physicians.",
    status: "Available" as const,
    details: "Requires structured clinical evaluations by licensed physicians.",
  },
];

export const ECFMG_DEADLINES = {
  pathways2026Deadline: "January 31, 2026",
  pathways2025Closed: "May 31, 2025",
  oetLastTest: "December 2025 for 2026 Match cycle",
  matchDay2026: "March 2026",
};

// ─── STEP 2 CK DATA ─────────────────────────────────────────────────────────

export const STEP2_CK_AVERAGES = [
  { type: "US MD Seniors", matched: 250 },
  { type: "US DO Seniors", matched: 244 },
  { type: "US Citizen IMGs", matched: 236 },
  { type: "Non-US Citizen IMGs", matched: 245 },
];

// ─── INTERVIEW DATA ──────────────────────────────────────────────────────────

export const INTERVIEW_DATA = [
  { group: "Matched Non-US IMGs", invitations: "10-14", color: "emerald" },
  { group: "Unmatched Non-US IMGs", invitations: "3-6", color: "red" },
  { group: "Matched US IMGs", invitations: "12-16", color: "emerald" },
  { group: "US MD Seniors (reference)", invitations: "15-20", color: "blue" },
];

// ─── YEAR OF GRADUATION IMPACT ───────────────────────────────────────────────

export const YOG_DATA = [
  { range: "Current year", matchRate: "70-75%", level: "best" },
  { range: "1-2 years", matchRate: "65-70%", level: "good" },
  { range: "3-5 years", matchRate: "50-55%", level: "moderate" },
  { range: "5-7 years", matchRate: "35-40%", level: "challenging" },
  { range: "7-10 years", matchRate: "20-25%", level: "difficult" },
  { range: "10+ years", matchRate: "10-15%", level: "very-difficult" },
];

// ─── SOAP DATA ───────────────────────────────────────────────────────────────

export const SOAP_DATA = {
  overview: "Supplemental Offer and Acceptance Program — last chance to match after initial algorithm.",
  stats: [
    { label: "SOAP Applicants", value: "~12,000+", note: "Unmatched applicants per year" },
    { label: "IMG Success Rate", value: "15-20%", note: "Lower than US grad rate" },
    { label: "Unfilled Positions", value: "~2,500", note: "Available after initial match" },
    { label: "SOAP Rounds", value: "4 rounds", note: "Over 2 days in March" },
    { label: "Response Time", value: "2-6 hours", note: "Per round — extremely fast" },
  ],
  tips: [
    "Prepare a SOAP-specific personal statement before Match Day",
    "Have letters of recommendation ready to send immediately",
    "Research programs with historically unfilled positions (NRMP data)",
    "Apply broadly — SOAP is not the time to be selective",
    "Family Medicine, IM prelim, and transitional year have the most SOAP positions",
  ],
};

// ─── IMG-FRIENDLY PROGRAMS ───────────────────────────────────────────────────

export const IMG_FRIENDLY_PROGRAMS = [
  {
    name: "Jacobi Medical Center / Albert Einstein",
    location: "Bronx, NY",
    imgPercent: "70-80%",
    specialties: ["Internal Medicine", "Pediatrics", "Emergency Medicine", "Surgery"],
    salary: "$73,000+",
    highlights: ["NYC Health + Hospitals system", "Strong fellowship pipeline", "Diverse patient population"],
  },
  {
    name: "Elmhurst Hospital / Mount Sinai",
    location: "Queens, NY",
    imgPercent: "60-75%",
    specialties: ["Internal Medicine", "Surgery", "Pediatrics"],
    salary: "$73,000+",
    highlights: ["Mount Sinai affiliation", "Most diverse patient population in NYC", "Research opportunities"],
  },
  {
    name: "Lincoln Medical Center",
    location: "Bronx, NY",
    imgPercent: "65-80%",
    specialties: ["Internal Medicine", "Emergency Medicine", "Pediatrics"],
    salary: "$73,000+",
    highlights: ["Level 1 Trauma Center", "High patient volume", "Hands-on training"],
  },
  {
    name: "BronxCare Health System",
    location: "Bronx, NY",
    imgPercent: "80-90%",
    specialties: ["Internal Medicine", "Family Medicine", "Psychiatry"],
    salary: "$68,000+",
    highlights: ["Highest IMG percentage in NYC", "J-1 visa sponsorship", "Community-focused"],
  },
  {
    name: "Maimonides Medical Center",
    location: "Brooklyn, NY",
    imgPercent: "50-65%",
    specialties: ["Internal Medicine", "Surgery", "Cardiology"],
    salary: "$73,000+",
    highlights: ["Brooklyn's largest hospital", "Strong cardiology program", "Research opportunities"],
  },
  {
    name: "Cook County / Stroger Hospital",
    location: "Chicago, IL",
    imgPercent: "40-55%",
    specialties: ["Internal Medicine", "Surgery", "Emergency Medicine"],
    salary: "$62,000+",
    highlights: ["Historic public hospital", "Trauma center", "Diverse training"],
  },
  {
    name: "Wayne State / Detroit Medical Center",
    location: "Detroit, MI",
    imgPercent: "40-60%",
    specialties: ["Internal Medicine", "Surgery", "Neurology", "Pathology"],
    salary: "$63,000+",
    highlights: ["Multiple hospital system", "Research-heavy", "Low cost of living"],
  },
  {
    name: "Cleveland Clinic Community Programs",
    location: "Cleveland, OH",
    imgPercent: "30-50%",
    specialties: ["Internal Medicine", "Family Medicine"],
    salary: "$62,000+",
    highlights: ["Cleveland Clinic affiliation", "Strong fellowship pipeline", "Affordable city"],
  },
  {
    name: "Temple University Hospital",
    location: "Philadelphia, PA",
    imgPercent: "30-45%",
    specialties: ["Internal Medicine", "Pulmonology", "Surgery"],
    salary: "$65,000+",
    highlights: ["Level 1 Trauma Center", "Academic program", "Research opportunities"],
  },
  {
    name: "Grady Memorial Hospital / Emory",
    location: "Atlanta, GA",
    imgPercent: "25-40%",
    specialties: ["Internal Medicine", "Surgery", "Emergency Medicine"],
    salary: "$60,000+",
    highlights: ["Emory affiliation", "Safety-net hospital", "Excellent fellowship matches"],
  },
];

// ─── STATE DATA ──────────────────────────────────────────────────────────────

export const STATE_IMG_DATA = [
  { state: "New York", abbr: "NY", programs: "40+", highlight: true, note: "Most IMG-friendly state. NYC H+H system alone trains thousands of IMGs." },
  { state: "Michigan", abbr: "MI", programs: "20+", highlight: false, note: "Wayne State/DMC, Beaumont, St. Joseph — strong IMG history." },
  { state: "Illinois", abbr: "IL", programs: "15+", highlight: false, note: "Cook County, Loyola, Rush — Chicago offers diverse training." },
  { state: "Ohio", abbr: "OH", programs: "12+", highlight: false, note: "Cleveland Clinic community programs, MetroHealth, Wright State." },
  { state: "Pennsylvania", abbr: "PA", programs: "12+", highlight: false, note: "Temple, Einstein, Crozer — Philly and Pittsburgh have strong IMG programs." },
  { state: "New Jersey", abbr: "NJ", programs: "10+", highlight: false, note: "Rutgers, Hackensack, St. Joseph's — close to NYC training opportunities." },
  { state: "Florida", abbr: "FL", programs: "10+", highlight: false, note: "Growing IMG presence. Jackson Memorial, Aventura, Larkin — South Florida hub." },
  { state: "Texas", abbr: "TX", programs: "8+", highlight: false, note: "Baylor, UTMB, Texas Tech — growing but fewer community programs than Northeast." },
  { state: "California", abbr: "CA", programs: "5+", highlight: false, note: "Most competitive state. Few IMG-friendly programs outside Kaiser and county hospitals." },
  { state: "Georgia", abbr: "GA", programs: "5+", highlight: false, note: "Grady/Emory, Navicent, Augusta — moderate IMG presence in Atlanta area." },
];

// ─── HOW THE MATCH WORKS ─────────────────────────────────────────────────────

export const MATCH_PROCESS_STEPS = [
  {
    step: 1,
    title: "Register with NRMP",
    description: "Create an NRMP account and register for the Main Residency Match. IMGs must have ECFMG certification (or be on track) to register.",
    timing: "September",
  },
  {
    step: 2,
    title: "Apply via ERAS",
    description: "Submit your application through ERAS to individual residency programs. Include personal statement, CV, USMLE transcripts, LORs, MSPE, and photo. IMGs typically apply to 150-200+ programs.",
    timing: "September - October",
  },
  {
    step: 3,
    title: "Send Signals & Supplemental Apps",
    description: "Use your limited preference signals and supplemental application tokens strategically to tell programs you're genuinely interested. Signals significantly increase interview invitations.",
    timing: "September - October",
  },
  {
    step: 4,
    title: "Interview (Mostly Virtual)",
    description: "Programs review applications and invite selected candidates. Most interviews are now conducted virtually via Zoom. Some programs offer optional in-person second looks.",
    timing: "October - January",
  },
  {
    step: 5,
    title: "Submit Rank Order List",
    description: "Rank every program where you interviewed in your true order of preference. Programs independently rank all interviewed applicants. Neither party sees the other's list. Be honest — rank by your true preference, not where you think you'll match.",
    timing: "February",
  },
  {
    step: 6,
    title: "The Algorithm Runs",
    description: "NRMP runs the Roth-Peranson matching algorithm. It processes applicant lists one at a time: the algorithm tries to place you at your #1 choice. If that program is full with applicants it prefers more, it tries your #2, then #3, and so on. The result is mathematically optimal for applicants — you cannot improve your outcome by ranking strategically.",
    timing: "Late February",
  },
  {
    step: 7,
    title: "Match Week",
    description: "Monday: you find out IF you matched (but not where). If unmatched, SOAP begins immediately. Friday (Match Day): matched applicants learn which program they matched to.",
    timing: "Third week of March",
  },
];

export const MATCH_ALGORITHM_KEY_FACTS = [
  "The algorithm is applicant-optimal — it finds the best possible outcome for YOU based on your rank list",
  "You should ALWAYS rank programs in your true order of preference — gaming the system cannot help you",
  "A program cannot see where you ranked them, and you cannot see where they ranked you",
  "If a program ranks you but you didn't rank them, you will NOT match there",
  "Couples can link their rank lists together through the Couples Match",
  "The algorithm was developed by Nobel Prize winners Alvin Roth and Lloyd Shapley",
];

// ─── SIGNALING ───────────────────────────────────────────────────────────────

export const SIGNALING_DATA = {
  overview: "Signaling lets applicants indicate genuine interest in specific programs. With applicants applying to 200+ programs, signals help programs identify who actually wants to train there. Signals significantly increase your interview invitation rate.",
  types: [
    {
      name: "ERAS Preference Signals",
      count: "Up to 25 signals (varies by specialty)",
      description: "Sent through ERAS when submitting your application. Each specialty determines how many signals applicants receive. Programs see which applicants signaled them.",
      impact: "Programs that receive your signal are 2-4x more likely to interview you",
      tips: [
        "Use ALL your signals — unused signals are wasted opportunities",
        "Signal your genuine top choices, not just safety programs",
        "Signal programs where you have a geographic connection (lived, rotated, family nearby)",
        "Signal programs where your profile fits (Step 2 CK score in their range, right visa status)",
        "Don't signal your home program or places where you already have a strong connection — they already know you're interested",
      ],
    },
    {
      name: "Supplemental ERAS Application (MyERAS)",
      count: "Limited tokens (varies by specialty)",
      description: "Additional information submitted through a supplemental application. Includes geographic preferences, meaningful experiences, and additional signals beyond the basic preference signals.",
      impact: "Provides programs with more context about your interest and fit",
      tips: [
        "Complete the supplemental application fully — many applicants skip it",
        "Geographic preference signals carry real weight — programs want residents who will stay",
        "Highlight specific connections to the program's region or mission",
        "The supplemental app is where you differentiate from 200 other applicants with similar scores",
      ],
    },
    {
      name: "Program Signals (Reverse Signals)",
      count: "Programs send limited signals to applicants",
      description: "Some programs can signal applicants they're interested in interviewing. This is newer and not universal across all specialties.",
      impact: "If a program signals you, strongly consider ranking them — they're telling you they want you",
      tips: [
        "Check your ERAS messages for program signals",
        "A program signal + your signal = very high match probability",
        "Respond promptly to interview invitations from programs that signaled you",
      ],
    },
  ],
  imgSpecificAdvice: [
    "IMGs benefit MORE from signaling than US grads — programs often filter out IMG applications early, but a signal makes them take a second look",
    "Signal community programs AND academic programs — don't assume you can only match at community sites",
    "If you did an observership or rotation at a program, signal them — the combination of US clinical experience + signal is powerful",
    "Signal programs in states where you have a connection (observership, family, research) — geographic ties matter for IMGs",
    "Programs in underserved areas or with historically high IMG percentages should get your signals — they're looking for you",
  ],
};

// ─── APPLICATION TIMELINE ────────────────────────────────────────────────────

export const APPLICATION_TIMELINE = [
  {
    phase: "Foundations",
    months: "Jan - Mar",
    tasks: [
      "Complete USMLE Step 1 (pass/fail)",
      "Begin Step 2 CK preparation",
      "Research ECFMG pathways",
      "Start identifying observership programs",
    ],
  },
  {
    phase: "Exams & Clinical Planning",
    months: "Apr - Jun",
    tasks: [
      "Take USMLE Step 2 CK (aim 240+)",
      "Register for OET Medicine",
      "Apply to observership programs",
      "Begin ECFMG pathway application",
    ],
  },
  {
    phase: "Clinical Experience & ERAS",
    months: "Jul - Sep",
    tasks: [
      "Complete observerships / rotations",
      "Secure letters of recommendation",
      "Submit ERAS application (September)",
      "Complete ECFMG certification",
    ],
  },
  {
    phase: "Interview Season",
    months: "Oct - Jan",
    tasks: [
      "Schedule and attend interviews",
      "Practice with mock interviews",
      "Research programs thoroughly",
      "Send thank you notes",
    ],
  },
  {
    phase: "Rank List",
    months: "Jan - Feb",
    tasks: [
      "Finalize rank order list",
      "Submit ROL before deadline",
      "Prepare SOAP materials (just in case)",
      "Review NRMP policies",
    ],
  },
  {
    phase: "Match & SOAP",
    months: "March",
    tasks: [
      "Match Week notifications",
      "If unmatched: SOAP immediately",
      "Match Day results",
      "Begin visa processing if needed",
    ],
  },
];

// ─── VISA INFO ───────────────────────────────────────────────────────────────

export const VISA_INFO = [
  {
    type: "J-1 Visa",
    description: "Most common for residency. ECFMG is the sole J-1 sponsor for medical residencies.",
    pros: ["Universally accepted by programs", "ECFMG handles sponsorship"],
    cons: ["2-year home country requirement after training", "Waiver process can be complex"],
  },
  {
    type: "H-1B Visa",
    description: "Employer-sponsored work visa. More flexibility but harder to obtain.",
    pros: ["No home country requirement", "Dual intent (can pursue green card)", "Spouse can work (H-4 EAD)"],
    cons: ["Program must sponsor (fewer do)", "Cap-exempt only for non-profit hospitals", "More expensive for programs"],
  },
  {
    type: "J-1 Waiver (Conrad 30)",
    description: "State-sponsored waiver of J-1 home requirement. 3-year service commitment in underserved area.",
    pros: ["Avoid 2-year home requirement", "Available in all 50 states"],
    cons: ["3-year service obligation", "Must work in underserved area", "Competitive — each state has 30 slots"],
  },
];

// ─── COMMON MISTAKES ─────────────────────────────────────────────────────────

export const COMMON_MISTAKES = [
  { mistake: "Applying to too few programs", fix: "Apply to 150-200+ programs for competitive specialties. IMGs need broader applications." },
  { mistake: "No US clinical experience", fix: "Complete 2-3 observerships or clinical rotations. US experience is critical for LORs and interviews." },
  { mistake: "Weak personal statement", fix: "Get feedback from US physicians. Explain your IMG journey authentically — programs value resilience." },
  { mistake: "Generic LORs from home country", fix: "US-based LORs carry far more weight. Aim for at least 2 from US attendings." },
  { mistake: "Not researching IMG-friendly programs", fix: "Use FREIDA to filter by IMG percentage. Community programs have 3x higher IMG interview rates." },
  { mistake: "Applying to wrong specialties", fix: "Be realistic about competitiveness. Have a backup plan (e.g., IM as backup to Cardiology)." },
  { mistake: "Skipping mock interviews", fix: "Practice with US physicians. Cultural communication differences matter in interviews." },
  { mistake: "Ignoring SOAP preparation", fix: "Prepare SOAP materials before Match Day. 40% of unmatched IMGs who SOAP successfully match." },
  { mistake: "Not networking", fix: "Attend conferences (ACP, AAFP). Connect with program directors and alumni on LinkedIn." },
  { mistake: "Underestimating costs", fix: "Budget $12,000-22,000 for the full application cycle including exams, rotations, and applications. Most interviews are virtual now, saving thousands on travel." },
];

// ─── KEY RESOURCES ───────────────────────────────────────────────────────────

export const KEY_RESOURCES = [
  { name: "FREIDA", url: "https://freida.ama-assn.org/", description: "AMA's residency program database — 13,000+ programs" },
  { name: "NRMP", url: "https://www.nrmp.org/", description: "National Resident Matching Program — match data and policies" },
  { name: "ECFMG", url: "https://www.ecfmg.org/", description: "Educational Commission for Foreign Medical Graduates" },
  { name: "ECFMG Pathways", url: "https://www.ecfmg.org/certification-pathways/", description: "2026 Certification Pathways" },
  { name: "ERAS", url: "https://eras.aamc.org/", description: "Electronic Residency Application Service" },
  { name: "USMLE", url: "https://www.usmle.org/", description: "United States Medical Licensing Examination" },
  { name: "r/IMGreddit", url: "https://reddit.com/r/IMGreddit", description: "Reddit community for IMGs" },
  { name: "r/residency", url: "https://reddit.com/r/residency", description: "Reddit residency community" },
  { name: "Charting Outcomes (IMGs)", url: "https://www.nrmp.org/match-data/", description: "NRMP data on IMG match outcomes by specialty" },
];

// ─── COMMUNITY INSIGHTS ─────────────────────────────────────────────────────

export const COMMUNITY_INSIGHTS = [
  { insight: "Step 1 is pass/fail but programs still ask about attempts. First-attempt pass matters.", source: "r/IMGreddit" },
  { insight: "US clinical experience is now the #1 differentiator after Step 2 CK score.", source: "r/residency" },
  { insight: "Research fellowships (especially paid) can bridge graduation gaps of 3+ years.", source: "SDN Forum" },
  { insight: "Year of graduation is a hard filter at many programs. Apply within 5 years if possible.", source: "r/IMGreddit" },
  { insight: "Cold-emailing PIs for research positions has a 5-10% response rate — volume matters.", source: "r/residency" },
  { insight: "NYC is not the only option. Midwest and South have excellent IMG programs with lower costs.", source: "r/IMGreddit" },
  { insight: "The match is getting harder every year. Non-US IMG applicants grew 14.4% in 2025 alone.", source: "NRMP 2025" },
  { insight: "SOAP requires completely separate preparation. Have your documents ready before March.", source: "r/residency" },
];
