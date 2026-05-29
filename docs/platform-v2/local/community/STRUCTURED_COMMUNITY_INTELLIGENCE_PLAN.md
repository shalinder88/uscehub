# Structured Community Intelligence Plan

**Date:** May 2026  
**Phase:** 6 (parallel with data moat)  
**Status:** Planning only — no code yet

---

## What this is

Structured, form-based reports from trainees. Not an open forum.

The goal is to collect peer intelligence that is:
- Specific (structured fields, not free-text blobs)
- Moderated (no unreviewed allegations reach the public)
- Aggregated (individual data points are never exposed; only aggregate signals when minimum N is met)
- Attributed to program/employer, not to a person

---

## What this is NOT

- Not an open discussion forum
- Not a review site with unmoderated text
- Not a platform for employer-specific campaign coordination
- Not a legal complaint system
- Not a whistleblower platform
- Not a space for anonymous allegations without review

---

## Report types

### 1. USCE Experience Report
For: `/listing/[id]` pages and Browse programs

```
Program name (pre-filled from listing)
Date of rotation (month + year)
Duration
Rotation type (observership / elective / sub-I / research)
Your training stage at time (IMG-pre / IMG-in-cycle / US-MS3 / etc.)
Overall experience (1–5 scale)
IMG-friendliness (1–5 scale)
Letter availability (yes / no / ask)
Visa support (J-1 / B-1 / none / unknown)
Would recommend? (yes / no)
Free text (optional, 500 char max, moderated)
```

### 2. Interview Experience Report
For: Residency program pages (Phase 6+)

```
Program name
Specialty
Interview cycle year
Format (in-person / virtual / hybrid)
Number of interviews
IMG-friendliness impression (1–5)
Visa history discussed? (yes / no / unknown)
Overall impression (1–5)
Free text (optional, 500 char max, moderated)
```

### 3. Match Outcome Report
For: Program intelligence layer

```
Program matched
Specialty
Match year
Your step scores (optional ranges, not exact)
Your YOG (current / 1-3 yr / 4-6 yr / 7+ yr)
IMG status (yes / no)
Visa type needed (J-1 / H-1B / none)
```

### 4. Visa Sponsorship Signal
For: `/career/jobs` and program pages

```
Employer / program name
Year
Visa type offered (J-1 waiver / H-1B / both / neither)
Confirmed in writing? (yes / no)
Source (offer letter / verbal / job posting / contract)
```

### 5. Offer / Contract Datapoint
For: `/career/salary`, `/career/contract`, `/career/offers`

```
Specialty
Region (not city)
Practice type (academic / private / hospital-employed / locums)
Base salary range (selected from bands, not exact)
wRVU structure? (yes / no)
Sign-on bonus present? (yes / no)
Tail coverage included? (yes / no)
Non-compete present? (yes / no)
Visa support offered? (yes / no / J-1-only / H-1B / both)
Year
```

### 6. Program Friendliness Report (lightweight)
For: any program page, eventually Browse

```
Program name
Specialty
Report type (IMG friendliness / communication / response time)
Rating (1–5)
Year
```

---

## Moderation model

**All free-text fields require moderation before public display.**

Moderation gates:
1. Automated: profanity filter, length check, employer name check
2. Human review queue for flagged submissions
3. Admin approve / reject / edit before display

**Minimum N threshold:**
- No aggregate stat is shown publicly until at least 5 reports for that entity exist
- No individual report text is shown until reviewed + approved
- Numeric aggregates (rating averages) require minimum 3

**What is never shown:**
- Individual names or emails
- Exact salaries (only bands)
- Specific allegations about named individuals
- Unreviewed free text

---

## Display model

Reports surface as:
- Aggregate signals on program/employer pages: "5 rotation reports · 4.1 avg"
- Salary band distributions on `/career/salary`: "N offer datapoints in this region/specialty"
- Visa signal tags on listing cards: "Visa support confirmed (3 reports)"

Reports do NOT surface as:
- Individual free text on public pages until reviewed
- Named reviewer attribution
- Raw employer rating leaderboards

---

## Privacy

- User submits reports while logged in (for deduplication and moderation)
- Public display is always anonymous
- User can delete their own reports from their dashboard
- Deleted reports are removed from aggregate counts after re-calculation
- Reports are disclosed as "community-sourced, moderated, aggregated" wherever displayed

---

## Build order

1. Report submission forms (server-rendered, no client complexity)
2. Moderation admin queue
3. Aggregate calculation logic
4. Display on program/employer pages (below primary content)
5. User dashboard: "My reports submitted"
6. Deletion support

---

## Hard gates before launch

- Moderation queue must be functional before any form is live
- Minimum-N logic must be in place before aggregate stats show
- No free text displays publicly without human approval
- Privacy policy must disclose community data collection before forms go live
