# P97 National Screening Scoreboard & Queue 4 — Sprint Report

**Date:** 2026-05-09
**Sprint ID:** `P97-NATIONAL-SCREENING-SCOREBOARD-AND-QUEUE-4`
**Repo:** `/Users/shelly/usmle-platform`
**Branch:** `local/p97-discovery-integrity-guardrails`
**Pre-sprint HEAD:** `9626d96 P99: validate correction queue cross joins`
**Production main SHA:** `739ab1e2...` — UNCHANGED ✅
**Scope:** Build a strategic-checkpoint scoreboard from existing Mac-local + T7 data, surface coverage gaps, and prepare a 100-row Queue 4 candidate file. **Docs only. No app code. No runtime change. No production. No UI.**

---

## 1. Executive result

| Metric | Value |
|--------|-------|
| Total institutions screened (Q1+Q2+Q3) | **373** |
| sourceProofScore=5 (Tier-A truth) | **347** |
| Ready for human approval (T7 source-capture queue) | **25** |
| First-pilot evidence-action queue | 12 |
| Bridge-input VALIDATED | 2 |
| Staged runtime cards | **7** |
| Active runtime cards | **5** |
| Production public | **0** |
| Queue 4 candidate rows built | **100** |
| Production untouched | YES ✅ |
| UI deferred | YES ✅ |

## 2. Current national scoreboard

Detail in `national_screening_scoreboard_current_state.csv` and `national_screening_scoreboard_by_queue.csv`.

```
Q1 institutions:                    65
Q2 institutions:                   112  (2a 50 + 2b 47 + 2c 15)
Q3 institutions:                   196  (3a 126 + 3b 35 + 3c 35)
                                  ----
TOTAL screened:                    373

high_yield_review_master rows:     370
sourceProofScore=5 rows:           347
HIGH_USCE_YIELD rows:              247
MEDIUM_USCE_YIELD rows:            109

Source-capture priority queue:     348
   READY_FOR_HUMAN_APPROVAL:        25  ← bottleneck
   PENDING_PROMOTION_GATE:         191
   NEEDS_MORE_RESEARCH:            130

Active runtime cards:                5
Staged runtime cards:                7  (active 5 + UPMC + Lincoln)
Production public:                   0
```

## 3. Funnel analysis

The funnel narrows from 347 verified rows to 5 active cards. Detail in `national_screening_scoreboard_pipeline_funnel.csv`. Headline percentages (relative to total screened = 373):

```
Lead rows                  100.0%
Source review complete      99.2%
sourceProofScore=5          93.0%
HIGH_USCE_YIELD             66.2%
Ready for human approval     6.7%
First-pilot action queue     3.2%
Bridge-input VALIDATED       0.5%
Staged runtime               1.9%   (denominator inverts due to active-5 carry-forward)
Active noindex runtime       1.3%
Production public            0.0%
```

The drop from `Ready for human approval` (25) to `Bridge-input VALIDATED` (2) is the single largest leak. **The work to fix it is not screening; it's a curator pass.**

## 4. Coverage gap analysis

Detail in `national_screening_scoreboard_coverage_gap_analysis.csv` (15 gaps).

Most actionable gaps:
- **G-003 RUNTIME_PROMOTION_GAP:** 347 verified rows but only 5 active. THE bottleneck.
- **G-001 STATE_COVERAGE_GAP:** 4 zero-coverage states — AK, ID, MT, WY.
- **G-002 STATE_COVERAGE_GAP:** ~14 thin-coverage states (1-2 rows each).
- **G-014 PUBLIC_HOSPITAL_GAP:** large city safety-nets (Bellevue, LAC+USC, Cook County, Parkland Dallas, Harborview, ZSFG, Boston Medical Center) under-represented relative to AMCs.
- **G-015 ACADEMIC_MEDICAL_CENTER_GAP:** Stanford / UCSF / UCLA / UCSD / UC Davis / Vanderbilt / WashU / Emory / Michigan Medicine / UPMC Presbyterian / many others not in Q1-Q3.
- **G-011 CORRECTION_WORKFLOW_GAP:** intake endpoint exists; `/contact` UI does not parse listing_id (B-001/B-002/B-003 still open).

## 5. Denominator honesty

Detail in `national_screening_scoreboard_denominator_assumptions.md`.

We do NOT have a perfect denominator for "all USCE opportunities." Hospital-universe rough denominator is ~6,200 AHA hospitals. AMC denominator is ~400. LCME+COCA medical schools = ~196. Caribbean-affiliate denominator is per-school and not enumerated. **Therefore percentage statements about "national completeness" are deliberately avoided in this scoreboard.** Absolute counts and per-state coverage are reported instead.

## 6. Queue 4

Detail in `national_screening_queue_4_candidate_build_plan.md` and `national_screening_queue_4_candidate_rows.csv`.

