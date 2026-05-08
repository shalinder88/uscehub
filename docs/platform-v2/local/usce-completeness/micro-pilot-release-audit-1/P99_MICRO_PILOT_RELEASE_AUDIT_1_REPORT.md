# P99 Micro-Pilot Release Audit — Sprint 1 Report

**Audit date:** 2026-05-08
**Repo:** `/Users/shelly/usmle-platform`
**Branch:** `local/p97-discovery-integrity-guardrails`
**Commit audited:** `c4343df P99: QA noindex micro pilot route`
**Scope:** Final noindex release audit before any push/PR/deploy. **No deploy. No push. No PR. No production mutation.**

---

## 1. Executive result

| Metric | Result |
|--------|--------|
| Release audit | **PASSED** |
| Code/data gates | **All PASS** (G-001 through G-022) |
| Process gates remaining | 2 (G-023 user push approval; G-024 post-deploy smoke test) |
| Deploy status | **NOT DEPLOYED** |
| Deployment recommendation | **`READY_FOR_USER_APPROVED_NOINDEX_DEPLOY`** |

## 2. Route audited

- URL: `/clerkships/pilot`
- Source files: `src/app/clerkships/pilot/page.tsx` + `PilotClerkshipListings.tsx` + `src/lib/usce-pilot-data.ts` + `src/data/usce/public-listings-pilot.generated.json` + `.ts`
- Local dev status: not re-spun in this audit (re-running would be redundant — last live curl in QA `c4343df` confirmed HTTP 200 + `X-Robots-Tag: noindex, nofollow` + `<meta name="robots" content="noindex, nofollow">`; no code has changed since)

## 3. Data scope result

**5 cards present, 10+ excluded absent.** Detailed evidence in [`micro_pilot_release_audit_1_data_scope_audit.csv`](micro_pilot_release_audit_1_data_scope_audit.csv) (28 audit items, all PASS).

| Included | listing_id |
|----------|-----------|
| Morristown Medical Center NJ | `pilot-075-NJ-morristown-medical-center` |
| Overlook Medical Center NJ | `pilot-076-NJ-overlook-medical-center` |
| Cleveland Clinic Mercy Hospital OH | `pilot-091-OH-cleveland-clinic-mercy-hospital` |
| Cleveland Clinic Hillcrest Hospital OH | `pilot-149-OH-cleveland-clinic-hillcrest-hospital` |
| Highland Hospital (Alameda Health System) CA | `pilot-162-CA-highland-hospital-alameda-health-system-` |

| Excluded | Reason |
|----------|--------|
| Mayo Mankato | KEEP_INTERNAL_SOURCE_FRAMEWORK_ONLY |
| Mayo Eau Claire | KEEP_INTERNAL_SOURCE_FRAMEWORK_ONLY |
| Bergen New Bridge | NEEDS_ARCHIVE_RETRY (Wayback persistently fails) |
| Saint Elizabeths | KEEP_INTERNAL — residency-supporting source |
| Hemet Global | KEEP_INTERNAL — visa NO_SPONSORSHIP |
| TJUH | REJECT_PUBLIC_PILOT — strict 10-named-partner bar |
| Manatee · UH San Antonio · UPMC Western Psychiatric · Lincoln Medical | NEEDS_SOURCE_CAPTURE_BATCH_3 |

## 4. Noindex / SEO result

**RELEASE-SAFE.** Detail in [`micro_pilot_release_audit_1_seo_noindex_audit.md`](micro_pilot_release_audit_1_seo_noindex_audit.md).

| Layer | Status |
|-------|--------|
| Page metadata `robots: { index: false, follow: false }` | ✅ |
| HTTP `X-Robots-Tag: noindex, nofollow` (next.config.ts global header) | ✅ |
| `/clerkships/pilot` in `src/app/sitemap.ts` | NO ✅ |
| Pilot route in `public/robots.txt` | NO ✅ (no entry needed; page-level noindex sufficient) |
| Pilot route linked from public nav / homepage / Maine route | NO ✅ |
| Canonical safe (route is noindex; canonical points to itself) | ✅ |

## 5. Content safety result

**5 of 5 cards PASS** content-safety audit. Detail in [`micro_pilot_release_audit_1_content_safety_audit.csv`](micro_pilot_release_audit_1_content_safety_audit.csv).

Per-row caveat preservation:
- **Morristown:** named-school MS3 list + MS4 space-permitting + Housing not provided + SGU named partner only (no broad Caribbean).
- **Overlook:** sibling under shared Atlantic Health page; same caveat set.
- **CCF Mercy:** LCME/AOA only + B-1 applicant-obtained (NOT institution-sponsored) + fee required + max two applications + explicit denial of J-1 / H-1B sponsorship.
- **CC Hillcrest:** all the above PLUS explicit `SYSTEM_PAGE_NO_SITE_SPECIFIC_GUARANTEE` pill.
- **Highland:** diversity-scholarship-only audience (URM 4th-year) + good academic standing required + scholarship-only-not-general-aid framing.

No banned phrases, no broad-launch language, no raw P97 internal fields anywhere in rendered HTML or runtime JSON.

## 6. Functional result

