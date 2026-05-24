# P99-0A Audience Readiness + Hub Correction — Final Report

**Date:** 2026-05-03  
**Branch:** dossier-integration  
**Scope:** Maine (P97 pilot state, 20 scored listings)  
**Status:** PASSED — all hard gates clean

---

## What P99-0A Fixed

P99-0 produced a single `READY_PUBLIC` status that obscured three product-critical distinctions:

1. **Hub pages vs. opportunity cards.** ME-001 (MMC visiting MS hub) and ME-003 (CMHC umbrella) were scoring READY_PUBLIC. They are policy documents and application portals, not standalone opportunity cards. Their specialty sub-pages are the actual listings.

2. **US-only vs. IMG-eligible.** MMC routes all electives through VSLO (LCME/AOA-only). CMHC explicitly accepts international medical students. A UI that renders both under a single "ready" filter would mix cards that IMGs cannot use with ones they can.

3. **P97 NEEDS_MANUAL_REVIEW ignored.** ME-009, ME-010, ME-011, ME-014 were already flagged by P97. P99-0 scored them as PUBLIC_WITH_UNKNOWN_FIELDS based on raw field completeness, overriding the prior reviewer signal.

---

## Classification Comparison

| ID | P99-0 bucket | P99-0A bucket | Reason for change |
|---|---|---|---|
| ME-001 | READY_PUBLIC | SUPPORTING_SOURCE_ONLY | Policy hub — not an opportunity card |
| ME-002 | PUBLIC_WITH_UNKNOWN_FIELDS | SUPPORTING_SOURCE_ONLY | Affiliation-routed, no direct application |
| ME-003 | READY_PUBLIC | SUPPORTING_SOURCE_ONLY | CMHC umbrella hub |
| ME-004 | READY_PUBLIC | READY_PUBLIC_US_STUDENT_ONLY | LCME/AAMC US-only via VSLO |
| ME-005 | PUBLIC_WITH_UNKNOWN_FIELDS | READY_PUBLIC_US_STUDENT_ONLY | LCME via VSLO = IMG excluded (was mislabeled UNKNOWN) |
| ME-006 | READY_PUBLIC | READY_PUBLIC_US_STUDENT_ONLY | LCME/AOA explicitly |
| ME-007 | READY_PUBLIC | READY_PUBLIC_US_STUDENT_ONLY | LCME/AOACOA explicitly |
| ME-008 | PUBLIC_WITH_UNKNOWN_FIELDS | READY_PUBLIC_US_STUDENT_ONLY | LCME via VSLO = IMG excluded |
| ME-009 | PUBLIC_WITH_UNKNOWN_FIELDS | NEEDS_REVIEW | P97 flag + "nationwide" language ambiguous |
| ME-010 | PUBLIC_WITH_UNKNOWN_FIELDS | NEEDS_REVIEW | P97 NEEDS_MANUAL_REVIEW; sub-page unconfirmed |
| ME-011 | PUBLIC_WITH_UNKNOWN_FIELDS | NEEDS_REVIEW | P97 NEEDS_MANUAL_REVIEW; sub-page unconfirmed |
| ME-013 | PUBLIC_WITH_UNKNOWN_FIELDS | NEEDS_REVIEW | Unusual eligibility includes "high school" — needs reviewer |
| ME-014 | PUBLIC_WITH_UNKNOWN_FIELDS | NEEDS_REVIEW | Residency-department page; application path unclear |
| ME-015 | READY_PUBLIC | READY_PUBLIC_IMG_RELEVANT | International explicitly accepted |
| ME-016 | READY_PUBLIC | READY_PUBLIC_IMG_RELEVANT | International MS accepted |
| ME-017 | READY_PUBLIC | READY_PUBLIC_IMG_RELEVANT | International MS accepted |
| ME-018 | READY_PUBLIC | READY_PUBLIC_IMG_RELEVANT | International MS accepted |
| ME-019 | READY_PUBLIC | READY_PUBLIC_IMG_RELEVANT | International MS accepted |
| ME-020 | READY_PUBLIC | READY_PUBLIC_IMG_RELEVANT | International MS accepted |
| ME-021 | READY_PUBLIC | READY_PUBLIC_IMG_RELEVANT | International MS accepted |

---

## Final Bucket Counts

| Bucket | Count | Public card? |
|---|---|---|
| READY_PUBLIC_IMG_RELEVANT | 7 | Yes — highest priority for IMG/international users |
| READY_PUBLIC_US_STUDENT_ONLY | 5 | Yes — clearly labeled US MD/DO only |
| NEEDS_REVIEW | 5 | No — excluded from public preview until resolved |
| SUPPORTING_SOURCE_ONLY | 3 | No — anchor records for sub-listings only |

**Total public cards: 12**  
**Cards excluded from preview: 8** (5 NEEDS_REVIEW + 3 SUPPORTING_SOURCE)

---

## Validator Results

```
[1/4] Source-rights validator    → PASSED
[2/4] CMS bridge validator       → PASSED
[3/4] USCE v2 card rules         → PASSED (20 listings, 17 cards)
[4/4] tsc --noEmit               → PASSED

Overall (hard rules):            PASSED
```

### Hard gates enforced

