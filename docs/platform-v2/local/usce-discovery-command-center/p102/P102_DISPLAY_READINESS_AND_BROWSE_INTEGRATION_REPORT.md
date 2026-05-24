# P102 Display Readiness Visual QA + Browse Integration Report

Generated: 2026-05-17
Branch: `local/p102-display-readiness-visual-qa`
Parent: `38f9802` (display-readiness reconciliation)
This branch HEAD: pending Phase H commit

**No push. No deploy. No PR. No production DB mutation. No schema migration. No production seed run. No `/browse` mutation. No SEO change.**

---

## 1. Summary

The display-readiness preview at `/usce/verified-preview/display-
readiness` was visually QA'd against the parent commit `38f9802`. A
real dark-mode contrast defect was found and fixed in this sprint. The
production-`/browse` data flow was audited; a read-side display-
eligibility adapter was built (no DB, no schema, no production-route
mutation). Three new docs document the QA result, the browse
integration plan, and this consolidated report.

## 2. Files changed in this sprint

| Path | Kind | Reason |
|---|---|---|
| `src/app/usce/verified-preview/display-readiness/page.tsx` | UI fix | Added `dark:` text/border/bg variants throughout the page and the `HoldList` component to fix the near-black-on-near-black contrast defect on dark mode. |
| `docs/.../p102/P102_DISPLAY_READINESS_VISUAL_QA.md` | doc | Per-section QA result: counts verified, clinical sample inspected, leakage check programmatic + page-text scan, mobile layout confirmed, source-trust copy reviewed, defect log including the dark-mode fix. |
| `docs/.../p102/P102_BROWSE_LISTING_INTEGRATION_PLAN.md` | doc | Plan for integrating the display-eligibility export into the production `/browse` and `/listing/[id]` surfaces. Three shapes laid out (read-side adapter → schema-backed → snapshot regen). Recommends Shape A first. |
| `docs/.../p102/P102_DISPLAY_READINESS_AND_BROWSE_INTEGRATION_REPORT.md` | doc | This report. |
| `src/lib/p102-display-eligible-listings.ts` | adapter | Local-only read-side adapter that loads the 7 display-eligibility exports and exposes `getDisplayEligibleClinical()`, `getDisplayEligibleResearch()`, `getActiveDisplayProgramNames()`, `getNotActiveDisplayProgramNames()`, `findDisplayEligibleByName()`, `getDisplayEligibilityCounts()`, `getDisplayCards()`, and a `DisplayCardShape` type with honest sentinel fallbacks for unknown fields. Not wired to production `/browse`. |

No changes to `prisma/`, the seed, the schema, or any production route.

## 3. Counts at this commit

| Bucket | Count |
|---|---:|
| Clinical USCE display eligible | **170** |
| Research display eligible | **9** |
| Outreach hold | 3 |
| Research reverify hold | 7 |
| Manual browser hold | 3 |
| Hidden / removed | 14 |
| Archive (negative info) | 1 |
| **Total** | **207** |

Active display (clinical + research): **179**
Held (outreach + research-reverify + manual-browser): **13**
Not active (hidden + archive): **15**

Clinical badge distribution: DIRECT 105, REORIENTED 63, PROTECTED 2.

Adapter smoke test (programmatic):
- `getActiveDisplayProgramNames().size` = 168 (179 rows; 11 duplicate
  names where data.js has multiple entries per institution)
- `getNotActiveDisplayProgramNames().size` = 25 (28 rows; 3 duplicate
  names — Jamaica ×2, Advocate Christ ×2, Flushing ×2)
- `getDisplayCards('clinical').length` = 170
- `findDisplayEligibleByName('Mayo Clinic — Research Fellowship')` →
  `RESEARCH_REVERIFY_HOLD` (correctly held, not displayed as research-
  eligible)

## 4. Visual QA result

**PASS.** Counts on the rendered page match the exports and the
reconciliation doc. Leakage check (programmatic scan of the rendered
DOM for every forbidden institution name) returned zero forbidden
rows in the active display. No "official database" / "hospital-
approved" / "guaranteed" / "best-rated" language. Meta robots
`noindex, nofollow, nocache`.

One defect found and resolved:

**D1 — dark mode contrast (fixed in this sprint).** Computed `<h1>`
color went from `lab(9, …)` (near-black, unreadable on dark navy
body) to `lab(96, …)` (near-white). Same fix applied to `<h2>`, table
cells, hold list entries, footer text, and to the bucket card
internals.

Three open observations (cosmetic, not blocking):
- O1 — could use heavier section-heading font weight to match site
  serif-display style.
- O2 — clinical sample is intentionally truncated to 25 rows; full
  list available in the JSON export.
- O3 — long URLs in the sample table wrap on narrow desktop widths
  (intentional; truncation would obscure provenance).

Pre-existing failure deliberately left unchanged: `p102-validate-
approved-public-safe-export` (6 decision-CSV `APPROVE_PUBLIC_SAFE`
rows missing reviewer/decisionReason). Confirmed present at parent
`38f9802`; unrelated to display readiness.

## 5. Screenshots or NEEDS_BROWSER_RETRY

Captured via Claude Preview MCP in this session at desktop (1280×1600)
and mobile (375×812). Returned as inline JPEGs by the tool; not
persisted to disk because the tool returns base64 inline rather than
file paths. The screenshots informed the defect detection.

Status: **NOT NEEDS_BROWSER_RETRY.** Visual QA completed successfully
in this session.

To re-screenshot manually:

