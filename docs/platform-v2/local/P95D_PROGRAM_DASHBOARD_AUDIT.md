# P95-D — Program dashboard architecture audit

Local-only architecture audit. **No code, no schema, no migration,
no auth/RBAC change, no document upload.** Branch:
`local/p95d-program-dashboard-audit`. Not pushed.

This document specifies the institution/program dashboard layer
that sits between the institution claim/profile work (P95-B) and
candidate intake (P95-E). The goal is to design before building.

## 0. Locked sequence (recap)

```
1. Directory                       — built
2. Correction / update / removal   — v1 split into PRs #58–#61, #62 (B doc), #63 (C doc)
3. Institution claim / profile     — audited (P95-B / PR #62)
4. Program dashboard               — THIS DOCUMENT (P95-D, deferred)
5. Candidate intake / application  — future (P95-E)
6. Secure document vault           — audited, deferred (P95-C / PR #63)
7. Onboarding workflow             — depends on §6 (P95-F)
```

P95-D does not require P95-C (document vault). It can ship without
ever taking custody of a file. P95-D **does** depend on P95-B (claim
+ verified institution identity) and on a real `OrganizationMembership`
model for multi-coordinator support.

## 1. Goal

Allow a verified coordinator at an institution to log in to USCEHub
and see a small set of operational views relevant to programs they
manage:

1. The programs (listings) their organization owns.
2. The candidates who have expressed interest in or applied to those
   programs.
3. A simple status pipeline they can move candidates through.
4. Correction/update history surfaced from `/contact-admin` flows
   filed against their listings.
5. Source-link verification status on their listings.
6. No file storage. No document upload. No hospital-approved badge.

The dashboard makes the platform usable for programs to manage their
candidate funnel without resorting to email chaos. It does **not**
become a full SaaS portal.

## 2. Existing surface (what we already have)

| Route | Purpose | Notes |
| --- | --- | --- |
| `/poster` | Poster overview | Stats: total listings, active, pending, applications. Recent listings list. **Single-poster-centric** — one User owns one Organization. |
| `/poster/listings` | List of poster's listings | Owner-scoped via `posterId`. |
| `/poster/listings/[id]/edit` | Edit one listing | Uses `listing-update-guard.ts`. |
| `/poster/listings/new` | Create new listing | |
| `/poster/applications` | Applications received on poster's listings | Shows `Application.status` from the enum. |
| `/poster/organization` | Edit org content (name, contact, etc.) | Verification fields admin-only via `organization-update-guard.ts`. |
| `/poster/verification` | View own poster verification status | Shows `PosterProfile.verificationStatus`. |
| `/poster/settings` | Profile settings | |

API supporting these:

- `GET/POST/PATCH /api/poster-listings` — listing CRUD scoped to owner.
- `GET/PATCH /api/poster-applications` — application status edits.
- `GET/POST/PATCH /api/poster-profile` — poster profile.
- `GET/POST/PATCH /api/organizations` — organization profile.

### 2.1 What is NOT present

- **Multi-coordinator support.** `Organization.ownerId` is `@unique`,
  forcing one human per organization. No `OrganizationMembership`
  model, no per-membership role.
- **Per-program ACL.** A coordinator either owns the org and sees
  every listing or sees nothing. No "this coordinator only manages
  cardiology, not anesthesia."
- **Candidate pipeline view.** `Application.status` has six values
  (SUBMITTED, UNDER_REVIEW, ACCEPTED, REJECTED, COMPLETED, WITHDRAWN)
  but the UI is a flat list. There is no kanban/pipeline view.
- **Pre-application "interest."** The schema has no
  `INTERESTED → SUBMITTED` distinction. A candidate either applies or
  does not. P95-E will add this.
- **Coordinator-side notes.** No internal-only notes attached to a
  candidate or an application.
- **Correction history per listing.** `FlagReport` and
  `AdminMessage` exist but the poster-side dashboard does not surface
  them. A coordinator cannot see "an applicant reported a broken
  link on my listing yesterday."
