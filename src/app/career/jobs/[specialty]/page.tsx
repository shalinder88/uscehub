import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { VerifiedBadge } from "@/components/ui/verified-badge";
import {
  Briefcase,
  ExternalLink,
  DollarSign,
  MapPin,
  Building2,
  AlertTriangle,
  CheckCircle2,
  ArrowLeft,
  Search,
} from "lucide-react";

/* ─── Specialty Job Data ─── */

interface SpecialtyJobData {
  slug: string;
  name: string;
  salaryRange: string;
  salaryNote: string;
  waiverEligibility: string;
  demandLevel: "high" | "moderate" | "low";
  employers: { name: string; location: string; visa: string; salary?: string; source: string; url: string }[];
  searchLinks: { name: string; url: string }[];
  tips: string[];
}

const SPECIALTY_JOBS: Record<string, SpecialtyJobData> = {
  "pulmonary-critical-care": {
    slug: "pulmonary-critical-care",
    name: "Pulmonary & Critical Care",
    salaryRange: "$350K - $510K",
    salaryNote: "Pure pulm-only jobs are rare; most combine with CC. Nebraska listing at $510K + $100K sign-on via Thoracic.org.",
    waiverEligibility: "Conrad 30 (all states), ARC, DRA, SCRC. HHS only if classified as primary care (rare for Pulm/CC).",
    demandLevel: "high",
    employers: [
      { name: "Jackson Physician Search", location: "Nebraska", visa: "J-1 waiver", salary: "$510K + $100K sign-on", source: "Thoracic.org", url: "https://careers.thoracic.org/" },
      { name: "Thomas Jefferson University Hospital", location: "Philadelphia, PA", visa: "J-1", source: "PracticeLink", url: "https://jobs.practicelink.com/jobs/physician/accept-j1/" },
      { name: "White River Medical Center", location: "Batesville, AR", visa: "J-1/H-1B", source: "PracticeLink", url: "https://jobs.practicelink.com/jobs/987787/" },
      { name: "SIH (Southern Illinois Healthcare)", location: "Carbondale, IL", visa: "J-1/H-1B", source: "PracticeLink", url: "https://jobs.practicelink.com/jobs/506682/" },
      { name: "Marshfield Clinic Health System", location: "Weston, WI", visa: "J-1/H-1B (cap-exempt)", source: "Indeed", url: "https://www.indeed.com/q-pulmonary-critical-care-j1-waiver-jobs.html" },
      { name: "Benefis Health System", location: "Great Falls, MT", visa: "J-1/H-1B", source: "Indeed", url: "https://www.indeed.com/cmp/Benefis-Health-System/jobs" },
      { name: "Ascension Via Christi Hospital", location: "Manhattan, KS", visa: "J-1/H-1B", source: "PracticeMatch", url: "https://www.practicematch.com/physicians/jobs/?J1Visa=1" },
      { name: "Deaconess Health System", location: "Evansville, IN", visa: "J-1/H-1B", source: "PracticeMatch", url: "https://www.practicematch.com/physicians/jobs/?J1Visa=1" },
    ],
    searchLinks: [
      { name: "PracticeLink — Pulm/CC + J-1", url: "https://jobs.practicelink.com/jobs/physician/accept-j1/?specialty=pulmonary-disease-critical-care" },
      { name: "PracticeMatch — Pulm + J-1", url: "https://www.practicematch.com/physicians/jobs/pulmonary-disease/?J1Visa=1" },
      { name: "Indeed — Pulm/CC J-1 Waiver", url: "https://www.indeed.com/q-pulmonary-critical-care-j1-waiver-jobs.html" },
      { name: "ATS Career Center", url: "https://careers.thoracic.org/" },
    ],
    tips: [
      "Most positions combine pulmonary and critical care — pure pulm-only is rare",
      "Academic positions (Jefferson, Marshfield) often offer cap-exempt H-1B",
      "Night/weekend ICU coverage commands 15-25% salary premium",
      "Rural positions (AR, IL, MT) have higher salary + sign-on but fewer amenities",
      "Fellowship fellowship match rate: 98.8% (844 positions, 2026 AY) — very competitive",
    ],
  },
  "critical-care": {
    slug: "critical-care",
    name: "Critical Care / Intensivist",
    salaryRange: "$325K - $400K+",
    salaryNote: "Sound Physicians, USACS, Prime Healthcare actively recruiting. Nocturnist premium adds 15-25%.",
    waiverEligibility: "Conrad 30 (all states), ARC, DRA, SCRC. Not eligible for HHS (specialist).",
    demandLevel: "high",
    employers: [
      { name: "Southern Regional Medical Center", location: "Riverdale (Atlanta), GA", visa: "J-1 waiver", source: "Indeed", url: "https://www.indeed.com/viewjob?jk=92c72bec58b4ee8b" },
      { name: "USACS / Baptist Memorial Hospital", location: "Union City, TN", visa: "J-1/H-1B", source: "USACS", url: "https://www.usacs.com/j1-visa-careers" },
      { name: "USACS / Sid Peterson Hospital", location: "Kerrville, TX", visa: "J-1", source: "USACS", url: "https://www.usacs.com/j1-visa-careers" },
      { name: "Sound Physicians / Methodist Southlake", location: "Merrillville, IN", visa: "J-1/H-1B", source: "Sound Physicians", url: "https://careers.soundphysicians.com" },
      { name: "MDOpts client", location: "Western Michigan", visa: "J-1", source: "MDOpts", url: "https://www.mdopts.org/job-options.php" },
    ],
    searchLinks: [
      { name: "USACS J-1 Careers", url: "https://www.usacs.com/j1-visa-careers" },
      { name: "Sound Physicians Careers", url: "https://careers.soundphysicians.com" },
      { name: "Indeed — Intensivist J-1", url: "https://www.indeed.com/q-intensivist-j1-waiver-jobs.html" },
      { name: "PracticeMatch — Critical Care + J-1", url: "https://www.practicematch.com/physicians/jobs/critical-care-medicine/?J1Visa=1" },
    ],
    tips: [
      "Sound Physicians and USACS are the two largest employers of J-1 intensivists",
      "Nocturnist positions pay 15-25% more than daytime hospitalist/ICU",
      "Critical care via surgery pathway is separate from Pulm/CC — different fellowship",
      "USACS has J-1 locations across AL, AZ, CA, FL, GA, OH, PA, TX",
      "7-on/7-off or 14/14 block schedules are standard for ICU positions",
    ],
  },
  hospitalist: {
    slug: "hospitalist",
    name: "Hospitalist",
    salaryRange: "$325K - $400K",
    salaryNote: "Sound Physicians NC: $380-390K nocturnist. MI: $325-400K + $75K bonus. Nocturnists earn 15-25% more.",
    waiverEligibility: "Conrad 30 (all states), ARC, DRA, SCRC. HHS eligible if classified as general internal medicine.",
    demandLevel: "high",
    employers: [
      { name: "Sound Physicians / UNC Nash", location: "Rocky Mount, NC", visa: "J-1/H-1B", salary: "$380K-$390K (nocturnist)", source: "Sound Physicians", url: "https://careers.soundphysicians.com/job/nocturnist-physician-rocky-mount-north-carolina" },
      { name: "Sound Physicians", location: "Alpena, MI", visa: "J-1/H-1B", salary: "$325K-$400K + $75K bonus", source: "Sound Physicians", url: "https://careers.soundphysicians.com/job/hospitalist-or-nocturnist-alpena-michigan" },
      { name: "Sound Physicians", location: "Denison, TX", visa: "J-1/H-1B", source: "Sound Physicians", url: "https://careers.soundphysicians.com/job/denison/hospital-medicine-physician-nocturnist/48983/91407126576" },
      { name: "Sound Physicians / Mercy Medical Center", location: "Cedar Rapids, IA", visa: "J-1/H-1B", source: "Sound Physicians", url: "https://careers.soundphysicians.com/job/hospitalist-or-nocturnist-5" },
      { name: "PAGNY / NYC Health + Hospitals/Metropolitan", location: "New York, NY", visa: "J-1/H-1B", source: "Indeed", url: "https://www.indeed.com/q-hospitalist-j1-waiver-jobs.html" },
      { name: "Benefis Health System", location: "Great Falls, MT", visa: "J-1/H-1B", source: "PracticeLink", url: "https://jobs.practicelink.com/jobs/1518056/" },
      { name: "USACS", location: "Far Rockaway, NY", visa: "J-1", source: "USACS", url: "https://www.usacs.com/j1-visa-careers" },
    ],
    searchLinks: [
      { name: "Sound Physicians Careers", url: "https://careers.soundphysicians.com" },
      { name: "PracticeLink — Hospitalist + J-1", url: "https://jobs.practicelink.com/jobs/physician/accept-j1/?specialty=hospitalist" },
      { name: "PracticeMatch — Hospitalist + J-1", url: "https://www.practicematch.com/physicians/jobs/hospitalist/?J1Visa=1" },
      { name: "Indeed — Hospitalist J-1", url: "https://www.indeed.com/q-hospitalist-j1-waiver-jobs.html" },
    ],
    tips: [
      "Sound Physicians is the largest employer of J-1 hospitalists — check their careers page first",
      "Nocturnist positions pay $50-75K more than daytime hospitalist",
      "7-on/7-off block schedule is the most common",
      "NYC H+H system (PAGNY) offers multiple J-1 positions with union benefits",
      "Academic hospitalist positions at cap-exempt institutions don't need lottery",
    ],
  },
  gastroenterology: {
    slug: "gastroenterology",
    name: "Gastroenterology",
    salaryRange: "$500K - $700K+",
    salaryNote: "AdventHealth FL: base + bonus potential >$700K. Highest-paying J-1 waiver specialty alongside interventional cardiology.",
    waiverEligibility: "Conrad 30 only. NOT eligible for HHS (specialist). ARC, DRA, SCRC accept specialists.",
    demandLevel: "high",
    employers: [
      { name: "AdventHealth Medical Group", location: "Zephyrhills/Dade City, FL", visa: "J-1/H-1B", salary: "Base + bonus >$700K", source: "Indeed", url: "https://www.indeed.com/q-gastroenterology-j1-waiver-jobs.html" },
      { name: "Ochsner LSU Health Shreveport", location: "Shreveport, LA", visa: "J-1 (Conrad 30)", source: "Indeed", url: "https://www.indeed.com/q-gastroenterology-j1-waiver-jobs.html" },
      { name: "Loyola Medicine at MacNeal Hospital", location: "Maywood, IL", visa: "J-1", source: "Indeed", url: "https://www.indeed.com/q-gastroenterology-j1-waiver-jobs.html" },
      { name: "Corewell Health", location: "Royal Oak, MI", visa: "J-1/H-1B", source: "Indeed", url: "https://www.indeed.com/q-gastroenterology-j1-waiver-jobs.html" },
      { name: "Baystate Health", location: "Greenfield/Springfield, MA", visa: "J-1/H-1B", source: "Indeed", url: "https://www.indeed.com/q-gastroenterology-j1-waiver-jobs.html" },
      { name: "Marshfield Clinic Health System", location: "Various WI/MI", visa: "J-1/H-1B (cap-exempt)", source: "Indeed", url: "https://www.indeed.com/q-gastroenterology-j1-waiver-jobs.html" },
    ],
    searchLinks: [
      { name: "PracticeLink — GI + J-1", url: "https://jobs.practicelink.com/jobs/physician/accept-j1/?specialty=gastroenterology" },
      { name: "PracticeMatch — GI + J-1", url: "https://www.practicematch.com/physicians/jobs/gastroenterology/?J1Visa=1" },
      { name: "Indeed — GI J-1 Waiver", url: "https://www.indeed.com/q-gastroenterology-j1-waiver-jobs.html" },
      { name: "MDOpts", url: "https://www.mdopts.org/job-options.php" },
    ],
    tips: [
      "GI is one of the highest-paying J-1 waiver specialties — negotiate aggressively",
      "Fellowship match rate: 99.5% (759 positions) — extremely competitive",
      "Procedure-heavy practices (colonoscopy volume) drive the highest compensation",
      "Community hospitals in FL, LA, MI actively recruiting J-1 GI physicians",
      "Partnership track can add $200K+ to annual compensation within 2-3 years",
    ],
  },
  cardiology: {
    slug: "cardiology",
    name: "Cardiology (Non-Invasive & Interventional)",
    salaryRange: "$350K - $650K+",
    salaryNote: "Non-invasive: $350-520K. Interventional: $450-650K+. Fellowship 100% fill rate — most competitive.",
    waiverEligibility: "Conrad 30 (all states), ARC, DRA, SCRC. NOT eligible for HHS.",
    demandLevel: "high",
    employers: [
      { name: "Conemaugh Memorial Medical Center", location: "Johnstown, PA", visa: "J-1 (Conrad, ARC, DRA, HHS) + O-1", source: "PracticeLink", url: "https://www.practicelink.com/jobs/717238/" },
      { name: "Flowers Hospital", location: "Dothan, AL", visa: "J-1 (AL State-30)", source: "PracticeLink", url: "https://jobs.practicelink.com/jobs/1234791/" },
      { name: "HHS Oklahoma Heart Institute", location: "Tulsa, OK", visa: "J-1 (Conrad, ARC, DRA, HHS)", source: "PracticeLink", url: "https://jobs.practicelink.com/jobs/1290417/" },
      { name: "Tulane University / LCMC Healthcare", location: "New Orleans, LA", visa: "J-1/Green Card", source: "Indeed/LinkedIn", url: "https://www.indeed.com/q-cardiology-j1-waiver-jobs.html" },
      { name: "Community Health Systems", location: "Las Cruces, NM", visa: "J-1", source: "Indeed", url: "https://www.indeed.com/q-cardiology-j1-waiver-jobs.html" },
    ],
    searchLinks: [
      { name: "PracticeLink — Cardiology + J-1", url: "https://jobs.practicelink.com/jobs/physician/accept-j1/?specialty=cardiology" },
      { name: "PracticeMatch — Cardiology + J-1", url: "https://www.practicematch.com/physicians/jobs/cardiovascular-disease/?J1Visa=1" },
      { name: "Indeed — Cardiology J-1", url: "https://www.indeed.com/q-cardiology-j1-waiver-jobs.html" },
      { name: "ACC Career Center", url: "https://careers.acc.org/" },
    ],
    tips: [
      "Conemaugh PA accepts Conrad, ARC, DRA, HHS AND O-1 visas — most flexible employer found",
      "Fellowship match: 100% fill rate (1,347 positions) — the most competitive fellowship",
      "Interventional cardiology pays $100-150K more than non-invasive",
      "Academic positions (Tulane) may offer green card sponsorship directly",
      "Non-invasive can include echo, nuclear, and EP — clarify scope before signing",
    ],
  },
  psychiatry: {
    slug: "psychiatry",
    name: "Psychiatry",
    salaryRange: "$250K - $380K",
    salaryNote: "Qualifies for Mental Health HPSA. Multiple active employers across MT, CA, IL, MI, CT, OH.",
    waiverEligibility: "Conrad 30, ARC, DRA, SCRC, AND HHS (general psychiatry qualifies for HHS Supplement B).",
    demandLevel: "high",
    employers: [
      { name: "Benefis Health System", location: "Great Falls, MT", visa: "J-1/H-1B", source: "Indeed", url: "https://www.indeed.com/q-psychiatrist-j1-waiver-jobs.html" },
      { name: "Mindpath Health", location: "Bakersfield, CA", visa: "J-1 waiver", source: "Indeed", url: "https://www.indeed.com/q-psychiatrist-j1-waiver-jobs.html" },
      { name: "OSF HealthCare", location: "Ottawa, IL", visa: "J-1", source: "Indeed", url: "https://www.indeed.com/q-psychiatrist-j1-waiver-jobs.html" },
      { name: "State of Michigan", location: "Westland, MI", visa: "J-1", source: "Indeed", url: "https://www.indeed.com/q-psychiatrist-j1-waiver-jobs.html" },
      { name: "Generations Family Health Center", location: "Putnam, CT", visa: "J-1/H-1B (cap-exempt)", source: "Indeed", url: "https://www.indeed.com/q-psychiatrist-j1-waiver-jobs.html" },
      { name: "Corewell Health / Helen DeVos Children's Hospital", location: "Grand Rapids, MI", visa: "J-1/H-1B", source: "Indeed", url: "https://www.indeed.com/q-psychiatrist-j1-waiver-jobs.html" },
      { name: "US HealthCare Careers", location: "Ashtabula, OH", visa: "J-1/H-1B", source: "Indeed", url: "https://www.indeed.com/q-psychiatrist-j1-waiver-jobs.html" },
    ],
    searchLinks: [
      { name: "Indeed — Psychiatry J-1", url: "https://www.indeed.com/q-psychiatrist-j1-waiver-jobs.html" },
      { name: "PracticeLink — Psychiatry + J-1", url: "https://jobs.practicelink.com/jobs/physician/accept-j1/?specialty=psychiatry" },
      { name: "PracticeMatch — Psychiatry + J-1", url: "https://www.practicematch.com/physicians/jobs/psychiatry/?J1Visa=1" },
      { name: "Psychiatry.org J-1 Resources", url: "https://www.psychiatry.org/psychiatrists/international/international-medical-graduates-resources/j-1-visa-waivers-and-pathways-to-residency" },
    ],
    tips: [
      "Psychiatry qualifies for HHS Supplement B — unlimited slots, no Conrad cap",
      "Mental Health HPSA scores often higher than primary care = stronger waiver applications",
      "Child/adolescent psychiatry commands $30-50K premium over general",
      "Telepsychiatry is increasingly accepted for waiver positions — ask about hybrid models",
      "32+ J-1 psychiatry positions on Indeed as of March 2026",
    ],
  },
  "family-medicine": {
    slug: "family-medicine",
    name: "Family Medicine",
    salaryRange: "$260K - $355K",
    salaryNote: "KS: $290K + $65K recruitment. FL: $260K + $20K sign-on. 4-day week options available.",
    waiverEligibility: "ALL pathways: Conrad 30, HHS, ARC, DRA, SCRC, VA. Broadest eligibility of any specialty.",
    demandLevel: "high",
    employers: [
      { name: "Jackson Physician Search (not-for-profit system)", location: "Western Kansas", visa: "J-1", salary: "$290K + $65K recruitment", source: "Indeed", url: "https://www.indeed.com/q-family-medicine-j1-waiver-jobs.html" },
      { name: "Community Health Systems / Presbyterian Healthcare", location: "Roswell/Clovis/Carlsbad, NM", visa: "J-1/H-1B (cap-exempt)", source: "Indeed", url: "https://www.indeed.com/q-family-medicine-j1-waiver-jobs.html" },
      { name: "Benefis Health System", location: "Great Falls, MT", visa: "J-1/H-1B", source: "Indeed", url: "https://www.indeed.com/q-family-medicine-j1-waiver-jobs.html" },
      { name: "Generations Family Health Center", location: "Willimantic, CT", visa: "J-1/H-1B (cap-exempt)", source: "Indeed", url: "https://www.indeed.com/q-family-medicine-j1-waiver-jobs.html" },
      { name: "ACCESS Community Health Network", location: "Chicago, IL", visa: "J-1/H-1B", source: "Indeed", url: "https://www.indeed.com/q-family-medicine-j1-waiver-jobs.html" },
    ],
    searchLinks: [
      { name: "PracticeLink — FM + J-1", url: "https://jobs.practicelink.com/jobs/physician/accept-j1/?specialty=family-practice" },
      { name: "PracticeMatch — FM + J-1", url: "https://www.practicematch.com/physicians/jobs/family-practice/?J1Visa=1" },
      { name: "Indeed — FM J-1", url: "https://www.indeed.com/q-family-medicine-j1-waiver-jobs.html" },
      { name: "3RNET — Rural FM Jobs", url: "https://www.3rnet.org/Family-Medicine-Physician-Jobs" },
    ],
    tips: [
      "Family medicine has the broadest waiver eligibility — ALL 6 pathways accept FM",
      "HHS Supplement B offers unlimited slots for FM (no Conrad 30 cap)",
      "4-day work weeks increasingly common — negotiate upfront",
      "FQHCs often offer cap-exempt H-1B + NHSC loan repayment eligibility (after citizenship)",
      "Outpatient-only positions available — not all FM requires hospital coverage",
    ],
  },
  neurology: {
    slug: "neurology",
    name: "Neurology",
    salaryRange: "$350K - $402K",
    salaryNote: "Aurora WI: $402K guarantee + up to $200K sign-on/loan forgiveness. IN: $350K + RVU incentives.",
    waiverEligibility: "Conrad 30, ARC, DRA, SCRC. NOT HHS (specialist).",
    demandLevel: "moderate",
    employers: [
      { name: "Aurora Medical Center - Bay Area", location: "Green Bay, WI", visa: "J-1 waiver", salary: "$402K + up to $200K sign-on", source: "PracticeMatch", url: "https://www.practicematch.com/physicians/job-details.cfm/1056292" },
      { name: "Employer (via recruiter)", location: "Jasper, IN", visa: "J-1", salary: "$350K + RVU/quality incentives", source: "Indeed", url: "https://www.indeed.com/q-neurology-j1-waiver-jobs.html" },
      { name: "Benefis Health System", location: "Great Falls, MT", visa: "J-1/H-1B", source: "ZipRecruiter", url: "https://www.ziprecruiter.com/jobs/neurology-j1-waiver" },
      { name: "MDOpts client (acute care hospital)", location: "Midwest", visa: "J-1/H-1B", source: "MDOpts", url: "https://www.mdopts.org/job-options.php" },
    ],
    searchLinks: [
      { name: "PracticeMatch — Neurology + J-1", url: "https://www.practicematch.com/physicians/jobs/neurology/?J1Visa=1" },
      { name: "PracticeLink — Neurology + J-1", url: "https://jobs.practicelink.com/jobs/physician/accept-j1/?specialty=neurology" },
      { name: "Indeed — Neurology J-1", url: "https://www.indeed.com/q-neurology-j1-waiver-jobs.html" },
    ],
    tips: [
      "Aurora WI has one of the most generous sign-on packages found: $200K combined",
      "Stroke call requirements vary widely — clarify before signing",
      "Neurocritical care fellowship adds ICU component and higher salary",
      "Academic neurology at cap-exempt institutions avoids H-1B lottery",
      "Teleneurology positions emerging for waiver — confirm HPSA compliance",
    ],
  },
  nephrology: {
    slug: "nephrology",
    name: "Nephrology",
    salaryRange: "$175K - $350K",
    salaryNote: "MD: $175K starting with partnership after 2 years. Lower initial salary but partnership track is common. 73% fellowship fill rate = less competition.",
    waiverEligibility: "Conrad 30, ARC, DRA, SCRC. NOT HHS (specialist). Nephrology has unfilled fellowship positions — good sign for waiver applicants.",
    demandLevel: "moderate",
    employers: [
      { name: "MDOpts client (private group)", location: "Upstate New York", visa: "J-1", salary: "Competitive + sign-on", source: "MDOpts", url: "https://www.mdopts.org/job-options.php" },
      { name: "MDOpts client (hospital)", location: "Rural New York", visa: "J-1", source: "MDOpts", url: "https://www.mdopts.org/job-options.php" },
      { name: "MDOpts client (partnership track)", location: "Maryland (40mi from Annapolis)", visa: "J-1/H-1B", salary: "$175K starting", source: "MDOpts", url: "https://www.mdopts.org/job-options.php" },
      { name: "Private practice (33 physicians)", location: "Mobile, AL", visa: "J-1/H-1B", source: "Indeed", url: "https://www.indeed.com/q-nephrology-j1-waiver-jobs.html" },
      { name: "Physician-led group", location: "Springfield, MO", visa: "J-1/H-1B", source: "Indeed", url: "https://www.indeed.com/q-nephrology-j1-waiver-jobs.html" },
      { name: "Marshfield Clinic Health System", location: "Various WI", visa: "J-1/H-1B (cap-exempt)", source: "Indeed", url: "https://www.indeed.com/q-nephrology-j1-waiver-jobs.html" },
    ],
    searchLinks: [
      { name: "PracticeMatch — Nephrology + J-1", url: "https://www.practicematch.com/physicians/jobs/nephrology/?J1Visa=1" },
      { name: "PracticeLink — Nephrology + J-1", url: "https://jobs.practicelink.com/jobs/physician/accept-j1/?specialty=nephrology" },
      { name: "Indeed — Nephrology J-1", url: "https://www.indeed.com/q-nephrology-j1-waiver-jobs.html" },
      { name: "MDOpts", url: "https://www.mdopts.org/job-options.php" },
    ],
    tips: [
      "Nephrology has 73% fellowship fill rate — less competitive, more positions available",
      "Partnership track is standard — $175K starting can become $400K+ within 3-5 years",
      "Dialysis unit call requirements vary wildly — get specifics in the contract",
      "36.2% of nephrology fellows are non-US IMGs — most IMG-friendly subspecialty",
      "Home dialysis growth creating new positions — ask about home program responsibilities",
    ],
  },
};

