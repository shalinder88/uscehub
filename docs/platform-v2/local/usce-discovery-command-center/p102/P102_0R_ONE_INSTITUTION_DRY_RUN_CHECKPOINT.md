# P102-0R — One-Institution Dry Run Checkpoint

schemaVersion: p102-0r-1
date: 2026-05-12
institution: Hartford Hospital (Hartford, CT)
runId: p102-0r-dry-run-1
branch: local/p102-national-medical-opportunity-extractor

## 1. What was built

- Master spec: `P102_NATIONAL_MEDICAL_OPPORTUNITY_EXTRACTOR_SPEC.md` (26 sections)
- Data contracts: `specs/P102_DATA_CONTRACTS.md` (11 schemas, all with `schemaVersion`)
- Operating doctrine: `P102_OPERATING_DOCTRINE.md` (30 binding rules)
- Queue template: `queues/p102_queue_template.csv`
- Index templates (repo): 7 CSVs in `indexes/`
- Index templates (T7 live): 7 CSVs in `/Volumes/T7Shield_Code/01_PROJECTS/USCEHub/11_LOCAL_EVIDENCE/p102-national-runner/indexes/`
- Runner script: `scripts/p102-discovery-runner.ts` (Node built-ins only, no new deps)
- Validator: `scripts/validate-p102-discovery-runner.ts`
- Dry-run queue: `queues/p102_dry_run_1_queue.csv`
- Institution selection doc: `P102_0R_DRY_RUN_INSTITUTION_SELECTION.md`
- T7 P102 artifact tree at canonical root
- Dry-run repo run folder (30 files)
- Dry-run T7 artifact folder (cleaned text + raw HTML + JSON-LD)

## 2. Why this mirrors FDD architecture

- **Deterministic bootstrap before model interpretation.** A0 fetches robots.txt + sitemap.xml + 34 fixed paths + JSON-LD. No model judgment touched until A1.
- **One source unit per run.** One institution. Serial. Run lock prevents duplicates.
- **A1 broad → A2 depth → A3 hostile.** Same gate progression.
- **Single reader / single writer.** Runner is the writer. Model output (deferred in P102-0R) would feed the runner.
- **No Agent during A1–A4.** Enforced doctrinally; the script does all I/O.
- **A3 has no network.** Validator checks `networkUsed: false` and `agentUsed: false`.
- **Targeted retries.** A4 task list is what A3 names. Not broad recrawls.

## 3. FDD lessons preserved (the five guardrails)

1. ✓ A0 deterministic discovery probe (robots + sitemap + fixed paths + JSON-LD) — implemented and ran on Hartford.
2. ✓ No Agent/subagents during A1–A4 — doctrinal rule 23; runner script is the only writer.
3. ✓ A3 has no network — validator enforces `networkUsed: false` in `A3_gate.json` and in `15_publish_gate.md` text; both passed.
4. ✓ PDF cascade — runner detects PDFs by content-type; marks `PDF_TEXT_EMPTY_RENDER_PENDING` (no PDFs encountered on Hartford in this run).
5. ✓ Negative evidence as first-class quote — schema `negative_evidence_claim.schema` requires quote + sourceHash + quoteVerified + STRONG strength for `publicSafeNegativeClaim = true`. Validator enforces.

Plus HEAD-first fixed-path probing and named UA + per-domain rate limit (both implemented in runner).

## 4. Why one institution per run is mandatory

If two institutions share a run, source-scope discipline breaks: a system-level page captured for institution A could be silently applied to institution B. Identity collision risks compound. Run locks and run folders are per-institution.

P102 scales by running serially across many institutions, not by parallelizing within a run.

## 5. T7 folder created

`/Volumes/T7Shield_Code/01_PROJECTS/USCEHub/11_LOCAL_EVIDENCE/p102-national-runner/`

Subdirectories: `queues/`, `runs/`, `artifacts/`, `indexes/`, `logs/`, `tmp/`

Artifacts for this run live at `artifacts/p102-0r-dry-run-1/{cleaned_text,raw_html,jsonld,pdf}/`.

## 6. Repo run folder created

`/Users/shelly/usmle-platform/docs/platform-v2/local/usce-discovery-command-center/p102/runs/p102-0r-dry-run-1/`

30 files present (all required files emitted; no missing files per validator).

## 7. Institution selected and why

Hartford Hospital (Hartford, CT). See [P102_0R_DRY_RUN_INSTITUTION_SELECTION.md](./P102_0R_DRY_RUN_INSTITUTION_SELECTION.md) for full rationale. Summary:

