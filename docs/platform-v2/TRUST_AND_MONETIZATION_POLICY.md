# USCEHub v2 — Trust and Monetization Policy

**Doc status:** Draft recommendation. **13 open decisions extracted to [V2_DECISION_REGISTER.md](V2_DECISION_REGISTER.md).** First-monetization-mode = blocking decision A7. Disclaimer-vs-disclosure naming = blocking decision A8.

> **Revision notice (2026-04-29 audit):** §6 (paid claim flow) proposed building a new `/institutions/claim` flow + new `InstitutionClaim` Prisma model — but **`/poster/*` is a live institutional onboarding flow** with 5 subroutes backed by `PosterProfile` + `Organization` Prisma models + `UserRole.POSTER`. Per [V2_DECISION_REGISTER.md A2](V2_DECISION_REGISTER.md), **decision: extend `/poster/*` rather than replace.** §12 proposed `/disclosure` URL conflicts with existing live `/disclaimer` — per [V2_DECISION_REGISTER.md A8](V2_DECISION_REGISTER.md), **keep both** (different scope: `/disclaimer` general legal, `/disclosure` monetization-state surface).

**Status:** v2 planning doc. Operationalizes [PLATFORM_V2_STRATEGY.md §12 + §15](PLATFORM_V2_STRATEGY.md) into per-monetization-state implementation rules, FTC compliance templates, and ranking/ordering protections.
**Authority:** lower than [RULES.md](../codebase-audit/RULES.md), [SEO_PRESERVATION_RULES.md](../codebase-audit/SEO_PRESERVATION_RULES.md), [PLATFORM_V2_STRATEGY.md](PLATFORM_V2_STRATEGY.md).
**Authored:** 2026-04-29.

---

## 1. Purpose

USCEHub's trust contract is the moat. Monetization happens last, and never overrides trust. This doc binds every monetization mode v2 may eventually launch:

- Sponsored listings
- Paid claim flow
- Affiliate links (attorneys, recruiters, contract reviewers, financial professionals)
- Display advertising (TBD; not authorized at v2 launch)
- Marketplace fees (Phase D, deferred)

…and the disclosure templates, ranking rules, and forbidden patterns that bind each.

### 1.1 Anchoring principles

1. **Trust comes first, always.** Verified content sorts above paid content within any ranking surface.
2. **Free for users forever.** Per [PLATFORM_V2_STRATEGY.md §15.1](PLATFORM_V2_STRATEGY.md). User-side never paywalled.
3. **Revenue from institutions only.** Per [PLATFORM_V2_STRATEGY.md §15.2](PLATFORM_V2_STRATEGY.md). Buyers pay; users don't.
4. **FTC + state compliance non-negotiable.** Every disclosure follows FTC Endorsement Guides. Every paid placement is labeled inline.
5. **No dark patterns.** Per [PLATFORM_V2_STRATEGY.md §12.3](PLATFORM_V2_STRATEGY.md).

---

## 2. Monetization disclosure states

Per [PLATFORM_V2_STRATEGY.md §4.6](PLATFORM_V2_STRATEGY.md), every revenue surface declares its state. Reaffirmed:

| State | Meaning | Required disclosure |
|---|---|---|
| `free-non-commercial` | core data, free for users | none |
| `free-with-ads` | display advertising | "This page contains advertisements" — top of page, before fold |
| `affiliate` | affiliate links | "We earn a commission on links marked Sponsored" — top of page; per-link "Sponsored" badge |
| `sponsored-listing` | paid placement of a directory entry | per-entry "Sponsored" badge in the listing card; entry never appears above unpaid `T1-primary`-verified entries when they would otherwise rank higher |
| `paid-claim` | institution-paid claim of own listing | per-entry "Verified by program" badge — distinct from cron `VERIFIED` |
| `marketplace` | full transactional marketplace | per-flow disclosure of fee structure |

### 2.1 State per page / element

Every page declares its monetization state. Most pages will be `free-non-commercial`. As monetization launches:

