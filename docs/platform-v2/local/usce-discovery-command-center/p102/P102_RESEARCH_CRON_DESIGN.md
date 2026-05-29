# P102 Research Cron — Design

schemaVersion: p102-research-cron-2
status: BUILT, national queue seeded (46 institutions), launchd NOT installed

## 1. What this is

A local scheduler that keeps the **research** half of the P102 pipeline
running on its own, one institution at a time, and stops at the human review
queue. It does not invent a new crawler — it orchestrates the existing,
proven, doctrine-bound scripts. The F8 rule-based crawler proposal
(`docs/platform-v2/CRON_EXTRACTOR_PROPOSAL.md`) is explicitly **not** adopted;
it contradicts the P102 operating doctrine (no broad crawler, rule 17/30) and
the model-reader extractor that already exists.

This complements — does not replace — the two crons that already run on
Vercel:

| Cron | Where | Job |
|---|---|---|
| `verify-jobs` | Vercel `0 8 * * *` | re-check job listings |
| `verify-listings` | Vercel `0 9 * * *` | re-verify existing listing links (freshness) |
| **`p102-research-cron`** | **local launchd** | **discover + extract NEW candidates → review queue** |

The freshness cron answers "is what we already show still good?" This research
cron answers "what new, verifiable USCE exists that we haven't surfaced yet?"

## 2. Why local, not Vercel

The extraction step (`p102-claude-cli-extractor`) spawns the operator's
**already-authenticated `claude` CLI** (Claude Code) in headless mode. There is
no API key and no `@anthropic-ai/sdk` call. That session does not exist on
Vercel, and all evidence artifacts are written to the canonical **T7** root
(`/Volumes/T7Shield_Code/01_PROJECTS/USCEHub/11_LOCAL_EVIDENCE/p102-national-runner/`),
which only exists on the operator's Mac. So this cron is a macOS **launchd**
agent, not a Vercel cron.

## 3. The chain (6 stages, serial)

One launchd fire = one institution = one run (doctrine rule 1).

```
1. p102-discovery-runner      FIND     A0 deterministic probe + A1 capture
2. p102-claude-cli-extractor  EXTRACT  A1/A2 model readers, A3 hostile gate
3. p102-regate-run            VALIDATE network-free A3 re-gate
4. p102-compute-run-rating    RATE     Poor/Average/Good/Excellent per run
5. p102-build-public-safe-opportunity-rows  ENQUEUE  URL gate + 4 categories
6. p102-summarize-review-queue  DIGEST regenerate human-readable summary
```

Then it stops and journals: rating, categories found, attempt count,
next recheck date.

## 3a. URL quality gate (step 5)

Claims whose sourceUrl has no path (bare domain) go to
`low_quality_review_archive.json` and never reach the human review queue.

- `https://institution.org` → filtered (no path)
- `https://institution.edu/graduate-medical-education` → kept
- `https://uab.edu/medicine/gme/visiting-rotations` → kept

## 3b. The 4 USCE categories

Every claim is normalized to exactly one before queuing:
VSLO | CLERKSHIP | OBSERVERSHIP | RESEARCH

## 3c. Rating

| Rating | Criteria | Reaches review queue |
|---|---|---|
| EXCELLENT | 2+ categories, specific URLs, verified | Yes |
| GOOD | 1 category, specific URL, verified | Yes |
| AVERAGE | Hints found but no specific-path claims | No (low-quality archive) |
| POOR | Nothing verified | No (logged, recheck in 180d) |

## 3d. Re-research cadence

`CRON_COMPLETED` rows carry `next_recheck_after`. On each fire the cron
resets any row past its date back to `NOT_STARTED`. After 3 consecutive
POOR runs with zero verified claims → `EXHAUSTED_NO_USCE` (never
auto-requeued).

## 4. The hard stop — what it never does

The cron implements only the "test / find / validate" verbs. The "send out"
verb stays manual, because send-out crosses two gates that require a human:

- **Doctrine rule 20:** the runner never writes runtime / staged / live data.
- **Reviewer spec §6.8:** `reviewer` must be a human name — never "auto",
  "model", or "system". A cron is "system" and is therefore forbidden from
  approving anything.

So `p102-research-cron.ts` will **never**:
- set `APPROVE_PUBLIC_SAFE` or write `public_safe_review_decisions.csv`
- run `p102-build-approved-public-safe-export`
- run `p102-sync-approved-rows-to-website` (the file that feeds the website)
- touch Prisma / Supabase
- run `git` (no commit, no push)

