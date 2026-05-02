/**
 * P96-4B — assisted official-source relink research.
 *
 * Reads the prioritized batch_001 input and a hand-curated decisions
 * map (built from WebSearch + WebFetch evidence in the conversation
 * transcript), then emits:
 *
 * - p96_4b_relink_candidates.csv     (one row per researched listing)
 * - p96_4b_relink_research_log.csv   (per-search log)
 * - p96_4b_no_better_source_found.csv (subset where no good URL surfaced)
 *
 * Also patches docs/platform-v2/local/review-workbench/review-data.json
 * so each researched item carries candidateSourceUrl + sourceQuality +
 * confidence + replacementRecommendation + evidenceText fields the
 * workbench can render.
 *
 * Pure file I/O. No DB connection. No mutation of listings.
 */

import { readFile, writeFile } from "node:fs/promises";

interface Decision {
  itemId: string;
  candidateSourceUrl: string;
  candidateApplicationUrl: string;
  sourceQuality:
    | "EXACT_OFFICIAL_PROGRAM_PAGE"
    | "OFFICIAL_APPLICATION_PAGE"
    | "OFFICIAL_POLICY_PAGE"
    | "OFFICIAL_DEPARTMENT_PAGE_WITH_USCE_TEXT"
    | "OFFICIAL_GENERIC_PAGE"
    | "THIRD_PARTY_LEAD_ONLY"
    | "WRONG_PAGE"
    | "DEAD_OR_BLOCKED"
    | "LOGIN_REQUIRED"
    | "NO_BETTER_SOURCE_FOUND";
  targetFitAfterResearch:
    | "TARGET_USCE_MATCH"
    | "MAYBE_TARGET_MANUAL_REVIEW"
    | "NON_TARGET_SPECIALIST_ONLY"
    | "NON_TARGET_BASIC_RESEARCH"
    | "NON_TARGET_NON_CLINICAL"
    | "NON_TARGET_THIRD_PARTY_ONLY"
    | "DUPLICATE_OR_REPLACED";
  confidence: "HIGH" | "MEDIUM" | "LOW";
  replacementRecommendation:
    | "REPLACE_SOURCE_URL"
    | "REPLACE_APPLICATION_URL"
    | "REPLACE_BOTH"
    | "KEEP_CURRENT_SOURCE"
    | "KEEP_WITH_CAVEAT"
    | "DISCARD_FROM_CURRENT_WEDGE"
    | "NEEDS_MORE_RESEARCH"
    | "NO_BETTER_SOURCE_FOUND";
  evidenceText: string;
  searchTermsTried: string;
  futureLaneCandidate: string;
  reviewerNotes: string;
}

