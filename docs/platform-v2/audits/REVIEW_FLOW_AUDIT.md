# Review Flow Audit (PR 0d)

**Status:** complete
**Audited at:** main `ae35c17` (2026-04-29)
**Scope:** the `Review` Prisma model, `FlagReport` model, `/api/reviews`, `/api/my-reviews`, `/api/admin/reviews`, `/api/flags`, `/api/admin/verification-queue` (flag-resolution branch), `/dashboard/reviews`, `/admin/reviews`, `/admin/flags`, the listing-detail review block, listing-card aggregate-rating, homepage `<TrustSection>` and `<HowItWorks>`, `/about`, `/how-it-works`, and the `<ReviewForm>` / `<FlagButton>` / `<ReportBrokenLinkButton>` components. **Excludes** the community-post moderation surface (`CommunityPost`, `CommunityComment`) — covered in PR 0e.
**Audit type:** docs-only. No code changes in this PR. Fix work is queued as separate PRs.

This audit answers **decision A4** (homepage / listing-detail "community reviews" / "verified review" / "top-rated programs are featured" — real, minimal, partial, or aspirational?). It is the fourth of seven Phase 0 audits. Sibling audits: [`POSTER_FLOW_AUDIT.md`](POSTER_FLOW_AUDIT.md), [`RESIDENCY_NAMESPACE_AUDIT.md`](RESIDENCY_NAMESPACE_AUDIT.md), [`APPLICATION_FLOW_AUDIT.md`](APPLICATION_FLOW_AUDIT.md).

---

## 1. Executive verdict

**Verdict: real-functional with shipped UI, but **C-class abuse and SEO surface area** that must be closed before any v2 launch claim of "verified reviews".**

Five layers, five different truths. Note: the prior PR 0c finding ("backend works, no UI") does **not** repeat here — for reviews the UI is fully shipped, which makes the unsafe parts more dangerous, not less.

