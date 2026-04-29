# USCEHub v2 — planning audit

**Status:** audit doc; produced before merging PR #30.
**Authority:** lower than [RULES.md](../codebase-audit/RULES.md), [SEO_PRESERVATION_RULES.md](../codebase-audit/SEO_PRESERVATION_RULES.md), [PLATFORM_V2_STRATEGY.md](PLATFORM_V2_STRATEGY.md).
**Audited:** 2026-04-29.
**Audited PR:** [#30](https://github.com/shalinder88/uscehub/pull/30) — 11 docs, 6,457 lines, 124 open decisions.
**Audit scope:** PR #30 internal consistency + cross-doc consistency with [AGENTS.md](../../AGENTS.md), [USCEHUB_MASTER_BLUEPRINT.md](../codebase-audit/USCEHUB_MASTER_BLUEPRINT.md), [BATCH_RELEASE_CHECKLIST.md](../codebase-audit/BATCH_RELEASE_CHECKLIST.md), and the actual codebase under `src/app/`.

---

## 1. Executive verdict

**Do NOT merge PR #30 as-is.**

The 11 docs are directionally correct and capture real constraints (lane separation, schema authorization, FTC, CAN-SPAM, freshness, AI-search resilience, `/career` preservation, ranking protection). But they were written without enough grounding in the existing codebase, and the volume is now a review-bandwidth liability.

**Recommended action:** revise the existing PR #30 branch in-place (additive corrections + 1 new doc + a focused decision register), then merge once the corrections are clean. **Do not split into multiple PRs** — keep the planning batch unified so future agents read it as one body.

The corrections are mechanical (~3-4 hours of focused work), not philosophical. The doctrine is sound; the factual grounding is incomplete.

---

## 2. PR #30 metrics

| Metric | Value | Concern |
|---|---|---|
| Files changed | 11 | high (not split) |
| Lines added | 6,457 | review-fatigue risk |
| Open decisions | **124** total across 11 docs | volume |
| Files with > 600 lines | 5 (IA, Wireframe, Templates, Indexation, Messaging, Trust) | dense |
| Docs that materially contradict existing codebase | 4 (IA, Wireframe, Templates, Freshness) | factual drift |
| Docs that contradict each other | 1 minor (visa decision helper canonical placement) | resolvable |
| Docs that contradict existing AGENTS.md / RULES.md / SEO_PRESERVATION_RULES.md | 0 | clean — doctrine aligned |
| Docs that propose schema changes | 4 (IA, Templates, Messaging, Trust/Monetization) | all gated by existing §7 authorization rule (correct) |

**Per-doc decision count:**

| Doc | Decisions | Lines |
|---|---|---|
| INFORMATION_ARCHITECTURE.md | 15 | 624 |
| INDEXATION_AND_URL_POLICY.md | 14 | 663 |
| DATA_FRESHNESS_SLA.md | 13 | 530 |
| TRUST_AND_MONETIZATION_POLICY.md | 13 | 602 |
| HOMEPAGE_V2_WIREFRAME.md | 12 | 654 |
| MESSAGING_AND_ALERTS_POLICY.md | 12 | 642 |
| NAVIGATION_MODEL.md | 10 | 536 |
| PAGE_TEMPLATE_INVENTORY.md | 10 | 800 |
| PLATFORM_V2_35_DAY_AGGRESSIVE_PLAN.md | 10 | 499 |
| V2_PR_BREAKDOWN.md | 10 | 380 |
| V2_QA_CHECKLIST.md | 5 | 461 |
| **Total** | **124** | **6,391** |

---

## 3. Top 10 risks found

### 3.1 Existing-route drift (HIGH)

PR #30 docs treat 22+ existing routes as "future" or omit them entirely:

- `/about`, `/contact`, `/contact-admin`, `/disclaimer`, `/how-it-works` — never mentioned in IA
- `/community` + `/community/suggest-program` — never mentioned (user-generated content surface)
- `/poster/{applications,listings,organization,settings,verification}` — whole institution-side onboarding flow that exists today; [TRUST_AND_MONETIZATION_POLICY.md](TRUST_AND_MONETIZATION_POLICY.md) treats institution claim flow as "Phase C+ future"
- `/residency` + 11 subroutes (`boards`, `community`, `fellowship`, `finances`, `moonlighting`, `post-match`, `procedures`, `research`, `resources`, `salary`, `survival`) — entire built-out resident vertical that [INFORMATION_ARCHITECTURE.md](INFORMATION_ARCHITECTURE.md) ignores
- `/residency/fellowship` is **already a fellowship database** with visa-sponsorship and match-participation data; [PAGE_TEMPLATE_INVENTORY.md](PAGE_TEMPLATE_INVENTORY.md) §3.3 treats Fellowship vertical as "future Phase C+"
- `/tools/cost-calculator` — **already a `WebApplication`-tagged tool**; [INFORMATION_ARCHITECTURE.md](INFORMATION_ARCHITECTURE.md) §5.6 lists it as "future"

**Impact:** any v2 implementation following these docs would either duplicate existing work or migrate without acknowledging migration cost. The proposed `/match`, `/fellowship`, `/jobs`, `/visa`, `/tools` URL trees collide with `/residency/*` semantics — does USCEHub end up with both `/residency/fellowship` AND `/match/fellowship` AND `/fellowship`?

**Severity:** high. This is the single biggest planning-doc liability.

### 3.2 Verify-jobs cron freshness story missing entirely (HIGH)

[`vercel.json`](../../vercel.json) runs **two crons**, not one:

```json
{ "path": "/api/cron/verify-jobs",     "schedule": "0 8 * * *" },
{ "path": "/api/cron/verify-listings", "schedule": "0 9 * * *" }
```

The verify-jobs cron checks `WAIVER_JOBS` source URLs for the preserved `/career/jobs/*` tree. [`DATA_FRESHNESS_SLA.md`](DATA_FRESHNESS_SLA.md) addresses listings only, not jobs. [PLATFORM_V2_STRATEGY.md §2.3](PLATFORM_V2_STRATEGY.md) says "Two Vercel crons (Hobby plan cap is 2)" but doesn't differentiate between them.

**Impact:** the freshness contract for waiver-job listings is undefined. If/when `/jobs/*` (the v2 vertical) ships, it must coordinate with both the legacy `/career/jobs/*` tree AND the verify-jobs cron — neither is documented.

**Severity:** high.

### 3.3 Robots.txt contradicts proposed AI crawler policy (MEDIUM)

[`public/robots.txt`](../../public/robots.txt) **explicitly blocks** Bytespider (TikTok / ByteDance crawler) and PetalBot (Huawei). [INDEXATION_AND_URL_POLICY.md §12.4](INDEXATION_AND_URL_POLICY.md) says "AI crawlers are **allowed** by default."

**Impact:** doc-vs-reality conflict. If we implement the doc's allowlist, we explicitly unblock crawlers we previously blocked. Decision needs to be made — keep current anti-scraper posture (clearer intent) or shift to AI-friendly (per doc's strategic argument)?