| Function | Result |
|----------|--------|
| Source links per card | ✅ 3 unique URLs across 5 cards (`atlantichealth.org`, `clevelandclinic.org`, `highlandmedicine.org`); target=_blank rel=noopener noreferrer |
| Per-card "Report a listing issue" link | ✅ 5 links → `/contact?ref=pilot-listing&listing_id=<id>` |
| Footer report-feedback call-out | ✅ 1 link → `/contact?ref=pilot-feedback` |
| Save / compare | NOT WIRED → marked NON_BLOCKING_LIMITATION (pilot copy does not promise these features; existing P99 save-compare validator still PASSES against Maine) |
| Desktop screenshot | ✅ 365 KB Playwright headless 1440×900 |
| Mobile screenshot | ✅ 890 KB Playwright headless 390×844 |
| Console clean | ✅ 0 errors / 0 page errors / 0 hydration warnings |
| Mobile / desktop layout | ✅ Cards stack on mobile; pills wrap; no horizontal overflow; no clipping |

## 7. Validator result

| Validator | Result |
|-----------|--------|
| `scripts/validate-micro-pilot-runtime.ts` | PASSED — 5 cards + route gates (noindex+nofollow) |
| `scripts/usce-data/validate-public-runtime-data.ts` | PASSED unchanged (Maine 12 cards) |
| `scripts/validate-usce-public-cards.ts` | PASSED |
| `scripts/validate-usce-save-compare.ts` | PASSED |
| `scripts/validate-usce-report-intake.ts` | PASSED |
| `scripts/validate-usce-pilot-release.ts` | PASSED |
| `tsc --noEmit` | clean |

All re-run at the start of this audit; no changes since QA `c4343df`.

## 8. Remaining blockers

### Code / data blockers
**None.**

### Process blockers
- **G-023:** Explicit user push approval. Per Shelly's standing rule, no push without explicit instruction.
- **G-024:** Post-deploy smoke test. Cannot execute until a preview/prod URL exists.

### Post-deploy checks (not blockers — sequential)
- Verify production `X-Robots-Tag` header.
- Verify production `<meta robots>`.
- Verify 5 cards / 10+ excluded.
- Spot-check source links in production browser.
- Confirm sitemap.xml on production does NOT include the pilot route.
- Confirm public nav does NOT include a pilot link.

### Pre-existing repo state (not pilot-related)
- `.claude/launch.json`, Maine `public-listings.generated.json/.ts` are dirty from prior work, NOT staged in any pilot commit. They will need a separate cleanup pass before a non-pilot deploy of unrelated work, but they do NOT affect a pilot-only push.

## 9. Deployment recommendation

**`READY_FOR_USER_APPROVED_NOINDEX_DEPLOY`**

All technical gates PASS. The pilot is conservative-by-design: noindex at two layers, unlinked from nav, NO sitemap entry, 5 source-reviewed cards with caveat-first display, all 10+ blocked institutions explicitly absent, 0 console errors, all validators (existing + new) PASS, `tsc` clean.

The two remaining gates are user-controlled and time-shifted:
- User must explicitly approve push.
- Post-deploy smoke test runs after deploy.

## 10. Exact next instruction required from user

Per the prompt's stated affirmation language and Shelly's global rule that "push" must be typed:

> **No deploy will happen unless the user explicitly types:**
>
> `push the noindex micro-pilot`
>
> or equivalent affirmation (e.g. "push the pilot", "deploy the noindex micro-pilot", "go ahead and push commit c4343df", etc.).

The next agent should NOT push, even if context implies approval, until the user types the affirmation in the chat.

After the explicit push affirmation:
1. The deploy task pushes commits `476000a` (runtime generation) + `c4343df` (browser QA + report-issue fix) to the remote.
2. Vercel preview/production builds.
3. Run the post-deploy smoke test (12 checks listed in `micro_pilot_release_audit_1_deploy_readiness_summary.md` §3).

## 11. Hard-rule confirmation

| Rule | Status |
|------|--------|
| No `git push` / PR / deploy | CONFIRMED |
| No Vercel mutation | CONFIRMED |
| No DB / schema / migration / seed / cron | CONFIRMED |
| No listing import | CONFIRMED |
| No `IMPORT_READY` / `PUBLIC_NOW` | CONFIRMED |
| No indexed route / no sitemap addition | CONFIRMED — sitemap unchanged; no pilot entry added |
| No homepage / global nav change | CONFIRMED |
| No broad launch copy | CONFIRMED |
| No SEO launch claims | CONFIRMED |
| No new rows | CONFIRMED |
| No Mayo / Bergen / Saint Elizabeths / high-risk rows added | CONFIRMED |
| No fake verification claim | CONFIRMED |
| No hospital-approved claim | CONFIRMED |
| No guaranteed placement claim | CONFIRMED |
| No official USCEHub application-system claim | CONFIRMED — pilot footer says "this page does not act as an application system" |
| No broad IMG-friendly claim | CONFIRMED |
| No unsupported visa claim | CONFIRMED — CCF rows explicitly DENY J-1 + H-1B sponsorship |
| No raw P97 / internal fields exposed | CONFIRMED |
| No screenshot paths / reviewer notes / must_not_claim exposed | CONFIRMED |
| No commit amend / no history rewrite | CONFIRMED |
| No `--no-verify` | CONFIRMED |
| No unrelated dirty files staged | CONFIRMED |
| No NPPES / redesign files staged | CONFIRMED |
| Bridge / pilot validators not weakened | CONFIRMED |
| Micro-pilot not called a full public launch | CONFIRMED — framed as "covers selected programs only" / "source-reviewed pilot" |
| User has not been told it is deployed | CONFIRMED — deploy status is "NOT DEPLOYED" throughout |
