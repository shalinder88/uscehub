# `/poster/*` flow audit (PR 0a)

**Doc status:** Binding factual reference + recommendation. Read-only investigation.
**Authority:** lower than [RULES.md](../../codebase-audit/RULES.md), [SEO_PRESERVATION_RULES.md](../../codebase-audit/SEO_PRESERVATION_RULES.md), [PLATFORM_V2_STRATEGY.md](../PLATFORM_V2_STRATEGY.md).
**Authored:** 2026-04-29.
**Audit target:** `/poster/*` routes + `PosterProfile` model + role boundaries + verification flow + overlap with proposed `InstitutionClaim` (decision A2 in [V2_DECISION_REGISTER.md](../V2_DECISION_REGISTER.md)).

---

## 1. Executive verdict

**Extend the existing `/poster/*` flow. Do NOT build a new `/institutions/claim` flow + new `InstitutionClaim` model.**

The existing `/poster/*` flow already implements the institution-claim domain via `PosterProfile` + `Organization` + `UserRole.POSTER`:

- Self-service signup with role selection
- Profile + organization profile creation
- Listing CRUD with admin moderation gate
- NPI / institutional-email verification flow
- Admin-side approval surface
- Audit log via `AdminActionLog`

It is a working v1 institution-side surface. Replacing it with a parallel `InstitutionClaim` model would duplicate ~80% of the data + auth surface while adding migration risk. **The right move is to harden + relabel, not replace.**

**However, the flow has 4 medium-severity security/integrity gaps** (§5, §8) that must be fixed before any monetization or institution outreach. None require schema changes.

**Recommended next action:** open follow-up PRs to (a) close the gaps in §5/§8, (b) add a "rebrand `/poster/*` → `/institutions/dashboard/*`" decision in [V2_DECISION_REGISTER.md](../V2_DECISION_REGISTER.md) (A2 already covers extension; this is the rename half), then proceed to PR 0b `/residency/*` audit.

---

## 2. Existing route inventory

### 2.1 `/poster/*` page routes (8 files)

| Route | Component path | Render mode |
|---|---|---|
| `/poster` | [`src/app/poster/page.tsx`](../../../src/app/poster/page.tsx) | server (force-dynamic), session check + Prisma counts |
| `/poster/organization` | `src/app/poster/organization/page.tsx` | client/server hybrid; profile editor |
| `/poster/verification` | [`src/app/poster/verification/page.tsx`](../../../src/app/poster/verification/page.tsx) | client; NPI + institutional email submission |
| `/poster/listings` | `src/app/poster/listings/page.tsx` | server; lists own listings |
| `/poster/listings/new` | `src/app/poster/listings/new/page.tsx` | client; listing creation form |
| `/poster/listings/[id]/edit` | `src/app/poster/listings/[id]/edit/page.tsx` | client; listing edit form |
| `/poster/applications` | `src/app/poster/applications/page.tsx` | server; received applications |
| `/poster/settings` | `src/app/poster/settings/page.tsx` | account settings |

### 2.2 `/poster/*` layout enforcement

Per [`src/app/poster/layout.tsx`](../../../src/app/poster/layout.tsx):

```ts
// Lines 37-45
const session = await auth();
if (!session?.user) {
  redirect("/auth/signin");
}
if (session.user.role !== "POSTER" && session.user.role !== "ADMIN") {
  redirect("/dashboard");
}
```

- ✅ Unauthenticated → `/auth/signin`
- ✅ Non-POSTER/ADMIN → `/dashboard` (forbidden landing redirect)
- ✅ `metadata.robots = { index: false, follow: false }` (correct — internal surface)
- Sidebar links also include `/contact-admin` — cross-references the existing admin messaging surface.

### 2.3 Poster-related API routes (7 files)

