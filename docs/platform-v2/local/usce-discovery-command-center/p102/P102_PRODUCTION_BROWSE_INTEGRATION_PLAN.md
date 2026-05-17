# P102 Production `/browse` Integration Plan

Generated: 2026-05-17
Branch: `local/p102-local-browse-preview-from-display-eligibility`
Parent commit: `e8a7ed9`

**Plan only.** No code changes in this sprint. No schema migration, no
seed re-run, no production DB mutation, no `/browse` route mutation,
no homepage, no SEO change, no push, no deploy, no PR.

---

## 1. Goal

Make production `/browse` show only the operator-approved
display-eligibility set:

- **167** clinical USCE listings render as active opportunities
- **9** research listings render in a separate research lane
- **31** hidden / **1** archived row never render as opportunities
- **2** specialty-limited rows display a SPECIALTY badge
- **URLs** always point at the verified-links override, never a
  homepage / dead URL / broker site

Preserve everything that already works on `/browse`: URL shape, query
params, SEO metadata, filters, `<ListingCard>` look, save / compare /
flag flows, sitemap, robots, OpenGraph.

---

## 2. Current data flow

```
usmle-observerships/data.js  (207 PROGRAMS, read-only sibling repo)
        │
        ▼
prisma/seed.ts
   • isHidden(name)     → skip 30 hide-list rows
   • VERIFIED_LINKS[name] → override URL + verified flag
        │
        ▼
prisma.listing  (DB rows; status APPROVED for live)
        │
        ▼
src/app/browse/page.tsx
   • prisma.listing.findMany({ status:"APPROVED", + filters })
   • orderBy: lastVerifiedAt → linkVerified → createdAt
        │
        ▼
<ListingCard> render — Prisma row fields only
```

The DB already has the right *count* of rows (hide list excluded at
seed time), but it does **not** know about:

- the 11-state classification (`DIRECT` / `REORIENTED` / `PROTECTED` / …)
- the display-eligibility bucket (`CLINICAL_USCE` / `RESEARCH` / `HIDDEN` / …)
- the SPECIALTY badge (`BronxCare = Psychiatry`; `Carolinas = Internal Medicine`)
- the per-row evidence quote we captured in `verified-links.ts` notes

The truth layer that knows all of this lives in:
- `prisma/verified-links.ts` (in-repo TypeScript module)
- `prisma/listings-hidelist.ts` (in-repo TypeScript module)
- `docs/.../p102/exports/display_eligible_clinical_usce.json` (filesystem JSON)
- `docs/.../p102/exports/display_eligible_research.json` (filesystem JSON)

Adapter: `src/lib/p102-display-eligible-listings.ts` (already shipped
in commit `904b31f`) exposes everything `/browse` needs to consume.

---

## 3. Field-level gap analysis

`<ListingCard>` reads these props from a Prisma row:

| Card field | Prisma source | Truth-layer source | Gap? |
|---|---|---|---|
| `id` | `Listing.id` | — | use Prisma id for link |
| `title` | `Listing.title` | `programName` (matches) | none |
| `listingType` | `Listing.listingType` enum | `subType` (different vocabulary) | mapping needed |
| `city` | `Listing.city` | — | use Prisma value (came from `data.js.location`) |
| `state` | `Listing.state` | `state` (same) | none |
| `specialty` | `Listing.specialty` | — | use Prisma value (came from `data.js.specialties`) |
| `duration` | `Listing.duration` | — | use Prisma value or honest sentinel |
| `cost` | `Listing.cost` | — | use Prisma value or honest sentinel |
| `shortDescription` | `Listing.shortDescription` | `evidenceQuote` (related) | Prisma value preferred for back-compat; truth layer's `evidenceQuote` for the detail page only |
| `certificateOffered` | `Listing.certificateOffered` | — | use Prisma value |
| `lorPossible` | `Listing.lorPossible` | — | use Prisma value |
| `visaSupport` | `Listing.visaSupport` | — | use Prisma value |
| `linkVerified` | `Listing.linkVerified` (Bool) | `verifiedFlag` (same intent) | already aligned (seed sets it from verified-links) |
| `linkVerificationStatus` | `Listing.linkVerificationStatus` enum | `classification` → enum mapping | mapping table needed (see §5.B) |
| `lastVerifiedAt` | `Listing.lastVerifiedAt` | — | seed never sets this; leave null for now |
| `reviews` | `Listing.reviews` | — | use Prisma value |

