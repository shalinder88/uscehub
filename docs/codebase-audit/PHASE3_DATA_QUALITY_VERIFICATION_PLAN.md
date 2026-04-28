# Phase 3 Data Quality and Verification Engine Plan

**Status:** planning doc only. No source, schema, route, SEO, `/career`, or migration changes.
**Authority:** lower than [RULES.md](RULES.md) and [SEO_PRESERVATION_RULES.md](SEO_PRESERVATION_RULES.md). Where this doc and either of those disagree, they win. This doc governs WHAT and IN WHAT ORDER Phase 3 ships.
**Implementation rule:** documenting a PR here is **not** authorization to implement it. Each numbered PR (3.1 through 3.6) requires explicit user approval before its branch is opened, especially PR 3.2 (schema migration).

---

## Shipped PR 3.3 contract update

PR #9 shipped the conservative cron contract. This supersedes any earlier planning language suggesting automated `SOURCE_DEAD` transitions or automated `FlagReport` creation. Where the body of this plan and this section disagree, this section wins.

Current shipped cron behavior (`/api/cron/verify-listings`, commit `05202ed`):

- runs daily at `0 9 * * *` UTC
- processes a bounded cap of **25 listings per run**
- orders by `lastVerificationAttemptAt ASC NULLS FIRST` (no strict 7-day floor)
- probes one URL per listing, priority `sourceUrl > applicationUrl > websiteUrl`
- HEAD first; on **HTTP 405** the probe retries once with GET (PR 3.3a) so an audit row never reads as "405 verified" via HEAD-rejection inference. Classification works on the final post-fallback status; `405` post-fallback → `NEEDS_MANUAL_REVIEW`.
- writes one `DataVerification` row per attempt (`method = "CRON"`, `verifiedBy = "system:cron-verify-listings"`, `targetType = "listing"`)
- updates `lastVerificationAttemptAt` on every attempt
- sets `lastVerifiedAt` **only** on `VERIFIED`
- can set only:
  - `VERIFIED`
  - `REVERIFYING`
  - `NEEDS_MANUAL_REVIEW`
- **cannot** set:
  - `SOURCE_DEAD`
  - `PROGRAM_CLOSED`
  - `NO_OFFICIAL_SOURCE`
- never hides or deletes listings
- never modifies `Listing.status`
- never rewrites `sourceUrl` / `applicationUrl` / `websiteUrl`
- **never creates `FlagReport` automatically**
- preserves the legacy `linkVerified` Boolean unchanged on transient `REVERIFYING` (no badge flap on a single network blip); flips to `true` on `VERIFIED`, `false` on `NEEDS_MANUAL_REVIEW`
- does not fake verification dates

### PR 3.4 implication

The admin verification queue must source from **all** of:

1. user-submitted `FlagReport` items (`OPEN`, `IN_REVIEW`)
2. listings with `linkVerificationStatus = NEEDS_MANUAL_REVIEW`
3. optionally, listings stuck in `REVERIFYING` past an admin-defined age threshold

PR 3.4 must not be built assuming cron-created flags exist — they do not. Relying solely on `FlagReport` as the queue source would miss every cron-detected failed link.

The admin actions that set `SOURCE_DEAD`, `PROGRAM_CLOSED`, or `NO_OFFICIAL_SOURCE` remain valid (per §6 below) — those are **manual** transitions, gated on explicit admin action.

---

## 1. Strategic decision

The next real product layer is data quality and verification — not conversion architecture.

### Why

USCEHub's moat is not just *having* listings. It is **verified, current, source-linked, reproducible information**. The trust UI we shipped in cleanup-foundation + Phase 1 + Phase 2 ("Verified link" pill, "We are re-verifying" disclaimer, "Report broken link" affordance) makes promises the underlying data layer cannot keep:

- `Listing.linkVerified` is a single Boolean. There is no `lastVerifiedAt`, no status enum, no audit log.
- The cron route at `src/app/api/cron/verify-jobs/route.ts` HEAD-checks `WAIVER_JOBS` (a TS file, protected `/career` data) but does **not** verify `Listing` records.
- The "Report broken link" button POSTs to `/api/flags` which writes a `FlagReport` row, but no admin workflow exists to triage those reports back into a status change on the listing.
- Every "Verified" badge currently shown is therefore a soft promise. If a user clicks one and gets a 404, the moat collapses for that user instantly.

Every major future phase **structurally depends on** real verification:

- Programmatic SEO (blueprint Phase 5) without verification = AI-spam Google penalizes.
- Email alerts ("Get notified when verified observerships open in your specialty") need a real understanding of what is verified.
- Saved/compare features need trustworthy status fields.
- Institution outreach needs a reason for institutions to claim and update listings.
- Match Prep / Career Path / fellowship content needs the same sourcing discipline.
- Monetization (attorney sponsorships, recruiter directory) cannot be sold to professional buyers if the data underneath is theatrical.

**Therefore:** conversion architecture (saved programs, compare, email capture, lead magnets) is **deferred** until the verification layer has a real plan and an initial implementation path. Conversion is not abandoned — it becomes much stronger once it can be built on top of a verified-data substrate.

### What this doc is NOT

- Not a fellowship plan
- Not a monetization plan
- Not a UI redesign
- Not a `/career/jobs` performance fix (still gated on separate `/career` authorization)
- Not a programmatic SEO expansion

---

## 2. Current state (honest accounting)

### What exists today

