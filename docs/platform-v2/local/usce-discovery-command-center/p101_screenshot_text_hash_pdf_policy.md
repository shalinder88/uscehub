# P101 — Screenshot / Text / Hash / PDF Policy

Operational rules for capturing source-page artifacts in support of the enhanced packet schema.

## Screenshot policy

**Capture screenshots for** (when T7 is mounted):

- The primary candidate source page (institution visiting-students hub).
- Fee or cost page if it lives at a separate URL.
- Application-requirements page if separate.
- International-student page if separate.
- Any page containing explicit exclusion language ("we do not accept...").
- A rendered first-page view of the PDF when the source is a PDF.

**Do NOT screenshot**:
- Every rejected patient/service page.
- Sub-pages without USCE-relevant content.
- Generic department index pages.

**Status enum** in packet `sourceEvidence[].screenshotStatus`:

| Value | Meaning |
|---|---|
| `CAPTURED` | Screenshot saved to T7; path recorded in `screenshotPath` |
| `PENDING` | T7 unmounted or screenshot tool failed; queued for future capture |
| `NOT_APPLICABLE` | Source is text-only (e.g., a quote already captured fully); screenshot not needed |
| `FAILED` | Capture attempted and definitively failed (e.g., page is JS-only and no screenshot tool can render it) |

If `screenshotStatus = "PENDING"`, the packet still ships with quote-based evidence. The screenshot is artifact backup, not the primary source of truth. **Never fake or synthesize a screenshot path.**

## Text policy

For each primary candidate source page in a packet's `sourceEvidence`:

1. Fetch the page via existing `WebFetch` or `scripts/p101-fetch-html.ts`.
2. Strip HTML (scripts, styles, comments, tags) to produce cleaned text.
3. Normalize whitespace (collapse runs of whitespace to single spaces).
4. Save cleaned text to T7 at `/Volumes/T7/USCEHubEvidence/p101/<ST>/<slug>/source-evidence/<sha1-of-url>.txt` if mounted.
5. Record path in `cleanedTextPath` field; record `CLEANED_TEXT_SAVED` source tag.
6. If T7 unmounted: leave `cleanedTextPath: ""`, set `CLEANED_TEXT_PENDING` source tag.

Cleaned text is what the SHA-256 hash is computed over (not raw HTML). This makes the hash stable against cosmetic HTML changes (whitespace, classnames) while sensitive to actual content changes.

## Hash policy

For every primary source page:

1. After cleaning the text per the Text Policy, compute `SHA-256(cleanedText)` as lowercase hex.
2. Record the hash in two places:
   - `sourceEvidence[].cleanedTextHash` for the per-source-page record
   - `changeDetectionPrep.sourceHash` for the packet's primary-source-of-truth hash (typically the institution hub page)
3. Record `HASH_CAPTURED` in `opportunityTags.source`.

The hash is captured even when T7 is not mounted — the hash itself fits in the packet JSON as a 64-char string. Hashes are the cheapest possible change-detection mechanism.

## PDF policy

If the official source is a PDF (handbook, fee schedule, policy document):

1. Use `scripts/p101-extract-pdf-text.ts <pdf-url>` to download + extract text via the system `pdftotext` (poppler) binary already installed at `~/homebrew/bin/`.
2. The helper writes:
   - `tmp-pdf-cache/<sha1>.pdf` (downloaded PDF)
   - `tmp-pdf-cache/<sha1>.txt` (extracted text)
3. Read the extracted text and quote verbatim into `fieldQuoteMap`. Cite the PDF URL as `quoteUrl`.
4. Record:
   - `sourceEvidence[].pdfPath` = `tmp-pdf-cache/<sha1>.pdf` (or T7 path if mounted)
   - `sourceEvidence[].pdfExtractionStatus` = `"EXTRACTED"`
   - `opportunityTags.source` includes `"PDF_SOURCE"`

If extraction fails (image-only PDF, network error, dependency missing):
- `pdfExtractionStatus: "FAILED_MANUAL_RETRY"`
- Add a row to `p101_manual_retry_log.csv` with `retry_reason: "PDF_EXTRACTION_FAILED"`
- Conservatively classify the affected `fieldQuoteMap` fields as `NOT_STATED_ON_SOURCE`
- **Never fake the PDF quote.**

When T7 is mounted, move the downloaded PDF from `tmp-pdf-cache/` to `/Volumes/T7/USCEHubEvidence/p101/<ST>/<slug>/source-evidence/<sha1>.pdf` and update `pdfPath`. `tmp-pdf-cache/` is gitignored (or unstaged — until a future authorized sprint adds an entry, the operator must not commit it).

## What is forbidden across all four policies

- No CAPTCHA / login / paywall / 2FA bypass.
- No credentials stored or printed.
- No proxy / Tor / IP rotation to bypass bot blocks (use the existing `p101-fetch-html.ts` helper's UA-retry only).
- No fake artifact paths in packet JSON. If the file does not exist, the path is `""` and the status is `PENDING`.
- No oversized binaries committed to git. The validator scans the command-center folder for files > 100 KB or with binary-suspect extensions and fails the commit.

## Status enum reference (consolidated)

| Field | Enum |
|---|---|
| `screenshotStatus` | `CAPTURED \| PENDING \| NOT_APPLICABLE \| FAILED` |
| `cleanedTextPath` | filesystem path or `""` |
| `pdfExtractionStatus` | `EXTRACTED \| NOT_APPLICABLE \| FAILED_MANUAL_RETRY \| DEFERRED` |
| `cleanedTextHash` | SHA-256 lowercase hex or `""` |
| `changeRisk` (in `changeDetectionPrep`) | `LOW \| MEDIUM \| HIGH` |
