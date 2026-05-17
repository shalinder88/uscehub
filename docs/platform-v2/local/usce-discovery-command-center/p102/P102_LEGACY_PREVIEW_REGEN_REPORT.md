# P102 Legacy Preview Regeneration Report

Generated: 2026-05-17
Branch: `local/p102-browse-shape-a-cutover`
Parent commit: `4bf84fb` (Shape A merged)
This branch HEAD: pending Phase H commit

**No push. No deploy. No PR. No DB / schema / seed mutation.**

## 1. Summary

Shape C complete. Legacy `/usce/verified-preview` now reads directly
from the display-eligibility truth layer — same adapter Shape A
wired into production `/browse`. The 79-row drift is eliminated; the
preview now renders the canonical 167 clinical + 9 research = 176
active set with `DIRECT` / `REORIENTED` / `PROTECTED` / `RESEARCH`
SOURCE pills and SPECIALTY badges where present.

## 2. Files changed

| Path | Change |
|---|---|
| `src/app/usce/verified-preview/page.tsx` | rewritten to consume the display-eligibility adapter and reuse the existing `<BrowseCard>` |
| `scripts/p102-validate-preview-truth-layer-parity.ts` | new 16-check parity validator |
| `docs/.../p102/P102_LEGACY_PREVIEW_DRIFT_AUDIT.md` | new audit doc explaining the drift that motivated Shape C |
| `docs/.../p102/P102_LEGACY_PREVIEW_REGEN_REPORT.md` | this report |

Backward compatibility:
- `/usce/verified-preview/[rowId]` — legacy detail route untouched.
- `/usce/verified-preview/admin/*` — admin reviewer flow untouched.
- `src/lib/p102-preview-rows.ts` and `src/lib/p102-approved-usce.ts`
  — still exported; legacy detail + admin import them.
- `src/components/listings/p102-preview-listing-card.tsx` — unused by
  the list page now; left in tree for a separate cleanup pass.

## 3. Previous data source (now retired from the list view)

`getAllPreviewRows()` merging:
1. AUTO_REVIEWED → `src/data/generated/p102-approved-usce.generated.json`
2. EXACT_SEED → `.../exports/exact_seed_public_safe_rows.json`
3. INTELLIGENT_GATE → `.../exports/intelligent_public_safe_rows.json`

Rendered 79 cards with "Reviewed" / "Exact seed" / "Intelligent gate"
SOURCE badges.

## 4. New data source

`@/lib/p102-display-eligible-listings`:
- `getDisplayEligibleClinical()` → 167 rows
- `getDisplayEligibleResearch()` → 9 rows
- `getDisplayEligibilityCounts()` → counts banner

Renders 176 cards across two lanes with `DIRECT` / `REORIENTED` /
`PROTECTED` / `RESEARCH` SOURCE pills and a fuchsia `SPECIALTY: …`
pill where applicable.

## 5. Counts

| Bucket | Count |
|---|---:|
| Clinical USCE (default lane) | **167** |
| Research lane | **9** |
| All active (clinical + research) | **176** |
| Hidden | 30 |
| Archive (negative info) | 1 |
| Specialty-limited | 2 |

DOM-verified via Claude Preview MCP after the cutover:
- Page banner: `167 clinical USCE · 9 research · 31 not displayed (hidden / archived)`
- Lane chips: `Clinical USCE (167)` / `Research (9)` / `All active (176)`
- 167 cards on the default lane
- 167 SOURCE pills, 2 SPECIALTY pills
- Zero rendered cards or copy containing the old `Reviewed` /
  `Exact seed` / `Intelligent gate` vocabulary

## 6. Hidden / archive / hold exclusion result

Programmatic scan via the new parity validator:
- no hidden row leaks into active display ✓
- no archive (negative info) row leaks into active display ✓
- no held row leaks (outreach / research-reverify / manual-browser) ✓

## 7. Parity validator result

