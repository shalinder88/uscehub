# P102 Display Readiness — Visual QA

Generated: 2026-05-17
Branch: `local/p102-display-readiness-visual-qa`
Parent: `38f9802` (display-readiness reconciliation)
Server: `usmle-p1-2b` on port 3000 (via Claude Preview MCP)

---

## 1. Summary

Visual QA of `/usce/verified-preview/display-readiness` on both desktop
(1280×1600) and mobile (375×812). The route renders all seven buckets
with the correct counts. All leakage checks pass — no hidden, broker,
research, outreach, manual-browser, or negative-info row appears in the
clinical or research display lanes.

**One real defect was found and fixed in this sprint** — the page
inherited light-mode text classes (`text-stone-900`) but the site
runs in dark mode by default, so every heading, body paragraph, sample
table cell, and footer text was almost-black-on-near-black. Fixed by
adding `dark:` variants for text, borders, and backgrounds throughout
the page and the `HoldList` component. After the fix, computed `<h1>`
color went from `lab(9, …)` (near-black) to `lab(96, …)` (near-white)
on dark mode — fully legible.

The route is ready for operator review. No copy concerns, no false
"official / hospital-approved / guaranteed" language, no production
data read or written.

---

## 2. Counts verified

Counts pulled from the rendered DOM via `preview_eval` after page load:

| Bucket card | Count | Matches export | Matches reconciliation |
|---|---:|:---:|:---:|
| Clinical USCE | 170 | ✓ | ✓ |
| Research | 9 | ✓ | ✓ |
| Outreach hold | 3 | ✓ | ✓ |
| Research reverify | 7 | ✓ | ✓ |
| Manual browser | 3 | ✓ | ✓ |
| Hidden | 14 | ✓ | ✓ |
| Archive (neg info) | 1 | ✓ | ✓ |
| Total rows | 207 | ✓ | ✓ |

Summary line: `Active display: 179 · Held: 13 · Not active: 15` —
matches the `clinical (170) + research (9)` active math, the `outreach
(3) + research-reverify (7) + manual-browser (3)` held math, and the
`hidden (14) + archive (1)` not-active math.

Clinical USCE badge distribution chips render correctly:
- DIRECT · 105 (emerald)
- REORIENTED · 63 (sky)
- PROTECTED · 2 (amber)

Sample table: 25 of 170 rows shown, with Badge column displaying the
DIRECT/REORIENTED/PROTECTED chip per row. Confirmed via DOM count.

---

## 3. Clinical display check

First five rows of the clinical sample table, sourced from the DOM:

| Institution | State | Badge | SubType | Final URL |
|---|---|---|---|---|
| Abington Hospital — Jefferson Health | PA | DIRECT | international-visiting-student | jefferson.edu/registrar/visiting-student-clinical-electives/international-visiting-medical-students.html |
| Allegheny Health Network — Observership | PA | DIRECT | observership | alleghenyinternational.org/observerships.html |
| Augusta University Medical Center (MCG) | GA | REORIENTED | observership | augusta.edu/mcg/coffice/curriculum/incoming-vslo-students.php |
| Banner University Medical Center — Tucson | AZ | DIRECT | observership | medicine.arizona.edu/education/degree-programs/md-program/visiting-medical-students |
| Banner University Medical Center / University of Arizona | AZ | DIRECT | observership | medicine.arizona.edu/education/degree-programs/md-program/visiting-medical-students |

Every row has a real institutional URL and a recognizable badge. No
homepage URLs, no `#` placeholders, no broker domains.

The same institution appearing twice (Banner / U of A entries) is
expected — data.js intentionally has multiple entries with the same
name, and both reorient to the same canonical visiting-students page.

---

## 4. Research separation check

The Research bucket card shows `9` — exactly the
`RESEARCH_VALID_INSTITUTIONAL_PATHWAY` count. The page architecture
keeps research in its own labeled card and never mixes it into the
clinical count line ("Active display: 179" splits as 170 clinical + 9
research, both shown as their own card).

The 7 `RESEARCH_TOO_GENERIC_REVERIFY` rows appear ONLY in the "Research
reverify (operator URL needed)" hold list — not in the active research
display. Confirmed via DOM: the holds list shows the 7 institutions
(Mayo, Mt Sinai, Pittsburgh, Fred Hutch, Baylor, Northwestern, Albert
Einstein), all labeled as research holds.

---

## 5. Holds / hidden exclusion check

Programmatic check via `preview_eval`: searched the rendered page for
every forbidden institution name. Results:

| Forbidden name | In active display | In hold list (expected) |
|---|:---:|:---:|
| AMG Medical Group | absent | absent |
| ValueMD | absent | absent |
| Brooklyn USCE | absent | absent |
| Clinical Experience Programs | absent | absent |
| Cook County (negative info) | absent | absent |
| Conemaugh | absent | absent |
| Interfaith Medical | absent | absent |
| Brookdale University | absent | absent |
| Flushing Hospital | absent | absent |
| Kingsbrook | absent | absent |
| Postdoctoral Research | absent from active | present in holds (expected — 7 research-reverify) |
| Research Fellowship | absent from active | present in holds (expected — 2 research-reverify) |