// Hand-curated from WebSearch evidence in the P96-4B research sessions.
// Batches: 001 (rows 1-30), 002 (rows 31-60).
const DECISIONS: Decision[] = [
  {
    itemId: "cmn2111jv001esb1197ufjp8u",
    candidateSourceUrl: "https://international.northwell.edu/center-for-global-health",
    candidateApplicationUrl: "",
    sourceQuality: "OFFICIAL_DEPARTMENT_PAGE_WITH_USCE_TEXT",
    targetFitAfterResearch: "MAYBE_TARGET_MANUAL_REVIEW",
    confidence: "LOW",
    replacementRecommendation: "NEEDS_MORE_RESEARCH",
    evidenceText:
      "site:northwell.edu surfaced consulting/advisory (current wrong page), Lenox Hill International Health, Center for Global Health, and Feinstein visiting-scientists. No single canonical international observership landing page on Northwell. Suggest manual contact via International Services.",
    searchTermsTried: "site:northwell.edu international observership IMG visiting",
    futureLaneCandidate: "",
    reviewerNotes:
      "Current URL is genuinely wrong (consulting page). No clean replacement on northwell.edu — needs human dig or direct contact.",
  },
  {
    itemId: "cmo33855r000t1ny9mcguc1mn",
    candidateSourceUrl: "https://www.uclahealth.org/international-services/medical-education-training/physicians/physician-observerships",
    candidateApplicationUrl: "",
    sourceQuality: "EXACT_OFFICIAL_PROGRAM_PAGE",
    targetFitAfterResearch: "TARGET_USCE_MATCH",
    confidence: "HIGH",
    replacementRecommendation: "KEEP_CURRENT_SOURCE",
    evidenceText:
      "Current URL IS the canonical UCLA International Physician Observership page. The 'consulting-education-services' slug triggered the heuristic wrong-page hint, but the page itself is the program landing. Verified: '...informal observational experience that enables participants to observe...'",
    searchTermsTried: "site:uclahealth.org international physician observership program",
    futureLaneCandidate: "",
    reviewerNotes: "False positive in P96-2 classifier — flag the heuristic, not the URL.",
  },
  {
    itemId: "cmn2111mt001msb11fzpzozyu",
    candidateSourceUrl: "https://www.uclahealth.org/international-services/medical-education-training/physicians/physician-observerships",
    candidateApplicationUrl: "",
    sourceQuality: "EXACT_OFFICIAL_PROGRAM_PAGE",
    targetFitAfterResearch: "TARGET_USCE_MATCH",
    confidence: "HIGH",
    replacementRecommendation: "KEEP_CURRENT_SOURCE",
    evidenceText: "Same URL as the prior UCLA listing — canonical program page.",
    searchTermsTried: "site:uclahealth.org international physician observership program",
    futureLaneCandidate: "",
    reviewerNotes: "Possibly a duplicate of the UCLA Health International Physician Observership row; consider DUPLICATE_OR_REPLACED.",
  },
  {
    itemId: "cmn2114240076sb11zfiteqrx",
    candidateSourceUrl: "",
    candidateApplicationUrl: "",
    sourceQuality: "NO_BETTER_SOURCE_FOUND",
    targetFitAfterResearch: "MAYBE_TARGET_MANUAL_REVIEW",
    confidence: "LOW",
    replacementRecommendation: "NEEDS_MORE_RESEARCH",
    evidenceText: "Could not independently verify clinicalexperienceprograms.com legitimacy via web search. Compare against AMOpportunities, IMGPrep, IMG Helping Hands which are referenced as established providers.",
    searchTermsTried: "\"clinicalexperienceprograms.com\" CEP IMG rotations review legitimate",
    futureLaneCandidate: "third_party_usce_brokers",
    reviewerNotes: "Third-party USCE broker — needs manual due-diligence pass before keep/discard.",
  },
  {
    itemId: "cmn2111qh001wsb111gq2cngn",
    candidateSourceUrl: "",
    candidateApplicationUrl: "",
    sourceQuality: "NO_BETTER_SOURCE_FOUND",
    targetFitAfterResearch: "MAYBE_TARGET_MANUAL_REVIEW",
    confidence: "LOW",
    replacementRecommendation: "NEEDS_MORE_RESEARCH",
    evidenceText: "UCI Health 'Irvine Clinical Experience' explicitly excludes international students without SSN. No dedicated UCI School of Medicine visiting student / observership landing page surfaced for IMGs.",
    searchTermsTried: "site:ucihealth.org international observership IMG visiting medical student",
    futureLaneCandidate: "",
    reviewerNotes: "May not actually offer USCE relevant to IMGs; consider DISCARD if confirmed.",
  },
  // Postdoc / research-fellowship rows (12) — non-target per doctrine.
  ...[
    ["cmn21146x007ksb11nksfya8i", "Albert Einstein Research Fellowship", "https://einsteinmed.edu/"],
    ["cmn21145j007gsb11ba86v05m", "Baylor Postdoctoral Research", "https://www.bcm.edu/"],
    ["cmn2113vx006wsb11k7c4vies", "Emory Postdoctoral Research", "https://www.ecfmg.org/"],
    ["cmn2113qn006isb11ed3rrmyv", "Harvard Research Fellowship", "https://postdoc.hms.harvard.edu/"],
    ["cmn2113pw006gsb115grg3340", "Mayo Research Fellowship", "https://college.mayo.edu/"],
    ["cmn2113sx006osb11loir1mwy", "Mount Sinai Postdoctoral Research", "https://icahn.mssm.edu/"],
    ["cmn211468007isb11z63xyocy", "Northwestern Postdoctoral Research", "https://www.feinberg.northwestern.edu/"],
    ["cmn2113s6006msb118hgahh1o", "Stanford Postdoctoral Research", "https://postdocs.stanford.edu/"],
    ["cmn21143g007asb11c77awbh2", "UCSF Postdoctoral Research", "https://postdocs.ucsf.edu/"],
    ["cmn2113z5006ysb11a69rap0h", "Michigan Research Fellowship", "https://medicine.umich.edu/medschool/research/postdoctoral"],
    ["cmn2113to006qsb11m64ge9a7", "Pittsburgh Postdoctoral Research", "https://www.postdoc.pitt.edu/"],
    ["cmn21144u007esb11pfjw2mj2", "Yale Postdoctoral Research", "https://postdocs.yale.edu/"],
  ].map(([itemId, label, currentUrl]): Decision => ({
    itemId,
    candidateSourceUrl: currentUrl,
    candidateApplicationUrl: "",
    sourceQuality: "OFFICIAL_GENERIC_PAGE",
    targetFitAfterResearch: "MAYBE_TARGET_MANUAL_REVIEW",
    confidence: "LOW",
    replacementRecommendation: "KEEP_WITH_CAVEAT",
    evidenceText:
      `${label}: postdoctoral research positions for MD/MBBS graduates. IMGs typically work on clinical research, outcomes research, or health services research. J1 visa sponsorship usually available through the institution. Most positions found through cold-emailing faculty PIs — not centrally posted. Keep on the wedge as a low-priority secondary path, flagged with this caveat.`,
    searchTermsTried: "(doctrine reclassified — research path is real for IMGs but low-priority)",
    futureLaneCandidate: "research_track_secondary",
    reviewerNotes:
      "Low confidence: no central program listing exists; applicants must cold-email faculty PIs directly. Surface caveat on the listing rather than discarding.",
  })),
  {
    itemId: "cmn21153a009ssb11aleu4i2b",
    candidateSourceUrl: "https://www.jeffersonhealth.org/about-us/academic-programs/medical-student-programs/clerkships-observerships-einstein",
    candidateApplicationUrl: "https://www.jeffersonhealth.org/content/dam/health2021/images/academic-programs/einstein-academic/documents/exhibit-a-visiting-observer-application-form.pdf",
    sourceQuality: "EXACT_OFFICIAL_PROGRAM_PAGE",
    targetFitAfterResearch: "TARGET_USCE_MATCH",
    confidence: "HIGH",
    replacementRecommendation: "REPLACE_BOTH",
    evidenceText:
      "Jefferson Einstein Philadelphia hosts 900+ rotations/yr and offers clinical observerships to LCME/AOA/ADA/CPME graduates. Application form PDF surfaces requirements: CV, USMLE/COMLEX, ECFMG.",
    searchTermsTried: "site:jeffersonhealth.org observership IMG international visiting student",
    futureLaneCandidate: "",
    reviewerNotes: "Strong replacement. Application is a PDF — keep both source and application URL.",
  },
  {
    itemId: "cmn21156y009wsb11c201596e",
    candidateSourceUrl: "https://www.advocatehealth.com/education/medical-education/medical-students/forms-requirements",
    candidateApplicationUrl: "",
    sourceQuality: "OFFICIAL_POLICY_PAGE",
    targetFitAfterResearch: "MAYBE_TARGET_MANUAL_REVIEW",
    confidence: "HIGH",
    replacementRecommendation: "DISCARD_FROM_CURRENT_WEDGE",
    evidenceText:
      "Advocate Health Care official policy: 'does not provide opportunities for visitors as medical observers in its hospitals, clinics or physician offices'. Some elective rotations available for non-affiliated school students at certain sites.",
    searchTermsTried: "site:advocatehealth.com observership IMG visiting medical student elective",
    futureLaneCandidate: "elective_only_no_observership",
    reviewerNotes: "Listing as 'observership' is misleading — no observerships are offered. Either reframe as 'electives only' or discard.",
  },
  {
    itemId: "cmn21121g002ksb11m3qkwjbv",
    candidateSourceUrl: "https://www.advocatehealth.com/education/medical-education/medical-students/forms-requirements",
    candidateApplicationUrl: "",
    sourceQuality: "OFFICIAL_POLICY_PAGE",
    targetFitAfterResearch: "DUPLICATE_OR_REPLACED",
    confidence: "HIGH",
    replacementRecommendation: "DISCARD_FROM_CURRENT_WEDGE",
    evidenceText: "Duplicate of the other Advocate Christ Medical Center listing. Same policy: no observerships.",
    searchTermsTried: "(duplicate row)",
    futureLaneCandidate: "elective_only_no_observership",
    reviewerNotes: "Apparent duplicate. Either dedupe or treat the same as the sibling.",
  },
  {
    itemId: "cmn2115m900awsb11prycio5n",
    candidateSourceUrl: "https://www.bannerhealth.com/health-professionals/residency-fellowships/medical-student-programs",
    candidateApplicationUrl: "",
    sourceQuality: "OFFICIAL_DEPARTMENT_PAGE_WITH_USCE_TEXT",
    targetFitAfterResearch: "MAYBE_TARGET_MANUAL_REVIEW",
    confidence: "MEDIUM",
    replacementRecommendation: "REPLACE_SOURCE_URL",
    evidenceText:
      "Banner Health Medical Student Programs page covers MS rotations across the system. Specific Tucson program is at the U of A College of Medicine — see sibling row for medicine.arizona.edu.",
    searchTermsTried: "site:bannerhealth.com observership IMG visiting medical student elective",
    futureLaneCandidate: "",
    reviewerNotes: "Banner Health has system-level pages but Tucson teaching is via UA. Cross-reference with the UA row.",
  },
  {
    itemId: "cmn2113bb005isb111uzkdkk6",
    candidateSourceUrl: "https://medicine.arizona.edu/education/degree-programs/md-program/visiting-medical-students",
    candidateApplicationUrl: "",
    sourceQuality: "EXACT_OFFICIAL_PROGRAM_PAGE",
    targetFitAfterResearch: "TARGET_USCE_MATCH",
    confidence: "HIGH",
    replacementRecommendation: "REPLACE_SOURCE_URL",
    evidenceText:
      "U of A Tucson Visiting Medical Students page. Eligibility: 4th-year LCME/COCA program, BLS/ACLS, $125 fee. International students restricted unless sponsored by faculty.",
    searchTermsTried: "site:medicine.arizona.edu visiting medical student observership IMG elective",
    futureLaneCandidate: "",
    reviewerNotes: "Add caveat that international students need faculty sponsorship.",
  },
  {
    itemId: "cmn2115dj00aesb115q0wh0yc",
    candidateSourceUrl: "https://baptisthealth.net/international-services/international-healthcare-professionals/international-observerships",
    candidateApplicationUrl: "https://baptisthealth.net/academics/student-and-visitor-programs/job-shadowing-and-externships/observer-program/observer-program-application",
    sourceQuality: "EXACT_OFFICIAL_PROGRAM_PAGE",
    targetFitAfterResearch: "TARGET_USCE_MATCH",
    confidence: "HIGH",
    replacementRecommendation: "REPLACE_BOTH",
    evidenceText:
      "Baptist Health South Florida — explicit International Observerships page + Visiting Physician + general Observer Program. International prioritization for Latin America / Caribbean applicants.",
    searchTermsTried: "site:baptisthealth.net observership IMG international visiting",
    futureLaneCandidate: "",
    reviewerNotes: "Cleanest match in batch — both source and application URLs are official.",
  },
  {
    itemId: "cmn2112y0004osb11wjh4xkrv",
    candidateSourceUrl: "https://md.wustl.edu/curriculum/visiting-students/",
    candidateApplicationUrl: "https://md.wustl.edu/curriculum/visiting-students/how-to-apply/",
    sourceQuality: "EXACT_OFFICIAL_PROGRAM_PAGE",
    targetFitAfterResearch: "TARGET_USCE_MATCH",
    confidence: "HIGH",
    replacementRecommendation: "REPLACE_BOTH",
    evidenceText:
      "WashU MD program canonical Visiting Students page + How-to-Apply. VSLO-only application path. Note: no observerships, only MD electives. International eligible via VSLO.",
    searchTermsTried: "site:wustl.edu visiting medical student observership IMG elective",
    futureLaneCandidate: "",
    reviewerNotes: "WashU does not offer observerships — title field on USCEHub may need adjusting if it implies observership.",
  },
  {
    itemId: "cmn2112d0003asb11odo3emfn",
    candidateSourceUrl: "https://www.bcm.edu/education/school-of-medicine/m-d-program/curriculum/elective-program/visiting-medical-student",
    candidateApplicationUrl: "",
    sourceQuality: "EXACT_OFFICIAL_PROGRAM_PAGE",
    targetFitAfterResearch: "TARGET_USCE_MATCH",
    confidence: "HIGH",
    replacementRecommendation: "REPLACE_SOURCE_URL",
    evidenceText:
      "Baylor College of Medicine canonical Visiting Medical Student page. VSLO-only path. International applicants accepted Jan-June each cycle, F-1 visa required, TOEFL 100+. Baylor does NOT offer observership/shadowing.",
    searchTermsTried: "site:bcm.edu observership international medical graduate visiting student elective",
    futureLaneCandidate: "",
    reviewerNotes: "Strong canonical replacement. Title may need 'observership → visiting student elective' edit.",
  },
  {
    itemId: "cmn21159u00a4sb11kzzrh8a0",
    candidateSourceUrl: "https://www.beaumont.org/docs/librariesprovider2/medical-students---dearborn/student-observ-application.pdf",
    candidateApplicationUrl: "https://www.beaumont.org/docs/librariesprovider2/medical-students---dearborn/graduate-observ-application.pdf",
    sourceQuality: "OFFICIAL_APPLICATION_PAGE",
    targetFitAfterResearch: "TARGET_USCE_MATCH",
    confidence: "MEDIUM",
    replacementRecommendation: "NEEDS_MORE_RESEARCH",
    evidenceText:
      "Only PDFs surfaced for student-observership at Beaumont/Corewell Dearborn. No clean HTML landing page found post-rebrand to Corewell. Consider linking the Royal Oak hospital page + the application PDF.",
    searchTermsTried: "site:beaumont.org observership IMG visiting medical student",
    futureLaneCandidate: "",
    reviewerNotes: "Check corewellhealth.org for a unified post-rebrand landing.",
  },
  {
    itemId: "cmn2111te0024sb11mt47ybof",
    candidateSourceUrl: "https://www.bidmc.org/medical-education/medical-education-by-department",
    candidateApplicationUrl: "",
    sourceQuality: "OFFICIAL_DEPARTMENT_PAGE_WITH_USCE_TEXT",
    targetFitAfterResearch: "TARGET_USCE_MATCH",
    confidence: "HIGH",
    replacementRecommendation: "REPLACE_SOURCE_URL",
    evidenceText:
      "BIDMC Medical Education by Department index. Specialty observerships at BIDMC: Radiology (multiple sub-specialties), Anesthesiology, Interventional Pulmonology, Emergency Medicine (VSLO). Current source on USCEHub points to ECFMG.org which is a clearinghouse, not BIDMC.",
    searchTermsTried: "Beth Israel Deaconess Medical Center BIDMC observership IMG visiting student",
    futureLaneCandidate: "",
    reviewerNotes: "Definite improvement over ECFMG.org placeholder.",
  },
  {
    itemId: "cmn2111u40026sb11bnhgpkdb",
    candidateSourceUrl: "https://www.bmc.org/medical-professionals/education-training/graduate-medical-education/physician-recruitment/medical-students",
    candidateApplicationUrl: "",
    sourceQuality: "EXACT_OFFICIAL_PROGRAM_PAGE",
    targetFitAfterResearch: "TARGET_USCE_MATCH",
    confidence: "MEDIUM",
    replacementRecommendation: "REPLACE_SOURCE_URL",
    evidenceText:
      "Boston Medical Center Subsidized Visiting Elective Program (SVEP, up to $2,500 reimbursement). VSLO-driven. CAVEAT: international rotations currently CLOSED — flag the listing accordingly.",
    searchTermsTried: "site:bmc.org observership IMG visiting medical student elective",
    futureLaneCandidate: "",
    reviewerNotes: "Add caveat: international rotations temporarily closed.",
  },
  {
    itemId: "cmn2111j4001csb113odjp4jt",
    candidateSourceUrl: "",
    candidateApplicationUrl: "",
    sourceQuality: "NO_BETTER_SOURCE_FOUND",
    targetFitAfterResearch: "MAYBE_TARGET_MANUAL_REVIEW",
    confidence: "LOW",
    replacementRecommendation: "NEEDS_MORE_RESEARCH",
    evidenceText:
      "Brookdale (Brooklyn) — current URL is ECFMG.org (clearinghouse). General web search returned no Brookdale-specific observership landing page. Recommend manual outreach.",
    searchTermsTried: "Brookdale Hospital observership IMG international visiting medical graduate",
    futureLaneCandidate: "",
    reviewerNotes: "Possibly hosted under One Brooklyn Health system — try onebrooklynhealth.org.",
  },
  {
    itemId: "cmn2115ok00b2sb11uo7vd4v7",
    candidateSourceUrl: "https://brooklynusce.com/",
    candidateApplicationUrl: "",
    sourceQuality: "EXACT_OFFICIAL_PROGRAM_PAGE",
    targetFitAfterResearch: "TARGET_USCE_MATCH",
    confidence: "HIGH",
    replacementRecommendation: "KEEP_CURRENT_SOURCE",
    evidenceText:
      "Brooklyn USCE is a legitimate IMG-focused USCE provider founded 2017 by Dr. Ratesh Khillan (board-certified hem-onc, KingsBrook Jewish). Offers electives, externships, observerships, telemedicine rotations across NY/NJ/MI/UT/TX/CA/KY. The homepage IS the canonical landing page for a third-party USCE broker — exactly the audience USCEHub serves.",
    searchTermsTried: "\"Brooklyn USCE\" clinical rotations program IMG observership",
    futureLaneCandidate: "",
    reviewerNotes: "Heuristic flagged 'generic homepage' but a third-party USCE broker's homepage is appropriate.",
  },
  // ---- BATCH 002 (rows 31-60) ----
  {
    itemId: "cmn2115fs00aksb110p1hkkvn",
    candidateSourceUrl: "https://atriumhealth.org/education/graduate-medical-education/physician-residencies/internal-medicine/medical-student-information",
    candidateApplicationUrl: "",
    sourceQuality: "OFFICIAL_DEPARTMENT_PAGE_WITH_USCE_TEXT",
    targetFitAfterResearch: "MAYBE_TARGET_MANUAL_REVIEW",
    confidence: "MEDIUM",
    replacementRecommendation: "KEEP_WITH_CAVEAT",
    evidenceText: "Atrium Health: visiting student rotations via VSLO + observation experiences only via Clinical Education Affiliation Agreement. No IMG-specific path.",
    searchTermsTried: "site:atriumhealth.org observership IMG visiting medical student elective",
    futureLaneCandidate: "affiliation_only_no_img_observership",
    reviewerNotes: "Listing as IMG observership is misleading. Surface caveat.",
  },
  {
    itemId: "cmn2115q200b6sb115fxbi2gx",
    candidateSourceUrl: "https://www.conemaugh.org/medical-students",
    candidateApplicationUrl: "",
    sourceQuality: "OFFICIAL_POLICY_PAGE",
    targetFitAfterResearch: "MAYBE_TARGET_MANUAL_REVIEW",
    confidence: "HIGH",
    replacementRecommendation: "DISCARD_FROM_CURRENT_WEDGE",
    evidenceText: "Conemaugh: 'does not offer observerships, externships, shadowing or research assistant positions in the medical student program.' Audition rotations only for affiliated schools.",
    searchTermsTried: "site:conemaugh.org observership visiting medical student elective",
    futureLaneCandidate: "no_observership_offered",
    reviewerNotes: "Hospital does not offer observerships.",
  },
  {
    itemId: "cmn2111bn000ysb11c73w0mft",
    candidateSourceUrl: "https://www.nychealthandhospitals.org/interns-and-residents/",
    candidateApplicationUrl: "",
    sourceQuality: "OFFICIAL_DEPARTMENT_PAGE_WITH_USCE_TEXT",
    targetFitAfterResearch: "MAYBE_TARGET_MANUAL_REVIEW",
    confidence: "MEDIUM",
    replacementRecommendation: "KEEP_WITH_CAVEAT",
    evidenceText: "NYC H+H umbrella GME page. ~2000 students rotate yearly. No site-wide observership program; per-hospital arrangement. Coney Island has no dedicated observership landing.",
    searchTermsTried: "site:nychealthandhospitals.org observership IMG visiting medical student elective",
    futureLaneCandidate: "nyc_hh_per_hospital",
    reviewerNotes: "All NYC H+H listings should reference this umbrella + per-hospital outreach.",
  },
  {
    itemId: "cmn2111z9002esb11gli9r1qb",
    candidateSourceUrl: "https://cookcountyhealth.org/education-and-research/",
    candidateApplicationUrl: "https://cookcountyhealth.org/wp-content/uploads/International-Medical-Student-Packet-5.18.18.pdf",
    sourceQuality: "OFFICIAL_DEPARTMENT_PAGE_WITH_USCE_TEXT",
    targetFitAfterResearch: "TARGET_USCE_MATCH",
    confidence: "HIGH",
    replacementRecommendation: "REPLACE_BOTH",
    evidenceText: "Cook County Health: 'does not provide shadowing or observership experiences' BUT offers Senior Elective Clerkships including dedicated International Medical Student Application Packet. Caveat: clerkship-only.",
    searchTermsTried: "site:cookcountyhealth.org observership visiting medical student IMG",
    futureLaneCandidate: "",
    reviewerNotes: "Real IMG path exists but it's a clerkship, not observership.",
  },
  {
    itemId: "cmn211569009usb119spp0t4q",
    candidateSourceUrl: "",
    candidateApplicationUrl: "",
    sourceQuality: "NO_BETTER_SOURCE_FOUND",
    targetFitAfterResearch: "MAYBE_TARGET_MANUAL_REVIEW",
    confidence: "LOW",
    replacementRecommendation: "NEEDS_MORE_RESEARCH",
    evidenceText: "Crozer Health (Prospect Medical bankruptcy 2024-25). No observership/visiting student page surfaced.",
    searchTermsTried: "site:crozerhealth.org observership IMG visiting medical student",
    futureLaneCandidate: "system_in_transition",
    reviewerNotes: "System in financial distress; programs may be paused.",
  },
  {
    itemId: "cmn2112qu0044sb11m7wwscho",
    candidateSourceUrl: "https://medschool.duke.edu/education/health-professions-education-programs/student-services/office-registrar/visiting-students",
    candidateApplicationUrl: "https://medschool.duke.edu/sites/default/files/2022-02/international_vsp_application.pdf",
    sourceQuality: "EXACT_OFFICIAL_PROGRAM_PAGE",
    targetFitAfterResearch: "TARGET_USCE_MATCH",
    confidence: "HIGH",
    replacementRecommendation: "REPLACE_BOTH",
    evidenceText: "Duke Visiting Medical Student Program. International applicants must have approved affiliation agreement with Duke. Duke does NOT have a shadowing/observership program — VSLO electives only.",
    searchTermsTried: "site:medschool.duke.edu OR site:duke.edu visiting medical student observership IMG elective",
    futureLaneCandidate: "",
    reviewerNotes: "Caveat: affiliation-required.",
  },
  {
    itemId: "cmn21118u000qsb11lbgouwbn",
    candidateSourceUrl: "https://www.nychealthandhospitals.org/elmhurst/graduate-medical-education/",
    candidateApplicationUrl: "",
    sourceQuality: "EXACT_OFFICIAL_PROGRAM_PAGE",
    targetFitAfterResearch: "TARGET_USCE_MATCH",
    confidence: "HIGH",
    replacementRecommendation: "KEEP_CURRENT_SOURCE",
    evidenceText: "Current source IS the Elmhurst GME page. False-positive heuristic flag.",
    searchTermsTried: "(verified existing URL)",
    futureLaneCandidate: "",
    reviewerNotes: "Heuristic over-flagged. KEEP.",
  },
  {
    itemId: "cmn2112t1004asb11yfn2d06l",
    candidateSourceUrl: "https://med.emory.edu/education/admissions/visiting/index.html",
    candidateApplicationUrl: "https://med.emory.edu/education/admissions/visiting/md_files/ApplicationforVisitingStudent.pdf",
    sourceQuality: "EXACT_OFFICIAL_PROGRAM_PAGE",
    targetFitAfterResearch: "TARGET_USCE_MATCH",
    confidence: "HIGH",
    replacementRecommendation: "REPLACE_BOTH",
    evidenceText: "Emory Visiting Medical Students program — accepts international 4th-year applicants. $525 application + $4,500 tuition, October-February only, TOEFL 20+ per section.",
    searchTermsTried: "site:med.emory.edu visiting medical student observership IMG elective",
    futureLaneCandidate: "",
    reviewerNotes: "Strong canonical replacement.",
  },
  {
    itemId: "cmn2114xq009csb115qvu2i90",
    candidateSourceUrl: "https://flushinghospital.org/graduate-medical-education/",
    candidateApplicationUrl: "",
    sourceQuality: "OFFICIAL_POLICY_PAGE",
    targetFitAfterResearch: "MAYBE_TARGET_MANUAL_REVIEW",
    confidence: "HIGH",
    replacementRecommendation: "DISCARD_FROM_CURRENT_WEDGE",
    evidenceText: "Flushing Hospital: 'Observership/externship positions are not offered.' Residency program does not sponsor any visa.",
    searchTermsTried: "site:flushinghospital.org observership IMG visiting medical graduate",
    futureLaneCandidate: "no_observership_no_visa_sponsor",
    reviewerNotes: "Hospital actively does not offer observerships.",
  },
  {
    itemId: "cmn2115qt00b8sb11lj2ug8jv",
    candidateSourceUrl: "https://www.geisinger.org/-/media/onegeisinger/pdfs/ghs/about-geisinger/vendor%20relations/observership-internship-externship-policy-08-2017",
    candidateApplicationUrl: "",
    sourceQuality: "OFFICIAL_POLICY_PAGE",
    targetFitAfterResearch: "MAYBE_TARGET_MANUAL_REVIEW",
    confidence: "MEDIUM",
    replacementRecommendation: "REPLACE_SOURCE_URL",
    evidenceText: "Geisinger Observership/Internship/Externship Policy PDF. VSLO required. PA Child Abuse Clearance + background check + drug screen.",
    searchTermsTried: "site:geisinger.org observership visiting medical student IMG elective",
    futureLaneCandidate: "",
    reviewerNotes: "PDF policy is the canonical source.",
  },
  {
    itemId: "cmn2112tr004csb11exwui0cw",
    candidateSourceUrl: "",
    candidateApplicationUrl: "",
    sourceQuality: "NO_BETTER_SOURCE_FOUND",
    targetFitAfterResearch: "MAYBE_TARGET_MANUAL_REVIEW",
    confidence: "LOW",
    replacementRecommendation: "NEEDS_MORE_RESEARCH",
    evidenceText: "Grady Memorial — no medical student observership page. Grady is a teaching site for Emory and Morehouse — try those affiliated routes.",
    searchTermsTried: "site:gradyhealth.org observership visiting medical student IMG elective",
    futureLaneCandidate: "",
    reviewerNotes: "Try Emory + Morehouse SOM affiliations.",
  },
  {
    itemId: "cmn2111a9000usb11xb7vi1yo",
    candidateSourceUrl: "https://www.nychealthandhospitals.org/interns-and-residents/",
    candidateApplicationUrl: "",
    sourceQuality: "OFFICIAL_DEPARTMENT_PAGE_WITH_USCE_TEXT",
    targetFitAfterResearch: "MAYBE_TARGET_MANUAL_REVIEW",
    confidence: "MEDIUM",
    replacementRecommendation: "KEEP_WITH_CAVEAT",
    evidenceText: "Harlem Hospital part of NYC H+H. Same umbrella GME page applies.",
    searchTermsTried: "(NYC H+H umbrella search)",
    futureLaneCandidate: "nyc_hh_per_hospital",
    reviewerNotes: "Same as Coney Island.",
  },
  {
    itemId: "cmn2113650054sb11ap9qm6ho",
    candidateSourceUrl: "https://hartfordhospital.org/health-professionals/education/residencies-fellowships/student-internships",
    candidateApplicationUrl: "https://hartfordhospital.org/file%20library/unassigned/visitingmedicalstudentpolicy.pdf",
    sourceQuality: "EXACT_OFFICIAL_PROGRAM_PAGE",
    targetFitAfterResearch: "TARGET_USCE_MATCH",
    confidence: "HIGH",
    replacementRecommendation: "REPLACE_BOTH",
    evidenceText: "Hartford Hospital Student Internships hub + visiting-medical-student-policy PDF. Separate Guest Observation Application for physicians.",
    searchTermsTried: "site:hartfordhospital.org observership visiting medical student IMG elective",
    futureLaneCandidate: "",
    reviewerNotes: "Strong replacement.",
  },
  {
    itemId: "cmn2115sy00besb11mu9l8ndk",
    candidateSourceUrl: "https://hennepinhealthcare.org/medical-education-training/medical-student-rotations",
    candidateApplicationUrl: "",
    sourceQuality: "OFFICIAL_POLICY_PAGE",
    targetFitAfterResearch: "MAYBE_TARGET_MANUAL_REVIEW",
    confidence: "HIGH",
    replacementRecommendation: "DISCARD_FROM_CURRENT_WEDGE",
    evidenceText: "Hennepin Healthcare: 'is not offering observerships or externships to international graduates or students at this time.'",
    searchTermsTried: "site:hennepinhealthcare.org observership visiting medical student IMG elective",
    futureLaneCandidate: "no_img_observership_currently",
    reviewerNotes: "Active no-IMG-observership policy.",
  },
  {
    itemId: "cmn21159400a2sb11la8ong4t",
    candidateSourceUrl: "https://www.henryford.com/hcp/med-ed/ugme/students/visiting-students",
    candidateApplicationUrl: "https://www.henryford.com/-/media/files/henry-ford/hcp/med-ed/ugme/international-student-elective-application-2016.pdf",
    sourceQuality: "EXACT_OFFICIAL_PROGRAM_PAGE",
    targetFitAfterResearch: "TARGET_USCE_MATCH",
    confidence: "HIGH",
    replacementRecommendation: "REPLACE_BOTH",
    evidenceText: "Henry Ford Visiting Students hub + International Student Elective Application PDF. Multiple specialty observership programs (ENT). MEP 237 observership policy. International medical students: elective rotation only.",
    searchTermsTried: "site:henryford.com observership visiting medical student IMG elective",
    futureLaneCandidate: "",
    reviewerNotes: "Strong replacement.",
  },
  {
    itemId: "cmn2112vy004isb11z0ai7uk5",
    candidateSourceUrl: "https://www.henryford.com/hcp/med-ed/ugme/students/visiting-students",
    candidateApplicationUrl: "https://www.henryford.com/-/media/files/henry-ford/hcp/med-ed/ugme/international-student-elective-application-2016.pdf",
    sourceQuality: "EXACT_OFFICIAL_PROGRAM_PAGE",
    targetFitAfterResearch: "DUPLICATE_OR_REPLACED",
    confidence: "HIGH",
    replacementRecommendation: "REPLACE_BOTH",
    evidenceText: "Apparent duplicate Henry Ford row.",
    searchTermsTried: "(duplicate)",
    futureLaneCandidate: "",
    reviewerNotes: "Consider deduping.",
  },
  {
    itemId: "cmn21117e000msb11t80jqdux",
    candidateSourceUrl: "",
    candidateApplicationUrl: "",
    sourceQuality: "NO_BETTER_SOURCE_FOUND",
    targetFitAfterResearch: "MAYBE_TARGET_MANUAL_REVIEW",
    confidence: "LOW",
    replacementRecommendation: "NEEDS_MORE_RESEARCH",
    evidenceText: "Interfaith Medical Center (Brooklyn) — current sourceUrl is ECFMG.org placeholder. Hospital filed bankruptcy 2014, now under One Brooklyn Health.",
    searchTermsTried: "(no targeted search; ECFMG placeholder)",
    futureLaneCandidate: "system_in_transition",
    reviewerNotes: "Try onebrooklynhealth.org.",
  },
  {
    itemId: "cmn211184000osb11lxan6nl7",
    candidateSourceUrl: "https://www.nychealthandhospitals.org/jacobi/graduate-medical-education/",
    candidateApplicationUrl: "",
    sourceQuality: "EXACT_OFFICIAL_PROGRAM_PAGE",
    targetFitAfterResearch: "TARGET_USCE_MATCH",
    confidence: "HIGH",
    replacementRecommendation: "KEEP_CURRENT_SOURCE",
    evidenceText: "Current source IS the Jacobi GME page. False-positive heuristic flag.",
    searchTermsTried: "(verified existing URL)",
    futureLaneCandidate: "",
    reviewerNotes: "Heuristic over-flagged. KEEP.",
  },
  {
    itemId: "cmn2114x0009asb11vqhrdugf",
    candidateSourceUrl: "https://jamaicahospital.org/graduate-medical-education/",
    candidateApplicationUrl: "",
    sourceQuality: "OFFICIAL_DEPARTMENT_PAGE_WITH_USCE_TEXT",
    targetFitAfterResearch: "MAYBE_TARGET_MANUAL_REVIEW",
    confidence: "MEDIUM",
    replacementRecommendation: "REPLACE_SOURCE_URL",
    evidenceText: "Jamaica Hospital GME landing. J-1 sponsorship considered for exceptional residency candidates. No dedicated observership-specific page.",
    searchTermsTried: "site:jamaicahospital.org observership IMG visiting medical graduate elective",
    futureLaneCandidate: "",
    reviewerNotes: "Better than homepage but not observership-specific.",
  },
  {
    itemId: "cmn2115c200aasb110ul4c1ce",
    candidateSourceUrl: "https://jpshealthnet.org/academic-affairs/undergraduate-medical-education",
    candidateApplicationUrl: "",
    sourceQuality: "OFFICIAL_DEPARTMENT_PAGE_WITH_USCE_TEXT",
    targetFitAfterResearch: "MAYBE_TARGET_MANUAL_REVIEW",
    confidence: "MEDIUM",
    replacementRecommendation: "REPLACE_SOURCE_URL",
    evidenceText: "JPS UGME page. VSLO-driven. No specific IMG observership info.",
    searchTermsTried: "site:jpshealthnet.org observership visiting medical student IMG elective",
    futureLaneCandidate: "",
    reviewerNotes: "Caveat: VSLO-only.",
  },
  {
    itemId: "cmn2111ay000wsb11a14w9t73",
    candidateSourceUrl: "https://www.nychealthandhospitals.org/interns-and-residents/",
    candidateApplicationUrl: "",
    sourceQuality: "OFFICIAL_DEPARTMENT_PAGE_WITH_USCE_TEXT",
    targetFitAfterResearch: "MAYBE_TARGET_MANUAL_REVIEW",
    confidence: "MEDIUM",
    replacementRecommendation: "KEEP_WITH_CAVEAT",
    evidenceText: "Kings County Hospital part of NYC H+H. Use umbrella + per-hospital outreach.",
    searchTermsTried: "(NYC H+H umbrella search)",
    futureLaneCandidate: "nyc_hh_per_hospital",
    reviewerNotes: "Same as other NYC H+H rows.",
  },
  {
    itemId: "cmn2114yf009esb11j10sd1ub",
    candidateSourceUrl: "",
    candidateApplicationUrl: "",
    sourceQuality: "NO_BETTER_SOURCE_FOUND",
    targetFitAfterResearch: "MAYBE_TARGET_MANUAL_REVIEW",
    confidence: "LOW",
    replacementRecommendation: "NEEDS_MORE_RESEARCH",
    evidenceText: "Kingsbrook Jewish (Brooklyn) — current sourceUrl is ECFMG.org placeholder. Now part of One Brooklyn Health. Brooklyn USCE founder Dr. Khillan worked at KingsBrook.",
    searchTermsTried: "(no targeted search; ECFMG placeholder)",
    futureLaneCandidate: "system_in_transition",
    reviewerNotes: "Try onebrooklynhealth.org. Possible Brooklyn USCE affiliation.",
  },
  {
    itemId: "cmn21119k000ssb11aj30itn0",
    candidateSourceUrl: "https://www.nychealthandhospitals.org/interns-and-residents/",
    candidateApplicationUrl: "",
    sourceQuality: "OFFICIAL_DEPARTMENT_PAGE_WITH_USCE_TEXT",
    targetFitAfterResearch: "MAYBE_TARGET_MANUAL_REVIEW",
    confidence: "MEDIUM",
    replacementRecommendation: "KEEP_WITH_CAVEAT",
    evidenceText: "Lincoln Medical Center part of NYC H+H. Use umbrella + per-hospital outreach.",
    searchTermsTried: "(NYC H+H umbrella search)",
    futureLaneCandidate: "nyc_hh_per_hospital",
    reviewerNotes: "Same as other NYC H+H rows.",
  },
  {
    itemId: "cmn2111r6001ysb11czxooaqe",
    candidateSourceUrl: "https://medicine.llu.edu/academics/medical-student-education/visiting-students",
    candidateApplicationUrl: "",
    sourceQuality: "EXACT_OFFICIAL_PROGRAM_PAGE",
    targetFitAfterResearch: "MAYBE_TARGET_MANUAL_REVIEW",
    confidence: "HIGH",
    replacementRecommendation: "DISCARD_FROM_CURRENT_WEDGE",
    evidenceText: "Loma Linda: 'unable to accept applications or make elective placements for students enrolled in foreign medical schools.' US LCME/COCA only.",
    searchTermsTried: "site:lluh.org OR site:llu.edu observership visiting medical student IMG elective",
    futureLaneCandidate: "no_img_eligible",
    reviewerNotes: "Active no-IMG policy.",
  },
  {
    itemId: "cmn2115lj00ausb11hvghc4u6",
    candidateSourceUrl: "https://medicine.llu.edu/academics/medical-student-education/visiting-students",
    candidateApplicationUrl: "",
    sourceQuality: "EXACT_OFFICIAL_PROGRAM_PAGE",
    targetFitAfterResearch: "DUPLICATE_OR_REPLACED",
    confidence: "HIGH",
    replacementRecommendation: "DISCARD_FROM_CURRENT_WEDGE",
    evidenceText: "Duplicate Loma Linda row. Same no-IMG policy.",
    searchTermsTried: "(duplicate)",
    futureLaneCandidate: "no_img_eligible",
    reviewerNotes: "Dedupe.",
  },
  {
    itemId: "cmn2113cs005msb11f4e79jnf",
    candidateSourceUrl: "https://www.medschool.lsuhsc.edu/student_affairs/electives.aspx",
    candidateApplicationUrl: "",
    sourceQuality: "EXACT_OFFICIAL_PROGRAM_PAGE",
    targetFitAfterResearch: "MAYBE_TARGET_MANUAL_REVIEW",
    confidence: "HIGH",
    replacementRecommendation: "DISCARD_FROM_CURRENT_WEDGE",
    evidenceText: "LSU New Orleans: 'LSU does not accept international students for visiting rotations.'",
    searchTermsTried: "site:medschool.lsuhsc.edu observership visiting medical student IMG elective",
    futureLaneCandidate: "no_img_eligible",
    reviewerNotes: "Active no-IMG policy.",
  },
  {
    itemId: "cmn2111rw0020sb112s14bfsn",
    candidateSourceUrl: "https://www.massgeneral.org/education/international-observership",
    candidateApplicationUrl: "",
    sourceQuality: "EXACT_OFFICIAL_PROGRAM_PAGE",
    targetFitAfterResearch: "TARGET_USCE_MATCH",
    confidence: "HIGH",
    replacementRecommendation: "REPLACE_SOURCE_URL",
    evidenceText: "MGH International Observership Program — practicing health-care professionals based internationally. $300 application fee. Designed for foreign-licensed practicing physicians (= IMG observership target audience).",
    searchTermsTried: "site:massgeneral.org observership visiting medical student IMG elective",
    futureLaneCandidate: "",
    reviewerNotes: "Specifically for licensed physicians, not students. Strong USCE match.",
  },
  {
    itemId: "cmn2115to00bgsb111aw38w0l",
    candidateSourceUrl: "https://medicine.musc.edu/education/medical-students/curriculum/clinical-curriculum/visiting-medical-students",
    candidateApplicationUrl: "",
    sourceQuality: "EXACT_OFFICIAL_PROGRAM_PAGE",
    targetFitAfterResearch: "MAYBE_TARGET_MANUAL_REVIEW",
    confidence: "HIGH",
    replacementRecommendation: "DISCARD_FROM_CURRENT_WEDGE",
    evidenceText: "MUSC: 'is not able to accept international medical students as they are not eligible for VSLO.' US LCME/COCA only.",
    searchTermsTried: "site:musc.edu observership visiting medical student IMG elective international",
    futureLaneCandidate: "no_img_eligible",
    reviewerNotes: "Active no-IMG policy.",
  },
  {
    itemId: "cmn2113gf005wsb11f05bfy8c",
    candidateSourceUrl: "https://medicine.musc.edu/education/medical-students/curriculum/clinical-curriculum/visiting-medical-students",
    candidateApplicationUrl: "",
    sourceQuality: "EXACT_OFFICIAL_PROGRAM_PAGE",
    targetFitAfterResearch: "DUPLICATE_OR_REPLACED",
    confidence: "HIGH",
    replacementRecommendation: "DISCARD_FROM_CURRENT_WEDGE",
    evidenceText: "Duplicate MUSC row.",
    searchTermsTried: "(duplicate)",
    futureLaneCandidate: "no_img_eligible",
    reviewerNotes: "Dedupe.",
  },
  {
    itemId: "cmn2112790030sb11lgcyjgkr",
    candidateSourceUrl: "https://www.medstarhealth.org/education/other-educational-programs/international-observer-program",
    candidateApplicationUrl: "",
    sourceQuality: "EXACT_OFFICIAL_PROGRAM_PAGE",
    targetFitAfterResearch: "TARGET_USCE_MATCH",
    confidence: "HIGH",
    replacementRecommendation: "REPLACE_SOURCE_URL",
    evidenceText: "MedStar Health International Observer Program — system-wide page (covers Georgetown). Caveat: residency programs do not pre-match observe.",
    searchTermsTried: "site:medstarhealth.org OR site:gumc.georgetown.edu observership visiting medical student IMG elective",
    futureLaneCandidate: "",
    reviewerNotes: "Strong replacement.",
  },
  // ---- BATCH 003 (rows 61-90) ----
  { itemId: "cmn2114tp0090sb11hh3inaul", candidateSourceUrl: "https://www.medstarhealth.org/education/other-educational-programs/international-observer-program", candidateApplicationUrl: "", sourceQuality: "EXACT_OFFICIAL_PROGRAM_PAGE", targetFitAfterResearch: "TARGET_USCE_MATCH", confidence: "HIGH", replacementRecommendation: "REPLACE_SOURCE_URL", evidenceText: "MedStar Health system-wide International Observer Program. Same canonical page used for MedStar Georgetown.", searchTermsTried: "(reuse from batch 002 MedStar search)", futureLaneCandidate: "", reviewerNotes: "Strong replacement." },
  { itemId: "cmn2115eb00agsb119if7wq66", candidateSourceUrl: "https://www.mhs.net/education/undergraduate-medical-education/requirements-for-visiting-students", candidateApplicationUrl: "", sourceQuality: "OFFICIAL_POLICY_PAGE", targetFitAfterResearch: "MAYBE_TARGET_MANUAL_REVIEW", confidence: "HIGH", replacementRecommendation: "DISCARD_FROM_CURRENT_WEDGE", evidenceText: "Memorial Healthcare System: 'does not accept students for observerships or shadowing, with no exceptions. Observership or externship opportunities are not offered at this time for residency programs.'", searchTermsTried: "site:mhs.net Memorial Healthcare South Florida observership IMG visiting medical student", futureLaneCandidate: "no_observership_offered", reviewerNotes: "Active no-observership policy." },
  { itemId: "cmn2115s900bcsb11io2z2cl3", candidateSourceUrl: "https://www.mercy.net/healthcare-education/graduate/st-louis/rotations/", candidateApplicationUrl: "", sourceQuality: "OFFICIAL_POLICY_PAGE", targetFitAfterResearch: "MAYBE_TARGET_MANUAL_REVIEW", confidence: "HIGH", replacementRecommendation: "DISCARD_FROM_CURRENT_WEDGE", evidenceText: "Mercy GME St. Louis: 'no longer able to offer observerships or sponsor externships for international medical graduates/students.'", searchTermsTried: "site:mercy.net Mercy St Louis observership visiting medical student IMG", futureLaneCandidate: "no_img_observership_currently", reviewerNotes: "Active no-IMG-observership policy." },
  { itemId: "cmn2112yq004qsb11hveu7mqi", candidateSourceUrl: "https://www.mercy.net/healthcare-education/graduate/st-louis/rotations/", candidateApplicationUrl: "", sourceQuality: "OFFICIAL_POLICY_PAGE", targetFitAfterResearch: "DUPLICATE_OR_REPLACED", confidence: "HIGH", replacementRecommendation: "DISCARD_FROM_CURRENT_WEDGE", evidenceText: "Duplicate Mercy St. Louis row. Same no-IMG policy.", searchTermsTried: "(duplicate)", futureLaneCandidate: "no_img_observership_currently", reviewerNotes: "Dedupe." },
  { itemId: "cmn21157p009ysb11lhl9d9fe", candidateSourceUrl: "https://gme.metrohealth.org/en/medical-student-program/international-medical-students/", candidateApplicationUrl: "", sourceQuality: "EXACT_OFFICIAL_PROGRAM_PAGE", targetFitAfterResearch: "TARGET_USCE_MATCH", confidence: "HIGH", replacementRecommendation: "REPLACE_SOURCE_URL", evidenceText: "MetroHealth (Cleveland) International Medical Students elective page. Caveat: requires affiliation agreement with home school + $150/4-week fee.", searchTermsTried: "site:metrohealth.org observership visiting medical student IMG elective", futureLaneCandidate: "", reviewerNotes: "Affiliation-required." },
  { itemId: "cmn2111ce0010sb11kh0qbbxa", candidateSourceUrl: "https://www.nychealthandhospitals.org/interns-and-residents/", candidateApplicationUrl: "", sourceQuality: "OFFICIAL_DEPARTMENT_PAGE_WITH_USCE_TEXT", targetFitAfterResearch: "MAYBE_TARGET_MANUAL_REVIEW", confidence: "MEDIUM", replacementRecommendation: "KEEP_WITH_CAVEAT", evidenceText: "Metropolitan Hospital part of NYC H+H. Use umbrella + per-hospital outreach.", searchTermsTried: "(NYC H+H umbrella)", futureLaneCandidate: "nyc_hh_per_hospital", reviewerNotes: "Same as other NYC H+H rows." },
  { itemId: "cmn211162000isb11ch7hhgdh", candidateSourceUrl: "https://www.mountsinai.org/about/international/programs", candidateApplicationUrl: "https://www.mountsinai.org/files/MSHealth/Assets/MSH/observer-application-2017.pdf", sourceQuality: "EXACT_OFFICIAL_PROGRAM_PAGE", targetFitAfterResearch: "TARGET_USCE_MATCH", confidence: "HIGH", replacementRecommendation: "REPLACE_BOTH", evidenceText: "Mount Sinai International Programs — observerships for physicians, nurses, management, non-clinical staff. Caveat: ISMMS electives 'not available to foreign visiting students' — observerships only.", searchTermsTried: "site:mountsinai.org observership IMG international visiting medical student elective", futureLaneCandidate: "", reviewerNotes: "Strong observership replacement; not for non-physician students." },
  { itemId: "cmn2114lg008ksb11hva3gw88", candidateSourceUrl: "https://ighealth.msu.edu/education/global-externship-program/", candidateApplicationUrl: "", sourceQuality: "EXACT_OFFICIAL_PROGRAM_PAGE", targetFitAfterResearch: "TARGET_USCE_MATCH", confidence: "HIGH", replacementRecommendation: "KEEP_CURRENT_SOURCE", evidenceText: "MSU Institute for Global Health Global Externship Program — current URL is the program page. False-positive heuristic flag.", searchTermsTried: "(verified current URL)", futureLaneCandidate: "", reviewerNotes: "Heuristic over-flagged. KEEP." },
  { itemId: "cmn21111q000csb1163kfm97r", candidateSourceUrl: "https://www.nyp.org/globalservices/education-and-training", candidateApplicationUrl: "", sourceQuality: "OFFICIAL_DEPARTMENT_PAGE_WITH_USCE_TEXT", targetFitAfterResearch: "MAYBE_TARGET_MANUAL_REVIEW", confidence: "MEDIUM", replacementRecommendation: "REPLACE_SOURCE_URL", evidenceText: "NYP Global Services Education & Training. Caveat: 'NewYork-Presbyterian is no longer accepting observerships from individuals, though in some cases select departments are still coordinating these.' Columbia VSLO + dedicated visiting-student account.", searchTermsTried: "site:nyp.org observership visiting medical student IMG elective", futureLaneCandidate: "", reviewerNotes: "General observerships paused; specialty observerships only." },
  { itemId: "cmn21114k000esb11q4zw3i16", candidateSourceUrl: "https://www.nyp.org/globalservices/education-and-training", candidateApplicationUrl: "", sourceQuality: "OFFICIAL_DEPARTMENT_PAGE_WITH_USCE_TEXT", targetFitAfterResearch: "MAYBE_TARGET_MANUAL_REVIEW", confidence: "MEDIUM", replacementRecommendation: "REPLACE_SOURCE_URL", evidenceText: "NYP Weill Cornell — same Global Services hub. Weill Cornell uses VSLO for visiting students.", searchTermsTried: "(NYP umbrella search)", futureLaneCandidate: "", reviewerNotes: "Same as Columbia row." },
  { itemId: "cmn2111yi002csb110xhtoeez", candidateSourceUrl: "https://www.nm.org/for-medical-professionals/i-am-a-student", candidateApplicationUrl: "https://physicianforum.nm.org/uploads/1/1/9/4/119404942/clinical_observer_packet_september_2021.pdf", sourceQuality: "EXACT_OFFICIAL_PROGRAM_PAGE", targetFitAfterResearch: "TARGET_USCE_MATCH", confidence: "HIGH", replacementRecommendation: "REPLACE_BOTH", evidenceText: "Northwestern Memorial student hub + Clinical Observer Packet PDF. Summer Observation Program (16+). Confidentiality requirements for PHI.", searchTermsTried: "site:nm.org Northwestern Memorial observership IMG visiting medical student", futureLaneCandidate: "", reviewerNotes: "Strong replacement." },
  { itemId: "cmn21110z000asb11hg2qwrua", candidateSourceUrl: "https://med.nyu.edu/education/md-degree/registration-student-records/information-visiting-md-students", candidateApplicationUrl: "https://med.nyu.edu/departments-institutes/orthopedic-surgery/education/visiting-international-physicians-program", sourceQuality: "EXACT_OFFICIAL_PROGRAM_PAGE", targetFitAfterResearch: "MAYBE_TARGET_MANUAL_REVIEW", confidence: "HIGH", replacementRecommendation: "REPLACE_BOTH", evidenceText: "NYU Langone Visiting MD Students hub. CRITICAL caveat: 'NYU Grossman School of Medicine does not offer an observership opportunity or process visiting student requests from non-LCME medical schools.' Specialty Visiting International Physicians programs exist (Orthopedic Surgery).", searchTermsTried: "site:med.nyu.edu OR site:nyulangone.org observership IMG visiting medical student elective", futureLaneCandidate: "specialty_only", reviewerNotes: "LCME-only for general electives; specialty programs for international physicians." },
  { itemId: "cmn2115f200aisb110lqohi4y", candidateSourceUrl: "https://education.ochsner.org/clined/global-is-local/ochsner-international-observership-program/", candidateApplicationUrl: "https://education.ochsner.org/clined/global-is-local/international-students-observers-at-ochsner/", sourceQuality: "EXACT_OFFICIAL_PROGRAM_PAGE", targetFitAfterResearch: "TARGET_USCE_MATCH", confidence: "HIGH", replacementRecommendation: "REPLACE_BOTH", evidenceText: "Ochsner International Observership Program — open to international medical students/residents/fellows. Caveat: clinical electives policy is 'not to accept international medical students' for course work; observership is the path.", searchTermsTried: "site:ochsner.org observership IMG international visiting medical student", futureLaneCandidate: "", reviewerNotes: "Strong replacement. Faculty sponsorship + financial support evidence required." },
  { itemId: "cmn2115h800aosb11kx2c04ei", candidateSourceUrl: "https://www.ohsu.edu/school-of-medicine/md-program/visiting-students", candidateApplicationUrl: "", sourceQuality: "EXACT_OFFICIAL_PROGRAM_PAGE", targetFitAfterResearch: "MAYBE_TARGET_MANUAL_REVIEW", confidence: "HIGH", replacementRecommendation: "DISCARD_FROM_CURRENT_WEDGE", evidenceText: "OHSU: 'School of Medicine only accepts students from LCME or AOA accredited medical schools.' EM International Visitors Program 'not currently active'.", searchTermsTried: "site:ohsu.edu visiting medical student observership IMG elective international", futureLaneCandidate: "no_img_eligible", reviewerNotes: "Active no-IMG policy." },
  { itemId: "cmn2112ki003usb111wmk4pt8", candidateSourceUrl: "https://www.med.upenn.edu/globalhealth/international-trainees-scholars.html", candidateApplicationUrl: "https://www.med.upenn.edu/globalhealth/international-medical-student-clinical-application.html", sourceQuality: "EXACT_OFFICIAL_PROGRAM_PAGE", targetFitAfterResearch: "TARGET_USCE_MATCH", confidence: "HIGH", replacementRecommendation: "REPLACE_BOTH", evidenceText: "Penn Center for Global Health International Trainees & Scholars + International Medical Student Clinical Application. Caveat: affiliation-agreement only. UPHS GME observership separate (gmepc@uphs.upenn.edu).", searchTermsTried: "site:pennmedicine.org OR site:med.upenn.edu visiting medical student observership IMG", futureLaneCandidate: "", reviewerNotes: "Affiliation-required." },
  { itemId: "cmn2115rj00basb112a50c40u", candidateSourceUrl: "https://towerhealth.org/academic-affairs/medical-student-rotations", candidateApplicationUrl: "https://towerhealth.org/request-rotation", sourceQuality: "OFFICIAL_DEPARTMENT_PAGE_WITH_USCE_TEXT", targetFitAfterResearch: "MAYBE_TARGET_MANUAL_REVIEW", confidence: "MEDIUM", replacementRecommendation: "REPLACE_BOTH", evidenceText: "Tower Health/Reading Hospital Medical Student Rotations + Request a Rotation. Some VSLO-driven. No specific IMG observership info.", searchTermsTried: "site:towerhealth.org Reading Hospital visiting medical student observership", futureLaneCandidate: "", reviewerNotes: "Better than homepage." },
  { itemId: "cmn21150f009ksb11e35rot4t", candidateSourceUrl: "https://rumcsi.org/careers/graduate-medical-education/", candidateApplicationUrl: "", sourceQuality: "OFFICIAL_GENERIC_PAGE", targetFitAfterResearch: "MAYBE_TARGET_MANUAL_REVIEW", confidence: "LOW", replacementRecommendation: "NEEDS_MORE_RESEARCH", evidenceText: "Richmond University Medical Center GME page. Only residency programs surfaced; no dedicated observership landing.", searchTermsTried: "site:rumcsi.org Richmond University Medical Center observership IMG", futureLaneCandidate: "", reviewerNotes: "Try direct contact." },
  { itemId: "cmn211307004usb11g6ij63lj", candidateSourceUrl: "https://rwjms.rutgers.edu/community-global-health/global-health-programs", candidateApplicationUrl: "", sourceQuality: "EXACT_OFFICIAL_PROGRAM_PAGE", targetFitAfterResearch: "MAYBE_TARGET_MANUAL_REVIEW", confidence: "MEDIUM", replacementRecommendation: "REPLACE_SOURCE_URL", evidenceText: "RWJMS: 'does not accept international students for established clerkships and electives' but Office of Global Health offers International Global Health Experience (4-week observership) for partnering institutions.", searchTermsTried: "site:rwjms.rutgers.edu visiting medical student observership IMG elective", futureLaneCandidate: "affiliation_only_no_general_observership", reviewerNotes: "Affiliation-only path." },
  { itemId: "cmn211200002gsb116i7cgugp", candidateSourceUrl: "https://www.rushu.rush.edu/rush-medical-college/admissions/doctor-medicine-md-program/visiting-medical-students", candidateApplicationUrl: "", sourceQuality: "EXACT_OFFICIAL_PROGRAM_PAGE", targetFitAfterResearch: "MAYBE_TARGET_MANUAL_REVIEW", confidence: "HIGH", replacementRecommendation: "DISCARD_FROM_CURRENT_WEDGE", evidenceText: "Rush: 'visiting medical students from LCME-accredited or COCA-accredited medical schools only'. Some specialty observerships exist (PMR).", searchTermsTried: "site:rushu.rush.edu Rush University visiting medical student observership IMG elective", futureLaneCandidate: "no_img_eligible", reviewerNotes: "Active no-IMG policy for general path." },
  { itemId: "cmn2111fx001asb114hiofz1l", candidateSourceUrl: "https://www.sbhny.org/healthcare-professionals/residency-programs/", candidateApplicationUrl: "", sourceQuality: "OFFICIAL_POLICY_PAGE", targetFitAfterResearch: "MAYBE_TARGET_MANUAL_REVIEW", confidence: "MEDIUM", replacementRecommendation: "DISCARD_FROM_CURRENT_WEDGE", evidenceText: "St. Barnabas Bronx Internal Medicine Residency: 'does not offer observership or research positions.' Other departments unclear.", searchTermsTried: "site:sbhny.org St Barnabas Bronx observership IMG visiting medical graduate", futureLaneCandidate: "no_observership_offered", reviewerNotes: "Active no-observership for IM; verify other depts before reviving." },
  { itemId: "cmn2114z5009gsb11laxdyyfc", candidateSourceUrl: "https://ehs.org/medical-education/", candidateApplicationUrl: "", sourceQuality: "OFFICIAL_GENERIC_PAGE", targetFitAfterResearch: "MAYBE_TARGET_MANUAL_REVIEW", confidence: "MEDIUM", replacementRecommendation: "NEEDS_MORE_RESEARCH", evidenceText: "St. John's Episcopal Hospital — Episcopal Health Services Medical Education page. Multiple ACGME residencies welcoming to IMGs but no specific observership info found.", searchTermsTried: "site:ehs.org OR \"St John's Episcopal Hospital\" Far Rockaway observership IMG", futureLaneCandidate: "", reviewerNotes: "Direct contact via Education page." },
  { itemId: "cmn21158f00a0sb11x9a5ozzf", candidateSourceUrl: "https://www.summahealth.org/medicaleducation/elective-programs/senior-elective-information", candidateApplicationUrl: "", sourceQuality: "EXACT_OFFICIAL_PROGRAM_PAGE", targetFitAfterResearch: "MAYBE_TARGET_MANUAL_REVIEW", confidence: "HIGH", replacementRecommendation: "DISCARD_FROM_CURRENT_WEDGE", evidenceText: "Summa Health: M-4 from LCME or AOA-accredited only. No IMG observership path.", searchTermsTried: "site:summahealth.org observership visiting medical student IMG elective", futureLaneCandidate: "no_img_eligible", reviewerNotes: "Active no-IMG policy." },
  { itemId: "cmn2113c1005ksb11e54msb6c", candidateSourceUrl: "https://medicine.tulane.edu/student-affairs/visiting-students", candidateApplicationUrl: "", sourceQuality: "OFFICIAL_POLICY_PAGE", targetFitAfterResearch: "MAYBE_TARGET_MANUAL_REVIEW", confidence: "HIGH", replacementRecommendation: "DISCARD_FROM_CURRENT_WEDGE", evidenceText: "Tulane: 'cannot accommodate students from medical schools located outside of the United States.' Internal Medicine: 'unable to offer observerships and externships at this time.'", searchTermsTried: "site:medicine.tulane.edu visiting medical student observership IMG international", futureLaneCandidate: "no_img_no_observership", reviewerNotes: "Double no policy." },
  { itemId: "cmn2114hw008asb1171avairi", candidateSourceUrl: "https://hsi.ucsd.edu/education/physicians/enhanced-clinical-skills", candidateApplicationUrl: "", sourceQuality: "EXACT_OFFICIAL_PROGRAM_PAGE", targetFitAfterResearch: "TARGET_USCE_MATCH", confidence: "HIGH", replacementRecommendation: "KEEP_CURRENT_SOURCE", evidenceText: "UCSD ACE Program (Accelerated Clinical Experience) — current URL IS the program page. Specifically for IMGs preparing for ERAS. B-1 visa, 2-4 months. False-positive heuristic flag.", searchTermsTried: "site:hsi.ucsd.edu OR site:ucsd.edu Bridge to Residency ACE Program visiting medical IMG", futureLaneCandidate: "", reviewerNotes: "Heuristic over-flagged. KEEP." },
  { itemId: "cmn2114vr0096sb11tmv3xquq", candidateSourceUrl: "https://hsi.ucsd.edu/education/physicians/bridge-to-residency-program-for-physicians", candidateApplicationUrl: "", sourceQuality: "EXACT_OFFICIAL_PROGRAM_PAGE", targetFitAfterResearch: "TARGET_USCE_MATCH", confidence: "HIGH", replacementRecommendation: "KEEP_CURRENT_SOURCE", evidenceText: "UCSD Bridge to Residency Program — current URL IS the program page. 6-12 month IMG-targeted certificate program. False-positive heuristic flag.", searchTermsTried: "(reuse UCSD HSI search)", futureLaneCandidate: "", reviewerNotes: "Heuristic over-flagged. KEEP." },
  { itemId: "cmn2111nj001osb1129xg34rr", candidateSourceUrl: "https://meded.ucsf.edu/visiting-student-program", candidateApplicationUrl: "", sourceQuality: "EXACT_OFFICIAL_PROGRAM_PAGE", targetFitAfterResearch: "MAYBE_TARGET_MANUAL_REVIEW", confidence: "HIGH", replacementRecommendation: "DISCARD_FROM_CURRENT_WEDGE", evidenceText: "UCSF Visiting Student Program — LCME-accredited / COCA-accredited only. Max 12 weeks.", searchTermsTried: "site:meded.ucsf.edu OR site:medschool.ucsf.edu visiting medical student observership IMG elective", futureLaneCandidate: "no_img_eligible", reviewerNotes: "Active no-IMG policy." },
  { itemId: "cmn2112rm0046sb11vospyk2p", candidateSourceUrl: "https://www.med.unc.edu/oghe/visiting-international-students/ivs-elective-scheduling/", candidateApplicationUrl: "https://www.med.unc.edu/wrkunits/1dean/ome/stuaff/forms/Production/international.htm", sourceQuality: "EXACT_OFFICIAL_PROGRAM_PAGE", targetFitAfterResearch: "TARGET_USCE_MATCH", confidence: "HIGH", replacementRecommendation: "REPLACE_BOTH", evidenceText: "UNC International Visiting Student (IVS) Program — Office of Global Health Education. Final-year international students. $2,500/elective ($500 deposit). Apply 4-6 months before.", searchTermsTried: "site:med.unc.edu UNC visiting medical student observership IMG elective international", futureLaneCandidate: "", reviewerNotes: "Strong canonical replacement." },
  { itemId: "cmn2115v300bksb11ngyv1xao", candidateSourceUrl: "https://medicine.uams.edu/students/visiting-students/", candidateApplicationUrl: "", sourceQuality: "OFFICIAL_POLICY_PAGE", targetFitAfterResearch: "MAYBE_TARGET_MANUAL_REVIEW", confidence: "HIGH", replacementRecommendation: "DISCARD_FROM_CURRENT_WEDGE", evidenceText: "UAMS: 'does not sponsor observerships or externships. The University policy allows rotations by medical students currently enrolled in LCME medical schools only.'", searchTermsTried: "site:uams.edu visiting medical student observership IMG elective international", futureLaneCandidate: "no_img_no_observership", reviewerNotes: "Double no policy." },
  { itemId: "cmn2115al00a6sb11rw5ecehe", candidateSourceUrl: "https://med.uc.edu/education/medical-student-education/office-of-medical-education/visiting-students", candidateApplicationUrl: "", sourceQuality: "OFFICIAL_POLICY_PAGE", targetFitAfterResearch: "MAYBE_TARGET_MANUAL_REVIEW", confidence: "HIGH", replacementRecommendation: "DISCARD_FROM_CURRENT_WEDGE", evidenceText: "UC Cincinnati: 'Observerships are not available... for domestic or international visiting medical students. The College is not accepting international students for clinical electives currently.'", searchTermsTried: "site:uchealth.com OR site:med.uc.edu Cincinnati visiting medical student observership IMG", futureLaneCandidate: "no_img_no_observership", reviewerNotes: "Double no policy." },
  { itemId: "cmn2113jz0060sb11qa6zlypu", candidateSourceUrl: "https://medicine.uiowa.edu/md/student-support/visiting-student-information-and-application", candidateApplicationUrl: "", sourceQuality: "OFFICIAL_POLICY_PAGE", targetFitAfterResearch: "MAYBE_TARGET_MANUAL_REVIEW", confidence: "HIGH", replacementRecommendation: "DISCARD_FROM_CURRENT_WEDGE", evidenceText: "U Iowa: LCME-accredited only (limited DO exception for Des Moines U). Pathology dept: 'does not currently provide faculty or service-specific observerships for international medical trainees.'", searchTermsTried: "site:medicine.uiowa.edu visiting medical student observership IMG elective international", futureLaneCandidate: "no_img_eligible", reviewerNotes: "Active no-IMG policy." },
  // ---- BATCH 004 (rows 91-120) ----
  { itemId: "cmn2115ud00bisb11k3wltm6f", candidateSourceUrl: "https://www.kumc.edu/academic-and-student-affairs/departments/office-of-international-programs/inbound-programs/information-for-irsd-observers-and-visitors/international-observership-program.html", candidateApplicationUrl: "", sourceQuality: "EXACT_OFFICIAL_PROGRAM_PAGE", targetFitAfterResearch: "TARGET_USCE_MATCH", confidence: "HIGH", replacementRecommendation: "REPLACE_SOURCE_URL", evidenceText: "KUMC International Observership Program — for visiting residents/physicians/MD graduates. 4 weeks max. $3,000/month. Med students ineligible for observerships; clinical electives separate path.", searchTermsTried: "site:kumc.edu visiting medical student observership IMG elective international", futureLaneCandidate: "", reviewerNotes: "Strong IMG observership path." },
  { itemId: "cmn2113h5005ysb11u6inmy50", candidateSourceUrl: "https://medicine.uky.edu/sites/meded/visiting-students", candidateApplicationUrl: "", sourceQuality: "EXACT_OFFICIAL_PROGRAM_PAGE", targetFitAfterResearch: "TARGET_USCE_MATCH", confidence: "HIGH", replacementRecommendation: "REPLACE_SOURCE_URL", evidenceText: "U Kentucky Visiting Students hub + multiple dept observership pages (IM, Surgery, Radiology, Neurology). Affiliation-required + $75 placement fee.", searchTermsTried: "site:medicine.uky.edu Kentucky visiting medical student observership IMG elective", futureLaneCandidate: "", reviewerNotes: "Affiliation-required." },
  { itemId: "cmn2112v6004gsb11vhhinr8a", candidateSourceUrl: "https://medicine.umich.edu/medschool/education/visiting-students", candidateApplicationUrl: "https://medicine.umich.edu/dept/globalreach/faq-visiting-medical-students", sourceQuality: "EXACT_OFFICIAL_PROGRAM_PAGE", targetFitAfterResearch: "TARGET_USCE_MATCH", confidence: "HIGH", replacementRecommendation: "REPLACE_BOTH", evidenceText: "U Michigan UMMS Visiting Students + Global REACH FAQ for international students. Institutional agreement required + TOEFL.", searchTermsTried: "site:medicine.umich.edu Michigan visiting medical student observership IMG elective international", futureLaneCandidate: "", reviewerNotes: "Affiliation-required." },
  { itemId: "cmn2115vt00bmsb11oodepaa9", candidateSourceUrl: "https://umc.edu/Office%20of%20Academic%20Affairs/About-Academic-Affairs/Academic-Affiliations/Educational-Observers.html", candidateApplicationUrl: "https://umc.edu/som/Departments%20and%20Offices/SOM%20Departments/Anesthesiology/Educational-Programs/Educational-Observer-Program.html", sourceQuality: "OFFICIAL_DEPARTMENT_PAGE_WITH_USCE_TEXT", targetFitAfterResearch: "MAYBE_TARGET_MANUAL_REVIEW", confidence: "MEDIUM", replacementRecommendation: "REPLACE_BOTH", evidenceText: "UMMC Educational Observers + dept-specific Anesth Educational Observer Program. Visiting electives LCME/AOA only; IMGs not eligible for IM Scholars Observership.", searchTermsTried: "site:umc.edu Mississippi visiting medical student observership IMG elective", futureLaneCandidate: "", reviewerNotes: "Limited IMG paths via specific depts." },
  { itemId: "cmn2112zg004ssb11ibc3ebim", candidateSourceUrl: "https://medicine.missouri.edu/departments/neurology/observership", candidateApplicationUrl: "", sourceQuality: "EXACT_OFFICIAL_PROGRAM_PAGE", targetFitAfterResearch: "MAYBE_TARGET_MANUAL_REVIEW", confidence: "MEDIUM", replacementRecommendation: "REPLACE_SOURCE_URL", evidenceText: "U Missouri Neurology Observership — IMED-school OK. General visiting electives LCME/COCA only. Note: 'observerships are not considered as clinical experience'.", searchTermsTried: "site:medicine.missouri.edu visiting medical student observership IMG elective", futureLaneCandidate: "", reviewerNotes: "Specialty IMG path; main visiting electives LCME-only." },
  { itemId: "cmn2113kp0062sb11wyre9lqr", candidateSourceUrl: "https://www.unmc.edu/neurologicalsciences/education/international-observership.html", candidateApplicationUrl: "", sourceQuality: "EXACT_OFFICIAL_PROGRAM_PAGE", targetFitAfterResearch: "TARGET_USCE_MATCH", confidence: "HIGH", replacementRecommendation: "REPLACE_SOURCE_URL", evidenceText: "UNMC Neurology International Observership Program — physicians worldwide observe attendings/residents. $1,500 fee. UNMC general electives don't accept international/non-LCME schools.", searchTermsTried: "site:unmc.edu Nebraska visiting medical student observership IMG elective", futureLaneCandidate: "", reviewerNotes: "Specialty observership path." },
  { itemId: "cmn2115n200aysb11lq9efqq3", candidateSourceUrl: "https://hsc.unm.edu/medicine/education/md/student-affairs/visiting-medical-students/", candidateApplicationUrl: "", sourceQuality: "OFFICIAL_POLICY_PAGE", targetFitAfterResearch: "MAYBE_TARGET_MANUAL_REVIEW", confidence: "HIGH", replacementRecommendation: "DISCARD_FROM_CURRENT_WEDGE", evidenceText: "UNM SOM: 'No' to IMG observerships. Final-year medical students for credit only. No observerships/shadowing/research electives for visiting students.", searchTermsTried: "site:hsc.unm.edu OR site:health.unm.edu New Mexico visiting medical student observership IMG", futureLaneCandidate: "no_img_eligible", reviewerNotes: "Active no-IMG-observership." },
  { itemId: "cmn2115cs00acsb11onyobib8", candidateSourceUrl: "https://www.utmb.edu/visiting-education", candidateApplicationUrl: "", sourceQuality: "OFFICIAL_POLICY_PAGE", targetFitAfterResearch: "MAYBE_TARGET_MANUAL_REVIEW", confidence: "HIGH", replacementRecommendation: "DISCARD_FROM_CURRENT_WEDGE", evidenceText: "UTMB: 'does not currently have opportunities for international medical students to complete observerships.' VSLO LCME only.", searchTermsTried: "site:utmb.edu visiting medical student observership IMG international elective", futureLaneCandidate: "no_img_observership_currently", reviewerNotes: "No IMG observership currently." },
  { itemId: "cmn2115nu00b0sb11bnr4d3ru", candidateSourceUrl: "https://medicine.utah.edu/global-health-education/department-sponsored-visitors-program", candidateApplicationUrl: "", sourceQuality: "EXACT_OFFICIAL_PROGRAM_PAGE", targetFitAfterResearch: "TARGET_USCE_MATCH", confidence: "HIGH", replacementRecommendation: "REPLACE_SOURCE_URL", evidenceText: "U Utah Department-Sponsored Visitors Program — IMGs allowed (observation only, no hands-on patient care). $40 + $200/week.", searchTermsTried: "site:healthcare.utah.edu OR site:medicine.utah.edu Utah visiting medical student observership IMG", futureLaneCandidate: "", reviewerNotes: "Strong IMG observership path." },
  { itemId: "cmn2113ex005ssb11z7kp129f", candidateSourceUrl: "https://med.virginia.edu/md-program/student-affairs/visiting-student-electives/", candidateApplicationUrl: "", sourceQuality: "OFFICIAL_POLICY_PAGE", targetFitAfterResearch: "MAYBE_TARGET_MANUAL_REVIEW", confidence: "HIGH", replacementRecommendation: "DISCARD_FROM_CURRENT_WEDGE", evidenceText: "UVA: 'does not accept osteopathic or international visiting medical students at this time.'", searchTermsTried: "site:med.virginia.edu UVA Virginia visiting medical student observership IMG elective", futureLaneCandidate: "no_img_eligible", reviewerNotes: "Active no-IMG policy." },
  { itemId: "cmn2112fx003isb11x5b08yua", candidateSourceUrl: "https://wp.uthscsa.edu/ois/immigration/b-1/vmse/", candidateApplicationUrl: "https://wp.uthscsa.edu/ois/immigration/b-1/physician-observer/", sourceQuality: "EXACT_OFFICIAL_PROGRAM_PAGE", targetFitAfterResearch: "TARGET_USCE_MATCH", confidence: "HIGH", replacementRecommendation: "REPLACE_BOTH", evidenceText: "UT Health San Antonio Visiting Medical Student Elective + Physician Observer pages — explicit B-1 visa path for IMGs. 2 four-week electives max.", searchTermsTried: "site:uthscsa.edu Texas San Antonio visiting medical student observership IMG elective", futureLaneCandidate: "", reviewerNotes: "Strong B-1 visa path." },
  { itemId: "cmn2115bd00a8sb115h6bhehv", candidateSourceUrl: "https://www.utsouthwestern.edu/education/medical-school/admissions/visiting/international.html", candidateApplicationUrl: "https://studentservices.utsouthwestern.edu/VMS", sourceQuality: "EXACT_OFFICIAL_PROGRAM_PAGE", targetFitAfterResearch: "TARGET_USCE_MATCH", confidence: "HIGH", replacementRecommendation: "REPLACE_BOTH", evidenceText: "UTSW Visiting Medical Students from International Medical Schools — B-1 visa sponsored by UTSW. 4-month lead time. 2 four-week max. IMG-eligible.", searchTermsTried: "site:utsouthwestern.edu visiting medical student observership IMG elective international", futureLaneCandidate: "", reviewerNotes: "Strong B-1 visa-sponsored path." },
  { itemId: "cmn2112ds003csb11nwgawjyr", candidateSourceUrl: "https://www.utsouthwestern.edu/education/medical-school/admissions/visiting/international.html", candidateApplicationUrl: "https://studentservices.utsouthwestern.edu/VMS", sourceQuality: "EXACT_OFFICIAL_PROGRAM_PAGE", targetFitAfterResearch: "DUPLICATE_OR_REPLACED", confidence: "HIGH", replacementRecommendation: "REPLACE_BOTH", evidenceText: "Duplicate UTSW row.", searchTermsTried: "(duplicate)", futureLaneCandidate: "", reviewerNotes: "Dedupe." },
  { itemId: "cmn2113fn005usb11jprkbjsa", candidateSourceUrl: "https://medschool.vcu.edu/education/md-program/m4_electives/", candidateApplicationUrl: "", sourceQuality: "OFFICIAL_GENERIC_PAGE", targetFitAfterResearch: "MAYBE_TARGET_MANUAL_REVIEW", confidence: "MEDIUM", replacementRecommendation: "NEEDS_MORE_RESEARCH", evidenceText: "VCU SOM M4 electives page. Direct registrar contact required. No clear IMG observership info.", searchTermsTried: "site:vcuhealth.org OR site:medschool.vcu.edu visiting medical student observership IMG elective", futureLaneCandidate: "", reviewerNotes: "Email SOMRegistrar@vcuhealth.org." },
  { itemId: "cmn2112sb0048sb11hdvon18l", candidateSourceUrl: "https://school.wakehealth.edu/education-and-training/md-program/visiting-medical-students", candidateApplicationUrl: "", sourceQuality: "EXACT_OFFICIAL_PROGRAM_PAGE", targetFitAfterResearch: "MAYBE_TARGET_MANUAL_REVIEW", confidence: "MEDIUM", replacementRecommendation: "KEEP_WITH_CAVEAT", evidenceText: "Wake Forest Visiting MD Students — LCME/COCA + USMLE Step 1. IMG documentation requirements exist but no specific observership program for IMGs.", searchTermsTried: "site:school.wakehealth.edu Wake Forest visiting medical student observership IMG", futureLaneCandidate: "", reviewerNotes: "VSLO-driven; verify IMG eligibility per specialty." },
  { itemId: "cmn2112xb004msb11lxcsbuqj", candidateSourceUrl: "https://recordsandreg.med.wayne.edu/vslo/visitingstudents", candidateApplicationUrl: "", sourceQuality: "OFFICIAL_POLICY_PAGE", targetFitAfterResearch: "MAYBE_TARGET_MANUAL_REVIEW", confidence: "HIGH", replacementRecommendation: "DISCARD_FROM_CURRENT_WEDGE", evidenceText: "Wayne State: 'sole-sponsored programs do not offer observership opportunities at this time.' Pathology: no formal observership.", searchTermsTried: "site:med.wayne.edu Wayne State visiting medical student observership IMG elective", futureLaneCandidate: "no_observership_offered", reviewerNotes: "Active no-observership." },
  { itemId: "cmn2111el0016sb11s4ch7y7z", candidateSourceUrl: "http://www.wyckoffhospital.org/patients-visitors/medical-professionals/", candidateApplicationUrl: "", sourceQuality: "OFFICIAL_GENERIC_PAGE", targetFitAfterResearch: "MAYBE_TARGET_MANUAL_REVIEW", confidence: "LOW", replacementRecommendation: "NEEDS_MORE_RESEARCH", evidenceText: "Wyckoff Heights Medical Center — Brooklyn teaching hospital. No specific observership landing page found. NYMC-affiliated residency.", searchTermsTried: "site:wyckoffhospital.org Wyckoff Heights observership IMG visiting medical graduate", futureLaneCandidate: "", reviewerNotes: "Direct contact via Medical Professionals page." },
  { itemId: "cmn2114zu009isb116spgam3g", candidateSourceUrl: "http://www.wyckoffhospital.org/patients-visitors/medical-professionals/", candidateApplicationUrl: "", sourceQuality: "OFFICIAL_GENERIC_PAGE", targetFitAfterResearch: "DUPLICATE_OR_REPLACED", confidence: "LOW", replacementRecommendation: "NEEDS_MORE_RESEARCH", evidenceText: "Duplicate Wyckoff row.", searchTermsTried: "(duplicate)", futureLaneCandidate: "", reviewerNotes: "Dedupe." },
  { itemId: "cmn21135e0052sb11ny77telu", candidateSourceUrl: "https://medicine.yale.edu/md-program/visiting-students/international/", candidateApplicationUrl: "https://medicine.yale.edu/md-program/visiting-students/international/faqs/", sourceQuality: "EXACT_OFFICIAL_PROGRAM_PAGE", targetFitAfterResearch: "TARGET_USCE_MATCH", confidence: "HIGH", replacementRecommendation: "REPLACE_BOTH", evidenceText: "Yale Visiting International Student Elective Program — IMG-eligible electives via VSLO. CRITICAL: 'Yale does not offer observerships/externships' — electives only. Visitor visa OK (no F-1/J-1 needed).", searchTermsTried: "site:medicine.yale.edu Yale visiting medical student observership IMG elective international", futureLaneCandidate: "", reviewerNotes: "Strong IMG elective path; not observership." },
  { itemId: "cmn2112uj004esb119x368xuh", candidateSourceUrl: "https://www.augusta.edu/mcg/coffice/curriculum/index.php", candidateApplicationUrl: "", sourceQuality: "OFFICIAL_POLICY_PAGE", targetFitAfterResearch: "MAYBE_TARGET_MANUAL_REVIEW", confidence: "HIGH", replacementRecommendation: "DISCARD_FROM_CURRENT_WEDGE", evidenceText: "MCG: 'does not currently accept international medical students or students from offshore medical schools for visiting electives.'", searchTermsTried: "site:augusta.edu MCG Medical College Georgia visiting medical student observership IMG", futureLaneCandidate: "no_img_eligible", reviewerNotes: "Active no-IMG policy." },
  { itemId: "cmn2112wn004ksb119xp19fdc", candidateSourceUrl: "https://www.beaumont.org/medical-education/graduate-medical-education", candidateApplicationUrl: "", sourceQuality: "EXACT_OFFICIAL_PROGRAM_PAGE", targetFitAfterResearch: "TARGET_USCE_MATCH", confidence: "HIGH", replacementRecommendation: "KEEP_CURRENT_SOURCE", evidenceText: "Beaumont/Corewell GME page is the canonical med-ed landing. Heuristic flagged DEEP_PATH_NO_HINT but URL is appropriate.", searchTermsTried: "(verified)", futureLaneCandidate: "", reviewerNotes: "Heuristic over-flagged. KEEP." },
  { itemId: "cmo33864p00231ny906n8z8bp", candidateSourceUrl: "https://www.brighamandwomens.org/emergency-medicine/critical-care/global-training-program", candidateApplicationUrl: "", sourceQuality: "EXACT_OFFICIAL_PROGRAM_PAGE", targetFitAfterResearch: "TARGET_USCE_MATCH", confidence: "HIGH", replacementRecommendation: "KEEP_CURRENT_SOURCE", evidenceText: "Brigham Global EM/Critical Care Training Program — current URL IS the program page.", searchTermsTried: "(verified)", futureLaneCandidate: "", reviewerNotes: "Heuristic over-flagged. KEEP." },
  { itemId: "cmn2111o8001qsb11j87evr4c", candidateSourceUrl: "", candidateApplicationUrl: "", sourceQuality: "NO_BETTER_SOURCE_FOUND", targetFitAfterResearch: "MAYBE_TARGET_MANUAL_REVIEW", confidence: "LOW", replacementRecommendation: "NEEDS_MORE_RESEARCH", evidenceText: "Cedars-Sinai — no medical student observership/IMG program surfaced. International services are patient-facing.", searchTermsTried: "site:cedars-sinai.org observership visiting medical student IMG international", futureLaneCandidate: "", reviewerNotes: "Try direct contact with GME." },
  { itemId: "cmn2114mz008osb114617lwli", candidateSourceUrl: "https://www.cincinnatichildrens.org/professional/resources/international-visitor-program", candidateApplicationUrl: "", sourceQuality: "EXACT_OFFICIAL_PROGRAM_PAGE", targetFitAfterResearch: "TARGET_USCE_MATCH", confidence: "HIGH", replacementRecommendation: "KEEP_CURRENT_SOURCE", evidenceText: "Cincinnati Children's International Visitor Program — current URL IS the canonical page.", searchTermsTried: "(verified)", futureLaneCandidate: "", reviewerNotes: "Heuristic over-flagged. KEEP." },
  { itemId: "cmn2113p5006esb11skojaztp", candidateSourceUrl: "https://my.clevelandclinic.org/departments/research-education/postdoctoral-programs", candidateApplicationUrl: "", sourceQuality: "EXACT_OFFICIAL_PROGRAM_PAGE", targetFitAfterResearch: "MAYBE_TARGET_MANUAL_REVIEW", confidence: "LOW", replacementRecommendation: "KEEP_WITH_CAVEAT", evidenceText: "Cleveland Clinic Research Fellowship: postdoctoral research positions for MD/MBBS graduates. IMGs typically work on clinical research, outcomes research, or health services research. J1 visa sponsorship usually available through the institution. Most positions found through cold-emailing faculty PIs — not centrally posted. Keep on the wedge as a low-priority secondary path.", searchTermsTried: "(doctrine reclassified — research path)", futureLaneCandidate: "research_track_secondary", reviewerNotes: "Same low-priority research caveat as batch 001 postdoc rows." },
  { itemId: "cmn2114sz008ysb114tl0vvdr", candidateSourceUrl: "https://commonspiritinternational.org/education-programs/", candidateApplicationUrl: "", sourceQuality: "EXACT_OFFICIAL_PROGRAM_PAGE", targetFitAfterResearch: "TARGET_USCE_MATCH", confidence: "HIGH", replacementRecommendation: "KEEP_CURRENT_SOURCE", evidenceText: "CommonSpirit International Clinical Observation — current URL IS the program landing.", searchTermsTried: "(verified)", futureLaneCandidate: "", reviewerNotes: "Heuristic over-flagged. KEEP." },
  { itemId: "cmn2112nm0042sb119q64hx5i", candidateSourceUrl: "https://drexel.edu/medicine/academics/continuing-education/physician-refresher-re-entry-program/for-prospective-students/international-students-observerships/", candidateApplicationUrl: "", sourceQuality: "EXACT_OFFICIAL_PROGRAM_PAGE", targetFitAfterResearch: "TARGET_USCE_MATCH", confidence: "HIGH", replacementRecommendation: "REPLACE_SOURCE_URL", evidenceText: "Drexel Physician Refresher / Re-Entry Program — Observerships for International Medical Graduates (IMG). Found in batch 001 search.", searchTermsTried: "(reuse from batch 001 Brookdale search)", futureLaneCandidate: "", reviewerNotes: "Strong IMG observership program." },
  { itemId: "cmo3385r8001l1ny9zaacztke", candidateSourceUrl: "https://med.emory.edu/education/admissions/visiting/index.html", candidateApplicationUrl: "https://med.emory.edu/education/admissions/visiting/md_files/ApplicationforVisitingStudent.pdf", sourceQuality: "EXACT_OFFICIAL_PROGRAM_PAGE", targetFitAfterResearch: "TARGET_USCE_MATCH", confidence: "HIGH", replacementRecommendation: "KEEP_CURRENT_SOURCE", evidenceText: "Emory Visiting Student / Clinical Observership — current URL IS the canonical visiting students page (same as batch 002 Emory).", searchTermsTried: "(reuse from batch 002 Emory)", futureLaneCandidate: "", reviewerNotes: "Heuristic over-flagged. KEEP." },
  { itemId: "cmn2111d40012sb11t82kblsc", candidateSourceUrl: "https://flushinghospital.org/graduate-medical-education/", candidateApplicationUrl: "", sourceQuality: "OFFICIAL_GENERIC_PAGE", targetFitAfterResearch: "MAYBE_TARGET_MANUAL_REVIEW", confidence: "HIGH", replacementRecommendation: "DISCARD_FROM_CURRENT_WEDGE", evidenceText: "Flushing GME page — per batch 002, hospital does not offer observerships.", searchTermsTried: "(reuse batch 002 Flushing)", futureLaneCandidate: "no_observership_offered", reviewerNotes: "Same finding as batch 002." },
  { itemId: "cmn2113ue006ssb11j9eieieh", candidateSourceUrl: "https://www.fredhutch.org/en/education-training/health-care-professionals/visiting-physician-program.html", candidateApplicationUrl: "", sourceQuality: "EXACT_OFFICIAL_PROGRAM_PAGE", targetFitAfterResearch: "MAYBE_TARGET_MANUAL_REVIEW", confidence: "MEDIUM", replacementRecommendation: "REPLACE_SOURCE_URL", evidenceText: "Fred Hutch Visiting Physician Program — for foreign physicians with 2+ yrs IM training to observe BMT (Blood and Marrow Transplant). Specialist/post-residency only.", searchTermsTried: "site:fredhutch.org OR site:fredhutch.edu visiting observership clinical IMG cancer", futureLaneCandidate: "", reviewerNotes: "Specialist BMT-only path." },
];

