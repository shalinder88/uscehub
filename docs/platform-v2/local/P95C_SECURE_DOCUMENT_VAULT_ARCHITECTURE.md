# P95-C — Secure document vault architecture audit

Local-only architecture audit. **No code. No schema. No auth changes.
No storage client. No UI.** Branch:
`local/p95-hospital-correction-workflow`. Not pushed.

This document specifies the future accepted-candidate
document-upload/onboarding vault. It exists so that when the time
comes to build, we are not designing security under deadline.

## 1. Executive decision

Document upload is **deferred**. No production document upload exists,
will be built, or will be rolled out until the security foundation in
§5 is completely in place and reviewed. The work in this document is
specification only.

Rationale:

- Documents the platform may eventually accept (passports, visa
  documents, immunization records, malpractice insurance, background
  checks, etc.) are sensitive PII and immigration data. Mishandling
  them is a real-world harm to applicants.
- USCEHub today is a directory + correction layer. It does not yet
  have verified institution identity, RBAC, per-program permissions,
  audit logs scoped to documents, private object storage, or an
  incident-response plan. All of those must precede a single
  document.
- The product can ship the institution-side value (program
  dashboard, candidate intake, status tracking) **without** taking
  custody of any documents. Section 15 specifies that v1-safe
  alternative.

## 2. Product role in sequence

```
1. Directory                       — built
2. Correction / update / removal   — v1 on this branch (P95-A)
3. Institution claim / profile     — audited (P95-B)
4. Program dashboard               — future (P95-D)
5. Candidate intake / application  — future (P95-E)
6. Secure document vault           — THIS DOCUMENT (P95-C, deferred)
7. Onboarding workflow             — depends on §6 (P95-F)
```

P95-C is the longest-tail layer. It does not block P95-A/B/D/E and
should not be allowed to.

## 3. Document types USCEHub may eventually accept

Every type below is **not yet accepted** anywhere in the product.

| Category | Examples |
| --- | --- |
| Identity | Photo ID, passport, government-issued ID |
| Immigration | Visa stamp, I-94, I-20, DS-2019, EAD, J-1 status, B1/B2 visa, ECFMG sponsor letter |
| Education | Medical school diploma, transcript, ECFMG certification status, MSPE / Dean's letter |
| Credentials | NPI confirmation, ACLS, BLS, PALS, board certification |
| Health | Immunization records (MMR, Tdap, Hep B, varicella), TB testing/QuantiFERON, COVID series, flu shot, titers, drug screen, physical exam form |
| Background | Background check, OIG / SAM exclusion check, fingerprint, child-abuse clearance |
| Insurance | Malpractice / professional liability declaration page, health insurance card, COI |
| Letters | Letters of recommendation, sponsor letters, GME-office offer letter |
| Other | Photo, signed program-specific forms, signed acknowledgment / affirmation |

The list is **descriptive of the space**, not prescriptive of what the
vault will support. v1 of the vault should cover only what an
institution actually requests; everything else stays out.

## 4. Risk classification

| Risk class | Examples | Disclosure floor |
| --- | --- | --- |
| R1 — High-sensitivity PII | Passport, visa, government ID, NPI | Encrypted at rest, audited every view, retention default short, candidate can revoke |
| R2 — Immigration | I-20, DS-2019, EAD, sponsor letters | R1 controls + visibility limited to coordinators on the specific program |
| R3 — Health | Immunization, drug screen, physical exam | R1 controls + healthcare-context handling expectations |
| R4 — Credentialing | Diploma, transcript, ACLS, board cert | Encrypted at rest, audited, lower urgency than R1 |
| R5 — Insurance | Malpractice declaration page, health insurance card | R4 controls + redaction guidance for account numbers |
| R6 — Letters | Letters of recommendation, sponsor letters | R4 controls + author-attribution metadata kept separate from blob |
| R7 — Other low-sensitivity | Photo (non-ID), signed acknowledgments | Standard private-bucket controls |

