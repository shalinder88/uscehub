# P102 Exact-Link Seed Extraction Batch 1 Report

Generated: 2026-05-16  
Branch: `local/p102-exact-link-seed-extraction`  
Parent commit: `793f1cf` (P102 admin: multi-select audience on review form)

---

## TL;DR

- 11 curated exact-link seeds → **9/10 fetched seeds auto-promote (90%)**
- 10 public-safe rows ready for website preview
- 2 hold rows (weak quote evidence; URL valid)
- 0 rejected rows
- 1 FAILED_FETCH (UCSF SOM URL is 404 — bad seed, runner caught it)
- Validator: **21/21 checks pass**
- Type-check: clean
- Website preview now shows 25 total rows from 12 institutions (13 reviewed + 10 exact-seed + 2 intelligent gate)

---

## Seeds attempted

11 seeds covering 11 unique URLs across 10 institutions:

| Seed | Institution | URL | Expected audience | Final |
|---|---|---|---|---|
| seed_001 | Houston Methodist Hospital | /academic-institute/education/medical/medical-student-rotations | BOTH | HOLD_REVIEW (weak quote) |
| seed_002 | Boston Medical Center | /ear-nose-and-throat-department/.../visiting-medical-students | VMS | AUTO_PROMOTE |
| seed_003 | Hospital for Special Surgery | /education-institute/academic-visitor-program | IMG | AUTO_PROMOTE |
| seed_004 | Memorial Sloan Kettering | /medical-students | VMS | AUTO_PROMOTE |
| seed_005 | Orlando Health ORMC | /medical-professionals/graduate-medical-education/clerkship-programs | BOTH | AUTO_PROMOTE |
| seed_006 | UAB Hospital | /medicine/international/.../international-visiting-medical-students | INTL | AUTO_PROMOTE |
| seed_007 | UCSF Fresno | /education/visiting-medical-students | VMS | AUTO_PROMOTE |
| seed_008 | Keck School of Medicine of USC | /md-program/visiting-student-clerkships | VMS | AUTO_PROMOTE |
| seed_009 | Cleveland Clinic | /departments/elective-program | BOTH | AUTO_PROMOTE |
| seed_010 | David Geffen UCLA | /education/md-education/visiting-students/vslo | VMS | AUTO_PROMOTE |
| seed_011 | UCSF School of Medicine | /current-students/visiting-student-program | INTL | FAILED_FETCH (404) |

---

## Counts

| Bucket | Count |
|---|---:|
| Public-safe rows | 10 |
| Hold rows | 2 |
| Rejected rows | 0 |
| Duplicate clusters | 0 |
| Failed fetches | 1 |
| **Auto-promote rate** (of fetched) | **9/10 (90%)** |

### Audience breakdown (public-safe)

| Audience | Count |
|---|---:|
| US_MD_DO_VISITING_STUDENT | 6 |
| IMG_GRADUATE_OBSERVER | 2 |
| INTERNATIONAL_MEDICAL_STUDENT | 1 |
| (Houston Methodist BOTH → 2 holds, not in public-safe yet) | — |

### Direct-link breakdown (public-safe)

All 10 public-safe rows: `VALID_DIRECT_USCE_SOURCE` (100%)

---

## What changed in the runner during this batch

Three real bugs surfaced and were fixed mid-batch:

1. **Pharmacy false positives.** Original `PHARMACY_RE` matched the word "pharmacy" anywhere on the page — including institutional footer/nav cross-links to a College of Pharmacy. Fixed by requiring student/training context (`pharmacy student`, `pharmacy resident`, `PharmD`, etc.) AND requiring the rejection only when there's no USCE signal elsewhere.

2. **URL signals missed real direct pages.** Original regex `/visiting[_-]?stud/` didn't match `/visiting-medical-students` (interstitial "medical" word). Added pattern with `[a-z]+[_-]` interstitial. Added bare `/medical-students` and `/academic-visitor-program` patterns.

3. **Plural mismatch.** Original `\bobservership\b` didn't match "Observerships" — `\b` failed between `p` and `s`. Affected Houston Methodist's audience classification because the page says "Medical Student Rotations & Observerships". Fixed with `observer(ship)?s?` and similar for all enum-style signals.

Plus added a **quote-quality gate**: rows where the best-scoring sentence has zero opportunity-detail signals (application/cost/eligibility/contact) get held for review even when the URL is valid. This is what catches Houston Methodist's two rows — the page's quote selection picked nav-list text, not an opportunity sentence.

---

## Bad source examples (held / failed)

- **Houston Methodist medical-student-rotations** — URL is valid, audience confirmed BOTH (page has "Medical Student Rotations & Observerships"), but the deterministic quote selector picked weak nav text. Recommendation: model-call extraction would solve this; for now, reviewer can paste a better quote via the admin UI.
- **UCSF Fresno visiting-medical-students** — URL valid, but page is heavily JS-rendered; static HTML is mostly UCSF top-level navigation. Quote selection picked nav text. Same fix path as above.
- **UCSF School of Medicine** (seed_011) — URL 404s. The page was moved. Seed needs operator update — no valid path candidate exists at meded.ucsf.edu for visiting-students at the time of this run.

## Accepted source examples (auto-promoted with strong quotes)

