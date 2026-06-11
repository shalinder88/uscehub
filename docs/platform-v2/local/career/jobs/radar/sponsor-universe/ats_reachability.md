# Sponsor ATS Reachability — top 22 sponsors (live probe)

Employer-direct reachability of the head of the sponsor universe. Detection only — no
openings were fetched. 'json-api' = no-auth JSON (Workday/Greenhouse/Lever/Ashby);
'json-ld' = read schema.org JobPosting off the posting pages (iCIMS/Oracle/Taleo);
'none' = ATS not detected from the landing page (often a JS shell — may still be json-ld).

## Reachability
- json-api (clean API): 6 (27.3%)
- json-ld (universal reader): 4 (18.2%)
- none/unknown from landing: 12 (54.5%)
- **employer-direct reachable (api+json-ld): 10 (45.5%)**

## ATS breakdown
- unknown: 12
- workday: 6
- successfactors: 2
- oracle_hcm: 1
- icims: 1

## Per-sponsor
| Employer | ATS | Reach | Handle |
|---|---|---|---|
| Mayo Clinic | oracle_hcm | json-ld |  |
| Mass General Brigham | unknown | none |  |
| University of Arkansas for Medical Sciences | workday | json-api | uasys/wd5/uams_all_careers |
| Montefiore Medical Center | unknown | none |  |
| University of Iowa | unknown | none |  |
| Emory University | icims | json-ld | www |
| Icahn School of Medicine at Mount Sinai | unknown | none |  |
| Cleveland Clinic | workday | json-api | ccf/wd1/clevelandcliniccareers |
| Banner Health | unknown | none |  |
| Memorial Sloan Kettering | workday | json-api | msk/wd108/mskcc_careers_primary |
| Maimonides Medical Center | unknown | none |  |
| Indiana University | unknown | none |  |
| Rochester Regional Health | workday | json-api | rrhs/wd5/login |
| University of Florida | unknown | none |  |
| WVU Medicine | workday | json-api | wvumedicine/wd1/wvuh |
| UPMC | workday | json-api | gohealthuc/wd12/external |
| Duke University | successfactors | json-ld |  |
| Yale New Haven Health | unknown | none |  |
| University of Michigan | unknown | none |  |
| Henry Ford Health | unknown | none |  |
| Baylor College of Medicine | successfactors | json-ld |  |
| University of Minnesota | unknown | none |  |

## JSON-LD reader self-test:
  JobPosting objects extracted: 1
  mapped -> employer=Rural Health Partners title=Family Medicine Physician state=ND sourceId=jsonld-test-REQ-55821
  engine -> status=PUBLISH labels=[EXPLICIT_J1_WAIVER,EXPLICIT_H1B] quotes=["J-1 visa waiver","H-1B sponsorship"]
  quote-offset valid: true
  RESULT: PASS — JSON-LD posting flows to a quote-gated PUBLISH
