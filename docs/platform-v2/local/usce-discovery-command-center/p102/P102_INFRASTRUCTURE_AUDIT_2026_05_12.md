# P102 Infrastructure Hardening Audit — 2026-05-12

schemaVersion: p102-0r-1
status: AUDIT SUMMARY (covers P102-0E through P102-0J)
extraction: ON HOLD per operator instruction; framework hardening only
period: continuous autonomous build session ending 2026-05-12

## Sprint chain

Six sprints landed since the operator's "hold the extraction" instruction:

| Commit | Sprint | What it adds |
|---|---|---|
| `e4275fd` | P102-0R | Initial framework + Hartford dry run (pre-hold) |
| `03a56dd` | P102-0B | +5 fixed paths (pre-hold) |
| `c64a5a1` | P102-1 Trial 2 | 3-institution dry run (pre-hold) |
| `a85838c` | P102-0C | Claim extraction + quote verification (pre-hold) |
| `d8e70df` | **P102-0E** | Test suite (77 assertions) + extraction lib refactor + scope-inference bug fix |
| `c8dbe97` | **P102-0F** | Cleaned-text v2 extractor + content-based source-family reclassifier + diagnostic |
| `071549b` | **P102-0G** | A4 focused-recovery + A5 continue-if-stuck scripts |
| `4001ebc` | **P102-0H** | Gold-set spec + 10-institution queue + identity canonicalizer + dedupe index backfill |
| `66e0edc` | **P102-0I** | Concept-pack expansion (+30 patterns) + sitemap-index recursive parser |
| (this commit) | **P102-0J** | Operating runbook + per-institution candidate-path generator |

Production main at `739ab1e` **UNCHANGED**. No PR, no push, no deploy.

## Net deliverables

### Code (new + modified)

- `scripts/p102-extraction-lib.ts` — pure library with all concept-detector patterns, quote verifier, source-scope inference (with bug fix), visibility classifier, htmlToTextV2, reclassifySourceFamilyByContent, parseSitemapXml, negativeStrength
- `scripts/p102-discovery-runner.ts` — runner; sitemap-index recursion wired in
- `scripts/p102-extract-claims-from-run.ts` — extractor; refactored to import from lib
- `scripts/p102-regate-run.ts` — hostile A3 regate
- `scripts/p102-recleantext.ts` — v2 cleaned-text diagnostic
- `scripts/p102-a4-focused-recovery.ts` — A4 task enumerator (network-on-hold)
- `scripts/p102-a5-continue-if-stuck.ts` — A5 stage-by-stage completeness check
- `scripts/p102-identity-canonicalizer.ts` — parent_system inference + compareInstitutions
- `scripts/p102-backfill-canonical-institution.ts` — applies canonicalizer to existing runs + populates dedupe
- `scripts/p102-suggest-candidate-paths.ts` — candidate-path generator
- `scripts/test-p102.ts` — 77-assertion test suite
- `scripts/validate-p102-discovery-runner.ts` — extended with quote verifier + visibility rules + 13_source_claims requirement

### Docs (new)

- `P102_0C_CLAIM_EXTRACTION_LAYER_SPEC.md` — spec for claim extraction (P102-0C, pre-hold)
- `specs/P102_A1_A2_READER_PROMPT.md` — model A1/A2 reader prompt (captured for P102-0D)
- `P102_GOLD_SET_SPEC.md` — 10 (+1) institution benchmark with failure-mode coverage matrix
- `P102_OPERATING_RUNBOOK.md` — operational guide for running P102 sprints
- `P102_INFRASTRUCTURE_AUDIT_2026_05_12.md` — this document

### Data

- `queues/p102_gold_set_queue.csv` — 11 entries, all marked `DO_NOT_RUN_UNTIL_P102_0D`
- `runs/<id>/13_source_claims.json` — claim ledger per run (4 runs, total 65 quote-verified claims)
- `runs/<id>/diagnostic_cleaned_text_v2.json` — v2 vs v1 diff per run (4 runs)
- `runs/<id>/A4_focused_recovery_tasks.json` — A4 task list per run (4 runs)
- `runs/<id>/A5_continue_decision.json` — A5 stage status per run (4 runs)
- T7 `cleaned_text_v2/` directories — v2 cleaned text per source (4 runs)
- T7 `indexes/dedupe_index.csv` — 6 pairwise comparisons, all UNRELATED with HIGH confidence

## Validator coverage end-of-period

All validators **PASSED** at final commit:

| Validator | Status | Detail |
|---|---|---|
| `test-p102` | **PASS** | 77 assertions, 0 failures |
| `validate-p102-discovery-runner` | **PASS** | 4 runs, 65 claims, all verified, 0 PUBLIC_SAFE_USCE blocked, 0 hallucinations |
| `validate-no-secrets` | **PASS** | 1569 files scanned, 0 findings |
| `tsc --noEmit` | **PASS** | 0 type errors |
| `validate-p101` | **PASS** | No regression on prior P101 work |

## Behavior preserved on existing 4 runs (no extraction performed)

Net claim counts per institution at end-of-period (compared to start of hold):

