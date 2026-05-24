# P102 Final Link Truth Reconciliation

Generated: 2026-05-17
Branch: `local/p102-final-reconciliation-display-readiness`
Latest reconciled commit: `f658b43` (HEAD of parent branch `local/p102-borderline-one-by-one-reorientation`)

**No push. No deploy. No PR. No production DB mutation. No schema migration. No production seed run.**

---

## 1. Purpose

This document closes out the P102 borderline one-by-one link-truth campaign by
fixing what each row in `usmle-observerships/data.js` is allowed to do on the
live USCEHub site. It is the single source of truth for the buckets and rules
that the display-eligibility export script (Phase C) and validator (Phase D)
will enforce.

This is the bridge from "audit complete" to "site shows only what we can
defend."

---

## 2. The 11 batch commits

| Batch | Commit | Scope |
|---|---|---|
| 1 | `719de26` | Packets 1–10 (foundational verifications, fixed prior batch key-mismatch problem) |
| 2 | `b912931` | Packets 11–20 |
| 3 | `a4ca9a1` | Packets 21–30 |
| 4 | `d9f68e9` | Packets 31–40 |
| 5 | `b4ad8ce` | Packets 41–50 |
| 6 | `36731b3` | Packets 51–60 |
| 7 | `50dca78` | Packets 61–70 |
| 8 | `bdf09ad` | Packets 71–80 (Mt Sinai Beth Israel PROTECTED; first packet to use Hopkins precedent) |
| 9 | `afdfca3` | Packets 81–90 (Hartford upgrade; VCU + U Utah PROTECTED) |
| 10 | `c48e936` | Packets 91–100 (new `THIRD_PARTY_BROKER` hidelist classification; Brooklyn USCE / AMG / ValueMD hidden) |
| 11 | `f658b43` | Packets 101–107 (queue exhausted; Clinical Experience Programs Multi-Site hidden) |

Plus 4 earlier non-one-by-one commits that established the corrective taxonomy:

- `1c14d21` — third-pass reorientation
- `f31b44e` — second-pass reorientation
- `af6b98f` — initial 16-row reorientation
- `38bb54e` — the 11-state per-listing classifier itself

---

## 3. Final classification counts (n=207 across all data.js rows)

| Classification | Count | Counts as true USCE | Display lane |
|---|---:|:---:|---|
| `DIRECT_TRUE_USCE_LINK` | 105 | yes | Clinical USCE |
| `MOVED_REORIENTED_TO_TRUE_USCE_LINK` | 63 | yes | Clinical USCE |
| `PROTECTED_BROWSER_REQUIRED` | 2 | yes (Hopkins precedent) | Clinical USCE (with badge) |
| `RESEARCH_VALID_INSTITUTIONAL_PATHWAY` | 9 | no | Research lane only |
| `RESEARCH_TOO_GENERIC_REVERIFY` | 7 | no | Hold (research-reverify) |
| `BORDERLINE_KEEP_REVERIFY` | 3 | no | Hold (outreach) |
| `BROKEN_REQUIRES_MANUAL_BROWSER` | 3 | no | Hold (manual browser) |
| `NO_PROGRAM_FOUND_HIDE` | 14 | no | Hidden |
| `NEGATIVE_INFO_ROW_KEEP_OR_SEPARATE` | 1 | no | Archive (not active) |
| **Total** | **207** | | |

**True clinical USCE total: 170** (105 + 63 + 2)

---

## 4. What counts as true clinical USCE (display-eligible)

A row counts as true clinical USCE — and qualifies for the clinical-USCE
display lane — if and only if all of these are true:

1. Its classification is one of `DIRECT_TRUE_USCE_LINK`,
   `MOVED_REORIENTED_TO_TRUE_USCE_LINK`, or `PROTECTED_BROWSER_REQUIRED`.
2. Its `finalUrl` is a verified institutional URL that leads to a real M4
   visiting student / observership / sub-I / externship / clerkship / IMG
   observership / international visiting student pathway.
3. Its `verified-links.ts` entry uses an EXACT match for the `program.name`
   field in `data.js` so the seed lookup actually fires.
4. It is not on `prisma/listings-hidelist.ts`.

`PROTECTED_BROWSER_REQUIRED` rows do count as true USCE — they are real
URLs that work in a real browser; only Node fetch / WebFetch is blocked
(typically Cloudflare / WAF). This follows the Hopkins precedent established
in the corrective classifier commit (`38bb54e`).

