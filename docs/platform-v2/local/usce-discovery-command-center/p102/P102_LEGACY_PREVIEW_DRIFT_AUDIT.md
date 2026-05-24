# P102 Legacy `/usce/verified-preview` Drift Audit

Generated: 2026-05-17
Branch: `local/p102-browse-shape-a-cutover`
Parent commit: `4bf84fb` (Shape A merged)

---

## 1. Current data source

`src/app/usce/verified-preview/page.tsx` calls
`getAllPreviewRows()` and `getPreviewSummary()` from
`@/lib/p102-preview-rows`.

That adapter merges three sources, in precedence order:

1. **AUTO_REVIEWED** — `src/data/generated/p102-approved-usce.generated.json`
   (a build-time static snapshot from the old approved-export pipeline)
2. **EXACT_SEED** — `docs/.../p102/exports/exact_seed_public_safe_rows.json`
   (rows produced by the older exact-link runner)
3. **INTELLIGENT_GATE** — `docs/.../p102/exports/intelligent_public_safe_rows.json`
   (rows produced by the stage-F intelligent gate)

Each row is tagged with `previewSource` and rendered via
`<P102PreviewListingCard>` with one of three SOURCE badges: `Reviewed`,
`Exact seed`, `Intelligent gate`.

## 2. Current rendered count

DOM-verified via Claude Preview MCP on the live `/usce/verified-preview`:
- **79 cards rendered** on the default lane.
- SOURCE-badge values present: `Reviewed`, `Exact seed`, `Intelligent gate`.
- No DIRECT / REORIENTED / PROTECTED / SPECIALTY badges anywhere.

## 3. Drift vs the truth layer (Shape A)

| Surface | Active count | SOURCE badges | SPECIALTY badges |
|---|---:|---|---:|
| Production `/browse` (Shape A) | **176** | DIRECT / REORIENTED / PROTECTED / RESEARCH | 2 |
| `/usce/verified-preview/display-readiness` | 176 | DIRECT / REORIENTED / PROTECTED / RESEARCH | 2 |
| `/usce/verified-preview/browse` | 176 | DIRECT / REORIENTED / PROTECTED / RESEARCH | 2 |
| **Legacy `/usce/verified-preview`** | **79** | **Reviewed / Exact seed / Intelligent gate** | **0** |

The legacy preview is **off by 97 rows** and uses an entirely different
classification vocabulary.

## 4. Hidden-row leakage risk

The legacy preview's sources predate the link-truth audit's hidelist
expansion. Rows that the operator hid in commits `e859677`, `86b2a62`,
`1467655` (Brooklyn USCE / AMG / ValueMD / SAMS / Allegheny / Conemaugh
/ Crozer / Jamaica / Richmond / Advocate Christ / 7 research-reverify
/ Cook County) may still appear in the legacy preview because the
snapshot was generated before those decisions.

This is a real correctness risk — the legacy preview could surface a
program as `Reviewed` that the operator has already flagged as
out-of-scope.

## 5. Research leakage risk

The legacy snapshot has its own opportunity-type vocabulary
(`OPPORTUNITY_TYPE_LABELS` in `p102-approved-usce.ts`) including
`RESEARCH_OPPORTUNITY`. There's no separation lane — a research row
sits in the same grid as observerships, counted toward the same total.

The truth-layer model treats the 9 research rows as a separate lane
(`getDisplayEligibleResearch()`). Legacy preview does not.

## 6. Badge / copy mismatch

| Surface | Source-badge vocabulary |
|---|---|
| Legacy preview | "Reviewed", "Exact seed", "Intelligent gate" — describes which **pipeline produced the row**, not the URL provenance |
| Truth layer | "DIRECT", "REORIENTED", "PROTECTED", "RESEARCH" — describes **URL quality vs the original data.js link** |

Both are valid signals, but conflating them in one preview surface
confuses anyone trying to reconcile the two.

## 7. Recommended fix

**Rewire `/usce/verified-preview/page.tsx` to render directly from
the display-eligibility adapter** (`@/lib/p102-display-eligible-listings`)
using the same `<BrowseCard>` component already shipped at
`/usce/verified-preview/browse/browse-card.tsx`.

Keep for backward compatibility:
- `/usce/verified-preview/[rowId]/page.tsx` — the legacy detail
  route resolves by snapshot rowId. Operators / admin may still
  open old links. Leave the route intact; it just won't be reachable
  from the new list view.
- `/usce/verified-preview/admin/_actions.ts` + `admin/review/` — the
  admin reviewer flow operates on the snapshot CSV. Leave alone.
- `p102-preview-rows.ts` and `p102-approved-usce.ts` — both libraries
  stay importable so the legacy detail and admin routes keep working.

What changes:
- `src/app/usce/verified-preview/page.tsx`:
  - Drops the three-source merger.
  - Imports `getDisplayEligibleClinical()`, `getDisplayEligibleResearch()`,
    `getDisplayEligibilityCounts()` from the display-eligibility adapter.
  - Imports `<BrowseCard>` from the existing
    `src/app/usce/verified-preview/browse/browse-card.tsx`.
  - Filters: lane (clinical / research), search, state, source badge,
    specialty-limited — same set already wired into
    `/usce/verified-preview/browse`.
  - Counts banner: "176 active · 31 hidden · 1 archived" matching the
    truth layer.
  - Adds a callout linking to the related preview surfaces:
    `/browse` (Shape A production), `/usce/verified-preview/browse`
    (clean-room preview), `/usce/verified-preview/display-readiness`
    (diagnostic).

Result: every preview surface plus production `/browse` reads from one
source of truth. No drift possible.

## 8. Risk of the fix

- The page already has `force-dynamic` and `noindex`, so no SEO
  contract is at risk.
- Existing query params (`audience`, `state`, `type`) need translation
  to the new filter shape. Recommend: support both old and new param
  names for one release, then drop the old vocabulary.
- The `<P102PreviewListingCard>` import becomes unused but the file
  stays in the tree until a separate cleanup PR (small risk of
  breaking the admin/review surface if removed prematurely).

## 9. Out of scope for the regen

- Removing `p102-preview-rows.ts` / `p102-approved-usce.ts` /
  `<P102PreviewListingCard>` — leave for a future cleanup pass.
- Touching the `/usce/verified-preview/admin/*` surfaces.
- Touching the `/usce/verified-preview/[rowId]` legacy detail.
- Production deploy.