New props ListingCard does NOT yet accept but the truth layer wants
to surface:

| Truth-layer field | Where it should render | Action |
|---|---|---|
| `badge` (DIRECT / REORIENTED / PROTECTED) | small pill on card top-right | extend ListingCard with `sourceBadge?: SourceBadge` |
| `specialtyLimited` | fuchsia SPECIALTY pill on card | extend ListingCard with `specialtyLimited?: string` |
| `finalUrl` | outbound "Verify on official source" CTA on detail page | extend listing detail; card itself doesn't need it because card already links to /listing/[id] |
| `evidenceQuote` | source-quote block on detail page | detail page only |
| `provenanceNote` | admin-only or footer | optional |

**Net new card props: 2.** Everything else is already in the DB or
trivially mapped. This is the smallest possible cut.

---

## 4. Three integration shapes

### Shape A — read-side filter + ListingCard enrichment (RECOMMENDED FIRST)

Minimum-invasive cutover. No schema change. No seed re-run. No
production DB mutation.

**What changes**:
1. `src/app/browse/page.tsx` adds an `AND` clause `title IN
   getActiveDisplayProgramNames()` to the Prisma query so any DB row
   not on the truth layer is automatically excluded. (Defense in
   depth — the seed already excludes hide-listed rows but the
   adapter is the canonical source of truth.)
2. `src/app/browse/page.tsx` enriches each Prisma row with `badge`
   and `specialtyLimited` from `findDisplayEligibleByName(title)`.
3. `<ListingCard>` accepts two new optional props (`sourceBadge`,
   `specialtyLimited`) and renders them inline. Existing callers
   pass undefined and render as today.
4. `src/app/listing/[id]/page.tsx` (detail) gets a parallel
   enrichment + renders the SOURCE pill, SPECIALTY pill, evidence
   blockquote, and "Verify on official source" CTA below the title.

**What does NOT change**:
- Prisma schema
- Seed
- Hide-list / verified-links / data.js
- Routes (`/browse`, `/listing/[id]` stay)
- SEO metadata, canonical URLs, sitemap, robots, JSON-LD
- Save / compare / flag / review flows
- `<ListingCard>` layout for rows without the new props
- Production DB state

**Total new code surface**:
- `src/app/browse/page.tsx`: ~10 lines added
- `src/app/listing/[id]/page.tsx`: ~30 lines added (badge + quote block)
- `src/components/listings/listing-card.tsx`: ~15 lines added
- Re-uses `src/lib/p102-display-eligible-listings.ts` (no change needed)

**Cutover steps** (in order):
1. Spike branch `local/p102-browse-shape-a-cutover` from
   `e8a7ed9`.
2. Extend `<ListingCard>` with `sourceBadge?` and `specialtyLimited?`
   props that render below the existing badges. Existing call sites
   continue to work (props are optional).
3. Extend `/browse` to import the adapter, build the active-name
   set once per request, add the `title: { in: [...active] }`
   filter, and pass the two new props to every `<ListingCard>`.
4. Extend `/listing/[id]` similarly: look up via
   `findDisplayEligibleByName(listing.title)`, render the badge +
   quote block + "Verify on official source" CTA. If lookup
   returns null, render the page as today (graceful degradation).
5. Add a small `<ListingDisclaimer>`-adjacent note: "Source-linked.
   Last reviewed locally on YYYY-MM-DD."
6. Run `tsc --noEmit`, `npm run build`, the 4 P102 validators.
7. Spin up local dev. Spot-check 10 rows (incl. BronxCare for
   SPECIALTY, Hennepin for DIRECT, GW for REORIENTED, Jamaica
   absent).
8. **Stop. Open a PR. Do not deploy.** Operator reviews diff +
   screenshots.
9. Merge → Vercel deploys → smoke-check production.

**Risks (low)**:
- A Prisma row whose `title` doesn't exactly match a data.js name
  would silently disappear from the active list. Mitigation: a
  one-time validator (`scripts/p102-validate-browse-shape-a-
  coverage.ts`) that diffs Prisma `title`s vs the active name set
  and fails CI if any approved row is missing from the truth
  layer.
