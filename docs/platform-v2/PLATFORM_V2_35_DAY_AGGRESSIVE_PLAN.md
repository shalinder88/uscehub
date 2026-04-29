# USCEHub v2 — 35-Day Aggressive Build Plan

**Doc status:** Future idea (aspirational ceiling). **The 10-week realistic version in §12 is now the binding default.** **10 open decisions in [V2_DECISION_REGISTER.md](V2_DECISION_REGISTER.md).**

> **Revision notice (2026-04-29 audit):** Per [V2_PLANNING_AUDIT.md §3.8 / §9.3](V2_PLANNING_AUDIT.md): the 35-day plan is **unrealistic** given (a) PR #30 docs are 6,400+ lines requiring >2 days of user review, (b) cron capacity vs ≥80% Current+Aging threshold is months, (c) Phase 0 audit PRs (per [V2_PR_BREAKDOWN.md](V2_PR_BREAKDOWN.md)) add 7 audit cycles. **The 10-week realistic timeline in §12 is the binding default.** The 35-day plan remains as an aspirational ceiling — if all gates fall faster than expected, can compress; if not (the realistic case), the 10-week version governs. Distribution work explicitly does **not** start within 7 days post-launch — minimum 30-day post-launch soak.

**Status:** v2 planning doc. Aggressive timeline mapped to gates from [PLATFORM_V2_STRATEGY.md](PLATFORM_V2_STRATEGY.md). Honest about compression risk.
**Authority:** lower than [RULES.md](../codebase-audit/RULES.md), [SEO_PRESERVATION_RULES.md](../codebase-audit/SEO_PRESERVATION_RULES.md), [PLATFORM_V2_STRATEGY.md](PLATFORM_V2_STRATEGY.md).
**Authored:** 2026-04-29.

---

## 1. Honesty disclaimer

This is an aggressive plan. The phases are compressed for fast iteration. Two truths held simultaneously:

1. **Build aggressively in the background.** v2 documentation, IA, wireframes, design system, and prototype work can move fast in `redesign/platform-v2-*` branches without disturbing production.
2. **Do not rush the public launch.** The launch event is gated by [PLATFORM_V2_STRATEGY.md §17.3](PLATFORM_V2_STRATEGY.md) seven readiness conditions. Compressing the launch itself risks credibility hits that take months to recover.

If a phase here cannot be done at quality in the allotted time, the phase ends at the partial deliverable, the launch is deferred, and the timeline extends. **Quality > calendar.**

---

## 2. Principles

### 2.1 Fast background build

Lane 2 (`redesign/platform-v2`) can move fast because:
- 401-gated by Vercel preview SSO (no public exposure).
- Branch isolated from `main` (no production risk).
- Sub-branches per feature (parallelizable).
- Weekly Monday rebase per [PLATFORM_V2_STRATEGY.md §6](PLATFORM_V2_STRATEGY.md) prevents bit-rot.

### 2.2 No rushed public launch

Lane 1 (`main`) stays stable. The launch event is a single batch merge of v2 to main, gated by all 7 readiness conditions. If conditions don't pass on Day 24 (target launch), they pass on Day 31, or Day 45, or never if v2 isn't ready.

### 2.3 Production stability is non-negotiable

During the v2 build, production stability rules from [PLATFORM_V2_STRATEGY.md §5.1](PLATFORM_V2_STRATEGY.md) bind. Lane 1 only ships:
- Bug fixes
- Trust copy corrections
- Approved small homepage CTA additions (with explicit user authorization)
- Ops cleanup
- Cron checks / runbooks / audit docs
- Emergency data-integrity fixes

---

## 3. Phase 1 — next 48 hours (Days 1-2)

**Goal:** stabilize Phase 3 + finish public-copy queue + start v2 planning batch.

### 3.1 Tasks

- [x] Merge PR #29 (platform-v2 strategy doc) — done in this batch
- [ ] Review PR #25 + PR #27 (public copy) for batch approval
- [ ] User-batch-approve PR #25 + PR #27 (or hold)
- [x] Open one v2 planning PR with all v2 architecture docs (this batch)
- [ ] Cron health daily check (`scripts/check-verify-listings-cron.ts`)
- [ ] Use admin queue on current 4 NEEDS_MANUAL_REVIEW listings
- [ ] GSC property + sitemap submission (per [GSC_AND_MOBILE_QA_RUNBOOK.md](../codebase-audit/GSC_AND_MOBILE_QA_RUNBOOK.md))

