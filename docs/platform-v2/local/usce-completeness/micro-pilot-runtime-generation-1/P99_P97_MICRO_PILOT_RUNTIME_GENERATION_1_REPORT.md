# P99 ↔ P97 Micro-Pilot Runtime Generation — Sprint 1 Report

**Sprint date:** 2026-05-08
**Repo:** `/Users/shelly/usmle-platform` (P99 lane)
**Branch:** local/p97-discovery-integrity-guardrails
**Predecessor commit (Mac-local):** `0d24941 Audit P97 to P99 pilot data bridge`
**Source commit (T7):** `3b9d0fa P99: prepare five-row micro pilot runtime package`
**Scope:** Generate noindex pilot runtime + route from T7 prep input. **No deploy. No push. No PR. No public route indexing. No DB / schema mutation. No homepage / global nav change.**

---

## 1. Executive result

- Pilot runtime **generated**: `src/data/usce/public-listings-pilot.generated.json` (5 cards) + `.ts` typed export.
- Noindex pilot route **created**: `src/app/clerkships/pilot` (`page.tsx` + `PilotClerkshipListings.tsx` + wrapper `src/lib/usce-pilot-data.ts`).
- Static validators all PASS (new pilot validator + 5 existing P99 validators + tsc).
- Browser QA **deferred** to `P99-MICRO-PILOT-BROWSER-QA-1` per prompt option.
- Release audit **deferred** to a later sprint.
- **Deploy: NO.** No push, no PR, no Vercel mutation, no production cron.

## 2. Files changed

### New
- `scripts/generate-micro-pilot-runtime.ts` — runtime generation script (reads T7 prep CSV directly by absolute path)
- `scripts/validate-micro-pilot-runtime.ts` — runtime + route validator
- `src/data/usce/public-listings-pilot.generated.json` — 5 cards
- `src/data/usce/public-listings-pilot.generated.ts` — typed export
- `src/lib/usce-pilot-data.ts` — wrapper with runtime guard
- `src/app/clerkships/pilot/page.tsx` — noindex route page
- `src/app/clerkships/pilot/PilotClerkshipListings.tsx` — minimal read-only listings component
- `docs/platform-v2/local/usce-completeness/micro-pilot-runtime-generation-1/micro_pilot_runtime_generation_1_source_manifest.md`
- `docs/platform-v2/local/usce-completeness/micro-pilot-runtime-generation-1/micro_pilot_runtime_generation_1_browser_qa_notes.md`
- `docs/platform-v2/local/usce-completeness/micro-pilot-runtime-generation-1/micro_pilot_runtime_generation_1_noindex_route_check.md`
- `docs/platform-v2/local/usce-completeness/micro-pilot-runtime-generation-1/P99_P97_MICRO_PILOT_RUNTIME_GENERATION_1_REPORT.md` (this file)

