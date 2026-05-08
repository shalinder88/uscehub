# Micro-Pilot Runtime Generation 1 — Browser QA Notes

**Date:** 2026-05-08
**Status:** **Browser QA NOT completed in this sprint.** Deferred to the named follow-up sprint `P99-MICRO-PILOT-BROWSER-QA-1`.

## Why deferred

The runtime-generation prompt explicitly allowed deferral:

> "If browser QA cannot run in this sprint:
> - document why
> - do not claim browser QA passed
> - route still requires separate QA sprint"

And the prompt's stated post-sequence is:

> "After this, likely next: P99-MICRO-PILOT-BROWSER-QA-1"

This sprint produced the runtime data, the route, and a passing validator for both. Running the dev server in the same sprint would:
- spawn a long-running background process (port 3000 conflicts, lifecycle management);
- mix runtime-generation concerns with QA concerns in one commit;
- not produce a different result for the runtime files themselves.

The honest path is: hand a runtime + route that passes static gates to the QA sprint, and let that sprint own the browser-side checks.

## What the QA sprint should verify

Per the `micro_pilot_runtime_prep_1_noindex_release_checklist.md` Phase 5 (QA):

- [ ] Desktop browser screenshot of pilot index `/clerkships/pilot` showing all 5 cards.
- [ ] Mobile-viewport screenshot of the same.
- [ ] Click each card / source link — confirms HTTP 200 (or note any known 403 / 520 source-side block).
- [ ] Each card displays the verbatim source-supported caveats (named-school list for NJ rows; B-1 visa applicant-obtained + $200/$400 for OH rows; URM scholarship + $1500 for CA row; system-page caveat on Hillcrest).
- [ ] No banned public-launch language visible.
- [ ] No console errors on the pilot route.
- [ ] noindex / nofollow meta tags present in the rendered HTML head (view source).
- [ ] Pilot route NOT linked from the existing Maine route or homepage nav (the prompt says route can exist unlinked or minimally internal).
- [ ] Save / compare functionality on the pilot route — currently NOT wired (PilotClerkshipListings is a minimal read-only component). The QA sprint should confirm that's acceptable for the pilot OR flag it for follow-up.
- [ ] Report-issue path on the pilot route — currently NOT wired (same minimal component note). The QA sprint should confirm that's acceptable OR flag it for follow-up.

## Known scope reductions (intentional)

- `PilotClerkshipListings.tsx` is a minimal read-only component. It does NOT replicate the 1598-line Maine `ClerkshipListings.tsx` save/compare/report-issue/filter UI. The prompt explicitly allowed this:
  > "create a minimal pilot-specific card component"
  > "avoid large UI overhaul"
  > "do not modify global design system unnecessarily"
- The pilot route is unlinked from public nav (acceptable per prompt: "if route is created, it can exist unlinked or minimally internal").

If the QA sprint determines that save/compare/report-issue must be on the pilot route before any deploy, that becomes a separate polish sprint AFTER QA — NOT a defect of this sprint.

## What the QA sprint should NOT do

- No deploy.
- No push.
- No PR.
- No sitemap addition.
- No marketing language.
- No new rows.
- No re-validation that weakens existing validators.

## Static gate status at this hand-off

| Static gate | Status |
|-------------|--------|
| Runtime file exists at expected path | ✅ |
| Exactly 5 cards | ✅ |
| No blocked institutions | ✅ |
| 20-field allow-list honored | ✅ |
| No raw P97 internal field on the wire | ✅ |
| No banned public-wording phrase in any card text | ✅ |
| Route file contains `index: false, follow: false` | ✅ |
| Route file does not contain banned launch language | ✅ |
| `tsc --noEmit` clean | ✅ |
| Existing P99 validators (Maine still primary): runtime / cards / save-compare / report-intake / pilot-release | ✅ all PASS unchanged |
| Micro-pilot runtime validator (NEW) | ✅ PASS 5 cards + route gates |
