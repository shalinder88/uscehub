# Hospital Authenticity and Correction Workflow — Audit & Plan

**Status:** Docs only. No source changes. No UI implementation. No metadata changes.

**Updated:** 2026-05-01

---

## 1. North-star vision

USCEHub is a **hospital-authentic, institution-respectful, source-linked public infrastructure layer** for U.S. clinical experience information. It earns its place by being the easiest place for a hospital to either find its programs accurately listed (with a current source link, last-reviewed status, and a one-click correction path) or have its programs corrected, updated, or removed without friction.

Long-term, the same authenticity standard extends to residency/fellowship pathway and physician career-transition information. **For the current 95% target the focus is USCE only.** Pathway and career routes remain noindex'd until they meet the same standard.

## 2. Current wedge

**Verified, source-linked U.S. clinical experience directory — first.** Everything else is downstream of getting the USCE source-linked layer right.

## 3. Hospital trust requirements

Hospitals decide whether USCEHub is acceptable based on:

| Requirement | Status today |
|---|---|
| Official source link on every listing | ✅ Implemented (`websiteUrl` field; `listingDisplay` CTA logic) |
| Source status visible on every listing | ✅ Implemented (`ListingVerificationBadge` 5 states: verified / verified-on-file / reverifying / needs-review / unverified) |
| Last-reviewed timestamp visible | ✅ Implemented (`lastVerifiedAt` rendered by `ListingTrustMetadata` when source is verified) |
| Report broken link | ✅ Implemented (`ReportBrokenLinkButton` component, exists on listing detail) |
| Suggest correction | ⚠️ Partial. `FlagButton` exists for "something wrong with this listing" but routes through general flag flow, not a correction-typed flow. No structured correction taxonomy. |
| Request removal | ❌ **Missing.** No dedicated removal flow. Hospitals would need to use generic contact form or flag. |
| Request update (e.g. cost change, contact change) | ❌ **Missing.** Same gap as removal. |
| Neutral disclaimer | ✅ Implemented (`ListingDisclaimer` shown on browse + listing detail: "We are re-verifying application links and deadlines. Always confirm details on the official institution page before applying.") |
| No fake affiliation | ✅ Doctrine (no logos, no "approved by", no "official partner") |

**Gaps to close before outreach:** structured correction flow, dedicated removal flow, update/change-request flow, hospital-facing one-pager, coordinator outreach templates.

## 4. Applicant trust requirements

Applicants need to trust that:

- Each listing has a real institution behind it.
- The application path goes to that institution, not a third party.
- The link is current.
- Costs and visa support shown match what the institution actually says.
- Reviews come from actual past participants and are moderated.
- Reviews are separate from source verification (so a 5-star review never implies the link is current).

| Requirement | Status today |
|---|---|
| Real-institution attribution | ✅ Implemented (organization linkage on listing) |
| Application path to institution | ✅ Implemented (`listingDisplay.cta` → `websiteUrl` or `mailto`, never platform-tracked) |
| Link freshness | ✅ Implemented (cron `verify-listings` daily 9:00 UTC) |
| Cost/visa accuracy | ⚠️ Partial. Fields exist but no formal "Last confirmed by institution" timestamp distinct from link-verification timestamp |
| Review provenance | ⚠️ Partial. Reviews are moderated, but the form does not currently gate on "completed application" or "verified purchase" — see `REVIEW_FLOW_AUDIT.md` §14. AggregateRating is intentionally not in JSON-LD until that gate ships. |
| Review/verification separation | ✅ Implemented (badge UI splits the two; copy on listing detail explicitly says "Reviews are user-submitted feedback, moderated before publishing. They are separate from the verification badges shown on this page, which refer to source-link checks, not review endorsement.") |

## 5. What hospitals should feel when they land on USCEHub

