# P96-1 — Verification hardening report

Local-only sprint. Branch `local/p96-1-verification-hardening`.
**Not pushed. Not opened. Not deployed.** Implements four
no-schema items identified by P96-0 as the next moat before any
full 304-listing audit.

## Critical caveat

The content-keyword classifier exists as a pure helper but is **not
yet invoked by the cron route**. P96-1 improves throttle / admin
visibility / failure escalation, but it does not yet solve the core
"HTTP alive but weak / generic / mismatched source" problem
**operationally**. That requires P96-1B.

## 1. What changed

| # | Item | Status | Files |
| --- | --- | --- | --- |
| 1 | Cron content-keyword classifier as pure helper | Implemented | `src/lib/content-classifier.ts`, `scripts/test-content-classifier.ts` |
| 2 | Per-host rate limit / throttling in cron | Implemented | `src/lib/host-throttle.ts`, `scripts/test-host-throttle.ts`, integration in `src/app/api/cron/verify-listings/route.ts` |
| 3 | 3-failure auto-flag in cron | Implemented | `src/app/api/cron/verify-listings/route.ts` (new `maybeAutoFlag` helper) |
| 4 | Read-only `/admin/freshness` page | Implemented | `src/app/admin/freshness/page.tsx`, sidebar entry in `src/app/admin/layout.tsx` |

## 2. Files changed (7)

```
NEW src/lib/content-classifier.ts                       (pure)
NEW src/lib/host-throttle.ts                            (pure)
NEW src/app/admin/freshness/page.tsx                    (server component, admin-gated)
MOD src/app/api/cron/verify-listings/route.ts           (per-host throttle + auto-flag)
MOD src/app/admin/layout.tsx                            (Freshness sidebar link)
NEW scripts/test-content-classifier.ts                  (16 tests, pass)
NEW scripts/test-host-throttle.ts                       (20 tests, pass)
```

No edits to:
- `prisma/schema.prisma`
- `src/lib/link-verification.ts` (existing pure classifier preserved as-is)
- `src/app/api/cron/verify-jobs/route.ts`
- any existing admin route besides the layout sidebar entry
- any user-facing public page

## 3. Classifier taxonomy

`src/lib/content-classifier.ts` exports `ContentClassification`:

```
PATH_HINTS_PROGRAM   — URL pathname (or content snippet) hits a
                       program keyword and there are no wrong-page
                       hints
GENERIC_HOMEPAGE     — URL is the institution root or /about/
                       /home/etc.; strongest negative signal
DEEP_PATH_NO_HINT    — path is non-trivial but no keyword hit
LIKELY_WRONG_PAGE    — path or content contains a wrong-page hint
                       (consulting, billing, donor, news, patient
                       appointment, etc.); downgrades any positive
                       match
LOGIN_REQUIRED       — content snippet shows ≥2 login-form hints
                       (sign in, password input, SSO, etc.)
SOURCE_DEAD          — emitted ONLY when caller passes httpStatus=0
UNKNOWN              — invalid URL, no signal
```

The classifier is **pure** — no I/O, no DB. The cron does NOT call it
yet (still HEAD-only per the Phase 3.3 contract); it's staged for a
future cron extension and immediate admin-side use.

Conservative-by-design rules:

- HTTP 200 alone never produces a positive verdict.
- Generic path is the strongest negative signal — beats content
  snippet keywords.
- Wrong-page hints downgrade, never upgrade.
- Login-required is a separate state from dead.

Program keyword set: `observership, observer, externship, elective,
visiting student/students, clinical experience, clinical rotation,
research fellowship/trainee, summer research/fellowship, postdoctoral,
postdoc, volunteer, shadowing, IMG, international medical graduate,
clerkship`.

Wrong-page hints: `consulting, advisory services, billing, donor,
donate, press release, news article, patient appointment,
make an appointment, find-a-doctor`.

## 4. Per-host throttle behavior

`src/lib/host-throttle.ts` exports `partitionByHost`:

- Default cap: **1 listing per hostname per cron tick.** Tunable
  via `maxPerHost`.
- Listings beyond the cap are recorded in `deferred[]` with reason
  `host_throttled`. They roll into the next cron run via the
  existing `lastVerificationAttemptAt asc nulls first` ordering.
