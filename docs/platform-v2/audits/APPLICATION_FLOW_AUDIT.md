# Application Flow Audit (PR 0c)

**Status:** complete
**Audited at:** main `418cbe3` (2026-04-29)
**Scope:** the `Application` Prisma model, `/api/applications*`, `/api/poster-applications`, `/dashboard/applications`, `/poster/applications`, and the listing-page CTA path that *should* lead to creating an application.
**Audit type:** docs-only. No code changes in this PR. Fix work is queued as separate PRs.

This audit unblocks **decision A3** (homepage `/` copy "submit your application through the platform / track your applications from your dashboard" — real-functional, real-functional-minimal, or aspirational?). It is the third of seven Phase 0 audits; PR 0a (poster) and PR 0b (residency) are merged at `5c47e8f` and `0ce1559`. Sibling audits: [`POSTER_FLOW_AUDIT.md`](POSTER_FLOW_AUDIT.md), [`RESIDENCY_NAMESPACE_AUDIT.md`](RESIDENCY_NAMESPACE_AUDIT.md).

---

## 1. Executive verdict

**Verdict: real-functional backend, broken applicant-create entry point.** Refines the prior PR #32 hunch ("real-functional but minimal").

Three layers, three different truths:

| Layer | Status | One-line truth |
|---|---|---|
| **DB + API** | real-functional, minimal | `Application` model + 3 routes work end-to-end for `{listingId, applicantId, message, status}`. |
| **Applicant create surface** | **absent in production UI** | No `<ApplyForm />` component exists. `decideListingCta()` in [`src/lib/listing-cta.ts`](../../../src/lib/listing-cta.ts) never returns the `"platform"` variant — the union member is dead code. Every public listing-detail CTA exits to external `websiteUrl` or `mailto:contactEmail`. |
| **Status-tracking dashboards** | real-functional, populate-empty for new users | `/dashboard/applications` and `/poster/applications` render real DB rows correctly, but for a fresh applicant there is no UI path that creates the row they would track. |

The homepage claim "Submit your application **through the platform** or via the institution's preferred method. Track your applications from your dashboard" ([`src/components/home/how-it-works.tsx:13-14`](../../../src/components/home/how-it-works.tsx)) is therefore **partly aspirational, partly true**:

- "Submit your application through the platform" — **false today.** No UI surface creates one.
- "or via the institution's preferred method" — true (the listing-detail CTA exits to the institution's `websiteUrl` / `mailto:`).
- "Track your applications from your dashboard" — true *only for rows that already exist*; for a new applicant who never POSTed via API the dashboard is empty by construction.

**Decision A3:** option **B — real-functional but minimal**, with a hard caveat: the homepage clause "through the platform" must be **dropped** in copy (cheap fix) **or** an in-platform `<ApplyForm />` must be built (large fix). Recommendation in §15.

**No critical security gap surfaced.** Backend authz is correct (re-confirmed; see §4 and §10). The risk surface is **copy-truth**, **spam (no rate limit on `POST /api/applications`)**, and **notification gap** (status changes are silent).

---

## 2. Existing route inventory

All routes confirmed present at `418cbe3`:

| Route | File | Method | Audit verdict |
|---|---|---|---|
| `POST /api/applications` | [`src/app/api/applications/route.ts:74-147`](../../../src/app/api/applications/route.ts) | create | works; APPLICANT-only gate; listing must be `APPROVED`; unique-constraint dedupe. **No rate limit.** |
| `GET /api/applications` | [`src/app/api/applications/route.ts:6-72`](../../../src/app/api/applications/route.ts) | list | dual-mode: `?listingId=` returns poster/admin view (ownership-gated); no param returns applicant's own. |
| `PATCH /api/applications/[id]` | [`src/app/api/applications/[id]/route.ts`](../../../src/app/api/applications/[id]/route.ts) | status update | poster/admin: any status; applicant: `WITHDRAWN` only. Status enum validated against allowlist. |
| `GET /api/poster-applications` | [`src/app/api/poster-applications/route.ts`](../../../src/app/api/poster-applications/route.ts) | poster cross-listing list | POSTER/ADMIN gate; returns all applications across all listings the poster owns, with applicant profile data joined. |
| `/dashboard/applications` | [`src/app/dashboard/applications/page.tsx`](../../../src/app/dashboard/applications/page.tsx) | UI (applicant) | client-side fetch of `/api/applications`; lists own applications with status badge; empty-state CTA → `/browse`. |
| `/poster/applications` | [`src/app/poster/applications/page.tsx`](../../../src/app/poster/applications/page.tsx) | UI (poster) | client-side fetch of `/api/poster-applications`; lists applicants + profile snippets; inline Accept/Reject buttons that PATCH `/api/applications/[id]`. |

**Routes that do NOT exist (the central finding):**

| Expected route | Actual status |
|---|---|
| `POST /api/applications` UI form on `/listing/[id]` | **absent.** No `<ApplyForm />` component. No `useState` for an application body. No `fetch("/api/applications", { method: "POST" })` anywhere in `src/components/**` or `src/app/listing/**`. |
| `<ApplyButton variant="platform" />` | **absent.** The `"platform"` variant is in [`ListingCtaVariant`](../../../src/lib/listing-cta.ts:64) type union but `decideListingCta()` never returns it. |
| Status-change notifications (email or in-app) | **absent.** No `sendApplicationStatusEmail()`, no `notification` table. |
| CV upload field | **absent.** `Application.message: String?` is the only applicant-supplied field. |

Confirmed via `grep -rn 'fetch.*"/api/applications".*POST\|<ApplyForm' src/` — zero hits outside the dashboards (which only GET).

---

## 3. Data model

### 3.1 `Application` ([`prisma/schema.prisma:293-306`](../../../prisma/schema.prisma))

```prisma
model Application {
  id          String            @id @default(cuid())
  listingId   String
  listing     Listing           @relation(fields: [listingId], references: [id], onDelete: Cascade)
  applicantId String
  applicant   User              @relation(fields: [applicantId], references: [id], onDelete: Cascade)
  message     String?
  status      ApplicationStatus @default(SUBMITTED)
  createdAt   DateTime          @default(now())
  updatedAt   DateTime          @updatedAt

  @@unique([listingId, applicantId])
  @@map("applications")
}

enum ApplicationStatus {
  SUBMITTED
  UNDER_REVIEW
  ACCEPTED
  REJECTED
  COMPLETED
  WITHDRAWN
}
```

**Observations:**

- Fields are minimal: just `message` (free-text, `String?`, no length cap exposed) and `status`. No CV reference, no document attachment, no structured fields (preferred dates, supplemental questions, etc.).
- Unique constraint on `(listingId, applicantId)` enforces one-application-per-applicant-per-listing — correct, and matches the API's 409 on duplicate.
- Cascade delete on both sides is appropriate: deleting a listing or user cleans up their applications.
- `@@map("applications")` keeps the SQL table name conventional.

### 3.2 `ApplicantProfile` ([`prisma/schema.prisma:141-163`](../../../prisma/schema.prisma))

```prisma
model ApplicantProfile {
  id, userId @unique, country, currentLocation, medicalSchool, graduationYear,
  currentRole, specialtyInterest, visaStatus, usmleStep1, usmleStep2, ecfmgStatus,
  shortBio, cvUrl, cvText, linkedin
}
```

`cvUrl` and `cvText` exist on the **profile** but **are never read into an Application row.** They are read by `GET /api/poster-applications` (joined as `applicant.applicantProfile`) so a poster can see them when reviewing — but the applicant has no UI to attach a specific CV per-application. The CV is profile-level, not application-level. Consequence:

- Switching CVs per program is impossible.
- Updating the CV later mutates how *every* past application is presented to *every* poster who refetches — there is no application-time snapshot.

### 3.3 What is NOT modeled

| Concept | Why it might matter |
|---|---|
| Per-application document set | applicants typically tailor CV / personal statement per program; today's model can't represent that. |
| Application-time profile snapshot | a poster reviewing an application six months later sees the applicant's *current* `usmleStep1`, not the score-at-submit. Acceptable for now (USMLE scores don't really go backwards) but worth flagging. |
| Status-change history / audit | `updatedAt` is the only history. `AdminActionLog` does not log application transitions. A poster can flip ACCEPTED → REJECTED with no breadcrumb. |
| Notifications / message thread | applicants never learn that status changed unless they refresh `/dashboard/applications`. |
| Application fee / payment | not modeled. Several listings in seed data describe non-trivial application fees ($200-$400; e.g. Cleveland Clinic Elective). The platform doesn't collect or even surface them as a structured field. |
| External-application reference | when an applicant applies via VSLO / institutional portal, no row exists in our DB at all. Their dashboard doesn't reflect that they applied. |