### 3.2 What stays in scope

- v2 planning docs (this batch): IA, wireframe, nav, templates, indexation, messaging, monetization, freshness, this 35-day plan
- Optional: V2_PR_BREAKDOWN, V2_QA_CHECKLIST

### 3.3 What stays out of scope

- New top-nav items on `main`
- New routes under future-vertical paths on `main`
- Schema migrations
- Real email sends
- Third cron
- Public v2 launch announcement

### 3.4 Deliverables (end of Day 2)

- PR #29 on main (done)
- Planning batch PR open (this PR)
- PR #25 + PR #27 user-decision pending
- Cron health PASS state recorded
- GSC sitemap submitted (operator task)

---

## 4. Phase 2 — Days 3-7 (planning depth)

**Goal:** v2 planning batch reviewed by user; corrections applied; foundation set for sub-branch work.

### 4.1 Tasks

- [ ] User reviews v2 planning batch PR (this PR)
- [ ] User decisions on the open-decisions sections of each doc
- [ ] Apply corrections from user feedback
- [ ] Optional: V2_PR_BREAKDOWN.md (concrete PR sequence per vertical)
- [ ] Optional: V2_QA_CHECKLIST.md (pre-launch QA)
- [ ] Optional: DESIGN_SYSTEM.md (token / type / color decisions)
- [ ] Optional: CONTENT_MODEL.md (DB vs markdown decisions per template)

### 4.2 Reasonable timeline

User reads ~6,000 lines of new strategy docs over 2-3 days. Then 1-2 days of corrections + new docs. End of Day 7: planning batch is on `main` (after batch review approves), v2 implementation can start.

### 4.3 What gets cut if compression is too aggressive

- DESIGN_SYSTEM.md and CONTENT_MODEL.md can defer to Phase 3.
- V2_PR_BREAKDOWN can defer to Phase 3.
- Core required: IA + wireframe + nav + templates + indexation + messaging + monetization + freshness on main; that's enough to start v2 implementation.

---

## 5. Phase 3 — Days 8-14 (v2 visual prototype in branch only)

**Goal:** v2 design system + key page templates rendered in `redesign/platform-v2` branch. **Production unchanged.**

### 5.1 Branch creation

```bash
git -C /Users/shelly/usmle-platform checkout main
git -C /Users/shelly/usmle-platform pull --ff-only
git -C /Users/shelly/usmle-platform checkout -b redesign/platform-v2
git -C /Users/shelly/usmle-platform push -u origin redesign/platform-v2
```

This is the long-running v2 implementation branch. Per [PLATFORM_V2_STRATEGY.md §6](PLATFORM_V2_STRATEGY.md), weekly Monday rebase from main.

### 5.2 Tasks

- [ ] Design system tokens (typography, colors, spacing) — sub-branch `redesign/v2-feature-design-system`
- [ ] Homepage v2 shell per [HOMEPAGE_V2_WIREFRAME.md](HOMEPAGE_V2_WIREFRAME.md) — sub-branch
- [ ] Browse v2 shell (decision-engine layout) — sub-branch
- [ ] Listing detail v2 shell — sub-branch
- [ ] Tools hub wireframe (`/tools` landing) — sub-branch
- [ ] Mobile-first QA per [NAVIGATION_MODEL.md §15](NAVIGATION_MODEL.md)

### 5.3 What stays out

- New schema (per [PLATFORM_V2_STRATEGY.md §7](PLATFORM_V2_STRATEGY.md), schema requires explicit authorization)
- Real production deploys
- Sub-branch merges to main (sub-branches merge to `redesign/platform-v2` only)

### 5.4 Realistic compression check

5 sub-branches in 7 days = ~1.5 days each. Tight for design-system + 4 page shells. If any slips:

- Defer the lowest-priority shell (likely Tools hub) to Phase 4.
- Don't cut Mobile QA — mobile QA is non-negotiable per readiness gates.

---

