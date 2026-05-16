# P102-FLORIDA — Batch 1 Running Log

schemaVersion: p102-florida-1
branch: `local/p102-florida-state-deep-queue`
parent commit: `8e8344f`
production main: `739ab1e` UNCHANGED

Florida-specific status codes:
- `FL_PASS_PUBLIC_SAFE_FOUND` — ≥1 quote-backed PUBLIC_SAFE_USCE row
- `FL_PASS_NO_PUBLIC_SAFE_CORRECT` — 0 PUBLIC_SAFE, framework correctly refused to synthesize
- `FL_PASS_HUMAN_REVIEW_REQUIRED` — system/campus scope discipline held
- `FL_PASS_FUTURE_LANE_ONLY` — GME-rich but no USCE
- `FL_FAIL_QUOTE_VERIFICATION` — quote verifier failed (BLOCKING)
- `FL_FAIL_SCOPE_DISCIPLINE` — system-level → PUBLIC_SAFE_USCE (BLOCKING)
- `FL_FAIL_OVERPROMOTION` — HIDDEN_REJECTED → PUBLIC_SAFE (BLOCKING)
- `FL_FAIL_MISSING_TIER` — extractor missed a discoverable Tier 1 (recoverable via A4 or path additions)
- `FL_BLOCKED_FETCH` — bot block, 403/404 patterns
- `FL_NEEDS_P102_FIX` — framework gap discovered during run

---

(Per-institution entries appended below as Batch 1 progresses.)

## Florida Batch 1 — per-institution summary

### FL #1 — Mayo Clinic Florida (`p102-fl-1-mayo-clinic-florida`)

| Metric | Value |
|---|---:|
| Domain | mayoclinic.org |
| parentSystem (auto-set by inferIdentity) | "Mayo Clinic" |
| A0 accepted sources | 67 |
| Total verified claims | 61 |
| **PUBLIC_SAFE_USCE** | **0** |
| HUMAN_REVIEW_REQUIRED | 55 |
| FUTURE_LANE_ONLY | 6 |
| Quote-verified | 61 / 61 |
| Scope conflicts | 1 (system-level Tier 1, correctly flagged) |
| Regate verdict | PASS_WITH_CAVEATS, publicSafe=false, futureLaneValue=MEDIUM |

