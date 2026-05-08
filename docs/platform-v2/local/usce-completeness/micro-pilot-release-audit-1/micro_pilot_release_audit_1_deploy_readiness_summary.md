# Micro-Pilot Release Audit 1 — Deploy Readiness Summary

**Date:** 2026-05-08
**Verdict:** **READY_FOR_USER_APPROVED_NOINDEX_DEPLOY**

## 1. Current release status

**Technically ready for user-approved noindex deploy.** All code/data gates PASS. Two process gates remain:
- User must explicitly approve push/deploy.
- Post-deploy smoke test will run after deploy.

No code or data blocker remains.

## 2. What deploy would mean

A user-approved deploy of the 5-row micro-pilot would:
- Push commits `476000a` (runtime generation) + `c4343df` (browser QA + report-issue fix) to the remote git repo.
- Trigger the existing Next.js / Vercel build pipeline.
- Make `/clerkships/pilot` reachable at the production URL — but **noindex+nofollow** at both HTTP-header level (`X-Robots-Tag`) and page-meta level. Search engines that respect the directives will not index it.
- Add zero rows to any database (the pilot is static-generated JSON — no Prisma writes).
- Leave the existing Maine route at `/clerkships/maine` unchanged.
- Leave site nav, sitemap, robots.txt, homepage, all other routes unchanged.
- NOT be a public indexed launch.
- NOT be a national directory.
- NOT be a full USCEHub launch.

## 3. What must be checked immediately after deploy

A post-deploy smoke test (`P99-MICRO-PILOT-POST-DEPLOY-SMOKE-1` or equivalent, ~5 min) should verify on the preview/production URL:

1. `/clerkships/pilot` loads HTTP 200.
2. `X-Robots-Tag: noindex, nofollow` header present in production response.
3. `<meta name="robots" content="noindex, nofollow">` in rendered HTML head.
4. Exactly 5 cards rendered (Morristown · Overlook · CCF Mercy · CC Hillcrest · Highland).
5. None of the 10+ excluded institutions visible (Mayo Mankato / Eau Claire / Bergen / Saint Elizabeths / Hemet / TJUH / Manatee / UH SA / UPMC Western Psychiatric / Lincoln Medical).
6. 3 source links open the correct external URLs in a new tab.
7. 5 per-card "Report a listing issue" links navigate to `/contact?ref=pilot-listing&listing_id=...`.
8. Footer report-feedback link navigates to `/contact?ref=pilot-feedback`.
9. No console errors on the production-rendered page.
10. Sitemap.xml does NOT include `/clerkships/pilot`.
11. Public nav does NOT show a `/clerkships/pilot` link.
12. Existing `/clerkships/maine` route still works unchanged.

If any of these fail in production, immediate rollback is the right move (see §4).

## 4. Rollback plan

If anything goes wrong after deploy:

**Path A — soft rollback (preferred for noindex pilot issues):**
- The pilot route is unlinked and noindex. If a card text issue surfaces, fix forward in a small commit + redeploy. No external traffic depends on the pilot today.

**Path B — hard rollback (if a blocker is found):**
- `git revert c4343df 476000a` — reverts the QA + runtime commits. Pilot route disappears; runtime files removed.
- Or revert just the route page (`src/app/clerkships/pilot/`) to make the route 404 while keeping runtime files for future use.
- Either way: do NOT alter the Maine route during rollback.

**Path C — emergency case (if something is mistakenly indexed):**
- Confirm `X-Robots-Tag` header is set on the live deployment.
- Add an explicit `Disallow: /clerkships/pilot` to `public/robots.txt` if needed.
- File a Google Search Console removal request if any SERP appearance.
- This is highly unlikely given the dual-layer noindex enforcement, but the mitigation path exists.

The pilot route is unlinked, so blast-radius is minimal. The most likely "bug" would be a typo or layout glitch, not a data leak — and even those are static-content fixes.

## 5. Remaining larger-site work (out of scope for this deploy)

- **Source-capture batch 3** for the 4 still-blocked rows (Manatee + UH San Antonio + UPMC Western Psychiatric + Lincoln Medical).
- **Mayo regional source replacement** — find a direct Mankato / Eau Claire source, OR keep them KEEP_INTERNAL.
- **Bergen Wayback retry** — opportunistic, low priority.
- **More rows** — once batch 3 closes, expand the pilot toward 10–15 rows.
- **Save / compare / report-issue modal** on the pilot route if curator decides the pilot needs the full Maine UI before a broader noindex pilot.
- **Indexed public launch strategy** — when the corpus is large enough (≥30 cards across 6+ states per the bridge audit's first-national-pilot framing), reconsider indexation as a separate audit step.
- **Full USCEHub launch audit** — homepage, hero, marketing copy, full SEO. Out of scope for the current micro-pilot.
- **Pre-existing dirty-files cleanup** in Mac-local (`.claude/launch.json`, Maine generated files, untracked nppes/redesign).

## 6. What this deploy is NOT

- **Not a public launch.** Route is noindex.
- **Not a national directory.** 5 cards, NJ/OH/CA only.
- **Not a verified-by-hospital seal.** Sources are read-only checked, not endorsed by institutions.
- **Not an application system.** Page footer says so.
- **Not a complete dataset.** Listings appear only after explicit eligibility evidence is found on the institution's own program page.
