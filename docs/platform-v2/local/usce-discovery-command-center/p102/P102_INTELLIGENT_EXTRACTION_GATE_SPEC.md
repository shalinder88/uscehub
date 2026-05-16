# P102 Intelligent Extraction Gate — Spec & Failure Analysis

Generated: 2026-05-16  
Branch: `local/p102-intelligent-extraction-gate`

---

## 1. Honest failure analysis

### What was built

The P102 pipeline extracted raw claims from every source page and deposited
all of them into a reviewer queue. A human reviewer was then expected to:

- Decide which pages were actually about USCE
- Collapse ~20 duplicate claims from the same URL into one decision
- Distinguish VMS vs IMG vs pharmacy vs residency
- Identify generic education pages vs direct opportunity pages
- Approve each row individually

This is backwards. The extraction model had already classified every claim
with a `lane` and `deepSourceFamily`. The system discarded that signal and
handed everything to the reviewer anyway.

### The numbers (from existing data)

| Stage | Count |
|---|---:|
| Raw extracted claims | 925 |
| After USCE-lane filter (model already decided) | 241 |
| After URL dedup | 46 |
| Pharmacy signals in raw queue | 143 |
| USCE entries with no direct-link signal | 34 |
| Current approved rows | 13 |
| Current approved institutions | 9 |

**74% of the reviewer queue was noise the model had already labelled as non-USCE.**  
**The reviewer was cleaning the model's own output.**

### Root causes

1. **No lane pre-filter**: all 925 claims went into the review queue
   regardless of whether the model said RESIDENCY, CAREERS, or
   NO_PUBLIC_OPPORTUNITY_FOUND.

2. **No URL dedup**: 37 claims from the same UCLA VSLO page became
   37 review rows. One page, one decision; this was not enforced.

3. **No audience pre-classification**: the reviewer saw `deepSourceFamily:
   OBSERVERSHIP` with no label saying "this is an IMG pathway, not VMS."

4. **No direct-link gate**: generic education landing pages (e.g.
   `/education`, `/academics`) entered the queue alongside specific
   program pages (e.g. `/visiting-students/vslo`).

5. **Pharmacy/allied-health not rejected upstream**: 143 entries
   contained pharmacy signals that should have been auto-discarded.

6. **The deep-mode prompt instructs the model to emit 5–15 claims per
   page**: this is correct for structured data extraction but was never
   separated from the reviewer workflow. One page producing 15 individual
   fact-claims (audience, eligibility, cost, duration, contact…) should
   produce ONE reviewer-facing row, not 15.

---

## 2. Success definition

| Metric | Target |
|---|---|
| Reviewer queue size | < 50 per extraction run |
| Pharmacy rows in review queue | 0 |
| GME/residency/fellowship rows in review queue | 0 |
| Careers/jobs rows in review queue | 0 |
| Duplicate source-page rows per URL | 1 |
| Audience classified | VMS / IMG / INTL / BOTH / UNKNOWN on every row |
| Direct-link status | Present on every row |
| Human review cases | Scope ambiguity + genuine evidence uncertainty only |

---

## 3. Correct pipeline

```
Source page
  │
  ▼
Stage C: PAGE TRIAGE
  ├─ REJECT_PHARMACY_OR_ALLIED_HEALTH    → rejection ledger
  ├─ REJECT_GME_ONLY                     → rejection ledger
  ├─ REJECT_RESIDENCY_FELLOWSHIP_ONLY    → rejection ledger
  ├─ REJECT_CAREERS_JOBS_ONLY            → rejection ledger
  ├─ REJECT_PATIENT_FACING               → rejection ledger
  ├─ REJECT_GENERIC_EDUCATION_NO_OPP     → rejection ledger
  ├─ REJECT_RESEARCH_ONLY                → rejection ledger
  ├─ REJECT_NO_DIRECT_LINK               → rejection ledger
  ├─ REJECT_DUPLICATE_SOURCE             → duplicate cluster
  ├─ HOLD_SCOPE_AMBIGUITY                → human review
  ├─ HOLD_AUDIENCE_AMBIGUITY             → human review
  ├─ HOLD_NEEDS_MORE_EVIDENCE            → human review
  └─ INCLUDE_USCE_OPPORTUNITY            → continue
          │
          ▼
Stage D: AUDIENCE CLASSIFIER
  ├─ US_MD_DO_VISITING_STUDENT
  ├─ INTERNATIONAL_MEDICAL_STUDENT
  ├─ IMG_GRADUATE_OBSERVER
  ├─ IMG_GRADUATE_EXTERNSHIP
  ├─ BOTH_STUDENT_AND_IMG_GRADUATE
  └─ UNKNOWN_HOLD                        → human review
          │
          ▼
Stage E: DIRECT-LINK VALIDATOR
  ├─ VALID_DIRECT_USCE_SOURCE            → continue
  ├─ GENERIC_PAGE_HOLD                   → human review
  └─ INVALID_NOT_USCE_SOURCE             → rejection ledger
          │
          ▼
Stage F: OPPORTUNITY-ROW BUILDER
  One row per (sourceUrl × audienceClass)
  Best quote selected from all claims on page
  Fields consolidated from all claims
          │
          ▼
Stage G: DEDUPLICATION
  By opportunitySignature = (institutionId + canonicalUrl + opportunityType + audienceClass)
          │
          ▼
Stage H: ROUTING
  ├─ High confidence + direct link + INSTITUTION_SPECIFIC → AUTO-PROMOTE candidate
  ├─ HEALTH_SYSTEM_LEVEL / MEDICAL_SCHOOL_LEVEL          → HOLD_SCOPE_AMBIGUITY
  └─ Low confidence or missing fields                    → HOLD_NEEDS_MORE_EVIDENCE
```