1. They can find their listing in 3 clicks (search by name → state → specialty).
2. The listing **has a working link to their actual program page** (not a third-party form).
3. They can see exactly **when the link was last verified**.
4. They can correct, update, or remove the listing in **under 2 minutes** without an account, via a path that's clearly labeled.
5. The page **does not** claim hospital approval, partnership, or affiliation.
6. The page **does not** invent statistics about the hospital.
7. The page **does not** use language like "best", "top-rated", "verified by hospitals", "guaranteed", or "approved".

## 6. Forbidden claims (hard rules)

Public copy must NOT contain any of:

- "Official database"
- "Hospital-approved"
- "Verified by hospitals"
- "Guaranteed rotations" / "guaranteed acceptance"
- "Best programs" / "top-rated programs"
- "Officially verified" (when meaning anything beyond cron link check)
- "The largest [X] for IMGs" — *current violation, see §15 audit findings*
- Fake reviews, fake activity counts, fake match counts, fake institution endorsements

Permitted source-honest language:

- "Source-linked"
- "Verified link" (when `lastVerifiedAt` is recent)
- "Official source on file" (when URL exists but no fresh verification)
- "Last reviewed [date]"
- "Re-verifying"
- "Source needs review"
- "Source not yet verified"
- "Correction-friendly"
- "Independent informational platform"
- "Not affiliated with [institution / NRMP / ECFMG / etc.]"

## 7. Required public pages for hospital authenticity

| Page | Purpose | Status |
|---|---|---|
| `/methodology` | How USCEHub sources, verifies, and updates listings | ✅ Exists (133 LoC), needs audit pass for hospital-authentic copy |
| `/for-institutions` | Hospital-facing summary of what USCEHub does and how to engage with it | ✅ Exists (331 LoC), serves both hospitals and physicians; should split or clarify |
| `/for-hospitals` (dedicated) or **clear hospital section inside /for-institutions** | One-pager for hospital coordinators | ⚠️ Partial — currently mixed with physician-facing copy |
| `/correction` or `/listing/[id]/correct` | Structured correction request flow | ❌ Missing as a route |
| `/listing/[id]/remove` | Removal request flow | ❌ Missing as a route |
| Report broken link | Per-listing button | ✅ Exists (`ReportBrokenLinkButton`) |
| Suggest a program | For applicants/community to suggest new programs | ✅ Exists at `/community/suggest-program` |
| `/contact-admin` | Direct admin contact for institutions | ✅ Exists (132 LoC) |

## 8. Correction workflow (target design — not implemented)

```
1. Hospital coordinator sees their listing on USCEHub
   ↓
2. Clicks "Suggest correction" (per-listing button on listing detail)
   ↓
3. Form fields:
   - Field to change (dropdown: title / contact / cost / dates / source URL / eligibility / other)
   - Current value (auto-filled from DB)
   - Proposed value (text input)
   - Source supporting the change (URL or upload — institution page preferred)
   - Submitter role (dropdown: program coordinator / staff / physician / other)
   - Submitter contact (institutional email preferred)
   ↓
4. Submitted → admin queue (CorrectionRequest table, NEW)
   ↓
5. Admin reviews:
   - Verifies submitter contact (institutional email check)
   - Compares proposed change against the source URL
   - Approves / Rejects / Requests more info
   ↓
6. If approved:
   - Updates listing
   - Stamps `lastInstitutionConfirmedAt = now`
   - Sends confirmation email to submitter
   - Adds row to AuditLog (NEW or extends existing)
   ↓
7. If rejected:
   - Sends explanation email
   - Adds row to AuditLog with reason
   ↓
8. Public-facing: listing shows "Last confirmed by institution: <date>"
   when `lastInstitutionConfirmedAt` is non-null and within 90 days.
```

**Schema additions required (deferred — separate PR with explicit approval):**

- `CorrectionRequest` table (id, listingId, fieldName, currentValue, proposedValue, sourceUrl, submitterRole, submitterEmail, status, adminNote, createdAt, resolvedAt)
- `Listing.lastInstitutionConfirmedAt` (nullable DateTime)