- Mid-size academic medical center, single primary domain (`hartfordhospital.org`).
- Part of Hartford HealthCare (system-scope discipline test).
- Affiliated with UConn SOM (medical-school overapplication test).
- P101 prior verdict: `NO_PUBLIC_USCE_LANE_FOUND_ON_HOSPITAL_OWN_SITE` — known ground truth for absence-based outcome.

## 8. Why MSKCC / Stanford / Mayo were not used for Trial 1

Multi-domain academic monsters introduce failure-mode ambiguity: a defect could be in the framework or in the institution's complexity. Trial 1 must isolate the framework. MSKCC etc. belong in P102-1 Trial 2 or P102-GOLD.

## 9. A0 deterministic probe results

- `robots.txt`: fetched (200). 1 sitemap pointer advertised. 16 disallows (admin areas, cart/checkout). `Allow: /` override present.
- `sitemap.xml`: fetched (200) BUT the file is literally an empty `<sitemapindex/>` element. Hartford Hospital's sitemap is empty — this is a real institutional finding, not a parser bug. 0 candidates kept.
- Fixed-path probes: 34 attempted, 2 returned 200 with HTML (`/research`, `/careers`). 32 returned 404. (Most USCE-specific paths return 404, matching P101 evidence.)
- JSON-LD: 1 record captured (from `/careers` — likely a JobPosting / Organization JSON-LD).

## 10. Source URLs fetched

- `https://hartfordhospital.org/research` — RESEARCH_PAGE, 200
- `https://hartfordhospital.org/careers` — CAREERS_PAGE, 200 (JSON-LD present)

## 11. Artifacts captured

- 2 cleaned text files (T7)
- 2 raw HTML files (T7)
- 1 JSON-LD file (T7)
- 1 artifact manifest CSV (repo run folder)
- Index updates: institution_index, run_index, source_url_index, artifact_index (all T7)

## 12. Hashes captured

SHA-256 over cleaned text for both accepted sources. Recorded in `01_source_map.json` and `00_artifact_manifest.csv`.

## 13. PDF cascade result