| Layer | What's there | What's missing |
|---|---|---|
| `Listing.linkVerified` (Boolean) | Per-listing flag, set manually at seed time or admin edit | No timestamp, no enum, no log of when/by whom |
| `Listing.websiteUrl` (String?) | Source URL field (used by `decideListingCta` to generate "Apply Now" / "View Official Source") | No distinction between **source** URL (program info page) and **application** URL (where users submit) |
| `Listing.adminNotes` (String?) | Free-text admin notes | Not surfaced anywhere; not structured |
| `FlagReport` model | `type`, `targetId`, `reporterId`, `reason` (free text), `status` (OPEN/REVIEWED/RESOLVED/DISMISSED), `adminNotes`, timestamps | No `kind` enum (broken_link / wrong_deadline / program_closed / etc.); no `sourceUrl` field; no `resolvedAt`/`resolvedBy` |
| `FlagStatus` enum | `OPEN`, `REVIEWED`, `RESOLVED`, `DISMISSED` | Missing `IN_REVIEW` (the "I'm working on this" intermediate state) |
| `VerificationStatus` enum | `UNVERIFIED`, `PENDING`, `APPROVED`, `REJECTED` | **Currently used for poster/organization verification, not listing-link verification.** Naming collision avoided by introducing a *new* enum (see §3). |
| `DataVerification` model | `targetType`, `targetId`, `verifiedBy`, `sourceType` (OFFICIAL/COMMUNITY/SELF_REPORTED), `sourceUrl`, `notes`, `createdAt` | Aspirational per audit P1-12 — **never used by any code path**. Perfect to activate as the verification log. |
| Cron route `/api/cron/verify-jobs` | Schedules at `0 8 * * *` (daily 8am UTC), HEAD-checks every URL in `WAIVER_JOBS`, batches of 5, 10s timeout, auth via `CRON_SECRET` | **Does not check `Listing` URLs.** Does not write back to DB. Does not emit verification log entries. |
| `/admin/flags` page | Lists existing FlagReport rows | No structured filters by kind; no triage workflow; no listing-status update path; no audit log of admin actions on flags |
| `<Analytics />` from `@vercel/analytics/next` | Mounted in `src/app/layout.tsx` | No event taxonomy, no `track()` wrapper, no domain-level event names. Vercel auto-tracks pageviews; nothing else. |
| `<ReportBrokenLinkButton>` (Phase 1) | POSTs to `/api/flags` with `reason: "[broken_link] ..."` for authed users; mailto fallback for unauth | No way to query "show me only [broken_link] reports" — admin sees the prefix in the free-text reason but cannot filter |
| `<TrustBadges>` (poster trust) | Renders based on `Organization.verificationStatus`, `Organization.institutionalEmail`, `Listing.poster.posterProfile.npiNumber` | Working as designed — left alone in Phase 3 |
| `<ListingTrustMetadata>` (Phase 2) | Renders verification badge + report-broken-link in listing-detail sidebar | `lastVerified` prop accepted but currently passed `null` (no real DB field) |

### What is NOT broken

- Public content remains free and crawlable
- No fake "Last verified <date>" text anywhere (we explicitly skip the prop)
- Canonical host alignment is correct (apex authoritative, www → 308 → apex)
- Sitemap entries are honest (no removed routes)
- `/career` data and routes preserved

### What IS misleading without Phase 3

- Calling something "Verified" without a verification log
- Showing the "Verified link" pill on listings whose source URL has not been HEAD-checked in the last N days
- The disclaimer text says "we are re-verifying" but no scheduled re-verification of Listings actually runs

---

## 3. Data model target

This section defines the **target shape**, not implementation. PR 3.2 will materialize most of it as a single migration.

### Listing-level new/refined fields

| Field | Type | Purpose | Default |
|---|---|---|---|
| `sourceUrl` | `String?` | Official program info page (program-owned). Used as the verification target. | NULL initially; backfill from `websiteUrl` |
| `applicationUrl` | `String?` | Where users submit (may be same as sourceUrl, may differ for programs that have separate "info" vs "apply" pages). Used by CTA. | NULL initially; backfill from `websiteUrl` |
| `linkVerificationStatus` | `LinkVerificationStatus` enum | Per-link verification state (see enum below) | `UNKNOWN` |
| `lastVerifiedAt` | `DateTime?` | Most recent successful verification | NULL until first cron run |
| `lastVerificationAttemptAt` | `DateTime?` | Most recent verification attempt regardless of outcome — drives "Verified <relative-time>" rendering even when status didn't change | NULL until first cron run |
| `verificationFailureReason` | `String?` | One of: HTTP_4XX, HTTP_5XX, TIMEOUT, NETWORK_ERROR, BLOCKED_BY_BOT_PROTECTION, REDIRECT_LOOP, NEEDS_MANUAL_REVIEW, free-text fallback | NULL when status=VERIFIED |

### Backward compatibility

- `Listing.linkVerified` (Boolean) is **kept** during PR 3.2 for backward compat. PR 3.2 derives it from `linkVerificationStatus === 'VERIFIED'` via a generated/computed pattern OR populates both during the migration. PR 3.5 may eventually drop the Boolean — gated on user authorization.
- `Listing.websiteUrl` is **kept**. PR 3.2 introduces `sourceUrl` and `applicationUrl` as new fields, populates them from `websiteUrl` for existing rows, and routes new code through the new fields. The existing `decideListingCta()` helper continues to read `websiteUrl` until a Phase 3.5 follow-up updates the input shape.

### LinkVerificationStatus enum (new — separate from existing `VerificationStatus`)

Naming chosen specifically to avoid collision with the existing `VerificationStatus` enum used for poster/organization verification. Both enums coexist; they describe different objects.

```
enum LinkVerificationStatus {
  UNKNOWN              // never checked yet
  VERIFIED             // last check succeeded
  REVERIFYING          // explicit admin/cron flag while a recheck is in progress
  SOURCE_DEAD          // admin-only; cron cannot set this state. Set manually after triage of NEEDS_MANUAL_REVIEW or BROKEN_LINK FlagReport.
  PROGRAM_CLOSED       // admin-confirmed: official source says program is no longer running
  NO_OFFICIAL_SOURCE   // listing has only a community/self-reported source, no institutional URL
  NEEDS_MANUAL_REVIEW  // automated check ambiguous, admin must triage
}
```

### Verification log model — activate `DataVerification`

