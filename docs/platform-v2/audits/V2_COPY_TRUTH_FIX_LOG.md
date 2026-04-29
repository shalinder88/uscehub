# V2 Copy-Truth + Review-Hardening Fix Log

**PR title:** Fix v2 copy truth and review trust claims
**Branch:** `fix/v2-copy-truth-review-hardening`
**Sources:** [POSTER_FLOW_AUDIT.md](POSTER_FLOW_AUDIT.md) (PR #32), [RESIDENCY_NAMESPACE_AUDIT.md](RESIDENCY_NAMESPACE_AUDIT.md) (PR #38), [APPLICATION_FLOW_AUDIT.md](APPLICATION_FLOW_AUDIT.md) (PR #40), [REVIEW_FLOW_AUDIT.md](REVIEW_FLOW_AUDIT.md) (PR #41).
**Scope:** small copy fixes + small review-source hardening + the single explicitly-authorized SEO implementation change (suppress `AggregateRating` JSON-LD until review gating exists).

This is **not** a redesign, schema change, or new feature. It is the smallest set of changes that closes the live truth/safety gaps surfaced by Phase 0 audits 0b, 0c, 0d.

---

## What was fixed

### A. Application-flow copy truth (from PR 0c)

The `Application` backend exists but no in-platform `<ApplyForm />` does — every public listing-detail CTA exits to external `websiteUrl` or `mailto:`. The homepage and how-it-works copy was promising "submit your application through the platform" without code behind the claim. Softened across:

- `src/components/home/how-it-works.tsx` — applicant step "Apply Directly" + institution step "Manage Inbound Interest" rewritten.
- `src/app/how-it-works/page.tsx` — applicant step "Apply and Track" + institution step "Manage Inbound Interest" rewritten.
- `src/app/compare/compare-client.tsx` — comparison cell now reads "Via institution" instead of branching on a `"platform"` value the CTA layer never produces.
- `src/app/poster/listings/new/page.tsx` + `src/app/poster/listings/[id]/edit/page.tsx` — the misleading `<option value="platform">Through Platform</option>` was removed; default `applicationMethod` changed from `"platform"` to `"website"`. Existing rows with `applicationMethod === "platform"` round-trip through the DB unchanged.
- `src/lib/listing-cta.ts` — dead `"platform"` member removed from `ListingCtaVariant` union and from `ctaCaption()` switch. `decideListingCta()` never returned it.

### B. Review-flow copy truth (from PR 0d)

Three claim-classes were unsupported by code: "verified review", "Top-rated programs are featured", and "from past participants". Softened across:

- `src/app/how-it-works/page.tsx` — three review-related steps rewritten ("Complete and Share Feedback", institution "Build Your Reputation").
- `src/components/home/how-it-works.tsx` — applicant step now points to "share your review" without claiming verification.
- `src/components/home/trust-section.tsx` — "Community Reviews" tile description updated to "Moderated community feedback, separate from source verification".
- `src/app/faq/page.tsx` — Q "How are listings verified" answer separates community reviews from source-link verification.
- `src/app/for-institutions/page.tsx` — tile relabeled "Community Feedback" (was "Community Reviews & Reputation") with description that drops the unsupported "verified reviews from past participants" phrasing.

### C. Review / verification visual separation (from PR 0d §9.5)

Reviews and verification badges sat adjacent on listing detail with no separator — visual conflation risk. Added a one-line clarifier directly below the `Reviews` heading in `src/app/listing/[id]/page.tsx`:

> "Reviews are user-submitted feedback, moderated before publishing. They are separate from the verification badges shown on this page, which refer to source-link checks, not review endorsement."

### D. Misleading defaulted-true review chips removed (from PR 0d H2)

The live review form (`src/components/listings/review-form.tsx`) does not collect `wasReal` / `worthCost` / `actualExposure`, but the API silently defaults them to `true` / `3` server-side. Two surfaces previously rendered these defaulted values as user-affirmed claims; both were removed:

- `src/app/listing/[id]/page.tsx` — per-review chip block ("Real experience: Yes / Worth cost: Yes / Would recommend: Yes") removed.
- `src/app/dashboard/reviews/page.tsx` — per-review chip block ("Real Experience / Worth the Cost / Would Recommend") removed. Anonymous chip retained (it is collected by the form).

DB column values are unchanged. If the rich review form is ever rewired (audit M5), the chips can come back.

### E. AggregateRating JSON-LD suppression (authorized SEO impl change, PR 0d C2)

Removed the `aggregateRating` block from the JSON-LD payload in `src/app/listing/[id]/page.tsx`. With C1 unfixed at the schema level (no completed-application gate), structured data risks Google rich-results spam classification. An inline comment marks the suppression and points to the audit. **No other JSON-LD, sitemap, robots, canonical, or redirect was touched.**

### F. Review-source hardening (from PR 0d C1, M3, H3)

Three small, schema-free guards on `POST /api/reviews`:

1. **Listing must be APPROVED** (M3) — prevents leaking PENDING / REJECTED / HIDDEN listing existence and prevents a hidden listing from accumulating reviews while offline.
2. **Poster cannot self-review** (C1) — `listing.posterId !== session.user.id`. Closes the dominant abuse vector that admin moderation cannot detect from content alone.
3. **Per-user rate limit** (H3) — 5 review submissions per user-IP per hour via the existing in-memory `rateLimit` helper.

`POST /api/flags` got a parallel rate limit (H3): 20 flag submissions per user-IP per hour (higher because legitimate users may report several stale links in one session).

### G. Misleading sort label (from PR 0d L1)

Verified the user-visible label in `src/components/listings/listing-filters.tsx:151` is already `"Most Viewed"`. The internal sort key value remains `"most-reviewed"` because changing it would break any existing bookmarked URLs. **No fix needed.**

### H. Residency / fellowship copy truth (from PR 0b R1)

`src/app/residency/finances/page.tsx:107-112` — five named insurance carriers ("Guardian, MassMutual, Principal, Ohio National, Ameritas... most commonly recommended") rewritten to remove brand names in favor of a structured comparison framework, an explicit non-endorsement note, and a third-party reference. Closes the FTC-pre-monetization risk identified in [TRUST_AND_MONETIZATION_POLICY.md §4](../TRUST_AND_MONETIZATION_POLICY.md).

---

## What was intentionally not fixed

- **Full `<ApplyForm />`** — deferred (PR 0c-fix-3). Would require multi-PR scope, real-email decision, and rate-limit infrastructure.
- **CV upload** — out of scope. Today `Application.message` is the only applicant-supplied field.
- **Real email notifications** — banned by current guardrails. Fire-and-forget admin notification continues to fire from review/flag create paths.
- **Completion-gated reviews via `Application.status === "COMPLETED"`** — would require schema-aware cross-check; deferred to a future review-system PR. The `posterId !== userId` guard added here is the cheap subset of C1 that closes the dominant abuse vector.
- **Review schema / migration** — no `Review.updatedAt`, no `Review.rejectionReason`, no `Review.submitterIp`, no `ReviewResponse` model. Schema work is post-launch.
- **Admin review-response / dispute tooling** — `/admin/flags` resolve buttons (PR 0d M1) deferred; flag resolution remains coupled to `/api/admin/verification-queue` for now.
- **Public star-rating rich-results** — `AggregateRating` JSON-LD stays suppressed until completed-application gate + minimum-N threshold are both shipped.
- **Broad route / SEO redesign** — no sitemap, robots, canonical, redirect, or other JSON-LD changes. Authorized exception was `AggregateRating` removal only.
- **`/career`** — explicitly out of scope. Zero `/career` files touched.
- **`<ReviewForm>` in `src/components/reviews/`** (the rich form variant, dead code per PR 0d M5) — left in place for now. If the rich form is ever rewired, the chips removed in §D can come back.
- **`most-reviewed` sort key** — kept as-is to avoid breaking saved URLs.
- **`compare-client.tsx`'s `applicationMethod` field** — kept on the data model (TypeScript interface + API select). Only the user-visible cell changed.

---

## Files changed

| File | Class | Why |
|---|---|---|
| `src/components/home/how-it-works.tsx` | copy | A — soften "through the platform" / "Review Applicants" |
| `src/components/home/trust-section.tsx` | copy | B — "Community Reviews" tile |
| `src/app/how-it-works/page.tsx` | copy | A + B — applicant + institution steps |
| `src/app/faq/page.tsx` | copy | B — verification Q answer separates reviews from verification |
| `src/app/for-institutions/page.tsx` | copy | B — drop "verified reviews from past participants" |
| `src/app/residency/finances/page.tsx` | copy | H — insurance brand names rewritten |
| `src/app/compare/compare-client.tsx` | copy + small code | A — application column neutralized |
| `src/app/poster/listings/new/page.tsx` | small code + copy | A — drop "Through Platform" option, change default |
| `src/app/poster/listings/[id]/edit/page.tsx` | small code + copy | A — same as above |
| `src/lib/listing-cta.ts` | small code | A — drop dead `"platform"` variant |
| `src/app/listing/[id]/page.tsx` | code + copy | C, D, E — separator note, drop chips, drop `AggregateRating` JSON-LD |
| `src/app/dashboard/reviews/page.tsx` | small code | D — drop misleading chips |
| `src/app/api/reviews/route.ts` | small code | F — APPROVED gate, no-self-review, rate limit |
| `src/app/api/flags/route.ts` | small code | F — rate limit |
| `docs/platform-v2/audits/V2_COPY_TRUTH_FIX_LOG.md` | docs | this file |

**Forbidden paths verified untouched:** `/career`, `/careers`, `prisma/schema.prisma`, `prisma/migrations/**`, `prisma/seed.ts`, `vercel.json`, `src/app/sitemap.ts`, `src/app/robots.ts`, `src/middleware.ts`, any cron route, any email-sending lib (`src/lib/email.ts`), monetization code.

---

## Audit decision deltas

| Audit | Decision before this PR | Decision after this PR |
|---|---|---|
| **A1** (residency namespace, PR 0b) | keep `/residency/*` canonical; ship 0b-fix later | unchanged. R1 (insurance) closed. Other 0b items still future. |
| **A3** (application flow, PR 0c) | option B (real-functional, minimal); copy must soften | unchanged. Copy softened. |
| **A4** (review flow, PR 0d) | option C (hide / de-emphasize until C1 + C2 fixed) | **partially closed.** C2 (AggregateRating) suppressed; C1 has its `posterId !== userId` subset shipped. Full completion-gating still deferred. |

---

## Resume order

1. Merge this PR if checks are clean.
2. Resume **PR 0e — community flow audit** (covers `CommunityPost`, `CommunityComment`, `/community/*`).
3. Then PR 0f (recommend) and 0g (cost calculator).
4. After Phase 0 closes: revisit deferred items (full ApplyForm, completion-gated reviews, admin flag resolution UI, `<ReviewForm>` rich-form rewire decision).
