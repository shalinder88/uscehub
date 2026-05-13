# P102 Dashboard — All Runs

_Generated: 2026-05-13T12:29:50.948Z by `scripts/p102-generate-dashboard.ts`. Aggregates A3 verdicts + claim counts + metrics across all P102 runs. Pure data transform; no network, no Agent._

## Overall totals

| Metric | Value |
|---|---:|
| Total runs | 4 |
| Accepted sources (across all runs) | 39 |
| Claims emitted | 65 |
| Claims quote-verified | 65 / 65 |
| **PUBLIC_SAFE_USCE** | **0** |
| FUTURE_LANE_ONLY | 64 |
| HUMAN_REVIEW_REQUIRED | 1 |
| Negative-evidence claims | 0 (publicSafeNegative: 0) |
| Scope conflicts surfaced | 0 |
| JSON-LD claims | 0 |
| JSON-LD discovered URLs | 1 |
| A4 tasks generated | 1 |
| Runs attesting networkUsed=false + agentUsed=false | 4 / 4 |

## A3 verdict distribution

- **FAIL_NEEDS_A4**: 1 run
- **PASS_WITH_CAVEATS**: 3 runs

## Per-run summary

| Run | Institution | State | Parent | Sources | Claims (verified / total) | PUB_SAFE | FUT_LANE | HUM_REV | NEG | Scope conflicts | A3 verdict | publicSafe | network | agent | A4 tasks | A5 | searchCompleteness |
|---|---|---|---|---:|---|---:|---:|---:|---:|---:|---|---|---|---|---:|---|---:|
| `p102-0r-dry-run-1` | Hartford Hospital | CT | Hartford HealthCare | 2 | 0 / 0 | 0 | 0 | 0 | 0 | 0 | FAIL_NEEDS_A4 | false | false | false | 1 | RUN_COMPLETE | 6% |
| `p102-1-trial-2-run-1` | Houston Methodist Hospital | TX | — | 6 | 3 / 3 | 0 | 3 | 0 | 0 | 0 | PASS_WITH_CAVEATS | false | false | false | 0 | RUN_COMPLETE | 15% |
| `p102-1-trial-2-run-2` | The Brooklyn Hospital Center | NY | — | 23 | 47 / 47 | 0 | 46 | 1 | 0 | 0 | PASS_WITH_CAVEATS | false | false | false | 0 | RUN_COMPLETE | 59% |
| `p102-1-trial-2-run-3` | AdventHealth Orlando | FL | AdventHealth | 8 | 15 / 15 | 0 | 15 | 0 | 0 | 0 | PASS_WITH_CAVEATS | false | false | false | 0 | RUN_COMPLETE | 21% |

## Discipline integrity

- ✓ All A3 gates attest networkUsed=false and agentUsed=false
- ✓ All claims are quote-verified (65 / 65)
- ✓ 0 PUBLIC_SAFE_USCE claims (expected 0 under P102-0C deterministic baseline)
- ✓ 0 PUBLIC_SAFE_NO_PUBLIC_OPPORTUNITY claims (expected 0 until institutions with explicit negative quotes are processed)

## Next pending work

See `P102_OPERATING_RUNBOOK.md` for full operational guidance. Pending sprints in order:

1. **P102-0D** — model A1/A2 reader (blocking state/national). Reader prompt captured at `specs/P102_A1_A2_READER_PROMPT.md`.
2. **Trial-2-deeper** — re-run existing institutions with the model reader to produce real PUBLIC_SAFE_USCE.
3. **P102-GOLD-RUN** — execute the gold-set queue (queue ready at `queues/p102_gold_set_queue.csv`; status DO_NOT_RUN_UNTIL_P102_0D).
4. **P102-STATE** — single-state slice.
5. **P102-NATIONAL** — national run.