- Listings with no parseable URL pass through (cron's existing
  skip-no-url logic handles them).
- Order is preserved: first occurrence per host wins. Callers should
  pre-sort by staleness so the oldest row per host is the one
  probed.

Cron integration in `src/app/api/cron/verify-listings/route.ts`:

- Pulls a 50-row candidate overscan from Prisma (was 25).
- Runs `partitionByHost` with `maxPerHost = 1`.
- Caps the actual probe list at the unchanged `MAX_LISTINGS_PER_RUN`
  (25). Anything past that goes into `overflow_run_cap` for the
  next tick.
- New summary fields: `deferred_host_throttled`, `deferred_run_cap`,
  `auto_flagged`, `distinct_hosts_seen`.

Why: previously, if 5 listings happened to share a host, that host
would see 5 concurrent HEADs in a single batch. Now it sees at most
1 per cron run.

## 5. 3-failure auto-flag behavior

When `classifyProbeOutcome` returns `NEEDS_MANUAL_REVIEW`, the cron
calls `maybeAutoFlag(listingId, reason)`:

1. Reads the listing's last 3 `DataVerification` rows.
2. If any of them is `VERIFIED`, the streak is broken — no flag.
3. If all 3 are non-`VERIFIED`, dedupes against existing
   `AdminMessage` rows with `category = "cron_verification_failure"`
   created in the last 14 days that mention this listing id in
   their body.
4. If no such row exists, creates one new `AdminMessage`:

```
category: "cron_verification_failure"
userId:   null              (system-generated)
userName: "system:cron-verify-listings"
subject:  "Verification cron flagged listing <id>"
body:     listing id + threshold + most-recent reason + action hint
status:   "OPEN"
```

5. Returns `true` if a row was created, `false` otherwise. Failures
   are swallowed — a flag-creation error never breaks the main
   verification path.

Why `AdminMessage` and not `FlagReport`:

- `FlagReport.reporterId` is a non-null FK to `User`, so a system
  flag would need a real user.
- `AdminMessage.userId` is nullable.
- `AdminMessage.category` is a free-string column — no schema
  migration to add a new category.
- Admins already triage `/admin/messages`.

Conservative-by-design:

- Only fires after a definitive `NEEDS_MANUAL_REVIEW`. `REVERIFYING`
  (transient) does NOT count.
- Never auto-hides the listing.
- Never auto-marks `SOURCE_DEAD` or `PROGRAM_CLOSED`.
- Deduped on a 14-day recency window so a single listing can't
  generate noise day after day.

## 6. `/admin/freshness` behavior

New server-component admin page at `/admin/freshness`. Auth-gated
identically to `/admin/activity` (redirects to `/auth/signin` for
non-admin).

Renders, all read-only:

- **Totals tiles:** approved, fresh (≤ 30 days), stale 30–60,
  60–90, > 90, never verified, no URL on file, generic-homepage URL
  count.
- **Verification status counts** (sorted by count).
- **URL coverage** tiles: missing sourceUrl / applicationUrl / no
  URL at all.
- **Top 10 hostnames** by approved-listing count.
- **Recent failures** table (last 20 `NEEDS_MANUAL_REVIEW` /
  `SOURCE_DEAD` rows, ordered by `lastVerificationAttemptAt`).
- **Recent auto-flags** table (last 10 `cron_verification_failure`
  AdminMessages).

Sidebar link added in `src/app/admin/layout.tsx`. No data mutation.
No "run cron now" button. No public route.

## 7. Tests run

```
npx tsx scripts/test-content-classifier.ts → 16/16 passed
npx tsx scripts/test-host-throttle.ts      → 20/20 passed
npx tsc --noEmit                           → exit 0
npx eslint <changed files>                 → exit 0 (1 expected
                                             react-hooks/purity
                                             disable on Date.now()
                                             in the server page)
```

`npm run build` and full `npm run lint` not run in this audit (TypeScript
+ targeted lint sufficient for these focused changes; would re-run
before any push).

## 8. Risks / watch items

