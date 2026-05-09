# Batch 3 Evidence Landing — Manual Retry Checklist

**Date:** 2026-05-09
**Sprint:** P99-P97-BATCH-3-EVIDENCE-LANDING-AND-QUEUE-RECONCILIATION-1

---

## 1. Items where automated landing did NOT fully succeed

### 1.1 Persistent PNG screenshots (all 5 source pages)

- **Failure mode:** Chrome MCP `screenshot` action with `save_to_disk: true` does not return a filesystem path in this runtime. Screenshots remain inline-only in the conversation thread, not on disk.
- **Status:** `SCREENSHOT_PNG_INLINE_ONLY`. **HTML snapshots were landed** to repo as a substitute (`screenshots/*.html`, ~265KB total). HTML preserves all source text; the visual rendering is reproducible by opening the HTML locally OR by visiting the verified Wayback URL.
- **Manual browser steps if curator wants persistent PNGs:**
  1. Open each source URL in Chrome (signed into Vercel SSO is irrelevant here — these are public sources):
     - `https://www.medstudentaffairs.pitt.edu/visiting-students`
     - `https://www.medstudentaffairs.pitt.edu/visiting-students/domestic-visiting-students`
     - `https://live-researchprograms-medschool-pitt.pantheonsite.io/international-visiting-student-program`
     - `https://www.nychealthandhospitals.org/mosaic/visiting-scholars-program/`
     - `https://www.lincolnemergencymedicine.com/medical-students`
  2. macOS full-page screenshot (`Cmd+Shift+5` → "Capture Entire Page" in Preview after open) OR a Chrome devtools full-page screenshot.
  3. Save under `docs/platform-v2/local/usce-completeness/batch-3-evidence-landing-and-queue-reconciliation-1/screenshots/` with names matching the manifest.
- **Curator decision:** Whether persistent PNG is REQUIRED before bridge input, or whether HTML-snapshot + Wayback URL + verbatim quote is the acceptable evidence triple form for system-level rows.

### 1.2 Lincoln MOSAIC fresh Wayback snapshot

- **Source URL:** `https://www.nychealthandhospitals.org/mosaic/visiting-scholars-program/`
- **Failure mode:** Wayback Save Page Now returned HTTP 520 today (Wayback transient backend error). Retry within the same minute returned connection failure (HTTP 000).
- **Mitigation in place:** Verified that an existing snapshot exists at `https://web.archive.org/web/20260412100521/https://www.nychealthandhospitals.org/mosaic/visiting-scholars-program/` (April 12, 2026). HEAD request returned HTTP 200; the eligibility / stipend / application text in this prior snapshot is identical to the live page captured today, so it adequately supports the quoted evidence.
- **Curator decision:** Whether the prior April 12 snapshot is acceptable, or whether a sprint-fresh snapshot is mandatory before bridge input.
- **Manual retry procedure:** open `https://web.archive.org/save/https://www.nychealthandhospitals.org/mosaic/visiting-scholars-program/` in a browser; complete any CAPTCHA if Wayback presents one; verify the new snapshot URL.

## 2. Items where automated landing fully succeeded

| Item | Result |
|------|--------|
| HTML snapshot — UPMC Pitt parent visiting-students | `screenshots/upmc-pitt-visiting-students-parent.html` (34 KB) |
| HTML snapshot — UPMC Pitt domestic | `screenshots/upmc-pitt-domestic-visiting-students.html` (35 KB) |
| HTML snapshot — UPMC Pitt international (pantheonsite) | `screenshots/upmc-pitt-international-visiting-student-program.html` (40 KB) |
| HTML snapshot — Lincoln MOSAIC | `screenshots/lincoln-mosaic-vsp.html` (15 KB) |
| HTML snapshot — Lincoln Emergency Medicine MS3/4 | `screenshots/lincoln-emergency-medicine-medstudents.html` (141 KB) |
| Wayback — UPMC Pitt parent | `https://web.archive.org/web/20260509181911/...` (sprint-fresh) |
| Wayback — UPMC Pitt domestic | `https://web.archive.org/web/20260509182106/...` (sprint-fresh) |
| Wayback — UPMC Pitt international | `https://web.archive.org/web/20260509182127/...` (sprint-fresh) |
| Wayback — Lincoln Emergency Medicine | `https://web.archive.org/web/20260509182018/...` (sprint-fresh) |
| Wayback — Lincoln MOSAIC | `https://web.archive.org/web/20260412100521/...` (prior snapshot, HEAD-verified) |

## 3. Exact source text the curator should re-verify

### UPMC Pitt Domestic
> *"Students who have completed their core clinical training and will be in the fourth year of medical education at their LCME- or AOA- accredited home institution in North America may apply for an elective experience at the University of Pittsburgh School of Medicine through the VSLO."*

### UPMC Pitt International
> *"This program is ONLY for international students who have completed their core clinical training and are in their final year of medical education. This program does not offer observerships/externships to medical graduates."*
>
> *"$4,500 per clinical elective"*
>
> *"The USMLE Step 2 exam (not Step 1 scores) is a requirement to apply for a Psychiatric clinical elective."*

### Lincoln MOSAIC
> *"Medical students must be attending a U.S. accredited allopathic medical school (i.e., are enrolled in Medical Degree-granting programs) or osteopathic medical schools (i.e., are enrolled in Doctor of Osteopathy-granting programs)."*
>
> *"Each VSP participant will be matched to a NYC H+H participating site and will conduct clinical shadowing, didactic sessions, practical learnings, simulation and experiential training."*
>
> *"$2,000 stipend for the rotation and an additional $2,000 housing stipend for participants that are not based in the New York City metro area."*

### Lincoln Emergency Medicine MS3/4
> *"Hello! Thank you for your interest in rotating at Lincoln's Emergency Medicine Residency!"*
>
> *"Our rotation is 4 weeks long. You will be expected to see patients, formulate plans of care, and present them to our senior residents and attending physicians."*

## 4. What NOT to do

- Do NOT promote any row to bridge input from this sprint's evidence — the curator's mini-reaudit-6 is the next decision point.
- Do NOT broaden audience eligibility beyond the verbatim source text. UPMC Pitt domestic = LCME/AOA NA only. Lincoln MOSAIC = US LCME/AOA only.
- Do NOT claim Western Psychiatric site-specific availability — the source is system-level UPSOM/UPMC.
- Do NOT claim Lincoln site-specific availability for non-EM specialties — the EM source is specialty-restricted; the MOSAIC source is system-level.
- Do NOT claim J-1 or H-1B sponsorship for UPMC international — only B-1/B-2 acceptance/invoice documentation is mentioned.
- Do NOT claim Caribbean accessibility for either UPMC domestic or Lincoln MOSAIC — both explicitly require US LCME/AOA accreditation.
- Do NOT submit any application, contact form, or payment.
- Do NOT mutate the T7 queue file or copy it into Mac-local.

## 5. Curator can proceed without persistent PNG?

**Recommendation:** YES, conditionally. The evidence triple for these system-level rows is:
1. Live source URL (verified)
2. HTML snapshot (persisted in repo)
3. Wayback archive URL (verified HTTP 200)
4. Verbatim source quote (≤280 chars per quote, embedded in manifest CSV)

A persistent PNG would add only visual rendering — the textual claim-supporting evidence is fully captured. Curator's call.

## 6. Is archive mandatory before bridge input?

For UPMC + Lincoln: **all 5 source pages are archived** (4 sprint-fresh, 1 prior April 12 snapshot). No archive blocker remains.
