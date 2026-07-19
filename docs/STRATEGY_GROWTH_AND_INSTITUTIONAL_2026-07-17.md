# USCEHub — Growth & Institutional Platform Strategy (2026-07-17)

Synthesis of (a) a code-grounded current-state audit, (b) deep external research
(competitors, cold-start, compliance, communities — 22 verified claims, 19 from
primary sources), and (c) the existing locked institutional roadmap (P95-B/C/D).

**Decisions this plan is built on (user, 2026-07-17):** free for IMGs *and*
institutions for now (no billing); **organic-first** growth (SEO + Reddit +
Facebook + X + IMG communities); first institutional buyer = **USCE programs /
hospitals** (academic GME, observership/clerkship coordinators, private
practices, research labs).

---

## 0. TL;DR — what to actually do

**The big picture:** The institutional product you're asking for is ~70% *designed*
and ~30% *built*. The directory, poster portal (single-user), verification, and
correction workflow exist. The **claim flow (P95-B)** and **multi-coordinator
dashboard (P95-D Tier 2)** are audited but not built — and they are the critical
path to "institutions have accounts + dashboards." External research confirms this
sequence is correct.

**Priority actions, in order:**

1. **Ship the cheap Tier-1 dashboard wins now** (no schema): surface source-status
   badges, open-corrections counts, and a recent-activity panel on `/poster`. Days, not weeks.
2. **Build the claim flow (P95-B):** let a coordinator find their institution's
   existing listing and request to manage it (institutional-email domain + admin
   review). This is the supply-side front door — validated by both the Handshake
   "gatekeeper-first" and AMOpportunities "concierge-seeding" precedents.
3. **Add the `OrganizationMembership` model**, then **P95-D Tier 2** (multi-coordinator
   dashboard with candidate pipeline). This is what makes a real GME office usable.
4. **Run organic growth in parallel** (does not depend on 1–3): a content/SEO engine
   on the queries IMGs search + disciplined, non-spammy community presence.
