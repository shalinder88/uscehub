# P97 Queue 4 National Screening Resume — Sprint Report

**Sprint ID:** `P97-QUEUE-4-NATIONAL-SCREENING-RESUME`
**Date:** 2026-05-10
**Repo:** `/Users/shelly/usmle-platform`
**Branch:** `local/p97-discovery-integrity-guardrails-clean`
**HEAD before this sprint:** `f4dca4a0abda65b0c97884a1b658715fdbeaa2d4`
**Production main:** `739ab1e232ecc52db1f10c8619bbdc1d409a190f` — UNCHANGED ✅
**Scope:** Re-open the national screening lane after the Slice-2 milestone. Build a tight Queue 4 candidate file (100 rows) and Session 1 plan (25 rows). Plan the next 10 sprints. Docs + 1 small validator. No screening execution. No active runtime change. No production.

---

## 1. Executive result

| Item | Value |
|------|-------|
| Queue 4 candidate row count | **100** (carried verbatim from prior scoreboard sprint; cross-checked zero overlap with active 10 + staged batch-3 14) |
| Session 1 row count | **25** (P0-priority subset: 5 zero-coverage state gaps + 4 thin-state P0 + 11 tier-1 AMC + 4 P0 public-safety-net + 1 NY MSK specialty AMC; 18 distinct states; 10 IMG-relevant signals) |
| Active noindex pilot card count | **10 — UNCHANGED** |
| Staged runtime card count | **14 — UNCHANGED** |
| Production-public card count | **0 — UNCHANGED** |
| GitHub open secret-scanning alerts | **0** |
| Validators (9) | All PASS |
| New validator added | `scripts/validate-p97-queue-4-plan.ts` (queue-row-count + session-row-count + rank-uniqueness + forbidden-token + no-app-drift) |

## 2. Current scoreboard

```
Active noindex pilot:     10 cards   (Slice-1 +3 + Slice-2 +2 since project start at 5)
Staged runtime batch 3:   14 cards
Production-public:         0
Validated bridge inputs:   9 cumulative (UPMC + Lincoln + 7 batch-3)
Source-proofed corpus:   ~347 rows on T7
Open secret alerts:        0
Clean branch backed up:    YES (origin = f4dca4a)
```

## 3. Why not Slice 3 now

The remaining batch-3 deferred rows are Jackson Memorial (FL) and Methodist Hospital San Antonio (TX). Both have known-defensible deferral reasons:
- **Jackson Memorial:** system-level UM Miller SOM source + high public brand recognizability of "Jackson Memorial" — activation risks overpromising a campus-specific opportunity from a SOM-level page.
- **Methodist San Antonio:** HCA GME multi-site source rated `PARTIAL` for audience and application detail; activation requires a per-site source landed first.

Slice 3 would grow active 10 → 11 or 12 — modest gain at higher risk. Better candidates may emerge from Queue 4. Activating them later under cleaner sources is the right move.

## 4. Queue 4 selection logic

The 100-row candidate file (carried from the prior scoreboard sprint, unchanged here) is concentrated on:

| Type | Rows | Examples |
|------|------|----------|
| ACADEMIC_MEDICAL_CENTER | 43 | UCSF · UCLA · Stanford · Vanderbilt · WashU · Michigan Medicine · MSK · BWH · MGH · OHSU · UPenn (already active in Slice 2) — siblings only — etc. |
| STATE_GAP_FILL_THIN | 21 | OHSU · U-Utah · UCHealth Colorado · Denver Health · others |
| PUBLIC_HOSPITAL_SYSTEM | 13 | Bellevue NYC H+H · LAC+USC · Cook County · Parkland · Harborview · ZSFG · BMC · etc. |
| SYSTEM_SIBLING_EXPANSION | 13 | UPMC siblings · IU University Hospital + Riley Children · CCF Florida + Akron · Mass General Brigham · Hofstra Northwell · Yale + St Raphael · etc. |
| STATE_GAP_FILL (zero-coverage) | 7 | AK / ID / MT / WY targets |
| Other | 3 | MEDICAL_SCHOOL_UME (UWAMI Idaho) + 2 misc |

Cross-checked: zero overlap with active 10 or staged batch-3 14. The IU Health University Hospital + Riley Children's entries are LEGITIMATELY DISTINCT from the activated IU Health Methodist (different sites under the same SOM); kept as sibling-expansion candidates.

## 5. Top 25 Session 1 rows

