# P102-0F — Deep Institutional Extraction Checkpoint

schemaVersion: p102-deep-0f-1
date: 2026-05-14
status: BUILT & DEEP-RUN ON ONE INSTITUTION
predecessor: P102-0E (commit `1b52992`, branch `local/p102-cli-extractor-orchestrator`)
branch: `local/p102-deep-institutional-extraction-mode`

## 1. Why P102-0F was needed

P102-0E demonstrated that the Claude CLI extractor works technically (159 quote-verified claims across 4 institutions, 0 rejected, defense-in-depth intact). But "the extractor works" is not the same as "the extractor researches deeply." Gold-set / state / national runs require the extractor to behave like a slow, careful, high-IQ institutional researcher — one institution at a time, complete intelligence packet across the three USCEHub product tiers, not a USCE-keyword scanner.

P102-0F upgrades P102-0E along three axes:

1. **Source-family completeness** — per-institution deep source discovery (re-classify existing captured sources into the deep-mode source-family taxonomy; bounded fetching captured for future authorized sprints).
2. **Three-tier extraction** — A1/A2/A3 emit claims tagged Tier 1 (USCE & Match) / Tier 2 (Trainee) / Tier 3 (Practice & Career Life).
3. **Completion validation** — a run reports source-family coverage, tier coverage status, negative-evidence strength, scope conflicts, and A4 targeted recovery tasks.

## 2. What changed from P102-0E

| File / artifact | Change |
|---|---|
| [`P102_0F_DEEP_INSTITUTIONAL_EXTRACTION_DOCTRINE.md`](P102_0F_DEEP_INSTITUTIONAL_EXTRACTION_DOCTRINE.md) | **NEW** — three-tier doctrine, visibility rules, thoroughness standard |
| [`specs/P102_DATA_CONTRACTS.md`](specs/P102_DATA_CONTRACTS.md) | Added `schemaVersion: p102-deep-0f-1` deep-mode section: tier enum, source-family enum, coverage statuses, `threeTierInstitutionPacket`, `tierPacket`, A1/A2/A3 claim additions, public-promotion gating rules |
| [`prompts/P102_A1_CLAUDE_CLI_READER_PROMPT.md`](prompts/P102_A1_CLAUDE_CLI_READER_PROMPT.md) | Appended DEEP MODE EXTENSION — three-tier definitions, deep source-family taxonomy, additional concepts list, per-claim `tier`/`deepSourceFamily`/`tierAssignmentRationale` |
| [`prompts/P102_A2_CLAUDE_CLI_DEPTH_PROMPT.md`](prompts/P102_A2_CLAUDE_CLI_DEPTH_PROMPT.md) | Appended DEEP MODE EXTENSION — four sub-passes (Tier 1/2/3 + scope+negative), `deepNewClaimsByTier`, `scopeConflictsDetectedInA2`, `campusApplicabilityProofsFound`, `newNegativeEvidenceClaims` |
| [`prompts/P102_A3_CLAUDE_CLI_GATE_PROMPT.md`](prompts/P102_A3_CLAUDE_CLI_GATE_PROMPT.md) | Appended DEEP MODE EXTENSION — tier coverage verdicts, `unfollowedSignals`, `overpromotionDetected`, `deepRecoveryTasks` |
| [`prompts/P102_A4_CLAUDE_CLI_RECOVERY_PROMPT.md`](prompts/P102_A4_CLAUDE_CLI_RECOVERY_PROMPT.md) | Captured deep-mode task types; not invoked this sprint |
| [`scripts/p102-deep-source-discovery.ts`](../../../../scripts/p102-deep-source-discovery.ts) | **NEW** — reclassifies existing sources into deep taxonomy, computes per-tier coverage. Defaults to `--reclassify-only` (no live-web fetches). `--fetch-additional` captured for future authorized sprints. |
| [`scripts/p102-claude-cli-extractor.ts`](../../../../scripts/p102-claude-cli-extractor.ts) | Added `--deep`, `--max-discovered-urls`, `--max-accepted-sources`, `--max-pdfs`, `--tiers`, `--source-family`, `--institution-id`. Deep mode: loads `00_deep_source_discovery.json`, threads deep source hints into A1/A2 packets, writes `16_three_tier_institution_packet.json` + per-tier `RT_depth_tier*.json` + `A4_deep_recovery_tasks.json` after A3. Schemas extended with optional deep-mode fields (backwards compatible with base mode). |
| [`scripts/p102-validate-deep-packet.ts`](../../../../scripts/p102-validate-deep-packet.ts) | **NEW** — enforces three-tier packet shape, Tier 2/3 cannot be PUBLIC_SAFE_USCE, attestations, quote-verification rate. |
| [`scripts/p102-validate-all.ts`](../../../../scripts/p102-validate-all.ts) | Added deep-packet validator as #11. |