---

## 5. What counts as research only

Research rows are kept separate from clinical USCE — never mixed into the
clinical count.

- `RESEARCH_VALID_INSTITUTIONAL_PATHWAY` (n=9) — display-eligible in the
  research lane only. These are NIH/Harvard/Hopkins/Stanford/Michigan/Duke/
  UCSF/Penn/Yale postdoctoral pages. Not appropriate for the clinical USCE
  count or for IMG observership-seeker discovery.
- `RESEARCH_TOO_GENERIC_REVERIFY` (n=7) — held out of the research display
  until the operator supplies a deeper, more specific research-office URL.

---

## 6. What is hidden (14 rows)

These rows do not display as active opportunities anywhere. The hidelist
is `prisma/listings-hidelist.ts`. Categories:

**Dead infrastructure (TLS_NETWORK_DEAD / HTTP_404)** — 4 rows:
- Interfaith Medical Center (One Brooklyn Health absorption, original
  domain dead)
- Brookdale University Hospital (same)
- Kingsbrook Jewish Medical Center (same)
- Flushing Hospital Medical Center (confirmed via FAQ: observership/
  externship positions are not offered)

**Negative informational** — surfaced as `NEGATIVE_INFO_ROW_KEEP_OR_SEPARATE`
but also exists on hidelist for the second Flushing entry — 1 row.

**Research-only programs (HTTP_404 / TLS, reclassified PERMANENT)** — 3 rows:
- Cleveland Clinic — Research Fellowship
- Cedars-Sinai — Research Fellowship
- Emory University — Postdoctoral Research

**Aggregator-dead third-party brokers (site dead)** — 2 rows:
- Global Medical Foundation — USCE Programs
- Clinical Experience Programs (CEP) — IMG Rotations

**Third-party brokers (site alive, out of scope)** — 4 rows added in batches
10–11 under the new `THIRD_PARTY_BROKER` classification:
- AMG Medical Group — Clinical Rotations (actually a Direct Primary Care
  membership clinic, not a USCE provider)
- ValueMD Clinical Rotations (Caribbean-medical-school forum, not a rotation
  arranger)
- Brooklyn USCE — Clinical Rotations (physician-owned private-clinic
  placement service)
- Clinical Experience Programs — Multi-Site (data.js link is literal `#`)

---

## 7. What remains unresolved

**3 BORDERLINE_KEEP_REVERIFY (intentional outreach hold)** — held out of
active display until phone outreach:

| Institution | Reason | Next action |
|---|---|---|
| Jamaica Hospital Medical Center (×2 data.js entries) | GME page lists residencies only; no public M4 visiting page on jamaicahospital.org | Phone outreach to Department of Medical Education |
| Richmond University Medical Center | GME page lists residencies only; no public M4 visiting page on rumcsi.org | Phone outreach to GME office at 844-934-2273 |

**3 BROKEN_REQUIRES_MANUAL_BROWSER** — held out of active display until
manual browser verification:

| Institution | URL | Issue |
|---|---|---|
| Beth Israel Deaconess Medical Center | `bidmc.org/medical-education/graduate-medical-education` | Network failure not from 403 — needs in-browser confirmation |
| Advocate Christ Medical Center (×2 data.js entries) | `advocatehealth.com/` | Network failure not from 403 — needs in-browser confirmation |

**7 RESEARCH_TOO_GENERIC_REVERIFY** — held out of research display until
operator supplies a deeper research-office URL:

| Institution | Current URL |
|---|---|
| Mayo Clinic — Research Fellowship | `college.mayo.edu/` |
| Mount Sinai — Postdoctoral Research | `icahn.mssm.edu/` |
| University of Pittsburgh — Postdoctoral Research | `postdoc.pitt.edu/` |
| Fred Hutchinson Cancer Center | `fredhutch.org/` |
| Baylor College of Medicine — Postdoctoral Research | `bcm.edu/` |
| Northwestern Feinberg — Postdoctoral Research | `feinberg.northwestern.edu/` |
| Albert Einstein College of Medicine — Research Fellowship | `einsteinmed.edu/` |

**1 NEGATIVE_INFO_ROW_KEEP_OR_SEPARATE** — already documented as
"does not offer observerships":