---

## 4. Role and authorization

Re-confirmed from PR 0a-fix series (`POSTER_FLOW_AUDIT.md` §4). No new findings.

| Action | Required role | Object check | Verdict |
|---|---|---|---|
| `POST /api/applications` | session + `role === "APPLICANT"` | listing must be `APPROVED` ([`route.ts:107`](../../../src/app/api/applications/route.ts)); unique constraint dedupes ([:115-129](../../../src/app/api/applications/route.ts)) | correct. POSTER and ADMIN explicitly cannot apply, which matches the role split. |
| `GET /api/applications?listingId=...` | session | `listing.posterId === session.user.id \|\| ADMIN` ([`route.ts:27`](../../../src/app/api/applications/route.ts)) | correct. |
| `GET /api/applications` (no param) | session | implicit — filter `applicantId === session.user.id` | correct. |
| `PATCH /api/applications/[id]` | session | poster of underlying listing OR admin OR self (only `WITHDRAWN`) | correct three-way fork at [`[id]/route.ts:38-52`](../../../src/app/api/applications/[id]/route.ts). |
| `GET /api/poster-applications` | session + `role in {POSTER, ADMIN}` | implicit — filter `listing.posterId === session.user.id` | correct. |

**Edge cases reviewed:**

- Can a POSTER create an Application by impersonating themselves as APPLICANT? No — role is read from session, not request body.
- Can an APPLICANT change another user's application via PATCH? No — `application.applicantId === session.user.id` is the only path that lets a non-poster non-admin in, and even then only `WITHDRAWN` is allowed.
- Can an applicant withdraw, then re-apply? **No** — the unique `@@unique([listingId, applicantId])` constraint blocks reinsert. The `WITHDRAWN` row stays. POST returns 409. This is a UX gap, not a security gap (see §10 risks).

**Authz verdict:** clean. No fix PR needed for role/auth at this layer.

---

## 5. Applicant flow (intended vs actual)

### 5.1 Intended flow per homepage copy
1. Browse listings.
2. Click "Apply Now" on a listing detail page.
3. Fill in a form (presumably message + maybe CV).
4. Submit; row appears in `/dashboard/applications`.
5. Watch status change as poster reviews.

### 5.2 Actual flow on production code at `418cbe3`
1. Browse listings — works ([`/browse`](../../../src/app/browse)).
2. Click "Apply Now" on listing detail — **opens an external link** to `listing.websiteUrl` (or `mailto:contactEmail`, or disabled). See [`src/app/listing/[id]/page.tsx:464-520`](../../../src/app/listing/[id]/page.tsx).
3. ~~Fill in a form~~ — does not exist. The button leaves the platform.
4. The applicant submits via the institution's external system.
5. Their `/dashboard/applications` is **empty** because no row was ever created.

### 5.3 The CTA truth table

From [`src/lib/listing-cta.ts:88-148`](../../../src/lib/listing-cta.ts) — the only function that decides what the listing-detail Apply button does:

| Listing condition | CTA returned | Where it goes |
|---|---|---|
| `reverifying === true \|\| status === "REVERIFYING"` | "Application link being reverified" | disabled |
| `listingType === "RESEARCH"` && has `websiteUrl` | "Learn More" | external `websiteUrl` |
| has `websiteUrl` && verified | **"Apply Now"** | external `websiteUrl` |
| has `websiteUrl` && unverified | "View Official Source" | external `websiteUrl` |
| no URL, has `contactEmail` | "Contact to Apply" | `mailto:contactEmail` |
| nothing | "Verify Program Page" | disabled |

**No branch returns `variant: "platform"`.** The string `"platform"` appears in the [`ListingCtaVariant` type union at line 64](../../../src/lib/listing-cta.ts) and in [`ctaCaption()` line 168](../../../src/lib/listing-cta.ts), but `decideListingCta()` never produces it. It is dead code — a placeholder for a feature that was never built.

The `Listing.applicationMethod` field (default `"platform"`) is currently used **only for compare-page display** ("Via Platform" vs "External") at [`src/app/compare/compare-client.tsx:169`](../../../src/app/compare/compare-client.tsx). The CTA decision ignores it. So a listing with `applicationMethod: "platform"` shows the same external `websiteUrl` button as one with `applicationMethod: "external"` — the field is informational only.

### 5.4 Net effect for the applicant

| Promise on `/` | Reality |
|---|---|
| "Apply Directly" (step heading) | true — they apply at the institution. |
| "Submit your application through the platform" | **false** — no platform-side form. |
| "or via the institution's preferred method" | true. |
| "Track your applications from your dashboard" | **false for self-served users** (no row gets created). True if a row was seeded or hand-POSTed via API. |

---

## 6. Poster flow

The poster side is real-functional and complete. Re-confirms PR #32 audit. Briefly:

- `/poster/applications` ([`src/app/poster/applications/page.tsx`](../../../src/app/poster/applications/page.tsx)) lists every application across every listing the poster owns, with the applicant's `name`, `email`, `medicalSchool`, `country`, `usmleStep1`, `usmleStep2` shown inline and `message` as a quote block.
- Status SUBMITTED or UNDER_REVIEW renders inline `Accept` / `Reject` buttons (lines 181-198), each triggering `PATCH /api/applications/{id}` with the new status.
- No status-history view, no message-back affordance, no email digest.

**For the poster, the dashboard is real and useful — assuming applications exist.** Because the applicant-create surface is absent (§5), the poster's dashboard is also populate-empty unless someone hand-creates rows.

---

## 7. Admin flow

Admins see no dedicated `/admin/applications` page. They can:

- Hit `/api/applications?listingId=X` for any listing.
- Hit `/api/poster-applications` (POSTER/ADMIN gate at [route.ts:13](../../../src/app/api/poster-applications/route.ts)) — but this filters on `listing.posterId === session.user.id`, so an admin sees only listings *they personally own*, not all listings. **This is likely a bug from the admin perspective.**
- PATCH any application's status.

Admins can:
- ✅ Override application status by id (PATCH route accepts `isAdmin` branch).
- ❌ See a global feed of all applications without knowing listing ids in advance. There is no `/admin/applications` UI.
- ❌ Reassign an application between listings (no route).
- ❌ See application audit trail (no log).

The admin gap is mild. Today there are presumably few or zero applications at all, so a global admin feed would be vacuous; this can be revisited if a `<ApplyForm />` is ever built.

---

## 8. Functional truth table (per-route × per-role)

Reads: ✅ allowed and works, ❌ blocked, ⚠️ allowed but degraded.