**Until that schema lands**, the workflow can be approximated with the existing `FlagButton` + admin queue, but it doesn't capture the structured taxonomy needed for clean reporting.

## 9. Removal workflow (target design — not implemented)

Same shape as correction, but:

- Reason dropdown: program closed / never existed / institution requests removal / duplicate / privacy
- Approval immediately sets `Listing.status = "REMOVED"` (or new `REMOVED_BY_INSTITUTION` enum value).
- Removed listings are noindex'd individually, return HTTP 410 if hard-removed, 404 if soft.
- Audit log records the removal.

## 10. Copy standards

| Surface | Required tone |
|---|---|
| Listing detail | "Source-linked" not "verified" unless cron is fresh. Stars only on community reviews. CTA: "View official source" not "Apply". |
| Browse | "Verified link" badge means cron-fresh; "Official source on file" means URL on file but not fresh. Never aggregate badges into one. |
| Methodology page | First-person plural, transparent about cron cadence, manual review, source-link policy. Acknowledge that links go stale. |
| For Hospitals | Frame as "you can correct this in 2 minutes" not "we are pleased to feature you". |
| Contact / correction emails | Plain, neutral, no marketing. |
| Disclaimers | "Independent informational platform. Not affiliated with [list]. Always verify with the official institution before applying." |

## 11. Outreach one-pager outline (for hospital coordinators)

A printable single page (PDF + HTML version) that a coordinator can read in 90 seconds:

1. **Header:** "Your program is listed on USCEHub. Here's what that means and what you can do about it."
2. **What we do:** "We list publicly available program information so applicants can find it. We link to your official page; we don't take applications."
3. **What we don't do:** "We don't claim affiliation. We don't endorse. We don't accept applications on your behalf. We don't run the listing through a third-party form."
4. **What you can do:** Three buttons / links — Correct, Update, Remove.
5. **Source-link policy:** "Every listing links to your page, not a USCEHub-tracked URL. We re-check links weekly."
6. **Reviews:** "Reviews are from past participants, moderated, and labeled separately from source verification."
7. **Contact:** Direct email to admin queue + 24–48h response SLA.

**Status:** outline only. Implementation is a separate ticket.

## 12. Coordinator email templates outline

Drafts to be reviewed before sending; **not auto-sent**.

| Template | Use |
|---|---|
| Initial outreach | Notify a hospital that their program is listed; offer correction path |
| Correction confirmation | Thank-you + receipt of correction request |
| Correction approved | Confirms applied + new "last confirmed" date |
| Correction rejected | Explains why + how to provide stronger source |
| Removal confirmation | Confirms listing is removed + when it goes off public surface |
| Annual re-confirm | Yearly check-in: "Is this still accurate?" with a one-click confirm link |

## 13. Admin queue requirements

- Filter by: status (open / approved / rejected / awaiting-info), submitter type (institution / applicant / anonymous), age, listing
- Action: approve, reject, request more info
- Audit log per action
- Email auto-send (queued, not auto-fired in dev)
- Bulk approve only with secondary confirmation
- All actions wrapped in `prisma.$transaction` (matches existing `AdminActionLog` pattern from PR 0a-fix-4)

## 14. 95% readiness checklist

For USCEHub to be at 95% hospital-authentic readiness:

- [ ] PR #52 (UI release candidate) shipped
- [ ] PR #53 (OG image) shipped
- [ ] Sitemap noindex contradiction fixed (this session's local commit `a3e9b1d`)
- [ ] Vercel duplicate disconnected (separate ops task)
- [ ] `/methodology` rewritten to hospital-authentic copy
- [ ] `/for-institutions` split into clear Hospital section + clear Physician section
- [ ] `/listing/[id]/correct` flow shipped (or equivalent inline form)
- [ ] `/listing/[id]/remove` flow shipped (or admin-handled)
- [ ] Hospital one-pager (HTML + PDF)
- [ ] Email templates drafted
- [ ] Admin queue UI for correction/removal requests
- [ ] `lastInstitutionConfirmedAt` shown publicly when present
- [ ] Forbidden-claim audit completed and copy fixed (see §15)
- [ ] First 5 hospitals notified with one-pager
- [ ] First 5 corrections processed end-to-end without bugs

## 15. Existing-page audit (gap table)

| Surface | Current state | Needed | Priority | PR candidate |
|---|---|---|---|---|
| `src/app/page.tsx:94` and `src/app/layout.tsx:25` | JSON-LD `Organization.description` says **"The largest structured database of clinical observership, externship, and research opportunities for International Medical Graduates"** — overclaim "largest" + IMG-only framing | Replace with neutral description: "An independent, source-linked directory of U.S. clinical experience programs (observership, externship, research, postdoc, volunteer)" | **High** — touches JSON-LD, currently locked. Needs explicit approval to edit metadata. | `fix/seo-remove-largest-claim` (separate PR after explicit approval) |
| `/methodology` | 133 LoC, exists. Copy not audited yet. Currently on slate styling. | Hospital-authentic rewrite: cron cadence, manual review process, link-status taxonomy, correction-friendly stance, what we don't do | High | `content/methodology-hospital-authentic` |
| `/for-institutions` | 331 LoC, mixed audience (Hospitals + Physicians). Currently on slate styling. | Split into clear hospital section + clear physician section. Hospital section gets the one-pager content. | High | `content/for-institutions-split-hospital-physician` |
| `/contact-admin` | 132 LoC. Generic admin contact form. | Verify the form actually routes correction/removal requests to a queue. If not, add taxonomy. | Medium | `feature/admin-correction-queue` |
| `/community/suggest-program` | 42 LoC. Applicant-facing. | Keep separate from hospital correction flow (different audience). Add note that hospitals should use correction flow instead. | Low | `content/suggest-program-hospital-redirect` |
| `ReportBrokenLinkButton` (134 LoC) | Per-listing, exists. | Audit copy + endpoint. Confirm it goes to the same admin queue as correction. | Medium | `audit/correction-queue-routing` |
| `ListingTrustMetadata` (110 LoC) | Renders source/last-reviewed when verified | Add `lastInstitutionConfirmedAt` rendering when schema lands | Low (depends on schema) | `feature/last-institution-confirmed-display` |
| `FlagButton` (118 LoC) | Generic flag flow | Either retire in favor of typed correction flow, or keep as catch-all with reduced prominence | Medium | `feature/typed-correction-flow` |
| `ListingDisclaimer` (36 LoC) | "We are re-verifying application links" — already neutral | No change required | — | — |

## 16. Deferred — future institution accounts

Long-term, hospitals could claim their listings via:

- Institutional email verification
- NPI verification (already partly implemented for posters)
- Domain ownership verification

This is **not part of the 95% target.** Listed here only to note it's the next step after the correction workflow proves itself with non-account hospital coordinators.

## 17. Relationship to long-term resident/fellow/career platform

The hospital-authenticity standard developed for USCE is the same standard that residency/fellowship and career-transition pathways will need before they're un-noindex'd. Building it correctly here is the prerequisite for un-burying the rest of the site.

## 18. What this audit does NOT do

- Does not change any source code.
- Does not change any metadata or JSON-LD (the "largest" violation is recorded, not fixed).
- Does not change any route.
- Does not implement the correction workflow.
- Does not draft email templates (only outline).
- Does not draft the hospital one-pager (only outline).
- Does not touch PR #52 or #53.

## 19. What this audit DOES do

- Records the north-star vision and 95% target.
- Lists existing trust components and their state.
- Calls out the structured gaps (correction / removal / update flows).
- Records one current copy violation (`"The largest …"` in JSON-LD on `page.tsx` and `layout.tsx`).
- Provides a gap table with PR-candidate names so future tickets are pre-named.
- Defines acceptable language and forbidden claims.
- Sets the order of work: PR #52 → PR #53 → sitemap → Vercel cleanup → methodology rewrite → for-institutions split → correction flow → coordinator outreach.