### NOT modified (intentionally)
- Maine runtime: `src/data/usce/public-listings.generated.json` + `.ts` (left modified-from-prior-work; not staged)
- Maine UI: `src/app/clerkships/maine/*`
- Maine wrapper: `src/lib/usce-maine-data.ts` (used as type source only)
- Existing P99 validators: all 5 unchanged
- Promotion script: `scripts/usce-data/promote-reviewed-usce-data.ts` (unchanged — Maine path frozen)
- Sitemap, robots.txt, next.config.ts, prisma/*, vercel.json — all unchanged
- T7 repo — read-only

## 3. Rows included (5)

| listing_id | Institution | State | Bucket |
|------------|-------------|-------|--------|
| pilot-075-NJ-morristown-medical-center | Morristown Medical Center | NJ | READY_PUBLIC_US_STUDENT_ONLY |
| pilot-076-NJ-overlook-medical-center | Overlook Medical Center | NJ | READY_PUBLIC_US_STUDENT_ONLY |
| pilot-091-OH-cleveland-clinic-mercy-hospital | Cleveland Clinic Mercy Hospital | OH | READY_PUBLIC_IMG_RELEVANT |
| pilot-149-OH-cleveland-clinic-hillcrest-hospital | Cleveland Clinic Hillcrest Hospital | OH | READY_PUBLIC_IMG_RELEVANT |
| pilot-162-CA-highland-hospital-alameda-health-system- | Highland Hospital (Alameda Health System) | CA | READY_PUBLIC_US_STUDENT_ONLY |

Counts: 5 total, 2 IMG-relevant + 3 US-only. State distribution: NJ 2, OH 2, CA 1.

## 4. Rows excluded (intentionally)

- Mayo Mankato (KEEP_INTERNAL_SOURCE_FRAMEWORK_ONLY)
- Mayo Eau Claire (KEEP_INTERNAL_SOURCE_FRAMEWORK_ONLY)
- Bergen New Bridge (NEEDS_ARCHIVE_RETRY_OR_POLICY_DECISION)
- Saint Elizabeths (KEEP_INTERNAL — residency-supporting source)
- Hemet Global (KEEP_INTERNAL — visa NO_SPONSORSHIP + no visiting MS framework)
- Thomas Jefferson University Hospital (REJECT_PUBLIC_PILOT)
- Manatee Memorial (NEEDS_SOURCE_CAPTURE_BATCH_3)
- University Hospital San Antonio (NEEDS_SOURCE_CAPTURE_BATCH_3)
- UPMC Western Psychiatric (NEEDS_SOURCE_CAPTURE_BATCH_3)
- Lincoln Medical and Mental Health Center (NEEDS_SOURCE_CAPTURE_BATCH_3)

The generation script's `BLOCKED_INSTITUTION_SUBSTRINGS` list catches each of these by substring match — so even if the prep CSV was tampered with, generation would refuse.

## 5. Field mapping summary

The generation script translates prep-CSV fields to the existing P99 `UsceCard` shape (20 fields) per the prep folder's `micro_pilot_runtime_prep_1_runtime_mapping.csv`:

- **Direct copy:** `institution_name`, `campus_name`, `state`, `application_url`, `official_source_url`, `source_status`.
- **Derived:**
  - `listing_id` from rank + state + slugified institution name
  - `county` from a known per-rank lookup (`Morris/Union/Stark/Cuyahoga/Alameda`)
  - `audience_detail` parsed from prep object-string into a 4-key object
  - `eligible_audiences` / `excluded_audiences` / `unknown_audiences` derived from `audience_detail` per status
  - `restriction_tags` split from prep pipe-separated tags
  - `fit_warnings` derived from a controlled subset of `restriction_tags` that should surface to UI
  - `display_bucket` from `public_pilot_category` (`READY_PUBLIC_*_CANDIDATE` → `READY_PUBLIC_*`)
  - `source_page_type` from URL pattern
  - `listing_role` constant `PUBLIC_OPPORTUNITY` (all 5 are visiting electives)
  - `last_reviewed_at` formatted as ISO datetime
  - `opportunity_type` translated from internal enum to display string (e.g., `VISITING_ELECTIVE` → `Visiting elective`)
- **Stripped (NOT in runtime):** `bridge_row_id`, `screenshot_path`, `archive_url`, `source_quote_under_280`, `must_not_claim`, `not_allowed_actions`, `reviewer_notes`, `public_summary_draft`, `public_limitations`, `public_pilot_category`, `noindex_required`, `report_issue_enabled`, `correction_report_required`, `runtime_generation_status`, `allowed_next_workflow`, `evidence_triple_complete`, `evidence_status`, `audience_public_caveat`, `visa_public_caveat`, `visa_policy`, `visa_tags`, `application_method_summary`, `country`, `bridge_row_id` — all kept internal-only on the prep side.

## 6. Public safety summary

| Check | Status |
|-------|--------|
| No "guaranteed" or "guaranteed placement" language | ✅ |
| No "hospital-approved" / "officially approved by" | ✅ |
| No "IMG-friendly" claim | ✅ |
| No "apply through USCEHub" / "official application system" | ✅ |
| No "verified by hospital" / "complete national directory" | ✅ |
| No broad national-launch / nationwide language | ✅ |
| No raw P97 internal field on the wire | ✅ — validator's allow-list scan + forbidden-key scan both pass |
| Pilot uses minimal read-only UI (caveat-first) | ✅ — fit_warnings as pills + restriction_tags expandable + source link |
| Source URL visible per card | ✅ |
| Last reviewed date visible per card | ✅ |
| Hero copy frames pilot as "covers selected programs only" | ✅ |
| Page footer notes "this page does not act as an application system" | ✅ |

## 7. Noindex summary

- Route `/clerkships/pilot` has `metadata.robots = { index: false, follow: false }`.
- Route is NOT in `sitemap.xml`.
- Route is NOT linked from public nav (unlinked, internal-only access).
- Canonical URL set to `siteUrl("/clerkships/pilot")`.
- No deploy.

## 8. Validator results

| Validator | Result |
|-----------|--------|
| `scripts/generate-micro-pilot-runtime.ts` (NEW) | Generated 5 cards (2 IMG + 3 US-only); no forbidden content; no banned phrases |
| `scripts/validate-micro-pilot-runtime.ts` (NEW) | **PASSED** — 5 cards + route gates |
| `scripts/usce-data/validate-public-runtime-data.ts` (existing) | PASSED — Maine runtime unchanged |
| `scripts/validate-usce-public-cards.ts` (existing) | PASSED |
| `scripts/validate-usce-save-compare.ts` (existing) | PASSED |
| `scripts/validate-usce-report-intake.ts` (existing) | PASSED |
| `scripts/validate-usce-pilot-release.ts` (existing) | PASSED — Maine route still has noindex |
| `tsc --noEmit` | **clean** after fixing 4 type errors caught by tsc on first run (re-export `UsceCard`, type the `formatAudience` helper) |
| Browser QA | **DEFERRED** to `P99-MICRO-PILOT-BROWSER-QA-1` |

## 9. Known limitations

- Only 5 rows. Geographically NJ-2 + OH-2 + CA-1; does NOT cover the full first-gated batch (which had 25 rows; 10+ are KEEP_INTERNAL or NEEDS_SOURCE_CAPTURE_BATCH_3 or REJECT and are intentionally absent).
- No save / compare / report-issue UI on the pilot route. Pilot uses a minimal read-only `PilotClerkshipListings.tsx`. Reusing the 1598-line Maine `ClerkshipListings.tsx` would have required refactoring it to accept cards as a prop — out of scope per the prompt.
- No public indexed launch. Route is noindex+nofollow and unlinked.
- Browser QA + release audit not yet completed — both are named follow-up sprints.

## 10. Next step

**`P99-MICRO-PILOT-BROWSER-QA-1`** — start dev server (`npm run dev`), open `http://localhost:3000/clerkships/pilot`, capture desktop + mobile screenshots, click each card's official source link, verify noindex meta in rendered HTML, confirm caveats render correctly, no console errors. Deferred from this sprint per prompt option.

After browser QA: `P99-MICRO-PILOT-RELEASE-AUDIT-1` (re-walk the noindex release checklist), then explicit user "push" before any deploy.

## 11. Hard-rule confirmation

| Rule | Status |
|------|--------|
| No `git push` / PR / deploy | CONFIRMED |
| No Vercel mutation | CONFIRMED |
| No DB / schema / migration / seed / cron | CONFIRMED |
| No listing import into DB | CONFIRMED |
| No public promotion / `PUBLIC_NOW` / `IMPORT_READY` | CONFIRMED |
| No indexed route | CONFIRMED — noindex+nofollow set on `/clerkships/pilot` |
| No sitemap addition | CONFIRMED |
| No robots.txt change | CONFIRMED |
| No broad national launch copy | CONFIRMED |
| No homepage / global nav change | CONFIRMED |
| No SEO title/description launch claim | CONFIRMED |
| No fake verification claim | CONFIRMED |
| No hospital-approved claim | CONFIRMED |
| No guaranteed placement claim | CONFIRMED |
| No official USCEHub application-system claim | CONFIRMED |
| No broad IMG-friendly claim | CONFIRMED |
| No unsupported visa claim | CONFIRMED — CCF rows explicitly state "no J-1 / no H-1B sponsorship" |
| No raw P97 / internal fields exposed | CONFIRMED — validator allow-list + forbidden-key scan both pass |
| No screenshot paths exposed publicly | CONFIRMED — `screenshot_path` is in the validator's `FORBIDDEN_RUNTIME_KEYS_EXACT` set |
| No reviewer notes exposed publicly | CONFIRMED |
| No `must_not_claim` exposed publicly | CONFIRMED |
| No archive/internal notes exposed publicly | CONFIRMED — `archive_url` is in `FORBIDDEN_RUNTIME_KEYS_EXACT` (audit-only at this stage) |
| No route indexing | CONFIRMED |
| No push/deploy after commit | CONFIRMED |
| No `--no-verify` | CONFIRMED |
| No unrelated dirty files staged | CONFIRMED — pre-existing `.claude/launch.json` + Maine generated files NOT staged |
| Pre-existing untracked `nppes/`, `redesign-mockups/` files NOT staged | CONFIRMED |
| T7 repo not modified | CONFIRMED — read-only |
| Existing Maine runtime unchanged | CONFIRMED |
| All 5 existing P99 validators still PASS | CONFIRMED |
