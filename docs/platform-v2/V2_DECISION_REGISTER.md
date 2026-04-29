# USCEHub v2 — Decision Register

**Doc status:** Binding decision tracker. Replaces per-doc "Open decisions" sections.
**Authority:** lower than [RULES.md](../codebase-audit/RULES.md), [SEO_PRESERVATION_RULES.md](../codebase-audit/SEO_PRESERVATION_RULES.md), [PLATFORM_V2_STRATEGY.md](PLATFORM_V2_STRATEGY.md).
**Authored:** 2026-04-29 (per [V2_PLANNING_AUDIT.md §10.10](V2_PLANNING_AUDIT.md)).

---

## 1. Why this register exists

PR #30's 11 docs surfaced **124 open decisions** scattered across per-doc "Open decisions" sections. The audit ([V2_PLANNING_AUDIT.md §3.7, §6](V2_PLANNING_AUDIT.md)) found this unfocused — critical decisions buried alongside cosmetic ones, no urgency tagging, ~5 hours of unstructured user review.

This register **consolidates the decisions that matter** into 4 categories ordered by urgency. The original per-doc sections remain intentionally trimmed in their source docs, with cross-references back here.

The register intentionally **drops** the ~10 decisions classified as overthought (§5).

---

## 2. Categories

| Category | Count | Resolution timing |
|---|---|---|
| **A. Blocking before v2 implementation** | 8 | Resolve before opening first sub-branch off `redesign/platform-v2` |
| **B. Needed before launch event** | 16 | Resolve before launch PR (#31 in [V2_PR_BREAKDOWN.md](V2_PR_BREAKDOWN.md)) |
| **C. Decide during build** | 18 | Default + revisit per-PR |
| **D. Defer until post-launch** | 12 | Re-open after v2 has 30+ days production |
| **E. Drop / overthought** | 10 | Removed; documented for traceability |

Total surfaced: 64. Trimmed from 124 in original docs by deduplicating overlap, dropping cosmetics, and merging closely-related decisions.

---

## 3. Category A — Blocking before v2 implementation

These must be resolved before the first `redesign/platform-v2` sub-branch opens. They affect IA, schema, ranking, and migration plans across the whole v2 surface.

### A1. `/residency/*` namespace fate

**Source:** [INFORMATION_ARCHITECTURE.md §3.3](INFORMATION_ARCHITECTURE.md), [EXISTING_SURFACE_INVENTORY.md §2.3](EXISTING_SURFACE_INVENTORY.md).

**Question:** What happens to `/residency/*` (12 live routes including `/residency/fellowship` fellowship database) when v2 introduces `/match/*` + `/fellowship/*`?

**Options:**
- (a) Keep `/residency/*` as canonical resident-side surface; surface in v2 nav as "Residency"; defer `/match`/`/fellowship` URLs to post-launch.
- (b) 301 `/residency/*` → `/match/*` + `/fellowship/*` at launch with sitemap rebuild.
- (c) Keep both URL trees with cross-canonical link rels.

**Recommendation:** (a) — keep `/residency/*` canonical for v2 launch. The Residency Command Center is built; rebuilding it as `/match/*` is unnecessary churn. v2 nav can include both "Match" (links to `/match` curated landing for IMG strategy) and "Residency" (links to `/residency`). Or fold under one name.

**Owner:** user.
**Risk if unresolved:** v2 IA cannot finalize; can't generate sitemap; can't 301 plan.

### A2. `/poster/*` vs proposed `/institutions/claim` flow

**Source:** [TRUST_AND_MONETIZATION_POLICY.md §6.3-6.5](TRUST_AND_MONETIZATION_POLICY.md), [EXISTING_SURFACE_INVENTORY.md §2.2](EXISTING_SURFACE_INVENTORY.md).

**Question:** The existing `/poster/*` flow + `PosterProfile` Prisma model already serves the "free claim" use case. Does v2 (a) extend `/poster/*`, or (b) replace with new `/institutions/claim` flow + new `InstitutionClaim` model?

**Recommendation:** (a) extend. Reuses existing data + existing role check. Renaming `/poster/*` → `/institutions/dashboard/*` is a 301 + label change, not a rebuild.

**Owner:** user.
**Risk if unresolved:** Phase D PR 23 (`InstitutionClaim` model) potentially duplicates `PosterProfile`.

### A3. `Application` model — real or aspirational?

**Source:** [HOMEPAGE_V2_WIREFRAME.md §12](HOMEPAGE_V2_WIREFRAME.md), [EXISTING_SURFACE_INVENTORY.md §4.3](EXISTING_SURFACE_INVENTORY.md).

**Question:** `Application` Prisma model + `/api/applications` + `/dashboard/applications` exist. Does the application-tracking flow actually work end-to-end (user submits, institution sees, status updates)?

**Action needed:** **Audit** the existing flow before making any homepage-copy decision. If real-functional → keep "track your applications" claim. If aspirational → soften copy + decide whether to finish or remove.

**Owner:** Claude (audit) → user (decision).
**Risk if unresolved:** homepage may overclaim a non-functional feature.

### A4. URL canonical / alias decision: 301 vs keep-both

**Source:** [INFORMATION_ARCHITECTURE.md §13 #1-#3, #11](INFORMATION_ARCHITECTURE.md), [INDEXATION_AND_URL_POLICY.md §9.2](INDEXATION_AND_URL_POLICY.md).

**Question:** For migrated content (`/blog`, `/observerships/*`, `/listing/[id]`, `/recommend`, `/compare`, `/methodology`, `/img-resources`, `/faq`, `/for-institutions`), do we 301 to new URLs or keep both with cross-canonical?

**Recommendation:** 301 for all migrated user-facing URLs (clean canonical, GSC re-crawl-friendly, single source of truth for SEO). **Keep `/career/*`, `/careers`, `/residency/*` (per A1) unchanged** — those are protected.

**Owner:** user.
**Risk if unresolved:** redirect map can't be drafted; sitemap rebuild plan can't be drafted; LAUNCH_PLAN.md (deferred) can't be drafted.

### A5. AI crawler policy

**Source:** [INDEXATION_AND_URL_POLICY.md §12.4](INDEXATION_AND_URL_POLICY.md), [EXISTING_SURFACE_INVENTORY.md §5.2](EXISTING_SURFACE_INVENTORY.md).

**Question:** `public/robots.txt` blocks Bytespider (TikTok/ByteDance) and PetalBot (Huawei). v2 doc proposed "allow all AI crawlers." Reconcile.

**Options:**
- (a) Keep current anti-Bytespider/PetalBot blocks; allow GPTBot/ClaudeBot/PerplexityBot explicitly. Mixed allowlist.
- (b) Allow all AI crawlers (remove Bytespider + PetalBot blocks). Maximum AI-search discoverability.
- (c) Block all AI crawlers (add GPTBot/ClaudeBot/etc. to disallow list). Anti-AI posture.

**Recommendation:** (a) — keep existing blocks (these are aggressive scrapers, not AI search) + explicitly allow western AI crawlers. Best of both: AI-search friendly without inviting scraping.

**Owner:** user.
**Risk if unresolved:** v2 docs continue to contradict robots.txt; agents make incorrect assumptions about citation discoverability.

### A6. v2 launch scope: which verticals at launch?

**Source:** [INFORMATION_ARCHITECTURE.md §7.2](INFORMATION_ARCHITECTURE.md).

**Question:** v2 launch ships how many of the 8 verticals as "real" vs "skeletal Coming Soon"?

**Current proposal:** USCE redesigned + Match (skeletal+1 guide) + Fellowship (skeletal+1 page) + Jobs (skeletal) + Visa (landing+J1+H1B+Conrad+helper) + Tools (landing+3 tools) + Resources (migrated) + Institutions (landing+claim).

**Tension with A1:** if `/residency/*` stays canonical, "Match" and "Fellowship" verticals overlap. Possible reduction:
- **Minimum viable v2 launch:** USCE redesigned + Tools (compare/recommend/saved/cost-calc) redesigned + Resources migrated + Institutions landing. 4 verticals fully usable.
- **Maximum aggressive:** all 8 verticals with honest empty states.

**Recommendation:** minimum viable. Defer Match/Fellowship/Jobs/Visa to post-launch when deeper content exists.

**Owner:** user.
**Risk if unresolved:** scope creep; launch defers.

### A7. First monetization mode

**Source:** [TRUST_AND_MONETIZATION_POLICY.md §13.3](TRUST_AND_MONETIZATION_POLICY.md), [V2_DECISION_REGISTER.md A2](#a2-poster--vs-proposed-institutionsclaim-flow).

**Question:** Which monetization mode launches first?

**Recommendation:** **Free claim flow** (extend `/poster/*` per A2). No $ exchange; surfaces operational complexity safely. Paid claim + sponsored listings + affiliate links all defer.

**Owner:** user.
**Risk if unresolved:** if launch ships with paid surfaces, FTC compliance + dispute handling needed before launch.

### A8. Disclaimer / Disclosure naming

**Source:** [TRUST_AND_MONETIZATION_POLICY.md §12](TRUST_AND_MONETIZATION_POLICY.md), [EXISTING_SURFACE_INVENTORY.md §6](EXISTING_SURFACE_INVENTORY.md).

**Question:** `/disclaimer` exists (general legal). v2 proposed `/disclosure` (monetization-state surface). Two pages or one?

**Recommendation:** Keep both as distinct pages. `/disclaimer` = general legal; `/disclosure` = monetization-state surface. Both indexable, both linked from footer + per-page disclosure banners.

**Owner:** user.
**Risk if unresolved:** users confused about where disclosure lives; FTC compliance ambiguous.

---

## 4. Category B — Needed before launch event

These can decide during v2 build but must lock before the launch PR opens.

### B1. Audience-landing count at launch

**Source:** [INFORMATION_ARCHITECTURE.md §13 #4](INFORMATION_ARCHITECTURE.md).

**Options:** 6 (all audiences) / 5 / 3 (img, us-students, residents) / 2 / 0 (defer entirely).

**Recommendation:** 3 at launch (img, us-students, residents); add fellows/attendings/new-attendings post-launch.

### B2. Hero framing

**Source:** [HOMEPAGE_V2_WIREFRAME.md §3](HOMEPAGE_V2_WIREFRAME.md).

**Options:** A pipeline-platform / B trust-engine-first / C wedge-first.

**Recommendation:** A pipeline-platform (Master Blueprint §0 anti-narrowing rule).

### B3. Primary CTA count

**Source:** [HOMEPAGE_V2_WIREFRAME.md §4.2](HOMEPAGE_V2_WIREFRAME.md).

**Options:** 3 / 4 / 5.

**Recommendation:** 4 — Find USCE / Plan Match (or Browse Programs if A1 = a) / Find Visa-Friendly Jobs / Build Checklist.

### B4. Postal address (CAN-SPAM)

**Source:** [MESSAGING_AND_ALERTS_POLICY.md §11](MESSAGING_AND_ALERTS_POLICY.md).

**Recommendation:** PO box (privacy + valid CAN-SPAM physical address). Cost ~$200/yr.

**Risk:** blocks any real email send.

### B5. Sender DNS (SPF/DKIM/DMARC)

**Source:** [MESSAGING_AND_ALERTS_POLICY.md §8](MESSAGING_AND_ALERTS_POLICY.md).

**Action:** configure on Vercel-controlled DNS for `uscehub.com`. Resend provides DKIM key; SPF + DMARC start `p=none` then upgrade.

**Risk:** blocks any real email send.

### B6. Tier age boundaries

**Source:** [DATA_FRESHNESS_SLA.md §2.1](DATA_FRESHNESS_SLA.md).

**Recommendation:** 90/180/365 (current proposal — quarterly + annual cycle).

### B7. `/about/methodology` vs `/methodology`

**Source:** [EXISTING_SURFACE_INVENTORY.md §6](EXISTING_SURFACE_INVENTORY.md).

**Recommendation:** 301 `/about/methodology` → `/methodology` (consolidate; user-side methodology lives at top level).

### B8. `/contact-admin` vs `/contact`

**Source:** [EXISTING_SURFACE_INVENTORY.md §6](EXISTING_SURFACE_INVENTORY.md).

**Recommendation:** Keep `/contact` as user-facing; rename `/contact-admin` → `/admin/contact-tickets` (internal admin surface).

### B9. Sitemap quality-gate audit

**Source:** [V2_PLANNING_AUDIT.md §8](V2_PLANNING_AUDIT.md).

**Question:** Apply [PLATFORM_V2_STRATEGY.md §9](PLATFORM_V2_STRATEGY.md) quality gate retroactively to all ~50 state + N specialty + 50 waiver-state pages?

**Recommendation:** grandfather existing entries at v2 launch; apply §9 to new entries only. Audit grandfathered entries quarterly post-launch.

### B10. Stale "verified" / "largest" claims metadata cleanup

**Source:** [V2_PLANNING_AUDIT.md §7.3](V2_PLANNING_AUDIT.md).

**Action:** open follow-up PR (`phase3/10-trust-metadata-cleanup`) updating:
- `src/app/page.tsx:16,94`
- `src/app/layout.tsx:21,25,35,44,50`
- `src/app/observerships/specialty/[specialty]/page.tsx:39`
- `src/app/observerships/[state]/page.tsx:37`

Removes "Verified" overclaim + "largest structured database" superlative.

**Recommendation:** open this PR after PR #30 revision merges + before launch.

### B11. Mobile QA execution

**Source:** [GSC_AND_MOBILE_QA_RUNBOOK.md](../codebase-audit/GSC_AND_MOBILE_QA_RUNBOOK.md) Part 2.

**Action:** real iOS + real Android device QA before launch.

**Risk:** [PLATFORM_V2_STRATEGY.md §17.3](PLATFORM_V2_STRATEGY.md) gate #5; blocks launch.

### B12. GSC property + sitemap submission

**Source:** [GSC_AND_MOBILE_QA_RUNBOOK.md](../codebase-audit/GSC_AND_MOBILE_QA_RUNBOOK.md) Part 1.

**Action:** add `uscehub.com` Domain property in Search Console, submit sitemap.

**Risk:** [PLATFORM_V2_STRATEGY.md §17.3](PLATFORM_V2_STRATEGY.md) gate #6; blocks launch.

### B13. Vercel duplicate project resolution

**Source:** [VERCEL_PROJECT_AUDIT.md](../codebase-audit/VERCEL_PROJECT_AUDIT.md).

**Action:** decide pause/delete `usmle-platform` duplicate; relink local `.vercel/project.json` to production `uscehub`.

**Risk:** double preview compute; harmless but wasteful.

### B14. Cron health threshold for "verified" public claim

**Source:** [DATA_FRESHNESS_SLA.md §6.1](DATA_FRESHNESS_SLA.md).

**Question:** ≥80% Current+Aging required to use word "verified" publicly. Currently ~7%.

**Action:** wait for cron to process legacy backfill (12+ days minimum at 25/day cron capacity; realistically months for true freshness sustained).

**Recommendation:** keep PR #25 conservative-language baseline; do not introduce "verified" public claim until threshold met.

### B15. Verify-jobs cron freshness story

**Source:** [V2_PLANNING_AUDIT.md §3.2](V2_PLANNING_AUDIT.md), [DATA_FRESHNESS_SLA.md](DATA_FRESHNESS_SLA.md) (gap).

**Action:** add a "Verify-jobs cron + WAIVER_JOBS freshness" section to `DATA_FRESHNESS_SLA.md` mirroring listings tier scheme.

**Recommendation:** done in this PR #30 revision (Phase C.7 of revision).

### B16. Auth flow QA

**Source:** [V2_QA_CHECKLIST.md §12.6](V2_QA_CHECKLIST.md).

**Action:** before launch, exercise signin/signup/reset/oauth on the full v2 surface.

---

## 5. Category C — Decide during build (defer)

These can use defaults; the v2 implementation will surface real questions when actually building.

| # | Topic | Default |
|---|---|---|
| C1 | Drop-down sub-menus in nav | none at launch; reconsider Phase C |
| C2 | Mobile bottom-bar | none at launch |
| C3 | Search overlay vs inline bar | overlay (icon click) |
| C4 | Sticky nav blur | `backdrop-filter: blur(8px)` with Safari fallback |
| C5 | Mobile logo (wordmark vs icon) | wordmark; icon at narrow widths |
| C6 | Account icon (always vs logged-in only) | "Sign in" when out, avatar when in |
| C7 | Footer column count tablet | 3 / 4 columns |
| C8 | Compare URL state (path vs query) | query param |
| C9 | JSON-LD generator (hand vs library) | hand-write simple, schema-dts for complex |
| C10 | Image strategy on listing detail | text-only; selective imagery post-launch |
| C11 | Featured image on blog | optional; never stock photo |
| C12 | Tool methodology depth | full transparency |
| C13 | Trust block card count | 4 cards |
| C14 | Sponsored slot positions | 3, 8, 13 within result list |
| C15 | Sponsored badge color | amber (matches disclosure banner) |
| C16 | Confirmation token TTL | 7 days |
| C17 | Welcome series after signup | single welcome email |
| C18 | Tier dashboard (`/admin/freshness-dashboard`) | defer to Phase C+ |

---

## 6. Category D — Defer until post-launch

| # | Topic | Reason for deferral |
|---|---|---|
| D1 | Phase D schema PRs (audience tags, source-tier, monetization disclosure beyond minimum) | Schema serialization risk |
| D2 | Recruiter directory | Phase C+ per Master Blueprint |
| D3 | Attorney directory | Phase C+ per Master Blueprint |
| D4 | Contract-review directory | Phase D |
| D5 | Financial professional directory | Phase D |
| D6 | Marketplace flows | Phase D |
| D7 | Push notifications | Phase D+ |
| D8 | SMS | Phase D+ TCPA-compliant flow needed |
| D9 | i18n / Spanish content | Phase D+ |
| D10 | A/B testing email subject lines | requires ≥1000 subscribers per category |
| D11 | First-touch attribution capture | privacy cost not justified |
| D12 | Subscription paywall / tiered membership | violates §15 buyer/user separation |

---

## 7. Category E — Drop / overthought

| # | Topic | Why dropped |
|---|---|---|
| E1 | Tile color decisions | premature; design system PR will surface |
| E2 | Animation on hero | consensus is "none"; not a decision |
| E3 | Per-listing reverify cadence override | premature optimization at current scale |
| E4 | Snapshot-based audit log | schema cost not justified |
| E5 | Sitemap size split threshold | not needed below 25K URLs (well below) |
| E6 | `Organization` `sameAs` social links | operational detail, not decision |
| E7 | Internal PR numbering vs GitHub PR numbers | process noise |
| E8 | Search bar inline vs icon-with-overlay | covered by C3 |
| E9 | Skip-link target | obvious — `<main id="main">` |
| E10 | Refund policy specifics | premature before first paid customer |

---

## 8. How to update this register

This register is the single source of truth for v2 open decisions. Update when:

1. A user decision resolves an open item → mark RESOLVED with date + resolution note; remove from active list.
2. A new decision surfaces during build → add under the appropriate category.
3. A decision is dropped → move to category E with rationale.

**Do not** re-add per-doc "Open decisions" sections to source docs. Cross-reference here.

---

## SEO impact

```
SEO impact:
- URLs changed:        none (register doc only)
- redirects added:     none
- sitemap changed:     no
- robots changed:      no
- canonical changed:   no
- metadata changed:    no
- JSON-LD changed:     no
- pages noindexed:     none
- internal links:      none changed
- risk level:          ZERO — internal decision register
```

## /career impact

None.

## Schema impact

None.

## Authorization impact

None. Each decision marked "blocking" still requires explicit user resolution before downstream work.
