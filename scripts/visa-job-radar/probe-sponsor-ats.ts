// Phase C probe: classify how the TOP sponsors' openings are reachable
// employer-direct, and prove the universal JSON-LD reader feeds the engine.
//   npx tsx scripts/visa-job-radar/probe-sponsor-ats.ts
//
// Answers the strategy's key unknown with real data: of the head of the sponsor
// universe, what share is reachable by a no-auth JSON API (Workday/Greenhouse)
// vs the universal JSON-LD path (iCIMS/Oracle/Taleo) vs dark. Then it runs a
// realistic schema.org JobPosting through extract -> map -> engine to show the
// JSON-LD reader yields a classifiable, quote-gated candidate.

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  detectAts,
  extractJobPostingJsonLd,
  jobPostingToRawCandidate,
  type AtsType,
  type Reach,
} from "./ats-resolver";
import { clean, classify, extractPhraseHits, validateQuote } from "./engine";
import type { CleanedJob } from "./types";

const OUT_DIR = join(process.cwd(), "docs/platform-v2/local/career/jobs/radar/sponsor-universe");

// Careers pages for the head of the sponsor universe (hand-curated employer-direct
// URLs — these are the employer's OWN domains, never a board). Detection reports
// the rest.
const SEED: Array<{ employer: string; url: string }> = [
  { employer: "Mayo Clinic", url: "https://jobs.mayoclinic.org" },
  { employer: "Mass General Brigham", url: "https://careers.massgeneralbrigham.org" },
  { employer: "University of Arkansas for Medical Sciences", url: "https://jobs.uams.edu" },
  { employer: "Montefiore Medical Center", url: "https://jobs.montefiore.org" },
  { employer: "University of Iowa", url: "https://jobs.uiowa.edu" },
  { employer: "Emory University", url: "https://careers.emory.edu" },
  { employer: "Icahn School of Medicine at Mount Sinai", url: "https://careers.mountsinai.org" },
  { employer: "Cleveland Clinic", url: "https://jobs.clevelandclinic.org" },
  { employer: "Banner Health", url: "https://www.bannerhealth.com/careers" },
  { employer: "Memorial Sloan Kettering", url: "https://careers.mskcc.org" },
  { employer: "Maimonides Medical Center", url: "https://www.maimonidesmed.org/careers" },
  { employer: "Indiana University", url: "https://careers.iu.edu" },
  { employer: "Rochester Regional Health", url: "https://rochesterregional.org/careers" },
  { employer: "University of Florida", url: "https://explore.jobs.ufl.edu" },
  { employer: "WVU Medicine", url: "https://wvumedicine.org/careers" },
  { employer: "UPMC", url: "https://careers.upmc.com" },
  { employer: "Duke University", url: "https://careers.duke.edu" },
  { employer: "Yale New Haven Health", url: "https://careers.ynhhs.org" },
  { employer: "University of Michigan", url: "https://careers.umich.edu" },
  { employer: "Henry Ford Health", url: "https://careers.henryford.com" },
  { employer: "Baylor College of Medicine", url: "https://jobs.bcm.edu" },
  { employer: "University of Minnesota", url: "https://hr.umn.edu/Jobs" },
];

const UA = "Mozilla/5.0 (compatible; USCEHub-visa-job-radar/1.0; careers-discovery)";

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function detectOne(s: { employer: string; url: string }): Promise<{
  employer: string;
  url: string;
  type: AtsType;
  reach: Reach;
  handle?: string;
  ok: boolean;
}> {
  try {
    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort(), 15000);
    const res = await fetch(s.url, { headers: { "User-Agent": UA }, redirect: "follow", signal: ctrl.signal });
    clearTimeout(to);
    const html = await res.text();
    const det = detectAts(html, res.url || s.url);
    return { employer: s.employer, url: s.url, type: det.type, reach: det.reach, handle: det.handle, ok: res.ok };
  } catch {
    return { employer: s.employer, url: s.url, type: "unknown", reach: "none", ok: false };
  }
}

// A realistic iCIMS/Oracle-style physician posting carrying explicit visa language,
// as schema.org JobPosting JSON-LD embedded in a posting page.
const SAMPLE_POSTING_HTML = `
<html><head>
<script type="application/ld+json">
{"@context":"https://schema.org/","@type":"JobPosting",
 "title":"Family Medicine Physician",
 "datePosted":"2026-06-01",
 "identifier":{"@type":"PropertyValue","name":"reqId","value":"REQ-55821"},
 "hiringOrganization":{"@type":"Organization","name":"Rural Health Partners"},
 "jobLocation":{"@type":"Place","address":{"@type":"PostalAddress","addressLocality":"Dickinson","addressRegion":"ND"}},
 "url":"https://careers.example-health.org/jobs/REQ-55821/family-medicine-physician",
 "description":"<p>We seek a Family Medicine Physician for our rural clinic. <b>J-1 visa waiver</b> support and H-1B sponsorship are available for international medical graduates.</p>"}
</script></head><body></body></html>`;