## 6. Phase 4 — Days 15-21 (high-value workflows)

**Goal:** save / compare / alerts polish + checklist tool + admin QA improvements + freshness dashboard. Still in v2 branch.

### 6.1 Tasks

- [ ] Save / compare polish (cleaner UX, per [PAGE_TEMPLATE_INVENTORY.md §11](PAGE_TEMPLATE_INVENTORY.md))
- [ ] Alert / digest no-send preview (per [MESSAGING_AND_ALERTS_POLICY.md §12.1](MESSAGING_AND_ALERTS_POLICY.md))
- [ ] Checklist tool (`/tools/checklist`) — basic
- [ ] Admin QA improvements
- [ ] Source freshness dashboard (`/admin/freshness-dashboard` — internal only)
- [ ] Content templates (per [PAGE_TEMPLATE_INVENTORY.md §10](PAGE_TEMPLATE_INVENTORY.md))

### 6.2 Schema check

Most of the above can ship without schema changes. If checklist tool needs `Listing.checklistItems` or similar, that's a schema PR per [PLATFORM_V2_STRATEGY.md §7](PLATFORM_V2_STRATEGY.md) requiring explicit authorization. Don't push schema to `main` mid-v2-build casually.

### 6.3 Realistic check

Save / compare polish: 2 days. Alerts no-send preview: 1 day. Checklist: 2 days. Admin QA + freshness dashboard: 2 days. Tight, but feasible if each is tight in scope.

---

## 7. Phase 5 — Days 22-28 (launch prep + soft launch)

**Goal:** SEO/indexation review + mobile QA + release checklist + soft-launch one coherent v2 batch.

### 7.1 Pre-launch tasks

- [ ] SEO impl review (sitemap rebuild plan, redirects map, canonical updates)
- [ ] Mobile QA per [GSC_AND_MOBILE_QA_RUNBOOK.md](../codebase-audit/GSC_AND_MOBILE_QA_RUNBOOK.md) Part 2 (real iOS + Android devices)
- [ ] Production release checklist (LAUNCH_PLAN.md draft per [PLATFORM_V2_STRATEGY.md §19](PLATFORM_V2_STRATEGY.md))
- [ ] QA all major user paths
- [ ] All 7 readiness gates from [PLATFORM_V2_STRATEGY.md §17.3](PLATFORM_V2_STRATEGY.md) verified

### 7.2 Readiness gate verification

Per §17.3:

1. Trust system stable (cron clean ≥4 days)
2. No stale public claims
3. Code/site architecture clean
4. v2 platform shipped or framing rebrand shipped
5. Mobile QA done
6. GSC + sitemap submission completed
7. Data-quality story tellable in one paragraph

If gate 4 isn't met (v2 not shipped yet), this is the launch event. If launches earlier (Phase 4 wraps faster than expected), can launch sooner.

### 7.3 Launch event execution

When all gates green:

```bash
# Final pre-launch rebase
git -C /Users/shelly/usmle-platform checkout redesign/platform-v2
git -C /Users/shelly/usmle-platform rebase origin/main
git -C /Users/shelly/usmle-platform push --force-with-lease

# Open launch PR
gh pr create --base main --head redesign/platform-v2 \
  --title "v2 launch: physician career-pathway platform" \
  --body "...comprehensive launch PR body covering scope, gates passed, rollback runbook..."

# After user explicit "merge it" approval:
gh pr merge <num> --squash --delete-branch=false
```

Launch deploys ~60-90 seconds after merge per Vercel auto-deploy.

### 7.4 Immediate post-launch monitoring

First 24 hours after launch:
- Watch Vercel deployment logs for errors
- Watch production 5xx rate (target: 0)
- Verify all redirects resolve (script + manual spot check)
- Verify sitemap new URL set is correct
- Submit new sitemap to GSC
- Spot-check top 20 query targets in GSC

If anything fails: rollback per [PLATFORM_V2_STRATEGY.md §20.3](PLATFORM_V2_STRATEGY.md) — `git revert <launch-merge-sha> -m 1`.

### 7.5 Realistic check (THE BIG RISK)

Days 22-28 = 7 days for: SEO impl review + mobile QA + launch checklist + 7 readiness gate verification + launch execution + 24-hour soak. Compressed.

