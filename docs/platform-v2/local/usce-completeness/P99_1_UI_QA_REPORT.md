# P99-1 UI QA Report

**Date:** 2026-05-04  
**Branch:** dossier-integration  
**Route:** `/clerkships/maine`  
**Status:** PASSED — all hard gates clean

---

## Files Changed

| File | Change |
|---|---|
| `src/lib/usce-maine-data.ts` | Added `source_page_type`, `listing_role`, `source_status`, `fit_warnings` to interface + card data. Removed `completeness_score`, `max_possible_score`, `unknown_fields` (internal scoring fields). Added runtime guard. Added `IMG_RELEVANT_COUNT`, `US_ONLY_COUNT` exports. |
| `src/app/clerkships/maine/ClerkshipListings.tsx` | Added specialty/type/VSLO/unknown-eligibility filters. Added `last_reviewed_at` + `fit_warnings` + source details to cards. Added expandable detail section. Added report issue placeholder. |
| `src/app/clerkships/maine/page.tsx` | Strengthened pilot disclaimer language in hero. |
| `scripts/validate-usce-pilot-ui.ts` | New: Phase G automated validator. |

---

## Route

`/clerkships/maine` — static, no DB, no `force-dynamic`

---

## Card Counts

| Bucket | Count |
|---|---|
| READY_PUBLIC_IMG_RELEVANT | 7 |
| READY_PUBLIC_US_STUDENT_ONLY | 5 |
| **Total public** | **12** |
| NEEDS_REVIEW (withheld) | 5 |
| SUPPORTING_SOURCE_ONLY (withheld) | 3 |

---

## Filter QA Results

All tested via live preview eval. Results verified by reading DOM state after each React update settled.

| Filter | Expected | Result | Pass |
|---|---|---|---|
| All programs | 12 cards, both institutions | 13 elements (12 + notice), CMHC + MMC headers | PASS |
| International-eligible | 7 CMHC cards only | 8 elements (7 + notice), CMHC only | PASS |
| US MD/DO only | 5 MMC cards only | 6 elements (5 + notice), MMC only | PASS |
| VSLO required toggle | 3 MMC cards (ME-005/006/008) | 4 elements (3 + notice), MMC only | PASS |
| Unknown eligibility toggle | 7 CMHC cards | 8 elements (7 + notice), CMHC only | PASS |
| Specialty: emergency_medicine | 2 cards (ME-016 CMHC + ME-005 MMC) | 3 elements (2 + notice), both institutions | PASS |
| IMG filter never includes US-only | Validator check | PASS (automated) | PASS |
| US-only filter never includes IMG | Validator check | PASS (automated) | PASS |
| NEEDS_REVIEW never surfaced | Validator check | PASS (automated) | PASS |
| POLICY_HUB as opportunity | Validator check | PASS (automated) | PASS |

---

## Forbidden Field Scan

Files scanned: `usce-maine-data.ts`, `ClerkshipListings.tsx`, `page.tsx`

| Pattern | Result |
|---|---|
| npi | CLEAN |
| ccn | CLEAN |
| cms_facility_id | CLEAN |
| nppes_npi | CLEAN |
| ein | CLEAN |
| aamc_id | CLEAN |
| nrmp_id | CLEAN |
| acgme_id | CLEAN |
| completeness_score | REMOVED from adapter |
| max_possible_score | REMOVED from adapter |

---

## Language Scan

| Phrase | Result |
|---|---|
| "complete database" | CLEAN (hero uses "not a complete national database" as disclaimer — negation only) |
| "all opportunities" | CLEAN |
| "guaranteed USCE" | CLEAN |
| "guaranteed eligibility" | CLEAN |
| "IMG-friendly" | CLEAN |

---

## Pilot Disclaimer

Hero contains:
- "Verified pilot · Maine" badge
- "12 listings · source-reviewed" badge  
- "Eligibility is derived from official program pages at time of source review — not inferred, not generalized."
- "This is a source-reviewed pilot cohort, not a complete national database. Listings appear here only after explicit eligibility evidence is found on the institution's own program page. Programs without confirmed eligibility are withheld until reviewed."

---

## Audience Segregation

- CMHC (7) leads: green "Intl. eligible" badges, explicit international acceptance notice, unknown IMG graduate notice
- MMC (5) separate: amber "US MD/DO only" badges, red exclusion notice with LCME/VSLO hub policy explanation
- No cross-contamination between sections confirmed by automated validator and live filter tests

---

## Card-Level Features

Each card shows:
- [x] Specialty name + opportunity type
- [x] VSLO required badge (where applicable)
- [x] IMG excluded badge (where applicable)
- [x] Audience breakdown: US MD/DO / international student / IMG graduate / Caribbean-school student
- [x] Eligible: green checkmark
- [x] Excluded: red X + strikethrough
- [x] Unknown: amber ? + "not stated by program"
- [x] Inline unknown warning for CMHC cards
- [x] Apply button (CMHC cards only — Smartsheet URL)
- [x] Program page button (all cards)
- [x] Expandable details: source type, last reviewed (2026-05-03), listing ID, pilot disclaimer
- [x] Report issue placeholder (radio buttons, no submit, labeled as not yet active)

---

## Validator Results

```
P99-1 Pilot UI Validator:
  [1/5] Source JSON counts       → PASSED (12 public, 7 IMG, 5 US-only)
  [2/5] Audience segregation     → PASSED
  [3/5] Forbidden fields         → PASSED
  [4/5] Forbidden language       → PASSED
  [5/5] Adapter export structure → PASSED
  Overall: PASSED

P99-0A USCE Public Card Validator v2:
  [1/4] Source rights            → PASSED
  [2/4] CMS bridge               → PASSED
  [3/4] USCE v2 card rules       → PASSED (20 listings, 17 cards)
  [4/4] tsc --noEmit             → PASSED
  Overall: PASSED
```

---

## Mobile / Desktop Notes

Preview was captured at narrow viewport. Content confirmed via accessibility tree snapshot:
- Filter tabs wrap correctly on narrow width
- Secondary filter row (selects + toggles) wraps to multiple lines on mobile
- Cards are single-column on mobile, 2-column at sm, 3-column at lg (Tailwind grid)
- Under-review notice spans full width at all breakpoints

---

## Known Limitations

1. **Detail drawer not implemented** — cards have an expandable section with source type, last reviewed, listing ID, and pilot disclaimer. Full drawer (P99-2 scope) deferred.
2. **Report issue form has no submit** — labeled clearly as not yet active. Submission path is P99-3.
3. **Screenshots at desktop width not captured** — preview viewport was narrow; layout verified via accessibility tree snapshot and programmatic DOM inspection instead.
4. **SUPPORTING_SOURCE count is 0 in JSON** — the 3 hub pages (ME-001, ME-002, ME-003) are not in the public card preview JSON. They are excluded at the Python build stage (`build_public_card_preview_v2.py`), not just at render time. This is correct.
5. **"Clear filters" only resets secondary filters** — audience tab state persists when clearing specialty/type/VSLO/unknown toggles. This is intentional UX: clearing secondary doesn't lose your audience choice.

---

## Exact Next Step: P99-2 Save/Compare

Build `src/app/clerkships/maine/compare/` (or a compare drawer on the existing page):
- Save card to localStorage (no auth, no DB)
- Compare 2–4 saved opportunities side by side
- Compare: eligible audiences, excluded audiences, unknowns, restriction tags, application URL, source status, last reviewed
- Clear saved cards button
- No payment, no login, no external service
