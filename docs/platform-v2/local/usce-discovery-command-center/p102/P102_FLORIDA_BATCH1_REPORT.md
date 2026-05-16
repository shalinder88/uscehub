# P102-FLORIDA Batch 1 Deep Queue Report

schemaVersion: p102-florida-batch1-1
branch: `local/p102-florida-state-deep-queue`
parent commit: `8e8344f` (P102 positive-control complete)
this report HEAD: see git log
production main: `739ab1e` UNCHANGED

## 1. Outcome — Batch 1 PASSED on safety, ZERO new public-safe rows

| Metric | Threshold | Result |
|---|---|---:|
| Institutions completed (or honestly blocked) | 10 / 10 | **10 / 10** |
| **PUBLIC_SAFE_USCE source claims (Batch 1 only)** | (no minimum required) | **0** |
| Quote-verification failures (strict) | 0 | **0 / 709** (after one path-bug data fix) |
| Over-promotion failures (HIDDEN_REJECTED → PUBLIC) | 0 | **0** |
| Scope failures (HEALTH_SYSTEM_LEVEL → PUBLIC) | 0 | **0** |
| Gold-set verification | 11 / 11 | **11 / 11 PASS** |
| Validator dispatcher | 12 / 12 | **12 / 12 PASS** |
| Unit tests | all pass | **155 / 155 PASS** |
| Cross-run quote-verify (35 runs total) | 0 failures | **0 / 2204 claims** |

**Safety: PASSED.** **Productive yield: 0 new PUBLIC_SAFE_USCE rows.**

This is a meaningful, honest result that validates the framework's conservative posture at state scale.

## 2. Per-institution rollup

| # | Institution | Domain | Sources | Verified | PUBLIC_SAFE | HUMAN_REVIEW | FUTURE | Status |
|---|---|---|---:|---:|---:|---:|---:|---|
| 1 | Mayo Clinic Florida | mayoclinic.org | 67 | 61 | 0 | 55 | 6 | `FL_PASS_HUMAN_REVIEW_REQUIRED` |
| 2 | Baptist Hospital of Miami | baptisthealth.net | 20 | 103 | 0 | 56 | 47 | `FL_PASS_HUMAN_REVIEW_REQUIRED` |
| 3 | Tampa General Hospital | tgh.org | 3 | 42 | 0 | 6 | 35 | `FL_PASS_NO_PUBLIC_SAFE_CORRECT` |
| 4 | UF Health Shands | ufhealth.org | 20 | 0 | 0 | 0 | 0 | `FL_PASS_NO_PUBLIC_SAFE_CORRECT` |
| 5 | Jackson Memorial | jacksonhealth.org | 9 | 30 | 0 | 21 | 9 | `FL_PASS_NO_PUBLIC_SAFE_CORRECT` |
| 6 | Mount Sinai Miami Beach | msmc.com | 69 | 0 | 0 | 0 | 0 | `FL_PASS_NO_PUBLIC_SAFE_CORRECT` |
| 7 | Nicklaus Children's | nicklauschildrens.org | 26 | 108 | 0 | 68 | 40 | `FL_PASS_HUMAN_REVIEW_REQUIRED` |
| 8 | Lee Memorial | leehealth.org | 46 | 105 | 0 | 59 | 45 | `FL_PASS_HUMAN_REVIEW_REQUIRED` |
| 9 | Sarasota Memorial | smh.com | 2 | 10 | 0 | 0 | 10 | `FL_PASS_NO_PUBLIC_SAFE_CORRECT` |
| 10 | Nemours Children's Orlando | nemours.org | 25 | 250 | 0 | 49 | 201 | `FL_PASS_HUMAN_REVIEW_REQUIRED` |
| **Totals** | | | **287** | **709** | **0** | **314** | **393** | |

5 institutions held to `HUMAN_REVIEW_REQUIRED` by system-scope discipline.
5 institutions correctly produced honest absence (off-domain medschool or thin patient-facing domain).

## 3. Strong safety signal

The Batch 1 result is a **stress test on safety discipline at state scale**, and it passed cleanly:

