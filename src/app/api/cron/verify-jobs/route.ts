import { NextResponse } from "next/server";
import { WAIVER_JOBS } from "@/lib/waiver-jobs-data";
import { getCronSecret } from "@/lib/env";

const TIMEOUT_MS = 10000;
const USER_AGENT = "USCEHub-JobVerifier/1.0 (uscehub.com; job verification bot)";

/**
 * Vercel Cron Job: Verify J-1 Waiver Job Listings
 *
 * Runs **once daily at 8am UTC** (per vercel.json's "0 8 * * *" schedule).
 * Checks every job's sourceUrl to ensure it's still live.
 * Flags expired jobs for removal.
 *
 * The actual schedule is in vercel.json:
 *   { "crons": [{ "path": "/api/cron/verify-jobs", "schedule": "0 8 * * *" }] }
 *
 * (Audit P1-9, fixed in cleanup PR6: this docstring previously claimed
 * "3x daily at 8am, 2pm, 10pm UTC" with the example schedule
 * "0 8,14,22 * * *", which did not match the actual single-run config.
 * Increasing cron frequency is an ops decision; the comment was
 * corrected to match the configured schedule.)
 *
 * Auth: in production, CRON_SECRET is REQUIRED. The previous code
 * compared against `Bearer ${process.env.CRON_SECRET}` which silently
 * resolved to `Bearer undefined` if the env was missing — meaning an
 * attacker could bypass auth by sending exactly that string. The
 * env helper now throws `MissingEnvError` in production if the secret
 * is unset, and the bearer comparison below is empty-string safe.
 */
export async function GET(request: Request) {
  // Verify this is a legitimate cron request (Vercel adds this header).
  // In production, getCronSecret() throws MissingEnvError if CRON_SECRET
  // is unset — that is INTENTIONAL: the route should refuse to serve
  // until the secret is configured. In development, secret may be undefined.
  const expectedSecret = getCronSecret();
  const authHeader = request.headers.get("authorization");

  if (process.env.NODE_ENV === "production") {
    // expectedSecret is non-empty here (getCronSecret throws otherwise).
    if (authHeader !== `Bearer ${expectedSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  } else if (expectedSecret) {
    // Dev with a configured secret — still validate, so local cron
    // testing matches prod behavior.
    if (authHeader !== `Bearer ${expectedSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }
  // Dev with no secret configured: allow through for local testing.

  const results = {
    timestamp: new Date().toISOString(),
    total: WAIVER_JOBS.length,
    active: 0,
    expired: 0,
    errors: 0,
    details: [] as { id: string; employer: string; status: string; httpStatus?: number }[],
  };

  // Check each job URL in batches of 5
  for (let i = 0; i < WAIVER_JOBS.length; i += 5) {
    const batch = WAIVER_JOBS.slice(i, i + 5);
    const checks = await Promise.all(
      batch.map(async (job) => {
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);
          const res = await fetch(job.sourceUrl, {
            method: "HEAD",
            headers: { "User-Agent": USER_AGENT },
            signal: controller.signal,
            redirect: "follow",
          });
          clearTimeout(timeout);

          if (res.ok) {
            results.active++;
            return { id: job.id, employer: job.employer, status: "active", httpStatus: res.status };
          }
          if (res.status === 404 || res.status === 410) {
            results.expired++;
            return { id: job.id, employer: job.employer, status: "expired", httpStatus: res.status };
          }
          results.errors++;
          return { id: job.id, employer: job.employer, status: "error", httpStatus: res.status };
        } catch {
          results.errors++;
          return { id: job.id, employer: job.employer, status: "error", httpStatus: 0 };
        }
      })
    );
    results.details.push(...checks);

    // Rate limit between batches
    if (i + 5 < WAIVER_JOBS.length) {
      await new Promise((r) => setTimeout(r, 500));
    }
  }

  return NextResponse.json(results);
}