The vault must support **at minimum** R1, R2, R4, R5, and R6 from
day one. R3 (health) and any state-specific clearances are deferred
until a separate health-data review.

## 5. Required security foundation (the wall)

None of the following exists in production today. Each is a build
requirement, not a "nice-to-have." If any one is missing at launch,
the vault does not launch.

1. **Strong auth.** Email + password is the floor. Email
   verification mandatory. MFA (TOTP) required for any account that
   has document-view capability. Session timeout, secure cookies,
   CSRF protection on all mutating routes.
2. **Verified institution identity.** A coordinator's account is
   tied to a verified `Organization` (P95-B L2 or L3). No
   unverified-org coordinator may view documents.
3. **RBAC.** A real role tier per `OrganizationMembership`:
   `OWNER | COORDINATOR | VIEWER` at minimum. Roles are the *only*
   thing that grants document access; ownership of the listing alone
   does not.
4. **Per-program permissions.** A coordinator may be granted access
   to specific programs/listings inside their org and excluded from
   others. The grant is per-listing, never org-wide by default.
5. **Accepted-candidate gating.** A coordinator may only view
   documents of a candidate who has been explicitly *accepted* for
   *that program*. Not "interested," not "applied" — accepted.
6. **Audit logs.** Every upload, view, download, replace, delete,
   and status change is logged with `(actorId, action, targetId,
   ipHash, userAgent, createdAt)`. Logs are append-only and visible
   in the admin queue.
7. **Private object storage.** Files live outside the database and
   outside the public asset prefix. Buckets are private by default.
   Bucket policy denies public read.
8. **No public URLs.** A document URL is never long-lived. No
   `cdn.uscehub.com/documents/...`. No `?token=...` URLs that work
   for a week.
9. **Short-lived signed URLs.** Every download issues a one-time
   signed URL with a TTL of minutes, scoped to a single object,
   tied to the requester's session.
10. **Upload + download logging.** Every issuance of a signed URL is
    logged. Every successful upload writes a `DocumentAccessLog`
    entry. Every failed access attempt is logged.
11. **File type/size limits.** Allowlist of MIME types
    (`application/pdf`, `image/jpeg`, `image/png`, `image/heic`).
    Per-file size cap (e.g. 25 MB). Per-candidate aggregate cap.
12. **Retention/deletion policy.** Default per-document retention
    timer (e.g. 12 months after last status update) with auto-purge.
    Candidate-initiated deletion path. Institution-initiated retention
    extension requires admin review.
13. **Privacy policy update.** The privacy policy must enumerate
    what document categories are accepted, who can view them, how
    long they are kept, and how to request deletion.
14. **Terms update.** Both the candidate-side terms and the
    institution-side terms must include explicit consent and use
    sections.
15. **Incident response.** A documented runbook for the four
    scenarios in §12, with named on-call and a 24-hour first-response
    target. Drilled at least once before launch.

If any item 1–15 is missing or unverified, the vault is not in
production.

## 6. Storage architecture options

Three credible patterns. None is implemented. Database **never**
stores file blobs.

### 6.1 Option A — Supabase Storage private bucket (preferred default)

- Pros: already in the stack (auth + Postgres are Supabase), private
  buckets supported, signed URLs supported, RLS policies can be
  written against bucket metadata. Lower additional vendor count.
- Cons: signed URL semantics require careful policy authoring;
  request rate limits; bucket scaling history.
- Notes: each document gets its own object key. RLS policies on the
  metadata table mirror RBAC. No public bucket. Bucket name does
  not appear in any client code.

### 6.2 Option B — S3-compatible private bucket (AWS, R2, Backblaze)

- Pros: mature signed-URL ecosystem, easy bucket-policy lockdown,
  optional VPC + private endpoint. KMS-managed encryption keys.
