# P102 Changelog

Sprint-by-sprint history for the P102 (National Medical Opportunity Extractor) framework. Branch: `local/p102-claim-extraction-layer`. Production main at `739ab1e` UNCHANGED throughout.

## P102-0S — 2026-05-13 — Anti-drift validator + CHANGELOG

- Added `scripts/p102-anti-drift-validator.ts`: scans P102 docs for stale references — missing scripts, missing run folders, non-existent git commits, banned placeholder strings, schemaVersion drift, dead scripts. Exit 0 if clean, non-zero if real drift found.
- Added `docs/platform-v2/local/usce-discovery-command-center/p102/CHANGELOG.md` (this file).
- Anti-drift validator result: PASSED with 2 warnings (about scripts that hadn't been doc-referenced yet — fixed by this CHANGELOG).

## P102-0Q — 2026-05-13 — Gold-set verifier framework + machine-readable expected outcomes

- Added `docs/platform-v2/local/usce-discovery-command-center/p102/specs/P102_GOLD_SET_EXPECTED_OUTCOMES.json`: machine-readable expected outcomes per gold-set institution.
- Added `scripts/p102-gold-set-verify.ts`: compares actual gold-set run results against expected outcomes. Currently a skeleton (all 11 institutions return AWAITING_RUN until the gold set is authorized to run).
- Queue-to-expectations cross-check: clean.

## P102-0P — 2026-05-13 — Robots.txt URL filter in runner

- Added `isPathDisallowedByRobots()` to extraction-lib.
- Wired the runner to skip fixed-path probes that robots.txt disallows. Special case: `Disallow: /` + `Allow: /` (Hartford-style) is treated as permissive.
- Tests: 99 passing (added 9 for robots filter).
- Dormant until next A0 (extraction held).

## P102-0N — 2026-05-13 — Identity registry expansion (10 → 26 systems)

- Added 16 major US health systems to SYSTEM_REGISTRY: Atrium, Banner, Kaiser Permanente, Sutter, Tenet, CommonSpirit, Providence, Ascension, Trinity, UPMC, Geisinger, Sentara, Inova, BJC, Henry Ford, Corewell, Stanford Health Care, UCSF Health, UCLA Health, Memorial Hermann, Texas Health Resources, Wellstar, Piedmont.
- Refined KNOWN_STANDALONES to remove ambiguous system-member entries.
- Tests: 90 passing (added 13).

## P102-0M — 2026-05-13 — Cross-run dashboard

- Added `scripts/p102-generate-dashboard.ts`: aggregates A3 verdicts + claim counts across all P102 runs into `P102_DASHBOARD.md`.
- Discipline integrity checks: all 4 runs attest networkUsed=false + agentUsed=false; all claims quote-verified; 0 PUBLIC_SAFE_USCE under deterministic baseline; 0 false PUBLIC_SAFE_NO_PUBLIC_OPPORTUNITY.

## P102-0L — 2026-05-13 — Per-run report generator

- Added `scripts/p102-generate-run-report.ts`: reads every artifact in a run folder and emits a single-page `RUN_REPORT.md` per run.
- Generated for all 4 existing runs.

## P102-0K — 2026-05-13 — JSON-LD claim extractor + discovered-URL collector

- Added `scripts/p102-jsonld-claim-extractor.ts`: parses captured JSON-LD records into structured claims classified by `@type`. Captures discovered off-domain URLs (e.g., separate careers domain) as A4 candidates.
- Houston Methodist's careers page revealed `houstonmethodistcareers.org` as a separate careers domain via JSON-LD Organization record.
- All claims (when richer JSON-LD exists in future runs) will carry `extractionSource: 'JSON_LD'`.

## P102-0J — 2026-05-12 — Operating runbook + per-institution candidate-path generator + audit

- Added `docs/platform-v2/local/usce-discovery-command-center/p102/P102_OPERATING_RUNBOOK.md`: comprehensive operational reference.
- Added `scripts/p102-suggest-candidate-paths.ts`: recommends additional URL paths to probe for a given institution.
- Added `P102_INFRASTRUCTURE_AUDIT_2026_05_12.md`: end-of-period audit.

## P102-0I — 2026-05-12 — Concept-pack expansion + sitemap-index recursive parser

- Concept patterns expanded across observership (+5), VSM (+6), strong-negative (+5), medium-negative (+5), GME (+5), jobs/visa (+4).
- Added `parseSitemapXml()` to extraction-lib; runner now recurses into child sitemaps (bounded to 10) when root is a sitemap-index.
- Re-extraction: 50 → 65 claims across existing 4 runs, all FUTURE_LANE_ONLY or HUMAN_REVIEW_REQUIRED, all quote-verified.

## P102-0H — 2026-05-12 — Gold-set spec + identity canonicalizer + dedupe index backfill

- Added `P102_GOLD_SET_SPEC.md` with 10+1 institution benchmark covering known failure modes.
- Added `queues/p102_gold_set_queue.csv` (status=DO_NOT_RUN_UNTIL_P102_0D on every row).
- Added `scripts/p102-identity-canonicalizer.ts` with 10 known multi-campus systems + 8 standalones.
- Added `scripts/p102-backfill-canonical-institution.ts`: backfills existing runs' canonical_institution.json with inferred parent_system; populates T7 `dedupe_index.csv` with pairwise comparisons.

## P102-0G — 2026-05-12 — A4 focused-recovery + A5 continue-if-stuck

- Added `scripts/p102-a4-focused-recovery.ts`: enumerates structured recovery tasks (REFETCH_FAILED_SOURCE, EXPAND_FIXED_PATHS, INVESTIGATE_REDIRECT, ADD_CAMPUS_APPLICABILITY_PROOF, HUMAN_REVIEW_VOLUNTEER_PAGE, RECLASSIFY_SOURCE_FAMILY, RECOVER_EMPTY_SITEMAP, INCREASE_PROBE_DEPTH). Network-on-hold.
- Added `scripts/p102-a5-continue-if-stuck.ts`: evaluates per-stage completeness, emits recommended next action.
- Hartford → 1 A4 task (EXPAND_FIXED_PATHS); other 3 runs → 0 tasks. All 4 RUN_COMPLETE per A5.

## P102-0F — 2026-05-12 — Cleaned-text v2 extractor + content-based reclassifier

- Added `htmlToTextV2()` to extraction-lib: strips `<nav>`, `<header>`, `<footer>`, `<aside>`, role-based nav blocks, and class-/id-based boilerplate; focuses on `<main>` / `<article>` when present.
- Added `reclassifySourceFamilyByContent()`: downgrades URL-classified families when content lacks expected keywords.
- Added `scripts/p102-recleantext.ts` diagnostic: applies v2 to existing raw HTML, writes T7 sidecar at `cleaned_text_v2/`, emits per-run diagnostic JSON.
- Findings: v2 cleaned text is 43–60% of v1 size (boilerplate removed); Houston `/observership` and 13 Brooklyn GME sub-pages reclassify to OTHER based on content.

## P102-0E — 2026-05-12 — Test suite + scope-inference bug fix

- Added `scripts/p102-extraction-lib.ts`: pure-function library extracted from the runner for unit-testability.
- Added `scripts/test-p102.ts`: 49-assertion test suite (later grown to 99).
- **Bug fix**: `inferSourceScope` previously treated generic medical-institution tokens ("hospital", "center", "medical", "health", "system", "university", "college", "group") as campus differentiators. Fix added `GENERIC_INSTITUTION_TOKENS` filter + tightened heuristic to require both a positive specific-token domain match AND a missing campus-specific token. Acronym domains like `tbh.org` now correctly default to INSTITUTION_SPECIFIC.

## P102-0C — 2026-05-11 — Claim extraction + quote verification layer

- Added `scripts/p102-extract-claims-from-run.ts`: deterministic concept-detector claim extractor.
- Added `scripts/p102-regate-run.ts`: hostile A3 re-gate (network-free, agent-free, run-folder only).
- Extended `scripts/validate-p102-discovery-runner.ts` with quote-verifier and visibility rules.
- Reader prompt captured at `specs/P102_A1_A2_READER_PROMPT.md` for future P102-0D model reader.
- All 4 existing runs re-extracted: 50 claims, all quote-verified, 0 PUBLIC_SAFE_USCE.

## P102-1 Trial 2 — 2026-05-11 — Three-institution dry run

- Ran Houston Methodist Hospital, The Brooklyn Hospital Center, AdventHealth Orlando.
- A3 verdicts all PASS_WITH_CAVEATS, networkUsed/agentUsed false, publicSafe false.
- Houston Methodist's `/observership` discovered to be a Pharmacy Externship redirect (real finding).

## P102-0B — 2026-05-11 — +5 fixed paths

- Extended FIXED_PATHS with `/health-professionals`, `/medical-education`, `/professional-education`, `/student-affairs`, `/education`.

## P102-0R — 2026-05-11 — Initial framework + Hartford Trial 1

- Built the deterministic control system: A0 probe → A1 broad → A1.5 audit → A2 skeleton → A3 hostile gate.
- Master spec, data contracts (11 schemas), operating doctrine (30 rules).
- Trial 1: Hartford Hospital → 2 accepted sources, A3 PASS_WITH_CAVEATS.

---

## Sprint commit list

| Commit | Sprint | Date |
|---|---|---|
| `e4275fd` | P102-0R | 2026-05-11 |
| `03a56dd` | P102-0B | 2026-05-11 |
| `c64a5a1` | P102-1 Trial 2 | 2026-05-11 |
| `a85838c` | P102-0C | 2026-05-11 |
| `d8e70df` | P102-0E | 2026-05-12 |
| `c8dbe97` | P102-0F | 2026-05-12 |
| `071549b` | P102-0G | 2026-05-12 |
| `4001ebc` | P102-0H | 2026-05-12 |
| `66e0edc` | P102-0I | 2026-05-12 |
| `d7cb92c` | P102-0J | 2026-05-12 |
| (P102-0K) | P102-0K | 2026-05-13 |
| (P102-0L) | P102-0L | 2026-05-13 |
| (P102-0M) | P102-0M | 2026-05-13 |
| `2b7aed9` | P102-0N | 2026-05-13 |
| `bcdb7c3` | P102-0P | 2026-05-13 |
| (P102-0Q) | P102-0Q | 2026-05-13 |
| (P102-0S) | P102-0S | 2026-05-13 |

(Parenthesized hashes are pending the corresponding commit.)

## Sprint glossary

- **0R** = initial framework (R for "Runner" / "Release")
- **0B** = fixed-path patch
- **1** = Trial 2 (3 institutions)
- **0C** = claim extraction + quote verification
- **0D** = model A1/A2 reader (blocking state/national; not yet built)
- **0E** = test suite + bug fix
- **0F** = cleaned-text v2 + reclassifier
- **0G** = A4 + A5 scripts
- **0H** = gold set + identity canonicalizer
- **0I** = concept-pack expansion + sitemap recursion
- **0J** = runbook + path generator + audit
- **0K** = JSON-LD claim extractor
- **0L** = per-run report
- **0M** = cross-run dashboard
- **0N** = identity registry expansion
- **0P** = robots.txt URL filter
- **0Q** = gold-set verifier
- **0S** = anti-drift + this CHANGELOG

Letters O and R were skipped to avoid reuse / confusion. Future sprints continue with T, U, V, W, X.

## Script directory (P102)

All P102 scripts live in `scripts/`:

- `scripts/p102-discovery-runner.ts` — A0 → A1 runner (the original framework)
- `scripts/p102-extraction-lib.ts` — pure-function library (P102-0E onward)
- `scripts/p102-extract-claims-from-run.ts` — deterministic claim extractor (P102-0C)
- `scripts/p102-jsonld-claim-extractor.ts` — JSON-LD claim extractor (P102-0K)
- `scripts/p102-regate-run.ts` — hostile A3 re-gate (P102-0C)
- `scripts/p102-recleantext.ts` — v2 cleaned-text diagnostic (P102-0F)
- `scripts/p102-a4-focused-recovery.ts` — A4 task enumerator (P102-0G)
- `scripts/p102-a5-continue-if-stuck.ts` — A5 stage check (P102-0G)
- `scripts/p102-identity-canonicalizer.ts` — parent_system inference (P102-0H, expanded P102-0N)
- `scripts/p102-backfill-canonical-institution.ts` — backfills existing runs (P102-0H)
- `scripts/p102-suggest-candidate-paths.ts` — candidate-path generator (P102-0J)
- `scripts/p102-generate-run-report.ts` — per-run report (P102-0L)
- `scripts/p102-generate-dashboard.ts` — cross-run dashboard (P102-0M)
- `scripts/p102-gold-set-verify.ts` — gold-set verifier (P102-0Q)
- `scripts/p102-anti-drift-validator.ts` — doc/code consistency checker (P102-0S)
- `scripts/validate-p102-discovery-runner.ts` — primary validator (P102-0R, extended P102-0C)
- `scripts/test-p102.ts` — unit test suite (P102-0E, expanded continuously)