---

## 4. New field: studentVsGraduate

Every row must declare:

| Value | Meaning |
|---|---|
| `STUDENT` | Medical student (MS3/MS4, LCME/COCA school) |
| `IMG_GRADUATE` | IMG / international graduate (post-MD, not enrolled) |
| `BOTH` | Page explicitly accepts both |
| `UNKNOWN` | Cannot determine without human review |

---

## 5. Audience class taxonomy

```
US_MD_DO_VISITING_STUDENT      (VSLO, clerkship, away rotation, sub-I)
INTERNATIONAL_MEDICAL_STUDENT  (int'l med student, not IMG graduate)
IMG_GRADUATE_OBSERVER          (observership for IMG MDs)
IMG_GRADUATE_EXTERNSHIP        (externship for IMG MDs)
BOTH_STUDENT_AND_IMG_GRADUATE  (page explicitly serves both)
US_MD_DO_ONLY                  (domestic students, no IMGs)
PHARMACY_ONLY                  → reject before this point
ALLIED_HEALTH_ONLY             → reject before this point
RESIDENT_FELLOW_ONLY           → reject before this point
UNKNOWN_HOLD                   → human review
```

---

## 6. Direct-link signals

**Accept**: sourceUrl path contains any of:
`observ`, `visiting-stud`, `vslo`, `vsas`, `elective`, `clerkship`,
`rotation`, `extern`, `sub-intern`, `acting-intern`, `international-student`,
`img-program`, `away-rotation`

OR quote explicitly describes application process / eligibility / program details

**Reject or hold**: sourceUrl is `/education`, `/academics`, `/`,
`/about`, `/programs` (generic landing pages with no opportunity specificity)
AND quote contains no direct program evidence

---

## 7. Scripts to build

| Script | Purpose |
|---|---|
| `scripts/p102-triage-source-pages.ts` | Stage C: page-level decisions |
| `scripts/p102-classify-usce-audience.ts` | Stage D: audience classification |
| `scripts/p102-validate-direct-usce-links.ts` | Stage E: direct-link gate |
| `scripts/p102-build-intelligent-opportunity-rows.ts` | Stages F+G: row builder + dedup |
| `scripts/p102-validate-intelligent-opportunity-rows.ts` | Stage K: validator |

---

## 8. Output files

```
exports/
  source_page_triage.json           — one decision per source URL
  usce_audience_classified.json     — audience class per USCE URL
  direct_link_validation.json       — direct-link status per URL
  intelligent_public_safe_rows.json — clean, deduped opportunity rows
  intelligent_hold_rows.json        — scope/audience ambiguity → human review
  intelligent_rejected_rows.json    — rejected with reasons
  intelligent_duplicate_clusters.json — duplicate groupings
  intelligent_review_queue.json     — slim human review queue (HOLD_* only)
```

---

## 9. Reviewer queue contract (new)

The reviewer queue (`intelligent_review_queue.json`) ONLY contains:
- `HOLD_SCOPE_AMBIGUITY` — system/school-level source, campus unclear
- `HOLD_AUDIENCE_AMBIGUITY` — cannot tell VMS vs IMG without human read
- `HOLD_NEEDS_MORE_EVIDENCE` — USCE signal present but evidence thin

It NEVER contains:
- Pharmacy rows
- Residency / fellowship rows
- Careers / jobs rows
- Patient-facing rows
- Generic education pages
- Duplicate URLs
- Already auto-promoted rows
- Future-lane rows

---

## 10. Exact-link seed strategy

For scale-out, maintain `p102_exact_usce_seed_links.csv`:

```csv
institution,sourceUrl,expectedAudience,expectedOpportunityType,expectedSpecialty,notes
```

Exact links bypass the broad crawler entirely. The extractor reads the
known opportunity page directly and emits one clean row. This is the
correct approach until the discovery engine is intelligent enough to
find comparable pages autonomously.