| Action | UNAUTH | APPLICANT | POSTER (own listing) | POSTER (other listing) | ADMIN |
|---|---|---|---|---|---|
| `POST /api/applications` | ❌ 401 | ✅ 201 (or 409) | ❌ 403 | ❌ 403 | ❌ 403 |
| `GET /api/applications` (own) | ❌ 401 | ✅ own list | ✅ empty list (no apps as APPLICANT) | ✅ empty | ✅ empty |
| `GET /api/applications?listingId=X` | ❌ 401 | ❌ 403 | ✅ if `X.posterId === self` | ❌ 403 | ✅ |
| `PATCH /api/applications/[id]` (status=ACCEPTED) | ❌ 401 | ❌ 403 (only WITHDRAWN allowed for self) | ✅ if poster of `app.listing` | ❌ 403 | ✅ |
| `PATCH /api/applications/[id]` (status=WITHDRAWN, by self) | ❌ 401 | ✅ if applicant === self | n/a | n/a | ✅ |
| `GET /api/poster-applications` | ❌ 401 | ❌ 403 | ✅ own listings only | (n/a — filter scopes out) | ⚠️ scoped to admin's *own* listings only — likely unintended; see §7 |
| `/dashboard/applications` (UI) | redirects to login | ✅ shows own | ✅ shows own (likely empty) | ✅ shows own | ✅ shows own |
| `/poster/applications` (UI) | redirects | n/a (route gate) | ✅ | ✅ but populate-empty | ✅ |
| **In-platform create from listing detail** | n/a | **❌ no UI** | n/a | n/a | n/a |

The last row is the central finding.

---

## 9. Copy / truth-in-advertising risk

### 9.1 Homepage `how-it-works`
[`src/components/home/how-it-works.tsx:13-14`](../../../src/components/home/how-it-works.tsx):
> "Submit your application through the platform or via the institution's preferred method. Track your applications from your dashboard."

**Status:** the "through the platform" half is unsupported. Fix options:
- (A) **Drop the clause.** New text: "Apply via the institution's preferred method (linked from each listing). Track applications you've logged from your dashboard."
- (B) **Build the in-platform create form.** Restores the truth of the original copy. Larger work — see §15.

[`src/components/home/how-it-works.tsx:40-41`](../../../src/components/home/how-it-works.tsx) (institution side):
> "Receive applications directly through the platform. Review candidate profiles and manage your selection process."

**Status:** structurally true — IF applications exist, posters do see them in `/poster/applications`. But again, populate-empty without §5 fix. Should be re-worded to match (A) or wait for (B).

### 9.2 [`HOMEPAGE_V2_WIREFRAME.md §12`](../HOMEPAGE_V2_WIREFRAME.md)
Already calls out this concern — "soften 'submit your application through the platform' if not actually true". This audit confirms: it is **not** actually true. Decision A3 = option B (real-functional but minimal) **plus** mandatory copy softening.

### 9.3 Privacy page
[`src/app/privacy/page.tsx:93`](../../../src/app/privacy/page.tsx) says "When you submit an application to a [program]". Fine in spirit — it covers both the in-platform and the linked-out cases. No fix needed.

### 9.4 Listing edit form
[`src/app/poster/listings/new/page.tsx:389`](../../../src/app/poster/listings/new/page.tsx) and [`[id]/edit/page.tsx:413`](../../../src/app/poster/listings/[id]/edit/page.tsx) offer the poster a select with `<option value="platform">Through Platform</option>`. **This option is misleading — choosing "Through Platform" today does NOT route the applicant through a platform form.** Fix options:
- (A) Remove the `"platform"` option (choices: `external`, `email`).
- (B) Wire the option to a real flow (depends on §15.B work).
- Recommended: drop the option in the same copy-only PR as §9.1 fix-A.

### 9.5 Compare page
[`src/app/compare/compare-client.tsx:169`](../../../src/app/compare/compare-client.tsx) renders `applicationMethod === "platform" ? "Via Platform" : "External"`. **Same misleading-truth issue.** Fix in the same PR.

---

## 10. Trust and safety

