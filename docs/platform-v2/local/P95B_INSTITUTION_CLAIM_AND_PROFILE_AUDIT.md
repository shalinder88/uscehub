# P95-B — Institution claim & profile architecture audit

Local-only architecture audit. **No code, no schema, no migration.**
Branch: `local/p95-hospital-correction-workflow`. Not pushed.

This document specifies the institution claim/profile layer that
sits between the v1 correction workflow (P95-A, partially landed on
this branch as docs + no-schema code) and the program dashboard
(P95-C, future). It is designed to be reviewable and reversible
before any code is written.

## 0. Locked sequence (recap)

```
1. Directory                       — built
2. Correction trust layer          — v1 docs + no-schema code on this branch
3. Institution claim / profile     — THIS DOCUMENT
4. Program dashboard               — future (P95-C)
5. Candidate intake / application  — future (P95-D)
6. Secure document vault           — future (P95-E), security-heavy
7. Onboarding workflow             — future (P95-F)
```

P95-B does **not** include: document upload, candidate dashboards,
real messaging, hospital "verified by" badges, payment, public
instant-claim buttons, or institution-wide trust claims.

## 1. Goal

Allow a person at a U.S. hospital, GME office, or program team to:

1. Find a listing on USCEHub that points at their institution.
2. Submit a structured claim or update request.
3. Be verified through a conservative process (institutional email
   domain + admin review).
4. Once verified, manage the small set of fields they should be
   allowed to manage (program details on listings owned by their
   organization, official source URL, last-confirmed timestamp).
5. Never see the system grant claims of "hospital approval" or
   "official partnership." Verification grants the right to manage
   *information*, not the right to be labeled "approved."

## 2. Existing surface (what we already have)

### 2.1 Models

| Model | Relevant fields | Notes |
| --- | --- | --- |
| `User` | `role: APPLICANT | POSTER | ADMIN`, `email`, `emailVerified` | No institutional role tier yet. |
| `PosterProfile` | `npiNumber`, `institutionalEmail` (string), `title`, `verificationStatus`, `adminNotes` | Covers the individual poster identity. |
| `Organization` | `ownerId @unique`, `name`, `website`, `institutionalEmail` (Boolean — admin-controlled), `verificationStatus`, `badges`, `adminNotes` | One owner per org. No multi-coordinator. |
| `Listing` | `posterId`, `organizationId?`, `linkVerificationStatus`, `lastVerifiedAt`, `linkVerified` | Already supports per-link verification trail. |
| `DataVerification` | `targetType`, `targetId`, `sourceType`, `httpStatus`, `finalUrl`, `notes` | Per-link audit trail. |
| `AdminActionLog` | `adminId`, `action`, `targetType`, `targetId`, `notes` | Already captures admin actions. |

### 2.2 API + UI

- `POST/PATCH /api/organizations` — owner can create one org per
  user, then patch content fields. `verificationStatus`, `badges`,
  `adminNotes`, and the `institutionalEmail` Boolean are admin-only
  via `organization-update-guard.ts`.
- `POST /api/poster-profile` — sets `npiNumber`, `institutionalEmail`
  (string), bumps poster `verificationStatus` to PENDING.
- `/admin/posters` — admin queue for poster verification (NPI +
  institutional email shown).
- `/poster/organization` — owner-side organization editor.
- `/poster/verification` — owner-side verification status view.

### 2.3 What is NOT present

- No way for a user to claim a listing that already exists in the
  system (e.g. the "USCEHub Directory" bulk-imported rows). The only
  path today is "create your own organization, then create your own
  listings."
- No multi-coordinator support per organization (`ownerId @unique`
  forces exactly one human per org).
- No structured proof-of-affiliation (only `npiNumber` and a free
  `institutionalEmail` string).
- No domain match between `Organization.website` and
  the user's email.
- No record of *which listings* the org has confirmed lately,
  separate from automated link verification.
- No public-facing label policy. `badges` is a free string column;
  whatever lands there shows in the UI.

## 3. Constraint walls (what we will not do)

| Wall | Why |
| --- | --- |
| No "Verified by hospital" / "Hospital-approved" / "Official partner" labels | Verification of *a person at* an institution is not the same as the institution endorsing USCEHub. |
| No public instant-claim button | Increases impersonation risk. Claims must be reviewed. |
| No "hospital control" of badges | Badges remain admin-controlled. Verified coordinators cannot grant their own badges. |
| No document upload at this phase | Belongs to the secure vault phase (P95-E). |
| No multi-tenant feature parity with paid platforms | Out of scope; we're building a trust layer, not a SaaS portal. |
| No automatic email scraping / WHOIS lookups | Privacy + brittle. |
| No exposure of `Listing.posterId` to other coordinators | Even within the same org, posters stay scoped. |
| No bypass of `organization-update-guard.ts` | The guard is the single chokepoint for org PATCH. |
| No cron-based domain verification | Verification is admin-mediated for now. |

