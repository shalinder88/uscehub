# P99-2 Implementation Audit
Generated: 2026-05-04

---

## Files changed by c456cbf (P99-2A core)

| File | Change |
|------|--------|
| `src/app/clerkships/maine/ClerkshipListings.tsx` | +394 / -11 |
| `.claude/launch.json` | +6 (usmle-p1-2b server entry) |

---

## Route touched

`/clerkships/maine` — existing route, no new routes.

---

## Card component touched

`ClerkshipCard` — added `isSaved: boolean` and `onToggleSave: () => void` props.  
Save button added to card header (Bookmark / BookmarkCheck icon).

---

## Storage key

```
localStorage key: "usce-saved-listings"
Format: string[]  (listing_id values only — NOT full card payloads)
```

The hook `useSavedListings` reads the key on mount via `useEffect` (avoids SSR hydration
mismatch). Writes via functional `setSavedIds` updater to guarantee sequencing.

---

## Compare model

Compare is **saved-shortlist based**, not an independent selection.

- Saving a card adds it to the shortlist (`useSavedListings`).
- Compare button appears in the filter bar when ≥ 2 cards are saved.
- Compare opens `ComparePanel` which shows `savedCards.slice(0, 4)`.
- There is no independent compare-selection separate from save state.

**Rationale for pilot:** Simpler UX, fewer interaction states, appropriate for a 12-card pilot.  
Tradeoff: user cannot compare without saving. Acceptable at this scale.

---

## Current validator coverage (before P99-2B)

| Validator | What it checks | Status |
|-----------|----------------|--------|
| `validate-usce-public-cards.ts` | Source rights, CMS bridge, card counts, tsc | PASS |
| `validate-usce-pilot-ui.ts` | Forbidden fields, forbidden language, display bucket type, runtime guard | PASS |

---

## Missing from original P99-2 spec (gap list for P99-2B)

| Gap | Status |
|-----|--------|
| Saved-only / unsaved-only filters | MISSING — added in P99-2B Phase B |
| Export saved JSON | MISSING — added in P99-2B Phase C |
| Export saved CSV | MISSING — added in P99-2B Phase C |
| `scripts/validate-usce-save-compare.ts` | MISSING — added in P99-2B Phase F |
| `P99_2_SAVE_COMPARE_QA_REPORT.md` | MISSING — added in P99-2B Phase G |
| Report-issue placeholder in compare panel | MISSING — added in P99-2B Phase E |
| Compare 4-cap documented in UI | PARTIAL (backend capped, no visible copy) — hardened in Phase D |

---

## Compare selection model — documented decision

Compare uses the saved shortlist, not a separate compare-selection mechanism.

- Compare shows up to 4 saved listings at a time.
- If > 4 are saved, the panel shows the first 4 and displays a visible note
  telling the user to remove some to compare others.
- This is intentional for the pilot. A dedicated per-card compare checkbox
  (independent of save state) can be added post-pilot if user research shows need.
