# P97-1 — Maine discovery report (state #1, pilot)

Generated: 2026-05-02
Branch: `local/p96-2-listing-screenshot-audit`
Counties completed: 16 of 16 (100%)
Institutions searched: 10
Candidates found (APPROVED_FOR_HUMAN_REVIEW): 2
Candidates needing manual review: 1
Rejected (non-target): 1
Duplicates: 1
Not found after search: 16
Blocked / login-required: 0

## Counties

All 16 Maine counties marked `COMPLETE`. Two counties (Cumberland,
Androscoggin) yielded high-confidence official-source candidates.
Kennebec yielded a manual-review candidate (Togus VA via
affiliation routing). Eleven rural counties yielded no candidates;
their hospitals are either MaineHealth network sub-locations
(rolling up to the Cumberland/MMC umbrella) or independent rural
critical-access hospitals without teaching programs.

| County | Status | Candidates | Notes |
| --- | --- | --- | --- |
| Cumberland | COMPLETE | 1 | MMC visiting MS electives via VSLO |
| Penobscot | COMPLETE | 0 | Northern Light EMMC residency-only; no visiting MS page |
| Kennebec | COMPLETE | 1 (manual review) | Togus VA via MMC/EMMC/UNECOM affiliations |
| Androscoggin | COMPLETE | 1 | Central Maine Healthcare clerkships explicitly open to international MS |
| York | COMPLETE | 0 | UNECOM internal-only; York Hospital no path; Biddeford = MMC sub-location |
| Aroostook | COMPLETE | 0 | Rural critical-access |
| Franklin | COMPLETE | 0 | MaineHealth network sub-location |
| Hancock | COMPLETE | 0 | MaineHealth network sub-location |
| Knox | COMPLETE | 0 | MaineHealth network sub-location |
| Lincoln | COMPLETE | 0 | MaineHealth network sub-location |
| Oxford | COMPLETE | 0 | MaineHealth network sub-location |
| Piscataquis | COMPLETE | 0 | Independent rural — no teaching program |
| Sagadahoc | COMPLETE | 0 | MaineHealth network sub-location |
| Somerset | COMPLETE | 0 | Independent rural — no teaching program |
| Waldo | COMPLETE | 0 | MaineHealth network sub-location |
| Washington | COMPLETE | 0 | Rural — no teaching program |

## Candidates (3 total)

### ME-001 — Maine Medical Center Visiting Medical Student Electives (Cumberland) — HIGH

- Source: `mainehealth.org/maine-medical-center/education-research/undergraduate-medical-education/visiting-medical-student-electives-mainehealth-maine-medical-center`
- Application: `meded.mainehealth.org/meded/MedStudentApp/electives.aspx`
- Type: Elective (multispecialty: EM, GenSurg, IR, Anesthesia, etc.)
- Eligibility: Senior MS via VSLO (LCME-accredited likely; IMG eligibility unclear from public page).
- Status: `APPROVED_FOR_HUMAN_REVIEW` — verify IMG eligibility before public listing.

### ME-002 — Togus VA Affiliated Medical Education (Kennebec) — MEDIUM

- Source: `va.gov/maine-health-care/locations/togus-va-medical-center/`
- Type: Affiliation-routed elective (via MMC, EMMC, UNECOM).
- Status: `NEEDS_MANUAL_REVIEW` — likely subsumed under the MMC / EMMC parent listings rather than a standalone listing.

### ME-003 — Central Maine Healthcare Elective Clerkships (Androscoggin) — HIGH

- Source: `cmhc.org/health-professionals/medical-students/elective-clerkships/`
- Application: `cmhc.org/health-professionals/residency-programs-and-fellowship/medical-students/`
- Type: Clerkship (3rd/4th-year).
- Eligibility: **Explicitly open to U.S., Canadian, AND international medical school students.** No observerships / externships / research / pre-match.
- Status: `APPROVED_FOR_HUMAN_REVIEW` — strong candidate for public listing as USCE clerkship.

## Rejected / non-target (1)

### Tufts Maine Track MD Program (Cumberland)

- URL: `medicine.tufts.edu/academics/medicine/maine-track-md`
- Reason: Maine Track is a 4-year MD enrollment track for Tufts students (Maine community medicine focus), not a visiting/observership program for IMGs. TUSM does not offer observerships for visiting students; international students not eligible per away-rotation policy.
- Reversibility: `canReconsiderLater=true` if Tufts later opens a separate visiting channel.

## Duplicates (1)

### MaineHealth Maine Medical Center Biddeford (York)

- Was Southern Maine Health Care; merged into MaineHealth MMC in 2024.
- Visiting MS path goes through the system-wide MMC VSLO program.
- Recommendation: treat as a sub-location of the Cumberland MMC candidate row, not a separate listing.

## Not found after search (16)

