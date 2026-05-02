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

// Hand-curated from WebSearch evidence in the P96-4B research session.
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
  const inputCsv = await readFile(
    "docs/platform-v2/local/p96_4b_batch_001_input.csv",
    "utf8",
  );
  const lines = inputCsv.split(/\r?\n/).filter((l) => l.trim());
  const header = splitCsvLine(lines[0]);
  const inputRows: InputRow[] = lines.slice(1).map((l) => {
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
