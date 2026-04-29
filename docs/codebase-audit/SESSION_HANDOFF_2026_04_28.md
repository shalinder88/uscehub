# Session Handoff — 2026-04-28

Written at the end of the session that shipped PR #9 (Phase 3.3 listing
verification cron). Read this before doing anything in the next session.

---

## 1. First-read order

Read these in this order at session start:

1. `/AGENTS.md` — canonical agent operating rules. CLAUDE.md delegates here via `@AGENTS.md`. Contains the every-10th-prompt strategic checkpoint cadence, the per-prompt Agree / Disagree / Agree-with-caveat rule, and the phase-and-stop discipline.
2. `/docs/codebase-audit/RULES.md` — preservation rules, **`/career` hard protection list**, git-safety list. Higher authority than the blueprint or AGENTS.md when there is a conflict.
3. `/docs/codebase-audit/SEO_PRESERVATION_RULES.md` — SEO impact log every PR must include.
4. `/docs/codebase-audit/USCEHUB_MASTER_BLUEPRINT.md` — strategic source of truth for what to build, in what order, for whom. **Read §0 first** — it is the long-term platform vision and the anti-narrowing rule (do **not** describe USCEHub as "an observership directory"; the current verified-USCE wedge is the foundation of a much larger physician career-pathway platform). Phase 0 is the active phase. §13 has the phase order. The "Operator reminder" section near the end cross-references the rule files.
5. `/docs/codebase-audit/PHASE3_DATA_QUALITY_VERIFICATION_PLAN.md` — the 6-PR Phase 3 sequence (3.1–3.6). 3.1, 3.2, 3.2a, 3.3 done. 3.4 next.
6. This file.

---

## 2. Current production state (verified 2026-04-28)

| Check | Value |
|---|---|
| `origin/main` HEAD | `05202ed Add Phase 3.3 listing verification cron (#9)` |
| Production deploy | live, verified post-merge |
| Cron entries (`vercel.json`) | **2** — `/api/cron/verify-jobs` at `0 8 * * *` UTC and `/api/cron/verify-listings` at `0 9 * * *` UTC. Vercel Hobby plan max is 2 — adding a 3rd would fail. |
| Migrations | 2 applied: `20260428171752_baseline_existing_schema`, `20260428173738_phase3_verification_fields`. `prisma migrate status` reports "Database schema is up to date". |
| Build guard | Active in `package.json`: `if [ "$VERCEL_ENV" = "production" ]; then npx prisma migrate deploy; fi && prisma generate && next build` |
| `https://uscehub.com/` | 200 |
| `https://uscehub.com/browse` | 200 |
| `https://www.uscehub.com/` | 308 → apex (canonical preserved) |
| `/api/cron/verify-jobs` (no auth) | 401 — alive, auth enforced |
| `/api/cron/verify-listings` (no auth) | 401 — deployed, auth enforced, `getCronSecret()` did not throw 500 |
| `CRON_SECRET` | configured in Vercel Production for both cron routes |
| Prisma `package.json#prisma` deprecation warning | non-blocking; deferred future cleanup |

---

## 3. Local git state at handoff