If gates aren't all green by Day 28: launch defers. **Do not force a launch through gates that aren't met.** This is the most dangerous phase to compress.

Realistic alternative: Days 22-35 = 14 days for everything in §7. Less aggressive but safer. If launching at Day 35, distribution shifts to Day 36+.

---

## 8. Phase 6 — Days 29-35 (distribution prep)

**Goal:** distribution begins — but only if v2 is launched and gates passed. Otherwise this phase shifts.

### 8.1 Distribution channels

Per [PLATFORM_V2_STRATEGY.md §17](PLATFORM_V2_STRATEGY.md):

- **GSC monitoring** (continued from §3.1).
- **Twitter/X** founder-led, per [PLATFORM_V2_STRATEGY.md §17.4](PLATFORM_V2_STRATEGY.md) tactical rules. Daily, per content-pillar plan.
- **WhatsApp / newsletter** with consent only — newsletter requires §13 prerequisites met.
- **Reddit** in r/IMG, r/USMLE, r/Residency per Master Blueprint §4 channel-specific positioning.
- **Institution outreach** — direct email to GME programs, hospitals (consent-based).
- **Community seeding** — IMG Discord servers, Slack groups.

### 8.2 SEO publishing

Once v2 is live, content publishing accelerates:

- Pathway guides per [PAGE_TEMPLATE_INVENTORY.md §10](PAGE_TEMPLATE_INVENTORY.md): `/match/strategy/img`, `/visa/conrad-30`, `/fellowship/visa-friendly`
- Curated state pages: `/usce/observerships/[state]` for top 10 states
- Audience landings: `/for-img`, `/for-us-students`, `/for-residents`, `/for-fellows`, `/for-attendings`
- Blog content per editorial calendar (deferred — Phase 5)

Each new page must pass [PLATFORM_V2_STRATEGY.md §9](PLATFORM_V2_STRATEGY.md) quality gate. No template-only mass publishing.

### 8.3 Twitter / X tactical

Daily founder-led posts in line with §17.4:
- New pathway guide announcements
- New tool launches
- Tactical IMG / visa / match insights with primary citation
- "What we're verifying this week" (process transparency = trust signal)

Avoid:
- IMG-vs-AMG debates (per Master Blueprint §5)
- Hot takes on residency hiring policy
- Sponsored placements masquerading as organic

### 8.4 Newsletter (gated)

If [MESSAGING_AND_ALERTS_POLICY.md](MESSAGING_AND_ALERTS_POLICY.md) prerequisites are met by Day 35: launch first verified-listings digest.

If NOT met by Day 35: keep digest preview-only; defer real send.

### 8.5 No paid ads yet

Per [PLATFORM_V2_STRATEGY.md §17.2](PLATFORM_V2_STRATEGY.md): no paid acquisition until conversion + email + analytics + landing pages all proven.

Earliest paid ad consideration: Day 50+ (week 7-8).

---

## 9. Paid ads (Days 50+)

**Goal:** small-budget paid testing only after all conversion + trust + analytics infrastructure proven.

### 9.1 Conditions before paid ads

Per [PLATFORM_V2_STRATEGY.md §17.2](PLATFORM_V2_STRATEGY.md), reaffirmed:
1. Homepage explains value instantly (verified by user testing).
2. Save / compare / alerts exist + actually work.
3. Email capture compliant per [MESSAGING_AND_ALERTS_POLICY.md](MESSAGING_AND_ALERTS_POLICY.md).
4. Top landing pages convert (measurable conversion: e.g. listing-saved per visit).
5. Trust claims clean (no overclaims, no stale data).
6. Analytics events reliable (Vercel Analytics or equivalent firing correctly).

### 9.2 Earliest paid ad campaign

Week 7-8 (Days 50-60): small-budget retargeting OR exact-intent search-only.

Examples:
- Google Ads exact-match for "j1 waiver job [state]" → `/visa/conrad-30/[state]`
- Google Ads exact-match for "uscehub" (brand search defense)
- Reddit Promoted Post (single test, low budget) in r/IMG to a specific value-leading guide

