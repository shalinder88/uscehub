# Vercel Duplicate Project Cleanup — Checklist

**Status:** Plan only. No Vercel mutations have been performed. Do not act on this checklist without explicit approval per step.

**Updated:** 2026-05-01

---

## 1. Current known state

Two Vercel projects are connected to the same GitHub repository (`shalinder88/uscehub`):

| Project | Project ID | Role |
|---|---|---|
| `uscehub` | `prj_gCFBT0WogHJD6u7Nw5fCRkLayDd0` | **Canonical** (chosen 2026-05-01) |
| `usmle-platform` | `prj_s1t73G2jniMr2gUb0PIfoQ8fLp9J` | **Orphan candidate** — to be disconnected after parity check |

The local `.vercel/project.json` is currently pinned to `usmle-platform` (the older project). It is gitignored and stays local-only; it does not need to be committed.

Both projects auto-deploy on every push to `main` and on every PR. Each PR therefore shows two Vercel preview checks (`Vercel – uscehub` and `Vercel – usmle-platform`).

## 2. Canonical project = `uscehub`

Reason for choosing `uscehub`:

- Matches the GitHub repo name (`shalinder88/uscehub`).
- Matches the brand (`uscehub.com` custom domain).
- Cleaner preview subdomain pattern (`uscehub-git-<branch>-…`).

## 3. Orphan candidate = `usmle-platform`

Was the original project before the rebrand. Likely created via a separate import after the GitHub repo rename, leaving the old project still wired up. To be disconnected only after env/domain/git/cron parity is confirmed.

## 4. Why duplicate Vercel projects are risky

- **Duplicate cron invocations.** `vercel.json` declares two cron entries (`/api/cron/verify-jobs` daily 8:00 UTC, `/api/cron/verify-listings` daily 9:00 UTC). If both projects deploy this config, both projects' cron systems fire it, producing 2× cron runs against the same Supabase database.
- **Duplicate preview deployments per PR.** Wastes Vercel build minutes and produces ambiguous reviewer signals.
- **Duplicate production rebuilds on every `main` push.** One project owns the custom domain; the other deploys to a `*.vercel.app` URL nobody uses.
- **Confusing reviewer QA.** Reviewers must know which preview is canonical to test against.
- **Local pointing risk.** `.vercel/project.json` currently points at the orphan; a CLI `vercel deploy` would push to the wrong project.

## 5. Not-proven note

Duplicate cron firing is a **likely contributor** to the Supabase `EMAXCONNSESSION` pool pressure observed during this morning's autonomous build (when running `npx prisma migrate status`). It is **not the proven sole cause**. Other candidates:

- Local Prisma commands left sessions open.
- Local `npm run build` warming connections.
- Preview deployments holding sessions.
- Cron overlap with an interactive Prisma query.
- Pooled sessions never closed by application code.

Treat this as a major suspect, not the only one.

## 6. Pre-disconnect checklist (must complete BEFORE any disconnect)

For each of the two projects, gather and compare the following from the Vercel dashboard:

- **Domains** — does each project list `uscehub.com` and `www.uscehub.com`? Only one of the two should.
- **Environment variables** — env var names only (never paste values into the checklist or chat). Confirm parity.
- **Git connection** — repo name, branch, root directory, install command, build command.
- **Cron jobs** — full list, schedule, target paths.
- **Deployment history** — does the orphan have any production deployments since the canonical took over?
- **Custom build/install/root-directory settings** — anything non-default.

## 7. Environment variable parity checklist

Required env vars (USCEHub specific — names only):

```
DATABASE_URL
DIRECT_URL
NEXTAUTH_SECRET            (or AUTH_SECRET)
NEXTAUTH_URL               (or AUTH_URL)
CRON_SECRET
NEXT_PUBLIC_SUPABASE_URL   (if present)
NEXT_PUBLIC_SUPABASE_ANON_KEY (if present)
SUPABASE_SERVICE_ROLE_KEY  (if used)
RESEND_API_KEY             (if used for email)
SENDGRID_API_KEY           (if used for email)
SENTRY_DSN                 (if used)
NEXT_PUBLIC_GA_ID          (if used)
PLAUSIBLE_DOMAIN           (if used)
```