The existing `DataVerification` model (audit P1-12, aspirational) is repurposed:

- `targetType` = "listing" (or future "waiver_job", "program", etc.)
- `targetId` = listing CUID
- `verifiedBy` = "system" (for cron), admin user ID (for manual), or "user_report" (when verification was triggered by a flag)
- `sourceType` = OFFICIAL / COMMUNITY / SELF_REPORTED (existing enum)
- `sourceUrl` = the URL that was checked
- `notes` = free-text reason / HTTP status / admin commentary
- `createdAt` = when the verification was attempted

PR 3.2 may add fields if needed:
- `method` enum (AUTOMATED / MANUAL / USER_REPORT)
- `statusBefore`, `statusAfter` — both `LinkVerificationStatus` for clear before/after audit trail
- `httpStatus` Int? — final HTTP status code observed
- `finalUrl` String? — URL after redirect chain

### FlagReport refinements

Add structured `kind` field with a new enum:

```
enum FlagKind {
  BROKEN_LINK
  WRONG_DEADLINE
  PROGRAM_CLOSED
  INCORRECT_INFO
  DUPLICATE
  SPAM_OR_FAKE
  OTHER
}
```

Add `kind FlagKind @default(OTHER)`, `sourceUrl String?`, `resolvedAt DateTime?`, `resolvedBy String?` to FlagReport. Existing `reason` (free text) stays — it's user commentary, not the structured signal.

`FlagStatus` enum: add `IN_REVIEW` between `OPEN` and `REVIEWED`.

---

## 4. Verification principles

These principles override convenience. They constrain what the verification engine is allowed to do.

1. **No fake `lastVerifiedAt` values.** Don't backfill with `createdAt`, `updatedAt`, or any constant. NULL means "never verified." That's the honest answer.
2. **`updatedAt` is not `lastVerifiedAt`.** They mean different things. A listing that had its `adminNotes` field edited is not "verified" by that edit.
3. **Source URL ≠ Application URL.** A program's info page and its application form may live on different hostnames. Verifying one does not verify the other. PR 3.2 introduces both fields.
4. **Verified means an *official source* was checked.** Community-submitted URLs are not "verified" until an admin confirms the institution actually owns the page.
5. **Automated HTTP 200 is necessary but not sufficient.** A 200 response means the URL serves *something*. It does not mean the *program* is current. Initial cron checks can mark listings as VERIFIED only if they were previously VERIFIED (i.e., periodic re-check). First-time verification of a brand-new listing requires admin action OR multiple successful checks over time. PR 3.3 will codify this rule.
6. **`SOURCE_DEAD` is admin-only.** The shipped PR #9 cron cannot transition a listing to `SOURCE_DEAD`. Repeated cron failures on a 4xx/5xx classify the listing as `NEEDS_MANUAL_REVIEW` (single failure is sufficient); transient errors classify as `REVERIFYING`. Admin reviews the queue and chooses whether to set `SOURCE_DEAD`. One failed HEAD never hides a listing.
7. **`PROGRAM_CLOSED` requires admin confirmation.** Automated checks cannot set this status. They can flag for manual review only.
8. **`NO_OFFICIAL_SOURCE` requires admin determination.** Listings whose URL points to a Reddit thread, blog post, or community-aggregated content are NO_OFFICIAL_SOURCE.
9. **Public badges must reflect real status.** No "Verified link" pill for listings with `linkVerificationStatus !== VERIFIED`.
10. **Admin overrides must be logged.** Every status change writes a `DataVerification` row with `verifiedBy = <admin user ID>`, `method = MANUAL`, before/after status, and notes.
11. **User reports enter the review queue, not the live status.** A user reporting "broken link" creates a `FlagReport` with `kind = BROKEN_LINK`. It does NOT auto-flip the listing to `SOURCE_DEAD`. Admin reviews and decides.
12. **Public hiding requires admin action**, not automated checks. Cron classifies repeated failures as `NEEDS_MANUAL_REVIEW` (4xx/5xx) or `REVERIFYING` (transient). Admin manually sets `SOURCE_DEAD` (and may then choose to hide) via the verification queue. The listing remains visible throughout cron-driven status transitions.

---

## 5. PR sequence

Six PRs, each preview-mergeable, each independently reversible. Same rhythm as cleanup foundation and Phase 1+2.

### PR 3.1 — Analytics / event taxonomy foundation

**Branch:** `phase3/01-analytics-events`
**Schema change:** none.
**Behavior change:** none user-facing.

**Adds:**
- `src/lib/analytics.ts` — thin `track(eventName, properties?)` wrapper around the existing `@vercel/analytics/next` package. Type-safe event names from a const union.
- Event taxonomy (initial set):
  - `listing_view` — fired by listing-detail SSR via a small client-side mount
  - `source_click` — fired when CTA button is clicked
  - `cta_click` — generic; for CTAs that are not source links (e.g., "Contact to Apply" mailto)
  - `broken_link_report` — fired by `<ReportBrokenLinkButton>` on submit
  - `flag_button_click` — fired by `<FlagButton>` on open (separate signal)
  - `verification_badge_seen` — fired when a `<ListingVerificationBadge>` mounts (rate-limited)
  - `browse_filter_used` — fired when user changes a filter
  - `search_submitted` — fired when smart-search executes
  - Future event names (left as comments): `save_click`, `compare_add`, `email_signup`
- `useTrack()` hook for client components

**Privacy guardrails (encoded as comments + helper validation):**
- No PII in event properties. The `track()` wrapper has a TS interface that explicitly disallows email/phone/visa/SSN-shaped strings in properties.
- No immigration-sensitive data in payloads.
- Listing IDs and verification statuses are OK; user emails and names are NOT.
- No client-side secret exposure.

**Acceptance:**
- `track()` is type-safe; calling with an unknown event name fails at typecheck
- All existing pages still build/typecheck/lint clean
- No UI behavior change
- Vercel Analytics still receives pageviews (unchanged)

