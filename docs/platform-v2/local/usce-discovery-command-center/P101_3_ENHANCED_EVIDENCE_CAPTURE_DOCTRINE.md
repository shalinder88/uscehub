# P101-3 — Enhanced Evidence Capture Doctrine

**Date:** 2026-05-11
**Sprint:** P101-3
**Pre-sprint HEAD:** `951ae8d` · **Production main:** `739ab1e` — UNCHANGED

---

## 1. Why classification packets are not enough

P101-0/-1/-2 produced 40 institution packets across 15 states, each classified into one of 13 enum values and tiered B/C. That proved the operating discipline (one institution at a time, verbatim quote or no claim, drift checks). But classification alone cannot power what USCEHub must eventually show users:

- "Show me 4-week IM electives accepting IMG graduates with B-1/B-2 visa under $4,000"
- "What changed at Mayo's visiting program this quarter?"
- "Why did we classify Stanford this way?"
- "Show the source page that backed the cost claim"
- "Alert me when UPMC's international window opens"

The P101-0 packet shape can't answer any of those. Each packet stored ~3 candidateFindings with one shortQuote each — enough to *classify* the lane, not enough to *power* the moat.

## 2. What data future users need

Listing pages, filters, comparison tables, alerts, and the "How we know this" trust panel all need:

- **Field-level evidence**: every claim (cost, audience, visa, duration, application) tied to its own verbatim quote and source URL, with `NOT_STATED_ON_SOURCE` as a first-class option when the source is silent.
- **Normalized tags**: canonical strings for `audience`, `application`, `experienceType`, `cost`, `visa`, `source` that power filters without LLM re-classification.
- **Artifact backup**: cleaned page text + SHA-256 hash + screenshot of the source page at capture time, so that future change-detection ("the page changed; re-review") works deterministically.
- **User-facing summary draft**: 1-sentence summary, who-this-is-for / who-this-is-not-for, key caveats, source transparency note — ready to render but not yet published.
- **Change detection prep**: source hash, first-captured-at, next-recheck-due, expected change risk — the metadata needed for a re-verification cron.

## 3. Field-level quote-or-no-claim rule

Every field in `fieldQuoteMap` must satisfy one of two states:

1. `value` is a real claim AND `quote` is a verbatim string ≤ 240 chars from the source page named by `quoteUrl`, AND `notStatedOnSource = false`.
2. `notStatedOnSource = true`, `value = "NOT_STATED_ON_SOURCE"`, `quote = ""`.

There is no third state. No "probably". No "likely". No "implied". This is the same discipline as P101-0; we are extending it from 1 quote per packet to ~20-30 quotes per packet.

## 4. T7 artifact storage policy

Preferred root: `/Volumes/T7/USCEHubEvidence/p101/<STATE>/<institution-slug>/`

Storage layout per institution:
```
/Volumes/T7/USCEHubEvidence/p101/<ST>/<slug>/
├── source-evidence/
│   ├── <sha1-of-url>.html            (raw HTML, when safe)
│   ├── <sha1-of-url>.txt             (cleaned text)
│   ├── <sha1-of-url>.png             (screenshot)
│   └── <sha1-of-url>.pdf             (when source is a PDF)
├── artifacts.json                     (per-institution artifact index)
└── source-hashes.txt                  (running list of SHA-256 hashes)
```

If `/Volumes/T7` is NOT mounted at sprint time, mark `T7_ARTIFACT_STORAGE_PENDING` in:
- the packet's `sourceEvidence[].screenshotStatus`, `cleanedTextPath`, `pdfPath` fields
- the `p101_artifact_manifest.csv` row's `storedOnT7` column
- `p101_t7_storage_status.md`

Never commit large screenshots/PDFs/HTML to git. The repo's role is the *index*: packet JSON + manifest CSV + hashes + paths. T7's role is the *blob storage*.

## 5. Screenshot policy

**Capture screenshots for** (when T7 is available):
- The candidate source page (main hub).
- Fee/cost page if separate.
- Application requirements page if separate.
- International-student page if separate.
- Any page with explicit exclusion language ("we do not accept...").
- A rendered PDF if the source is a PDF.

**Do NOT screenshot** every rejected patient/service page. The validator does not require screenshots for `rejectedPages` — those are URL+title+reason rows only.

**Pending policy**: if T7 is not mounted or screenshot tool fails, set `screenshotStatus: "PENDING"` and `screenshotPath: ""`. Do not synthesize, do not fake. The packet still ships with quote-based evidence; screenshot is artifact backup, not the source of truth.

## 6. PDF policy

If the official source is a PDF (handbook, fee schedule, policy doc):
1. Save the PDF to T7 if mounted.
2. Run `scripts/p101-extract-pdf-text.ts <url>` to get cleaned text into `tmp-pdf-cache/`.
3. Quote verbatim from the extracted text into `fieldQuoteMap`.
4. Record the PDF path and `pdfExtractionStatus = "EXTRACTED"`.

If extraction fails:
- `pdfExtractionStatus: "FAILED_MANUAL_RETRY"`
- Add a row to `p101_manual_retry_log.csv`
- Classify the affected fields conservatively (likely `NOT_STATED_ON_SOURCE` until retry succeeds)
- Never fake the quote.

## 7. Cleaned text + SHA-256 hash policy

For every primary source page in a packet's `sourceEvidence`:
- Save cleaned text (HTML stripped, scripts/styles removed, whitespace normalized) when T7 mounted.
- Compute SHA-256 of the cleaned text and record as `cleanedTextHash` in the `sourceEvidence` entry AND as `sourceHash` in `changeDetectionPrep`.
- Record path in `cleanedTextPath` if file is on T7; empty string + `CLEANED_TEXT_PENDING` tag if not.

