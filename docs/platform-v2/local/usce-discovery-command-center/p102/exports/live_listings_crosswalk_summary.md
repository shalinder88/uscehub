# P102 Live Listings Crosswalk — Decision Summary

Generated: 2026-05-17
Live listings analyzed: 206
New source-linked rows (no live match): 14

## Decision tally

| Decision | Count |
|---|---:|
| LIVE_ROW_NEEDS_REVERIFY | 95 |
| LIVE_ROW_SHOULD_HIDE_OR_DOWNRANK | 72 |
| MATCH_UPDATE_WITH_SOURCE_QUOTE | 33 |
| NEW_SOURCE_LINKED_ROW | 14 |
| FUTURE_LANE_ONLY | 6 |
| DUPLICATE_HIDE_PREVIEW_ROW | 0 |

## Sample rows by decision

### MATCH_UPDATE_WITH_SOURCE_QUOTE

| Program | State | URL | Reason |
|---|---|---|---|
| Stanford Health Care | CA | https://med.stanford.edu/shctv/education/observership.html | runner returned VALID direct link + strong quote → enrich live row |
| UCLA Medical Center | CA | https://www.uclahealth.org/international-services/medical-ed… | runner returned VALID direct link + strong quote → enrich live row |
| USC Keck Medical Center | CA | https://sites.usc.edu/healthcare-edu/observership/ | runner returned VALID direct link + strong quote → enrich live row |
| Brigham and Women's Hospital | MA | https://www.brighamandwomens.org/radiology/education-and-tra… | runner returned VALID direct link + strong quote → enrich live row |
| University of Illinois at Chicago (UIC) | IL | https://medicine.uic.edu/education/international-education/o… | runner returned VALID direct link + strong quote → enrich live row |

### LIVE_ROW_NEEDS_REVERIFY

| Program | State | URL | Reason |
|---|---|---|---|
| Mount Sinai Hospital | NY | https://www.mountsinai.org/about/international/programs | live URL is a hospital homepage — operator should supply a deeper page URL |
| Montefiore / Albert Einstein | NY | https://montefioreeinstein.org/education/gme | live URL is a hospital homepage — operator should supply a deeper page URL |
| NewYork-Presbyterian / Columbia | NY | https://www.nyp.org/ | live URL is a hospital homepage — operator should supply a deeper page URL |
| NewYork-Presbyterian / Weill Cornell | NY | https://www.nyp.org/ | live URL is a hospital homepage — operator should supply a deeper page URL |
| Mount Sinai Beth Israel | NY | https://www.mountsinai.org/locations/beth-israel/education/g… | live URL is a hospital homepage — operator should supply a deeper page URL |

### LIVE_ROW_SHOULD_HIDE_OR_DOWNRANK

| Program | State | URL | Reason |
|---|---|---|---|
| Jacobi Medical Center | NY | https://www.nychealthandhospitals.org/jacobi/graduate-medica… | direct-link validation INVALID — live row points at non-opportunity page |
| Elmhurst Hospital Center | NY | https://www.nychealthandhospitals.org/elmhurst/graduate-medi… | direct-link validation INVALID — live row points at non-opportunity page |
| Lincoln Medical Center | NY | https://www.nychealthandhospitals.org/lincoln/ | direct-link validation INVALID — live row points at non-opportunity page |
| Harlem Hospital Center | NY | https://www.nychealthandhospitals.org/harlem/ | direct-link validation INVALID — live row points at non-opportunity page |
| Kings County Hospital Center | NY | https://www.nychealthandhospitals.org/kingscounty/ | direct-link validation INVALID — live row points at non-opportunity page |

### FUTURE_LANE_ONLY

| Program | State | URL | Reason |
|---|---|---|---|
| NYU Langone Health | NY | https://med.nyu.edu/ | runner triaged REJECT_PHARMACY_OR_ALLIED_HEALTH — not Tier-1 USCE |
| University of Minnesota Medical Center | MN | https://med.umn.edu/gme | runner triaged REJECT_GME_ONLY — not Tier-1 USCE |
| University of Virginia Health System | VA | https://med.virginia.edu/ | runner triaged REJECT_GME_ONLY — not Tier-1 USCE |
| Medical University of South Carolina (MUSC) | SC | https://web.musc.edu/ | runner triaged REJECT_CAREERS_JOBS_ONLY — not Tier-1 USCE |
| Duke University — Postdoctoral Research | NC | https://postdoc.duke.edu/ | runner triaged REJECT_CAREERS_JOBS_ONLY — not Tier-1 USCE |

### NEW_SOURCE_LINKED_ROW

| Program | State | URL | Reason |
|---|---|---|---|
| (no live match) | MA | https://www.bmc.org/ear-nose-and-throat-department/residency… | exact-seed row with no live URL match in data.js |
| (no live match) | NY | https://hss.edu/education-institute/academic-visitor-program | exact-seed row with no live URL match in data.js |
| (no live match) | NY | https://mskcc.org/medical-students | exact-seed row with no live URL match in data.js |
| (no live match) | FL | https://orlandohealth.com/medical-professionals/graduate-med… | exact-seed row with no live URL match in data.js |
| (no live match) | AL | https://uab.edu/medicine/international/international-program… | exact-seed row with no live URL match in data.js |

