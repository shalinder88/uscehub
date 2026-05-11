# P101 — Drift Guardrails

## The one-question audit (the only check that survives context pressure)

**"Does the next action increase institution coverage, official-source evidence, packet count, classification quality, state-by-state progress, or national discovery coverage?"**

If **no** → drift. Stop. Write a `DRIFT WARNING` block. Do not continue until the next correct discovery action is restored.

## Mandatory `DRIFT WARNING` format

When drift is detected — by Claude or by the user — produce:

```
DRIFT WARNING:
I am drifting away from national USCE discovery.
The drift is: [exact behavior: e.g., "I started writing Prisma schema", "I started bunch-checking 4 hospitals in one report", "I started polishing the noindex pipeline"]
The next correct discovery action is: [exact institution name + official domain + queue rank]
```

Then halt and resume from that correct next institution.

## Forbidden lanes (require explicit user authorization to enter)

| Forbidden lane | Why forbidden in P101-0 |
|---|---|
| Prisma schema / migration | This sprint is docs-only |
| DB seed / Institution table creation | Foundation work that comes after the workflow is proven |
| Noindex pilot / staged runtime / static pilot expansion | Paused / no-growth post-reset |
| Contact / report mapping | Already done; now downstream |
| UI / homepage / nav / sitemap changes | Discovery lane only |
| SEO metadata / canonical / robots / JSON-LD | Discovery lane only |
| App code changes except this sprint's validator | Discovery lane only |
| Bunch-checking many institutions in one analysis | Violates one-website-at-a-time |
| "I checked several and found nothing" | Must be replaced by per-institution packets with documented search evidence |
| AAMC / ACGME / FREIDA / NRMP automated scraping | Licensing / TOS |
| CAPTCHA / login / paywall bypass | Ethics + TOS |
| Real emails / form submissions to coordinators | Out of scope; user explicitly forbade |
| `gh auth status -t` | Token redaction; never flag in any context |

## Forbidden in any commit on this branch in any sprint

- Force-push (`--force`, `--force-with-lease`)
- `--no-verify`
- `--amend` of published commits
- Push to `main` / merge to `main`
- Production deploy
- Mutation of the 12 noindex pilot data files except by an explicitly-authorized "fold or kill" sprint
- Mutation of unrelated dirty files (`.claude/launch.json`, NPPES, redesign-mockups, frozen-internal-copy READMEs)

## Mode discipline

| Mode | What's allowed | What's forbidden |
|---|---|---|
| **Mode 1 — Universe / ledger building** | Batch lists with: institution name, city, state, official domain, institutionType, healthSystem, priority, why_selected, source_of_queue_decision, search_status | Audience, cost, visa, application, "confirmed USCE", "verified" claims |
| **Mode 2 — Evidence extraction** | One institution at a time. Open pages, capture quotes, classify, write packet. | Bunch-checking. Multi-institution narratives. "I looked at 5 hospitals and..." Skipping rejected-page logging. |

Sequential commit: **packet N must exist on disk before institution N+1's Mode-2 work begins.**

## 5-institution checkpoint (this sprint)

After 5 packets, write `P101_0_FIVE_INSTITUTION_PROOF_CHECKPOINT.md` and STOP.

No automatic continuation to a 6th institution. No automatic start of Prisma schema. No automatic start of any downstream lane.

The only acceptable next prompt is `P101-1 — 10-Institution Discovery Block` (same lane, scaled). Anything else is drift.

## 10-prompt checkpoint (future sprints)

After 10 substantive sprints, produce `STRATEGIC_CHECKPOINT_N.md` with:
- last 10 prompts listed
- did each increase national USCE coverage (yes/no)
- scoreboard before vs now (institutions, packets, classifications)
- verdict: CONTINUE / PIVOT / STOP_DRIFT
- next highest-leverage step

No prompt #11 without this checkpoint.

## Validator-enforced gates (`validate-p101-discovery-command-center.ts`)

- Command center folder + 9 docs/CSVs exist
- Exactly 5 new institution packets in this sprint
- Every packet has `schemaVersion = "p101-0"`
- Every packet has institution name + domain + state
- Every packet has `searchTermsTried` (non-empty) + `pagesOpened` (non-empty) + `finalClassification`
- Every `CURRENT_USCE_CONFIRMED` / `INTERNATIONAL_STUDENT_CONFIRMED` / `IMG_GRAD_OBSERVERSHIP_CONFIRMED` / `VSLO_US_MD_DO_ONLY` packet has at least one `candidateFinding` with `sourceUrl` + `shortQuote` (≤ 240 chars)
- Every `NO_PUBLIC_USCE_LANE_FOUND` packet has `searchTermsTried` ≥ 5 + `pagesOpened` ≥ 1 + a non-empty `stopCondition`
- Every packet has `driftCheck`
- Active runtime files unchanged (`src/data/usce/public-listings.generated.*`, `src/data/usce/public-listings-pilot*.generated.*`, `src/lib/usce-contact-context.ts`)
- Contact resolver unchanged
- Prisma schema unchanged
- No `PUBLIC_NOW` / `IMPORT_READY` tokens outside `NO_` forms
- No banned phrases (`guarantee`, `hospital-approved`, `IMG-friendly`, `apply through USCEHub`) without negation context
- No secret patterns (AIza / AKIA / ghp_ / gho_)

Validator fails → cannot commit.