## 5. The manual half (operator, unchanged)

After the cron has fed the queue, the operator runs the existing send-out
workflow when ready:

```
(human) assign decisions in public_safe_review_decisions.csv
npx tsx scripts/p102-build-approved-public-safe-export.ts
npx tsx scripts/p102-validate-approved-public-safe-export.ts   # gate
npx tsx scripts/p102-sync-approved-rows-to-website.ts          # → src snapshot
git add … && git commit … && (operator types "push")          # deploy
```

## 6. Preflight gates (every fire)

Any unmet precondition → one journal line + `exit 0` (no launchd retry-storm):

1. **T7 mounted** — else skip (evidence root unavailable).
2. **`claude` CLI present** at `~/.local/bin/claude` — else skip (extractor
   would fail). Note: presence ≠ authenticated; a lapsed session surfaces as a
   stage-2 FAIL in the journal, never as silent empty output.
3. **Queue exists** — primary-schema CSV at
   `queues/p102_national_research_queue.csv` (override with `--queue`).
4. **Queue has a `NOT_STARTED` row** — else `QUEUE_EXHAUSTED`.
5. **Cron lock free** — `<T7>/.research-cron.lock`. Present ⇒ another run is in
   flight or a stale lock needs review (doctrine rule 27: not silently
   overwritten).

## 7. Cursor & idempotency

The wrapper owns selection: it reads the national queue, picks the first
`NOT_STARTED` row, and hands the discovery-runner a temp single-row queue. On a
**verified-complete** run it rewrites that row's `status` to `CRON_COMPLETED`
and stamps `completed_at`. A failed run leaves the row `NOT_STARTED` so the
next fire retries it. Run folders are never overwritten (each fire mints a
fresh `cron-<timestamp>-<institutionId>` run-id; doctrine rule 26).

## 8. Queue seeding (prerequisite — not done by the cron)

The cron consumes a national research queue but never invents institutions.
Seed `queues/p102_national_research_queue.csv` (primary schema, same columns as
`p102_high_yield_usce_queue.csv`) from the universe inventory
(`p102-universe-inventory`) or an explicit operator-curated list. Until that
file exists, the cron skips cleanly on preflight #3.

## 9. Cadence & cost

Default: **once daily, 03:30 local**, one institution. A single institution is
a serial crawl of ~dozens of fixed paths + sitemap candidates (1.5s min delay,
named UA) plus several `claude` CLI calls (A1/A2 per accepted source + one A3).
`--max-sources-per-run` (default 12) bounds the per-run model spend. Bump the
schedule to twice daily only after watching a few runs land.

## 10. Verify before activation

```
npx tsc --noEmit
npx tsx scripts/p102-research-cron.ts --dry-run     # prints plan, mutates nothing
```

## 11. Activation (deliberate, after one supervised live run)

The launchd agent template lives beside this doc and is **not installed**.
Recommended order:

1. Seed the national queue (§8).
2. Do ONE supervised live run, watched:
   `npx tsx scripts/p102-research-cron.ts` — confirm the chain completes, the
   journal + review-queue summary look right, and the queue row flips to
   `CRON_COMPLETED`.
3. Install the agent:
   ```
   cp …/com.uscehub.p102-research-cron.plist.template \
      ~/Library/LaunchAgents/com.uscehub.p102-research-cron.plist
   launchctl load ~/Library/LaunchAgents/com.uscehub.p102-research-cron.plist
   ```
4. Uninstall any time:
   ```
   launchctl unload ~/Library/LaunchAgents/com.uscehub.p102-research-cron.plist
   rm ~/Library/LaunchAgents/com.uscehub.p102-research-cron.plist
   ```

## 12. Files

| File | Role |
|---|---|
| `scripts/p102-research-cron.ts` | the wrapper (find→extract→validate→enqueue→digest, then stop) |
| `…/p102/com.uscehub.p102-research-cron.plist.template` | launchd agent (uninstalled) |
| `…/p102/P102_RESEARCH_CRON_JOURNAL.md` | append-only run log (created on first run) |
| `…/p102/queues/p102_national_research_queue.csv` | the national queue (operator-seeded; §8) |
| `<T7>/cron-logs/<run-id>.log` | full per-run stage output |