### PR 3.2 — Schema migration for verification fields

**Branch:** `phase3/02-verification-schema`
**Schema change:** YES — Prisma migration generated.
**Behavior change:** none user-facing in this PR.

**Requires explicit user approval before branch opens.**

**Adds:**
- `LinkVerificationStatus` enum (the 7 states from §3)
- `FlagKind` enum (the 7 kinds from §3)
- New fields on `Listing`:
  - `sourceUrl String?`
  - `applicationUrl String?`
  - `linkVerificationStatus LinkVerificationStatus @default(UNKNOWN)`
  - `lastVerifiedAt DateTime?`
  - `lastVerificationAttemptAt DateTime?`
  - `verificationFailureReason String?`
- New fields on `FlagReport`:
  - `kind FlagKind @default(OTHER)`
  - `sourceUrl String?`
  - `resolvedAt DateTime?`
  - `resolvedBy String?`
- `FlagStatus` enum: add `IN_REVIEW` value
- `DataVerification` model: add `method` enum (AUTOMATED/MANUAL/USER_REPORT), `statusBefore` and `statusAfter` LinkVerificationStatus fields, `httpStatus Int?`, `finalUrl String?`

**Backward compatibility:**
- `Listing.linkVerified` (Boolean) **kept** in this PR. Migration script populates `linkVerificationStatus = VERIFIED` for rows where `linkVerified = true`, else `UNKNOWN`. Backfills `sourceUrl = websiteUrl` and `applicationUrl = websiteUrl` for existing rows.
- `Listing.websiteUrl` **kept**. Existing code paths continue to read it. PR 3.5 may eventually deprecate.
- All existing application code (CTA decisions, listing card rendering, etc.) compiles unchanged.

**Acceptance:**
- `npx prisma migrate dev` on a shadow DB succeeds
- Migration is reversible (no destructive operations like dropping columns or truncating tables)
- Existing data preserved; spot-check at least 10 listings post-migrate
- `prisma/seed.ts` updated only to populate the new fields with safe defaults (no fake dates, no fake statuses)
- `scripts/test-env-safety.ts` extended to include a regression check that no fake last-verified dates appear in source
- `scripts/test-cleanup-helpers.ts` extended to assert the new helper handles `linkVerificationStatus` enum cleanly
- Build, typecheck, lint all green
- No public UI change
- No `/career` files touched

### PR 3.3 — Verification cron extension for USCE listings

**Status:** ✅ shipped as PR #9, commit `05202ed`. Branch was `phase3/03-verification-cron`. The "Shipped PR 3.3 contract update" section near the top of this doc supersedes the spec below where they disagree.

**Schema change:** none.
**Behavior change:** new background work; no user-visible UI change.

**Operational prerequisite met:** `CRON_SECRET` is set in Vercel Production. Unauthenticated probes to `/api/cron/verify-listings` return 401.

**As-shipped behavior:**
- Lives at `src/app/api/cron/verify-listings/route.ts` (separate from `verify-jobs`; both share `getCronSecret()` auth)
- Selects up to **25 listings per run** ordered by `lastVerificationAttemptAt ASC NULLS FIRST` (least-recently-attempted first; never-attempted listings prioritized via NULLS FIRST). No strict 7-day floor — selection is bounded by the per-run cap.
- Probes one URL per listing in priority `sourceUrl > applicationUrl > websiteUrl`
- Batches of 5 in parallel, 500ms gap between batches, 10s HEAD timeout per request
- For each listing:
  - 2xx → `VERIFIED` (single success classifies; no two-success threshold)
  - 3xx → follow redirect, treat final status as the response
  - **4xx/5xx → `NEEDS_MANUAL_REVIEW`** (single failure already classifies; never `SOURCE_DEAD`)
  - **Timeout / network error → `REVERIFYING`** (transient; legacy `linkVerified` Boolean unchanged so the public badge does not flap on a single network blip)
  - Records the result in a `DataVerification` row (`method = "CRON"`, `verifiedBy = "system:cron-verify-listings"`, `targetType = "listing"`, with `statusBefore`/`statusAfter`/`httpStatus`/`finalUrl` populated)
  - Updates `lastVerificationAttemptAt` to NOW
  - Updates `lastVerifiedAt` **only** when status ends `VERIFIED`
  - Sets `verificationFailureReason` on failure
  - Updates legacy `linkVerified` Boolean: `true` on `VERIFIED`, `false` on `NEEDS_MANUAL_REVIEW`, **unchanged** on `REVERIFYING`

**Hard rules (encoded in cron logic):**
- **Do not auto-set `SOURCE_DEAD` (admin-only)**
- Do not auto-set `PROGRAM_CLOSED` (admin-only)
- Do not auto-set `NO_OFFICIAL_SOURCE` (admin-only)
- Do not auto-hide listings (admin-only)
- **Do not auto-create `FlagReport`** — admin queue surfaces `NEEDS_MANUAL_REVIEW` listings directly (see PR 3.4 queue sources)
- Do not modify `Listing.status`
- Do not rewrite `sourceUrl`, `applicationUrl`, or `websiteUrl`
- Do not modify any `/career` data file or model — out of scope for this cron
- Use existing `getCronSecret()` from `src/lib/env.ts` for auth — same env var as waiver-jobs cron

**Acceptance (verified post-merge):**
- `/api/cron/verify-listings` deployed, unauthenticated probe returns 401 (auth gate working)
- `vercel.json` declares `0 9 * * *` UTC schedule (Hobby-plan max 2 cron entries used: `verify-jobs` at `0 8 * * *`, `verify-listings` at `0 9 * * *`)
- DataVerification rows accumulate per run (verification pending first scheduled cron tick)
- No public UI change in this PR
- No `/career` touched
- Build/typecheck/tests green

### PR 3.4 — Admin verification queue (extends existing `/admin/flags`)

