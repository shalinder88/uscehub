# Queue 4 — Validation and Scoring Plan

## What artifacts each screened row must produce

For every Session-1 row, the screening sprint must produce — or document the absence of — each of the following on disk:

| Artifact | Path pattern | When required |
|----------|---------------|---------------|
| HTML snapshot | `docs/platform-v2/local/usce-completeness/queue-4-session-1-screening/html-snapshots/<slug>.html` | Always (or `N_A_NO_PROGRAM` if no visiting-MS lane) |
| PNG screenshot | `…/screenshots/<slug>-source.png` | Always when HTML snapshot exists |
| Wayback URL | recorded in archive-manifest CSV | Always when source page is publicly accessible |
| Verbatim quote | `…/quotes/<slug>-quote.txt` | Always when source supports a card |

Quote requirements:
- 1–4 short verbatim excerpts, each ≤ 280 chars.
- Each excerpt directly supports either eligibility, application path, fee/cost, visa, or site scope.
- Quote file MUST be under 280 chars per excerpt; total file under 4 KB.

PNG capture method (validate-no-secrets-friendly):
- Use headless Chrome `--screenshot` against the local fetched HTML, NOT against a live URL with embedded `<script>` / `<iframe>` Google Maps keys (the Mount Sinai incident pattern).
- If a Wayback HTML must be captured verbatim, run the new `scripts/validate-no-secrets.ts` against the captured HTML before staging.

## How to classify each screened row

| Final classification | Conditions |
|----------------------|------------|
| **TIER_A_PLUS_BRIDGE_INPUT_READY** | All 4 evidence artifacts present + audience explicit + application explicit + caveat-stack matches Slice-1/2 pattern |
| **TIER_A_PLUS_PARTIAL** | 4 artifacts present but quote rated `PARTIAL` for audience / application / cost — eligible for evidence-hardening retry |
| **TIER_A_NO_ARCHIVE** | HTML + PNG + quote present but Wayback save failed — re-attempt in evidence-hardening sprint |
| **NEEDS_EVIDENCE_HARDENING** | One or more artifacts blocked (bot defense / 403 / CAPTCHA) — re-attempt with Wayback fallback |
| **WRONG_LANE_RECLASSIFY_TO_FUTURE** | Source page is residency / fellowship / GME / observership-only, not visiting-MS — move to future-lane |
| **KEEP_INTERNAL** | No public visiting-MS lane found, OR source contradicts public-copy framing |
| **CARIBBEAN_NAMED_PARTNER_ONLY** | Source explicitly limits to one or two Caribbean schools — note for separate Caribbean lane sprint |

## Bridge-input readiness gate

A row is **bridge-input-ready** only if all of the following are true:

1. `evidence_status = EVIDENCE_TRIPLE_COMPLETE` (HTML + PNG + Wayback + quote on disk).
2. Audience is explicit per source: at least `us_md_do = ELIGIBLE_EXPLICIT` and a verbatim quote supports it.
3. Application method is named (VSLO / SOM-Registrar / mailto / form).
4. No banned phrase in source-derived public-copy draft.
5. Source scope is either site-level or system-level WITH an explicit `SYSTEM_PAGE_SOURCE_NO_<SITE>_SPECIFIC_GUARANTEE` caveat.

If any of those is missing, the row is NOT bridge-ready. It can still be staged with a clear caveat and an explicit "needs hardening" note, but it cannot be promoted to active in a slice.

## When to stop a row

- **No public visiting-MS lane found** within 15 minutes of searching → `KEEP_INTERNAL`.
- **Source returns 403 / CAPTCHA on first attempt** → fall back to Wayback. If Wayback also fails or has no usable snapshot → `NEEDS_EVIDENCE_HARDENING`.
- **Source is residency / fellowship / GME** → `WRONG_LANE_RECLASSIFY_TO_FUTURE`.
- **Source contradicts our prior public-copy framing** → `KEEP_INTERNAL` and document.

## Per-session row count

- **Session 1: exactly 25 rows.** Set in this sprint.
- **Session 2: exactly 25 rows.** Picked from the remaining 75 in the 100-row queue, post-Session-1 yield analysis.
- Future sessions: TBD based on funnel narrowing rates.

## Commit cadence per screening sprint

- One commit per session (not per row).
- Stage only the session's docs folder + new evidence artifacts.
- No active runtime change in screening sprints.
- No staged-batch change in screening sprints.
- Evidence-hardening + bridge-validation are SEPARATE sprints downstream.

## Hard rules during screening

- No auto-publication.
- No runtime change during screening.
- No production deploy.
- No env-flag flip.
- No automated FREIDA / ACGME / AAMC scraping.
- No login / CAPTCHA bypass.
- No PNG that contains a third-party API key (Mount Sinai incident pattern) — run `validate-no-secrets.ts` after capture.
- No commit until that sprint's mini-validator passes.

## Mini-validator for screening sessions

A future `scripts/validate-p97-queue-4-session-N.ts` should verify:
- Each session row has either an evidence triple on disk OR a documented stop_condition.
- No banned phrase in any quote file.
- No `AIza[…]{20,}` or other credential pattern in any captured HTML.
- No staged or active runtime mutation.
- No app code changed.

This is added in the screening session sprint, not in this resume sprint.
