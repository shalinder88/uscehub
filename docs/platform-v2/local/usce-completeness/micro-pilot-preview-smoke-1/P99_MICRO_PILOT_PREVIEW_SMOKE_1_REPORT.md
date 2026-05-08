# P99 Micro-Pilot Preview Smoke — Sprint 1 Report

**Date:** 2026-05-08
**Repo:** `/Users/shelly/usmle-platform`
**Branch:** `local/p97-discovery-integrity-guardrails`
**Commit smoked:** `ad2b3f6` (latest pushed)
**Preview URL:** `https://uscehub-5lf3vtwzk-shalinder88s-projects.vercel.app`
**Route tested:** `/clerkships/pilot`
**Vercel project:** displayed in Vercel dashboard URL slug as **`uscehub`** (canonical), team slug `shalinder88s-projects`

---

## 1. Executive result

**`PREVIEW_SMOKE_PASS_WITH_RELEASE_BLOCKER`** — page renders correctly with all content gates GREEN, but **one production-only React hydration error** (#418) was found that did NOT appear in the local dev-server QA. This is a release-blocker for the "no console errors" gate. Production merge requires a small follow-up fix.

| Top-level metric | Result |
|------------------|--------|
| Preview deployment found | YES |
| Preview URL accessible | YES (via authenticated Chrome session — Vercel Deployment Protection requires SSO) |
| Route `/clerkships/pilot` HTTP | 200 |
| 5 cards render | YES |
| 10+ excluded institutions absent | YES |
| Noindex meta + nofollow | YES |
| Sitemap clean | YES (411 URL entries; 0 `clerkships/*` paths) |
| Banned phrases absent | YES |
| Console errors | **1 — React #418 hydration mismatch** (release blocker) |
| Production untouched | YES (`origin/main` SHA `739ab1e2...`) |

## 2. Preview URL discovery

**How URL was found:** GitHub deployments API (`gh api repos/shalinder88/uscehub/deployments`) → deployment status (`environment_url`).

For the latest pushed commit `ad2b3f6`:
- Deployment ID: `4625931066`
- Environment: `Preview`
- Status: `success`
- **URL:** `https://uscehub-5lf3vtwzk-shalinder88s-projects.vercel.app`

For older pushed commits:
- `d2d17c7` → `https://uscehub-6yt71ltov-shalinder88s-projects.vercel.app` (success)
- `f9063bb` → `https://uscehub-l644o5z7v-shalinder88s-projects.vercel.app` (success)

**Vercel project name reconciliation:**
- Vercel dashboard URL path: `https://vercel.com/shalinder88s-projects/uscehub/...` ← project slug **`uscehub`**
- Local `.vercel/project.json` says `"projectName":"usmle-platform"` ← STALE
- **Conclusion:** the canonical Vercel project IS named `uscehub` in the dashboard. The local file is out of date but functionally correct (same project ID). The earlier realignment audit's "CASE 2 — name is `usmle-platform`" was WRONG about the dashboard name; it's actually `uscehub`. The local file is the only place still saying `usmle-platform`.

This is excellent news — no rename needed in the Vercel dashboard. Recommended cleanup: re-run `vercel link` locally at some point so `.vercel/project.json` `projectName` matches the actual `uscehub` (cosmetic, not blocking).

## 3. HTTP / noindex result

**HTTP layer:**
- `curl -I` against the preview URL returned `HTTP/2 401` with a Vercel SSO auth wall — **expected behavior** (Vercel Deployment Protection gates preview deployments behind team auth). The auth page itself sets `x-robots-tag: noindex` on Vercel's side.

**Authenticated Chrome session (user's logged-in browser via Chrome MCP):**
- HTTP 200 on the actual `/clerkships/pilot` page.
- Meta robots: `<meta name="robots" content="noindex, nofollow">` ✅
- HTTP `X-Robots-Tag: noindex, nofollow` is set globally by `next.config.ts` (verified in static config; Vercel respects it; the auth wall ALSO sets `x-robots-tag: noindex`).

**Production-leak risk:** ZERO. The preview deployment is double-protected (Vercel auth wall + page-level noindex + HTTP noindex header). Random users / search engines cannot access it.

## 4. Row result

Verified via authenticated Chrome session + `document.documentElement.innerText` regex counts:

| Institution | Expected | Found |
|-------------|----------|-------|
| Morristown Medical Center | 1 | 1 ✅ |
| Overlook Medical Center | 1 | 1 ✅ |
| Cleveland Clinic Mercy Hospital | 1 | 1 ✅ |
| Cleveland Clinic Hillcrest Hospital | 1 | 1 ✅ |
| Highland Hospital | 1 | 1 ✅ |
| Mankato | 0 | 0 ✅ |
| Eau Claire | 0 | 0 ✅ |
| Bergen New Bridge | 0 | 0 ✅ |
| Saint Elizabeths | 0 | 0 ✅ |
| Hemet | 0 | 0 ✅ |
| Thomas Jefferson University Hospital | 0 | 0 ✅ |
| Manatee | 0 | 0 ✅ |
| San Antonio | 0 | 0 ✅ |
| UPMC Western Psychiatric | 0 | 0 ✅ |
| Lincoln Medical | 0 | 0 ✅ |

Hero showed: `5 listings · 2 open to international students per source · 3 US MD/DO per source` — matches expected counts.

## 5. Content safety result

| Banned phrase | Count |
|---------------|-------|
| `guaranteed` | 0 |
| `hospital-approved` / `hospital approved` | 0 |
| `IMG-friendly` / `IMG friendly` | 0 |
| `apply through USCEHub` | 0 |
| `complete national directory` | 0 |
| `verified by hospital` | 0 |
| `nationwide` | 0 |
| `officially approved by` | 0 |

Caveats VISIBLE per card via authenticated Chrome capture:
- Each card shows fit_warnings as amber pills (e.g., "Named-school MS3 list only", "Housing not provided", "Not a broad IMG pathway")
- "Source caveats" expandable element per card
- Audience summary line per card ("Eligible (per source): us md do, caribbean student · Not stated on source: international student, img graduate")

Internal field leakage: 0 — no `screenshot_path`, `must_not_claim`, `not_allowed_actions`, `bridge_row_id`, `reviewer_notes` strings appear in rendered text.

## 6. Link result

Source links (per card):
- `https://ahs.atlantichealth.org/professionals-medical-education/medical-students.html` — visible on Morristown + Overlook cards
- `https://my.clevelandclinic.org/departments/elective-program/requirements` — visible on CCF Mercy + CC Hillcrest cards
- `https://www.highlandmedicine.org/visiting-elective-scholarship` — visible on Highland card

Report-issue links:
- 5 per-card "Report a listing issue" links pointing to `/contact?ref=pilot-listing&listing_id=<id>` ✅
- 1 footer feedback link to `/contact?ref=pilot-feedback` ✅

All sources are external `target=_blank rel=noopener noreferrer`; report links are internal route navigation.

## 7. Mobile / console result

**Console:** **1 error found** in production preview (NOT in local dev-mode QA):

```
[EXCEPTION] Error: Minified React error #418
  at https://uscehub-5lf3vtwzk-shalinder88s-projects.vercel.app/_next/static/chunks/0plev2sy1bl65.js:0:46253
  ... (in React reconciler / hydration path)
```

**Diagnosis:** React error #418 = "Hydration failed because the initial UI does not match what was rendered on the server." Most likely cause: `new Date(c.last_reviewed_at).toLocaleDateString()` in `src/app/clerkships/pilot/PilotClerkshipListings.tsx`. `toLocaleDateString()` is locale-dependent — Node's SSR locale and the browser's locale produce different formatted strings, triggering the hydration mismatch.

**Severity:** Medium-High.
- Page DOES render correctly (React falls back to client-side rendering after hydration mismatch — visible content is correct).
- BUT the error fires on every page load.
- The "no console errors" gate from the noindex release checklist is **not met** in production preview.
- Production merge should fix this before deploy.

**Why it didn't appear in local QA:** local Playwright headless used Chrome with the same locale as Node (en-US), so SSR and CSR matched. In production Vercel runtime + the user's real browser, locales may differ slightly; React's stricter production hydration check fires.

**Mobile layout:** captured visually via Chrome MCP screenshot. Cards stack vertically; pills wrap. (Sprint did not run a separate Playwright headed mobile-viewport capture against the preview URL because Vercel auth wall blocks headless tools without auth tokens; the user's real Chrome session was used instead.)

**Hydration mismatch fix (recommended for next sprint):**
```tsx
// Before:
Last reviewed {new Date(c.last_reviewed_at).toLocaleDateString()}

// After (stable across locales):
Last reviewed {c.last_reviewed_at.slice(0, 10)}
```
Or alternatively `new Date(c.last_reviewed_at).toLocaleDateString('en-US')` to lock the locale. Both are 1-line changes. Either resolves the hydration mismatch.

## 8. Sitemap / nav result

| Check | Result |
|-------|--------|
| `/clerkships/pilot` in `/sitemap.xml` | 0 occurrences ✅ |
| `/clerkships/maine` in sitemap | 0 occurrences ✅ |
| Any `clerkships` paths in sitemap | 0 occurrences ✅ |
| Total URL entries in preview sitemap | 411 |
| Pilot route linked from public nav (verified visually on rendered page) | NO — only the standard nav (Browse Opportunities, For Institutions & Physicians, Community, IMG Resources, Tools, About Us) ✅ |

The sitemap also uses canonical `https://uscehub.com` URLs (not preview-URL), which is correct — the production sitemap is built from `siteUrl()` regardless of which environment serves it.

## 9. Remaining blockers

### Code blocker (1)
- **`B-001` React #418 hydration mismatch on pilot route** — likely caused by `toLocaleDateString()` in `PilotClerkshipListings.tsx`. Recommended fix: use stable ISO date prefix or locked `'en-US'` locale.

### Process blockers (2 — same as before)
- **G-023 explicit user push-to-main approval.** This sprint did NOT touch main.
- **G-024 production smoke test after main merge.** Cannot run until production deploy.

### Vercel naming cosmetic (NOT a blocker)
- Local `.vercel/project.json` says `projectName: "usmle-platform"` while the actual Vercel dashboard project is named `uscehub`. Cosmetic only — same project ID. Recommend `vercel link` re-run as future cleanup.

## 10. Recommendation

**`PREVIEW_SMOKE_PASS_WITH_RELEASE_BLOCKER`** — substantive smoke gates ALL pass (correct route content, correct noindex, correct sitemap exclusion, correct caveat display, correct source/report links, no banned phrases, no internal leakage). The single hydration error is a real release-blocker for clean production deploy and should be fixed in a small follow-up sprint before production merge.

**Recommended next sprint:** `P99-MICRO-PILOT-HYDRATION-FIX-1` — single-file fix to `src/app/clerkships/pilot/PilotClerkshipListings.tsx` replacing `toLocaleDateString()` with stable ISO prefix or locked locale. Push to preview branch. Re-smoke. If clean, advance to production-merge audit.

**Production merge recommendation deferred** until hydration error is fixed AND a separate production-merge blast-radius audit is performed (the branch carries 47 commits / full P96-P99 stack, not just the pilot — the user already flagged this in prior turns).

## 11. Hard-rule confirmation

| Rule | Status |
|------|--------|
| No production deploy | CONFIRMED — `--prod` never used; production main `739ab1e2...` UNCHANGED |
| No `vercel --prod` | CONFIRMED — Vercel CLI is not even installed |
| No merge to main | CONFIRMED |
| No PR to main | CONFIRMED |
| No push other than smoke-test docs | This sprint pushed the report only (next phase) |
| No DB / schema / prisma / seed mutation | CONFIRMED |
| No Vercel production promotion | CONFIRMED |
| No DNS / env var / domain change | CONFIRMED |
| No Vercel project deletion / relink / rename | CONFIRMED |
| No sitemap / nav / homepage exposure | CONFIRMED — sitemap unchanged; pilot remains unlinked |
| No route indexing | CONFIRMED — meta robots noindex,nofollow + Vercel auth wall + global X-Robots-Tag header all in place |
| No `PUBLIC_NOW` / `IMPORT_READY` | CONFIRMED |
| No new rows | CONFIRMED |
| Pre-existing dirty files untouched | CONFIRMED — `.claude/launch.json`, Maine generated.json/.ts NOT staged |
| No broad `git add .` | CONFIRMED — explicit paths only at commit time |
| No NPPES / redesign-mockups files staged | CONFIRMED |
