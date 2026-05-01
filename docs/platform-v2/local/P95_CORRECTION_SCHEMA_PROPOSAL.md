# P95 — Correction workflow schema proposal (v2, DEFERRED)

This document captures the schema work required to lift the v1
no-schema correction workflow into a hospital-trustable system with
named lifecycle states and institution-side verification.

**Nothing here is implemented.** No migration is generated. No
`prisma/schema.prisma` edits in this branch. Approval and a separate
explicit task are required before any of this lands.

## Why we did not implement this in v1

- v1 ships meaningful coordinator-facing improvements without any
  migration by leveraging the existing free-string
  `AdminMessage.category` column and the existing `FlagReport` model.
- A real `CorrectionRequest` model needs careful design around: who
  can submit, abuse controls, audit trail, requester identity (with
  optional institution), and the status lifecycle. That deserves its
  own design pass, not a side-effect of a copy/UX PR.
- Vercel canonical project is currently rate-limited; running migrations
  would compound deployment risk.

## Proposed model: `CorrectionRequest`

```prisma
model CorrectionRequest {
  id                   String                   @id @default(cuid())

  // Subject of the correction. Either a listing or an organization
  // (or both). At least one of listingId / organizationId required.
  listingId            String?
  listing              Listing?                 @relation(fields: [listingId], references: [id])
  organizationId       String?
  organization         Organization?            @relation(fields: [organizationId], references: [id])

  // Requester. Either an authenticated user (preferred) or an
  // anonymous submission with optional contact info.
  requesterId          String?
  requester            User?                    @relation(fields: [requesterId], references: [id])
  requesterName        String?
  requesterEmail       String?
  requesterRole        String?                  // "coordinator" | "physician" | "applicant" | "other"
  requesterInstitution String?                  // free text — hospital/practice name as the requester sees it

  // Intent.
  requestType          CorrectionRequestType
  message              String                   // 10–5000 chars
  proposedSourceUrl    String?

  // Lifecycle.
  status               CorrectionRequestStatus  @default(PENDING)
  adminNotes           String?
  reviewedById         String?
  reviewedBy           User?                    @relation("CorrectionReviewer", fields: [reviewedById], references: [id])
  reviewedAt           DateTime?
  resolvedAt           DateTime?

  // Abuse controls.
  ipHash               String?
  userAgent            String?

  createdAt            DateTime                 @default(now())
  updatedAt            DateTime                 @updatedAt

  @@index([status, createdAt])
  @@index([listingId])
  @@index([organizationId])
  @@map("correction_requests")
}

enum CorrectionRequestType {
  INSTITUTION_UPDATE      // hospital-side coordinator updating program details
  REMOVAL_REQUEST         // institution wants the listing removed
  SOURCE_UPDATE           // official source URL changed
  COORDINATOR_CORRECTION  // factual correction from a program coordinator
  APPLICANT_CORRECTION    // factual correction from an applicant who knows a detail
  DUPLICATE_REPORT        // listing duplicates another
  OTHER
}

enum CorrectionRequestStatus {
  PENDING
  IN_REVIEW
  ACCEPTED
  REJECTED
  NEEDS_MORE_INFO
  RESOLVED
  WITHDRAWN
}
```

### Status lifecycle

```
PENDING → IN_REVIEW → ACCEPTED → RESOLVED
                 → REJECTED
                 → NEEDS_MORE_INFO → IN_REVIEW
PENDING → WITHDRAWN
```

### Backfill considerations

- Existing `FlagReport` rows with `kind = INCORRECT_INFO` could be
  optionally one-way migrated as "historical" `CorrectionRequest`s.
  Not required for v2 launch.
- `AdminMessage` rows with `category` in
  `{institution_update, removal_request, source_update,
  coordinator_correction}` could similarly be classified historically.
  Not required.

## Proposed model: `OrganizationClaim`

For institution verification:

```prisma
model OrganizationClaim {
  id                  String                  @id @default(cuid())
  organizationId      String
  organization        Organization            @relation(fields: [organizationId], references: [id])

  claimerId           String
  claimer             User                    @relation(fields: [claimerId], references: [id])

  claimerRole         String                  // "GME coordinator" | "Program director" | "Practice administrator" | etc.
  institutionalEmail  String                  // must match domain on Organization.websiteDomain
  proofUrl            String?                 // optional: page on the official site that names the claimer
  notes               String?

  status              OrganizationClaimStatus @default(PENDING)
  reviewedById        String?
  reviewedBy          User?                   @relation("OrgClaimReviewer", fields: [reviewedById], references: [id])
  reviewedAt          DateTime?
  resolvedAt          DateTime?

  createdAt           DateTime                @default(now())
  updatedAt           DateTime                @updatedAt

  @@index([status, createdAt])
  @@index([organizationId])
  @@map("organization_claims")
}

enum OrganizationClaimStatus {
  PENDING
  IN_REVIEW
  VERIFIED
  REJECTED
  NEEDS_MORE_INFO
  REVOKED
}
```

Key design point: a verified `OrganizationClaim` is **not** a
"hospital approval" of USCEHub. It just means a person at that
institution has been confirmed as authorized to manage their org's
listings. We never display "verified by hospital" or "official
partner". A future poster page may show a small neutral
"Coordinator-managed" tag distinct from any external verification.

## Proposed `Listing` field additions

```prisma
model Listing {
  // ...existing fields...

  // Hospital-side confirmation. Distinct from `linkVerified` and
  // `lastVerifiedAt`, which describe the URL/cron status.
  lastInstitutionConfirmedAt   DateTime?
  lastInstitutionConfirmedById String?
  lastInstitutionConfirmedBy   User?     @relation("ListingInstitutionConfirmer", fields: [lastInstitutionConfirmedById], references: [id])
}
```

## API surface (deferred)

- `POST /api/correction-requests` — public submission (rate-limited,
  optional auth, captcha on anonymous path).
- `GET /api/correction-requests/[id]` — requester sees their own
  request status.
- `PATCH /api/admin/correction-requests/[id]` — admin transitions.
- `POST /api/organization-claims` — coordinator submits a claim.
- `PATCH /api/admin/organization-claims/[id]` — admin reviews.
- All admin transitions write to `AdminActionLog`.

## UX surface (deferred)

- Listing detail "Suggest a correction" → real form (not just a
  prefill into `/contact-admin`).
- For-Institutions → "Claim this institution" path.
- Per-listing trust block shows "Last confirmed by institution"
  separately from "Last verified link".
- Requester-side "My correction requests" view.

## Migration risks

- Adding the two new models is backward-compatible — no existing rows
  affected.
- Adding `lastInstitutionConfirmedAt` to `Listing` is additive and
  nullable — safe.
- Backfill is optional and not required for the system to function.
- Indices on `(status, createdAt)` keep admin queues fast.

## Rollout phases (deferred)

1. **Schema PR** (Prisma + migration). No UI.
2. **Backend PR** (API routes + admin write paths + AdminActionLog
   wiring). Behind a feature flag.
3. **Public UX PR** (replace the v1 prefill link with the real form).
4. **Coordinator claim PR** (`OrganizationClaim`).
5. **Listing detail "last confirmed by institution" badge** wired off
   `lastInstitutionConfirmedAt`.

Each phase reviewable independently. Each phase reversible by feature
flag and (for schema) by additive-only migration.

## Hard rules carried forward

- Never display "verified by hospital", "official partner",
  "hospital-approved", "guaranteed rotations", "best programs",
  "top-rated".
- Verified claim ≠ representation. Surface state, not claim.
- Correction requests are reviewed before public changes — never
  auto-applied.
- Removal requests are reviewed; we do not guarantee removal
  timeframes.
- All admin actions write to `AdminActionLog`.
- All status transitions visible to the requester via email.
- Anonymous submissions allowed but rate-limited and never auto-applied.