- **Source-link health view.** `linkVerificationStatus` and
  `lastVerifiedAt` exist on `Listing` but the poster dashboard does
  not show a per-listing status ladder.
- **Bulk operations.** No bulk-move-status, no bulk-export.
- **Cross-program candidate view.** A candidate who applied to two
  of an org's programs shows up as two unrelated rows.

## 3. Constraint walls (what we will not do)

| Wall | Why |
| --- | --- |
| No "Hospital-verified" or "Hospital-approved" labels on the dashboard | Verification is administrative, not endorsement. |
| No document upload, anywhere | P95-C wall — separate security project. |
| No third-party institution logo display | Trademark + likeness; gated to L3 in P95-B. |
| No bulk-message / bulk-email to candidates | Spam risk + consent boundary. |
| No "see all candidates across all institutions" view | Cross-tenant boundary. Even admins access via `ADMIN_OVERRIDE`-style logged paths. |
| No coordinator-visible PII beyond what the candidate has chosen to share on their application | Privacy floor. |
| No cron triggered from the dashboard | Cron stays admin-only. |
| No bypass of `listing-update-guard.ts` or `organization-update-guard.ts` | Single chokepoints for write-side. |
| No real outbound email from the dashboard | Email infrastructure is fire-and-forget admin notification only. |
| No "approve a correction" button that auto-applies the change | Admin still moderates corrections. |

## 4. Three dashboard tiers

The right view depends on who the actor is.

### 4.1 Tier 1 — single-poster (today)

Same as the existing `/poster` dashboard. One user, one organization,
all listings owned by that user. No multi-coordinator. This tier
already works.

What we'd add at this tier without schema:

- Per-listing source-status badge (already computed; just surface it).
- Per-listing "open corrections" count (count from `FlagReport`
  where `targetId = listingId AND status IN (OPEN, IN_REVIEW)`).
- A small "Recent corrections" panel on the overview page listing
  the last 5 `FlagReport`s + `AdminMessage`s that mention any of the
  poster's listings.

All three are read-only aggregations over existing tables. No
schema, no migration, no auth change.

### 4.2 Tier 2 — multi-coordinator (deferred, schema-needed)

Multiple verified coordinators at one organization. Each may have:

- Org-wide read.
- Per-listing write.
- A role: `OWNER | COORDINATOR | VIEWER`.

This tier requires the `OrganizationMembership` model proposed in
P95-B. **Do not implement until P95-B schema lands.**

Without the schema, the workaround is admin-mediated coordinator
swap (admin re-points `Organization.ownerId` when needed), already
documented in P95-B §6.

### 4.3 Tier 3 — institution-wide (long-term)

Multiple programs in one large hospital system, with team-scoped
permissions per service line, GME office views, audit log access,
optional document vault integration. Out of scope for at least the
next two quarters.

## 5. Candidate pipeline view

`Application.status` already supports the lifecycle below. The
dashboard can ship a pipeline UI without any schema change.

```
SUBMITTED       ← candidate applied
UNDER_REVIEW    ← coordinator triaging
ACCEPTED        ← coordinator confirmed
REJECTED        ← coordinator declined
COMPLETED       ← rotation finished
WITHDRAWN       ← candidate pulled out
```

No-schema pipeline UI candidates:

1. **Kanban column view.** 6 columns, each candidate as a card.
   Drag-to-move triggers a PATCH to `/api/poster-applications`.
2. **Status filter on the existing list view.** Lower lift than
   kanban, ships first.
3. **Per-status counters on `/poster/applications`** linking to the
   filtered list.
4. **Per-candidate timeline** rendered from
   `Application.createdAt` and `updatedAt` plus any future
   `ApplicationStatusLog` rows (deferred, schema-required).

Bulk move (e.g. "mark all SUBMITTED → UNDER_REVIEW") is **not** in v1.
Single-row PATCH only.

## 6. Pre-application "interest" track (deferred, schema-needed)

