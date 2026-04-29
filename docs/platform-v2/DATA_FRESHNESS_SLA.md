# USCEHub v2 — Data Freshness SLA

**Doc status:** Draft recommendation. **13 open decisions extracted to [V2_DECISION_REGISTER.md](V2_DECISION_REGISTER.md).**

> **Revision notice (2026-04-29 audit):** This doc originally addressed the `verify-listings` cron only. Per [V2_PLANNING_AUDIT.md §3.2](V2_PLANNING_AUDIT.md), the site runs **two crons** — `verify-jobs` also exists for `WAIVER_JOBS` source-URL freshness. New §17 below addresses verify-jobs. Also: per cron health, only **~20 of 304 APPROVED listings have `lastVerifiedAt` set** today (Current+Aging tier ratio ~7%); the §6.1 ≥80% threshold for "verified programs" public claim is **months from passing**. PR #25 + PR #27 (merged 2026-04-29) keep the conservative-language baseline — see [V2_DECISION_REGISTER.md B14](V2_DECISION_REGISTER.md).

**Status:** v2 planning doc. Operationalizes [PLATFORM_V2_STRATEGY.md §11](PLATFORM_V2_STRATEGY.md) into per-tier admin queue prioritization, automated downgrade rules, public-claim alignment script, and metrics.
**Authority:** lower than [RULES.md](../codebase-audit/RULES.md), [SEO_PRESERVATION_RULES.md](../codebase-audit/SEO_PRESERVATION_RULES.md), [PLATFORM_V2_STRATEGY.md](PLATFORM_V2_STRATEGY.md).
**Authored:** 2026-04-29.

---

## 1. Purpose

A directory's credibility decays with stale data faster than any other failure mode. v2 must commit to a measurable freshness SLA per listing.

This doc binds:

- Freshness tiers (Current / Aging / Stale / Reverify-required / Legacy)
- Display state per tier
- Operator action per tier
- Automated downgrade rules
- Public claim alignment with freshness
- Cron + admin queue relationship to freshness
- Metrics

### 1.1 Anchoring principles

1. **A label like "Verified" must remain accurate.** If the verification is 14 months old, calling it "Verified" today is lying by omission.
2. **Public claims align with reality.** "207 verified programs" is allowed only when ≥ 80% of listings are in Current or Aging tier.
3. **Freshness is operational, not aspirational.** Concrete tier rules, concrete operator actions, automated enforcement.

---

## 2. Freshness tiers

Each program listing has a `lastVerifiedAt` timestamp from cron + admin verification. Tiers map age → display state → operator action.

### 2.1 Tier definitions

| Tier | Age of `lastVerifiedAt` | Description |
|---|---|---|
| **Current** | ≤ 90 days | Recently verified; trust contract fully held |
| **Aging** | 91 – 180 days | Verified but due for revalidation; cron should re-touch |
| **Stale** | 181 – 365 days | Verification > 6 months old; admin attention warranted |
| **Reverify-required** | > 365 days | Verification > 1 year; trust contract no longer held; downgrade required |
| **Legacy backfill** | `null` | Never verified by current verification engine; legacy `linkVerified=true` cohort |

### 2.2 Tier per `LinkVerificationStatus`

The freshness tier modifies but does not replace the underlying `LinkVerificationStatus` per [PLATFORM_V2_STRATEGY.md §4.4](PLATFORM_V2_STRATEGY.md):