Session 1 is biased toward:
- **State diversity:** 18 distinct states (5 zero-coverage / thin: AK, ID, MT, WY, OR + 7 thin-with-strong-AMC: UT, CO, TN, MO, MI, MA, FL + others).
- **Tier-1 AMC:** UCSF, UCLA, Stanford, Vanderbilt, WashU/BJH, Michigan Medicine, BWH, MGH, MSK, UF Shands, Houston Methodist, UTSW.
- **Public safety-net (IMG-relevant):** Bellevue NYC H+H, LAC+USC, Parkland, Harborview.

Detail in [`queue_4_session_1_rows.csv`](queue_4_session_1_rows.csv). Top 10 by session rank:

| Session rank | Listing | State | Type |
|--|--|--|--|
| 1 | Providence Alaska Medical Center | AK | STATE_GAP_FILL |
| 2 | Alaska Native Medical Center | AK | STATE_GAP_FILL |
| 3 | Saint Alphonsus Regional Medical Center | ID | STATE_GAP_FILL |
| 4 | Billings Clinic | MT | STATE_GAP_FILL |
| 5 | Wyoming Medical Center | WY | STATE_GAP_FILL |
| 6 | Oregon Health and Science University Hospital | OR | STATE_GAP_FILL_THIN (P0 AMC) |
| 7 | University of Utah Hospital | UT | STATE_GAP_FILL_THIN |
| 8 | UCHealth University of Colorado Hospital | CO | STATE_GAP_FILL_THIN |
| 9 | Denver Health Medical Center | CO | STATE_GAP_FILL_THIN_PUBLIC |
| 10 | UCSF Medical Center | CA | ACADEMIC_MEDICAL_CENTER |

Session 1 size: **exactly 25**, validator-enforced.

## 6. Gap targeting

Detail in [`queue_4_gap_targeting_matrix.csv`](queue_4_gap_targeting_matrix.csv). Headline mappings:
- **Active noindex count tiny** → Queue 4 supplies the next batch of bridge candidates.
- **Validated bridge rows limited** → Session 1 should yield 12-15 of 25 toward bridge readiness.
- **Regional overconcentration** → Session 1 explicitly adds AK, ID, MT, WY, OR, UT, CO, TN, MO, MI, WA + reaches into FL, TX.
- **Broad-IMG evidence limited** → Session 1 includes 5 P0 public-safety-net rows (Bellevue, LAC+USC, Parkland, Harborview, plus Denver Health).

## 7. Do-not-repeat patterns

Detail in [`queue_4_do_not_repeat_patterns.csv`](queue_4_do_not_repeat_patterns.csv). 14 named patterns including:
- Treating SOM page as campus-specific (Jackson Memorial pattern — defer with system-level caveat).
- Treating residency / GME page as USCE (HCA Aventura Class-D pattern).
- Broad-IMG claim without source.
- Visa sponsorship claim without source.
- Source archived but not current.
- Validator weakening (must EXTEND, not weaken).
- Endless mapping after launch blockers fixed.
- Activating lower-confidence rows just for count.
- FREIDA/ACGME automated scraping.
- T7 mutation from Mac-local screening.
- Publishing to production from a noindex slice.
- Committing unrelated dirty files.
- Printing tokens or secrets (Mount Sinai incident pattern — `gh auth status -t`).

## 8. Validation / scoring plan

Detail in [`queue_4_validation_and_scoring_plan.md`](queue_4_validation_and_scoring_plan.md). Headline:
- Each screened row produces HTML + PNG + Wayback + verbatim quote OR a documented stop reason.
- Bridge-input readiness gate: 5 conditions (evidence triple complete + audience explicit + application named + no banned phrase + scope is site-level OR system-level-with-explicit-caveat).
- Stop conditions: no public visiting-MS lane within 15 minutes → `KEEP_INTERNAL`; bot defense + no Wayback → `NEEDS_EVIDENCE_HARDENING`; residency / GME source → `WRONG_LANE_RECLASSIFY_TO_FUTURE`.
- Per session: exactly 25 rows.
- One commit per session (not per row).
- No active runtime change in screening sprints.

## 9. Next 10 sprints

Detail in [`queue_4_next_10_sprint_plan.csv`](queue_4_next_10_sprint_plan.csv). Sequence:

