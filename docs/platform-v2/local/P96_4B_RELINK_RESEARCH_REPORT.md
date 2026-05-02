# P96-4B — relink research report (batch 001)

Generated: 2026-05-02
Branch: `local/p96-2-listing-screenshot-audit`
Batch size: 30 (of 181 questionable rows)

## Headline numbers

| Metric | Count |
| --- | --- |
| Rows researched | 30 |
| Better source URL proposed (REPLACE_SOURCE_URL or REPLACE_BOTH) | 7 |
| Application URL also proposed | 4 |
| Keep current source (false-positive heuristic) | 3 |
| Discard from current wedge (non-target / no-observership) | 14 |
| Needs more research | 5 |
| Keep with caveat | 1 |
| Blocked / CAPTCHA / login wall | 0 |

## Replacement-recommendation distribution

| Recommendation | Count |
| --- | --- |
| REPLACE_BOTH | 4 |
| REPLACE_SOURCE_URL | 3 |
| KEEP_CURRENT_SOURCE | 3 |
| DISCARD_FROM_CURRENT_WEDGE | 14 |
| NEEDS_MORE_RESEARCH | 5 |
| KEEP_WITH_CAVEAT (Banner Tucson) | 1 |

## Confidence distribution

| Confidence | Count |
| --- | --- |
| HIGH | 23 |
| MEDIUM | 2 |
| LOW | 5 |

## Source-quality distribution (proposed)

| Quality | Count |
| --- | --- |
| EXACT_OFFICIAL_PROGRAM_PAGE | 8 |
| OFFICIAL_DEPARTMENT_PAGE_WITH_USCE_TEXT | 3 |
| OFFICIAL_POLICY_PAGE | 2 |
| OFFICIAL_GENERIC_PAGE | 12 |
| OFFICIAL_APPLICATION_PAGE | 1 |
| NO_BETTER_SOURCE_FOUND | 4 |

## Target-fit distribution after research

| Target fit | Count |
| --- | --- |
| TARGET_USCE_MATCH | 11 |
| MAYBE_TARGET_MANUAL_REVIEW | 6 |
| NON_TARGET_BASIC_RESEARCH | 12 |
| DUPLICATE_OR_REPLACED | 1 |

## Successful corrections (high-confidence relinks)

These 7 rows have a strong proposed replacement, ready for the
user to accept in the workbench (no DB write yet):

- **Abington Hospital — Jefferson Health** →
  `jeffersonhealth.org/.../clerkships-observerships-einstein` +
  application PDF.
- **Banner Tucson / U of Arizona** →
  `medicine.arizona.edu/education/degree-programs/md-program/visiting-medical-students`.
- **Baptist Health South Florida** →
  `baptisthealth.net/.../international-observerships` +
  observer-program-application.
- **Barnes-Jewish (WashU)** →
  `md.wustl.edu/curriculum/visiting-students/` +
  `how-to-apply/`.
- **Baylor College of Medicine (general)** →
  `bcm.edu/.../elective-program/visiting-medical-student`.
- **BIDMC** →
  `bidmc.org/medical-education/medical-education-by-department`
  (current source on USCEHub was ECFMG.org — clearinghouse, not BIDMC).
- **Boston Medical Center** →
  `bmc.org/.../physician-recruitment/medical-students` (SVEP) —
  with caveat that international rotations are currently closed.

## False-positive corrections (KEEP_CURRENT_SOURCE)

- **UCLA Health International Physician Observership** + sibling
  UCLA Medical Center listings: their URLs do contain the slug
  `consulting-education-services` which triggered the
  `LIKELY_WRONG_PAGE` heuristic, but the page itself IS the
  canonical observership program page. Heuristic needs a path-text
  re-check rule.
- **Brooklyn USCE** — a third-party USCE broker founded by a
  board-certified hem-onc; the homepage IS the program page, even
  though it lit up as `GENERIC_HOMEPAGE`.

## Discards (reversible)

- 12 postdoctoral / research-fellowship rows (Einstein, Baylor,
  Emory, Harvard, Mayo, Mt Sinai, Northwestern, Stanford, UCSF,
  Michigan, Pittsburgh, Yale). Per the P96 doctrine these are
  basic-science / postdoc and belong on a future research-track
  lane, not the USCE & Match wedge. `futureLaneCandidate =
  research_track`, `canReconsiderLater = true`.
- 2 Advocate Christ rows. Advocate Health Care official policy:
  *"does not provide opportunities for visitors as medical
  observers in its hospitals, clinics or physician offices."*
  Some elective rotations available for non-affiliated students,
  but not observerships. `futureLaneCandidate =
  elective_only_no_observership`.

## Needs more research (5)

- Northwell — wrong page is real, no clean replacement on
  northwell.edu surfaced.
- Clinical Experience Programs (CEP) — third-party broker,
  legitimacy unverified by web search.
- UC Irvine — no IMG-friendly observership page found; current
  Irvine Clinical Experience Program excludes international
  students without SSN.
- Beaumont Hospital (Royal Oak) — only PDF observership applications
  surfaced; site has rebranded to Corewell Health.
- Brookdale University Hospital — current URL is ECFMG.org;
  no Brookdale-specific landing page found.

## Search-term effectiveness

Best-performing query template (used for ~8 of 8 sites where it
worked):