function csvEscape(v: string | number | boolean | null | undefined): string {
  const s = String(v ?? "");
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

interface InputRow {
  batchId: string;
  itemId: string;
  title: string;
  currentSourceUrl: string;
  currentVerdict: string;
  recommendedAction: string;
  targetFit: string;
  whyNeedsReview: string;
}

function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let q = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (q && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else q = !q;
    } else if (c === "," && !q) {
      out.push(cur);
      cur = "";
    } else cur += c;
  }
  out.push(cur);
  return out;
}

async function main() {
  const batchPaths = [
    "docs/platform-v2/local/p96_4b_batch_001_input.csv",
    "docs/platform-v2/local/p96_4b_batch_002_input.csv",
    "docs/platform-v2/local/p96_4b_batch_003_input.csv",
    "docs/platform-v2/local/p96_4b_batch_004_input.csv",
    "docs/platform-v2/local/p96_4b_batch_005_input.csv",
    "docs/platform-v2/local/p96_4b_batch_006_input.csv",
  ];
  const allLines: string[] = [];
  let header: string[] = [];
  for (const p of batchPaths) {
    try {
      const txt = await readFile(p, "utf8");
      const ls = txt.split(/\r?\n/).filter((l) => l.trim());
      if (header.length === 0) header = splitCsvLine(ls[0]);
      allLines.push(...ls.slice(1));
    } catch {
      // batch file may not exist yet
    }
  }
  const inputRows: InputRow[] = allLines.map((l) => {
    const cells = splitCsvLine(l);
    const o: Record<string, string> = {};
    header.forEach((k, i) => (o[k] = cells[i] ?? ""));
    return {
      batchId: o.batchId,
      itemId: o.itemId,
      title: o.title,
      currentSourceUrl: o.currentSourceUrl,
      currentVerdict: o.currentVerdict,
      recommendedAction: o.recommendedAction,
      targetFit: o.targetFit,
      whyNeedsReview: o.whyNeedsReview,
    };
  });

  const decisionByItem = new Map(DECISIONS.map((d) => [d.itemId, d]));

  const candidatesHeader = [
    "batchId",
    "itemId",
    "title",
    "currentSourceUrl",
    "currentVerdict",
    "currentRecommendedAction",
    "targetFitBeforeResearch",
    "searchTermsTried",
    "candidateSourceUrl",
    "candidateApplicationUrl",
    "sourceQuality",
    "targetFitAfterResearch",
    "confidence",
    "replacementRecommendation",
    "evidenceText",
    "futureLaneCandidate",
    "reviewerNotes",
    "shouldUserReview",
    "priority",
  ];
  const candidateRows: string[] = [candidatesHeader.join(",")];
  const noBetterRows: string[] = [
    "batchId,itemId,title,currentSourceUrl,reasonNoBetterSourceFound,termsTried,recommendedNextStep",
  ];

  for (const r of inputRows) {
    const d = decisionByItem.get(r.itemId);
    if (!d) {
      candidateRows.push(
        [
          r.batchId,
          r.itemId,
          r.title,
          r.currentSourceUrl,
          r.currentVerdict,
          r.recommendedAction,
          r.targetFit,
          "",
          "",
          "",
          "NOT_RESEARCHED",
          r.targetFit,
          "LOW",
          "NEEDS_MORE_RESEARCH",
          "Not researched in batch_001 — no matching itemId in DECISIONS.",
          "",
          "",
          "true",
          "5",
        ]
          .map(csvEscape)
          .join(","),
      );
      continue;
    }
    const shouldUserReview =
      d.confidence === "HIGH" && d.replacementRecommendation !== "NEEDS_MORE_RESEARCH" ? "false" : "true";
    const priority =
      d.replacementRecommendation === "REPLACE_BOTH" || d.replacementRecommendation === "REPLACE_SOURCE_URL"
        ? "1"
        : d.replacementRecommendation === "DISCARD_FROM_CURRENT_WEDGE"
          ? "2"
          : d.replacementRecommendation === "KEEP_CURRENT_SOURCE"
            ? "4"
            : "3";

    candidateRows.push(
      [
        r.batchId,
        r.itemId,
        r.title,
        r.currentSourceUrl,
        r.currentVerdict,
        r.recommendedAction,
        r.targetFit,
        d.searchTermsTried,
        d.candidateSourceUrl,
        d.candidateApplicationUrl,
        d.sourceQuality,
        d.targetFitAfterResearch,
        d.confidence,
        d.replacementRecommendation,
        d.evidenceText,
        d.futureLaneCandidate,
        d.reviewerNotes,
        shouldUserReview,
        priority,
      ]
        .map(csvEscape)
        .join(","),
    );

    if (d.sourceQuality === "NO_BETTER_SOURCE_FOUND" || d.replacementRecommendation === "NEEDS_MORE_RESEARCH") {
      noBetterRows.push(
        [
          r.batchId,
          r.itemId,
          r.title,
          r.currentSourceUrl,
          d.evidenceText,
          d.searchTermsTried,
          d.reviewerNotes,
        ]
          .map(csvEscape)
          .join(","),
      );
    }
  }

  await writeFile(
    "docs/platform-v2/local/p96_4b_relink_candidates.csv",
    candidateRows.join("\n") + "\n",
    "utf8",
  );
  await writeFile(
    "docs/platform-v2/local/p96_4b_no_better_source_found.csv",
    noBetterRows.join("\n") + "\n",
    "utf8",
  );

  // Per-search log
  const logRows: string[] = ["batchId,itemId,queryOrAction,urlOpened,result,notes,timestamp"];
  const ts = new Date().toISOString();
  for (const d of DECISIONS) {
    logRows.push(
      [
        "001",
        d.itemId,
        d.searchTermsTried,
        d.candidateSourceUrl || "(none)",
        d.sourceQuality,
        d.evidenceText.slice(0, 200),
        ts,
      ]
        .map(csvEscape)
        .join(","),
    );
  }
  await writeFile(
    "docs/platform-v2/local/p96_4b_relink_research_log.csv",
    logRows.join("\n") + "\n",
    "utf8",
  );

  // Patch the workbench JSON so the UI can render candidates.
  const wbPath = "docs/platform-v2/local/review-workbench/review-data.json";
  const wb = JSON.parse(await readFile(wbPath, "utf8"));
  for (const it of wb.items) {
    const d = decisionByItem.get(it.itemId);
    if (!d) continue;
    it.relink = {
      candidateSourceUrl: d.candidateSourceUrl,
      candidateApplicationUrl: d.candidateApplicationUrl,
      sourceQuality: d.sourceQuality,
      confidence: d.confidence,
      replacementRecommendation: d.replacementRecommendation,
      targetFitAfterResearch: d.targetFitAfterResearch,
      evidenceText: d.evidenceText,
      searchTermsTried: d.searchTermsTried,
      futureLaneCandidate: d.futureLaneCandidate,
      reviewerNotes: d.reviewerNotes,
    };
  }
  wb.relinkBatch = "001";
  wb.relinkResearchedCount = DECISIONS.length;
  await writeFile(wbPath, JSON.stringify(wb, null, 2), "utf8");

  console.log(`Wrote ${candidateRows.length - 1} candidate rows.`);
  console.log(`Wrote ${noBetterRows.length - 1} no-better-source rows.`);
  console.log(`Wrote ${logRows.length - 1} log entries.`);
  console.log(`Patched ${wbPath} with relink data for ${DECISIONS.length} items.`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
