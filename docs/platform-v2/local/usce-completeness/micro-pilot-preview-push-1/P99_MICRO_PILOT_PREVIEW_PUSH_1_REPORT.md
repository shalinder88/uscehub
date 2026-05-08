# P99 Micro-Pilot Preview Push — Sprint 1 Report

**Date:** 2026-05-08
**Repo:** `/Users/shelly/usmle-platform`
**Remote:** `https://github.com/shalinder88/uscehub.git`
**User affirmation:** "push the noindex micro-pilot" → confirmed Path B-SAFE: "Push the branch as a preview branch only, not main, after one final branch-scale safety audit."

---

## 1. Executive result

- **Branch pushed:** YES — `local/p97-discovery-integrity-guardrails` → `origin/local/p97-discovery-integrity-guardrails`
- **Pushed commit:** `f9063bb49ecf8ffb618ab840277ae3b7ead73312` (`f9063bb P99: audit noindex micro pilot release readiness`)
- **Commits ahead of `origin/main`:** **45** (full P96 → P99 stack — known and explicitly authorized as Path B-SAFE preview push)
- **Production `origin/main` SHA:** `739ab1e232ecc52db1f10c8619bbdc1d409a190f` — **UNCHANGED** (production untouched)
- **Vercel preview URL:** **NOT INDEPENDENTLY VERIFIED** — see §5
- **Production deploy:** **NOT TRIGGERED** (branch deploy ≠ production)

## 2. What was pushed

Local branch `local/p97-discovery-integrity-guardrails` is now on remote. Per the user's explicit Path B-SAFE authorization, this push includes the **full 45-commit P96 → P99 stack**, NOT only the 3 pilot commits. The pilot commits depend on prior P99-1-5 infrastructure (UsceCard type, validators, /clerkships routing, report intake, save/compare, release hardening) and cannot be cleanly cherry-picked.

**Pre-push scale audit confirmed:**
- 161 files changed, 50,257 insertions, 2 deletions
- **No prisma schema/migration changes** (no DB mutation risk)
- **No `.env`, `vercel.json`, `next.config.ts`** changes (no production-config risk)
- **No `sitemap.ts` or `robots.txt`** changes (pilot route stays out of indexing)
- **No homepage / nav / layout** changes that touch the pilot route (pilot stays unlinked)
- **No secret / credential** files

## 3. Production-main untouched confirmation

| Reference | SHA | Result |
|-----------|-----|--------|
| `origin/main` (before push) | `739ab1e2...` | unchanged after push |
| `origin/main` (after push) | `739ab1e2...` | unchanged ✅ |
| `origin/local/p97-discovery-integrity-guardrails` (after push) | `f9063bb4...` | new branch on remote |

Local push command used:
```
git push -u origin local/p97-discovery-integrity-guardrails
```
This pushes ONLY the local branch. It does not push to main, does not merge, does not force.

## 4. Final pre-push validation

| Validator | Result |
|-----------|--------|
| `tsc --noEmit` | clean |
| `scripts/validate-micro-pilot-runtime.ts` | PASSED — 5 cards + route gates |
| `scripts/usce-data/validate-public-runtime-data.ts` | PASSED |
| `scripts/validate-usce-public-cards.ts` | PASSED |
| `scripts/validate-usce-save-compare.ts` | PASSED |
| `scripts/validate-usce-report-intake.ts` | PASSED |
| `scripts/validate-usce-pilot-release.ts` | PASSED |

All 7 gates green at push time.

## 5. Vercel preview deploy status

**NOT INDEPENDENTLY VERIFIED.** Honest reporting:

- Project name (from `.vercel/project.json`): `usmle-platform` (project ID `prj_s1t73G2jniMr2gUb0PIfoQ8fLp9J`)
- Vercel typically auto-deploys non-main branches as preview deployments when GitHub is connected.
- I attempted to guess common Vercel preview URL patterns from the branch name — no match. Team slug is not knowable from the local repo without Vercel CLI authentication or dashboard access.
- Without the Vercel API token in environment OR `vercel` CLI authenticated session, I cannot query the preview URL or its build status from this Bash environment.

**Recommended user action to find the preview URL:**
1. Open `https://vercel.com/<team>/usmle-platform/deployments` in a browser.
2. Look for a deployment of branch `local/p97-discovery-integrity-guardrails` at commit `f9063bb`.
3. The preview URL should be listed there once the build completes (typically 1–3 minutes for a Next.js project).

Alternatively, GitHub's branch view should show a Vercel "View deployment" link if the GitHub-Vercel integration is enabled:
- `https://github.com/shalinder88/uscehub/tree/local/p97-discovery-integrity-guardrails`