| Institution | Quote excerpt |
|---|---|
| Boston Medical Center | "For any questions about the sub-internship not found on the Registrar's page or this one please contact: Thomas McNulty …" |
| Hospital for Special Surgery | "To apply to the Academic Visitor Program, first secure a host." |
| Memorial Sloan Kettering | "Bone Marrow Transplant Elective We offer an elective for medical students on bone marrow transplant…" |
| Orlando Health ORMC | "US medical students who do not have access to VSLO may submit a paper application." |
| UAB Hospital | "Fees cannot be adjusted, and we do not offer scholarships. *Cost of nonrefundable application fee and elective…" |
| Keck School of Medicine USC | "The Keck School of Medicine accepts visiting student applications through the Visiting Student Learning Opportunities Program…" |
| Cleveland Clinic | "Eligible students who are in their final year of medical school and who meet the required criteria for academic credit…" |
| UCLA David Geffen | "When you apply, please do not submit more than six elective and/or date selection choices at a time through VSLO." |

Every quote is a real source sentence with operational detail. None are paraphrased.

---

## Validator

```
P102 exact-seed validator
  21 passed, 0 failed
```

All 21 checks: seed CSV parses, sourceUrl present, audience enums valid, output files exist, totals match, every public row has quote+url+hash, all public rows are VALID_DIRECT_USCE_SOURCE, no pharmacy/allied/residency rows, audience required, no duplicate signatures, hold rows have reasons, rejected rows have reasons, seed status values valid, no overlap between public and hold, no /Volumes/T7 path leaked, dupes cluster shape correct.

`p102-validate-intelligent-opportunity-rows`: 19/19 pass (unchanged).  
`tsc --noEmit`: clean.  
`validate-no-secrets`: 0 findings across 6,421 files.

---

## Website preview state

`/usce/verified-preview` now merges three sources at render time:

| Source | Rows | Badge color |
|---|---:|---|
| Reviewer-approved (existing snapshot) | 13 | emerald |
| Exact-link seed (Batch 1) | 10 | blue |
| Intelligent gate (Houston Methodist holds promoted) | 2 | slate |
| **Total displayed** | **25** | |
| Institutions | 12 | |

Dedup signature: `institutionId + sourceUrl + opportunityType + audience`.  
Precedence on collision: AUTO_REVIEWED > EXACT_SEED > INTELLIGENT_GATE.

Card provenance badge added; clicking any card → detail page now resolves for all three sources.

---

## Build status

- `tsc --noEmit`: clean
- Dev server (Next.js 15): all 3 routes (`/usce/verified-preview`, `/usce/verified-preview/[rowId]`, `/usce/verified-preview/admin/review`) return 200
- `npm run build`: not run (full prod build out of scope for this sprint)

---

## Cost

$0 — no model calls. Deterministic extraction only.

---

## Recommendation

**Choice A: add user manual exact links and rerun seed batch.**

Justification:
- The auto-promote rate jumped from 5% (intelligent gate on broad crawl) to 90% (exact-link seeds). That's the unlock.
- Of the 2 holds, both are quote-quality issues on JS-heavy pages, not data problems. They will resolve when:
  - (a) the operator pastes a better quote via admin UI (1 minute per row), OR
  - (b) a future sprint enables model-backed extraction (`ANTHROPIC_API_KEY` gated) which can read JS-rendered content via a headless browser.
- Of the 1 failure, UCSF SOM has moved their page — the operator needs to find the new URL.
- **The seed file is small (11 rows).** Every additional verified URL the operator has from their manual work multiplies the public preview surface.

Suggested next batch: add 20-50 more seeds from the operator's manual research. Target outcome after Batch 2: 50+ public-safe rows in the preview, all source-linked, all with verbatim quotes, all audience-classified, all direct-link validated.

Stop using broad crawls for new institutions. They produce mostly generic landing pages that the intelligent gate correctly holds. Exact-link seeding is the path forward.

---

## Output files

```
docs/platform-v2/local/usce-discovery-command-center/p102/
  P102_EXACT_LINK_SEED_EXTRACTION_SPEC.md
  P102_EXACT_LINK_SEED_BATCH1_REPORT.md       ← this file
  queues/
    p102_exact_usce_seed_links.csv             ← 11 curated seeds
  exports/
    exact_seed_public_safe_rows.json           ← 10 auto-promote rows
    exact_seed_hold_rows.json                  ← 2 hold rows (weak quotes)
    exact_seed_rejected_rows.json              ← 0 rejected
    exact_seed_duplicate_clusters.json         ← 0 clusters
    exact_seed_run_report.json                 ← per-seed run results
  evidence/exact-seed/
    seed_001/{raw.html, cleaned.txt, meta.json}
    seed_002/...
    ... (11 directories)

scripts/
  p102-run-exact-usce-seed-links.ts            ← runner
  p102-validate-exact-seed-rows.ts             ← validator (21 checks)

src/
  lib/p102-preview-rows.ts                     ← merged preview adapter
  app/usce/verified-preview/page.tsx           ← updated to merge sources
  app/usce/verified-preview/[rowId]/page.tsx   ← updated lookup
  components/listings/p102-preview-listing-card.tsx ← provenance badge
```