**Branch:** `phase3/04-admin-verification-queue`
**Schema change:** none (already in 3.2).
**Behavior change:** admin-only surface; no public UI change.

**Gate:** blocked until the first scheduled `/api/cron/verify-listings` run (09:00 UTC) is reviewed. PR 3.4 must not begin until that review confirms the cron behaves as documented.

**Queue sources (must integrate all of these):**
1. User-submitted `FlagReport` items (`OPEN`, `IN_REVIEW`)
2. Listings with `linkVerificationStatus = NEEDS_MANUAL_REVIEW` (cron-classified)
3. Optionally, listings stuck in `REVERIFYING` past an admin-defined age threshold (e.g. older than 14 days of attempted re-verification)

The shipped PR #9 cron does not auto-create `FlagReport` rows. PR 3.4 must surface `NEEDS_MANUAL_REVIEW` listings independently of the `FlagReport` table — relying solely on `FlagReport` would miss every cron-detected failed link.

**Extends `/admin/flags`** (already exists at `src/app/admin/flags/page.tsx`):
- Filter by `kind` (BROKEN_LINK / WRONG_DEADLINE / PROGRAM_CLOSED / etc.)
- Filter by `status` (OPEN / IN_REVIEW / REVIEWED / RESOLVED / DISMISSED)
- Per-flag detail view with linked listing + the listing's current `linkVerificationStatus` + recent `DataVerification` entries
- Admin actions per flag:
  - "Mark in review" → status = IN_REVIEW
  - "Verified the source — link works" → status = RESOLVED, listing's `linkVerificationStatus` = VERIFIED, write DataVerification row (method=MANUAL, verifiedBy=admin user ID)
  - "Source dead" → status = RESOLVED, listing's `linkVerificationStatus` = SOURCE_DEAD
  - "Program closed" → status = RESOLVED, listing's `linkVerificationStatus` = PROGRAM_CLOSED
  - "Won't fix" → status = DISMISSED, no listing change
  - "Add admin notes" → free text on the flag
- All actions log to `AdminActionLog` (already exists in schema)
- All actions write a `DataVerification` row when listing status changes

**Hard rules:**
- Admin-only — gated by existing admin auth in `src/app/admin/layout.tsx`
- No public route changes
- No public hiding without explicit admin action (check + button click)
- No `/career` changes

**Acceptance:**
- Admin can triage flag reports end-to-end
- Listing status transitions are logged
- Build/typecheck/tests green
- No `/career` touched
- No public UI change

### PR 3.5 — User-visible real verification metadata

**Branch:** `phase3/05-real-verification-ui`
**Schema change:** none.
**Behavior change:** **user-visible** — careful preview review required.

**Extends:**
- `<ListingTrustMetadata>` — pass real `lastVerifiedAt` (formatted as relative time: "Verified 2 weeks ago") only when `linkVerificationStatus === VERIFIED`. Otherwise show appropriate badge per status.
- `<ListingVerificationBadge>` — extend `status` prop to accept all 7 LinkVerificationStatus values (currently 3: verified/unverified/reverifying). Add styling for SOURCE_DEAD, PROGRAM_CLOSED, NO_OFFICIAL_SOURCE, NEEDS_MANUAL_REVIEW, UNKNOWN.
- `src/lib/listing-display.ts` `listingVerificationStatus()` — update mapping to read from `linkVerificationStatus` enum, fall back to `linkVerified` boolean for backward compat
- `src/lib/listing-cta.ts` `decideListingCta()` — read `applicationUrl` first, fall back to `websiteUrl` for backward compat
- Listing-card render: only show "Verified link" pill when `linkVerificationStatus === VERIFIED`. For SOURCE_DEAD/PROGRAM_CLOSED/etc., consider whether to show a small subtle chip or nothing (avoid clutter).
- Listing detail render: show "Verified <relative-time>" only when real. For SOURCE_DEAD, show a clear "Source not currently reachable — admin reviewing" status. For PROGRAM_CLOSED, show "This program is no longer running" + optional "Find similar programs" link to `/browse?specialty=<specialty>&state=<state>`.

**Helper additions:**
- `src/lib/relative-time.ts` — small utility: "Verified 2 weeks ago" / "Verified 3 days ago". No new dependencies; pure function.
- Test extensions in `scripts/test-cleanup-helpers.ts` for relative-time formatting + status-to-CTA-label mapping.

**Acceptance:**
- Verified listings show real `lastVerifiedAt` formatted as relative time
- Unverified / unknown listings show conservative badge ("Source not yet verified" or no badge per discretion)
- Closed/dead listings show appropriate status without clutter
- No fake dates rendered for any state
- Production preview review required before merge
- SEO impact section in PR body
- `/career` untouched

### PR 3.6 — Data-quality powered conversion hooks

**Branch:** `phase3/06-conversion-hooks`
**Schema change:** none (or minimal — email-list table if not present).
**Behavior change:** introduces email capture.

**Adds:**
- "Get alerts when new verified USCE is added in <state>/<specialty>" — email capture form on listing-grid surfaces (browse, state, specialty)
- Form is value-exchange, NOT a hard gate — content remains free and crawlable
- Email subscriptions stored in a new `EmailSubscription` model (Prisma — would need to be in PR 3.2 OR added here as a tiny supplemental migration)
- Backend job (separate cron, weekly) that emails subscribers digest of newly-VERIFIED listings matching their preferences
- Analytics events fire: `email_signup_shown`, `email_signup_submitted`, `email_signup_failed`

**Hard rules:**
- No hard gates on any public content
- No mandatory signup flows
- No drop in `<link rel="canonical">` or other SEO surface
- Honor `linkVerificationStatus = VERIFIED` for inclusion in alerts — never alert subscribers about unverified listings

**Acceptance:**
- Email signup form is dismissible / non-blocking
- Public content still crawlable (test with curl, no auth)
- Subscription stored, email digests pluggable (could use Resend like the admin notification system already does)
- Analytics events confirm signup funnel measurable