| `LinkVerificationStatus` | `lastVerifiedAt` | Tier | Public display |
|---|---|---|---|
| `VERIFIED` | within 90 days | Current | "Verified — link checked {N} days ago" |
| `VERIFIED` | 91–180 days | Aging | "Verified — link checked {N} months ago" |
| `VERIFIED` | 181–365 days | Stale | "Verified — link checked {N} months ago, due for reverify" |
| `VERIFIED` | > 365 days | Reverify-required | downgrade to "Official source on file" (drop green badge); show "Reverification due" amber soft notice |
| `VERIFIED` | null | Legacy backfill | "Official source on file" |
| `REVERIFYING` | any | (in cron's hands) | "Reverifying — last successful check {N} days ago" |
| `NEEDS_MANUAL_REVIEW` | any | (in admin's hands) | "Needs review — link returning errors" |
| `SOURCE_DEAD` | any | (admin-only) | "Source no longer responds" |
| `PROGRAM_CLOSED` | any | (admin-only) | "Program closed (admin-confirmed)" |
| `NO_OFFICIAL_SOURCE` | any | (admin-only) | "No official source available" |
| `UNKNOWN` | (typically null) | — | "Unverified — official source not yet confirmed" |

### 2.3 Tier computation

The freshness tier is computed at render time. No batch job, no extra column.

```ts
function freshnessTier(lastVerifiedAt: Date | null): FreshnessTier {
  if (!lastVerifiedAt) return "legacy-backfill";
  const ageDays = (Date.now() - lastVerifiedAt.getTime()) / (1000 * 60 * 60 * 24);
  if (ageDays <= 90) return "current";
  if (ageDays <= 180) return "aging";
  if (ageDays <= 365) return "stale";
  return "reverify-required";
}
```

### 2.4 Tier transitions

A listing's tier changes:
- Forward (Current → Aging → Stale → Reverify-required) by passage of time only.
- Backward (Reverify-required → Current) by a successful verification (cron or admin) that updates `lastVerifiedAt`.
- Skip-forward (Reverify-required → Reverify-required) if cron tries and fails.
- Stable in `Legacy backfill` until first successful verification.

---

## 3. Display state per tier

Per [HOMEPAGE_V2_WIREFRAME.md §5.2](HOMEPAGE_V2_WIREFRAME.md), the homepage trust legend maps to these tiers. Per-card behavior:

### 3.1 Listing card display

| Tier | Badge | Subline | Action button |
|---|---|---|---|
| Current | Verified (green ShieldCheck) | "Last checked {N} days ago" | Save / Compare / View Source |
| Aging | Verified (green) | "Last checked {N} months ago" | Save / Compare / View Source / Report broken link (subtle) |
| Stale | Verified (green) with amber clock dot | "Last checked {N} months ago — due for reverify" | Save / Compare / View Source / Report broken link (more visible) |
| Reverify-required | Official source on file (slate) | "Reverification due — please verify before applying" | Save / Compare / View Source (with "External link — please verify with program directly" tooltip) / Report broken link |
| Legacy backfill | Official source on file (slate) | "Source URL on file" | Save / Compare / View Source |

### 3.2 Listing detail page display

The listing detail page surfaces the full verification history:

- Trust badge bar at top (per tier).
- "Last verified {date}" with relative + absolute time.
- "Verified by {actor}" (cron / admin name).
- "Verification method: {HEAD / GET / manual / etc.}"
- Link to verification audit history (last 5 events).
- "Report broken link" button always visible.
- Freshness-tier-specific guidance:
  - Current: "Source verified within last 90 days. Information should be accurate."
  - Aging: "Source verified within last 6 months. We'll re-check soon."
  - Stale: "Source verified > 6 months ago. Please cross-check directly with program."
  - Reverify-required: "Source last verified > 1 year ago. Trust badge downgraded. Please verify directly with program before applying."
  - Legacy backfill: "Source URL on file from initial database build, but not yet verified by our cron / admin. Please verify directly with program."

### 3.3 Browse / vertical landing display

- Listing cards display freshness-aware badges per §3.1.
- Default sort: trust state then freshness tier (Current first, Aging second, Stale third, Reverify-required fourth, Legacy at bottom).
- User can sort by "Recently verified" (descending lastVerifiedAt with NULLS LAST).

### 3.4 Aggregate display (homepage stats, vertical landing stats)

Public stats use these distinct counts (not interchanged):

- "{N} listings indexed" — total `status = APPROVED` listings, regardless of verification.
- "{N} programs with official source on file" — `linkVerified = true` (legacy + new). The current PR #25 metric.
- "{N} verified programs" — `LinkVerificationStatus = VERIFIED` AND `lastVerifiedAt` Current or Aging tier. **Only displayed when freshness threshold passes per §6.**

---

## 4. Operator action per tier

### 4.1 Current (≤ 90 days)

- **Operator action:** none.
- Cron may pick up listings in this tier for reverification if the cron eligibility ordering surfaces them, but they're low priority.

### 4.2 Aging (91–180 days)

- **Operator action:** passive monitoring.
- Cron eligibility ordering (per `/api/cron/verify-listings`) prefers older `lastVerifiedAt` first; Aging-tier listings will be picked up by cron over time.
- No admin queue surfacing required.

### 4.3 Stale (181–365 days)

- **Operator action:** active queue prioritization.
- Admin queue (`/admin/verification-queue`) surfaces Stale-tier listings.
- Admin reviews, attempts manual verification, updates `lastVerifiedAt` if successful.
- If cron has been unable to verify (e.g. site changed structure), admin updates source URL or escalates.

### 4.4 Reverify-required (> 365 days)

- **Operator action:** mandatory reverify or downgrade.
- Admin must reverify or downgrade `LinkVerificationStatus` (e.g. to `NEEDS_MANUAL_REVIEW`) before the listing returns to "Verified" display.
- Automated downgrade in display: badge drops from green to slate even before admin acts (per §3.1). The underlying `LinkVerificationStatus` does NOT change automatically; the display does.

### 4.5 Legacy backfill (`null`)

- **Operator action:** prioritize for first verification.
- Cron eligibility ordering already includes NULLS FIRST (PR #17), surfacing legacy backfill rows for cron pickup.
- Admin queue surfaces persistent NULLS that cron has been unable to verify.

---

## 5. Automated downgrade rules

### 5.1 Display downgrade (active, no schema change)

Per §3.1: when a listing's `lastVerifiedAt` ages past 365 days, the displayed badge drops from green ("Verified") to slate ("Official source on file"). This happens at render time.

**Schema state unchanged.** `LinkVerificationStatus = VERIFIED` remains true (nothing actively wrong with the listing's data; we just can't claim "verified" anymore).

### 5.2 Status downgrade (deferred, requires schema authorization)

A future Lane 1 PR (call it Phase 3.10, **not authorized**) would add:
- A nightly job that flips `VERIFIED + lastVerifiedAt > 365 days` → `UNKNOWN` (not `SOURCE_DEAD` — we don't know that the source is dead).
- This would be a schema-state change requiring per-PR authorization per [PLATFORM_V2_STRATEGY.md §7](PLATFORM_V2_STRATEGY.md).

For now: display downgrade only. Schema state change is documented but not built.

### 5.3 No silent removal

A Reverify-required listing is **not** removed from display, sitemap, or browse. Removal would be a `status` change (to `REJECTED` or similar), and silent removal violates the trust contract (users discovered the listing somewhere and we shouldn't hide it).

The downgraded badge + "Reverification due" notice is the user-visible signal. The user can still apply if they verify directly with the program.

### 5.4 Forbidden automation

Per [PLATFORM_V2_STRATEGY.md §2.2](PLATFORM_V2_STRATEGY.md):
- Cron NEVER writes `SOURCE_DEAD`, `PROGRAM_CLOSED`, `NO_OFFICIAL_SOURCE`. Only admin sets these.
- Cron NEVER modifies `Listing.status`. Only admin sets `status`.
- Cron NEVER rewrites URLs.
- A future automated Reverify-required → UNKNOWN downgrade is the maximum authorized cron-side action; even that requires explicit Phase 3.10 authorization.

---

## 6. Public claim alignment

Per [PLATFORM_V2_STRATEGY.md §11.3](PLATFORM_V2_STRATEGY.md):

### 6.1 Claim-alignment rule

Public stat copy (homepage stat cards, OG metadata, blog references) must be consistent with the freshness SLA:

- "{N} verified programs" claim is allowed only when ≥ 80% of `status = APPROVED` listings are in **Current** or **Aging** tier.
- If freshness drops below that threshold, the claim downgrades to "{N} programs with an official source on file" — the conservative-language doctrine from PR #25 / PR #27.

### 6.2 Threshold alignment script

A future script `scripts/check-public-claim-alignment.ts` enforces this.

```ts
// pseudocode
const total = await prisma.listing.count({ where: { status: "APPROVED" } });
const currentOrAging = await prisma.listing.count({
  where: {
    status: "APPROVED",
    linkVerificationStatus: "VERIFIED",
    lastVerifiedAt: { gte: daysAgo(180) },
  },
});
const ratio = currentOrAging / total;

if (ratio < 0.80) {
  // FAIL — public claim "verified programs" is no longer accurate
  console.error(`Freshness threshold FAIL: ${ratio.toFixed(2)} < 0.80`);
  console.error("Replace 'verified programs' with 'programs with official source on file' in public copy.");
  process.exit(1);
}
```

### 6.3 Script runs

- On every successful `main` deploy (CI).
- Daily as part of cron health check (alongside `scripts/check-verify-listings-cron.ts`).
- On demand by operator.

If FAIL: deploy succeeds (script is informational), but operator notification sent. Operator must update `src/lib/site-metrics.ts` to use the conservative phrase.

### 6.4 Current state (as of 2026-04-29)

- Total APPROVED: 304
- VERIFIED + lastVerifiedAt set (Current/Aging): 20 (per cron health check output)
- Ratio: 20 / 304 = ~0.07

**Result: FAR below 0.80.** Public copy correctly uses "programs with an official source on file" (per PR #25 + PR #27). The "verified programs" claim is not safe to make until the cron processes the legacy backfill cohort.

---

## 7. Broken-link escalation

### 7.1 User-reported broken link

User clicks "Report broken link" on a listing card or detail page. Flow:

1. `POST /api/flags` with `kind: "BROKEN_LINK"` and `listingId`.
2. `FlagReport` row created with `status = OPEN`.
3. Listing's `lastFlagReportAt` updated.
4. Listing's `LinkVerificationStatus` is **not** auto-changed (no auto-downgrade from a single user report).
5. Admin queue surfaces the listing for review.
6. Admin investigates: re-fetches link, updates status if appropriate (`NEEDS_MANUAL_REVIEW`, `SOURCE_DEAD`, etc.).
7. Admin closes the flag (`status = RESOLVED`).
8. (Future, post-confirmation) Optionally: send "your report has been resolved" email to user (transactional per [MESSAGING_AND_ALERTS_POLICY.md §5.1](MESSAGING_AND_ALERTS_POLICY.md)).

### 7.2 Multiple reports on same listing

If 3+ open `BROKEN_LINK` flags on same listing:
- Listing is auto-promoted to top of admin queue.
- Listing's display shows "Multiple users have reported this link" notice (subtle; doesn't claim the listing is broken — admin hasn't confirmed yet).
- Listing's badge does **not** auto-downgrade (preserves admin sole authority over `LinkVerificationStatus`).

### 7.3 Cron-detected failure

When cron detects 4xx / 5xx response per `/api/cron/verify-listings`:
- `LinkVerificationStatus = NEEDS_MANUAL_REVIEW` set by cron (allowed per [PLATFORM_V2_STRATEGY.md §2.2](PLATFORM_V2_STRATEGY.md)).
- `lastVerifiedAt` is NOT updated (only successful verification advances `lastVerifiedAt`).
- `lastVerificationAttemptAt` updated.
- Listing surfaces in admin queue with cron's recorded HTTP status + reason.

---

## 8. Cron relationship to freshness

### 8.1 Cron eligibility

Per `/api/cron/verify-listings`, cron picks up listings in this priority order:

1. `lastVerifiedAt` NULL (Legacy backfill — never verified) — NULLS FIRST per PR #17.
2. `LinkVerificationStatus = NEEDS_MANUAL_REVIEW` (in case admin retry intent).
3. Oldest `lastVerifiedAt` first within `VERIFIED` tier.
4. Recently `REVERIFYING` status (in case cron previously started but didn't complete).

Cap: 25 listings per cron run (per [PHASE_3_3_VERIFICATION_CRON_DESIGN.md](../codebase-audit/PHASE_3_3_VERIFICATION_CRON_DESIGN.md)).

### 8.2 Cron schedule

Currently 2 crons (Hobby cap):
1. `/api/cron/verify-listings` — daily at 09:00 UTC.
2. (TBD second cron — see [VERCEL_PROJECT_AUDIT.md](../codebase-audit/VERCEL_PROJECT_AUDIT.md)).

If cron eligibility cap exceeds capacity (e.g. 200 NULL `lastVerifiedAt` + only 25 / day = 8 days to clear), the throughput is the constraint. Phase C+ may consider:
- Increasing cap (per cron run).
- Splitting cron into multiple targeted runs (e.g. one for legacy backfill priority, one for aging reverify) — would require Pro plan to add a 3rd cron.

### 8.3 Cron contract

Reaffirmed for freshness:
- Cron writes `VERIFIED`, `REVERIFYING`, `NEEDS_MANUAL_REVIEW` only.
- Cron NEVER writes `SOURCE_DEAD`, `PROGRAM_CLOSED`, `NO_OFFICIAL_SOURCE`.
- Cron NEVER modifies `Listing.status`.
- Cron NEVER rewrites URLs.
- `lastVerifiedAt` only advances on `VERIFIED` outcome.

---

## 9. Admin queue relationship to freshness

Per [ADMIN_VERIFICATION_QUEUE_RUNBOOK.md](../codebase-audit/ADMIN_VERIFICATION_QUEUE_RUNBOOK.md), the admin queue surfaces:

### 9.1 Three queue sources

1. **`NEEDS_MANUAL_REVIEW` listings** — cron failed to auto-verify; admin investigates.
2. **Open `FlagReport` rows** — user-reported broken links + other concerns.
3. **Stale + Reverify-required listings** (FUTURE — not currently in queue) — passive surfacing for proactive operator work.

### 9.2 Queue prioritization

Within each source:
- Highest priority: multiple flag reports OR `NEEDS_MANUAL_REVIEW` for ≥ 7 days.
- Medium: `NEEDS_MANUAL_REVIEW` for < 7 days.
- Low: single flag report, no errors.

### 9.3 Admin actions

Per [ADMIN_VERIFICATION_QUEUE_RUNBOOK.md](../codebase-audit/ADMIN_VERIFICATION_QUEUE_RUNBOOK.md):
- Verify successfully (set `LinkVerificationStatus = VERIFIED`, advance `lastVerifiedAt`).
- Mark `SOURCE_DEAD`, `PROGRAM_CLOSED`, or `NO_OFFICIAL_SOURCE` (admin-only states).
- Update source URL (`Listing.sourceUrl`).
- Resolve `FlagReport`.
- Reject (`Listing.status = REJECTED`) — last resort, only if listing is truly invalid.

### 9.4 Audit trail

Every admin action logged in `DataVerification` with `verifiedBy = "admin:<name>"` and `method` reflecting the action.

---

## 10. Listing UI relationship to freshness

Per [PAGE_TEMPLATE_INVENTORY.md §7.3](PAGE_TEMPLATE_INVENTORY.md), the listing detail page surfaces full verification metadata:

```
Verification status: Verified
Last verified: 14 days ago (April 15, 2026)
Verified by: cron-verify-listings (system)
Method: HTTP HEAD
Source: https://www.hopkinsmedicine.org/.../observership
Source authority tier: T1 (program's own page)

[View verification history →]
```

The "View verification history →" expands to a per-listing log of the last N verification events (cron + admin).

This level of transparency:
- Builds user trust (auditability).
- Supports the AI-search-resilience moat per [PLATFORM_V2_STRATEGY.md §10](PLATFORM_V2_STRATEGY.md).
- Differentiates USCEHub from competitors that don't show verification provenance.

---

## 11. Future noindex / deprioritization policy

### 11.1 Noindex consideration (deferred)

A future option (not authorized): listings in Reverify-required tier that admin has been unable to verify for >180 days could be `noindex` from the listing-grid perspective.

This is a strong signal — Google would interpret it as "we don't trust this page." Reasons to defer:

- The user may still want to find the listing (it might still be valid; we just haven't verified).
- Removal from sitemap reduces SEO surface.
- The downgrade-display already signals the issue without removing the page.

**Default: don't noindex Reverify-required listings.** Reconsider Phase D.

### 11.2 Deprioritization (current, soft)

The default sort prioritizes by trust + freshness (per §3.3). Reverify-required listings naturally sort lower without being hidden.

---

## 12. Metrics

Per [PLATFORM_V2_STRATEGY.md §16.1](PLATFORM_V2_STRATEGY.md), trust health metrics include freshness:

### 12.1 Operator-side metrics

- Cron health: `scripts/check-verify-listings-cron.ts` PASS / WARN / FAIL state.
- Cron tick count over last 7 days (target: 7, no missed days).
- `LinkVerificationStatus` distribution (count by state, weekly).
- **Median age of `lastVerifiedAt` for `VERIFIED` listings** (target: < 90 days).
- **Tier distribution: Current / Aging / Stale / Reverify-required / Legacy** (target: ≥ 80% Current + Aging).
- Count of Reverify-required listings (target: < 5% of total).
- Count of Legacy backfill listings (target: monotonically decreasing as cron processes).
- Count of `NEEDS_MANUAL_REVIEW` in admin queue (target: < 25 sustained).
- Median time-to-resolve a `FlagReport` (target: < 7 days).

### 12.2 Public-facing metrics (curated)

Per §6.4 alignment rule:

- "{N} programs with an official source on file" — currently 156. Source: `src/lib/site-metrics.ts`.
- "{N} verified programs" — only displayed if §6.1 threshold passes. Currently NOT displayed (~7% Current+Aging ratio).
- "Last updated: {month year}" — manual update on `src/lib/site-metrics.ts`.

### 12.3 Alerting (future)

When metrics drift outside target:
- Cron health FAIL: emergency exception path per [PLATFORM_V2_STRATEGY.md §5.3](PLATFORM_V2_STRATEGY.md).
- Median `lastVerifiedAt` age > 180 days: operator notification.
- `NEEDS_MANUAL_REVIEW` queue > 25 for > 7 days: operator notification.
- Threshold ratio < 0.80 when public copy claims "verified": script alerts; operator updates `site-metrics.ts`.

Alerting infrastructure deferred (no email yet per [MESSAGING_AND_ALERTS_POLICY.md](MESSAGING_AND_ALERTS_POLICY.md)). For now: manual daily check of `scripts/check-verify-listings-cron.ts` per [CRON_HEALTH_CHECK_RUNBOOK.md](../codebase-audit/CRON_HEALTH_CHECK_RUNBOOK.md).

---

## 13. Tier dashboard (deferred)

A future operator tool: `/admin/freshness-dashboard` that shows:

- Tier distribution (pie chart or bar)
- Recent transitions (Current → Aging in last 7 days, etc.)
- Median age trend over time
- Per-vertical / per-state breakdowns

Useful operator surface. Deferred to Phase C+ (after admin queue + cron metrics are operationally proven).

---

## 14. SLA commitments to users

### 14.1 What we commit to

USCEHub commits to:

1. Every listing has a verifiable source URL on file (T1 source authority tier per [PLATFORM_V2_STRATEGY.md §4.5](PLATFORM_V2_STRATEGY.md)).
2. Verification status is honestly displayed (no false "Verified" badges).
3. Broken-link reports are reviewed within 7 business days.
4. `NEEDS_MANUAL_REVIEW` queue is processed at a rate that prevents indefinite backlog growth.
5. Stale (>180 days) listings are surfaced for re-verification.
6. Reverify-required (>365 days) listings have downgraded display badges.
7. Public claims about verification align with actual freshness data.

### 14.2 What we DO NOT commit to

- 100% accuracy. Source data can change between verifications.
- Real-time monitoring (cron is daily, not minutely).
- Specific verification frequency per listing (cron picks priority; some listings re-checked weekly, others monthly).
- Restoration of dead programs (we don't bring back closed programs from anywhere; we mark them).

### 14.3 User-side communication

These SLA commitments live on `/resources/methodology` (or equivalent v2 URL). Public + indexable. AI search will discover and cite.

---

## 15. Open decisions

1. **Exact tier age boundaries.** 90/180/365 (current proposal) vs alternative (e.g. 60/120/240). Recommend: 90/180/365 (aligns with quarterly cadence + annual cycle).
2. **Display downgrade vs status downgrade for Reverify-required.** Display only (current) vs schema state change (deferred). Recommend: display only at v2 launch; schema downgrade Phase 3.10 with explicit authorization.
3. **Whether to surface tier in listing card for non-Verified states.** Recommend: yes — Reverify-required listings show "Reverification due" amber notice on card.
4. **Public threshold for "verified" claim.** 80% Current+Aging ratio (current proposal) vs 70% vs 90%. Recommend: 80% (balances strictness with achievability).
5. **Aging tier behavior — cron should re-touch automatically.** Currently cron does (per cron eligibility ordering). Recommend: keep current behavior.
6. **Stale tier admin queue surfacing.** Add Stale-tier listings to admin queue (currently not). Recommend: yes, low-priority surface.
7. **Reverify-required cron deferral.** Should cron stop touching Reverify-required listings (since admin is the path forward) or keep trying? Recommend: cron keeps trying (cron is cheap; success would be useful even for Reverify-required).
8. **Tier display on browse vs detail.** Detail shows full tier per §3.2. Card shows tier-aware badge per §3.1. Recommend: confirmed both.
9. **Legacy backfill display.** Currently "Official source on file." Should they show as "Unverified — please verify directly"? Recommend: keep "Official source on file" — the URL is on file; cron just hasn't reached them. Honest framing.
10. **Public dashboard with freshness stats.** Could publish a public freshness page (`/methodology/freshness`) showing tier distribution. Builds trust through transparency. Recommend: yes, post-v2 launch.
11. **Per-listing reverify cadence override.** Some listings (high-traffic, high-stake) may warrant more frequent verification. Recommend: defer (cron eligibility ordering is sufficient at current scale).
12. **Snapshot-based audit log.** Currently `DataVerification` table records each verification event. Should we add a snapshot of source content per verification (for "what changed since last check")? Recommend: defer — schema cost not justified at current scale.
13. **Cross-listing freshness aggregation.** Vertical landings (e.g. `/usce/observerships`) could show "157 of 200 USCE listings verified in the last 90 days." Recommend: yes — adds transparency to vertical landings.

---

## 16. Implementation note

This SLA is partially active today (display-tier rendering exists; cron + admin queue exist). Full implementation requires:

- Display tier in listing card and detail per §3.1 / §3.2 (partial today; v2 launch finalizes).
- Public-claim alignment script per §6.2 (deferred, not yet built).
- Admin queue surfacing of Stale tier per §9.1 (deferred).
- Per-vertical freshness stats per §15 #13 (deferred).
- Schema downgrade automation (Phase 3.10, deferred).

All deferred items require their own authorization PRs. None happens at v2 launch unless explicitly added.

---

## 17. Verify-jobs cron — separate freshness story

The `vercel.json` cron config runs **two crons**:

| Cron | Path | Schedule | Data | Tier scheme |
|---|---|---|---|---|
| Listings | `/api/cron/verify-listings` | `0 9 * * *` UTC | `Listing.sourceUrl` | per §2-9 above |
| Jobs | `/api/cron/verify-jobs` | `0 8 * * *` UTC | `WAIVER_JOBS.sourceUrl` (in [src/lib/waiver-jobs-data.ts](../../src/lib/waiver-jobs-data.ts) per [RULES.md](../codebase-audit/RULES.md) §2 hard protection) | mirrored from §2 |

### 17.1 Verify-jobs tier scheme

The same Current/Aging/Stale/Reverify-required tier scheme applies to job listings, with these adaptations:

| Tier | Age | Behavior for jobs |
|---|---|---|
| **Current** (≤ 90 days) | recently verified | display normally on `/career/jobs/*` |
| **Aging** (91-180 days) | due for revalidation | passive cron pickup |
| **Stale** (181-365 days) | admin attention | admin queue surfaces |
| **Reverify-required** (> 365 days) | trust badge downgraded | display with "Reverification due" notice; still indexable |

### 17.2 Why jobs need separate handling

- Jobs go stale faster than program listings (job postings often filled or expired within 90 days vs program pages stable for years).
- Recommend tighter tier boundaries for jobs: Current ≤ 30 days, Aging 31-90, Stale 91-180, Reverify-required > 180.
- Open decision (B-tier): adopt tighter job-specific boundaries or share the listings tier scheme?

### 17.3 Verify-jobs operator action

Mirror §4 (admin queue prioritization) for jobs:
- Admin queue surfaces jobs with `NEEDS_MANUAL_REVIEW` from verify-jobs cron
- 4xx / 5xx → `NEEDS_MANUAL_REVIEW`; admin reviews source URL or removes
- Cron never modifies job `status` (preserves admin-only control per [PLATFORM_V2_STRATEGY.md §2.2](PLATFORM_V2_STRATEGY.md) cron contract)

### 17.4 Verify-jobs public claim alignment

Job listings appearing on `/career/jobs/*` with stale verification trigger the same conservative-language doctrine: don't claim "verified" job listings until the freshness threshold per §6.1 holds for the job cohort.

Currently: verify-jobs cron behavior + audit trail unaudited (per [V2_DECISION_REGISTER.md A3 / B-tier](V2_DECISION_REGISTER.md)). Audit before any v2 jobs-vertical implementation.

---

## SEO impact (this doc)

```
SEO impact:
- URLs changed:        none (planning doc only)
- redirects added:     none
- sitemap changed:     no
- robots changed:      no
- canonical changed:   no
- metadata changed:    no
- JSON-LD changed:     no (future listing JSON-LD will include verification metadata)
- pages noindexed:     none (future Reverify-required listings stay indexable per §11.1)
- internal links:      none changed
- risk level:          ZERO — internal freshness SLA doc
```

## /career impact

None.

## Schema impact

None directly. Future Phase 3.10 schema work would add automated state downgrade — not authorized by this doc.

## Authorization impact

None. Documenting freshness SLA is not authorization to build automated downgrade or alerting. Implementation per §16.