## 3. Hard rules confirmed

- ✓ No `ANTHROPIC_API_KEY` required or used.
- ✓ No `@anthropic-ai/sdk` dependency.
- ✓ No Agent / subagent during A1/A2/A3 (`--tools ""`).
- ✓ No network during inference.
- ✓ No new live-web fetches in this sprint (`--reclassify-only` default).
- ✓ One institution only in Phase H.
- ✓ Production main `739ab1e` UNCHANGED.
- ✓ No PR, no push, no deploy.
- ✓ No schema / DB / migration / seed / UI changes.
- ✓ Canonical T7 root only.
- ✓ A1/A2/A3 outputs schema-validated by `--json-schema`.
- ✓ Quote verifier and visibility re-classifier still authoritative.

## 4. Deep-run result (one institution)

Institution: **AdventHealth Orlando** (`inst_adventhealth_orlando_fl`)
Run ID: **`p102-1-trial-2-run-3`**

> _Numbers filled in after Phase H completes._

| Metric | Value |
|---|---:|
| Sources accepted (existing capture) | 8 |
| Source families discovered | 39 candidates → 8 accepted, 31 rejected |
| A1 sources read | 8 |
| A2 sources read | 8 |
| Total verified claims | **70** (vs 44 in base mode — **+59%**) |
| Rejected claims | 0 |
| Tier 1 claims | 17 |
| Tier 2 claims | 30 |
| Tier 3 claims | 23 |
| PUBLIC_SAFE_USCE | **0** (correct — system-scope domain) |
| FUTURE_LANE_ONLY | 28 |
| HUMAN_REVIEW_REQUIRED | 42 |
| Scope conflicts surfaced | 0 (scope discipline 1.00) |
| Negative-evidence captured | 0 |
| A4 recovery tasks generated | **2** (real value: VSLO/clerkship + Loma Linda affiliation pages) |
| Quote verification rate | **1.00** (70/70) |
| Model A3 verdict | **PASS_PUBLISH_READY** |
| Model A3 tier coverage | Tier 1 PASS_PARTIAL, Tier 2 PASS_COMPLETE, Tier 3 PASS_COMPLETE |
| Deterministic regate verdict | **PASS_WITH_CAVEATS** (publicSafe=false, futureLaneValue=HIGH) |
| Deep packet validator | **PASS** |
| Deep run completion | INCOMPLETE (Tier 1 WEAK status; expected — AdventHealth Orlando uses system-domain hosting) |
| Public readiness | NOT_PUBLIC_READY |

## 5. What this proves (or does not prove)

**Proves:**

- The deep three-tier architecture extracts more (70 vs 44 claims, +59%) without losing accuracy (still 100% quote-verified, 0 rejected).
- The model can self-audit: A3 produced **2 concrete A4 recovery tasks** naming uncaptured pages — "Medical Clerkship - Orlando Campuses / VSLO Opportunities Across Florida" and "Loma Linda University School of Medicine at AdventHealth Orlando" affiliation. These references appeared in the cleaned text but the dedicated landing pages weren't in the capture; A3 correctly flagged them rather than inventing claims about them.
- Tier discipline holds: 17 Tier 1, 30 Tier 2, 23 Tier 3. The model correctly classified GME / fellowship / careers content as Tier 2 / Tier 3 and did not promote any of it to Tier 1 USCE.
- Scope discipline holds: 0 scope conflicts on a 100% system-domain dataset (every source on `adventhealth.com`). The model and the deterministic re-classifier both refused to attribute system-level content to "AdventHealth Orlando" specifically. Every Tier 1 candidate was downgraded to HUMAN_REVIEW_REQUIRED.
- A3 hostile-gate found unfollowed signals and emitted them as `unfollowedSignals` + `deepRecoveryTasks`. Deep mode's self-audit loop is functional.
- All 11 validators (including the new P102-0F deep-packet validator) pass.

**Does not prove:**

