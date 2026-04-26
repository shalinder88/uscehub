# Audit Rules — read before any cleanup PR

These rules govern this audit and every cleanup PR derived from it. They override anything in the other docs in this folder if there is a conflict.

## 1 — Preservation, not deletion

This is a **preservation audit**, not a deletion audit. The goal is to **understand, document, and stabilize** the codebase while preserving existing work — including unfinished `/career` backend/backsite work, dead-looking imports, aspirational Prisma models, and stale data files.

If you find duplicate, unused, stale, or confusing files:
- Document them in [TECH_DEBT_REGISTER.md](TECH_DEBT_REGISTER.md).
- **Do not remove them in this pass.**
- If you think something should eventually be removed, label it: **"Candidate for later review — do not delete now."**

## 2 — `/career` is a protected, unfinished asset

The `/career` section is **not dead code**. It is an unfinished future asset covering:
- J-1 waiver jobs
- H-1B-friendly jobs
- Conrad 30 / state visa-pathway guides
- visa & career pathway content
- recruiter directory
- immigration attorney directory
- physician job transition resources

### Hard protection list — do not delete, rename, merge, or restructure without explicit user approval:

- `/career` and `/careers` (any URL path)
- `src/app/career/**` (every file under this directory tree)
- `src/app/careers/**` (any future variant)
- `src/app/career/jobs/**` and the jobs search UI
- `src/app/career/waiver/**` (waiver state pages, tracker, map, hpsa-lookup, pathways, process, timeline)
- `src/app/career/sponsors/**`
- `src/app/career/attorneys/**`
- `src/app/career/employers/**`
- `src/app/career/h1b/**`, `h4-spouse/**`, `greencard/**`, `visa-bulletin/**`, `visa-journey/**`, `ecfmg/**`, `citizenship/**`, `licensing/**`, `credentialing/**`, `loan-repayment/**`, `locums/**`, `malpractice/**`, `salary/**`, `taxes/**`, `interview/**`, `contract/**`, `offers/**`, `community/**`, `state-compare/**`, `compare-states/**`, `alerts/**`, `waiver-problems/**`
- `src/lib/waiver-jobs-data.ts`
- `src/lib/dol-jobs-data.ts`
- `src/lib/sponsor-data.ts`
- `src/lib/waiver-data.ts`
- `src/lib/conrad-tracker-data.ts`
- `src/lib/visa-bulletin-data.ts`
- `src/lib/policy-alerts-data.ts`
- `src/lib/job-source-compliance.ts`
- `src/lib/employer-urls.ts` (currently in stash)
- `scripts/output/city-profiles-base.json` (currently in stash) and any other city/state/job profile data dumps under `scripts/output/`
- `scripts/data/*` (clerkships, observerships batches — also seed material)
- `scripts/import-lca-data.ts`, `scripts/parse-lca-xlsx.ts`, `scripts/verify-jobs.ts`, `scripts/gme-outreach.ts`, `scripts/seed-2026-observerships.ts`
- `scripts/lca-fy2024-q4.xlsx` (raw input, untracked but preserve in working tree)
- Prisma models flagged as unused in this audit (`WaiverJob`, `WaiverState`, `Lawyer`, `FellowshipProgram`, `DataVerification`) — **preserve as aspirational**, do not drop in a migration without explicit approval
- The `vercel/vercel-speed-insights-to-proje-vxknxk` remote branch and any other unfamiliar branch — **investigate before touching**

### How to handle "looks unused" findings inside this list

Classify as: **"Preserve — unfinished careers asset"**.

Not as: ~~"delete"~~, ~~"remove"~~, ~~"clean up"~~, ~~"obsolete"~~, ~~"dead code"~~.

If a cleanup pass needs the area changed:
- isolate the change
- document what it does and why
- make it safer (defensive, not destructive)
- **do not delete**
- **do not rename**
- **do not merge into other routes**
- **do not mark obsolete unless the user explicitly says so**

## 3 — Stash / WIP discipline for unfinished work

If dirty `/career` or jobs work is incomplete:
- Prefer preserving in a **WIP branch** or **`git stash -u`** (with `-u` to include untracked files like `employer-urls.ts` that are referenced by tracked files).
- Do not delete or reset.
- Do not commit half-finished changes to `main`.
- The stash entry from this audit is `stash@{0}: On main: preserve jobs expansion before USCEHub codebase audit` — pop only on a feature branch, never directly onto `main` if the work is mid-flight.

## 4 — Git safety

**Never run any of these without the user explicitly authorizing the exact command after seeing what would be lost:**

- `git reset --hard`
- `git clean -fd` (or any `git clean` with `-f`)
- `rm -rf` against any tracked or untracked path inside the repo
- `git checkout -- .`
- `git restore .` (or any wide `git restore`)
- `git push --force` (or `--force-with-lease`)
- `git branch -D` (force-delete branch)
- `git stash drop`, `git stash clear`
- `prisma migrate reset`
- `npx prisma db push --accept-data-loss`
- Any direct DB write that drops a table, truncates, or deletes rows

If any cleanup PR or follow-up agent suggests one of these, it must:
1. State exactly which files / commits / records would be lost.
2. Wait for the user to authorize that exact command.

## 5 — Scope of cleanup PRs

Cleanup PRs derived from [CLEANUP_PLAN.md](CLEANUP_PLAN.md) must:
- not delete files inside the hard protection list
- not rename routes inside the hard protection list
- not drop Prisma models flagged in this audit
- not change the data sources of `/career/*` pages
- be additive where possible (new helpers, new components) and route new usage through them — leaving the old paths in place even if they look redundant

**Anything that needs to break this rule needs explicit user approval before the PR is opened.**

Strategic product expansion such as fellowship, Match Prep, Career Path, monetization, and community must be documented first and implemented only in its planned phase; documentation is not implementation authorization.
