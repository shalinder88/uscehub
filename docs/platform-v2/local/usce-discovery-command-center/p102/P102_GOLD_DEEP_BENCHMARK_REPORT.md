# P102-GOLD Deep Benchmark Report

schemaVersion: p102-deep-0f-1
sprint: P102-GOLD
branch: `local/p102-gold-deep-benchmark`
predecessor: P102-0G (commit `6453ddd`)

## 1. Why P102-GOLD was needed

P102-0G demonstrated the deep three-tier extractor works on a single-domain institution (Houston Methodist) and on a system-domain institution (AdventHealth Orlando, including a scope-discipline bug found and fixed). But that's only 2 of the 11 failure modes the gold queue documents. Before authorizing the one-state deep queue, we needed to run the framework on the full 11-institution benchmark, one institution at a time, with deep mode + bounded A4 recovery, and verify:

1. Real PUBLIC_SAFE_USCE candidates emerge where they truly exist.
2. False positives are blocked when they don't.
3. Tier 1 / Tier 2 / Tier 3 stay separated.
4. Quote verification holds.
5. Scope discipline holds on system / school domains.
6. A4 bounded recovery executes safely.
7. Validators stay green throughout.

## 2. Confirmation: terminal automation, one institution at a time

This benchmark was run exclusively through the terminal `claude` CLI via the orchestrator scripts:

- `scripts/p102-discovery-runner.ts` — A0 source capture
- `scripts/p102-deep-source-discovery.ts` — deep three-tier source-family reclassification
- `scripts/p102-claude-cli-extractor.ts` — A1/A2/A3 (with `--deep`)
- `scripts/p102-a4-fetch-additional.ts` — bounded A4 recovery (when A3 emits tasks)
- `scripts/p102-regate-run.ts` — deterministic regate
- `scripts/p102-quote-verify.ts` — standalone quote re-verification
- `scripts/p102-validate-all.ts` — 11-validator dispatcher

No manual chat. No copy-paste. No SDK. No API key. One institution per run folder.

## 3. Gold queue (11 institutions × 11 failure modes)

See [`P102_GOLD_QUEUE_SELECTION.md`](P102_GOLD_QUEUE_SELECTION.md) for the rationale.

| # | Institution | Domain | Failure mode | Final status |
|---|---|---|---|---|
| 1 | Cleveland Clinic Florida | `my.clevelandclinic.org` | International medical student program | _filled in after Phase D5_ |
| 2 | Vanderbilt University Medical Center | `vumc.org` | US VSLO-only | _filled in after Phase D6_ |
| 3 | Houston Methodist Hospital | `houstonmethodist.org` | `/observership` is a Pharmacy externship | `GOLD_PASS_NO_PUBLIC_SAFE_CORRECT` |
| 4 | Mayo Clinic Rochester | `mayoclinic.org` | Explicit negative quote | _filled in after Phase D7_ |
| 5 | Hartford Hospital | `hartfordhospital.org` | Absence after broad search | `GOLD_PASS_NO_PUBLIC_SAFE_CORRECT` |
| 6 | AdventHealth Orlando | `adventhealth.com` | Parent-system / campus ambiguity | `GOLD_PASS_HUMAN_REVIEW_REQUIRED` (scope-discipline bug found and fixed in P102-0G) |
| 7 | Brigham and Women's Hospital | `brighamandwomens.org` | Medical-school-level source ambiguity (HMS) | _filled in after Phase D8_ |
| 8 | The Brooklyn Hospital Center | `tbh.org` | GME-rich, no USCE | `GOLD_PASS_FUTURE_LANE_ONLY` |
| 9 | Northwell Staten Island UH | `northwell.edu` | Jobs/visa/careers-rich | _filled in after Phase D9_ |
| 10 | Boston Medical Center | `bmc.org` | PDF-heavy | _filled in after Phase D10_ |
| 11 | Michigan Medicine | `uofmhealth.org` | Bot-block / timeout | _filled in after Phase D11_ |

## 4. Per-institution detail

Full per-institution detail (source counts, tier breakdowns, A4 results, regate verdicts) lives in [`P102_GOLD_RUNNING_LOG.md`](P102_GOLD_RUNNING_LOG.md). Entries are appended as each institution completes.

## 5. Cross-run totals

> _Filled in after Phase E._

## 6. Public-safe candidates found

> _Filled in after Phase E._

## 7. Human-review candidates found

> _Filled in after Phase E._

## 8. Future-lane archive count

> _Filled in after Phase E._

## 9. Negative evidence findings

> _Filled in after Phase E._

## 10. Scope conflicts

> _Filled in after Phase E._

## 11. Bugs found and fixed in this sprint

> _Filled in after Phase E._

## 12. Bugs still open

> _Filled in after Phase E._

## 13. Is the extractor ready for one-state deep queue?

> _Filled in after Phase E + F._

## 14. Exact next recommendation

> _Filled in after Phase E + F. Options:_
> - A. P102-GOLD-FIX (framework changes before state)
> - B. One-state deep queue (advance)
> - C. Stop and review