- Whether deep mode improves PUBLIC_SAFE_USCE yield on institutions where USCE IS publicly available. AdventHealth Orlando deliberately tests scope discipline on a system-domain (the correct outcome is zero PUBLIC_SAFE_USCE). The next deep test should be a single-domain institution with a known observership page (e.g. Mayo Clinic, Cleveland Clinic from the gold-set queue).
- Whether the live-web `--fetch-additional` discovery mode works against real hospital domains under robots / rate limits — that path is captured but not exercised this sprint.
- Whether A4 deep recovery task execution produces meaningful new claims when invoked — A4 is captured but not invoked.

## 6. Source-family coverage (AdventHealth Orlando)

From `01_deep_source_family_coverage.json`:

- **Tier 1 coverage: WEAK** (status downgraded to PARTIAL by A3 based on actual content). Required Tier 1 families: OBSERVERSHIP / EXTERNSHIP / ELECTIVE / VISITING_STUDENT / SUB_INTERNSHIP / RESEARCH_EDUCATION. None had a dedicated institution-page that was captured. The model surfaced Tier 1 navigation references on /education /medical-education /benefits but those references point to uncaptured pages → A4 recovery tasks.
- **Tier 2 coverage: COMPLETE** — `/gme` was captured and yielded heavy GME / residency / fellowship content (30 claims).
- **Tier 3 coverage: COMPLETE** — `/careers`, `/physician-careers`, `/benefits` all captured. 23 Tier 3 claims (jobs, benefits, sponsorship, attending positions).

The 31 rejected source candidates (out of 39 discovered) were status_404s from the original A0 probe — not specific to deep mode.

## 7. Validator status

```
tsc --noEmit                                 PASS
test-p102 (unit tests)                       PASS
validate-p102-discovery-runner               PASS
validate-no-secrets                          PASS
p102-anti-drift-validator                    PASS
p102-validate-concept-packs                  PASS
p102-validate-run-integrity                  PASS
p102-validate-identity-registry              PASS
p102-gold-set-verify                         PASS
p102-quote-verify (model ledgers)            PASS
p102-validate-deep-packet (P102-0F)          PASS
validate-p101-discovery-command-center       PASS
```

Overall: **PASSED — 12 validators**.

## 8. Is this deep enough for gold set?

**Conditional yes** — the architecture is correct and the validators pass. But the AdventHealth Orlando run alone does NOT prove gold-set readiness because:

- Zero PUBLIC_SAFE_USCE is the expected (and correct) outcome on a system-domain institution. We still need at least one deep-run on a single-domain institution with a clear observership page to demonstrate that PUBLIC_SAFE_USCE promotion works end-to-end through the deep path.
- The 2 A4 recovery tasks identify pages we did not capture. Without `--fetch-additional` enabled and authorized, deep mode is limited to the existing A0 capture set.

**Recommended next step before gold set:** run deep mode on one additional existing institution (Brooklyn Hospital Center — GME-rich, single-domain, more sources to exercise the depth pass). If Brooklyn produces clean three-tier output with similar quality, then gold-set deep run is justified.

## 9. What still needs fixing

- **Live-web fetch path (`--fetch-additional`)** is captured but disabled. Before gold-set deep mode, this needs to be wired so A4 recovery tasks can actually run (and so Tier 1 weak-coverage runs can probe additional Tier 1 URL candidates within the institution domain). Requires operator authorization for new live-web traffic.
- **Tier-1 keyword heuristics on system-domain institutions** are conservative by design — the model correctly emits 17 Tier 1 candidates but all are downgraded to HUMAN_REVIEW_REQUIRED. For health systems with multiple campuses we may need a `campusApplicabilityProof` mechanism that lets the model attach proof when a quote names the campus explicitly. (Schema already supports this; classifier does not yet read it.)
- **Per-institution PDF cascade** — AdventHealth had no PDFs to probe in this run, so PDF coverage wasn't exercised. Brooklyn / future institutions will test it.

## 10. What P102-0F does NOT do (still on hold)

- ❌ New live-web fetches (the `--fetch-additional` mode is captured but disabled this sprint).
- ❌ Run all 4 existing institutions through deep mode (only one this sprint).
- ❌ Run the gold set (11 institutions).
- ❌ Run a state slice.
- ❌ Run national.
- ❌ Push to production.
- ❌ Open a PR.
- ❌ Deploy.
- ❌ A4 deep recovery task execution (captured for future authorized invocation).