| API | Methods | Auth gate | Risk notes |
|---|---|---|---|
| `/api/auth/signup` | POST | unauthenticated | Accepts `role` from body; only `["APPLICANT", "POSTER"]` allowed (ADMIN blocked). **Self-service POSTER signup with no friction** — verification gate is downstream. |
| `/api/poster-profile` | GET, PATCH | session-only (no role check) | PATCH auto-flips `verificationStatus` to PENDING when NPI/email provided. **Any authenticated user can create a `PosterProfile` row** even APPLICANTs. (Confirmed via line 36-43 of route.ts.) |
| `/api/organizations` | GET (public), POST (POSTER/ADMIN), PATCH (any auth) | mixed | POST role-gated correctly. **PATCH lacks strip of `verificationStatus`, `badges`, `adminNotes`, `institutionalEmail`** — an authenticated owner can self-elevate their own org's verification + badges. |
| `/api/poster-listings` | GET | session-only | Returns own listings; safe (filter is server-side `posterId: session.user.id`). |
| `/api/poster-applications` | GET | POSTER/ADMIN | Returns applications for own listings; safe. |
| `/api/listings` (POST) | POST | session-only | **Any authenticated user can submit a listing.** Defaults to PENDING for non-ADMIN. APPLICANT users can also submit listings via this endpoint — by design (per inline comment line 147), but unverified posters bypass the verification gate at submission time. |
| `/api/listings/[id]` | GET (public), PATCH (owner/admin), DELETE (owner/admin) | mixed | **PATCH strips `id`, `posterId`, `createdAt`, `views` but NOT `status`, `linkVerificationStatus`, `lastVerifiedAt`, `linkVerified`, `featured`, `adminNotes`** — a poster can self-promote their own PENDING listing to APPROVED via PATCH. **Critical security gap.** |
| `/api/applications` | GET (own/listing-owner), POST (APPLICANT only) | mixed | Correctly enforced. POST listing must be APPROVED status. |
| `/api/applications/[id]` | PATCH | nuanced | Poster can update any status; applicant restricted to WITHDRAWN; admin all. Good. |

### 2.4 Admin-side routes for poster + listing moderation

