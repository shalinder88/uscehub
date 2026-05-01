# P96-1B — Cron content classifier wiring

Local-only sprint. Branch `local/p96-1b-cron-content-classifier`
(child of `local/p96-1-verification-hardening`). **Not pushed. Not
opened. Not deployed. No schema. No body scraping. No browser
automation.**

P96-1B closes the operational gap left by P96-1: the pure
`classifyContent` helper is now invoked by `verify-listings` on
every probe, recorded into the existing `DataVerification.notes`
audit column, and (for the worst combinations) opens a deduped
`AdminMessage` for admin review. The public-facing
`linkVerificationStatus` is unchanged — content classification stays
internal until P96-2's evidence pipeline ships.

## 1. What changed

| Item | Status |
| --- | --- |
| Cron invokes `classifyContent` after every `classifyProbeOutcome` | Implemented |
| Classifier verdict recorded in `DataVerification.notes` (free-text marker) | Implemented |
| `GENERIC_HOMEPAGE` + HTTP 2xx → opens `verification_generic_source` AdminMessage (14-day deduped) | Implemented |
| `LIKELY_WRONG_PAGE` + HTTP 2xx → opens `verification_wrong_page` AdminMessage (14-day deduped) | Implemented |
| `/admin/freshness` shows three new tiles for content-review flag counts | Implemented |
| Cron summary returns 5 new counters | Implemented |
| Public-facing `linkVerificationStatus` modified by content verdict | **Not — intentional** |
| Cron switched to body-fetching GET | **Not — intentional, deferred** |
| Login-required detection from URL alone | **Not — requires snippet, deferred** |

## 2. Files changed (4)

```
MOD src/app/api/cron/verify-listings/route.ts        (+139 lines)
MOD src/app/admin/freshness/page.tsx                 (+15 lines)
MOD scripts/test-content-classifier.ts               (+78 lines, +8 tests)
NEW docs/platform-v2/local/P96_1B_IMPLEMENTATION_PLAN.md
NEW docs/platform-v2/local/P96_1B_CRON_CONTENT_CLASSIFIER_REPORT.md (this file)
```

No edits to:
- `src/lib/content-classifier.ts` (already complete)
- `src/lib/host-throttle.ts` (already complete)
- `src/lib/link-verification.ts` (existing pure classifier preserved)
- `prisma/schema.prisma`
- any existing public-facing UI

## 3. How the classifier is invoked

Inside the `verify-listings` per-listing handler, immediately after
`classifyProbeOutcome`:

```ts
const outcome = await probeUrl(url);
const classification = classifyProbeOutcome(outcome);

const contentVerdict = classifyContent({
  url,
  httpStatus: outcome.httpStatus,
  finalUrl: outcome.finalUrl,
  // contentSnippet intentionally omitted: cron does not fetch body.
});
bumpContentVerdictCounter(summary, contentVerdict.classification);
```

The verdict is then passed into `applyClassification` which writes
the marker into `DataVerification.notes`:

```
content_verdict=<bucket>;content_reason=<reason>
```

`bucket` is one of the 7 `ContentClassification` values. The marker
is single-line, easy to grep, and lives only in the per-event audit
log (admin/cron-internal — never public).

## 4. What data the classifier uses

URL-only invocation:

| Input | Source |
| --- | --- |
| `url` | `pickProbeUrl(sourceUrl > applicationUrl > websiteUrl)` |
| `httpStatus` | `outcome.httpStatus` from existing HEAD/GET probe |
| `finalUrl` | `outcome.finalUrl` (post-redirect) |
| `contentSnippet` | **Omitted.** No body fetch. |

This means the classifier can return:
- `GENERIC_HOMEPAGE` (path-only — root or `/about` etc.)
- `PATH_HINTS_PROGRAM` (path-keyword match)
- `LIKELY_WRONG_PAGE` (path contains a wrong-page hint)
- `DEEP_PATH_NO_HINT` (deep path, no keyword)
- `SOURCE_DEAD` (only when `httpStatus === 0`)
- `UNKNOWN` (invalid URL)

It cannot return `LOGIN_REQUIRED` from URL alone (requires a
snippet). That gap is documented; future body-snippet work can
enable it.

## 5. What it refuses to over-promote

P96-1B never:

- Modifies `Listing.linkVerificationStatus` based on the content
  verdict.