```
site:<official-domain> observership IMG visiting medical student elective
```

When the official site has a real visiting-students program with
its own page, this query finds it on the first page. Examples
where it worked: WashU, Baylor, U of Arizona, Baptist Health South
Florida, BIDMC, Boston Medical Center, Jefferson Health.

When the official site has no such program (Advocate Christ, UC
Irvine for international), the query also surfaces that fact
quickly via the institution's own policy/eligibility pages.

When the institution recently rebranded (Beaumont → Corewell), the
old domain still hosts PDFs but the new domain isn't fully indexed
under the old `site:` filter — manual cross-domain check needed.

## Common patterns observed

1. **Generic homepage ≠ bad listing** — confirmed. ~7/30 had a
   real observership/visiting-students page deeper in the site
   that was easy to find via `site:` search.
2. **ECFMG.org as source is always wrong.** Three rows in batch
   001 had `ecfmg.org` as their `sourceUrl` — that's a
   clearinghouse, not the program. Always replace.
3. **Postdoc and research-fellowship listings dominate the
   "non-target" tail.** 12 of 30 batch-001 rows are research-
   only and should never have been on the USCE & Match wedge.
4. **Some teaching hospitals genuinely do not offer
   observerships.** Advocate Health is a clear example —
   official policy is no observers, electives only via
   non-affiliated-school path. The listing concept itself is
   wrong.
5. **Third-party USCE brokers are real and legitimate.**
   Brooklyn USCE (founded 2017, board-certified faculty) is a
   real program. The classifier shouldn't flag every
   `.com` homepage as junk.

## Feasibility for full 181

Time per row at the current pace was roughly 1 web search + 0–1
fetch + classification = 1–2 min per row of search budget. For
the remaining 151 rows, that's:

- ~12 rows of postdocs / non-target → near-instant doctrine match (~0 search budget)
- ~50 rows of generic-homepage teaching hospitals → ~1 hour
- ~62 rows of deep-path-no-hint → ~1.5–2 hours
- ~23 rows of MAYBE-target → ~1 hour (more nuance)
- ~4 rows of source-dead/PDF → manual web research needed

**Estimated remaining workload: 4–6 batches of 30, or ~3–5 hours
of assisted research.**

The process scales fine if I keep batching at 30/run. Better
discipline: skip doctrine-match rows up-front (don't burn search
on postdocs), and group same-domain rows (so one search covers
multiple listings at the same hospital).

## Recommendation for next batch

P96-4C should pick the next 30 questionable rows by the same
priority order. Based on what's already in the data:

1. Pre-skip rows with non-target keywords
   (postdoc/postdoctoral/PhD/genetics/wet-lab/molecular).
2. Group remaining rows by `host(sourceUrl)` so one
   `site:domain` search informs all sibling listings.
3. Prioritize rows where the institution is well-known (Mayo,
   Cleveland, Hopkins, Cleveland Clinic, etc.) — those reliably
   have official observership pages and score easy wins.

## Hard rules confirmed for this batch

- No push, no PR, no merge, no deploy, no Vercel mutation.
- No schema change, no migration, no `prisma db push`, no seed.
- No DB mutation. No production cron run.
- No public copy/status change. No listing import.
- No P97 discovery execution.
- No credentialed access, no login attempts, no CAPTCHA bypass.
- No screenshot PNGs committed to git.
- All decisions reversible (every DISCARD has a future-lane).

## How the user opens the workbench

```bash
cd /Users/shelly/usmle-platform
python3 -m http.server 8766
# open http://localhost:8766/docs/platform-v2/local/review-workbench/
```

Each of the 30 researched rows now shows a brass-bordered
"P96-4B relink research" panel with the candidate URL,
recommendation, evidence excerpt, and four buttons:
**Accept proposed replacement / Keep current / Discard / Needs
more research**. Clicking a button writes the corresponding
decision into localStorage; nothing hits the DB.

## What experience was actually like

- **Hospital websites were searchable** — `site:domain` queries
  worked on every institution tested. One pass of 8 parallel
  WebSearch calls covered 8 institutions.
- **Official pages did exist for ~7/12 real teaching hospitals**
  in batch 001. The rest either (a) don't run observerships
  (Advocate, UCI for IMGs), (b) recently rebranded (Beaumont),
  or (c) had no clean landing surfaced.
- **Many programs were buried** — but easy to surface with
  `site:` + observership/visiting-student keywords. Without that
  scope filter, generic Google search returned third-party blog
  spam.
- **Generic homepages were mostly salvageable.** The audit's
  GENERIC_HOMEPAGE flag is a real signal that the URL is wrong,
  not a signal the listing is wrong.
- **Best search terms**: `observership`, `visiting medical
  student`, `elective` — those three together hit basically
  every program. `IMG` and `B-1` were rarely indexed by
  hospital websites directly but appear on AMA/ECFMG aggregator
  pages.
- **Institutions that blocked automation**: none in this batch.
  WebSearch + WebFetch worked everywhere. (Live Playwright
  browsing might hit Cloudflare on a few hospitals, but search
  + lightweight fetch did not.)
- **How many of the 181 are likely correctable this way**:
  rough estimate ~80–110 rows get a HIGH-confidence relink,
  ~30–40 rows are non-target and should discard with future-lane,
  ~30–40 rows need true manual review or institutional contact.
