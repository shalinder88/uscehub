# Phase 3 completion gap audit

**Status:** internal audit doc.
**Authority:** lower than [RULES.md](RULES.md) and [SEO_PRESERVATION_RULES.md](SEO_PRESERVATION_RULES.md).
**Scope:** captures the substantive completion state of Phase 3 (data quality + verification engine) on `main` as of 2026-04-29 03:16 UTC, plus the concrete non-cron gaps that remain. Excludes the scheduled-cron-tick review (which is timing-bound, not a Phase-3-design gap).

## TL;DR

Phase 3 is **substantively complete on the data-quality, display, ordering, admin-tooling, and observability axes.** The 9 PRs that built it are all merged to `main`. Three non-cron gaps were surfaced in §9; **two of three are now addressed** (status table below). Phase 4 (institution outreach) and Phase 3.6 (real email digests) remain gated per Master Blueprint §0.

## Audit findings status (updated 2026-04-29)

| Finding | Original status (PR #23 audit) | Now |
|---|---|---|
| §9.1 `/api/flags` POST does not populate `FlagKind` | ⚠️ open | ✅ **FIXED** in PR #24 (`1725718`) — server validates `kind` body field against the enum; back-compat parses `[broken_link]` reason prefix; `<ReportBrokenLinkButton>` sends `kind: "BROKEN_LINK"` explicitly |
| §9.2 SEO / home count widgets overclaim "verified" | ⚠️ open | 🟡 **IN PROGRESS** in PR #25 — Option B implemented (rename, not narrow): `SITE_METRICS.activeVerifiedListings` → `listingsWithOfficialSource`, value 207 → 156, stat card label "Verified Programs" → "Official Source on File", JSON field rename. PR open, awaiting explicit user review of the visible-copy change. |
| §9.3 `probeUrl` HEAD→GET fallback integration test | ⏳ unchanged | ⏳ unchanged — very low priority; classifier is unit-tested |

## Phase 3 PR ledger (all on main)

| PR | Commit | Title |
|---|---|---|
| #4  | `7d59015` | Plan Phase 3 data quality verification engine |
| #5  | `d5b6cf8` | Add analytics event taxonomy and safety guardrails (3.1) |
| #6  | `ea2dc20` | Add Prisma migration baseline (3.2a) |
| #7  | `ca2f0e0` | Add verification schema fields (3.2) |
| #8  | `9573377` | Add production migration build guard |
| #9  | `05202ed` | Add Phase 3.3 listing verification cron |
| #10 | `19cf5ef` | Update strategic checkpoint and Phase 3 handoff docs |
| #11 | `857bb93` | Clarify 405 verification fallback behavior (3.3a) |
| #12 | `0710ad8` | Add admin verification queue (3.4) |
| #13 | `d2f40ab` | Phase 3.5: real verification UI |
| #14 | `1f30dcc` | Document deferred operational items |
| #15 | `cf96453` | Document USCEHub long-term platform vision |
| #16 | `63c1f66` | Phase 3.5b: real verification status on listing cards |
| #17 | `e25291c` | Phase 3.7: verification-aware ordering |
| #18 | `808ce27` | Ops: verify-listings cron health check |
| #19 | `58a45f1` | Ops: Vercel project audit doc |
| #20 | `a5da2b1` | Ops: Search Console + mobile QA runbook |
| #21 | `48de83e` | Phase 3.6 foundation: verified listings digest preview |
| #22 | `2e9371e` | Ops: admin verification queue operator runbook |
| #23 | `211586c` | Audit Phase 3 completion gaps (this doc, original) |
| #24 | `1725718` | Phase 3.8: set broken-link flag kind (closes §9.1) |
| #25 | open | Phase 3.9: clarify trust metrics language (closes §9.2 — awaiting user review) |

## 1. Data model / migrations

| Item | State |
|---|---|
| Baseline migration applied | ✅ `20260428171752_baseline_existing_schema` |
| Phase 3.2 verification fields applied | ✅ `20260428173738_phase3_verification_fields` |
| `prisma migrate status` | ✅ "Database schema is up to date" |
| Listing verification fields | ✅ `linkVerificationStatus`, `lastVerifiedAt`, `lastVerificationAttemptAt`, `verificationFailureReason`, `sourceUrl`, `applicationUrl` |
| Legacy `linkVerified` Boolean preserved | ✅ kept for back-compat; flipped by cron + admin queue per PR #9/#11/#12 contract |
| `LinkVerificationStatus` enum | ✅ 7 values: UNKNOWN, VERIFIED, REVERIFYING, NEEDS_MANUAL_REVIEW, SOURCE_DEAD, PROGRAM_CLOSED, NO_OFFICIAL_SOURCE |
| `FlagKind` enum | ✅ 7 values: BROKEN_LINK, WRONG_DEADLINE, PROGRAM_CLOSED, INCORRECT_INFO, DUPLICATE, SPAM, OTHER |
| `FlagStatus` enum gained `IN_REVIEW` | ✅ |
| `FlagReport` extensions | ✅ `kind`, `sourceUrl`, `resolvedAt`, `resolvedBy` |
| `DataVerification` extensions | ✅ `method`, `statusBefore`, `statusAfter`, `httpStatus`, `finalUrl`, `errorMessage` |
| **No further schema needed for current Phase 3** | ✅ |
| **Future Phase 3.6 (real email digests) requires** | ⚠️ a new `EmailSubscription` model (with `email`, `consentAt`, `unsubscribeToken`, `lastSentAt`, optional filters), gated on explicit user authorization |

## 2. Cron

| Item | State |
|---|---|
| `/api/cron/verify-listings` deployed | ✅ returns 401 unauthenticated |
| Manual cron run | ✅ 2026-04-28 20:47 UTC produced 25 `DataVerification` rows |
| Scheduled tick | ⏳ pending — first scheduled fire 2026-04-29 09:00–09:59 UTC; not a Phase-3-design gap |
| 405 fallback fix | ✅ PR #11 added HEAD→GET fallback in `probeUrl` |
| Cron forbidden statuses | ✅ 0 cron-attributed `SOURCE_DEAD` / `PROGRAM_CLOSED` / `NO_OFFICIAL_SOURCE` rows |
| Cron auto-creates FlagReport | ✅ does not — admin queue surfaces `NEEDS_MANUAL_REVIEW` listings directly |
| `lastVerifiedAt` discipline | ✅ 0 listings have `lastVerifiedAt` set with non-`VERIFIED` status |
| Cron health check script | ✅ `scripts/check-verify-listings-cron.ts` (PR #18) |
| Cron health runbook | ✅ `docs/codebase-audit/CRON_HEALTH_CHECK_RUNBOOK.md` (PR #18) |
| `vercel.json` cron count | ✅ 2 (Hobby cap); no third cron added |

## 3. Admin workflow

| Item | State |
|---|---|
| Admin layout auth | ✅ `src/app/admin/layout.tsx` redirects non-ADMIN; sets `robots: noindex` |
| Admin queue page | ✅ `/admin/verification-queue` (PR #12) |
| Admin queue API | ✅ `/api/admin/verification-queue` GET + POST (PR #12) |
| Queue source 1 (FlagReports OPEN/IN_REVIEW) | ✅ |
| Queue source 2 (NEEDS_MANUAL_REVIEW listings) | ✅ |
| Queue source 3 (aged REVERIFYING > 14 days) | ✅ |
| Atomic transactions on actions | ✅ `prisma.$transaction` for FlagReport / Listing / DataVerification / AdminActionLog |
| Listing.status never modified | ✅ enforced in `buildListingPatch` |
| URL fields never rewritten | ✅ |
| `lastVerifiedAt` only advances on VERIFIED | ✅ |
| Admin action audit log | ✅ `AdminActionLog` row per mutation |
| Admin queue runbook | ✅ `docs/codebase-audit/ADMIN_VERIFICATION_QUEUE_RUNBOOK.md` (PR #22) |
| `/api/flags` POST handler sets `kind` | ✅ PR #24 (post-original-audit) — see §9.1 below |

## 4. Public trust UI

| Item | State |
|---|---|
| Listing detail trust block reads `linkVerificationStatus` + `lastVerifiedAt` | ✅ PR #13 |
| Honest wording for `VERIFIED + lastVerifiedAt = null` (legacy backfilled) | ✅ slate "Official source on file" (PR #13 + 3.5a) |
| Honest wording for `NEEDS_MANUAL_REVIEW` | ✅ amber "Source needs review" + verify-directly subline (PR #13 + 3.5a) |
| Listing card badges use real status | ✅ PR #16 |
| Compare table verification cell uses real status | ✅ PR #16 |
| Recommend results pass through new fields | ✅ PR #16 |
| Verification-aware ordering across grids | ✅ PR #17 (`browse`, `featured-listings`, `/api/recommend`) |
| Apply Now still safe (only when verified-class + URL) | ✅ |
| Report broken link still present | ✅ |
| ListingDisclaimer still visible | ✅ |
| `<TrustBadges>` (poster trust) preserved | ✅ unrelated to source-link verification, kept per RULES.md |
| `linkVerified` Boolean used in SEO/home count widgets | 🟡 PR #25 open — see §9.2 below |

## 5. Save / compare / recommend

| Item | State |
|---|---|
| `SavedListing` Prisma model exists | ✅ |
| `ComparedListing` Prisma model exists | ✅ |
| `/dashboard/saved` page | ✅ |
| `/dashboard/compare` page | ✅ |
| Public `/compare` page | ✅ uses real verification status (PR #16) |
| `/api/saved`, `/api/compared` | ✅ |
| `/api/compare` selects new fields | ✅ PR #16 |
| `/api/recommend` ordering verification-aware | ✅ PR #17 |
| `/recommend-client` interface accepts new fields | ✅ PR #16 |
| **Save/compare badge update on `/dashboard/saved`** | ❓ not separately verified — saved-list dashboard view was not part of PR #16. Worth a manual spot-check, low priority |

## 6. Digest / conversion foundation

| Item | State |
|---|---|
| Phase 3.6 no-send digest helper | ✅ `src/lib/verified-digest.ts` (PR #21) |
| Phase 3.6 no-send preview script | ✅ `scripts/preview-verified-listings-digest.ts` (PR #21) |
| Eligibility predicate | ✅ `linkVerificationStatus === VERIFIED AND lastVerifiedAt non-null AND status === APPROVED AND lastVerifiedAt within window` |
| Resend client imported by digest path | ✅ NOT imported — zero accidental-send risk |
| Subscriber model | ❌ does not exist — gated on explicit authorization |
| **Future requirements before any actual email send** | ⏳ all of: |
|     1. Cron clean for ≥3-7 ticks | ⏳ |
|     2. `EmailSubscription` schema (consent + unsubscribe token) | ⏳ |
|     3. Consent flow (checkbox, double opt-in, terms link) | ⏳ |
|     4. Unsubscribe link in every email | ⏳ |
|     5. Privacy/terms copy | ⏳ |
|     6. Send provider config (Resend `from` domain DKIM/SPF) | ⏳ |
|     7. Bounce / spam-complaint handling | ⏳ |
|     8. Cron / send schedule policy | ⏳ |

## 7. Ops

| Item | State |
|---|---|
| `DEFERRED_OPS_CHECKLIST.md` | ✅ PR #14 |
| `CRON_HEALTH_CHECK_RUNBOOK.md` | ✅ PR #18 |
| `VERCEL_PROJECT_AUDIT.md` (duplicate `usmle-platform` Vercel project) | ✅ PR #19 — documented, not yet acted on |
| `GSC_AND_MOBILE_QA_RUNBOOK.md` | ✅ PR #20 — documented, not yet acted on |
| `ADMIN_VERIFICATION_QUEUE_RUNBOOK.md` | ✅ PR #22 |
| Prisma `package.json#prisma` deprecation | ⏳ runs warning every command; non-blocking; unchanged |
| Stashes preserved | ✅ both `stash@{0}` and `stash@{1}` intact |
| Branches preserved | ✅ `--delete-branch=false` on every merge |
| T7 external-drive migration | n/a — out of scope per global CLAUDE.md |

## 8. Product sequencing (Master Blueprint §0 alignment)

| Tier | State |
|---|---|
| 1. Trust / data-quality engine | ✅ shipped (PRs #4–#22) |
| 2. Saved / compare / alerts on top of trustworthy data | ⏳ saved/compare scaffolding exists; alerts pending |
| 3. Career / visa / fellowship / new-attending support | ⏳ deliberately not started |
| 4. Marketplace / monetization | ⏳ deliberately not started |

Anti-narrowing rule on `main` (PR #15 / Master Blueprint §0): "Do not describe USCEHub as 'an observership directory.'" Verified by grep — no commit message or doc on `main` describes USCEHub that way.

## 9. Remaining non-cron gaps

Three concrete items surfaced during this audit. None blocks Phase 3 completion. **All decisions are gated on explicit user direction** — none are implemented in this audit doc.

### 9.1 `/api/flags` POST handler does not populate `FlagKind`

**Status: ✅ FIXED in PR #24 (`1725718`).**

**Severity:** low correctness; affects admin queue triage UX, not data integrity.

**What:** `<ReportBrokenLinkButton>` ([src/components/listings/report-broken-link-button.tsx](src/components/listings/report-broken-link-button.tsx)) used to submit to `/api/flags` with `reason: "[broken_link] Reported from the listing detail page."` — a free-text prefix. The route handler in [src/app/api/flags/route.ts](src/app/api/flags/route.ts) did **not** set the structured `kind` column that PR #7 added. Default fired: `kind = OTHER`. The admin queue surfaced the row fine (it filters on `status`, not `kind`), but per-kind filtering at `/admin/verification-queue` could not distinguish broken-link reports from generic flags.

**Why it survived:** PR #7 added the schema column, no PR ever wired the user-facing POST to populate it. The schema design in [PHASE3_DATA_QUALITY_VERIFICATION_PLAN.md](PHASE3_DATA_QUALITY_VERIFICATION_PLAN.md) §3 + §6 explicitly anticipated that PR 3.4 would parse the prefix; PR #12 did not.

**How PR #24 closed it:**
- Server (`/api/flags/route.ts`) accepts an optional `kind?: string` body field, validated against the FlagKind enum via a `Set` allow-list (never blindly trusts user input).
- Back-compat: if `kind` is missing, parses the legacy `[broken_link]` prefix in `reason`.
- Default if neither: `OTHER`.
- Also accepts `sourceUrl?: string` (length-capped) and persists to `FlagReport.sourceUrl` (PR #7 added the column; no caller populated it before).
- Client (`<ReportBrokenLinkButton>`) sends `kind: "BROKEN_LINK"` explicitly; the `[broken_link]` reason prefix stays for back-compat.

**Effect:** new broken-link reports appear with `kind = BROKEN_LINK` and `sourceUrl` populated, so [`/admin/verification-queue`](src/app/admin/verification-queue/page.tsx) per-kind context renders correctly. Old reports retain `kind = OTHER` and remain triagable as before.

**Risk:** none — schema column already existed; the fix is purely additive.

### 9.2 SEO / home count widgets overclaim "verified"

**Status: 🟡 IN PROGRESS in PR #25 — open, awaiting explicit user review of the visible-copy change.**

**Severity:** low correctness; affects public stat truthfulness, not behavior.

**What:** three count surfaces used `where: { status: "APPROVED", linkVerified: true }` with a "verified" label:

- [src/components/seo/program-stats.tsx](src/components/seo/program-stats.tsx) — "Verified Programs" stat card
- [src/app/api/programs/stats/route.ts](src/app/api/programs/stats/route.ts) — `verifiedListings` JSON field
- [src/components/home/program-spotlight.tsx](src/components/home/program-spotlight.tsx) — single-listing "Featured Program" picker (label is fine; broad selection is appropriate)

After PRs #11 / #13 / #16 / #17, "verified" on the public site means freshly cron- or admin-verified (with `lastVerifiedAt`). The legacy Boolean is `true` for both that strict cohort AND the ~136 legacy backfilled rows that have `lastVerifiedAt = null`. So the first two count widgets overstated the "verified" count by ~136 listings on the homepage and SEO surfaces.

Additionally, [src/lib/site-metrics.ts](src/lib/site-metrics.ts) hardcoded `activeVerifiedListings = 207` (from a pre-Phase-3 era), stale relative to the current 156 `linkVerified = true` count and stale-er relative to the 20 strict-cohort count.

**User's policy choice (Option B):** keep the broader inventory-signal count, but rename it so it does NOT use the word "verified". Reserve "verified" for the strict cohort (admin / digest contexts). Avoids making the homepage look artificially weaker overnight.

**How PR #25 implements it:**
- `SITE_METRICS.activeVerifiedListings` → `listingsWithOfficialSource`. Value 207 → 156 (current accurate count).
- Display string "207 verified listings" → "156 listings with an official source on file".
- `program-stats.tsx` stat card label "Verified Programs" → "Official Source on File". Query unchanged (still the broad inventory signal); the rename is the fix.
- `/api/programs/stats` JSON field rename: `verifiedListings` → `listingsWithOfficialSource`. Internal API; no external consumers in `/src`.
- `program-spotlight.tsx` left alone — its label is "Featured Program", not "Verified Program", so the broad selection is appropriate.
- Test assertions added to `scripts/test-cleanup-helpers.ts` so a future regression that resurrects the overclaim wording fails fast: display copy MUST contain "official source on file" AND MUST NOT contain "verified".

**Risk:** changes a public stat-card label and the rendered number on the homepage. PR #25 stays open for explicit user sign-off on the visible-copy change.

**Out of scope for PR #25 (flagged as follow-ups):**
- [src/lib/blog-data.ts](src/lib/blog-data.ts) has two literal "207+ verified programs" references in blog post bodies (lines 168, 230). Blog content is product copy with SEO implications; updating it should be a separate small content PR, not bundled with the stats infra refactor.
- A separate "recently verified" stat card (count of strict cohort, ~20 today) is not added by PR #25. Open question whether to expose it as a 5th stat highlight, a sub-line under the renamed card, or just keep it surfaced via the admin queue and digest preview.

### 9.3 `probeUrl()` HEAD→GET fallback has no integration test

**Severity:** very low; the unit-tested classifier is correct, and the fallback is 8 lines.

**What:** [scripts/test-link-verification.ts](scripts/test-link-verification.ts) has 26 tests for `classifyProbeOutcome()` — the pure classification function. The route-level `probeUrl()` in [src/app/api/cron/verify-listings/route.ts](src/app/api/cron/verify-listings/route.ts) (which does HEAD-then-GET-on-405 per PR #11) has no integration test that mocks `fetch` and asserts:
- `HEAD 405 + GET 200 → ProbeOutcome { httpStatus: 200 }`
- `HEAD 405 + GET 404 → ProbeOutcome { httpStatus: 404 }`
- `HEAD 405 + GET 405 → ProbeOutcome { httpStatus: 405 }`

**Why it survived:** PR #11 was the smallest possible fix; integration tests for `probeUrl` would have meant introducing a test framework or mocking pattern. The user's approval was for the minimum.

**Risk if unfixed:** a future regression in `probeUrl` could silently break the fallback, and only a careful eyeballing of `httpStatus` in DataVerification rows would catch it. The cron health script's discipline checks would NOT catch it (they check the classification, not the probe).

**Fix shape:** add a small fetch-mocked test that exercises the three cases above. Could fit in `scripts/test-link-verification.ts` if the testing pattern accepts a fetch-mock import.

## What this audit deliberately leaves alone

- The scheduled-cron-tick review (timing-bound, not a design gap; will run ~09:00 UTC daily).
- Mobile QA on real iOS/Android devices (operator task, not Claude task; runbook in PR #20).
- Search Console domain property + sitemap submission (operator task; runbook in PR #20).
- Vercel duplicate project cleanup (operator task; doc in PR #19).
- Prisma `package.json#prisma` → `prisma.config.ts` migration (deferred; not blocking; in `DEFERRED_OPS_CHECKLIST.md`).

## Recommended next steps

1. ~~**Decide on §9.1**~~ ✅ done — PR #24 merged.
2. **Review and merge PR #25 (§9.2)** if the visible-copy change ("Verified Programs" stat card → "Official Source on File", count 207 → 156) reads honestly to you. The PR also updates `SITE_METRICS.activeVerifiedListings` → `listingsWithOfficialSource` and the JSON API field. Once merged, optionally update [src/lib/blog-data.ts](src/lib/blog-data.ts) lines 168 + 230 in a separate small content PR (still says "207+ verified programs").
3. **§9.3** (probeUrl integration test) remains open — very low priority; defer.
4. After daily cron has been clean for 3–7 ticks, decide whether to start the Phase 3.6 send path. Requires the 8 prerequisites in §6.
5. Operator runbooks (mobile QA, GSC, Vercel cleanup) at user's pace.

## SEO impact of this audit doc

```
SEO impact:
- URLs changed:        none
- redirects added:     none
- sitemap changed:     no
- robots changed:      no
- canonical changed:   no
- metadata changed:    no
- JSON-LD changed:     no
- pages noindexed:     none
- internal links:      none changed
- risk level:          ZERO — internal docs only
```

## /career impact of this audit doc

None.
