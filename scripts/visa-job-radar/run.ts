// Visa Job Radar — runner.
//
// Pipeline: gather → clean → phrase hits → deterministic classify →
// canonical key → dedupe → quote-validation gate → tally → write audit run
// dir → emit the generated app file (PUBLISH, non-fixture only).
//
// Offline (no keys, no --live) this run uses fixtures alone, proves the engine
// against the hand-labeled gold, smoke-tests the connector parsers, and writes
// an EMPTY generated file (zero real jobs). No fixture can reach the app.

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import {
  canonicalKey,
  classify,
  clean,
  extractPhraseHits,
  validateQuote,
} from "./engine";
import { fetchGreenhouse, fetchUsajobs, parseGreenhouse, parseUsajobs } from "./connectors";
import { enabledSources, SOURCES } from "./source-registry";
import {
  EXPECTED,
  FIXTURES,
  SAMPLE_GREENHOUSE,
  SAMPLE_USAJOBS,
} from "./fixtures";
import type {
  CleanedJob,
  RadarJob,
  RawCandidate,
  RejectReason,
  RunReport,
} from "./types";

const REPO_ROOT = process.cwd();
const RUNS_DIR = join(
  REPO_ROOT,
  "docs/platform-v2/local/career/jobs/radar/runs",
);
const GENERATED_FILE = join(
  REPO_ROOT,
  "src/data/career/visa-jobs-radar.generated.ts",
);

const EMPTY_REASONS: Record<RejectReason, number> = {
  NO_VISA_MENTION: 0,
  SPONSORSHIP_DENIED: 0,
  NOT_PHYSICIAN: 0,
  RECRUITER_ONLY: 0,
  STALE: 0,
  DUPLICATE: 0,
  SOURCE_NOT_ALLOWED: 0,
};

function runIdFrom(iso: string): string {
  return iso.slice(0, 10) + "-" + iso.slice(11, 13) + iso.slice(14, 16);
}

async function gather(live: boolean): Promise<RawCandidate[]> {
  const candidates: RawCandidate[] = [...FIXTURES];
  if (!live) return candidates;
  for (const src of enabledSources()) {
    if (src.connector === "usajobs") {
      candidates.push(...(await fetchUsajobs(src.handle)));
    } else if (src.connector === "greenhouse") {
      candidates.push(...(await fetchGreenhouse(src.handle, src.employer ?? src.label)));
    }
  }
  return candidates;
}

function buildRadarJobs(candidates: RawCandidate[]): RadarJob[] {
  return candidates.map((raw) => {
    const cleanedText = clean(raw.rawText);
    const cleaned: CleanedJob = { raw, cleanedText };
    const phraseHits = extractPhraseHits(cleanedText);
    const classification = classify(cleaned, phraseHits);
    return {
      raw,
      cleanedText,
      phraseHits,
      classification,
      canonicalKey: canonicalKey(raw),
    };
  });
}

// First-wins with tier preference; only de-duplicates among non-REJECT jobs so
// reject reasons stay clean. Losers are demoted to REJECT/DUPLICATE.
function dedupe(jobs: RadarJob[]): number {
  const winners = new Map<string, RadarJob>();
  let dropped = 0;
  for (const job of jobs) {
    if (job.classification.status === "REJECT") continue;
    const prev = winners.get(job.canonicalKey);
    if (!prev) {
      winners.set(job.canonicalKey, job);
      continue;
    }
    const loser = job.raw.sourceTier < prev.raw.sourceTier ? prev : job;
    const keep = loser === prev ? job : prev;
    loser.classification.status = "REJECT";
    loser.classification.rejectReason = "DUPLICATE";
    loser.classification.notes.push("Duplicate of " + keep.raw.sourceId + ".");
    winners.set(job.canonicalKey, keep);
    dropped++;
  }
  return dropped;
}

// Hard gate: a PUBLISH job whose evidence quote does not verbatim match its
// source is downgraded to HOLD_REVIEW. Deterministic quotes always match; this
// gate exists for the Phase-2 AI quotes.
function quoteGate(jobs: RadarJob[]): number {
  let failures = 0;
  for (const job of jobs) {
    if (job.classification.status !== "PUBLISH") continue;
    const bad = job.classification.quotes.some(
      (q) => !validateQuote(job.cleanedText, q),
    );
    if (bad) {
      job.classification.status = "HOLD_REVIEW";
      job.classification.confidence = "MEDIUM";
      job.classification.notes.push("Quote failed verbatim validation — held.");
      failures++;
    }
  }
  return failures;
}

