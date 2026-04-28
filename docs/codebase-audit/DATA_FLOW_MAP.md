# Data Flow Map

The single most important finding from this audit:

**There are two data architectures coexisting in this codebase.**

- **Phase 1 / USCE listings** is database-backed (Prisma → Supabase Postgres). Counts on listings, states, specialties are computed live at request time. Page metadata mostly cooperates.
- **Phase 3 / Career, jobs, waiver, sponsors, blog, img-data** is TypeScript-file-backed. Big arrays of objects exported from `src/lib/*.ts`, imported at build time. Page titles, OG tags, and visible body copy hardcode the counts in plain text.

That split is the root cause of the count-consistency problem. The dirty work I just stashed was the third pass at hand-editing those hardcoded numbers across multiple files.

## 1 — Where listings live

**Source:** Prisma `Listing` model in [prisma/schema.prisma](prisma/schema.prisma) → Supabase Postgres.

Reads:
- [src/app/page.tsx:24-57](src/app/page.tsx) — homepage, 8 parallel `prisma.listing.count` / `findMany` queries
- [src/app/browse/page.tsx:43-114](src/app/browse/page.tsx) — filtered listings + Suspense
- [src/app/listing/[id]/page.tsx:67-98](src/app/listing/[id]/page.tsx) — single listing + organization + reviews + view-counter
- [src/app/observerships/page.tsx:25-46](src/app/observerships/page.tsx) — state directory, computes `totalStates` live but title hardcodes "37 States"
- [src/app/observerships/[state]/page.tsx](src/app/observerships/[state]/page.tsx), [src/app/observerships/specialty/[specialty]/page.tsx](src/app/observerships/specialty/[specialty]/page.tsx) — per-state, per-specialty
- [src/components/seo/program-stats.tsx:13-60](src/components/seo/program-stats.tsx) — homepage "by the numbers" — 8 queries, all live
- [src/app/sitemap.ts:153-156](src/app/sitemap.ts) — sitemap pulls ID + updatedAt for every approved listing

Writes:
- Listings via [src/app/api/listings/route.ts](src/app/api/listings/route.ts) (poster create) → admin moderation queue → admin approve in [src/app/api/admin/listings/route.ts](src/app/api/admin/listings/route.ts)
- View-counter increments inline in `listing/[id]/page.tsx:93-98`
- Reviews + flags via [src/app/api/reviews/route.ts](src/app/api/reviews/route.ts), [src/app/api/flags/route.ts](src/app/api/flags/route.ts)

Initial seed:
- [prisma/seed.ts:27](prisma/seed.ts) — **reads `../../usmle-observerships/data.js`** (sibling repo `/Users/shelly/usmle-observerships`) and ports it into the DB. Brittle external dependency. (See P0 in TECH_DEBT_REGISTER.)
- [scripts/seed-2026-observerships.ts](scripts/seed-2026-observerships.ts) — additional seed
- [scripts/data/observerships-2026-b1.ts ...b4.ts](scripts/data) + [scripts/data/clerkships-2026-{a,b}.ts](scripts/data) — newer batches

## 2 — Where jobs live

**Source:** TypeScript files (NOT the database, even though Prisma has a `WaiverJob` model that appears unused).

| File | Size | Contents | Imported by |
|---|---|---|---|
| `src/lib/waiver-jobs-data.ts` | 35 KB / 989 lines | ~30 manually verified jobs, types, helpers | `jobs-search.tsx`, `cron/verify-jobs/route.ts`, `career/page.tsx` (count) |
| `src/lib/dol-jobs-data.ts` | **1.3 MB / 1,914 lines** | ~407 (or 1,905 in dirty stash) DOL LCA-derived jobs | `waiver-jobs-data.ts` only |
| `src/lib/employer-urls.ts` (in stash) | 4 KB | ~50 hospital → career-page URL map | `jobs-search.tsx` |

⚠ **Bundle blow-up risk:** `jobs-search.tsx` is `"use client"` (it has `useState`). It imports `WAIVER_JOBS` (and in the stashed version `ALL_JOBS = [...WAIVER_JOBS, ...DOL_SPONSOR_JOBS]`). That means **the entire 1.3 MB DOL dataset ships to the browser** for every visitor of `/career/jobs`. See P1 in TECH_DEBT_REGISTER.

Prisma has `model WaiverJob` (schema lines 435-466) but no code reads/writes it. Dead model OR future migration target — undocumented.

## 3 — Where the public counts come from