### Branches
| Branch | Commit | Tracking | Notes |
|---|---|---|---|
| `main` | `05202ed` | `origin/main` | up to date, working tree clean |
| `docs/strategic-checkpoint-cadence` | `0e1d145` (will be 2 commits after this handoff doc) | **local-only, no upstream** | Holds the AGENTS.md + blueprint cadence-rule edits, plus this handoff doc. Not pushed. Parent is `9573377` (pre-PR-#9 main). To ship as a PR later: rebase onto current `origin/main`, then push and open. |
| `phase3/03-verification-cron` | `b994069` | `origin/phase3/03-verification-cron` | PR #9 head branch; preserved with `--delete-branch=false`. Squash-merge produced `05202ed` on main. Safe to delete after a quiet period if desired. |
| `phase3/01-analytics-events`, `phase3/02-verification-schema`, `phase3/02a-prisma-migration-baseline`, `phase3/data-quality-verification-plan` | various | `origin/...` | All merged via PRs #5, #7, #6, #4. Safe to delete after a quiet period. |
| `cleanup/*` | older | `origin/...` | All merged via prior cleanup PRs. |

### Stashes (BOTH preserved — never drop without explicit "drop stash N" instruction)
- `stash@{0}: On cleanup/01-trust-counts-foundation: wip cleanup PR1 — pause for blueprint doc update`
- `stash@{1}: On main: preserve jobs expansion before USCEHub codebase audit`

User has indicated stash hygiene is a deferred item ("both stashes redundant" was noted at one point). **Do not pop or drop without explicit per-stash authorization.**

### GitHub PRs
- PR #1: OPEN — Vercel Speed Insights bot PR, never merged or reviewed by us. Leave alone.
- PR #2–#9: all MERGED.

---

## 4. Immediate next gate (do this FIRST in the new session)

**Do NOT start PR 3.4 until the first scheduled cron run is reviewed.**

Tomorrow at ~09:00 UTC, Vercel will trigger `/api/cron/verify-listings` for the first time. The user wants to inspect that run before authorizing the admin queue UI.

Two acceptable paths:

- **(A) Wait for the natural tick.** Tomorrow morning UTC, ask the user to share the Vercel function log for the route, or guide them through Vercel → uscehub project → Logs → filter on `/api/cron/verify-listings`. Verify the JSON return shape, confirm `checked` ≈ 25, no 500s, and that at least one `data_verifications` row was written with `verifiedBy = "system:cron-verify-listings"` and `method = "CRON"`.
- **(B) Manual end-to-end test now (cheaper, gives confidence today).** With user's authorization:
  ```
  curl -i -H "Authorization: Bearer $CRON_SECRET" https://uscehub.com/api/cron/verify-listings
  ```
  Expect HTTP 200 with JSON `{ checked, verified, needs_manual_review, reverifying, skipped_no_url, errors, details }`. This consumes one batch of 25 listings ahead of the scheduled tick — no destructive risk because the cron's classification is conservative-by-design (no SOURCE_DEAD, no auto-hide, no URL rewriting, `lastVerifiedAt` advances only on VERIFIED).

After review passes, the user will authorize PR 3.4.

---

## 5. PR 3.3 design contract — what the cron CAN and CANNOT do

Full detail in `docs/codebase-audit/PHASE_3_3_VERIFICATION_CRON_DESIGN.md`. Critical constraints to remember:

- **Statuses cron CAN set:** `VERIFIED`, `REVERIFYING`, `NEEDS_MANUAL_REVIEW`.
- **Statuses cron CANNOT set:** `SOURCE_DEAD`, `PROGRAM_CLOSED`, `NO_OFFICIAL_SOURCE`. These are admin/escalator only.
- **404/410 → NEEDS_MANUAL_REVIEW** (NOT SOURCE_DEAD on first failure).
- **`Listing.status` never modified** (no auto-hide).
- **URL fields never modified** (no rewriting `sourceUrl` / `applicationUrl` / `websiteUrl`).
- **`lastVerifiedAt` only advances on VERIFIED.** Failures leave it unchanged. No manufactured timestamps.
- **Legacy `linkVerified` Boolean:** `true` on VERIFIED; `false` on NEEDS_MANUAL_REVIEW; **unchanged** on REVERIFYING (no badge flap on a single network blip).
- **Per run:** ≤25 listings, batches of 5 in parallel, 500ms gap, 10s HEAD timeout each. Ordered `lastVerificationAttemptAt ASC NULLS FIRST`.
- **Audit trail:** every probe writes a `DataVerification` row (atomic with the listing update via `prisma.$transaction`). `verifiedBy = "system:cron-verify-listings"`, `method = "CRON"`.

The pure classification function lives in `src/lib/link-verification.ts` and is fully unit-tested via `scripts/test-link-verification.ts` (26 cases).

---

## 6. Phase 3 sequence

| PR | Status | Description |
|---|---|---|
| 3.1 | ✅ PR #5 merged | Analytics event taxonomy (`src/lib/analytics.ts`) |
| 3.2a | ✅ PR #6 merged | Prisma migration baseline |
| 3.2 | ✅ PR #7 merged | Verification schema fields (`LinkVerificationStatus`, `FlagKind`, Listing/FlagReport/DataVerification extensions) |
| (Cleanup #8) | ✅ PR #8 merged | Production migration build guard |
| 3.3 | ✅ **PR #9 merged today** | Verification cron extension (`/api/cron/verify-listings`) |
| 3.4 | next, gated | Admin queue UI for `NEEDS_MANUAL_REVIEW` |
| 3.5 | future | Real-time per-page verification UI |
| 3.6 | future | Conversion hooks (analytics events on verification interactions) |

---

## 7. Deferred operational items (not blocking)

| Item | Notes |
|---|---|
| Push `docs/strategic-checkpoint-cadence` as a PR | Local-only. Holds the cadence-rule docs commit + this handoff. To ship: rebase onto `origin/main` (currently `05202ed`), then push + open. User has not authorized push. |
| Watch first cron run (tomorrow ~09:00 UTC) | See §4. Hard prerequisite for PR 3.4. |
| Prisma `package.json#prisma` deprecation | Non-blocking. Future small PR: create `prisma.config.ts`, move the `seed` config there, remove from `package.json`. Prisma 6.x is current; 7.0 is not yet released — no urgency. |
| Vercel `usmle-platform` duplicate project audit | Both `uscehub` and `usmle-platform` Vercel projects build on every PR. Confirm which is the production project and whether the duplicate is intentional. |
| GSC Domain property + sitemap submission | Pending. Submit `https://uscehub.com/sitemap.xml` once GSC verification is set up. |
| Mobile spot-check on Phase 1 + Phase 2 | Phase 1 (trust rollout across USCE listing surfaces) and Phase 2 (listing detail trust metadata) shipped without explicit mobile QA. |
| Stash hygiene | Both stashes preserved. User had noted both are "redundant" but **never authorized drop**. Do not drop without explicit per-stash instruction. |
| Cleanup branch deletion | Many merged feature branches still exist on origin (phase3/*, cleanup/*). Safe to delete after quiet period; not urgent. |

---

## 8. Hard rules (most-violated → never violate)

### Git safety (from RULES.md §4)
Never run any of these without the user explicitly authorizing the exact command:
- `git reset --hard`
- `git clean -fd` (any `git clean -f`)
- `rm -rf` against any tracked or untracked path
- `git checkout -- .` / `git restore .`
- `git push --force` (or `--force-with-lease`)
- `git branch -D`
- `git stash drop` / `git stash clear`
- `prisma migrate reset`
- `npx prisma db push --accept-data-loss`
- Any direct DB write that drops a table, truncates, or deletes rows
- `git commit --amend` (always create a new commit instead — pre-commit hook failure means previous commit is preserved, amend would clobber it)

### `/career` hard protection (from RULES.md §2)
The entire `/career` route tree, all `src/app/career/**` files, all `src/lib/*-data.ts` data files (waiver-jobs-data, dol-jobs-data, sponsor-data, waiver-data, conrad-tracker-data, visa-bulletin-data, policy-alerts-data, job-source-compliance), `scripts/import-lca-data.ts`, `scripts/parse-lca-xlsx.ts`, `scripts/verify-jobs.ts`, `scripts/gme-outreach.ts`, `scripts/seed-2026-observerships.ts` — **never delete, rename, or restructure without explicit user approval**. Aspirational Prisma models (`WaiverJob`, `WaiverState`, `Lawyer`, `FellowshipProgram`, `DataVerification`) are preserved-as-aspirational.

### SEO preservation (from SEO_PRESERVATION_RULES.md)
Every PR must include the SEO impact log:
```
SEO impact:
- URLs changed:        ...
- redirects added:     ...
- sitemap changed:     ...
- robots changed:      ...
- canonical changed:   ...
- metadata changed:    ...
- JSON-LD changed:     ...
- pages noindexed:     ...
- internal links:      ...
- risk level:          ...
```
Apex is canonical (`https://uscehub.com/`); www returns 308 → apex. Do not invert this.

### Phase-and-stop discipline (from AGENTS.md)
"Push", "merge", "deploy to production", `git reset --hard`, `git stash drop`, force-pushing, amending — never run without the user typing the literal word for that action.

### Strategic checkpoint cadence (from AGENTS.md)
Every 10th substantive prompt → strategic checkpoint with the 12 questions. Schema, cron, deploy, SEO, or route changes → checkpoint regardless of cadence position.

### Per-prompt agreement statement (from AGENTS.md)
Every prompt → explicit Agree / Disagree / Agree-with-caveat before tool calls. Distinguish facts (read/ran/verified) from hypotheses. Never claim "done" speculatively.

---

## 9. Recent error patterns to NOT repeat

These are real mistakes from this session — flagged so the next agent doesn't redo them:

1. **"Benign drift" claim was wrong.** When schema and code drift after a Prisma model change, `findMany`/`findUnique` returns ALL scalar fields by default — including new ones — so existing code IS affected. Never claim "the drift is benign because no UI consumes the new fields yet" without proving every read path narrows columns explicitly.
2. **`gh pr diff` has no `--stat` flag.** Use `--name-only` or pipe to `git diff` via the PR head.
3. **zsh `status` is read-only.** When writing bash polling loops, do not name a variable `status`. (Bash session here runs zsh.)
4. **`prisma migrate diff` writes warnings to stderr that contaminate `> migration.sql`.** Always redirect stderr separately: `... --script 2>/dev/null > migration.sql`.
5. **`gh auth login --skip-browser` does not exist in gh 2.65.0.** Just `gh auth login`, then `gh auth setup-git` to wire git credential helper.
6. **Squash-merge produces a new SHA on origin/main; local main with a directly-committed parallel commit will fail to fast-forward.** Use `git reset --keep origin/main` (safer than `--hard`) when reconciling, only after confirming no uncommitted work would be lost.
7. **Vercel preview build will run `prisma migrate deploy` if `VERCEL_ENV=production`.** The build guard's `if` test is the protection — don't remove it.
8. **`useEffect` deps and React-hooks lint warnings persist in `journey-provider.tsx` and `theme-provider.tsx` from before this audit.** They are not new and not from any recent PR. Lint baseline is 146 warnings, 0 errors. Do not fix opportunistically without scope authorization (scope hygiene rule).

---

## 10. Mac environment specifics

- Working directory for this project: `/Users/shelly/usmle-platform`
- Homebrew lives at `~/homebrew` (not `/opt/homebrew`). Prepend PATH in non-interactive bash if needed.
- Bash tool runs `zsh` — be careful with read-only zsh variables (`status`, `path`, etc.).
- T7 external drive is ExFAT cold storage — never run code from it, never source-of-truth.
- The user has two unrelated franchise repos at `/Users/shelly/Franchiese` and `/Users/shelly/Downloads/franchiese` — both active, do not touch from this project.
- The Bash tool resets `cwd` to franchiese after every command — every command in this project must be prefixed with `cd /Users/shelly/usmle-platform &&` or use `git -C /Users/shelly/usmle-platform ...`.

---

## 11. Opening prompt for the new session

Suggested first message in the new window:

```
Read these in order before doing anything:
  /Users/shelly/usmle-platform/docs/codebase-audit/SESSION_HANDOFF_2026_04_28.md
  /Users/shelly/usmle-platform/AGENTS.md
  /Users/shelly/usmle-platform/docs/codebase-audit/RULES.md
  /Users/shelly/usmle-platform/docs/codebase-audit/SEO_PRESERVATION_RULES.md
  /Users/shelly/usmle-platform/docs/codebase-audit/USCEHUB_MASTER_BLUEPRINT.md

The handoff doc has the current state, in-flight branches/stashes, the
immediate next gate, the deferred items, and the hard rules. Confirm
the production state is unchanged before any work:

  cd /Users/shelly/usmle-platform && git status --short
  cd /Users/shelly/usmle-platform && git log --oneline -5
  cd /Users/shelly/usmle-platform && git stash list

Then wait for my next instruction. Do not start PR 3.4 until I share
the first cron run log.
```

---

## SEO impact of this handoff doc

```
SEO impact:
- URLs changed:        none
- redirects added:     none
- sitemap changed:     no
- robots changed:      no
- canonical changed:   no
- metadata changed:    no
- JSON-LD changed:     no
- pages noindexed:     none
- internal links:      none changed
- risk level:          ZERO — internal docs file, never crawled, on a local-only branch
```

## `/career` impact of this handoff doc

None.