`scripts/p102-validate-preview-truth-layer-parity.ts`:
**16/16 PASS.**

Checks include:
- active count = 176
- clinical = 167, research = 9
- no hidden/archive/hold leakage
- specialty-limited count = 2
- GW URL points at `/visiting-students` (not the closed observer page)
- GW subType is visiting-student-elective/clerkship (not observership)
- Hennepin badge is `DIRECT`
- DMC URL points at UME visiting-medical-student-policy
- BronxCare + Carolinas both have `specialtyLimited`
- every active row has a non-empty `finalUrl` (no `#` placeholders)
- every active row's `badge` is in the truth-layer vocabulary
- every research row carries `badge=RESEARCH`

## 8. Visual QA / screenshots

Desktop 1400×1100 screenshot captured via Claude Preview MCP:
- `/usce/verified-preview` shows the new banner, lane chips, filter
  form, and a clean grid of `<BrowseCard>` cards with SOURCE pills.
- Sample cards visible at the top of the page (default clinical lane):
  Abington Hospital — Jefferson Health (DIRECT), Augusta University
  Medical Center MCG (REORIENTED), Banner University Medical Center —
  Tucson (DIRECT), Banner U Arizona (DIRECT), Baptist Health South
  Florida (DIRECT), Barnes-Jewish (DIRECT). All with the truth-layer
  vocabulary, none with the legacy "Reviewed" badge.

Status: NOT NEEDS_BROWSER_RETRY. Captures completed in this session.

## 9. QA chain

| Check | Result |
|---|---|
| `tsc --noEmit` | clean |
| `npm run build` | exit 0 |
| `p102-classify-live-listings-per-type` | clean |
| `p102-build-display-eligibility-export` | 207-row sum |
| `p102-validate-display-eligibility-export` | 38/38 PASS |
| `p102-validate-browse-shape-a-coverage` | 2/2 PASS (offline) |
| `p102-validate-preview-truth-layer-parity` | **16/16 PASS** |
| `validate-no-secrets` | PASS (6484 files, 0 findings) |

## 10. Constraints honored

- No push, no deploy, no PR.
- No DB / schema / seed mutation.
- No `data.js` mutation.
- Homepage, sitemap, robots, canonical URLs, JSON-LD, OpenGraph
  metadata: unchanged.
- `prisma/verified-links.ts` / `prisma/listings-hidelist.ts`:
  unchanged.
- `/browse`, `/listing/[id]`: unchanged in this commit (Shape A
  cutover at `4bf84fb` still in effect).
- Legacy detail `/usce/verified-preview/[rowId]` and admin reviewer
  routes: untouched.

## 11. Recommendation

**A — final visual QA pass** across all four user-visible surfaces
before moving toward PR / deploy. Quick spot-check:

1. `/browse` — 176 rows, SOURCE pills on every card, SPECIALTY pills
   on 2.
2. `/browse?specialty=only` — 2 cards (BronxCare + Carolinas).
3. `/listing/[id]` on any active row — SOURCE + SPECIALTY pills,
   Source link section with `target="_blank"` Verify CTA, evidence
   blockquote.
4. `/usce/verified-preview` — same 176-row truth layer, BrowseCard
   styling.
5. `/usce/verified-preview/display-readiness` — diagnostic counts
   match.

After A, the next decision is whether to prepare a PR / deploy
checklist (Shape B's schema migration remains gated on operator
approval and is still deferred per the operator's A → C → B order).

## 12. Next-step menu

| | Choice | Status |
|---|---|---|
| **A** | **Final visual QA across all 5 surfaces** | **recommended next** |
| B | Production deploy readiness checklist + PR | gated on A |
| C | PR preparation | gated on A |
| D | Phone outreach for the 3 remaining (Jamaica ×2, Richmond) | optional side task; already hidden |
| E | Research URL cleanup (7 deferred postdoc programs) | optional side task; already hidden |