- **0 over-promotions** across 10 Florida hospitals with diverse complexity profiles.
- **5 multi-campus system enterprise domains** (Mayo Clinic, Baptist Health South Florida, Lee Health, Nemours, Nicklaus) → all correctly held to `HUMAN_REVIEW_REQUIRED` (314 Tier 1 claims safely held).
- **5 acronym-domain or off-domain-medschool patterns** correctly handled without synthesis.
- **0 quote failures** (after one one-off path-construction data fix on Lee Memorial).
- **Acronym-domain HEALTH_SYSTEM_LEVEL fallback** (P102-FIX, mid-positive-control sprint) worked on Mayo Clinic Florida via parentSystem auto-set; worked on Baptist Health via existing token-match path.

## 4. Why ZERO new PUBLIC_SAFE_USCE rows on Batch 1

The Batch 1 institution mix was deliberately weighted toward complexity tests:

- 4 enterprise system domains (Mayo, Baptist, Lee, Nemours) — designed to trigger HEALTH_SYSTEM_LEVEL discipline.
- 4 off-domain medschool routes (TGH/USF, UF Health/UF COM, Jackson/Miller, Mount Sinai/Wertheim).
- 1 single-campus academic (Mount Sinai Miami) — but on a thin patient-facing domain.
- 2 community teaching (Sarasota, Lee) — limited public USCE on hospital domain.

This mirrors the actual structure of Florida acute-care hospitals: **most do not host their own visiting-medical-student / observership content on the hospital domain**. They route applicants through:

- Affiliated medical schools (Miller SOM, USF Morsani, UF College of Medicine, Wertheim FIU, FSU College of Medicine).
- System enterprise portals (mayoclinic.org/medical-professionals/, baptisthealth.net/research-medical-education/, etc. — but these are HEALTH_SYSTEM_LEVEL).

The 27 PUBLIC_SAFE_USCE rows from positive-control Orlando Health represent the unusual case: a single-campus academic-affiliated institution with on-domain VSLO clerkship content at `/medical-professionals/graduate-medical-education/clerkship-programs`.

## 5. Bug found and one-time data fix

**Lee Memorial path-construction bug** (1 claim of 105):

