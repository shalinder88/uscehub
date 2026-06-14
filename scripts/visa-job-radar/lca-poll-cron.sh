#!/bin/zsh
# LCA-notice radar daily poll — headless launchd wrapper.
#
# Why this exists: the poll used to be a Claude scheduled-task skill, which only
# fires when the Claude desktop app happens to be open at 8:05am. It silently
# missed 2026-06-12 and 2026-06-13. Notices vanish in ~10 business days, so a
# missed poll loses time-series data that cannot be backfilled. This script is a
# pure deterministic replacement (no Claude dependency) run by launchd, matching
# the proven p102-research-cron pattern.
#
# Mirrors lca-notice-radar-poll/SKILL.md exactly: 3 tsx steps, then a SCOPED
# local commit of only the regenerated artifacts. NEVER pushes.

set -uo pipefail

REPO="/Users/shelly/usmle-platform"
export PATH="$HOME/homebrew/bin:$PATH"
LOG="$HOME/Library/Logs/uscehub-lca-poll.log"

log() { echo "[$(date '+%Y-%m-%dT%H:%M:%S%z')] $*" >>"$LOG"; }

cd "$REPO" || { log "FATAL: cannot cd to $REPO"; exit 0; }

log "=== LCA poll start ==="

# Step 1-3: deterministic regeneration. Any failure aborts before the commit.
if ! npx tsx scripts/visa-job-radar/lca-notice-radar.ts >>"$LOG" 2>&1; then
  log "FAIL: lca-notice-radar.ts — skipping fusion/commit"; exit 0
fi
if ! npx tsx scripts/visa-job-radar/sponsor-truth.ts >>"$LOG" 2>&1; then
  log "FAIL: sponsor-truth.ts — skipping commit"; exit 0
fi
if ! npx tsx scripts/visa-job-radar/build-sponsor-truth-overlay.ts >>"$LOG" 2>&1; then
  log "FAIL: build-sponsor-truth-overlay.ts — skipping commit"; exit 0
fi

# Scoped stage: only the regenerated artifacts (matches SKILL.md "What to commit").
git add \
  docs/platform-v2/local/career/jobs/radar/lca-notices/notices_index.json \
  docs/platform-v2/local/career/jobs/radar/lca-notices/lca_notice_report.md \
  docs/platform-v2/local/career/jobs/radar/sponsor-universe/sponsor_truth.json \
  docs/platform-v2/local/career/jobs/radar/sponsor-universe/sponsor_truth_report.md \
  docs/platform-v2/local/career/jobs/radar/lca-notices/pdfs/ \
  src/lib/sponsor-truth-overlay.ts 2>>"$LOG"

if git diff --cached --quiet; then
  log "no changes to commit — index already current"
  log "=== LCA poll done (noop) ==="
  exit 0
fi

DAY="$(date '+%Y-%m-%d')"
N_PHYS="$(python3 -c "import json,sys
try:
    d=json.load(open('docs/platform-v2/local/career/jobs/radar/lca-notices/notices_index.json'))
    print(sum(1 for n in d if n.get('isPhysicianRole')))
except Exception:
    print('?')" 2>/dev/null)"

git commit -m "LCA-notice radar: daily poll ${DAY} — ${N_PHYS} physician notices" >>"$LOG" 2>&1
log "committed: ${N_PHYS} physician notices (local only, NOT pushed)"
log "=== LCA poll done (committed) ==="
exit 0