- Cons: extra vendor, extra ops surface, IAM policies easy to
  misconfigure if not reviewed. Cross-region considerations.
- Notes: STS short-lived credentials for backend signing; no
  long-lived AWS keys committed; CloudTrail or equivalent audit log.

### 6.3 Option C — Vercel Blob

- Pros: closest to the existing deploy footprint.
- Cons: newer; private-mode + audit-log story less mature; vendor
  lock-in to Vercel. Signed URL fine-grain controls weaker.
- Recommendation: **not** the default for sensitive R1/R2/R3
  content.

### 6.4 Decision

Default recommendation is **Option A (Supabase private bucket)**
because we already have a Supabase tenancy and can keep RLS as the
single chokepoint. Option B is the fallback if the security review
later finds Supabase Storage insufficient for R1/R2 retention and
audit needs. Option C is excluded for sensitive categories.

The decision is **not final** until Phase 1 of the build (see §16).

### 6.5 Database

The Postgres database stores **metadata only**:
- `CandidateDocument` row (status, type, owner, related program,
  storage object key — never the file).
- `DocumentRequest` row (which program asked for what).
- `DocumentAccessLog` rows (every event).

No `bytea`, no base64, no inline blob.

## 7. Access model

Three actor classes, three different access shapes:

### 7.1 Candidate

- May upload, replace, and delete their own documents.
- May view their own documents via short-lived signed URL.
- May see which institutions/programs have requested which
  documents from them.
- **Cannot** see another candidate's documents.
- **Cannot** see institution-private notes.
- May revoke access to a specific institution at any time, which
  triggers a status-change event but does **not** auto-delete the
  blob (institution may have already downloaded for compliance).
  Deletion is a separate request reviewed by admin.

### 7.2 Institution coordinator

- May only view a candidate's documents if **all** of the following
  are true:
  1. Coordinator's `OrganizationMembership.role` is `OWNER` or
     `COORDINATOR`.
  2. The membership is on the same `Organization` that owns the
     listing.
  3. The coordinator has explicit per-listing access to *this*
     listing (per-program gating).
  4. The candidate has been moved to status `accepted` for *this*
     listing.
  5. The document type was specifically requested by this
     listing/program.
