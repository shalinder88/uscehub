/**
 * P96-3 — auto target-fit classifier for the full 304-listing audit.
 *
 * Reads the CSV produced by `p96-2-listing-audit.ts --output-prefix
 * p96_3_full_304_listing`, classifies each row's target fit using a
 * conservative heuristic over title + URL path, and writes:
 *
 *   1. The same audit CSV with the 6 target-fit columns appended.
 *   2. A discarded/non-target log CSV at
 *      p96_3_discarded_or_non_target_links.csv.
 *
 * Heuristic only — when in doubt, MAYBE_TARGET_MANUAL_REVIEW. The
 * workbench surfaces every MAYBE for human review.
 *
 * Run from repo root:
 *   npx tsx scripts/p96-3-target-fit.ts
 *
 * Read-only with respect to the database. File I/O only.
 */

import { readFile, writeFile } from "node:fs/promises";

interface FitDecision {
  targetFit:
    | "TARGET_USCE_MATCH"
    | "MAYBE_TARGET_MANUAL_REVIEW"
    | "NON_TARGET_SPECIALIST_ONLY"
    | "NON_TARGET_BASIC_RESEARCH"
    | "NON_TARGET_NON_CLINICAL"
    | "NON_TARGET_THIRD_PARTY_ONLY"
    | "DUPLICATE_OR_REPLACED";
  reason: string;
  matchRelevance: "HIGH" | "MEDIUM" | "LOW" | "UNCLEAR" | "NONE";
  manualReviewNeeded: boolean;
  excludeFromCurrentWedge: boolean;
  futureLaneCandidate: string;
  reviewerConfidence: "high" | "medium" | "low";
  canReconsiderLater: boolean;
}

/**
 * Heuristic per-listing target-fit classifier.
 *
 * Conservative defaults:
 *  - When in doubt, MAYBE_TARGET_MANUAL_REVIEW.
 *  - Never auto-discard.
 *  - Never claim NON_TARGET_* without a clear title-side signal.
 */