NOT:
- Display retargeting (per [TRUST_AND_MONETIZATION_POLICY.md §13](TRUST_AND_MONETIZATION_POLICY.md), no third-party retargeting pixels)
- Generic broad-match search ("medical school" — wasted spend)
- Facebook/Instagram retargeting (privacy + audience misalignment)

### 9.3 Budget cap

First test: $500 over 14 days. If conversion data is meaningful, scale to $2000/month. If not, pause and revisit.

---

## 10. Gates summary

Cross-cutting gates at every phase:

| Gate | Where it applies |
|---|---|
| Cron health PASS | Continuous (daily check) |
| No stale public claims | Continuous |
| /career untouched | Continuous |
| SEO impl untouched | Continuous (until launch event) |
| No third cron | Continuous |
| No real email until §13.5 prerequisites | Continuous |
| No public v2 routes on main | Until launch event |
| No schema migration without authorization | Continuous |
| §17.3 readiness gates | Before launch event (Phase 5) |
| All 6 monetization conditions | Before paid ads (Phase 7) |

---

## 11. What this plan IS NOT

### 11.1 Not a commitment to ship in 35 days

If Phase 5 (Days 22-28) gates aren't green, launch defers. The 35-day plan is aspirational; the readiness gates are mandatory.

### 11.2 Not a license to skip docs

Each Phase 1-2 deliverable depends on prior planning docs. Don't start Phase 3 (v2 prototype) without IA + wireframe + nav + templates approved.

### 11.3 Not a promise of all 8 verticals at launch

Per [INFORMATION_ARCHITECTURE.md §7.2](INFORMATION_ARCHITECTURE.md), v2 launch = USCE redesigned + Match (skeletal+1 guide) + Fellowship (skeletal+visa-friendly) + Jobs (skeletal) + Visa (landing+J1+H1B+Conrad+helper) + Tools (landing+3 tools) + Resources (migrated) + Institutions (landing+claim).

Not 8 fully-fleshed verticals. Honest empty states for Jobs and Match-depth.

### 11.4 Not a guarantee of organic traffic

Distribution starts Day 29+ but organic traffic is not guaranteed. Expect 30-90 days of slow growth as Google re-indexes, AI search starts citing, and content earns authority. Patience is part of the plan.

---

## 12. Aggressive vs realistic comparison

| Phase | Aggressive (35-day) | Realistic (10-week) |
|---|---|---|
| Phase 1: stabilize + plan | Days 1-2 | Days 1-2 |
| Phase 2: planning depth | Days 3-7 | Days 3-14 (2 weeks for user review + corrections + optional docs) |
| Phase 3: v2 prototype | Days 8-14 | Days 15-28 |
| Phase 4: workflows | Days 15-21 | Days 29-42 |
| Phase 5: launch prep + soft launch | Days 22-28 | Days 43-56 |
| Phase 6: distribution prep | Days 29-35 | Days 57-70 |

The aggressive plan compresses each phase ~3×. The realistic plan respects that:
- User review of planning docs takes longer than 2 days at quality.
- Design system + 5 page shells takes longer than 7 days at quality.
- Mobile QA + launch readiness verification takes more than 7 days at quality.

**Recommendation: aim for aggressive, accept realistic. If aggressive timeline slips at any phase, the realistic timeline is the fallback.**

---

## 13. Per-phase deliverables (binding)

### 13.1 Phase 1 (Days 1-2)

- [x] PR #29 merged (this batch — done)
- [x] v2 planning batch PR open (this batch — in progress)
- [ ] PR #25 + #27 user-decision recorded
- [ ] Cron health check PASS state recorded

### 13.2 Phase 2 (Days 3-7 aggressive / Days 3-14 realistic)

- [ ] User reviews v2 planning batch PR
- [ ] Open-decisions resolved per doc
- [ ] Planning batch PR merged to main
- [ ] Optional: V2_PR_BREAKDOWN.md, V2_QA_CHECKLIST.md, DESIGN_SYSTEM.md, CONTENT_MODEL.md

### 13.3 Phase 3 (Days 8-14 / 15-28)

- [ ] `redesign/platform-v2` branch created
- [ ] Design system tokens defined
- [ ] Homepage v2 shell rendered (preview-only)
- [ ] Browse v2 shell rendered
- [ ] Listing detail v2 shell rendered
- [ ] Tools hub wireframe rendered
- [ ] Mobile-first responsive QA passing