| Page type | Default state | When monetization launches |
|---|---|---|
| Homepage | `free-non-commercial` | stays free; no sponsored content above fold per §3.2 |
| Vertical landing | `free-non-commercial` | sponsored slot allowed below fold with disclosure |
| Listing detail | `free-non-commercial` | a single sponsored upsell slot allowed in sidebar with disclosure |
| Curated state / specialty | `free-non-commercial` | sponsored slot allowed below fold with disclosure |
| Pathway guide / blog | `free-non-commercial` or `affiliate` (if attorney/recruiter affiliate links) | per-link "Sponsored" + top-of-page banner |
| Tool | `free-non-commercial` | sponsored upsells allowed in sidebar with disclosure |
| Directory entry (attorney/recruiter) | `paid-claim` (if claimed) or `free-non-commercial` (if scraped from public registry) | always discloses |
| Institution profile | `paid-claim` | always discloses |
| Job listing | `free-non-commercial` (if from employer URL) or `affiliate` (if affiliate-link recruiter) | always discloses |
| Email digest | `free-non-commercial` (default) or sponsored category (separate consent) | sponsored category requires explicit opt-in |

### 2.2 State on individual elements

Within a page, individual elements may carry their own state:

- A sponsored listing card on `/usce` carries `sponsored-listing` badge even though the page is `free-non-commercial`.
- An affiliate link in a blog post carries inline "Sponsored" tag even though the post itself is mostly `free-non-commercial`.
- A paid-claim institution profile within `/institutions/recruiters` is `paid-claim` even though `/institutions/recruiters` itself is `free-non-commercial` overall.

---

## 3. Ranking and ordering protection

Per [PLATFORM_V2_STRATEGY.md §12.1](PLATFORM_V2_STRATEGY.md): **`VERIFIED` listings sort above non-verified listings within any ranking surface. Sponsored / affiliate / paid-claim states never displace `VERIFIED` listings from the top of a ranking surface.**

### 3.1 Sort order specification

For any browse / vertical landing / search result that returns ranked listings:

```
Primary sort: trust state (VERIFIED first)
Secondary sort: freshness (lastVerifiedAt newest first)
Tertiary sort: monetization state (sponsored mixed in, but never displaces)
Quaternary sort: relevance / user filter intent
```

Implementation:
1. Take the candidate set (e.g. 100 listings matching filter).
2. Partition into: `VERIFIED + lastVerifiedAt` Current (≤ 90 days); `VERIFIED` Aging; `VERIFIED` Stale; everything else.
3. Within each partition, allow sponsored placements at fixed positions (e.g. position 3, 8, 13).
4. Sponsored placements **never** push a higher-trust-tier listing below their position.
5. A sponsored listing that is also Stale or unverified does not appear in the Current / Aging partition.

### 3.2 Above-the-fold rule

The first listing on any browse / vertical landing / search result is **never sponsored**. Above-the-fold real estate is reserved for the highest-trust unpaid match. This is a structural protection, not a soft preference.

### 3.3 Sponsored placement frequency

Within the candidate ranking (e.g. 20 listings on a page), sponsored placements are limited:

