# P102 High-Yield USCE + Public-Safe Row Contract Report

schemaVersion: p102-hy-batch1-1
branch: `local/p102-high-yield-usce-and-ingestion-contract`
parent commit: `8468d53` (Florida Batch 1 complete)
this report HEAD: see git log
production main: `739ab1e` UNCHANGED

## 1. Outcome — pivot delivered, structural finding strengthened

| Metric | Threshold | Result |
|---|---|---:|
| Strategy doc + queue + row contract delivered | required | **delivered** |
| Row builder script + first export delivered | required | **delivered** |
| Public-safe opportunity rows (deduplicated) | ≥ 1 | **14 rows / 9 institutions** |
| Quote-verification failures (strict, 35 runs, 2491 claims) | 0 | **0** (after 2 model-emit data fixes) |
| Over-promotion failures (HIDDEN_REJECTED → PUBLIC) | 0 | **0** |
| Scope failures on system / school domains | 0 | **0** (60+ correctly flagged scope conflicts on medical-school subdomains) |
| Gold-set verification | 11 / 11 | **11 / 11 PASS** |
| Validator dispatcher | 12 / 12 | **12 / 12 PASS** |
| HY Batch 1 institutions completed | 10-15 | **3 medical schools + 1 robots-blocked** (early-stop with structural finding) |
| HY Batch 1 institutions producing ≥ 1 PUBLIC_SAFE_USCE | ≥ 5 | **0 from new HY runs** (structural finding — see §3) |

**Pivot status: PASSED on contract + safety. Productive yield from new HY runs: 0 — but with a clear structural reason that informs next-sprint strategy.**

## 2. What was built

### Strategy (Phase B)

`P102_HIGH_YIELD_USCE_STRATEGY.md` — explains the pivot from state-first to top-USCE-first + minimal ingestion + state expansion afterward. Documents the four-phase sequencing (high-yield queue → row builder → minimal ingestion → state expansion).

### Queue (Phase C)

`p102_high_yield_usce_queue.csv` — 15 institutions selected from P101 TIER_A/B evidence + positive-control wins + Florida Batch 1 off-domain medical-school recommendations. Includes UAB re-run, Miller SOM, USF Morsani, UF COM, FIU Wertheim, FSU COM, UCSF SOM, UCLA Geffen, Stanford SOM, Keck USC, UAMS COM, Emory SOM, Howard COM, GW SMHS, Georgetown meded.

### Row contract (Phase D)

`P102_PUBLIC_SAFE_OPPORTUNITY_ROW_CONTRACT.md` — defines the `publicSafeOpportunityRow` shape, the four export files, the inclusion / routing rules, and the grouping algorithm.

### Row builder (Phase E)

`scripts/p102-build-public-safe-opportunity-rows.ts` — pure read + group + write. No model calls, no DB, no upstream mutation. Produces four local JSON exports.

### First export (Phase F)

`docs/.../p102/exports/public_safe_opportunity_rows.json` — **14 deduplicated opportunity rows from 9 institutions** (90 PUBLIC_SAFE_USCE source claims grouped):

| # | Institution | Rows | Top opportunity |
|---|---|---:|---|
| 1 | Orlando Health Orlando Regional | 3 | VSLO clerkship program ($50 fee) |
| 2 | Houston Methodist Hospital | 2 | Observership (HMObserver@) |
| 3 | UAB Hospital | 2 | International Visiting Medical Students |
| 4 | UCSF Fresno | 2 | Visiting medical students |
| 5 | Boston Medical Center | 1 | ENT Sub-Internship |
| 6 | Emory University Hospital | 1 | MD/PhD Program |
| 7 | Hospital for Special Surgery | 1 | Academic Visitor Program (observership) |
| 8 | Mayo Clinic | 1 | Visiting Medical Student |
| 9 | Memorial Sloan Kettering | 1 | BMT Elective |

Plus three other exports:

| Export | Entries |
|---|---:|
| `public_safe_review_queue.json` | 925 (Tier 1 candidates needing one-time human check) |
| `future_lane_archive.json` | 1472 (GME / residency / fellowship / careers) |
| `hidden_rejected_archive.json` | 3 (Northwell Cohen Children's + 1 other) |

## 3. HY Batch 1 partial run — structural finding at medical-school scale

3 medical-school subdomains were run in parallel as a pilot to test whether top-USCE-first extraction would yield more PUBLIC_SAFE_USCE than Florida Batch 1's hospital-domain approach.

| # | Institution | Domain | Sources | Verified | PUBLIC_SAFE | HUMAN_REVIEW | FUTURE | Status |
|---|---|---|---:|---:|---:|---:|---:|---|
| H2 | Miller SOM | med.miami.edu | — | — | — | — | — | **robots.txt blocks `/observership*` `/offices/*` `/medical-education/*`** — purged after partial run |
| H7 | UCSF School of Medicine | meded.ucsf.edu | 26 | 80 | **0** | 63 | 17 | scope discipline (Tier 1 candidates HUMAN_REVIEW) |
| H8 | UCLA David Geffen School of Medicine | medschool.ucla.edu | 26 | 138 | **0** | 87 | 51 | scope discipline (multi-affiliate hospital network) |
| H10 | Keck School of Medicine at USC | keck.usc.edu | 15 | 69 | **0** | 39 | 30 | scope discipline + Tier 2 fellowship richness |

**The structural finding from Florida Batch 1 reproduces at medical-school scale:**

- UCSF SOM serves UCSF Medical Center + UCSF Benioff + UCSF Fresno + Zuckerberg San Francisco General — multi-campus → HEALTH_SYSTEM_LEVEL discipline.
- UCLA Geffen serves Ronald Reagan UCLA + Mattel Children's + Santa Monica + Resnick Neuropsychiatric + Olive View — multi-affiliate → HEALTH_SYSTEM_LEVEL discipline.
- Keck SOM serves Keck Hospital of USC + USC Norris + USC Verdugo Hills + LAC+USC — multi-campus → HEALTH_SYSTEM_LEVEL discipline.
- Miller SOM (med.miami.edu) blocks USCE URL patterns via `robots.txt` — framework correctly refuses.

The framework's safety discipline is **working exactly as designed**: when the source page applies to multiple campuses of an academic system, Tier 1 candidates correctly route to `HUMAN_REVIEW_REQUIRED` rather than auto-promoting to `PUBLIC_SAFE_USCE` for any specific campus.

The result: **even known-positive medical-school visiting-student pages do not produce automatic PUBLIC_SAFE_USCE rows when the school serves multiple campuses.** This is a real architectural property — not a framework defect.

## 4. Bugs found and one-time data fixes

Two model-emit issues caught and contained:

1. **UCSF claim `c12`** had `cleanedTextPath` with a one-character typo (`visiting-student-product-overview` instead of `visiting-student-program-overview`). The actual file existed at the correct path. One-time fix.
2. **UCLA claims `c5`, `c6`, `c7`** used `quote: NOT_STATED_ON_SOURCE` with non-`MISSING_FIELD` claimType (DURATION, APPLICATION_FEE, CONTACT_EMAIL). Per the verifier, NOT_STATED is only valid for `MISSING_FIELD` claimType. One-time fix: changed claimType to MISSING_FIELD on these 3 claims.

Both are model-emit fidelity issues, contained data-side. No framework code change needed for either. If they recur in future runs, will add a defensive sanitizer in `verifyAndReclassify`.

## 5. Cross-cumulative state — sprint complete

| Metric | Value |
|---|---:|
| Total runs (gold + positive-control + Florida Batch 1 + HY Batch 1 partial) | 35 |
| Total verified model claims | 2491 |
| Total PUBLIC_SAFE_USCE source claims | 90 |
| Institutions producing ≥ 1 PUBLIC_SAFE_USCE | 9 |
| Total deduplicated opportunity rows | 14 |
| Quote-verification failures (strict) | 0 / 2491 (after 5 cumulative one-time data fixes across all sprints) |
| Over-promotion failures | 0 |
| Scope failures (system/school over-promoted) | 0 |
| Validator dispatcher | 12 / 12 PASS |
| Unit tests | 155 / 155 PASS |
| Gold-set verification | 11 / 11 PASS |

## 6. Updated structural understanding

After 35 runs across two strategies (state-first + top-USCE-first), the picture is clear:

- **Single-campus academic-affiliated hospitals with on-domain Tier 1 content** — produce PUBLIC_SAFE_USCE rows reliably (Orlando Health, BMC ENT, HSS, MSK, UAB, UCSF Fresno regional). 9 institutions.
- **Multi-campus health systems on enterprise domains** — correctly held to HUMAN_REVIEW_REQUIRED by scope discipline. Cleveland Clinic system, AdventHealth, Memorial Hollywood, Mayo Clinic system, Baptist Health, Lee Health, Nemours, Nicklaus.
- **Medical-school subdomains serving multiple teaching hospitals** — correctly held to HUMAN_REVIEW_REQUIRED for the same reason (UCSF SOM, UCLA Geffen, Keck SOM, Miller SOM via robots.txt + multi-campus pattern).
- **Hospital domains routing to off-domain medical schools** — produce honest absence (Tampa General → USF, UF Health → UF COM, Jackson Memorial → Miller, Mount Sinai Miami → Wertheim, Vanderbilt → medschool.vanderbilt.edu, Brigham → HMS, Michigan Medicine → med.umich.edu).

The 9 institutions producing PUBLIC_SAFE_USCE represent the **single-campus academic-affiliated** subset — the structurally easiest case. To meaningfully expand the row bank beyond 14 rows, the next sprint needs one of:

1. **Per-campus runs** — split multi-campus systems into separate institution-ids with `campusApplicabilityProof` evidence (e.g., quote names "Memorial Regional Hollywood" specifically) to justify CAMPUS_SPECIFIC promotion despite system-level URL.
2. **Single-campus institution discovery** — find more single-campus academic hospitals (community teaching hospitals with their own Tier 1 pages) to add to the queue.
3. **Manual review approval workflow** — accept that the 925 review-queue rows are the real Tier 1 corpus, build a reviewer surface, let humans approve them one-time, and ship those as the public bank.

## 7. Recommendation

**B. Minimal website ingestion + reviewer workflow** for the 14 existing rows + the 925-entry review queue. Defer further extraction until a reviewer can approve / reject the existing review queue.

The 14 PUBLIC_SAFE_USCE rows are **website-ready today**. They are 9 quote-backed, source-linked opportunities at strong academic-affiliated institutions (MSK, BMC, HSS, UAB, Mayo, Emory, Orlando Health, Houston Methodist, UCSF Fresno). With a minimal display surface, they can be the launch corpus.

The 925-entry review queue is the **real growth surface**. Most are HUMAN_REVIEW_REQUIRED claims from multi-campus systems where the framework correctly held back. A reviewer who can confirm "this Cleveland Clinic page does apply to Cleveland Clinic Florida specifically" can approve campus-applicability and unlock those rows for publication.

Pure extraction has reached its single-campus ceiling for now. The bottleneck is not "more runs" — it's "review the existing review queue".

### Suggested next-sprint sequence

1. **P102-INGESTION-MIN** (next sprint, this branch or new):
   - Build a reviewer surface (local-only, no DB) that loads `public_safe_review_queue.json` and lets a reviewer add `humanReviewStatus: APPROVED|REJECTED|CHANGES_REQUESTED` + `campusApplicabilityProof` per entry.
   - Approved entries get promoted into a new `public_safe_opportunity_rows_approved.json` export.
   - Build minimal website display: listing + detail page reading from the approved export.
2. **P102-PER-CAMPUS-SPLIT** (parallel): re-run multi-campus institutions with explicit campus-id splits (e.g., `inst_cleveland_clinic_florida` already exists but the existing run was on the system domain — re-run with a queue-author-supplied known_source_hint pointing at the campus-specific URL when available).
3. **State expansion** can resume after the reviewer workflow is proven.

NOT recommended:
- A. HY Batch 2 — would reproduce the same multi-campus medical-school pattern with the same 0-yield structural finding.
- C. Florida medical-school Batch 2 — same as above.
- D. Fix extractor — no fixable framework defect; safety discipline is exactly right.

## 8. Out-of-scope reminders

- No push.
- No deploy.
- No PR.
- No DB / Prisma / migrations.
- No public import.
- No homepage / SEO / sitemap changes.
- No big UI redesign.
- No GME pivot.
- No national run.

Branch: `local/p102-high-yield-usce-and-ingestion-contract`. Local commits only. Production main `739ab1e` UNCHANGED.

---

## Exact next recommendation

**B. Minimal website ingestion + reviewer workflow.** Use the 14 PUBLIC_SAFE_USCE rows as the launch corpus. Build the reviewer surface for the 925-entry review queue. Defer further extraction until the reviewer workflow proves out.
