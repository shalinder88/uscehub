# P95-A — Hospital-authentic correction / update / removal workflow v1

Local-only audit + build plan. Branch: `local/p95-hospital-correction-workflow`.
Not pushed. Not opened as PR. Not deployed.

## 1. Executive verdict

**A no-schema v1 is achievable today.** The schema already supports
correction-style intake via two existing models:

- `FlagReport` (with `FlagKind` enum, `sourceUrl`, `status`, `kind`,
  `adminNotes`, `resolvedAt/By`)
- `AdminMessage` (with **free-string** `category`, `status`, `adminNotes`)

`AdminMessage.category` is not enum-locked. New categories like
`institution_update`, `removal_request`, `coordinator_correction`,
`source_update` can be added in **client code only** with zero migration.

The unresolved gap — a true `CorrectionRequest` model with structured
status lifecycle, requester role, requester institution, and audit log
— is documented separately in
`P95_CORRECTION_SCHEMA_PROPOSAL.md` and **not implemented here**.

What this v1 delivers without schema work:

- A clear public path for "Suggest a correction / update / removal"
  from any listing detail page, prefilling category + subject context
  into `/contact-admin`.
- Hospital-correction categories surfaced explicitly in the
  contact-admin form (institution update, removal request, source
  update, coordinator correction) using the existing `category` field.
- `FlagButton` UI categories mapped to the correct `FlagKind` enum
  values on the wire, so the admin queue can finally filter by kind.
- Methodology and For-Institutions copy aligned with the
  hospital-authenticity audit (`HOSPITAL_AUTHENTICITY_AND_CORRECTION_WORKFLOW.md`)
  — clarify "Verified link" vs "Official source on file", add
  "USCEHub does not represent institutions" disclosure, link
  coordinators directly to the correction path.

## 2. Current public flows (what exists)

| Surface | Status | Notes |
| --- | --- | --- |
| Report broken link button | Real | `ReportBrokenLinkButton` posts to `/api/flags` with `kind: BROKEN_LINK` and includes `sourceUrl`. Mailto fallback for unauthenticated visitors. |
| Generic flag/report dialog | Partial | `FlagButton` covers 5 categories (inaccurate / dead_link / spam / duplicate / other) but **does not** send the structured `FlagKind` — the API back-compat-parses the legacy text prefix and falls back to `OTHER`. |
| Suggest update link | Wired but unused | `ListingTrustMetadata` accepts a `suggestUpdateUrl` prop but the listing detail page does not pass one, so the link never renders. |
| Listing disclaimer | Real | `ListingDisclaimer` component exists. |
| Trust metadata block | Real | Verification badge + last-verified relative time + report-broken-link affordance. |
| Contact page | Real | `/contact` static. |
| Contact admin (auth) | Real | `/contact-admin` posts to `/api/admin-messages` with 6 categories. |
| Methodology page | Mostly real | Last-updated stamp present. Some aspirational language ("48-hour SLA"). Does not yet reflect the verified-on-file vs verified-link distinction the badge component already supports. |
| For-Institutions page | Real | Strong service description. **No coordinator-facing "Suggest a correction or removal" path.** |

## 3. Current API/backend flows

| Endpoint | Auth | Notes |
| --- | --- | --- |
| `POST /api/flags` | Required (NextAuth session) | Creates `FlagReport`, validates `kind` against the `FlagKind` enum allowlist (broken_link, wrong_deadline, program_closed, incorrect_info, duplicate, spam, other), 20/hour per-user rate limit, fires fire-and-forget admin notification email. |
| `POST /api/admin-messages` | Required | Creates `AdminMessage` with **any** category string (default `"general"`), 10–5000 char body, fires admin notification. |

The flag route already covers six structured intake kinds. The
admin-messages route is the right vehicle for free-form correction
narratives that don't map cleanly to a single listing flag kind
(e.g. institution-wide removal requests, source URL changes, coordinator
identity claims).

## 4. Current admin flows

