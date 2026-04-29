# Vercel Project Audit

**Status:** operational doc.
**Authority:** lower than [RULES.md](RULES.md) and [SEO_PRESERVATION_RULES.md](SEO_PRESERVATION_RULES.md).
**Purpose:** document the duplicate Vercel project situation in the `shalinder88s-projects` team so future operators (and agents) do not act on the wrong project.

## TL;DR

There are **two Vercel projects** in the `shalinder88s-projects` team that both build on every PR:

| Project | ID | Role |
|---|---|---|
| `uscehub` | `prj_gCFBT0WogHJD6u7Nw5fCRkLayDd0` | **Production** — serves `uscehub.com`. `CRON_SECRET`, `DATABASE_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`, `DIRECT_URL` all live here. |
| `usmle-platform` | `prj_s1t73G2jniMr2gUb0PIfoQ8fLp9J` | **Duplicate / legacy** — does not own production traffic. Only has `RESEND_API_KEY` and `NOTIFY_TO`. |

The repo's local `.vercel/project.json` is currently linked to the **duplicate** (`usmle-platform`), not the production project. Discovery of this came up during the cron-secret retrieval attempt that hit the wrong project's env (PR #11 era, see SESSION_HANDOFF and the `/tmp/uscehub-link/` workaround).

## Why this exists (best guess)

Best guess: the project was renamed or duplicated during early development before the canonical `uscehub` project was set up, and the local link was never updated. Both projects build every PR because GitHub-Vercel integration auto-attaches all linked repos.

## Risk surface

| Risk | Severity | Notes |
|---|---|---|
| Wrong env pull on local CLI | LOW | `vercel env pull` from the repo dir pulls from `usmle-platform` (no `CRON_SECRET`, no `DATABASE_URL`). Already caught — this is why PR #11's manual cron-trigger attempt failed and the duplicate was discovered. |
| Wrong deploy logs | MEDIUM | Logs in the `usmle-platform` Vercel dashboard reflect *preview* deployments only. Anyone debugging production behavior in that dashboard would see misleading data. **Always look at the `uscehub` project for production cron logs.** |
| Preview duplication | LOW | Every PR builds twice — one preview per project. Doubles the preview-build compute footprint. Cosmetic on Hobby plan; would be a real cost on Pro. |
| Future agent confusion | MEDIUM | An agent reading `.vercel/project.json` and assuming it points at production would relink, env-pull, or log-fetch from the wrong place. **This doc + AGENTS.md cross-reference is the mitigation.** |
| Production routing accident | LOW | `uscehub.com` aliases to `uscehub`, not `usmle-platform`. Renaming or deleting the duplicate does not affect production routing. |

## What lives where today (verified 2026-04-29)

```
team_InSMDskuvpx6NF0k2Gyhlebh  shalinder88s-projects
├── uscehub                    prj_gCFBT0WogHJD6u7Nw5fCRkLayDd0   ← production, owns uscehub.com
│   env:
│     CRON_SECRET              (sensitive — write-once, runtime-only)
│     NEXTAUTH_URL
│     DATABASE_URL
│     DIRECT_URL
│     NEXTAUTH_SECRET
├── usmle-platform             prj_s1t73G2jniMr2gUb0PIfoQ8fLp9J   ← duplicate
│   env:
│     RESEND_API_KEY
│     NOTIFY_TO
├── franchiese                 (unrelated)
├── rural-health-funding-radar (unrelated)
└── sasanova                   (unrelated)
```

**Repo local link (`/Users/shelly/usmle-platform/.vercel/project.json`):**
```
{
  "projectId":   "prj_s1t73G2jniMr2gUb0PIfoQ8fLp9J",
  "orgId":       "team_InSMDskuvpx6NF0k2Gyhlebh",
  "projectName": "usmle-platform"
}
```

That `projectName` is the duplicate. Production is `uscehub`.

## Recommended cleanup

Do **not** auto-execute any of these. Each step requires explicit user authorization. They are listed in suggested order (least disruptive first):

### Step 1 — Confirm production project in the dashboard

1. Visit the Vercel dashboard.
2. Click the `uscehub` project.
3. Settings → Domains. Confirm `uscehub.com` (apex) and `www.uscehub.com` are aliased here.
4. Settings → Git. Confirm the GitHub repo is linked.
5. Cron Jobs. Confirm both `0 8 * * *` and `0 9 * * *` are listed against this project.

If any of those are NOT on `uscehub`, **stop and consult the user** — the production layout would be different from what this doc assumes.

### Step 2 — Decide on the duplicate

Two options. The user picks; do not act unilaterally:

**Option A — Pause `usmle-platform` (recommended; lowest risk).**
- Vercel dashboard → `usmle-platform` → Settings → Git → "Disconnect Git Repository". Stops new preview builds. Leaves the project metadata intact in case it ever turns out to own something we forgot.
- After ~30 days of clean ticks with no surprises, delete the project entirely.

**Option B — Delete `usmle-platform` immediately.**
- Vercel dashboard → `usmle-platform` → Settings → "Delete Project". Confirm by typing the project name.
- Faster but harder to reverse if a forgotten link somewhere depended on it.

Either way, **`uscehub` is the keep**.

### Step 3 — Relink the local repo (after Step 2)

```bash
cd /Users/shelly/usmle-platform && \
  /tmp/vc/node_modules/.bin/vercel link --project=uscehub --scope=shalinder88s-projects --yes
```

(Or via global vercel CLI if installed.)

This rewrites `.vercel/project.json` to:
```
{
  "projectId":   "prj_gCFBT0WogHJD6u7Nw5fCRkLayDd0",
  "orgId":       "team_InSMDskuvpx6NF0k2Gyhlebh",
  "projectName": "uscehub"
}
```

After relinking:
- `vercel env pull .env.local --environment=production` will pull `uscehub` env (including `CRON_SECRET` for `non-sensitive` keys; `CRON_SECRET` itself is `type=sensitive` and will appear with empty value — see [SESSION_HANDOFF_2026_04_28.md](SESSION_HANDOFF_2026_04_28.md) §10).
- `vercel logs` will show production logs.
- `vercel deploy` would (hypothetically) deploy to production. **Do not run.** Production deploys happen via GitHub merge to `main`, not from the CLI.

### Step 4 — Remove the temporary `/tmp/uscehub-link/` workaround

The workaround directory was created when the duplicate-project blocker was discovered:
```
/tmp/uscehub-link/.vercel/project.json
```

After Step 3 it's no longer needed. Safe to remove with:
```bash
rm -rf /tmp/uscehub-link
```

(Outside the repo; `/tmp` is not protected by repo-level `do not delete`.)

## What this doc does NOT do

- **Does not delete or pause anything.** This is a docs-only audit.
- **Does not modify `.vercel/project.json`.** Relinking is gated on Step 2 + explicit authorization.
- **Does not modify production env vars.** Read-only inspection of project metadata only.

## Related deferred items

See [DEFERRED_OPS_CHECKLIST.md](DEFERRED_OPS_CHECKLIST.md) §1 for the original deferred-item entry. This audit doc is the detailed companion.

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
