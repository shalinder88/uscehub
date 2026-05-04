# P99-3 Data Promotion Report
Generated: 2026-05-04

---

## Source file

```
docs/platform-v2/local/usce-completeness/public_listing_cards_preview_v2.json
```

17 total cards (12 public + 5 NEEDS_REVIEW withheld)

---

## Generated runtime files

```
src/data/usce/public-listings.generated.json   — promoted public cards (JSON)
src/data/usce/public-listings.generated.ts     — typed export reference (TS)
```

Promotion script: `scripts/usce-data/promote-reviewed-usce-data.ts`

---

## Fields allowed in runtime

| Field | Source |
|-------|--------|
| listing_id | source JSON |
| institution_name | source JSON |
| campus_name | source JSON |
| state | source JSON |
| county | source JSON |
| specialty | source JSON |
| opportunity_type | source JSON |
| source_page_type | source JSON |
| listing_role | source JSON |
| display_bucket | source JSON |
| eligible_audiences | source JSON |
| excluded_audiences | source JSON |
| unknown_audiences | source JSON |
| restriction_tags | source JSON |
| fit_warnings | source JSON |
| audience_detail | source JSON |
| application_url | source JSON |
| official_source_url | source JSON |
| source_status | source JSON |
| last_reviewed_at | source JSON |

## Fields stripped (forbidden)

| Field | Reason |
|-------|--------|
| completeness_score | Internal scoring |
| max_possible_score | Internal scoring |
| identity_status | Internal pipeline status (e.g. NPPES_ONLY_CAMPUS_MATCH) |
| unknown_fields | Internal audit metadata |
| city | Not in UsceCard interface; low-value for pilot |

NPPES, CMS, AAMC, NRMP, ACGME, NUCC fields: not present in source public cards JSON (stripped at
earlier pipeline stage). Forbidden string scan confirmed absence in generated output.

---

## Promotion gate results

| Gate | Result |
|------|--------|
| NEEDS_REVIEW cards withheld | PASS (5 withheld) |
| SUPPORTING_SOURCE_ONLY withheld | PASS (0 in source) |
| POLICY_HUB as opportunity | PASS (0 found) |
| Public card count = 12 | PASS |
| IMG count = 7 | PASS |
| US-only count = 5 | PASS |
| IMG bucket eligibility check | PASS (all 7 have intl signal) |
| US-only bucket exclusion check | PASS (all 5 have exclusion signal) |
| Forbidden field key scan | PASS (0 forbidden keys) |
| Forbidden string scan on output | PASS (0 matches) |

---

## Validator results (all three)

| Validator | Result |
|-----------|--------|
| `scripts/usce-data/validate-public-runtime-data.ts` | **PASS** — 7 gates |
| `scripts/validate-usce-save-compare.ts` | **PASS** — 7 gates + 2 new runtime checks |
| `scripts/validate-usce-public-cards.ts` | **PASS** |

---

## Card counts (verified in browser)

| Audience tab | Count | Source |
|---|---|---|
| All programs | 12 | Generated JSON → adapter → page |
| International-eligible | 7 | Filter of READY_PUBLIC_IMG_RELEVANT |
| US MD/DO only | 5 | Filter of READY_PUBLIC_US_STUDENT_ONLY |

---

## Save/Compare preservation

All P99-2B behaviors preserved after adapter update:

| Feature | Status |
|---------|--------|
| Card list renders 12 cards | PASS |
| Audience filter tabs (12 / 7 / 5) | PASS |
| Specialty + type dropdowns | PASS |
| VSLO / unknown-eligibility toggles | PASS |
| Save filter (All / Saved only / Unsaved only) | PASS |
| localStorage save state | PASS |
| Compare panel (up to 4) | PASS |
| JSON/CSV export | PASS |
| Report-issue placeholder | PASS |
| Pilot disclaimers | PASS |

---

## Do-not-copy-raw-data rule

**Raw files in `docs/platform-v2/local/` must never be imported directly into app runtime.**

The old pattern (hardcoded cards in `usce-maine-data.ts`) is now replaced by a formal promotion
pipeline. The adapter imports only from `src/data/usce/public-listings.generated.json`, which is
produced by a gated promotion script.

Any future data updates follow this path:
1. Update `docs/platform-v2/local/usce-completeness/public_listing_cards_preview_v2.json`
2. Run `npx tsx scripts/usce-data/promote-reviewed-usce-data.ts`
3. Run `npx tsx scripts/usce-data/validate-public-runtime-data.ts`
4. Run all validators
5. Commit generated files + validator results

---

## Next step

P99-4 — correction/report-issue flow (local draft correction intake, no database unless
explicitly decided). The report-issue placeholder in cards and compare panel is wired and visible.
P99-4 turns it into an actual intake form backed by a local/draft correction store.