**Severity:** medium. Decision needed before v2 launch event.

### 3.4 Existing security headers + redirects undocumented (MEDIUM)

[`next.config.ts`](../../next.config.ts) already wires:
- `X-Robots-Tag: noindex, nofollow` for non-`uscehub.com` hosts (preview noindex — already implemented)
- HSTS, X-Frame-Options DENY, Referrer-Policy, Permissions-Policy
- One redirect: `/freida` → `/img-resources`

[`INDEXATION_AND_URL_POLICY.md §8`](INDEXATION_AND_URL_POLICY.md) says "v2 must additionally emit" preview noindex — it already does. The doc reads as if implementing this is future work; it's not.

**Impact:** docs read as more-aspirational than they are. Future agents may try to "implement" already-built infrastructure.

**Severity:** medium.

### 3.5 Sitemap auto-generation broader than docs assume (MEDIUM)

[`src/app/sitemap.ts`](../../src/app/sitemap.ts) already dynamically generates from `US_STATES`, `SPECIALTIES`, `BLOG_POSTS`, `WAIVER_STATES`. The proposed [INDEXATION_AND_URL_POLICY.md §9.1](INDEXATION_AND_URL_POLICY.md) "no template-only programmatic page enters the sitemap" rule may already be **violated** by the existing sitemap because:

- All 50 US states × every specialty currently in sitemap (state + specialty combinations potentially fail §9 quality gate)
- All blog posts (status check unknown)
- All waiver states (template-only?)

**Impact:** the §9 quality-gate rule binds future work but doesn't address current sitemap entries that may already fail the gate.

**Severity:** medium. Audit needed before applying §9 retroactively.

### 3.6 Stale "verified" copy on main outside PR #25/#27 scope (MEDIUM)

PR #25 + PR #27 fix the homepage stat card + blog posts. **Stale "verified" claims still on main:**

