# P96-3 / P96-4A — Local evidence review workbench (full 304)

Local-only static review tool. **No production route. No DB
mutation. No deploy.** Lets you walk through the questionable
listings surfaced by the P96-2 / P96-2B / P96-3 audits, view both the
USCEHub-side and official-source screenshots, and record a
**KEEP / KEEP_WITH_CAVEATS / MODIFY / DISCARD / NEEDS_MORE_RESEARCH**
decision per row. Exports the decisions as CSV or JSON for the
next step (P96-4B will turn those exports into an actionable
re-link / modify / discard queue).

## 1. Files in this folder

| File | Purpose |
| --- | --- |
| `index.html` | The static review UI. No external CDN; pure HTML + CSS + JS. |
| `review-data.json` | Auto-generated from the audit CSVs. Lists every questionable row. |
| `decision-template.csv` | Empty CSV with the export schema, for reference. |
| `README.md` | This file. |

`index.html` reads `review-data.json` via `fetch()` at runtime, so
the workbench needs to be loaded over HTTP (not `file://`) to avoid
CORS errors in modern browsers. The local-server commands below
handle that.

## 2. How to open

The workbench's `<img>` tags reference screenshots at paths like
`../../../../docs/platform-v2/local/screenshots/...` because the
HTML lives at `docs/platform-v2/local/review-workbench/index.html`
and screenshots live under `docs/platform-v2/local/screenshots/`.
Serve from the **repo root** so those paths resolve:

```bash
cd /Users/shelly/usmle-platform
python3 -m http.server 8766
```

Then open:

```
http://localhost:8766/docs/platform-v2/local/review-workbench/
```

(Don't open the file directly with `file://` — `fetch()` will fail.)

## 3. Regenerating the data

When the audit CSVs change (e.g. after a fresh `--n 25` capture or
target-fit re-classification), regenerate:

```bash
cd /Users/shelly/usmle-platform
npx tsx scripts/p96-build-review-workbench.ts
```

For the full 304-listing audit:

```bash
npx tsx scripts/p96-build-review-workbench.ts \
  --input docs/platform-v2/local/p96_3_full_304_listing_audit.csv
```

The generator script:
- reads the audit CSV passed via `--input` (default: P96-2 25-row sample)
- includes only rows with at least one review trigger
  (`GENERIC_HOMEPAGE`, `LIKELY_WRONG_PAGE`, `DEEP_PATH_NO_HINT`,
  `MAYBE_TARGET_MANUAL_REVIEW`, `WRONG_PAGE_REPLACE`,
  `NEEDS_BETTER_SOURCE`, `SOURCE_DEAD_REVIEW`, `MANUAL_REVIEW`,
  `excludeFromCurrentWedge=true`)
- writes a fresh `review-data.json`
- never touches the DB or the screenshot folder

## 4. How decisions are saved

The browser saves every decision in `localStorage` under the key
`p96-4a-decisions-v1`. Decisions persist across reloads in the same
browser. They are **not** synced anywhere automatically.

To capture decisions on disk, click **Export JSON** or
**Export CSV** in the bottom action bar. Both downloads land in the
browser's download folder; copy them to
`docs/platform-v2/local/review-workbench/decision-export.json`
(or `.csv`) for Claude / scripts to ingest later.

To clear all decisions, click **Clear decisions** (destructive,
prompts for confirmation).

## 5. Decision values

| Decision | Meaning |
| --- | --- |
| `KEEP` | Listing appears target-relevant and source is acceptable. No change needed. |
| `KEEP_WITH_CAVEATS` | Listing likely belongs, but source / fields / description need a caveat or future recheck. Add a caveat text + optional recheck date. |
| `MODIFY` | Keep the listing but fix the source URL, application URL, fields, or description. Add new URLs + modify instructions + priority. |
| `DISCARD` | Remove from current USCE & Match wedge after explicit user approval. **Does not delete now.** Adds a discard reason + future-lane candidate + canReconsiderLater flag. |
| `NEEDS_MORE_RESEARCH` | Don't decide yet. Add a research question, suggested search terms, and (if known) a suspected correct source. |

The workbench shows a **suggested decision** per row based on the
audit verdict + recommended action, but you make the actual call.

## 6. Filters and search

Sidebar filters:
- **Search** — title, source URL, audit notes, why-needs-review.
- **Verdict filter** — `LIKELY_WRONG_PAGE`, `GENERIC_HOMEPAGE`,
  `DEEP_PATH_NO_HINT`, `PATH_HINTS_PROGRAM`, `SOURCE_DEAD`.
- **Target-fit filter** — `MAYBE_TARGET_MANUAL_REVIEW`, the four
  `NON_TARGET_*` buckets.
- **Decision filter** — undecided, decided, or any specific
  decision value.

## 7. Export schemas

Both exports cover the same fields:

```
itemId, listingIdOrSlug, title, institution, sourceUrl,
applicationUrl, sourceVerdict, targetFit,
originalRecommendedAction, userDecision, newSourceUrl,
newApplicationUrl, modifyInstructions, caveatText, discardReason,
futureLaneCandidate, canReconsiderLater, priority,
needsFutureRecheckDate, researchQuestion, suspectedCorrectSource,
reviewerNotes, decidedAt
```

## 8. What happens with exported decisions later

These exports are **inputs** for the next pipeline step. Nothing
in the workbench writes to the DB or to live listings. Specifically:

1. **Admin re-link UI (future P96-4B / a small admin PR):**
   `MODIFY` rows with a `newSourceUrl` become an actionable
   admin-side queue. The admin clicks through and saves the new
   URL via the existing `Listing` PATCH path.
2. **DB patch script (after explicit approval):** for bulk
   `MODIFY` updates, an opt-in script consumes the JSON export
   and writes one row at a time, logging to `AdminActionLog`.
3. **P96-3 full audit:** the workbench scales — `--n 304` would
   regenerate `review-data.json` with all 304 listings, and the
   same UI handles the larger queue.
4. **P97 candidate review:** P97's discovery pipeline produces an
   equivalent JSON shape; the workbench can reuse the same
   `index.html` against a different `review-data.json`.

## 9. Hard rules

- No DB mutation by the workbench or its generator.
- No production route, no `/admin/*` exposure.
- No auth changes.
- No public copy / status changes.
- Screenshots remain local-only; the screenshots folder is
  gitignored.
- Decisions are reversible until they are explicitly applied to
  the DB by a separate, opt-in tool.
- Workbench is loaded over `http://localhost:*` only — never
  served from production.