| Surface | Count | Source | Live or hardcoded? |
|---|---|---|---|
| Homepage hero "Active Listings" stat | DB | `prisma.listing.count` in `page.tsx:37` | **live** |
| Homepage hero "States Covered" stat | DB | `findMany distinct: ['state']` in `page.tsx:38-42` | **live** |
| Homepage hero "Specialties" stat | DB | normalized `findMany` + `Set` in `page.tsx:68-77` | **live** |
| Homepage hero subhead "{listingCount}+ … across {stateCount} states" | DB | passed via `Hero` props | **live** |
| Homepage hero kicker "Verified Directory — Updated **April 2026**" | static string | `hero.tsx:54` | **hardcoded** |
| Homepage type breakdown chips | DB | computed `clinicalRotations`, `researchPositions`, `volunteer` | **live** |
| ProgramStats "by the numbers" section | DB | `program-stats.tsx` 8 parallel queries | **live** |
| ProgramStats "Average observership cost: **Free - $2,500**" | static string | `program-stats.tsx:188-190` | **hardcoded** |
| Browse "{n} listings found" | DB | `browse/page.tsx:129` | **live** |
| Listing detail "{listing.views + 1} views" | DB | `listing/[id]/page.tsx:190` | **live** |
| `/observerships` page subhead "{n} programs across {totalStates} states" | DB | computed | **live** |
| `/observerships` page **title** "Observerships by State — **37 States** & DC" | static metadata | `observerships/page.tsx:9` | **hardcoded — drift risk** |
| `/career` page card "**29 jobs** + **1,087 H-1B sponsors** · **13 specialties**" | static | `career/page.tsx:194` | **hardcoded** |
| `/career/jobs` page title "**Verified Positions**" + subtitle "{jobCount} verified positions" | mixed | `getJobCount()` from TS file (technically derived but the file itself is the source of truth, not DB) | **TS-file-derived** |
| `/career/sponsors` page title "**1,087 Verified Employers**" + body | static | `career/sponsors/page.tsx:5,7,11` | **hardcoded** |
| Many career pages "Last verified: **March 2026**" | static | `career/state-compare/page.tsx:101`, `career/salary/page.tsx:172`, `career/waiver/process/page.tsx:368`, etc. | **hardcoded** |
| Sitemap `numberOfItems` for ItemList JSON-LD | DB | computed | **live** |

**The pattern:** anything sourced from Prisma is live. Anything sourced from a TS file lives twice — once as the array, once as a hardcoded number in metadata/copy. The hardcoded numbers drift.

## 4 — Where Apply Now / Visit Website / Learn More copy comes from

There is no centralized CTA component. The decision lives inline:

```tsx
// src/app/listing/[id]/page.tsx:469
{listing.listingType === "RESEARCH" ? "Learn More"
  : listing.linkVerified ? "Apply Now"
  : "Visit Website"}
```

The verification badge below the button is also inline (`listing/[id]/page.tsx:478-487`). Listing card uses a different verification visual (`<Badge variant="success">Verified</Badge>` with inline SVG, `listing-card.tsx:106-110`). Career/jobs uses different external-link semantics (`getEmployerCareerUrl` lookup).

That means changing CTA wording or verification copy globally requires editing each consumer. Batch 1 of the operating plan calls for "safer CTA labels" — there's no single chokepoint to edit.

## 5 — Where source/verified-date metadata comes from

Three different "trust/verification" components exist for what is conceptually the same UI:

| Component | Path | Inputs | Used by |
|---|---|---|---|
| `TrustBadges` | [src/components/listings/trust-badges.tsx](src/components/listings/trust-badges.tsx) | adminReviewed, verifiedPoster, institutionalEmail, npiVerified | `listing/[id]/page.tsx:205-214` |
| `VerificationBadge` | [src/components/shared/verification-badge.tsx](src/components/shared/verification-badge.tsx) | sourceType (`official`/`community`/`self_reported`/`disputed`/`outdated`), lastVerified, verifiedBy, with tooltip + report button | unverified — search shows no current consumer |
| `VerifiedBadge` | [src/components/ui/verified-badge.tsx](src/components/ui/verified-badge.tsx) | date, sources[] | unverified |

Plus inline `<Badge variant="success">Verified</Badge>` in `listing-card.tsx:106-110` and inline SVG-shield logic in `listing/[id]/page.tsx:478-487`.

**Five different visual treatments for "this thing is verified."** Pick one for PR1.

## 6 — Where blog / resource content lives

