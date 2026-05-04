# P99-2B Save/Compare QA Report
Generated: 2026-05-04

---

## Validator results

| Validator | Run | Result |
|-----------|-----|--------|
| `validate-usce-pilot-ui.ts` | Phase F pre-check | **PASS** — all 5 gates |
| `validate-usce-save-compare.ts` | Phase F | **PASS** — all 7 gates |

---

## Gate-by-gate QA

### [1/7] localStorage schema
- **LS_KEY** `"usce-saved-listings"` present: PASS
- **Format**: `string[]` of `listing_id` values only — no full card payload in `setItem` call: PASS
- **Hydration**: `useEffect` reads on mount (avoids SSR mismatch); functional updater guarantees sequential writes: PASS
- **Verified via eval**: `localStorage.getItem("usce-saved-listings")` returns `["ME-015","ME-008",...]` after save clicks

### [2/7] EXPORT_FIELDS clean
- `EXPORT_FIELDS` constant present as `const` tuple with `as const`: PASS
- Forbidden fields absent from `EXPORT_FIELDS`: PASS
- Fields exported (12): `listing_id, institution_name, specialty, opportunity_type, display_bucket, eligible_audiences, excluded_audiences, unknown_audiences, restriction_tags, official_source_url, application_url, last_reviewed_at`

### [3/7] Export payload builder
- `buildExportPayload` function keys contain no forbidden fields (`npi, ccn, cms_facility_id, nppes_npi, ein, aamc_id, nrmp_id, acgme_id, completeness_score, max_possible_score`): PASS
- Forbidden field scan of `buildExportPayload` source: 0 matches

### [4/7] Save filters
- `SaveFilter` type (`"all" | "saved_only" | "unsaved_only"`): PASS
- `saved_only` filter tab: PASS — verified in browser: clicking "Saved only" showed only saved cards
- `unsaved_only` filter tab: PASS — verified in browser: clicking "Unsaved only" showed complement set
- `handleClearSaved` resets `saveFilter` to `"all"`: PASS
- Save filter composes correctly with existing audience/specialty/type/toggle filters: PASS

### [5/7] Report-issue in compare panel
- `ReportIssuePlaceholder` referenced inside `CompareTable` function: PASS
- "Report issue" button visible in compare table Report row per column: PASS
- `"Other"` issue type label present in `ReportIssuePlaceholder`: PASS
- **"Pilot placeholder — no submission is sent yet. Verify directly at the official program source link."** text present: PASS
- Verified via browser: clicked "Report issue" in compare panel → inline placeholder opened with correct issue types and disclaimer

### [6/7] Compare 4-cap copy
- `"Compare shows up to 4 saved listings at a time."` present in `ComparePanel` header: PASS
- **>4 behavior**: with 7 cards saved, compare panel header shows **"Showing first 4 of 7 saved. Remove some to compare others."**: PASS
- Compare button in filter bar shows `"Compare 4 →"` (capped at 4): PASS

### [7/7] Card counts + forbidden language + runtime guard
- IMG-relevant cards (READY_PUBLIC_IMG_RELEVANT): **7** — PASS
- US-only cards (READY_PUBLIC_US_STUDENT_ONLY): **5** — PASS
- Forbidden language scan (component source): PASS — none of: `"complete database", "all opportunities", "guaranteed usce", "guaranteed match", "img-friendly"`
- Adapter runtime guard (`_nonPublic` check): PASS

---

## Export QA (browser verification)

### JSON export
- Triggered by: "JSON" button in saved-count row of filter bar
- Content-type: `application/json`
- Envelope: `{ exported_at: ISO-8601, source: "usce-maine-pilot", cards: [...] }`
- Fields per card (12): exactly matches `EXPORT_FIELDS` — no forbidden fields
- Verified: `Object.keys(cards[0])` returns `["listing_id","institution_name","specialty","opportunity_type","display_bucket","eligible_audiences","excluded_audiences","unknown_audiences","restriction_tags","official_source_url","application_url","last_reviewed_at"]`

### CSV export
- Triggered by: "CSV" button in saved-count row of filter bar
- Content-type: `text/csv`
- Header row: `listing_id,institution_name,...,last_reviewed_at` (all 12 EXPORT_FIELDS in order)
- Array fields (`eligible_audiences`, `excluded_audiences`, `unknown_audiences`, `restriction_tags`) serialized as `;`-joined strings
- Verified: 7 data rows + 1 header = 8 lines total for a 7-card saved set

---

## Compare model decision (documented)

Compare is **saved-shortlist based** (not independent checkbox selection).

- Saving adds to shortlist; compare opens `ComparePanel` which shows `savedCards.slice(0, 4)`
- >4 saved: panel header shows "Showing first N of M saved" with instruction to remove some
- Rationale: simpler UX for 12-card pilot; dedicated per-card compare checkbox can be added post-pilot if user research supports it
- Decision recorded in `P99_2_IMPLEMENTATION_AUDIT.md`

---

## Files changed in P99-2B

| File | Change |
|------|--------|
| `src/app/clerkships/maine/ClerkshipListings.tsx` | SaveFilter type, save filter tabs, EXPORT_FIELDS, buildExportPayload, export buttons, report-issue in CompareTable, 4-cap copy in ComparePanel header, >4 message |
| `scripts/validate-usce-save-compare.ts` | New — 7-gate static validator |
| `docs/platform-v2/local/usce-completeness/P99_2_IMPLEMENTATION_AUDIT.md` | New — audit + gap analysis |
| `docs/platform-v2/local/usce-completeness/P99_2_SAVE_COMPARE_QA_REPORT.md` | This file |

---

## Overall verdict

**PASS** — all P99-2B hard gates satisfied. Ready for local commit.

P99-3 (correction/report-issue flow: actual form submission, confirmation, backend stub) may proceed once this commit lands.