| Risk | Mitigation |
| --- | --- |
| Auto-flag floods `/admin/messages` if many listings fail simultaneously (e.g. wide outage) | 14-day dedupe window per listing; cron caps at 25 listings/run; max 25 flags possible per run |
| Per-host throttle (1 listing per hostname per cron tick) slows full-cycle verification for large institutions with many listings | Safest default. Mostly a wash: 25/day cap was already the bottleneck. Cycle time stays ~12 days. May need raising per-host cap once we observe real-world throughput. |
| Auto-flag uses `AdminMessage` rather than a purpose-built verification queue item | Acceptable short-term — `AdminMessage.userId` is nullable and `category` is free-string so no schema work. May need a dedicated queue model later. |
| Classifier is conservative and pure, but not yet invoked by cron | Intentional. P96-1B wires it. Until then, the operational "HTTP alive but weak / generic / mismatched" problem is **not** solved. |
| Date-based freshness aggregation | Watch for timezone / off-by-one confusion in `/admin/freshness` totals. Current implementation uses UTC `Date.now()` which is consistent across the cluster. |
| `/admin/freshness` may become expensive at higher listing volumes | Fine for 304 listings. Beyond ~5k may need pagination or cached aggregates. |
| `Date.now()` in server page lint-disabled | Same pattern used in other server components; runs per-request, not per-render |
| `maybeAutoFlag` reads from `DataVerification` then writes to `AdminMessage` non-atomically | Idempotent via dedupe window; worst case is two flags created in adjacent runs (still bounded). Acceptable for v1. |
| System still lacks persisted screenshots, source evidence snapshots, and domain-match verification | Out of P96-1 scope by design. P96-2 / P96-3 territory. |

## 9. Rollback plan

The branch is local-only. Rollback options, ordered easiest first:

1. **Don't push.** Branch sits where it is; no production effect.
2. **Drop the auto-flag call site** by reverting the
   `if (classification.status === "NEEDS_MANUAL_REVIEW")` block
   inside `verify-listings/route.ts`. The new helpers
   (`maybeAutoFlag`, `partitionByHost`, `classifyContent`) become
   dormant; cron behavior matches pre-P96-1 minus the larger candidate
   pool.
3. **Drop the per-host throttle** by reverting the `partitionByHost`
   integration and reducing the candidate pool back to
   `take: MAX_LISTINGS_PER_RUN`.
4. **Remove the `/admin/freshness` route** — single file delete +
   one sidebar entry rollback.
5. **Delete the new pure files** — zero dependencies on them outside
   the cron route once steps 2–4 are reverted.

Per-PR rollback summary (when these ship):

- Revert `/admin/freshness` and sidebar entry independently if admin
  UI has issues.
- Revert host throttle independently if cron throughput is too slow.
- Revert auto-flag block independently if `AdminMessage` semantics
  are wrong.
- Keep the pure classifier even if cron wiring is delayed — it has
  isolated tests and zero side effects.

No DB migration to roll back. No production data altered by any
local code path.

## 10. What remains before 25-listing or 304-listing sample

**Recommended next task: P96-1B — wire the content-keyword
classifier into `verify-listings` cron as a small no-schema local
sprint.**

Do **not** start P96-2 yet. P96-2 should begin only after:

1. classifier invocation is wired into cron, **or** intentionally
   deferred with a documented reason,
2. weak / generic / wrong-page classifications are represented
   internally without overclaiming on the public surface,
3. admin-message dedupe is verified end-to-end,
4. `/admin/freshness` access control is manually checked,
5. P96-1 / P96-1B are reviewed for PR split.

Other prerequisites for the eventual P96-2:

- Persisted screenshot pipeline (Playwright dev-dep OR
  Chrome-extension reconnect).
- A 25-listing dry run that uses the new classifier on real
  fetched body text.
- An admin re-link queue for rows that come back as
  `LIKELY_WRONG_PAGE` / `GENERIC_HOMEPAGE`.

Do not run a 25- or 304-listing audit until P96-1B ships.

## 11. Hard rules confirmation

- ✅ No push, no PR, no merge, no deploy.
- ✅ No Vercel mutation, no `.vercel/project.json` edit.
- ✅ No `prisma/schema.prisma` edit, no migrations, no
  `prisma db push`, no seed.