P95-E will add the `ProgramCandidate` model with `INTERESTED` as a
separate stage before `SUBMITTED`. P95-D should design the dashboard
so the new stage drops in cleanly:

- The pipeline view should accept additional leftmost columns.
- The applicant API should be additive: an `interest` POST does not
  replace `application` POST.
- Status-history rendering should accept multiple lifecycles
  (interest lifecycle + application lifecycle).

## 7. Coordinator-side notes (deferred, schema-needed)

Internal-only notes on an `Application` are useful but require a
schema field (`internalNotes` text, write-restricted to coordinators
of the owning org). Defer until P95-B's RBAC lands so the
`internalNotes` row is acl-clean.

Workaround until then: nothing. Coordinators can't write internal
notes through the platform.

## 8. Correction history per listing

`FlagReport` and `AdminMessage` already capture every correction
event. The dashboard can surface them without schema:

- On `/poster/listings/[id]/edit`, render a "Recent corrections"
  panel pulling:
  - `FlagReport` rows where `type = "listing" AND targetId = listingId`
  - `AdminMessage` rows where the body or subject contains the
    listing's id (best-effort, since `AdminMessage` has no FK to
    listings).
- On `/poster` overview, a small aggregate count of open corrections
  across all of the poster's listings.

The `AdminMessage` filter is imprecise without a schema link.
Acceptable for v1; a `relatedListingId` column on `AdminMessage`
would clean it up later.

## 9. Source-link health surfacing

`Listing.linkVerificationStatus`, `linkVerified`, `lastVerifiedAt`,
and the `DataVerification` audit trail all exist. Surface them:

- On `/poster/listings`, a per-row badge using the same
  `ListingVerificationBadge` component already shipped publicly.
- On `/poster/listings/[id]/edit`, a "Source verification history"
  panel pulling the last 5 `DataVerification` rows where
  `targetType = "listing" AND targetId = listingId`.
- A "Re-verify now" button is **not** in v1. Re-verify stays
  cron+admin-mediated.

## 10. Gap table

| # | Current state | Needed state | Schema needed? | Phase |
| --- | --- | --- | --- | --- |
| D1 | `/poster` dashboard shows 4 simple stats. | Same + per-listing source badge + correction count badges + recent corrections panel. | No | P95-D no-schema candidate |
| D2 | `/poster/applications` is a flat list. | Same + status filter + per-status counts. | No | P95-D no-schema candidate |
| D3 | No kanban / pipeline view. | Optional pipeline tab using existing 6 statuses. | No | P95-D no-schema candidate (lift higher) |
| D4 | No coordinator-side internal notes. | Notes per `Application`, acl'd to org members. | Yes (`Application.internalNotes`) | Deferred (depends on P95-B RBAC) |
| D5 | No multi-coordinator per org. | `OrganizationMembership` with role. | Yes | Deferred (P95-B) |
| D6 | No per-program ACL. | Per-listing acl on memberships. | Yes | Deferred (P95-B) |
| D7 | No cross-program candidate view. | "All applications from candidate X across our org" merge view. | No (computed) | P95-D candidate |
| D8 | No correction history surfaced to poster. | Read-only "Recent corrections" panel pulling `FlagReport` + `AdminMessage`. | No | P95-D candidate |
| D9 | No source-link history per listing. | Read-only panel pulling last 5 `DataVerification` rows. | No | P95-D candidate |
| D10 | No `INTERESTED` pre-application stage. | `ProgramCandidate` model + leftmost pipeline column. | Yes | Deferred (P95-E) |
| D11 | No bulk-move status. | Single-row PATCH only in v1. | No | Out of v1 |
| D12 | No applicant-side status visibility. | Applicant sees their own application status timeline. | No (computed from existing fields) | P95-D candidate (applicant side) |
| D13 | No "claim a system listing" path inside dashboard. | Coordinator sees "Was your program imported by USCEHub? Claim it." link to `/contact-admin?category=coordinator_correction`. | No | P95-D candidate (P95-B-aligned) |
| D14 | No internal admin override surfaced to org. | Out of scope. | n/a | n/a |

