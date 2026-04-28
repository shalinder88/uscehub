<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Agent operating rules — USCEHub

This is the canonical agent-instruction file for this repository. `CLAUDE.md` at the repo root delegates here via `@AGENTS.md`. Do not duplicate the rules below in other docs; cross-reference instead.

## Strategic checkpoint cadence

Every 10th substantive Claude prompt must start with an explicit strategic checkpoint before execution. A "substantive prompt" is one that authorizes a code, schema, deploy, infra, content, or strategy change — not a one-line correction or a routine status check.

The checkpoint must answer:

1. Are we still on the right track?
2. Are we missing something important?
3. Are we stuck or looping?
4. Are we drifting from the USCEHub blueprint?
5. Is there a safer or higher-leverage next step?
6. Are SEO, `/career`, trust, data quality, monetization timing, and long-term strategy still protected?
7. Are we introducing hidden operational risk, such as migration/deploy drift, stale env vars, broken cron, or hardcoded assumptions?
8. Should anything be paused, documented, or fixed before continuing?
9. Does the current step preserve the free-core, trust-first, IMG/trainee-pathway platform strategy?
10. Is this the right sequence, or are we prematurely starting features before foundation?
11. Is there anything better we can do?
12. Review our competitors and things we can add from them or make better than them.

The checkpoint must not derail execution unless it finds a concrete issue. If it surfaces a real risk, name it, propose the smallest safe correction, and wait for the user before proceeding.

## Per-prompt agreement statement

For every prompt, before executing, state one of:

- **Agree** — the proposed action is correct as stated.
- **Disagree** — the proposed action is wrong; explain why and propose an alternative before doing anything.
- **Agree with caveat** — the proposed action is mostly correct; name the specific concern, then proceed unless the caveat is blocking.

For routine commands a single short line is enough. For substantive decisions the agreement statement must be explicit and the reasoning must be visible before any tool calls.

Never silently comply with a risky instruction. Never claim "done" speculatively — distinguish facts (read / ran / verified) from hypotheses (suspect / likely / probably). When stuck, list what was tried and why each attempt failed; do not loop silently.

## Phase-and-stop discipline

When the user gives lettered phases ("do A, B, C") run them in a single turn and stop before any irreversible step. "Push", "merge", "deploy to production", "run migrate deploy", `git reset --hard`, `git stash drop`, force-pushing, and amending are never run without the user typing the literal word for that action.

## Cross-reference

For preservation rules, the `/career` hard protection list, git safety, and SEO preservation, see [docs/codebase-audit/RULES.md](docs/codebase-audit/RULES.md) and [docs/codebase-audit/SEO_PRESERVATION_RULES.md](docs/codebase-audit/SEO_PRESERVATION_RULES.md). RULES.md has higher authority than the blueprint and higher authority than this file when conflicts arise.
