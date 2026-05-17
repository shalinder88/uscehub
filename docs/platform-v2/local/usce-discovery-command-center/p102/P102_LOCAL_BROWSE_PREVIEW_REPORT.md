# P102 Local Browse Preview From Display Eligibility Report

Generated: 2026-05-17
Branch: `local/p102-local-browse-preview-from-display-eligibility`
Parent: `1467655`
This branch HEAD: pending Phase H commit

**No push. No deploy. No PR. No production DB mutation. No schema migration. No `/browse` production mutation. No SEO change.**

---

## Summary

Built a parallel user-facing browse experience at
`/usce/verified-preview/browse` that's powered entirely by the
display-eligibility truth layer — no Prisma DB, no production-route
mutation. List page + detail page + filters + SPECIALTY badge support
+ honest sentinel fallbacks for unknown fields. Mobile and desktop
both readable in dark mode.

## Files added

| Path | Kind | Purpose |
|---|---|---|
| `docs/.../p102/P102_LOCAL_BROWSE_PREVIEW_STRUCTURE_AUDIT.md` | doc | Audit of the current /browse data flow, what to reuse, what NOT to touch |
| `docs/.../p102/P102_LOCAL_BROWSE_PREVIEW_REPORT.md` | doc | This report |
| `src/app/usce/verified-preview/browse/page.tsx` | route | List view; filters by lane/subType/state/badge/specialty + search; reads display-eligibility exports |
| `src/app/usce/verified-preview/browse/[slug]/page.tsx` | route | Detail view; honest sentinels for unknown fields; source URL CTA; report-issue placeholder |
| `src/app/usce/verified-preview/browse/browse-card.tsx` | server component | Card UI with SOURCE + SPECIALTY badges, type/audience pills, "Verify on official source" + "Report issue" |
| `src/app/usce/verified-preview/browse/badge-styles.ts` | constants | Shared SOURCE/SUBTYPE/AUDIENCE label maps and Tailwind tokens (dark-mode safe) |

Adapter extended (one small file change):

| Path | Change |
|---|---|
| `src/lib/p102-display-eligible-listings.ts` | Added `slugifyProgram(programName, state)` and `getDisplaySlugIndex()` helpers for the detail route. |

## Routes added

```
/usce/verified-preview/browse                     (list)
/usce/verified-preview/browse/[slug]              (detail)
```

Both `noindex,nofollow,nocache`. Both registered as ƒ (Dynamic) in
`npm run build` output. Production `/browse`, `/listing/[id]`,
homepage, sitemap, robots, canonical URLs untouched.

## Counts rendered (verified via DOM)

| Lane | DOM `<article>` count | Filter counter |
|---|---:|---|
| Clinical USCE (default) | **167** | "167 rows match" |
| Research | **9** | "9 rows match" |
| All active | 176 | — |

Header banner: `167 clinical USCE · 9 research · 31 not displayed (hidden / archived)`.

## Filters available

- **Search** — institution / program / state substring
- **Lane** — clinical · research · all
- **Type** (subType): Any · observership · visiting-student-elective · visiting-student-clerkship · sub-internship · externship · international-visiting-student · multi-rotation · research-postdoc
- **State** — dropdown of every state present in active rows
- **Source** — Any · DIRECT · REORIENTED · PROTECTED · RESEARCH
- **Specialty** — Any · Specialty-limited only

Filter state lives in query params so individual URLs are shareable.

## Hidden exclusion result

Programmatic DOM scan for forbidden institutions returned **zero** in
both list and detail surfaces:

| Forbidden name | In list | In detail |
|---|:---:|:---:|
| Brooklyn USCE | absent | absent |
| AMG Medical Group | absent | absent |
| ValueMD | absent | absent |
| Cook County (negative info) | absent | absent |
| Jamaica Hospital Medical Center | absent | absent |
| Conemaugh Memorial | absent | absent |
| Mayo Clinic — Research Fellowship (held) | absent | absent |
| Allegheny Health Network — Observership | absent | absent |
| SAMS — Clinical Observership (Nonprofit) | absent | absent |

Result: **hidden rows do not surface in the active display**.

## Research separation result

The Research lane shows exactly the 9 `RESEARCH_VALID_INSTITUTIONAL_PATHWAY` institutions:

Duke, Harvard, Johns Hopkins, NIH Clinical Center, Penn, Stanford, UCSF, University of Michigan, Yale.

Each row carries a violet `RESEARCH` source badge and a `Research / postdoc` type label so it's never confused with a clinical USCE rotation.

The 7 `RESEARCH_TOO_GENERIC_REVERIFY` rows that were previously
research-held are correctly hidden (operator's prior decision to move
them to the hidelist).

## Specialty badge result

Both rows tagged with `specialtyLimited` render the fuchsia SPECIALTY
badge inline with the program title, both on cards and on detail:

- **BronxCare Health System** — `Specialty: Psychiatry`
- **Carolinas Medical Center — Atrium Health** — `Specialty: Internal Medicine (other departments not documented)`

## GW visiting-student elective confirmation

DOM check on `/usce/verified-preview/browse/george-washington-university-hospital-dc`:

| Property | Result |
|---|---|
| H1 contains "George Washington University Hospital" | yes |
| Page renders "Visiting student elective" or `visiting-student-elective` | yes |
| `REORIENTED` / "Reoriented to official source" badge present | yes |
| Source URL is `smhs.gwu.edu/academics/md-program/visiting-students` | yes |

GW now surfaces as a visiting-student elective, not observership, with
the active VSLO URL. The closed observer URL is no longer linked
anywhere on the preview surface.

## Screenshots

Captured via Claude Preview MCP during this session:

| Viewport | Surface | What it shows |
|---|---|---|
| 1280×1100 desktop | List (clinical, default) | Source banner, 3 lane chips, filter form, 3-column card grid, SOURCE + SPECIALTY badges |
| 1280×1100 desktop | List (research lane) | 9 RESEARCH-badged cards, "Research / postdoc" type pill |
| 1280×1100 desktop | Detail (BronxCare) | "Reoriented to official source" + "Specialty: Psychiatry" pills, all 6 sections (Type/Audience/Cost/Duration/Visa/Application), source URL, evidence quote, report-issue section |
| 375×812 mobile | List (top) | Header collapses to single column, all controls reachable, badges readable |
| 375×812 mobile | List (scrolled) | Cards stack to single column, badges and "Verify on official source" CTA still legible |

All screenshots returned inline JPEG; not persisted to disk. Status:
**NOT NEEDS_BROWSER_RETRY.** Visual QA completed in this session.

## Defects found

**None.** Dark-mode contrast was already correct (the adapter, the
card, the detail page all use `dark:` variants throughout). The
prior contrast bug on display-readiness was caught + fixed in commit
`904b31f`; the new browse preview reuses those same patterns.

Open observations (not blocking):
- O1 — Card description / shortDescription field would help cards
  feel less sparse, but the export doesn't carry one. Adding it would
  require new data, not new UI. Out of scope for this sprint.
- O2 — "Report issue" is a disabled placeholder button. Wiring it
  requires either a new server action that appends to the operator-
  review-decisions JSON, or a new dedicated issue-report JSON store.
  Out of scope for this sprint.
- O3 — The same-name data.js duplicates (Wyckoff ×2, Hackensack ×2,
  etc.) share a slug, so detail route returns the first row. Filter
  counts still include both. This is correct behavior for now.

## QA chain

| Check | Result |
|---|---|
| `tsc --noEmit` | clean |
| `npm run build` | exit 0; `/browse` and `/browse/[slug]` both registered as Dynamic |
| `p102-classify-live-listings-per-type` | clean |
| `p102-build-display-eligibility-export` | 207-row sum |
| `p102-validate-display-eligibility-export` | **38/38 PASS** |
| `validate-no-secrets` | PASS (6479 files, 0 findings) |

## No-push / no-deploy / no-DB-mutation confirmation

- No `git push`. Branch `local/p102-local-browse-preview-from-display-eligibility` is local only.
- No `vercel deploy` / `vercel --prod`.
- No `gh pr create`.
- No `prisma db push` / `prisma migrate dev` / `prisma migrate deploy`.
- No production seed run.
- No mutation of `prisma/schema.prisma`, `prisma/verified-links.ts`, or `prisma/listings-hidelist.ts` (last touched in parent commit `1467655` for unrelated decisions; untouched here).
- No mutation of `usmle-observerships/data.js`.
- No change to `src/app/browse/page.tsx`, `src/app/listing/[id]/page.tsx`, `src/components/listings/listing-card.tsx`, homepage, sitemap, robots, canonical URLs, JSON-LD, or any SEO metadata outside the new preview route's own `noindex`.
- `src/lib/p102-display-eligible-listings.ts` got two additive helpers (`slugifyProgram`, `getDisplaySlugIndex`); existing callers unaffected.

## Recommendation

**B — production `/browse` integration plan** is the recommended next
step, after one more visual QA pass on the local preview.

Order:
1. **One more local-preview spot-check** — operator opens
   `/usce/verified-preview/browse` and clicks through ~10 cards,
   confirming the source URLs land on real pages. ~15 minutes.
2. **B. Production `/browse` integration plan (no mutation)** —
   design the cutover: how the existing Prisma-backed page would
   start filtering by the display-eligibility set, what fields the
   adapter needs to provide that `<ListingCard>` consumes, what
   migration shape (if any) is needed. **Plan only — no code, no
   schema, no seed.**
3. Skip A (visual polish) until after B. The local preview is good
   enough for evaluation; polish-without-integration is wasted work.
4. C (phone outreach for Jamaica/Richmond) and D (operator-supplied
   research URLs) remain available as side tasks but no longer block
   anything since both have been moved to the hidelist.
5. E (PR/deploy) is gated on the integration plan from B being
   accepted.

## Next-step menu

| | Choice | Status |
|---|---|---|
| A | Visual polish on local preview | available; recommend after B |
| **B** | **Production `/browse` integration plan (no mutation)** | **recommended next** |
| C | Phone outreach for Jamaica / Richmond | already on hidelist; defer |
| D | Operator research URLs for the 7 deferred postdoc programs | already on hidelist; defer |
| E | PR / deploy discussion | gated on B |

The local preview is ready for operator review.