- Existing `/browse` query params still work (filter logic untouched).
- Rollback: revert one commit. No data loss.

**Effort**: ~1 sprint.

### Shape B — schema-backed (1 new column + seed re-run)

Bigger cutover. Adds the truth layer's classification to the DB
directly so future queries don't need to consult the adapter.

**What changes** on top of Shape A:
1. Schema migration: add `displayEligibilityBucket String?` to
   `Listing`, populated from the export at seed time.
2. Schema migration: add `sourceClassification String?` to
   `Listing`, populated from the classifier at seed time
   (DIRECT / REORIENTED / PROTECTED / RESEARCH).
3. Schema migration: add `specialtyLimited String?` to `Listing`,
   populated from `verified-links.ts`.
4. Optionally populate `linkVerificationStatus` enum from the
   classification:
   - `DIRECT` / `REORIENTED` / `PROTECTED` → `VERIFIED`
   - everything else → `NEEDS_MANUAL_REVIEW` (these should not seed
     in the first place after Shape A's hide-list excludes them)
5. Update `prisma/seed.ts` to read the display-eligibility export
   and write the new fields per row.
6. Re-run seed against production DB (`prisma migrate deploy` +
   re-seed). **This is a production DB mutation and is currently
   forbidden** until operator approves.
7. Drop the adapter-based filter from `/browse`; rely on
   `Listing.displayEligibilityBucket IS NOT NULL` instead.
8. `<ListingCard>` reads `sourceBadge` and `specialtyLimited`
   directly from the Prisma row (no enrichment step).

**Why defer until Shape A is live**:
- A migration is irreversible without effort.
- A seed re-run rewrites real DB rows.
- If the truth layer changes (operator hides another row, or finds
  a better URL), Shape B requires another migration + reseed.
  Shape A picks up the change on the next request automatically.

**Risks**:
- Migration rollback is non-trivial; need a documented down
  migration.
- Seed-time discrepancy between the export and the DB (e.g.
  someone runs seed before re-running the export builder)
  produces stale display data. Mitigation: seed script asserts
  export file's `generatedAt` timestamp is within last 24h.
- Real-row column count grows; Vercel cold-start time slightly
  affected (negligible at 207 rows).

**Effort**: 2 sprints (migration design + seed update + dual-write
period + cutover).

### Shape C — snapshot adoption into existing /usce/verified-preview

Replace the legacy `p102-approved-usce.generated.json` snapshot that
powers the existing `/usce/verified-preview` with the new display-
eligibility export. Keeps the legacy preview as the second user-
facing surface (next to `/browse`) instead of building a third.

**What changes**:
1. New script `scripts/p102-build-approved-snapshot-from-display-
   eligibility.ts` that maps each display-eligibility row into the
   `P102ApprovedRow` shape expected by the snapshot.
2. Run that script and commit the regenerated snapshot.
3. Existing `/usce/verified-preview` automatically shows the new
   corpus via `p102-preview-rows.ts`.
4. No changes to `/browse` itself.

**Why this is a minor parallel improvement, not a replacement for
Shape A**:
- `/usce/verified-preview` is `noindex`; it's an internal surface.
- The user-facing wedge is `/browse`. Shape A integrates the truth
  layer there. Shape C doesn't.
- Shape C is useful as a one-time data refresh after Shape A so the
  legacy preview surface doesn't go stale.

**Effort**: ~½ sprint.

---

## 5. Mapping tables (for Shape A and Shape B)

### 5.A. subType → listingType enum

| Truth-layer `subType` | Prisma `listingType` enum | Notes |
|---|---|---|
| `observership` | `OBSERVERSHIP` | most common |
| `visiting-student-elective` | `ELECTIVE` | M4 elective |
| `visiting-student-clerkship` | `ELECTIVE` | clerkship treated as elective in the enum |
| `sub-internship` | `ELECTIVE` | sub-I is an elective in the enum |
| `externship` | `EXTERNSHIP` | |
| `international-visiting-student` | `ELECTIVE` | INTL elective |
| `multi-rotation` | `OBSERVERSHIP` | multi-site usually observer |
| `research-postdoc` | `POSTDOC` | research bucket |

The seed already sets `listingType` from `data.js.type` via
`mapListingType()`. The mapping above only matters when we render
the badge color on the card; the underlying `listingType` doesn't
change.

### 5.B. classification → linkVerificationStatus

| Truth-layer `classification` | Prisma `LinkVerificationStatus` |
|---|---|
| `DIRECT_TRUE_USCE_LINK` | `VERIFIED` |
| `MOVED_REORIENTED_TO_TRUE_USCE_LINK` | `VERIFIED` |
| `PROTECTED_BROWSER_REQUIRED` | `VERIFIED` |
| `RESEARCH_VALID_INSTITUTIONAL_PATHWAY` | `VERIFIED` |
| (anything else — `NO_PROGRAM_FOUND_HIDE`, `BORDERLINE_KEEP_REVERIFY`, `BROKEN_REQUIRES_MANUAL_BROWSER`, `NEGATIVE_INFO_ROW_KEEP_OR_SEPARATE`, etc.) | row should not be in Prisma at all under Shape A |

### 5.C. badge → display token

Already defined in
`src/app/usce/verified-preview/browse/badge-styles.ts`. The
production cutover can either:
- Promote `badge-styles.ts` from the preview folder up to
  `src/components/listings/source-badge-styles.ts` and import from
  both surfaces, OR
- Keep one copy in the preview folder and one inline in
  `<ListingCard>` (premature abstraction warning — wait for the
  third caller before extracting).

Per the "3 similar lines beats premature abstraction" rule, **keep
the duplication for now**. Extract when a third caller appears.

---

## 6. Detail page surface (`/listing/[id]`)

Recommended addition for Shape A (minimal):

```
┌──────────────────────────────────────────────────────────┐
│ <h1>{listing.title}</h1>                                 │
│ ┌─[DIRECT / REORIENTED / PROTECTED]─┬─[SPECIALTY: …]─┐  │  ← new pills
│ │ Source: emerald/sky/amber pill   │ fuchsia pill   │   │
│ └────────────────────────────────────┴────────────────┘  │
│                                                          │
│ … existing TrustBadges, location, type, etc. …           │
│                                                          │
│ ┌─ Source link ─────────────────────────────────────┐    │  ← new block
│ │ <a href={finalUrl}>{finalUrl}</a>                 │    │
│ │ [Verify on official source] outbound CTA          │    │
│ └───────────────────────────────────────────────────┘    │
│                                                          │
│ ┌─ Source note / evidence ──────────────────────────┐    │  ← new optional
│ │ "<evidenceQuote>"                                 │    │
│ └───────────────────────────────────────────────────┘    │
│                                                          │
│ … existing Save / Apply / Reviews / FlagButton …         │
└──────────────────────────────────────────────────────────┘
```

The existing `<TrustBadges>` / `<ListingTrustMetadata>` /
`<ListingVerificationBadge>` components stay; the new pills are
additive.

---

## 7. Filter strategy

Production `/browse` already supports:
- search (`q`)
- category (`clinical` → OBSERVERSHIP+EXTERNSHIP+ELECTIVE; `research` → RESEARCH+POSTDOC; `volunteer`)
- type (legacy)
- audience
- state
- free / visa / verified
- sort

After Shape A, recommend adding ONE new filter and ZERO removals:
- `?specialty=only` — show only specialty-limited rows (mirrors the preview)

Removing the `verified` filter is tempting (every row is now
display-eligible-verified by construction) but back-compat says keep
it. The existing filter logic still works.

---

## 8. Risks not addressed by any shape

These are orthogonal — Shape A, B, and C all live with them:

- **Data drift**: data.js can be updated by the sibling-repo
  maintainer at any time. New programs added there won't appear on
  `/browse` until the seed re-runs. Mitigation: a CI job (or local
  cron) re-runs the classifier + display-eligibility export
  builder weekly; if counts shift by >5%, page the operator.
- **URL rot**: institutional sites move pages. Mitigation: the
  `cron/verify-listings` job that already exists in
  `src/app/api/cron/verify-listings/route.ts` should be enhanced to
  re-check `finalUrl` (not `websiteUrl`) and flag any 404 / 5xx for
  operator review on the existing dashboard.
- **Specialty-limited drift**: BronxCare or Carolinas might add
  more specialties. Annual operator-review pass.

---

## 9. Cutover sequence (recommendation)

1. **Now (no code)**: operator reviews this plan, accepts Shape A
   recommendation OR redirects to B / C.
2. **Sprint +1**: implement Shape A on a new branch
   `local/p102-browse-shape-a-cutover`. Includes a coverage
   validator script.
3. **Sprint +1 end**: open PR. Operator reviews diff +
   `/browse` local screenshots. **No deploy yet.**
4. **Sprint +2**: merge PR → Vercel deploys → operator smoke-checks
   production for an hour. Rollback by reverting the merge commit
   if anything looks off.
5. **Sprint +3 (optional)**: Shape B — schema migration design
   doc (no migration yet). Plan a dual-write window: write to
   both old and new columns for one release, then cut over reads.
6. **Sprint +3 alt (optional)**: Shape C — regenerate the legacy
   preview snapshot from the display-eligibility export so
   `/usce/verified-preview` stays in sync.

**Estimate**: Shape A can be merged in ~3 working hours. Shape B
adds ~1 day of migration + dual-write design. Shape C is ~½ day.

---

## 10. Out of scope (will NOT do without explicit operator approval)

- `prisma db push` / `prisma migrate dev` / `prisma migrate deploy`
- Production seed re-run
- `git push` from any local branch in this sprint
- `vercel deploy` / `vercel --prod`
- `gh pr create` (PR-creation is gated on operator review of this
  plan)
- Homepage redesign
- SEO / sitemap / robots / canonical / JSON-LD changes
- Route restructuring
- Changes to `/career`, `/residency`, `/fellowship`
- Adding new fields to `data.js` (the sibling repo is read-only)
- Replacing `<ListingCard>` (Shape A only extends it)
- Removing existing filters

---

## 11. Open questions for the operator

1. **Shape A first, or jump straight to Shape B?** Shape A is
   reversible and zero-DB-mutation. Shape B is cleaner long-term
   but requires a migration + seed re-run. Recommend A first.
2. **Specialty filter on /browse?** The truth layer has 2
   specialty-limited rows today. Adding a `?specialty=only`
   filter is trivial under Shape A. Operator approval needed
   because it's a public-facing URL parameter that becomes part
   of the SEO contract.
3. **Outbound link behavior**: should the "Verify on official
   source" button open in a new tab (`target="_blank"`)? The
   preview does. Production behavior should be consistent.
4. **What happens to existing `<TrustBadges>` /
   `<ListingVerificationBadge>` when the SOURCE pill is added?**
   Three reasonable options:
   - (a) Keep both — TrustBadges describes verification recency;
     SOURCE describes URL quality. Different signals.
   - (b) Hide the legacy badges on rows where SOURCE is rendered.
   - (c) Replace TrustBadges with SOURCE entirely.
   Recommend (a) for the first cutover; revisit after a week of
   production data.
5. **Naming**: should the SPECIALTY badge say "Specialty:
   Psychiatry" or "Psychiatry-only observership"? Preview uses
   the former. Production can change copy without changing the
   contract.

---

## 12. Validators a Shape-A implementation should add

(For when the cutover sprint runs — not in this planning sprint.)

- `scripts/p102-validate-browse-shape-a-coverage.ts`:
  - Every `Listing.status="APPROVED"` row has a corresponding
    entry in the active-name set.
  - No active-name-set entry is missing from Prisma (catch the
    inverse: classifier sees a clinical USCE row that the seed
    forgot to write).
  - Every active row's `websiteUrl` matches the truth layer's
    `finalUrl` (or is harmlessly different, with a documented
    reason).
- Extend `scripts/p102-validate-display-eligibility-export.ts`
  with: "active program names are a subset of Prisma titles"
  (requires DB connection; gate behind `--with-db` flag).

---

## 13. Confirmation

- No mutation of any production system in this sprint.
- This document is local-only at
  `docs/platform-v2/local/usce-discovery-command-center/p102/
   P102_PRODUCTION_BROWSE_INTEGRATION_PLAN.md`.
- Implementation sprints (any shape) are gated on operator
  approval of this plan.