function tally(
  jobs: RadarJob[],
  runId: string,
  startedAt: string,
  finishedAt: string,
  live: boolean,
  duplicatesDropped: number,
  quoteValidationFailures: number,
): RunReport {
  const rejectByReason = { ...EMPTY_REASONS };
  let publishCount = 0;
  let holdCount = 0;
  let signalCount = 0;
  let rejectCount = 0;
  for (const j of jobs) {
    const s = j.classification.status;
    if (s === "PUBLISH") publishCount++;
    else if (s === "HOLD_REVIEW") holdCount++;
    else if (s === "VISA_SIGNAL_ONLY") signalCount++;
    else {
      rejectCount++;
      const r = j.classification.rejectReason ?? "NO_VISA_MENTION";
      rejectByReason[r]++;
    }
  }
  const candidateCount = jobs.length;
  const manualReviewPct =
    candidateCount === 0
      ? 0
      : Math.round(((holdCount + signalCount) / candidateCount) * 1000) / 10;
  return {
    runId,
    startedAt,
    finishedAt,
    live,
    candidateCount,
    publishCount,
    holdCount,
    signalCount,
    rejectCount,
    rejectByReason,
    quoteValidationFailures,
    duplicatesDropped,
    manualReviewPct,
  };
}

function goldCheck(jobs: RadarJob[]): { passed: number; failed: string[] } {
  const byId = new Map(jobs.map((j) => [j.raw.sourceId, j]));
  const failed: string[] = [];
  let passed = 0;
  for (const [id, gold] of Object.entries(EXPECTED)) {
    const job = byId.get(id);
    if (!job) {
      failed.push(id + ": missing from run");
      continue;
    }
    const got = job.classification;
    const statusOk = got.status === gold.status;
    const reasonOk = (gold.rejectReason ?? undefined) === (got.rejectReason ?? undefined);
    if (statusOk && reasonOk) {
      passed++;
    } else {
      failed.push(
        id +
          ": expected " +
          gold.status +
          (gold.rejectReason ? "/" + gold.rejectReason : "") +
          " got " +
          got.status +
          (got.rejectReason ? "/" + got.rejectReason : ""),
      );
    }
  }
  return { passed, failed };
}

function connectorCheck(): string[] {
  const problems: string[] = [];
  const fetchedAt = "1970-01-01T00:00:00.000Z";
  const u = parseUsajobs(SAMPLE_USAJOBS, "usajobs-test", fetchedAt);
  if (u.length !== 1) problems.push("USAJobs parse: expected 1, got " + u.length);
  else {
    if (u[0].state !== "AZ") problems.push("USAJobs parse: state mapping wrong");
    if (!u[0].rawText.includes("Visa sponsorship is available"))
      problems.push("USAJobs parse: summary not captured");
    if (u[0].isFixture) problems.push("USAJobs parse: isFixture must be false");
  }
  const g = parseGreenhouse(SAMPLE_GREENHOUSE, "gh-test", "Example Health", fetchedAt);
  if (g.length !== 1) problems.push("Greenhouse parse: expected 1, got " + g.length);
  else {
    if (!g[0].rawText.includes("H-1B sponsorship"))
      problems.push("Greenhouse parse: HTML strip/decoding lost the visa phrase");
    if (g[0].state !== "OR") problems.push("Greenhouse parse: state mapping wrong");
  }
  return problems;
}

function writeJson(dir: string, name: string, data: unknown): void {
  writeFileSync(join(dir, name), JSON.stringify(data, null, 2) + "\n", "utf8");
}

function jobsByStatus(jobs: RadarJob[], status: string): RadarJob[] {
  return jobs.filter((j) => j.classification.status === status);
}

interface ReportExtras {
  bySource: Array<[string, number]>;
  phraseHitTotal: number;
  affirmative: number;
  denied: number;
  boilerplate: number;
  promoted: boolean;
  nonFixturePublish: number;
}

