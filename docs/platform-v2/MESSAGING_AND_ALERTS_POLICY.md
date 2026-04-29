# USCEHub v2 — Messaging and Alerts Policy

**Status:** v2 planning doc. Operationalizes [PLATFORM_V2_STRATEGY.md §13](PLATFORM_V2_STRATEGY.md) into per-category send rules, double-opt-in flow, frequency caps, unsubscribe handling, and rollout stages.
**Authority:** lower than [RULES.md](../codebase-audit/RULES.md), [SEO_PRESERVATION_RULES.md](../codebase-audit/SEO_PRESERVATION_RULES.md), [PLATFORM_V2_STRATEGY.md](PLATFORM_V2_STRATEGY.md).
**Authored:** 2026-04-29.

---

## 1. Purpose

Email and notification systems are the area where new platforms most often violate trust. v2 must be explicit about the rules before the first send. This doc binds:

- Real send / preview-only distinction (we send nothing today)
- CAN-SPAM compliance (US baseline)
- Consent ladder (single-opt-in transactional vs double-opt-in marketing)
- Subscription categories (each separately consented)
- Frequency caps (per-user, per-category)
- Sender identity + DNS verification
- Preference center + unsubscribe handling
- Rollout stages (preview → admin-only test → consent capture → no-send batch test → limited send → full send)

---

## 2. No real emails until prerequisites met

The current state of USCEHub:

- `scripts/preview-verified-listings-digest.ts` (PR #21) generates a digest preview as console output / file. **No Resend client invocation.**
- `src/lib/verified-digest.ts` (PR #21) defines eligibility predicate. **Not wired to a sender.**
- No `EmailSubscription` table exists in production schema.
- No double-opt-in flow exists.
- No unsubscribe link target exists.

### 2.1 The 8-prerequisite list (binding)

Per [PLATFORM_V2_STRATEGY.md §13.5](PLATFORM_V2_STRATEGY.md):

1. **Schema for subscriptions** (additive, per [PLATFORM_V2_STRATEGY.md §7](PLATFORM_V2_STRATEGY.md))
2. **Confirmed double-opt-in flow** (signup → confirmation email → click confirm → status `confirmed`)
3. **Working unsubscribe link** wired to actual unsubscription
4. **Postal-address footer** (CAN-SPAM-required physical address)
5. **Sender-identity verified** at the email-provider level (Resend domain DNS: SPF, DKIM, DMARC pass)
6. **Per-category preference center** at `/dashboard/email-preferences`
7. **CAN-SPAM compliance audit pass**
8. **Send-volume limits and bounce-handling** configured at the provider

Until all 8 are green, **no real send is authorized**. Preview-only digest scripts are allowed.

### 2.2 What "preview-only" means in practice

A preview script (like `scripts/preview-verified-listings-digest.ts`):

- Runs locally or on demand by an operator
- Generates the email body to stdout / file
- Does NOT invoke any real send (no Resend, no SendGrid, no SMTP, no API call to any send provider)
- Does NOT write to a `Subscriber` table that could feed a future send accidentally
- Is auditable: every preview run logs what it did + did not do

Preview scripts are useful for layout review, content QA, and operational confidence-building before real sends.

---

## 3. CAN-SPAM compliance (US baseline)

USCEHub's audience is U.S.-resident or U.S.-bound physicians and trainees. CAN-SPAM applies to every commercial message we send to U.S. recipients.

### 3.1 Required in every commercial email

| Requirement | How USCEHub will implement |
|---|---|
| Don't use false or misleading header information | From: name = "USCEHub <noreply@uscehub.com>" or named human + uscehub.com domain. Reply-To set to a monitored mailbox. |
| Don't use deceptive subject lines | Subject must accurately describe content. No "URGENT" / "FREE" / "Re:" tricks. No misleading scarcity. |
| Identify the message as an ad if it contains advertising | Sponsored content emails carry "Sponsored content" in the subject prefix or in the first line of the body. |
| Tell recipients where you're located | Postal address in footer of every email. (TBD: which physical address — see §11.) |
| Tell recipients how to opt out | One-click unsubscribe link in every email footer. |
| Honor opt-out requests promptly (within 10 business days) | Unsubscribe within 10 business days; we target same-day. |
| Monitor what others are doing on your behalf | If using a third-party sender (Resend), confirm the sender is also CAN-SPAM compliant. |

### 3.2 Subject line rules

- No clickbait ("You won't believe what...").
- No false urgency ("Last chance!" if not actually last chance).
- No misleading personalization ("Re: your application" if no application exists).
- No emoji-only subjects (display issues + spam-flag triggers).
- Subject length: ≤ 60 chars (mobile preview cutoff).
- Subject must accurately describe the content of the email body.

### 3.3 From / Reply-To rules

- From name: "USCEHub" (consistent across all sends) or named editor (e.g. "Jane Doe at USCEHub" for editorial newsletter).
- From email: `digest@uscehub.com` for digests, `editor@uscehub.com` for editorial newsletter, `no-reply@uscehub.com` only for transactional.
- Reply-To: monitored inbox (`support@uscehub.com` or relevant). Never `noreply@`-replyto-`noreply` chain.

### 3.4 Footer requirements

Every commercial email includes in footer:

```
USCEHub
[physical postal address]

You received this email because you confirmed a subscription to {category} at {confirmation_date}.

[Manage preferences] | [Unsubscribe from this category] | [Unsubscribe from all]
```

- Postal address is mandatory (CAN-SPAM).
- "You received this email because..." statement (good practice + transparency).
- Three choices: manage preferences (preference center), unsubscribe from this category, unsubscribe from all.

### 3.5 Transactional vs marketing distinction

CAN-SPAM applies to **commercial** email. Transactional emails have looser rules but USCEHub still applies the same standards.

| Type | CAN-SPAM applies? | Examples |
|---|---|---|
| Transactional | partially (header truthfulness still required) | Account confirmation, password reset, claim approval |
| Commercial | fully | Newsletter, digest, product update, sponsored content |
| Mixed (transactional + commercial) | fully (treated as commercial) | "Your password reset is here, and check out our new tools!" |

**USCEHub rule:** never mix transactional and commercial in one email. Transactional emails are pure transactional.

### 3.6 GDPR / CCPA / international

Even though our primary jurisdiction is US, IMG audience is partly international:

- **GDPR (EU)**: applies if we hold data of EU residents. Consent must be specific, unambiguous, freely given. Unsubscribe = data deletion option (full deletion, not just inactive). USCEHub commits to GDPR-equivalent practices for all subscribers regardless of location.
- **CCPA (California)**: applies to CA residents. Right-to-know, right-to-delete, opt-out of sale. We don't sell user data ([PLATFORM_V2_STRATEGY.md §15.3](PLATFORM_V2_STRATEGY.md)), so CCPA is largely non-binding, but the deletion right applies.
- **CASL (Canada)**: applies to Canadian recipients. Express opt-in (no implied consent). Stricter than CAN-SPAM. We use double-opt-in for everyone — meets CASL.

---

## 4. Consent ladder

Every email subscription has an explicit consent state stored in the (future) `EmailSubscription` schema.

| State | Allowed sends |
|---|---|
| `unsubscribed` | none |
| `not-yet-confirmed` (single-opt-in placeholder) | one confirmation email only |
| `confirmed` (double-opt-in complete) | full subscription category |
| `paused` (user requested pause without unsubscribing) | none until user reactivates |
| `bounced` (hard bounce ≥ 2 sends) | none until reactivated by user via account |
| `complained` (user marked as spam) | none, ever; treat as `unsubscribed` immediately |

### 4.1 Double-opt-in default

USCEHub uses **double-opt-in by default** for all marketing / digest categories. Single-opt-in is allowed only for transactional emails (account confirmation, password reset, listing-claim approval).

### 4.2 Double-opt-in flow

1. User submits email + selects categories on a USCEHub form.
2. State recorded as `not-yet-confirmed` with `confirmationToken` (cryptographic, single-use, 7-day TTL).
3. Confirmation email sent: "Click here to confirm your USCEHub subscription."
4. User clicks: `confirmationToken` validated, state flipped to `confirmed`, subscription is live.
5. User does not click within 7 days: subscription expires; cleanup job deletes the `not-yet-confirmed` row.
6. No further emails sent in the meantime (only the one confirmation email).

### 4.3 Re-consent on category changes

Adding a new subscription category for a user requires a fresh double-opt-in for that category. Users can opt in to multiple categories in one signup (single confirmation email covers all selected categories).

### 4.4 Reconfirmation

If a user has been inactive (no opens, no clicks) for 12 months on a category, send one re-engagement email: "Are you still interested in {category}?" If no click within 14 days, auto-unsubscribe from that category.

---

## 5. Subscription categories

Each category is a separately consented subscription. Subscribing to one does not subscribe to others.

### 5.1 Category list

| Category | Frequency | Trigger | Schema state |
|---|---|---|---|
| **Verified-listings digest** | weekly | freshly verified listings, ranked by tier and audience tag | `confirmed` |
| **Deadline reminders** | per saved listing | reminder N days before a deadline the user opted into | `confirmed` (per saved listing) |
| **New-vertical alert** | one-time per vertical | when a new vertical (Match / Fellowship / etc.) launches | `confirmed` (per vertical) |
| **Editorial newsletter** | monthly | hand-curated essay + curated picks | `confirmed` |
| **Institution communications** (separate) | various | for institution accounts only | `confirmed` (institution-side) |
| **Account / transactional** | per event | account confirmation, password reset, claim approval, broken-link-report acknowledgement | implicit (account exists) |

### 5.2 Category-specific rules

**Verified-listings digest:**
- Eligible content per `src/lib/verified-digest.ts`: `LinkVerificationStatus = VERIFIED` AND `lastVerifiedAt` non-null AND within send window.
- Up to 10 listings per send.
- User can configure: state filter, specialty filter, audience filter, type filter.
- Send day: Tuesday default (highest physician open rate per industry data); user-configurable.
- Skip if zero eligible listings (no empty digests).

**Deadline reminders:**
- Triggered per saved listing's deadline.
- Default reminders: 30 days before, 7 days before, 1 day before.
- User can configure or disable per saved listing.
- One-shot per reminder; never repeated.

**New-vertical alert:**
- One email per vertical launch.
- User opts in via "Be the first to know when X launches" CTA on skeletal landing pages.
- Email contains: launch announcement, link to new vertical, brief overview.
- Auto-unsubscribed from this category after the alert fires (one-shot subscription).

**Editorial newsletter:**
- Hand-curated by editorial team (USCEHub editor).
- One email per month.
- Plain-text or minimally-styled HTML.
- Content: 1-2 essays, 5-10 curated picks, 1-2 vertical updates.
- Lowest frequency, highest craft.

**Institution communications:**
- Separate from user-side categories.
- For institution accounts only.
- Categories: claim-confirmed notifications, sponsorship invoices, dashboard alerts.
- Stays fully separated from user-side data per [PLATFORM_V2_STRATEGY.md §15.3](PLATFORM_V2_STRATEGY.md).

**Account / transactional:**
- Single-opt-in (implicit on account creation).
- Cannot be unsubscribed (transactional necessity).
- Strict limit: only sent in response to user action.
- Examples: account confirmation, password reset, "your broken-link report has been resolved."

---

## 6. Frequency caps

Per [PLATFORM_V2_STRATEGY.md §13.4](PLATFORM_V2_STRATEGY.md):

### 6.1 Per-user weekly cap

**Total emails per user per week ≤ 3** across all categories combined.

Exceptions:
- **Deadline reminders** (user-triggered: don't count against cap, but capped separately at 5/week).
- **Account / transactional** (responsive to user action: don't count against cap).

### 6.2 Per-category caps

| Category | Per-user maximum |
|---|---|
| Verified-listings digest | 1 / week |
| Deadline reminders | 5 / week (per saved listing × deadline reminders) |
| New-vertical alert | 1 / vertical (one-shot) |
| Editorial newsletter | 1 / month |
| Institution communications | 5 / week (institution-side) |
| Transactional | unlimited (responsive to user action) |

### 6.3 Re-engagement campaigns

"We miss you" emails to dormant users: limited to 1 / quarter / dormant user. Then auto-unsubscribe after 6 months of no opens.

### 6.4 No batched marketing pushes

USCEHub does not run "send to all 50,000 users" campaigns. Every send is per-user-eligible (digest, reminder, vertical alert) or scheduled-monthly (editorial). Mass blasts to all users for marketing purposes is forbidden.

---

## 7. Unsubscribe handling

### 7.1 Unsubscribe link requirements

Per CAN-SPAM:
- Every commercial email has an unsubscribe link.
- Link works for 30 days minimum after send (CAN-SPAM); USCEHub commits to working forever.
- Link does NOT require login (one-click via `unsubscribeToken`).
- Link unsubscribes within 10 business days; USCEHub commits to immediate (within minutes).

### 7.2 Three unsubscribe choices

The email footer offers three:

1. **Manage preferences** → `/dashboard/email-preferences` (or `/email-preferences/[token]` if not logged in)
2. **Unsubscribe from this category** → unsubscribes only from this category, sets that category's state to `unsubscribed`
3. **Unsubscribe from all** → unsubscribes from every category, sets all to `unsubscribed`

### 7.3 Confirmation page

On unsubscribe-link click, show a confirmation page:

> "You've been unsubscribed from {category}. To unsubscribe from all USCEHub email, click here. To re-subscribe, visit your preference center."

No "Are you sure?" friction. One-click unsubscribe (CAN-SPAM compliant).

### 7.4 Unsubscribe data flow

1. User clicks unsubscribe link.
2. `unsubscribeToken` validated (cryptographic, signed, scoped to user + category).
3. Subscription state flipped to `unsubscribed`; `unsubscribedAt = now()`.
4. Future send eligibility query excludes `unsubscribed` state.
5. Confirmation page rendered.

### 7.5 Re-subscribe

Re-subscribing requires a fresh double-opt-in. Unsubscribed users cannot be silently re-added by any flow.

---

## 8. Sender identity + DNS verification

Per CAN-SPAM "don't use false or misleading header information":

### 8.1 Domain reputation

USCEHub uses `uscehub.com` for sending (not a separate domain like `usce-mail.com` — using a separate domain looks suspicious and reduces trust).

### 8.2 DNS records (must be configured before first real send)

| Record | Purpose | Status |
|---|---|---|
| **SPF** (`TXT @`) | Lists authorized senders. e.g. `v=spf1 include:resend.com ~all` | required |
| **DKIM** (`TXT _domainkey`) | Email signature. Resend provides per-domain key | required |
| **DMARC** (`TXT _dmarc`) | Policy on SPF/DKIM failure. Start with `p=none` (monitor); upgrade to `p=quarantine` after monitoring confirms clean. | required |
| **MX** | Mail exchange. We don't receive mail at `uscehub.com` directly (use a separate inbox provider for `support@`); MX is informational. | optional |

### 8.3 DMARC monitoring

After DKIM/SPF are live, set up DMARC reporting (rua) to a monitored address. Watch for:
- Spoofing attempts (mail purporting to be from `uscehub.com` from non-authorized IPs)
- Authentication failures from legitimate senders
- High-volume abusive sends from compromised credentials

Upgrade `p=none` → `p=quarantine` after 30 days of clean reports.

### 8.4 Provider choice

USCEHub uses **Resend** for transactional + marketing sends (currently configured per `package.json`). Resend was chosen because:
- Transparent pricing.
- Modern API, well-documented.
- DMARC / DKIM / SPF support.
- Webhooks for delivery / open / click / bounce / complaint events.
- Per-domain sending IPs option (for reputation isolation).

If switching providers later, schema changes minimally (provider-specific delivery metadata).

---

## 9. Preference center

### 9.1 URL

`/dashboard/email-preferences` (logged-in) or `/email-preferences/[token]` (token-based, accessible from any email's preference link).

### 9.2 Preference center UI

```
Email preferences

Your email: user@example.com

[ ] Verified-listings digest                 (weekly)
[ ] Deadline reminders                       (per saved listing)
[ ] New-vertical alerts                      (when a new vertical launches)
[ ] Editorial newsletter                     (monthly)

Filters for verified-listings digest:
  States: [California, New York, Texas, ...]
  Specialties: [Cardiology, Internal Medicine, ...]
  Audience: [IMG]
  Listing type: [observership, externship, research]

[Save preferences]   [Unsubscribe from all]   [Delete my data]
```

### 9.3 Granular controls per category

- Verified-listings digest: state filter, specialty filter, audience filter, type filter, send day (Mon-Sun).
- Deadline reminders: per saved listing, reminder days (30/7/1 default; configurable 0-90).
- New-vertical alerts: which verticals to subscribe to.
- Editorial newsletter: no granular controls.

### 9.4 "Delete my data"

Per GDPR / CCPA: complete deletion of user account + email subscription data. Performs:

1. Delete `EmailSubscription` rows for user.
2. Delete `User` row (if logged-in account).
3. Delete `SavedListing` rows.
4. Anonymize any historical events (analytics).
5. Confirm via on-screen + email confirmation.

This is the one transactional email sent even after "Unsubscribe from all."

---

## 10. Other notification channels

### 10.1 Push notifications

Not built in v2 launch. When built (Phase D+):
- Per-channel consent separate from email.
- Browser native API (Web Push) only; no third-party service that tracks users.
- Same frequency caps + categories as email.
- Same unsubscribe + preference center extensions.

### 10.2 SMS

Not built in v2 launch. Higher trust bar than email; future:
- Explicit double-opt-in via TCPA-compliant flow ("Reply YES to confirm").
- Limited to deadline reminders + new-vertical alerts (not bulk marketing).
- Per-message cost — likely paid feature for institution-side; free for transactional only.

### 10.3 In-app notifications

Allowed once the v2 logged-in surface exists. No consent prompt required because the user is in-product.
- Account events (saved listing updated, broken link reported acknowledged, etc.)
- Optional dismissable.
- No external data flow.

### 10.4 WhatsApp / Telegram / Discord

Not authorized. WhatsApp Business API has its own compliance (24-hour template messaging, per-message cost). Defer to Phase D+ at earliest.

If/when added: separate explicit-authorization decision documented here.

---

## 11. Postal address

CAN-SPAM requires a physical postal address in every commercial email footer.

### 11.1 Default address

A registered business address. **Open decision:** which address?

Options:
1. Founder's home address (preserved in user records; not great for privacy).
2. Post Office box (recommended; e.g. UPS Store mailbox).
3. Registered agent address (if USCEHub becomes an LLC).
4. Coworking / virtual office address.

**Recommendation:** Post Office box (option 2). Costs ~$200/year, preserves founder privacy, is a valid CAN-SPAM physical address.

This must be resolved **before** prerequisite #4 (postal-address footer) is green.

### 11.2 Address visibility

The postal address is in every email footer + on `/disclosure` + on `/privacy`. Not on homepage.

---

## 12. Rollout stages

### 12.1 Stage 1 — preview script (current state)

- `scripts/preview-verified-listings-digest.ts` runs on demand.
- Output: HTML / Markdown to file or stdout.
- No real send.
- No subscriber data captured.

**This is where USCEHub is today.**

### 12.2 Stage 2 — admin-only test send

- Admin (founder) creates a single email subscription via direct DB insert (no public form yet).
- Manual run sends to admin only.
- Validates rendering, links, unsubscribe flow, DKIM, DMARC.
- Iterates until perfect.

Schema requirement: `EmailSubscription` table per [PLATFORM_V2_STRATEGY.md §7.3](PLATFORM_V2_STRATEGY.md), gated by §7 authorization.

### 12.3 Stage 3 — consent capture (form lives, no send)

- Public signup form on landing pages (e.g. `/match` skeletal landing).
- Form submission creates `not-yet-confirmed` row + sends confirmation email.
- Click confirms and flips to `confirmed`.
- **No digest or marketing sends yet** — only confirmation emails.
- Validates the double-opt-in flow at scale.

### 12.4 Stage 4 — limited-volume send

- After ≥ 100 confirmed subscribers, send first real digest to a small segment (e.g. first 10 confirmed users).
- Monitor: open rates, click rates, complaint rates, unsubscribe rates.
- Iterate on content + send time + format based on data.
- Wait 14 days before scaling to all confirmed users.

### 12.5 Stage 5 — full send

- All confirmed subscribers receive their subscribed-category sends.
- Frequency caps + category rules from §6 apply.
- Monitoring + alerting in place for delivery failures, complaint rates, etc.

### 12.6 Stage 6 — post-launch monitoring

- Open rate baseline established (industry: 20-30% for healthcare/medical).
- Click rate baseline (industry: 2-5%).
- Complaint rate target: < 0.1% (Resend may suspend sending if > 0.3%).
- Unsubscribe rate per send target: < 0.5%.
- Bounce rate target: < 2%.

If any metric drifts > 50% from baseline, pause sends and investigate.

---

## 13. Future schema needs

(Not authorization to build; these are surfaced for future schema PRs per [PLATFORM_V2_STRATEGY.md §7.3](PLATFORM_V2_STRATEGY.md).)

```prisma
model EmailSubscription {
  id                  String                   @id @default(cuid())
  userId              String?                  // null if subscribed without account
  email               String
  category            EmailSubscriptionCategory
  state               EmailSubscriptionState
  filters             Json                     // category-specific filters
  confirmationToken   String?                  @unique
  confirmedAt         DateTime?
  unsubscribeToken    String                   @unique
  unsubscribedAt      DateTime?
  pausedAt            DateTime?
  bouncedAt           DateTime?
  complainedAt        DateTime?
  lastSentAt          DateTime?
  createdAt           DateTime                 @default(now())
  updatedAt           DateTime                 @updatedAt

  @@unique([email, category])
  @@index([state])
  @@index([category, state])
  user                User?                    @relation(fields: [userId], references: [id])
}

enum EmailSubscriptionCategory {
  VERIFIED_LISTINGS_DIGEST
  DEADLINE_REMINDERS
  NEW_VERTICAL_ALERT
  EDITORIAL_NEWSLETTER
  INSTITUTION_COMMUNICATIONS
  ACCOUNT_TRANSACTIONAL
}

enum EmailSubscriptionState {
  NOT_YET_CONFIRMED
  CONFIRMED
  PAUSED
  UNSUBSCRIBED
  BOUNCED
  COMPLAINED
}

model EmailSendLog {
  id              String                   @id @default(cuid())
  subscriptionId  String
  category        EmailSubscriptionCategory
  sentAt          DateTime                 @default(now())
  providerMessageId String?
  openedAt        DateTime?
  clickedAt       DateTime?
  bouncedAt       DateTime?
  complainedAt    DateTime?

  subscription    EmailSubscription        @relation(fields: [subscriptionId], references: [id])
}
```

These tables are **not authorized** to be created now. They are documented here so the future schema PR is not a surprise.

---

## 14. Forbidden operations

These are explicit non-goals until each is individually authorized:

- Real send to any non-admin email address.
- Bulk import of any email list (purchased, scraped, "leaked," or otherwise).
- Importing email addresses from social media APIs (no LinkedIn email scraping).
- Newsletter signup checkbox pre-checked by default ("Sign me up for marketing!").
- Unsubscribe via reply-only ("Reply STOP to unsubscribe") — too many users will think this is spam-bait.
- Hidden / collapsed unsubscribe link.
- Different unsubscribe links per email that all need to be clicked separately.
- Cookie tracking based on email open / click without consent disclosure.
- A/B testing email subject lines on more than 5% of audience without explicit authorization.
- Send from a different domain than `uscehub.com` (would damage domain reputation).

---

## 15. Open decisions

1. **Postal address.** Founder home address (no), PO box (recommend), registered agent (if/when LLC), virtual office (option). **Recommendation: PO box.**
2. **Sender domain DNS provider.** Cloudflare (current), Vercel DNS, Route53. Recommend: stay on current.
3. **Default send day for digest.** Tuesday (per industry data); Thursday (per some publisher data); user-configurable. **Recommend: Tuesday default, user-configurable.**
4. **Editorial newsletter format.** Plain-text vs minimally-styled HTML. **Recommend: minimally-styled HTML (looks professional; plain-text often filtered).**
5. **Re-engagement frequency.** 1 / quarter / dormant user vs 1 / 6 months. **Recommend: 1 / quarter.**
6. **Auto-unsubscribe after dormancy.** 6 months no opens vs 12 months. **Recommend: 6 months.**
7. **Whether to use Resend's "audiences" feature.** Convenient but couples us to provider. **Recommend: maintain our own `EmailSubscription` table (provider-agnostic); use Resend for send-only.**
8. **Confirmation token TTL.** 7 days vs 14 days vs 30 days. **Recommend: 7 days (security + reduces stale unconfirmed rows).**
9. **Subject line A/B testing.** Allowed on subset (5%) per send; prohibited on full audience. **Recommend: defer A/B testing entirely until ≥ 1000 confirmed subscribers per category.**
10. **Internationalization of email content.** English-only at v2 launch. Consider Spanish for IMG audience post-launch. **Recommend: English-only at launch.**
11. **Sponsored content in editorial newsletter.** Allowed with disclosure per [TRUST_AND_MONETIZATION_POLICY.md](TRUST_AND_MONETIZATION_POLICY.md), or excluded entirely? **Recommend: excluded from editorial newsletter; sponsorship lives in dedicated sponsored-listing emails (separate category, requires its own consent).**
12. **Welcome series after confirmation.** Single welcome email vs 3-email series. **Recommend: single welcome email at v2 launch; 3-email series considered Phase C.**

---

## 16. Compliance audit checklist (before first real send)

- [ ] All 8 prerequisites from §2.1 green.
- [ ] DNS records (SPF, DKIM, DMARC) verified passing.
- [ ] Test email sent to admin: renders correctly in Gmail / Outlook / Apple Mail.
- [ ] Unsubscribe link in test email tested: works without login, reflects in DB within 1 minute.
- [ ] Postal address confirmed accurate.
- [ ] Sender identity (From: name + email) confirmed accurate.
- [ ] Subject line accurate, not deceptive.
- [ ] Body content cited where applicable (per [PAGE_TEMPLATE_INVENTORY.md](PAGE_TEMPLATE_INVENTORY.md) authenticity bar).
- [ ] No commercial + transactional mixing.
- [ ] Frequency cap test: send 4 emails to test user in one week (ensure 4th is blocked).
- [ ] Unsubscribe acknowledged within 10 business days (target: minutes).
- [ ] Bounce handling tested (test send to nonexistent address; verify bounce → state flip).
- [ ] Complaint handling tested (test send + spam-flag in Gmail; verify complaint → state flip).
- [ ] CAN-SPAM-specific copy: identification as advertising (if applicable), postal address, unsubscribe.
- [ ] GDPR-equivalent: data deletion link present, processed within 30 days.
- [ ] Resend account in good standing (no recent suspensions, complaint rate low).

---

## SEO impact (this doc)

```
SEO impact:
- URLs changed:        none (planning doc only; future preference center URL TBD)
- redirects added:     none
- sitemap changed:     no
- robots changed:      no
- canonical changed:   no
- metadata changed:    no
- JSON-LD changed:     no
- pages noindexed:     none (future /dashboard/email-preferences will be noindex)
- internal links:      none changed
- risk level:          ZERO — internal messaging policy doc
```

## /career impact

None.

## Schema impact

None. Schema additions surfaced in §13 — not authorized by this doc.

## Authorization impact

None. Documenting messaging policy is not authorization to build the send infrastructure or to create subscriber tables.
