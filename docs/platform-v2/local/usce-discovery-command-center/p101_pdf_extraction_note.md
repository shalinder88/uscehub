# P101 — PDF Text Extraction Note

PDFs matter. The verbatim audience / cost / visa / window language at many institutions lives in:

- Fee schedules
- Annual handbooks (e.g., Howard COM Schedules Booklet, Mayo international handbook)
- Visiting-student policy PDFs
- Affiliation-agreement template PDFs
- Department-level rotation packets

The first P101-0 packet (Howard University Hospital) exposed this: the audience paragraph was trapped in a 650 KB PDF that WebFetch could not extract as text. We classified conservatively and queued manual retry rather than fake the quote.

## Tool

`scripts/p101-extract-pdf-text.ts` wraps the system `pdftotext` (poppler) binary.

- Available on this machine at `~/homebrew/bin/pdftotext` and `~/.local/bin/pdftotext`.
- Helper prepends those paths and falls back gracefully if missing.
- Cache directory: `tmp-pdf-cache/` (git-ignored — operator should not commit downloaded PDFs).

Run:

```bash
npx tsx scripts/p101-extract-pdf-text.ts <pdf-url-or-local-path> [outdir]
```

Output:
- Writes `tmp-pdf-cache/<sha1>.pdf` (download cache) and `tmp-pdf-cache/<base>.txt` (extracted text).
- Prints the first 80 lines to stdout so the operator can copy verbatim quotes back into the packet.

## Workflow when a PDF source is encountered

1. Try `WebFetch` first. If it returns clean text, quote from that.
2. If `WebFetch` returns binary content > 100 KB or an explicit PDF MIME hint, run the extraction helper.
3. If extraction succeeds, copy verbatim short quote (≤ 240 chars) into the packet's `candidateFindings[].shortQuote`. Cite the PDF URL as the `sourceUrl`.
4. If extraction fails — image-only PDF, network failure, missing dep — write `pdfExtractionStatus: PDF_EXTRACTION_FAILED_MANUAL_RETRY` in the packet's `searchProcess.robotsOrAccessNotes`, classify conservatively, and add a row to `p101_manual_retry_log.csv`.
5. **Never fake the PDF evidence.** No quote = no claim.

## What is OUT of scope

- No automatic Wayback submission (deferred until evidence we need it).
- No OCR (image-only PDFs are queued for manual retry).
- No browser automation framework.
- No login / CAPTCHA / paywall bypass.
- No credential storage.
- No PDF parsing libraries beyond what `pdftotext` already provides.

## Packet field updates

Packets that consume a PDF source should set:

- `searchProcess.robotsOrAccessNotes`: include a phrase like `"PDF source extracted via pdftotext; tmp-pdf-cache/<sha1>.txt"` for successes, or `"PDF_EXTRACTION_FAILED_MANUAL_RETRY"` for failures.
- `candidateFindings[].sourcePageType`: use `"HANDBOOK_PDF"` or `"FEE_SCHEDULE"` (already enumerated).
- `candidateFindings[].shortQuote`: verbatim ≤ 240 chars from the extracted text.

The P101 validator does not enforce a `pdfExtractionStatus` field directly in this sprint (it would over-couple). The validator continues to enforce verbatim-quote-or-no-claim, which is the real protection: a failed PDF extraction simply means no quote → no `CURRENT_USCE_CONFIRMED` / `INTERNATIONAL_STUDENT_CONFIRMED` / `IMG_GRAD_OBSERVERSHIP_CONFIRMED` / `VSLO_US_MD_DO_ONLY` classification for that finding. The classification falls back to `POSSIBLE_USCE_NEEDS_REVIEW` or `UNKNOWN_NEEDS_RETRY`.
