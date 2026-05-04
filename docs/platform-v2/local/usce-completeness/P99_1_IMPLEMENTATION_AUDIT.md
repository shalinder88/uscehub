# P99-1 Implementation Audit

**Date:** 2026-05-04  
**Phase:** A — Pre-QA inspection of P99-1 files  
**Auditor:** automated (this document written before Phase B–H corrections)

---

## Files Created

| File | Role |
|---|---|
| `src/lib/usce-maine-data.ts` | Data adapter — typed static export of 12 public cards |
| `src/app/clerkships/maine/page.tsx` | Server component — metadata + hero + renders ClerkshipListings |
| `src/app/clerkships/maine/ClerkshipListings.tsx` | Client component — filter tabs, institution groups, cards |

No shared UI components touched beyond existing `Badge`, `Button` from `src/components/ui/`.

---

## Page Route

`/clerkships/maine` — static (no `force-dynamic`, no DB query, no server action)

---

## Data Adapter

**Source read:** `src/lib/usce-maine-data.ts` is hand-transcribed from `public_listing_cards_preview_v2.json`. It does NOT read the JSON at runtime — it embeds the data as a typed constant.

**Filtering at module level:**
- 12 cards exported: 7 `READY_PUBLIC_IMG_RELEVANT`, 5 `READY_PUBLIC_US_STUDENT_ONLY`
- NEEDS_REVIEW (5 cards) absent from module — confirmed by card count
- SUPPORTING_SOURCE_ONLY (3 hub pages) absent — confirmed by card count

**Fields exposed (current):**

| Field | Present | Allowed |
|---|---|---|
| listing_id | Yes | Yes |
| institution_name | Yes | Yes |
| state | Yes | Yes |
| county | Yes | Yes |
| specialty | Yes | Yes |
| opportunity_type | Yes | Yes |
| display_bucket | Yes | Yes |
| eligible_audiences | Yes | Yes |
| excluded_audiences | Yes | Yes |
| unknown_audiences | Yes | Yes |
| restriction_tags | Yes | Yes |
| audience_detail | Yes | Yes |
| application_url | Yes | Yes |
| official_source_url | Yes | Yes |
| completeness_score | Yes | **REVIEW** — internal scoring field, not shown in UI but present in export |
| max_possible_score | Yes | **REVIEW** — same |
| unknown_fields | Yes | **REVIEW** — internal, not shown in UI |
| last_reviewed_at | Yes | Yes |
| source_page_type | **No** | Yes — missing from adapter |
| listing_role | **No** | Yes — missing from adapter |
| source_status | **No** | Yes — missing from adapter |
| fit_warnings | **No** | Yes — missing from adapter |
| NPI | No | — |
| CCN | No | — |
| CMS raw | No | — |
| NPPES raw | No | — |

**Gaps identified:**
1. `source_page_type`, `listing_role`, `source_status`, `fit_warnings` missing from interface and card data
2. `completeness_score`, `max_possible_score`, `unknown_fields` present but are internal scoring artifacts — not shown in UI, but should be removed from the public adapter

---

## UI — Passes

- [x] CMHC section leads (IMG-relevant first)
- [x] MMC section separate (US-only)
- [x] NEEDS_REVIEW cards not rendered
- [x] SUPPORTING_SOURCE not rendered
- [x] POLICY_HUB not rendered as opportunity
- [x] Audience filter: All / International-eligible / US MD/DO only
- [x] IMG filter returns exactly 7
- [x] US filter returns exactly 5
- [x] IMG filter never includes MMC US-only cards
- [x] US-only section never includes CMHC IMG-relevant cards
- [x] Unknown audiences visible on CMHC cards (amber ? + "not stated by program")
- [x] VSLO badge visible on ME-005, ME-006, ME-008
- [x] Excluded audiences struck through with red X
- [x] No "complete database" language
- [x] No NPI/CCN/CMS/NPPES fields in render

---

## UI — Gaps (corrected in Phase B–H)

- [ ] No specialty filter
- [ ] No opportunity type filter
- [ ] No VSLO restriction filter
- [ ] No unknown eligibility filter
- [ ] No `last_reviewed_at` display on cards
- [ ] No `fit_warnings` display on cards
- [ ] No report issue placeholder
- [ ] Pilot disclaimer in hero is too brief ("Pilot cohort" only)
- [ ] No source_status display
- [ ] `completeness_score` / `max_possible_score` / `unknown_fields` in adapter but should be dropped

---

## Forbidden Field Scan

Grep for NPI, CCN, CMS, NPPES, AAMC, NRMP, ACGME in all three files:

```
usce-maine-data.ts:     0 matches
page.tsx:               0 matches
ClerkshipListings.tsx:  0 matches
```

Clean.

---

## Forbidden Language Scan

Grep for "complete database", "all opportunities", "guaranteed", "IMG-friendly" in all three files:

```
usce-maine-data.ts:     0 matches
page.tsx:               0 matches
ClerkshipListings.tsx:  0 matches
```

Clean.

---

## Static vs Dynamic

Page is static. No Prisma import, no `force-dynamic`, no `revalidate`. Data is embedded in the module. Correct for pilot.

---

## Summary

The P99-1 foundation is structurally correct. 12 cards, 7/5 split, correct audience segregation, no forbidden fields. Three filters work. Missing: secondary filters (specialty/type/VSLO/unknown), card-level last_reviewed + fit_warnings, report issue placeholder, stronger pilot language, source_status in adapter.

Corrections applied in Phase B–H pass documented in `P99_1_UI_QA_REPORT.md`.
