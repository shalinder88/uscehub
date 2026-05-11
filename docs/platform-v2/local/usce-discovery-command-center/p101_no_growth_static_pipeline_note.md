# P101 — No-Growth Static / Noindex Pipeline Note

**As of 2026-05-11 reset, the static noindex pipeline is paused and in no-growth state.**

## What's paused

| File / folder | Status |
|---|---|
| `src/data/usce/public-listings-pilot.generated.{json,ts}` | Frozen at 12 cards. No new activation slices. |
| `src/data/usce/public-listings-pilot-staged-batch-{2,3,4}.generated.{json,ts}` | Frozen. No batch 5. No staged-runtime additions. |
| `src/data/usce/public-listings.generated.{json,ts}` | Frozen at 12 Maine rows. The /clerkships/maine page is unaffected; no growth. |
| `src/lib/usce-contact-context.ts` `KNOWN_LISTINGS` | Frozen at 16. No new entries unless explicitly downstream of a discovery sprint and authorized. |
| `src/app/clerkships/pilot/` | No route changes. |
| `src/app/contact/` | No UI changes. |
| `src/app/api/usce/corrections/` | Endpoint remains env-flag-disabled by default. |
| `docs/platform-v2/local/usce-completeness/staged-runtime-batch-*` | Historical. No new sibling folders. |
| `docs/platform-v2/local/usce-completeness/active-12-*` | Historical. No new sibling folders. |
| `scripts/validate-p99-*` | Existing validators preserved (do not delete; they're cheap insurance). No new P99-prefixed validators. |

## What's allowed

- Reading these files for reference.
- Citing them in command-center docs (e.g., this file).
- Adding new validators under different prefixes (`validate-p101-*`) that explicitly check the no-growth property.

## Fold-or-kill decision

Whether to fold the 12 noindex cards into Prisma (merging duplicates with the live 304) or formally archive the static pipeline is a future decision. It is **not** discovery work and is **not** scheduled inside the P101 sprint family. The reset prompt explicitly says: "Do not fold noindex pilot. Do not clean noindex pipeline."

When that decision is made, it gets its own named sprint (e.g., `P102-NOINDEX-FOLD-OR-KILL-DECISION`).

## Why this matters

Every prior overnight sprint expanded the noindex pipeline. That expansion was the drift. Marking the pipeline `NO_GROWTH` in writing — with validator checks enforcing it — converts the policy from intention to mechanism.

## Validator enforcement

`scripts/validate-p101-discovery-command-center.ts` checks:

- `git status --short` for the protected static-pipeline paths must be empty (or pre-existing-untracked-only, which we'll allow via a path-list).
- No new staged-batch-* directories created under `docs/platform-v2/local/usce-completeness/`.

If a future sprint legitimately needs to touch any of these files, it must explicitly mark itself as **not** P101 discovery work and require explicit user authorization.