- Modifies `Listing.linkVerified` (legacy boolean).
- Modifies `Listing.lastVerifiedAt`.
- Modifies `Listing.status` (the public PUBLISHED/HIDDEN flag).
- Adds a new `LinkVerificationStatus` enum value.
- Changes any public copy on listing cards / detail / dashboards.

The cron's existing classifier (`classifyProbeOutcome`) remains the
**only** writer of public-facing verification fields.

## 6. How `GENERIC_HOMEPAGE` is handled

When the classifier verdict is `GENERIC_HOMEPAGE` AND
`classification.status === "VERIFIED"`:

- Cron records `content_verdict=GENERIC_HOMEPAGE;content_reason=path_is_generic`
  in `DataVerification.notes`.
- Calls `maybeContentReviewFlag(listing.id, "GENERIC_HOMEPAGE", reason, url)`.
- That helper checks for an existing `AdminMessage` with
  `category="verification_generic_source"` and the listing id in
  the body, created in the last 14 days. If none, opens one new
  message:

```
category: "verification_generic_source"
subject:  "Generic-source URL on listing <id>"
body:     listing id + probed URL + content verdict + content reason
          + "HTTP probe returned 2xx. The verification badge is
             unchanged; this message is an internal review signal
             only."
status:   "OPEN"
```

When `GENERIC_HOMEPAGE` is the verdict but the HTTP status is NOT
2xx, the existing `classifyProbeOutcome` already routes to
`NEEDS_MANUAL_REVIEW` and the existing `maybeAutoFlag` handles it —
no double-flag.

## 7. How `LIKELY_WRONG_PAGE` is handled

Same pattern, different category:

```
category: "verification_wrong_page"
subject:  "Wrong-page hint on listing <id>"
body:     ... same shape ...
```

This catches the worst case from the P96-0 dry run: a listing that
returns 2xx but whose path contains a wrong-page hint (e.g.
Northwell's observership listing pointing at
`/consulting-advisory-services`).

## 8. How `LOGIN_REQUIRED` is handled

**Not handled in P96-1B.** Login wall detection requires a content
snippet, which the cron does not fetch. The classifier returns
`UNKNOWN` or `DEEP_PATH_NO_HINT` for login-walled URLs based on
URL-only data.

A future small PR can add a tiny GET-then-read-first-8KB step to
enable login detection (and richer `WRONG_PAGE` detection) without
broadly crawling. That work is outside P96-1B's scope.

## 9. AdminMessage categories used

P96-1 added: `cron_verification_failure`.
P96-1B adds: `verification_generic_source`, `verification_wrong_page`.

All three are deduped on the same 14-day window per listing per
category. None modify any other table. None send email. None
auto-hide listings.

## 10. Cron summary additions

The JSON returned by `GET /api/cron/verify-listings` now includes:

```jsonc
{
  // ... existing P96-1 fields ...
  "auto_flagged": <number>,
  "content_classified_generic": <number>,
  "content_classified_wrong": <number>,
  "content_classified_path_hint": <number>,
  "content_classified_deep_no_hint": <number>,
  "content_review_flagged": <number>,
  "distinct_hosts_seen": <number>
}
```

Admins can see at a glance how many of the day's checks landed on
each verdict bucket and how many new content-review flags were
opened.

## 11. `/admin/freshness` updates

Three new tiles under "Totals":

- **Generic-source flags (last 14d)** — `count(AdminMessage where
  category='verification_generic_source' AND createdAt >= now-14d)`
- **Wrong-page flags (last 14d)** — same shape, different category
- **Content-classifier flags (last 14d)** — sum of the two above

The existing recent-auto-flags table still shows
`cron_verification_failure` rows; classifier flags surface in their
own queue via `/admin/messages` filtered by category.

## 12. Tests run

```
npx tsx scripts/test-content-classifier.ts → 24/24 passed
                                             (was 16; added 8 P96-1B
                                              cron-invocation tests:
                                              URL+200+generic, URL+200+
                                              path keyword, URL+200+
                                              wrong-page path, URL+200+
                                              deep no hint, URL-only
                                              never returns LOGIN_REQUIRED,
                                              redirect supersedes,
                                              httpStatus=0 → SOURCE_DEAD,
                                              wrong-page beats keyword)
npx tsx scripts/test-host-throttle.ts      → 20/20 passed
npx tsc --noEmit                           → exit 0
npx eslint <changed files>                 → exit 0
```