1. `P97-QUEUE-4-SESSION-1-SCREENING` — screen the 25 Session-1 rows.
2. `P97-QUEUE-4-SESSION-1-CURATOR-PASS` — classify Session-1 results.
3. `P97-QUEUE-4-SESSION-1-EVIDENCE-HARDENING` — Wayback retries + per-site sources.
4. `P99-P97-STAGED-RUNTIME-BATCH-4-DATA-ONLY` — build staged batch 4 from validated.
5. `P99-P97-STAGED-RUNTIME-BATCH-4-REPORT-ISSUE-MAPPING` — mapping for new staged.
6. `P99-P97-STAGED-RUNTIME-BATCH-4-PROMOTION-CANDIDATE-AUDIT` — audit shortlist.
7. `P99-P97-STAGED-RUNTIME-BATCH-4-NOINDEX-ACTIVATION-SLICE-N` — actual activation.
8. `P97-QUEUE-4-SESSION-2-SCREENING` — next 25 rows.
9. `P97-QUEUE-4-SESSION-2-CURATOR-PASS`.
10. **STRATEGIC-CHECKPOINT-2-AND-DECISION** — decide further screening vs production-ready vs other lane.

## 10. What this sprint did NOT do

- **No screening execution.** This is the queue, not the screening session.
- **No runtime mutation.** Active 10 + staged 14 unchanged.
- **No production deploy.** No PR. No merge to main.
- **No DB / schema / Prisma / seed / cron change.**
- **No `/clerkships/pilot` or `/contact` change.**
- **No `/lib/usce-contact-context.ts` change** (no resolver KNOWN_LISTINGS update — Queue 4 rows are not yet listings).
- **No homepage / nav / sitemap exposure.**
- **No T7 mutation.**
- **No FREIDA / ACGME / AAMC scraping.**
- **No `gh auth status -t` and no token printing.**
- **No mutation of unrelated dirty files.**

## 11. Recommended next sprint

**`P97-QUEUE-4-SESSION-1-SCREENING`** — execute Session 1's 25 rows. Each row produces evidence triples or stop conditions per `queue_4_validation_and_scoring_plan.md`. Output is a `row_status.csv` and a `queue-4-session-1-screening` sprint folder with HTML / PNG / Wayback / quote artifacts.

If Session 1 yields 12-15 bridge candidates, the next 4 sprints (curator pass + evidence hardening + staged batch 4 data + report mapping) build to a Slice-3 or Slice-4 noindex activation.

## 12. Strategic checkpoint

> Are we moving toward big product?

**Yes.** This sprint is upstream of product growth — it builds the queue that feeds the funnel. Without Queue 4 the active runtime would plateau at 10. With Queue 4 + 25-row Session 1, a realistic next 5 sprints could land Slice 3 with 1–3 new state-diverse cards (e.g. OHSU / U-Utah / Stanford / Vanderbilt — depending on yield).

> Did this reduce the 347 → 5 bottleneck?

**Indirectly — but the next 5 sprints will.** Today's sprint is the queue, not the conversion. The conversion happens in Session 1 + curator pass + evidence hardening (sprints 1–3 of the 10-sprint plan). After those, expect 6–10 net new validated bridge inputs.

> Are we drifting?

**No.** This sprint produced 9 docs + 1 validator in one named folder. No app code changed. No active runtime changed. No staged data changed. Validator-enforced.

> What must stop?

Re-evaluating Slice 3 (Jackson / Methodist San Antonio) just because they're "left over". They are deferred for source-quality reasons; Queue 4's yield is more valuable.

> What must continue?

The "validate, stage, audit, then activate" discipline. Every Queue-4 row that becomes a bridge candidate must pass the same gates Slices 1–2 passed.

## 13. Hard-rule confirmation

| Rule | Status |
|------|--------|
| No production deploy / `vercel --prod` | CONFIRMED |
| No merge / PR to main | CONFIRMED |
| No DB / schema / Prisma / seed / cron | CONFIRMED |
| No active runtime change | CONFIRMED |
| No staged data change | CONFIRMED |
| No `/clerkships/pilot/*` / `/contact/*` change | CONFIRMED |
| No homepage / nav / sitemap exposure | CONFIRMED |
| No `NO_PUBLIC_NOW` / `NO_IMPORT_READY` discipline break | CONFIRMED — validator scans the resume folder |
| No banned phrase | CONFIRMED |
| No T7 mutation | CONFIRMED |
| No mutation of unrelated dirty files | CONFIRMED |
| No broad `git add .` | CONFIRMED |
| No `--no-verify` / amend / force-push | CONFIRMED |
| No `gh auth status -t` | CONFIRMED |
| No tokens / secrets printed | CONFIRMED |
| No automated FREIDA / ACGME / AAMC scraping (this sprint produces a queue, not data fetches) | CONFIRMED |
| No weakening of existing validators | CONFIRMED — added one new validator |