## 6. Post-push smoke test status

**NOT EXECUTED — preview URL not knowable from Bash.**

The smoke test plan is:
1. Open preview URL `/clerkships/pilot`
2. Verify HTTP 200
3. Verify `<meta name="robots" content="noindex, nofollow">` in head
4. Verify `X-Robots-Tag: noindex, nofollow` header
5. Verify 5 cards present (Morristown · Overlook · CCF Mercy · CC Hillcrest · Highland)
6. Verify 10+ excluded institutions absent (Mayo Mankato/Eau Claire/Bergen/Saint Elizabeths/Hemet/TJUH/Manatee/UH SA/UPMC Western Psychiatric/Lincoln Medical)
7. Click each source link → opens correct external URL in new tab
8. Click "Report a listing issue" link → navigates to `/contact?ref=pilot-listing&listing_id=...`
9. Verify console clean
10. Verify mobile layout
11. Verify sitemap.xml at preview URL does NOT include `/clerkships/pilot`
12. Verify no homepage/nav exposure of pilot

A future agent or the user should run this smoke test against the actual preview URL once Vercel completes the build. The test plan is captured in `micro_pilot_release_audit_1_deploy_readiness_summary.md` §3.

## 7. Pre-existing dirty files untouched

Before push, working tree had pre-existing modifications NOT related to the pilot. These were NOT staged in any pilot commit and were NOT pushed:

- `M .claude/launch.json`
- `M src/data/usce/public-listings.generated.json` (Maine runtime, dirty since before this work began)
- `M src/data/usce/public-listings.generated.ts` (same)

These remain modified-but-not-staged after the push. They are out of scope for the pilot deploy.

Untracked files (also untouched):
- `DO_NOT_EDIT_INTERNAL_COPY_USE_T7.md`
- `README_FROZEN_INTERNAL_COPY.md`
- `docs/platform-v2/local/nppes/*` (NPPES workbench files)
- `docs/platform-v2/redesign-mockups/*` (luxury palette explorations)

None of these were staged or pushed.

## 8. Hard rules confirmation

| Rule | Status |
|------|--------|
| Pushed branch only, not main | CONFIRMED — `git push -u origin local/p97-discovery-integrity-guardrails`; no merge; no PR |
| Production main untouched | CONFIRMED — `origin/main` SHA still `739ab1e2...` |
| No PR created | CONFIRMED — branch pushed, no PR opened (GitHub showed PR-creation hint URL but no action taken) |
| No production deploy triggered | CONFIRMED — Vercel will auto-deploy from non-main branch as PREVIEW only |
| No cherry-pick attempted | CONFIRMED — full branch pushed per Path B-SAFE |
| No pre-existing dirty files staged | CONFIRMED |
| No broad `git add` | CONFIRMED — push pushed only existing committed branch state |
| No history rewrite | CONFIRMED — no rebase, no amend |
| No `--no-verify` | CONFIRMED |
| No DB / schema / migration / seed | CONFIRMED — diff shows zero prisma changes |
| No production config / secrets pushed | CONFIRMED — diff shows zero `.env`, `vercel.json`, `next.config.ts` changes |
| Sitemap unchanged | CONFIRMED |
| Robots.txt unchanged | CONFIRMED |
| Homepage/nav unchanged (pilot stays unlinked) | CONFIRMED |
| Pilot route remains noindex | CONFIRMED — both meta tag (in `page.tsx`) and HTTP header (in `next.config.ts`) preserved |

## 9. Remaining issues / recommendations

- **Preview URL discovery** — user must check Vercel dashboard for the preview URL. The CLI/API approach would require Vercel auth which is out of scope for this push.
- **Post-push smoke test** — should be run by user (or a future agent with Vercel access) against the preview URL using the 12-check plan above.
- **No production merge until separate approval** — per Path B-SAFE constraint. The user explicitly said "Do NOT push to main." A future merge to main would be a separate sprint requiring its own audit + explicit approval.
- **Pre-existing dirty files cleanup** — separate task; do NOT mix into pilot work.

## 10. Final state

- Branch on remote: ✅ `https://github.com/shalinder88/uscehub/tree/local/p97-discovery-integrity-guardrails`
- Production main: ✅ untouched
- Pilot deploy: ⏳ Vercel preview build expected to auto-trigger; verify via Vercel dashboard
- Post-deploy smoke test: ⏳ pending preview URL discovery

**The push is complete. The preview deployment is the user's call to verify in the Vercel dashboard. Production is untouched and remains gated by separate user approval.**