---

## 6. Admin / reporting workflow

End-to-end story for a single broken-link report:

1. **User encounters a broken link** on `/listing/<id>`. Clicks "Report broken link."
2. **`<ReportBrokenLinkButton>` POSTs to `/api/flags`** with `type: "listing"`, `targetId: <listingId>`, `reason: "[broken_link] Reported from listing detail page. Reported URL: <sourceUrl>"`. (Phase 1 behavior, unchanged.)
3. **API route** in PR 3.4 parses the structured prefix and writes `FlagReport` with `kind: BROKEN_LINK`, `sourceUrl: <url>`, `status: OPEN`. (Currently the prefix is in free text.)
4. **Admin sees the report** in `/admin/flags` — filterable by kind=BROKEN_LINK, status=OPEN.
5. **Admin clicks the report** → sees the listing's current `linkVerificationStatus`, recent `DataVerification` log entries, and the reported URL.
6. **Admin clicks the source URL** in their browser, confirms whether it's actually broken, the program is closed, or it works fine.
7. **Admin chooses an action** (one click):
   - "Verified working" → flag = RESOLVED, listing → VERIFIED, DataVerification row written
   - "Confirmed broken" → flag = RESOLVED, listing → SOURCE_DEAD (visible but flagged) or admin separately decides to hide
   - "Program closed" → flag = RESOLVED, listing → PROGRAM_CLOSED, "find similar" UI hint shows on the public detail page
   - "Need more info" → flag = IN_REVIEW with notes, status stays public
   - "Won't fix" → flag = DISMISSED, listing unchanged
8. **All actions audit-log** to `AdminActionLog` (existing model) and a `DataVerification` row.
9. **Public UI updates** only after the admin action lands — never automatically from a single user report.

End-to-end story for a cron-detected dead link (per shipped PR #9):

1. **Cron runs at 09:00 UTC** (`0 9 * * *`)
2. **Selects up to 25 listings** ordered by `lastVerificationAttemptAt ASC NULLS FIRST`
3. **Probes each listing's URL** in priority `sourceUrl > applicationUrl > websiteUrl` — gets HTTP 404
4. **Writes `DataVerification` row** (`method = "CRON"`, `verifiedBy = "system:cron-verify-listings"`, `targetType = "listing"`, `statusAfter = NEEDS_MANUAL_REVIEW`, `httpStatus = 404`)
5. **Updates `lastVerificationAttemptAt`** to NOW
6. **Sets `linkVerificationStatus = NEEDS_MANUAL_REVIEW`** — single 4xx/5xx failure is sufficient; there is no consecutive-failure threshold
7. **`lastVerifiedAt` unchanged** (only advances on `VERIFIED`)
8. **Legacy `linkVerified` Boolean → false** (flips on `NEEDS_MANUAL_REVIEW`)
9. **Listing remains visible** with whatever public badge PR 3.5 specifies for `NEEDS_MANUAL_REVIEW`
10. **No `FlagReport` is auto-created.** Admin sees the listing via the `NEEDS_MANUAL_REVIEW` queue surface (PR 3.4 must integrate this source — see §5 PR 3.4 queue sources).
11. **Admin reviews** and chooses one of: confirm working (→ `VERIFIED`, `method = MANUAL`), confirm broken (→ `SOURCE_DEAD`, admin-only), confirm program closed (→ `PROGRAM_CLOSED`, admin-only), or mark `NO_OFFICIAL_SOURCE` (admin-only). Each manual transition writes a `DataVerification` row.

Transient failures (timeout / network error) are classified `REVERIFYING` instead of `NEEDS_MANUAL_REVIEW`. The legacy `linkVerified` Boolean stays unchanged on `REVERIFYING`, so the public badge does not flap on a single network blip. Repeated `REVERIFYING` over time may surface in the queue via the optional age-threshold rule documented in PR 3.4.

---

## 7. Public UI policy by status

| `linkVerificationStatus` | Listing card display | Listing detail display | CTA |
|---|---|---|---|
| `VERIFIED` | Green "Verified link" pill + "Verified <relative-time>" if `lastVerifiedAt` set | Green badge + relative-time + "Report broken link" affordance | "Apply Now" (existing PR1 logic) |
| `REVERIFYING` | No pill or subtle "rechecking" chip | Amber "Re-verifying link" badge + ListingReverificationNotice block | "Application link being reverified" disabled CTA (existing) |
| `SOURCE_DEAD` | Subtle dim treatment OR hide depending on dimming policy decision in PR 3.5 | "Source not currently reachable — admin reviewing" + "Report broken link" if user has new info | Disabled CTA: "Source not currently reachable" |
| `PROGRAM_CLOSED` | Hide from active listing grids | "This program is no longer running" + "Find similar programs in <specialty>/<state>" link | No CTA; archived state |
| `NO_OFFICIAL_SOURCE` | Subtle treatment; no "Verified" claim | "Sourced from community submissions — confirm directly with the institution" | "Verify Program Page" (existing PR1 fallback) |
| `NEEDS_MANUAL_REVIEW` | Subtle treatment; no "Verified" claim | Same as NO_OFFICIAL_SOURCE — admin will resolve | "Verify Program Page" (conservative) |
| `UNKNOWN` | No pill | No badge | "Verify Program Page" (conservative) — same as PR1 |

**Rules:**
- No scary banners site-wide.
- No global "site unreliable" messaging.
- Controlled-live mode only (per [SEO_PRESERVATION_RULES.md](SEO_PRESERVATION_RULES.md)).
- Hidden listings (PROGRAM_CLOSED) keep their detail URL accessible if archived/no-longer-active state is informationally useful — but **only with explicit admin decision**, and only after a separate small PR that adds the archived-state rendering. For PR 3.5, hidden = excluded from grids; detail URL behavior stays a decision for later.

---

## 8. SEO implications

### Rules

- Do **not** delete pages just because a link is bad
- Do **not** mass noindex
- Do **not** remove sitemap entries automatically
- Hidden / SOURCE_DEAD / PROGRAM_CLOSED listings: per-listing decision; default behavior in PR 3.5 is to exclude from `getListings()` queries that drive grids and sitemap, but keep detail URL serving with archived rendering if Google has indexed it
- Program-closed pages can become informational archives if already indexed (separate small PR — not in 3.5)
- Sitemap should include only active canonical pages — PR 3.5 will adjust the sitemap query to filter by status. SEO impact section required in PR 3.5 body.
- **All hiding/indexing policy requires explicit PR and SEO impact report** per [SEO_PRESERVATION_RULES.md](SEO_PRESERVATION_RULES.md)
- Canonical host alignment (apex authoritative) preserved throughout
- robots.txt unchanged

### What WILL change in PR 3.5
- Listing grid queries (`/browse`, state, specialty) filter `WHERE status = APPROVED AND linkVerificationStatus NOT IN (PROGRAM_CLOSED, SOURCE_DEAD)` — closes a hidden-listing leak that currently doesn't exist (because PROGRAM_CLOSED doesn't exist yet)
- Sitemap query filters the same way

