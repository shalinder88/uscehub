# My Pathway — Trainee Workspace Plan

**Date:** May 2026  
**Phase:** 5.5 (after IMG Corner rebuild, before data moat)  
**Status:** Planning only — no code yet

---

## What this is

A daily-use account layer for medical trainees. The product gives users a reason to make an account and return.

**Public name:** My Pathway  
**Internal name:** Trainee Workspace  

Not "the app." Do not call it an app until it behaves like one. Start as web/PWA.

---

## What this is NOT

- Not a union organizing tool
- Not a legal advice service
- Not a workflow that requires accounts to read content
- Not a native mobile app at launch
- Not a paywalled product

---

## Design principles

**Reading is always free and public.** Saving requires login. No content is gated.

**Account value must be obvious.** A user who creates an account should immediately see value: their saved items, their tracker, their watchlist. If an account provides no utility, users will not create one.

**Low-friction signup.** Email only. No phone number. No profile required at creation. Optional profile fields surface over time as the user engages.

**returnTo pattern.** When a user clicks "Save" without being logged in, redirect them to sign in, then return them to the page they were on. Never lose their intent.

**Anonymous by default for reports.** Community/review data submitted by users is not attributed publicly by name or email.

---

## Feature set

### V1 — Core workspace

| Feature | Description |
|---|---|
| Saved USCE programs | Save any listing from `/browse` or `/listing/[id]` |
| Saved Visa & Jobs pages | Save any career page or state waiver guide |
| Application tracker | Add program, track status (researching / applied / interview / matched / declined) |
| Interview tracker | Add interview dates, notes, decisions |
| Visa/job watchlist | Watch specific career pages for updates |
| State waiver watchlist | Watch Conrad 30 slot status for specific states |
| Deadline reminders | Set date + label + email reminder |
| Source-link alerts | Alert when a saved source URL changes or becomes unavailable |
| Report-issue status | See status of reports the user has submitted |

### V2 — Comparison + intelligence

| Feature | Description |
|---|---|
| Program comparison | Compare 2–3 saved USCE or residency programs side by side |
| Offer/contract comparison | Compare up to 4 job offers (already built at `/career/offers`, wire to account) |
| Salary benchmarking | Anchor saved offers against specialty/state benchmarks |
| Malpractice/tail coverage checklist | Checklist tied to a saved offer or employer |
| Contract review checklist | Red flags + required clauses, linked to offer tracker |

### V3 — Community data layer (requires Phase 6 structured community)

| Feature | Description |
|---|---|
| My reports submitted | USCE, interview, match, offer datapoints the user has contributed |
| Community aggregate views | See anonymous aggregate data from reports (minimum N threshold) |

---

## Account model

**Account creation:**
- Email + password (or magic link)
- No required profile fields at creation
- Optional: name, training stage (MS3/MS4/IMG/Resident/Fellow/Attending), specialty interest

**Training stage (drives personalization later):**
```
MS3 / MS4
IMG — pre-application
IMG — in match cycle
Current resident
Current fellow
New attending
```

**Data ownership:**
- User can export their data (JSON)
- User can delete their account and all associated data
- Reports submitted are retained in anonymized aggregate after account deletion (disclosed at submission)

---

## URL structure

```
/dashboard                   — My Pathway home (requires login)
/dashboard/saved             — Saved programs + pages
/dashboard/applications      — Application tracker
/dashboard/interviews        — Interview tracker
/dashboard/watchlists        — Visa/job + waiver watchlists
/dashboard/reminders         — Deadline reminders
/dashboard/reports           — My submitted reports + status
/dashboard/offers            — Saved offers + comparison
/dashboard/settings          — Account settings, data export, delete
```

---

## Analytics events to add

```
account_created
account_login
saved_program
saved_career_page
application_tracker_started
application_status_updated
interview_tracked
watchlist_added
reminder_set
report_submitted
offer_saved
offer_compared
data_exported
account_deleted
```

---

## Build order

1. Auth scaffold (already has `/auth/signin`, `/auth/signup`)
2. Saved items — programs first (most obvious value, lowest friction)
3. Saved career pages
4. Application tracker — basic status
5. Watchlists + reminders (email delivery)
6. Interview tracker
7. Offer comparison (wire existing tool to account)
8. Report status view (Phase 6 dependency)

---

## Constraints

- No native mobile app until web/PWA has demonstrated daily active use
- No paywalled features
- No advertising inside the dashboard
- No selling user data
- No employer-facing access to individual user data