## 11. Recommended P95-D no-schema implementation candidates (review only — do not build yet)

If/when the user approves a no-schema slice of P95-D, ranked by
signal:

1. **D9 — source-link history panel** on
   `/poster/listings/[id]/edit`. Read-only, pulls existing
   `DataVerification` rows. Adds visible value without any new model.
2. **D8 — correction history per listing**, surfaced on the same
   edit page and aggregated as a count on `/poster`. Read-only.
3. **D2 — status filter + counters** on `/poster/applications`.
   Tiny lift, big UX win.
4. **D1 — per-listing source badge + correction count badges** on
   `/poster/listings`. Same component the public listing pages
   already use; just composed differently.
5. **D7 — cross-program candidate view.** "All applications from
   X@y.com across our org" computed at request time.
6. **D12 — applicant-side application status timeline.** Render
   `Application.createdAt` and `updatedAt` for the candidate's own
   applications. No new schema; we already have the fields.
7. **D13 — "Is this your program?" prompt.** A small banner on the
   edit page when the listing's `posterId` is the system user;
   links to `/contact-admin?category=coordinator_correction`.
8. **D3 — kanban pipeline tab.** Higher lift; ship after 1–7. Uses
   existing 6 statuses.

Out of v1 (require schema or RBAC):
- D4 internal notes
- D5 multi-coordinator
- D6 per-program ACL
- D10 INTERESTED stage
- D11 bulk operations

## 12. Non-functional requirements

- All write paths route through existing guards
  (`listing-update-guard.ts`, `organization-update-guard.ts`,
  `applications/[id]` PATCH). No new write routes that bypass them.
- All reads scoped to `posterId = session.user.id` or, in tier 2+,
  to `OrganizationMembership.organizationId`.
- All status transitions write to `AdminActionLog` with
  `targetType = "application"`. The log already exists; the dashboard
  PATCH should call into it.
- Rate-limit kanban-style fast PATCHes (e.g. drag-drop) — at least
  20/minute per user.
- No N+1 queries on the kanban/pipeline view; aggregate via
  `groupBy` or join.
- No client-side filtering of applications data — server filters
  always (PII boundary).

## 13. Public copy guardrails (carried from P95-B)

The dashboard surfaces metadata, not endorsement. Use:

- "Coordinator-managed"
- "Last confirmed by institution"
- "Source verified" / "Source on file" / "Source needs review"
- "Open corrections"
- "Recent corrections"

Do not use:

- "Hospital-verified"
- "Hospital-approved"
- "Official partner"
- "Approved by"
- "Endorsed by"
- "Sponsored by"

## 14. Hard rules carried forward

- No push of this branch.
- No PR.
- No deploy.
- No Vercel mutation.
- No `prisma/schema.prisma` edit.
- No new migrations.
- No `prisma db push`.
- No new auth flows.
- No new role values.
- No document upload, no file storage.
- No outbound email beyond the existing fire-and-forget admin
  notification.
- No #52 branch interaction.
- No interaction with PRs #58–#63 from inside this branch.

## 15. Open decisions for the user

1. Approve §11's D8 + D9 (correction + source history panels) as
   the first no-schema P95-D slice once #58–#63 land?
2. Approve a single-row D2 + D3 pipeline UI without bulk ops as the
   second no-schema P95-D slice?
3. Defer all multi-coordinator / per-program ACL work until P95-B
   schema lands?
4. Approve the D13 "Is this your program?" banner as a no-schema
   nudge tied to the coordinator-correction category?
5. Approve the D12 applicant-side status timeline as part of P95-D
   or split into a tiny separate PR (it's applicant-side, not
   institution-side)?
6. Confirm that *all* write operations from the dashboard route
   through existing `*-update-guard.ts` chokepoints — no new
   guards.

The default — pending answers — is **defer everything in P95-D
except the audit doc itself.**
