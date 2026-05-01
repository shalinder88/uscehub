/**
 * Per-host throttle for the verification cron.
 *
 * The Phase 3.3 cron already batches 5-at-a-time with a 500 ms gap,
 * but it has no per-hostname guard: if 5 listings happened to share
 * a host, that host would see 5 concurrent HEAD requests. This
 * helper splits a candidate list into "probe now" vs. "defer to
 * the next run" so each cron tick touches each host at most once
 * (configurable). Pure function — no I/O.
 *
 * Conservative-by-design:
 *   - Defers extras silently rather than dropping them. The cron's
 *     orderBy(`lastVerificationAttemptAt asc nulls first`) picks
 *     them up the next day naturally.
 *   - Default cap is 1 listing per host per run. Tunable via
 *     `maxPerHost` for tests.
 *   - Listings with no parseable URL are passed through untouched
 *     (the cron skips them anyway).
 */

interface ThrottleCandidate {
  id: string;
  /** First non-empty among sourceUrl, applicationUrl, websiteUrl. */
  probeUrl: string | null;
}

export interface HostThrottleResult<T extends ThrottleCandidate> {
  toProbe: T[];
  deferred: Array<{ id: string; reason: "host_throttled"; hostname: string }>;
  hostnamesSeen: string[];
}

export interface HostThrottleOptions {
  maxPerHost?: number;
}

function hostnameOf(url: string | null): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname.toLowerCase();
  } catch {
    return null;
  }
}

/**
 * Split candidates into a list to probe in this cron tick and a list
 * deferred to a later tick because their host already used its
 * per-tick budget.
 *
 * Order is preserved: the first candidate per host wins. Callers
 * should sort their input by staleness before calling so the oldest
 * row per host is the one probed.
 */
export function partitionByHost<T extends ThrottleCandidate>(
  candidates: T[],
  options: HostThrottleOptions = {}
): HostThrottleResult<T> {
  const maxPerHost = Math.max(1, options.maxPerHost ?? 1);
  const counts = new Map<string, number>();
  const toProbe: T[] = [];
  const deferred: HostThrottleResult<T>["deferred"] = [];
  const hostnamesSeen = new Set<string>();

  for (const c of candidates) {
    const host = hostnameOf(c.probeUrl);
    if (!host) {
      // Unparseable / null URL — let the cron's existing skip-no-url
      // logic handle it. Pass through.
      toProbe.push(c);
      continue;
    }
    hostnamesSeen.add(host);
    const cur = counts.get(host) ?? 0;
    if (cur < maxPerHost) {
      counts.set(host, cur + 1);
      toProbe.push(c);
    } else {
      deferred.push({ id: c.id, reason: "host_throttled", hostname: host });
    }
  }

  return { toProbe, deferred, hostnamesSeen: Array.from(hostnamesSeen).sort() };
}