| API | Methods | Auth gate |
|---|---|---|
| `/api/admin` | POST | ADMIN only |
| `/api/admin/posters` | GET | ADMIN only — returns PENDING posters |
| `/api/admin/listings` | GET | (assumed ADMIN — file not read in this audit; cross-reference) |
| `/api/admin/verification-queue` | GET, POST | ADMIN only (per PR #12) |
| `/api/admin/route.ts` POST actions | `approve_poster`, `reject_poster`, `approve_listing`, `reject_listing`, `hide_listing`, `approve_review`, `reject_review` | ADMIN only |

The `POST /api/admin` handler (lines 124-132) writes an `AdminActionLog` row for every admin action — but **NOT inside a transaction with the state change.** A crash between `prisma.posterProfile.update` and `prisma.adminActionLog.create` could leave an orphan state change. Lower risk than the listing PATCH gap because admin actions are infrequent + admin clients are trusted.

---

## 3. Data model inventory

### 3.1 `PosterProfile` (lines 165-180 of [`prisma/schema.prisma`](../../../prisma/schema.prisma))

| Field | Type | Notes |
|---|---|---|
| `id` | `String @id @default(cuid())` | |
| `userId` | `String @unique` | 1:1 with User |
| `user` | relation | `onDelete: Cascade` (deleting user nukes profile) |
| `contactName`, `phone`, `title` | optional strings | |
| `npiNumber`, `institutionalEmail` | optional strings | verification proof |
| `verificationStatus` | `VerificationStatus @default(UNVERIFIED)` | enum: UNVERIFIED / PENDING / APPROVED / REJECTED |
| `adminNotes` | optional string | admin-side notes during review |
| `createdAt`, `updatedAt` | timestamps | |

**Observations:**
- Profile is 1:1 with User (one PosterProfile per user max).
- Contact fields don't include physical address (CAN-SPAM postal-address consideration when v2 messaging launches).
- No `verifiedAt` timestamp — admin approval doesn't record when.
- No `verifiedBy` admin attribution — `AdminActionLog` is the only audit trail.

### 3.2 `Organization` (lines 182-205 of `prisma/schema.prisma`)

| Field | Type | Notes |
|---|---|---|
| `id` | `String @id @default(cuid())` | |
| `ownerId` | `String @unique` | 1:1 with User (`@@unique` on ownerId means one org per user) |
| `owner` | relation `OrganizationOwner` | onDelete: Cascade |
| `name` | required string | |
| `type`, `contactName`, `contactEmail`, `phone`, `website`, `description` | optional | |
| `city`, `state` | required strings | |
| `institutionalEmail` | `Boolean @default(false)` | **NOTE: this is a Boolean flag (does owner have institutional email?), distinct from `PosterProfile.institutionalEmail` which is a String value.** Easy confusion point. |
| `verificationStatus` | `VerificationStatus @default(UNVERIFIED)` | mirrored from PosterProfile |
| `badges` | `String @default("")` | free-form badges (could become a comma-separated tag list) |
| `adminNotes` | optional string | |
| `listings` | back-relation | one org has many listings |

**Observations:**
- `Organization.institutionalEmail` (Boolean) and `PosterProfile.institutionalEmail` (String) are **two different fields with the same name.** Confusing in code; rename one when revising for v2.
- `badges` is unstructured text; v2 should consider an enum or a dedicated `OrganizationBadge` model if badges become a feature.
- No `parent_organization_id` — can't model hospital → multiple GME programs as separate orgs with shared parent. Might matter in Phase D marketplace.
- Verification status duplicated between PosterProfile and Organization — admin must approve both? Or is one canonical?

### 3.3 `Listing.posterId` and `Listing.organizationId` (lines 209-212)

```prisma
organizationId            String?
organization              Organization?          @relation(fields: [organizationId], references: [id])
posterId                  String
poster                    User                   @relation(fields: [posterId], references: [id])
```

- `posterId` is required; `organizationId` is optional.
- A listing always has a poster but can lack an organization (poster acting as individual).
- No cascade-delete on listing when poster is deleted (poster delete would orphan listings — investigate or leave as-is).

### 3.4 `Application` (lines 293-306)

```prisma
model Application {
  id, listingId, applicantId
  message     String?
  status      ApplicationStatus @default(SUBMITTED)
  createdAt, updatedAt
  @@unique([listingId, applicantId])
}
```

- Single-message field; no CV upload, no resume, no extended fields.
- Unique constraint prevents duplicate applications per listing per applicant.
- **Functionally complete for the minimal "track applications" claim** but is NOT a full ATS — homepage copy "submit your application through the platform / track your applications from your dashboard" is technically true but lightweight.

### 3.5 `AdminActionLog` (lines 366-377)

```prisma
model AdminActionLog {
  id, adminId, admin, action, targetType, targetId, notes, createdAt
}
```

- Records every admin moderation action.
- Missing: `targetSnapshotBefore` / `targetSnapshotAfter` for full audit trail (would help "what was the listing's status before approval?").
- Not in transaction with the state change it logs — orphan-write risk.

### 3.6 Missing relations / models

- No `InstitutionClaim` model. **Per decision A2: not needed.** Existing `PosterProfile` + `Organization` already serve "claim my listing" use cases.
- No `SponsoredPlacement` model — Phase D / [TRUST_AND_MONETIZATION_POLICY.md §13.3](../TRUST_AND_MONETIZATION_POLICY.md) future.
- No `MonetizationLedger` — Phase D.
- No application attachment model (CV, transcript, etc.) — currently `applicantProfile.cvUrl` is a single string on `ApplicantProfile`.

---

## 4. Current user capabilities

### 4.1 What a POSTER user can do today

- **Sign up** as POSTER via `/auth/signup` (self-service).
- **View own dashboard** at `/poster` showing listing count, application count, recent listings.
- **Create org profile** at `/poster/organization` via `POST /api/organizations` (one per user).
- **Edit org profile** via `PATCH /api/organizations` (with security gap noted in §5).
- **Submit verification** at `/poster/verification` via `PATCH /api/poster-profile` (NPI + institutional email).
- **Create listing** at `/poster/listings/new` via `POST /api/listings` (defaults to PENDING for non-ADMIN; ADMIN-created bypass review).
- **List own listings** at `/poster/listings`.
- **Edit own listing** at `/poster/listings/[id]/edit` via `PATCH /api/listings/[id]` (with security gap noted in §5).
- **Delete own listing** via `DELETE /api/listings/[id]`.
- **View applications** at `/poster/applications` for own listings.
- **Update application status** via `PATCH /api/applications/[id]`.
- **Contact admin** via `/contact-admin` (UI; backend writes to `AdminMessage`).

### 4.2 What a POSTER cannot do today (correctly gated)

- Cannot self-approve their `PosterProfile.verificationStatus` (admin-only via `/api/admin`).
- Cannot self-elevate their own User role to ADMIN.
- Cannot apply to listings (gated to APPLICANT role).
- Cannot leave reviews (presumably gated; not audited in this PR).
- Cannot view other posters' applications.
- Cannot delete other posters' listings.

### 4.3 What a POSTER **incorrectly** can do today (security gaps — see §5)

- ⚠️ Can self-elevate `Listing.status` from PENDING → APPROVED via `PATCH /api/listings/[id]` (bypass admin moderation).
- ⚠️ Can self-elevate `Listing.linkVerificationStatus` to VERIFIED via the same endpoint (false trust badge).
- ⚠️ Can set `Listing.featured = true` on own listing (own promotion).
- ⚠️ Can self-elevate `Organization.verificationStatus` and `badges` via `PATCH /api/organizations`.

---

## 5. Auth and authorization findings

### 5.1 Layout-level guards (page routes)

[`src/app/poster/layout.tsx`](../../../src/app/poster/layout.tsx) lines 37-45 enforces session + role redirect. **Server-rendered; cannot be bypassed by client.**

### 5.2 API-level guards (per endpoint)

| Endpoint | Auth | Role | Object-level |
|---|---|---|---|
| `POST /api/auth/signup` | unauth | role=APPLICANT/POSTER (ADMIN blocked) | new account only |
| `GET/PATCH /api/poster-profile` | session-only | **❌ no role check** | user can only see/edit own (userId = session.user.id) |
| `POST /api/organizations` | session | POSTER/ADMIN | one org per user (unique constraint) |
| `PATCH /api/organizations` | session | none | `verificationStatus`, `badges`, `adminNotes`, `institutionalEmail` NOT stripped — **gap** |
| `POST /api/listings` | session | none | accepts `organizationId` from body without owner check — **medium gap** (poster could claim someone else's org); status defaults to PENDING for non-ADMIN |
| `PATCH /api/listings/[id]` | session | owner OR admin | `status`, `linkVerificationStatus`, `lastVerifiedAt`, `linkVerified`, `featured`, `adminNotes` NOT stripped — **critical gap** |
| `DELETE /api/listings/[id]` | session | owner OR admin | hard delete |
| `POST /api/applications` | session | APPLICANT only | listing must be APPROVED |
| `PATCH /api/applications/[id]` | session | role-specific (poster/admin/applicant-withdraw-only) | object ownership checked |
| `GET /api/poster-applications` | session | POSTER/ADMIN | filters to listings owned by session user |
| `GET /api/admin/posters` | session | ADMIN | |
| `POST /api/admin` | session | ADMIN | logs to AdminActionLog (not transactional) |

### 5.3 Server-side enforcement: yes (mostly)

All page-level + API-level checks happen server-side. No client-only auth gating observed. Layout guard catches direct page access; API guard catches direct fetch.

### 5.4 Gaps (recap from §5.2)

**Critical:**
1. `PATCH /api/listings/[id]` — poster can self-promote `status: APPROVED` on own listing, bypassing admin moderation. Closes the trust contract.

**Medium:**
2. `PATCH /api/listings/[id]` — poster can set `linkVerificationStatus: VERIFIED` or `linkVerified: true` on own listing, displaying false trust badge.
3. `PATCH /api/listings/[id]` — poster can set `featured: true` on own listing, claiming featured placement.
4. `PATCH /api/organizations` — owner can self-elevate `verificationStatus`, `badges`, `adminNotes`.
5. `POST /api/listings` — accepts `organizationId` without verifying poster owns the org.
6. `PATCH /api/poster-profile` — any authenticated user (including APPLICANT) can create/update their own `PosterProfile` row, even though POSTER role is required for downstream actions. Less harmful (the row is mostly inert without the role) but inconsistent.

**Low:**
7. `POST /api/admin` — admin action + AdminActionLog write are not in a transaction. Crash window leaves orphan state.

### 5.5 Recommended fixes (separate PRs after audit)

Each fix is < 50 LOC, no schema change:

- **PR (gap 1-3):** in `PATCH /api/listings/[id]`, strip `status`, `linkVerificationStatus`, `linkVerified`, `lastVerifiedAt`, `lastVerificationAttemptAt`, `verificationFailureReason`, `featured`, `adminNotes` from `updateData` for non-ADMIN. Add unit test.
- **PR (gap 4):** in `PATCH /api/organizations`, strip `verificationStatus`, `badges`, `adminNotes`, `institutionalEmail` (Boolean) from `updateData` for non-ADMIN. Add unit test.
- **PR (gap 5):** in `POST /api/listings`, if `organizationId` is provided and `session.user.role !== ADMIN`, verify `Organization.ownerId === session.user.id`. Add unit test.
- **PR (gap 6):** in `PATCH /api/poster-profile`, gate to POSTER/ADMIN role. Add unit test.
- **PR (gap 7):** wrap admin action + AdminActionLog write in `prisma.$transaction([...])`. Add unit test.

These should land **before any institution outreach** (decision in §11).

---

## 6. Verification / trust flow

### 6.1 Poster verification

- User submits NPI + institutional email at `/poster/verification`.
- `PATCH /api/poster-profile` sets `verificationStatus = PENDING`.
- Admin sees pending posters at `/admin/posters` (read).
- Admin approves via `POST /api/admin { action: "approve_poster", targetId, notes }` → sets `verificationStatus = APPROVED`.
- AdminActionLog written.
- UI shows badge + trust signal.

### 6.2 Listing verification

Two distinct verification systems:

**(a) Listing approval (admin moderation):**
- New listing → `status = PENDING` (for non-ADMIN posters).
- Admin reviews via `/admin/listings` queue.
- Admin approves via `POST /api/admin { action: "approve_listing", ... }` → `status = APPROVED`.
- Listing then visible on `/browse` etc.

**(b) Listing source-link verification (Phase 3 cron):**
- Cron `/api/cron/verify-listings` checks source URLs daily.
- Sets `linkVerificationStatus` (UNKNOWN / VERIFIED / REVERIFYING / NEEDS_MANUAL_REVIEW etc.).
- Updates `lastVerifiedAt` only on VERIFIED.
- Distinct from listing `status`.

### 6.3 Audit trail

- `AdminActionLog` for admin moderation actions.
- `DataVerification` (Phase 3) for cron + admin verification events.
- **Gap:** admin action + log are not transactional (§5 #7).

### 6.4 Source URLs

- `Listing.sourceUrl` — used by Phase 3 cron.
- `Listing.applicationUrl` — separate from sourceUrl; for "Apply now" button.
- `Listing.websiteUrl` — legacy; relationship to sourceUrl unclear.

### 6.5 Broken-link relationship

Per Phase 3.8 (PR #24):
- User clicks "Report broken link" → `POST /api/flags { kind: "BROKEN_LINK", listingId }`.
- `FlagReport` row created.
- Admin queue surfaces.
- Admin investigates, may set `linkVerificationStatus = NEEDS_MANUAL_REVIEW` etc.
- Listing's `status` is **not** auto-changed by user flag (preserves admin sole authority).

---

## 7. Overlap with future v2 institution model

### 7.1 Proposed `InstitutionClaim` (per [V2_PR_BREAKDOWN.md](../V2_PR_BREAKDOWN.md) PR 23, deferred)

Per [TRUST_AND_MONETIZATION_POLICY.md §6](../TRUST_AND_MONETIZATION_POLICY.md), the proposed `InstitutionClaim` model would track:
- Institution claiming a listing
- Free vs paid tier
- Verification of institutional identity (email from institutional domain)
- Admin manual review

**Reality:** all of this is already implemented:
- `PosterProfile.verificationStatus` = institution claim verification state
- `PosterProfile.institutionalEmail` (string) = institutional email proof
- `Organization` = institution profile
- `UserRole.POSTER` = institution-claimed role
- `Listing.posterId` + `Listing.organizationId` = listing ownership
- `POST /api/admin { action: "approve_poster" }` = admin manual review
- `AdminActionLog` = audit trail

**The proposed `InstitutionClaim` model would duplicate `PosterProfile`.**

### 7.2 Proposed `SponsoredPlacement` (per [V2_PR_BREAKDOWN.md](../V2_PR_BREAKDOWN.md) PR 23, deferred)

Per [TRUST_AND_MONETIZATION_POLICY.md §5](../TRUST_AND_MONETIZATION_POLICY.md), sponsored listings would carry a "Sponsored" badge + ranking protection.

**Reality:**
- `Listing.featured` (Boolean) exists today — could carry sponsorship state but currently has no FTC disclosure rendering.
- `Organization.badges` (free-text) exists — could become structured.

**Recommend:** add `SponsoredPlacement` only when first paid sponsorship lands (Phase D). For v2 launch, reuse existing fields with conservative-language doctrine + per-card disclosure rendering.

### 7.3 Monetization disclosure

Per [TRUST_AND_MONETIZATION_POLICY.md §4](../TRUST_AND_MONETIZATION_POLICY.md), every listing needs a monetization disclosure state.

**Currently:** no field exists. v2 will need `Listing.monetizationDisclosure` enum (per V2_DECISION_REGISTER schema additions) — additive change.

### 7.4 Recruiter / attorney directories

**Currently:** `Lawyer` Prisma model exists (preserved per RULES.md §2 for `/career/attorneys`); no `Recruiter` model.

**Recommend:** for v2 launch, scope is `/career/attorneys` (preserved). Recruiter directory deferred to Phase C+; reuse `Organization` model with `type: "recruiter"` rather than introducing new model.

### 7.5 Decision: extend, not replace

Per [V2_DECISION_REGISTER.md A2](../V2_DECISION_REGISTER.md), recommend extending `/poster/*`:

1. **Rename URLs** (separate launch-event PR): `/poster/*` → `/institutions/dashboard/*` with 301 redirects. Cosmetic; preserves all data + auth + flow.
2. **Add `Listing.monetizationDisclosure`** when first paid sponsorship is queued (not now).
3. **Defer `InstitutionClaim` and `SponsoredPlacement` models** indefinitely; revisit only if existing fields prove insufficient.

---

## 8. Risks found (consolidated)

### 8.1 Critical (must fix before institution outreach or launch)

| # | Risk | File | Fix effort |
|---|---|---|---|
| C1 | Poster self-promotes `Listing.status: APPROVED` via PATCH | `src/app/api/listings/[id]/route.ts:93-98` | strip protected fields; ~20 LOC |
| C2 | Poster self-promotes `Listing.linkVerificationStatus: VERIFIED` via PATCH | same file | same fix |
| C3 | Poster sets `Listing.featured: true` via PATCH | same file | same fix |

### 8.2 Medium

| # | Risk | File | Fix effort |
|---|---|---|---|
| M1 | Owner self-elevates `Organization.verificationStatus`, `badges` via PATCH | `src/app/api/organizations/route.ts:166-174` | strip protected fields; ~20 LOC |
| M2 | Poster claims another user's org via `POST /api/listings` `organizationId` | `src/app/api/listings/route.ts:218-220` | verify ownership; ~10 LOC |
| M3 | Any authenticated user (incl. APPLICANT) can write `PosterProfile` via PATCH | `src/app/api/poster-profile/route.ts:32-65` | role gate; ~5 LOC |
| M4 | `Application` model is minimal (no CV upload) — homepage "track applications" claim is technically true but lightweight | model | content/copy decision |

### 8.3 Low

| # | Risk | File | Fix effort |
|---|---|---|---|
| L1 | Admin action + AdminActionLog not transactional | `src/app/api/admin/route.ts:124-132` | wrap in `$transaction`; ~15 LOC |
| L2 | `Organization.institutionalEmail` (Boolean) and `PosterProfile.institutionalEmail` (String) field name collision | schema | rename one; schema PR |
| L3 | `Organization.badges` is unstructured free-text | schema | enum or join table; future |
| L4 | `Listing.audienceTag` is single string (not array) | schema | additive change to array; planned in V2_PR_BREAKDOWN PR 20 |

### 8.4 Trust contract risks

- **C1 closes the trust contract:** if a poster can self-approve, every "Verified" trust signal on the site becomes unreliable. **Highest priority fix.**
- **M1 weakens institutional trust:** if a self-claimed org can self-elevate `verificationStatus`, badges become uninformative.

### 8.5 Monetization conflict risk

- Currently zero — no monetization is live.
- Fixing C1-C3 + M1-M3 **before** any monetization launch is mandatory; otherwise sponsored listings + paid claims could ride on fake verification.

### 8.6 Incomplete UX risks

- `Application` flow has no CV/resume upload (just `message`). Homepage soften: "submit your application or contact directly via the institution's preferred method."
- No application withdrawal confirmation UX (just a status flip).
- No notification to applicant when poster updates application status.

### 8.7 Duplicated model risk

- Adding `InstitutionClaim` model would duplicate `PosterProfile` + `Organization`. **Decision A2: do not add.**
- Adding `SponsoredPlacement` model now would duplicate `Listing.featured`. Defer.

---

## 9. Recommended path

### 9.1 Keep `/poster/*` as institution-side foundation

The flow is functionally complete + has a working admin moderation surface + has audit logging + integrates with Phase 3 trust engine via `Listing` schema overlap. Replacing it would forfeit working code.

### 9.2 Rename later

At v2 launch event, 301 `/poster/*` → `/institutions/dashboard/*`. UI labels "Poster Dashboard" → "Institution Dashboard" / "For Institutions". Schema unchanged. Per decision A2.

### 9.3 Do not build separate `InstitutionClaim`

Decision A2 binding: extend, not replace. If a future use case genuinely needs `InstitutionClaim` (e.g. multi-poster orgs, external claim approval workflow), revisit then.

### 9.4 Phase future institution features on top of existing

- Free claim flow at v2 launch = existing `/poster/*` (renamed).
- Paid claim flow = additive field on existing model + new pricing surface.
- Sponsored listings = extend `Listing.featured` semantics + add disclosure rendering + ranking-protection logic.
- Recruiter / attorney directories = `Organization.type` filtering.
- Marketplace = add `MonetizationLedger` only when first paid transaction is queued.

---

## 10. Required follow-up PRs

Each is small, focused, no schema change unless noted:

| PR | Purpose | Files | LOC |
|---|---|---|---|
| **0a-fix-1** | Strip protected fields in `PATCH /api/listings/[id]` | `src/app/api/listings/[id]/route.ts` + tests | ~50 |
| **0a-fix-2** | Strip protected fields in `PATCH /api/organizations` | `src/app/api/organizations/route.ts` + tests | ~30 |
| **0a-fix-3** | Verify org ownership in `POST /api/listings` | `src/app/api/listings/route.ts` + tests | ~25 |
| **0a-fix-4** | Role gate `PATCH /api/poster-profile` | `src/app/api/poster-profile/route.ts` + tests | ~10 |
| **0a-fix-5** | Wrap admin action + AdminActionLog in transaction | `src/app/api/admin/route.ts` + tests | ~25 |
| **0a-fix-6** | Test: poster cannot self-approve listing (regression) | new test file | ~80 |
| **0a-rename** (deferred to launch) | 301 `/poster/*` → `/institutions/dashboard/*` | `next.config.ts` redirects + UI labels | ~50 |

The 5 fix PRs (0a-fix-1 through 0a-fix-5) should land **on `main` before institution outreach** per Mode A code-PR review. Total ~140 LOC across 5 PRs.

---

## 11. Decisions for user

These surfaced in the audit and need user resolution. Each maps to a [V2_DECISION_REGISTER.md](../V2_DECISION_REGISTER.md) entry or a new entry to add:

### 11.1 Open

1. **A2 (existing): extend `/poster/*` rather than build new `InstitutionClaim`.** Audit confirms recommendation. **Lock A2 = recommendation (a) extend.**
2. **New: Rename `/poster/*` → `/institutions/dashboard/*` at v2 launch?** If yes, requires 301 redirects + UI labels. Recommend yes (matches v2 framing). Add to V2_DECISION_REGISTER as B-tier (launch-blocker).
3. **New: Should institutions be able to claim listings they did NOT create?** Currently posters can only edit listings they themselves created (via `posterId`). A claim flow for existing-but-unclaimed listings doesn't exist. Decide: (a) institutions only claim by creating — keep current model, (b) add claim-existing flow with admin gate. Recommend (a) for v2 launch; (b) deferred Phase C+.
4. **New: Should poster-created listings go public before admin approval?** Currently NO (defaults to PENDING; admin must approve). Recommend keep current.
5. **New: Should monetized listings require separate disclosure?** Per FTC + [TRUST_AND_MONETIZATION_POLICY.md §4](../TRUST_AND_MONETIZATION_POLICY.md), yes. Add `Listing.monetizationDisclosure` enum when first paid sponsorship is queued.
6. **New: Should poster profiles be public?** Currently NOT (no public `/poster/[id]` profile route). Decide whether v2 surfaces an institution profile page (e.g. `/institutions/[slug]`). Recommend yes — per [PAGE_TEMPLATE_INVENTORY.md §19](../PAGE_TEMPLATE_INVENTORY.md), claimed-institution profile is a valuable directory entry.
7. **New: Whether "Poster" role should be renamed to "Institution"?** Affects UserRole enum (one-time additive enum value + migration). Recommend defer — internal label change with no external benefit. Keep `UserRole.POSTER`; relabel UI only.

### 11.2 Resolved by this audit

- **A2 (extend, not replace) — confirmed.**
- **A3 (`Application` real or aspirational): real-functional but minimal.** The flow works end-to-end for `message + status` semantics. Homepage copy can keep "track applications" with appropriate softening on "submit through the platform" given there's no CV/resume upload.

---

## 12. Final recommendation

### 12.1 Verdict

**Merge this audit doc.** It establishes:
1. The `/poster/*` flow is the institution-side foundation; do not duplicate.
2. 5 small auth/integrity fixes are needed before institution outreach (~140 LOC total).
3. The rename + UI relabeling can land at v2 launch as a 301 redirect + label change.
4. `InstitutionClaim` and `SponsoredPlacement` models are deferred indefinitely.

### 12.2 Next audit

**PR 0b — `/residency/*` namespace audit.** Highest-leverage remaining unknown is decision A1 (Residency Command Center vs `/match`+`/fellowship`). Per [V2_PR_BREAKDOWN.md Phase 0](../V2_PR_BREAKDOWN.md), 0b is the natural next step.

### 12.3 What this audit does NOT do

- Does not implement any fix from §10. Each fix is a separate small PR.
- Does not modify schema.
- Does not modify `/career` or any preserved surface.
- Does not authorize the rename (decision needed in V2_DECISION_REGISTER).
- Does not touch monetization, real-send email, or any unrelated subsystem.

---

## SEO impact

```
SEO impact:
- URLs changed:        none (audit doc only)
- redirects added:     none
- sitemap changed:     no
- robots changed:      no
- canonical changed:   no
- metadata changed:    no
- JSON-LD changed:     no
- pages noindexed:     none (existing /poster/* stays noindex per its layout)
- internal links:      none changed
- risk level:          ZERO — internal audit doc
```

## /career impact

None. `/career/*` and `/careers/*` preserved unchanged.

## Schema impact

None. Section §3 enumerates existing schema for cross-reference; section §10 fix PRs are code-only (no migration); section §7 confirms `InstitutionClaim` and `SponsoredPlacement` models are NOT to be added.

## Authorization impact

None. Documenting reality is not authorization to change reality. Each fix PR (0a-fix-1 through 0a-fix-5) requires its own code review per Mode A.
