# Route Map

App Router under `src/app/`. ~140 page files. Three product phases share the URL space:
- **Phase 1 — USCE/Listings**: `/`, `/browse`, `/observerships`, `/listing/[id]`, `/community`, `/compare`, `/recommend` — all DB-backed.
- **Phase 2 — Residency**: `/residency/*` — content pages, no DB.
- **Phase 3 — Career/Attending**: `/career/*` — content pages backed by hardcoded TS-file data (jobs, sponsors, waiver data).

## Public routes (rendered HTML)

| Route | Purpose | Main file | Data source | SEO metadata | Risk |
|---|---|---|---|---|---|
| `/` | Homepage with hero, featured, stats, map | [src/app/page.tsx](src/app/page.tsx) | Prisma (8 parallel queries) | ✅ canonical, OG, JSON-LD (Org+Website+ItemList) | low — counts live |
| `/browse` | Filtered listings index | [src/app/browse/page.tsx](src/app/browse/page.tsx) | Prisma (filtered query) | ✅ canonical, breadcrumb schema | low |
| `/listing/[id]` | Listing detail + reviews + flag | [src/app/listing/[id]/page.tsx](src/app/listing/[id]/page.tsx) | Prisma (joined) | ✅ generateMetadata, JSON-LD EducationalProgram | **P1** — CTA logic inline, not centralized |
| `/observerships` | State directory | [src/app/observerships/page.tsx](src/app/observerships/page.tsx) | Prisma | ⚠ title hardcodes "37 States & DC" | **P1** — title can drift from DB |
| `/observerships/[state]` | Per-state listings | [src/app/observerships/[state]/page.tsx](src/app/observerships/[state]/page.tsx) | Prisma | depends on file | unverified |
| `/observerships/specialty/[specialty]` | Per-specialty listings | [src/app/observerships/specialty/[specialty]/page.tsx](src/app/observerships/specialty/[specialty]/page.tsx) | Prisma | depends on file | unverified |
| `/compare` | Side-by-side compare | [src/app/compare/page.tsx](src/app/compare/page.tsx) | Prisma + client state | unverified | low |
| `/recommend` | Smart-finder questionnaire | [src/app/recommend/page.tsx](src/app/recommend/page.tsx) | client + API | unverified | low |
| `/community` | Community posts | [src/app/community/page.tsx](src/app/community/page.tsx) | Prisma | unverified | low |
| `/community/suggest-program` | Suggestion form | [src/app/community/suggest-program/page.tsx](src/app/community/suggest-program/page.tsx) | API | unverified | low |
| `/blog` | Blog index | [src/app/blog/page.tsx](src/app/blog/page.tsx) | TS file `BLOG_POSTS` | unverified | low |
| `/blog/[slug]` | Blog post | [src/app/blog/[slug]/page.tsx](src/app/blog/[slug]/page.tsx) | TS file `BLOG_POSTS` | unverified | low |
| `/img-resources` | IMG resources hub | [src/app/img-resources/page.tsx](src/app/img-resources/page.tsx) | TS file `IMG_DATA` | ✅ FAQ schema | low |
| `/tools/cost-calculator` | Cost calculator tool | [src/app/tools/cost-calculator/page.tsx](src/app/tools/cost-calculator/page.tsx) | client | unverified | low |
| `/methodology` | Editorial methodology | [src/app/methodology/page.tsx](src/app/methodology/page.tsx) | static | unverified | low |
| `/for-institutions` | Institution sales page | [src/app/for-institutions/page.tsx](src/app/for-institutions/page.tsx) | static | unverified | low — pricing not yet present |
| `/how-it-works` | Explainer | [src/app/how-it-works/page.tsx](src/app/how-it-works/page.tsx) | static | unverified | low |
| `/faq` | FAQ | [src/app/faq/page.tsx](src/app/faq/page.tsx) | static | unverified | low |
| `/about` | About | [src/app/about/page.tsx](src/app/about/page.tsx) | static | unverified | low |
| `/contact`, `/contact-admin` | Contact forms | static | unverified | low |
| `/disclaimer`, `/privacy`, `/terms` | Legal | static | unverified | low |
| `/resources` | Resources index | static | unverified | low |
| `/career` | Career landing | [src/app/career/page.tsx](src/app/career/page.tsx) | mostly static | ⚠ hardcodes "29 jobs + 1,087 H-1B sponsors · 13 specialties" line | **P1** |
| `/career/jobs` | Job board | [src/app/career/jobs/page.tsx](src/app/career/jobs/page.tsx) → `JobsSearch` (client) | TS files `WAIVER_JOBS` + `DOL_SPONSOR_JOBS` (1.3 MB) | ⚠ hardcoded count in title | **P0/P1** — entire dataset ships to browser |
| `/career/jobs/[specialty]` | Per-specialty jobs | [src/app/career/jobs/[specialty]/page.tsx](src/app/career/jobs/[specialty]/page.tsx) | TS file | unverified | same |
| `/career/sponsors` | H-1B sponsor search | [src/app/career/sponsors/page.tsx](src/app/career/sponsors/page.tsx) → `SponsorSearch` (client) | TS file `sponsor-data.ts` (132 KB) | ⚠ "1,087 Verified Employers" hardcoded in title + body | **P1** |
| `/career/waiver` | Waiver overview | [src/app/career/waiver/page.tsx](src/app/career/waiver/page.tsx) | TS file `WAIVER_STATES` | unverified | low |
| `/career/waiver/[state]` | Per-state waiver intel (×50) | [src/app/career/waiver/[state]/page.tsx](src/app/career/waiver/[state]/page.tsx) | TS file `WAIVER_STATES` | depends on file | low |
| `/career/waiver/{hpsa-lookup,map,pathways,process,timeline,tracker}` | Waiver tools | various | TS files | unverified | low |
| `/career/state-compare`, `/career/compare-states` | Two state-compare pages | various | TS files | possible duplicate route intent | **P2** |
| `/career/{licensing,loan-repayment,locums,malpractice,offers,salary,taxes,visa-bulletin,visa-journey,greencard,h1b,h4-spouse,ecfmg,citizenship,credentialing,interview,contract,attorneys,community,alerts,employers,employers/post,waiver-problems}` | Career content pages (~25) | mostly static + TS files | mixed | mostly low; many use "Last verified: March 2026" hardcoded date |
| `/residency` | Residency hub | [src/app/residency/page.tsx](src/app/residency/page.tsx) | static + TS file | unverified | low |
| `/residency/{boards,community,fellowship,fellowship/guide,finances,moonlighting,post-match,procedures,research,resources,salary,survival}` | Residency pages (~12) | static / TS files | unverified | low |