function renderReportMd(
  report: RunReport,
  gold: { passed: number; failed: string[] },
  connectorProblems: string[],
  extras: ReportExtras,
): string {
  const lines: string[] = [];
  lines.push("# Visa Job Radar — run " + report.runId);
  lines.push("");
  lines.push("- Mode: " + (report.live ? "LIVE" : "offline (fixtures only)"));
  lines.push("- Started: " + report.startedAt);
  lines.push("- Finished: " + report.finishedAt);
  lines.push("");
  lines.push("## Sources attempted");
  for (const [src, count] of extras.bySource) {
    lines.push("- " + src + ": " + count + " candidates");
  }
  lines.push("");
  lines.push("## Phrase & polarity");
  lines.push("- Phrase hits total: " + extras.phraseHitTotal);
  lines.push("- Affirmative: " + extras.affirmative);
  lines.push("- Denied: " + extras.denied);
  lines.push("- Boilerplate: " + extras.boilerplate);
  lines.push("");
  lines.push("## Buckets");
  lines.push("- Candidates: " + report.candidateCount);
  lines.push("- PUBLISH: " + report.publishCount);
  lines.push("- HOLD_REVIEW: " + report.holdCount);
  lines.push("- VISA_SIGNAL_ONLY: " + report.signalCount);
  lines.push("- REJECT: " + report.rejectCount);
  lines.push("- Duplicates dropped: " + report.duplicatesDropped);
  lines.push("- Quote-validation failures: " + report.quoteValidationFailures);
  lines.push("- Manual review: " + report.manualReviewPct + "%");
  lines.push(
    "- Non-fixture PUBLISH: " +
      extras.nonFixturePublish +
      (extras.promoted ? " (promoted to app file)" : " (run dir only; not promoted)"),
  );
  lines.push("");
  lines.push("## Reject reasons");
  for (const [reason, count] of Object.entries(report.rejectByReason)) {
    if (count > 0) lines.push("- " + reason + ": " + count);
  }
  lines.push("");
  lines.push("## Gold self-check");
  lines.push("- Passed: " + gold.passed + "/" + (gold.passed + gold.failed.length));
  for (const f of gold.failed) lines.push("- FAIL " + f);
  lines.push("");
  lines.push("## Connector self-check");
  if (connectorProblems.length === 0) lines.push("- All parser assertions passed.");
  for (const p of connectorProblems) lines.push("- FAIL " + p);
  lines.push("");
  return lines.join("\n");
}

interface PublicJob {
  id: string;
  employer: string;
  title: string;
  city?: string;
  state?: string;
  sourceId: string;
  sourceUrl: string;
  postedDate?: string;
  visaLabels: string[];
  evidence: string[];
  confidence: string;
}

function toPublicJob(job: RadarJob): PublicJob {
  return {
    id: job.raw.sourceId,
    employer: job.raw.employer,
    title: job.raw.title,
    city: job.raw.city,
    state: job.raw.state,
    sourceId: job.raw.sourceId,
    sourceUrl: job.raw.sourceUrl,
    postedDate: job.raw.postedDate,
    visaLabels: job.classification.visaLabels,
    evidence: job.classification.quotes.map((q) => q.text),
    confidence: job.classification.confidence,
  };
}

function renderGeneratedTs(jobs: PublicJob[], lastRun: string): string {
  const note =
    jobs.length === 0
      ? "No live source configured yet; the deterministic engine is verified on fixtures only. This file is intentionally empty until a Tier-1 connector is enabled."
      : "Generated by the Visa Job Radar deterministic engine. PUBLISH bucket only.";
  return (
    "// AUTO-GENERATED by scripts/visa-job-radar/run.ts — do not edit by hand.\n" +
    "// Only PUBLISH-bucket, non-fixture jobs are emitted here.\n\n" +
    "export interface VisaRadarJob {\n" +
    "  id: string;\n" +
    "  employer: string;\n" +
    "  title: string;\n" +
    "  city?: string;\n" +
    "  state?: string;\n" +
    "  sourceId: string;\n" +
    "  sourceUrl: string;\n" +
    "  postedDate?: string;\n" +
    "  visaLabels: string[];\n" +
    "  evidence: string[];\n" +
    "  confidence: string;\n" +
    "}\n\n" +
    "export const RADAR_META = {\n" +
    "  lastRun: " + JSON.stringify(lastRun) + ",\n" +
    "  jobCount: " + jobs.length + ",\n" +
    "  note: " + JSON.stringify(note) + ",\n" +
    "} as const;\n\n" +
    "export const VISA_JOBS_RADAR: VisaRadarJob[] = " +
    JSON.stringify(jobs, null, 2) +
    ";\n"
  );
}

