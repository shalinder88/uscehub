# P96-4B — assisted official-source relink research (plan)

Goal: do an assisted research pass over the 181 questionable rows
from the P96-3 audit, finding better official source/application
URLs where possible, before any DB mutation.

## Scope rules

- No DB mutation. No production cron. No deploy. No PR. No push.
- No login, no CAPTCHA bypass, no paywalled scraping.
- Search results are leads only — final proposed URLs must be
  official institution/program pages, with a documented exception
  for legitimate third-party USCE brokers (e.g. Brooklyn USCE).
- Screenshots stay local-only and gitignored.
- Decisions are reversible: every `DISCARD_FROM_CURRENT_WEDGE` row
  carries a `futureLaneCandidate` so the row can come back later.

## Method (per row)

1. Read `currentSourceUrl` + audit verdict + target-fit reason.
2. If the row's title/keywords match the **non-target caution
   list** (postdoc, PhD-required, basic science, wet lab, etc.),
   skip detailed search and recommend
   `DISCARD_FROM_CURRENT_WEDGE` with `futureLaneCandidate` =
   `research_track`. Reversible.
3. Otherwise, run `site:<official-domain> observership IMG visiting
   medical student elective` (and variants) via web search.
4. Open the top 1–3 candidate URLs. Verify keyword presence
   (observership, IMG, visiting student, elective, B-1, etc.).
5. Classify the candidate against the source-quality + target-fit
   + confidence + replacement-recommendation taxonomies.
6. Record evidence text (page excerpt + search terms tried).

## Outputs

- `docs/platform-v2/local/p96_4b_batch_001_input.csv`
  Top-30 prioritized rows from the 181.
- `docs/platform-v2/local/p96_4b_relink_candidates.csv`
  One row per researched listing with full classification.
- `docs/platform-v2/local/p96_4b_relink_research_log.csv`
  Per-search log (query, URL, result, timestamp).
- `docs/platform-v2/local/p96_4b_no_better_source_found.csv`
  Subset where no good URL surfaced + recommended next step.
- `docs/platform-v2/local/review-workbench/review-data.json`
  Patched in-place — every researched item gets a `relink`
  block (candidateSourceUrl, sourceQuality, confidence,
  replacementRecommendation, evidenceText, etc.).
- `docs/platform-v2/local/review-workbench/index.html`
  Adds a P96-4B relink panel per row + 4 buttons:
  Accept / Keep current / Discard / Needs more research.
- `scripts/p96-4b-relink-research.ts`
  Idempotent generator script (decisions hand-curated from the
  research session).

## Prioritization order (within the 181)

1. `LIKELY_WRONG_PAGE` (3)
2. `SOURCE_DEAD_REVIEW` (4)
3. `GENERIC_HOMEPAGE` (106)
4. `DEEP_PATH_NO_HINT` (62)
5. `MAYBE_TARGET_MANUAL_REVIEW` (23)
6. `UNKNOWN` (3)
7. Other `MANUAL_REVIEW`

Batch 001 takes the top 30 by this ranking — 3 wrong-page +
2 source-dead + 25 generic-homepage. This is enough to test the
workflow and produce a representative distribution before scaling.

## Hard rules confirmed

No push. No PR. No merge. No deploy. No Vercel mutation. No
`.vercel/project.json` edit. No schema/migration. No
`prisma db push`. No seed. No DB mutation. No production cron run.
No public copy/status changes. No listing import. No P97 new-discovery
execution. No credentialed access. No login attempts. No CAPTCHA
bypass. No paywalled/login-required scraping. No aggressive crawling.
Do not auto-edit listing URLs. Do not delete/hide/discard listings.
Do not silently discard anything. Screenshot evidence stays local-only
and gitignored. Do not commit screenshot PNGs.