```bash
cd /Users/shelly/usmle-platform
npm run dev
# open http://localhost:3000/usce/verified-preview/display-readiness
# accept ToS modal on first load
# inspect at 1280×1600 desktop and 375×812 mobile
```

## 6. Browse / listing integration findings

Production `/browse` reads Prisma `listing` table directly with a
`status: "APPROVED"` filter and category mapping (`clinical` →
`["OBSERVERSHIP","EXTERNSHIP","ELECTIVE"]`, `research` → `["RESEARCH",
"POSTDOC"]`, `volunteer` → `["VOLUNTEER"]`).

The seed (`prisma/seed.ts`) already consults `VERIFIED_LINKS` for the
URL override and `isHidden()` to skip hide-listed rows, but does NOT
yet capture:
- the 11-state classification (DIRECT / REORIENTED / PROTECTED / …)
- the display-eligibility bucket
- the held-but-not-hidden state (outreach / research-reverify /
  manual-browser) — these currently seed as plain `linkVerified:false`
  rows indistinguishable from "never verified"
- `linkVerificationStatus` enum (in the schema; unused at seed time)

The browse integration plan recommends **Shape A**: add a read-side
adapter (this sprint did that — `src/lib/p102-display-eligible-
listings.ts`) and use it to narrow Prisma queries via `title IN (…)`
filters on a local preview route before touching production `/browse`.

Shape B (schema change with `displayEligibilityBucket` column and seed
re-run) and Shape C (snapshot regeneration into the existing
`/usce/verified-preview` surface) are valid follow-ups, deferred.

## 7. Local adapter status

Built and smoke-tested:

- `src/lib/p102-display-eligible-listings.ts` exports
  `DisplayEligibleRow`, `DisplayBadge`, `DisplayBucket`,
  `DisplayCardShape` types and 8 accessor functions.
- Loads 7 JSON exports lazily and caches in module scope.
- All counts match the exports exactly.
- Field-shape mapping (`toDisplayCard`) inserts honest sentinels
  ("Not listed on source", "Verify on official page", "Check official
  source", "Not clearly listed — check official page") for fields the
  exports don't provide, per `P102_BROWSE_LISTING_INTEGRATION_PLAN.md`
  §6.
- Server-only (uses `node:fs`); not safe in client components.
- Not yet imported by any production route. Ready to wire up in a
  follow-up sprint when the operator approves Shape A.

## 8. QA chain

| Check | Result |
|---|---|
| `scripts/p102-build-display-eligibility-export.ts` | OK — 207 rows |
| `scripts/p102-validate-display-eligibility-export.ts` | PASS — 38/38 |
| `scripts/p102-classify-live-listings-per-type.ts` | OK |
| `scripts/validate-no-secrets.ts` | PASS (6467 files, 0 findings) |
| `tsc --noEmit` | clean (0 errors) |
| `npm run build` | exit 0 — display-readiness route still registered |
| Adapter smoke test (`npx tsx` inline) | OK — all 8 accessors return expected counts/shapes |
| Visual QA at desktop + mobile | PASS — all counts match, no leakage |
| Forbidden-language scan on rendered page | PASS — none found |

## 9. No push / no deploy / no DB mutation confirmation

- No `git push`. Branch `local/p102-display-readiness-visual-qa` is
  local only.
- No `vercel deploy` / `vercel --prod`.
- No `gh pr create`.
- No `prisma db push` / `prisma migrate dev` / `prisma migrate
  deploy`.
- No production seed run.
- No mutation of `prisma/schema.prisma`,
  `prisma/verified-links.ts`, or `prisma/listings-hidelist.ts`
  in this sprint.
- No mutation of the sibling repo at
  `/Users/shelly/usmle-observerships/data.js`.
- No change to `src/app/browse/page.tsx`, `src/app/listing/[id]/
  page.tsx`, `src/components/listings/listing-card.tsx`, homepage,
  sitemap, robots, canonical URLs, JSON-LD, or any SEO metadata
  outside the new preview route's own `noindex` metadata.

The only side effects of this sprint:
1. Three new docs in `docs/platform-v2/local/usce-discovery-command-
   center/p102/`.
2. One small UI fix (dark-mode contrast) in the existing internal
   preview route.
3. One new read-side adapter at `src/lib/p102-display-eligible-
   listings.ts`.
4. Local-only git commit (Phase H).

## 10. Next recommendation

Per the recommendation choices:

- **A. Phone outreach** for Jamaica Hospital (×2) + Richmond
  University Medical Center — settles the 3 outreach holds. Highest
  leverage per minute.
- **B. Operator-supplied URLs** for the 7 RESEARCH_TOO_GENERIC_
  REVERIFY rows.
- **C. Build local `/browse` integration preview** — new route
  `/usce/verified-preview/browse` that uses the adapter built this
  sprint to render the 170 clinical + 9 research rows with the
  existing `<ListingCard>` look and feel. Reuses the dark-mode-safe
  styling pattern established for the display-readiness route. No
  production `/browse` mutation. Quick (~1 sprint).
- **D. Prepare seed/DB integration plan** (Shape B in the integration
  plan) — design the schema change for `displayEligibilityBucket` and
  the seed-side mapping. No mutation. Deferred until Shape A has been
  QA'd.
- **E. Resume discovery** — only after A + B + C have landed.

**Recommended: C after this sprint, with A and B continuing as manual
follow-ups.** That preserves the user's "stop broad searching"
direction while delivering the next concrete display-truth
improvement.
