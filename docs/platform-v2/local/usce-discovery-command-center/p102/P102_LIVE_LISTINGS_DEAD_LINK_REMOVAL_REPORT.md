# P102 Live Listings — Dead-Link Removal Report

Generated: 2026-05-16  
Branch: `local/p102-live-site-crosscheck-exact-links`  
Parent commit: `72432b3`

---

## TL;DR

- One-by-one re-probed every non-OK live source URL (152 distinct URLs)
- Cross-verified Node fetch failures with curl to filter false positives
- **12 confirmed-dead programs** added to `prisma/listings-hidelist.ts`
- 6 programs are PROTECTED (bot-blocked but page exists) — **kept**
- 6 Node-fetch failures were **false positives** — those URLs are alive, not added to hide list
- 1 program (ValueMD) returns 401 (auth-required) — borderline, **kept**
- Seed flow now consults the hide list; dry-run shows 207 → 195 listings after applying

---

## Re-probe methodology

For each of 152 distinct URLs:
1. Real-browser Safari UA, GET request, 12s timeout, follow redirects
2. If first attempt returned 0 / 429 / 5xx → wait 4s and retry once
3. Classify: OK / DEAD / PROTECTED / TRANSIENT / OTHER
4. Cross-verify any Node "DEAD" with curl (Node fetch is stricter about TLS — some sites that Node rejects work fine in curl)

| Result | Count |
|---|---:|
| OK (200 on first or retry) | 127 |
| OK_NODE_FALSE_POSITIVE (curl proved alive) | 6 |
| DEAD (404 / network confirmed dead) | 12 |
| PROTECTED (403 Cloudflare/bot-block) | 6 |
| OTHER (401 auth-required) | 1 |

---

## The 12 confirmed-dead programs (removed)

| Program | State | URL | Why dead | Follow-up |
|---|---|---|---|---|
| Maimonides Medical Center | NY | maimonides.org/gme/ | HTTP 404 | REORIENT (institution alive, GME path moved) |
| Loyola University Medical Center | IL | ssom.luc.edu/gme/ | HTTP 404 | REORIENT |
| UF Health / Shands Hospital | FL | hr.med.ufl.edu/volunteers/onserving-shadowing-application-process/ | HTTP 404 (note: "onserving" looks like a typo) | REORIENT |
| UPMC | PA | dom.pitt.edu/education/eop/ | HTTP 404 | REORIENT |
| Cleveland Clinic — Research Fellowship | OH | …/postdoctoral-programs | HTTP 404 | REORIENT |
| Cedars-Sinai — Research Fellowship | CA | …/research/training/postdoctoral.html | HTTP 404 | REORIENT |
| Interfaith Medical Center | NY | interfaithmedical.org/graduate-medical-education | TLS/network dead | PERMANENT (filed bankruptcy 2023, absorbed by One Brooklyn Health) |
| Brookdale University Hospital | NY | brookdalehospital.org/gme | TLS/network dead | REORIENT (now One Brooklyn Health) |
| Kingsbrook Jewish Medical Center | NY | kingsbrook.org/ | TLS/network dead | PERMANENT (merged into One Brooklyn Health) |
| Emory — Postdoctoral Research | GA | postdocs.emory.edu/ | TLS/network dead | REORIENT (subdomain retired) |
| Global Medical Foundation — USCE Programs | MULTI | globalmedicalfoundation.com/ | Third-party aggregator dead | PERMANENT |
| Clinical Experience Programs (CEP) — IMG Rotations | MULTI | clinicalexperienceprograms.com/ | Third-party paid-USCE provider dead | PERMANENT |

**Breakdown:**
- 6 HTTP 404 (institutional URLs retired — likely reorientable)
- 4 TLS/network dead (mostly hospitals that wound down or merged)
- 2 third-party aggregator dead
- Follow-up: 8 REORIENT, 4 PERMANENT

---

## The 6 PROTECTED programs (kept — page exists, bot-blocked)

Not added to hide list. The URLs work in a real browser; they 403 only against automated fetchers. Operator can verify these manually.

| Program | URL |
|---|---|
| Johns Hopkins Hospital | hopkinsmedicine.org/volunteer-services/observerships |
| University of Michigan Health | medicine.umich.edu/ |
| NIH Clinical Center — Postdoctoral Research | training.nih.gov/programs/postdoctoral_irta |
| Johns Hopkins — Postdoctoral Research | hopkinsmedicine.org/research/resources/postdoctoral |
| University of Michigan — Research Fellowship | medicine.umich.edu/medschool/research/postdoctoral |
| Hennepin Healthcare — Minneapolis | hennepinhealthcare.org/ |

