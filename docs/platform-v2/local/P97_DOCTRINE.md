# P97 — Verified new-opportunity discovery doctrine

Local-only doctrine doc. **Not yet executed.** P97 is the second
lane of the data work; P96 (existing-listing verification) is the
first lane. Both lanes share the same toolchain.

## 1. Two-lane goal

| Lane | Purpose | Status |
| --- | --- | --- |
| **P96** | Verify every existing listing has the right official source, correct application/source page, accurate fields, source screenshot, USCEHub screenshot, mismatch notes, and review status. | In progress (P96-0 → P96-1B done; P96-2 active) |
| **P97** | Find programs not yet in USCEHub, verify them from official sources, screenshot evidence, stage them for human review, then import only after confidence is high. | Not yet started |

The two lanes are **parallel**, not sequential beyond the
foundational shared tooling. P97 cannot start production runs until
P97-0 / P97-1 are designed.

## 2. Doctrine — what counts as a verified new opportunity

A new candidate listing is acceptable for **staging** only when:

1. The official institution / program page is found and reachable.
2. The page text or path contains an opportunity keyword
   (observership, externship, elective, visiting student, research
   fellowship, postdoctoral, volunteer, shadowing, IMG, etc.).
3. A screenshot of the official source page is captured.
4. A screenshot of any application or apply-form page is captured
   (when separate from the official source).
5. Field extraction has been attempted: institution, location,
   specialty, cost, duration, eligibility, IMG / student / graduate
   eligibility, visa, language, deadline, contact email, coordinator
   name (if public).
6. Duplicate detection against the current 304 listings has run
   (URL match + title-state match).
7. Reviewer notes record the discovery source (where the lead came
   from), the official source, and any mismatches between the lead
   and the official page.
8. Confidence level is recorded.
9. Status is one of the P97 statuses in §6.

A candidate is **not acceptable for import** until:

10. A human admin has reviewed the staged record.
11. The admin marks the row APPROVED_FOR_IMPORT.
12. The actual import event writes to `AdminActionLog` with the
    discovery + verification trail.

## 3. Lead source vs source of truth

| Surface | Role | Allowed? |
| --- | --- | --- |
| Official institution / program page | **Source of truth.** The only thing that proves the program exists. | Required |
| Department education / GME / global health page on the institution domain | Source of truth (same domain). | Required-equivalent |
| University CME or international-office pages on the institution domain | Source of truth. | Required-equivalent |
| Aggregator directory (FREIDA, ECFMG observer registry, etc.) | **Lead source only.** Confirms the program exists somewhere; never the source of truth. | OK as a lead |
| Google search results | Lead source only. | OK as a lead |
| Reddit / forums / blogs | Lead source only. | OK as a lead — needs heavy verification |
| LinkedIn / Twitter / Facebook | Lead source only. | OK as a lead |
| Press release / news article | Lead source only. | OK as a lead |
| PDF application packets | Source of truth **if** they are hosted on the institution's own domain. | Conditional |

**Rule.** No new listing is imported or published only because a
third-party site mentions it. The official institution / program
page is the source of truth.

## 4. Persistent-evidence rule

Every verified candidate, every rejected candidate, every duplicate,
every mismatch, every dead source needs persisted screenshot
evidence so a future reviewer can reconstruct the decision.

Storage pattern:

```
docs/platform-v2/local/screenshots/
  p96-existing-listings/
    uscehub-listings/
    official-sources/
    application-pages/
    mismatches/
    failures/
    mobile/                  (mobile-render captures, optional)
  p97-new-discovery/
    candidates/              (USCEHub-equivalent preview / mock listing card)
    official-sources/        (institution / program page)
    application-pages/       (separate apply form, when present)
    rejected-leads/          (everything we rejected, with reason)
    duplicate-checks/        (proof a candidate matches an existing listing)
```

All screenshots are local-only (`docs/platform-v2/local/screenshots/`
is in `.gitignore`).

Filename convention:

```
<candidateId-or-listingId>-<YYYYMMDD>.png
<candidateId-or-listingId>-<YYYYMMDD>.json    (sidecar metadata)
```

The JSON sidecar carries:

```jsonc
{
  "candidateId": "...",
  "title": "...",
  "capturedAt": "ISO-8601",
  "actor": "p97-discovery-batch-N",
  "leadSourceUrl": "https://aggregator.example/...",
  "officialSourceUrl": "https://institution.example/observership",
  "applicationUrl": "https://institution.example/apply",
  "officialSourceClassification": "OK_OFFICIAL_SOURCE",
  "extractedFields": {...},
  "duplicateCheck": {"existingListingId": null, "score": 0.0, "method": "url+title-state"},
  "confidence": 0.0,
  "reviewerNotes": "...",
  "recommendedAction": "APPROVED_FOR_IMPORT"
}
```

## 5. Search axes for P97 discovery

(Recorded as the human-readable spec; pipeline scripts implement
later.)

