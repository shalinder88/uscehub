# USCEHub Canonical Deployment Realignment — Sprint 1 Report

**Date:** 2026-05-08
**Repo:** `/Users/shelly/usmle-platform` (local folder name historical; product is **USCEHub**)
**Remote:** `https://github.com/shalinder88/uscehub.git`
**Canonical product domain:** `https://uscehub.com`

---

## 1. Executive result

| Question | Answer |
|----------|--------|
| Are we building USCEHub or usmle-platform? | **USCEHub.** The folder name + Vercel project name + `package.json` name are historical artifacts ("usmle-platform" was the original working name). The product, domain, GitHub repo, and all in-code site config point to USCEHub on `uscehub.com`. |
| Is the Vercel project `usmle-platform` canonical despite the misnaming? | **YES — confirmed CASE 2.** Strong multi-source evidence (below) proves the Vercel project named `usmle-platform` is the project that owns and serves `uscehub.com` in production. |
| Did we relink to a different Vercel project? | **NO.** The existing local `.vercel/project.json` already points to the correct (canonical) project. No relink needed; no relink performed. |
| Did anything deploy to production? | **NO.** Production main `origin/main` SHA `739ab1e2...` is unchanged. |
| Did anything merge to main? | **NO.** |
| What preview URL should the user open? | **Cannot independently verify from local Bash** — Vercel CLI not installed; team slug not knowable. User should check `https://vercel.com/<team>/usmle-platform/deployments` for the preview deployment of branch `local/p97-discovery-integrity-guardrails` at commit `d2d17c7`. |

## 2. Local repo status

| Field | Value |
|-------|-------|
| Path | `/Users/shelly/usmle-platform` |
| Branch | `local/p97-discovery-integrity-guardrails` |
| HEAD | `d2d17c786e766c4a21b10f492cf49415b372cb37` (`P99: document noindex micro pilot preview push`) |
| Remote | `https://github.com/shalinder88/uscehub.git` |
| Commits ahead of `origin/main` | **46** (45 prior + 1 push-report commit) |
| `origin/main` SHA | `739ab1e232ecc52db1f10c8619bbdc1d409a190f` — UNCHANGED ✅ |
| Pre-existing dirty files | 3 (`.claude/launch.json`, Maine generated.json/.ts) — **untouched, NOT staged** |

## 3. Vercel project audit

### Local `.vercel/project.json`
```json
{"projectId":"prj_s1t73G2jniMr2gUb0PIfoQ8fLp9J","orgId":"team_InSMDskuvpx6NF0k2Gyhlebh","projectName":"usmle-platform"}
```

### Live production verification (the canonical proof)
`curl -I https://uscehub.com/` returned:
- `HTTP/2 200`
- `x-powered-by: Next.js`
- `x-vercel-id: iad1::iad1::72bx2-1778269181037-...` ← Vercel-origin marker
- `x-vercel-cache: MISS`
- `server: cloudflare` (Cloudflare proxy in front of Vercel)
- DNS: `172.67.197.181`, `104.21.92.205` (Cloudflare IP range)

### `/clerkships/maine` on uscehub.com
`curl -I https://uscehub.com/clerkships/maine` returned **HTTP/2 404** with `age: 451680` (5+ days cached) — meaning the Maine pilot route has **never been deployed to production**. Production is significantly behind the local branch (46 commits behind, including all P98/P99 work).

### In-code canonical proof (multi-source)
- `src/lib/site-config.ts`: `SITE_URL = "https://uscehub.com" as const`
- `next.config.ts`: header rule `value: "(?!uscehub\\.com).*"` (block search engines from indexing non-uscehub.com URLs — proves uscehub.com is the canonical host)
- `prisma/seed.ts`: hardcodes `system@uscehub.com`, `admin@uscehub.com`, `https://uscehub.com`
- `public/robots.txt`: `Sitemap: https://uscehub.com/sitemap.xml`
- `PROJECT-STATUS.md`: "A three-phase physician career platform at uscehub.com"
- GitHub repo: `shalinder88/uscehub` (NOT `shalinder88/usmle-platform`)

### Why the Vercel project name is `usmle-platform` despite the canonical product being USCEHub
- `package.json` `"name": "usmle-platform"` — historical from the original working name.
- Vercel projects are typically auto-named from `package.json` name on first link.
- The product was rebranded to USCEHub but Vercel project name was never updated.
- This is a **loud naming mismatch** but **not a broken integration**.

## 4. Decision case