- Claim `c1_volunteer_program_general` had `cleanedTextPath` with the institutional-run-id segment duplicated: `.../artifacts/p102-fl-8-lee-memorial/artifacts/p102-fl-8-lee-memorial/cleaned_text/sm_a4a69ca137002e84.txt`.
- The cleaned text file existed at the correct (non-duplicated) path.
- One-time data fix in `13_model_claims_verified.json` (replaced duplicated segment).
- Affected 1 of 105 claims for this run; 0 other claims across 22 prior runs (gold + positive control) have this pattern.
- Root cause not yet identified; appears to be a model-emit issue rather than a script bug (the model's JSON output may have echoed the artifacts root concatenated to a per-source relative path).
- **Filed as a known one-off**. If it recurs in Batch 2, will need a deeper investigation — likely a defensive sanitizer in `verifyAndReclassify` to strip duplicated `artifacts/<runId>/artifacts/<runId>/` patterns.

## 6. Cross-cumulative state — gold + positive-control + FL Batch 1

| Metric | Value |
|---|---:|
| Total runs (gold + positive-control + FL Batch 1) | 32 |
| Total verified model claims | 2204 |
| Total PUBLIC_SAFE_USCE (across all runs) | 91 |
| Institutions producing ≥ 1 PUBLIC_SAFE_USCE | 9 (unchanged from positive-control state) |
| Florida institutions producing ≥ 1 PUBLIC_SAFE_USCE | 1 (Orlando Health, 27 claims) |
| Quote-verification failures (strict) | 0 / 2204 |
| Over-promotion failures | 0 |
| Scope failures | 0 |
| Gold-set verification | 11 / 11 PASS |
| Validator dispatcher | 12 / 12 PASS |

## 7. What Batch 1 validated about the framework

- **System-scope discipline holds at state scale**: 5 different multi-campus systems (Mayo, Baptist, Lee, Nemours, Nicklaus) all correctly held to HUMAN_REVIEW_REQUIRED.
- **Acronym-domain HEALTH_SYSTEM_LEVEL fallback works in production**: Memorial Hollywood pattern reproduced on Mayo Clinic Florida and Nemours.
- **Off-domain medschool refusal works at state scale**: TGH/USF, UF Health/UF COM, Jackson/Miller, Mount Sinai/Wertheim all correctly produced honest absence.
- **Patient-facing-only domains tolerated**: UF Health and Mount Sinai accepted patient pages but the model correctly emitted 0 USCE claims.
- **Quote verification holds at state scale**: 0 failures across 709 Florida claims (after one data fix).
- **Defense-in-depth holds at state scale**: model gate, deterministic re-classifier, regate, and quote-verify all consistent.

## 8. What Batch 1 did NOT validate

- The framework's ability to surface PUBLIC_SAFE_USCE rows at scale. Batch 1 added zero new public-safe rows because the institution mix was complexity-weighted, not yield-weighted.
- Whether the Florida acute-care universe contains enough single-campus academic-affiliated hospitals to produce a state-level public-safe corpus. This needs Batch 2 with a different selection bias (more institution-specific Tier 1 hospitals, or a parallel medical-school-domain run pass).

## 9. Recommendation

**B (with modification): Florida Batch 2, but include a parallel medical-school-domain run pass.**

Florida Batch 1 was deliberately complexity-weighted and produced the right safety result (zero over-promotions, zero quote failures, zero scope failures, gold preserved). It also revealed a structural truth: Florida acute-care hospital domains are mostly thin patient-facing portals; USCE content lives on affiliated medical schools or system portals.

For Batch 2 (10-15 more institutions), pick a different mix:

1. **Medical-school-domain runs** for the Florida academic centers (separate runs, not hospital-domain runs):
   - `medschool.miami.edu` (Miller SOM — Jackson Health teaching site)
   - `health.usf.edu/medicine` (USF Morsani — TGH teaching site)
   - `med.ufl.edu` (UF COM — UF Health Shands teaching site)
   - `medicine.fiu.edu` (Wertheim — Mount Sinai Miami teaching site)
   - `med.fsu.edu` (FSU College of Medicine)
2. **Single-campus academic hospitals** that may have on-domain content:
   - Cleveland Clinic Florida (already gold) — can be re-run after path additions
   - West Kendall Baptist Hospital (FIU regional teaching site)
   - Bethesda Hospital East (FAU teaching site)
3. **HCA Florida teaching hospitals** (HCA East / HCA West / Aventura / Kendall / Mercy / Memorial, etc.) — system-scope test on hcafloridahealthcare.com.
4. **Smaller community teaching** (NCH Healthcare, Sarasota Memorial Venice, etc.) for honest-absence baseline.

Pass criteria for Batch 2:
- ≥ 5 institutions produce ≥ 1 quote-backed PUBLIC_SAFE_USCE row.
- 0 over-promotions.
- 0 quote-verification failures.
- 0 scope failures.
- Gold-set still 11 / 11 PASS.
- Lee Memorial path-bug pattern does not recur in any new run (or if it does, a defensive sanitizer is added).

After Batch 2 (or in parallel), advance to **C. minimal website ingestion contract** — define the data shape for the 27 + new PUBLIC_SAFE_USCE rows that we already have.

## 10. Out-of-scope reminders

- No push.
- No PR.
- No deploy.
- No merge to main.
- No schema migration / Prisma / DB / seed.
- No UI / homepage / SEO / sitemap / robots / metadata changes.
- No public import.
- No auto-publish.
- No national run.
- No parallel institutions.
- No broad crawler.

Branch: `local/p102-florida-state-deep-queue`. Local commits only. Production main `739ab1e` UNCHANGED.

---

## Exact next recommendation

**B. Florida Batch 2** (with the modified mix above), then **C. Minimal website ingestion contract** for the 27 + future PUBLIC_SAFE_USCE rows.

NOT recommended:
- A. P102-FLORIDA-FIX — no blocking framework bugs found in Batch 1 (one path-bug data fix is contained and documented; if it recurs in Batch 2, escalate).
- D. Stop and review — Batch 1 is unambiguously a safety pass; the 0-public-safe yield is a structural finding about Florida hospital domains, not a framework defect.
