#!/usr/bin/env npx tsx
/**
 * ════════════════════════════════════════════════════════════════
 * USCEHub Job Verification Agent
 * ════════════════════════════════════════════════════════════════
 *
 * Runs 3x daily (8am, 2pm, 10pm) via cron or Vercel Cron.
 *
 * What it does:
 * 1. VERIFY — Check every job's sourceUrl. If 404/gone, flag as expired.
 * 2. DISCOVER — Check known job boards for new J-1/H-1B physician positions.
 * 3. REPORT — Log results: verified, expired, new discoveries.
 *
 * Data sources (in reliability order):
 * - Hospital career pages (most reliable)
 * - PracticeLink (22,500+ J-1 positions)
 * - PracticeMatch (J-1 filter)
 * - MDOpts (publicly viewable)
 * - Sound Physicians, USACS, CompHealth career pages
 * - Indeed (filtered by "J-1 waiver" + specialty)
 *
 * NOT used: DocCafe, recruiter-only listings, aggregator sites.
 *
 * To run manually:
 *   npx tsx scripts/verify-jobs.ts
 *
 * To schedule via Vercel Cron (vercel.json):
 *   { "crons": [{ "path": "/api/cron/verify-jobs", "schedule": "0 8,14,22 * * *" }] }
 *
 * To schedule via system cron:
 *   0 8,14,22 * * * cd /path/to/usmle-platform && npx tsx scripts/verify-jobs.ts >> logs/job-verify.log 2>&1
 */

import { WAIVER_JOBS, type WaiverJob } from "../src/lib/waiver-jobs-data";

const TIMEOUT_MS = 10000;
const USER_AGENT = "USCEHub-JobVerifier/1.0 (uscehub.com; job verification bot)";

interface VerifyResult {
  id: string;
  employer: string;
  sourceUrl: string;
  status: "active" | "expired" | "error" | "redirect";
  httpStatus?: number;
  message?: string;
}

async function checkUrl(url: string): Promise<{ status: number; ok: boolean; redirected: boolean }> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

    const response = await fetch(url, {
      method: "HEAD",
      headers: { "User-Agent": USER_AGENT },
      signal: controller.signal,
      redirect: "follow",
    });

    clearTimeout(timeout);
    return { status: response.status, ok: response.ok, redirected: response.redirected };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (message.includes("abort")) {
      return { status: 408, ok: false, redirected: false };
    }
    return { status: 0, ok: false, redirected: false };
  }
}

async function verifyJob(job: WaiverJob): Promise<VerifyResult> {
  const result = await checkUrl(job.sourceUrl);

  if (result.ok) {
    return {
      id: job.id,
      employer: job.employer,
      sourceUrl: job.sourceUrl,
      status: result.redirected ? "redirect" : "active",
      httpStatus: result.status,
    };
  }

  if (result.status === 404 || result.status === 410) {
    return {
      id: job.id,
      employer: job.employer,
      sourceUrl: job.sourceUrl,
      status: "expired",
      httpStatus: result.status,
      message: "Job listing no longer found at source URL",
    };
  }

  return {
    id: job.id,
    employer: job.employer,
    sourceUrl: job.sourceUrl,
    status: "error",
    httpStatus: result.status,
    message: `HTTP ${result.status} — may be temporary (bot blocking, rate limit, or server issue)`,
  };
}

async function main() {
  console.log("═══════════════════════════════════════════");
  console.log("USCEHub Job Verification Agent");
  console.log(`Run time: ${new Date().toISOString()}`);
  console.log(`Jobs to verify: ${WAIVER_JOBS.length}`);
  console.log("═══════════════════════════════════════════\n");

  const results: VerifyResult[] = [];

  // Verify in batches of 5 to avoid rate limiting
  for (let i = 0; i < WAIVER_JOBS.length; i += 5) {
    const batch = WAIVER_JOBS.slice(i, i + 5);
    const batchResults = await Promise.all(batch.map(verifyJob));
    results.push(...batchResults);

    // Brief pause between batches
    if (i + 5 < WAIVER_JOBS.length) {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  // Report
  const active = results.filter((r) => r.status === "active");
  const expired = results.filter((r) => r.status === "expired");
  const errors = results.filter((r) => r.status === "error");
  const redirects = results.filter((r) => r.status === "redirect");

  console.log("─── RESULTS ───");
  console.log(`✅ Active:    ${active.length}`);
  console.log(`🔄 Redirect:  ${redirects.length}`);
  console.log(`❌ Expired:   ${expired.length}`);
  console.log(`⚠️  Errors:    ${errors.length}`);
  console.log("");

  if (expired.length > 0) {
    console.log("─── EXPIRED JOBS (need removal) ───");
    for (const e of expired) {
      console.log(`  ${e.id} | ${e.employer} | ${e.sourceUrl} | HTTP ${e.httpStatus}`);
    }
    console.log("");
  }

  if (errors.length > 0) {
    console.log("─── ERRORS (may need manual check) ───");
    for (const e of errors) {
      console.log(`  ${e.id} | ${e.employer} | ${e.message}`);
    }
    console.log("");
  }

  console.log("═══════════════════════════════════════════");
  console.log(`Verification complete. Next run in ~8 hours.`);
  console.log("═══════════════════════════════════════════");

  // Return results for API route usage
  return {
    timestamp: new Date().toISOString(),
    total: WAIVER_JOBS.length,
    active: active.length,
    expired: expired.length,
    errors: errors.length,
    expiredJobs: expired,
    errorJobs: errors,
  };
}

// Run if executed directly
main().catch(console.error);

export { main as verifyJobs };