---

## The 6 Node-fetch false positives (kept — curl confirms alive)

Node's fetch failed on these but curl returned 200. Cause: Node 22's stricter TLS handling. **Not added to hide list.**

- bannerhealth.com — curl 200
- bidmc.org/medical-education/graduate-medical-education — curl 200
- conemaugh.org — curl 200
- towerhealth.org — curl 200
- hsi.ucsd.edu/education/physicians/bridge-to-residency-program-for-physicians — curl 200
- hsi.ucsd.edu/education/physicians/enhanced-clinical-skills — curl 200

(The exact-link runner uses Node fetch, so these will fail in the runner pipeline. Operator should be aware; a curl-based fetcher would catch them.)

---

## The 1 OTHER (ValueMD)

| Program | URL | Status |
|---|---|---|
| ValueMD Clinical Rotations | valuemd.com/clinical-rotations/ | HTTP 401 (login required) |

Borderline. The site exists and is alive, but the rotation listings sit behind auth. **Not added to hide list.** Operator decision: is this kind of paid-aggregator content something to keep on the platform at all?

---

## What changed in the codebase

```
prisma/listings-hidelist.ts          NEW — 12 hidden programs, with classification + follow-up
prisma/seed.ts                       MOD — consults hidelist before creating each listing
```

### Dry-run output (no DB mutation)

```
Total programs in data.js: 207
Hidden by hidelist:        12
Expected listings after hide: 195

Hide-list stats: {
  total: 12,
  byClass: { HTTP_404: 6, TLS_NETWORK_DEAD: 4, AGGREGATOR_DEAD: 2 },
  byFollowUp: { REORIENT: 8, PERMANENT: 4 }
}
```

---

## Reversal / re-inclusion

To re-include a hidden program (e.g. operator found a replacement URL):

1. Add the new URL to `prisma/verified-links.ts` under the same program name
2. Delete the entry from `prisma/listings-hidelist.ts`
3. Next seed run will create the listing using the new URL

No production DB write happens here — only the local seed flow is affected. Production listings already in the live DB are not deleted by this change.

---

## 8 programs ready for operator reorientation

These have follow-up = REORIENT (institution is alive, URL path moved):

| Program | Suggested next step |
|---|---|
| Maimonides Medical Center | Check `maimonidesmc.org` and `maimo.org` for the current GME URL |
| Loyola University Medical Center | Check `loyolamedicine.org` / `luhs.org` for the current observership URL |
| UF Health / Shands Hospital | Try `https://med.ufl.edu/` for the volunteer / observership program |
| UPMC | Check `upmc.com/about/why-upmc/careers` or `dom.pitt.edu` current paths |
| Cleveland Clinic — Research Fellowship | Check Cleveland Clinic Lerner Research Institute (new path) |
| Cedars-Sinai — Research Fellowship | Check `cedars-sinai.org/education/medical-education/postdoctoral.html` |
| Brookdale University Hospital | Check the One Brooklyn Health website for the consolidated program |
| Emory — Postdoctoral Research | Check `gradschool.emory.edu` or main `emory.edu` for the postdoc program |

These do not need to ship at once. The hide list keeps them out of the seed until the operator finds a replacement URL.

---

## Validators

```
tsc --noEmit: clean
validate-no-secrets: 0 findings across 6441 files
p102-validate-exact-seed-rows: 21/21 pass
p102-validate-intelligent-opportunity-rows: 19/19 pass
```

---

## What this DOES NOT do

- No production DB writes — the hide list affects only local `prisma db seed` runs
- No mutation of the sibling `usmle-observerships/data.js` (per the "work only inside /Users/shelly/usmle-platform" rule)
- No removal of the 72 weak/generic live URLs that the runner flagged (those need operator reverification, not removal)
- No removal of the 6 PROTECTED bot-blocked entries (page exists, just bot-blocked)
- No deploy, no push

---

## Recommendation

Next operator action (in priority order):

1. **Run `prisma db seed` locally** to verify the hide list cleanly produces 195 listings.
2. **Triage the 8 REORIENT entries** above. Even finding 4 replacement URLs adds 4 listings back.
3. **For the 95 LIVE_ROW_NEEDS_REVERIFY rows** from the prior crosswalk (hospital homepages / generic landing pages): these are different from the 12 dead. The URL works; it just isn't an opportunity-specific page. These need operator-supplied deeper URLs, same workflow as REORIENT.
4. **For the 72 LIVE_ROW_SHOULD_HIDE_OR_DOWNRANK rows**: consider a soft-hide flag on the Listing model (`sourceQualityDowngrade: boolean`) rather than full deletion. Schema migration deferred.