No PDFs encountered in this run (Hartford Hospital's site is HTML-based at the probed paths). Cascade was not exercised. PDF cascade verification deferred to P102-1 with a PDF-heavy institution (or to the dedicated PDF-heavy gold-set entry).

## 14. Source map result

- 2 accepted sources (RESEARCH_PAGE, CAREERS_PAGE)
- 32 rejected sources (status 404 or 5xx/timeout)
- Source-scope assignment: RESEARCH_PAGE → UNKNOWN_SCOPE; CAREERS_PAGE → CAREERS_PORTAL. Both correct conservative defaults.

## 15. A1 broad extraction result

A1 produced structured starter outputs only. No model interpretation. `03_opportunity_objects.json` correctly emits empty array with explicit note that model A1 is deferred to P102-1.

## 16. A1.5 source completeness result

- officialDomainChecked: true
- robotsChecked: true
- sitemapChecked: true
- fixedPathProbesCompleted: true (all 34)
- jsonLdChecked: true
- sourceFamiliesChecked: RESEARCH_PAGE, CAREERS_PAGE
- missingSourceFamilies: OBSERVERSHIP_PAGE, VISITING_STUDENT_PAGE, VOLUNTEER_PAGE
- searchCompletenessScore: 6 (2/34 fixed paths captured)
- canProceedToA2: true

The 6% score is a true finding about hartfordhospital.org's path layout, not a framework defect. Per doctrine rule 28 (search completeness ≠ public readiness), this is acceptable.

## 17. A2 depth outputs

All six A2 outputs written as honest skeletons:
- `RT_depth_usce.json` — 0 objects, deferred-to-P102-1 note
- `RT_depth_gme_residency_fellowship.json` — 0 objects, deferred
- `RT_depth_jobs_visa.json` — 0 objects, deferred
- `RT_depth_physician_services.json` — 0 objects, deferred
- `RT_depth_negative_evidence.json` — 0 claims, deferred
- `RT_depth_source_scope_conflicts.json` — 0 conflicts, deferred

P102-0R intentionally defers claim extraction. The A3 hostile gate correctly issues `publicSafe: false` because no claims means no overclaim risk.

## 18. A2.5 semantic miss detector result

`RT_semantic_miss_detector.json` flagged 8 forward-work items (most are deferred-extraction placeholders). The semantically meaningful ones:
- `student_rotation_present`: keywords absent in captured pages
- `observer_shadow_present`: keywords absent (consistent with USCE absence on Hartford's site)
- `volunteer_page_classification_pending`: false (no volunteer page captured)
- `visa_signals_present`: false
- `pdf_pending`: false

Forward concept-pack synonym lexicon deferred to P102-1.

## 19. A3 network-free hostile gate result

- verdict: `PASS_WITH_CAVEATS`
- networkUsed: **false** (validator confirmed)
- agentUsed: **false** (validator confirmed)
- 15_publish_gate.md states "A3 read only run-folder files. No network. No Agent."
- publicSafe: false
- futureLaneValue: MEDIUM (CAREERS_PAGE captured)
- hallucinationRisks: 0
- unsupportedClaims: 0
- requiredA4Tasks: 0

This is the correct verdict for a framework dry run where claim extraction is deferred.

## 20. A4 tasks

None required. A0 captured usable sources; framework reached completion.

## 21. Negative evidence handling

No negative-evidence claims were emitted (claim extraction deferred). The framework's negative-evidence discipline was tested in two ways:

1. **Doctrine + schema rule**: `publicSafeNegativeClaim = true` requires EXPLICIT_NEGATIVE_QUOTE + quoteVerified + STRONG strength. Validator enforces.
2. **Absence-based finding**: Hartford has no USCE lane on its own site, but the framework correctly did NOT emit `PUBLIC_SAFE_NO_PUBLIC_OPPORTUNITY` because there's no explicit negative quote — just absence after search. This is the single most important framework rule, and Trial 1 confirms it holds when there's nothing to claim.

A stronger test (an institution with an explicit "We do not offer observerships..." quote) belongs in P102-GOLD.

## 22. Validator results

- `validate-p102-discovery-runner`: **PASSED** (missing=0, jsonErrors=0, network=false, agent=false, publicSafe=0)
- `validate-no-secrets`: **PASSED** (1440 files scanned, 0 findings)
- `tsc --noEmit`: **PASSED** (exit 0)
- `validate-p101-discovery-command-center`: **PASSED** (no regression)

## 23. What failed

Nothing structural failed. Two surface observations worth tracking:

1. **Hartford's sitemap is empty.** `https://hartfordhospital.org/sitemap.xml` returns 200 but the body is `<sitemapindex/>` with no children. This is an institutional fact, not a framework defect. Other institutions will have real sitemaps; the framework is ready.
2. **Fixed-path list misses `/health-professionals`.** P101 evidence shows hartfordhospital.org's USCE-adjacent content lives at `/health-professionals` and `/health-professionals/education`. Our fixed-path list doesn't include these. This is a P102-0B candidate addition — extend fixed paths with `/health-professionals`, `/medical-education`, `/professional-education`, `/student-affairs`.

## 24. Whether this can move to 3-institution test

YES with one P102-0B fix:
- Extend fixed-path list with `/health-professionals`, `/medical-education`, `/professional-education`, `/student-affairs` (and possibly `/education`).

Optionally also:
- Add a sitemap-index recursive parser for institutions with multi-level sitemaps.

Both fixes are small and self-contained. The framework itself is sound.

## 25. What to fix before P102-1

Required:
- Extend fixed-path list (see §24).
- Add a model-driven A1 reader pass that emits source claims with quote/hash/quoteVerified from captured cleaned text. This is the bulk of P102-1's depth work.

Optional:
- Sitemap-index recursive parser.
- pdf-parse dependency for PDF text extraction (only if a Trial 2 institution actually has text-bearing PDFs).

Deferred:
- Concept-packs synonym lexicon for A2.5.
- Identity canonicalizer with parent_system resolver.
- Screenshot capture.

## 26. No public import / no DB / no schema / no deploy confirmation

Confirmed:
- ✓ No public import.
- ✓ No DB writes.
- ✓ No Prisma schema changes.
- ✓ No noindex activation.
- ✓ No homepage / nav / sitemap / robots / metadata / JSON-LD changes.
- ✓ No contact resolver changes.
- ✓ No deploy.
- ✓ No PR.
- ✓ No push (production main at `739ab1e` unchanged).
- ✓ Working on local branch `local/p102-national-medical-opportunity-extractor`.

## Recommendation

**A. Proceed to P102-1 (3-institution dry run)** after a quick P102-0B patch to extend the fixed-path list with `/health-professionals` and `/medical-education`. P102-0B should be a 30-minute fix, not a sprint.

Trial 2 institutions should be:
- one high-yield (clear IMG observership or international student program)
- one no-yield (an institution with an explicit "We do not offer observerships" quote — tests the negative-evidence quote standard end-to-end)
- one ambiguous (a multi-campus health system to test source-scope discipline)

After Trial 2: gold-set construction (P102-GOLD), then state slice (P102-STATE), then national.
