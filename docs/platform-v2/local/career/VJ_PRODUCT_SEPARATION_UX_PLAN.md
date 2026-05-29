# VJ Product Separation UX Plan

**Status:** APPROVED DECISION — awaiting implementation sign-off
**Date:** 2026-05-29
**Scope:** Local planning only. No code, no deploy, no push.

---

## Binding Architecture Decision

```
uscehub.com            IMG clinical pathway hub — root front door
uscehub.com/browse     USCE search
uscehub.com/career     Visa & Jobs — physician immigration intelligence
```

- Same domain. No separate domain.
- No root redirect to /career.
- No hard USCE-vs-Career gate on root.
- /career feels like a separate product lane, not a separate site.
- Root stays USCE-focused. Career gets its own identity under the same trust umbrella.

---

## 1. Homepage Two-Lane Module

### What changes on uscehub.com root

The existing hero stays USCE-focused:
> Find verified U.S. clinical experience.

Below the hero (or within the hero section, depending on current layout), add a two-card lane module. This is soft discovery, not a forced gate.

```
[ Find USCE ]                   [ Visa & Jobs ]
For students and IMGs looking   For residents, fellows, and
for observerships, electives,   physicians navigating J-1/H-1B
and clinical rotations.         waivers, Conrad 30, and jobs.
→ Browse Programs               → Visa & Jobs Guide
```

Design intent:
- Cards are visible but not dominant. They sit below the primary hero action.
- Both cards are always visible regardless of cookie state.
- No modal. No overlay. No chooser gate.
- A user who ignores both cards and scrolls down sees the normal USCE homepage.

### Cookie preference behavior

Cookie name: `uscehub-lane`
Values: `"usce"` | `"career"` | not set

Set only on explicit lane card click. Never on page load, never on scroll, never inferred.
Duration: 90 days. SameSite=Lax; Secure.

On subsequent visits when cookie is set:
- `"usce"`: homepage unchanged. No visual change. Cookie is informational for possible future personalization.
- `"career"`: homepage shows a soft return banner at the top of the two-lane module:
  ```
  Welcome back — continue to Visa & Jobs →
  ```
  This is a small, dismissible strip — not a redirect, not a modal.
  The homepage remains fully accessible.

Cookie is never used to redirect. It is used only to show a soft contextual link.

---

## 2. /career Header

### Current state
career/layout.tsx has the main site nav + a career sub-nav underneath.
The main site nav (USCEHub brand, Browse, Residency Intelligence, etc.) is visible inside all /career pages.

### Target state
Inside /career, the main site nav is replaced with a career-specific header.

```
Header left:  Visa & Jobs   (by USCEHub)
Header right: career sub-nav links

Sub-nav (already built):
  Primary:   J-1 Waiver · Visa & Immigration · Jobs · Offers & Practice
  Secondary: Immigration Attorneys · For Employers
```

The "by USCEHub" attribution in the header links back to uscehub.com root. It is always visible but not prominent.

Header tone: clean, professional, physician-facing. Not student-facing. Not observership funnel.

What the /career header must NOT contain:
- Browse Programs link
- Residency Intelligence link
- Any USCE-specific navigation
- The main site logo/brand without the "Visa & Jobs" disambiguation

---

## 3. /career Footer

### Current state
/career pages inherit the main site footer (USCE programs, observerships, about, etc.).

### Target state
Inside /career, the footer is replaced with a career-specific footer.

```
Footer columns:

Visa & Jobs                   Resources                    Legal
J-1 Waiver                    J-1 Jobs Database            Disclaimer
Visa & Immigration            H-1B Sponsor Database        Privacy
Jobs                          Conrad 30 Guide              Terms
Offers & Practice             State Waiver Rules

                    ---

Attribution line:
Visa & Jobs · Part of USCEHub   ·   USCE Search →   ·   © 2026 USCEHub
```

The "USCE Search →" link in the footer attribution is the primary cross-link back to the USCE side. It is always present but not prominent — a single line, not a section.