| Surface | Status | Notes |
| --- | --- | --- |
| `/admin/flags` | Real | Lists FlagReports, supports status updates. |
| `/admin/messages` | Real | Lists AdminMessages, supports status updates. Filterable by `status`. |
| `/admin/verification-queue` | Real | Phase 3 link-verification workflow. |
| `AdminActionLog` | Real model | Every admin action targets `(targetType, targetId)` with optional notes. Wired on most write paths. |
| `DataVerification` | Real model | Per-link verification audit trail with httpStatus, finalUrl, statusBefore/After. |

Gap: there is no single admin view that joins listing + every flag,
verification, and admin message about that listing into one
coordinator-friendly history. Out of scope for v1.

## 5. Institution-facing credibility — gap analysis

| Question | Today | Needed | v1 lift |
| --- | --- | --- | --- |
| Can an institution coordinator request a correction or removal? | Indirectly via `/contact-admin` after creating an applicant account. | Direct, named path from listing detail and from `/for-institutions`. | YES |
| Does the listing page link to the official source? | Yes when present. | Same. | n/a |
| Is the correction/removal workflow visible? | No clear surface. | Visible CTA from listing detail + dedicated subsection on `/for-institutions`. | YES |
| Does the site disclose it does not represent institutions? | Implied in the listing disclaimer + about page; not consistently stated. | Consistent disclosure on listing detail trust block, methodology page, for-institutions page. | YES |
| Are claims conservative? | Mostly, after PR #57 removed the "largest" overclaim. | Same — keep verified vs on-file distinction explicit. | YES (methodology copy) |
| Is correction status visible to the requester? | No. | Email reply on resolve (already happens) — full status tracking is v2 schema work. | DEFERRED |

## 6. Gap table

| # | Current state | Needed state | Risk if skipped | No-schema fix | Schema-needed fix | Priority |
| --- | --- | --- | --- | --- | --- | --- |
| G1 | `FlagButton` UI categories drop on the wire (server gets `OTHER`). | UI category → `FlagKind` mapping sent on the wire. | Admin queue cannot filter UI-flagged reports by kind, masks broken-link rate. | Send `kind` from FlagButton. | — | P0 |
| G2 | `ListingTrustMetadata` has `suggestUpdateUrl` prop but listing detail never wires it. | Listing detail wires the prop to `/contact-admin?category=data&listingId=...`. | Coordinators have no clear "suggest a correction" path. | Wire prop + extend `/contact-admin` to read `?category=` and `?subject=`. | — | P0 |
| G3 | `/contact-admin` form has 6 categories but none are coordinator-facing. | Add `institution_update`, `removal_request`, `source_update`, `coordinator_correction`. | Hospitals send via `general` and admins lose intent. | Extend categories list (free-string column, no migration). | A `requestType` enum on a `CorrectionRequest` model with status lifecycle — v2. | P0 |
| G4 | Methodology page describes "Verified" but does not surface the "Verified link" vs "Official source on file" distinction the badge component already exposes. | Surface the distinction + correction/update/removal language + "USCEHub does not represent institutions". | Hospitals reading the methodology page believe we represent them or claim hospital-side approval. | Copy update only. | — | P0 |
| G5 | `/for-institutions` has no coordinator-correction subsection. | A clear "Are you a coordinator? Suggest a correction or request removal" block linking to `/contact-admin?category=...`. | Coordinator path is invisible. | Copy + link only. | — | P1 |
| G6 | No tracking of correction lifecycle visible to requester. | Requester sees status (received → in review → resolved). | Limits trust ceiling. | Out of scope. | `CorrectionRequest` model. | DEFERRED v2 |
| G7 | No institution claim/verify path. | Hospitals can claim listings and assert representation. | Major missing feature for hospital partnerships. | Out of scope. | `OrganizationClaim` model + auth path. | DEFERRED v2 |
| G8 | Admin combined-history view per listing. | One admin view joins flags + verifications + messages per listing. | Admin work is multi-tab. | Out of scope. | Joined query view, not strictly schema. | DEFERRED v2 |
| G9 | Public copy still says "All listings go through our review process before being published" (FAQ). | Reword to reflect that bulk-imported public-source listings exist alongside reviewed poster submissions. | Minor overclaim risk. | Copy update — out of v1 scope. | — | DEFERRED |

