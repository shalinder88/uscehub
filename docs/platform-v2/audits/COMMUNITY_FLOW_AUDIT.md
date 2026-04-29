# Community Flow Audit (PR 0e)

**Status:** complete
**Audited at:** main `a9e61a1` (2026-04-29)
**Scope:** `/community` (`page.tsx` + `CommunityTabs` component + `SuggestProgramForm`), `/community/suggest-program`, `/residency/community` (read-only — `/residency/*` is canonical per PR 0b), `CommunityPost` + `CommunityComment` Prisma models, `AdminMessage` model + `/api/admin-messages`, sitemap + navbar + footer references to `/community`. **Excludes** `/career/community` per the `/career` guardrail (audit-only context observation; no recommendations touching `/career`).
**Audit type:** docs-only. No code changes in this PR. Fix work is queued as separate PRs.

This audit answers **decision A5** (does USCEHub have a community? real, minimal, placeholder, or aspirational? launch-scope or post-launch?). It is the fifth of seven Phase 0 audits. Sibling audits: [`POSTER_FLOW_AUDIT.md`](POSTER_FLOW_AUDIT.md), [`RESIDENCY_NAMESPACE_AUDIT.md`](RESIDENCY_NAMESPACE_AUDIT.md), [`APPLICATION_FLOW_AUDIT.md`](APPLICATION_FLOW_AUDIT.md), [`REVIEW_FLOW_AUDIT.md`](REVIEW_FLOW_AUDIT.md). Predecessor fix: [`V2_COPY_TRUTH_FIX_LOG.md`](V2_COPY_TRUTH_FIX_LOG.md) (PR #42, merged at `a9e61a1`).

---

## 1. Executive verdict

**Verdict: aspirational on the surface, with hardcoded fake content rendered as if real, plus structured data telling Google a forum exists when none does.** This is a more dangerous variant of the PR 0d review-flow finding — there the UI was real but unsafe; here the UI is **fake but visually indistinguishable from real**, and the indexable surface tells search engines a forum exists.

Five layers, five different truths. This audit's findings exceed PR 0d's because the live surface is more deceptive.

| Layer | Status | One-line truth |
|---|---|---|
| **`CommunityPost` + `CommunityComment` models** | **orphan tables** | Schema exists in production DB. **No API queries them.** No UI displays real DB rows. Pure unused infrastructure. |
| **Public `/community` page (IMG community)** | **shipped, mostly fake** | Hardcoded fake user names ("Dr. Amira K.", "Dr. Raj P.", etc.) rendered as live swap-board posts and discussion threads. Forms accept new entries into `useState` only — closing the tab loses everything. The "Thank you for your submission" message after `SuggestProgramForm` is **a lie** — no API call, no DB row, no admin notification. |
| **`/community` JSON-LD** | **shipped, unsafe** | The page emits `DiscussionForumPosting` structured data for a forum that does not exist. Google rich-results spam vector + brand-truth gap. Listed in `sitemap.ts`. |
| **`/api/admin-messages`** | **real-functional** | Genuine `POST` endpoint, auth-gated, validated, persists to `AdminMessage`, fires admin email notification. **This is the only real community-side write path.** Used by `/contact-admin` page (separate from `/community`). |
| **`/residency/community`** | **honest aspirational** | "Coming Soon" tile per tab. No fake data. **The pattern the IMG `/community` page should match.** |

Three **critical** (C-class) findings:

- **C1** — fabricated user activity. Hardcoded fake names with "Dr." titles rendered as if they were real users posting on the swap board and discussions. Brand-truth + FTC-style misleading-content risk.
- **C2** — `DiscussionForumPosting` JSON-LD on `/community` for a forum that does not exist. Same pattern PR 0d closed for `AggregateRating`. Same Google rich-results risk class.
- **C3** — submission forms (`SwapPost`, `Discussion`, `SuggestProgramForm`) display "Thank you" success states without calling any API. Users believe their data was saved/admin-reviewed; nothing happens. Trust + privacy expectation breach.

**Decision A5:** option **C/E hybrid — keep aspirational but hide/de-emphasize, with strong recommendation that the IMG `/community` page adopts the `/residency/community` "Coming Soon" pattern in a follow-up fix PR (PR 0e-fix-1). Defer real public community to post-launch.** Recommendation in §16 + §19.

---

## 2. Existing route inventory

All routes confirmed at `a9e61a1`:

| Route | File | Method | Audit verdict |
|---|---|---|---|
| `/community` (public page) | [`src/app/community/page.tsx`](../../../src/app/community/page.tsx) | UI | indexable; emits `DiscussionForumPosting` JSON-LD; links to `/community/suggest-program`. Loaded via `<CommunityTabs>` (4 tabs). |
| `/community/suggest-program` (public page) | [`src/app/community/suggest-program/page.tsx`](../../../src/app/community/suggest-program/page.tsx) | UI | indexable; renders `<SuggestProgramForm standalone />`. The form does not POST anywhere. |
| `/residency/community` (public page) | [`src/app/residency/community/page.tsx`](../../../src/app/residency/community/page.tsx) | UI | indexable; **honest "Coming Soon" tile per tab.** No fake content. |
| `/community/*` (any other) | n/a | n/a | no further routes |
| `/api/community/*` | **none** | n/a | **no community API exists** |
| `/api/posts` / `/api/discussions` / `/api/comments` / `/api/swap` | **none** | n/a | none |
| `/api/admin-messages` | [`src/app/api/admin-messages/route.ts`](../../../src/app/api/admin-messages/route.ts) | POST | real-functional. Used by `/contact-admin` (not `/community`). Validates 10-5000 char body, persists to `AdminMessage`, fires admin email. |
| `/admin/messages` | [`src/app/admin/messages/page.tsx`](../../../src/app/admin/messages/page.tsx) | UI | admin reads `AdminMessage` rows. Real. |
| Nav / footer references | [`src/components/layout/navbar.tsx:34`](../../../src/components/layout/navbar.tsx), [`src/components/layout/footer.tsx:68`](../../../src/components/layout/footer.tsx) | nav | both link to `/community` — main IMG community surface |
| Sitemap | [`src/app/sitemap.ts:57,63`](../../../src/app/sitemap.ts) | sitemap | both `/community` and `/community/suggest-program` listed for indexing |

**Component reachability:**

| Component | Imported by | Notes |
|---|---|---|
| `CommunityTabs` (IMG) | [`src/components/community/community-tabs.tsx`](../../../src/components/community/community-tabs.tsx) | imported by `/community/page.tsx`. 590 lines. **Contains all 3 critical findings.** |
| `SuggestProgramForm` | same file | also imported standalone by `/community/suggest-program/page.tsx`. Submits to nothing. |
| `CommunityTabs` (residency) | [`src/app/residency/community/community-client.tsx`](../../../src/app/residency/community/community-client.tsx) | distinct component (same name, different file). Honest "Coming Soon" with no fake data. |
| `CommunityPost.findMany`, `CommunityComment.findMany`, `prisma.communityPost.*`, `prisma.communityComment.*` | **no callers** | confirmed via `grep -rn "CommunityPost\|CommunityComment"` — only schema + audit docs hit. **Orphan models.** |

---

## 3. Data model inventory

### 3.1 `CommunityPost` ([`prisma/schema.prisma:411-430`](../../../prisma/schema.prisma))

```prisma
model CommunityPost {
  id               String           @id @default(cuid())
  authorId         String
  author           User             @relation(fields: [authorId], references: [id], onDelete: Cascade)
  phase            JourneyPhase                          // MEDICAL_GRADUATE | RESIDENT | ATTENDING
  category         String                                // free-text
  title            String
  content          String
  upvotes          Int              @default(0)
  commentCount     Int              @default(0)
  pinned           Boolean          @default(false)
  moderationStatus ModerationStatus @default(PENDING)
  createdAt        DateTime         @default(now())
  updatedAt        DateTime         @updatedAt

  comments CommunityComment[]

  @@index([phase, category])
  @@map("community_posts")
}
```

**Status:** orphan. Schema is well-thought (phase-keyed for pathway scoping, ModerationStatus default PENDING, upvote/comment counters). **Zero code reads or writes this table.** Production DB likely has zero rows.

### 3.2 `CommunityComment` ([`prisma/schema.prisma:432-444`](../../../prisma/schema.prisma))

```prisma
model CommunityComment {
  id               String           @id @default(cuid())
  postId           String
  post             CommunityPost    @relation(fields: [postId], references: [id], onDelete: Cascade)
  authorId         String
  author           User             @relation(fields: [authorId], references: [id], onDelete: Cascade)
  content          String
  upvotes          Int              @default(0)
  moderationStatus ModerationStatus @default(APPROVED)   // ⚠ opt-out moderation
  createdAt        DateTime         @default(now())

  @@map("community_comments")
}
```

**Observations beyond orphan-table status:**

- `moderationStatus @default(APPROVED)` — comments are **opt-out moderation** (admin must explicitly REJECT). Posts are opt-in (PENDING). The asymmetry is reasonable for content velocity but **still requires admin tooling that does not exist** — no `/admin/community-comments` page, no API.
- Cascade delete on `CommunityPost` → `CommunityComment[]` is correct.
- No FK on `authorId` to a non-User actor (no anonymous/guest commenter possible — every comment must have a real `User`).
- No `updatedAt` on comments. No edit/delete primitive.
- No `parentCommentId` — comments cannot be threaded (replies are flat).
- No `subscribedUsers[]` / notification primitive.
- No `IPAddress` / `userAgent` / abuse-fingerprint capture.

### 3.3 `AdminMessage` ([`prisma/schema.prisma:349-363`](../../../prisma/schema.prisma))

```prisma
model AdminMessage {
  id         String   @id @default(cuid())
  userId     String?                                  // optional — public can send via /contact-admin
  userEmail  String?
  userName   String?
  category   String   @default("general")
  subject    String
  body       String
  status     String   @default("OPEN")                // OPEN | READ | RESOLVED
  adminNotes String?
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  @@index([status, createdAt])
  @@map("admin_messages")
}
```

**Status:** real-functional. The one community-adjacent path that actually persists data. **Optional `userId`** means anonymous public users can send messages via `/contact-admin`. The `category` free-text field is unconstrained (no enum).

### 3.4 `User` exposure on community surfaces

`User.name` and `User.email` are referenced by `CommunityPost.author` and `CommunityComment.author` joins. **There is no `User.publicHandle` / `User.displayName` field** — if `/community` is ever wired to real DB rows, posts will surface a user's full real name by default unless the UI masks it. This is a privacy/safety concern worth flagging now.

### 3.5 What is NOT modeled

| Concept | Why it matters |
|---|---|
| Private messaging between users | No `Message`, `Conversation`, `Thread` model. Direct messaging would be net-new. |
| Mentor / Mentorship / VerifiedExpert primitive | No model. Any "ask an expert" claim would be unsupported. |
| Comment threading (`parentCommentId`) | Reddit-style nested replies impossible. Flat comments only. |
| User reputation / karma | No counter. |
| User suspension / ban | No `User.suspended` / `User.bannedAt` field. Admin cannot ban a user without DB-level action. |
| Subscription / notification | No `PostSubscription`, no in-app notification model. |
| Per-post tags / specialty pivot | `CommunityPost.category` is free-text; no taxonomy enforcement. |
| Anti-spam fingerprint | No IP, no device, no rate-limit-key beyond user id. |
| Edit history | `CommunityPost.updatedAt` exists; comments lack it. No diff log. |
| Off-platform contact (email exchange affordance) | Some flows would need it (swap board "Contact" button); none present. |

---

## 4. Public visitor flow

Audited what an **unauthenticated** visitor sees:

| Surface | Status |
|---|---|
| Read `/community` page | ✅ — rendered with hardcoded fake content. |
| See author identities | ⚠️ — sees fake "Dr." names that look like real users. **C1.** |
| See public profiles | ❌ — no profile route exists for any user. |
| Search / filter discussions | ❌ — no filter UI; tab list is hardcoded. |
| See source / trust context | partial — generic disclaimer "USCEHub is an informational platform" appears in footer of each tab; no per-post trust label. |
| Access content from shared / social links | ✅ — `/community` is indexable + linkable. URL-wins. |
| Encounter login walls | ❌ — visitor can read everything without login. The submit forms also work without login (in-memory only). |
| Encounter `DiscussionForumPosting` JSON-LD | ✅ shipped to Google. **C2.** Confirms forum existence to crawlers. |
| `/community/suggest-program` direct visit | ✅ accessible; standalone form; submission goes nowhere. |
| `/residency/community` direct visit | ✅ accessible; honest "Coming Soon"; nothing fake. |

The visitor cannot tell the swap-board posts and discussions are fabricated. Even an attentive visitor would have to inspect network traffic or refresh the page (the seed data persists across refreshes; their own in-session submissions disappear) to figure out the deception.

---

## 5. Logged-in user flow

| Action | Available? | Notes |
|---|---|---|
| Create post (real DB row) | **no** — `handleDiscussionSubmit` writes to local `useState` only. No `fetch()` call. | C3 — false success message. |
| Create swap post (real DB row) | **no** — `handleSwapSubmit` same pattern. | C3. |
| Suggest a program (real DB row or admin email) | **no** — `SuggestProgramForm.handleSubmit` calls `setSubmitted(true)` with comment "// In a real app this would call an API". | C3 — most damaging because user thinks an admin will see and review the program. |
| Comment / reply | **no** — no comment UI at all. Discussions show `replyCount` chip but the count is hardcoded (e.g. `replyCount: 47`). |
| Edit / delete own content | **no** — none. |
| Report content | **no** — `<FlagButton>` from PR 0d is not on `/community`. |
| Message another user | **no** — no DM primitive. |
| Follow / save discussions | **no** — no subscribe affordance. |
| Control anonymity / privacy | **no** — fake name field is plain text input. If the IMG community is ever wired to real DB rows, the user's `User.name` would be the default (see §3.4). |
| Receive notifications | **no** — no notification primitive. |

The "Contact" button on each swap-post card has no `onClick` and no `href` — it does nothing. A logged-in user trying to actually swap an observership cannot reach the supposed counterpart at all.

---

## 6. Admin / moderation flow

| Action | Available? | Notes |
|---|---|---|
| View community posts | **no** — no `/admin/community-posts` page; `CommunityPost.findMany` has no caller. |
| Approve / reject / hide community posts | **no** — `ModerationStatus` is on the schema, but no UI flips it. |
| Resolve reports on community content | n/a — no report path scoped to `type: "community_post"` exists today. |
| Ban / suspend users | **no** — schema has no field. |
| Audit moderation actions | partial — `AdminActionLog` exists and is used for listings/reviews; no community actions are logged because none happen. |
| Prevent spam | **no** — neither rate-limit nor content classifier. (PR 0d added rate-limit on reviews + flags only.) |
| Distinguish medical / legal / immigration advice risks | **no** — no flagging vocabulary, no policy filter. |
| Moderate identity-sensitive content | **no** — no PHI/PII detector, no warning at compose time. |
| Read / answer admin messages from `/contact-admin` | ✅ — `/admin/messages` works. **Only real admin-side community surface.** |

Admin moderation tooling for a real `/community` does not exist. Should the IMG `/community` ever flip from fake-data to real-data, the moderation backstop is not ready.

---

## 7. Trust and safety analysis

| Vector | Severity | Today's exposure | Why |
|---|---|---|---|
| Spam (drive-by posts) | n/a today | low (no real surface) | becomes high the moment fake-data is replaced with real-data submissions. |
| Scams / paid manipulation | medium-future | n/a today | medical-trainee population is targeted by visa scams, fake mentorship offers, USMLE-prep fraud. Public forum without moderation is fertile. |
| Fake mentors / experts | medium-future | n/a today | no `VerifiedExpert` primitive; nothing prevents anyone from claiming "Dr." in profile. **The current fake "Dr." names in the seed data normalize this risk.** |
| Immigration / legal advice | high-future | n/a today | IMGs heavily seek visa/legal advice; UPL (unauthorized practice of law) and immigration-fraud risk in unmoderated comments. |
| Medical advice | high-future | n/a today | even resident-to-resident "what would you do for X patient" creates UPM risk. |
| Harassment | medium-future | n/a today | no block/report primitive scoped to community. |
| Doxxing | medium-future | n/a today | no `User.publicHandle`; if ever wired, real names default — high doxxing risk against poster who criticizes a program. |
| Retaliation against applicants | high-future | low today (no real posts) | applicants criticizing programs face retaliation; anonymity is essential. |
| Private applicant details | high-future | n/a today | comment is free-text, no PHI/PII filter. |
| Screenshots / documents in posts | n/a today | n/a | no upload primitive. |
| Misinformation | medium-future | n/a today | no fact-check, no link verification on user-pasted URLs. |
| Off-platform solicitation | medium-future | n/a today | "swap board" + "contact" UX assumes off-platform exchange; no anti-fraud rails. |
| **Brand-truth: fake user content rendered as real** | **C1, today** | **shipped to production** | `/community` shows hardcoded "Dr. Amira K.", "Dr. Raj P.", "Dr. Sarah M.", etc. — visitors believe these are real IMGs. |
| **Brand-truth: forum JSON-LD with no forum** | **C2, today** | shipped to production + sitemap | Google indexed `/community` with `DiscussionForumPosting` schema. Same risk class as PR 0d C2 (`AggregateRating`). |
| **Brand-truth: fake submission success** | **C3, today** | shipped to production | "Thank you for your submission" without any submission. |

---

## 8. Privacy and identity risk

| Concern | Status |
|---|---|
| Public names vs anonymous handles | ❌ — no `publicHandle` field. Real names would surface by default. |
| IMG visa status sensitivity | ❌ — `ApplicantProfile.visaStatus` is on the profile, not the community surface, but if community ever lights up it should never auto-render this without explicit user opt-in. |
| Applicant identity exposure | ❌ — no anonymity layer for community content. |
| Institution / program criticism | ⚠️ — community is a natural channel for "Hospital X mistreats IMGs". Anonymity + retaliation policy needed before this surface goes live. |
| Deletion / export / retention | ❌ — no `DELETE /api/community-posts/[id]`. No GDPR / CCPA export path. |
| Whether private messaging should exist early | **No** — abuse controls + reporting + ban infrastructure must come first. |
| PHI / PII warning on compose | ❌ — none. |

Document the anonymity model **before** any real `/community` ships. A model where every post defaults to `User.name` (current schema implication) is unsafe for IMG-vs-program criticism.

---

## 9. SEO / indexation implications

### 9.1 Current state

| Surface | Indexable? | Sitemap? | JSON-LD? |
|---|---|---|---|
| `/community` | yes | yes (line 57 of `sitemap.ts`) | **yes — `DiscussionForumPosting`** |
| `/community/suggest-program` | yes | yes (line 63) | no (BreadcrumbSchema only) |
| `/residency/community` | yes | unclear (not in `/community` sitemap entries) | no |
| `/career/community` | n/a | out of audit scope | n/a |

**The `DiscussionForumPosting` JSON-LD on `/community` is unsafe for the same reasons PR 0d's `AggregateRating` was unsafe**: it asserts the existence of a discussion forum that has no real DB rows, no admin moderation tooling wired up, and rendered content that is fabricated. Google's structured-data guidelines require the marked-up content to be **genuinely visible and authentic**.

### 9.2 Why this is C2

- The `mainEntity` says `"@type": "DiscussionForumPosting"` with `headline: "IMG Community Forum"`. Google takes this as a claim that the page hosts a forum.
- The visible content is in-memory React state seeded with fabricated user names. No `<DiscussionForumPosting>` with a real `creator`, `text`, or `interactionStatistic` field that mirrors actual user activity.
- No `Comment` or `CommentCount` JSON-LD fields are emitted, but the `replyCount: 47` chip on the visible page is a fixed string — would set up rich-snippet inconsistency the moment Google audits authenticity.

### 9.3 Recommendation

- **Remove `DiscussionForumPosting` JSON-LD from `/community/page.tsx`** until a real moderated forum exists. Same single-line surgical change as PR #42 made for `AggregateRating`. Authorized SEO-implementation exception class.
- **Mark `/community` as `noindex` until real content + moderation policy ship.** This is a sitemap + meta-robots change. **Out of scope for this audit-only PR**; queue as `PR 0e-fix-1`.
- **Keep `/community/suggest-program` indexable** — its purpose (encourage program suggestions) is still valid, but the form submission must be wired to `/api/admin-messages` or a new `/api/program-suggestions` route before launch.
- **Do not add `Review` / `AggregateRating` / `Comment` / `Article` JSON-LD to community pages until §10 abuse controls + moderation tooling exist.**

### 9.4 UGC SEO risk classes

Even with all of the above closed, public community pages carry future UGC indexation risk:

- **Thin pages:** posts that are "Hi, anyone in NYC?" → 5-line empty bodies indexed = thin-content penalty risk.
- **Duplicate / near-duplicate posts:** medical-board copy-paste threads.
- **Comment spam:** off-topic shortlinks gaming low-effort domain authority.
- **`noindex` policy for empty/short threads** would be the right post-launch posture.

---

## 10. Shared-entry implications

Apply [SHARED_ENTRY_AND_SOCIAL_DISTRIBUTION_ARCHITECTURE.md](../SHARED_ENTRY_AND_SOCIAL_DISTRIBUTION_ARCHITECTURE.md) URL-wins doctrine:

| Surface | URL-wins compliance | Notes |
|---|---|---|
| Public `/community` page | ✅ | opens directly, no login wall, no pathway modal |
| `/community/suggest-program` | ✅ | direct link works; form accepts input (silently fails to persist) |
| Shared link to a specific discussion | n/a today (no per-discussion URL) | future routing must use stable cuid-based URLs and serve the actual post (or a noindex-marked "post not found / removed") |
| Login preserves `returnTo` for posting | n/a today | no real post-create path. When wired, must preserve `returnTo`. |
| Reading is not blocked unless private | ✅ today (everything is "public") | when DM ships, private threads must enforce access |
| Expired / deleted community content | n/a today | when wired, surface a safe unavailable state with `noindex` rather than 404 — applies the same direct-share doctrine as listings |

No critical shared-entry violations *today* (because nothing is real), but the doctrine must hold when community ships.

---

## 11. Relationship to platform-v2 pathways

Per [`PATHWAY_DASHBOARD_ARCHITECTURE.md`](../PATHWAY_DASHBOARD_ARCHITECTURE.md):

| Pathway | Community fit | Notes |
|---|---|---|
| **USCE & Match (Pathway 1)** | natural — IMG/USCE, observership swap, application experiences, city/housing, old-YOG/SOAP/reapplicant questions, program reviews | exactly what `/community` *appears* to host today. Highest demand. |
| **Residency & Fellowship (Pathway 2)** | already labeled "Coming Soon" at `/residency/community` | the honest pattern. Boards, fellowship, moonlighting, research, program logistics. |
| **Practice & Career (Pathway 3)** | `/career/community` exists (out of scope per /career guardrail) | jobs/contracts/visa/insurance/locums/nonclinical questions. |
| **Show All Pathways (meta)** | n/a — community is per-pathway | a unified feed could wait until per-pathway communities are live |

**Conclusion:** Community is fundamentally **per-pathway**. The `CommunityPost.phase JourneyPhase` field already supports this (`MEDICAL_GRADUATE | RESIDENT | ATTENDING`). When real community ships, scope it pathway-first, not global.

---

## 12. Relationship to review / report systems (PR 0d)

| Question | Answer |
|---|---|
| Are community posts separate from reviews? | yes by schema (`CommunityPost` ≠ `Review`); no by user perception (forms call discussions "share experience"; reviews also call user-posts "share experience"). |
| Are reports reused? | no — `<FlagButton>` is not wired to `/community` posts today. When wired, `FlagReport.type = "community_post"` would be the natural extension. |
| Could users confuse community comments with verified reviews? | **yes** — a long discussion comment about a specific program reads like a review without the moderation-gate or anonymity-mask the review system has. PR 0d softened review trust language; community must not undo it. |
| Should community content influence trust badges? | **no.** Same answer as PR 0d. Verification is about source-link freshness; community is unverified opinion. |
| Should community content appear on listing pages? | **no, not until moderation is mature.** The PR 0d separation note ("Reviews are user-submitted, separate from source-link verification") would need a parallel for community references — but the cheapest path is: keep community off listing pages entirely. |

---

## 13. Homepage / nav / copy risk

| File | Quote / behavior | Status | Recommended fix |
|---|---|---|---|
| [`src/app/community/page.tsx:7-9`](../../../src/app/community/page.tsx) | "Connect with fellow IMGs, share observership and externship experiences, ask questions, and find support on your USCE journey." | implies active community | soften to match `/residency/community` "launching soon" copy until real |
| [`src/app/community/page.tsx:23`](../../../src/app/community/page.tsx) | `mainEntity.@type = "DiscussionForumPosting"` | **C2** | drop JSON-LD until real |
| [`src/components/community/community-tabs.tsx:33-89`](../../../src/components/community/community-tabs.tsx) | hardcoded `Dr. Amira K.` etc. seed data | **C1** | drop seed data; render empty state pointing to external IMG forums (the `communities[]` array of real Reddit / SDN links is fine and stays) |
| [`src/components/community/community-tabs.tsx:609`](../../../src/components/community/community-tabs.tsx) | `// In a real app this would call an API` | **C3** | wire to `/api/admin-messages` or new `/api/program-suggestions` |
| [`src/components/layout/navbar.tsx:34`](../../../src/components/layout/navbar.tsx) | `{ href: "/community", label: "Community" }` | depends on §13 fix-1 | if community goes "Coming Soon", the nav link can stay (residency-community pattern); if it goes `noindex`, no nav change needed |
| [`src/app/sitemap.ts:57,63`](../../../src/app/sitemap.ts) | `/community` + `/community/suggest-program` listed | **out of scope** for audit | sitemap change is a forbidden-path here. Queue as code-fix PR. |
| [`src/app/about/page.tsx:163-164`](../../../src/app/about/page.tsx) | "Reviews are moderated" | **true** | unchanged |
| Marketing claims of "Mentor", "Verified Expert" | absent | safe | confirmed |

---

## 14. Functional truth table

| Action | Real / Partial / Missing / Unsafe / Unknown |
|---|---|
| Read community content | **Unsafe** — fake content rendered as real (C1). |
| Create post | **Missing** — `useState`-only (C3). |
| Comment / reply | **Missing** — no comment UI. |
| Edit / delete own post | **Missing** |
| Report post / comment | **Missing** — `<FlagButton>` not wired. |
| Admin moderate post / comment | **Missing** — no UI / API. Schema fields exist but unused. |
| User ban / suspension | **Missing** — no schema field. |
| Private messaging | **Missing** |
| Mentorship matching | **Missing** |
| Notifications | **Missing** |
| Public profile | **Missing** — no profile route. |
| Search / filter | **Missing** |
| Indexable Q&A | **Unsafe** — `DiscussionForumPosting` JSON-LD asserts a forum (C2). |
| Submission success message | **Unsafe** — claims persistence that doesn't happen (C3). |
| `/contact-admin` ↔ `AdminMessage` flow | **Real** — separate, real-functional. |
| `/residency/community` "Coming Soon" labeling | **Real** — honest aspirational. |

---

## 15. Risks found

### Critical (C-class) — must close before any v2 launch claim of "active community"

| ID | File / route | Risk |
|---|---|---|
| **C1** | [`src/components/community/community-tabs.tsx:33-89, 100-140`](../../../src/components/community/community-tabs.tsx) | Hardcoded fake user names with "Dr." titles rendered as live community activity (swap board + discussions). Misleading-content / brand-truth / FTC-style risk. |
| **C2** | [`src/app/community/page.tsx:15-30`](../../../src/app/community/page.tsx) | `DiscussionForumPosting` JSON-LD asserts a forum that does not exist. Same risk class as PR 0d C2 (`AggregateRating` on listings). |
| **C3** | [`src/components/community/community-tabs.tsx:193-218, 606-625`](../../../src/components/community/community-tabs.tsx) | Submission forms display "Thank you" / success states without persisting. The `// In a real app this would call an API` comment confirms intent was never realized. Trust + privacy expectation breach. |

### High (H-class) — ship a small fix PR before any v2 push

| ID | File / route | Risk |
|---|---|---|
| **H1** | [`src/app/community/page.tsx:7-9`](../../../src/app/community/page.tsx) | metadata + h1 imply active community: "Connect with fellow International Medical Graduates, share … ask questions, and find support". Unsupported. |
| **H2** | [`src/app/sitemap.ts:57,63`](../../../src/app/sitemap.ts) | `/community` + `/community/suggest-program` listed for indexing. Should be `noindex` (or removed from sitemap) until real content + moderation. |
| **H3** | [`src/components/community/community-tabs.tsx:451-455`](../../../src/components/community/community-tabs.tsx) | Swap-post "Contact" button has no `onClick`/`href` — does nothing. |
| **H4** | [`src/components/layout/navbar.tsx:34`](../../../src/components/layout/navbar.tsx) + footer | nav exposes `/community` as a top-level destination. Until the page is honestly aspirational ("Coming Soon" pattern) or real, the prominence overpromises. |

### Medium (M-class)

| ID | File / route | Risk |
|---|---|---|
| **M1** | `CommunityPost` + `CommunityComment` orphan models | adds attack surface (DB tables exist, schema is exposed) without value. Defer schema removal to a future cleanup PR; do not migrate now. |
| **M2** | [`src/app/residency/community/community-client.tsx`](../../../src/app/residency/community/community-client.tsx) | honest aspirational pattern is good; the IMG `/community` page should adopt this exact pattern in PR 0e-fix-1. |
| **M3** | `User.name` exposure | if community ever lights up, real names default. Add `User.publicHandle` or anonymity-by-default policy before. |
| **M4** | no rate limit / no abuse fingerprint on community submissions (when ever wired) | even after C3 fix, the new API path will need PR 0d-style rate-limiting (already pattern-proven). |

### Low (L-class)

| ID | File / route | Risk |
|---|---|---|
| **L1** | `/career/community` (out of audit scope) | exists in /career zone; cross-pathway consistency with IMG community fix is a future concern, but `/career` cannot be touched here. |
| **L2** | `CommunityPost.category String` (free-text) | typo risk; future enum. Not blocker. |
| **L3** | `CommunityComment.moderationStatus` default `APPROVED` (opt-out) vs `CommunityPost` default `PENDING` (opt-in) | asymmetric; document the rationale or align before launch. |

---

## 16. Recommended v2 decision

**Decision A5: option C/E hybrid — keep aspirational, hide / de-emphasize. Defer real public community to post-launch.**

- Option **A** (treat as real-functional now) — **rejected**, blatantly false to the code.
- Option **B** (limited / private / report-only) — **rejected as path of action.** Even a "report-only" public surface still needs the C1/C2/C3 fixes before users see it.
- Option **C** (keep aspirational, hide claims) — **chosen** as the immediate stance.
- Option **D** (build small fix PR before v2) — **chosen as parallel track.** PR 0e-fix-1 below.
- Option **E** (defer community until after trust/listing/dashboard foundations) — **chosen** as the strategic stance. Real community ships **post-launch**, after Phase 0 closes and v2 trust foundations are stable.

The cheapest correct posture: make `/community` look like `/residency/community` (honest "Coming Soon"), drop the `DiscussionForumPosting` JSON-LD, drop the fake seed data, wire `SuggestProgramForm` to `/api/admin-messages` (or noop the form button until wired). Then defer real public community to post-launch.

---

## 17. Required follow-up PRs

| PR | Type | Scope | Blocker? |
|---|---|---|---|
| **PR 0e-fix-1 (copy + small code, recommended urgent)** | code (small) | C1: drop `initialSwapPosts[]`, `initialDiscussions[]`, `categoryBadgeVariant`/`reasonBadgeVariant` seed-data renderers from `community-tabs.tsx`. C2: drop `DiscussionForumPosting` JSON-LD from `/community/page.tsx` (single-line surgical change, same authorized-SEO-impl class as PR #42). C3: either wire `SuggestProgramForm` to `POST /api/admin-messages` with `category: "program-suggestion"` (preferred — reuses the real path) **or** remove the success message and replace with "Coming soon — for now, suggest programs via [/contact-admin](../contact-admin)". H1: soften metadata + h1 to "Coming Soon" model matching `/residency/community`. H3: remove or disable the dead "Contact" button on swap-post cards. ~80-130 LOC. | **YES** before any v2 traffic. Same risk class as PR #42. |
| **PR 0e-fix-2 (sitemap + nav, also urgent)** | code (small) | H2: remove `/community` + `/community/suggest-program` from `sitemap.ts` (or set `noindex` via `<meta robots>` + add to `robots.ts` if/when it exists). H4: optionally demote `/community` from primary navbar to footer until real. **This change touches sitemap.ts — explicitly authorized only because `/community` is a confirmed unsafe-indexed page mirroring the PR 0d AggregateRating exception class.** ~10-30 LOC. | **YES** before any v2 traffic. |
| **PR 0e-fix-3 (admin moderation + abuse infra, deferred)** | code (medium) | When real community is built: `/admin/community-posts` page, `PATCH /api/community-posts/[id]` resolve route, `User.suspended` flag. Multi-PR. | post-launch |
| **(future) UGC / SEO policy PR** | docs | When community launches: `noindex` policy for thin/duplicate posts, `Review`/`AggregateRating`/`DiscussionForumPosting` JSON-LD reintroduction policy. | post-launch |
| **(future) public community MVP PR** | code (large) | Real `/api/community-posts`, real comment thread, real moderation queue, real notification primitive, anti-spam fingerprint, anonymous handles. Multi-month scope. | post-launch |
| **(future) schema / migration PR** | schema | Add `User.publicHandle`, `User.suspended`, `CommunityPost.parentCommentId` (or thread model), `PostSubscription`, abuse-fingerprint table. **Only if authorized later.** | deferred |

**Batching recommendation:** ship **PR 0e-fix-1 + PR 0e-fix-2 as a single small fix PR** (~100-160 LOC). They're tightly coupled — both make `/community` honest. Same shape as PR #42's combined truth/safety fix.

---

## 18. Do-not-do list

- **Do not** launch a public forum without admin moderation tooling (`/admin/community-posts`, ban primitive, rate-limiting, abuse fingerprint).
- **Do not** re-introduce the hardcoded "Dr." seed data once removed.
- **Do not** index UGC pages before a spam-policy + thin-content policy exists.
- **Do not** expose `User.name` as the default author byline; build `User.publicHandle` or anonymous-by-default first.
- **Do not** create private messaging without abuse controls.
- **Do not** let community content affect Phase 3 trust badges or `<ListingVerificationBadge>` decisions.
- **Do not** market "expert advice" / "ask a mentor" / "verified mentor" until a `VerifiedExpert` primitive (with credentialing) exists.
- **Do not** launch mentorship matching without verification + safety rules.
- **Do not** call community comments "reviews" or display them on listing pages (cross-system contamination).
- **Do not** add `Review` / `AggregateRating` / `Comment` / `Article` JSON-LD to community pages until §17 PR 0e-fix-1 + PR 0e-fix-2 ship.
- **Do not** drop the `CommunityPost` / `CommunityComment` Prisma models in this PR cycle. Schema cleanup is post-launch.
- **Do not** touch `/career/community` — out of scope per `/career` guardrail.
- **Do not** modify `/residency/community` — it is the honest pattern model.

---

## 19. Final recommendation

**Lock A5 = option C/E hybrid.** Keep aspirational, hide claims, defer real community to post-launch.

**Action queue:**

1. Merge this PR 0e audit (docs-only).
2. Continue Phase 0:
   - **PR 0f — recommend / tools audit** (`/api/recommend`, `/recommend`, `/tools/cost-calculator`).
   - **PR 0g — cost-calculator flow audit**.
3. After Phase 0 closes, ship **PR 0e-fix-1 + PR 0e-fix-2 as a single small fix PR** (~100-160 LOC). Closes C1, C2, C3, H1, H2, H3, H4. Same shape as PR #42.
4. Real public community deferred to **post-launch**, behind moderation infrastructure and pathway-scoped rollout.

**Pathway tag:** `usce_match` for `/community` (IMG), `residency_fellowship` for `/residency/community` (already honestly labeled). `practice_career` (`/career/community`) is out of scope here.

**Severity:** equal to PR 0d. C1/C2/C3 are the live truth/safety problems and are bigger in surface than PR 0d's review problems because the `/community` page is **wholly aspirational while presenting itself as real**, not a real backend missing a frontend gate.

**No critical security gap** in the strict authz sense — there is no real community write path to gate. C1/C2/C3 are integrity / trust gaps that the proposed fix PR closes without schema changes.

---

*End of PR 0e audit. Sibling audits: [POSTER_FLOW_AUDIT.md](POSTER_FLOW_AUDIT.md) (PR #32), [RESIDENCY_NAMESPACE_AUDIT.md](RESIDENCY_NAMESPACE_AUDIT.md) (PR #38), [APPLICATION_FLOW_AUDIT.md](APPLICATION_FLOW_AUDIT.md) (PR #40), [REVIEW_FLOW_AUDIT.md](REVIEW_FLOW_AUDIT.md) (PR #41). Predecessor fix: [V2_COPY_TRUTH_FIX_LOG.md](V2_COPY_TRUTH_FIX_LOG.md) (PR #42, merged at `a9e61a1`). Next: PR 0f — recommend / tools audit.*