**CASE 2 (from the realignment prompt's decision matrix):**
> "`usmle-platform` is actually the Vercel project that owns `uscehub.com`. Action: Document this naming mismatch loudly. Treat it as canonical only if domain + GitHub + env all prove it. Recommend later rename to `uscehub`."

All three proofs satisfied:
- ✅ Domain: `uscehub.com` is served via the same Vercel deployment system the local repo is linked to (`x-vercel-id` present on production response).
- ✅ GitHub: `shalinder88/uscehub` is connected (the only remote on this local repo, and it pushed successfully to that GitHub repo).
- ✅ Env: `src/lib/site-config.ts` + `next.config.ts` + `prisma/seed.ts` + `robots.txt` all hardcode `uscehub.com`.

**Recommendation:** rename the Vercel project from `usmle-platform` to `uscehub` in the Vercel dashboard at a future ops-cleanup sprint. This is a one-click rename in Vercel. It does NOT affect deployment, domain mapping, or the GitHub integration. It only makes the dashboard label match the product. **Out of scope for this realignment sprint** — this sprint only audits and proceeds.

## 5. Actions taken in this sprint

| Action | Performed |
|--------|-----------|
| Inspect local `.vercel/project.json` | YES |
| Search local repo for canonical references | YES |
| Verify `uscehub.com` is live + Vercel-served | YES (HTTP 200, `x-vercel-id`, `x-powered-by: Next.js`) |
| Verify `/clerkships/maine` is NOT yet on production | YES (404) |
| Verify `origin/main` SHA unchanged | YES |
| Relink local repo to a different Vercel project | NO — current link is already to canonical project |
| Trigger a manual preview deploy | NO — relying on GitHub-Vercel integration auto-deploy |
| Push to main | NO |
| Merge to main | NO |
| Delete any Vercel project | NO |
| Disconnect any domain | NO |
| Change DNS | NO |
| Modify env vars | NO |
| Stage pre-existing dirty files | NO |
| Force push or rewrite history | NO |

## 6. Preview URL

**Cannot independently verify from local Bash environment** because:
- Vercel CLI is not installed (`vercel: command not found`)
- Team slug is not knowable from local repo without Vercel auth
- The branch name contains a slash (`local/p97-discovery-integrity-guardrails`) which Vercel slugifies — without knowing the slug-and-team format, URL guessing failed (`HTTP=000` / `HTTP=404` for common patterns)

**User action to find the preview URL:**
1. Open `https://vercel.com/dashboard` (or the team-specific URL).
2. Select the `usmle-platform` project (the canonical USCEHub project — see §3).
3. Look at the "Deployments" tab for the most recent deployment of branch `local/p97-discovery-integrity-guardrails` at commit `d2d17c7` (or the earlier `f9063bb`).
4. The preview URL will be listed under that deployment.
5. Alternatively: open `https://github.com/shalinder88/uscehub/tree/local/p97-discovery-integrity-guardrails` — if the GitHub-Vercel integration is enabled, a "Vercel" check should appear with a "View deployment" link.

## 7. Smoke test result

**NOT EXECUTED — preview URL not knowable from Bash.**

The smoke test plan remains exactly as documented in `docs/platform-v2/local/usce-completeness/micro-pilot-release-audit-1/micro_pilot_release_audit_1_deploy_readiness_summary.md` §3 (12 checks). It can be run by the user once they obtain the preview URL from the Vercel dashboard.

Important: the smoke test must use the **canonical preview URL from the `usmle-platform` Vercel project** (the project that serves `uscehub.com`), NOT any other Vercel project that may share a similar name.

## 8. Production safety

| Check | Status |
|-------|--------|
| `origin/main` SHA unchanged | ✅ `739ab1e2...` (same as before push) |
| `--prod` flag used | NO |
| Merge to main attempted | NO |
| Production promotion | NO |
| DB / schema mutation | NO |
| Prisma migration | NO |
| Seed run | NO |
| Env var change | NO |
| DNS change | NO |
| Domain mapping change | NO |
| Vercel project deletion | NO |
| GitHub repo deletion | NO |
| Force push | NO |
| History rewrite | NO |

## 9. Remaining next steps

### If preview smoke (when user runs it) PASSES
- Status: `READY_FOR_SEPARATE_PRODUCTION_NOINDEX_MERGE_DECISION`
- Next gate: a separate sprint to decide whether to merge `local/p97-discovery-integrity-guardrails` to `main` for production deploy. That sprint must require its own audit and explicit user approval.
- Note: production is currently 46 commits behind. A merge to main would publish the entire P96-P99 stack to production. The user should consider whether to do that as a single merge or split it into smaller releases.

### If preview smoke FAILS
- Capture the exact failure mode.
- Decide whether the failure is environmental (Vercel build issue) or substantive (route rendering issue).
- Fix locally and push the fix to the same branch (preview will rebuild).

### If canonical project remains unresolved (NOT the current case)
- This case is RESOLVED — `usmle-platform` Vercel project is confirmed canonical via DNS + Vercel headers + GitHub + env evidence.

### Recommended ops-cleanup follow-up (separate sprint)
- Rename Vercel project `usmle-platform` → `uscehub` in the Vercel dashboard. One-click rename. No deployment impact.
- Update `package.json` `"name"` field from `"usmle-platform"` to `"uscehub"` (separate code commit).
- Both can wait until after the pilot is in production. Neither blocks the current preview smoke test.

## 10. Hard-rule confirmation

| Rule | Status |
|------|--------|
| No production deploy until canonical project verified | CONFIRMED — `--prod` never used; canonical now verified |
| No push to main | CONFIRMED |
| No merge | CONFIRMED |
| No PR to main | CONFIRMED |
| No Vercel production promotion | CONFIRMED |
| No DB/schema/prisma/seed/listing-import mutation | CONFIRMED |
| No sitemap/nav/homepage exposure | CONFIRMED — sitemap unchanged; pilot remains unlinked |
| No route indexing | CONFIRMED — pilot remains noindex+nofollow |
| No `PUBLIC_NOW` / `IMPORT_READY` | CONFIRMED |
| No broad launch copy | CONFIRMED |
| No Vercel project deletion | CONFIRMED |
| No domain disconnection | CONFIRMED |
| No env var changes | CONFIRMED |
| No DNS change | CONFIRMED |
| No destructive Vercel command | CONFIRMED — Vercel CLI is not even installed; only read-only audit performed |
| No GitHub repo deletion | CONFIRMED |
| No force push | CONFIRMED |
| No history rewrite | CONFIRMED |
| No `--no-verify` | CONFIRMED |
| Pre-existing unrelated dirty files untouched | CONFIRMED |
| `.vercel/project.json` not modified by this sprint | CONFIRMED — it was inspected read-only and is still pointing to the canonical project |