**Opportunity keywords** the discovery pipeline searches for on
official institution pages:

```
observership, clinical observership, international observership,
physician observership, medical observership,
externship, clinical externship, hands-on externship,
elective, visiting student elective, international visiting student,
visiting medical student, away elective, clinical elective,
research observership, research fellowship, research trainee,
postdoctoral fellowship, volunteer clinical program,
shadowing, pre-med shadowing,
IMG observership, international medical graduate observership,
J-1 clinical observer, medical education observer
```

**Institution page types** to inspect (in priority order):

```
medical school global-health pages
GME pages
department education pages
international office pages
visiting student pages
observership policy pages
hospital volunteer pages
research fellowship pages
department-specific observer pages
PDF application packets (institution-hosted only)
program coordinator pages
university CME pages
```

**Specialty-specific search axes:**

```
internal medicine observership
cardiology observership
neurology observership
pathology observership
radiology observership
surgery observership
pediatrics observership
psychiatry observership
family medicine observership
emergency medicine observership
anesthesiology observership
dermatology observership
oncology observership
nephrology observership
pulmonary critical care observership
```

## 6. Candidate fields

Capture per candidate before staging:

```
candidateTitle
institution
department
city
state
opportunityType        — one of OBSERVERSHIP / EXTERNSHIP /
                         ELECTIVE / RESEARCH / VOLUNTEER /
                         POSTDOC / SHADOWING / UNKNOWN
specialty
officialSourceUrl
applicationUrl         — when separate
sourcePageType         — homepage / department / GME / international /
                         visiting-student / etc.
applicationProcess     — free-text summary
eligibility
imgEligibility
studentEligibility
graduateEligibility
visa
language
cost
duration
deadline
contactEmail
coordinatorName        — only if publicly listed
lastReviewedAt
reviewer
confidence             — 0.0 to 1.0
screenshots            — paths
duplicateCheck         — matches against current listings
recommendedAction
notes
```

## 7. Candidate status taxonomy

```
NEW_LEAD                   — surfaced from a lead source; no official check yet
OFFICIAL_SOURCE_FOUND      — institution page identified; not yet verified
APPLICATION_PAGE_FOUND     — apply page identified
DUPLICATE_POSSIBLE         — matches a current listing; flag for review
NEEDS_MANUAL_REVIEW        — automated checks insufficient
REJECTED_THIRD_PARTY_ONLY  — only mentioned on aggregator/forum/etc.
REJECTED_NO_USCE_CONTENT   — official page does not contain opportunity keywords
REJECTED_DEAD_SOURCE       — official page returns errors / closed program
APPROVED_FOR_IMPORT        — admin signed off; ready for staging into Listing
IMPORTED                   — moved into the live Listing table
```

These are status labels for the candidate-side data flow. They do
**not** become a `CandidateStatus` enum in `prisma/schema.prisma`
unless a future P97 schema PR explicitly approves it.

## 8. Truth-framing rule (carried from P96)

Use internally:

> 100% evidence-reviewed at time of review.

Do **not** claim:

- 100% permanently correct
- complete list of all programs
- hospital-approved
- official database
- guaranteed accurate forever

Correct public wording (later, when public surface exists):

- Source-linked and reviewed.
- Official source shown when available.
- Last reviewed date shown.
- Report an update or correction.

## 9. Sequence

P97 cannot start until the shared foundation is in place. Order:

```
P96-1B     wire classifier into cron                        DONE
P96-2      25-listing existing-listing audit + screenshots  IN PROGRESS
P97-0      design new-data discovery pipeline               NOT STARTED
P97-1      build candidate discovery / staging format       NOT STARTED
P97-2      run tiny 10-candidate discovery dry run          NOT STARTED
P97-3      run 50-candidate discovery batch                 NOT STARTED
P96-3      full 304-listing existing-listing audit          NOT STARTED
P97-4      staged-import review for approved new candidates NOT STARTED
```

P96 and P97 share:

- the pure content classifier (`src/lib/content-classifier.ts`)
- the host throttle (`src/lib/host-throttle.ts`)
- the screenshot pipeline (Playwright, P96-2)
- the duplicate detector (yet to be built)
- the official-source classifier (yet to be built)
- the field extractor (yet to be built)
- the admin review queue (`AdminMessage` + `/admin/freshness`)
- the freshness dashboard (`/admin/freshness`)

## 10. Hard rules

- No new listing imported or published purely on third-party
  evidence.
- Official institution / program page is the source of truth.
- Persisted screenshot evidence is required for every accepted,
  rejected, mismatched, dead, or duplicate candidate.
- All P97 work is local-only until the discovery pipeline is
  reviewed.
- No aggressive crawling. ≤ 1 request per host per second. Honor
  `robots.txt`. Do not authenticate to source-of-truth pages.
- No PHI / PII captured in candidate metadata.
- No public claim of "verified by hospital" or "official partner."