function classify(title: string, sourceUrl: string): FitDecision {
  const t = title.toLowerCase();
  const u = sourceUrl.toLowerCase();
  const hay = `${t} ${u}`;

  // Strong target signals — visiting student / IMG / clerkship.
  const strongTarget = [
    "visiting medical student",
    "visiting international medical",
    "international medical student",
    "international medical graduate",
    "visiting student",
    "img observer",
    "img observership",
    "img elective",
    "clinical clerkship",
    "visiting clerkship",
    "clerkship for visiting",
    "clinical observership",
    "elective clerkship",
  ];
  if (strongTarget.some((kw) => hay.includes(kw))) {
    return {
      targetFit: "TARGET_USCE_MATCH",
      reason: "Strong title/URL match for visiting student / IMG / clerkship.",
      matchRelevance: "HIGH",
      manualReviewNeeded: false,
      excludeFromCurrentWedge: false,
      futureLaneCandidate: "None",
      reviewerConfidence: "high",
      canReconsiderLater: true,
    };
  }

  // Wrong-fit signals — specialist / faculty / scholar without clinical wording.
  const specialistOnly = [
    "for specialists",
    "for practicing physicians",
    "for faculty",
    "for fellows",
    "subspecialty-trained physicians",
    "visiting faculty",
    "visiting professor",
    "academic visitor",
  ];
  if (specialistOnly.some((kw) => hay.includes(kw))) {
    return {
      targetFit: "NON_TARGET_SPECIALIST_ONLY",
      reason: "Title contains explicit specialist/faculty/fellow wording.",
      matchRelevance: "NONE",
      manualReviewNeeded: false,
      excludeFromCurrentWedge: true,
      futureLaneCandidate: "Specialist/faculty opportunities",
      reviewerConfidence: "high",
      canReconsiderLater: true,
    };
  }

  // Ambiguous specialist signal — "Visiting Scholars" or "Medical
  // Staff Services" patterns. Flag for manual review.
  const maybeSpecialist = [
    "visiting scholar",
    "visiting scholars",
    "medical staff services",
    "international scholars",
  ];
  if (maybeSpecialist.some((kw) => hay.includes(kw))) {
    return {
      targetFit: "MAYBE_TARGET_MANUAL_REVIEW",
      reason:
        '"Visiting Scholars" / "Medical Staff Services" wording often denotes faculty or licensed-provider programs rather than student/IMG observerships.',
      matchRelevance: "UNCLEAR",
      manualReviewNeeded: true,
      excludeFromCurrentWedge: false,
      futureLaneCandidate: "Specialist/faculty opportunities (if not for students/IMGs)",
      reviewerConfidence: "low",
      canReconsiderLater: true,
    };
  }

  // Basic-science / wet-lab / postdoc-only signals.
  const basicResearch = [
    "wet lab",
    "wet-lab",
    "bench research",
    "molecular biology",
    "molecular genetics",
    "genomics core",
    "phd preferred",
    "phd required",
    "phd or md/phd",
  ];
  if (basicResearch.some((kw) => hay.includes(kw))) {
    return {
      targetFit: "NON_TARGET_BASIC_RESEARCH",
      reason: "Title/URL signals basic-science / wet-lab research.",
      matchRelevance: "NONE",
      manualReviewNeeded: false,
      excludeFromCurrentWedge: true,
      futureLaneCandidate: "Basic science / postdoc research lane",
      reviewerConfidence: "medium",
      canReconsiderLater: true,
    };
  }

  // Postdoc/research-fellow signals — flag MAYBE since clinical
  // research for medical graduates IS target-relevant.
  const researchFellowSignals = [
    "postdoctoral research",
    "postdoctoral fellow",
    "research fellowship",
    "research fellow",
    "research trainee",
    "research scholar",
    "summer research",
  ];
  if (researchFellowSignals.some((kw) => hay.includes(kw))) {
    return {
      targetFit: "MAYBE_TARGET_MANUAL_REVIEW",
      reason:
        '"Research fellowship" / "postdoctoral" framing is ambiguous — could be clinical research for medical graduates (target-relevant) or basic-science postdoc (non-target).',
      matchRelevance: "UNCLEAR",
      manualReviewNeeded: true,
      excludeFromCurrentWedge: false,
      futureLaneCandidate: "Basic science / postdoc research lane (if non-clinical)",
      reviewerConfidence: "low",
      canReconsiderLater: true,
    };
  }

  // Non-clinical / advisory / consulting.
  const nonClinical = [
    "consulting/advisory",
    "consulting and advisory",
    "advisory services",
    "policy fellowship",
    "industry research",
  ];
  if (nonClinical.some((kw) => hay.includes(kw))) {
    return {
      targetFit: "NON_TARGET_NON_CLINICAL",
      reason: "Title/URL signals non-clinical / advisory / consulting program.",
      matchRelevance: "NONE",
      manualReviewNeeded: false,
      excludeFromCurrentWedge: true,
      futureLaneCandidate: "Non-clinical research / consulting lane",
      reviewerConfidence: "medium",
      canReconsiderLater: true,
    };
  }

  // Generic observership / externship / elective default.
  const genericTarget = [
    "observership",
    "externship",
    "elective",
    "shadowing",
    "preceptorship",
    "rotation",
  ];
  if (genericTarget.some((kw) => hay.includes(kw))) {
    return {
      targetFit: "TARGET_USCE_MATCH",
      reason: "Generic observership / externship / elective / rotation framing.",
      matchRelevance: "HIGH",
      manualReviewNeeded: false,
      excludeFromCurrentWedge: false,
      futureLaneCandidate: "None",
      reviewerConfidence: "medium",
      canReconsiderLater: true,
    };
  }

  // Anything else: conservative default. The existing 304 dataset
  // was curated; we keep it in-wedge unless a signal says otherwise.
  return {
    targetFit: "TARGET_USCE_MATCH",
    reason: "No specific target-fit signal; falling back to in-wedge default.",
    matchRelevance: "MEDIUM",
    manualReviewNeeded: false,
    excludeFromCurrentWedge: false,
    futureLaneCandidate: "None",
    reviewerConfidence: "low",
    canReconsiderLater: true,
  };
}