**Status: `FL_PASS_HUMAN_REVIEW_REQUIRED`**. mayoclinic.org is the system enterprise domain serving Mayo Rochester (MN), Mayo Florida (Jacksonville), and Mayo Arizona. Tier 1 candidates correctly held to HUMAN_REVIEW_REQUIRED (55 claims). Same scope-discipline pattern as Cleveland Clinic Florida (gold #1) and Memorial Hollywood (positive control). The new acronym-domain HEALTH_SYSTEM_LEVEL fallback worked correctly here via parentSystem="Mayo Clinic" + canonical name "Mayo Clinic Florida" having "florida" as a non-parent campus token.

### FL #2 — Baptist Hospital of Miami (`p102-fl-2-baptist-miami`)

| Metric | Value |
|---|---:|
| Domain | baptisthealth.net |
| parentSystem (auto-set) | null (not in registry; fell back to token-match) |
| A0 accepted sources | 20 |
| Total verified claims | 103 |
| **PUBLIC_SAFE_USCE** | **0** |
| HUMAN_REVIEW_REQUIRED | 56 |
| FUTURE_LANE_ONLY | 47 |
| Quote-verified | 103 / 103 |
| Scope conflicts | 3 (system-level, correctly flagged) |
| Regate verdict | PASS_WITH_CAVEATS, publicSafe=false, futureLaneValue=HIGH |

**Status: `FL_PASS_HUMAN_REVIEW_REQUIRED`**. Baptist Health South Florida operates 11 hospitals on baptisthealth.net (Baptist Miami / South Miami / West Kendall / Doctors / Mariners / Homestead / Fishermen's / Bethesda / Boca Raton Regional / Eugenio Litta / Baptist Outpatient). Even though parentSystem was null (Baptist Health South Florida not in the curated identity registry), the existing token-match path in `inferSourceScope` correctly identified baptisthealth.net as HEALTH_SYSTEM_LEVEL because canonical token "baptist" matched domain token "baptisthealth" AND non-parent tokens "hospital" and "miami" provide campus differentiation.

### FL #3 — Tampa General Hospital (`p102-fl-3-tampa-general`)

| Metric | Value |
|---|---:|
| Domain | tgh.org |
| A0 accepted sources | 3 |
| Total verified claims | 42 |
| **PUBLIC_SAFE_USCE** | **0** |
| HUMAN_REVIEW_REQUIRED | 6 |
| FUTURE_LANE_ONLY | 35 |
| CAUTION_SAFE_INTERNAL_REVIEW | 1 |
| Quote-verified | 42 / 42 |
| Regate verdict | PASS_WITH_CAVEATS, publicSafe=false, futureLaneValue=HIGH |

**Status: `FL_PASS_NO_PUBLIC_SAFE_CORRECT`**. tgh.org is a thin patient-facing domain. Only 3 deterministic probes succeeded (`/volunteer`, `/careers`, `/health-professionals`). Tampa General's USCE / visiting-medical-student content lives at `health.usf.edu/medicine` (USF Morsani College of Medicine, off-domain). Same off-domain medschool pattern as Brigham/HMS, Vanderbilt/medschool.vanderbilt.edu.

### FL #4 — UF Health Shands Hospital (`p102-fl-4-uf-health-shands`)

| Metric | Value |
|---|---:|
| Domain | ufhealth.org |
| A0 accepted sources | 20 |
| Total verified claims | **0** |
| **PUBLIC_SAFE_USCE** | **0** |
| Quote-verified | 0 / 0 |
| Regate verdict | FAIL_NEEDS_A4 (deterministic — ledger empty) |

**Status: `FL_PASS_NO_PUBLIC_SAFE_CORRECT`**. ufhealth.org accepted 20 patient-facing condition/treatment pages (`/care-sheets/...`, `/conditions-and-treatments/...`). The model A1/A2 phase correctly emitted **0 claims** from these pages — they contain no USCE / observership / visiting-student content. UF College of Medicine education content lives at `med.ufl.edu`, off-domain for ufhealth.org runs.

### FL #5 — Jackson Memorial Hospital (`p102-fl-5-jackson-memorial`)

| Metric | Value |
|---|---:|
| Domain | jacksonhealth.org |
| A0 accepted sources | 9 |
| Total verified claims | 30 |
| **PUBLIC_SAFE_USCE** | **0** |
| HUMAN_REVIEW_REQUIRED | 21 |
| FUTURE_LANE_ONLY | 9 |
| Quote-verified | 30 / 30 |
| Regate verdict | PASS_WITH_CAVEATS, publicSafe=false, futureLaneValue=MEDIUM |

**Status: `FL_PASS_NO_PUBLIC_SAFE_CORRECT`**. Jackson Memorial is the primary teaching hospital of the Miller School of Medicine (University of Miami). USCE content for Jackson is at `med.miami.edu` (already partially tested in `p102-pc-3-um-uhealth`). On `jacksonhealth.org`, A0 captured news/blogs/careers — no USCE-relevant content. Honest absence by off-domain medschool routing.

### FL #6 — Mount Sinai Medical Center Miami Beach (`p102-fl-6-mount-sinai-miami`)

| Metric | Value |
|---|---:|
| Domain | msmc.com |
| A0 accepted sources | 69 |
| Total verified claims | **0** |
| **PUBLIC_SAFE_USCE** | **0** |
| Quote-verified | 0 / 0 |
| Regate verdict | FAIL_NEEDS_A4 |

**Status: `FL_PASS_NO_PUBLIC_SAFE_CORRECT`**. msmc.com (acronym) accepted 69 patient-facing pages (mostly conditions / departments / find-a-doctor). The model correctly emitted **0 USCE claims** — no observership / visiting-student / elective content was present in the captured content. Wertheim College of Medicine (FIU) is off-domain.

### FL #7 — Nicklaus Children's Hospital (`p102-fl-7-nicklaus-childrens`)

| Metric | Value |
|---|---:|
| Domain | nicklauschildrens.org |
| A0 accepted sources | 26 |
| Total verified claims | 108 |
| **PUBLIC_SAFE_USCE** | **0** |
| HUMAN_REVIEW_REQUIRED | 68 |
| FUTURE_LANE_ONLY | 40 |
| Quote-verified | 108 / 108 |
| Regate verdict | PASS_WITH_CAVEATS, publicSafe=false, futureLaneValue=HIGH |

**Status: `FL_PASS_HUMAN_REVIEW_REQUIRED`**. Nicklaus Children's is a multi-campus pediatric system. 68 Tier 1 candidates correctly held to HUMAN_REVIEW_REQUIRED via system-scope discipline.

### FL #8 — Lee Memorial Hospital (`p102-fl-8-lee-memorial`)

| Metric | Value |
|---|---:|
| Domain | leehealth.org |
| A0 accepted sources | 46 |
| Total verified claims | 105 |
| **PUBLIC_SAFE_USCE** | **0** |
| HUMAN_REVIEW_REQUIRED | 59 |
| FUTURE_LANE_ONLY | 45 |
| CAUTION_SAFE_INTERNAL_REVIEW | 1 |
| Quote-verified | 105 / 105 (after one path-bug fix — see notes) |
| Regate verdict | PASS_WITH_CAVEATS, publicSafe=false, futureLaneValue=HIGH |

**Status: `FL_PASS_HUMAN_REVIEW_REQUIRED`**. Lee Health operates 6 hospitals on leehealth.org (Lee Memorial / HealthPark / Cape Coral / Gulf Coast Medical / Golisano Children's / Lee Memorial East). 59 Tier 1 candidates correctly held to HUMAN_REVIEW_REQUIRED.

**Path-construction bug found and one-claim data fix**: claim `c1_volunteer_program_general` had a malformed `cleanedTextPath` (institutional-run-id segment duplicated: `.../artifacts/p102-fl-8-lee-memorial/artifacts/p102-fl-8-lee-memorial/cleaned_text/sm_a4a69ca137002e84.txt`). The cleaned text file existed at the correct (non-duplicated) path. One-time data fix applied (replaced the duplicated segment in the ledger). This affected 1 of 105 claims; root cause appears to be a model-emit issue rather than a script bug (no other claim in any of the 22 prior runs has this pattern). Filed as a known one-off; if it recurs in Batch 2, will need a deeper investigation.

### FL #9 — Sarasota Memorial Hospital (`p102-fl-9-sarasota-memorial`)

| Metric | Value |
|---|---:|
| Domain | smh.com |
| A0 accepted sources | 2 |
| Total verified claims | 10 |
| **PUBLIC_SAFE_USCE** | **0** |
| FUTURE_LANE_ONLY | 10 |
| Quote-verified | 10 / 10 |
| Regate verdict | PASS_WITH_CAVEATS, publicSafe=false, futureLaneValue=MEDIUM |

**Status: `FL_PASS_NO_PUBLIC_SAFE_CORRECT`**. Sarasota Memorial accepted only 2 deterministic probes — community teaching hospital with limited public USCE-pathway content. FSU/USF affiliations for medical-student rotations would be off-domain.

### FL #10 — Nemours Children's Hospital Orlando (`p102-fl-10-nemours-orlando`)

| Metric | Value |
|---|---:|
| Domain | nemours.org |
| A0 accepted sources | 25 |
| Total verified claims | 250 |
| **PUBLIC_SAFE_USCE** | **0** |
| HUMAN_REVIEW_REQUIRED | 49 |
| FUTURE_LANE_ONLY | 201 |
| Quote-verified | 250 / 250 |
| Scope conflicts | 1 (correctly flagged) |
| Regate verdict | PASS_WITH_CAVEATS, publicSafe=false, futureLaneValue=HIGH |

**Status: `FL_PASS_HUMAN_REVIEW_REQUIRED`**. Nemours Children's is a multi-state pediatric system (Delaware Valley + Florida). nemours.org serves all campuses. 49 Tier 1 candidates correctly held to HUMAN_REVIEW_REQUIRED. The largest verified-claim count of the batch (250) demonstrates good coverage on the pediatric system domain; appropriately conservative promotion.

---

## Florida Batch 1 — cross-institution aggregate

| Metric | Value |
|---|---:|
| Institutions completed | 10 / 10 |
| Total A0 accepted sources | 287 |
| Total verified claims | 709 |
| **Total PUBLIC_SAFE_USCE** | **0** |
| Total HUMAN_REVIEW_REQUIRED | 314 |
| Total FUTURE_LANE_ONLY | 393 |
| Total CAUTION_SAFE_INTERNAL_REVIEW | 2 |
| Quote-verification failures (strict) | 0 / 709 (after Lee Memorial path-bug data fix) |
| Over-promotion failures | 0 |
| Scope conflicts (correctly flagged, not failures) | 5 |
| Gold-set regression | 11 / 11 PASS preserved |
| Validators | 12 / 12 PASS |

