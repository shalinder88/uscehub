# P102-GOLD — Operator Continuation Script

status: ACTIVE — for resuming the gold benchmark after the foundation pass.
branch: `local/p102-gold-deep-benchmark`

## What's already done

- **4 / 11 institutions are gold-status-complete** (documented in [`P102_GOLD_RUNNING_LOG.md`](P102_GOLD_RUNNING_LOG.md)):
  - Gold #3 — Houston Methodist Hospital → `GOLD_PASS_NO_PUBLIC_SAFE_CORRECT`
  - Gold #5 — Hartford Hospital → `GOLD_PASS_NO_PUBLIC_SAFE_CORRECT`
  - Gold #6 — AdventHealth Orlando → `GOLD_PASS_HUMAN_REVIEW_REQUIRED` (after the P102-0G scope-discipline bugfix)
  - Gold #8 — The Brooklyn Hospital Center → `GOLD_PASS_FUTURE_LANE_ONLY`
- **Gold #1 — Cleveland Clinic Florida** is mid-run (A0 captured 20 sources; deep extraction in progress at ~12/41 CLI calls when this script was written).
- The deep three-tier framework + bounded A4 fetch + deterministic scope discipline are all proven on real institutions.
- 11 / 11 validators pass on the current ledger state.

## What's pending

6 fresh institutions need an A0 source capture + deep extraction. Each takes ~30-60 min wall time (mostly the deep `claude -p` calls). One at a time, per the operating model.

| # | Institution | Domain | Expected outcome |
|---|---|---|---|
| 1 | Cleveland Clinic Florida | `my.clevelandclinic.org` | International medical student program → possibly ≥1 PUBLIC_SAFE_USCE |
| 2 | Vanderbilt University Medical Center | `vumc.org` | VSLO-only restriction → PUBLIC_SAFE_USCE for VSLO + negative for IMG |
| 4 | Mayo Clinic Rochester | `mayoclinic.org` | Explicit refusal → PUBLIC_SAFE_NO_PUBLIC_OPPORTUNITY |
| 7 | Brigham and Women's Hospital | `brighamandwomens.org` | HMS scope ambiguity → at most CAUTION_SAFE |
| 9 | Northwell Staten Island UH | `northwell.edu` | Jobs/visa-rich → high Tier 3 FUTURE_LANE |
| 10 | Boston Medical Center | `bmc.org` | PDF-heavy → exercise PDF cascade |
| 11 | Michigan Medicine | `uofmhealth.org` | Bot-block / timeout → A0 documents the block |

## The continuation script