`maybeContentReviewFlag` dedupe is **not** unit-tested directly —
it requires Prisma mocking. Documented as a deferred test gap; the
14-day window logic mirrors the verified-by-tests `maybeAutoFlag`
helper.

## 13. Risks

| Risk | Mitigation |
| --- | --- |
| Cron run that hits 25 listings all on generic homepages would create up to 25 new content-review AdminMessages in one day | 14-day dedupe per listing per category; subsequent days repeat-flag the same listings only after 14 days. Acceptable. |
| Path-only classification is conservative — misses content-driven wrong pages (e.g. a `/observership` URL that 200s but actually shows a press release) | Documented gap. P96-1C / P96-2 add body snippet for richer detection. |
| `DataVerification.notes` overloaded with structured-but-free-text markers | Single-line, regex-greppable. If `notes` ever becomes a structured field, migrate via a future schema PR. |
| `verification_generic_source` and `verification_wrong_page` flood `/admin/messages` | Same dedupe + admin can filter category. |
| New cron summary fields might break consumers expecting a fixed JSON shape | Cron callers (Vercel cron runner) ignore unknown fields. No external integrations consume the response shape. |

## 14. Deferred body-snippet / browser / screenshot work

Explicitly out of scope for P96-1B:

- **Body fetch.** Cron stays HEAD-with-GET-fallback-on-405. No
  read of `await res.text()`.
- **`LOGIN_REQUIRED` detection.** Requires snippet.
- **Richer `LIKELY_WRONG_PAGE` detection** (e.g. press-release
  pages on a program-named URL). Requires snippet.
- **Screenshot pipeline.** No headless browser installed.
- **Domain-match check.** Requires `Organization.websiteDomain`
  schema field.
- **Confidence score.** Requires content-side signals.

Each is queued for P96-1C, P96-2, or P96-3.

## 15. Rollback plan

The branch is local-only. Rollback options, ordered easiest first:

1. **Don't push.** Branch sits where it is; no production effect.
2. **Drop the `maybeContentReviewFlag` call site** by reverting the
   `if (classification.status === "VERIFIED" && ...)` block. Cron
   still invokes the classifier but stops opening new
   AdminMessages.
3. **Drop the classifier invocation entirely** by reverting the
   `classifyContent({...})` block + the `bumpContentVerdictCounter`
   call. Cron behaves identically to P96-1.
4. **Drop the freshness tiles** — three lines.
5. **Drop the new tests** — `git checkout HEAD~1 -- scripts/test-content-classifier.ts`.

No DB migration to roll back. No production data altered by any
local code path.

## 16. Can P96-2 begin?

**Yes — P96-2 is now safe to begin.** P96-1B's gates are all green:

- ✅ Cron invokes the classifier safely.
- ✅ HTTP 200 alone no longer implies a strong source — generic /
  wrong-page hits open admin-review messages.
- ✅ Generic homepage / weak source is internally visible (in
  `DataVerification.notes` + `AdminMessage` queue + freshness tile).
- ✅ Likely wrong page is internally visible.
- ✅ Login-required detection deferred (gate item #5 — explicitly
  noted as deferred). All other items met.
- ✅ No public copy overclaims verification.
- ✅ No schema migration introduced.
- ✅ No broad GET crawling introduced.
- ✅ Tests cover conservative classification mapping (24 tests, all
  pass).
- ✅ This report.

P96-2 should start with the **persisted screenshot pipeline
decision** (Playwright dev-dep vs Chrome-extension reconnect)
followed by a 25-listing sample audit using the now-richer
`DataVerification.notes` + `AdminMessage` queue as input data.

## 17. Hard rules confirmation

- ✅ No push, no PR, no merge, no deploy.
- ✅ No Vercel mutation, no `.vercel/project.json` edit.
- ✅ No `prisma/schema.prisma` edit, no migrations.
- ✅ No `prisma db push`, no seed.
- ✅ No production cron run.
- ✅ No production data mutation.
- ✅ No 25-listing or 304-listing audit performed.
- ✅ No screenshot pipeline introduced.
- ✅ No browser automation.
- ✅ No body scraping / broad GET crawling.
- ✅ No auto-unpublish, no auto-downgrade.
- ✅ No public copy / status overclaim.
- ✅ No #52, no `/career`, `/careers`, `/residency`, `/fellowship`,
  `/practice`.