### What does NOT change
- Public canonical hostname (apex)
- `<link rel="canonical">` on detail pages
- JSON-LD structure
- Open Graph / Twitter card metadata
- No new noindex tags
- No new redirects

---

## 9. Analytics dependency

PR 3.1 (analytics foundation) ships **before** PR 3.5 (user-visible verification UI) deliberately — so the question "did Phase 3 actually move conversion?" is measurable.

### Metrics that should populate after PR 3.1 + PR 3.5

- **Source click rate** — `source_click` / `listing_view` per status (verified vs unverified vs reverifying)
- **Report broken link rate** — `broken_link_report` / `listing_view`
- **Listing detail → source CTA conversion** — funnel
- **Browse filter usage** — which filters do users actually touch
- **Verified vs unverified engagement delta** — does the "Verified" pill move clicks, ignoring it, or hurting (banner blindness)
- **Top broken-source domains** — operational metric for admin: which institutions fail verification most often
- **Verification queue volume** — operational: how many flags per week, how fast does admin clear them
- **Email capture conversion (PR 3.6)** — `email_signup_submitted` / `email_signup_shown`

### Metrics the analytics layer should NOT capture

- Email addresses, names, NPI numbers, phone numbers, visa types
- Specific listing identifiers tied to user identifiers (anonymize)
- Anything immigration-status-sensitive

The `track()` wrapper in PR 3.1 enforces these via TypeScript and runtime validation.

---

## 10. Operational prerequisites

Before PR 3.3 (cron extension) ships:

| Requirement | Status | Action owner |
|---|---|---|
| `CRON_SECRET` set in Vercel Production env vars | unknown — operational item flagged repeatedly | user (Vercel dashboard) |
| Real Search Console "Domain property" set up after canonical-host fix | not done | user (Search Console) |
| Vercel `usmle-platform` duplicate project audited (paused or kept) | not done | user (Vercel dashboard) |
| Stash hygiene decision (drop redundant stashes or keep) | optional | user |

**Only `CRON_SECRET` is a blocker** for PR 3.3. The others are quality improvements that can land in any order.

---

## 11. Relationship to `/career` WIP

The `wip/preserve-careers-jobs-expansion` branch (`f57c53e`) holds dirty `/career/jobs` work that depends on its own verification primitives (`waiver-jobs-data.ts` + custom CTA logic). Phase 3 explicitly **does not** merge or extend that work.

### Coordination points (when `/career` is eventually authorized)

- The same `LinkVerificationStatus` enum should apply to waiver jobs — don't build a parallel enum
- The same `DataVerification` log model should record waiver-job verifications — don't build a parallel log
- The same cron route (or a sibling under `src/app/api/cron/`) should verify waiver jobs — don't duplicate batch+timeout+auth logic
- The same admin queue at `/admin/flags` should triage waiver-job-related flags

**Practical implication:** when `/career` work is unlocked, plan a `phase3.5/career-verification-integration` PR that consumes Phase 3's primitives. Until then, `/career` is untouched.

---

## 12. Relationship to conversion architecture

Conversion architecture is **deferred, not abandoned.** It becomes structurally stronger once verification exists:

| Conversion feature | Why it needs verification |
|---|---|
| "Save program" | Users save listings expecting them to still exist when revisited; verified status is the precondition |
| "Compare programs" | Comparing a verified vs unverified listing is misleading without a status indicator |
| "Email weekly digest of newly-verified USCE in <specialty>" | Email subject line claims verification — must be real |
| "Lead magnet PDF: 2026 IMG Match Strategy" | Trust-based; pairs naturally with site that has verified data quality |
| "Apply tracker" | Tracking applications to dead URLs is annoying; verification reduces that friction |
| Programmatic SEO | Quality of programmatic content tracks data quality; verification is the data-quality signal |
| Institution outreach | "Claim your listing" pitch only works if the institution can verify their entry — which requires the verification engine to be visible to admin and users |

Conversion architecture begins after PR 3.5 (real verification UI). PR 3.6 is the first conversion feature — by design — because it natively uses the verification data.

---

## 13. Risks