## 7. Recommended v1 (no-schema) build plan

Implemented on `local/p95-hospital-correction-workflow`, not pushed:

1. `src/components/listings/flag-button.tsx`
   - Map UI category to `FlagKind` and send it explicitly.
   - No UI change.

2. `src/app/contact-admin/page.tsx`
   - Extend `CATEGORIES` with `institution_update`, `removal_request`,
     `source_update`, `coordinator_correction`.
   - Read `?category=` and `?subject=` from the URL on mount and prefill.
   - Show a small contextual hint when category is institution-facing
     ("USCEHub does not represent institutions; we link applicants to
     official sources when available").

3. `src/app/listing/[id]/page.tsx`
   - Wire `suggestUpdateUrl` on `ListingTrustMetadata` to a stable
     deep-link URL: `/contact-admin?category=data&subject=Correction%20for%20...`
     (URL-encoded listing title + id appended to subject).

4. `src/app/methodology/page.tsx`
   - Replace the single "Verified" block with two sub-blocks:
     "Verified link" (cron- or admin-verified) and "Official source on
     file" (legacy on-file URL, no fresh verification timestamp).
   - Add explicit "USCEHub does not represent the institutions listed"
     line.
   - Replace aspirational SLA language with conservative wording
     ("Reports are queued for admin review; we do not guarantee a
     response time").
   - Keep the existing "Report an Error" section but extend the link
     to call out suggest-correction, request-update, and request-removal
     intents.

5. `src/app/for-institutions/page.tsx`
   - Add a third section beneath the two-column grid:
     "Are you a program coordinator?" with a short note and a button
     to `/contact-admin?category=coordinator_correction&subject=...`.
   - Do not change the existing service description or JSON-LD.

Out of v1 scope (do not touch this round):
- New API endpoints
- New DB columns or models
- Email template changes
- Admin queue UI changes (admin already has `/admin/messages` and
  `/admin/flags`; new categories show up automatically)
- Sitemap / robots / canonical changes
- Any pathway exposure
- `/career`, `/careers`, `/residency`, `/fellowship` routes
- The parked PR #52 UI transplant

## 8. Recommended v2 (schema-needed) — deferred

See `P95_CORRECTION_SCHEMA_PROPOSAL.md` for the full proposal.
Highlights:

- Add `CorrectionRequest` model with structured status lifecycle.
- Add `OrganizationClaim` model for institution verification.
- Add `lastInstitutionConfirmedAt` to `Listing` to express
  hospital-side confirmation independently of link-status verification.
- Migration risk: indices, backfill of existing flag/message rows.

None of v2 is implemented in this branch.

## 9. Verification gates

For the no-schema v1, verification is:

- `tsc --noEmit` clean
- `eslint` clean (no new errors)
- Forbidden-path scan: no edits to `prisma/`, `sitemap.ts`, `robots.ts`,
  `middleware`, `/career`, `/careers`, `/residency`, `/fellowship`,
  pathway selector, or `.vercel/`.
- Overclaim scan: no new instances of "official database",
  "hospital-approved", "verified by hospitals", "guaranteed rotations",
  "best programs", "top-rated", "largest structured database",
  "official partner".

## 10. Branch hygiene

- `local/p95-hospital-correction-workflow` is local-only.
- No push.
- No PR.
- No merge.
- No deploy.
- No Vercel mutation.
- After Vercel rate-limit reset and the held #47 / #44 PRs are
  cleared, this branch can be split into 3–4 small reviewable PRs:
  (a) FlagButton kind mapping, (b) contact-admin categories + prefill,
  (c) listing-detail suggest-update wiring, (d) methodology +
  for-institutions copy. Order TBD.