async function main(): Promise<void> {
  const live = process.argv.includes("--live");
  const promote = process.argv.includes("--promote");
  const startedAt = new Date().toISOString();
  const runId = runIdFrom(startedAt);

  const candidates = await gather(live);
  const jobs = buildRadarJobs(candidates);
  const duplicatesDropped = dedupe(jobs);
  const quoteValidationFailures = quoteGate(jobs);

  const gold = goldCheck(jobs);
  const connectorProblems = connectorCheck();

  const finishedAt = new Date().toISOString();
  const report = tally(
    jobs,
    runId,
    startedAt,
    finishedAt,
    live,
    duplicatesDropped,
    quoteValidationFailures,
  );

  const runDir = join(RUNS_DIR, runId);
  mkdirSync(runDir, { recursive: true });

  writeJson(runDir, "source_registry_snapshot.json", SOURCES);
  writeJson(runDir, "raw_candidates.json", candidates);
  writeJson(
    runDir,
    "fetched_pages_manifest.json",
    candidates.map((c) => ({
      sourceId: c.sourceId,
      sourceUrl: c.sourceUrl,
      fetchedAt: c.fetchedAt,
      bytes: c.rawText.length,
      isFixture: c.isFixture,
    })),
  );
  writeJson(
    runDir,
    "cleaned_jobs.json",
    jobs.map((j) => ({ sourceId: j.raw.sourceId, cleanedText: j.cleanedText })),
  );
  writeJson(
    runDir,
    "phrase_hits.json",
    jobs.map((j) => ({ sourceId: j.raw.sourceId, phraseHits: j.phraseHits })),
  );
  writeJson(
    runDir,
    "polarity_hits.json",
    jobs.map((j) => ({
      sourceId: j.raw.sourceId,
      affirmative: j.phraseHits.filter((h) => h.polarity === "AFFIRMATIVE").length,
      denied: j.phraseHits.filter((h) => h.polarity === "DENIED").length,
      boilerplate: j.phraseHits.filter((h) => h.polarity === "BOILERPLATE").length,
    })),
  );
  writeJson(
    runDir,
    "classifier_outputs.json",
    jobs.map((j) => ({ sourceId: j.raw.sourceId, classification: j.classification })),
  );
  writeJson(runDir, "validated_jobs.json", jobs);
  writeJson(runDir, "publish_high_confidence.json", jobsByStatus(jobs, "PUBLISH"));
  writeJson(runDir, "hold_review.json", jobsByStatus(jobs, "HOLD_REVIEW"));
  writeJson(runDir, "visa_signal_only.json", jobsByStatus(jobs, "VISA_SIGNAL_ONLY"));
  writeJson(runDir, "rejected.json", jobsByStatus(jobs, "REJECT"));
  const publicJobs = jobs
    .filter((j) => j.classification.status === "PUBLISH" && !j.raw.isFixture)
    .map(toPublicJob);

  const bySourceMap = new Map<string, number>();
  for (const c of candidates) {
    const key = c.isFixture ? "fixtures" : c.sourceId;
    bySourceMap.set(key, (bySourceMap.get(key) ?? 0) + 1);
  }
  let phraseHitTotal = 0;
  let affirmative = 0;
  let denied = 0;
  let boilerplate = 0;
  for (const j of jobs) {
    phraseHitTotal += j.phraseHits.length;
    for (const h of j.phraseHits) {
      if (h.polarity === "AFFIRMATIVE") affirmative++;
      else if (h.polarity === "DENIED") denied++;
      else boilerplate++;
    }
  }
  const extras: ReportExtras = {
    bySource: Array.from(bySourceMap.entries()),
    phraseHitTotal,
    affirmative,
    denied,
    boilerplate,
    promoted: promote,
    nonFixturePublish: publicJobs.length,
  };

  writeFileSync(
    join(runDir, "run_report.md"),
    renderReportMd(report, gold, connectorProblems, extras),
    "utf8",
  );

  // The app surface is only written when explicitly promoted. A live run leaves
  // the committed empty generated file untouched so real jobs get human review
  // (in the run dir) before they can reach the app.
  if (promote) {
    mkdirSync(join(REPO_ROOT, "src/data/career"), { recursive: true });
    writeFileSync(GENERATED_FILE, renderGeneratedTs(publicJobs, finishedAt), "utf8");
  }

  // console summary
  const ok = gold.failed.length === 0 && connectorProblems.length === 0;
  console.log("Visa Job Radar run " + runId + " (" + (live ? "live" : "offline") + ")");
  console.log(
    "  buckets: PUBLISH=" +
      report.publishCount +
      " HOLD=" +
      report.holdCount +
      " SIGNAL=" +
      report.signalCount +
      " REJECT=" +
      report.rejectCount +
      " of " +
      report.candidateCount,
  );
  console.log(
    "  rejects: " +
      Object.entries(report.rejectByReason)
        .filter(([, n]) => n > 0)
        .map(([r, n]) => r + "=" + n)
        .join(" "),
  );
  console.log(
    "  quoteValidationFailures=" +
      report.quoteValidationFailures +
      " duplicatesDropped=" +
      report.duplicatesDropped +
      " manualReview=" +
      report.manualReviewPct +
      "%",
  );
  console.log("  gold: " + gold.passed + "/" + (gold.passed + gold.failed.length) + " passed");
  for (const f of gold.failed) console.log("    FAIL " + f);
  console.log("  connector check: " + (connectorProblems.length === 0 ? "passed" : "FAILED"));
  for (const p of connectorProblems) console.log("    FAIL " + p);
  console.log("  generated jobs (non-fixture PUBLISH): " + publicJobs.length);
  console.log("  run dir: " + runDir);
  console.log(ok ? "OK" : "PROBLEMS DETECTED");

  if (!ok) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
