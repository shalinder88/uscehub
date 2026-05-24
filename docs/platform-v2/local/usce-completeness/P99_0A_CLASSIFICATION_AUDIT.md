# P99-0A Classification Audit

**Date:** 2026-05-03  
**Purpose:** Identify misclassifications in P99-0 output before building public UI.

---

## Problem Statement

P99-0 produced a single `READY_PUBLIC` status that does not distinguish:
- US MD/DO-only listings (VSLO, LCME, AAMC-only)
- IMG/international-eligible listings
- Hub/policy pages that are evidence sources but not opportunity cards
- Listings with inherited eligibility (specialty sub-pages whose policy comes from the hub)
- Listings that require human review before any classification

Zero NEEDS_REVIEW in a messy source set is a sign the scorer was too permissive.

---

## Row-by-Row Audit

### ME-001 — MMC Visiting Medical Student Electives Hub
- **Source page type:** POLICY_HUB (umbrella for 8 specialty listings below it)
- **Listing role:** SUPPORTING_SOURCE (not a standalone card)
- **Why:** The hub page is the policy document + application portal for the system. The actual electives are the specialty pages (ME-004–ME-011). The hub should anchor those cards but should not itself appear as a separate opportunity card.
- **IMG eligibility:** Hub explicitly routes via VSLO → LCME/AOA-accredited US medical schools only. IMGs are excluded at the hub level.
- **P99-0 classification:** READY_PUBLIC ← **WRONG** (hub, not opportunity)
- **Corrected:** SUPPORTING_SOURCE_ONLY (display_bucket), US_STUDENT_ONLY for any inherited specialty cards

---

### ME-002 — Togus VA Affiliated Medical Education
- **Source page type:** OFFICIAL_DEPARTMENT_PAGE
- **Listing role:** SUPPORTING_SOURCE
- **Why:** No direct application path. Rotations are affiliation-routed through MMC, EMMC, or UNECOM. Cannot apply directly to Togus VA.
- **IMG eligibility:** UNKNOWN (routing through affiliated institution determines eligibility)
- **P99-0 classification:** PUBLIC_WITH_UNKNOWN_FIELDS ← acceptable label but wrong listing_role
- **Corrected:** SUPPORTING_SOURCE_ONLY — should not appear as a standalone opportunity card

---

### ME-003 — CMHC Elective Clerkships (umbrella)
- **Source page type:** POLICY_HUB
- **Listing role:** SUPPORTING_SOURCE (ME-015–ME-021 are the specialty listings)
- **Why:** The CMHC hub page describes all clerkship types; the individual specialty listings (ME-015–021) each have the same Smartsheet application URL. Hub should not duplicate the 7 specialty cards.
- **IMG eligibility:** International MS accepted — this applies to all sub-listings
- **P99-0 classification:** READY_PUBLIC ← **WRONG** (hub, should be SUPPORTING_SOURCE)
- **Corrected:** SUPPORTING_SOURCE_ONLY

---

### ME-004 — MMC General Surgery Acting Internship
- **Source page type:** SPECIALTY_PAGE
- **Listing role:** PUBLIC_OPPORTUNITY
- **IMG eligibility:** LCME/AAMC US-only — **EXCLUDED**
- **Audience:** US MD/DO 4th-year students only. Caribbean/international excluded.
- **Application:** Via MMC VSLO hub (no direct URL on specialty page)
- **Hub dependency:** Application routes through ME-001 hub
- **P99-0 classification:** READY_PUBLIC
- **Corrected:** READY_PUBLIC_US_STUDENT_ONLY

---

### ME-005 — MMC Emergency Medicine Elective
- **Source page type:** SPECIALTY_PAGE
- **Listing role:** PUBLIC_OPPORTUNITY
- **IMG eligibility:** LCME via VSLO — **EXCLUDED**
- **P99-0 classification:** PUBLIC_WITH_UNKNOWN_FIELDS ← too cautious; LCME-only is known
- **Corrected:** PUBLIC_BUT_IMG_EXCLUDED (img is NO, not unknown)

---

### ME-006 — MMC Anesthesiology Elective
- **Source page type:** SPECIALTY_PAGE
- **Listing role:** PUBLIC_OPPORTUNITY
- **IMG eligibility:** LCME/AOA explicitly — **EXCLUDED**
- **P99-0 classification:** READY_PUBLIC
- **Corrected:** READY_PUBLIC_US_STUDENT_ONLY

---

### ME-007 — MMC Interventional Radiology Elective
- **Source page type:** SPECIALTY_PAGE
- **Listing role:** PUBLIC_OPPORTUNITY
- **IMG eligibility:** LCME/AOACOA — **EXCLUDED**
- **P99-0 classification:** READY_PUBLIC
- **Corrected:** READY_PUBLIC_US_STUDENT_ONLY

