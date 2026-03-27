import { NextResponse } from "next/server";
import { WAIVER_JOBS } from "@/lib/waiver-jobs-data";

const TIMEOUT_MS = 10000;
const USER_AGENT = "USCEHub-JobVerifier/1.0 (uscehub.com; job verification bot)";

/**
 * Vercel Cron Job: Verify J-1 Waiver Job Listings
 *
 * Runs 3x daily at 8am, 2pm, 10pm UTC.
 * Checks every job's sourceUrl to ensure it's still live.
 * Flags expired jobs for removal.
 *
 * Configure in vercel.json:
 * { "crons": [{ "path": "/api/cron/verify-jobs", "schedule": "0 8,14,22 * * *" }] }
 */
export async function GET(request: Request) {
  // Verify this is a legitimate cron request (Vercel adds this header)
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    // In development, allow without auth
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

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
