# P102 Clean Shape A+C PR Readiness Report

Generated: 2026-05-17
Clean PR branch: `local/p102-shape-a-c-pr-ready`
Branch HEAD: `332bf11` (P102: regenerate legacy preview from display eligibility)

**No push. No PR opened. No deploy. No DB / schema / seed mutation. Shape B explicitly excluded — preserved on its own branch `local/p102-shape-b-queued-cutover` at commit `8c95097`.**

---

## 1. Branch split (what changed)

| Branch | HEAD | Contents | Status |
|---|---|---|---|
| `local/p102-browse-shape-a-cutover` | `8c95097` | Shape A + Shape C + Shape B queued migration | Working branch from prior turn; superseded for PR purposes |
| **`local/p102-shape-a-c-pr-ready`** | **`332bf11`** | **Shape A + Shape C only** | **This branch is PR-ready** |
| `local/p102-shape-b-queued-cutover` | `8c95097` | Shape B queued migration + cutover playbook + Shape B validator | Preserved for a future DB cutover discussion |

Verified that none of these Shape B-only artifacts exist on the clean branch:
- `prisma/migrations/20260517000000_p102_shape_b_display_eligibility_columns/migration.sql` — absent ✓
- `scripts/p102-validate-shape-b-seed-coverage.ts` — absent ✓
- `docs/.../p102/P102_SHAPE_B_CUTOVER_PLAYBOOK.md` — absent ✓

The Shape B comment-block edits to `prisma/schema.prisma`, `prisma/seed.ts`, `src/app/browse/page.tsx`, `src/app/listing/[id]/page.tsx`, `src/components/listings/listing-card.tsx` are also reverted on the clean branch (the files are at their Shape A+C state).

---

## 2. Files changed (relative to production trunk `739ab1e`)

Code:

| Path | Reason |
|---|---|
| `src/components/listings/listing-card.tsx` | +2 optional props (`sourceBadge`, `specialtyLimited`) + SOURCE pill + SPECIALTY pill in the footer-badge row. Existing callers unaffected. |
| `src/app/browse/page.tsx` | Truth-layer filter (`title IN getActiveDisplayProgramNames()`), per-row adapter enrichment, `?specialty=only` query param. |
| `src/app/listing/[id]/page.tsx` | Truth-layer enrichment in the header; new "Source link" section in the left column with `target="_blank"` Verify CTA + evidence-quote blockquote. |
| `src/app/usce/verified-preview/page.tsx` | Rewritten to consume the display-eligibility adapter and reuse `<BrowseCard>`. Drift-elimination from 79-row legacy snapshot to 176-row truth layer. |
| `src/app/usce/verified-preview/display-readiness/page.tsx` + `review/page.tsx` + `review/_actions.ts` + `review/operator-row.tsx` + `display-readiness/page.tsx` (dark-mode fix) | Internal review dashboard + diagnostic. NoIndex. |
| `src/app/usce/verified-preview/browse/page.tsx` + `[slug]/page.tsx` + `browse-card.tsx` + `badge-styles.ts` | Sandbox browse preview. NoIndex. |
| `src/lib/p102-display-eligible-listings.ts` | The truth-layer adapter — 8 accessors + slug helpers. |
| `src/lib/p102-operator-review-types.ts` + `p102-operator-review-decisions.ts` | Operator-review JSON store (local-only, server actions throw in prod). |

Dataset / classifier / exports (P102 link-truth audit work; all in prior commits):

| Path | Reason |
|---|---|
| `prisma/verified-links.ts` | 200 institution URL overrides + the `specialtyLimited` optional field |
| `prisma/listings-hidelist.ts` | 31 hide entries with the new `THIRD_PARTY_BROKER` + `OPERATOR_HIDE_NO_DIRECT_URL` classifications |
| `scripts/p102-classify-live-listings-per-type.ts` | the 11-state classifier (existed prior; unchanged shape) |
| `scripts/p102-build-display-eligibility-export.ts` | builds the 7 display-eligibility JSON buckets |
| `scripts/p102-validate-display-eligibility-export.ts` | 38 invariants on the export |
| `scripts/p102-validate-browse-shape-a-coverage.ts` | 2 offline + 4 `--with-db` checks; ensures Prisma rows ⊆ active-name set |
| `scripts/p102-validate-preview-truth-layer-parity.ts` | 16 cross-surface invariants |
| `docs/.../p102/exports/` | 7 display-eligibility JSON files + summary md + classifier outputs |
| `docs/.../p102/` various reports + plans + audits | docs only |