Hashes are how the future re-verification cron decides "did this page change". They are cheap to compute (one operation) and produce maximum value for change-detection. They should be captured even when T7 is not mounted — the hash itself fits in the packet JSON.

## 8. Opportunity tag taxonomy

See `p101_tag_taxonomy.md` for the canonical enum lists across `audience`, `application`, `experienceType`, `cost`, `visa`, `source`. The packet's `opportunityTags` block must reference only these canonical strings. The validator enforces.

## 9. User-facing summary draft policy

Every retrofitted packet must populate `userFacingSummaryDraft`. This is **draft content for future rendering** — not auto-published. It's what a user would see on a Tier-A listing page if the row were promoted. Required fields:

| Field | Length / type |
|---|---|
| `oneSentenceSummary` | ≤ 180 chars |
| `whoThisIsFor` | 1-2 sentences pointing at audience quote(s) |
| `whoThisIsNotFor` | 1-2 sentences pointing at exclusion quote(s) |
| `howToApply` | verbatim application pathway summary |
| `estimatedCostSummary` | verbatim cost summary or "cost not stated by source" |
| `keyCaveats` | array of caveat strings |
| `whyWeClassifiedItThisWay` | 1-2 sentences pointing at determining quotes |
| `sourceTransparencyNote` | "Verified at [source URL] on [date]" |
| `possibleListingTitle` | proposed listing title (e.g., "International Visiting Medical Students at UAB Hospital") |
| `possibleMetaDescription` | ≤ 160 chars |
| `suggestedFilters` | tags that would help users find this listing |

The draft is **not** itself a claim — it is a structured summary backed by the `fieldQuoteMap` quotes already in the packet. Drift check: every assertion in the user-facing draft must be traceable to a `fieldQuoteMap` entry.

## 10. Negative evidence policy

Negative evidence (what we searched but didn't find) is first-class. Required fields in `negativeEvidence`:
- `noPublicLaneReason`: required when `finalClassification = NO_PUBLIC_USCE_LANE_FOUND`
- `searchedTerms[]`, `pagesOpened[]`, `rejectedPages[]`, `rejectedReasons[]`
- `whetherNegativeEvidenceStrong`: `STRONG | WEAK | NONE`
- `futureRetrySuggestion`: what to try next sprint

Negative evidence shapes the dataset's *completeness layer* — the "we checked these 47 children's hospitals; 41 have no public USCE pathway" moat I described in earlier strategic memos.

## 11. Change detection prep

Every retrofitted packet must populate `changeDetectionPrep`:
- `sourceHash`: SHA-256 of the primary source page text
- `firstCapturedAt`: ISO timestamp
- `nextRecheckDue`: ISO timestamp = firstCapturedAt + 90 days
- `fieldsLikelyToChange`: which fields the operator expects could drift (e.g., `["cost_application_fee", "application_window", "deadline"]`)
- `changeRisk`: `LOW | MEDIUM | HIGH`

Future P102+ cron: every `nextRecheckDue` row re-fetches the source, recomputes the hash, and surfaces drift to `/admin/freshness`. The cron does not exist yet — but the prep does.

## 12. What gets committed to git vs stored on T7

| Stored in git (repo) | Stored on T7 (large/binary) |
|---|---|
| Packet JSON (with enhanced fields) | Raw HTML files |
| Artifact manifest CSV | Cleaned text files |
| Source hashes (as strings) | PDF binaries |
| Paths to T7 artifacts | Screenshot PNG/JPEG |
| Classification + tier | (Optional) Wayback snapshot HTML |
| All docs / policy / spec | |

A repo file is "safe to commit" if it is text-only, under ~100 KB, and contains no secrets. Anything else goes to T7 with a path reference in the packet.

## 13. What does NOT happen in this sprint

- No new institution discovery block (no Queue 4 rank 70+ searches).
- No 304 DB triage.
- No Prisma schema. No migration. No DB. No `Institution` model. No seed.
- No noindex activation. No staged runtime. No static pilot expansion.
- No contact/report mapping. No homepage. No UI. No SEO/sitemap/nav changes.
- No production deploy. No PR. No merge. No main push. No force-push.
- No broad crawler. No Wayback automation (Wayback paths recorded if trivial; no automation).
- No fake quotes. No fake screenshots. No fake PDF extraction. No bypass.

## 14. How this supports the moat

Each retrofitted packet becomes a reusable evidence asset:
- A listing page renders the packet directly (one row → one rich page).
- A filter "show all $5,000+/4-week international electives" hits `opportunityTags.cost = ["HIGH_COST"] ∩ opportunityTags.audience = ["INTERNATIONAL_MS"]` — no LLM re-classification.
- A change-detection cron re-hashes the source URL; if hash differs, the listing's confidence drops to "may have changed" until human re-review.
- A "How we know this" panel renders the `fieldQuoteMap` quotes directly with their source URLs.
- A comparison table joins on canonical tags across institutions.
- A "negative evidence" surface tells users "we checked these N institutions in this state; here's what we found and what's not available."

The 40 P101 packets contain the data — but in P101-0 shape, the data is not addressable. P101-3 makes it addressable. After P101-3, future sprints can scale (P101-4 = next 25-institution block using p101-3 schema; P101-5 = full-state CA; eventually DB triage with rich comparison).

## 15. Plain English

We already proved we can create source-linked packets. P101-3 makes each packet rich enough to later power: a real listing page, filter dropdowns, summary cards, change alerts, and a transparent "how we know this" panel. We're not making more packets in this sprint. We're making the existing 10 highest-value packets *deep* — and writing down the rules so every future packet is born deep.