| Rule | Description |
|---|---|
| FORBIDDEN_FIELD_IN_PUBLIC_CARD | NPI / CCN / EIN must not appear in public output |
| PUBLIC_CARD_MISSING_OFFICIAL_SOURCE | Every card requires official_source_url |
| SUPPORTING_SOURCE_IN_PUBLIC_PREVIEW | SUPPORTING_SOURCE cards blocked from preview |
| DO_NOT_SHOW_IN_PUBLIC_PREVIEW | DO_NOT_SHOW excluded |
| IMG_RELEVANT_MISSING_EXPLICIT_ELIGIBLE | READY_PUBLIC_IMG_RELEVANT requires INTERNATIONAL_STUDENT or IMG_GRADUATE in eligible_audiences |
| US_STUDENT_ONLY_MISSING_EXCLUSIONS | READY_PUBLIC_US_STUDENT_ONLY requires explicit exclusions |
| UNKNOWN_AUDIENCES_HIDDEN | UNKNOWN_NOT_STATED in audience_detail must surface in unknown_audiences |
| LCME_ONLY_IN_IMG_RELEVANT_BUCKET | international_student_status=EXCLUDED_EXPLICIT cannot appear in IMG-relevant bucket |
| POLICY_HUB_AS_OPPORTUNITY | POLICY_HUB pages cannot carry PUBLIC_OPPORTUNITY listing_role |

---

## Recommended First Launch — P99-1 UI

### Tier 1: CMHC (7 listings) — Lead with these

All 7 CMHC specialty listings carry `READY_PUBLIC_IMG_RELEVANT`. International medical students are explicitly accepted on every CMHC specialty page. These are the cards most relevant to IMGs and offshore-school students:

| ID | Specialty | Application method |
|---|---|---|
| ME-015 | Family Medicine | Smartsheet |
| ME-016 | Emergency Medicine | Smartsheet |
| ME-017 | OB-GYN | Smartsheet |
| ME-018 | Pediatrics | Smartsheet |
| ME-019 | Surgery | Smartsheet |
| ME-020 | Internal Medicine | Smartsheet |
| ME-021 | Rural Family Medicine | Smartsheet |

**Note:** `img_graduate_status` is `UNKNOWN_NOT_STATED` for all CMHC cards. "International MS accepted" covers currently-enrolled students; whether post-graduation IMGs qualify is not stated on the CMHC pages. The UI must display this unknown_audience clearly.

### Tier 2: MMC (5 listings) — Show separately, US MD/DO label

All 5 MMC specialty listings carry `READY_PUBLIC_US_STUDENT_ONLY`. IMGs and Caribbean-school students are excluded via VSLO/LCME routing. These should render in a clearly separated section.

| ID | Specialty | Note |
|---|---|---|
| ME-004 | General Surgery | VSLO via MMC hub |
| ME-005 | Emergency Medicine | VSLO via MMC hub |
| ME-006 | Anesthesiology | VSLO via MMC hub |
| ME-007 | Interventional Radiology | VSLO via MMC hub |
| ME-008 | Family Medicine | VSLO via MMC hub |

### Not for first launch

- ME-001, ME-002, ME-003: Supporting sources — visible as "affiliated institution" context only, not as opportunity cards
- ME-009, ME-010, ME-011, ME-013, ME-014: NEEDS_REVIEW — blocked until reviewer resolves

---

## Audience Rules for P99-1 UI

1. **IMG filter** must show only `READY_PUBLIC_IMG_RELEVANT` cards. `READY_PUBLIC_US_STUDENT_ONLY` must never appear in IMG filter results.

2. **Unknown eligibility** must be visible. Cards with `unknown_audiences` non-empty must display a "Eligibility unconfirmed for: [audience]" notice inline. Not hidden behind a "learn more" link.

3. **Hub pages** (SUPPORTING_SOURCE_ONLY) do not render as opportunity cards. They may appear as "administered through [institution]" metadata on their dependent specialty cards.

4. **NEEDS_REVIEW cards** do not appear in the public listing. They may appear in an internal reviewer dashboard only.

5. **Application method must propagate.** VSLO cards must show "Apply via VSLO" with the hub URL, not a direct specialty-page link.

---

## Hard Rules Carried Forward

1. **Hub pages are not opportunity cards** unless they have a direct application path AND no specialty sub-listings exist beneath them.

2. **LCME-only = IMG excluded.** VSLO-routed, LCME/AOA/AAMC-restricted listings carry `EXCLUDED_EXPLICIT` for INTERNATIONAL_STUDENT and IMG_GRADUATE.

3. **P97 NEEDS_MANUAL_REVIEW = NEEDS_REVIEW.** The signal must propagate; completeness scoring cannot override it.

4. **"International MS accepted" ≠ "IMG graduate accepted."** These are different cohorts. Do not conflate.

5. **Restrictions propagate down; acceptances do not.** A specialty sub-page inherits its hub's LCME-only restriction. It does not inherit a hub's general acceptance language without per-page confirmation.

---

## File Inventory

| File | Description |
|---|---|
| `build_listing_candidates_v2.py` | Phase A/B: candidate schema + per-audience status derivation |
| `usce_listing_candidates_v2.csv` | Phase B output: 20 listing rows with source_page_type, listing_role, per-audience fields |
| `usce_listing_completeness_v2.csv` | Phase C output: scored listings with audience-specific display_bucket |
| `build_public_card_preview_v2.py` | Phase D: public card builder (excludes SUPPORTING_SOURCE + DO_NOT_SHOW) |
| `public_listing_cards_preview_v2.json` | Phase D output: 17 public cards (12 ready + 5 NEEDS_REVIEW) |
| `scripts/validate-usce-public-cards.ts` | Phase E: TypeScript validator (all 4 sections PASSED) |
| `validation_report_usce.json` | Phase E output: machine-readable validation report |
| `P99_0_CLASSIFICATION_AUDIT.md` | Row-by-row audit of all 20 listings |
| `P99_0A_FINAL_REPORT.md` | This file |