- `src/app/page.tsx:16,94` — homepage `<title>` says "Verified U.S. Clinical Experience Programs for IMGs"; OpenGraph description says "the largest structured database…"
- `src/app/layout.tsx:21,25,35,44,50` — same pattern in root layout
- `src/app/observerships/specialty/[specialty]/page.tsx:39` — meta description says "verified programs with reviews, costs, and application details"
- `src/app/observerships/[state]/page.tsx:37` — same pattern
- `src/components/seo/program-stats.tsx:81` — "Verified Programs" stat card label (covered by PR #25)

**Impact:** even after PR #25/#27 merge, the homepage `<title>`, meta description, and 50+ state-page meta descriptions still claim "verified" or "largest." Per [HOMEPAGE_V2_WIREFRAME.md §15.3](HOMEPAGE_V2_WIREFRAME.md): "largest" is a forbidden word.

**Severity:** medium. Either expand PR #25/#27 scope OR open a follow-up trust-language PR before v2 launch.

### 3.7 124 open decisions are an unfocused review burden (HIGH)

12-15 open decisions per doc × 11 docs = 124 decisions. Many are operationally low-impact ("tile color"), some are foundational ("audience-first vs vertical-first nav"). They're not categorized by urgency.

**Impact:** review process becomes a 5-hour decision-marathon for the user, and decision quality degrades after the first hour. Critical decisions (vertical exposure timing, schema authorization sequencing, monetization first-mode launch) are buried in cosmetic decisions (button colors, footer column count).

**Severity:** high. Decision register needed.

### 3.8 35-day plan still aggressive given doc volume (MEDIUM)

[PLATFORM_V2_35_DAY_AGGRESSIVE_PLAN.md §4](PLATFORM_V2_35_DAY_AGGRESSIVE_PLAN.md) Phase 2 (Days 3-7) = "user reads ~6,000 lines of strategy docs in 2-3 days." Now that PR #30 is **6,457 lines + 124 decisions**, this is unrealistic.

The doc names a 10-week realistic fallback (§12 comparison table). Recommend: **make the realistic 10-week version the binding default, not the fallback.**

**Severity:** medium.

### 3.9 V2_PR_BREAKDOWN sequencing creates serialization bottleneck (MEDIUM)

[V2_PR_BREAKDOWN.md](V2_PR_BREAKDOWN.md) Phase D (PRs 20-23, schema additions to main) has 4 PRs each requiring explicit user authorization. Phase E (PRs 24-27, backend wiring) requires Phase D PRs to merge to main + rebase into v2 first.

This creates a 4-PR serialization point. If the user takes a week to authorize each schema PR, that's a month of v2-branch idle time waiting for schema.

**Impact:** the 35-day plan and the 10-week plan both implicitly assume schema authorizations happen quickly. They probably don't.

**Severity:** medium. Schema PR ordering should be revisited.

### 3.10 Visa decision helper canonical URL ambiguity (LOW)

[INFORMATION_ARCHITECTURE.md §13 #6](INFORMATION_ARCHITECTURE.md) recommends `/tools/visa-decision-helper` as canonical, `/visa/decision-helper` as alias. But §5.5 still lists `/visa/decision-helper` as a Visa subroute (not flagged as alias).

**Impact:** future agents may build at both URLs.

**Severity:** low — fix is one-line edit to §5.5.

---

## 4. Cross-doc contradictions

### 4.1 Confirmed contradictions

| Topic | Doc A | Doc B | Resolution |
|---|---|---|---|
| Visa decision helper canonical | IA §5.5 lists `/visa/decision-helper` as Visa subroute | IA §13 #6 recommends `/tools/visa-decision-helper` canonical | Edit §5.5 to mark `/visa/decision-helper` as alias only |
| AI crawler policy | INDEXATION §12.4 "allow all AI crawlers" | `public/robots.txt` blocks Bytespider, PetalBot | Decision needed; either update robots.txt or update doc |
| Fellowship vertical exposure | PAGE_TEMPLATE_INVENTORY §3.3 "future Phase C+" | NAVIGATION_MODEL §7.2 "landing + visa-friendly only at v2 launch" + IA §5.3 same | Real state: `/residency/fellowship` is already a fellowship database. Resolution: rewrite IA §5.3, NAV §7.2, PAGE_TEMPLATE_INVENTORY §3.3 to acknowledge existing surface |
| Jobs vertical exposure | IA §5.4 "skeletal honest empty state at v2 launch" | NAVIGATION_MODEL §7.2 "landing only" | Consistent | (no contradiction; same scope) |

### 4.2 Confirmed non-contradictions (verified)

| Topic | Verdict |
|---|---|
| Auto-merge policy | Consistent: docs-only auto-merge per BATCH_RELEASE_CHECKLIST; public/code PRs require user review per all docs |
| Schema-on-main rule | Consistent across PLATFORM_V2_STRATEGY §7, V2_PR_BREAKDOWN Phase D, all schema-touching docs |
| /career protection | Consistent across all docs and RULES.md §2 |
| No real email until prerequisites | Consistent: PLATFORM_V2_STRATEGY §13.5 + MESSAGING §2.1 + 35-DAY-PLAN §13.4 |
| Trust ranking protection (sponsored never displaces verified) | Consistent: PLATFORM_V2_STRATEGY §12.1 + TRUST_AND_MONETIZATION §3 + V2_QA_CHECKLIST §17 |

---

## 5. Existing-surface drift — the dominant gap

This is the most consequential factual error. Listed for completeness:

### 5.1 Routes that exist on `main` and are NOT in [INFORMATION_ARCHITECTURE.md](INFORMATION_ARCHITECTURE.md) §5 page maps:

```
/about
/community
/community/suggest-program
/contact
/contact-admin
/disclaimer
/how-it-works
/poster
/poster/applications
/poster/listings
/poster/organization
/poster/settings
/poster/verification
/residency
/residency/boards
/residency/community
/residency/fellowship
/residency/fellowship/guide
/residency/finances
/residency/moonlighting
/residency/post-match
/residency/procedures
/residency/research
/residency/resources
/residency/salary
/residency/survival
```

That's **26 missing routes** (some count as parents of subroutes; net new top-level = 9 plus 17 subroutes).

### 5.2 Routes the IA proposes that **already exist** under different names:

| Proposed (IA / templates) | Existing | Conflict |
|---|---|---|
| `/match` (vertical landing) | `/residency` (live) — covers match prep + post-match + survival | overlap; rename one or merge |
| `/match/strategy/*` | `/residency/*` (live) | overlap |
| `/fellowship/*` | `/residency/fellowship` (live, fellowship database) + `/residency/fellowship/guide` | overlap; existing is deeper |
| `/jobs/*` | `/career/jobs/*` (preserved per RULES.md) | proposed coexistence already documented in IA §5.4 — fine |
| `/visa/*` | `/career/h1b/*`, `/career/waiver/*`, `/career/conrad-tracker/*`, `/career/visa-bulletin/*` (all preserved per RULES.md) | proposed coexistence already documented in IA §5.5 — fine |
| `/tools/cost-calculator` | `/tools/cost-calculator` (live) | IA §5.6 says "future"; **factually wrong** |
| `/disclosure` (proposed by TRUST_AND_MONETIZATION §12) | `/disclaimer` (live) | naming collision; either rename `/disclaimer` → `/disclosure`, build `/disclosure` separately, or pick one canonical |
| `/recommend` (proposed migration to `/tools/recommend`) | `/recommend` (live) | IA proposes 301 to `/tools/recommend`; SEO migration not authorized yet |

### 5.3 Schema models that exist and are not credited as "existing"

PR #30 proposes (per [V2_PR_BREAKDOWN.md](V2_PR_BREAKDOWN.md) Phase D):
- PR 20: `Listing.audienceTags`, `Listing.careerStageTags` — **new**
- PR 21: `Listing.sourceAuthorityTier`, `Listing.monetizationDisclosure` — **new**
- PR 22: `EmailSubscription`, `EmailSendLog` — **new**
- PR 23: `InstitutionClaim`, `SponsoredPlacement` — **new**

Existing schema models that overlap with proposals:
- `Organization` (institution side; overlaps with proposed `InstitutionClaim`)
- `PosterProfile` (institution claim flow already exists; `/poster/verification` exists)
- `FellowshipProgram` (already modelled; proposed Fellowship vertical doesn't reuse)
- `WaiverJob` (job-side data already modelled; proposed `/jobs/*` doesn't reuse)
- `Application` (application-tracking already modelled; homepage wireframe §12 said "soften 'submit your application through the platform' if not actually true" — but the model exists)
- `Review`, `CommunityPost`, `CommunityComment` (review and community surfaces already modelled; not addressed in any doc)

**Impact:** the proposed Phase D schema PRs aren't simple greenfield — they layer on top of an existing 32-model schema. Future agents need a richer "what we have vs what we're adding" picture.

---

## 6. Open decision register (categorized summary)

124 decisions across docs. Categorized by urgency:

### 6.1 Blocking before v2 implementation begins (must resolve)

**Sequencing-blocking (~15 decisions):**
- IA #1: Old URL 301 vs keep-both for migrated content (blocks every URL migration)
- IA #2: Old `/observerships/*` migration (301 vs keep-both)
- IA #3: `/listing/[id]` → `/usce/[listing-slug]` slug migration
- IA #6: Visa decision helper canonical URL (already recommended, just lock it)
- IA #11: USCE vs Browse as canonical entry
- IA #13: Footer structure (compact vs vertical mirror)
- INDEXATION #1-#12: URL canonical / sitemap / robots policy decisions
- TRUST/MONETIZATION #1: First monetization mode (free claim recommended; needs lock)

**Resolution path:** group these into 2-3 user decisions in revised PR #30 ("aggressive 301 vs preserve old URLs" as a single position, with rationale).

### 6.2 Needed before v2 public launch (must resolve before launch event)

**Launch-blocking (~30 decisions):**
- IA #4: How many audience landings at launch (3 vs 5 vs 6)
- IA #7: Logo + tagline above hero
- HOMEPAGE #1-#4: Hero framing, primary CTAs, audience block placement
- NAVIGATION #1-#8: Drop-down menus, mobile bottom bar, search overlay placement
- DATA_FRESHNESS #1-#4: Tier age boundaries, downgrade type, stale-tier admin queue surfacing
- TRUST/MONETIZATION #5-#10: Banner styling, badge color, slot positions, refund policy
- MESSAGING #1: Postal address (CAN-SPAM blocker)
- 35-DAY PLAN: real-world cron capacity vs first-pass timeline

**Resolution path:** these can decide during v2 implementation phase, but must lock before launch event. Surface in `LAUNCH_PLAN.md` (deferred per [PLATFORM_V2_STRATEGY.md §19](PLATFORM_V2_STRATEGY.md)) checklist.

### 6.3 Can decide during design / build (defer)

**~50 decisions** about:
- Visual treatment (button colors, tile styles)
- Component-level decisions (hover states, sticky behavior, dark mode toggle)
- Content depth (length of curated intros, FAQ count)
- Tool implementation details (decision tree depth, calculator inputs)

**Resolution path:** these don't need user decisions now. Defaults are reasonable; v2 implementation will surface real questions when actually building.

### 6.4 Can defer until post-launch (defer)

**~20 decisions** about:
- Phase D (marketplace) features
- Phase D schema additions (institution claim variants, sponsored placement variants)
- Reviews / endorsements on directory entries
- Push notifications, SMS, WhatsApp
- i18n / Spanish content

**Resolution path:** explicitly post-launch; surface in a separate `PHASE_D_PLANNING.md` later.

### 6.5 Overthought / likely unnecessary (drop)

**~10 decisions** that may not need to be decisions:
- IA #15: First-touch attribution capture
- HOMEPAGE #11: Animation on hero (consensus is "none")
- NAVIGATION #4: Search bar inline vs icon-with-overlay (we can just pick)
- INDEXATION #14: `Organization` `sameAs` social links (operational detail)
- V2_PR_BREAKDOWN #5: Internal PR numbering vs actual GitHub numbers (process noise)
- PAGE_TEMPLATE_INVENTORY #5: Featured image on blog posts (we said "no images" by default)
- DATA_FRESHNESS #11: Per-listing reverify cadence override (premature optimization)

**Resolution path:** delete from the open-decisions sections in revisions.

---

## 7. PR #25 / #27 review — should they merge before PR #30?

### 7.1 PR #25 (trust metrics language)

- **Files:** `src/lib/site-metrics.ts`, `src/app/api/programs/stats/route.ts`, `src/components/seo/program-stats.tsx`, `scripts/test-cleanup-helpers.ts`
- **Change:** "Verified Programs" → "Programs with Official Source", value 207 → 156 (matches cron health output exactly), JSON field rename, no-overclaim test assertions
- **Verdict:** clean. Ready for batch approval.
- **Recommendation:** merge before PR #30 revisions. The conservative-language doctrine is referenced extensively in PR #30 docs; merging PR #25 makes those references match production.

### 7.2 PR #27 (blog content cleanup)

- **Files:** `src/app/blog/[slug]/page.tsx`, `src/lib/blog-data.ts`
- **Change:** 4 string changes — all "207+ verified" → "156+ programs with an official source on file" + one blog gains honest verification-state disclosure
- **Verdict:** clean. Ready for batch approval.
- **Recommendation:** merge alongside PR #25 as a single batch.

### 7.3 What PR #25 + PR #27 do NOT cover

Per §3.6 above, these stale-claim sources still on main after both merge:

| File | Line | Issue |
|---|---|---|
| `src/app/page.tsx` | 16 | `<title>` "Verified U.S. Clinical Experience Programs for IMGs" |
| `src/app/page.tsx` | 94 | OG description "the largest structured database of clinical observership..." (contains forbidden word "largest") |
| `src/app/layout.tsx` | 21,25,35,44,50 | Same patterns in root layout (all metadata pages inherit) |
| `src/app/observerships/specialty/[specialty]/page.tsx` | 39 | meta description "verified programs with reviews, costs, and application details" |
| `src/app/observerships/[state]/page.tsx` | 37 | same pattern |

**Recommendation:** open a follow-up PR (call it PR #31 or `phase3/10-trust-metadata-cleanup`) that:
- Updates root `<title>` to remove "Verified" overclaim (per [PLATFORM_V2_STRATEGY.md §4.4](PLATFORM_V2_STRATEGY.md))
- Removes "largest structured database" superlative (per [HOMEPAGE_V2_WIREFRAME.md §15.3](HOMEPAGE_V2_WIREFRAME.md))
- Replaces state/specialty meta descriptions with conservative wording

**Risk if not done:** AI search indexes the homepage `<title>` and OG description widely. Stale "Verified" + "largest" copy locks USCEHub into the IMG-only frame and the overclaim posture for as long as the metadata stays.

---

## 8. SEO risk — sitemap auditing required

### 8.1 Current sitemap inputs

[`src/app/sitemap.ts`](../../src/app/sitemap.ts) generates from:
- Static pages (homepage, browse, observerships, recommend, compare, tools/cost-calculator, …)
- All US states (per `src/lib/utils.US_STATES`)
- All specialties (per `src/lib/utils.SPECIALTIES`)
- All blog posts (per `src/lib/blog-data.BLOG_POSTS`)
- All waiver states (per `src/lib/waiver-data.WAIVER_STATES`)

### 8.2 Quality gate violation risk

Per [PLATFORM_V2_STRATEGY.md §9](PLATFORM_V2_STRATEGY.md) + [INDEXATION_AND_URL_POLICY.md](INDEXATION_AND_URL_POLICY.md): "no template-only programmatic page may enter the sitemap." Existing entries that may violate:

- 50 state pages (`/observerships/[state]`) — quality unaudited; if any are template-only, they violate §9
- N specialty pages — same concern
- 50 waiver state pages (`/career/waiver/[state]`) — preserved per RULES.md §2 but need quality audit

### 8.3 Recommendation

**Before v2 launch event** (gate #6 of §17.3 readiness gates), run a quality-gate audit of the existing sitemap. Either:
- (a) Remove template-only entries from sitemap (degrades SEO short-term)
- (b) Curate the entries (effort: ~1 hour per state if hand-written intro + unique data point)
- (c) Mark current sitemap as "grandfathered" and apply §9 only to new entries

**Recommendation: (c) for v2 launch event, (b) progressively post-launch.**

---

## 9. Realism checks

### 9.1 Cron capacity vs first-pass coverage

- 304 listings, cron picks 25/day = **12+ days minimum** for first-pass over the full set
- Currently 156 VERIFIED + 145 UNKNOWN + 4 NEEDS_MANUAL_REVIEW (post-PR #25 trust labeling)
- 145 UNKNOWN ÷ 25/day = **6 days** minimum to clear (assumes no new listings)
- After clearing, only ~half of listings have `lastVerifiedAt` set (the cron-touched cohort)

**Implication:** the [PLATFORM_V2_35_DAY_AGGRESSIVE_PLAN.md](PLATFORM_V2_35_DAY_AGGRESSIVE_PLAN.md) Phase 5 readiness gate #1 ("cron clean ≥ 4 consecutive days") is the easy gate. The harder gate is the [DATA_FRESHNESS_SLA.md §6.1](DATA_FRESHNESS_SLA.md) "≥ 80% Current+Aging" threshold — currently ~7%, **months from passing.**

### 9.2 Public claim alignment

The freshness threshold for "verified programs" public claim is months from passing. In the meantime, `/page.tsx:16` says "Verified U.S. Clinical Experience Programs for IMGs" in the root `<title>`. Per [DATA_FRESHNESS_SLA.md §6.1](DATA_FRESHNESS_SLA.md), this claim is currently misaligned.

**Resolution path:** change root `<title>` to remove "Verified" until threshold passes (per §7.3 follow-up PR recommendation).

### 9.3 35-day timeline realism

| Phase | Aggressive | Realistic | Probability of hitting aggressive |
|---|---|---|---|
| Phase 1 (stabilize, days 1-2) | 2 days | 2 days | done — high |
| Phase 2 (planning depth, days 3-7) | 5 days | 14 days | low — 6,457 lines of new docs + 124 decisions can't reasonably be reviewed + revised in 5 days |
| Phase 3 (v2 prototype, days 8-14) | 7 days | 14 days | medium |
| Phase 4 (workflows, days 15-21) | 7 days | 14 days | medium-low — depends on schema PR cadence |
| Phase 5 (launch prep, days 22-28) | 7 days | 14 days | low — readiness gates have months-long dependencies (cron capacity, freshness) |
| Phase 6 (distribution, days 29-35) | 7 days | 14 days | n/a — only after launch |

**Recommendation:** **make 10-week realistic the binding default**, not the fallback.

### 9.4 Schema PR sequencing

Phase D has 4 schema PRs (audience tags, source-tier, EmailSubscription, InstitutionClaim). Each requires:
1. Explicit user authorization
2. Review (~1-2 days)
3. Merge to main + Vercel deploy (~1 hour)
4. Rebase v2 branch to consume

If user takes a week per authorization (realistic): 4 schema PRs = 4 weeks of v2-branch idle time.

**Recommendation:** PR 20 (audience tags) is the only schema PR critically needed for v2 launch (audience filtering). PRs 21-23 can defer to post-launch. Surface this in V2_PR_BREAKDOWN as the "minimum schema set for launch."

---

## 10. What must be fixed before v2 implementation begins

These are **mandatory revisions to PR #30** before merging:

### 10.1 Add a 12th doc: EXISTING_SURFACE_INVENTORY.md

Catalog every existing route, schema model, and component that v2 must integrate with or migrate from. Forces every other doc to acknowledge reality.

### 10.2 Edits to INFORMATION_ARCHITECTURE.md

- Add §2.1 entries for `/about`, `/community`, `/contact`, `/contact-admin`, `/disclaimer`, `/how-it-works`, `/poster/*`, `/residency/*`, `/tools/cost-calculator` (already-live additions)
- Resolve Match vs `/residency` overlap (rename or merge proposal)
- Resolve Fellowship vs `/residency/fellowship` overlap (rename or merge proposal)
- Fix §5.6: `/tools/cost-calculator` is **live**, not future
- Fix §5.5: clarify `/visa/decision-helper` is alias only (canonical = `/tools/visa-decision-helper`)
- Add `/poster/*` to §5.8 institutions (existing institutional flow)

### 10.3 Edits to PAGE_TEMPLATE_INVENTORY.md

- Update §3.3 Fellowship vertical: existing `/residency/fellowship` is a fellowship database
- Update §3.13 Audience landings: `/residency` partial-overlaps audience-landing for residents
- Add §17 Job listing: cross-reference existing `/career/jobs/*` per RULES.md §2 (preservation)
- Add §19 Institution profile: cross-reference existing `/poster/*` (existing institutional surface)

### 10.4 Edits to HOMEPAGE_V2_WIREFRAME.md

- §6.3: tools surface should mention `/tools/cost-calculator` exists (already a tool)
- §11: footer should include /community + /how-it-works + /disclaimer (currently or proposed)
- §12: "submit your application through the platform" softening — verify whether the existing `Application` model + `/api/applications` is real-functional or aspirational

### 10.5 Edits to NAVIGATION_MODEL.md

- §7.2: revise table; Fellowship is not "future" — already exists at `/residency/fellowship`
- Add `/residency/*` exposure decision: keep at `/residency` URL, surface in nav as Match? Fellowship? Both? Neither?

### 10.6 Edits to DATA_FRESHNESS_SLA.md

- Add a section for verify-jobs cron and `WAIVER_JOBS` data freshness story
- Add explicit acknowledgement that cron-coverage is currently ~7% Current+Aging (months from public claim threshold)

### 10.7 Edits to INDEXATION_AND_URL_POLICY.md

- Resolve §12.4 vs `public/robots.txt` conflict on Bytespider/PetalBot
- Acknowledge §8.4 is already implemented in `next.config.ts`
- Audit existing sitemap entries against §9 quality gate (or grandfather them)

### 10.8 Edits to TRUST_AND_MONETIZATION_POLICY.md

- §12 `/disclosure` URL: resolve naming collision with existing `/disclaimer`
- Add §6.4 cross-reference to existing `/poster/verification` flow (which is closest to "free claim flow")

### 10.9 Edits to PLATFORM_V2_35_DAY_AGGRESSIVE_PLAN.md

- Make the 10-week realistic version the binding default
- Add cron-coverage gate explicitly: "${listings} reach Current+Aging tier ≥ 80%" (currently failing)

### 10.10 New: V2_DECISION_REGISTER.md

Extract the 124 open decisions into 4 categories per §6 of this audit:
- Blocking before v2 implementation (~15)
- Needed before launch (~30)
- Decide during design/build (~50)
- Defer until post-launch (~20)
- Drop (~10)

Then **delete the open-decisions sections from each individual doc** (replaced by the register).

---

## 11. What can wait until launch

- Final hero copy decision (test variants in Lane 2 preview before launch)
- Final monetization-state visual styling
- Final CTA hierarchy
- Curated state-page count (top 10 vs top 5 at launch)
- Audience-landing curated content depth
- Final search implementation (client-side at launch; full-text post-launch is fine)

---

## 12. What can wait until post-launch

- Phase D schema PRs (PR 21, 22, 23 of [V2_PR_BREAKDOWN.md](V2_PR_BREAKDOWN.md))
- Marketplace flows
- Institution claim flow productionization (existing `/poster/*` covers initial need)
- Recruiter / attorney directory
- Real send infrastructure
- AI-search citation graph optimization
- i18n
- Push notifications / SMS

---

## 13. Recommended next 3 PRs

After this audit doc lands:

### PR (a) — Decide PR #25 + PR #27 batch

User reviews the public-copy PRs side-by-side. If approved, merge both. If not, request revisions.

**Effort:** 30 minutes user time.

### PR (b) — Revisions to PR #30 (in-place commits on existing branch)

Apply §10 mandatory revisions. Produces:
- Updated INFORMATION_ARCHITECTURE.md, PAGE_TEMPLATE_INVENTORY.md, HOMEPAGE_V2_WIREFRAME.md, NAVIGATION_MODEL.md, DATA_FRESHNESS_SLA.md, INDEXATION_AND_URL_POLICY.md, TRUST_AND_MONETIZATION_POLICY.md, PLATFORM_V2_35_DAY_AGGRESSIVE_PLAN.md
- New EXISTING_SURFACE_INVENTORY.md (catalog of existing routes/schema/components)
- New V2_DECISION_REGISTER.md (124 decisions extracted + categorized)

After revisions, PR #30 still grows (~+1500 lines for inventory + register, with offsetting trims of duplicate per-doc decisions sections), but it becomes review-tractable.

**Effort:** 3-4 hours focused work (Claude); user review can then proceed at deliberate pace.

### PR (c) — Stale-trust-language metadata cleanup

After PR #25 + PR #27 merged, follow-up PR for:
- `src/app/page.tsx:16,94` (homepage title + OG description)
- `src/app/layout.tsx:21,25,35,44,50` (root layout metadata cascade)
- `src/app/observerships/specialty/[specialty]/page.tsx:39` (state/specialty meta descriptions)
- `src/app/observerships/[state]/page.tsx:37`

Removes "Verified" overclaim + "largest structured database" superlative. Brings root metadata in line with [PLATFORM_V2_STRATEGY.md §4.4](PLATFORM_V2_STRATEGY.md) trust language.

**Effort:** 1 hour (Claude); user review per Mode A batch.

---

## 14. Recommendation on whether to merge PR #30

**Do not merge PR #30 as-is.**

**Recommended path:**

1. Merge PR #25 + PR #27 (public copy cleanup) — ready for batch approval per §7.
2. Apply §10 revisions to PR #30 in-place (additive: 1 new doc + 1 new register + factual corrections to 8 existing docs).
3. Re-review the revised PR #30 with fresh eyes after revisions.
4. Once revised PR #30 is reviewed and merged, proceed with the §13 PR (c) follow-up + start V2_PR_BREAKDOWN PR 1 (design system tokens).

**If revisions feel like overhead:** the alternative is splitting PR #30 into 4-6 smaller PRs (one per doc cluster: IA+templates+wireframe+nav as one; freshness+SLA as one; messaging+monetization as one; PR-breakdown+QA-checklist+35-day-plan as one; existing-surface-inventory as one). But splitting fragments review of cross-cutting consistency.

**Single-PR revision is recommended.**

---

## 15. Exact edits to request on PR #30

For Claude (or whoever picks up the revision work):

```
Required additions:
[ ] Create docs/platform-v2/EXISTING_SURFACE_INVENTORY.md
[ ] Create docs/platform-v2/V2_DECISION_REGISTER.md

Required edits to existing docs:
[ ] INFORMATION_ARCHITECTURE.md §2.1 (add 26 missing routes), §5.5 (clarify visa-decision-helper alias), §5.6 (cost-calculator is live), §5.7 (acknowledge /residency/* overlap), §5.8 (add /poster/*)
[ ] PAGE_TEMPLATE_INVENTORY.md §3.3 (Fellowship live), §3.13 (audience-landing /residency overlap), §17 (job listing existing /career/jobs), §19 (institution profile existing /poster)
[ ] HOMEPAGE_V2_WIREFRAME.md §6.3 (cost-calculator exists), §11 (footer additions), §12 ("submit your application" semantics)
[ ] NAVIGATION_MODEL.md §7.2 (Fellowship not future)
[ ] DATA_FRESHNESS_SLA.md (new section: verify-jobs cron freshness)
[ ] INDEXATION_AND_URL_POLICY.md §12.4 (resolve Bytespider/PetalBot vs robots.txt), §8.4 (acknowledge already-implemented)
[ ] TRUST_AND_MONETIZATION_POLICY.md §12 (/disclosure vs /disclaimer naming)
[ ] PLATFORM_V2_35_DAY_AGGRESSIVE_PLAN.md (10-week binding default)

Required deletions:
[ ] Open-decisions sections from each per-doc (replaced by V2_DECISION_REGISTER.md)
```

After revisions, PR #30 net diff: +800 lines (2 new docs) + offsetting -300 lines (decision sections moved). Final ~6,950 lines but with 1 register doc to consult instead of 11 scattered sections.

---

## 16. Confirmation checks

- ✅ No source code changes in this audit
- ✅ No `/career` or `/careers` modifications
- ✅ No SEO implementation changes
- ✅ No schema / migration
- ✅ No new cron
- ✅ Stashes preserved (`stash@{0}`, `stash@{1}`)
- ✅ PR queue at 4 (will be 5 after this audit PR opens; under cap of 7)
- ✅ Docs-only

---

## 17. SEO impact

```
SEO impact:
- URLs changed:        none (audit doc only)
- redirects added:     none
- sitemap changed:     no
- robots changed:      no
- canonical changed:   no
- metadata changed:    no
- JSON-LD changed:     no
- pages noindexed:     none
- internal links:      none changed
- risk level:          ZERO — internal audit doc
```

## 18. /career impact

None.

## 19. Schema impact

None. Audit identifies schema overlaps with existing models; doesn't propose changes.

## 20. Authorization impact

None. This audit recommends revisions to PR #30 + the §13 next-3-PRs sequence; none of those revisions auto-execute. User approval required.
