# Batch release workflow

**Status:** operational doc.
**Authority:** lower than [RULES.md](RULES.md) and [SEO_PRESERVATION_RULES.md](SEO_PRESERVATION_RULES.md).
**Adopted:** 2026-04-29 — when the verified-USCE wedge went honest end-to-end and the site became "live enough" that public wording, stats, rankings, and future conversion hooks should not drip into production one PR at a time.

This file documents the **Moderate Background Build Mode** the project now operates under. Build keeps moving in branches and PRs; production changes only in approved batches.

## TL;DR

```
Background build  →  PR queue  →  batch review  →  controlled production release
```

- Open PRs are the staging environment. Vercel's preview deploy on each PR is the visual review surface.
- `main` auto-deploys to production within ~60–90 seconds of any push.
- Public-facing PRs stay open for batch review.
- Docs-only and read-only diagnostic PRs may auto-merge if checks pass.
- Cron-failure / security / data-integrity bugs use a fast path **with explicit user authorization**, not auto-merge.

## Why main deploys immediately

Vercel's GitHub integration auto-deploys `main` on every push. There is no "merged but not yet deployed" state on this Hobby project without one of:

- adding a GitHub branch-protection rule on `main` (single settings change, no code), or
- moving production deploys to a `staging` branch and reconfiguring Vercel.

Until either is in place, the discipline lives entirely in **"do not merge public-facing PRs to `main` without batch review."** This doc is that discipline written down.

## What may auto-merge

If checks pass and scope matches, the PR may merge as soon as Vercel checks go green:

- **Docs-only** — anything under `docs/` whose only change is `.md` files.
- **Read-only diagnostic scripts** — anything under `scripts/` that does Prisma reads only (no `.create` / `.update` / `.delete` / `.upsert` / `.updateMany` / `.deleteMany`, no `$executeRaw`, no network writes), produces stdout only, exits with codes that signal status.
- **Test-only changes** — adding assertions to existing `scripts/test-*.ts` files without changing production code.
- **Internal admin runbooks / audit docs** — same as docs-only.

If a PR mixes any of the above with anything else, the whole PR is treated as the "anything else" category and waits for batch review.

## What must wait for batch review

Every PR that changes any of the following waits for explicit user review and merge:

- **Public UI** — listing cards, listing detail, browse/observerships/specialty grids, compare/recommend, homepage stat cards, badges, public copy.
- **Public trust wording** — anything users could read about whether a program is "verified", "official", "checked", etc.
- **Conversion / lead capture / email** — digest send paths, email capture forms, subscriber storage.
- **Admin mutation surfaces** — anything that adds or changes admin actions that write to the DB.
- **Schema or migration** — `prisma/schema.prisma`, migrations folder, `package.json#prisma`.
- **`vercel.json`** — cron count, function config, redirects, rewrites.
- **SEO implementation** — `sitemap.xml`, `robots.txt`, `<meta>` description fields, canonical URLs, JSON-LD, `redirects()` config.
- **`/career` / `/careers`** — entire route tree per [RULES.md](RULES.md) §2.
- **Cron schedule or behavior** — `vercel.json` cron entries, route-level probe/classification logic.

## Emergency exception path

A small set of incidents bypasses the batch cadence — but **never auto-merges**. Each requires explicit user authorization to merge same-day:

1. **Cron health FAIL** — `scripts/check-verify-listings-cron.ts` exits 1 (forbidden cron-attributed transition, fake-date violation, etc.). Stop further cron ticks until fixed.
2. **Security issue** — public auth bypass, secret exposure, RCE class.
3. **Data-loss / data-corruption risk** — production write that violates the conservative cron / admin contract.
4. **Production 5xx** — a public route that previously returned 200 now returns 5xx.

Process: I open a PR with the smallest possible fix, summarize the incident in the PR body, ping the user explicitly, wait for "merge it" with the literal word, then merge. Do not auto-merge even when the bug is obvious.

The user can pre-authorize a class of fixes in advance ("if cron health FAILs on a fake-date violation, fix-and-merge same-day without asking"); without that pre-authorization, the explicit approval is required.

## Batch review checklist

When the user returns to clear the PR queue, walk these in order:

