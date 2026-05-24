# P96-1B — Implementation plan

Branch: `local/p96-1b-cron-content-classifier` (child of
`local/p96-1-verification-hardening`).

**No push, no PR, no deploy, no schema, no body scraping, no browser
automation.**

## 1. Where the classifier will be invoked

Inside the existing `verify-listings` cron's per-listing handler at
`src/app/api/cron/verify-listings/route.ts`, **after**
`classifyProbeOutcome` and **before** `maybeAutoFlag`. Specifically:

```ts
const outcome = await probeUrl(url);
const classification = classifyProbeOutcome(outcome);

// P96-1B insertion point ↓
const contentVerdict = classifyContent({
  url,
  httpStatus: outcome.httpStatus,
  finalUrl: outcome.finalUrl,
  // No contentSnippet — body fetch deferred to a future PR.
});
// P96-1B insertion point ↑

await applyClassification({...});
```

## 2. What data the cron currently has

After `classifyProbeOutcome` runs, the per-listing handler holds:

- `listing.id`, `listing.sourceUrl`, `listing.applicationUrl`,
  `listing.websiteUrl`, `listing.linkVerificationStatus`.
- `outcome.httpStatus`, `outcome.redirected`, `outcome.finalUrl`,
  `outcome.errorKind`.
- `classification.status` (the existing HTTP-only verdict),
  `classification.reason`.
- `url` — the probed URL via `pickProbeUrl`.

This is enough for URL/path/status classification. **No body text
is fetched** by today's cron.

## 3. Does cron fetch body text?

No. `probeUrl` does `HEAD` first; on a `405` it retries with `GET`
once. But neither path reads `await res.text()`, so the response
body is never available to user code. Reading the body would
require a separate `GET` call.

P96-1B **does NOT add body fetching.** Body-snippet classification
is deferred to a future PR (P96-1C or P96-2 prereq). The user's
prompt explicitly forbids broad GET crawling here.

## 4. URL/path/title/status-only invocation

The classifier is invoked with:

| Field | Value |
| --- | --- |
| `url` | The probed URL (`sourceUrl > applicationUrl > websiteUrl`) |
| `httpStatus` | From `outcome.httpStatus` |
| `finalUrl` | From `outcome.finalUrl` (post-redirect) |
| `contentSnippet` | **Omitted.** No body fetch. |

The `classifyContent` function already handles a missing snippet:
it falls back to URL/path-only classification with `LIKELY_WRONG_PAGE`,
`GENERIC_HOMEPAGE`, `PATH_HINTS_PROGRAM`, `DEEP_PATH_NO_HINT`
verdicts. `LOGIN_REQUIRED` requires a snippet so it stays
deferred — login walls cannot be detected by URL alone.

## 5. Safe representation of classifier output

The cron does **not** introduce new schema enum values. It also
does **not** modify the existing `Listing.linkVerificationStatus`
beyond what `classifyProbeOutcome` already does. The classifier's
verdict is recorded in two places, both internal:

1. **`DataVerification.notes`** — the existing free-text column on
   the per-event audit row. Becomes a structured one-liner:
   `content_verdict=<bucket>;reason=<reason>`. Pure read-side; no
   public surface uses `notes`.
2. **`AdminMessage`** — when the verdict is one of the
   internal-review buckets (`GENERIC_HOMEPAGE`, `LIKELY_WRONG_PAGE`),
   `maybeContentReviewFlag` opens a deduped `AdminMessage` with a
   structured category (see §6).

Public-facing fields (`linkVerificationStatus`, `lastVerifiedAt`,
`linkVerified`) **stay under the existing classifier's control.**
P96-1B does not weaken or strengthen them based on the content
verdict — that crosses the public-meaning line.

## 6. Internal-only AdminMessage categories

P96-1 already added `cron_verification_failure` for 3-failure
streaks. P96-1B adds two new categories, only created when the
content classifier downgrades an HTTP-200 source:

| Category | Trigger |
| --- | --- |
| `verification_generic_source` | Content verdict is `GENERIC_HOMEPAGE` AND HTTP status is 2xx (the worst case: cron says VERIFIED, classifier says generic) |
| `verification_wrong_page` | Content verdict is `LIKELY_WRONG_PAGE` AND HTTP status is 2xx (cron says VERIFIED, classifier says wrong-page hint) |

Dedupe rules match `cron_verification_failure`:
- 14-day window per listing per category
- Body marker contains the listing id
- Failures inside the helper are swallowed

`PATH_HINTS_PROGRAM` and `DEEP_PATH_NO_HINT` do **not** create
messages. The first is a positive signal (no action needed); the
second is the default for "we don't know yet" (would flood the
queue).

`LOGIN_REQUIRED` is not creatable from URL-only classification, so
no message is generated for it in P96-1B.

## 7. `/admin/freshness` extension

If clean, add three new tiles under "Totals":

- "Generic-source flags (last 14d)"
- "Wrong-page flags (last 14d)"
- "Total content-classifier flags (last 14d)"

Reads `AdminMessage` count by category in the dedupe window. Same
read-only/admin-gated semantics as the existing page.

## 8. Rollback plan

Branch is local-only.

- **Don't push.** Branch sits where it is; no production effect.
- **Drop the classifier invocation** by reverting the
  `classifyContent({...})` block + the `maybeContentReviewFlag` call
  in the cron route. The pure helper is unaffected.
- **Drop the freshness extension** by reverting the three tiles.
- **Delete the new tests** if needed.

No DB migration. No production data altered by any local code path.

## 9. Test plan

New tests added to `scripts/test-content-classifier.ts` (or a new
focused test file):

1. URL-only invocation with no snippet returns `GENERIC_HOMEPAGE`
   for root path.
2. URL-only invocation with no snippet returns `PATH_HINTS_PROGRAM`
   for path-keyword match.
3. URL-only invocation returns `LIKELY_WRONG_PAGE` for path with
   wrong-page hint.
4. URL-only invocation returns `DEEP_PATH_NO_HINT` for deep path
   with no keyword.
5. URL-only invocation does NOT return `LOGIN_REQUIRED` (requires
   snippet).
6. Invalid URL returns `UNKNOWN`.

(All six are already covered by the existing 16 tests; nothing
new is needed in the helper.)

New cron-side test for `maybeContentReviewFlag` dedupe: not added
inline — would require Prisma mocking. Documented as a deferred
test gap.

Existing tests must continue to pass:
- 16/16 content classifier tests
- 20/20 host throttle tests
- `tsc --noEmit` exit 0
- `eslint` on changed files exit 0