| Surface | Risk | Severity | Mitigation today | Recommendation |
|---|---|---|---|---|
| `POST /api/applications` | spam — no rate limit | medium | none. Compare with `GET /api/listings` which has 30/min IP rate limit at [`route.ts:21`](../../../src/app/api/listings/route.ts) | add per-user rate limit (e.g. 10 applications/24h) before enabling §15.B in-platform form. |
| `POST /api/applications` | bot detection | low | none | inherit `isScrapingBot` check from listings route. |
| `PATCH /api/applications/[id]` | poster mass-rejecting then disappearing | low | applicants get no notification, so don't notice | once notifications exist (§14), bound transition velocity per poster. |
| Application content (`message`) | applicant doxxes themselves; poster shares the message | low–medium | none. Applicant `email` is exposed to poster ([`route.ts:38`](../../../src/app/api/applications/route.ts)) by design. | document in privacy that applicant identity (name, email, profile) is shared with the listing poster on submit. (Already partially in `/privacy`.) |
| Re-application after WITHDRAWN | unique constraint blocks | UX bug, not a safety bug | applicant is silently 409'd | when in-platform form ships, allow re-apply by deleting the prior WITHDRAWN row OR change uniqueness to `@@unique([listingId, applicantId, status])` with care. |
| Application status manipulation | poster ACCEPTS then REJECTS to extort | low | no audit log on transitions | add `ApplicationStatusLog` (parallel to `AdminActionLog`) before §15.B. |

**No critical (C-class) gap.** The §10 list is medium-and-below.

---

## 11. Privacy

| Field shared with poster | Source | Privacy notice present? |
|---|---|---|
| `applicant.name` | session.user | ✅ in privacy `/privacy` |
| `applicant.email` | session.user | ✅ |
| `applicant.applicantProfile.medicalSchool` | profile | ⚠️ implicit |
| `applicant.applicantProfile.country` | profile | ⚠️ implicit |
| `applicant.applicantProfile.usmleStep1` | profile | ⚠️ — Step scores are sensitive; should be explicit |
| `applicant.applicantProfile.usmleStep2` | profile | ⚠️ — same |
| `applicant.applicantProfile.specialtyInterest` | profile | ⚠️ implicit |
| `application.message` | application | ✅ implied (it's the user's content) |

**Recommendation:** when `<ApplyForm />` ships, surface a "What the program will see" disclosure inline with the submit button. Until then this is academic — there's no platform create surface to disclose.

CV (`cvUrl`, `cvText`) is on the profile, not the Application — sharing happens via profile-fetch in `GET /api/poster-applications`. The applicant currently has no per-application visibility filter.

---

## 12. SEO and share-entry

The Application primitive is **not** a discoverable entity. None of `/dashboard/applications`, `/poster/applications`, or `/api/applications*` should be in the sitemap or indexable. Confirmed: not in [`src/app/sitemap.ts`](../../../src/app/sitemap.ts) (cross-checked; no `applications` strings).

Application IDs are cuid; they're not shareable or guessable. There is no `/applications/[id]` public page. Direct-share doctrine ([`SHARED_ENTRY_AND_SOCIAL_DISTRIBUTION_ARCHITECTURE.md`](../SHARED_ENTRY_AND_SOCIAL_DISTRIBUTION_ARCHITECTURE.md)) does not apply here — applications are private records, not shareable artifacts.

**One indirect concern:** the `<ApplyForm />` (if built per §15.B) would need an explicit `noindex` head on the form page, and any post-submit confirmation page should also `noindex` to avoid leaking applicant intent into Google.

---

## 13. Pathway architecture relationship

Per [`PATHWAY_DASHBOARD_ARCHITECTURE.md`](../PATHWAY_DASHBOARD_ARCHITECTURE.md):