## Auth + dashboards (private)

| Route | Purpose |
|---|---|
| `/auth/signin`, `/auth/signup` | NextAuth screens |
| `/dashboard`, `/dashboard/{applications,compare,profile,reviews,saved,settings}` | Applicant dashboard |
| `/poster`, `/poster/{applications,listings,listings/new,listings/[id]/edit,organization,settings,verification}` | Poster dashboard |
| `/admin`, `/admin/{activity,flags,listings,messages,posters,reviews,users}` | Admin moderation queue |

`robots.txt` blocks crawl on all of these.

## API routes

| Route | Auth | Purpose |
|---|---|---|
| `/api/auth/[...nextauth]` | — | NextAuth handler |
| `/api/auth/signup` | — | Email+password signup |
| `/api/admin-messages` | session | Contact-admin messages |
| `/api/admin/{listings,posters,reviews}` | admin | Moderation |
| `/api/admin` | admin | Activity log feed |
| `/api/applications`, `/api/applications/[id]` | session | Applicant applications |
| `/api/compare`, `/api/compared` | session | Compared listings |
| `/api/cron/verify-jobs` | bearer `CRON_SECRET` | Vercel Cron — checks job URLs alive |
| `/api/flags` | session | Listing flag reports |
| `/api/listings`, `/api/listings/[id]` | session for write | CRUD |
| `/api/my-reviews`, `/api/reviews` | session | Review CRUD |
| `/api/organizations` | session | Organization profile |
| `/api/poster-applications`, `/api/poster-listings`, `/api/poster-profile` | poster session | Poster CRUD |
| `/api/profile` | session | Applicant profile |
| `/api/programs/stats` | — | Stats endpoint (likely consumed by client widget) |
| `/api/recommend` | — | Smart finder |
| `/api/saved` | session | Saved listings |

## Sitemap & SEO

`src/app/sitemap.ts` (force-dynamic) emits ~500+ URLs:
- 19 static top-level pages
- 51 state pages (50 + DC)
- 28 specialty pages
- All approved listings (Prisma)
- All blog posts
- 50 waiver-state pages
- ~30 career/residency content pages

⚠ **`/career` appears twice** in the sitemap (`src/app/sitemap.ts` lines 290 and 344). Different `priority` (0.9 vs 0.9) and `changeFrequency` (weekly vs daily). Logged as P1.