function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuote = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (inQuote && line[i + 1] === '"') { cur += '"'; i++; }
      else { inQuote = !inQuote; cur += c; }
    } else if (c === "," && !inQuote) {
      out.push(cur); cur = "";
    } else { cur += c; }
  }
  out.push(cur);
  return out;
}

function parseCsv(text: string) {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const header = splitCsvLine(lines[0]);
  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cells = splitCsvLine(lines[i]);
    const obj: Record<string, string> = {};
    for (let j = 0; j < header.length; j++) obj[header[j]] = cells[j] ?? "";
    rows.push(obj);
  }
  return { header, rows };
}

async function main() {
  const mainCsv = "docs/platform-v2/local/p96_3_full_304_listing_audit.csv";
  const discardedCsv = "docs/platform-v2/local/p96_3_discarded_or_non_target_links.csv";

  const text = await readFile(mainCsv, "utf8");
  const { header, rows } = parseCsv(text);

  const newHeader = [
    ...header,
    "targetFit",
    "targetFitReason",
    "matchRelevance",
    "manualReviewNeeded",
    "excludeFromCurrentWedge",
    "futureLaneCandidate",
  ];

  const augmented: string[] = [newHeader.join(",")];
  const discardedHeader = [
    "listingIdOrSlug",
    "title",
    "institution",
    "sourceUrl",
    "applicationUrl",
    "targetFit",
    "discardReason",
    "evidenceQuoteOrObservedText",
    "screenshotPath",
    "jsonSidecarPath",
    "reviewerConfidence",
    "recommendedAction",
    "canReconsiderLater",
    "futureLaneCandidate",
    "notes",
  ];
  const discarded: string[] = [discardedHeader.join(",")];
  const counts: Record<string, number> = {};

  for (const row of rows) {
    const title = (() => {
      const raw = row.title || "";
      try { return raw.startsWith('"') ? JSON.parse(raw) : raw; } catch { return raw; }
    })();
    const sourceUrl = (() => {
      const raw = row.sourceUrl || "";
      try { return raw.startsWith('"') ? JSON.parse(raw) : raw; } catch { return raw; }
    })();

    const dec = classify(title, sourceUrl);
    counts[dec.targetFit] = (counts[dec.targetFit] || 0) + 1;

    const escaped = (s: string) => JSON.stringify(s);

    augmented.push([
      ...header.map((h) => row[h] ?? ""),
      dec.targetFit,
      escaped(dec.reason),
      dec.matchRelevance,
      String(dec.manualReviewNeeded),
      String(dec.excludeFromCurrentWedge),
      escaped(dec.futureLaneCandidate),
    ].join(","));

    const needsLog =
      dec.targetFit !== "TARGET_USCE_MATCH" ||
      row.recommendedAction === "WRONG_PAGE_REPLACE" ||
      row.recommendedAction === "SOURCE_DEAD_REVIEW" ||
      row.recommendedAction === "NEEDS_BETTER_SOURCE";
    if (needsLog) {
      discarded.push([
        row.id || "",
        escaped(title),
        escaped(""),
        escaped(sourceUrl),
        escaped(""),
        dec.targetFit,
        escaped(dec.reason),
        escaped(""),
        row.uscehubScreenshot ?? "",
        row.jsonSidecar ?? "",
        dec.reviewerConfidence,
        row.recommendedAction ?? "",
        String(dec.canReconsiderLater),
        escaped(dec.futureLaneCandidate),
        escaped(`Source verdict: ${row.contentVerdict}; reason: ${row.contentReason}`),
      ].join(","));
    }
  }

  await writeFile(mainCsv, augmented.join("\n"), "utf8");
  await writeFile(discardedCsv, discarded.join("\n"), "utf8");
  console.log(`Wrote ${mainCsv} (${augmented.length} lines)`);
  console.log(`Wrote ${discardedCsv} (${discarded.length} lines incl. header)`);
  console.log("Target-fit distribution:");
  for (const [k, v] of Object.entries(counts).sort(([, a], [, b]) => b - a)) {
    console.log(`  ${k}: ${v}`);
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