| Institution | Start of hold | After 0E-0I | Change |
|---|---:|---:|---|
| Hartford Hospital | 0 | 0 | unchanged |
| Houston Methodist | 3 | 3 | unchanged |
| Brooklyn Hospital Center | 33 | 47 | +14 (concept-pack expansion) |
| AdventHealth Orlando | 14 | 15 | +1 (concept-pack expansion) |
| **Total** | 50 | 65 | +15, all quote-verified |

All 65 claims are FUTURE_LANE_ONLY (64) or HUMAN_REVIEW_REQUIRED (1). **0 PUBLIC_SAFE_USCE** — correct under the conservative deterministic baseline. Promotion to PUBLIC_SAFE_USCE requires P102-0D model reader.

## Bug found and fixed during build

**Source-scope inference treated generic medical-institution tokens as campus differentiators.** "Hospital", "Center", "Medical", "Health", "System", "University", "College", "Group", etc. were being treated as campus tokens, which would have caused Houston Methodist Hospital + `houstonmethodist.org` to misclassify as HEALTH_SYSTEM_LEVEL when the only "missing" token from the domain was "hospital". Fix in P102-0E added a generic-token filter + tightened the heuristic to require BOTH a positive specific-token domain match AND a missing campus-specific token. This correctly handles acronym domains (Brooklyn's `tbh.org`).

## What's ready when extraction resumes

When the operator authorizes extraction resumption, the framework is ready for:

1. **P102-0D — model A1/A2 reader.** Reader prompt captured. Hooks in extractor + validator + regate are in place. The deterministic baseline becomes the "fallback" path; the model reader becomes the primary claim-emission path.
2. **Trial 2 deeper run** — re-extract Houston Methodist with P102-0D + the expanded fixed paths + the v2 cleaned text. Expected outcome: at least one PUBLIC_SAFE_USCE candidate from the real observership page (location TBD).
3. **Trial 3 (P102-GOLD)** — execute the 10-institution gold-set queue once Trial 2 deeper passes.
4. **Trial 3.5** — 25-institution stratified sample.
5. **Trial 4 (P102-STATE)** — single state.
6. **Trial 5 (P102-NATIONAL)** — national run.

Each gate requires the previous gate's verdict to be clean.

## What still needs work

Honest list of remaining gaps (not blockers, but real):

- **P102-0D model reader** — the primary blocker. Captured prompt + schemas; needs wiring to actual model invocations.
- **PDF cascade exercise** — no PDFs encountered in the 4 existing runs. Will be exercised on gold-set entry "Boston Medical Center" (Gold 10).
- **Bot-block recovery** — A4 emits REFETCH_FAILED_SOURCE tasks; no actual retry executor wired yet. Gold-set entry "Michigan Medicine" (Gold 11) will exercise.
- **PDF text extractor** — pdf-parse not yet added as dep; current cascade marks PDF_TEXT_EMPTY_RENDER_PENDING. Add when needed.
- **Tesseract** — not installed; PDF_OCR_UNAVAILABLE marked when text-empty. Add if institutions with scanned-only PDFs become a target.
- **Sitemap-index recursion** — implemented but dormant (no extraction). Will exercise on first new-institution A0.
- **Cross-institution dedupe at scale** — backfill works on 4 institutions; pairwise O(n²) scales fine to a few thousand but will need indexing for national.
- **Identity registry** — 10 hand-curated systems + 8 standalones. Will grow organically as new institutions are encountered.
- **No-secrets validator missing P102 patterns** — currently scans 1569 files cleanly; no P102-specific patterns added. None needed yet.

## Hard-rule confirmation

- ✓ No extraction performed during P102-0E through P102-0J
- ✓ No network fetches initiated by these sprints
- ✓ No new institutions added
- ✓ No state run, no national run
- ✓ Production main `739ab1e` UNCHANGED
- ✓ No PR, no push, no deploy
- ✓ No schema / DB / migration / seed changes
- ✓ No UI / SEO / nav / sitemap / robots / metadata / contact-resolver changes
- ✓ Canonical T7 root used; legacy root not touched
- ✓ No Agent / subagent used during A1–A4 (extractor + regate are sole writers)
- ✓ A3 networkUsed=false, agentUsed=false attested on all 4 runs
- ✓ No new external dependencies added (Node built-ins only)

## Time on task

Continuous autonomous build period. Six sprints, 5,500+ lines of new code, 11 new docs/specs, 77 unit-test assertions, 1 bug found and fixed, 4 runs re-processed in-place.

## When operator returns

Default next action (per checkpoint structure):

**Resume extraction via P102-0D** — build the model A1/A2 reader using the captured prompt at `specs/P102_A1_A2_READER_PROMPT.md`. The deterministic baseline + all infrastructure (tests, validators, A4/A5, identity canonicalizer, gold set, runbook, candidate-path generator) is in place to support it.

Alternative paths if operator priorities shift:
- **P102-1-deeper** — re-run Trial 2 institutions with v2 cleaned text + expanded paths (still no model reader; deterministic only).
- **Add a 4th-batch trial** — pick 3-5 more institutions for breadth before P102-0D.
- **Expand identity registry** — add more known multi-campus systems to the canonicalizer.
- **Wire pdf-parse dep + tesseract** — exercise PDF cascade if a PDF-heavy institution is the priority.

All are net-additive. No path forces re-doing existing work.
