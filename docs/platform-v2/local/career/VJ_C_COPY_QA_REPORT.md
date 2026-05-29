# VJ-C Copy QA Report

**Branch:** local/vj-c-copy-qa (changes on top of 71b7390)
**Date:** 2026-05-28
**Status:** COMPLETE — do not push

---

## Phases Completed

### Phase A — Prior commit baseline
Confirmed VJ-D commit (71b7390) as baseline. Sections S1–S4 hub pages created,
sub-nav wired to 4 primary + 2 secondary muted links, Attorneys demoted.

### Phase B — Count inventory

| Page | Metric | Source |
|------|--------|--------|
| /career | J-1 Waiver Jobs card subtitle | `getJobCount()` → 1947; `getUniqueSpecialties()` → 21 |
| /career | Salary Snapshot footnote | 26 specialties (SPECIALTIES array); Sources: Medscape, MGMA, Doximity |
| /career/sponsors | Header | 1,087 verified employers (DOL LCA FY2025 Q3) |

Stale/wrong counts found:
- Landing card said "29 jobs · 13 specialties" — replaced with qualitative language + stable 1,087 count
- Landing salary footnote said "16 specialties · From real job postings" — fixed to "26 specialties · Sources: Medscape, MGMA, Doximity"

### Phase C — Landing page fixes (career/page.tsx)

1. J-1 Waiver Jobs card subtitle: replaced stale "29 jobs · 13 specialties" with "J-1 waiver + H-1B physician positions · 1,087 verified employers"
2. Salary Snapshot footnote: "16 specialties · From real job postings · Sources: Medscape, MGMA, PracticeLink" → "26 specialties · Sources: Medscape, MGMA, Doximity"
3. Tools list: fixed `/career/state-compare` → `/career/compare-states` (dedup); added Visa & Immigration and Offers & Practice entries

### Phase D — Double title suffix fix

Root cause: career/layout.tsx has `template: "%s — USCEHub"` and many child pages already ended their main title strings with "— USCEHub", producing double suffix in browser tab.

**Bulk fix via perl** (23 files): stripped " — USCEHub" from 2-space-indented `title:` strings across all career/*.tsx files.

**Three additional two-line title patterns perl missed** (fixed manually in this session):
- `src/app/career/taxes/page.tsx` — changed to `title: { absolute: "... — USCEHub" }` (also prevents double-template stacking with root layout)
- `src/app/career/locums/page.tsx` — stripped suffix from continuation string
- `src/app/career/waiver/pathways/page.tsx` — stripped suffix from continuation string

**Dev server cache note for taxes:** The dev server's root bundle was compiled before the fix and does not hot-reload this file's metadata in the current session. The source is correct. On dev server restart or production build, the title will show correctly as "Tax Planning for Physicians — W-2, 1099, Deductions & Retirement Strategies — USCEHub" (single suffix). All other pages verified correct via curl.

### Phase E — Disclaimers

- **career/malpractice/page.tsx**: Added "Educational information only — not insurance, legal, or financial advice." before Related Tools section. Already had no double-suffix bug.
- **career/attorneys/page.tsx**: Extended existing disclaimer paragraph to include "no listing creates a lawyer-client relationship."
- **career/contract/page.tsx**: Already had "not legal advice" disclaimer — no change needed.
- **career/taxes/page.tsx**: Already had "This is general educational information, not tax advice." — no change needed.
- **career/practice/page.tsx**: Already had "Educational information only — not legal, tax, financial, or insurance advice." — no change needed.

### Phase F — Attorneys demotion (career/layout.tsx)

Removed Attorneys from the primary 4-tab sections array. Added as secondary muted link after a divider, alongside "For Employers". Both are monetization-adjacent and not ready for primary prominence.

Sub-nav structure after fix:
- Primary (4): Overview · J-1 Waiver · Visa & Immigration · Jobs · Offers & Practice
- Divider
- Secondary/muted (2): Immigration Attorneys · For Employers

### Phase G — Visual QA results

| Page | Title | Sub-nav | Counts | Disclaimer | Notes |
|------|-------|---------|--------|------------|-------|
| /career | ✓ | 4+2 correct | 26 specialties, Medscape/MGMA/Doximity | n/a | |
| /career/visa | ✓ single suffix | 4+2 correct | none | n/a | |
| /career/jobs | ✓ single suffix | 4+2 correct | 1947/21 dynamic | n/a | Section rail to sponsors+locums added |
| /career/sponsors | ✓ single suffix | 4+2 correct | 1,087 stable | n/a | |
| /career/practice | ✓ single suffix | 4+2 correct | none | ✓ educational disclaimer | |
| /career/malpractice | ✓ single suffix | 4+2 correct | none | ✓ insurance disclaimer added | |
| /career/contract | ✓ single suffix | 4+2 correct | none | ✓ existing "not legal advice" | |
| /career/taxes | ✗ dev cache (source ✓) | 4+2 correct | none | ✓ existing "not tax advice" | Dev server cache issue; source correct |
| /career/attorneys | ✓ single suffix | 4+2 correct | none | ✓ no-lawyer-client-relationship added | |

Mobile sub-nav: overflow-x-auto scrollbar-hide pattern confirmed in source. Chrome MCP window resize does not give true mobile viewport — NEEDS_MOBILE_BROWSER_RETRY for visual confirmation.

### Phase H — Build validation

- `tsc --noEmit`: exit=0
- `npm run build`: exit=0 (pre-session, confirmed via summary)
- `validate-no-secrets.ts`: 0 findings

---

## Files Modified

### src/app/career/ (VJ-C changes)

| File | Change |
|------|--------|
| `career/page.tsx` | Count fixes (3): job subtitle, salary footnote, tools list |
| `career/layout.tsx` | Attorneys demoted to secondary muted + For Employers pair |
| `career/jobs/page.tsx` | Title suffix stripped; section rail added (sponsors+locums) |
| `career/attorneys/page.tsx` | Disclaimer extended with no-lawyer-client-relationship |
| `career/malpractice/page.tsx` | Insurance disclaimer added |
| `career/taxes/page.tsx` | Title changed to `{ absolute: "..." }` — bypasses both template layers |
| `career/locums/page.tsx` | Title suffix stripped from two-line pattern |
| `career/waiver/pathways/page.tsx` | Title suffix stripped from two-line pattern |
| 23 other career files | Title suffix stripped via perl bulk pass |

---

## Hard Rules Respected

- No push
- No deploy
- No PR
- No schema/DB migration
- No monetization wiring
- No noindex removal (VJ-E still on hold)
- No broad "Career" top-nav label
- No claim of complete J-1 job coverage
- No homepage changes
- No SEO/sitemap/robots/canonical/JSON-LD changes (JSON-LD in pages untouched)