```
[ ] gh pr list --state open --limit 20
    Confirm queue size (should be ≤ 7; rebase or close if higher).

[ ] For each open PR:
    [ ] Title + 1-line summary.
    [ ] gh pr diff <N> --name-only — confirm files match scope.
    [ ] Check Vercel preview URL — eyeball the change on the actual page.
    [ ] Review changed surfaces (which routes, which copy, which DB fields).
    [ ] Review user-visible copy specifically — is the trust language honest?
    [ ] Tests / build / lint status — should be all green.
    [ ] Production impact — what changes for the live user?
    [ ] /career check — confirm no /career, /careers, or src/lib/*-data.ts career-related changes.
    [ ] SEO check — sitemap, robots, canonical, metadata, JSON-LD, redirects untouched (or explicitly approved).
    [ ] Schema / migration check — prisma/ untouched (or explicitly approved).
    [ ] Cron count check — vercel.json cron count = 2.
    [ ] Rollback plan — if this PR breaks something live, what's the revert?

[ ] Decide merge order:
    [ ] Bug fixes first (PR #24 / Phase 3.8 was an example).
    [ ] Internal/admin changes second.
    [ ] Public UI/copy changes last (highest blast radius).

[ ] Merge with `gh pr merge <N> --squash --delete-branch=false`.

[ ] After last merge, run production probes:
    curl -sI https://uscehub.com/         # 200
    curl -sI https://www.uscehub.com/     # 308 → apex
    curl -sI https://uscehub.com/browse   # 200
    curl -sI https://uscehub.com/api/cron/verify-listings  # 401

[ ] Run cron health check:
    cd /Users/shelly/usmle-platform && npx tsx scripts/check-verify-listings-cron.ts

[ ] Confirm stashes preserved:
    git -C /Users/shelly/usmle-platform stash list
```

## PR queue cap

**Hard cap: 7 open PRs.** When the queue hits 7, I stop opening new branches and wait for batch review. This keeps merge conflicts manageable and signals that throughput is already ahead of review bandwidth.

**Rebase weekly** (or before each batch merge) so older branches don't bit-rot against `main`. Specifically:

```bash
# For each open PR branch:
git -C /Users/shelly/usmle-platform fetch origin
git -C /Users/shelly/usmle-platform checkout <branch>
git -C /Users/shelly/usmle-platform rebase origin/main
git -C /Users/shelly/usmle-platform push --force-with-lease
```

`--force-with-lease` (not `--force`) is the safer flavor and is the only force-push variant ever allowed in this project.

## Cadence trigger

Batch review happens **when the user says "ship the batch."** No automatic time-based or count-based trigger. Reasons:

- Time-based ("every Friday") forces batch reviews at moments when nothing meaningful has accumulated, or skips weeks where the queue exceeds the cap.
- Count-based ("when N PRs accumulate") couples Claude's velocity to user bandwidth in a way that pressures reviews.
- User-triggered keeps it driven by your bandwidth, not an automated schedule.

If the queue stalls for >2 weeks, I'll proactively summarize the open PRs in a status update so the user has the context to either ship or defer.

## What changed about Claude's behavior

| Before (auto-merge era) | After (Mode A) |
|---|---|
| Docs-only PRs auto-merged ✅ | Docs-only PRs auto-merge ✅ (unchanged) |
| Read-only scripts auto-merged ✅ | Read-only scripts auto-merge ✅ (unchanged) |
| Cron-design / 405 fix code PRs auto-merged | Code PRs that change production behavior **stay open** for batch review |
| Public UI PRs auto-merged after green checks | Public UI PRs **stay open** for batch review |
| Conversion / email PRs out of scope | Still out of scope, plus subscriber schema requires explicit authorization |

The two specific PRs that prompted this mode shift:

- **PR #25** (Phase 3.9 trust metrics) — public copy change. Stays open. Right call.
- **PR #27** (content official-source cleanup) — public blog content change. Stays open. Right call.

Both are good test cases for the new mode.

## Cross-references

- [RULES.md](RULES.md) §2 — `/career` hard protection list (higher authority than this doc).
- [SEO_PRESERVATION_RULES.md](SEO_PRESERVATION_RULES.md) — public URL / metadata / sitemap rules (higher authority).
- [USCEHUB_MASTER_BLUEPRINT.md](USCEHUB_MASTER_BLUEPRINT.md) §0 — long-term platform vision and hard sequencing rule.
- [DEFERRED_OPS_CHECKLIST.md](DEFERRED_OPS_CHECKLIST.md) — operational tasks the user works at their pace.
- [CRON_HEALTH_CHECK_RUNBOOK.md](CRON_HEALTH_CHECK_RUNBOOK.md) — cron diagnostic for the emergency-exception path.
- [PHASE_3_COMPLETION_GAP_AUDIT.md](PHASE_3_COMPLETION_GAP_AUDIT.md) — what's done and what's still pending.

## SEO impact of this doc

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
- risk level:          ZERO — internal docs only
```

## /career impact of this doc

None.