For each environment (Production, Preview, Development): `uscehub` must have every var that `usmle-platform` has, with the same value. **Do not paste values into Slack, chat, docs, or commits.** Visually confirm in the dashboard side by side.

If `usmle-platform` has any env var that `uscehub` lacks, copy it to `uscehub` first. Do not delete from `usmle-platform` until disconnect.

## 8. Safe disconnect plan

Order matters. Each step requires explicit approval before execution.

1. **Confirm canonical owns the production domain.** `uscehub.com` and `www.uscehub.com` must list under `uscehub` Settings → Domains. If they list under `usmle-platform` instead, **stop** — domain transfer happens first as a separate task.
2. **Confirm env var parity** per Section 7.
3. **Confirm Git connection on `uscehub`** points to `shalinder88/uscehub` on `main` with the correct root directory (`.`) and standard build command.
4. **Confirm cron jobs on `uscehub`** match `vercel.json`:
   - `/api/cron/verify-jobs` — `0 8 * * *`
   - `/api/cron/verify-listings` — `0 9 * * *`
5. **Disconnect Git on `usmle-platform`.** Settings → Git → Disconnect from repo. This stops the duplicate previews + duplicate cron + duplicate prod rebuilds.
6. **Wait 24–72 hours.** Monitor:
   - PR check status (only `Vercel – uscehub` should appear on new PRs).
   - Cron logs / Supabase pool utilization.
   - `uscehub.com` continues to serve correctly.
7. **Only after a clean monitoring window:** delete the `usmle-platform` Vercel project. Settings → Advanced → Delete project. Optionally export deployment history first.

## 9. Local `.vercel/project.json`

- Currently pinned to `usmle-platform` (project ID `prj_s1t73G2jniMr2gUb0PIfoQ8fLp9J`).
- Gitignored at repo root (`.vercel` line in `.gitignore`).
- After Step 5 above, the local file should be updated to point at `uscehub` (`prj_gCFBT0WogHJD6u7Nw5fCRkLayDd0`) so local CLI invocations target the correct project.
- **Do not commit `.vercel/project.json`.** Update locally only.

## 10. Post-cleanup verification

After the orphan is disconnected:

- One Vercel check per PR (`Vercel – uscehub` only).
- One cron set firing per day per cron path.
- Production custom domain still resolves to `uscehub`.
- Preview QA uses `uscehub-git-<branch>-…vercel.app` only.
- Supabase pool utilization observed for several days; baseline should drop noticeably if duplicate cron was a real contributor.

## 11. Rollback

If anything goes wrong after disconnecting `usmle-platform` Git:

- The orphan project still exists (only Git was disconnected, not the project). Re-connecting Git is reversible: Settings → Git → Connect → choose repo → choose branch.
- If `uscehub.com` traffic drops: confirm domain still listed under `uscehub` Settings → Domains. If not, reattach.
- If cron stops firing: confirm `uscehub` Cron Jobs page matches `vercel.json` schedule.
- If env var is missing: copy from `usmle-platform` (which still exists with its env intact for the rollback window).

Do **not** delete `usmle-platform` until at least 1 week of clean operation. The deleted state is not recoverable.

## 12. Explicit forbidden actions without separate user approval

- Deleting either Vercel project.
- Transferring a custom domain between projects.
- Editing env var values.
- Disconnecting Git before parity Sections 6 + 7 are visually confirmed in the dashboard.
- Committing `.vercel/project.json`.
- Running `vercel deploy` from CLI.
- Modifying `vercel.json` cron schedule.
- Modifying `next.config.ts`.

## Owner reminders

- The cleanup is **infra hygiene**, not a release blocker.
- It can ship as its own ticket independently of PR #52 (the UI release candidate) and PR #53 (OG image fix).
- After PR #52 ships, this cleanup should follow within a few days to stop the duplicate cron from continuing.