- May download via short-lived signed URL only. URLs expire.
- Cannot bulk-download.
- Cannot share signed URLs (URLs are tied to the actor's session).
- May write status (`accepted`, `needs_replacement`, `rejected`)
  but cannot delete.
- Every action is logged to `DocumentAccessLog`.

### 7.3 USCEHub admin

- May view audit logs, status, and metadata.
- May read documents only when responding to an explicit
  abuse/incident report; reads are flagged as `ADMIN_OVERRIDE` in
  the access log and immediately surfaced in an admin daily
  digest.
- Cannot silently access documents.
- Cannot delete documents without an audit entry.

## 8. Document lifecycle

```
REQUESTED       — coordinator created a DocumentRequest for this candidate
UPLOADED        — candidate uploaded the file
NEEDS_REPLACEMENT — coordinator marked the upload incomplete/incorrect
ACCEPTED        — coordinator marked the upload acceptable
REJECTED        — coordinator marked the upload unacceptable (final-ish)
EXPIRED         — retention timer fired
DELETED         — explicit deletion via candidate request or admin override
```

State transitions are linear except `NEEDS_REPLACEMENT → UPLOADED`
on candidate replacement. Every transition writes an access log.

## 9. Audit events

Every event captures `(actorId, actorRole, action, documentId,
candidateId, listingId, organizationId?, ipHash, userAgent,
createdAt)`.

| Event | Triggered by |
| --- | --- |
| `UPLOAD` | Candidate uploads a new document |
| `REPLACE` | Candidate replaces an existing document |
| `VIEW_SIGNED_URL_ISSUED` | A signed URL was minted |
| `DOWNLOAD_COMPLETED` | The signed URL was used (best-effort, via storage callback) |
| `STATUS_ACCEPTED` | Coordinator accepts |
| `STATUS_REJECTED` | Coordinator rejects |
| `STATUS_NEEDS_REPLACEMENT` | Coordinator requests replacement |
| `DELETE_REQUESTED` | Candidate requests deletion |
| `DELETE_EXECUTED` | Admin or auto-purge executes deletion |
| `ACCESS_DENIED` | Any blocked attempt — RBAC mismatch, expired URL, wrong listing |
| `ADMIN_OVERRIDE` | Admin reads a document outside normal flow |
| `RETENTION_TIMER_FIRED` | Auto-purge job acts on a document |

## 10. Candidate consent

- At account creation: a separate consent panel for "documents you
  may later upload." No upload until consent is recorded.
- At first upload: per-document consent — the candidate sees a
  short, plain-language explanation of who will see the document,
  retention, and revocation. Consent is logged with timestamp +
  policy version.
- At each status change: candidate is notified.
- Consent is **not** transferable across organizations. Uploading
  for hospital A does not authorize hospital B to view.

## 11. Institution coordinator obligations

When an institution claims a program (P95-B) and is granted
document-view access (P95-C), they explicitly accept:

- Documents are viewed only for accepted candidates of programs
  they manage.
- No external sharing, screenshotting, or persistence outside their
  own systems.
- Compliance with their own institution's privacy/security policy
  is their responsibility.
- They may export the documents for institutional records, but the
  export is logged.
- Misuse is grounds for revocation.

## 12. Abuse / threat model

| Threat | Vector | Control |
| --- | --- | --- |
| Leaked signed URL | Coordinator pastes URL into chat | Short TTL (minutes), single-use, tied to session |
| Wrong coordinator views document | RBAC misconfig | Per-listing acl + accepted-status gate, RLS as second wall |
| Malicious upload | Candidate uploads a malicious file | MIME allowlist, size cap, virus-scan integration before status moves to UPLOADED |
| Oversized file | Candidate uploads a 4 GB blob | Per-file + per-candidate caps; rate limit |
| Document persistence after withdrawal | Candidate withdraws but coordinator already downloaded | Candidate-initiated deletion logs the post-download state; institution acceptance of obligations §11 |
| Admin overreach | Admin reads documents off-process | Every admin read logs `ADMIN_OVERRIDE` and appears in daily digest |
| Public bucket misconfiguration | Bucket accidentally set public | CI / IaC check, periodic third-party scan, alarm on bucket policy change |
| Signed URL replay | URL leaked to attacker | TTL + IP/session binding where supported |
| Cross-tenant access | Coordinator at org A reads doc owned by candidate not in their org | RLS + RBAC + per-listing acl all four checks fail before issuance |
| Audit-log tampering | Admin tries to alter logs | Logs append-only, periodic export to immutable storage |

## 13. Minimum schema proposal (deferred)

This is a **proposal**. Not implemented in this branch.

```prisma
model DocumentRequest {
  id              String                   @id @default(cuid())
  programCandidateId String                // FK to ProgramCandidate
  documentType    String                   // allowlist enforced in app
  status          DocumentRequestStatus    @default(REQUESTED)
  requestedById   String                   // coordinator user
  requestedAt     DateTime                 @default(now())
  notes           String?
  @@index([programCandidateId, status])
  @@map("document_requests")
}

model CandidateDocument {
  id              String                   @id @default(cuid())
  candidateId     String                   // FK to User
  documentRequestId String?                // optional — uploads can predate request in some flows
  documentType    String
  storageObjectKey String                  // opaque key into Supabase/S3 bucket
  filename        String
  mimeType        String
  byteSize        Int
  status          CandidateDocumentStatus  @default(UPLOADED)
  retainUntil     DateTime?                // auto-purge fires when reached
  uploadedAt      DateTime                 @default(now())
  updatedAt       DateTime                 @updatedAt
  deletedAt       DateTime?
  @@index([candidateId, status])
  @@index([retainUntil])
  @@map("candidate_documents")
}

model DocumentAccessLog {
  id              String                   @id @default(cuid())
  documentId      String?
  actorId         String?
  actorRole       String
  action          String                   // see §9 enum-like list
  candidateId     String?
  listingId       String?
  organizationId  String?
  ipHash          String?
  userAgent       String?
  createdAt       DateTime                 @default(now())
  @@index([documentId, createdAt])
  @@index([actorId, createdAt])
  @@map("document_access_logs")
}

model ProgramCandidate {
  id              String                   @id @default(cuid())
  candidateId     String                   // FK User
  listingId       String                   // FK Listing
  status          ProgramCandidateStatus   @default(INTERESTED)
  acceptedAt      DateTime?
  withdrawnAt     DateTime?
  @@unique([candidateId, listingId])
  @@map("program_candidates")
}

enum DocumentRequestStatus {
  REQUESTED
  FULFILLED
  CANCELED
}

enum CandidateDocumentStatus {
  UPLOADED
  NEEDS_REPLACEMENT
  ACCEPTED
  REJECTED
  EXPIRED
  DELETED
}

enum ProgramCandidateStatus {
  INTERESTED
  SUBMITTED
  UNDER_REVIEW
  SHORTLISTED
  ACCEPTED
  WAITLISTED
  DECLINED
  ONBOARDING_REQUESTED
  ONBOARDING_COMPLETE
  WITHDRAWN
}
```

`ProgramCandidate` is shared with the candidate-intake layer (P95-E)
and **must** be designed there, not here. It is referenced from
`P95-C` only because document access keys off `accepted` status.

This proposal carries dependencies:
- Requires `OrganizationMembership` from P95-B.
- Requires per-listing ACLs (also from P95-B).
- Requires email-verified, MFA-enabled actors (P95-C §5 item 1).
- Requires private storage (P95-C §6).

## 14. No-build gates

The vault will not be built until **all** of these are true:

- [ ] P95-B institution claim/profile architecture: **implemented**
      and merged. Coordinators have verified org affiliation.
- [ ] `OrganizationMembership` and per-listing ACLs: **implemented**
      and merged.
- [ ] MFA available for coordinator and admin accounts.
- [ ] Private storage choice from §6 finalized; bucket created;
      policy verified denying public reads; signed URL TTL ≤ 5 min.
- [ ] Privacy policy updated with the document-handling section.
- [ ] Terms updated with candidate consent section.
- [ ] Incident-response runbook drafted; on-call named.
- [ ] Security review by an outside reviewer or peer.
- [ ] At least one full audit-log replay drill.
- [ ] CI guardrail asserts no public bucket policy.
- [ ] Vercel rate-limit and deploy stability post-cleanup.

If any box is unchecked, the vault stays off.

## 15. v1 safe alternative before upload (the practical lane)

USCEHub can deliver most of the perceived value without storing a
single document. Recommended interim:

1. **Onboarding checklist.** Per accepted candidate per program, the
   coordinator marks documents as
   `requested → received-elsewhere → acknowledged`. We track
   *status*, not files.
2. **External upload link.** The coordinator pastes their
   institution's existing secure upload URL (Workday, ServiceNow,
   GME Track, etc.) and the candidate is directed to upload there.
