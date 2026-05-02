/**
 * P96-2B — apply target-fit classification to the 25-listing sample.
 *
 * Reads docs/platform-v2/local/p96_2_25_listing_sample_audit.csv,
 * applies a hand-curated target-fit map (one decision per listing,
 * conservative — when in doubt, MAYBE_TARGET_MANUAL_REVIEW), and
 * writes:
 *
 *   1. The same main CSV with six new columns appended:
 *      targetFit, targetFitReason, matchRelevance,
 *      manualReviewNeeded, excludeFromCurrentWedge, futureLaneCandidate
 *   2. A new discarded/non-target links CSV at
 *      docs/platform-v2/local/p96_2_discarded_or_non_target_links.csv
 *
 * No DB. No network. Pure file I/O.
 */

import { readFile, writeFile } from "node:fs/promises";

interface TargetFitDecision {
  targetFit:
    | "TARGET_USCE_MATCH"
    | "MAYBE_TARGET_MANUAL_REVIEW"
    | "NON_TARGET_SPECIALIST_ONLY"
    | "NON_TARGET_BASIC_RESEARCH"
    | "NON_TARGET_NON_CLINICAL"
    | "NON_TARGET_THIRD_PARTY_ONLY"
    | "DUPLICATE_OR_REPLACED";
  targetFitReason: string;
  matchRelevance: "HIGH" | "MEDIUM" | "LOW" | "UNCLEAR" | "NONE";
  manualReviewNeeded: boolean;
  excludeFromCurrentWedge: boolean;
  futureLaneCandidate: string;
  reviewerConfidence: "high" | "medium" | "low";
  canReconsiderLater: boolean;
}

/**
 * Hand-curated target-fit map keyed by listing id. Classification is
 * conservative — ambiguous rows go to MAYBE_TARGET_MANUAL_REVIEW
 * with a reason. Source URL quality (wrong-page, generic-homepage,
 * etc.) is a separate axis tracked elsewhere; targetFit asks only
 * "does this opportunity belong in the USCE & Match wedge?"
 */