Not in this PR (by design):
- `prisma/schema.prisma` — unchanged (Shape B's column additions deferred)
- `prisma/seed.ts` — unchanged (Shape B's column writes deferred)
- All Shape B migration / playbook / validator — on the other branch

---

## 3. User-facing changes (production `/browse` + `/listing`)

Per the live local dev server on this clean branch:

### `/browse` (production route)

- Filters the Prisma `listing.findMany` to the operator-approved active-name set (`getActiveDisplayProgramNames()`), so rows the truth layer doesn't recognise are excluded even if they're still APPROVED in the DB.
- Renders **176 listings** (167 clinical USCE + 9 research). Counts match the truth layer exactly.
- Every active card carries one of four SOURCE pills: **DIRECT** / **REORIENTED** / **PROTECTED** / **RESEARCH**.
- Specialty-limited rows (BronxCare, Carolinas) carry an additional fuchsia **SPECIALTY: …** pill.
- New `?specialty=only` query param shows only the 2 specialty-limited rows. Other existing query params (`search`, `category`, `type`, `audience`, `state`, `sort`, `free`, `visa`, `verified`) still work unchanged.

### `/listing/[id]` (production detail route)

- New SOURCE pill + SPECIALTY pill in the header next to the existing type/certificate/visa badges.
- New "Source link" section in the left column above `<TrustBadges>`:
  - Verified `finalUrl` rendered as a clickable link
  - "Verify on official source" outbound button (`target="_blank"` per operator decision)
  - Evidence quote in a blockquote
- All existing components preserved: `<TrustBadges>`, `<ListingTrustMetadata>`, Apply Now, Cost, Save, Reviews, FlagButton, ShareButtons.

### Internal preview routes (all `noindex`)

- `/usce/verified-preview` — drift eliminated; now sources from display-eligibility adapter, 176 rows, truth-layer SOURCE vocabulary.
- `/usce/verified-preview/browse` — sandbox browse preview (new in this PR).
- `/usce/verified-preview/browse/[slug]` — sandbox detail (new).
- `/usce/verified-preview/display-readiness` — diagnostic counts (new).
- `/usce/verified-preview/display-readiness/review` — per-row operator review dashboard (new). Server Actions throw in production.
- `/usce/verified-preview/[rowId]` — legacy snapshot detail (untouched).
- `/usce/verified-preview/admin/*` — legacy reviewer flow (untouched).

---

## 4. Counts (verified via DOM on local dev)

| Bucket | Count |
|---|---:|
| Clinical USCE display-eligible | **167** |
| Research display-eligible | **9** |
| **Active display total** | **176** |
| Hidden | 30 |
| Negative-info archive | 1 |
| Held (outreach + research-reverify + manual-browser) | 0 |
| Specialty-limited | 2 |
| Total data.js rows | 207 |

Live `/browse` (DOM probe on this branch):
- `<h1>`: "Browse Opportunities"
- Counter: "176 listings found"
- 176 cards rendered
- 176 SOURCE pills
- 2 SPECIALTY pills

Live `/browse?specialty=only`: 2 cards.

---

## 5. Safety checks

| Check | Result |
|---|---|
| Hidden / broker / dead rows render on `/browse` | **none** (programmatic scan) |
| Negative-info row (Cook County) renders on `/browse` | **none** |
| Held rows (Jamaica ×2, Richmond, Advocate Christ ×2, Mayo Research, etc.) render on `/browse` | **none** |
| Research rows mixed into clinical count | **no** — separated by lane in adapter + preview |
| Fake "hospital-approved" / "official database" / "guaranteed" / "best" / "top-rated" copy added | **none** — searched all changed files |
| SEO / sitemap / robots / canonical / JSON-LD changes | **none** |
| Homepage changes | **none** |
| DB / schema / seed mutation | **none** |
| `data.js` mutation | **none** (sibling repo) |
| `/career`, `/residency`, `/fellowship` mutation | **none** |
| Push / deploy / PR execution | **none** in this commit |

---

## 6. QA commands and results (this branch, this turn)

```
npx prisma generate                                       OK
npx tsx scripts/p102-classify-live-listings-per-type.ts   clean run, 207 rows
npx tsx scripts/p102-build-display-eligibility-export.ts  207-row sum
npx tsx scripts/p102-validate-display-eligibility-export.ts  38/38 PASS
npx tsx scripts/p102-validate-browse-shape-a-coverage.ts   2/2 PASS
npx tsx scripts/p102-validate-preview-truth-layer-parity.ts 16/16 PASS
npx tsx scripts/validate-no-secrets.ts                     PASS (6485 files)
npx tsc --noEmit                                           clean
npm run build                                              exit 0; all routes registered
```

Production routes registered in `npm run build` output:
- `ƒ /browse` (Dynamic)
- `ƒ /listing/[id]` (Dynamic)
- `ƒ /usce/verified-preview` (Dynamic)
- `ƒ /usce/verified-preview/[rowId]` (Dynamic)
- `ƒ /usce/verified-preview/admin/review` (Dynamic)
- `ƒ /usce/verified-preview/admin/review/[reviewId]` (Dynamic)
- `ƒ /usce/verified-preview/browse` (Dynamic)
- `ƒ /usce/verified-preview/browse/[slug]` (Dynamic)
- `ƒ /usce/verified-preview/display-readiness` (Dynamic)
- `ƒ /usce/verified-preview/display-readiness/review` (Dynamic)

---

## 7. Visual smoke test results

DOM probes via Claude Preview MCP (port 3000, dev server):

| Surface | HTTP | Key probe |
|---|---:|---|
| `/browse` | 200 | 176 cards · 176 SOURCE pills · 2 SPECIALTY pills · counter "176 listings found" |
| `/browse?specialty=only` | 200 | 2 cards |
| `/usce/verified-preview` | 200 | (truth-layer rendering; no stale "Reviewed/Exact seed/Intelligent gate" badges) |
| `/usce/verified-preview/browse` | 200 | (sandbox; 176 rows) |
| `/usce/verified-preview/display-readiness` | 200 | (diagnostic counts banner) |

Status: **NOT NEEDS_BROWSER_RETRY.** Spot-checks captured in this session.

---

## 8. Rollback plan

If the PR has to be reverted post-merge:

```bash
# Revert the PR's merge commit; depending on PR settings, either:
git revert -m 1 <MERGE_COMMIT_SHA>
# OR for a squash-merge:
git revert <SQUASH_COMMIT_SHA>
```

What gets restored:
- `/browse` returns to the prior Prisma-only render (no SOURCE / SPECIALTY pills, broader row set possibly including hidden rows the operator wants out).
- `/listing/[id]` loses the source-link section.
- Internal preview surfaces lose their truth-layer integration but stay accessible.

What does NOT need rollback:
- **No DB rollback needed.** This PR did not touch the DB, schema, or seed. Prisma row state is unchanged on production.
- **No data-rights / SEO rollback needed.** No sitemap, robots, canonical, OpenGraph, or JSON-LD change.

Worst-case time-to-rollback: under 5 minutes (revert + redeploy).

---

## 9. PR title + body draft

### Proposed PR title

> P102: Display source-truth layer on browse and regenerate verified preview

### Proposed PR body

```
## Summary

Wires the operator-approved display-eligibility truth layer (built up
across the prior 11-batch link-truth audit) into production `/browse`
and `/listing/[id]`, plus regenerates the legacy `/usce/verified-preview`
surface so it stops drifting from the truth layer.

No DB migration. No schema change. No seed re-run. No SEO change.
Shape B (schema-backed integration) is deliberately on a separate
branch (`local/p102-shape-b-queued-cutover`) for a later discussion.

## Why

Before this PR, `/browse` rendered every APPROVED Prisma listing,
including rows the operator had already flagged as out-of-scope
(broker sites, dead institutions, holds). The legacy
`/usce/verified-preview` surface showed an older 79-row snapshot
with a different SOURCE vocabulary ("Reviewed / Exact seed /
Intelligent gate") than the link-truth audit's 176-row corpus.

## What changed (user-facing)

- `/browse` now filters to the 176 active display-eligible rows.
- Every active card shows a SOURCE pill (DIRECT / REORIENTED /
  PROTECTED / RESEARCH).
- BronxCare and Carolinas show an additional fuchsia SPECIALTY pill.
- New `?specialty=only` query param.
- `/listing/[id]` shows the SOURCE pill + SPECIALTY pill in the
  header, and a new "Source link" section with a `target="_blank"`
  "Verify on official source" CTA + evidence quote.
- `/usce/verified-preview` (internal, noindex) now sources from the
  truth layer — same 176-row corpus as `/browse`.

## What did NOT change

- Prisma schema, seed, DB
- `prisma/verified-links.ts` and `prisma/listings-hidelist.ts` (last
  touched several commits before this PR; unchanged in the PR scope)
- Homepage, `/career`, `/residency`, `/fellowship`
- Sitemap, robots, canonical URLs, JSON-LD, OpenGraph
- `<TrustBadges>` (kept alongside the new SOURCE pill per operator
  decision — different signals)
- Existing `/browse` query params, save/compare/apply/flag behavior
- Legacy `/usce/verified-preview/[rowId]` and admin reviewer routes

## Counts

| Bucket | Count |
|---|---:|
| Clinical USCE | 167 |
| Research | 9 |
| Active display | 176 |
| Hidden | 30 |
| Negative-info archive | 1 |
| Total data.js rows | 207 |

## QA

- `tsc --noEmit` clean
- `npm run build` exit 0
- `p102-validate-display-eligibility-export` 38/38 PASS
- `p102-validate-browse-shape-a-coverage` 2/2 PASS
- `p102-validate-preview-truth-layer-parity` 16/16 PASS
- `validate-no-secrets` PASS
- Live DOM smoke: 176 cards on /browse, 176 SOURCE pills, 2
  SPECIALTY pills, `/browse?specialty=only` = 2 cards.

## Rollback

`git revert` the merge commit. No DB rollback needed — this PR did
not touch the database. Time-to-rollback under 5 minutes.

## Deployment notes

Preview deployment first; spot-check the preview URL across the
five surfaces; production deploy only after explicit approval.

## Follow-ups (not in this PR)

- Shape B schema-backed integration (queued on
  `local/p102-shape-b-queued-cutover`).
- Phone outreach for 3 hidden borderline rows (Jamaica ×2, Richmond)
  to possibly reorient them rather than keep hidden.
- Operator-supplied URLs for the 7 deferred postdoc programs to
  possibly reorient them.
```

---

## 10. Deployment plan (later only)

1. Push branch `local/p102-shape-a-c-pr-ready` (operator action).
2. Open PR via `gh pr create` or GitHub UI (operator action).
3. Vercel preview deployment runs automatically on push (Vercel default behavior; not triggered by Claude).
4. Operator spot-checks the preview URL across all five surfaces.
5. Operator approves PR + merges (operator action).
6. Vercel production deploy runs on merge.
7. Operator smoke-checks production for ~30 minutes.

If anything looks wrong at step 4 or 7: revert merge commit, re-deploy.

---

## 11. Explicit constraints honored in this branch

- No `git push` from this branch.
- No `vercel deploy` / `vercel --prod`.
- No `gh pr create`.
- No `prisma migrate deploy` / `db push` / `migrate dev`.
- No `data.js` mutation.
- No homepage, SEO, sitemap, robots, canonical, JSON-LD, OpenGraph mutation.
- No Shape B artifacts present on this branch.
- All commits in branch history are reversible by `git revert`.

---

## 12. Next-step menu

| | Choice | Status |
|---|---|---|
| A | Operator pushes branch + opens PR via `gh pr create` | gated on operator |
| B | Operator does additional manual visual QA across the 5 surfaces | optional, recommended |
| C | Defer; spend more time on side tasks (phone outreach / research URLs) | available |
| D | Pursue Shape B cutover (on the other branch) | deferred per operator |