3. **No file storage on USCEHub.** Documents never touch our
   infrastructure.
4. **Audit-log of the checklist transitions only.** Same model as
   the rest of the platform.

This pattern is what most non-EHR platforms do until they have
genuine reason to take custody. It is the right v1 unless an
institution explicitly asks for in-platform upload and is willing
to wait for the full §5 foundation.

## 16. Implementation phases (when the gates clear)

Each phase reviewable independently.

| Phase | Deliverable | Gate |
| --- | --- | --- |
| Phase 0 | Privacy + terms updates, public-policy-only PR | Lawyer review |
| Phase 1 | Storage choice locked; bucket created; CI public-bucket assertion | Security review |
| Phase 2 | Schema migration for `DocumentRequest`, `CandidateDocument`, `DocumentAccessLog`, `ProgramCandidate` | Backup + reversible additive migration |
| Phase 3 | Backend signing + RBAC + RLS + audit-log writers | Internal pen test |
| Phase 4 | Candidate upload UI behind a feature flag, internal testing | Drill on §12 threats |
| Phase 5 | Coordinator view UI behind feature flag | Drill on §12 threats |
| Phase 6 | Public rollout to a single pilot institution | Daily audit-log review for 30 days |
| Phase 7 | General availability | All gates re-checked |

## 17. QA / security checklist (per phase)