| Layer | Status | One-line truth |
|---|---|---|
| **`Review` DB + API** | real-functional | `Review` model + 4 routes work end-to-end with admin moderation gate. |
| **Public review-create surface** | **shipped, ungated** | `<ReviewForm>` is wired into `/listing/[id]`. Any logged-in user (including the listing's poster) can submit a review. **No verified-purchase / completed-application gate.** |
| **Public review-display surface** | shipped, but misleading on three fields | Approved reviews render `wasReal`/`worthCost`/`wouldRecommend` chips with default-true values that the live form **never lets the user override** (see §3.3). |
| **Aggregate-rating SEO surface** | **shipped, unsafe** | `/listing/[id]` emits `AggregateRating` JSON-LD whenever ≥1 approved review exists (no minimum-N threshold, no verified-purchase). Google rich-results spam risk. |
| **`FlagReport` (report-broken-link / report-issue) flow** | real-functional, minor admin-resolve UX gap | Two front-end entry points (general flag + broken-link), shared backend, robust schema. `/admin/flags` lists OPEN flags but **has no resolve buttons** — resolution is bolted into `/api/admin/verification-queue` only. |

Two **critical** (C-class) findings that block any "verified review" or "top-rated program" claim:

- **C1** — No verified-purchase / completed-application gate on `POST /api/reviews`. The listing's own poster (or anyone logged in) can leave a 5-star review on the listing they own. Admin moderation alone is not a substitute — admins moderate content, not authorship.
- **C2** — `AggregateRating` JSON-LD is shipped on `/listing/[id]` with no minimum-N threshold. With C1 unfixed, this is a structured-data spam vector and a Google rich-results compliance risk.

Three **high (H-class) findings** are §9 trust language, §11 review form's silent default-true on `wasReal`/`worthCost`, and §10 no rate-limit on `POST /api/reviews` or `POST /api/flags`.

**Decision A4:** option **C — hide / de-emphasize public-review claims until C1 + C2 are fixed.** Recommendation in §18.

---

## 2. Terminology map

To avoid the same conflation that PR #38 found between residency-namespace concepts:

| Term | Status in code | Definition |
|---|---|---|
| **User review** | real (`Review` model) | A logged-in user posts a 1-5 star rating + optional comment about a `Listing`. Goes through admin moderation. |
| **Rating** | real, derived | `AVG(Review.overallRating WHERE moderationStatus = APPROVED)`. Surfaced as stars on listing cards, listing detail, and `AggregateRating` JSON-LD. |
| **Testimonial** | **absent** | No marketing testimonials, no fake quotes. Confirmed via grep: zero hits for `testimonial` in source or docs. ✅ |
| **Applicant / application review** | term reused | "Review" is also the verb in `ApplicationStatus.UNDER_REVIEW` and the noun in `/poster/applications` ("Review and manage applications"). This is the **poster reviewing applicants**, not user reviews. Distinct primitive. Documented in [`APPLICATION_FLOW_AUDIT.md`](APPLICATION_FLOW_AUDIT.md). |
| **Poster review** | n/a | No primitive. Posters cannot be reviewed by applicants today. |
| **Admin review** (action) | real (admin moderation) | Admin approves or rejects user-submitted `Review` rows via `POST /api/admin` `approve_review`/`reject_review`. |
| **Verification review** | real, distinct | Phase 3 `LinkVerificationStatus` workflow + `DataVerification` model + `/admin/verification-queue`. **Different from review system.** Verification is about source-link freshness; reviews are about user opinion. They share UI real estate on listing detail (see §9). |
| **Report / flag** | real (`FlagReport` model) | Two front-end entry points — generic "Report issue" and broken-link-specific. Both POST to `/api/flags`. Schema includes `kind`, `sourceUrl`, `status`, `resolvedAt`, `resolvedBy`. |
| **Broken-link review** | overload — really a report | `<ReportBrokenLinkButton>` → `FlagReport` row with `kind: "BROKEN_LINK"`. Not a `Review`. |
| **Moderation review** | real, fragmented | `ModerationStatus` enum (PENDING/APPROVED/REJECTED/FLAGGED) used on `Review` (PENDING by default), `CommunityPost` (PENDING by default), `CommunityComment` (APPROVED by default — opt-out). |
| **Quality review** | n/a | No "quality score" computed. Listing card stars are an `AVG(rating)`, not a quality model. |

**Naming risk:** the word "review" is overloaded across user-content moderation (`Review` model), admin action (approve/reject pending content), application status (`UNDER_REVIEW`), and link verification ("Needs review" badge for `NEEDS_MANUAL_REVIEW`). Audit surfaces in §9 and §11 keep these layers separated.

---

## 3. Existing route inventory

All routes confirmed present at `ae35c17`:

| Route | File | Method | Audit verdict |
|---|---|---|---|
| `POST /api/reviews` | [`src/app/api/reviews/route.ts:65-163`](../../../src/app/api/reviews/route.ts) | create | works; auth-only; **no verified-purchase gate**; `moderationStatus: PENDING` enforced; rating range check (1-5); unique-constraint dedupe (`listingId, userId`). **No rate limit.** Sends admin notification email (fire-and-forget). |
| `GET /api/reviews?listingId=X` | [`src/app/api/reviews/route.ts:9-63`](../../../src/app/api/reviews/route.ts) | list | public; filters `moderationStatus: APPROVED`; masks user info when `anonymous: true`; computes aggregate stats (count, averageRating, wouldRecommendPercent). |
| `GET /api/my-reviews` | [`src/app/api/my-reviews/route.ts`](../../../src/app/api/my-reviews/route.ts) | list | auth-only; returns logged-in user's own reviews including PENDING/REJECTED. |
| `GET /api/admin/reviews` | [`src/app/api/admin/reviews/route.ts`](../../../src/app/api/admin/reviews/route.ts) | list | ADMIN-only; returns `moderationStatus: PENDING` with user + listing joined. |
| `POST /api/admin` (`approve_review` / `reject_review`) | [`src/app/api/admin/route.ts:98-118`](../../../src/app/api/admin/route.ts) | mutate | ADMIN-only; atomic `Review.update + AdminActionLog.create` via `prisma.$transaction([...])` (PR 0a-fix-4). |
| `POST /api/flags` | [`src/app/api/flags/route.ts:40-110`](../../../src/app/api/flags/route.ts) | create | auth-only; reason length 5-2000; structured `kind` enum + back-compat `[broken_link]` prefix parsing; sends admin notification. **No rate limit.** |
| `/admin/flags` (server page) | [`src/app/admin/flags/page.tsx`](../../../src/app/admin/flags/page.tsx) | UI | ADMIN-only; lists OPEN flags. **Has no resolve buttons.** Resolution is via `/api/admin/verification-queue` only. |
| `/admin/reviews` (client page) | [`src/app/admin/reviews/page.tsx`](../../../src/app/admin/reviews/page.tsx) | UI | ADMIN-only; lists PENDING reviews; Approve / Reject buttons that POST to `/api/admin`. |
| `/dashboard/reviews` (client page) | [`src/app/dashboard/reviews/page.tsx`](../../../src/app/dashboard/reviews/page.tsx) | UI | logged-in user; lists own reviews with `moderationStatus` badge. **Has no edit / delete affordance.** |

**Routes that do NOT exist (gaps):**

| Expected route | Actual status |
|---|---|
| `PATCH /api/reviews/[id]` (edit own review) | **absent.** No editing. |
| `DELETE /api/reviews/[id]` (delete own review) | **absent.** No self-deletion. |
| `PATCH /api/flags/[id]` (resolve flag) | **absent.** Flag resolution is reachable only via `/api/admin/verification-queue` (which couples flag-resolution to listing-link-verification). For a flag that doesn't correspond to a listing-link issue (e.g. SPAM, DUPLICATE) there is no clean admin path beyond direct DB access. |
| `POST /api/poster-reviews/[id]/respond` | **absent.** Posters cannot reply to or dispute a review. |
| Reviewer-identity protection / abuse layer | **absent.** No `IPAddress` / `submitOriginIP` / abuse counters on `Review`. Only `User` is recorded. |

### 3.1 `POST /api/reviews` line-by-line authz read

```ts
// route.ts:65-163 (paraphrased)
const session = await auth();              // auth required
if (!session?.user) → 401
const body = ...                            // no zod / shape validation beyond per-field
if (!listingId || overallRating === undefined) → 400
if (rating < 1 || > 5) → 400
const listing = await findUnique({ where: { id: listingId } });
if (!listing) → 404
// NOTE: no check that `listing.status === "APPROVED"` — a user can review
// a PENDING / REJECTED / HIDDEN listing if they know its id (admin or
// previously-loaded). Thin gap; admin moderation later catches it, but
// it leaks the listing's existence.
// NOTE: no check that the user has any application on this listing.
// NOTE: no check that listing.posterId !== session.user.id.
const existing = await findUnique({ listingId_userId });
if (existing) → 409
review = create({ ..., moderationStatus: "PENDING" });
sendAdminNotification(...).catch(...);     // fire-and-forget
```

The two `// NOTE` lines are the C-class gaps formalized as **C1** in §17.

### 3.2 `POST /api/flags` line-by-line authz read

```ts
// route.ts:40-110 (paraphrased)
const session = await auth();              // auth required
if (!session?.user) → 401
const { type, targetId, reason, kind, sourceUrl } = body;
if (!type || !targetId || !reason) → 400
if (reason.length < 5 || > 2000) → 400
const kind = resolveKind(rawKind, reason); // structured + legacy prefix
const sourceUrl = ... if length valid
flag = create({ type, targetId, reporterId, reason, status: "OPEN", kind, sourceUrl });
// Try to look up listing title for email notification
sendAdminNotification(...).catch(...);
```

Cleaner than `/api/reviews` — the rate-limit gap is the same, and flag-create itself is fine. Resolution path is mildly fragmented (§3 table).

### 3.3 The two `<ReviewForm>` components (live vs dead)

The codebase contains **two** `<ReviewForm>` components:

| File | Used? | Field set |
|---|---|---|
| [`src/components/reviews/review-form.tsx`](../../../src/components/reviews/review-form.tsx) | **dead code** (not imported anywhere) | `overallRating`, `wasReal` (yes/no), `worthCost` (yes/no), `actualExposure` (1-5), `wouldRecommend` (yes/no), `comment`, `anonymous` |
| [`src/components/listings/review-form.tsx`](../../../src/components/listings/review-form.tsx) | **live** (imported by `/listing/[id]`) | `overallRating`, `wouldRecommend` (yes/no), `comment`, `anonymous` — **no `wasReal`, no `worthCost`, no `actualExposure`** |

Confirmed via grep: `grep -rn "components/reviews/review-form" src/` returns zero hits.

**Consequence (H-class, see §11):** the live form does not collect `wasReal` / `worthCost` / `actualExposure`. Submissions hit the API with these fields `undefined`. The API `data:` block at [`route.ts:128-131`](../../../src/app/api/reviews/route.ts) uses `wasReal ?? true`, `worthCost ?? true`, `actualExposure ?? 3` — **so every real submission is recorded with these fields silently set to TRUE / 3.** The listing detail page at [`/listing/[id]/page.tsx:407-425`](../../../src/app/listing/[id]/page.tsx) then renders these defaulted fields as user-affirmed claims:

```
"Real experience: Yes"
"Worth cost: Yes"
"Would recommend: Yes"
```

This **misleads readers** — the user never asserted "real experience yes" or "worth cost yes". The form only asked rating, recommend, comment.

---

## 4. Data model inventory

### 4.1 `Review` ([`prisma/schema.prisma:308-326`](../../../prisma/schema.prisma))

```prisma
model Review {
  id               String           @id @default(cuid())
  listingId        String
  listing          Listing          @relation(fields: [listingId], references: [id], onDelete: Cascade)
  userId           String
  user             User             @relation(fields: [userId], references: [id], onDelete: Cascade)
  overallRating    Int                              // 1-5, validated server-side
  wasReal          Boolean          @default(true)  // see §3.3 — silently true in production
  worthCost        Boolean          @default(true)  // see §3.3 — silently true in production
  actualExposure   Int              @default(3)     // see §3.3 — silently 3 in production
  wouldRecommend   Boolean          @default(true)
  comment          String?
  anonymous        Boolean          @default(false)
  moderationStatus ModerationStatus @default(PENDING)
  createdAt        DateTime         @default(now())
  // NOTE: no updatedAt
  @@unique([listingId, userId])
  @@map("reviews")
}
```

**Observations:**

- No `updatedAt`. No edit path means no need for the field, but it cripples post-hoc abuse forensics.
- No moderation history (`approvedBy`, `approvedAt`, `rejectionReason`). `AdminActionLog` carries the audit trail.
- No `submitterIp` / `userAgent` / fingerprint — useful for abuse detection (§12) but absent.
- `anonymous: Boolean` is honored server-side (route masks `user` to `{ id: "anonymous", name: "Anonymous" }` in GET responses) but `userId` is still stored, so admin can de-anonymize on moderation review and on legal request — appropriate.
- Cascade delete on `listing` and `user` — correct.
- `@@unique([listingId, userId])` enforces one-review-per-user-per-listing — but **does not prevent the same person creating a second account** to spam.

### 4.2 `FlagReport` ([`prisma/schema.prisma:328-347`](../../../prisma/schema.prisma))

```prisma
model FlagReport {
  id          String     @id @default(cuid())
  type        String                       // free-text: "listing", "review", "user", etc.
  targetId    String                       // not FK-constrained
  reporterId  String
  reporter    User       @relation("FlagReporter", fields: [reporterId], references: [id])
  reason      String                       // 5-2000 chars
  status      FlagStatus @default(OPEN)    // OPEN | IN_REVIEW | REVIEWED | RESOLVED | DISMISSED
  adminNotes  String?
  kind        FlagKind   @default(OTHER)   // BROKEN_LINK | WRONG_DEADLINE | PROGRAM_CLOSED | INCORRECT_INFO | DUPLICATE | SPAM | OTHER
  sourceUrl   String?
  resolvedAt  DateTime?
  resolvedBy  String?                      // not FK-constrained
  createdAt   DateTime
  updatedAt   DateTime
  @@map("flag_reports")
}
```

**Observations:**

- `targetId` is `String` (not a polymorphic FK) — pragmatic, but means cascade-delete of a target leaves orphan flag rows. Acceptable; the flag's text usually contains the listing title in the admin notification.
- `type` is free-text; the only consumer today is `type === "listing"`. A typo would silently insert a non-actionable row.
- `resolvedBy` is `String?` (admin's `User.id`) but **not a foreign key**. Acceptable for an audit field, but no referential integrity.
- `status` enum is rich (`OPEN | IN_REVIEW | REVIEWED | RESOLVED | DISMISSED`) but only `OPEN` is used in the public flag-create flow; `RESOLVED` / `DISMISSED` are written by `/api/admin/verification-queue` only.

### 4.3 `AdminActionLog` ([`prisma/schema.prisma:366-377`](../../../prisma/schema.prisma))

Already audited in [`POSTER_FLOW_AUDIT.md`](POSTER_FLOW_AUDIT.md) §3. Logs `approve_review`/`reject_review` admin transitions atomically per PR 0a-fix-4. ✅

### 4.4 `DataVerification` ([`prisma/schema.prisma:536+`](../../../prisma/schema.prisma))

Different concept — Phase 3 link-verification metadata. **Not part of user-review flow.** Mentioned only because §9 trust language conflates them on the homepage.

### 4.5 What is NOT modeled

| Concept | Why it might matter |
|---|---|
| Verified completion (review eligibility) | Without `Application.status === "COMPLETED"` check, anyone can review anything. **C1 risk.** |
| Reviewer identity protection (post-publish) | A poster can de-anonymize their own listing's anonymous reviews via SQL. The model stores `userId` server-side regardless of `anonymous`. Acceptable for moderation/legal but should be documented to applicants. |
| Poster response | No `ReviewResponse` model. Posters cannot reply. |
| Review dispute / takedown request | No primitive. Disputes route through `FlagReport` with `type: "review"` (untested path; `type` is free-text). |
| Review edit history | No `ReviewEdit[]` audit. No edit feature → no audit need today. |
| Moderation rationale exposed to user | Admin can write `AdminActionLog.notes`, but `Review` itself has no field that can carry a user-facing rejection reason. The user's `/dashboard/reviews` shows `REJECTED` with no explanation. |
| Per-application snapshot | Reviews are listing-level, not application-level. Acceptable; reviews are about the listing's experience, not the application. |

---

## 5. Public user-facing review flow

Audited the surfaces an **unauthenticated** visitor sees:

| Action | Available? | Notes |
|---|---|---|
| Leave a review | **no** — `<ReviewForm>` shows "Sign in to leave a review" link | correct gating |
| Read approved reviews on a listing | **yes** — listing detail renders approved reviews + stars + chips | shows the §3.3 misleading default-true `wasReal` / `worthCost` chips |
| See aggregate rating star count on listing card | **yes** — averaged from approved reviews only | filtered `moderationStatus: APPROVED` correctly in `featured-listings.tsx`, `browse/page.tsx`, `listing/[id]/page.tsx` ✅ |
| See `AggregateRating` JSON-LD | **yes** — emitted on `/listing/[id]` whenever ≥1 approved review exists | **C2 risk** (no minimum-N, see §14) |
| Report a listing issue (general) | **yes** but requires sign-in | `<FlagButton>` modal |
| Report broken link | **yes, even unauthenticated** — `<ReportBrokenLinkButton>` falls back to `mailto:contact@uscehub.com` for unauthed users | good — keeps the report path alive without forcing sign-in |
| See trust verification state | **yes** — `<ListingVerificationBadge>`, `<ListingTrustMetadata>` | distinct system from reviews; see §9 |
| Distinguish verified data from user opinion | **partial** — verification badges and review stars sit close together on `/listing/[id]` and on cards. **§9 risk.** |
| See review moderation status | **no** — public visitors see only `APPROVED` rows; PENDING / REJECTED hidden | correct |

---

## 6. Logged-in applicant flow

Audited what a logged-in user (any role) can do:

| Action | Available? | Notes |
|---|---|---|
| Leave a review (public) | **yes** — even without applying / completing the listing | **C1 risk** |
| Edit own review | **no** — no `PATCH /api/reviews/[id]` | absent by design? unclear |
| Delete own review | **no** — no `DELETE /api/reviews/[id]` | absent |
| Track submitted review | **yes** — `/dashboard/reviews` lists own reviews with `moderationStatus` chip |
| Submit private feedback (separate from public review) | **no** — no "private feedback" path. Feedback that isn't a public review must be sent via `<FlagButton>` ("report issue") which is admin-visible | privacy gap |
| Be protected from retaliation | **partial** — `anonymous: true` masks name from public view, but `userId` is server-side, accessible to admins (and via DB to engineers / posters with DB access) | document, don't promise anonymity |
| Accidentally submit sensitive info | **risk** — comment is free-text, no PHI/PII warning shown. A reviewer could write "I had X disease and Dr. Smith treated me there" creating PHI in a public review. **§13 risk.** |

The logged-in applicant cannot remove or correct a review they regret. Once submitted → admin-moderated → APPROVED, the user has no UI path to take it down (must email admin).

---

## 7. Poster / institution flow

| Action | Available? | Notes |
|---|---|---|
| See reviews of own listing | **yes** — same as any other visitor; via `/listing/[id]` or `/poster` dashboard's pointer | no aggregated "my reviews" view in `/poster/*` |
| Respond to a review | **no** — no `ReviewResponse` model |
| Dispute a review | **partial** — could file a `FlagReport { type: "review", targetId: <reviewId> }` but `type: "review"` is not a supported admin-flow today. The `/admin/flags` page lists generic flag rows but the verification-queue handler is listing-link-focused |
| Suppress a review | **no** — only admin can REJECT |
| See reports/flags on own listing | **no** — `FlagReport.reporter` is exposed only to admin |
| Manipulate ratings/trust | **yes (C1 risk)** — poster can submit a 5-star review on their own listing because no role-based gate prevents it. Listing-card stars and `AggregateRating` JSON-LD pick this up after admin approval. **Admin moderation is content-only and would not detect a self-review unless the user-name is recognizable.** |
| Receive moderation status notifications | **no** — admin alone is notified; poster gets nothing on review approval/rejection |

Self-review is the single highest-impact abuse vector. See §17 C1.

---

## 8. Admin / moderation flow

| Action | Available? | Notes |
|---|---|---|
| View pending reviews | **yes** — `/admin/reviews` (client page; fetches `/api/admin/reviews`) |
| Approve / reject review | **yes** — Approve / Reject buttons that POST to `/api/admin` with `approve_review` / `reject_review` |
| Atomic state-change + audit log | **yes** — `prisma.$transaction([Review.update, AdminActionLog.create])` per PR 0a-fix-4 |
| View open flag reports | **yes** — `/admin/flags` (server-rendered) lists `status: OPEN` |
| Resolve flag from `/admin/flags` page | **no — buttons absent.** Resolution must go through `/api/admin/verification-queue` (coupled to listing-link verification) | mild UX gap, see §17 M1 |
| Distinguish spam from legitimate review | **partial** — admin reads comment + checks rating sanity; no sentiment / abuse classifier; no IP / fingerprint surfaced |
| Prevent poster manipulation | **no** — admin has no way to know review author is the poster except by recognizing their name |
| Track reviewer identity safely | **partial** — `userId` stored; legal request can de-anonymize; not exposed publicly |
| Handle legal / privacy complaint | **manual** — admin email + DB edits. No legal-request workflow primitive. |
| Mass-moderate / batch approve | **no** — must click each review individually |

Admin moderation is operationally functional today, but does not catch the **C1** self-review vector at all — it would moderate content honesty (e.g. "this is a fake review"), not authorship.

---

## 9. Trust-system relationship

Critical section per spec.

### 9.1 Are user reviews currently part of trust ranking?

**No, not directly.** Listing ranking on `/browse` and `/featured` orders by:

| Surface | Order |
|---|---|
| `/browse` default | `lastVerifiedAt DESC NULLS LAST → linkVerified DESC → cost ASC` ([`browse/page.tsx:115`](../../../src/app/browse/page.tsx)) |
| `/browse` "most-reviewed" sort | maps to `views DESC` — **not actual review count, despite the label** ([`browse/page.tsx:118-119`](../../../src/app/browse/page.tsx)) — H-class copy mislabel |
| `<FeaturedListings>` | `featured: true` first, then by `lastVerifiedAt → linkVerified → views` | review rating is **not** a featured-ranking input |

So the homepage `/how-it-works/page.tsx:74-76` claim "Top-rated programs are featured prominently in search results" is **false** — featured-ranking does not consider review rating. (This compounds the §11 copy-truth risk.)

### 9.2 Are reviews displayed near trust badges?

**Yes — on listing cards and listing detail.** `/listing/[id]` shows:

- A `<TrustBadges>` component (poster verification),
- A `<ListingTrustMetadata>` component (link verification + report-broken-link),
- A `<ListingVerificationBadge>` (verification status chip),
- The reviews list with star ratings.

These are visually adjacent. A user could conflate "5 stars" with "verified" — especially since the homepage's `<TrustSection>` lists "Community Reviews" alongside "NPI-Verified Posters" and "Admin-Reviewed" as if they're equivalent trust signals. See §11.

### 9.3 Could users confuse ratings with verified/source-linked status?

**Yes — moderate confusion risk.** The two systems share visual real estate without a clear separator. A program with 5★ from one anonymous review could appear "more trusted" than a verification-pending listing with no reviews, even though the verification status is the harder signal.

### 9.4 Does any review language overclaim verification?

**Yes — three places:**

| File | Line | Quote | Problem |
|---|---|---|---|
| [`src/app/how-it-works/page.tsx:49`](../../../src/app/how-it-works/page.tsx) | 49 | "share your experience by leaving a **verified** review" | "verified" is unsupported — there's no completion check |
| [`src/app/how-it-works/page.tsx:76`](../../../src/app/how-it-works/page.tsx) | 76 | "**Top-rated programs are featured prominently** in search results" | featured-ranking does not consider review rating (§9.1) |
| [`src/components/home/trust-section.tsx:15-17`](../../../src/components/home/trust-section.tsx) | 15-17 | "Community Reviews — Real feedback from past participants" | "past participants" is unsupported — no completion gate |

### 9.5 Should reviews be separated visually from Phase 3 trust badges?

**Yes** — at minimum the listing-detail review section should not sit immediately next to the verification metadata. Stars + verification badges in adjacent layout = visual conflation. See §17 H1.

### 9.6 Should paid placement ever affect reviews or trust?

**No.** Per [`TRUST_AND_MONETIZATION_POLICY.md`](../TRUST_AND_MONETIZATION_POLICY.md) (cross-referenced, not modified by this audit). Featured-listing flag is admin-curated; paid promotion of reviews is explicitly out of scope. Confirmed.

---

## 10. Functional truth table

| Action | Real / Partial / Missing / Unsafe / Unknown |
|---|---|
| Public report broken link | **Real** — both authed (`/api/flags`) and unauthed (mailto fallback) |
| Public report issue (general) | **Real** — auth required; categories + reason ≥5 chars |
| Admin resolves report | **Partial** — only via `/api/admin/verification-queue`. No resolve buttons on `/admin/flags`. |
| User leaves public review | **Real (Unsafe)** — works end-to-end with admin moderation, but **no verified-purchase gate** (C1) |
| User leaves private feedback | **Missing** — no separate "send to admin only" channel; users either flag (visible to admin) or post a public review (visible to all after approval) |
| User rates listing | **Real (Unsafe)** — same as review |
| User edits / deletes own review | **Missing** |
| Poster responds to review | **Missing** |
| Poster disputes review | **Partial / unsafe** — could file a flag with `type: "review"` but no admin UI to resolve it |
| Admin moderates review | **Real** — Approve / Reject |
| Rating affects ranking | **Missing** — `most-reviewed` sort label points at `views`, not ratings |
| Review shown on listing page | **Real** — approved-only |
| Review shown in social metadata | **Partial** — `AggregateRating` JSON-LD shipped (C2) but no Twitter / OG card surfaces review snippets |
| Review noindex / index policy | **Missing as explicit policy** — listing pages are indexable and now ship `AggregateRating` (C2) |
| `wasReal` / `worthCost` displayed honestly | **Unsafe** — defaulted-true on every submission, displayed as user-affirmed (§3.3 / §11 H2) |

---

## 11. Homepage, listing, and marketing copy risk

| File | Quote | Status | Recommended fix |
|---|---|---|---|
| [`src/app/page.tsx:18`](../../../src/app/page.tsx) | "Free and **community-reviewed**." | partly true | acceptable if §17 fixes ship; else soften to "with community feedback where available" |
| [`src/components/home/trust-section.tsx:11-12`](../../../src/components/home/trust-section.tsx) | "Admin-Reviewed — Every listing is reviewed by our team" | **true** | keep |
| [`src/components/home/trust-section.tsx:15-17`](../../../src/components/home/trust-section.tsx) | "Community Reviews — Real feedback from past participants" | **false** ("past participants" unsupported) | drop "from past participants" → "Real feedback from users" *or* hide the tile entirely until C1 is fixed |
| [`src/components/home/trust-section.tsx:21-22`](../../../src/components/home/trust-section.tsx) | "Moderated Platform — Active moderation for quality assurance" | partly true (admin manually approves; no automated abuse detection) | keep |
| [`src/components/home/how-it-works.tsx:18-20`](../../../src/components/home/how-it-works.tsx) | "share your review to help future applicants" | true with caveats | keep, no specific change |
| [`src/app/how-it-works/page.tsx:47-50`](../../../src/app/how-it-works/page.tsx) | "Complete and Review … leaving a **verified** review" | **false** ("verified" is unsupported) | drop "verified" → "leaving a review" |
| [`src/app/how-it-works/page.tsx:73-76`](../../../src/app/how-it-works/page.tsx) | "**Top-rated programs are featured** prominently" | **false** | drop sentence |
| [`src/app/about/page.tsx:163-164`](../../../src/app/about/page.tsx) | "Reviews are moderated. We clearly label what is verified and what is not." | **true** | keep |
| [`src/app/listing/[id]/page.tsx:407-425`](../../../src/app/listing/[id]/page.tsx) | "Real experience: Yes / Worth cost: Yes / Would recommend: Yes" chips | **misleading** — defaulted-true (§3.3) | either (a) drop these chips for reviews submitted via the live form (preferred), or (b) re-introduce the rich form fields |
| [`src/app/browse/page.tsx:118-119`](../../../src/app/browse/page.tsx) | sort label "most-reviewed" maps to `views DESC` | **misleading** | rename to "most-viewed" or fix to `_count.reviews DESC` |
| `<TestimonialSection>` | absent | safe | confirmed via grep — no fake testimonials |

---

## 12. Abuse and legal risk

| Vector | Severity | Today's mitigation | Recommendation |
|---|---|---|---|
| **Self-review by listing's own poster** | **C1** | none | block via `posterId !== userId` check on `POST /api/reviews`; surface admin alert if same email domain as poster |
| Fake reviews from sockpuppet accounts | high | unique constraint on `(listingId, userId)` blocks one user, not multiple accounts | rate-limit + IP/UA capture + sign-up friction |
| Competitor spam (1-star bombs) | high | admin moderation catches obvious cases | add ≥1 completed-application gate (C1 fix) |
| Poster solicits friends to rate 5★ | high | admin moderation can't detect | rate-limit per-listing per-day + verified-purchase gate |
| Defamation in `comment` | medium | admin moderation; no automated detection | document admin SLA; reserve right to redact |
| Retaliation against applicants by poster | medium | `anonymous: true` masks public name; `userId` server-side | document anonymity scope to user (§13) |
| Private medical / immigration details in reviews | medium | none — comment is free-text | add PHI/PII warning above comment textarea |
| Harassment in comment | medium | admin moderation; rejection possible | add user "report this review" affordance for already-published reviews |
| Review extortion ("delete this review or I'll …") | low–medium | none | document admin process |
| Moderation burden | medium | manual click-through; no batching; admin notification email per review | volume-aware: at >50 pending, batch UI needed; until then, manual is fine |
| Paid manipulation (bought reviews) | low today (no traffic), medium at scale | admin sniff test | rate-limit + abuse heuristics post-launch |
| International users / privacy expectations | medium | privacy page exists; no per-region disclaimers | acceptable; revisit at GDPR/CCPA threshold |

The **single overriding finding** is that admin moderation alone cannot substitute for **authorship gating** — a poster's own 5★ review is content-clean, so admin will approve it. C1 is the one thing that would defang the worst-case abuse pattern.

---

## 13. Privacy and data sensitivity

| Concern | Status | Notes |
|---|---|---|
| Review fields could store sensitive applicant data | **risk** — `comment String?` is free-text, no length cap, no PII filter | add inline disclaimer + size cap (e.g. 4000 chars) |
| Reviewer identity exposure (anonymous mode) | **partial** — public masked; `userId` stored; admins + DB engineers can de-anonymize | document scope of "Anonymous" to user before submit |
| Private reports separate from public reviews | **yes** — `FlagReport` is admin-only, never public; `Review` is moderated public |
| Deletion / export / retention policy | **absent** — no `DELETE /api/reviews/[id]` for self; no admin export | add when GDPR/CCPA pressure exists; not blocker for v2 |
| Screenshots / documents allowed in reviews | **no** — `comment` is text-only | safer than allowing uploads; keep |
| Moderation needs PHI / PII warnings | **absent** — admin moderation UI does not flag potentially-sensitive content | future automation; manual scan today is fine |

The **anonymity-scope disclosure** is the cheapest privacy fix: when the user checks "Post anonymously", show a one-line note "Your name will be hidden publicly. Admins retain access for legal or moderation purposes."

---

## 14. SEO and structured-data implications

### 14.1 Are review / rating structured-data tags present?

**Yes — `AggregateRating` JSON-LD is emitted.** [`src/app/listing/[id]/page.tsx:147-155`](../../../src/app/listing/[id]/page.tsx):

```ts
...(avgRating !== null
  ? {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: avgRating.toFixed(1),
        reviewCount: listing.reviews.length,
      },
    }
  : {}),
```

Emitted whenever ≥1 approved review exists. **No minimum-N threshold. No verified-purchase gate.**

### 14.2 Why this is **C2**

Google's structured-data guidelines for `AggregateRating` require:
- Reviews must be from real users (not solicited or fake).
- Must be visible on the page where the structured data is emitted ✅ (it is rendered).
- Must be representative — Google penalizes sites for using `AggregateRating` with N=1 or with manipulable rating sources.

With **C1** unfixed, ratings are manipulable. With no minimum-N, a single 5★ self-review by the poster sets `ratingValue: 5.0, reviewCount: 1` — Google rich-results spam vector.

**Recommendation (mandatory before any SEO push):** gate `AggregateRating` JSON-LD on `(reviews.length ≥ 5) AND (verified-purchase reviews enabled)`. Until then, drop the JSON-LD entirely. This is conservative and matches the approach in [PLATFORM_V2_STRATEGY.md](../PLATFORM_V2_STRATEGY.md) §3 (trust-first language defaults).

### 14.3 Public review pages → thin/duplicate UGC indexation risk

`/listing/[id]` is indexable. As reviews accumulate they become primary user-generated content on that page. Two future risks:
- A listing with no real description but many short reviews ("good", "great", "loved it") becomes a thin-content page in Google's eyes.
- An empty-state listing (`No reviews yet. Be the first to share your experience.`) emits visible UGC-prompt copy that could be picked up as review-related content with no actual review.

Neither is a current blocker; flag as a watch item.

### 14.4 Listing pages should remain source/trust-first

**Confirmed risk to existing copy.** The homepage `<TrustSection>` mixes "Community Reviews" with "NPI-Verified Posters" — review-first framing creeps into trust language. Recommendation per §9 + §11: separate visually + lexically.

### 14.5 Review snippets in social metadata

Currently no Open Graph / Twitter Card emits review excerpts. Good. **Do not add review snippets to social cards** until C1 + C2 are fixed and reviews are reliably authentic.

### 14.6 Recommendation summary

- **Drop `AggregateRating` JSON-LD** until C1 + C2 are fixed (single-line code change).
- **Do not add `Review` JSON-LD** for individual reviews. Out of scope.
- Any future re-introduction must wait for verified-purchase + minimum-N policy.

---

## 15. Shared-entry implications

Apply [SHARED_ENTRY_AND_SOCIAL_DISTRIBUTION_ARCHITECTURE.md](../SHARED_ENTRY_AND_SOCIAL_DISTRIBUTION_ARCHITECTURE.md) URL-wins doctrine to review-related surfaces:

| Surface | URL-wins compliance | Notes |
|---|---|---|
| Public listing page with reviews | ✅ | opens directly, reviews load with the page; no review-modal blocks the shared content |
| `<ReviewForm>` on listing detail | ✅ | inline form, not a hijacking modal; sign-in prompt is a link, not a wall |
| `<FlagButton>` modal | ⚠️ on first click — opens a fixed-position modal that covers the listing content but only *after* the user clicks "Report issue". Not a hijack. | acceptable |
| `<ReportBrokenLinkButton>` | ✅ | inline; no modal |
| `/dashboard/reviews` shared link | redirects to login if unauthed | acceptable per direct-share doctrine — `returnTo` should be preserved (cross-check with PR 0c) |
| `/admin/reviews` shared link | redirects | acceptable; admin-gated |
| Expired listing page | Today: `notFound()` 404 | per direct-share doctrine, an expired-listing page should still surface "Report issue" so a stale link can be flagged. **§17 M2** |

No critical shared-entry violations. The expired-listing → report-issue path is the one missing piece, but it's mild.

---

## 16. Relationship to platform-v2 pathways

Per [`PATHWAY_DASHBOARD_ARCHITECTURE.md`](../PATHWAY_DASHBOARD_ARCHITECTURE.md):

| Pathway | Public reviews launch-ready? | Notes |
|---|---|---|
| **USCE & Match (Pathway 1)** | **No (C1 + C2 blocking)** — observerships / externships are exactly the use case the existing model targets, but unsafe to surface broadly until self-review is gated. Reports + flags can launch immediately (already real-functional). |
| **Residency & Fellowship (Pathway 2)** | **Defer indefinitely.** Reviewing residency programs publicly is legally and reputationally sensitive (program retaliation against IMGs is documented). Avoid public review primitive entirely on `/residency/*`. Restrict to private feedback / `FlagReport` for inaccurate program info. |
| **Practice & Career (Pathway 3)** | **Defer.** Employer / job reviews carry distinct legal exposure (defamation, anti-trust if pricing-discussion). Likely a separate primitive (`EmployerReview` or external integration) in a later phase. |
| **Show All Pathways (meta)** | n/a | review aggregation across pathways is out of scope until the per-pathway primitive is decided |

**Conclusion:** the `Review` model is **scoped to Pathway 1 listings only** at v2 launch, and even there it should be **gated to verified completion** (C1) and have **no `AggregateRating` JSON-LD** (C2). Reports + flags can run cross-pathway today.

This refines the prior PR #38 verdict that pathway boundaries are real and impact data-model decisions.

---

## 17. Risks found

### Critical (C-class) — block "verified review" / "top-rated" claims

| ID | File / route | Risk |
|---|---|---|
| **C1** | [`src/app/api/reviews/route.ts:99-122`](../../../src/app/api/reviews/route.ts) | No verified-purchase / completed-application gate. Listing's own poster, applicants who never showed up, and unrelated users can submit reviews. Self-review is the dominant abuse vector. |
| **C2** | [`src/app/listing/[id]/page.tsx:147-155`](../../../src/app/listing/[id]/page.tsx) | `AggregateRating` JSON-LD shipped with no minimum-N threshold, no verified-purchase gate. Google rich-results spam risk + trust-overstatement. |

### High (H-class) — ship a small fix PR before any v2 marketing push

| ID | File / route | Risk |
|---|---|---|
| **H1** | [`src/components/home/trust-section.tsx:15-17`](../../../src/components/home/trust-section.tsx) + [`src/app/how-it-works/page.tsx:49,76`](../../../src/app/how-it-works/page.tsx) | Three copy claims unsupported by code: "from past participants", "verified review", "top-rated programs are featured". |
| **H2** | [`src/components/listings/review-form.tsx`](../../../src/components/listings/review-form.tsx) + [`src/app/listing/[id]/page.tsx:407-425`](../../../src/app/listing/[id]/page.tsx) | Live form does not collect `wasReal` / `worthCost` / `actualExposure`; listing page renders defaulted-true values as user-affirmed. Misleading. |
| **H3** | [`src/app/api/reviews/route.ts:65-163`](../../../src/app/api/reviews/route.ts) + [`src/app/api/flags/route.ts:40-110`](../../../src/app/api/flags/route.ts) | No rate limit on review-create or flag-create. Same gap class as `POST /api/applications` from PR 0c. Theoretical until volume rises, but cheap to add. |

### Medium (M-class)

| ID | File / route | Risk |
|---|---|---|
| **M1** | [`src/app/admin/flags/page.tsx`](../../../src/app/admin/flags/page.tsx) | `/admin/flags` lists OPEN flags but has no resolve buttons. Resolution path is reachable only via `/api/admin/verification-queue`, which couples flag-resolution to listing-link verification. Non-listing-link flag types (SPAM, DUPLICATE) have no clean admin path. |
| **M2** | shared-entry expired-listing | When a listing is HIDDEN / 404, the public page returns `notFound()` with no "Report issue" surface. Per direct-share doctrine, expired pages should still allow flagging stale shares. |
| **M3** | [`src/app/api/reviews/route.ts`](../../../src/app/api/reviews/route.ts) | No check that `listing.status === "APPROVED"`. A user with a listing id can review PENDING / REJECTED / HIDDEN listings (admin moderation later catches it, but it leaks the listing's existence). |
| **M4** | review anonymity scope | `<ReviewForm>` checkbox says "Post anonymously (your name will not show)" without disclosing that admins / DB retain access for legal/moderation. |
| **M5** | dead-code components | [`src/components/reviews/review-form.tsx`](../../../src/components/reviews/review-form.tsx) and [`src/components/reviews/review-card.tsx`](../../../src/components/reviews/review-card.tsx) are not imported anywhere. Either delete or wire up. Dead code rots. |
| **M6** | review edit / delete | No self-edit, no self-delete. Mistakes / regrets must be emailed to admin. |
| **M7** | rejection rationale | `Review` has no field carrying admin's rejection reason; user sees `REJECTED` chip with no context. Adds support burden. |

### Low (L-class)

| ID | File / route | Risk |
|---|---|---|
| **L1** | `most-reviewed` sort label | [`src/app/browse/page.tsx:118-119`](../../../src/app/browse/page.tsx) — label says "most-reviewed", code orders by `views DESC`. Cosmetic mislabel. |
| **L2** | `FlagReport.type` is free-text | typo would silently insert a non-actionable row. Schema-level enum would close it; not blocker. |
| **L3** | poster receives no notification on review approval/rejection | could surprise posters when a published review appears on their listing |
| **L4** | listing detail no-reviews empty state copy | "No reviews yet. Be the first to share your experience." is fine but creates UGC-solicitation friction with C1 unfixed |

---

## 18. Recommended v2 decision

**Decision A4: option C — hide / de-emphasize public-review claims until C1 + C2 are fixed.**

Reasoning:

- Option **A** (treat reviews as real-functional now) — **rejected.** C1 and C2 are real-world abuse + SEO risks that grow with traffic.
- Option **B** (treat as report/QA-only, hide reviews) — **partially rejected.** Reports / flags are already real-functional and safe to surface; suppressing them too is over-cautious. Reports stay on; **public review widgets get conservative copy + JSON-LD removed.**
- Option **C** (de-emphasize until fixed) — **chosen.** Cheapest path, preserves the data we already have, doesn't require gutting the model.
- Option **D** (build a small fix PR before v2) — **chosen as parallel track.** PR 0d-fix described in §19.

The fix is small (~50-90 LOC) and worth doing before homepage v2 ships.

---

## 19. Required follow-up PRs

| PR | Type | Scope | Blocker? |
|---|---|---|---|
| **PR 0d-fix-1 (copy)** | docs/copy | §11 fixes: drop "verified" from how-it-works; drop "top-rated programs are featured" sentence; soften trust-section "Community Reviews" tile; rename `most-reviewed` sort label; fix listing-detail review chips per H2 (drop the always-true rows or restore the rich form). ~30-50 LOC. | **YES** before v2 launch |
| **PR 0d-fix-2 (small source hardening)** | code (small) | §17 C1: add `posterId !== userId` guard + optional `Application.status === "COMPLETED"` gate on `POST /api/reviews`. §17 C2: gate `AggregateRating` JSON-LD on `(reviews.length ≥ 5) AND verified-purchase`. §17 H3: add per-user rate limit on `POST /api/reviews` and `POST /api/flags`. §17 M3: require `listing.status === "APPROVED"`. ~70-110 LOC. No schema. | **YES** before any v2 traffic |
| **PR 0d-fix-3 (moderation/admin)** | code (medium) | §17 M1: add Resolve / Dismiss buttons on `/admin/flags` + a small `PATCH /api/flags/[id]` handler. §17 L3: notify poster on review approval (in-app only, not email). | nice-to-have, not blocker |
| **(future) UGC/SEO policy PR** | docs | When reviews launch with C1/C2 fixed: re-introduce `AggregateRating` JSON-LD with min-N=5 + verified-purchase. Add `noindex` policy for review-heavy thin pages. | post-launch |
| **(future) public review system PR** | code (large) | If volume + abuse controls warrant, build verified-purchase gate (`Application.status === "COMPLETED"` cross-check), poster-response, edit-own-review, delete-own-review. Multi-PR. | deferred |
| **(future) schema/migration PR** | schema | Add `Review.updatedAt`, `Review.rejectionReason`, `Review.submitterIp`, plus `ReviewResponse` model. **Only if authorized** by user later. | deferred |

**Batching recommendation:** combine PR 0d-fix-1 (copy) + the open PR 0b-fix + PR 0c-fix-1 (copy) into **a single small "v2 copy-truth" PR** (~60-80 LOC code + copy). Then PR 0d-fix-2 (source hardening for reviews) is its own small code PR (~70-110 LOC). Two small PRs total. Both are in scope for the next batch after 0e.

---

## 20. Do-not-do list

- **Do not** add public star ratings to any new pathway (residency programs, jobs) until C1 + C2 are fixed and at least 50 verified reviews exist as a baseline.
- **Do not** add `Review` or `AggregateRating` JSON-LD to additional pages without a minimum-N + verified-purchase gate.
- **Do not** let reviews influence Phase 3 trust badges, verification status, or `<ListingVerificationBadge>` decisions.
- **Do not** allow paid posters or featured listings to suppress, delete, or edit reviews. Review moderation stays admin-only.
- **Do not** expose applicant identity publicly by default. `anonymous: true` should remain a one-way mask publicly; admin / DB access remains for legal compliance only.
- **Do not** call reports "reviews" in user-facing copy. Two distinct primitives, two distinct words.
- **Do not** market "verified review" functionality if only the report / broken-link flow has shipped or if C1 is unfixed.
- **Do not** ship social-card review snippets on Open Graph / Twitter cards before C1 + C2.
- **Do not** add a "rate this listing" affordance to listing cards (would invite drive-by spam).
- **Do not** delete the dead-code `<ReviewForm>` / `<ReviewCard>` components in `src/components/reviews/` until §17 H2 is decided — if we re-wire the rich form (path B), they become live again.
- **Do not** add review-rating to the search-ranking input until verified-purchase is in.

---

## 21. Final recommendation

**Lock A4 = option C (hide / de-emphasize until C1 + C2 are fixed).** Reviews are real-functional in code but unsafe to advertise.

**Action queue:**

1. Merge this PR 0d audit (docs-only).
2. Continue Phase 0:
   - **PR 0e — community flow audit** (covers `CommunityPost`, `CommunityComment`, `/community/*`).
   - **PR 0f — recommend flow audit** (`/api/recommend`, `/recommend` if it exists).
   - **PR 0g — cost-calculator flow audit**.
3. After Phase 0 closes, batch **PR 0b-fix + PR 0c-fix-1 + PR 0d-fix-1** as a **single small v2 copy-truth PR** (~60-80 LOC). Closes the homepage / how-it-works / listing-detail copy gaps surfaced across audits 0b, 0c, 0d.
4. **PR 0d-fix-2 (review/flag source hardening)** is its own small code PR (~70-110 LOC). Closes C1, C2, H3, M3.
5. Public-review system improvements (poster response, edit/delete, verified-purchase enforcement) are deferred to post-launch PRs.

**Pathway tag:** `usce_match` (review system is Pathway 1 only at v2 launch). `residency_fellowship` and `practice_career` get NO public review primitive at launch.

**No critical security gap** in the strict authz sense — both C1 and C2 are integrity / trust gaps that admin moderation can't catch alone. Authz on every route is correct. PR 0d-fix-2 closes the gaps without needing schema changes.

---

*End of PR 0d audit. Sibling audits: [POSTER_FLOW_AUDIT.md](POSTER_FLOW_AUDIT.md) (PR #32), [RESIDENCY_NAMESPACE_AUDIT.md](RESIDENCY_NAMESPACE_AUDIT.md) (PR #38), [APPLICATION_FLOW_AUDIT.md](APPLICATION_FLOW_AUDIT.md) (PR #40). Next: PR 0e — community flow audit.*
