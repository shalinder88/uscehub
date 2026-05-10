# Batch 3 — Noindex Activation Preflight Checklist

**Scope:** the conditions a future activation slice (`P99-P97-STAGED-RUNTIME-BATCH-3-NOINDEX-ACTIVATION-SLICE-1`) must satisfy before any active runtime change. **This document does NOT activate.** It is the gating contract for the next sprint.

## 1. Selection — exactly the shortlisted rows

The slice may activate **only**:
- `pilot-014-NC-duke-university-hospital` (Top 1)
- `pilot-017-NY-nyu-langone-tisch-hospital` (Top 2, optional)
- `pilot-019-IN-iu-health-methodist-hospital` (Top 3, optional)

The slice MUST NOT activate Jackson Memorial, Northwestern Memorial, HUP, or Methodist San Antonio without a separate sprint with explicit user authorization that names the row.

## 2. Indexing — noindex preserved

- `/clerkships/pilot` route MUST remain `noindex+nofollow`. `validate-micro-pilot-runtime.ts` MUST PASS.
- No homepage / nav / sitemap exposure.
- No public-route URL change.

## 3. Active card count delta

- Before slice: 5
- After slice: 5 + N (where N ∈ {1, 2, 3})
- Validator must allow new active count up to 8 explicitly. `validate-micro-pilot-runtime.ts` may need a count update — that update is part of the slice sprint, not this audit.

## 4. Staged batch 3 file behavior

The slice may either (a) keep the staged batch-3 file unchanged and add the promoted cards directly to the active runtime, or (b) trim the promoted cards out of staged batch 3 if doing so keeps batch 3's "ready inventory" semantics consistent. Whichever choice is made, the slice sprint MUST document it explicitly and the batch-3 staged validator must pass against the chosen end state.

## 5. Report links must resolve at noindex-activation time

Every promoted card's report URL pattern (`/contact?ref=pilot-listing&listing_id=<id>`) MUST render the visible banner with the correct institution + city/state. This was verified in `P99-P97-CONTACT-REF-PREFILL-AND-HIDDEN-CONTEXT-1` for all 7 batch-3 listing IDs; the slice must re-verify the activated subset specifically (browser preview).

## 6. /contact submission behavior at activation time

- If `USCE_CORRECTION_INTAKE_ENABLED` remains `false` (recommended for first noindex slice): client shows polite generic message on submit. **This is acceptable for the noindex slice.**
- If the user later flips the env flag, that is a SEPARATE decision from this slice. The slice does not require the flag to be enabled.

## 7. NO_PUBLIC_NOW / NO_IMPORT_READY token discipline

- Validator-enforced. No grep-scanned mapping file or runtime file may contain the bare runtime-promotion token form.

## 8. Banned-phrase + claim discipline

- No `guaranteed`, `hospital-approved`, `IMG-friendly`, `apply through USCEHub`, `nationwide`, `complete national directory`, `verified by hospital`, `officially approved by` in any field.
- Audience: US LCME/AOA only (Duke also COCA-osteo); three non-US audiences `EXCLUDED_EXPLICIT`.
- Visa: `VISA_NOT_MENTIONED_US_ONLY_AUDIENCE` + `NO_J1_VERIFIED` + `NO_H1B_VERIFIED`. No sponsorship claim.
- Cost: `COST_NOT_STATED`. No "free" or "no fee" claim.
- Site scope: site-level cards (Duke / NYU Tisch / IU Methodist) — the literal `campus_name` is the strongest copy framing.

## 9. Browser QA required (slice sprint)

Run preview-tool verification for each newly active row:
- `/clerkships/pilot` page renders the new card.
- Card link to report-issue URL renders the banner correctly.
- Submit flow against disabled endpoint returns polite generic message.
- Mobile (375×812) layout sanity.
- Zero console errors.

## 10. Rollback plan

The slice must keep the change **trivially reversible**:
- A single revert of the slice commit returns active runtime to the 5-card baseline.
- The slice MUST NOT amend prior commits or force-push.
- The slice MUST stage only `src/data/usce/public-listings-pilot.generated.{json,ts}` plus the slice's docs folder; no app code (route / component / lib) change required.
- If the slice sprint discovers it must also touch `validate-micro-pilot-runtime.ts` (e.g. raise the expected count cap), that is one additional named path — still scoped.

## 11. Production deployment remains forbidden

- No `vercel --prod`. No PR. No merge to main.
- The slice happens entirely on `local/p97-discovery-integrity-guardrails-clean`.
- Promotion to `main` (and therefore production) is its own decision after the noindex slice has demonstrably worked locally and the user explicitly authorizes the merge.

## 12. Push policy

- Slice sprint commits locally only.
- A push of the clean branch occurs only after the user types "push".
- A merge to `main` (production) requires both "push" AND a separately-typed merge instruction.

## 13. Scope guard for the slice

The slice sprint MUST NOT:
- Add new screening (Queue 4).
- Add new evidence capture beyond what's already on disk.
- Modify `/contact` UI.
- Modify the correction endpoint behavior.
- Add new validators beyond a count update if needed.
- Touch any unrelated dirty file.

If any of those become tempting mid-slice, stop and spawn a follow-on sprint instead.
