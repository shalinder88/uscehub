# USCEHub Backsite Next-Work Priority Audit

**Date:** 2026-05-08
**Sprint:** `P99-P97-BACKSITE-DATA-TRUST-CONTINUATION-1` — Phase B
**Companion:** [`USCEHUB_BACKSITE_DATA_TRUST_CONTINUATION_1_STATE_LOCK.md`](./USCEHUB_BACKSITE_DATA_TRUST_CONTINUATION_1_STATE_LOCK.md)

---

## 1. Audit goal

Pick the next backend / data / trust workstream. UI and production are out of scope.

## 2. Workstream summary

| # | Workstream | Status today | Next step | Effort | Risk |
|---|------------|--------------|-----------|--------|------|
| 1 | Source-capture Batch 3 | 4 rows pending (`NEEDS_SOURCE_CAPTURE_BATCH_3`) | run capture sprint | medium | low (read-only) |
| 2 | Data promotion gates | 6 validators in place + bridge audit done; gaps in promotion-decision matrix | enumerate gaps; tighten validators | medium | low |
| 3 | Report / correction trust flow | per-card `?listing_id=` link works; intake validator passes; no listing-ID payload mapping at server level | scope mapping spec (no UI build) | small | low |
| 4 | Admin / backsite review | no internal review queue artifact yet | scaffold doc-only review queue | medium | low |
| 5 | UI / interface polish | deferred per user doctrine | DO NOT START | n/a | n/a |
| 6 | Production merge blast-radius | 47-commit P96-P99 stack on branch | DO NOT START — separate audit + explicit approval required | n/a | high if attempted |

## 3. Workstream 1 — Source-capture Batch 3

### What it is
The 4 institutions excluded from the micro-pilot pending source evidence:

- Manatee Memorial Hospital (FL) — flagged `NEEDS_SOURCE_CAPTURE_BATCH_3` in `P99_MICRO_PILOT_RELEASE_AUDIT_1_REPORT.md`
- UH San Antonio — flagged `NEEDS_SOURCE_CAPTURE_BATCH_3`
- UPMC Western Psychiatric — flagged `NEEDS_SOURCE_CAPTURE_BATCH_3`
- Lincoln Medical & Mental Health Center (NY) — flagged `NEEDS_SOURCE_CAPTURE_BATCH_3`

These are NOT proposals to add them to the pilot. The sprint goal is **capture evidence and document disposition** — eligibility, audience, visa/J-1/H-1B, fees, application flow, archive status. A subsequent curator re-audit decides promotion.

### Why this is the right next sprint
- Pure backend / data / trust work (read-only fetches + screenshots + structured notes).
- Unblocks future curator decisions without touching UI or production.
- Reduces the standing `NEEDS_*` queue from 4 to 0 (or to a smaller, better-characterized set).
- Same operating mode and validators as the 5 already-pilot-promoted rows; no new infrastructure required.
- Zero deploy risk: no runtime generation, no public exposure.

### Files / scripts likely involved
- `docs/platform-v2/local/usce-completeness/backsite-data-trust-continuation-1/source-capture-batch-3/` (new sprint dir)
- Reference patterns in:
  - `docs/platform-v2/local/usce-completeness/micro-pilot-release-audit-1/P99_MICRO_PILOT_RELEASE_AUDIT_1_REPORT.md`
  - `docs/platform-v2/local/usce-completeness/micro-pilot-runtime-generation-1/`
  - `docs/platform-v2/local/usce-completeness/micro-pilot-browser-qa-1/`
- No code changes expected; no runtime generation; no validator changes.

### Risks
- One or more institutions may have no public source page → document `NEEDS_ARCHIVE_RETRY` or `KEEP_INTERNAL_FRAMEWORK_ONLY`, do not invent.
- Wayback may persistently fail for some hosts → mirror the pattern used for Bergen New Bridge; do not bypass.
- Public-only constraint — no login, no CAPTCHA bypass, no form submission.

### Validation plan
- After Batch 3 docs commit: re-run `validate-micro-pilot-runtime.ts` to confirm no row promotion accidentally happened.
- Re-run `tsc --noEmit` to confirm no source-side regression.
- Confirm `<meta robots>` on `/clerkships/pilot` unchanged.
- Confirm 5-card count unchanged.