Paste this into a fresh `claude` Code session (or a terminal that has the project's `claude` CLI authenticated):

```bash
cd /Users/shelly/usmle-platform

# Sanity check.
git branch --show-current
git rev-parse HEAD
command -v claude && claude --version

# Resume queue (if Cleveland is still running when you restart, wait
# for `pgrep -f "p102-claude-cli-extractor.ts --run-id p102-gold-1"`
# to come back empty before continuing).

QUEUE="docs/platform-v2/local/usce-discovery-command-center/p102/queues/p102_gold_deep_benchmark_queue.csv"

# For each pending institution, run the full sequence one at a time.
# Replace <RUN_ID> with the institution's intended run id and
# <INSTITUTION_ID> with the canonical id from the queue.

for inst in \
    "inst_vanderbilt_vumc:p102-gold-2-vanderbilt-vumc" \
    "inst_mayo_clinic_rochester_mn:p102-gold-4-mayo-rochester" \
    "inst_brigham_and_womens_hospital_ma:p102-gold-7-brigham-and-womens" \
    "inst_northwell_staten_island_uh_ny:p102-gold-9-northwell-staten-island" \
    "inst_boston_medical_center_ma:p102-gold-10-boston-medical-center" \
    "inst_michigan_medicine_mi:p102-gold-11-michigan-medicine"; do
  IFS=":" read -r INST_ID RUN_ID <<< "$inst"
  echo "===== ${RUN_ID} ($INST_ID) ====="
  # 1) A0 capture
  npx tsx scripts/p102-discovery-runner.ts --queue "$QUEUE" --limit 1 --run-id "$RUN_ID" --institution-id "$INST_ID"
  # 2) Deep source discovery (re-classify into deep taxonomy)
  npx tsx scripts/p102-deep-source-discovery.ts --run-id "$RUN_ID"
  # 3) Deep extraction
  npx tsx scripts/p102-claude-cli-extractor.ts --run-id "$RUN_ID" --deep
  # 4) If A3 emitted deepRecoveryTasks, optionally fetch them
  if [ -s "docs/platform-v2/local/usce-discovery-command-center/p102/runs/${RUN_ID}/A4_deep_recovery_tasks.json" ]; then
    has_tasks=$(jq '(.tasks // [] | length) > 0' \
      "docs/platform-v2/local/usce-discovery-command-center/p102/runs/${RUN_ID}/A4_deep_recovery_tasks.json")
    if [ "$has_tasks" = "true" ]; then
      npx tsx scripts/p102-claude-cli-extractor.ts --run-id "$RUN_ID" --deep --fetch-additional \
        --max-additional-candidates 20 --max-additional-accepted 10 --max-additional-pdfs 5
    fi
  fi
  # 5) Regate + quote re-verify
  npx tsx scripts/p102-regate-run.ts --run-id "$RUN_ID"
  npx tsx scripts/p102-quote-verify.ts --run-id "$RUN_ID" --strict
  # 6) Validators
  npx tsx scripts/p102-validate-all.ts --fast || echo "  ⚠ validators failed; review run folder"
  echo "===== done: ${RUN_ID} ====="
done

# After all 6 are done, append per-institution entries to
# P102_GOLD_RUNNING_LOG.md (copy the format from the existing 4 entries)
# and fill in P102_GOLD_DEEP_BENCHMARK_REPORT.md sections 4-14.

# Final commit (no push):
git add docs/platform-v2/local/usce-discovery-command-center/p102 scripts/p102-*.ts
git status --short
git commit -m "P102: run gold deep benchmark (remaining institutions)"
```

## What the operator should watch for

- **Bot block** (Michigan Medicine especially). If A0 returns 0 accepted sources or 403s, mark the institution `GOLD_BLOCKED_FETCH` and continue to the next; the framework tolerates this honestly.
- **PUBLIC_SAFE_USCE candidates** on Cleveland Clinic Florida, Vanderbilt, or BMC. If any appear, manually inspect the quote to confirm the source is institution-specific (not system-wide) and the quote is a definite offer / eligibility statement. The deterministic re-classifier should already enforce this; manual review is a sanity check.
- **PDF cascade** on BMC. If `pdftotext` is unavailable, PDFs land as `PDF_OCR_UNAVAILABLE` — that's an honest failure mode, not a framework bug.
- **System-domain attribution** on Cleveland Clinic Florida (`my.clevelandclinic.org`). The Cleveland Clinic system has campuses in Florida, Ohio, Las Vegas, Abu Dhabi, London. If a captured page is system-wide, the deterministic scope classifier should downgrade Tier 1 candidates to HUMAN_REVIEW_REQUIRED — same fix path that worked on AdventHealth Orlando.

## After all 11 institutions

Run the gold-set evaluator and fill in the report:

```bash
npx tsx scripts/p102-gold-set-verify.ts
npx tsx scripts/p102-validate-all.ts          # full sweep with tsc
```

Update [`P102_GOLD_DEEP_BENCHMARK_REPORT.md`](P102_GOLD_DEEP_BENCHMARK_REPORT.md) sections 3, 4, 5–14, and commit.

If 11/11 pass per the Phase E rules, the recommendation is **B. one-state deep queue**.

If any fail, the recommendation is **A. P102-GOLD-FIX** with the specific failure documented.
