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
      { name: "Thomas Jefferson University Hospital", location: "Philadelphia, PA", visa: "J-1", source: "Employer Career Page", url: "https://www.dol.gov/agencies/eta/foreign-labor/performance" },
      { name: "White River Medical Center", location: "Batesville, AR", visa: "J-1/H-1B", source: "Employer Career Page", url: "https://www.dol.gov/agencies/eta/foreign-labor/performance" },
      { name: "SIH (Southern Illinois Healthcare)", location: "Carbondale, IL", visa: "J-1/H-1B", source: "Employer Career Page", url: "https://www.dol.gov/agencies/eta/foreign-labor/performance" },
      { name: "Marshfield Clinic Health System", location: "Weston, WI", visa: "J-1/H-1B (cap-exempt)", source: "Employer Career Page", url: "https://www.dol.gov/agencies/eta/foreign-labor/performance" },
      { name: "Benefis Health System", location: "Great Falls, MT", visa: "J-1/H-1B", source: "Employer Career Page", url: "https://www.dol.gov/agencies/eta/foreign-labor/performance" },
      { name: "Ascension Via Christi Hospital", location: "Manhattan, KS", visa: "J-1/H-1B", source: "Employer Career Page", url: "https://www.dol.gov/agencies/eta/foreign-labor/performance" },
      { name: "Deaconess Health System", location: "Evansville, IN", visa: "J-1/H-1B", source: "Employer Career Page", url: "https://www.dol.gov/agencies/eta/foreign-labor/performance" },
    ],
    searchLinks: [
      
      
      
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
      { name: "Southern Regional Medical Center", location: "Riverdale (Atlanta), GA", visa: "J-1 waiver", source: "Employer Career Page", url: "https://www.dol.gov/agencies/eta/foreign-labor/performance" },
      { name: "USACS / Baptist Memorial Hospital", location: "Union City, TN", visa: "J-1/H-1B", source: "USACS", url: "https://www.usacs.com/j1-visa-careers" },
      { name: "USACS / Sid Peterson Hospital", location: "Kerrville, TX", visa: "J-1", source: "USACS", url: "https://www.usacs.com/j1-visa-careers" },
      { name: "Sound Physicians / Methodist Southlake", location: "Merrillville, IN", visa: "J-1/H-1B", source: "Sound Physicians", url: "https://careers.soundphysicians.com" },
      { name: "MDOpts client", location: "Western Michigan", visa: "J-1", source: "MDOpts", url: "https://www.mdopts.org/job-options.php" },
    ],
    searchLinks: [
      { name: "USACS J-1 Careers", url: "https://www.usacs.com/j1-visa-careers" },
      { name: "Sound Physicians Careers", url: "https://careers.soundphysicians.com" },
      
      
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
      { name: "PAGNY / NYC Health + Hospitals/Metropolitan", location: "New York, NY", visa: "J-1/H-1B", source: "Employer Career Page", url: "https://www.dol.gov/agencies/eta/foreign-labor/performance" },
      { name: "Benefis Health System", location: "Great Falls, MT", visa: "J-1/H-1B", source: "Employer Career Page", url: "https://www.dol.gov/agencies/eta/foreign-labor/performance" },
      { name: "USACS", location: "Far Rockaway, NY", visa: "J-1", source: "USACS", url: "https://www.usacs.com/j1-visa-careers" },
    ],
    searchLinks: [
      { name: "Sound Physicians Careers", url: "https://careers.soundphysicians.com" },
      
      
      
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
      { name: "AdventHealth Medical Group", location: "Zephyrhills/Dade City, FL", visa: "J-1/H-1B", salary: "Base + bonus >$700K", source: "Employer Career Page", url: "https://www.dol.gov/agencies/eta/foreign-labor/performance" },
      { name: "Ochsner LSU Health Shreveport", location: "Shreveport, LA", visa: "J-1 (Conrad 30)", source: "Employer Career Page", url: "https://www.dol.gov/agencies/eta/foreign-labor/performance" },
      { name: "Loyola Medicine at MacNeal Hospital", location: "Maywood, IL", visa: "J-1", source: "Employer Career Page", url: "https://www.dol.gov/agencies/eta/foreign-labor/performance" },
      { name: "Corewell Health", location: "Royal Oak, MI", visa: "J-1/H-1B", source: "Employer Career Page", url: "https://www.dol.gov/agencies/eta/foreign-labor/performance" },
      { name: "Baystate Health", location: "Greenfield/Springfield, MA", visa: "J-1/H-1B", source: "Employer Career Page", url: "https://www.dol.gov/agencies/eta/foreign-labor/performance" },
      { name: "Marshfield Clinic Health System", location: "Various WI/MI", visa: "J-1/H-1B (cap-exempt)", source: "Employer Career Page", url: "https://www.dol.gov/agencies/eta/foreign-labor/performance" },
    ],
    searchLinks: [
      
      
      
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
      { name: "Conemaugh Memorial Medical Center", location: "Johnstown, PA", visa: "J-1 (Conrad, ARC, DRA, HHS) + O-1", source: "Employer Career Page", url: "https://www.conemaugh.org/careers" },
      { name: "Flowers Hospital", location: "Dothan, AL", visa: "J-1 (AL State-30)", source: "Employer Career Page", url: "https://www.dol.gov/agencies/eta/foreign-labor/performance" },
      { name: "HHS Oklahoma Heart Institute", location: "Tulsa, OK", visa: "J-1 (Conrad, ARC, DRA, HHS)", source: "Employer Career Page", url: "https://www.dol.gov/agencies/eta/foreign-labor/performance" },
      { name: "Tulane University / LCMC Healthcare", location: "New Orleans, LA", visa: "J-1/Green Card", source: "Indeed/LinkedIn", url: "https://www.dol.gov/agencies/eta/foreign-labor/performance" },
      { name: "Community Health Systems", location: "Las Cruces, NM", visa: "J-1", source: "Employer Career Page", url: "https://www.dol.gov/agencies/eta/foreign-labor/performance" },
    ],
    searchLinks: [
      
      
      
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
      { name: "Benefis Health System", location: "Great Falls, MT", visa: "J-1/H-1B", source: "Employer Career Page", url: "https://www.dol.gov/agencies/eta/foreign-labor/performance" },
      { name: "Mindpath Health", location: "Bakersfield, CA", visa: "J-1 waiver", source: "Employer Career Page", url: "https://www.dol.gov/agencies/eta/foreign-labor/performance" },
      { name: "OSF HealthCare", location: "Ottawa, IL", visa: "J-1", source: "Employer Career Page", url: "https://www.dol.gov/agencies/eta/foreign-labor/performance" },
      { name: "State of Michigan", location: "Westland, MI", visa: "J-1", source: "Employer Career Page", url: "https://www.dol.gov/agencies/eta/foreign-labor/performance" },
      { name: "Generations Family Health Center", location: "Putnam, CT", visa: "J-1/H-1B (cap-exempt)", source: "Employer Career Page", url: "https://www.dol.gov/agencies/eta/foreign-labor/performance" },
      { name: "Corewell Health / Helen DeVos Children's Hospital", location: "Grand Rapids, MI", visa: "J-1/H-1B", source: "Employer Career Page", url: "https://www.dol.gov/agencies/eta/foreign-labor/performance" },
      { name: "US HealthCare Careers", location: "Ashtabula, OH", visa: "J-1/H-1B", source: "Employer Career Page", url: "https://www.dol.gov/agencies/eta/foreign-labor/performance" },
    ],
    searchLinks: [
      
      
      
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
      { name: "Jackson Physician Search (not-for-profit system)", location: "Western Kansas", visa: "J-1", salary: "$290K + $65K recruitment", source: "Employer Career Page", url: "https://www.dol.gov/agencies/eta/foreign-labor/performance" },
      { name: "Community Health Systems / Presbyterian Healthcare", location: "Roswell/Clovis/Carlsbad, NM", visa: "J-1/H-1B (cap-exempt)", source: "Employer Career Page", url: "https://www.dol.gov/agencies/eta/foreign-labor/performance" },
      { name: "Benefis Health System", location: "Great Falls, MT", visa: "J-1/H-1B", source: "Employer Career Page", url: "https://www.dol.gov/agencies/eta/foreign-labor/performance" },
      { name: "Generations Family Health Center", location: "Willimantic, CT", visa: "J-1/H-1B (cap-exempt)", source: "Employer Career Page", url: "https://www.dol.gov/agencies/eta/foreign-labor/performance" },
      { name: "ACCESS Community Health Network", location: "Chicago, IL", visa: "J-1/H-1B", source: "Employer Career Page", url: "https://www.dol.gov/agencies/eta/foreign-labor/performance" },
    ],
    searchLinks: [
      
      
      
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
      { name: "Aurora Medical Center - Bay Area", location: "Green Bay, WI", visa: "J-1 waiver", salary: "$402K + up to $200K sign-on", source: "Employer Career Page", url: "https://www.dol.gov/agencies/eta/foreign-labor/performance" },
      { name: "Employer (via recruiter)", location: "Jasper, IN", visa: "J-1", salary: "$350K + RVU/quality incentives", source: "Employer Career Page", url: "https://www.dol.gov/agencies/eta/foreign-labor/performance" },
      { name: "Benefis Health System", location: "Great Falls, MT", visa: "J-1/H-1B", source: "ZipRecruiter", url: "https://www.ziprecruiter.com/jobs/neurology-j1-waiver" },
      { name: "MDOpts client (acute care hospital)", location: "Midwest", visa: "J-1/H-1B", source: "MDOpts", url: "https://www.mdopts.org/job-options.php" },
    ],
    searchLinks: [
      
      
      
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
      { name: "Private practice (33 physicians)", location: "Mobile, AL", visa: "J-1/H-1B", source: "Employer Career Page", url: "https://www.dol.gov/agencies/eta/foreign-labor/performance" },
      { name: "Physician-led group", location: "Springfield, MO", visa: "J-1/H-1B", source: "Employer Career Page", url: "https://www.dol.gov/agencies/eta/foreign-labor/performance" },
      { name: "Marshfield Clinic Health System", location: "Various WI", visa: "J-1/H-1B (cap-exempt)", source: "Employer Career Page", url: "https://www.dol.gov/agencies/eta/foreign-labor/performance" },
    ],
    searchLinks: [
      
      
      
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
  "infectious-disease": {
    slug: "infectious-disease",
    name: "Infectious Disease",
    salaryRange: "$250K - $325K",
    salaryNote: "Gulf Coast FL: $325K base + annual increase + production bonus. ID has 60.9% fellowship fill rate — lowest among major IM subspecialties, meaning more positions available.",
    waiverEligibility: "Conrad 30, ARC, DRA, SCRC. NOT HHS (specialist). HIV-focused positions may qualify for Mental Health HPSA in some states.",
    demandLevel: "moderate",
    employers: [
      { name: "Gulf Coast Infectious Diseases", location: "Pensacola, FL", visa: "J-1 waiver", salary: "$325K base + production", source: "Employer Career Page", url: "https://www.dol.gov/agencies/eta/foreign-labor/performance" },
      { name: "DFW Health Care Associates", location: "Dallas County, TX", visa: "J-1/H-1B", source: "Employer Career Page", url: "https://www.dol.gov/agencies/eta/foreign-labor/performance" },
      { name: "Central Ohio Primary Care Physicians", location: "Westerville, OH", visa: "J-1/H-1B", source: "Employer Career Page", url: "https://www.dol.gov/agencies/eta/foreign-labor/performance" },
      { name: "Essen Health Care", location: "Bronx, NY", visa: "J-1 (Conrad 30)", source: "Employer Career Page", url: "https://www.dol.gov/agencies/eta/foreign-labor/performance" },
      { name: "Ryan Health", location: "New York, NY", visa: "J-1/H-1B", source: "Employer Career Page", url: "https://www.dol.gov/agencies/eta/foreign-labor/performance" },
      { name: "Pennsylvania ID Group (via MDOpts)", location: "Pennsylvania", visa: "J-1/H-1B", source: "MDOpts", url: "https://www.mdopts.org/job-options.php" },
    ],
    searchLinks: [
      
      
      { name: "MDOpts", url: "https://www.mdopts.org/job-options.php" },
      { name: "IDSA Career Center", url: "https://careers.idsociety.org/" },
    ],
    tips: [
      "ID has the lowest fellowship fill rate (60.9%) — least competitive major IM subspecialty",
      "HIV/AIDS focused positions available in urban areas (Ryan Health NYC, Massachusetts)",
      "Antimicrobial stewardship roles emerging as an alternative to traditional ID",
      "Partnership track with early buy-in available at some private groups",
      "Lower salary than other subspecialties but better work-life balance and less call",
    ],
  },
  radiology: {
    slug: "radiology",
    name: "Radiology (Diagnostic & Interventional)",
    salaryRange: "$437K - $575K+",
    salaryNote: "IR positions at $575K minimum found. Mammography: $437-463K. Diagnostic radiology waiver positions are uncommon but exist.",
    waiverEligibility: "Conrad 30 only. NOT eligible for HHS (specialist). ARC, DRA, SCRC accept specialists.",
    demandLevel: "low",
    employers: [
      { name: "Baptist Memorial Hospital Golden Triangle", location: "Columbus, MS", visa: "J-1 waiver", source: "Employer Career Page", url: "https://www.dol.gov/agencies/eta/foreign-labor/performance" },
      { name: "Spectrum Healthcare Partners", location: "Bangor, ME", visa: "J-1 (Conrad 30)/H-1B", source: "Employer Career Page", url: "https://www.dol.gov/agencies/eta/foreign-labor/performance" },
      { name: "Corewell Health", location: "Royal Oak, MI", visa: "J-1 waiver", source: "Corewell Careers", url: "https://careers.corewellhealth.org/" },
      { name: "CU Dept of Radiology", location: "Colorado", visa: "J-1 encouraged", source: "Employer Career Page", url: "https://www.dol.gov/agencies/eta/foreign-labor/performance" },
    ],
    searchLinks: [
      
      
      { name: "ACR Career Center", url: "https://careers.acr.org/" },
    ],
    tips: [
      "IR positions are the highest-paying waiver jobs found ($575K+ minimum)",
      "Radiology waiver positions are rare — most Conrad slots go to primary care",
      "Maine has a permissive waiver process and active radiology recruitment",
      "Teleradiology positions are emerging but must confirm HPSA compliance",
      "Academic radiology at cap-exempt institutions avoids the H-1B lottery entirely",
    ],
  },
  anesthesiology: {
    slug: "anesthesiology",
    name: "Anesthesiology",
    salaryRange: "$300K - $400K+",
    salaryNote: "344 historical J-1 anesthesiology positions tracked across 168 hospitals (j-1waiver.com). Partnership track available at some groups.",
    waiverEligibility: "Conrad 30, ARC, DRA, SCRC. NOT eligible for HHS (specialist).",
    demandLevel: "moderate",
    employers: [
      { name: "Marshfield Clinic Health System", location: "Eau Claire & Marshfield, WI", visa: "J-1/H-1B (cap-exempt)", source: "Employer Career Page", url: "https://www.dol.gov/agencies/eta/foreign-labor/performance" },
      { name: "Integrated Anesthesia Associates (IAA)", location: "Connecticut", visa: "J-1/H-1B/NIW", source: "IAA Partners", url: "https://iaapartners.com/whereyouworkmatters/" },
      { name: "CHI Health St. Francis", location: "Nebraska", visa: "J-1/H-1B", source: "ZipRecruiter", url: "https://www.ziprecruiter.com/Jobs/Anesthesiology-J1-Waiver" },
    ],
    searchLinks: [
      
      
      { name: "j-1waiver.com — Historical Data", url: "https://j-1waiver.com/" },
      { name: "Gaswork (Anesthesia Jobs)", url: "https://www.gaswork.com/" },
    ],
    tips: [
      "344 historical J-1 anesthesiology positions tracked at j-1waiver.com — check for your target area",
      "IAA in Connecticut offers partnership track with group ownership — rare for waiver positions",
      "Cap-exempt academic positions (Marshfield) avoid the H-1B lottery",
      "Cardiac anesthesiology and pain fellowship add-ons increase marketability",
      "CRNA supervision requirements vary by state — impacts your daily workflow significantly",
    ],
  },
  "ob-gyn": {
    slug: "ob-gyn",
    name: "OB/GYN",
    salaryRange: "$250K - $350K",
    salaryNote: "OB/GYN qualifies for HHS Supplement B (unlimited slots). Rural positions often include shared call arrangements.",
    waiverEligibility: "ALL pathways: Conrad 30, HHS (primary care classification), ARC, DRA, SCRC, VA. Second broadest eligibility after FM.",
    demandLevel: "high",
    employers: [
      { name: "Unified Women's Healthcare", location: "Las Vegas, NV", visa: "J-1 waiver", source: "Employer Career Page", url: "https://www.dol.gov/agencies/eta/foreign-labor/performance" },
      { name: "Ochsner LSU Health Shreveport", location: "Shreveport, LA", visa: "J-1 (academic)", source: "Employer Career Page", url: "https://www.dol.gov/agencies/eta/foreign-labor/performance" },
      { name: "Marshfield Clinic Health System", location: "Marshfield, WI", visa: "J-1/H-1B", source: "Employer Career Page", url: "https://www.dol.gov/agencies/eta/foreign-labor/performance" },
      { name: "Providence", location: "Seaside, OR", visa: "J-1 (new grads welcome)", source: "Employer Career Page", url: "https://www.dol.gov/agencies/eta/foreign-labor/performance" },
    ],
    searchLinks: [
      
      
      { name: "MDOpts", url: "https://www.mdopts.org/job-options.php" },
      { name: "ACOG Career Connection", url: "https://careers.acog.org/" },
    ],
    tips: [
      "OB/GYN qualifies for HHS Supplement B — unlimited slots, no Conrad cap",
      "One of only 5 specialties eligible for ALL waiver pathways",
      "NHSC S2S Maternity Care Supplement adds up to $40K extra (total $160K) for OB providers",
      "Shared call arrangements (1:3 or 1:4) are standard — negotiate before signing",
      "Rural OB is in extreme demand — strong negotiating position",
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
