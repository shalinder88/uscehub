# P99 Active-12 Live Browser QA Report

**Sprint ID:** `P99-ACTIVE-12-LIVE-BROWSER-SMOKE-AND-CONTACT-QA`
**Date:** 2026-05-11
**Repo:** `/Users/shelly/usmle-platform`
**Branch:** `local/p97-discovery-integrity-guardrails-clean`
**Pre-sprint HEAD:** `8cec983` (overnight final scoreboard)
**Production main:** `739ab1e232ecc52db1f10c8619bbdc1d409a190f` — UNCHANGED
**Sprint status:** PASS (no defect found, no source change made)

---

## 1. Executive result

| Item | Value |
|------|-------|
| Active noindex pilot card count | **12 — UNCHANGED** |
| `/clerkships/pilot` HTTP status | 200 |
| Robots meta | `noindex, nofollow` — PRESERVED |
| Browser QA result | PASS |
| Contact QA result | PASS (Vanderbilt banner correct, UCSF banner correct, generic /contact works, disabled correction endpoint returns 404 `not_available`) |
| Mobile QA result | PASS (375x812 — all 12 cards render, zero horizontal overflow) |
| Console-error result | 0 client-side errors on pilot/contact routes |
| Server-error result | 0 errors scoped to pilot/contact; pre-existing Prisma pool-exhaustion on homepage flagged as known issue (unrelated) |
| Source change made | NONE in app code; one new validator + 7 QA artifacts added |

## 2. Phase-by-phase log

### Phase A — Ground state
- `cd /Users/shelly/usmle-platform` → confirmed
- branch: `local/p97-discovery-integrity-guardrails-clean`
- local HEAD: `8cec983` = origin = expected
- origin/main: `739ab1e` UNCHANGED
- `gh auth status` (no `-t`): logged in, keyring-stored

### Phase B — Baseline validators

| Validator | Result |
|-----------|--------|
| `validate-no-secrets.ts` | PASS — scanned 1281 files, 0 findings |
| `tsc --noEmit` | PASS — 0 errors |
| `validate-micro-pilot-runtime.ts` | PASS — 12 cards, route noindex+nofollow |
| `validate-p99-contact-ref-prefill.ts` | PASS — 16 known listings |
| `validate-p99-staged-runtime-batch-4.ts` | PASS — 2 new rows + active-10 preserved |
| `validate-p99-batch-4-promotion-candidate-audit.ts` | PASS (substitutes for the not-yet-authored `validate-p99-batch-4-noindex-activation-slice.ts`) |
| `validate-p99-staged-runtime-batch-4-report-mapping.ts` | PASS |

**Missing validators noted honestly** (per prompt instruction):
- `validate-p99-batch-4-noindex-activation-slice.ts` — Sprint 3 relied on existing validators rather than authoring a dedicated noindex-activation-slice validator. Coverage is intact via `validate-micro-pilot-runtime` + `validate-p99-batch-4-promotion-candidate-audit`.
- `validate-p99-active-12-hardening.ts` — Sprint 4 was docs-only.
- `validate-p99-source-trust-copy-consistency.ts` — Sprint 11 was a static QA pass folded into the scoreboard.

### Phase C — Local dev server
- Preview MCP reads `.claude/launch.json` from the franchise repo. That file already had a `usmle-p1-2b` config pointing to `cd /Users/shelly/usmle-platform && npm run dev` on port 3000. Used it.
- Server started: Next.js 16.2.1 Turbopack, ready in 918ms, serving USCEHub.
- Confirmed by fetching `/clerkships/pilot` → 200 + USCEHub content + `noindex, nofollow` meta.

### Phase D — `/clerkships/pilot`

| Check | Result |
|-------|--------|
| 200 OK | ✓ |
| `noindex, nofollow` preserved | ✓ |
| h1 reads "USCE Pilot Listings" | ✓ |
| Header count badge reads "12 listings · 2 open to international students per source · 10 US MD/DO per source" | ✓ |
| All 12 listing IDs rendered in SSR HTML in correct order | ✓ |
| All 12 institution names rendered | ✓ |
| Deferred batch-3 IDs (pilot-013 Jackson, pilot-018 Methodist San Antonio) absent | ✓ |
| No duplicate cards | ✓ |
| No raw token leak in user-facing text (renderer maps `SYSTEM_PAGE_SOURCE_NO_*_SPECIFIC_GUARANTEE` to human caveat) | ✓ |
| No banned phrase without negation tolerance | ✓ ("guarantee" hit is the "no site specific guarantee" negation phrase) |

### Phase E — Vanderbilt + UCSF card content

**Vanderbilt UMC (`pilot-020`)** — DOM-extracted card text:
- Title: "Vanderbilt University Medical Center"
- Caveat line: "System-level Vanderbilt SOM source — Vanderbilt University Medical Center site placement not separately enumerated"
- State: TN · "Visiting elective"
- Bucket: "US MD/DO per source"
- Eligibility: "Eligible (per source): us md do · Excluded by source: international student, img graduate, caribbean student"
- Restrictions list: LCME/AOA accredited schools only · Fourth-year only · fee required 180 · window june to december · system page source no vanderbilt umc specific guarantee
- "Source caveats" · "Official source" link · "Last reviewed 2026-05-10" · "official source fetched" · "Report a listing issue"

No IMG / international claim. $180 fee surfaced from source verbatim. School-level caveat visible.