## 4. Three claim modes

The correct claim flow depends on how the listing got there.

### 4.1 Mode A — listing has no owner (system-imported)

The most common case today. `Listing.posterId` points at the
"USCEHub Directory" system user. No real human owns it.

Desired flow:

1. Visitor clicks "Suggest an update" → `/contact-admin?category=coordinator_correction&...` (already wired in v1).
2. If they signal affiliation in the message, admin invites them to
   sign up as a poster, create an `Organization`, and submit
   institutional-email proof.
3. Admin manually re-points or duplicates the listing under the
   verified `Organization` once verified, using existing `/admin/listings` tools.
4. The listing's verification surface gains a "Last confirmed by
   institution: <date>" line — but this requires the
   `lastInstitutionConfirmedAt` schema field proposed in
   `P95_CORRECTION_SCHEMA_PROPOSAL.md`.

What is no-schema today: steps 1–3, end-to-end, using existing infra.
What is deferred to schema: step 4's badge-side surfacing.

### 4.2 Mode B — listing was poster-submitted (already owned)

`Listing.posterId` is a real user; `organizationId` is set.

The owner-poster already has full edit rights via existing
`/poster/listings/[id]/edit`. No claim needed. Adding more
coordinators to the *same* organization requires the multi-coordinator
schema work (deferred).

### 4.3 Mode C — listing was poster-submitted but the wrong person owns it

Rare and adversarial. Out of scope until a future incident-response
process exists. Treat as an admin-mediated case via
`/contact-admin?category=removal_request`.

## 5. Verification ladder (proposed)

Verification levels are **descriptive labels for admins**, not public
trust claims.

| Level | Signal | Admin-side meaning | Public surface |
| --- | --- | --- | --- |
| L0 — Unverified | New poster signup | No claim of affiliation. | No special label. |
| L1 — Email-domain match | `User.emailVerified = true` AND `User.email`'s domain matches `Organization.website` domain | We checked at least that the email domain looks right. | No public label yet. |
| L2 — Coordinator-confirmed | L1 + admin-reviewed proof (e.g. a page on the institution's site naming the person, or a reply from the institution's GME office) | Admin signed off. | Internal "Coordinator-managed" tag (no claim of hospital endorsement). |
| L3 — Institution-confirmed | L2 + a `lastInstitutionConfirmedAt` per-listing timestamp | A coordinator at the org has actively confirmed this specific listing recently. | Per-listing trust line: "Last confirmed by institution YYYY-MM-DD." Subtle, optional, never above the source-link check. |

L0 / L1 exist today (modulo the domain match check, which is missing
but no-schema). L2 / L3 require the schema work in
`P95_CORRECTION_SCHEMA_PROPOSAL.md`.

**Hard rule:** none of L0–L3 produce a "verified by hospital" or
"endorsed by hospital" label. Even L3's surface is
"Last confirmed by institution," which is an audit fact, not a
claim of approval.

## 6. RBAC implications (deferred)

A real institution-claim flow eventually needs:

- Organization → multiple users.
- Per-user role inside an org: `OWNER | COORDINATOR | VIEWER`.
- Per-listing acl scoped to org members.
- Per-program override: a coordinator may manage some programs and
  not others.
- Audit log every role mutation.

None of that is in the schema today. Implementing any of it requires
a schema migration. **Not in scope for this branch.**

Interim (no-schema) workaround: continue with single `ownerId` per
org. If a real institution shows up wanting two coordinators, the
admin manually swaps the owner or designates the listings to a
specific user — clunky but safe.

## 7. Logo policy (proposed, deferred)

Logos are tempting and dangerous. They imply institutional buy-in and
are trademarked.

Proposal:

- Do **not** display third-party institution logos on listing pages
  unless the listing is L3-verified (institution-confirmed).
- Even for L3, prefer a small text mark ("Coordinator-managed") to a
  rendered logo.
- If a logo is ever added, source it from a coordinator-uploaded
  asset on the verified `Organization`, not from cached third-party
  CDNs. Trademark and likeness rules apply.
- Never auto-fetch favicons or scrape brand assets to display.

Today: do not add logo fields. The `Organization` model has no logo
column; keep it that way until L3 lands.

## 8. Public copy guardrails

Use:
- "Coordinator-managed"
- "Last confirmed by institution"
- "Suggest a correction"
- "Request an update"
- "Request removal or review"
- "Official source"
- "Source needs review"
- "Source on file"