100 candidate rows organized by candidate type:
- **STATE_GAP_FILL** (4 zero-coverage states): 8 rows (AK / ID / MT / WY × 2)
- **STATE_GAP_FILL_THIN** (1-2 row states): 22 rows (VT, NH, ND, SD, NE, OR, NM, UT, CO, IA, AR, AL, DC, ME — covered)
- **ACADEMIC_MEDICAL_CENTER**: ~40 rows (Stanford, UCSF, UCLA, UCSD, UC Davis, Keck USC, Vanderbilt, WashU/BJH, Emory, Michigan Medicine, UPMC Presbyterian, BMC, MGH, BWH, Tufts, BIDMC, UChicago, Rush, Geisinger, Penn State, HFH, DMC, Beaumont, MSKCC, HSS, Tampa General, AdventHealth, UF Shands, UMiami, Texas Children's, Houston Methodist, Memorial Hermann TMC, Baylor Dallas, UTSW, Atrium, Wake Forest, ECU, UK Chandler, UofL, CAMC, WVU Ruby, Marshall, Augusta MCG)
- **PUBLIC_HOSPITAL_SYSTEM** (IMG-relevant safety-net): ~10 rows (Bellevue NYC H+H, LAC+USC, Cook County Stroger, Parkland Dallas, Harborview Seattle, ZSFG, Boston Medical Center, Maimonides Brooklyn, UMC New Orleans, Memorial Hollywood, Brooklyn Hospital Center)
- **SYSTEM_SIBLING_EXPANSION**: ~10 rows (UPMC Presbyterian + Children's, IU University Hospital + Riley, CCF Florida + Akron General, Northwell North Shore + LIJ + Staten Island, Yale Children's + St Raphael, Jefferson East, UC Health West Chester, Christ Hospital Cincinnati, Orlando Health Regional)
- **MEDICAL_SCHOOL_UME**: 1 row (UWAMI Idaho)

Top targets (P0 priority): all 8 STATE_GAP_FILL rows + the 11 P0_AMC_GAP rows (UCSF, UCLA, Stanford, Vanderbilt, WashU/BJH, Michigan Medicine, UPMC Presbyterian, BMC, BWH, MGH, Mt Sinai is already ready, OHSU, U-Utah, UCHealth Colorado, Houston Methodist, UTSW, MSKCC) + the 5 P0 PUBLIC_HOSPITAL_SYSTEM rows (Bellevue, LAC+USC, Parkland, Harborview, ZSFG).

Expected yield: 60-70% sourceProofScore=5 in screening session 1, similar to Q1-Q3 yield.

## 7. Strategic checkpoint

Detail in `national_screening_strategic_checkpoint_1.md`. Headline:

**We are NOT drifting on safety. We ARE drifting on visible product growth.** The single highest-leverage next sprint is **promotion of the 25 READY_FOR_HUMAN_APPROVAL rows** (Yale / Mayo / Cleveland Clinic Main / NYP Columbia + Cornell / Hopkins / Mount Sinai / Duke / Northwestern / Penn / NYU Langone Tisch / etc.) into staged-runtime BEFORE any net-new Queue 4 screening.

If we promote 10 of those 25 in the next 3 sprints, active runtime grows from 5 to potentially 15 — a tripling — using zero new screening time.

## 8. Recommended next sprint

**`P97-PROMOTION-BATCH-3-CURATOR-PASS`** (Sprint #1 in the 10-sprint plan).

Goal: curator-review the 25-row READY_FOR_HUMAN_APPROVAL set on T7. Output: a bridge-input DRAFT containing 5-15 of those rows promoted to NEEDS_HUMAN_COPY_REVIEW with caveat stacks. Mirrors the UPMC/Lincoln pattern that already worked.

The 10-sprint plan in `national_screening_next_10_sprint_plan.csv` sequences:
1. Promotion Batch 3 — curator pass
2. Promotion Batch 3 — evidence landing
3. Promotion Batch 3 — bridge validation
4. Promotion Batch 3 — runtime candidate
5. Promotion Batch 3 — staged data
6. Contact ref prefill (UI wiring)
7. Correction intake rate limit
8. Queue 4 screening session 1
9. Queue 4 screening session 2
10. National scoreboard re-run + Queue 5

Promotion Batch 3 is sprints 1-5; UI wiring + rate limit are 6-7; Queue 4 screening is 8-9; checkpoint is 10.

## 9. Hard-rule confirmation

| Rule | Status |
|------|--------|
| No production deploy / `--prod` | CONFIRMED |
| No merge / PR to main | CONFIRMED |
| No DB / schema / prisma / seed | CONFIRMED |
| No PUBLIC_NOW / IMPORT_READY | CONFIRMED |
| No runtime activation | CONFIRMED |
| No active runtime change | CONFIRMED |
| No staged runtime change | CONFIRMED |
| No `/clerkships/pilot/*` change | CONFIRMED |
| No `/contact/*` UI change | CONFIRMED |
| No homepage / nav / sitemap exposure | CONFIRMED |
| No new external service / npm dependency | CONFIRMED |
| No app code change | CONFIRMED — only docs added |
| No existing validator weakened | CONFIRMED |
| No fake denominator | CONFIRMED — UNKNOWN flagged everywhere honest |
| No vague "many screened" language | CONFIRMED — exact counts (373 / 347 / 25 / 7 / 5 / 0) |
| No broad launch claim | CONFIRMED |
| No hidden denominator uncertainty | CONFIRMED |
| No web-scraping for Queue 4 build | CONFIRMED — Queue 4 is institution-name + URL-pattern only; verification deferred to screening sprint |
| No T7 file mutated | CONFIRMED — read-only inspection only |
| No staging of unrelated dirty files | CONFIRMED |
| No staging of `.claude/launch.json` | CONFIRMED |
| No staging of Maine generated files | CONFIRMED |
| No NPPES / redesign-mockups files staged | CONFIRMED |
| No broad `git add .` | CONFIRMED |
| No `--no-verify` / amend / force push | CONFIRMED |
