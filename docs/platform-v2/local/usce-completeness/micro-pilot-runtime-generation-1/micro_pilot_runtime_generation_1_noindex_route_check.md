# Micro-Pilot Runtime Generation 1 — Noindex Route Check

**Date:** 2026-05-08
**Route:** `/clerkships/pilot`
**Source file:** `src/app/clerkships/pilot/page.tsx`

## Status

| Check | Status | Notes |
|-------|--------|-------|
| Route path | `/clerkships/pilot` | New route added in this sprint |
| `index: false` in `metadata.robots` | ✅ | Verified via static validator |
| `follow: false` in `metadata.robots` | ✅ | Verified via static validator |
| Route is in `sitemap.xml` | NO | Not added |
| Route is linked from public nav | NO | Unlinked, internal-only access at this stage |
| Canonical URL set | ✅ | `siteUrl("/clerkships/pilot")` |
| Page copy avoids launch claims | ✅ | "covers selected programs only"; no "launch", "nationwide", "all USCE rotations", "complete national directory" |
| Page copy avoids forbidden marketing phrases | ✅ | No "guaranteed", "hospital-approved", "officially approved by", "IMG-friendly", "apply through USCEHub", "official application system", "verified by hospital" |
| Excluded rows absent from runtime | ✅ | All 10+ blocked institutions absent (Mayo Mankato, Mayo Eau Claire, Bergen, Saint Elizabeths, Hemet, TJUH, Manatee, UH San Antonio, UPMC Western Psychiatric, Lincoln Medical) |
| Caveats visible on page | ✅ | Each card shows fit_warnings as pills + restriction_tags expandable; hero copy shows pilot-only framing + verify-on-source instruction |
| Source link visible per card | ✅ | "Official source" external link with icon |
| Last reviewed visible per card | ✅ | Formatted date |
| Report-issue path visible | NOT WIRED IN PILOT UI | Pilot uses minimal read-only component; prompt explicitly allowed this. The page footer notes "Email corrections to the program directly via their official source page; this page does not act as an application system." Whether this is acceptable for pilot deploy is a QA-sprint decision. |
| Save/compare on pilot route | NOT WIRED | Same scope reduction. |
| Browser QA passed | PENDING | Deferred to `P99-MICRO-PILOT-BROWSER-QA-1`. |

## Verification commands

```bash
# Static validator
cd /Users/shelly/usmle-platform
npx tsx scripts/validate-micro-pilot-runtime.ts

# tsc
npx tsc --noEmit
```

Both pass at the time of this commit.

## Known scope reductions

- `PilotClerkshipListings.tsx` is a minimal read-only component. It does NOT replicate the 1598-line Maine `ClerkshipListings.tsx` UI (save/compare/filter/report-issue modal/saved-view tabs). The prompt explicitly allowed this:
  > "If existing card components cannot show caveats safely:
  > - create a minimal pilot-specific card component
  > - avoid large UI overhaul
  > - do not modify global design system unnecessarily"
- Adding save/compare/report-issue to the pilot UI would require either (a) refactoring `ClerkshipListings.tsx` to accept cards as a prop (substantial change to a 1598-line component) or (b) duplicating that component for the pilot (large duplication, drift risk). Both are out of scope for runtime generation.
- The QA sprint or a subsequent polish sprint can decide whether the pilot needs save/compare/report-issue before deploy.

## Hard rules confirmed

- Route is noindex + nofollow.
- Route is not in sitemap.
- Route is not linked from public nav.
- No "launch" / "nationwide" / "complete directory" language in route or page copy.
- No forbidden marketing phrases in any rendered text.
- All blocked institutions are absent from the runtime data.
- Existing Maine route + Maine runtime + all 5 existing P99 validators are unchanged and still PASS.