### 13.4 Phase 4 (Days 15-21 / 29-42)

- [ ] Save / compare polish complete
- [ ] Alerts no-send preview redesigned
- [ ] Checklist tool basic implementation
- [ ] Admin QA improvements
- [ ] Freshness dashboard (`/admin`)

### 13.5 Phase 5 (Days 22-28 / 43-56)

- [ ] All 7 readiness gates green
- [ ] LAUNCH_PLAN.md complete
- [ ] Mobile QA per real iOS + Android
- [ ] Sitemap migration plan ready
- [ ] Redirect map complete
- [ ] Launch executed (if gates green)
- [ ] 24-hour post-launch monitoring complete

### 13.6 Phase 6 (Days 29-35 / 57-70)

- [ ] First pathway guide published (`/match/strategy/img` recommended)
- [ ] First curated state page graduated to sitemap
- [ ] Twitter / X cadence established (≥ 3 posts / week)
- [ ] Reddit value posts (≥ 1 / week, per Master Blueprint §4 rules)
- [ ] First newsletter sent (if §13.5 prerequisites met)
- [ ] Institution outreach started (5+ contacts)

---

## 14. Open decisions

1. **Aggressive vs realistic timeline.** Recommend: aim for aggressive; accept realistic.
2. **First v2 launch verticals.** USCE redesign + 4-5 honest others, or full 8 verticals (skeletal as needed)? Recommend: full 8 with honest empty states for Jobs / Match-depth.
3. **Whether to include audience landings at launch.** All 6 vs 3 (recommended) vs 2 (minimum)? Recommend: launch with `/for-img`, `/for-us-students`, `/for-residents`; add others post-launch.
4. **Newsletter launch alongside v2 launch.** Tempting but adds risk. Recommend: defer newsletter to Day 35+ (post-launch monitoring period); keep no-send preview until then.
5. **Twitter / X founder-led account.** Already-existing or new? Recommend: existing if already vetted; otherwise new founder account named for the founder, with USCEHub @ in bio.
6. **Reddit posting frequency.** 1 / week (recommended) vs 2-3 / week (more aggressive). Recommend: 1 / week to stay above spam-flag threshold.
7. **Institution outreach approach.** Cold email vs warm intro vs paid recruiter outreach. Recommend: cold email to 25 institutions in Phase 6; track response rate.
8. **Days 25-35 = distribution. Or extend planning before distribution?** Recommend: don't extend if launch passed; do extend if launch slipped.
9. **Whether to publish a public change log at v2 launch.** `/resources/change-log` with launch entry. Recommend: yes — adds transparency, AI-search-friendly.
10. **Whether to issue press / launch announcement.** Press release vs Twitter-only vs blog post + Twitter. Recommend: blog post (`/resources/blog/usce-hub-v2-launch`) + Twitter thread + Reddit post. No press release (waste of effort at our scale).

---

## 15. Stop conditions

Stop the plan and reassess if:

- Cron health FAIL (per [PLATFORM_V2_STRATEGY.md §5.3](PLATFORM_V2_STRATEGY.md))
- Production 5xx rate > 1% sustained
- Search Console drops > 20% indexed pages within 7 days of any deploy
- User-reported broken links surge > 3x baseline
- Open PR queue reaches 7 (per [BATCH_RELEASE_CHECKLIST.md](../codebase-audit/BATCH_RELEASE_CHECKLIST.md))
- Schema or destructive operation suggested without authorization
- Public-facing PR mistakenly merged without review

---

## 16. SEO impact (this doc)

```
SEO impact:
- URLs changed:        none (planning doc only)
- redirects added:     none
- sitemap changed:     no
- robots changed:      no
- canonical changed:   no
- metadata changed:    no
- JSON-LD changed:     no
- pages noindexed:     none
- internal links:      none changed
- risk level:          ZERO — internal timeline planning doc
```

## /career impact

None.

## Schema impact

None.

## Authorization impact

None. Planning a 35-day timeline is not authorization to ship the timeline. Each phase requires its own approvals per gates.
