"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AccordionSections } from "@/components/ui/accordion-section";
import {
  BookOpen, ExternalLink, ArrowRight, Star, Users,
  TrendingUp, MapPin, Award, CheckCircle2, AlertCircle,
  Calendar, Globe, FileText, Clock, Shield, BarChart3,
  GraduationCap, Activity, DollarSign, Heart, Stethoscope
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  DATA                                                               */
/* ------------------------------------------------------------------ */

const NRMP_OVERVIEW_STATS = [
  { label: "Total Positions Offered", value: "~40,000+", detail: "Across all ACGME-accredited programs in the 2024 Match cycle" },
  { label: "Total Positions Filled", value: "~38,000", detail: "Approximately 95% fill rate across all applicant types" },
  { label: "US MD Match Rate", value: "~93%", detail: "US allopathic medical school seniors" },
  { label: "US DO Match Rate", value: "~91%", detail: "US osteopathic medical school seniors" },
  { label: "US IMG Match Rate", value: "~68%", detail: "US citizens who attended international medical schools" },
  { label: "Non-US IMG Match Rate", value: "~61%", detail: "International medical graduates who are not US citizens" },
  { label: "Non-US IMG Applicants", value: "~16,000", detail: "Total non-US IMGs who registered for the 2024 Match" },
  { label: "Non-US IMGs Matched", value: "~9,700", detail: "Non-US IMGs who successfully matched into a position" },
  { label: "Avg Positions Ranked (Matched IMGs)", value: "10-12", detail: "Matched IMGs typically rank 10-12 programs on their ROL" },
  { label: "Unmatched IMG Rate", value: "~39%", detail: "Approximately 4 in 10 non-US IMGs do not match" },
  { label: "SOAP Success Rate (IMGs)", value: "~15-20%", detail: "IMGs who enter SOAP have a 15-20% chance of finding a position" },
  { label: "Average Applications per IMG", value: "150-200+", detail: "IMGs typically apply to far more programs than USMGs" },
];

const CHARTING_OUTCOMES_IMG = [
  { specialty: "Internal Medicine", totalPositions: "~9,700", imgApplicants: "~8,500", imgMatched: "~4,500", matchRate: "~53%", avgRanked: "11", interviewToMatch: "~3:1" },
  { specialty: "Family Medicine", totalPositions: "~5,100", imgApplicants: "~4,200", imgMatched: "~2,000", matchRate: "~48%", avgRanked: "9", interviewToMatch: "~3:1" },
  { specialty: "Pediatrics", totalPositions: "~2,900", imgApplicants: "~1,800", imgMatched: "~800", matchRate: "~44%", avgRanked: "10", interviewToMatch: "~3.5:1" },
  { specialty: "Psychiatry", totalPositions: "~2,000", imgApplicants: "~2,100", imgMatched: "~900", matchRate: "~43%", avgRanked: "10", interviewToMatch: "~3:1" },
  { specialty: "Neurology", totalPositions: "~1,000", imgApplicants: "~1,100", imgMatched: "~400", matchRate: "~36%", avgRanked: "8", interviewToMatch: "~3:1" },
  { specialty: "Pathology", totalPositions: "~600", imgApplicants: "~500", imgMatched: "~250", matchRate: "~50%", avgRanked: "7", interviewToMatch: "~2.5:1" },
  { specialty: "General Surgery", totalPositions: "~1,500", imgApplicants: "~1,800", imgMatched: "~400", matchRate: "~22%", avgRanked: "9", interviewToMatch: "~4:1" },
  { specialty: "Anesthesiology", totalPositions: "~1,900", imgApplicants: "~1,200", imgMatched: "~300", matchRate: "~25%", avgRanked: "10", interviewToMatch: "~4:1" },
  { specialty: "Emergency Medicine", totalPositions: "~2,800", imgApplicants: "~500", imgMatched: "~100", matchRate: "~20%", avgRanked: "8", interviewToMatch: "~5:1" },
  { specialty: "PM&R", totalPositions: "~500", imgApplicants: "~400", imgMatched: "~150", matchRate: "~38%", avgRanked: "8", interviewToMatch: "~3:1" },
];

const SOAP_IMG_DATA = {
  overview: "SOAP (Supplemental Offer and Acceptance Program) is the process by which unmatched applicants can apply to unfilled residency positions. It occurs during Match Week, typically Monday through Wednesday.",
  stats: [
    { label: "IMGs entering SOAP annually", value: "~5,000-6,000", detail: "Both US and non-US IMGs who did not match in the main Match" },
    { label: "SOAP success rate for non-US IMGs", value: "~15-20%", detail: "Significantly lower than the ~40-45% rate for US MD/DO applicants" },
    { label: "Unfilled positions in SOAP", value: "~1,500-2,000", detail: "Number varies each year, trending slightly downward" },
    { label: "Max SOAP applications", value: "45 programs", detail: "Applicants can apply to up to 45 unfilled programs across all rounds" },
    { label: "SOAP rounds", value: "3 rounds", detail: "Round 1 has the most positions, Rounds 2 and 3 have progressively fewer" },
    { label: "IM positions in SOAP", value: "~200-400", detail: "Internal Medicine typically has the most unfilled SOAP positions" },
    { label: "Avg time to respond", value: "2-4 hours", detail: "Programs may offer within hours; decisions happen extremely fast" },
    { label: "Preliminary positions in SOAP", value: "~300-500", detail: "Preliminary (transitional/prelim IM/surgery) positions are common in SOAP" },
  ],
};

const INTERVIEW_DATA = [
  { group: "Matched non-US IMGs", interviews: "10-14", detail: "Matched IMGs typically receive 10-14 interview invitations and attend most of them" },
  { group: "Unmatched non-US IMGs", interviews: "3-6", detail: "Unmatched IMGs received significantly fewer invitations on average" },
  { group: "Matched US IMGs", interviews: "12-16", detail: "US citizen IMGs tend to receive slightly more invitations than non-US IMGs" },
  { group: "Matched USMGs (for comparison)", interviews: "15-20", detail: "US MD seniors receive the most invitations as a reference point" },
];

const YOG_DATA = [
  { years: "Current year graduate", matchRate: "~70-75%", detail: "Graduates applying in the same year they complete medical school have the highest match rates among IMGs" },
  { years: "1-2 years since graduation", matchRate: "~65-70%", detail: "Still competitive. Most programs do not filter out applicants within this range" },
  { years: "3-5 years since graduation", matchRate: "~50-55%", detail: "Noticeable drop. Some programs have explicit YOG cutoffs of 3-5 years. Research or US clinical experience can offset the gap" },
  { years: "5-7 years since graduation", matchRate: "~35-40%", detail: "Many programs will filter you out. A strong research fellowship, publications, or unique experiences are needed to remain competitive" },
  { years: "7-10 years since graduation", matchRate: "~20-25%", detail: "Very challenging. Most competitive programs will not consider applications. Focus on community programs that do not have YOG filters" },
  { years: "10+ years since graduation", matchRate: "~10-15%", detail: "Extremely difficult. Very few programs accept applicants this far from graduation. Consider alternative pathways or programs without YOG requirements" },
];

const ECFMG_PATHWAYS = [
  {
    name: "Pathway 1",
    title: "USMLE Pathway",
    status: "Permanent",
    description: "Pass USMLE Step 1 and Step 2 CK. This is the traditional and most common pathway. Step 1 is now pass/fail. Step 2 CK score is the primary metric programs use to evaluate candidates.",
    requirements: ["Pass USMLE Step 1", "Pass USMLE Step 2 CK", "Meet medical school credential requirements"],
  },
  {
    name: "Pathway 2",
    title: "Medical School Accreditation",
    status: "Extended through 2027",
    description: "For graduates of medical schools that are accredited by an agency recognized by the World Federation for Medical Education (WFME). Your medical school must hold accreditation status at the time of your application.",
    requirements: ["Graduate of a WFME-accredited medical school", "Pass USMLE Step 1 and Step 2 CK", "School must be accredited at time of application"],
  },
  {
    name: "Pathway 3",
    title: "Clinical Experience",
    status: "Extended through 2027",
    description: "For IMGs who have completed a minimum of 1 year of post-graduate clinical training in a country with a medical regulatory authority that ECFMG recognizes. This typically means completing an internship or residency year in your home country or another country.",
    requirements: ["1+ year of post-graduate clinical training", "Training must be recognized by a medical regulatory authority", "Pass USMLE Step 1 and Step 2 CK"],
  },
  {
    name: "Pathway 4",
    title: "Significant Professional Experience",
    status: "Extended through 2027",
    description: "For IMGs who have been practicing medicine for a significant period and hold a valid, unrestricted license to practice. Typically requires 2+ years of licensed, independent medical practice.",
    requirements: ["Valid medical license in a country with recognized medical authority", "2+ years of licensed practice", "Pass USMLE Step 1 and Step 2 CK"],
  },
  {
    name: "Pathway 5",
    title: "Examination Pathway",
    status: "Extended through 2027",
    description: "For IMGs who have passed a qualifying exam administered by a medical regulatory authority recognized by ECFMG, such as PLAB (UK), AMC (Australia), or MCCQE (Canada).",
    requirements: ["Pass a recognized qualifying examination (PLAB, AMC, MCCQE, etc.)", "Pass USMLE Step 1 and Step 2 CK", "Exam must be recognized by ECFMG"],
  },
  {
    name: "Pathway 6",
    title: "Emergency Pandemic Pathway",
    status: "Expired",
    description: "This pathway was created during the COVID-19 pandemic as a temporary measure when Step 2 CS was discontinued. It is no longer available. Pathways 2-5 were extended as alternatives.",
    requirements: ["No longer available"],
  },
];

const MATCH_TRENDS = [
  { year: "2020", imgApplicants: "~13,800", imgMatched: "~7,800", matchRate: "~56%", totalPositions: "~37,000", note: "Last year with Step 2 CS requirement. COVID-19 disrupted clinical experiences." },
  { year: "2021", imgApplicants: "~14,500", imgMatched: "~8,200", matchRate: "~57%", totalPositions: "~38,100", note: "Step 2 CS discontinued. Pathway system introduced. Virtual interviews became standard." },
  { year: "2022", imgApplicants: "~15,000", imgMatched: "~8,800", matchRate: "~59%", totalPositions: "~39,200", note: "Step 1 changed to pass/fail. Step 2 CK score became primary differentiator." },
  { year: "2023", imgApplicants: "~15,500", imgMatched: "~9,300", matchRate: "~60%", totalPositions: "~40,300", note: "More positions available. DO merger complete. IMG applicant pool continued growing." },
  { year: "2024", imgApplicants: "~16,000", imgMatched: "~9,700", matchRate: "~61%", totalPositions: "~40,800", note: "Record number of positions. IMG match rate improved slightly. Competition remains intense." },
];

const PRE_MATCH_RESOURCES = [
  {
    name: "US Clinical Experience Programs",
    description: "Observerships and externships at US hospitals give you hands-on or observational clinical experience. These are critical for obtaining US-based Letters of Recommendation and demonstrating familiarity with the US healthcare system. Start applying 4-8 months before your desired start date.",
    actionLink: "/browse",
    actionLabel: "Browse Programs",
  },
  {
    name: "Research Fellowships",
    description: "A 1-2 year research position at a US academic institution provides publications, US-based LORs, J-1 visa status, and networking. Research fellows at major institutions often have match rates significantly above the IMG average. Focus on clinical research, outcomes research, or translational research that aligns with your target specialty.",
    actionLink: "/browse?type=RESEARCH",
    actionLabel: "Find Research Positions",
  },
  {
    name: "Medical Conference Attendance",
    description: "Attending and presenting at specialty conferences (ACP for IM, AAFP for FM, AAP for Pediatrics, etc.) provides networking opportunities with program directors. Poster presentations and oral presentations are especially valuable for your CV. Many conferences offer discounted rates for international attendees.",
    actionLink: null,
    actionLabel: null,
  },
  {
    name: "Mock Interview Preparation",
    description: "US residency interviews follow specific cultural norms that may differ from your home country. Practice behavioral questions, know your personal statement inside and out, and prepare thoughtful questions about each program. Organizations like IMG-focused mentorship groups offer free or low-cost mock interviews. Practice with peers who have already matched.",
    actionLink: null,
    actionLabel: null,
  },
  {
    name: "Personal Statement Review",
    description: "Your personal statement should tell your unique story: why you chose medicine, why your specialty, why the US, and what you bring as an IMG. Avoid generic statements. Have it reviewed by at least 2-3 people who know the US system, ideally an attending or program director. Multiple revisions are normal and expected.",
    actionLink: null,
    actionLabel: null,
  },
  {
    name: "ERAS Application Preparation",
    description: "ERAS opens mid-September. Have all your documents ready before then: CV, personal statement, USMLE transcripts, ECFMG certificate, Letters of Recommendation (uploaded by writers), medical school transcript, and photo. Apply on day one — early applications have a measurable advantage for IMGs.",
    actionLink: null,
    actionLabel: null,
  },
];

const SPECIALTY_DATA = [
  { specialty: "Internal Medicine", level: "Accessible", color: "text-emerald-600 bg-emerald-50", imgFilledPositions: "~4,500+", typicalStep2CK: "230-245", trend: "Stable", imgPrograms: "500+", description: "Largest number of positions. Most IMG-friendly. ~40% of positions filled by IMGs. Community and university programs both accessible." },
  { specialty: "Family Medicine", level: "Accessible", color: "text-emerald-600 bg-emerald-50", imgFilledPositions: "~2,000+", typicalStep2CK: "220-240", trend: "Growing", imgPrograms: "350+", description: "Growing field with increasing positions. Many community programs accept IMGs. Rural programs especially IMG-friendly." },
  { specialty: "Pediatrics", level: "Moderate", color: "text-amber-600 bg-amber-50", imgFilledPositions: "~800", typicalStep2CK: "230-245", trend: "Stable", imgPrograms: "120+", description: "Some IMG-friendly programs exist. University programs are competitive. Community programs more accessible." },
  { specialty: "Psychiatry", level: "Moderate", color: "text-amber-600 bg-amber-50", imgFilledPositions: "~900", typicalStep2CK: "230-245", trend: "Growing", imgPrograms: "130+", description: "Growing demand has opened doors for IMGs. More programs accepting IMGs in recent years. Telepsychiatry driving expansion." },
  { specialty: "Neurology", level: "Moderate", color: "text-amber-600 bg-amber-50", imgFilledPositions: "~400", typicalStep2CK: "235-250", trend: "Growing", imgPrograms: "80+", description: "Some IMG-friendly programs, especially in the Midwest and South. Research experience gives an edge." },
  { specialty: "Pathology", level: "Moderate", color: "text-amber-600 bg-amber-50", imgFilledPositions: "~250", typicalStep2CK: "230-245", trend: "Stable", imgPrograms: "60+", description: "Smaller field but IMG-accessible. Research experience valued. Fellowship placement is generally good." },
  { specialty: "Anesthesiology", level: "Competitive", color: "text-red-600 bg-red-50", imgFilledPositions: "~300", typicalStep2CK: "240-255", trend: "Shrinking for IMGs", imgPrograms: "50+", description: "Becoming more competitive for IMGs. Some community programs still accessible. Research and US experience critical." },
  { specialty: "PM&R (Physical Medicine)", level: "Moderate", color: "text-amber-600 bg-amber-50", imgFilledPositions: "~150", typicalStep2CK: "230-245", trend: "Stable", imgPrograms: "40+", description: "Often overlooked by IMGs. Some programs actively recruit IMGs. Good lifestyle specialty with growing demand." },
  { specialty: "Preventive Medicine", level: "Accessible", color: "text-emerald-600 bg-emerald-50", imgFilledPositions: "~80", typicalStep2CK: "220-235", trend: "Stable", imgPrograms: "30+", description: "Small field with limited positions but IMG-accessible. MPH or public health background valued. Good for IMGs interested in population health." },
  { specialty: "General Surgery", level: "Competitive", color: "text-red-600 bg-red-50", imgFilledPositions: "~400", typicalStep2CK: "240-255", trend: "Shrinking for IMGs", imgPrograms: "70+", description: "Very few IMG-friendly categorical positions. Preliminary positions more accessible. Strong US clinical experience required." },
  { specialty: "Emergency Medicine", level: "Very Competitive", color: "text-red-700 bg-red-50", imgFilledPositions: "~100", typicalStep2CK: "245-260", trend: "Shrinking for IMGs", imgPrograms: "15-20", description: "Very few programs accept IMGs. Cook County and Lincoln are notable exceptions. Field is contracting overall." },
  { specialty: "Radiology", level: "Very Competitive", color: "text-red-700 bg-red-50", imgFilledPositions: "~100", typicalStep2CK: "250-260+", trend: "Stable but limited", imgPrograms: "20-30", description: "Extremely limited for IMGs. Research year almost required. Preliminary year + strong connections needed." },
  { specialty: "Dermatology", level: "Extremely Competitive", color: "text-red-800 bg-red-50", imgFilledPositions: "<20", typicalStep2CK: "260+", trend: "Near impossible", imgPrograms: "<10", description: "Near impossible for non-US IMGs. Research fellowship is the only realistic pathway. Multi-year US research commitment required." },
  { specialty: "Orthopedics", level: "Extremely Competitive", color: "text-red-800 bg-red-50", imgFilledPositions: "<15", typicalStep2CK: "260+", trend: "Near impossible", imgPrograms: "<5", description: "Almost no IMG positions. Requires exceptional research and US connections. Consider related fields like PM&R." },
];

const IMG_FRIENDLY_PROGRAMS = [
  { name: "Jacobi Medical Center / Albert Einstein", location: "Bronx, NY", specialties: ["Internal Medicine", "Family Medicine", "Pediatrics", "Psychiatry", "Surgery"], imgPercent: "70-80%", insight: "One of the most IMG-friendly programs in the country. Large IMG resident body. H+H system offers excellent training with diverse patient population. Known for strong board pass rates despite high IMG percentage.", source: "r/IMGreddit, FREIDA, SDN", fellowshipPotential: "Strong cardiology, GI, pulm/crit care, and heme-onc fellowship placements", costOfLiving: "Moderate — $1,400-2,000/mo rent for 1BR (Bronx is cheaper than Manhattan)", salary: "PGY-1: ~$70,000", lifestyle: "High volume, diverse patient population, urban setting, close to Manhattan.", highlights: ["Excellent procedural training", "Strong board pass rates", "Large IMG community"] },
  { name: "Elmhurst Hospital / Mount Sinai", location: "Queens, NY", specialties: ["Internal Medicine", "Surgery", "Pediatrics", "OB/GYN"], imgPercent: "60-75%", insight: "Queens location with incredibly diverse patient population. Residents report excellent hands-on training. Strong IM program with good fellowship placement. Competitive for IMGs but accessible.", source: "r/residency, r/IMGreddit", fellowshipPotential: "GI, cardiology, pulmonology, and geriatrics fellowship placements", costOfLiving: "Moderate — $1,500-2,200/mo rent for 1BR", salary: "PGY-1: ~$72,000", lifestyle: "Incredibly diverse (130+ languages spoken), busy urban hospital.", highlights: ["Mount Sinai affiliation", "Culturally rich patient population", "Strong IM training"] },
  { name: "Lincoln Medical Center", location: "Bronx, NY", specialties: ["Internal Medicine", "Emergency Medicine", "Pediatrics", "Surgery"], imgPercent: "65-80%", insight: "High-volume center in the South Bronx. Excellent procedural training. Emergency Medicine program is one of the few that accepts IMGs. Strong community reputation.", source: "r/IMGreddit, SDN", fellowshipPotential: "Pulm/crit care and EM fellowships", costOfLiving: "Affordable — $1,200-1,800/mo rent for 1BR", salary: "PGY-1: ~$68,000", lifestyle: "Very high volume, Level I trauma center, fast-paced environment.", highlights: ["One of few EM programs for IMGs", "Excellent procedural training", "High-acuity cases"] },
  { name: "BronxCare Health System", location: "Bronx, NY", specialties: ["Internal Medicine", "Family Medicine", "Pediatrics", "Surgery"], imgPercent: "80-90%", insight: "Very IMG-friendly. Safety-net hospital with high patient volume. Known for giving IMGs a chance. Good board pass rates. Multiple fellowship matches annually.", source: "r/IMGreddit, FREIDA", fellowshipPotential: "Cardiology, GI, and nephrology fellowship placements", costOfLiving: "Affordable — $1,100-1,600/mo rent for 1BR", salary: "PGY-1: ~$65,000", lifestyle: "Community hospital feel, supportive environment, high patient volume.", highlights: ["Very IMG-friendly culture", "Good board prep support", "Multiple fellowship matches annually"] },
  { name: "Maimonides Medical Center", location: "Brooklyn, NY", specialties: ["Internal Medicine", "Cardiology", "Surgery", "Pediatrics"], imgPercent: "50-65%", insight: "Strong community hospital with academic affiliation. Excellent cardiology fellowship. Brooklyn location with diverse patient population. Good for IMGs who want community + academic balance.", source: "r/residency, FREIDA", fellowshipPotential: "Strong cardiology (well-known), GI, and pulmonology fellowships", costOfLiving: "Moderate — $1,500-2,200/mo rent for 1BR", salary: "PGY-1: ~$68,000", lifestyle: "Brooklyn community, Borough Park (Orthodox Jewish neighborhood).", highlights: ["Excellent cardiology fellowship program", "Cardiac cath lab access for residents", "Community + academic balance"] },
  { name: "Cook County / Stroger Hospital", location: "Chicago, IL", specialties: ["Internal Medicine", "Emergency Medicine", "Surgery", "Pediatrics"], imgPercent: "40-55%", insight: "Historic county hospital. One of the busiest trauma centers. EM residency is IMG-friendly. Internal Medicine program has strong board pass rates. Affordable city.", source: "r/residency, r/IMGreddit", fellowshipPotential: "Pulm/crit care, infectious disease, and EM fellowships", costOfLiving: "Affordable — $1,000-1,500/mo rent for 1BR", salary: "PGY-1: ~$62,000", lifestyle: "Historic county hospital, high acuity, social medicine focus.", highlights: ["One of busiest trauma centers in the US", "Strong teaching culture", "IMG-friendly EM program"] },
  { name: "Wayne State / Detroit Medical Center", location: "Detroit, MI", specialties: ["Internal Medicine", "Surgery", "Pediatrics", "Psychiatry", "Neurology"], imgPercent: "40-60%", insight: "University-affiliated program with IMG-friendly track record. Multiple hospitals in the system. Detroit is very affordable. Strong pathology and neurology programs.", source: "FREIDA, r/IMGreddit", fellowshipPotential: "Multiple fellowships available through university system", costOfLiving: "Very affordable — $800-1,200/mo rent for 1BR", salary: "PGY-1: ~$60,000", lifestyle: "Urban, revitalizing city, multiple hospital system.", highlights: ["University affiliation", "Research opportunities", "Very affordable cost of living"] },
  { name: "Cleveland Clinic (Community Programs)", location: "Various, OH", specialties: ["Internal Medicine", "Family Medicine"], imgPercent: "30-50%", insight: "Cleveland Clinic community programs (not main campus) are more IMG-accessible. Strong brand name on CV. Ohio is affordable. Good fellowship placement from community programs.", source: "r/IMGreddit, FREIDA", fellowshipPotential: "Access to Cleveland Clinic fellowship system", costOfLiving: "Very affordable — $800-1,200/mo rent for 1BR", salary: "PGY-1: ~$60,000", lifestyle: "Ohio lifestyle, slower pace than NYC, good quality of life.", highlights: ["Cleveland Clinic name on CV", "Affordable Ohio living", "Good quality of life"] },
  { name: "Temple University Hospital", location: "Philadelphia, PA", specialties: ["Internal Medicine", "Surgery", "Pulmonary/Critical Care"], imgPercent: "30-45%", insight: "Academic center with IMG-friendly reputation. Strong pulmonary/critical care fellowship. Philadelphia is affordable compared to NYC. Good research opportunities.", source: "FREIDA, r/residency", fellowshipPotential: "Strong pulm/crit care and infectious disease fellowships", costOfLiving: "Affordable — $1,000-1,500/mo rent for 1BR", salary: "PGY-1: ~$62,000", lifestyle: "Urban, North Philadelphia, academic center environment.", highlights: ["Strong pulmonary program", "Affordable city compared to NYC", "Good research opportunities"] },
  { name: "Grady Memorial Hospital / Emory", location: "Atlanta, GA", specialties: ["Internal Medicine", "Emergency Medicine", "Surgery"], imgPercent: "25-40%", insight: "Large safety-net hospital affiliated with Emory. High-volume trauma center. IM program accepts IMGs regularly. Atlanta is affordable with growing medical community.", source: "FREIDA, r/IMGreddit", fellowshipPotential: "Access to Emory fellowship system", costOfLiving: "Moderate — $1,200-1,800/mo rent for 1BR", salary: "PGY-1: ~$60,000", lifestyle: "Southern city, growing medical hub, diverse patient population.", highlights: ["Emory university affiliation", "CDC proximity and public health opportunities", "Diverse patient population"] },
];

const STATE_IMG_DATA = [
  { state: "New York", programs: "40+", description: "Most IMG-friendly state in the US. NYC Health + Hospitals system is the backbone. Programs in every borough plus upstate options like Buffalo and Syracuse. High cost of living in NYC but unmatched training volume.", highlight: true },
  { state: "Michigan", programs: "20+", description: "Wayne State/DMC system is a major IMG employer. Detroit, Flint, and Lansing all have IMG-friendly programs. Very affordable cost of living. Strong community hospital network." },
  { state: "Illinois", programs: "15+", description: "Cook County/Stroger, UIC, and multiple community programs in the Chicago area. Affordable outside downtown. Advocate and Presence health systems also take IMGs." },
  { state: "Ohio", programs: "12+", description: "Cleveland Clinic community programs, MetroHealth, and several smaller programs. Affordable living. Multiple cities with options: Cleveland, Columbus, Akron, Toledo." },
  { state: "Pennsylvania", programs: "12+", description: "Temple, Mercy Catholic, Crozer-Chester, and others in the Philadelphia region. Pittsburgh also has some options. More affordable than the Northeast corridor." },
  { state: "New Jersey", programs: "10+", description: "Multiple community programs, particularly in northern NJ near NYC. Programs at Newark Beth Israel, Jersey City Medical Center, and others. Close to NYC but cheaper living." },
  { state: "Florida", programs: "10+", description: "Growing IMG population. Programs in Miami, Jacksonville, and Tampa areas. Warm climate is attractive. Jackson Memorial/University of Miami takes some IMGs." },
  { state: "Texas", programs: "8+", description: "Houston and Dallas community programs. Affordable living with no state income tax. Growing medical infrastructure. Check programs affiliated with UT and Baylor systems." },
  { state: "California", programs: "5+", description: "Limited but some community programs exist. Very competitive due to location desirability. High cost of living. Programs in LA and Central Valley areas." },
  { state: "Georgia", programs: "5+", description: "Grady/Emory in Atlanta and Augusta University. Atlanta is affordable and growing. Good mix of academic and community training options." },
];

const APPLICATION_TIMELINE = [
  { months: "January - March", title: "Foundations", icon: "1", tasks: ["Pass Step 1 (now pass/fail)", "Begin Step 2 CK preparation", "Research target specialties and programs", "Start compiling a list of IMG-friendly programs", "Begin contacting research PIs via cold emails"] },
  { months: "April - June", title: "Examinations & Clinical Planning", icon: "2", tasks: ["Take Step 2 CK (aim for 240+ for competitive specialties)", "Begin applying for US clinical experiences (observerships/externships)", "Secure ECFMG certification pathway (Pathways or Step 2 CS alternative)", "Build relationships with potential LOR writers", "Start drafting personal statement"] },
  { months: "July - September", title: "Clinical Experience & Application", icon: "3", tasks: ["Complete observerships and/or externships in the US", "Obtain strong LORs from US-based physicians", "Finalize personal statement (have multiple people review)", "ERAS opens mid-September: submit your application", "Apply broadly (150-200+ programs for most IMGs)", "Upload all supporting documents to ERAS"] },
  { months: "October - January", title: "Interview Season", icon: "4", tasks: ["Respond to interview invitations within 24 hours", "Schedule interviews strategically (geography, dates)", "Do mock interviews with peers or mentors", "Send thank-you notes after interviews", "Research each program before interviews", "Track all interviews and impressions for rank list"] },
  { months: "January - February", title: "Rank Order List", icon: "5", tasks: ["Finalize your rank order list based on fit, not prestige", "Rank all programs where you interviewed", "Do NOT try to game the system. Rank by genuine preference", "Submit ROL before the deadline (usually mid-February)", "Begin preparing SOAP materials just in case"] },
  { months: "March", title: "Match & SOAP", icon: "6", tasks: ["Match Week: Monday you learn if you matched (not where)", "Match Day (Friday): You find out where you matched", "If unmatched: SOAP begins immediately on Monday", "SOAP: Have personal statement, LORs, and documents ready", "Apply to unfilled positions through SOAP (up to 45 programs)", "SOAP results come in rounds over Monday-Wednesday"] },
];

const KEY_RESOURCES = [
  { name: "FREIDA", url: "https://freida.ama-assn.org/", description: "AMA's official residency program database. Search by specialty, location, and IMG percentage." },
  { name: "NRMP", url: "https://nrmp.org/", description: "National Resident Matching Program. Match data, reports, and charting outcomes for IMGs." },
  { name: "ECFMG", url: "https://ecfmg.org/", description: "Educational Commission for Foreign Medical Graduates. Required certification for all IMGs." },
  { name: "ECFMG Pathways", url: "https://ecfmg.org/certification/", description: "Information on certification pathways for IMGs, including alternatives to Step 2 CS." },
  { name: "ERAS", url: "https://aamc.org/services/eras", description: "Electronic Residency Application Service. The application portal for US residency programs." },
  { name: "USMLE", url: "https://usmle.org/", description: "Official USMLE site. Exam dates, score reporting, and Step information." },
  { name: "r/IMGreddit", url: "https://reddit.com/r/IMGreddit", description: "Reddit community specifically for IMGs. Match experiences, advice, and program reviews." },
  { name: "r/residency", url: "https://reddit.com/r/residency", description: "General residency discussion. Program reviews, interview experiences, and match threads." },
  { name: "Student Doctor Network", url: "https://studentdoctor.net/", description: "Forums with program-specific threads, interview feedback, and IMG experiences." },
];

const COMMON_MISTAKES = [
  { mistake: "Applying to too few programs", fix: "Apply to 150-200+ programs. IMGs need a wider net than USMGs. Budget for application fees accordingly." },
  { mistake: "No US clinical experience", fix: "Get at least 2-3 months of US clinical experience. Externships with hands-on patient care are valued more than pure observerships." },
  { mistake: "Weak personal statement", fix: "Have your PS reviewed by US physicians, program directors if possible, and peers who matched. Tell your unique story and explain your motivation." },
  { mistake: "Generic LORs not from US physicians", fix: "Get at least 2 LORs from US-based physicians who worked with you directly. Generic letters from home country are worth much less." },
  { mistake: "Not researching which programs accept IMGs", fix: "Use FREIDA to filter by IMG percentage. Cross-reference with community reports on Reddit and SDN. Do not waste applications on programs that never interview IMGs." },
  { mistake: "Applying to wrong specialties", fix: "Understand the competitiveness landscape. If your scores and experience are not competitive for a specialty, have a backup plan in a more accessible field." },
  { mistake: "Not doing mock interviews", fix: "Practice with peers, mentors, or professional services. US interview culture may be different from what you are used to. First impressions matter enormously." },
  { mistake: "Ignoring SOAP preparation", fix: "Prepare SOAP materials before Match Day. Have a separate personal statement, updated CV, and LORs ready. SOAP moves extremely fast: you need to be prepared." },
  { mistake: "Not networking at conferences", fix: "Attend specialty conferences (ACP, AAFP, etc.) and poster sessions. Meet program directors in person. Networking can lead to interview invitations." },
  { mistake: "Underestimating the cost of the process", fix: "Budget for USMLE exams ($600+ each), ECFMG certification, ERAS fees ($1,000-3,000+), travel for interviews, and living expenses during clinical rotations." },
];

const VISA_INFO = [
  { type: "J-1 Visa", description: "Most common visa for IMG residency training. Sponsored by ECFMG (not the program). Requires 2-year home residency requirement after completion unless a waiver is obtained. Valid for duration of training." },
  { type: "H-1B Visa", description: "Employer-sponsored work visa. Not all programs sponsor H-1B. More flexibility than J-1 (no 2-year home requirement). Program must file a petition and pay associated fees. Cap-exempt for academic/nonprofit institutions." },
  { type: "J-1 Waiver (Conrad 30)", description: "Each state can sponsor up to 30 J-1 waivers per year for physicians who agree to work in underserved areas for 3 years. Very competitive. Must secure a job in a designated shortage area. Apply through the state health department." },
  { type: "J-1 Waiver (Other)", description: "Additional waiver options: Interested Government Agency (IGA) waiver, Hardship waiver, Persecution waiver, and Appalachian Regional Commission waiver. Each has specific eligibility requirements." },
  { type: "ECFMG's Role", description: "ECFMG is the sole sponsor of J-1 visas for clinical training in the US. They verify credentials, issue the DS-2019 form, and monitor compliance. Apply through ECFMG well in advance of your start date." },
  { type: "Programs & Visas", description: "Check FREIDA for each program's visa sponsorship policy. Some programs sponsor J-1 only, some J-1 and H-1B, and some do not sponsor any visas. This should be a key filter in your program search." },
];

const FORUM_INSIGHTS = [
  { title: "Step 1 Pass/Fail Changed the Game", source: "r/IMGreddit, r/Step1", insight: "With Step 1 now pass/fail, Step 2 CK score is the primary differentiator. Programs report looking more at clinical experience, LORs, and research. Score of 240+ on Step 2 CK is considered competitive for most IM programs." },
  { title: "US Clinical Experience is Non-Negotiable", source: "r/IMGreddit, r/residency", insight: "Virtually all matched IMGs report having at least 1-2 US clinical experiences. Externships with hands-on patient care are valued more than pure observerships. LORs from US physicians who worked with you directly are critical." },
  { title: "Research Fellowship is the Secret Weapon", source: "r/IMGreddit, SDN", insight: "A 1-2 year research fellowship at a US institution dramatically improves match chances. Provides publications, US-based LORs, J1 visa status, and insider networking. Especially important for competitive specialties." },
  { title: "Year of Graduation Matters More Than You Think", source: "r/residency, NRMP Data", insight: "Programs increasingly filter by YOG (year of graduation). Applicants within 3 years of graduation have significantly higher match rates. Longer gaps can be offset by research productivity or US clinical experience." },
  { title: "Cold Emailing PIs Still Works", source: "r/IMGreddit", insight: "The most common way IMGs land research positions is through cold emails to PIs. Success rate is typically 2-5%. Send 50-100+ tailored emails. Include your CV, a brief research interest statement, and reference a specific paper by the PI." },
  { title: "NYC is Not the Only Option", source: "r/IMGreddit, r/residency", insight: "While NYC has the most IMG-friendly programs, cities like Detroit, Chicago, Cleveland, and Atlanta offer strong programs with lower living costs and less competition. Midwest programs are often overlooked by IMGs." },
  { title: "The Match is Getting Harder Every Year", source: "r/IMGreddit, NRMP Data", insight: "Increasing numbers of IMG applicants combined with more US DO graduates filling positions means fewer spots for non-US IMGs. The trend is clear: start preparing earlier and apply more broadly each cycle." },
  { title: "SOAP Requires Its Own Preparation Strategy", source: "r/residency, r/IMGreddit", insight: "Do not treat SOAP as an afterthought. Have a separate personal statement, keep LORs on file, and research programs that historically go unfilled. SOAP success rate for IMGs is only 15-20%, so every detail matters." },
];

/* ------------------------------------------------------------------ */
/*  SECTION CONTENT RENDERERS                                          */
/* ------------------------------------------------------------------ */

function FreidaSection() {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 sm:p-8">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-900">
          <BookOpen className="h-5 w-5 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900">What is FREIDA?</h3>
          <p className="text-sm text-slate-500">Fellowship and Residency Electronic Interactive Database Access</p>
        </div>
      </div>
      <div className="mt-4 grid gap-6 text-sm text-slate-600 sm:grid-cols-2">
        <div className="space-y-3">
          <p>
            FREIDA is a database maintained by the American Medical Association (AMA) providing
            detailed information about ACGME-accredited residency and fellowship programs in the US.
            It is one of the most important tools for medical students and IMGs researching programs.
          </p>
          <p>
            The database includes program size, application requirements, salary, benefits, work schedule,
            board pass rates, and demographic data about current residents including IMG representation.
          </p>
          <p>
            For IMGs specifically, FREIDA is invaluable because it lets you filter programs by the
            percentage of IMG residents, visa sponsorship policies, and whether the program has
            historically accepted international graduates. This data should be the starting point
            for building your program list.
          </p>
        </div>
        <div>
          <h4 className="font-medium text-slate-900">Key Data Available in FREIDA:</h4>
          <ul className="mt-2 space-y-1.5">
            {[
              "Number of positions and program size",
              "Percentage of IMG residents (current and historical)",
              "Board pass rates for the program",
              "Salary and benefits details",
              "Work hours and call schedule",
              "Visa sponsorship policies (H1B, J1)",
              "Research requirements and opportunities",
              "Fellowship match rates from the program",
              "Interview format and requirements",
              "Application filters (Step scores, YOG limits, etc.)",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="mt-5">
        <a href="https://freida.ama-assn.org/" target="_blank" rel="noopener noreferrer">
          <Button variant="outline" size="sm">
            Visit FREIDA <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
          </Button>
        </a>
      </div>
    </div>
  );
}

function NrmpSection() {
  return (
    <>
      <p className="text-sm text-slate-500">
        Key numbers every IMG must know. Based on NRMP 2024 Main Residency Match data.
      </p>
      <div className="mt-2 flex items-center gap-1.5 text-[11px] text-amber-600">
        <AlertCircle className="h-3 w-3" />
        The match is getting more competitive for IMGs each year. More US DO graduates fill positions that were previously available to IMGs.
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {NRMP_OVERVIEW_STATS.map((stat) => (
          <div key={stat.label} className="rounded-lg border border-slate-200 p-4">
            <div className="text-2xl font-bold text-slate-900">{stat.value}</div>
            <div className="mt-0.5 text-sm font-medium text-slate-700">{stat.label}</div>
            <div className="mt-1 text-xs text-slate-500">{stat.detail}</div>
          </div>
        ))}
      </div>
      <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50/50 p-5">
        <h3 className="text-sm font-semibold text-slate-900">Key Takeaways for IMGs</h3>
        <ul className="mt-3 space-y-2">
          {[
            "About 6 out of 10 non-US IMGs will match. Prepare accordingly with a broad application strategy.",
            "US citizen IMGs match at a higher rate (~68%) than non-US IMGs (~61%). Green card holders are counted as US IMGs.",
            "The average matched IMG ranks 10-12 programs. Unmatched IMGs often ranked fewer. Apply broadly and interview at as many programs as possible.",
            "SOAP is not a reliable backup plan. Only 15-20% of IMGs who enter SOAP find a position. Focus your energy on the main Match.",
            "Internal Medicine remains the most accessible specialty, accounting for the largest share of IMG-filled positions.",
          ].map((point, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-500" />
              {point}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

function ChartingSection() {
  return (
    <>
      <p className="text-sm text-slate-500">
        Positions, applicants, match rates, and interview-to-match ratios for non-US IMGs across major specialties.
        Based on NRMP Charting Outcomes data.
      </p>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left">
              <th className="pb-3 pr-4 font-semibold text-slate-900">Specialty</th>
              <th className="pb-3 pr-4 font-semibold text-slate-900">Total Positions</th>
              <th className="pb-3 pr-4 font-semibold text-slate-900">IMG Applicants</th>
              <th className="pb-3 pr-4 font-semibold text-slate-900">IMGs Matched</th>
              <th className="pb-3 pr-4 font-semibold text-slate-900">Match Rate</th>
              <th className="pb-3 pr-4 font-semibold text-slate-900">Avg Ranked</th>
              <th className="pb-3 font-semibold text-slate-900">Interview:Match</th>
            </tr>
          </thead>
          <tbody>
            {CHARTING_OUTCOMES_IMG.map((row) => (
              <tr key={row.specialty} className="border-b border-slate-100">
                <td className="py-2.5 pr-4 font-medium text-slate-900">{row.specialty}</td>
                <td className="py-2.5 pr-4 text-slate-600">{row.totalPositions}</td>
                <td className="py-2.5 pr-4 text-slate-600">{row.imgApplicants}</td>
                <td className="py-2.5 pr-4 text-slate-600">{row.imgMatched}</td>
                <td className="py-2.5 pr-4 font-medium text-emerald-700">{row.matchRate}</td>
                <td className="py-2.5 pr-4 text-slate-600">{row.avgRanked}</td>
                <td className="py-2.5 text-slate-600">{row.interviewToMatch}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-6 rounded-lg border border-indigo-200 bg-indigo-50/50 p-5">
        <h3 className="text-sm font-semibold text-slate-900">How to Read This Data</h3>
        <ul className="mt-3 space-y-2">
          {[
            "Match Rate is the percentage of IMG applicants who matched in that specialty. Higher is more accessible.",
            "Interview:Match ratio tells you approximately how many interviews you need to match. A 3:1 ratio means you typically need 3 interviews to get 1 match.",
            "Avg Ranked is the number of programs the average matched IMG ranked. Rank more programs to improve your chances.",
            "These are aggregate numbers. Your individual outcomes depend on Step scores, clinical experience, LORs, research, and other factors.",
          ].map((point, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-indigo-500" />
              {point}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

function SoapSection() {
  return (
    <>
      <p className="text-sm text-slate-500">{SOAP_IMG_DATA.overview}</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {SOAP_IMG_DATA.stats.map((stat) => (
          <div key={stat.label} className="rounded-lg border border-slate-200 p-4">
            <div className="text-xl font-bold text-slate-900">{stat.value}</div>
            <div className="mt-0.5 text-xs font-medium text-slate-700">{stat.label}</div>
            <div className="mt-1 text-[11px] text-slate-500">{stat.detail}</div>
          </div>
        ))}
      </div>
      <div className="mt-6 rounded-lg border border-red-200 bg-red-50/50 p-5">
        <h3 className="text-sm font-semibold text-slate-900">SOAP Survival Tips for IMGs</h3>
        <ul className="mt-3 space-y-2">
          {[
            "Prepare SOAP materials BEFORE Match Week. Have a separate personal statement, updated CV, and all documents ready to go.",
            "SOAP moves extremely fast. Programs may call within hours of your application. Keep your phone charged, volume on, and be ready at all times.",
            "Internal Medicine and Preliminary positions have the most unfilled spots in SOAP. Do not limit yourself to one specialty.",
            "Round 1 has the most positions. Apply strategically to your strongest-fit programs first.",
            "Geographic flexibility dramatically improves your SOAP chances. Be willing to go anywhere.",
            "SOAP success rate for IMGs is only 15-20%. Do not rely on it as a backup plan. Focus your energy on the main Match.",
          ].map((tip, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-500" />
              {tip}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

function InterviewSection() {
  return (
    <>
      <p className="text-sm text-slate-500">
        The number of interview invitations you receive is one of the strongest predictors of match success.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {INTERVIEW_DATA.map((item) => (
          <div key={item.group} className="rounded-lg border border-slate-200 p-5">
            <div className="text-2xl font-bold text-slate-900">{item.interviews}</div>
            <div className="mt-1 text-sm font-medium text-slate-700">{item.group}</div>
            <p className="mt-2 text-xs text-slate-500">{item.detail}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-lg border border-teal-200 bg-teal-50/50 p-4">
        <h3 className="text-sm font-semibold text-slate-900">What This Means for You</h3>
        <p className="mt-2 text-xs text-slate-600">
          The gap between matched and unmatched IMGs is stark: matched IMGs receive 2-3 times more interview
          invitations. This means that anything you can do to increase your interview invitations — strong Step 2 CK
          score, US clinical experience, research publications, targeted applications to IMG-friendly programs —
          directly improves your match odds. Apply broadly (150-200+ programs) and attend every interview you receive.
        </p>
      </div>
    </>
  );
}

function YogSection() {
  return (
    <>
      <p className="text-sm text-slate-500">
        Year of graduation is an increasingly important factor. Many programs use YOG as a screening filter.
      </p>
      <div className="mt-6 space-y-3">
        {YOG_DATA.map((item) => (
          <div key={item.years} className="rounded-lg border border-slate-200 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-slate-900">{item.years}</h3>
              <span className="rounded-full bg-purple-50 px-3 py-1 text-xs font-bold text-purple-700">{item.matchRate}</span>
            </div>
            <p className="mt-2 text-xs text-slate-600">{item.detail}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-lg border border-purple-200 bg-purple-50/50 p-4">
        <h3 className="text-sm font-semibold text-slate-900">How to Offset a Graduation Gap</h3>
        <ul className="mt-2 space-y-1.5">
          {[
            "A US research fellowship fills the gap on your CV and provides current US-based activity and references.",
            "Publications in peer-reviewed journals show ongoing academic engagement regardless of when you graduated.",
            "US clinical experience (observerships, externships) within the last 1-2 years demonstrates current clinical readiness.",
            "Some programs do not have YOG filters — use FREIDA and community forums to identify these programs specifically.",
            "Consider specialties that are less strict about YOG, such as Family Medicine, Psychiatry, or Preventive Medicine.",
          ].map((point, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-purple-500" />
              {point}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

function TrendsSection() {
  return (
    <>
      <p className="text-sm text-slate-500">
        How IMG match outcomes have changed over the last 5 years.
      </p>
      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left">
              <th className="pb-3 pr-4 font-semibold text-slate-900">Year</th>
              <th className="pb-3 pr-4 font-semibold text-slate-900">IMG Applicants</th>
              <th className="pb-3 pr-4 font-semibold text-slate-900">IMGs Matched</th>
              <th className="pb-3 pr-4 font-semibold text-slate-900">Match Rate</th>
              <th className="pb-3 pr-4 font-semibold text-slate-900">Total Positions</th>
              <th className="pb-3 font-semibold text-slate-900">Key Changes</th>
            </tr>
          </thead>
          <tbody>
            {MATCH_TRENDS.map((row) => (
              <tr key={row.year} className="border-b border-slate-100">
                <td className="py-2.5 pr-4 font-medium text-slate-900">{row.year}</td>
                <td className="py-2.5 pr-4 text-slate-600">{row.imgApplicants}</td>
                <td className="py-2.5 pr-4 text-slate-600">{row.imgMatched}</td>
                <td className="py-2.5 pr-4 font-medium text-emerald-700">{row.matchRate}</td>
                <td className="py-2.5 pr-4 text-slate-600">{row.totalPositions}</td>
                <td className="py-2.5 text-xs text-slate-500">{row.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50/50 p-4">
        <h3 className="text-sm font-semibold text-slate-900">Trend Analysis</h3>
        <ul className="mt-2 space-y-1.5">
          {[
            "IMG match rates have improved slightly from ~56% in 2020 to ~61% in 2024, but the absolute number of unmatched IMGs remains high.",
            "The total number of residency positions has grown by ~4,000 over 5 years, but IMG applicants have grown by ~2,200 in the same period.",
            "Step 1 going pass/fail in 2022 shifted evaluation criteria toward Step 2 CK, clinical experience, and research — areas where IMGs can differentiate themselves.",
            "Virtual interviews (post-COVID) have reduced travel costs for IMGs but also increased the number of applications programs receive, intensifying competition.",
          ].map((point, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
              {point}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

function PathwaysSection() {
  return (
    <>
      <p className="text-sm text-slate-500">
        ECFMG certification is required for all IMGs before starting residency training. After the
        discontinuation of Step 2 CS, ECFMG introduced multiple pathways to certification.
      </p>
      <div className="mt-6 space-y-3">
        {ECFMG_PATHWAYS.map((pathway) => (
          <div key={pathway.name} className={`rounded-lg border p-5 ${pathway.status === "Expired" ? "border-slate-200 bg-slate-50" : "border-slate-200"}`}>
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="text-sm font-semibold text-slate-900">{pathway.name}: {pathway.title}</h3>
              <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                pathway.status === "Permanent" ? "bg-emerald-100 text-emerald-700" :
                pathway.status === "Expired" ? "bg-slate-200 text-slate-500" :
                "bg-blue-100 text-blue-700"
              }`}>
                {pathway.status}
              </span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-slate-600">{pathway.description}</p>
            <div className="mt-3">
              <h4 className="text-[11px] font-semibold text-slate-700">Requirements:</h4>
              <ul className="mt-1 space-y-1">
                {pathway.requirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-2 text-[11px] text-slate-500">
                    <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-blue-400" />
                    {req}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50/50 p-4">
        <h3 className="text-sm font-semibold text-slate-900">Important Notes on Pathways</h3>
        <ul className="mt-2 space-y-1.5">
          {[
            "Pathway 1 (USMLE) is the only permanent pathway and remains the most common route for most IMGs.",
            "Pathways 2-5 were introduced after Step 2 CS was discontinued and have been extended through 2027. Check ECFMG for the latest updates.",
            "You only need to qualify through ONE pathway. Most IMGs will use Pathway 1 by default since USMLE is already required.",
            "Start your ECFMG certification process early. Credential verification from your medical school can take several months.",
          ].map((note, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-500" />
              {note}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

function SpecialtiesSection() {
  return (
    <>
      <p className="text-sm text-slate-500">
        Based on match data, forum discussions, and program reports. Includes approximate IMG-filled positions, typical Step 2 CK scores, and trends.
      </p>
      <div className="mt-6 space-y-2">
        {SPECIALTY_DATA.map((s) => (
          <div key={s.specialty} className="rounded-lg border border-slate-100 px-4 py-3 transition-colors hover:bg-slate-50">
            <div className="flex flex-wrap items-start gap-4">
              <div className="w-full shrink-0 sm:w-40">
                <div className="text-sm font-medium text-slate-900">{s.specialty}</div>
                <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${s.color}`}>
                  {s.level}
                </span>
              </div>
              <div className="flex-1 text-xs text-slate-600">{s.description}</div>
            </div>
            <div className="mt-2 flex flex-wrap gap-3 text-[10px]">
              <span className="rounded bg-slate-100 px-2 py-0.5 font-medium text-slate-600">IMG Positions: {s.imgFilledPositions}</span>
              <span className="rounded bg-slate-100 px-2 py-0.5 font-medium text-slate-600">Typical Step 2 CK: {s.typicalStep2CK}</span>
              <span className="rounded bg-slate-100 px-2 py-0.5 font-medium text-slate-600">Trend: {s.trend}</span>
              <span className="rounded bg-slate-100 px-2 py-0.5 font-medium text-slate-600">IMG Programs: {s.imgPrograms}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function ProgramsSection() {
  return (
    <>
      <p className="text-sm text-slate-500">
        {IMG_FRIENDLY_PROGRAMS.length} programs known for accepting IMGs, compiled from FREIDA data, Reddit (r/IMGreddit, r/residency), SDN, and community reports
      </p>
      <div className="mt-1 flex items-center gap-1.5 text-[11px] text-amber-600">
        <AlertCircle className="h-3 w-3" />
        Data is community-sourced and should be independently verified. Programs change policies annually.
      </div>
      <div className="mt-6 space-y-4">
        {IMG_FRIENDLY_PROGRAMS.map((prog) => (
          <div key={prog.name} className="rounded-lg border border-slate-200 p-5 transition-colors hover:border-slate-300">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">{prog.name}</h3>
                <div className="mt-0.5 flex items-center gap-1.5 text-xs text-slate-500">
                  <MapPin className="h-3 w-3" />
                  {prog.location}
                </div>
              </div>
              <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                <Users className="h-3 w-3" />
                ~{prog.imgPercent} IMG
              </div>
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {prog.specialties.map((s) => (
                <span key={s} className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">{s}</span>
              ))}
            </div>
            <p className="mt-2 text-xs leading-relaxed text-slate-600">{prog.insight}</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              <div className="rounded-md border border-slate-100 bg-slate-50/50 px-3 py-2">
                <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  <Stethoscope className="h-3 w-3" />
                  Fellowship
                </div>
                <div className="mt-0.5 text-[11px] text-slate-700">{prog.fellowshipPotential}</div>
              </div>
              <div className="rounded-md border border-slate-100 bg-slate-50/50 px-3 py-2">
                <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  <DollarSign className="h-3 w-3" />
                  Salary
                </div>
                <div className="mt-0.5 text-[11px] text-slate-700">{prog.salary}</div>
              </div>
              <div className="rounded-md border border-slate-100 bg-slate-50/50 px-3 py-2">
                <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                  <MapPin className="h-3 w-3" />
                  Cost of Living
                </div>
                <div className="mt-0.5 text-[11px] text-slate-700">{prog.costOfLiving}</div>
              </div>
            </div>
            <p className="mt-2.5 text-[11px] italic text-slate-500">
              <Heart className="mr-1 inline h-3 w-3 text-slate-400" />
              {prog.lifestyle}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {prog.highlights.map((h) => (
                <span key={h} className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[10px] font-medium text-emerald-700">{h}</span>
              ))}
            </div>
            <div className="mt-2.5 text-[10px] text-slate-400">Sources: {prog.source}</div>
          </div>
        ))}
      </div>
    </>
  );
}

function StatesSection() {
  return (
    <>
      <p className="text-sm text-slate-500">
        Which states have the most IMG-friendly programs? Here is a breakdown of the top states for IMGs.
      </p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {STATE_IMG_DATA.map((s) => (
          <div key={s.state} className={`rounded-lg border p-4 ${s.highlight ? "border-emerald-200 bg-emerald-50/30" : "border-slate-200"}`}>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">{s.state}</h3>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.highlight ? "bg-emerald-100 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>
                {s.programs} programs
              </span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-slate-600">{s.description}</p>
          </div>
        ))}
      </div>
    </>
  );
}

function TimelineSection() {
  return (
    <>
      <p className="text-sm text-slate-500">
        Month-by-month guide to the residency application process for IMGs. Start early and stay organized.
      </p>
      <div className="mt-6 space-y-4">
        {APPLICATION_TIMELINE.map((phase) => (
          <div key={phase.months} className="rounded-lg border border-slate-200 p-5">
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
                {phase.icon}
              </span>
              <div>
                <h3 className="text-sm font-semibold text-slate-900">{phase.title}</h3>
                <div className="text-xs text-slate-500">{phase.months}</div>
              </div>
            </div>
            <ul className="mt-3 space-y-1.5 pl-11">
              {phase.tasks.map((task, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                  <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-indigo-400" />
                  {task}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </>
  );
}

function PrematchSection() {
  return (
    <>
      <p className="text-sm text-slate-500">
        What you should be doing before the Match to maximize your chances.
      </p>
      <div className="mt-6 space-y-3">
        {PRE_MATCH_RESOURCES.map((resource) => (
          <div key={resource.name} className="rounded-lg border border-slate-200 p-5">
            <h3 className="text-sm font-semibold text-slate-900">{resource.name}</h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-600">{resource.description}</p>
            {resource.actionLink && (
              <div className="mt-3">
                <Link href={resource.actionLink}>
                  <Button variant="outline" size="sm">
                    {resource.actionLabel} <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

function MistakesSection() {
  return (
    <>
      <p className="text-sm text-slate-500">
        Avoid these pitfalls. Every year, IMGs make the same preventable errors that cost them a match.
      </p>
      <div className="mt-6 space-y-3">
        {COMMON_MISTAKES.map((item) => (
          <div key={item.mistake} className="rounded-lg border border-red-100 bg-red-50/30 p-4">
            <h3 className="text-sm font-semibold text-red-800">{item.mistake}</h3>
            <p className="mt-1.5 text-xs text-slate-600">{item.fix}</p>
          </div>
        ))}
      </div>
    </>
  );
}

function VisasSection() {
  return (
    <>
      <p className="text-sm text-slate-500">
        Visa status is one of the most critical factors for IMGs. Understanding your options early is essential.
      </p>
      <div className="mt-6 space-y-3">
        {VISA_INFO.map((v) => (
          <div key={v.type} className="rounded-lg border border-slate-200 p-5">
            <h3 className="text-sm font-semibold text-slate-900">{v.type}</h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-600">{v.description}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50/50 p-4">
        <h3 className="text-sm font-semibold text-slate-900">Key Visa Tips for IMGs</h3>
        <ul className="mt-2 space-y-1.5">
          {[
            "Check each program's visa sponsorship policy on FREIDA BEFORE applying. Do not waste applications on programs that do not sponsor your visa type.",
            "J-1 is the default for most IMGs. If you have a green card or US citizenship, you are in a significantly stronger position.",
            "Conrad 30 J-1 waivers are competitive but represent a viable path to staying in the US after residency. Start planning early if this interests you.",
            "H-1B sponsorship is a significant advantage but fewer programs offer it. Having the option of either J-1 or H-1B makes you more attractive to programs.",
            "Consult an immigration attorney for your specific situation. Visa rules change, and individual circumstances vary.",
          ].map((tip, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
              <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-blue-500" />
              {tip}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

function ResourcesSection() {
  return (
    <>
      <p className="text-sm text-slate-500">
        Bookmark these. They are the essential resources for IMG residency planning.
      </p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {KEY_RESOURCES.map((r) => (
          <a key={r.name} href={r.url} target="_blank" rel="noopener noreferrer" className="group rounded-lg border border-slate-200 p-4 transition-colors hover:border-sky-200 hover:bg-sky-50/30">
            <h3 className="text-sm font-semibold text-slate-900 group-hover:text-sky-700">{r.name}</h3>
            <p className="mt-1 text-xs text-slate-500">{r.description}</p>
            <div className="mt-2 flex items-center gap-1 text-[10px] font-medium text-sky-600">
              Visit <ExternalLink className="h-3 w-3" />
            </div>
          </a>
        ))}
      </div>
    </>
  );
}

function InsightsSection() {
  return (
    <>
      <p className="text-sm text-slate-500">
        Key takeaways from r/IMGreddit, r/residency, r/Step1, SDN, and USMLE forums
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {FORUM_INSIGHTS.map((item) => (
          <div key={item.title} className="rounded-lg border border-slate-200 p-5">
            <h3 className="text-sm font-semibold text-slate-900">{item.title}</h3>
            <div className="mt-1 text-[10px] font-medium text-blue-600">{item.source}</div>
            <p className="mt-2 text-xs leading-relaxed text-slate-600">{item.insight}</p>
          </div>
        ))}
      </div>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  MAIN COMPONENT                                                     */
/* ------------------------------------------------------------------ */

export function FreidaContent() {
  const sections = [
    {
      id: "freida",
      label: "What is FREIDA?",
      icon: <BookOpen className="h-5 w-5 text-slate-600" />,
      content: <FreidaSection />,
    },
    {
      id: "nrmp",
      label: "NRMP Match Data",
      icon: <TrendingUp className="h-5 w-5 text-blue-600" />,
      content: <NrmpSection />,
    },
    {
      id: "charting",
      label: "Charting Outcomes by Specialty",
      icon: <BarChart3 className="h-5 w-5 text-indigo-600" />,
      content: <ChartingSection />,
    },
    {
      id: "soap",
      label: "SOAP Statistics",
      icon: <Activity className="h-5 w-5 text-red-600" />,
      content: <SoapSection />,
    },
    {
      id: "interviews",
      label: "Interview Data",
      icon: <Users className="h-5 w-5 text-teal-600" />,
      content: <InterviewSection />,
    },
    {
      id: "yog",
      label: "Year of Graduation (YOG) Impact",
      icon: <GraduationCap className="h-5 w-5 text-purple-600" />,
      content: <YogSection />,
    },
    {
      id: "trends",
      label: "Match Rate Trends (2020-2024)",
      icon: <TrendingUp className="h-5 w-5 text-emerald-600" />,
      content: <TrendsSection />,
    },
    {
      id: "pathways",
      label: "ECFMG Certification Pathways",
      icon: <Shield className="h-5 w-5 text-blue-600" />,
      content: <PathwaysSection />,
    },
    {
      id: "specialties",
      label: "Specialty Competitiveness",
      icon: <Award className="h-5 w-5 text-violet-600" />,
      content: <SpecialtiesSection />,
    },
    {
      id: "programs",
      label: "IMG-Friendly Programs",
      icon: <Users className="h-5 w-5 text-emerald-600" />,
      content: <ProgramsSection />,
    },
    {
      id: "states",
      label: "State-by-State Guide",
      icon: <MapPin className="h-5 w-5 text-orange-600" />,
      content: <StatesSection />,
    },
    {
      id: "timeline",
      label: "Application Timeline",
      icon: <Calendar className="h-5 w-5 text-indigo-600" />,
      content: <TimelineSection />,
    },
    {
      id: "prematch",
      label: "Pre-Match Resources",
      icon: <Clock className="h-5 w-5 text-amber-600" />,
      content: <PrematchSection />,
    },
    {
      id: "mistakes",
      label: "Common Mistakes",
      icon: <AlertCircle className="h-5 w-5 text-red-600" />,
      content: <MistakesSection />,
    },
    {
      id: "visas",
      label: "Visa Guide",
      icon: <Globe className="h-5 w-5 text-sky-600" />,
      content: <VisasSection />,
    },
    {
      id: "resources",
      label: "Key Resources",
      icon: <FileText className="h-5 w-5 text-slate-600" />,
      content: <ResourcesSection />,
    },
    {
      id: "insights",
      label: "Community Insights",
      icon: <Star className="h-5 w-5 text-amber-500" />,
      content: <InsightsSection />,
    },
  ];

  return (
    <div className="bg-white dark:bg-slate-950">
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 bg-slate-900 text-white">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 text-xs font-medium uppercase tracking-widest text-slate-400">
            <BookOpen className="h-4 w-4" />
            Residency Intelligence
          </div>
          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
            FREIDA & Residency Programs: The Definitive IMG Guide
          </h1>
          <p className="mt-2 max-w-3xl text-base text-slate-400">
            Everything you need to know about residency programs, match statistics, IMG-friendly programs,
            visa requirements, application timelines, and community-sourced insights. Compiled from FREIDA,
            NRMP data, Reddit, SDN, and USMLE forums.
          </p>
          <div className="mt-6 flex flex-wrap gap-2 text-xs text-slate-400">
            <span className="rounded-full border border-slate-700 px-3 py-1">NRMP Match Data</span>
            <span className="rounded-full border border-slate-700 px-3 py-1">Charting Outcomes</span>
            <span className="rounded-full border border-slate-700 px-3 py-1">30+ IMG Programs</span>
            <span className="rounded-full border border-slate-700 px-3 py-1">14 Specialties</span>
            <span className="rounded-full border border-slate-700 px-3 py-1">ECFMG Pathways</span>
            <span className="rounded-full border border-slate-700 px-3 py-1">SOAP Data</span>
            <span className="rounded-full border border-slate-700 px-3 py-1">YOG Analysis</span>
            <span className="rounded-full border border-slate-700 px-3 py-1">Match Trends</span>
            <span className="rounded-full border border-slate-700 px-3 py-1">Visa Guide</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <AccordionSections sections={sections} defaultOpenIndex={0} />

        {/* How FREIDA + USCEHub Work Together */}
        <section className="mb-12 mt-12">
          <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-6">
            <h2 className="text-lg font-semibold text-slate-900">How FREIDA + USCEHub Work Together</h2>
            <div className="mt-4 grid gap-4 text-sm text-slate-600 sm:grid-cols-3">
              <div className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">1</span>
                <div>
                  <span className="font-medium text-slate-900">Find Target Programs</span>
                  <p className="mt-0.5 text-xs">Use FREIDA to identify IMG-friendly residency programs in your specialty of interest.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">2</span>
                <div>
                  <span className="font-medium text-slate-900">Build Clinical Experience</span>
                  <p className="mt-0.5 text-xs">Use USCEHub to find observerships and externships near those programs or in the same specialty.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">3</span>
                <div>
                  <span className="font-medium text-slate-900">Apply Strategically</span>
                  <p className="mt-0.5 text-xs">Use your US clinical experience and connections to strengthen your residency application through ERAS.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTAs */}
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <a href="https://freida.ama-assn.org/" target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="lg">
              Visit FREIDA <ExternalLink className="ml-1.5 h-4 w-4" />
            </Button>
          </a>
          <Link href="/browse">
            <Button size="lg">
              Browse Opportunities <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Disclaimer */}
        <div className="mt-10 rounded-lg bg-slate-50 p-4 text-[11px] leading-relaxed text-slate-400">
          <strong className="text-slate-500">Disclaimer:</strong> The information on this page is compiled from publicly available
          sources including FREIDA (AMA), NRMP Match data, Charting Outcomes reports, Reddit communities (r/IMGreddit, r/residency, r/Step1),
          Student Doctor Network (SDN), and other medical education forums. IMG percentages, match statistics,
          and program details are approximate and may change year to year. ECFMG Pathway information is current as of the latest
          available updates but should be verified directly with ECFMG. Visa information is general guidance
          and should not be considered legal advice. Always verify current information directly with programs,
          ECFMG, and an immigration attorney. USCEHub is not affiliated with the AMA, NRMP, ECFMG,
          or any residency program listed.
        </div>
      </div>
    </div>
  );
}