---

### ME-008 — MMC Family Medicine Elective
- **Source page type:** SPECIALTY_PAGE
- **Listing role:** PUBLIC_OPPORTUNITY
- **IMG eligibility:** LCME via VSLO — **EXCLUDED**
- **P99-0 classification:** PUBLIC_WITH_UNKNOWN_FIELDS
- **Corrected:** PUBLIC_BUT_IMG_EXCLUDED

---

### ME-009 — MMC Pediatrics (Barbara Bush Children's)
- **Source page type:** SPECIALTY_PAGE
- **Listing role:** PUBLIC_OPPORTUNITY
- **IMG eligibility:** Source says "visiting students nationwide" — broader language but no explicit IMG statement. Application still through MMC hub (VSLO). LCME assumption applies.
- **Note:** Pediatrics is the most permissive-sounding MMC specialty but cannot override hub VSLO policy without per-page confirmation.
- **P99-0 classification:** PUBLIC_WITH_UNKNOWN_FIELDS
- **Corrected:** NEEDS_REVIEW — "nationwide" language is ambiguous; needs reviewer to confirm whether this specialty independently accepts IMGs or still requires VSLO enrollment

---

### ME-010 — MMC Psychiatry Medical Student Electives
- **Source page type:** SPECIALTY_PAGE
- **Listing role:** PUBLIC_OPPORTUNITY (pending review)
- **IMG eligibility:** Not stated on sub-page
- **P97 status:** NEEDS_MANUAL_REVIEW
- **P99-0 classification:** PUBLIC_WITH_UNKNOWN_FIELDS ← too permissive
- **Corrected:** NEEDS_REVIEW

---

### ME-011 — MMC Diagnostic Radiology MS Opportunities
- **Source page type:** SPECIALTY_PAGE
- **Listing role:** PUBLIC_OPPORTUNITY (pending review)
- **IMG eligibility:** Not stated on sub-page
- **P97 status:** NEEDS_MANUAL_REVIEW
- **P99-0 classification:** PUBLIC_WITH_UNKNOWN_FIELDS ← too permissive
- **Corrected:** NEEDS_REVIEW

---

### ME-013 — EMMC Clinical Observational Experience
- **Source page type:** OPPORTUNITY_PAGE (direct EMMC observership program)
- **Listing role:** PUBLIC_OPPORTUNITY
- **IMG eligibility:** Broad: "MD/DO students + APP students + licensed practitioners + students of accredited colleges." No explicit IMG/international statement, but "licensed practitioners" may include IMG graduates with license.
- **Audience:** MEDICAL_STUDENTS (US + possibly international), licensed practitioners
- **Note:** graduate_eligibility is YES (licensed practitioners = could include IMG grads). Needs UNKNOWN_NOT_STATED for IMG-specific filter.
- **P99-0 classification:** PUBLIC_WITH_UNKNOWN_FIELDS ← correct but incomplete
- **Corrected:** PUBLIC_WITH_IMG_UNKNOWN — eligible for some audiences but IMG graduate status unclear

---

### ME-014 — EMMC FM Residency / MS Rotations
- **Source page type:** OFFICIAL_DEPARTMENT_PAGE (via residency program page)
- **Listing role:** PUBLIC_OPPORTUNITY (pending review)
- **IMG eligibility:** Not explicit
- **Note:** Application method and direct student path unclear; found via AMA FREIDA index
- **P97 status:** NEEDS_MANUAL_REVIEW
- **P99-0 classification:** PUBLIC_WITH_UNKNOWN_FIELDS ← too permissive
- **Corrected:** NEEDS_REVIEW

---

### ME-015 — CMHC Family Medicine Sub-Internship
- **Source page type:** SPECIALTY_PAGE
- **Listing role:** PUBLIC_OPPORTUNITY
- **IMG eligibility:** US/Canadian/International explicitly — **ACCEPTED**
- **Audience:** IMG-relevant, Caribbean-status unknown but "international" implies broad
- **P99-0 classification:** READY_PUBLIC ← correct
- **Corrected:** READY_PUBLIC_IMG_RELEVANT

---

### ME-016 to ME-021 — CMHC EM, OB/GYN, Pediatrics, Surgery, IM, Rural FM
- **Source page type:** SPECIALTY_PAGE
- **Listing role:** PUBLIC_OPPORTUNITY
- **IMG eligibility:** International MS accepted — **ACCEPTED**
- **Application:** Smartsheet (shared URL for all CMHC specialties)
- **P99-0 classification:** READY_PUBLIC ← correct but missing audience specificity
- **Corrected:** READY_PUBLIC_IMG_RELEVANT

---

## Summary of Corrections