| Institution | URL | Note |
|---|---|---|
| Cook County Hospital (Stroger) | `cookcountyhealth.org/` | Confirmed negative — archive only, do not display as opportunity |

Plus **Conemaugh Memorial Medical Center** (verified-links entry indicates
no observerships per official statement; lives under
`NEGATIVE_INFO_ROW_KEEP_OR_SEPARATE` in some earlier classifier runs and
under `NO_PROGRAM_FOUND_HIDE` after the second hidelist pass; the
current state shows 1 negative-info row and Conemaugh's verified-links
entry handles it).

---

## 8. What should display publicly (in the local preview)

**Clinical USCE lane** — 170 rows, classifications DIRECT / REORIENTED /
PROTECTED. Sourced from the classifier's `countsAsTrueUSCE: true` flag.

For each row, the preview should expose:
- Institution name (exact `program.name` from data.js)
- `finalUrl` (the verified institutional URL — never the homepage if a
  reoriented direct page exists)
- Classification badge: `DIRECT`, `REORIENTED`, or `PROTECTED`
- Provenance note (from `prisma/verified-links.ts`'s `note` field) — includes
  audience, application path, INTL status, cost, evidence quote

**Research lane** — 9 rows with classification
`RESEARCH_VALID_INSTITUTIONAL_PATHWAY`. Displayed separately, never mixed
into the clinical count.

For each research row:
- Institution name
- `finalUrl` (institutional postdoctoral page)
- Classification badge: `RESEARCH`
- Honest description: research / postdoctoral pathway, not clinical USCE

---

## 9. What should not display as active opportunity

- 14 hidden rows (any category)
- 3 outreach holds (until phone confirmed)
- 7 research-reverify rows (until better URL supplied)
- 3 broken/manual-browser rows (until in-browser check)
- 1 negative informational row (Cook County; archive only)

Total held out of active display: **28 rows** (14 + 3 + 7 + 3 + 1).

207 total – 28 held – 9 research lane = **170 active clinical USCE
display-eligible**.

---

## 10. What needs phone outreach

3 rows. Same as section 7 outreach hold list.

Operator action: call Jamaica Hospital Medical Center's Department of
Medical Education and Richmond University Medical Center's GME office.
Either confirm a real M4 visiting/observership program (then add to
`prisma/verified-links.ts` with the URL we receive) or confirm no such
program exists (then move to `prisma/listings-hidelist.ts` with
`HTTP_404` or `NEGATIVE_INFO_ROW_KEEP_OR_SEPARATE` classification).

---

## 11. What needs research URL reverify

7 rows. Same as section 7 research-reverify list. Operator (or a future
research-focused pass) needs to find a deeper institutional URL for each
— the postdoctoral office, T32 program portal, or similar — that is
specific enough to count as a real research pathway. Until then they
stay held.

---

## 12. What needs manual browser check

3 rows. Same as section 7 broken list. The classifier showed network
failure not from a 403 (so it isn't a clean Cloudflare/WAF block; the
Hopkins precedent doesn't automatically apply). Operator should open
each in Chrome — if the page loads with a real visiting-student
pathway, promote to `MOVED_REORIENTED_TO_TRUE_USCE_LINK` with the
discovered URL; if it doesn't, decide between hide-list or borderline
hold.

---

## 13. No-push / no-deploy / no-DB-mutation confirmation

- No production DB mutation will result from this reconciliation.
- No schema migration is being authored.
- `npx prisma db push` will not be executed.
- `npx prisma migrate dev` will not be executed.
- Production seed will not be re-run.
- Branch `local/p102-final-reconciliation-display-readiness` is local
  only; no `git push` will be executed in this sprint.
- No PR will be opened from this branch in this sprint.
- No `vercel deploy` / `vercel --prod` / production deploy will be
  executed.
- No SEO / sitemap / robots / metadata changes.

The only side effects of this sprint:
1. New documents under `docs/platform-v2/local/usce-discovery-command-center/p102/`
2. New scripts under `scripts/p102-build-display-eligibility-export.ts`
   and `scripts/p102-validate-display-eligibility-export.ts`
3. New export JSON files under `docs/platform-v2/local/usce-discovery-command-center/p102/exports/`
4. Possibly a local preview adapter under `src/` (if safe — see Phase E)
5. Local-only git commit on the new branch

All exports + docs are committed-but-local.
