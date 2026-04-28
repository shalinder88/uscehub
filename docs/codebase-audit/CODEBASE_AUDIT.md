# USCEHub Codebase Audit

**Audit branch:** `audit/uscehub-codebase-foundation`
**Audit date:** 2026-04-26
**Repo:** `github.com/shalinder88/uscehub`
**Project root:** `/Users/shelly/usmle-platform` (note: `/Users/shelly/uscehub.com` is an empty placeholder folder, ignore it)
**Domain:** uscehub.com

This is a discovery-only pass. No source files outside `docs/codebase-audit/` were modified.

> **Read [RULES.md](RULES.md) before any cleanup.** This is a **preservation audit** — `/career` is a protected, unfinished future asset (J-1 waiver, H-1B, recruiter directory, attorney directory, Conrad 30 guides, etc.). Do not delete, rename, merge, or restructure anything in the hard protection list. "Looks unused" findings are classified as **"Preserve — unfinished careers asset"**, not deletion candidates. Destructive git commands (`reset --hard`, `clean -fd`, `restore .`, `rm -rf` inside the repo) require explicit user authorization of the exact command.

## Stack

| Layer | Tech | Version | Notes |
|---|---|---|---|
| Framework | Next.js | 16.2.1 | App Router; React 19.2.4 |
| Language | TypeScript | ^5 | `strict: true`, `target: ES2017`, `paths: @/* → src/*` |
| Database | PostgreSQL via Prisma | 6.19.2 | Hosted on Supabase (`pgbouncer` pooled URL) |
| Auth | NextAuth | 5.0.0-beta.30 | Prisma adapter, password hashed with bcryptjs |
| Email | Resend | ^6.12.0 | Transactional only, server-side env vars only |
| Validation | zod | ^4.3.6 | Used in API routes (extent unverified) |
| Forms | react-hook-form + @hookform/resolvers | latest | |
| Styling | Tailwind | ^4 | PostCSS plugin; no CSS-in-JS |
| Icons | lucide-react | ^0.577 | Tree-shaken |
| Analytics | Vercel Analytics + Google Analytics | — | GA ID `G-D8JH9PXCZ3` hardcoded in `src/app/layout.tsx:72` |
| Package manager | npm | 11.4.2 | `package-lock.json` committed |
| Hosting | Vercel | — | `.vercel/` present; `next.config.ts` adds `noindex` for non-prod hostnames |
| Cron | Vercel Cron | — | Single job in `vercel.json` |

## Available scripts

| Script | Defined? | Purpose |
|---|---|---|
| `dev` | ✅ | `next dev` |
| `build` | ✅ | `prisma generate && next build` |
| `start` | ✅ | `next start` |
| `lint` | ✅ | `eslint` |
| `postinstall` | ✅ | `prisma generate` (auto-runs after `npm install`) |
| `typecheck` | ❌ | No script defined; ran via `npx tsc --noEmit` |
| `test` | ❌ | No tests, no test runner |
| `format` | ❌ | No Prettier configured |

`prisma.seed = npx tsx prisma/seed.ts` — but seed has a hidden dependency on a sibling repo (see TECH_DEBT_REGISTER P0).

## Baseline results (run on dirty tree before stash)

| Command | Result | Notes |
|---|---|---|
| `npm run lint` | **18 errors / 142 warnings** | All errors are in pre-existing files (providers, listing-card, smart-search, ssr-page-counter, flag-button). None in dirty files. Most are `react-hooks/set-state-in-effect` from React 19 / Next 16 stricter rules. |
| `npx tsc --noEmit` | **clean** | No type errors. Confirms dirty work's `ALL_JOBS` export + `employer-urls.ts` import wire correctly. |
| `npm run build` | **success** | Full route tree built. ~140 routes including 50 state pages and 28 specialty pages. |

## Deployment configuration

- **`next.config.ts`** — security headers (CSP-lite: nosniff, X-Frame-Options DENY, Referrer-Policy, Permissions-Policy, HSTS); `X-Robots-Tag: noindex,nofollow` on any host that isn't `uscehub.com` (so Vercel preview URLs aren't indexed). One redirect: `/freida` → `/img-resources` (permanent).
- **`vercel.json`** — single cron: `/api/cron/verify-jobs` daily at `0 8 * * *`. ⚠ The route file's docstring claims "3x daily at 8am, 2pm, 10pm UTC" — the comment is wrong, only one schedule is wired. (See TECH_DEBT_REGISTER P2.)
- **`public/robots.txt`** — allows all UAs except listed scrapers (Scrapy, HTTrack, Wget, Bytespider, PetalBot, etc.); blocks `/admin`, `/api/`, `/dashboard/`, `/poster/`, `/auth/`.
- **`src/app/sitemap.ts`** — dynamic, includes static pages, 51 state pages, 28 specialty pages, 50 waiver state pages, all approved listings, all blog posts, ~30 career/residency pages. Has a duplicate `/career` entry (see P1).
- **`.env.example`** — clean template, no real secrets, documents Supabase + NextAuth + Resend setup.

## Working-tree status at audit start

Branch was `main`, dirty with active jobs-data expansion + jobs-search UI refactor:

| File | Change |
|---|---|
| `PROJECT-STATUS.md` | counts: 437 → 1,948 jobs |
| `src/app/career/jobs/jobs-search.tsx` | +163/−113 (single-select → checkbox visa filter, +pagination) |
| `src/app/career/jobs/page.tsx` | rename "J-1 Waiver Physician Jobs" → "Physician Jobs" |
| `src/app/career/page.tsx` | "29 jobs" → "1,948 jobs" |
| `src/lib/waiver-jobs-data.ts` | +`"none"` visa type, export `ALL_JOBS` |
| `scripts/output/city-profiles-base.json` (new) | 17K city intel data |
| `src/lib/employer-urls.ts` (new) | 4K employer career-page URL map (referenced by jobs-search.tsx) |

**Disposition:** stashed via `git stash push -u -m "preserve jobs expansion before USCEHub codebase audit"` to keep the audit branch clean. Stash includes the untracked `employer-urls.ts` (which jobs-search.tsx imports). Pop via `git stash pop` when ready to continue that feature work — likely on its own branch.