- [ ] Public bucket scan returns zero public objects.
- [ ] CI fails any PR that introduces a public-bucket policy change.
- [ ] Signed URL TTL verified ≤ 5 minutes in code + storage policy.
- [ ] No object key contains user-derived names (PII leak via key).
- [ ] No file-blob field exists in any Prisma model.
- [ ] No `bytea` columns added.
- [ ] No environment variable points to a public-readable bucket.
- [ ] All routes that mint signed URLs require a fresh session.
- [ ] All routes that view documents require MFA when actor role is
      coordinator or admin.
- [ ] All status transitions write a `DocumentAccessLog` row.
- [ ] All `ADMIN_OVERRIDE` reads are surfaced to a daily digest the
      day they occur.
- [ ] All deletions are reversible only inside the retention window
      and never silently.
- [ ] All upload routes enforce MIME allowlist and size caps.
- [ ] All download routes refuse to serve `DELETED` or `EXPIRED`
      documents.

## 18. Explicit forbidden claims

These claims are forbidden in any UI or marketing copy that mentions
the vault:

- "Official application system for U.S. hospitals"
- "Hospital-approved document upload"
- "Verified by hospitals"
- "Secure" — without qualification or audit reference
- "Bank-level security" / "military-grade encryption"
- "HIPAA-compliant" — only if a real BAA + compliance review
  exists, and even then phrased as the actual scope of the BAA
- "Guaranteed onboarding"
- "Approved by ECFMG"
- "Endorsed by NRMP / AAMC / AMA"

Use instead:

- "Documents are stored in a private bucket and accessed via
  short-lived links."
- "Documents are visible only to accepted candidates' assigned
  program coordinators."
- "Every document view is logged."
- "We do not host documents until your program coordinator has
  requested them."

## 19. Open decisions for the user

1. Confirm storage default: Supabase private bucket (Option A) vs
   S3-compatible (Option B)?
2. Confirm MFA requirement for **all** institution coordinators or
   only those with document-view permission?
3. Confirm document retention default (12 months? 6? 24?).
4. Confirm whether candidates may pre-upload documents *before* a
   coordinator requests them, or strictly upload-on-request only.
5. Confirm whether USCEHub admin has any baseline document-read
   capability or only `ADMIN_OVERRIDE` for incident response.
6. Confirm whether the v1-safe checklist alternative (§15) is
   acceptable as the **default** institution onboarding experience,
   with the vault as an optional later upgrade per institution.

The default — pending answers — is to defer all of P95-C and ship
§15's checklist alternative when P95-D and P95-E land.

## 20. Hard rules carried forward

- No code in this round.
- No `prisma/schema.prisma` edits.
- No new auth flows.
- No new role values.
- No storage client.
- No storage SDK installed.
- No bucket creation.
- No upload route.
- No download route.
- No UI.
- No PR. No push. No deploy. No Vercel mutation.
- No #52 interaction.
- No public claim of "secure" or "verified by hospital."
- The branch stays `local/p95-hospital-correction-workflow` until
  the user explicitly directs otherwise.
