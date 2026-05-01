# E2 — Applicant status / saved-to-interest funnel audit

Local-only audit. **No code, no schema, no migration, no auth/RBAC,
no document upload.** Branch:
`local/e2-applicant-status-saved-interest-audit`. Not pushed.

This is the second E-track audit after E1 (apply-CTA pass merged in
#65). Goal: map the applicant funnel from browse → save/compare →
official source, identify what status visibility is achievable
without schema, and where "express interest" can safely live later.

## 1. Funnel today (literal, from the codebase)

```
Anonymous visitor
  └── /browse                                 (filters, no auth)
       └── /listing/:id                       (verified or "View Official Source" CTA)
            ├── (clicks CTA)──────────────►  institution.com/apply       [external]
            └── (no save UI today)            ─── dead end here
                                              ─── /api/saved exists but no Save button ships
                                              ─── /api/compared exists but no Compare-add button ships

Registered applicant
  └── /dashboard                              (overview)
       ├── /dashboard/saved                   (list view; can REMOVE; cannot ADD from anywhere visible)
       ├── /dashboard/compare                 (list view of /api/compared; same gap)
       └── /dashboard/applications            (list of own Application rows)

Coordinator (POSTER role)
  └── /poster                                 (overview)
       ├── /poster/listings                   (own listings)
       └── /poster/applications               (apps received on own listings)
```

The funnel has working **read** endpoints and **delete** endpoints on
saved/compared, but the **add** endpoints are reachable only by API.

## 2. Existing models, routes, and UI

### 2.1 Models

| Model | Purpose | Notes |
| --- | --- | --- |
| `SavedListing` | Bookmark | `(userId, listingId)` unique |
| `ComparedListing` | DB-backed compare list | `(userId, listingId)` unique |
| `Application` | Inbound application | `(listingId, applicantId)` unique |
| `ApplicationStatus` | 6-state enum | SUBMITTED → UNDER_REVIEW → ACCEPTED / REJECTED / COMPLETED / WITHDRAWN |
| `ApplicantProfile` | Applicant identity | `cvUrl` is a URL pointer, not a hosted file |

### 2.2 Routes

| Route | Verbs | Notes |
| --- | --- | --- |
| `/api/saved` | GET / POST / DELETE | Auth required |
| `/api/compared` | GET / POST / DELETE | Auth required |
| `/api/compare` | GET | Public; takes `?ids=` |
| `/api/applications` | GET / POST | Auth required; APPLICANT-only on POST |
| `/api/applications/[id]` | GET / PATCH | Status edits |
| `/api/poster-applications` | GET / PATCH | Coordinator-side mgmt |

### 2.3 UI

| Page | Affordance | State |
| --- | --- | --- |
| `/dashboard/saved` | List, **Remove** | ✓ |
| `/dashboard/compare` | List, **Remove** | ✓ |
| `/dashboard/applications` | List, status badge | ✓ no per-row timeline |
| `/listing/[id]` | Apply CTA via `listing-cta.ts` | ✓ conservative |
| `/listing/[id]` | **No Save button**, **no Compare-add button** | ✗ gap |
| `/browse` | Search + filters | ✓ no Save/Compare per-row toggle |
| `/compare` | Public side-by-side renderer | ✓ |

Verified by grep: there is no `SaveButton`, no `Bookmark` action, no
`onSave` handler, and the only `/api/saved` POST callers are
documented examples — never a UI component shipping today. Same for
`/api/compared` POST.

## 3. Implications

The save and compare lists exist as **dead-end** features for
anyone who didn't seed them via the API. The removal flow works
because data already exists in Shelly's account from prior testing,
but a fresh user can't land in those views with anything in them.
This is an honest gap and a small unlock.

Likewise, the `/dashboard/applications` list shows a status badge
but no time context: an applicant sees `SUBMITTED` or `ACCEPTED`
with no created/updated date framing.

## 4. Status lifecycle visibility (today)

For an applicant looking at their own application row:

- ✓ Status badge (one of 6 enum values)
- ✓ Listing title + city/state/specialty
- ✓ Original `Application.message`
- ✗ When was it submitted? (`createdAt` is fetched; not rendered)
- ✗ When was it last updated? (`updatedAt` is fetched; not rendered)
- ✗ Any per-event timeline
- ✗ Any narrative about what each status means

For a coordinator looking at applications on their listing:

- ✓ Same per-row data, with applicant name + email + profile
- ✓ Status PATCH UI
- ✗ No filter, no count badges, no kanban (all P95-D candidates)

## 5. What is possible without schema

Ranked by signal-to-risk. None implemented in this branch.

1. **Add a Save toggle on `/listing/[id]`.** Wire to
   `POST/DELETE /api/saved`. Authenticated users only; show a
   sign-in prompt for anonymous. No new fields, no new tables. Tiny
   lift, real funnel value because today the saved list cannot fill.
2. **Add a Save toggle on `/browse` listing cards.** Same wiring,
   per-row.
3. **Add a Compare toggle on `/listing/[id]` and `/browse` cards.**
   Wire to `POST/DELETE /api/compared`. Cap at 3 (existing
   `/compare` UI assumption).
4. **Render an applicant-side timeline on
   `/dashboard/applications`.** Two events from existing fields:
   `Submitted DATE` and (if different) `Last updated DATE — STATUS`.
   No schema needed.
5. **Status descriptors.** A small `STATUS_DESCRIPTIONS` map
   alongside `APPLICATION_STATUS_LABELS` already exported from
   `lib/utils.ts`. One sentence per status, e.g.
   `SUBMITTED: "Your application is on file with the program. The
   coordinator has not started review yet."`
6. **Withdraw button on active applications.** PATCH to WITHDRAWN
   exists on the API; surface it on
   `/dashboard/applications`.
7. **Saved → "Express interest" affordance.** Per the future-tense
   FAQ wording landed in #65, this should remain forward-looking.
   For now: a "View official source" link from each saved row that
   opens the `listing.websiteUrl` (or the listing detail page if
   no URL). No new behavior; just stops the dead-end.
8. **Empty-state copy on `/dashboard/saved` and
   `/dashboard/compare`** that points to `/browse` and explains the
   Save/Compare affordances (currently shows "No saved listings"
   with no path forward).

## 6. What requires schema / RBAC / participation tier

These are **out of scope** for E2 and any near-term implementation:

- `INTERESTED` pre-application stage (P95-E E3, schema-required).
- `SHORTLISTED` / `WAITLISTED` states (P95-E E4, schema).
- `ApplicationStatusEvent` history table (P95-E E7, schema).
- `Listing.officialApplyUrl` distinct from `websiteUrl` (P95-E E5,
  schema).
- `Organization.acceptsIntake` opt-in flag (P95-E E6, schema).
- Coordinator notes on applications (P95-D D4, schema + RBAC).
- Email notifications on status change (P95-F or later).
- Real "Express interest" tier with two-track participation (P95-E
  Track 2; gated on the schema flags above).

## 7. Where "Express interest" can safely live later

After the schema flags exist (P95-E v2), the candidate flow becomes:

```
/listing/:id (participating)
  ├── "Apply via official source" (always visible, primary)
  └── "Express interest on USCEHub" (secondary, only when
       listing.organization.acceptsIntake === true)
       └── creates an Application row with INTERESTED status
            └── visible on /dashboard/applications with status
                "Interested — coordinator has not yet reviewed"
```

For non-participating listings, the secondary affordance does not
appear. The listing CTA chokepoint (`listing-cta.ts`) is the natural
home for the gate; we already have a `participating` variant slot
to add when the schema lands.

## 8. Copy guardrails (carried forward)

Allowed:

- "Save to your dashboard"
- "Compare side by side"
- "View official source"
- "Apply via official source"
- "Express interest" — only for participating-program future state
- "Last updated" / "Submitted on"
- "Withdraw application"

Forbidden:

- "Apply through USCEHub" — already removed in E1
- "Official application system"
- "Hospital-approved" / "Verified by hospitals"
- "Guaranteed acceptance" / "Match guarantee"
- "Accepted by program" — unless it's a real coordinator-marked status
- "Required for residency"

## 9. Gap table

| # | Current state | Needed state | No-schema possible? | Schema needed? | Risk | Priority |
| --- | --- | --- | --- | --- | --- | --- |
| F1 | No Save button on listing detail | Save toggle wired to `/api/saved` | Yes | No | Saved list is dead-end | P0 |
| F2 | No Save toggle on browse cards | Per-row Save toggle | Yes | No | Per-listing save lift | P1 |
| F3 | No Compare toggle anywhere | Compare toggle (cap 3) | Yes | No | Compare list also dead-end | P1 |
| F4 | No applicant-side timeline | Render `createdAt` + `updatedAt` | Yes | No | Applicants don't see when status changed | P0 |
| F5 | No status descriptors | `STATUS_DESCRIPTIONS` map | Yes | No | Status badge alone is opaque | P1 |
| F6 | Withdraw not surfaced | Button on active rows | Yes | No | Latent feature | P1 |
| F7 | Saved/Compare empty states are dead | Linked empty state | Yes | No | UX dead end | P2 |
| F8 | No INTERESTED status | Pre-submit stage | No | Yes | Defer | n/a |
| F9 | No participating-program flag | `Organization.acceptsIntake` | No | Yes | Defer | n/a |
| F10 | No status history table | `ApplicationStatusEvent` | No | Yes | Defer | n/a |
| F11 | No email on status change | Transactional path | No | Behavior + opt-in | Defer | n/a |

## 10. Recommended PR split (when the user approves implementation)

Each independently reviewable. None require schema, auth, or RBAC.

1. `feat/save-toggle-listing-and-browse` — F1 + F2. Single
   `<SaveButton listingId>` component used on both surfaces.
2. `feat/compare-toggle-listing-and-browse` — F3.
3. `feat/applicant-status-timeline-and-descriptors` — F4 + F5.
4. `feat/applicant-withdraw-button` — F6.
5. `feat/saved-compare-empty-states` — F7.

Order rationale: F1+F2 first (biggest funnel unlock), F4+F5 next
(applicant-side trust), F3 + F6 + F7 are smaller and parallel.

## 11. Hard rules (carried forward)

- No push.
- No PR.
- No deploy.
- No Vercel mutation.
- No `prisma/schema.prisma` edit.
- No new migrations.
- No new auth flows.
- No new role values.
- No document upload.
- No outbound email beyond existing fire-and-forget admin notification.
- No #52 interaction.
- No "Express interest" affordance on listings until participating
  flag exists.
- No public claim of "official application system,"
  "hospital-approved," "verified by hospitals," or "guaranteed."