| Risk | Mitigation |
|---|---|
| **Migration risk in PR 3.2** — schema changes can break production at deploy | Migration is non-destructive (no DROP, no TRUNCATE). New fields are nullable or have safe defaults. Existing `linkVerified` Boolean kept. Migration tested on shadow DB before approval. |
| **Fake verification risk** — "we said verified, it's actually a 404" | Shipped cron sets `VERIFIED` only on 2xx; `NEEDS_MANUAL_REVIEW` on 4xx/5xx (single failure); `REVERIFYING` on transient errors. `SOURCE_DEAD`, `PROGRAM_CLOSED`, `NO_OFFICIAL_SOURCE` are admin-only. Admin reviews the queue (FlagReports + NEEDS_MANUAL_REVIEW listings). |
| **Over-automated hiding risk** — auto-hiding good listings on transient failures | Cron does NOT hide and cannot set `SOURCE_DEAD`. Cron classifies failures as `NEEDS_MANUAL_REVIEW` (4xx/5xx) or `REVERIFYING` (transient). Admin sets `SOURCE_DEAD` and decides hiding. |
| **Admin workload risk** — flag queue grows faster than admin can process | PR 3.4 surfaces queue volume; if growing, raise the threshold for auto-flagging or add a second admin. Solo-admin scale-out plan documented as future work, not blocking. |
| **UI clutter risk** — too many badges, banners, status pills overwhelming users | PR 3.5 controlled — badge only on verified state for cards; conservative on detail page. Same "no clutter" rule from Phase 1. |
| **SEO risk if hiding pages incorrectly** — PROGRAM_CLOSED listings deindexed too aggressively | Hidden listings keep detail URLs serving (with archived rendering, in a future PR). Sitemap query filters carefully. SEO impact section required in PR 3.5 body. |
| **Cron overrun / timeout risk** — 304 listings × HEAD request × 10s timeout × 5-batch pattern = ~10 min. Vercel free tier has 10s function timeout. | Use Vercel cron's longer timeout config OR batch more aggressively (10 per batch instead of 5). Test in PR 3.3. |
| **Source sites blocking the bot** — cloudflare/akismet may 403 the verification crawler | User-agent already declared (`USCEHub-JobVerifier/1.0`). Add identifying URL. Keep low frequency (weekly per listing). Tolerate 403 as inconclusive, not as failure. |
| **Data drift** — listings change details (deadline, cost, eligibility) without changing the URL | Verification engine only checks URL liveness, not content accuracy. Content accuracy is a separate problem (institution outreach in Phase 4 of master blueprint). Document this limit honestly. |
| **Duplicate verification systems between USCE and `/career`** | §11 coordination plan — single enum, single log, single cron infra. Enforced when `/career` is unlocked. |

---

## 14. Acceptance criteria for Phase 3 (entire phase)

Phase 3 is considered successful when **all** of the following hold:

- ✅ Listings have real `linkVerificationStatus` populated by both cron and admin actions
- ✅ Admin can process broken-link reports end-to-end via `/admin/flags`
- ✅ Cron successfully verifies USCE Listing source URLs without auto-hiding
- ✅ UI shows real `lastVerifiedAt` (relative time) only when verified — never fake dates
- ✅ No public content hard-gated
- ✅ Canonical host (apex) preserved
- ✅ Sitemap entries reflect real status (PROGRAM_CLOSED excluded; VERIFIED/REVERIFYING/UNKNOWN included)
- ✅ Analytics events flow for source-click, broken-link-report, listing-view
- ✅ Institution outreach team can point prospective listing-claimers at the verification workflow as a value proposition
- ✅ Conversion (PR 3.6 email capture) successfully signs up users for value-exchange digests
- ✅ Build / typecheck / tests / lint green throughout
- ✅ `/career` untouched (until separately authorized)
- ✅ All stashes and WIP careers branch preserved

---

## 15. Strategic checkpoint before PR 3.2 schema migration

Before shipping the schema migration, this doc + the user revisit:

1. **Are these fields enough?** Consider: do we need `verifiedBySpecialAdmin` for institution-claimed listings later? Do we need a `verificationConfidence` score for community-verified vs admin-verified? **Decision deferred to migration time.**
2. **Are we over-building?** The `LinkVerificationStatus` enum has 7 values. Is that too many? Is "NEEDS_MANUAL_REVIEW" distinguishable from "UNKNOWN" in practice? **Likely yes — flag if collapsing to 5 in migration time saves complexity.**
3. **Are we preserving SEO?** Confirmed — see §8.
4. **Are we creating admin burden?** Estimated: ~5–20 flag reports per week at current scale. Solo-admin can process. Plan to revisit if volume crosses 50/week.
5. **Can cron actually verify meaningful truth?** HEAD requests confirm "URL serves something." Combined with admin spot-check on flagged failures, the system has reasonable signal. Document the "automated 200 ≠ programmatically valid" caveat in user-facing copy.
6. **What requires manual review?** PROGRAM_CLOSED, NO_OFFICIAL_SOURCE, NEEDS_MANUAL_REVIEW — all admin-only.
7. **Does this support institution outreach?** Yes — PR 3.4 surfaces the queue; institutions can claim their listing, admin verifies, status flips to VERIFIED with method=MANUAL and verifiedBy=institution_claim.
8. **Does it help future `/career` verification?** Yes — same primitives, single enum/log/cron/queue.
9. **Does it make conversion stronger?** Yes — PR 3.6 builds on it natively.

If any of the above fails review, refine this plan before opening PR 3.2.

---

## Cross-references

- [RULES.md](RULES.md) — preservation, deletion, git safety, `/career` hard protection. Higher authority than this doc.
- [SEO_PRESERVATION_RULES.md](SEO_PRESERVATION_RULES.md) — public URL / sitemap / robots / canonical guardrails. Higher authority.
- [USCEHUB_MASTER_BLUEPRINT.md](USCEHUB_MASTER_BLUEPRINT.md) — overall product strategy. Phase 3 is described here too; this doc is the execution-ready expansion.
- [TECH_DEBT_REGISTER.md](TECH_DEBT_REGISTER.md) — original audit; P0/P1 items still open referenced in §10.
- [CLEANUP_PLAN.md](CLEANUP_PLAN.md) — historical cleanup PRs; rhythm for Phase 3 small-PR cadence.
- [DATA_FLOW_MAP.md](DATA_FLOW_MAP.md) — current data-flow inventory; Phase 3 extends Listing-related flows specifically.
