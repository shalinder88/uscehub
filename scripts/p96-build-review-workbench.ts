/**
 * P96-4A — build the local evidence review workbench data.
 *
 * Read-only file I/O. Reads an audit CSV + discard log and writes
 * the workbench's review-data.json. Pure post-process — no DB
 * connection, no network, no mutation.
 *
 * The static index.html under
 * docs/platform-v2/local/review-workbench/ loads review-data.json
 * via fetch() at runtime.
 *
 * Run from repo root:
 *   # P96-2 sample (default)
 *   npx tsx scripts/p96-build-review-workbench.ts
 *
 *   # P96-3 full 304 audit
 *   npx tsx scripts/p96-build-review-workbench.ts \
 *     --input docs/platform-v2/local/p96_3_full_304_listing_audit.csv
 */

import { readFile, writeFile } from "node:fs/promises";

interface ReviewItem {
  itemId: string;
  listingIdOrSlug: string;
  title: string;
  institution: string;
  state: string;
  listingType: string;
  specialty: string;
  sourceUrl: string;
  applicationUrl: string;
  sourceVerdict: string;
  verdictReason: string;
  recommendedAction: string;
  targetFit: string;
  targetFitReason: string;
  matchRelevance: string;
  manualReviewNeeded: boolean;
  excludeFromCurrentWedge: boolean;
  futureLaneCandidate: string;
  uscehubScreenshotPath: string;
  officialSourceScreenshotPath: string;
  applicationScreenshotPath: string;
  jsonSidecarPath: string;
  whyNeedsReview: string[];
  suggestedDecision: string;
  notesFromAudit: string;
}

function splitCsvLine(line: string): string[] {
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

function parseCsv(text: string): { header: string[]; rows: Record<string, string>[] } {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const header = splitCsvLine(lines[0]);
  const rows: Record<string, string>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cells = splitCsvLine(lines[i]);
    const obj: Record<string, string> = {};
    for (let j = 0; j < header.length; j++) {
      obj[header[j]] = cells[j] ?? "";
    }
    rows.push(obj);
  }
  return { header, rows };
}

function suggestedDecisionFor(row: Record<string, string>): string {
  // Conservative defaults: never DISCARD without manual review.
  const verdict = row.contentVerdict;
  const action = row.recommendedAction;
  const fit = row.targetFit;
  if (fit === "MAYBE_TARGET_MANUAL_REVIEW") return "NEEDS_MORE_RESEARCH";
  if (action === "WRONG_PAGE_REPLACE") return "MODIFY";
  if (action === "NEEDS_BETTER_SOURCE") return "MODIFY";
  if (action === "SOURCE_DEAD_REVIEW") return "NEEDS_MORE_RESEARCH";
  if (verdict === "DEEP_PATH_NO_HINT") return "KEEP_WITH_CAVEATS";
  if (verdict === "PATH_HINTS_PROGRAM") return "KEEP";
  return "NEEDS_MORE_RESEARCH";
}

function whyNeedsReviewFor(row: Record<string, string>): string[] {
  const reasons: string[] = [];
  if (row.contentVerdict === "GENERIC_HOMEPAGE") reasons.push("Source URL is a generic institution homepage");
  if (row.contentVerdict === "LIKELY_WRONG_PAGE") reasons.push("Source URL contains a wrong-page hint");
  if (row.contentVerdict === "DEEP_PATH_NO_HINT") reasons.push("Deep URL path with no program-keyword match");
  if (row.targetFit === "MAYBE_TARGET_MANUAL_REVIEW") reasons.push("Target fit ambiguous; needs human read");
  if (row.recommendedAction === "WRONG_PAGE_REPLACE") reasons.push("Recommended action: replace source URL");
  if (row.recommendedAction === "NEEDS_BETTER_SOURCE") reasons.push("Recommended action: better source URL needed");
  if (row.recommendedAction === "SOURCE_DEAD_REVIEW") reasons.push("Source did not capture (PDF or dead URL)");
  if (row.recommendedAction === "MANUAL_REVIEW") reasons.push("Recommended action: manual review");
  if (row.excludeFromCurrentWedge === "true") reasons.push("Excluded from current wedge");
  return reasons;
}

async function main() {
  const idx = process.argv.indexOf("--input");
  const mainCsvPath =
    idx >= 0 && idx + 1 < process.argv.length
      ? process.argv[idx + 1]
      : "docs/platform-v2/local/p96_2_25_listing_sample_audit.csv";
  console.log(`Reading ${mainCsvPath}`);
  const text = await readFile(mainCsvPath, "utf8");
  const { rows } = parseCsv(text);

  const items: ReviewItem[] = [];
  for (const row of rows) {
    const reasons = whyNeedsReviewFor(row);
    // Conservative inclusion: any row with at least one review reason.
    // Clean PATH_HINTS_PROGRAM + TARGET_USCE_MATCH + KEEP_SOURCE rows
    // pass through unflagged and are excluded by default.
    if (reasons.length === 0) continue;

    const sourceUrl = row.sourceUrl?.replace(/^"|"$/g, "") ?? "";
    const note = row.note?.replace(/^"|"$/g, "") ?? "";
    const targetFitReason = row.targetFitReason?.replace(/^"|"$/g, "") ?? "";
    const futureLaneCandidate = row.futureLaneCandidate?.replace(/^"|"$/g, "") ?? "";

    items.push({
      itemId: row.id,
      listingIdOrSlug: row.id,
      title: row.title?.replace(/^"|"$/g, "") ?? "",
      institution: "", // not separately stored in this audit
      state: "",
      listingType: "",
      specialty: "",
      sourceUrl,
      applicationUrl: "",
      sourceVerdict: row.contentVerdict ?? "",
      verdictReason: row.contentReason?.replace(/^"|"$/g, "") ?? "",
      recommendedAction: row.recommendedAction ?? "",
      targetFit: row.targetFit ?? "",
      targetFitReason,
      matchRelevance: row.matchRelevance ?? "",
      manualReviewNeeded: row.manualReviewNeeded === "true",
      excludeFromCurrentWedge: row.excludeFromCurrentWedge === "true",
      futureLaneCandidate,
      uscehubScreenshotPath: row.uscehubScreenshot ?? "",
      officialSourceScreenshotPath: row.sourceScreenshot ?? "",
      applicationScreenshotPath: "",
      jsonSidecarPath: row.jsonSidecar ?? "",
      whyNeedsReview: reasons,
      suggestedDecision: suggestedDecisionFor(row),
      notesFromAudit: note,
    });
  }

  const out = {
    generatedAt: new Date().toISOString(),
    sourceCsv: mainCsvPath,
    totalSampleSize: rows.length,
    questionableRowCount: items.length,
    items,
  };

  const outPath = "docs/platform-v2/local/review-workbench/review-data.json";
  await writeFile(outPath, JSON.stringify(out, null, 2), "utf8");
  console.log(`Wrote ${outPath}`);
  console.log(`Total sample: ${rows.length}`);
  console.log(`Questionable rows: ${items.length}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
