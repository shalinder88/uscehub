# P102 Live Site Cross-Check

Generated: 2026-05-16  
Branch: `local/p102-live-site-crosscheck-exact-links`  
Live: `https://uscehub.com` · Preview: `http://localhost:3000/usce/verified-preview`

---

## 1. Live homepage (uscehub.com)

**Headline copy** (meta description, from live HTML):
> "Search observerships, externships, research roles, and postdoc opportunities with direct source links, visa notes, fee ranges, and verification status. Free and community-reviewed."

**Trust badges on the homepage:**
- NPI-Verified Posters
- Admin-Reviewed
- Community Reviews
- Moderated Platform

**Numeric claims** (from JSON-LD breadcrumbs):
- "282 Clinical Rotations (observerships, externships, electives)"
- (Codebase has `opportunitiesIndexed: 304` in `src/lib/site-metrics.ts:38`)

**Featured opportunities on homepage** (named, individual programs):
- University of Florida College of Medicine International Visiting Student
- Mayo Clinic Visiting Medical Student Clerkship
- Weill Cornell Visiting International Medical Students Program
- Yale Visiting International Student Elective Program
- UW DLMP Global Observership (Pathology)
- Texas Tech HSC Internal Medicine IMG Observership

---

## 2. Live /browse structure

- 304 listing detail links (`/listing/[cuid]`) on the page
- Filter UI uses `?q=` for text search; audience/state/type filtering is client-side
- Each card shows: Type badge (Observership/Externship/Elective), "Verified program link" badge (with last-verified timestamp), institution title, location, view count, posted date

---

## 3. Live listing detail page (sample: `cmn2112xb004msb11lxcsbuqj`)

Visible fields (rendered to user):

| Field | Sample value |
|---|---|
| H1 / institution | Wayne State University / Detroit Medical Center |
| Specialty | Internal Medicine, Surgery, Emergency Medicine, Pediatrics |
| Duration | 2-4 weeks |
| Format | IN PERSON |
| Deadline | Rolling Admissions |
| Eligibility Requirements | MD/MBBS, USMLE Step 1, health clearance · Visa: B1/B2 |
| Description | Major academic medical center with multiple hospital campuses… |
| Verification | "Verified program link" badge with tooltip "Verified link — last verified 16 hours ago" |
| Reviews section | Community Reviews placeholder |

Trust signal: badge anchored to a `lastVerifiedAt` timestamp on the row.

---

## 4. Localhost preview structure (after Batch 1 + 2 polish)

`/usce/verified-preview` shows 29 cards from 3 source provenances:

| Source | Rows | Badge color |
|---|---:|---|
| Reviewer-approved (existing snapshot) | 13 | emerald |
| Exact-link seed (Batch 1 + 2 runner) | 14 | blue |
| Intelligent gate (Houston Methodist) | 2 | slate |

**Card fields:**
- Type badge
- Provenance badge (Reviewed / Exact seed / Intelligent gate)
- Institution name (uppercase eyebrow)
- Opportunity name (extracted page title, or synthesized fallback)
- Source quote excerpt (sentence-aware truncation, 140 chars)
- Location · Audience

**Detail fields:**
- Same header as card
- "Apply on official source page" CTA (black button)
- Source quote evidence box (verbatim, full)
- Program details grid: Eligibility / Application route / Cost / Duration / Deadline / Contact — **all null for exact-seed rows** (rendered as a single helpful note instead)
- Provenance footer

**Filters:** Audience / State / Type with row counts.

---

## 5. Field mapping (live vs preview)

| Field | Live `/browse` listing | Preview row |
|---|---|---|
| Institution | `title` (string, e.g. "Wayne State University") | `institutionName` |
| Type | `listingType` enum (OBSERVERSHIP/EXTERNSHIP/RESEARCH/POSTDOC/ELECTIVE/VOLUNTEER) | `opportunityType` (overlapping but not identical enum) |
| Specialty | `specialty` (comma-joined string) | `specialty` (often null) |
| Duration | `duration` (string) | `duration` (always null currently) |
| Format | `format` (IN_PERSON/HYBRID/REMOTE) | (not exposed) |
| Deadline | `applicationDeadline` (string) | `deadline` (always null currently) |
| Eligibility | `eligibilitySummary` | `eligibility` (always null currently) |
| Description | `shortDescription` / `fullDescription` | (not exposed; relies on source-quote excerpt) |
| Visa | `visaSupport` (boolean) + visa string in eligibility | (not exposed) |
| Cost / Fee | `cost` (string) | `cost` (always null currently) |
| Source URL | `websiteUrl` / `sourceUrl` (both fields on Listing) | `sourceUrl` |
| Verification | `linkVerificationStatus` enum + `lastVerifiedAt` timestamp + `linkVerified` boolean | `directLinkStatus` (VALID_DIRECT_USCE_SOURCE / GENERIC_PAGE_HOLD / INVALID_NOT_USCE_SOURCE) |
| Audience | `audienceTag` (string, optional) | `audience` (us-md-do / international / img-observer / unknown) |
| USMLE tier | `usmleTier` (string, optional) | (not exposed) |

---

