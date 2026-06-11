// Sponsor-truth fusion — the product's core artifact.
//
// Answers the IMG's actual question per employer: "will they actually sponsor
// me?" by fusing the three public evidence layers:
//   1. DOL sponsor HISTORY  (sponsor-universe: certified LCA volume, specialties,
//      J-1/cap-exempt flags, Sponsor-History Score)
//   2. LIVE LCA-notice ACTIVITY (lca-notice-radar index: role-level filings on
//      the employer's own site — the freshest legal signal)
//   3. CURRENT employer-direct OPENINGS (latest engine run: PUBLISH /
//      VISA_SIGNAL_ONLY / SPONSOR_LEAD buckets at that employer)
//
// Every layer is public, employer-or-government origin, and citable. The output
// is run-dir/docs intelligence — nothing here publishes to the app surface.
//
//   npx tsx scripts/visa-job-radar/sponsor-truth.ts

import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { buildSponsorUniverse, normEmployer, type SponsorUniverseEntry } from "./sponsor-universe";
import type { LcaNoticeRecord } from "./lca-notice-radar";
import type { RadarJob } from "./types";

const RADAR_DIR = join(process.cwd(), "docs/platform-v2/local/career/jobs/radar");
const NOTICE_INDEX = join(RADAR_DIR, "lca-notices/notices_index.json");
const RUNS_DIR = join(RADAR_DIR, "runs");
const OUT_JSON = join(RADAR_DIR, "sponsor-universe/sponsor_truth.json");
const OUT_MD = join(RADAR_DIR, "sponsor-universe/sponsor_truth_report.md");

interface OpeningSummary {
  status: string;
  title: string;
  state?: string;
  sourceUrl: string;
}

export interface SponsorTruth {
  employer: string;
  normKey: string;
  state?: string;
  // Layer 1 — history (DOL disclosure, quarterly, lagged)
  history: {
    score: number;
    totalCertifiedPositions: number;
    specialties: string[];
    j1Flag: boolean;
    capExempt: boolean;
    sources: string[];
  };
  // Layer 2 — live filings (employer-hosted LCA notices)
  liveActivity: {
    physicianNotices: number;
    latestNoticeAt?: string;
    notices: Array<{ role?: string; salaryText?: string; periodText?: string; noticeUrl: string; firstSeenAt: string }>;
  };
  // Layer 3 — current employer-direct openings (latest engine run)
  openings: {
    runId?: string;
    publish: number;
    signal: number;
    sponsorLead: number;
    samples: OpeningSummary[];
  };
  truthSummary: string;
}

function latestRunDir(): string | undefined {
  if (!existsSync(RUNS_DIR)) return undefined;
  const dirs = readdirSync(RUNS_DIR).filter((d) => !d.startsWith(".")).sort();
  return dirs.length > 0 ? join(RUNS_DIR, dirs[dirs.length - 1]) : undefined;
}

function summarize(t: SponsorTruth): string {
  const bits: string[] = [];
  bits.push(
    "DOL history: " + t.history.totalCertifiedPositions + " certified physician position(s)" +
    (t.history.specialties.length > 0 ? " across " + t.history.specialties.length + " specialt" + (t.history.specialties.length === 1 ? "y" : "ies") : "") +
    (t.history.capExempt ? "; cap-exempt" : "") +
    (t.history.j1Flag ? "; J-1-relevant" : "") + ".",
  );
  if (t.liveActivity.physicianNotices > 0) {
    bits.push(
      "ACTIVELY sponsoring: " + t.liveActivity.physicianNotices + " physician LCA notice(s) on the employer's own site (latest " +
      (t.liveActivity.latestNoticeAt ?? "?").slice(0, 10) + ").",
    );
  }
  const open = t.openings.publish + t.openings.signal + t.openings.sponsorLead;
  if (open > 0) {
    bits.push(
      open + " current physician opening(s) employer-direct (" +
      t.openings.publish + " affirmative-visa, " + t.openings.signal + " signal, " + t.openings.sponsorLead + " sponsor-lead).",
    );
  }
  bits.push("Caveat: employer-level history does not guarantee any specific role sponsors.");
  return bits.join(" ");
}