const decisions: Record<string, TargetFitDecision> = {
  // 1. Northwell observership program — IMG-relevant despite the
  // wrong-page source URL issue (which is a separate cleanup axis).
  cmn2111jv001esb1197ufjp8u: {
    targetFit: "TARGET_USCE_MATCH",
    targetFitReason: "Hospital-system observership program; IMG-relevant USCE.",
    matchRelevance: "HIGH",
    manualReviewNeeded: false,
    excludeFromCurrentWedge: false,
    futureLaneCandidate: "None",
    reviewerConfidence: "high",
    canReconsiderLater: true,
  },
  // 2. Drexel/Hahnemann — generic medical school root; observership
  // listing of a general program.
  cmn2112nm0042sb119q64hx5i: {
    targetFit: "TARGET_USCE_MATCH",
    targetFitReason: "General observership at academic medical center.",
    matchRelevance: "HIGH",
    manualReviewNeeded: false,
    excludeFromCurrentWedge: false,
    futureLaneCandidate: "None",
    reviewerConfidence: "medium",
    canReconsiderLater: true,
  },
  // 3. UMN Pathology Observership — pathology observerships are
  // historically IMG-friendly.
  cmo33867o00271ny9ovpq1r1c: {
    targetFit: "TARGET_USCE_MATCH",
    targetFitReason: "Pathology observership; IMG-friendly specialty.",
    matchRelevance: "HIGH",
    manualReviewNeeded: false,
    excludeFromCurrentWedge: false,
    futureLaneCandidate: "None",
    reviewerConfidence: "high",
    canReconsiderLater: true,
  },
  // 4. Metropolitan Hospital Center — public hospital observership.
  cmn2111ce0010sb11kh0qbbxa: {
    targetFit: "TARGET_USCE_MATCH",
    targetFitReason: "Public-hospital observership; IMG-relevant.",
    matchRelevance: "HIGH",
    manualReviewNeeded: false,
    excludeFromCurrentWedge: false,
    futureLaneCandidate: "None",
    reviewerConfidence: "medium",
    canReconsiderLater: true,
  },
  // 5. UW-Madison Visiting Medical Student.
  cmo34f3we000t1nxx1ifvu2zl: {
    targetFit: "TARGET_USCE_MATCH",
    targetFitReason: "Visiting medical student elective at UW-Madison.",
    matchRelevance: "HIGH",
    manualReviewNeeded: false,
    excludeFromCurrentWedge: false,
    futureLaneCandidate: "None",
    reviewerConfidence: "high",
    canReconsiderLater: true,
  },
  // 6. Weill Cornell Visiting International Medical Student.
  cmo34f3ii000b1nxxbgalsak9: {
    targetFit: "TARGET_USCE_MATCH",
    targetFitReason: "Explicit international medical student program.",
    matchRelevance: "HIGH",
    manualReviewNeeded: false,
    excludeFromCurrentWedge: false,
    futureLaneCandidate: "None",
    reviewerConfidence: "high",
    canReconsiderLater: true,
  },
  // 7. St. John's Episcopal Hospital — generic observership.
  cmn2114z5009gsb11laxdyyfc: {
    targetFit: "TARGET_USCE_MATCH",
    targetFitReason: "Community-hospital observership.",
    matchRelevance: "MEDIUM",
    manualReviewNeeded: false,
    excludeFromCurrentWedge: false,
    futureLaneCandidate: "None",
    reviewerConfidence: "medium",
    canReconsiderLater: true,
  },
  // 8. Texas Tech IM IMG Observership — explicitly IMG.
  cmo3386pc002v1ny92dflv0b9: {
    targetFit: "TARGET_USCE_MATCH",
    targetFitReason: "Internal Medicine observership labeled for IMGs.",
    matchRelevance: "HIGH",
    manualReviewNeeded: false,
    excludeFromCurrentWedge: false,
    futureLaneCandidate: "None",
    reviewerConfidence: "high",
    canReconsiderLater: true,
  },
  // 9. Stanford Visiting Clerkship.
  cmo34f48p00191nxxa638xyp8: {
    targetFit: "TARGET_USCE_MATCH",
    targetFitReason: "Visiting clerkship for medical students.",
    matchRelevance: "HIGH",
    manualReviewNeeded: false,
    excludeFromCurrentWedge: false,
    futureLaneCandidate: "None",
    reviewerConfidence: "high",
    canReconsiderLater: true,
  },
  // 10. MGB EM Clerkship — visiting clerkship.
  cmo34f3fe00071nxxtgp8zt29: {
    targetFit: "TARGET_USCE_MATCH",
    targetFitReason: "Emergency Medicine clerkship for visiting medical students.",
    matchRelevance: "HIGH",
    manualReviewNeeded: false,
    excludeFromCurrentWedge: false,
    futureLaneCandidate: "None",
    reviewerConfidence: "high",
    canReconsiderLater: true,
  },
  // 11. Ohio State Wexner International Visiting Scholars — title
  // says "Scholars," which often means visiting faculty / specialist
  // scholars rather than students. Needs human review.
  cmo3386di002f1ny99zepgb4w: {
    targetFit: "MAYBE_TARGET_MANUAL_REVIEW",
    targetFitReason:
      'Title "International Visiting Scholars" is ambiguous — "Scholars" often denotes visiting faculty / specialists rather than medical students/IMGs. Source page is generic; cannot disambiguate from URL alone.',
    matchRelevance: "UNCLEAR",
    manualReviewNeeded: true,
    excludeFromCurrentWedge: false,
    futureLaneCandidate: "Specialist/faculty opportunities (if Scholars program is for faculty)",
    reviewerConfidence: "low",
    canReconsiderLater: true,
  },
  // 12. Orlando Health Medical Staff Services Observership — "Medical
  // Staff Services" usually means credentialing/onboarding for
  // licensed providers. Need to read the PDF to confirm.
  cmo3385mo001f1ny9t1ilrqd7: {
    targetFit: "MAYBE_TARGET_MANUAL_REVIEW",
    targetFitReason:
      '"Medical Staff Services" wording on the URL suggests this may be the credentialing/onboarding observership for licensed providers (attendings/fellows), not a student/IMG observership. PDF source not screenshottable; needs human read.',
    matchRelevance: "UNCLEAR",
    manualReviewNeeded: true,
    excludeFromCurrentWedge: false,
    futureLaneCandidate: "Specialist/faculty opportunities (if Medical Staff Services is provider-only)",
    reviewerConfidence: "low",
    canReconsiderLater: true,
  },
  // 13. Columbia Psychiatry Observership.
  cmo3384we000h1ny9zqofrhm4: {
    targetFit: "TARGET_USCE_MATCH",
    targetFitReason: "Psychiatry observership; IMG-friendly specialty.",
    matchRelevance: "HIGH",
    manualReviewNeeded: false,
    excludeFromCurrentWedge: false,
    futureLaneCandidate: "None",
    reviewerConfidence: "high",
    canReconsiderLater: true,
  },
  // 14. Texas Tech HSC — Observership.
  cmn2114no008qsb11x1fjuo28: {
    targetFit: "TARGET_USCE_MATCH",
    targetFitReason: "General observership at academic health system.",
    matchRelevance: "HIGH",
    manualReviewNeeded: false,
    excludeFromCurrentWedge: false,
    futureLaneCandidate: "None",
    reviewerConfidence: "high",
    canReconsiderLater: true,
  },
  // 15. Mount Sinai Miami Beach.
  cmn2114eg0080sb11z6bzsocz: {
    targetFit: "TARGET_USCE_MATCH",
    targetFitReason: "Community-hospital observership.",
    matchRelevance: "HIGH",
    manualReviewNeeded: false,
    excludeFromCurrentWedge: false,
    futureLaneCandidate: "None",
    reviewerConfidence: "high",
    canReconsiderLater: true,
  },
  // 16. UF Health / Shands.
  cmn2112ix003qsb1178t0rg6k: {
    targetFit: "TARGET_USCE_MATCH",
    targetFitReason: "Academic medical center observership.",
    matchRelevance: "HIGH",
    manualReviewNeeded: false,
    excludeFromCurrentWedge: false,
    futureLaneCandidate: "None",
    reviewerConfidence: "high",
    canReconsiderLater: true,
  },
  // 17. Jackson Health System Observership.
  cmo3385gq00171ny9bm6z8i3h: {
    targetFit: "TARGET_USCE_MATCH",
    targetFitReason: "Public-hospital observership; explicit USCE program.",
    matchRelevance: "HIGH",
    manualReviewNeeded: false,
    excludeFromCurrentWedge: false,
    futureLaneCandidate: "None",
    reviewerConfidence: "high",
    canReconsiderLater: true,
  },
  // 18. UNM Hospital.
  cmn2115n200aysb11lq9efqq3: {
    targetFit: "TARGET_USCE_MATCH",
    targetFitReason: "Academic-hospital observership.",
    matchRelevance: "HIGH",
    manualReviewNeeded: false,
    excludeFromCurrentWedge: false,
    futureLaneCandidate: "None",
    reviewerConfidence: "medium",
    canReconsiderLater: true,
  },
  // 19. Albert Einstein Research Fellowship — "Research Fellowship"
  // can be either clinical research for medical graduates OR
  // basic-science postdoc. Source URL is einsteinmed.edu root
  // (GENERIC_HOMEPAGE), so we can't tell from URL alone. Conservative
  // MAYBE.
  cmn21146x007ksb11nksfya8i: {
    targetFit: "MAYBE_TARGET_MANUAL_REVIEW",
    targetFitReason:
      '"Research Fellowship" framing without clinical-vs-basic-science qualifier; source URL is the medical school root so the program structure cannot be confirmed from URL alone. Could be clinical research (target-relevant) or basic-science postdoc (non-target).',
    matchRelevance: "UNCLEAR",
    manualReviewNeeded: true,
    excludeFromCurrentWedge: false,
    futureLaneCandidate: "Basic science / postdoc research lane (if non-clinical)",
    reviewerConfidence: "low",
    canReconsiderLater: true,
  },
  // 20. Fred Hutchinson Cancer Center — Fred Hutch is heavily
  // research-oriented. Many of its programs are basic-science postdoc
  // / wet lab. Some clinical-research programs exist. URL gave
  // DEEP_PATH_NO_HINT so we can't tell from path. Conservative MAYBE.
  cmn2113ue006ssb11j9eieieh: {
    targetFit: "MAYBE_TARGET_MANUAL_REVIEW",
    targetFitReason:
      "Fred Hutch's program landscape is heavily basic-science research; some clinical-research programs exist. Source URL classifier did not get a path keyword. Need to confirm from page content whether this listing is clinical-research-for-medical-graduates or basic-science postdoc.",
    matchRelevance: "UNCLEAR",
    manualReviewNeeded: true,
    excludeFromCurrentWedge: false,
    futureLaneCandidate: "Basic science / postdoc research lane (if wet-lab)",
    reviewerConfidence: "low",
    canReconsiderLater: true,
  },
  // 21. UIowa Hospitals.
  cmn2113jz0060sb11qa6zlypu: {
    targetFit: "TARGET_USCE_MATCH",
    targetFitReason: "Academic-hospital observership.",
    matchRelevance: "HIGH",
    manualReviewNeeded: false,
    excludeFromCurrentWedge: false,
    futureLaneCandidate: "None",
    reviewerConfidence: "high",
    canReconsiderLater: true,
  },
  // 22. MCW / Froedtert.
  cmn21137m0058sb11p08zo591: {
    targetFit: "TARGET_USCE_MATCH",
    targetFitReason: "Academic-hospital observership.",
    matchRelevance: "HIGH",
    manualReviewNeeded: false,
    excludeFromCurrentWedge: false,
    futureLaneCandidate: "None",
    reviewerConfidence: "high",
    canReconsiderLater: true,
  },
  // 23. Augusta MCG.
  cmn2112uj004esb119x368xuh: {
    targetFit: "TARGET_USCE_MATCH",
    targetFitReason: "Academic-medical-college observership.",
    matchRelevance: "HIGH",
    manualReviewNeeded: false,
    excludeFromCurrentWedge: false,
    futureLaneCandidate: "None",
    reviewerConfidence: "high",
    canReconsiderLater: true,
  },
  // 24. Baylor College of Medicine (general).
  cmn2112d0003asb11odo3emfn: {
    targetFit: "TARGET_USCE_MATCH",
    targetFitReason: "Academic-medical-college observership.",
    matchRelevance: "HIGH",
    manualReviewNeeded: false,
    excludeFromCurrentWedge: false,
    futureLaneCandidate: "None",
    reviewerConfidence: "high",
    canReconsiderLater: true,
  },
  // 25. Tufts Medical Center.
  cmn2111uv0028sb11o4hirnws: {
    targetFit: "TARGET_USCE_MATCH",
    targetFitReason: "Academic-hospital observership.",
    matchRelevance: "HIGH",
    manualReviewNeeded: false,
    excludeFromCurrentWedge: false,
    futureLaneCandidate: "None",
    reviewerConfidence: "high",
    canReconsiderLater: true,
  },
};