| Pathway | Application primitive needed? | Today's `Application` model fits? |
|---|---|---|
| **USCE & Match (Pathway 1)** | yes — observerships, externships, research positions | ✅ this is exactly what `Application` models. The full audit applies here. |
| **Residency & Fellowship (Pathway 2)** | no — applicants apply via ERAS / NRMP, not the platform | ⚠️ if we ever model "I matched to program X" or "I'm interested in program Y" that's a *different* primitive (an interest-track or match-record), not an Application. |
| **Practice & Career (Pathway 3)** | yes — but jobs are a different beast | ❌ applying to a *job* needs cover letter, salary expectations, references, etc. Today's `Application.message` won't carry it. Would need either a polymorphic Application or a sibling `JobApplication` model. |
| **Show All Pathways (meta)** | n/a | n/a |

**Conclusion:** the `Application` primitive is **scoped to Pathway 1 (USCE listings) and unfit for Pathway 3 (jobs).** When Pathway 3 lights up, expect a new primitive. Tag this audit's findings as **`pathway: usce_match`** in the cross-pathway impact registry.

This matches PR #38's verdict that pathway boundaries are real and impact data-model decisions.

---

## 14. Notification gap (called out separately because it shapes the verdict)

The most user-visible flaw of the current real-functional backend is that **status changes are silent.**

| Event | Today's behavior |
|---|---|
| Applicant submits via API | Poster sees it on next `/poster/applications` page load. No email. |
| Poster clicks Accept | Applicant sees it on next `/dashboard/applications` page load. No email. |
| Poster clicks Reject | Same — silent. |
| Applicant withdraws | Poster sees it next page load. Silent. |
| Listing is HIDDEN by admin while application is SUBMITTED | Application stays SUBMITTED forever; applicant has no way to know the listing is dead. |

**Implication for copy:** "Track your applications from your dashboard" is technically true (the dashboard renders the row) but operationally weak — you can only "track" by manually returning to the dashboard.

**Notification work is intentionally deferred** under the "no real emails" guardrail (`/Users/shelly/.claude/CLAUDE.md`-style global). Do not enable real emails as part of this audit fix. When emails ship under PR phase 2+, applications status transitions are a legitimate trigger; today they are out of scope.

---

## 15. A3 recommendation (decision)

**Decision A3: option B — real-functional backend, minimal, with absent applicant-create UI.**

### 15.1 Required follow-up (before any v2 launch claim of in-platform applications)

**Path A (recommended): copy-truth fix, no new feature.**
- Drop "through the platform" from `how-it-works.tsx`.
- Drop the `"Through Platform"` option from listing-create / edit forms.
- Drop the "Via Platform" branch from compare-page rendering.
- Drop `"platform"` from `ListingCtaVariant` and the unreachable case in `ctaCaption()`.
- Net change: ~15-25 LOC, copy + dead-type cleanup. Restores truth without building anything.
- Cost: low. Risk: zero. Time: 30-45 min.

**Path B (deferred, large): build the actual in-platform `<ApplyForm />`.**
- New component `<ApplyForm listingId={id} />`.
- Wires into existing `POST /api/applications`.
- Add applicant rate limit (per §10).
- Add status-change notification trigger (decoupled from email — initially in-app only).
- Add re-apply-after-WITHDRAWN UX (per §10).
- Add per-application CV snapshot or per-application document set (§3).
- Cost: 4-8 PRs of work; gated behind real emails (§14) for status notifications.
- Time: weeks, not hours.

**Recommendation: ship Path A in the next docs-or-copy batch. Defer Path B until after Phase 0 audits finish (0d, 0e, 0f, 0g) and a real-email infrastructure decision is made.** Path A is the only blocker for taking the homepage out of partial-falsehood territory.

### 15.2 Why option B (and not "delete the model and routes")

Three reasons not to nuke `Application`:

1. The dashboards work. Posters can already use them if rows exist (e.g. seed data, or if a future v2 form is wired). Removing them creates more work later.
2. Unique-key + cascade behavior is correct and tested implicitly by the API.
3. The compare page and `applicationMethod` field reference the concept; tearing it out changes more code than fixing copy does.

Keep the backend, fix the copy, build the form later.

---

## 16. Recommended follow-up PRs