- ✅ No row mutation by any test or by Claude. Cron-side mutations
  remain unchanged in semantics; the new auto-flag writes only to
  `AdminMessage` (already an admin-write surface) and only after a
  definitive failure threshold.
- ✅ No external HTTP fetches by Claude in this sprint. The cron
  itself still HEAD-probes per its existing contract; that wasn't
  invoked here.
- ✅ No mass import, no auto-publish, no aggressive crawling, no
  third-party paid tools, no fake verification.
- ✅ No "best/top-rated/official/hospital-approved/verified by
  hospitals/guaranteed" copy introduced.
- ✅ No #52 interaction.
- ✅ No production data modified.
- ✅ No new auth flow, no new role values.
- ✅ Per-host throttle defaults to 1/host/run — politest possible.
- ✅ `MAX_LISTINGS_PER_RUN` unchanged at 25.

## 12. Future PR split recommendation

When deployment budget allows, split this branch into three small
PRs (plus a docs PR for this report):

1. `feat/verification-content-classifier`
   - `src/lib/content-classifier.ts`
   - `scripts/test-content-classifier.ts`
   - this report (`docs/platform-v2/local/P96_1_VERIFICATION_HARDENING_REPORT.md`)
2. `feat/verification-host-throttle-auto-flag`
   - `src/lib/host-throttle.ts`
   - `scripts/test-host-throttle.ts`
   - cron-route changes in `src/app/api/cron/verify-listings/route.ts`
     (per-host partition + 3-failure `AdminMessage` auto-flag)
3. `feat/admin-freshness-page`
   - `src/app/admin/freshness/page.tsx`
   - sidebar entry in `src/app/admin/layout.tsx`

Keep them separate unless the user explicitly wants one combined
PR. Order rationale: the classifier is pure and zero-risk, ships
first; the cron changes have real runtime impact and ship second
once the helper is in main; the admin page is independent and can
ship in parallel with #2.

## 13. Pre-PR verification checklist

Manual checks needed **before** any of these PRs are pushed to
production:

- [ ] `/admin/freshness` is **not** accessible to non-admin users
      (anonymous → `/auth/signin`; APPLICANT/POSTER role → same).
- [ ] `/admin/freshness` performs **no writes** — verified by
      reading the source; manually confirm no DOM control on the
      page submits anything.
- [ ] `AdminMessage.userId` nullable behavior works in the deployed
      schema (Prisma client + DB column both nullable).
- [ ] Free-string `AdminMessage.category` is already safe and used
      elsewhere — confirmed via existing P95-A coordinator
      categories landed in #60.
- [ ] 3-failure auto-flag cannot spam duplicate messages beyond
      the 14-day dedupe — re-test in dev by triggering 6
      consecutive failures on the same listing and observing only
      one new `AdminMessage` row.
- [ ] Per-host throttle cannot starve large hospital systems
      forever — confirm by tracing a multi-listing host through 12
      consecutive cron ticks and seeing each listing eventually
      probed.
- [ ] Cron output JSON includes `checked / deferred_host_throttled
      / deferred_run_cap / skipped_no_url / errors / auto_flagged
      / verified / needs_manual_review / reverifying /
      distinct_hosts_seen` with non-NaN integer counts.
- [ ] No public listing copy changes were introduced.
- [ ] No existing admin navigation layout regression — confirm by
      visiting every existing `/admin/*` route after the layout
      sidebar entry change.

## 14. Do not do next

- Do **not** start a full 304-listing audit.
- Do **not** start P96-2 25-listing screenshot audit yet.
- Do **not** add schema fields for domain matching yet
  (`Organization.websiteDomain` is a future step).
- Do **not** build the screenshot pipeline inside this branch.
- Do **not** make public UI / source-status copy changes based on
  classifier output yet.
- Do **not** auto-unpublish or downgrade listings from the cron.
- Do **not** invoke the content classifier from the cron in this
  sprint — that's P96-1B.

## 15. Correct next sequence

1. **P96-1B** — wire classifier into cron conservatively.
2. Review / split P96-1 + P96-1B into small PRs when user approves.
3. **P96-2** — 25-listing sample audit with persisted screenshots.
4. **P96-3** — full 304-listing audit.
5. Card / detail description cleanup based on verified source
   evidence.
