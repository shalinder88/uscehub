# Cron Extractor — Proposal (deferred from session F-series)

**Status:** DRAFT · awaiting Shelly's review before any code lands
**Created:** 2026-05-28
**Trigger:** User session item #9: *"we still need better cron (we already have an extraction system that walks 1-by-1 institution website, need that cron system to go and find more valid USCE opportunities)"*

---

## What we have today

| Piece | Where | What it does |
|---|---|---|
| **Manual 1-by-1 walker** | `scripts/gap-*.ts` (one script per gap candidate) | Confirms a candidate program exists, fetches the source page via WebFetch, extracts facts, builds an INSERT payload, runs it. Used in G0 final-sweep #4 to add UC Davis SOM / DGSOM UCLA / UPSOM INTL. |
| **Per-row audit data** | `Listing.auditData` (Json column, P49b) | Stores `page_excerpts`, `audience_evidence`, `signals_detected` from a previous one-shot scrape pass. Drives the "VERIFIED SOURCE" callout on /listing/[id]. |
| **Truth-layer adapter** | `src/lib/p102-display-eligible-listings.ts` | Read-only allowlist of programs the operator has display-approved. Now decoupled from /browse (Step 1) but still used to enrich cards with `sourceBadge` + `specialtyLimited`. |
| **Listing schema** | `Listing.linkVerified`, `linkVerificationStatus`, `lastVerifiedAt` | Per-row verification timestamps. Cron exists to re-verify existing rows but does **not** discover new candidates. |
| **Verified-preview admin queue** | `src/app/usce/verified-preview/*` | Operator UI for reviewing display-eligibility decisions on rows already in the DB. |

## What's missing

A **discovery cron**: a scheduled job that takes a known institution list, walks each institution's site for new USCE-relevant pages (observership / clerkship / visiting student / research), and proposes them to an admin queue for review — without ever auto-inserting into the public directory.

This is what G0 final-sweep #4 did **manually** (3 inserts). Automating it is the path to thousands of programs without operator effort scaling linearly.

---

## Proposed architecture

### Three components

1. **Crawler** (`scripts/crawler/walk-institution.ts`)
   - Input: institution domain (e.g. `health.ucdavis.edu`) + a list of seed-paths known to host USCE pages (`/mdprogram/registrar/`, `/medstudentaffairs/visiting-students/`, etc.)
   - Behavior: BFS up to depth 3 from each seed, follow same-domain links only, respect robots.txt, throttle to 1 req/sec/domain, log every URL fetched
   - Output per page: `{ url, http_status, title, page_text, found_keywords[], confidence_score }`
   - Confidence scoring (rule-based, no ML): presence of "observership", "clerkship", "VSLO", "visiting student", "ECFMG", "USMLE Step", "$X application fee" boosts the score; presence of "residency program", "match day", "PGY-" lowers it (those are post-match pages, not USCE)

2. **Candidate queue** (`prisma.candidateProgram` — new table)
   ```prisma
   model CandidateProgram {
     id              String   @id @default(cuid())
     institution     String   // "UC Davis School of Medicine"
     url             String   @unique
     title           String?  // <title> from the page
     confidenceScore Int      // 0-100
     foundKeywords   String[] // ["observership", "VSLO", "$300"]
     pageExcerpt     String?  // first ~500 chars after first useful header
     status          CandidateStatus @default(PENDING_REVIEW)
     adminNotes      String?
     listingId       String?  // populated if/when admin promotes to a Listing
     createdAt       DateTime @default(now())
     reviewedAt      DateTime?
     reviewedBy      String?
   }
   enum CandidateStatus {
     PENDING_REVIEW
     APPROVED_INSERTED
     REJECTED_NOT_USCE
     REJECTED_DUPLICATE
     NEEDS_MORE_INFO
   }
   ```

3. **Admin queue UI** (`/usce/candidates` — new admin route)
   - Lists PENDING_REVIEW candidates sorted by confidence desc
   - Each row shows: institution, URL, title, page excerpt, found-keywords
   - Three buttons: **Insert as Listing** (opens a pre-filled new-listing form), **Reject — not USCE**, **Reject — duplicate**
   - Search-by-institution + filter-by-status

### Cron schedule

- Run once per week (Sundays 03:00 UTC) via Vercel Cron — `vercel.json` `crons` array
- Each run picks **5 institutions** (round-robin from a fixed list of ~50 medical schools + ~30 hospital systems we want to track) so the crawl never thunders a single domain
- Hard cap: 500 URLs per run total → predictable cost + zero risk of hammering Cloudflare-protected sites
- Builds candidates into the queue, **never** auto-inserts into `Listing`

### Dedup against existing rows

Before inserting into `CandidateProgram`:
1. Normalize the URL (drop query string, trailing slash, www prefix)
2. Lookup `Listing.sourceUrl` for any match (exact or normalized) → if found, skip with `status = REJECTED_DUPLICATE` and `listingId = <match>`
3. Check `Listing.title` fuzzy match (case-insensitive substring) against institution name → if match within same domain, also skip as duplicate

---

## Failure modes I want operator approval on

| Risk | Mitigation |
|---|---|
| Institution blocks the crawler (Cloudflare / 403 / robots.txt) | Crawler logs the 403, marks the URL as `BLOCKED` in a separate diagnostic table, does NOT retry until manually re-queued |
| Page is JS-rendered (e.g. SPA) and crawler sees empty body | Diagnostic: flag URLs where `<body>` text is < 200 chars. Manual rewalk via Chrome MCP. |
| False positives (page matches keywords but isn't actually a USCE program — e.g. a residency match-day announcement) | Admin queue catches it. Confidence score helps but admin always has final say. |
| False negatives (real USCE pages with non-standard wording) | Periodic keyword expansion based on pages that admin had to manually find. |
| Crawler hitting paywalls / login walls | Logged. Skipped. No further attempt. |

---

## Cost & timeline estimate

- **Schema migration:** 1 day (new `CandidateProgram` table + enum + index)
- **Crawler core:** 2-3 days (fetcher with throttling, BFS, robots.txt, scorer)
- **Admin UI:** 2 days (`/usce/candidates` list + detail + 3 actions)
- **Vercel cron wiring:** 0.5 day
- **First-pass crawl + manual queue review:** 1-2 days (operator time, not engineering)
- **Total engineering:** 5-7 days. Total elapsed: 1-2 weeks including review cycles.

---

## What I am **not** proposing

- Automatic insertion into public `Listing` table (everything goes through admin queue)
- Crawling institutions outside the seed list (no open-web spider)
- Any ML or LLM in the discovery loop (rule-based scorer only; LLM extraction stays for per-row enrichment which is a separate pipeline)
- Replacing the existing `auditData` per-row enrichment cron (this is additive)

---

## Next steps (when ready)

1. Shelly reviews this proposal, says "go" or proposes changes
2. I draft the `CandidateProgram` migration + write the seed-paths config for the first 5 institutions to test
3. Run the crawler manually against those 5, review the candidates, calibrate the scorer
4. Wire up `/usce/candidates` admin UI
5. Schedule the Vercel cron
6. Watch the queue for 2 weeks before adding more institutions

Until that go-ahead, **no code changes** for this item. All current UI/cream-cascade work continues unblocked.