function jsonLdSelfTest(): string {
  const fetchedAt = "1970-01-01T00:00:00.000Z";
  const postings = extractJobPostingJsonLd(SAMPLE_POSTING_HTML);
  const lines: string[] = [];
  lines.push("JSON-LD reader self-test:");
  lines.push("  JobPosting objects extracted: " + postings.length);
  if (postings.length === 0) return lines.join("\n") + "\n  FAIL: none extracted";
  const cand = jobPostingToRawCandidate(postings[0], "jsonld-test", "fallback", fetchedAt, "https://careers.example-health.org/jobs/REQ-55821");
  if (!cand) return lines.join("\n") + "\n  FAIL: mapping returned null";
  const cleanedText = clean(cand.rawText);
  const cleaned: CleanedJob = { raw: cand, cleanedText };
  const hits = extractPhraseHits(cleanedText);
  const cls = classify(cleaned, hits);
  const quotesOk = cls.quotes.every((q) => validateQuote(cleanedText, q));
  lines.push("  mapped -> employer=" + cand.employer + " title=" + cand.title + " state=" + cand.state + " sourceId=" + cand.sourceId);
  lines.push("  engine -> status=" + cls.status + " labels=[" + cls.visaLabels.join(",") + "] quotes=" + JSON.stringify(cls.quotes.map((q) => q.text)));
  lines.push("  quote-offset valid: " + quotesOk);
  const pass = cls.status === "PUBLISH" && cls.visaLabels.length >= 1 && quotesOk && cand.employer === "Rural Health Partners";
  lines.push("  RESULT: " + (pass ? "PASS — JSON-LD posting flows to a quote-gated PUBLISH" : "FAIL"));
  return lines.join("\n");
}

async function main(): Promise<void> {
  console.log("Probing " + SEED.length + " top sponsors' careers pages (live)...\n");
  const results: Awaited<ReturnType<typeof detectOne>>[] = [];
  // small concurrency to be polite
  for (let i = 0; i < SEED.length; i += 4) {
    const batch = SEED.slice(i, i + 4);
    const got = await Promise.all(batch.map(detectOne));
    results.push(...got);
    await delay(300);
  }

  const byReach: Record<Reach, number> = { "json-api": 0, "json-ld": 0, none: 0 };
  const byType: Record<string, number> = {};
  for (const r of results) {
    byReach[r.reach]++;
    byType[r.type] = (byType[r.type] || 0) + 1;
  }
  const n = results.length;
  const pct = (x: number) => Math.round((x / n) * 1000) / 10 + "%";

  const lines: string[] = [];
  lines.push("# Sponsor ATS Reachability — top " + n + " sponsors (live probe)");
  lines.push("");
  lines.push("Employer-direct reachability of the head of the sponsor universe. Detection only — no");
  lines.push("openings were fetched. 'json-api' = no-auth JSON (Workday/Greenhouse/Lever/Ashby);");
  lines.push("'json-ld' = read schema.org JobPosting off the posting pages (iCIMS/Oracle/Taleo);");
  lines.push("'none' = ATS not detected from the landing page (often a JS shell — may still be json-ld).");
  lines.push("");
  lines.push("## Reachability");
  lines.push("- json-api (clean API): " + byReach["json-api"] + " (" + pct(byReach["json-api"]) + ")");
  lines.push("- json-ld (universal reader): " + byReach["json-ld"] + " (" + pct(byReach["json-ld"]) + ")");
  lines.push("- none/unknown from landing: " + byReach.none + " (" + pct(byReach.none) + ")");
  lines.push("- **employer-direct reachable (api+json-ld): " + (byReach["json-api"] + byReach["json-ld"]) + " (" + pct(byReach["json-api"] + byReach["json-ld"]) + ")**");
  lines.push("");
  lines.push("## ATS breakdown");
  for (const [t, c] of Object.entries(byType).sort((a, b) => b[1] - a[1])) lines.push("- " + t + ": " + c);
  lines.push("");
  lines.push("## Per-sponsor");
  lines.push("| Employer | ATS | Reach | Handle |");
  lines.push("|---|---|---|---|");
  for (const r of results) lines.push("| " + r.employer + " | " + r.type + " | " + r.reach + " | " + (r.handle ?? "") + " |");
  lines.push("");
  lines.push("## " + jsonLdSelfTest().split("\n").join("\n"));
  lines.push("");

  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(join(OUT_DIR, "ats_reachability.md"), lines.join("\n"), "utf8");

  console.log("Reachability of top " + n + " sponsors:");
  console.log("  json-api (Workday/Greenhouse): " + byReach["json-api"] + " (" + pct(byReach["json-api"]) + ")");
  console.log("  json-ld (iCIMS/Oracle/etc):    " + byReach["json-ld"] + " (" + pct(byReach["json-ld"]) + ")");
  console.log("  none/unknown from landing:     " + byReach.none + " (" + pct(byReach.none) + ")");
  console.log("  employer-direct reachable:     " + (byReach["json-api"] + byReach["json-ld"]) + " (" + pct(byReach["json-api"] + byReach["json-ld"]) + ")");
  console.log("  ATS types: " + JSON.stringify(byType));
  console.log("");
  console.log(jsonLdSelfTest());
  console.log("\n  report: " + join(OUT_DIR, "ats_reachability.md"));
}

main();