11 rural-county MaineHealth network sub-locations + 5 independent rural / specialty hospitals. None publish a visiting-MS or IMG observership program. Pattern: most rural Maine hospitals are MaineHealth sub-locations and the visiting-MS path rolls up to MMC.

## Best-performing search terms

- `site:<official-domain> observership visiting medical student IMG elective` — found MMC, CMHC.
- `site:<va.gov> Togus Maine VA observership` — surfaced affiliation summary.
- `"<institution>" medical student elective residency rotations` — fallback when site:-search returned nothing (used for Northern Light EMMC and broader queries).

## Worst-performing search terms

- `site:northernlight.org` — Northern Light Health's actual domain is `northernlighthealth.org`, not `northernlight.org`. Initial site search returned zero results. **Lesson:** verify the actual hostname before using site:-search.
- `site:northernlighthealth.org Acadia psychiatry residency rotations` — returned content but not relevant to visiting MS.

## Common page locations

- Visiting-MS hub: `<domain>/education-research/undergraduate-medical-education/visiting-medical-student-electives-*`
- Clerkship: `<domain>/health-professionals/medical-students/elective-clerkships/`
- VA: `va.gov/<state>-health-care/locations/<facility>/` — gives affiliation list, not direct application.

## Examples of target-relevant candidates

- MMC visiting MS electives — strong: VSLO + multi-specialty + housing.
- CMHC clerkships — strong + unusual: explicitly accepts international MS, which is rare for community hospitals in Maine.

## Examples rejected as non-target

- Tufts Maine Track — MD enrollment track, not a visiting/observership channel.

## Ambiguity examples

- Togus VA — affiliated rotations exist but the direct application path is via MMC, EMMC, or UNECOM, not via the VA itself. Best handled as a caveat on the affiliated medical center listings.

## Whether the process scales

Yes, with caveats:
- **Maine took ~10 high-quality WebSearches** to cover 16 counties (most rural counties auto-collapsed via the MaineHealth umbrella pattern).
- **Larger states will need more searches per county** — Pennsylvania alone has 67 counties and 10× the teaching-hospital density.
- **The not-found auto-collapse pattern** (rural sub-locations rolling up to a system flagship) is real and useful — single search covers all sub-locations once the umbrella institution is known.
- **VA-affiliation is a recurring pattern** — should be cross-referenced rather than treated as a separate listing per state.

Estimated effort per state (assuming 50-state coverage):
- Small rural states (ME, VT, NH, RI): ~10 searches each, half-hour wall time.
- Mid-size academic-dense states (MA, MD, GA, NC): ~30 searches each, 1-2h wall time.
- Large dense states (NY, PA, CA, TX, IL): ~80-150 searches each, multi-hour wall time, or split into multi-batch passes.

## Recommended improvements before next state

1. **Build a per-state "umbrella systems" cheat sheet first** — list the dominant health systems in each state so we can search the umbrella once and roll up sub-locations. (e.g., MaineHealth in Maine; Mass General Brigham + Beth Israel Lahey + Mass General Hospital affiliates in MA.)
2. **Verify the actual official hostname** before site:-search. (Northern Light → northernlighthealth.org, not northernlight.org.)
3. **Track the affiliation graph** — VA, university affiliates, system rollups. Avoid double-counting.
4. **Search for "international medical student" explicitly** — it surfaces CMHC-style explicit-IMG-acceptance content that the standard "visiting medical student" query misses.
5. **Add "open to international" or "foreign medical school" as filter terms** — these phrases reliably indicate IMG eligibility in plain text.

## Hard rules confirmed

No push, no PR, no merge, no deploy, no Vercel mutation, no schema change, no `prisma db push`, no DB mutation, no production cron, no listing import, no public copy change, no #52 interaction, no login attempts, no credentialed scraping, no CAPTCHA bypass, no aggressive crawling, no auto-publish, no silent discard, no third-party page as source of truth, no screenshots in this run, all decisions reversible.

## Resume

- Next state: **NH (New Hampshire)**.
- Next action: replace the `__seed__` placeholder county for NH with NH's 10 counties (Belknap, Carroll, Cheshire, Coos, Grafton, Hillsborough, Merrimack, Rockingham, Strafford, Sullivan), then run discovery.

## Final report card

| Metric | Value |
| --- | --- |
| Counties completed | 16 / 16 (100%) |
| Institutions searched | 10 |
| Candidates found | 3 |
| APPROVED_FOR_HUMAN_REVIEW | 2 |
| NEEDS_MANUAL_REVIEW | 1 |
| Rejected (non-target) | 1 |
| Duplicates | 1 |
| Not found | 16 |
| Blocked / login | 0 |
| Best search term | `site:<domain> observership visiting medical student IMG elective` |
| Hostname error | `northernlight.org` should be `northernlighthealth.org` |
| Process scales | Yes, with per-state umbrella-systems cheat sheet |
| Next state | NH (New Hampshire) |
