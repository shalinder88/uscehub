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

## Product vision (do not narrow)

USCEHub is intended to become the cleanest, most trusted physician career-pathway platform for the **whole physician pipeline** — IMGs, U.S. MD/DO students and graduates, residents, fellows, attendings, visa-dependent physicians, and new attendings entering jobs, contracts, insurance, relocation, and adult-life finance setup.

The current public wedge is **verified USCE / observership / elective / clinical-experience data**. That is the foundation, not the ceiling. Future verticals — match prep, fellowship pathway, J1 waiver jobs, H1B-friendly attending jobs, visa and immigration support, attorney/recruiter/contract review directories, disability + term life insurance, physician mortgage / relocation, and financial setup tools — are documented in [docs/codebase-audit/USCEHUB_MASTER_BLUEPRINT.md](docs/codebase-audit/USCEHUB_MASTER_BLUEPRINT.md) §0, §2, §7, and §13.

**Hard sequencing rule.** Do not build verticals prematurely. The order is fixed:

1. Stabilize the USCE trust / data-quality engine (Phase 3 — verification cron, admin queue, real public verification UI).
2. Ship saved / compare / alerts on top of trustworthy data.
3. Expand into career, visa, fellowship, and new-attending support.
4. Marketplace and monetization layers.

**Anti-narrowing rule for agents.** Do not describe USCEHub as "an observership directory" or "an IMG observership site" in any commit message, PR body, doc, or public copy. The trust engine is the *current* wedge of a much larger physician career-pathway platform. If a doc, plan, or diff implies the product is only observerships, treat that as drift and flag it before writing more code.

## Cross-reference

For preservation rules, the `/career` hard protection list, git safety, and SEO preservation, see [docs/codebase-audit/RULES.md](docs/codebase-audit/RULES.md) and [docs/codebase-audit/SEO_PRESERVATION_RULES.md](docs/codebase-audit/SEO_PRESERVATION_RULES.md). RULES.md has higher authority than the blueprint and higher authority than this file when conflicts arise.

## P102 National Medical Opportunity Extractor

P102 is the framework that scales source-linked national medical-opportunity discovery one institution at a time. It adapts the FDD A1/A2/A3 architecture to USCEHub. Production main remains UNCHANGED throughout all P102 work — every commit lands on a `local/p102-*` branch.

**Where to start:**

- [`docs/platform-v2/local/usce-discovery-command-center/p102/P102_OPERATING_RUNBOOK.md`](docs/platform-v2/local/usce-discovery-command-center/p102/P102_OPERATING_RUNBOOK.md) — operational guide. Read first.
- [`docs/platform-v2/local/usce-discovery-command-center/p102/CHANGELOG.md`](docs/platform-v2/local/usce-discovery-command-center/p102/CHANGELOG.md) — sprint-by-sprint history.
- [`docs/platform-v2/local/usce-discovery-command-center/p102/P102_DASHBOARD.md`](docs/platform-v2/local/usce-discovery-command-center/p102/P102_DASHBOARD.md) — auto-generated cross-run dashboard.
- [`docs/platform-v2/local/usce-discovery-command-center/p102/P102_OPERATING_DOCTRINE.md`](docs/platform-v2/local/usce-discovery-command-center/p102/P102_OPERATING_DOCTRINE.md) — 30 binding rules.

**Binding P102 rules** (in addition to USCEHub-wide rules above):

1. One institution per run. No multi-institution runs.
2. No Agent / subagent during A1–A4 of any run. The runner script is the sole writer; concept detectors are the sole reader.
3. A3 hostile gate has no network. A3 reads only run-folder files. A3 must attest `networkUsed=false`, `agentUsed=false`.
4. Every claim needs `quote` + `sourceUrl` + `sourceHash` + `cleanedTextPath`. Quote must be whitespace-normalized substring of cleaned text, or equal `NOT_STATED_ON_SOURCE`.
5. PUBLIC_SAFE_USCE blocked from future-lane source families (GME_PAGE, RESIDENCY_PAGE, FELLOWSHIP_PAGE, CAREERS_PAGE) and from system/school scope without `campusApplicabilityProof`.
6. PUBLIC_SAFE_NO_PUBLIC_OPPORTUNITY requires `EXPLICIT_NEGATIVE_QUOTE` + `STRONG` strength + `quoteVerified=true`. Absence after search is `NO_PUBLIC_OPPORTUNITY_FOUND` (lower confidence), not public-safe.
7. All artifacts under canonical T7 root: `/Volumes/T7Shield_Code/01_PROJECTS/USCEHub/11_LOCAL_EVIDENCE/p102-national-runner/`. Legacy root forbidden.
8. No state run, no national run, no gold-set run, no new institutions until the operator explicitly authorizes — P102-0D (model A1/A2 reader) is the unblocking sprint.

**Validators to run before any P102 commit:**

```
npx tsx scripts/validate-p102-discovery-runner.ts
npx tsx scripts/test-p102.ts
npx tsx scripts/p102-anti-drift-validator.ts
npx tsx scripts/validate-no-secrets.ts
npx tsc --noEmit
```

All must PASS. Run validator details in `P102_OPERATING_RUNBOOK.md`.

**Pending sprints (do not start without explicit authorization):**

- **P102-0D** — wire model A1/A2 reader to the captured prompt at `docs/platform-v2/local/usce-discovery-command-center/p102/specs/P102_A1_A2_READER_PROMPT.md`. **Blocks state/national.**
- **P102-GOLD-RUN** — execute the gold-set queue. Verifier at `scripts/p102-gold-set-verify.ts`.
- **P102-STATE** — single-state slice. Requires gold-set pass.
- **P102-NATIONAL** — national run. Requires state pass + explicit operator authorization.

**Trust-engine relationship.** P102 produces source-linked data destined for the public USCEHub trust engine. Each PUBLIC_SAFE_USCE claim that eventually ships to production must be quote-backed and source-cited. Future-lane signals (residency / fellowship / careers / visa / services) are captured internally but never published as USCE without explicit lane expansion.