## 6. Mismatches identified

### 6.1 Verification language
- Live uses "Verified program link" + timestamp (the source URL was reachable as of T).
- Preview uses "Source-linked" / "Source quote" + provenance badge (the row has a verbatim quote from the source URL).

These are different concepts. The live verification is **link reachability**. The preview verification is **quote-backed source attribution**. The preview is a stronger claim. If we want to merge, every promoted-to-prod row should carry **both** signals.

### 6.2 Audience filter taxonomy
- Live: free-form `audienceTag` string (no enforced taxonomy at the DB level)
- Preview: 4-value enum (us-md-do / international / img-observer / unknown)

The live `/browse` page says "use the audience filter to narrow to programs that actually accept them" — but with no enforced enum the filter is fuzzy. Preview's enum is the right direction.

### 6.3 Program-name quality
- Live: hand-curated titles like "Wayne State University / Detroit Medical Center" — clear, institutional
- Preview: extracted page titles (varies by site) plus synthesized fallback `"{Institution} — {prettyType}"` for sparse pages

Some live titles are **also** weak ("Grady Memorial Hospital" alone). Both surfaces would benefit from a name-quality lint.

### 6.4 Field coverage
- Live rows are richer (specialty, duration, format, deadline, eligibility) because they came from a hand-curated data.js
- Preview exact-seed rows are sparse (only quote + URL + audience). The detail page falls back to "Visit official source" rather than fabricating empty fields.

This is **not** a bug. It's an honest tradeoff: live rows have stale-but-detailed hand-typed data; preview rows have verbatim-but-thin source evidence. Production rows should ideally have both.

### 6.5 Trust ladder mismatch
- Live: "NPI-Verified Posters / Admin-Reviewed / Community Reviews / Moderated Platform"
- Preview: provenance (Reviewed / Exact-seed / Intelligent-gate)

These are orthogonal. NPI-verification is about poster identity. Preview provenance is about extraction lineage. Both should appear on a unified production card.

---

## 7. Which preview improvements should be kept

1. **Verbatim source-quote on detail page** — strictly stronger than the live "Verified link" badge alone. Keep.
2. **Audience enum** (us-md-do / international / img-observer / unknown) — replaces fuzzy free-form `audienceTag`. Keep and enforce.
3. **`directLinkStatus` taxonomy** — VALID_DIRECT_USCE_SOURCE / GENERIC_PAGE_HOLD distinguishes a generic landing page from a specific opportunity page. Keep.
4. **Provenance badge** — Reviewed / Exact-seed / Intelligent-gate is honest about how the row entered the corpus. Keep.
5. **Filter row counts** — every option in the filter dropdown shows its count. Keep.

---

## 8. Which preview work should NOT go public

1. **Synthesized opportunity names** like `"{Institution} — Visiting Medical Student Program"` — acceptable for review, not for public display. Live has real names. Either extract a better title or hide the row.
2. **Empty program-details grid** with the "Visit official source for application details" note — works for internal review but looks thin against the live cards. For public, suppress the grid entirely and lean on the source-quote evidence box.
3. **Intelligent-gate-only rows** (currently 2: both Houston Methodist) — these came from broad-crawl heuristics, not from a curated source. They're real opportunities, but the runner-extracted quotes are weak. Hold these for reviewer-pasted quotes before public.
4. **`previewSource` debug language** ("Intelligent gate", "Exact-link seed") on the public card — internal taxonomy. For public, collapse to a single "Source-linked" badge with the existing live "Verified link" + timestamp.

---

## 9. What needs to merge into existing `/browse` later

Not in this sprint, but for the future deploy discussion:

| Live field | Becomes |
|---|---|
| `listings.websiteUrl` | The seed URL; runner re-verifies + adds quote |
| `listings.linkVerified` boolean | Replaced by `linkVerificationStatus` enum (already exists) + `directLinkStatus` from runner |
| `listings.audienceTag` free string | Replaced by enforced audience enum from runner |
| (new field) | `sourceQuote` from runner — verbatim text |
| (new field) | `sourceHash` from runner — for change detection |
| (new field) | `cleanedTextPath` — for provenance |
| (new field) | `lastSourceCheckAt` — separate from reviewer-touched timestamps |

Schema migration is **out of scope** for this sprint per the hard rules. The above is documentation of intent only.

---

## 10. Risk register

| Risk | Severity | Note |
|---|---|---|
| Preview and live become parallel universes | HIGH | This sprint addresses it by treating live source URLs as the canonical seed input |
| Live `linkVerified=true` on stale URLs | MEDIUM | Several live URLs probably 404 / 403 now; Phase E quantifies |
| Generic homepage URLs marked verified on live | MEDIUM | e.g. `https://montefioreeinstein.org/education/gme` is a GME landing, not an observership-specific page |
| Reviewer-approved rows that fail today's discipline | MEDIUM | E.g. Emory `RESEARCH_OPPORTUNITY` row mentions PharmD students. Flagged in Batch 2 report. |
| Duplicate rows when live + exact-seed both cover same institution | LOW | Preview adapter dedupes by `institutionId + sourceUrl + opportunityType + audience` |