## 4. Workstream 2 — Data promotion gates

### Current state
Six validators exist:
- `scripts/validate-micro-pilot-runtime.ts`
- `scripts/usce-data/validate-public-runtime-data.ts`
- `scripts/validate-usce-public-cards.ts`
- `scripts/validate-usce-save-compare.ts`
- `scripts/validate-usce-report-intake.ts`
- `scripts/validate-usce-pilot-release.ts`

Plus the P99/P97 bridge audit (`P99_P97_PILOT_DATA_BRIDGE_AUDIT.md`) and pilot-prep validators in scripts/.

### Gaps to enumerate (later sprint, NOT now)
- Decision matrix doc: explicit rule table for `READY_PUBLIC_IMG_RELEVANT` vs `READY_PUBLIC_US_ONLY` vs `KEEP_INTERNAL_*` vs `NEEDS_ARCHIVE_RETRY` vs `NEEDS_SOURCE_CAPTURE_*` vs `REJECT_PUBLIC_PILOT`.
- Cross-validator coherence: ensure no row can pass `validate-public-runtime-data.ts` if it would fail `validate-micro-pilot-runtime.ts`.
- Banned-phrase list maintenance / SHA-pinned snapshot.
- Internal-field allow-list / deny-list parity check between pilot runtime and public runtime.
- Blocked-row registry: a single canonical list of explicitly-excluded institutions referenced by both validators.

### Why later
Workstream 1 first because Batch 3 will surface the practical decision-matrix questions. Strengthening gates after Batch 3 is data-driven; doing it now is speculative.

## 5. Workstream 3 — Report / correction trust flow

### Current state
- Per-card "Report a listing issue" link → `/contact?ref=pilot-listing&listing_id=<id>` (verified live in preview smoke).
- Footer feedback link → `/contact?ref=pilot-feedback`.
- `validate-usce-report-intake.ts` PASSES — privacy copy, no server-side submission, saved-locally-only.

### Gap
The contact form likely receives `ref` and `listing_id` as URL params but probably does not bind them to a structured server-side correction record. There is no admin-side review queue for incoming reports.

### Why later
This is small but UI-adjacent and crosses into server intake design. Better as a doc-spec sprint AFTER Batch 3 raises the question "who reviews these reports?"

## 6. Workstream 4 — Admin / backsite review

### Current state
No internal review queue artifact exists for:
- Pending source corrections
- Blocked-row review log
- Future `IMPORT_READY` candidates
- Public-copy risk queue

### Gap
A doc-only scaffold (CSV templates, queue schema, review-cycle policy) would unblock the curator role without writing UI code.

### Why later
Better to do after Batch 3 produces real pending-correction items. Scaffolding queues with no real items is premature.

## 7. Workstream 5 — UI / interface polish

**DEFERRED.** User doctrine is explicit: "Leave major UI/interface redesign until the end. Keep UI work local/deferred."

## 8. Workstream 6 — Production merge blast-radius

**DEFERRED INDEFINITELY.** The branch carries 47 commits ahead of `origin/main`. A merge would publish the entire P96-P99 stack. Requires:
- Separate scoped blast-radius audit
- Explicit user approval (typed "push" / "merge" / explicit affirmation)
- Independent of every other workstream above

## 9. Recommended next sprint

**`P99-P97-FIRST-PILOT-SOURCE-CAPTURE-BATCH-3`**

Rationale:
- Most concrete remaining backend / data / trust task.
- Read-only by nature; lowest risk.
- Unblocks downstream workstreams 2, 3, 4 with real evidence.
- Scope is bounded (4 institutions, public sources only).
- No deploy. No UI. No promotion. No production touch.

Companion prompt prepared in [`P99_P97_FIRST_PILOT_SOURCE_CAPTURE_BATCH_3_PROMPT.md`](./P99_P97_FIRST_PILOT_SOURCE_CAPTURE_BATCH_3_PROMPT.md) and ready to run as the next sprint.

## 10. What this audit explicitly does NOT recommend

- Production merge
- Any UI / interface / theme work
- New homepage / nav exposure
- Public promotion of any row
- Bridge approval of any row
- `IMPORT_READY` / `PUBLIC_NOW` flag changes
- Sitemap or robots.txt changes
- Vercel project / domain / DNS / env-var changes
- DB / schema / prisma / seed changes