async function main(): Promise<void> {
  const universe: SponsorUniverseEntry[] = buildSponsorUniverse();

  // Layer 2 — LCA notices by employer key
  const noticesByKey = new Map<string, LcaNoticeRecord[]>();
  if (existsSync(NOTICE_INDEX)) {
    const notices = JSON.parse(readFileSync(NOTICE_INDEX, "utf8")) as LcaNoticeRecord[];
    for (const n of notices) {
      const key = normEmployer(n.employer);
      const arr = noticesByKey.get(key) ?? [];
      arr.push(n);
      noticesByKey.set(key, arr);
    }
  }

  // Layer 3 — latest run leads by employer key
  const runDir = latestRunDir();
  const leadsByKey = new Map<string, RadarJob[]>();
  let runId: string | undefined;
  if (runDir) {
    runId = runDir.split("/").pop();
    const jobs = JSON.parse(readFileSync(join(runDir, "validated_jobs.json"), "utf8")) as RadarJob[];
    for (const j of jobs) {
      if (j.raw.isFixture) continue;
      const s = j.classification.status as string;
      if (s !== "PUBLISH" && s !== "VISA_SIGNAL_ONLY" && s !== "SPONSOR_LEAD") continue;
      const key = normEmployer(j.raw.employer);
      const arr = leadsByKey.get(key) ?? [];
      arr.push(j);
      leadsByKey.set(key, arr);
    }
  }

  const out: SponsorTruth[] = [];
  for (const e of universe) {
    const notices = (noticesByKey.get(e.normKey) ?? []).filter((n) => n.isPhysicianRole);
    const leads = leadsByKey.get(e.normKey) ?? [];
    const publish = leads.filter((l) => (l.classification.status as string) === "PUBLISH").length;
    const signal = leads.filter((l) => (l.classification.status as string) === "VISA_SIGNAL_ONLY").length;
    const sponsorLead = leads.filter((l) => (l.classification.status as string) === "SPONSOR_LEAD").length;
    const t: SponsorTruth = {
      employer: e.employer,
      normKey: e.normKey,
      state: e.state,
      history: {
        score: e.score,
        totalCertifiedPositions: e.totalPositions,
        specialties: e.specialties,
        j1Flag: e.visaTypes.includes("j1"),
        capExempt: e.capExempt,
        sources: e.sources,
      },
      liveActivity: {
        physicianNotices: notices.length,
        latestNoticeAt: notices.map((n) => n.lastSeenAt).sort().pop(),
        notices: notices.map((n) => ({
          role: n.role,
          salaryText: n.salaryText,
          periodText: n.periodText,
          noticeUrl: n.noticeUrl,
          firstSeenAt: n.firstSeenAt,
        })),
      },
      openings: {
        runId,
        publish,
        signal,
        sponsorLead,
        samples: leads.slice(0, 5).map((l) => ({
          status: l.classification.status as string,
          title: l.raw.title,
          state: l.raw.state,
          sourceUrl: l.raw.sourceUrl,
        })),
      },
      truthSummary: "",
    };
    t.truthSummary = summarize(t);
    out.push(t);
  }

  // Rank: live activity first, then current openings, then history score.
  out.sort((a, b) => {
    if (b.liveActivity.physicianNotices !== a.liveActivity.physicianNotices) {
      return b.liveActivity.physicianNotices - a.liveActivity.physicianNotices;
    }
    const ob = b.openings.publish + b.openings.signal + b.openings.sponsorLead;
    const oa = a.openings.publish + a.openings.signal + a.openings.sponsorLead;
    if (ob !== oa) return ob - oa;
    return b.history.score - a.history.score;
  });

  writeFileSync(OUT_JSON, JSON.stringify(out, null, 2) + "\n", "utf8");

  const withLive = out.filter((t) => t.liveActivity.physicianNotices > 0).length;
  const withOpenings = out.filter((t) => t.openings.publish + t.openings.signal + t.openings.sponsorLead > 0).length;

  const lines: string[] = [];
  lines.push("# Sponsor truth — fused per-employer evidence");
  lines.push("");
  lines.push("Generated " + new Date().toISOString() + " · " + out.length + " employers");
  lines.push("");
  lines.push("- With LIVE physician LCA-notice activity: " + withLive);
  lines.push("- With current employer-direct openings (latest run " + (runId ?? "n/a") + "): " + withOpenings);
  lines.push("");
  lines.push("## Top 25 (live activity → openings → history score)");
  lines.push("");
  for (const t of out.slice(0, 25)) {
    lines.push("### " + t.employer + (t.state ? " (" + t.state + ")" : "") + " — score " + t.history.score);
    lines.push("");
    lines.push(t.truthSummary);
    for (const n of t.liveActivity.notices.slice(0, 3)) {
      lines.push("- LIVE filing: " + (n.role ?? "?") + " — " + (n.salaryText ?? "?") + " — " + (n.periodText ?? "?") + " — [notice](" + n.noticeUrl + ")");
    }
    for (const s of t.openings.samples.slice(0, 3)) {
      lines.push("- Opening [" + s.status + "]: " + s.title + (s.state ? " (" + s.state + ")" : ""));
    }
    lines.push("");
  }
  writeFileSync(OUT_MD, lines.join("\n"), "utf8");

  console.log("Sponsor truth fused: " + out.length + " employers");
  console.log("  with live physician LCA activity: " + withLive);
  console.log("  with current employer-direct openings: " + withOpenings);
  console.log("  top of ranking:");
  for (const t of out.slice(0, 5)) {
    console.log(
      "    • " + t.employer + " — score " + t.history.score +
      " | live notices " + t.liveActivity.physicianNotices +
      " | openings " + (t.openings.publish + t.openings.signal + t.openings.sponsorLead),
    );
  }
  console.log("  json: " + OUT_JSON);
  console.log("  report: " + OUT_MD);
}

main();