| PR | Scope | Type | Blocker for | Status |
|---|---|---|---|---|
| **0c-fix-1** | Copy + dead-type cleanup per §15.1 Path A. Files: `src/components/home/how-it-works.tsx`, `src/lib/listing-cta.ts` (drop `"platform"` from union and switch case), `src/app/compare/compare-client.tsx`, `src/app/poster/listings/new/page.tsx` (drop `option value="platform"`), `src/app/poster/listings/[id]/edit/page.tsx` (same). ~20 LOC code, no schema/migration. | code (small) | v2 homepage truth | not started |
| **0c-fix-2** *(optional, low priority)* | Admin global-applications view (§7). Adds `/admin/applications` UI + scope-fix for `GET /api/poster-applications` when caller is ADMIN (return all, not own). | code | nothing (mild admin convenience) | deferred |
| **0c-fix-3** *(deferred, gates on email decision)* | Build `<ApplyForm />` per §15.1 Path B. Multi-PR. | code (large) | post-Phase-0 | deferred until §14 + §15.B decided |
| **0b-fix-1** *(prior, still open)* | Insurance disclosure rewrite + fellowship wording soften + sitemap residency-entry removal + survival title metadata. Carry-over from PR 0b. | code (small) | nothing | open |

**Recommended ordering:** finish PR 0d (review-flow audit) before any 0c-fix. Then batch 0b-fix + 0c-fix-1 as a single small copy/code PR (they're all surface-truth fixes; <70 LOC combined).

---

## 17. Do-not-do list

Things this audit explicitly does **not** recommend doing now:

- Do **not** remove `Application` model or any of the four routes. Backend is sound.
- Do **not** add real-email notifications. Out of scope per global guardrail; deferred to phase 2+.
- Do **not** build `<ApplyForm />` in this audit cycle. Defer until Phase 0 finishes.
- Do **not** change Prisma schema. No `cvUrl`-on-Application, no `ApplicationStatusLog`, no `JobApplication` sibling. Schema work is post-audit.
- Do **not** rate-limit `POST /api/applications` yet — there's no UI calling it, so the spam vector is theoretical. Add the rate limit when `<ApplyForm />` ships.
- Do **not** change role/auth on any route. All four routes pass authz review.
- Do **not** wire `applicationMethod === "platform"` into the listing-CTA decision. That's a Path B decision. For now, remove the field's user-visible affordances (PR 0c-fix-1) and leave the column alone in the DB.
- Do **not** start Phase A design tokens. Audits 0d–0g still pending per user instruction.
- Do **not** push this audit branch without explicit instruction.

---

## 18. Final recommendation

**Lock A3 = option B (real-functional but minimal).** The Application backend is real. The applicant-create UI is absent. Homepage copy is partly false today.

**Action queue:**
1. Merge this PR 0c audit (docs-only).
2. Proceed to **PR 0d — review-flow audit** as the user has already queued. No fix-PR needed before 0d unless 0d surfaces a critical issue.
3. After 0d: batch **0b-fix + 0c-fix-1** as a single small copy/code PR (~50 LOC).
4. Continue with PR 0e (community), 0f (recommend), 0g (cost calculator) per Phase 0 plan.
5. Path B (`<ApplyForm />`) revisited after Phase 0 closes and email/notification decision is made.

**Pathway tag:** `usce_match`. The Application primitive belongs to Pathway 1; Pathway 3 (jobs) will need a different primitive when it lights up.

**No critical (C-class) security gaps surfaced.** All findings are copy-truth (§9), notification-gap (§14), spam-bound-future (§10), and admin convenience (§7).

---

*End of PR 0c audit. Sibling audits: [POSTER_FLOW_AUDIT.md](POSTER_FLOW_AUDIT.md) (PR #32, merged), [RESIDENCY_NAMESPACE_AUDIT.md](RESIDENCY_NAMESPACE_AUDIT.md) (PR #38, merged). Next: PR 0d — review-flow audit.*