5. **Concierge-seed the first ~25 programs by hand** (copy AMO's model, for free):
   pre-fill their listing from your directory, then invite them to claim it.
6. **Lock the compliance guardrails** (below) before any cold outreach or testimonial
   goes live — this is the sharpest external constraint and the cheapest to get wrong.

**The positioning that ties it together:** *free, verified, non-commercial.* Your
largest competitor (AMOpportunities) charges IMGs $1,599–$4,999 per rotation. The
AMA's own guidance says observerships are "not intended to be organized for profit."
Free + source-verified is not just a growth tactic — it is the trust moat.

---

## 1. Where we are (code-grounded current state)

**Stack:** Next.js 16, React 19, Prisma + Postgres (Supabase), NextAuth v5, Resend,
Vercel Analytics. Roles: `APPLICANT | POSTER | ADMIN`. Live at uscehub.com.

**Built:**
- Three-sided platform: applicant dashboard (`/dashboard`), poster/institution portal
  (`/poster/*`: listings CRUD, org profile, applications, verification, settings),
  admin console (`/admin/*`: verification queue, flags, moderation).
- ~130 SEO pages: `/career` (visa, H-1B, J-1 waiver, Conrad-30, jobs, salary,
  sponsors), `/residency`, `/observerships/[state]/[specialty]`, `/blog`, tools.
- Data/trust layer: link verification (`LinkVerificationStatus`, verify-listings cron),
  `auditData` research layer (pre-researched listings), NPI + institutional-email
  verification, badges.
- Existing moat (per `docs/competitive-landscape.md`): real-time Conrad-30 slot tracker
  (only one in market), 50-state waiver intelligence, waiver map/timeline, LCA-notice
  radar (committing daily).

**Designed but NOT built (the institutional gap):**
- `OrganizationMembership` model — **absent**. `Organization` has a single `ownerId`,
  so a coordinator + PD + DIO cannot share one org. This is the structural blocker.
- Institution **claim flow** (P95-B) — audited, no route, not built.
- Multi-coordinator **program dashboard** (P95-D Tier 2) — audited, not built.
- No messaging model, no notifications model, no candidate-pipeline UI beyond basic
  application status.
- Poster dashboard analytics = 4 count tiles + `views`. No funnel/time-series/source.

**Roadmap already locked (P95 series):**
```
1 Directory — built · 2 Correction/removal — landed (PRs #58–63)
3 Institution claim/profile — audited (P95-B) · 4 Program dashboard — audited (P95-D)
5 Candidate intake — deferred · 6 Document vault — audited, deferred (P95-C)
7 Onboarding — deferred
```
The existing design is deliberately conservative ("manage *information*, not a badge of
approval"; no hospital-approved labels; no doc upload yet; cross-tenant walls). The
external research **validates** this conservatism — see §7.

---

## 2. Competitive landscape (verified)

| Player | Who pays | Price | Institution-facing product | Takeaway for USCEHub |
|---|---|---|---|---|
| **AMOpportunities** | IMGs | **$1,599–$4,999 / 4wk** | Done-for-you concierge: runs credentialing/paperwork/site networks, and *recruits clinical sites on the institution's behalf* (outreach → fit → handoff). 850+ MD/DO/IMG sites. | Primary direct competitor. Their **concierge supply-seeding is directly copyable — for free.** Their paid model is exactly what free+verified undercuts on trust. |
| **Match A Resident** | IMGs | **$499–$1,899** | **None** — purely applicant-facing (lists, PS drafting, ERAS, advising). | The **institution-facing lane is comparatively open.** That's your wedge. |
| **Handshake** (analogue) | employers | — | Won two-sided cold-start by targeting university **career centers as gatekeepers first** (B2B2C, campus SSO, often mandatory) → student CAC ≈ 0. | Treat **GME coordinators / clerkship directors / DIOs as your gatekeepers.** Their adoption pulls IMG demand. |
| **Symplicity Recruit** (analogue) | employers | — | Manage postings + applicants + interview schedules in one interface; branded org profiles; searchable candidate DB + analytics. | This is the **target feature set** for P95-D. Confirms the dashboard direction. |

*Sources: amopportunities.org/{img-rotations,businesses,clinical-recruitment-services},
matcharesident.com/pricing, ainativegtm.substack (Handshake), symplicity.com/employers.
Vendor scale figures are self-reported.*

Your own `docs/competitive-landscape.md` (Mar 2026) already maps the *career/visa* side
(Conrad-30, waiver tools) where you lead. This research adds the *USCE-rotations* side,
where AMO leads on inventory but is beatable on price/trust.

---

## 3. GOAL 1 — Organic growth for IMGs (demand side)

**Honest caveat:** the research on *where IMGs congregate* came back **thin** — only
Student Doctor Network (moderated forums with a dedicated IMG/ECFMG section) was
independently verified. The specific subreddits (r/IMGreddit, r/medicalschoolIMG,
r/usmle), Facebook groups, and Telegram/WhatsApp/Discord audience sizes and their
self-promotion rules were **not verified** and must be validated by hand before we lean
on them. Treat the channel list below as a *hypothesis to validate*, not fact.

**Channel plan (organic-first):**
1. **SEO/content engine (highest ROI, compounding).** You already rank on visa/waiver.
   Extend to the USCE head terms AMO/blogs currently own: "how to get USCE as an IMG,"
   "observership vs externship vs clerkship," "USCE without US visa," "free observerships
   for IMGs," per-state/per-specialty observership pages (you already have the
   `/observerships/[state]/[specialty]` structure — fill it from `auditData`). Winning
   format for this audience = long-form, year-stamped "complete guide" + a *directory*
   they can act on. Your directory + guides beats a pure blog.
2. **Reddit / SDN (validate rules first).** These communities punish self-promotion.
   The durable play is *be genuinely useful*: answer USCE/visa questions, link the free
   tool only when it directly answers the question, disclose you built it. One
   moderator-approved "free resource" post >> ten spammy drops. Confirm each sub's
   self-promo rule before posting.
3. **X / YouTube / short-form.** Repurpose each guide into a thread + a short. Low cost,
   founder-voice ("built by an intensivist and a hospitalist") lands with IMGs.
4. **Partnerships.** IMG-focused creators, USMLE prep communities, and country-specific
   IMG associations — cross-link the free directory.

**Do NOT** buy email lists or blast IMG communities — see §7 (CAN-SPAM, FTC).

---

## 4. GOAL 2 — Institutional adoption (supply side, USCE programs first)

The chicken-and-egg is solved supply-first, and you have an unfair advantage most
marketplaces don't: **a pre-researched directory already lists many programs.** So the
motion is *not* "convince a hospital to create an account from scratch" — it's **"claim
the listing that already exists."**

**Playbook (synthesis of Handshake + AMO precedents):**
1. **Concierge-seed (AMO's model, free).** Pick a first atomic segment (e.g., one
   specialty or metro). Hand-build/enrich ~25 program listings from your directory so
   they look complete and valuable *before* outreach.
2. **Gatekeeper outreach (Handshake's model).** Target GME program coordinators,
   observership/clerkship directors, and DIOs — they are the gatekeepers whose adoption
   pulls IMG demand. Offer: "Your program is already listed and getting X views from
   qualified IMGs. Claim it free to keep it accurate and see who's interested." That is
   a value-first, low-friction ask.
3. **Claim → dashboard.** Claiming (P95-B) is the front door; the dashboard (P95-D) is
   the reason to stay. Verification = institutional-email domain + admin review. Grant
   the right to *manage information*, never a "USCEHub-approved" endorsement.
4. **Compliance-bound cold email** — see §7. This is where most people create legal
   liability. Do it right or not at all.

---

## 5. Institutional product roadmap → "best of best"

Build order is the P95 critical path, sequenced so each step ships value alone.

| # | Build | Needs schema? | Why now | Source/validation |
|---|---|---|---|---|
| 1 | **Tier-1 dashboard wins**: source-status badge, open-corrections count, recent-activity panel on `/poster` | No | Read-only aggregations over existing tables; immediate polish | P95-D §4.1 |
| 2 | **Claim flow (P95-B)**: find-your-listing → structured claim → institutional-email + admin verify → manage owned fields | Yes (claim request + verified identity) | Supply-side front door; the whole GTM depends on it | AMO concierge + Handshake gatekeeper |
| 3 | **`OrganizationMembership`** (`OWNER \| COORDINATOR \| VIEWER`) | Yes | Unblocks multi-coordinator; real GME offices have teams | P95-B §, P95-D §4.2 |
| 4 | **P95-D Tier-2 dashboard**: org-wide listing view + **candidate pipeline** (status stages) + corrections surfaced | Yes | The "dashboard + data" the user asked for | Symplicity feature set |
| 5 | **Applicant funnel analytics** for institutions (impressions→views→saves→applications), source/geo | Adds counters | The "analytics/data" ask; institutions need to see value | Symplicity/recruiting-dashboard norms |
| 6 | Candidate intake (P95-E), document vault (P95-C), onboarding (P95-F) | Yes | Deferred; security-heavy; only after 1–5 prove adoption | P95 sequence |

**Deliberately NOT building (research-validated walls):** no "hospital-approved" badge
(verification ≠ endorsement), no doc upload until the vault is a real security project,
no bulk-email-to-candidates from the dashboard, no cross-tenant "see all candidates"
view. These aren't limitations — they're the trust posture that differentiates you from
paid intermediaries.

---

## 6. Positioning & messaging

- **Lead with:** *free, source-verified, independent, built by an intensivist and a
  hospitalist who lived the IMG path.* (Already on `/about`.)
- **Against AMO:** not "cheaper" — *"the honest map."* We link to the institution's own
  page so you can confirm; we don't sell you a rotation.
- **Against Match A Resident:** they help you apply; *we show you what actually exists.*
- **Never claim** match/placement rates, guarantees, or "USCEHub-approved programs." See §7.

---

## 7. Compliance guardrails (BINDING — strongest-evidenced section)

All primary-sourced (FTC, eCFR, AMA). Get these wrong and the downside is legal, not cosmetic.

1. **CAN-SPAM on cold outreach to institutions** (FTC compliance guide). *No B2B
   exemption.* Each non-compliant email → civil penalty up to **$53,088** (2025
   inflation-adjusted). Every commercial email must: carry a valid physical postal
   address, a clear opt-out honored within 10 business days, an accurate non-deceptive
   subject line, honest header info, and identify itself as a solicitation. (No private
   right of action — enforced by FTC/state AGs — but per-email exposure is real.)
   → Use a compliant sender, real footer, working unsubscribe, and keep outreach
   *relevant and low-volume*. Concierge/personal 1:1 emails to a coordinator about
   *their own* listing are the safest form.
2. **FTC Endorsement Guides (16 CFR 255).** Testimonials must reflect honest, actual
   experience; **the advertiser (USCEHub) is liable** for misleading/unsubstantiated
   endorsement claims and undisclosed connections; the **"results not typical" safe
   harbor was removed (2023)**. → *No implied match/placement-guarantee testimonials.*
   Any success story must disclose generally-expected results and be substantiated.
   (Reinforces the FlowOS "no synthetic accuracy claims" scar.)
3. **AMA observership guidance.** Observerships are "not intended to be organized for
   profit," physicians should volunteer, only actual costs may be charged; the **AMA is
   not an accreditor** (informational only); each jurisdiction sets its own rules. →
   Reinforces free/non-commercial positioning; never imply USCEHub accredits or approves.
4. **IMG data privacy.** IMG applicant PII (scores, grad year, visa status, country) is
   sensitive. Coordinators see only what the candidate chose to share (P95-D privacy
   floor). No selling/compiling PII. (Ties to existing data-commercialization-compliance
   rule: surface derived stats only; DUA before any commercial data use.)

---

## 8. Sequenced 30/60/90

**Days 0–30 (parallel tracks):**
- Product: ship Tier-1 dashboard wins (#1). Start P95-B claim-flow build (#2).
- Growth: stand up the USCE content/SEO cluster (fill `/observerships/[state]/[specialty]`
  from `auditData`; publish 3–4 "complete guide" pages on the head USCE queries).
- GTM prep: hand-validate the real IMG communities + their self-promo rules (research gap).
- Compliance: finalize the CAN-SPAM-compliant outreach template + unsubscribe + footer.

**Days 30–60:**
- Product: `OrganizationMembership` (#3) + P95-D Tier-2 dashboard + candidate pipeline (#4).
- GTM: concierge-seed the first atomic segment (~25 programs); begin gatekeeper outreach.
- Growth: begin disciplined community presence (SDN + validated subs); repurpose guides to X/YouTube.

**Days 60–90:**
- Product: institution-facing funnel analytics (#5); iterate dashboard on real coordinator feedback.
- GTM: measure claim → active-management conversion; expand seeding to a 2nd segment.
- Growth: double down on whichever content/community channel actually converted.

---

## 9. Honest research gaps (validate before betting on these)
- **Where IMGs congregate** — only SDN verified. Subreddit/FB/Telegram/Discord names,
  sizes, and self-promo rules are unverified; confirm by hand.
- **Exact SEO queries + winning formats** — no claims survived verification; do real
  keyword research (Search Console + a keyword tool) before committing the content calendar.
- **Dashboard feature specifics** beyond Symplicity (Handshake/Doximity/Indeed/VSLO)
  not independently confirmed.
- **Refuted, do not use:** the Handshake "mug care-package" story; a generic "4-phase
  cold-start sequencer"; "match the first 100 pairs by hand." (Killed in verification.)

---

## Sources (primary unless noted)
AMOpportunities: /img-rotations, /businesses, /clinical-recruitment-services,
support.amopportunities.org (pricing). Match A Resident: /pricing. FTC: CAN-SPAM
compliance guide; eCFR 16 CFR 255 (endorsements). AMA IMG Section: observership
guidelines. Symplicity: /employers (+ Betterteam, secondary). Handshake cold-start:
ainativegtm.substack (blog, corroborated by Inside Higher Ed). Student Doctor Network:
forums.studentdoctor.net (+ PMC7611736, academic). Existing internal: docs/competitive-
landscape.md, docs/monetization-strategy.md, docs/platform-v2/local/P95B, P95C, P95D.