| ID | P99-0 status | Corrected display_bucket | Key reason |
|---|---|---|---|
| ME-001 | READY_PUBLIC | SUPPORTING_SOURCE_ONLY | Policy hub, not opportunity card |
| ME-002 | PUBLIC_WITH_UNKNOWN_FIELDS | SUPPORTING_SOURCE_ONLY | Affiliation-routed, no direct application |
| ME-003 | READY_PUBLIC | SUPPORTING_SOURCE_ONLY | CMHC umbrella hub |
| ME-004 | READY_PUBLIC | READY_PUBLIC_US_STUDENT_ONLY | LCME/AAMC US-only |
| ME-005 | PUBLIC_WITH_UNKNOWN_FIELDS | PUBLIC_BUT_IMG_EXCLUDED | LCME via VSLO = NO for IMG |
| ME-006 | READY_PUBLIC | READY_PUBLIC_US_STUDENT_ONLY | LCME/AOA explicitly |
| ME-007 | READY_PUBLIC | READY_PUBLIC_US_STUDENT_ONLY | LCME/AOACOA explicitly |
| ME-008 | PUBLIC_WITH_UNKNOWN_FIELDS | PUBLIC_BUT_IMG_EXCLUDED | LCME via VSLO = NO for IMG |
| ME-009 | PUBLIC_WITH_UNKNOWN_FIELDS | NEEDS_REVIEW | "Nationwide" ambiguous; VSLO hub policy unclear |
| ME-010 | PUBLIC_WITH_UNKNOWN_FIELDS | NEEDS_REVIEW | P97 NEEDS_MANUAL_REVIEW; sub-page unconfirmed |
| ME-011 | PUBLIC_WITH_UNKNOWN_FIELDS | NEEDS_REVIEW | P97 NEEDS_MANUAL_REVIEW; sub-page unconfirmed |
| ME-013 | PUBLIC_WITH_UNKNOWN_FIELDS | PUBLIC_WITH_IMG_UNKNOWN | Broad eligibility but IMG graduate not explicit |
| ME-014 | PUBLIC_WITH_UNKNOWN_FIELDS | NEEDS_REVIEW | Residency-department page; application path unclear |
| ME-015 | READY_PUBLIC | READY_PUBLIC_IMG_RELEVANT | International explicitly accepted |
| ME-016 | READY_PUBLIC | READY_PUBLIC_IMG_RELEVANT | International MS accepted |
| ME-017 | READY_PUBLIC | READY_PUBLIC_IMG_RELEVANT | International MS accepted |
| ME-018 | READY_PUBLIC | READY_PUBLIC_IMG_RELEVANT | International MS accepted |
| ME-019 | READY_PUBLIC | READY_PUBLIC_IMG_RELEVANT | International MS accepted |
| ME-020 | READY_PUBLIC | READY_PUBLIC_IMG_RELEVANT | International MS accepted |
| ME-021 | READY_PUBLIC | READY_PUBLIC_IMG_RELEVANT | International MS accepted |

---

## Corrected Count by Display Bucket

| Bucket | Count | Notes |
|---|---|---|
| READY_PUBLIC_IMG_RELEVANT | 7 | CMHC specialties (ME-015–021) |
| READY_PUBLIC_US_STUDENT_ONLY | 3 | MMC GenSurg, Anesthesia, IR (ME-004/006/007) |
| PUBLIC_BUT_IMG_EXCLUDED | 2 | MMC EM, FM (ME-005/008) |
| PUBLIC_WITH_IMG_UNKNOWN | 1 | EMMC Observership (ME-013) |
| NEEDS_REVIEW | 4 | ME-009/010/011/014 |
| SUPPORTING_SOURCE_ONLY | 3 | ME-001/002/003 |

**True public opportunity cards (non-supporting, non-review): 13**  
**IMG-relevant cards: 7**  
**US-student-only cards: 5**  
**Unknown/needs review: 5 (not shown to users until resolved)**

---

## Hard Gates Identified

1. **Hub pages are not opportunity cards** unless they have a direct application path AND are the only record for that institution (no specialty sub-listings exist).
2. **LCME-only = IMG excluded.** Any record that routes through VSLO or is restricted to LCME/AOA/AAMC-accredited US schools must carry `public_ready_img_graduate: false` and `public_ready_caribbean_student: false`.
3. **P97 NEEDS_MANUAL_REVIEW = NEEDS_REVIEW** in the scorer. The P99-0 scorer ignored this signal.
4. **"International MS accepted" ≠ "IMG graduate accepted."** A student currently enrolled in an international medical school is different from an IMG who has already graduated. Cards marked IMG_RELEVANT here cover current international MS; whether IMG graduates (post-graduation) qualify is not stated and defaults to UNKNOWN_NOT_STATED.
5. **Specialty pages with no per-page eligibility statement** inherit hub policy for restrictions (LCME-only propagates down) but do NOT inherit hub-level acceptances (cannot infer IMG-ok from a general page).
