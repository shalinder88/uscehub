// Job-leads freshness history — tracks firstSeenAt/lastSeenAt per canonicalKey
// across live runs of the engine pipeline.
//
// The LCA notice index has first/last-seen timestamps; job leads from run.ts
// do not — each run is a fresh snapshot. This module bridges that gap: after
// every live run, run.ts calls updateJobLeadsHistory() to stamp the active keys.
//
// A job that is absent from N_MISS_TO_CLOSE consecutive live runs is marked
// presumedClosed=true. This lets the sponsor-truth layer distinguish employers
// whose leads are "still appearing in live pulls" from employers whose most
// recent lead has gone stale.
//
// sponsor-truth.ts uses recentlyActiveJobEmployers() to annotate the openings
// layer: "this employer had a live job lead ≤30 days ago."

import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { normEmployer } from "./sponsor-universe";
import type { RadarJob } from "./types";

const N_MISS_TO_CLOSE = 3; // consecutive absent live runs → presumedClosed

const HISTORY_FILE = join(
  process.cwd(),
  "docs/platform-v2/local/career/jobs/radar/job-leads-history.json",
);

export interface JobLeadRecord {
  key: string;
  title: string;
  employer: string;
  normKey: string;
  state?: string;
  sourceId: string;
  status: string;
  firstSeenAt: string;
  lastSeenAt: string;
  missedPolls: number;
  presumedClosed: boolean;
}

export function loadJobLeadsHistory(): Map<string, JobLeadRecord> {
  if (!existsSync(HISTORY_FILE)) return new Map();
  try {
    const arr = JSON.parse(readFileSync(HISTORY_FILE, "utf8")) as JobLeadRecord[];
    return new Map(arr.map((r) => [r.key, r]));
  } catch {
    return new Map();
  }
}

export function saveJobLeadsHistory(index: Map<string, JobLeadRecord>): void {
  const arr = Array.from(index.values()).sort((a, b) =>
    b.lastSeenAt.localeCompare(a.lastSeenAt),
  );
  writeFileSync(HISTORY_FILE, JSON.stringify(arr, null, 2) + "\n", "utf8");
}

// Call at the end of every live run. activeKeys = canonicalKeys of non-rejected,
// non-fixture jobs that appeared this run. jobs array is used for initial record
// creation only.
export function updateJobLeadsHistory(
  activeKeys: Set<string>,
  jobs: RadarJob[],
  now: string,
): Map<string, JobLeadRecord> {
  const index = loadJobLeadsHistory();
  const jobMap = new Map(jobs.map((j) => [j.canonicalKey, j]));

  // Bump lastSeenAt for active keys; create new records.
  for (const key of activeKeys) {
    const existing = index.get(key);
    if (existing) {
      existing.lastSeenAt = now;
      existing.missedPolls = 0;
      existing.presumedClosed = false;
      // Update status in case classification changed.
      const j = jobMap.get(key);
      if (j) existing.status = j.classification.status;
    } else {
      const j = jobMap.get(key);
      if (!j) continue;
      index.set(key, {
        key,
        title: j.raw.title,
        employer: j.raw.employer,
        normKey: normEmployer(j.raw.employer),
        state: j.raw.state,
        sourceId: j.raw.sourceId,
        status: j.classification.status,
        firstSeenAt: now,
        lastSeenAt: now,
        missedPolls: 0,
        presumedClosed: false,
      });
    }
  }

  // Increment missedPolls for anything not seen this run.
  for (const [key, rec] of index) {
    if (!activeKeys.has(key)) {
      rec.missedPolls++;
      if (rec.missedPolls >= N_MISS_TO_CLOSE) rec.presumedClosed = true;
    }
  }

  saveJobLeadsHistory(index);
  return index;
}

// Returns a Set of normEmployer keys that had at least one non-closed job lead
// within the last withinDays days. sponsor-truth.ts uses this to annotate the
// openings layer.
export function recentlyActiveJobEmployers(
  index: Map<string, JobLeadRecord>,
  withinDays: number,
  now: string,
): Set<string> {
  const cutoff = new Date(now).getTime() - withinDays * 24 * 60 * 60 * 1000;
  const out = new Set<string>();
  for (const rec of index.values()) {
    if (rec.presumedClosed) continue;
    if (new Date(rec.lastSeenAt).getTime() >= cutoff) out.add(rec.normKey);
  }
  return out;
}