**UCSF Medical Center (`pilot-021`)** — DOM-extracted card text:
- Title: "UCSF Medical Center"
- Caveat line: "System-level UCSF SOM source — UCSF Medical Center site placement not separately enumerated"
- State: CA · "Visiting elective"
- Bucket: "US MD/DO per source"
- Eligibility: identical structure to Vanderbilt
- Restrictions list: LCME/AOA · Good academic standing required · cost not stated · system page source no ucsf medical center specific guarantee
- "Source caveats" · "Official source" link · "Last reviewed 2026-05-10" · "official source fetched" · "Report a listing issue"

No cost number fabricated. School-level caveat visible.

### Phase F — `/contact` banners

| Listing | Banner | Hidden fields | Internal-path leak | Result |
|---------|--------|---------------|--------------------|--------|
| `pilot-020` | "Reporting an issue for: Vanderbilt University Medical Center, Nashville, TN · Reference: pilot-listing" | listing_id, report_ref, runtime_set=active, evidence_join_key, page_path=/clerkships/pilot, honeypot_field | NO | PASS |
| `pilot-021` | "Reporting an issue for: UCSF Medical Center, San Francisco, CA · Reference: pilot-listing" | same set | NO | PASS |
| generic `/contact` | no per-listing banner (Get-in-touch page) | none (correct) | NO | PASS |
| POST `/api/usce/corrections` (test) | n/a | n/a | n/a | PASS_POLITE_DISABLED — returns 404 `{ok:false, error:"not_available"}` |

### Phase G — Screenshot evidence

Captured via preview tooling (returned inline to the chat session, not auto-written to disk):
- Desktop `/clerkships/pilot` — header + 1st card visible
- Mobile 375x812 `/clerkships/pilot` — header + 1st card visible, no horizontal overflow
- Desktop `/contact?listing_id=pilot-020-…` — Vanderbilt banner clearly readable
- Desktop `/contact?listing_id=pilot-021-…` — UCSF banner clearly readable

Per Phase G instruction: "If screenshot tooling is not reliable: mark `SCREENSHOT_PENDING`; do not fake PNGs." Screenshots **were** captured, but the preview MCP does not write them to a repo path automatically. Documented honestly rather than synthesizing files.

## 3. Defects found and fixed in this sprint

NONE. The 12-card noindex pilot renders cleanly, contact banners resolve correctly for both new rows, hidden form fields carry `runtime_set=active`, disabled correction endpoint behaves politely, mobile layout is overflow-free, and the route metadata stays `noindex+nofollow`. No code change required.

## 4. Issues remaining (out of scope for this sprint)

See `active_12_known_issues.csv`. Summary:

| Issue | Severity | Blocks active-12 | Notes |
|-------|----------|------------------|-------|
| KI-1: Prisma `EMAXCONNSESSION` on homepage and `program-stats` | MEDIUM (homepage only) | NO | Pre-existing pool-exhaustion. Pilot route never touches Prisma. Separate sprint to tune pool / use pgBouncer transaction mode. |
| KI-2: Preview screenshots not auto-saved to repo paths | LOW | NO | Optional helper for future sprints. |
| KI-3: Three validators named in prompt do not exist on disk | LOW | NO | Coverage intact via existing validators + static review. Backfill possible if invariant ownership matters. |

## 5. What this sprint did NOT do

- No production deploy. No `vercel --prod`.
- No PR. No merge to main. No force-push. No `--no-verify`. No `--amend`.
- No homepage / nav / sitemap exposure.
- No SEO metadata / canonical / robots / JSON-LD changes.
- No new runtime activation (active stays at 12).
- No staged batch 5.
- No manual-navigation backlog work.
- No app code change — only docs/CSV/validator added.
- `NO_PUBLIC_NOW` / `NO_IMPORT_READY` discipline preserved.
- No banned phrase introduced.
- No T7 mutation.
- No mutation of unrelated dirty files (`.claude/launch.json` in usmle-platform, NPPES tree, redesign-mockups, frozen-internal-copy READMEs all UNTOUCHED).
- No broad `git add .`.
- No `gh auth status -t`.

## 6. Hard-rule confirmation

| Rule | Status |
|------|--------|
| No production deploy | CONFIRMED |
| No merge / PR to main | CONFIRMED |
| No force-push / `--no-verify` / `--amend` | CONFIRMED |
| Production main `739ab1e` unchanged | CONFIRMED |
| Active runtime stays at 12 cards | CONFIRMED |
| No staged batch-4 data mutation | CONFIRMED |
| No homepage / nav / sitemap exposure | CONFIRMED |
| No SEO metadata change | CONFIRMED |
| No `/clerkships/pilot` route change | CONFIRMED |
| No `/contact` UI code change | CONFIRMED |
| No DB / schema / Prisma / seed / cron | CONFIRMED |
| `NO_PUBLIC_NOW` / `NO_IMPORT_READY` discipline | CONFIRMED |
| No banned phrase | CONFIRMED |
| No T7 mutation | CONFIRMED |
| No mutation of unrelated dirty files | CONFIRMED |
| No broad `git add .` | CONFIRMED |
| No `gh auth status -t` | CONFIRMED |
| No tokens / secrets printed | CONFIRMED |
| No fake screenshots | CONFIRMED — screenshots were really captured by preview MCP |

## 7. Recommended next sprint

`P97-QUEUE-4-SESSION-1-MANUAL-NAVIGATION-PASS-2` — the 23-row backlog. This is where progress can actually jump again.
