# P99-3 Data Promotion Audit
Generated: 2026-05-04

---

## Current branch + commit

| | |
|---|---|
| **Branch** | `local/p97-discovery-integrity-guardrails` |
| **Latest commit** | `e200c89` — P99-2B: save filters, export JSON/CSV, compare hardening, report-issue in compare |
| **Note** | All USCEHub UI work (P99-1, P99-2A, P99-2B) lives on this branch. The branch name reflects its origin (P97 discovery guardrails) but it is now the active product branch for USCE pilot. Before any push/PR it should be renamed to `feature/usce-pilot` or `local/usce-pilot-p99`. Do not lose these commits. |

---

## Current runtime data source

The USCE pilot runtime data is **hardcoded** inline in `src/lib/usce-maine-data.ts`.

- The file is 389 lines long.
- Cards are defined as `export const USCE_MAINE_CARDS: UsceCard[] = [...]` starting at line 39.
- **No import from `docs/platform-v2/local/` exists.** The adapter is fully self-contained.
- The `docs/platform-v2/local/usce-completeness/public_listing_cards_preview_v2.json` is consumed only by validators (`validate-usce-public-cards.ts`, `validate-usce-save-compare.ts`) — never at runtime.

This means: the app currently runs from a manually-written copy of the data. The promotion pipeline will replace this with a generated import.

---

## Source file

```
docs/platform-v2/local/usce-completeness/public_listing_cards_preview_v2.json
```

| Bucket | Count |
|--------|-------|
| READY_PUBLIC_IMG_RELEVANT | 7 |
| READY_PUBLIC_US_STUDENT_ONLY | 5 |
| NEEDS_REVIEW | 5 |
| **Total** | **17** |

Public cards: **12** (7 + 5)

Source JSON fields per card (25 total):
```
listing_id, institution_name, campus_name, state, county, city,
specialty, opportunity_type, source_page_type, listing_role,
display_bucket, eligible_audiences, excluded_audiences,
unknown_audiences, restriction_tags, fit_warnings, audience_detail,
application_url, official_source_url, source_status, last_reviewed_at,
completeness_score, max_possible_score, unknown_fields, identity_status
```

Fields to **strip** (forbidden from public runtime):
- `completeness_score` — internal scoring
- `max_possible_score` — internal scoring
- `city` — not in `UsceCard` interface; low-value for pilot
- `county` — in `UsceCard` interface; keep (needed for display)
- `unknown_fields` — internal audit field; strip
- `identity_status` — internal pipeline status (e.g. NPPES_ONLY_CAMPUS_MATCH); strip

Fields to **keep** (allowed):
```
listing_id, institution_name, campus_name, state, county,
specialty, opportunity_type, source_page_type, listing_role,
display_bucket, eligible_audiences, excluded_audiences,
unknown_audiences, restriction_tags, fit_warnings, audience_detail,
application_url, official_source_url, source_status, last_reviewed_at
```

---

## UsceCard interface (current)

Defined in `src/lib/usce-maine-data.ts` lines 12–37:

```typescript
interface UsceCard {
  listing_id: string;
  institution_name: string;
  state: string;
  county: string;
  specialty: string;
  opportunity_type: string;
  source_page_type: string;
  listing_role: string;
  display_bucket: DisplayBucket;
  eligible_audiences: string[];
  excluded_audiences: string[];
  unknown_audiences: string[];
  restriction_tags: string[];
  fit_warnings: string[];
  audience_detail: { us_md_do, international_student, img_graduate, caribbean_student: AudienceStatus };
  application_url: string;
  official_source_url: string;
  source_status: string;
  last_reviewed_at: string;
}
```

Note: `campus_name` is in the source JSON but absent from the current interface. The promotion will add it.

---

## UI behavior to preserve

From P99-1 and P99-2B:

| Feature | Where |
|---------|-------|
| 12-card render | ClerkshipListings.tsx via USCE_MAINE_CARDS |
| Audience filter (all / IMG / US-only) | ClerkshipListings.tsx |
| Specialty + type dropdowns | ClerkshipListings.tsx |
| VSLO toggle + unknown-eligibility toggle | ClerkshipListings.tsx |
| Save filter (all / saved_only / unsaved_only) | ClerkshipListings.tsx |
| localStorage save state | useSavedListings hook |
| Compare panel (up to 4) | ComparePanel / CompareTable |
| JSON/CSV export | buildExportPayload + triggerDownload |
| Report-issue placeholder | ReportIssuePlaceholder |
| Pilot disclaimers | page.tsx + ClerkshipListings.tsx |
| NEEDS_REVIEW count in disclaimer | NEEDS_REVIEW_COUNT constant |
| IMG_RELEVANT_COUNT / US_ONLY_COUNT in page hero | page.tsx |

---

## Files to create / change in P99-3

| File | Action |
|------|--------|
| `src/data/usce/README.md` | Create (Phase B) |
| `src/data/usce/public-listings.generated.json` | Create by promotion script (Phase C) |
| `src/data/usce/public-listings.generated.ts` | Create by promotion script (Phase C) |
| `scripts/usce-data/promote-reviewed-usce-data.ts` | Create (Phase C) |
| `src/lib/usce-maine-data.ts` | Update to import from generated TS (Phase D) |
| `scripts/usce-data/validate-public-runtime-data.ts` | Create (Phase E) |
| `scripts/validate-usce-public-cards.ts` | Update source path if needed (Phase F) |
| `scripts/validate-usce-save-compare.ts` | Update if needed (Phase F) |
| `docs/platform-v2/local/usce-completeness/P99_3_DATA_PROMOTION_REPORT.md` | Create (Phase G) |