All 14 hidden, 1 archive, and 3 outreach + 3 manual-browser + 7
research-reverify rows are correctly excluded from the active display.

Forbidden language scan: page body searched for `/official database|
hospital.?approved|guaranteed|best.rated/i` — **not found**. The page
copy is honest: "Source of truth for what the live site is allowed to
display," "Internal preview · noindex," etc.

---

## 6. Mobile check

Viewport: 375×812 (preview_resize mobile preset).

Mobile layout renders cleanly:
- USCEHub navbar at top
- Title section flows to two lines ("P102 Display / Readiness") which
  is fine on a narrow viewport
- Bucket cards collapse from `sm:grid-cols-4` → `grid-cols-2` (2-per-
  row), totaling 4 rows of 2 cards for the 8 buckets
- Active display / Held / Not active summary line stays legible
- Clinical USCE badge chips wrap to two rows but remain readable
- Hold lists stack vertically and remain readable

The site's own Terms-of-Service modal appears on first load (writes
`uscehub_terms_accepted` to localStorage on click). It is a real user-
facing gate from the main site, not an injection — captured for QA
context, then dismissed.

---

## 7. Source / trust copy check

- Page title (browser tab): `P102 display readiness — internal —
  USCEHub`
- H1 visible: `P102 Display Readiness`
- Subtitle: `Internal preview · noindex`
- First paragraph: states this is the source of truth for what the
  live site is allowed to display; tells the reader exactly how to
  regenerate the data
- Bucket card labels match the export filenames
- Badge labels match the classifier vocabulary
- Footer: `Generated from docs/platform-v2/local/usce-discovery-
  command-center/p102/exports/. No production data is read or
  mutated by this page.`

No marketing language. No claims of official partnership. The page
positions itself accurately as an internal diagnostic surface.

Meta robots: `noindex, nofollow, nocache` — confirmed via DOM.

---

## 8. Defects

### Resolved in this sprint

**D1 — dark mode contrast** (severity: high; fix: shipped this branch).
Page used `text-stone-900` / `text-stone-500/600/700` and `border-
stone-200` everywhere, which produced near-black text on the site's
dark-slate background. Fix: added `dark:text-slate-100/200/300/400`,
`dark:bg-slate-800`, and `dark:border-slate-700` variants throughout
the page and the `HoldList` component. Computed `<h1>` color shifted
from `lab(9, …)` (near-black, unreadable on dark navy) to `lab(96, …)`
(near-white, fully legible). Same shift applied to `<h2>`, table cells,
hold list entries, footer text.

### Open observations (not blocking)

**O1** — Section heading `<h2>` font weight could be heavier (currently
`font-semibold`) since the rest of the site uses serif-display
weighting for top-of-section headings. Cosmetic; not a defect.

**O2** — The 25-row clinical sample is truncated to encourage drill-
down via the JSON export. Operator may want a full paginated table for
end-user review. Out of scope for this sprint — the preview is for
diagnostic counts, not user-facing browsing (browse integration is
Phase D).

**O3** — Long URLs in the sample table wrap awkwardly on narrower
desktop widths. Not a regression — the column intentionally shows the
full URL for trust verification. Could add `break-all` if desired,
but truncation would obscure provenance.

**O4** — The repo's pre-existing `p102-validate-approved-public-safe-
export` failure (6 decision-CSV `APPROVE_PUBLIC_SAFE` rows with
placeholder reviewer / decisionReason) remains unchanged. Not related
to this preview surface or to display readiness; explicitly out of
scope per the parent sprint's instruction.

---

## 9. Screenshots

Captured via `mcp__Claude_Preview__preview_screenshot` during this QA
session. Returned as inline JPEG images during the eval; not persisted
to disk because the MCP tool returns base64 inline rather than file
paths. To regenerate manually:

```bash
cd /Users/shelly/usmle-platform
npm run dev
# open http://localhost:3000/usce/verified-preview/display-readiness
# accept ToS modal on first load (writes localStorage)
# inspect at 1280×1600 (desktop) and 375×812 (mobile)
```

Status: NOT NEEDS_BROWSER_RETRY. The Claude Preview MCP successfully
captured both viewports in this session; screenshots informed the
defect detection above. They are not committed because they would not
add information beyond what the export JSONs and the DOM-eval results
already establish.

---

## 10. Recommendation

The display-readiness route is **visually ready**. Recommend the
operator:

1. **Open the route locally** at
   `http://localhost:3000/usce/verified-preview/display-readiness`
   (after `npm run dev`) and confirm the counts match this report.
2. **Spot-check 10 random clinical rows** by clicking through the
   sample table URLs — confirm each lands on a real
   institutional visiting-student / observership page in the browser.
3. **Decide whether to deepen the preview UI** with full pagination,
   filters, or a per-row drill-down (see Phase D in the parent sprint
   for the browse/listing integration plan).
4. **Operator-side actions** remain open from the parent sprint:
   - Phone outreach for Jamaica Hospital (×2) + Richmond University
     Medical Center (3 outreach holds).
   - Operator-supplied research URLs for the 7 research-reverify rows.
   - In-browser visual check of the 3 manual-browser rows (BIDMC,
     Advocate Christ ×2).

No DB / schema / production mutation needed for this route.