- 1 sponsored slot per 10 visible listings.
- Maximum 3 sponsored slots per page regardless of total length.
- Sponsored slots have visually equivalent or greater prominence than the "Sponsored" label vs the listing title (label can't be tiny gray italics).

### 3.4 Sponsored visibility / dismissibility

Sponsored slots on user-side surfaces are **not dismissible** (dismissibility implies acknowledgment that they're intrusive; we accept they exist as a labeled placement). However:

- Logged-in users may set "Hide sponsored" preference in their dashboard. (Phase D feature.)
- Default behavior: sponsored visible.

### 3.5 No fake "trending" / "popular" / "editor's pick"

If we say "Trending observerships," it's actual trending data (deterministic algorithm: highest unique-saves growth in last 30 days). If we say "Editor's Pick," an actual editor picked it (and the pick is dated and editor-attributed).

Forbidden:
- "Trending" that's actually random or based on sponsorship.
- "Featured" that's only sponsored placements.
- "Recommended for you" that has no personalization basis (e.g. a logged-out user).

---

## 4. FTC compliance (US baseline)

USCEHub's audience includes U.S. trainees. FTC rules apply to:

- Affiliate links (Endorsement Guides; "Disclosure of Material Connections")
- Sponsored content (Native advertising; "Enforcement Policy Statement on Deceptively Formatted Advertisements")
- Endorsements (Endorsement Guides; especially on physician / professional services)
- Paid testimonials (none today; never fabricate)

### 4.1 Disclosure language standards

Per FTC: disclosures must be "clear and conspicuous" — same font / size as surrounding text, before the link or claim, in plain language.

**Compliant:**
- "Sponsored: This program paid for top placement."
- "Affiliate link: We earn a commission if you book through this link."
- "[Sponsored]" badge inline before listing title, same font size.

**Non-compliant:**
- "Disclosure" link in footer (out of context).
- "*paid placement" with asterisk-style fine print.
- "Programs we love!" hiding sponsorship under enthusiasm.
- Disclosure after the link / claim.

### 4.2 Per-link affiliate disclosure

Affiliate links have inline label:

```html
<a href="https://attorney-firm.com" rel="sponsored noopener">
  Smith Immigration Law
</a> <span class="text-xs text-slate-500">(Sponsored)</span>
```

The `(Sponsored)` text appears immediately after the link, same font size, slightly subdued color. The `rel="sponsored"` attribute is per Google's link-relationship guidance (Google distinguishes sponsored from organic links).

### 4.3 Per-section affiliate disclosure

Pages containing affiliate links carry a top-of-page banner:

```
[ ! ] This page contains affiliate links. We may earn a commission on
      links marked (Sponsored). This does not affect our verification
      criteria or rankings.  [Learn more]
```

The banner appears above the H1, not below it. "Learn more" links to `/disclosure`.

### 4.4 Sponsored content

Native advertising / sponsored articles:

- Subject prefix in email: "Sponsored: ..." when in editorial newsletter (if allowed; per [MESSAGING_AND_ALERTS_POLICY.md §15](MESSAGING_AND_ALERTS_POLICY.md) open decision #11, recommendation excludes from editorial; sponsored has its own category).
- Page banner above the fold: "This is sponsored content. Sponsored by {sponsor}."
- Bylined: "Sponsored content by {sponsor}." not "USCEHub editorial."
- Visually distinct background or border vs editorial content.

### 4.5 Endorsements

USCEHub does not endorse specific programs / attorneys / recruiters. We list them with verification + disclosure. If a future feature involves endorsements (e.g. user reviews, editor recommendations beyond curated picks):

- Reviews must be verified (the reviewer actually used the service).
- Reviewer compensation (if any) must be disclosed.
- Negative reviews not suppressed.
- Aggregate scores (if shown) must include all reviews (not cherry-picked).

### 4.6 Compliance checklist (per page with monetization)

- [ ] State declared (`sponsored-listing` / `affiliate` / `paid-claim` / etc.)
- [ ] Top-of-page banner if any sponsored / affiliate content.
- [ ] Per-element badge / inline label.
- [ ] `rel="sponsored"` on all affiliate links.
- [ ] No deceptive copy ("we love this program!" hiding sponsorship).
- [ ] No urgency manipulation ("Only 2 spots left!" if not constrained).
- [ ] No fake "Editor's Pick" / "Featured" / "Trending."
- [ ] Cross-link to `/disclosure` from disclosure banner.

---

## 5. Sponsored listings (Phase C+, currently not authorized)

### 5.1 What sponsored listing is

An institution pays USCEHub to give their listing higher visibility in browse / vertical landing / search result.

### 5.2 What sponsored listing is NOT

- Not "verification." A sponsored listing must still pass our verification (cron + admin) to appear `VERIFIED`.
- Not "endorsement." We don't say a sponsored program is "best" or "USCEHub-recommended."
- Not paywalled visibility. Free listings still appear in browse; sponsored slots are additional positions, not replacement positions.

### 5.3 Sponsored listing UX

Listing card with sponsored badge:

```
┌─ Listing card ─────────────────────────────────────────┐
│ [Sponsored]                                             │
│ Johns Hopkins Cardiology Observership                   │
│ Verified · Last checked 14 days ago                     │
│ Baltimore, MD · $1,800 · 4 weeks · IMG-friendly         │
│ [Save]  [Compare]  [View Source ↗]                      │
└─────────────────────────────────────────────────────────┘
```

The "Sponsored" badge:
- Top-left of card, before title.
- Visually equivalent or greater prominence than the title font weight.
- Colored amber (or branded sponsored color, distinct from primary palette).
- Appears in card, in detail, in any aggregated view.

### 5.4 Sponsored slot pricing

Defer to Phase C+ business model decision. Recommend tiers:
- Per-impression: highest predictability for sponsor.
- Per-click: aligns with sponsor's outcome (user actually visits source).
- Flat monthly: simplest for sponsor + USCEHub.

**No revenue-share with USCEHub on actual user enrollment** — that creates incentive to misrepresent.

### 5.5 Sponsor screening

USCEHub reserves right to reject sponsorships. Bar:

- Sponsor must be a licensed institution (hospital, GME program, accredited program).
- Sponsor's listing must be verifiable to T1 / T2 source.
- No sponsorships for: unaccredited programs, programs under investigation, programs that have been flagged for misconduct, third-party "rotation reseller" agencies that USCEHub doesn't itself verify.

### 5.6 Sponsor cannot suppress

A sponsored institution **cannot** request:
- Removal of negative user flags.
- Suppression of user broken-link reports.
- Promotion above unpaid `VERIFIED` listings (per §3.1).
- Hiding of stale verification status.
- Removing the "Sponsored" badge.

If a sponsor demands any of the above, the sponsorship is terminated.

---

## 6. Paid claim flow (Phase C+, currently not authorized)

### 6.1 What paid claim is

Institutions pay to claim their own listing. After claim:
- Institution can edit listing description (subject to USCEHub editorial review).
- Institution can add multiple programs.
- Institution gets "Verified by program" badge (distinct from cron `VERIFIED`).
- Institution gets dashboard analytics (anonymized aggregates only, never per-user data per [PLATFORM_V2_STRATEGY.md §15.3](PLATFORM_V2_STRATEGY.md)).

### 6.2 What paid claim is NOT

- Not free verification. Cron and admin verification are separate, free, and not affected by claim status.
- Not free top placement. Claim ≠ sponsorship (sponsorship is separate).
- Not exclusive. Multiple programs at one institution can be claimed; one institution doesn't get exclusive right to a state / specialty.

### 6.3 Free claim option

USCEHub offers a free claim option for institutions that want to claim their listing without paying. Free claim:
- Institution can edit listing description (subject to review).
- Institution can request the listing be re-verified.
- No "Verified by program" badge.
- No analytics access.

Paid claim adds the badge + analytics + editorial priority.

### 6.4 Why this dual model

- Free claim ensures institutions aren't locked out of correcting their own data behind a paywall.
- Paid claim creates a revenue stream from institutions that derive value from the badge + analytics.
- Bar to claim is verification of institutional identity (email from institutional domain + admin manual review).

### 6.5 Claim verification

Institution claim requires:
- Email from `@<institution-domain>` (e.g. `@jhmi.edu` for Johns Hopkins).
- Admin manual review of claim before approval.
- Per claim, audit log entry recording who claimed + when + admin who approved.

---

## 7. Affiliate links (Phase C+, currently not authorized)

### 7.1 What affiliate links are

Links to attorney / recruiter / contract reviewer / financial professional services where USCEHub earns a commission on conversion.

### 7.2 What affiliate links are NOT

- Not the only path to a service. Every affiliate-linked service must also be findable via direct search (not behind affiliate links exclusively).
- Not the highest-ranked path. Per §3, affiliate links don't displace organic, verified directory entries.

### 7.3 Where affiliate links live

- Pathway guides (`/visa/conrad-30` may link to affiliate immigration attorneys).
- Blog posts (a "How to choose an immigration attorney" post may include affiliate links).
- Directory pages (attorney directory may surface affiliate-paid attorneys with disclosure).

### 7.4 Per-link disclosure

Per §4.2: inline `(Sponsored)` label, same font size, slightly subdued. `rel="sponsored noopener"` attribute.

### 7.5 Per-section disclosure

Per §4.3: top-of-page banner.

### 7.6 Affiliate revenue tracking

USCEHub tracks affiliate revenue per partner per page per month. **Aggregated only.** Never tied to individual user.

---

## 8. Display advertising (deferred, never authorized)

### 8.1 Default position: no display ads

USCEHub does not run display advertising at v2 launch. Reasons:

- Display ad networks (Google Ads, Mediavine, etc.) require third-party tracking pixels — violates [PLATFORM_V2_STRATEGY.md §15.3](PLATFORM_V2_STRATEGY.md).
- Display ads create perverse incentive to maximize page views (publishes more pages, lowers quality).
- Healthcare / medical content + display ads = trust hit for our specific audience.

### 8.2 If reconsidered (not now)

Display ads would only be considered:
- After the institution-side revenue (sponsorship + claims + marketplace fees) is insufficient.
- After a separate authorization decision documented here.
- With strict ad-quality controls (no betting, no get-rich-quick, no medical-misinformation ads).
- With per-page disclosure ("This page contains advertisements").
- With ad placements that don't displace `VERIFIED` listings.

### 8.3 Currently: no ad slots reserved

v2 IA does not reserve ad slots in templates. Ads are not assumed.

---

## 9. Marketplace (Phase D, deferred)

### 9.1 What marketplace looks like

At Phase D (per [PLATFORM_V2_STRATEGY.md §14.1](PLATFORM_V2_STRATEGY.md)), USCEHub may operate a marketplace where:
- Institutions list paid services (rotation placement, contract review, financial planning).
- Users discover and engage these services via USCEHub.
- USCEHub takes a fee (placement fee, success fee, or referral fee).

### 9.2 Marketplace governance

Before any marketplace flow ships:
- Legal review of payment / contract / commerce surface.
- Fee structure publicly disclosed per `/disclosure`.
- Refund / dispute policy documented.
- No "exclusive" listings (institution can't pay USCEHub to be the only provider in a category).
- No ranking-by-fee (highest commission ≠ highest rank; trust + verification still wins).

### 9.3 What we don't do

- Take a cut of clinical-service fees (e.g. observership tuition). Per FTC + many state laws, this can be considered a kickback.
- Take a cut of attorney fees (state bar rules in many states prohibit non-lawyer fee-splitting).
- Take a cut of physician compensation (state medical board rules).

We may take fees on **placement** (sponsorship, paid claim) and **lead generation** (qualified introduction to a service), structured to comply with applicable state/federal rules.

---

## 10. No dark patterns

Per [PLATFORM_V2_STRATEGY.md §12.3](PLATFORM_V2_STRATEGY.md), reaffirmed:

### 10.1 What is forbidden

- "You must subscribe to view this listing" gates on `T1-primary` content.
- "Free trial that auto-bills if not canceled" flows.
- "Remove ads with subscription" — the free product is the product.
- "Only 2 spots left!" when supply isn't actually constrained.
- "Verified by USCEHub" when it isn't.
- "Editor's pick" when nobody picked it.
- Hidden / collapsed unsubscribe.
- Pre-checked email subscription opt-ins.
- "Add to cart but you can't see fees until checkout."
- Roach-motel cancellation flows (signup is one click; cancel is 5 steps).

### 10.2 Why this matters

Dark patterns are short-term-revenue, long-term-trust-destroying. USCEHub's audience is high-trust-bar. Once a physician trainee feels manipulated, they don't come back AND they tell their cohort.

### 10.3 If a dark pattern is proposed

- Flag the proposer (could be a third-party integration vendor, an investor suggestion, a growth tactic).
- Refuse the implementation.
- Document the refusal.

---

## 11. Reporting mechanism for partners

When a sponsored listing or affiliate partner has a complaint about USCEHub's behavior:

- Email to `partner@uscehub.com` (or current operator address).
- USCEHub responds within 7 business days.
- USCEHub does NOT pre-emptively pause its trust / verification protections to satisfy the partner.

When a user has a complaint about a sponsored listing or affiliate partner:

- Existing flag report system (`POST /api/flags`) accepts complaints about sponsored content.
- Flag kind: `OTHER` with text noting "sponsored content concern."
- Admin queue surfaces; admin reviews + may revoke sponsorship if grounds.

---

## 12. Disclosure page (`/disclosure`)

A dedicated page that enumerates all monetization states active on USCEHub at any given time. Updated whenever a new monetization mode launches or ends.

### 12.1 Content

```
USCEHub Disclosure

Last updated: [date]

How USCEHub is funded
- USCEHub is free for users (physicians and trainees).
- USCEHub generates revenue from institutions:
  * Sponsored listings (paid placement of program listings)
  * Paid claim flow (institutions paying to claim and feature their listings)
  * Affiliate links (commissions from attorney / recruiter / contract reviewer / financial professional services)

What you'll see
- Sponsored listings carry a [Sponsored] badge.
- Affiliate links carry a (Sponsored) inline tag.
- Pages with affiliate or sponsored content carry a top-of-page banner.

What we never do
- Override our verification status with payment.
- Suppress user-reported broken links because of sponsorship.
- Display un-disclosed sponsored content.
- Sell user data to institutions.

How to report
- If you see undisclosed sponsorship or believe a sponsored entry is misrepresented, email [report address] or use the "Report broken link" button.

Current sponsorships
- [list of active sponsorship partners as of [date]]
- [list of active affiliate partners as of [date]]
```

### 12.2 Linking

- Linked from every commercial-content page banner.
- Linked from footer of every page.
- Linked from footer of every commercial email.
- Indexable per [INDEXATION_AND_URL_POLICY.md §4.1](INDEXATION_AND_URL_POLICY.md) (legal pages are indexable).

### 12.3 Update cadence

- Static base content reviewed quarterly.
- Active sponsorship list updated within 7 days of each sponsorship start / end.

---

## 13. Internal policy: who decides on monetization launches

### 13.1 Current state

USCEHub is a solo founder operation. The founder decides every monetization launch.

### 13.2 Process for launching a monetization mode

1. **Strategy doc update.** Update this doc + [PLATFORM_V2_STRATEGY.md §12](PLATFORM_V2_STRATEGY.md) to reflect the new mode + its rules.
2. **Implementation PR.** Build the mode in `redesign/platform-v2` branch (Lane 2) per [PLATFORM_V2_STRATEGY.md §5.2](PLATFORM_V2_STRATEGY.md).
3. **Compliance audit.** Per §4.6 checklist. Self-audit + external audit if uncertain.
4. **Soft launch.** Limited rollout (e.g. 1 sponsorship slot on 1 vertical landing) with monitoring.
5. **Disclosure page update.** Per §12.3.
6. **Full launch.** Only after soft launch results are clean.

### 13.3 Per-mode launch sequence (recommended order)

1. **Free claim flow** (first; no monetization, just institutional engagement)
2. **Paid claim flow** (after free claim flow is operational and ≥ 5 free claims completed)
3. **Sponsored listings** (after paid claim flow is operational)
4. **Affiliate links** (cross-cuts with content; after 1+ pathway guide / blog post category is curated and traffic-bearing)
5. **Marketplace / contract review / financial professional directory** (Phase D, after all above are stable)

Display ads: never, unless re-authorized (per §8).

---

## 14. Forbidden operations

These are explicit non-goals until each is individually authorized:

- Any monetization launch without first updating this doc.
- Any sponsorship that overrides the §3 ranking protection.
- Any monetization without disclosure per §4.
- Any tracking pixel beyond Vercel Analytics aggregate.
- Any subscription / paywall on the user side.
- Any "premium tier" that locks essential data.
- Any auto-renewing subscription without explicit user re-confirmation.
- Selling user data to institutions.
- Sharing per-user analytics with sponsors (only aggregate).
- Sponsorship of admin queue priority (sponsor cannot pay to push their own broken-link report ahead of others).

---

## 15. Open decisions

1. **First monetization mode launched.** Free claim or paid claim or sponsored listing? **Recommend: free claim first (no $ exchange; surfaces operational complexity safely).**
2. **Pricing model for sponsored listings.** Per-impression / per-click / flat monthly. **Recommend: flat monthly (simplest); migrate to per-impression if scale demands.**
3. **Pricing model for paid claim.** Flat annual fee per institution. **Recommend: $X/year per institution claim; tiered by institution size or program count is Phase D complexity.**
4. **Affiliate partner selection.** Recommend partners through manual outreach (vetting on legal compliance, licensing, reputation). **Recommend: 5 manually-vetted partners at launch; never affiliate networks (cesspool of compliance issues).**
5. **Disclosure banner styling.** Yellow/amber background, top-of-page, dismissible? **Recommend: amber background, top-of-page, NOT dismissible.**
6. **Sponsored badge color.** Amber to align with disclosure banner, or distinct color (purple, blue) for visual hierarchy? **Recommend: amber to ensure consistent visual cue.**
7. **Sponsored slot positions.** Position 3, 8, 13 (every 5th)? Or position 1 (above-fold) — rejected per §3.2. **Recommend: position 3, 8, 13.**
8. **Sponsored on listing detail page.** A single sidebar slot? **Recommend: single slot in sidebar, below "Save / Compare" actions, with disclosure.**
9. **Affiliate link `rel` attributes.** `rel="sponsored noopener"` (Google's preference). Some say `nofollow` is also needed. **Recommend: `rel="sponsored noopener"` only (covers both per Google's docs).**
10. **Disclosure page indexability.** Indexable (per current default). Or `noindex` to keep out of search? **Recommend: indexable (transparency = trust signal).**
11. **Refund policy.** USCEHub does not handle refunds for sponsorship → institution; sponsor pays USCEHub, takes their own commercial position. **Recommend: stated refund window (30-day) for paid claim; no refunds for sponsorship after first month.**
12. **Marketplace seller verification.** All sellers must pass background / licensing verification. **Recommend: state bar lookup for attorneys; state recruiting registry lookup for recruiters; state insurance license lookup for financial professionals.**
13. **AI-generated content + monetization.** If we ever use AI to draft pathway guides, disclose? **Recommend: yes — separate disclosure on any AI-drafted content. Currently no AI drafting in use.**

---

## 16. Compliance checklist (per monetization launch)

Before any monetization mode goes live:

- [ ] This doc updated to reflect the new mode.
- [ ] [PLATFORM_V2_STRATEGY.md §12](PLATFORM_V2_STRATEGY.md) updated to reflect the new mode.
- [ ] §4.6 per-page compliance checklist passes.
- [ ] §3 ranking protection verified (sponsored slot does not displace `VERIFIED`).
- [ ] §10 dark-pattern check: no instance of forbidden patterns.
- [ ] Disclosure banner CSS + JSX implemented.
- [ ] Per-element badge implemented.
- [ ] `/disclosure` page updated.
- [ ] Email footer (if applicable) updated.
- [ ] Soft launch pilot (1 partner / 1 page) for ≥ 14 days with monitoring.
- [ ] Compliance auditor sign-off (self for v2 launch; external audit by Phase D).
- [ ] Operator runbook updated for monitoring + escalation.

---

## SEO impact (this doc)

```
SEO impact:
- URLs changed:        none (planning doc only; future /disclosure URL TBD)
- redirects added:     none
- sitemap changed:     no
- robots changed:      no
- canonical changed:   no
- metadata changed:    no
- JSON-LD changed:     no (future sponsored content will require schema.org/AdvertiserContentArticle JSON-LD)
- pages noindexed:     none
- internal links:      none changed
- risk level:          ZERO — internal monetization policy doc
```

## /career impact

None.

## Schema impact

None. Future schema additions per [PLATFORM_V2_STRATEGY.md §7.3](PLATFORM_V2_STRATEGY.md):
- `Listing.monetizationDisclosure` (enum)
- `Listing.sponsorshipState` (enum)
- `InstitutionClaim` model
- `SponsoredPlacement` model

These are not authorized by this doc.

## Authorization impact

None. Documenting trust/monetization policy is not authorization to build any monetization mode. Each mode requires:
- Update of this doc + [PLATFORM_V2_STRATEGY.md §12](PLATFORM_V2_STRATEGY.md)
- Implementation PR (Lane 2)
- §4.6 + §16 compliance verification
- Explicit user authorization
