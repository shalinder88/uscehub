# Phase 3.3 — Verification Cron Design

Strategic checkpoint for PR 3.3. Written **before** implementation so the
classification table and DB-write contract get reviewed as a design
document, not as code.

## Scope

Add a daily Vercel Cron that walks a bounded batch of `Listing` rows,
HEAD-checks the most authoritative URL on each row, and updates Phase 3.2
verification fields based on the response.

Logs every attempt as a `DataVerification` row.

## Non-goals (explicit gates from the user)

| Gate | What this PR will NOT do |
|---|---|
| **No auto-hide on first failure** | Never sets `linkVerificationStatus = SOURCE_DEAD` from cron. Never flips `status = HIDDEN`. Never sets `linkVerified = false` based on a single response. |
| **No `/career` changes** | The waiver-jobs cron and its data file are untouched. |
| **No public-surface changes** | No UI components, no SEO files, no route changes other than the new cron API endpoint, no sitemap/robots/canonical/metadata/JSON-LD edits. |
| **No CRON_SECRET assumption** | Reuses existing `getCronSecret()` from `src/lib/env.ts`; functional verification of CRON_SECRET in Vercel is a **merge gate**, not a development gate. |

## Files added (4)

```
src/lib/link-verification.ts                         # pure classification fn
src/app/api/cron/verify-listings/route.ts            # cron endpoint
scripts/test-link-verification.ts                    # classification unit tests
docs/codebase-audit/PHASE_3_3_VERIFICATION_CRON_DESIGN.md  # this doc
```

## File modified (1)

```
vercel.json   # add 2nd cron entry (offset 1h from verify-jobs)
```

## Files NOT modified

- `prisma/schema.prisma` (Phase 3.2 already added all needed columns)
- `src/app/api/cron/verify-jobs/route.ts` (separate concern; static `WAIVER_JOBS`)
- Anything under `src/app/career/`
- Any UI component
- Any SEO file
- `package.json` (no new deps)

## URL selection rule

For each `Listing` row, the cron picks **one** URL to check, in this order:

1. `sourceUrl` — Phase 3.2's preferred field (program's official source page)
2. `applicationUrl` — fallback when no sourceUrl (program's apply page)
3. `websiteUrl` — legacy field, present on backfilled rows

If all three are NULL, the listing is skipped (no URL to verify against).

A single check per listing per run keeps the time budget predictable and
avoids ambiguity over which URL "speaks for" the listing's status.

## Classification table

Pure function: HTTP response → `(linkVerificationStatus, verificationFailureReason)`.

The route-level `probeUrl` performs a one-shot **HEAD→GET fallback when HEAD returns 405** (PR 3.3a). The outcomes in this table are the **final** HTTP outcomes after that fallback, not the raw HEAD outcome. A `405` row in the table therefore corresponds to "GET also returned 405", not "HEAD returned 405".

| Outcome from probe (final, post-fallback) | Set `linkVerificationStatus` to | Set `verificationFailureReason` to | `lastVerifiedAt` | Notes |
|---|---|---|---|---|
| 200–299 | `VERIFIED` | `null` | `now()` | Live URL. |
| 300–399 (after `redirect: follow`) | `VERIFIED` | `null` | `now()` | `fetch` follows redirects automatically; final 2xx counts as verified. Final URL recorded in `DataVerification.finalUrl`. |
| 401 | `NEEDS_MANUAL_REVIEW` | `"http_401_unauthorized"` | unchanged | Auth wall. Could be intentional (member-only career portal); a human must confirm. |
| 403 | `NEEDS_MANUAL_REVIEW` | `"http_403_forbidden"` | unchanged | Often bot blocking; could also be a real permission change. Human review. |
| 404 | `NEEDS_MANUAL_REVIEW` | `"http_404_not_found"` | unchanged | **Not auto-classified as `SOURCE_DEAD`** — single 404 may be a deploy artifact, redirect chain miss, or temporary unpublish. Repeated-failure escalation is a future PR. |
| 410 | `NEEDS_MANUAL_REVIEW` | `"http_410_gone"` | unchanged | Same conservative handling as 404. |
| 405 (Method Not Allowed, post-fallback) | `NEEDS_MANUAL_REVIEW` | `"http_4xx_405"` | unchanged | **PR 3.3a:** the probe already retried with GET and that also returned 405. Genuinely unusual — surface to human queue. The previous "405 → VERIFIED on HEAD-rejection inference" was rolled back so the audit row never reads as "405 verified." |
| 408 / abort | `REVERIFYING` | `"timeout_10s"` | unchanged | Tries again next day. |
| 5xx | `REVERIFYING` | `"http_5xx_<status>"` | unchanged | Server-side flake; tries again next day. |
| Network error / DNS / refused | `REVERIFYING` | `"network_error"` | unchanged | Tries again next day. |
| Other 4xx (e.g. 451) | `NEEDS_MANUAL_REVIEW` | `"http_4xx_<status>"` | unchanged | Unusual — surface to human queue. |

**`SOURCE_DEAD` is never set by this cron.** Per the user's gate: no
auto-hide on first failure. SOURCE_DEAD remains a state that only an
admin queue (PR 3.4) or a future repeated-failure escalator may emit.

**`PROGRAM_CLOSED` and `NO_OFFICIAL_SOURCE` are admin-only states.** This
cron never sets them.

## Listing field updates per outcome

| Field | When changed |
|---|---|
| `linkVerificationStatus` | always set per classification table |
| `lastVerificationAttemptAt` | always set to `now()` (every attempt, success or failure) |
| `lastVerifiedAt` | set to `now()` only when status becomes `VERIFIED`; otherwise unchanged (no lying) |
| `verificationFailureReason` | set per table — `null` on success, structured string on failure |
| `linkVerified` (legacy Boolean) | `true` on VERIFIED; `false` on NEEDS_MANUAL_REVIEW; **unchanged** on REVERIFYING (transient — never flap the existing "Verified" badge on a single network blip) |
| `status` | **never modified by this cron** (no auto-hide) |
| `websiteUrl` / `sourceUrl` / `applicationUrl` | **never modified by this cron** (no rewriting URLs) |

## DataVerification row written per attempt

```ts
{
  targetType: "listing",
  targetId: listing.id,
  verifiedBy: "system:cron-verify-listings",   // sentinel — verifiedBy is a free String, not a User relation
  sourceType: "OFFICIAL",                       // SourceType enum value matching auto-verified URL category
  sourceUrl: <url that was checked>,
  method: "CRON",                               // Phase 3.2 free-text — discriminator from manual/admin verifications
  statusBefore: <prior linkVerificationStatus>,
  statusAfter: <new linkVerificationStatus>,
  httpStatus: <HTTP code, or 0 for network error, or 408 for abort>,
  finalUrl: <after redirect follow, if redirected; else null>,
  errorMessage: <short string from classification, or null on VERIFIED>,
  notes: null,
}
```

This means **every** cron attempt produces an audit-trail row, even on
unchanged status. That's intentional — the row record is the only place
we'll see "we tried, network was flaky" later.

## Batching + ordering

```
Selection:
  WHERE listingType is any
    AND status = APPROVED                       -- don't waste budget on PENDING/REJECTED/HIDDEN
    AND linkVerificationStatus != NEEDS_MANUAL_REVIEW   -- already in human queue
    AND linkVerificationStatus != PROGRAM_CLOSED        -- admin terminal state
    AND linkVerificationStatus != NO_OFFICIAL_SOURCE    -- admin terminal state
    AND (sourceUrl IS NOT NULL OR applicationUrl IS NOT NULL OR websiteUrl IS NOT NULL)
  ORDER BY lastVerificationAttemptAt ASC NULLS FIRST
  LIMIT 25
```

- **Limit 25** — fits inside Vercel's 60s cron budget (5 batches × 5
  parallel HEADs × 10s timeout = 50s worst case).
- **NULLS FIRST** — listings that have never been verified come first,
  so onboarding new rows is fast.
- **NEEDS_MANUAL_REVIEW excluded** — those are in the (future PR 3.4)
  admin queue; re-checking them daily would churn the human review state
  pointlessly.
- **Daily schedule** — `0 9 * * *` UTC, 1h after the existing waiver-jobs
  cron at `0 8 * * *`. Daily × 25 rows → coverage cycle is "row count / 25"
  days. With ~306 backfilled listings, a full pass takes ≤13 days.

## Auth

Reuses the **exact same** pattern as `/api/cron/verify-jobs`:

```ts
const expectedSecret = getCronSecret();   // throws MissingEnvError in production if unset
const authHeader = request.headers.get("authorization");
if (process.env.NODE_ENV === "production") {
  if (authHeader !== `Bearer ${expectedSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
} else if (expectedSecret) {
  if (authHeader !== `Bearer ${expectedSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
// Dev with no secret: pass-through for local testing.
```

No new auth surface. CRON_SECRET is the same secret that already gates
`verify-jobs` — once it's verified working there (the merge gate), it
works here too.

## Idempotency

- Running the cron twice in the same minute updates the same 25 rows
  twice. `lastVerificationAttemptAt` advances each call, so the second
  call selects the next 25 rows. No row is corrupted by double-runs.
- A row whose status is already `VERIFIED` and whose check returns 200
  produces an unchanged status (statusBefore == statusAfter), but still
  writes a `DataVerification` audit row. That's the design.

## Failure modes considered

| Failure | Mitigation |
|---|---|
| All 25 listings have a slow URL → 25×10s = 4min serial | Batches of 5 in parallel — cap is 5×10s = 50s |
| Vercel cron timeout (60s) hits mid-batch | Whatever was committed in earlier batches stays committed; remaining listings get picked up next day (NULLS-FIRST ordering still favors stale ones) |
| `prisma` client init fails | Returns 500 with error JSON; no DB rows written; cron retries next day |
| `getCronSecret()` throws (CRON_SECRET unset in prod) | Route returns 500 at the first call into the helper — fails loud, exactly as the verify-jobs pattern intends |
| User-Agent gets blocked by a target site | That target's check returns 403/429; classification routes it to `NEEDS_MANUAL_REVIEW` (never `SOURCE_DEAD`) — operator sees the cluster in the queue and manually whitelists |
| Network blip during a batch | One failed HEAD → `REVERIFYING` for that one row; other rows in the batch are unaffected |

## Observability

Route returns JSON to any caller with valid bearer:

```json
{
  "timestamp": "2026-04-28T09:00:00.000Z",
  "checked": 25,
  "verified": 18,
  "needs_manual_review": 2,
  "reverifying": 5,
  "skipped_no_url": 0,
  "errors": 0,
  "details": [
    { "id": "...", "url": "...", "before": "VERIFIED", "after": "VERIFIED", "httpStatus": 200 },
    ...
  ]
}
```

Vercel's cron log captures this response; that's the audit surface for
the next 24h.

## What this PR is NOT

- **Not** an admin queue UI (that's PR 3.4).
- **Not** a real-time verification triggered from listing-detail pages
  (that's PR 3.5).
- **Not** a SOURCE_DEAD escalator. Repeated-failure escalation requires
  a separate state machine and is deferred until the human queue exists
  to validate it.
- **Not** a job-feed change. `WAIVER_JOBS` and its cron are untouched.

## Test plan

`scripts/test-link-verification.ts` — pure-function unit tests for the
classification fn in `src/lib/link-verification.ts`. Tests every row of
the classification table above. No network calls. No DB calls. Runnable
locally via `npx tsx scripts/test-link-verification.ts`.

Production functional verification of the route happens after merge:
1. Vercel deploys the change.
2. Manually `curl -H "Authorization: Bearer $CRON_SECRET" https://uscehub.com/api/cron/verify-listings` once.
3. Confirm 200 response with non-zero `checked` count and at least one
   row's `linkVerificationStatus` advancing from `UNKNOWN` to `VERIFIED`.
4. Confirm a corresponding `DataVerification` row exists.

If step 2 returns 401 → CRON_SECRET is misconfigured; that's the gate.

## SEO impact

```
SEO impact:
- URLs changed:        none (new API endpoint at /api/cron/verify-listings — not in sitemap, not crawled, not user-facing)
- redirects added:     none
- sitemap changed:     no
- robots changed:      no
- canonical changed:   no
- metadata changed:    no
- JSON-LD changed:     no
- pages noindexed:     none
- internal links:      none changed
- risk level:          ZERO — backend cron only, no public surface affected
```

## `/career` impact

None. `src/app/career/`, `src/lib/waiver-jobs-data.ts`,
`scripts/verify-jobs.ts`, and `src/app/api/cron/verify-jobs/route.ts` are
all untouched.