const ALL_SPECIALTIES = Object.values(SPECIALTY_JOBS);

export function generateStaticParams() {
  return ALL_SPECIALTIES.map((s) => ({ specialty: s.slug }));
}

export function generateMetadata({ params }: { params: { specialty: string } }): Metadata {
  const data = SPECIALTY_JOBS[params.specialty];
  if (!data) return { title: "Specialty Not Found" };
  return {
    title: `J-1 Waiver ${data.name} Jobs — Salary, Employers, Search — USCEHub`,
    description: `Find J-1 waiver ${data.name} physician positions. Salary range: ${data.salaryRange}. Active employers, verified job sources, and tips for waiver applicants.`,
    alternates: { canonical: `https://uscehub.com/career/jobs/${data.slug}` },
  };
}

export default function SpecialtyJobPage({ params }: { params: { specialty: string } }) {
  const data = SPECIALTY_JOBS[params.specialty];
  if (!data) notFound();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Back */}
      <Link href="/career/jobs" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-accent mb-6">
        <ArrowLeft className="h-4 w-4" />
        All J-1 Waiver Jobs
      </Link>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="rounded-lg bg-accent/10 p-2.5">
            <Briefcase className="h-6 w-6 text-accent" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
              {data.name} — J-1 Waiver Jobs
            </h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-success font-mono font-bold text-sm">{data.salaryRange}</span>
              <span className={`text-xs px-2 py-0.5 rounded-full ${data.demandLevel === "high" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}>
                {data.demandLevel === "high" ? "High Demand" : "Moderate Demand"}
              </span>
            </div>
          </div>
        </div>
        <p className="text-sm text-muted">{data.salaryNote}</p>
        <div className="mt-3">
          <VerifiedBadge date="March 2026" sources={["PracticeLink", "PracticeMatch", "MDOpts", "Indeed"]} />
        </div>
      </div>

      {/* Waiver Eligibility */}
      <div className="rounded-xl border border-border bg-surface-alt p-4 mb-8 flex gap-3">
        <CheckCircle2 className="h-5 w-5 text-success shrink-0 mt-0.5" />
        <div className="text-sm text-muted">
          <strong className="text-foreground">Waiver Eligibility:</strong> {data.waiverEligibility}
        </div>
      </div>

      {/* Active Employers */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
          <Building2 className="h-5 w-5 text-accent" />
          Active Employers ({data.employers.length} verified)
        </h2>
        <div className="space-y-3">
          {data.employers.map((emp, i) => (
            <div key={i} className="rounded-lg border border-border bg-surface p-4 flex items-start justify-between gap-4">
              <div>
                <h3 className="text-sm font-semibold text-foreground">{emp.name}</h3>
                <div className="flex items-center gap-2 mt-1 text-xs text-muted">
                  <MapPin className="h-3 w-3" />
                  <span>{emp.location}</span>
                  <span className="text-accent">·</span>
                  <span>{emp.visa}</span>
                </div>
                {emp.salary && (
                  <div className="mt-1 text-xs text-success font-mono font-semibold">{emp.salary}</div>
                )}
              </div>
              <a href={emp.url} target="_blank" rel="noopener noreferrer" className="text-xs text-accent hover:underline shrink-0 flex items-center gap-1">
                {emp.source} <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* Search Links */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
          <Search className="h-5 w-5 text-accent" />
          Search Live Job Boards
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {data.searchLinks.map((link) => (
            <a key={link.name} href={link.url} target="_blank" rel="noopener noreferrer"
              className="rounded-lg border border-border bg-surface p-4 hover:border-accent/50 transition-colors flex items-center justify-between group"
            >
              <span className="text-sm text-foreground group-hover:text-accent">{link.name}</span>
              <ExternalLink className="h-4 w-4 text-muted group-hover:text-accent" />
            </a>
          ))}
        </div>
      </section>

      {/* Tips */}
      <section className="mb-10">
        <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-warning" />
          What to Know
        </h2>
        <div className="space-y-2">
          {data.tips.map((tip, i) => (
            <div key={i} className="flex items-start gap-2 text-sm text-muted">
              <CheckCircle2 className="h-4 w-4 text-accent shrink-0 mt-0.5" />
              <span>{tip}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Other Specialties */}
      <section>
        <h2 className="text-lg font-bold text-foreground mb-4">Other Specialties</h2>
        <div className="flex flex-wrap gap-2">
          {ALL_SPECIALTIES.filter((s) => s.slug !== data.slug).map((s) => (
            <Link key={s.slug} href={`/career/jobs/${s.slug}`}
              className="rounded-full border border-border bg-surface px-3 py-1.5 text-xs text-muted hover:text-accent hover:border-accent/50 transition-colors"
            >
              {s.name}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