What the /career footer must NOT contain:
- Featured Programs
- Browse by Specialty
- Observership listings
- Any USCE-program navigation
- Newsletter signup tied to USCE content

---

## 4. Cross-Linking Rules

### From USCE side → Visa & Jobs

| Location | Cross-link | Format |
|----------|-----------|--------|
| Homepage (below hero) | Two-lane module (primary) | Two cards |
| /browse sidebar or bottom | "Planning J-1/H-1B next?" | One-line soft callout |
| /img-corner or /img-resources | If contextually relevant | One-line contextual |

Do NOT add career cross-links inside:
- Individual listing detail pages
- /observerships or /observerships/[state]
- /recommend quiz
- /compare

### From Visa & Jobs side → USCE

| Location | Cross-link | Format |
|----------|-----------|--------|
| /career header | "by USCEHub" attribution | Header text link to root |
| /career footer | "USCE Search →" | Footer attribution line |

Do NOT add USCE cross-links inside:
- Career page body content
- Career sub-nav
- Career cards or CTAs
- Any inline paragraph within /career pages

---

## 5. Noindex / Publish Gate

### Current state
All /career/* pages carry `noindex` in their metadata. Set during VJ-A. VJ-E (removal) is on explicit hold.

### Gate conditions for VJ-E (noindex removal)

All conditions must be true before any /career page gets noindex removed:

1. User gives explicit "go" in chat (required — cannot be waived)
2. Homepage two-lane module is live
3. /career has its own header/footer (this plan implemented)
4. Copy QA passes (VJ-C complete ✓)
5. No /career page claims complete J-1 job coverage
6. No monetization wiring is live (attorney leads, employer listings, etc.)

Pages go live one by one, not in bulk. Order: overview → J-1 waiver → visa → jobs → sponsors → practice → rest.

### What does NOT trigger VJ-E

- VJ-C completion (already done)
- /career pages being reachable via nav (already live via VJ-B)
- Homepage two-lane module going live
- This plan doc existing

---

## 6. Visual Identity Separation

The /career lane should feel different from the USCE side without being unrecognizably different.

USCE side tone: student-facing, discovery, exploration, clinical education
Career side tone: professional, physician-facing, immigration intelligence, legal-adjacent

Potential differentiators (to be confirmed at implementation):
- /career can use a slightly different accent color or weight on the "Visa & Jobs" mark
- /career pages use more professional/dense layout, less card-heavy than browse
- No cream-and-teal observership visual pattern inside /career
- Disclaimers are more prominent inside /career (legal-adjacent content)

Not required to be different:
- Base font stack
- Dark mode token set
- Tailwind/CSS variable infrastructure

---

## 7. Implementation Sequence (Proposed — Not Approved)

This sequence requires explicit sign-off before any code is written.

```
Phase VJ-F: Homepage two-lane module
  - Add two-card lane below USCE hero
  - Cookie set on click
  - Soft return banner (cookie = "career")
  - No homepage visual changes otherwise
  - No deploy until user approves
  - No noindex changes

Phase VJ-G: /career independent header
  - Replace main site nav inside career/layout.tsx
  - "Visa & Jobs by USCEHub" header
  - Sub-nav already built (VJ-D) — wire into new header
  - TypeScript + tsc check required

Phase VJ-H: /career independent footer
  - Replace main site footer inside career/layout.tsx
  - Career-specific columns
  - "USCE Search →" attribution line
  - No USCE program content

Phase VJ-I: Visual QA pass
  - Walk all /career pages after VJ-G + VJ-H
  - Walk homepage after VJ-F
  - Chrome MCP verification

Phase VJ-E: Noindex removal (HOLD)
  - Requires explicit user go-ahead
  - Separate from above phases
  - Page-by-page, not bulk
```

---

## Hard Rules (All Sessions)

- No push. No deploy. No PR.
- No schema or DB migration.
- No noindex removal without explicit "go".
- No monetization wiring (attorney leads, employer listings, paid placements).
- No claim of complete J-1 job coverage.
- No new domain.
- No root redirect to /career.
- No forced USCE-vs-Career gate on root.
- No homepage changes until VJ-F is approved.
