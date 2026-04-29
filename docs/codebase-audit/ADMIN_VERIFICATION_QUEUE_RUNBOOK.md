# Admin verification queue — operator runbook

**Status:** operational doc.
**Authority:** lower than [RULES.md](RULES.md) and [SEO_PRESERVATION_RULES.md](SEO_PRESERVATION_RULES.md).
**For:** the human or future agent acting as the admin reviewer at `/admin/verification-queue` (the surface shipped in PR #12).

This runbook explains **when** to pick each action button and **what** the action does to the underlying records. It is the operator-facing companion to [PHASE3_DATA_QUALITY_VERIFICATION_PLAN.md](PHASE3_DATA_QUALITY_VERIFICATION_PLAN.md) §5 PR 3.4 (which covers the queue's design) and [CRON_HEALTH_CHECK_RUNBOOK.md](CRON_HEALTH_CHECK_RUNBOOK.md) (which covers the cron's discipline checks).

## How to reach the queue

Sign in as an `ADMIN` user, then visit `/admin` → sidebar → **Verification Queue**. The page lives at `/admin/verification-queue` and is gated by `src/app/admin/layout.tsx` (redirects non-ADMIN to `/dashboard`, redirects unauthenticated to `/auth/signin`). The route also has `metadata: { robots: { index: false, follow: false } }` from the admin layout, so it is never crawled.

## What the page shows

Three queue sources, in order:

1. **User-reported flags** — `FlagReport` rows with `status` `OPEN` or `IN_REVIEW`. Each row includes the reporter, the free-text reason, the structured `kind` (`BROKEN_LINK`, `WRONG_DEADLINE`, etc.), and — when the flag targets a listing — the linked listing's current verification status, recent `DataVerification` rows, and source URL.
2. **Listings the cron flagged for manual review** — listings whose `linkVerificationStatus` is `NEEDS_MANUAL_REVIEW`. These are NOT user-reported; they are the result of the cron probing the URL and getting a 4xx/5xx (per the conservative-by-design cron contract from PR #11). Cron does NOT auto-create FlagReports — these listings only show up in this section, not the flags section.
3. **Aged REVERIFYING listings** — listings stuck in `REVERIFYING` longer than 14 days. Optional triage; usually transient errors that should self-heal on the next clean tick.

## Rule of thumb

Before clicking any action, **open the source URL in a new tab and check it yourself.** The cron's signal is "URL returned 4xx/5xx on HEAD"; the admin's signal is "I went to the URL and saw what's there." The two are not interchangeable. The browser may show a working page when HEAD returns 405; the URL may return 200 but content shows the program is closed; etc.

The queue surfaces evidence; you provide judgement. Every action below is audit-logged via `AdminActionLog` (and `DataVerification` when the listing's verification status changes), so the trail is recoverable.

## Flag actions (when the row is a user-submitted FlagReport)

### `Mark in review`

**When:** you opened the flag, took an initial look, but cannot decide yet — e.g. you need to email the program coordinator, or you want to spot-check after the next cron tick.

**What it does:**
- `FlagReport.status` → `IN_REVIEW`
- The flag stays in the queue (the queue selects `OPEN` or `IN_REVIEW`).
- `AdminActionLog` row written with action `verification_queue.flag.in_review`.
- The linked listing is **not** modified.

**Avoid:** using this as a permanent parking state. After ~14 days an `IN_REVIEW` flag should be moved to a terminal state (`RESOLVED` or `DISMISSED`).

### `Resolve: working`

**When:** you opened the source URL and confirmed the listing's official source page is live and accurate. The flag was a false positive (or the program fixed the link in the meantime).

**What it does:**
- `FlagReport.status` → `RESOLVED`, `resolvedAt = NOW`, `resolvedBy = <your admin user id>`.
- Linked listing's `linkVerificationStatus` → `VERIFIED`, `linkVerified` → `true`, `lastVerifiedAt` → `NOW`, `verificationFailureReason` → `null`.
- A `DataVerification` row is written: `method = "MANUAL"`, `verifiedBy = "admin:<your userId>"`, `statusBefore` and `statusAfter` recorded, `httpStatus` and `finalUrl` are `null` (the admin did not HTTP-probe the URL — they verified by judgement).
- `AdminActionLog` rows for the flag-resolution and the listing-status update.

**Use when:** browser load was clean, page identifies the program clearly, and the application path is reachable.

### `Resolve: source dead`

**When:** you opened the source URL and the page genuinely no longer exists or is unreachable in a way the program can't fix soon (DNS gone, redirected to a generic placeholder, persistent 404). Different from a transient 5xx — this is "the program's link is gone."

**What it does:**
- `FlagReport.status` → `RESOLVED`, `resolvedAt`, `resolvedBy`.
- Linked listing's `linkVerificationStatus` → `SOURCE_DEAD`, `linkVerified` → `false`, `lastVerifiedAt` **unchanged** (no fake forward-dating on a failure transition), `verificationFailureReason` → `null` (the next cron tick won't touch it because `NEEDS_MANUAL_REVIEW` is excluded from selection — but `SOURCE_DEAD` is also excluded).
- `DataVerification` and `AdminActionLog` rows written.
- The listing remains visible (no auto-hide). Its public badge changes from green/slate to soft amber "Source not yet verified" via the conservative mapping in `src/lib/listing-display.ts` (admin-only states deliberately render as `unverified` until a richer badge variant lands).
- The destructive-action confirm dialog is required client-side.

**Avoid:** using this for transient outages. Use `Mark in review` and re-check tomorrow if you suspect the program just deployed something temporarily broken.

### `Resolve: program closed`

**When:** you confirmed via the source URL (or an email reply, or a public announcement) that the program itself is no longer running. Different from "URL is dead" — this is "the program is dead."

**What it does:**
- `FlagReport.status` → `RESOLVED`.
- Linked listing's `linkVerificationStatus` → `PROGRAM_CLOSED`, same patch shape as SOURCE_DEAD (`linkVerified` false, `lastVerifiedAt` unchanged).
- `DataVerification` + `AdminActionLog` rows.
- Listing remains visible by default. A future PR will likely filter `PROGRAM_CLOSED` out of `/browse` grids and the sitemap (per [PHASE3_DATA_QUALITY_VERIFICATION_PLAN.md](PHASE3_DATA_QUALITY_VERIFICATION_PLAN.md) §8); until then, the public badge is "Source not yet verified."
- Destructive-action confirm required.

**Use when:** the institution announced the program ended, or the program coordinator confirmed it via email.

### `Dismiss`

**When:** the flag is invalid — duplicate, spam, off-topic, or "I don't agree with the URL but it isn't actually broken or wrong."

**What it does:**
- `FlagReport.status` → `DISMISSED`, `resolvedAt`, `resolvedBy`.
- Linked listing is **not** modified.
- `AdminActionLog` row.

**Use when:** there was no real problem to resolve. Document the reasoning by passing `notes` if the API supports it (the API accepts a `notes` field; the UI doesn't currently expose it — feel free to extend the page if you find this gap blocking).

## Listing actions (when the row is a cron-flagged or aged listing, not a user flag)

These appear under "Listings the cron flagged for manual review" and "Aged REVERIFYING listings". The same action set is also reachable per-listing from the flag context above when the action implies a listing change.

### `Mark verified`

**When:** the cron classified the listing `NEEDS_MANUAL_REVIEW` (typically after a 4xx/5xx), but you opened the URL and it works. Common cause: 405-returning servers that do not accept HEAD even though GET works fine — PR #11 added a HEAD→GET fallback for the 405 case, but other servers may still return atypical 4xx codes that the cron classifies conservatively.

**What it does:** identical patch to "Resolve: working" minus the FlagReport mutation (this is a direct listing action, no flag exists).

### `Mark needs review`

**When:** rare. Use to re-park a previously-resolved listing back in the human queue if you discover a problem the cron didn't catch.

**What it does:**
- Listing `linkVerificationStatus` → `NEEDS_MANUAL_REVIEW`, `linkVerified` → `false`.
- `lastVerifiedAt` unchanged.
- `DataVerification` + `AdminActionLog`.

The cron's selection rule excludes `NEEDS_MANUAL_REVIEW` listings, so this listing will not be re-probed automatically. It will sit in the queue until you act on it.

### `Mark source dead`, `Mark program closed`, `Mark no official source`

Same effects as the corresponding "Resolve:" flag actions, minus the flag mutation. Each requires the destructive-action confirm dialog client-side.

`Mark no official source` is a third admin-only state. **When:** you confirmed the listing's URL is community-aggregated content (a Reddit thread, a coaching blog, an unaffiliated site) rather than an official program page. Set this so the public knows the URL is not institution-endorsed.

## What the admin can NOT do via this queue

By design:

- **Hide or delete listings.** `Listing.status` (APPROVED / PENDING / REJECTED / HIDDEN) is never modified by `/api/admin/verification-queue`. Hiding is a separate concern at `/admin/listings`.
- **Rewrite URLs.** `sourceUrl`, `applicationUrl`, `websiteUrl` are never modified.
- **Set fake dates.** `lastVerifiedAt` only advances on `VERIFIED`; admin-set failures (`SOURCE_DEAD`, `PROGRAM_CLOSED`, `NO_OFFICIAL_SOURCE`, `NEEDS_MANUAL_REVIEW`) leave it unchanged.
- **Bypass the audit log.** Every action writes `AdminActionLog`; every listing-status change writes `DataVerification` atomically with the listing update via `prisma.$transaction`.
- **Send emails or trigger webhooks.** The queue is admin-internal only.

## Cross-references

- [PHASE3_DATA_QUALITY_VERIFICATION_PLAN.md](PHASE3_DATA_QUALITY_VERIFICATION_PLAN.md) §5 PR 3.4 — design contract for the queue.
- [PHASE_3_3_VERIFICATION_CRON_DESIGN.md](PHASE_3_3_VERIFICATION_CRON_DESIGN.md) — what the cron writes (the upstream the queue triages).
- [CRON_HEALTH_CHECK_RUNBOOK.md](CRON_HEALTH_CHECK_RUNBOOK.md) — how to confirm the cron is behaving inside its contract before triaging individual rows.
- `src/app/api/admin/verification-queue/route.ts` — server-side handler. Read this before extending the action set.
- `src/app/admin/verification-queue/page.tsx` — client page. Read this before extending the UI.

## SEO impact of this doc

```
SEO impact:
- URLs changed:        none
- redirects added:     none
- sitemap changed:     no
- robots changed:      no
- canonical changed:   no
- metadata changed:    no
- JSON-LD changed:     no
- pages noindexed:     none (admin layout already sets robots noindex)
- internal links:      none changed
- risk level:          ZERO — internal docs only
```

## /career impact of this doc

None.