interface CsvRow {
  [k: string]: string;
}

function parseCsv(text: string): { header: string[]; rows: CsvRow[] } {
  const lines = text.split("\n").filter((l) => l.trim().length > 0);
  // Naive parser — the existing CSVs use JSON-stringified cells for
  // anything containing a comma, so a quote-aware split is required.
  function splitLine(line: string): string[] {
    const out: string[] = [];
    let cur = "";
    let inQuote = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        if (inQuote && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuote = !inQuote;
          cur += c;
        }
      } else if (c === "," && !inQuote) {
        out.push(cur);
        cur = "";
      } else {
        cur += c;
      }
    }
    out.push(cur);
    return out;
  }
  const header = splitLine(lines[0]);
  const rows: CsvRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cells = splitLine(lines[i]);
    const obj: CsvRow = {};
    for (let j = 0; j < header.length; j++) {
      obj[header[j]] = cells[j] ?? "";
    }
    rows.push(obj);
  }
  return { header, rows };
}

async function main() {
  const mainCsvPath = "docs/platform-v2/local/p96_2_25_listing_sample_audit.csv";
  const discardedCsvPath = "docs/platform-v2/local/p96_2_discarded_or_non_target_links.csv";

  const text = await readFile(mainCsvPath, "utf8");
  const { header, rows } = parseCsv(text);

  // New header = old header + 6 target-fit columns.
  const newHeader = [
    ...header,
    "targetFit",
    "targetFitReason",
    "matchRelevance",
    "manualReviewNeeded",
    "excludeFromCurrentWedge",
    "futureLaneCandidate",
  ];

  const augmentedLines: string[] = [newHeader.join(",")];

  // Discarded log header.
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
  const discardedLines: string[] = [discardedHeader.join(",")];

  const counts: Record<string, number> = {};

  for (const row of rows) {
    const id = row.id;
    const decision = decisions[id];
    if (!decision) {
      console.warn(`No target-fit decision for listing ${id}`);
      continue;
    }
    counts[decision.targetFit] = (counts[decision.targetFit] || 0) + 1;

    const escaped = (s: string) => JSON.stringify(s);

    augmentedLines.push(
      [
        ...header.map((h) => row[h] ?? ""),
        decision.targetFit,
        escaped(decision.targetFitReason),
        decision.matchRelevance,
        String(decision.manualReviewNeeded),
        String(decision.excludeFromCurrentWedge),
        escaped(decision.futureLaneCandidate),
      ].join(",")
    );

    // Discarded log: every row that needs manual review or is
    // non-target, plus rows whose recommendedAction is itself a
    // discard signal (WRONG_PAGE_REPLACE, SOURCE_DEAD_REVIEW,
    // NEEDS_BETTER_SOURCE qualifies if also non-target).
    const needsLog =
      decision.targetFit !== "TARGET_USCE_MATCH" ||
      row.recommendedAction === "WRONG_PAGE_REPLACE" ||
      row.recommendedAction === "SOURCE_DEAD_REVIEW";

    if (needsLog) {
      // Strip JSON quoting from the title cell for the log.
      let titleClean = row.title || "";
      if (titleClean.startsWith('"') && titleClean.endsWith('"')) {
        try {
          titleClean = JSON.parse(titleClean);
        } catch {
          /* keep as-is */
        }
      }
      // Same for sourceUrl.
      let urlClean = row.sourceUrl || "";
      if (urlClean.startsWith('"') && urlClean.endsWith('"')) {
        try {
          urlClean = JSON.parse(urlClean);
        } catch {
          /* keep as-is */
        }
      }

      discardedLines.push(
        [
          id,
          escaped(titleClean),
          escaped(""), // institution (not separately stored in this audit)
          escaped(urlClean),
          escaped(""), // applicationUrl (not separately captured)
          decision.targetFit,
          escaped(decision.targetFitReason),
          escaped(""), // evidenceQuoteOrObservedText — left blank pending body fetch
          row.uscehubScreenshot ?? "",
          row.jsonSidecar ?? "",
          decision.reviewerConfidence,
          row.recommendedAction ?? "",
          String(decision.canReconsiderLater),
          escaped(decision.futureLaneCandidate),
          escaped(`Source verdict: ${row.contentVerdict}; reason: ${row.contentReason}`),
        ].join(",")
      );
    }
  }

  await writeFile(mainCsvPath, augmentedLines.join("\n"), "utf8");
  await writeFile(discardedCsvPath, discardedLines.join("\n"), "utf8");

  console.log(`Wrote ${mainCsvPath} (${augmentedLines.length} lines)`);
  console.log(`Wrote ${discardedCsvPath} (${discardedLines.length} lines incl. header)`);
  console.log("Target-fit distribution:");
  for (const [k, v] of Object.entries(counts).sort(([, a], [, b]) => b - a)) {
    console.log(`  ${k}: ${v}`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
