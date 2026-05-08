# Micro-Pilot Release Audit 1 — SEO / Noindex Audit

**Audit date:** 2026-05-08
**Route:** `/clerkships/pilot`
**Source files inspected:** `src/app/clerkships/pilot/page.tsx`, `src/app/sitemap.ts`, `public/robots.txt`, `next.config.ts` (read in prior sprints)

## 1. Route-level noindex

| Layer | Source | Verdict |
|-------|--------|---------|
| Page metadata `metadata.robots = { index: false, follow: false }` | `src/app/clerkships/pilot/page.tsx` | ✅ present |
| Rendered `<meta name="robots" content="noindex, nofollow">` | confirmed in QA sprint `c4343df` via curl on rendered HTML | ✅ present |
| HTTP `X-Robots-Tag: noindex, nofollow` | confirmed in QA sprint via `curl -I` (set globally by `next.config.ts` headers function for Vercel preview URLs) | ✅ present |

## 2. Sitemap

| Check | Result |
|-------|--------|
| `/clerkships/pilot` listed in `src/app/sitemap.ts` | **NO** — `grep -i pilot src/app/sitemap.ts` returns 0 matches |
| `/clerkships/maine` listed in sitemap | NO — also absent (consistent with Maine being noindex) |
| Sitemap accidentally includes pilot via dynamic patterns | NO — sitemap builds from `staticPages`, `statePages`, `specialtyPages`, `listingPages`, `blogIndex`, `blogPages`, `waiverStatePages` arrays plus a `NOINDEX_PREFIXES` filter (`/career`, `/careers`, `/residency`, `/fellowship`) — `/clerkships/*` is not in any of those arrays |

## 3. robots.txt

| Check | Result |
|-------|--------|
| Pilot route mentioned in `public/robots.txt` | NO — robots.txt is allow-all + disallow `/admin`, `/api/`, `/dashboard/`, `/poster/`, `/auth/`. No clerkships entries. |
| Robots.txt change required for pilot | NO — page-level noindex + HTTP X-Robots-Tag are sufficient |

## 4. Public nav / homepage links

| Check | Result |
|-------|--------|
| `/clerkships/pilot` linked from any nav component | NO — `grep -rE "/clerkships/pilot" src/components src/app/layout.tsx src/app/page.tsx` returns 0 matches |
| Linked from Maine route or any other public route | NO — only references to `/clerkships/pilot` are inside the route's own files (page.tsx + PilotClerkshipListings.tsx) and audit docs |
| Discoverable via internal link | Pilot route is unlinked. Direct URL access only. |

## 5. Canonical

| Check | Result |
|-------|--------|
| Canonical URL on the pilot route | `siteUrl("/clerkships/pilot")` set via `metadata.alternates.canonical` |
| Canonical creates an indexed-pathway risk | NO — canonical points to itself, but the route is `noindex`, so search engines won't index it. Canonical is safe metadata for users who share the URL directly. |

## 6. Page copy SEO safety

Confirmed in QA sprint `c4343df` — all banned phrases returned 0 occurrences in rendered HTML:

- `guaranteed placement` — 0
- `hospital-approved` — 0
- `officially approved by` — 0
- `IMG-friendly` — 0
- `apply through USCEHub` — 0
- `official application system` — 0
- `complete national directory` — 0
- `verified by hospital` — 0
- `nationwide` — 0
- `launch` (in launch-language sense) — 0

Page copy explicitly says:
- "covers selected programs only"
- "verify on the official source"
- "this page does not act as an application system"

## 7. Live spot-check

Re-running the dev server in this audit is redundant — the HTTP + meta noindex were verified in QA sprint `c4343df` via curl, and no code has changed since (only docs added in this audit sprint). The browser QA report's curl evidence stands as the live spot-check.

If a fresh live spot-check is desired before deploy:

```bash
cd /Users/shelly/usmle-platform
npm run dev
# in another terminal:
curl -I -L http://localhost:3000/clerkships/pilot | head -10
curl -s http://localhost:3000/clerkships/pilot | grep -i robots | head -5
```

Expected output (already verified in c4343df):
```
HTTP/1.1 200 OK
X-Robots-Tag: noindex, nofollow
...
<meta name="robots" content="noindex, nofollow"/>
```

## 8. Audit verdict

**SEO/noindex layer is RELEASE-SAFE.**

- Route-level noindex: ✅ both meta tag and HTTP header
- Sitemap: ✅ pilot route absent
- Robots.txt: ✅ no change needed
- Public nav: ✅ unlinked
- Canonical: ✅ safe (route is noindex)
- Page copy: ✅ no banned phrases, no launch language

No SEO blockers for a noindex deploy.