Do not use:
- "Hospital-verified"
- "Hospital-approved"
- "Official partner"
- "Approved by"
- "Endorsed by"
- "Verified institution"
- "Verified hospital"
- "Sponsored by"
- "In partnership with"

(Updates to `for-institutions/page.tsx` and `methodology/page.tsx`
in P95-A already lean on the safe vocabulary.)

## 9. Gap table

| # | Current state | Needed state | Schema needed? | Phase |
| --- | --- | --- | --- | --- |
| B1 | Owner can patch org content; admin owns verification fields. | Same. | No | Already done |
| B2 | No claim flow for system-owned listings. | Admin-mediated claim via `/contact-admin?category=coordinator_correction`. | No | P95-A done |
| B3 | No domain match check between `User.email` and `Organization.website`. | A read-only check rendered on `/admin/posters` next to the email field. | No (computed in code) | P95-B implementation candidate |
| B4 | No "Last confirmed by institution" surfacing. | Per-listing field + badge. | Yes (`lastInstitutionConfirmedAt` on `Listing`) | Deferred |
| B5 | No multi-coordinator. | `Organization` → many users with org-scoped roles. | Yes (`OrganizationMembership` model) | Deferred (longer term) |
| B6 | No structured `OrganizationClaim`. | Real claim model with status lifecycle. | Yes | Deferred (proposed in P95 schema doc) |
| B7 | `badges` is a free string column. | Allowlist of admissible badge values, ideally an enum. | Schema preferred but not required (string-allowlist works) | Deferred |
| B8 | `Organization.logoUrl` does not exist. | Optional logo URL field gated to L3. | Yes | Deferred |
| B9 | No per-org page (`/o/<orgId>` or similar) showing all listings owned by the org. | Public org page with the org's listings + last-confirmed dates. | No (read-only view) | P95-B implementation candidate |
| B10 | Email-domain match logic is not surfaced anywhere. | Add a small derived "Email domain matches website" indicator on `/admin/posters` and `/poster/verification`. | No | P95-B implementation candidate |

## 10. P95-B no-schema implementation candidates (review only — do not build yet)

If the user later approves a no-schema slice of P95-B, these are the
candidates with the highest signal-to-risk ratio:

1. **Email-domain match indicator (B3 + B10).**
   - Compute a derived "domain match" between `User.email` and
     `Organization.website` host on the server.
   - Show in `/admin/posters` and `/poster/verification` only.
   - No new fields, no migration, no public surface change.
   - Risk: low. Behaves as a hint to admins, not a public claim.

2. **Public organization page (B9).**
   - Read-only page at `/organization/<id>` showing:
     - Org name, city/state, website (linked, with rel=noopener).
     - List of approved listings owned by the org.
     - The same trust badges per listing already rendered elsewhere.
   - No new schema, no public claim of hospital approval.
   - Pull verification status from the existing `verificationStatus`
     enum and only label it internally; do not show a "verified
     hospital" badge publicly.

3. **Documentation polish.**
   - Extend `for-institutions/page.tsx` with a small subsection
     explaining what claim looks like today (admin-mediated) vs what
     it will look like after the schema lands.
   - Extend `methodology/page.tsx` with the verification ladder
     (L0–L3) language, framed as future-state where applicable.

Not implementing any of these in this PR. The P95-B audit doc is the
output of this round.

## 11. Schema work to defer to a separate explicit task

(See `P95_CORRECTION_SCHEMA_PROPOSAL.md` for full detail.)

- `OrganizationClaim` model
- `Listing.lastInstitutionConfirmedAt` (+ confirmer FK)
- `OrganizationMembership` model + per-membership role
- `Organization.logoUrl` field with L3-gated rendering
- Badge allowlist enum

None of this lands without an explicit "implement schema for P95-B"
instruction, a migration plan, and a verified Vercel deploy state.

## 12. Hard rules carried forward

- No push of this branch.
- No PR.
- No deploy.
- No Vercel mutation.
- No `prisma/schema.prisma` edits.
- No new migrations.
- No `prisma db push`.
- No new auth flows.
- No new role values.
- No document upload, no file storage.
- No real outbound email beyond the existing fire-and-forget admin
  notification path.
- No public "verified by hospital" or "official partner" claim.
- No #52 branch interaction.

## 13. Next-step decision points (for the user)

1. Approve the L0–L3 ladder language as the public-facing
   verification doctrine?
2. Approve the B3 + B10 email-domain match indicator as a no-schema
   admin hint? (Tiny, safe, ships independently.)
3. Approve the B9 public organization page in read-only form? (Small
   route, no new claims.)
4. Defer all multi-coordinator / claim-model work until after #47,
   #44, #52 are resolved and Vercel is stable?

The default — pending explicit answers — is **defer everything in
P95-B except the audit doc itself.**