| Surface | Source |
|---|---|
| `/blog`, `/blog/[slug]` | `BLOG_POSTS` array in [src/lib/blog-data.ts](src/lib/blog-data.ts) (56 KB / 1,011 lines) |
| `/img-resources` | `IMG_DATA` in [src/lib/img-data.ts](src/lib/img-data.ts) (31 KB / 679 lines) |
| `/residency/*` | `RESIDENCY_DATA` etc. in [src/lib/residency-data.ts](src/lib/residency-data.ts) (28 KB / 566 lines) |
| `/career/state-compare` | `STATE_COMPARISON` in [src/lib/state-comparison-data.ts](src/lib/state-comparison-data.ts) (14 KB / 513 lines) |
| `/career/sponsors` | `SPONSORS` in [src/lib/sponsor-data.ts](src/lib/sponsor-data.ts) (132 KB / unknown lines) |
| `/career/waiver/*` | `WAIVER_STATES`, `WAIVER_DATA` in [src/lib/waiver-data.ts](src/lib/waiver-data.ts) (72 KB / 861 lines) |
| `/career/waiver/tracker` | [src/lib/conrad-tracker-data.ts](src/lib/conrad-tracker-data.ts) (12 KB) |
| `/career/visa-bulletin` | [src/lib/visa-bulletin-data.ts](src/lib/visa-bulletin-data.ts) (6 KB, dated April 2026) |
| `/career/alerts` etc. | [src/lib/policy-alerts-data.ts](src/lib/policy-alerts-data.ts) (7 KB) |
| US-state SVG paths | [src/lib/us-state-paths.ts](src/lib/us-state-paths.ts) (108 KB) |

Total `src/lib/` weight: **~1.7 MB of TypeScript** (mostly static data). Some of this rightly belongs in a CMS or a database table; some (like state SVG paths) belongs in a `.json` import or a static file.

## 7 — Auth / account data flow

- **Provider:** NextAuth 5 beta + Prisma adapter ([src/lib/auth.ts](src/lib/auth.ts), [src/app/api/auth/[...nextauth]/route.ts](src/app/api/auth/[...nextauth]/route.ts))
- **Strategy:** email + password (bcryptjs hash). NextAuth session JWT.
- **Roles:** `UserRole` enum: `APPLICANT | POSTER | ADMIN`. Admin gating done by reading `session.user.role` in admin pages.
- **Profiles:** `ApplicantProfile` and `PosterProfile` are 1:1 with `User`.
- **Organizations:** `Organization` is 1:1 with `User` (poster owns one org).
- **Auth-protected APIs:** check session inline at top of each route. No central middleware (no `src/middleware.ts`).

## 8 — Where email sends come from

- [src/lib/email.ts](src/lib/email.ts) — Resend client. Two senders: `sendListingNotification` (new listing → admin) and `sendAdminNotification` (review/flag/contact → admin). All recipients are `process.env.NOTIFY_TO`. No public-facing emails (no welcome, no password reset email — though NextAuth-beta may handle internally, unverified).
- Reads `RESEND_API_KEY`, `RESEND_FROM`, `NOTIFY_TO` server-side only. No keys committed.
- Falls back to Resend's `onboarding@resend.dev` test domain if `RESEND_FROM` unset.

## 9 — Prisma model inventory

| Model | Used? | Notes |
|---|---|---|
| `User`, `ApplicantProfile`, `PosterProfile`, `Organization` | ✅ active | |
| `Listing`, `SavedListing`, `ComparedListing`, `Application`, `Review` | ✅ active | core listings flow |
| `FlagReport`, `AdminMessage`, `AdminActionLog` | ✅ active | admin |
| `CommunityPost`, `CommunityComment` | ✅ active | community |
| `FellowshipProgram` | ⚠ unverified | schema present, no code-references found in audit |
| `WaiverState`, `WaiverJob` | ⚠ unused | schema present but `/career/jobs` reads from TS files instead |
| `Lawyer`, `DataVerification` | ⚠ unverified | schema present, consumer unknown |

The Prisma schema is *aspirational* for Phase 3 — it documents where the data should eventually live, but the actual jobs/waiver/sponsor pages read from `src/lib/*.ts`.

## 10 — Counts: hardcoded vs centralized — final answer

**Mixed, leaning hardcoded for everything Phase 3.**

- For listings (Phase 1): counts are computed live from Prisma in every consumer. There is no central `getListingCount()` helper but every page calls `prisma.listing.count` directly. Consistent in practice.
- For jobs/sponsors/waiver: counts are hardcoded in page titles, OG metadata, body copy, and the "career landing" cards. The TS data files are the source of truth for the array, but the count claims are duplicated by hand. Drift is live (the dirty stash showed someone trying to update from 437 → 1,948 across 4 files).

The fix isn't to centralize a single number — it's to derive every count from its source array (or the DB) at render time.
