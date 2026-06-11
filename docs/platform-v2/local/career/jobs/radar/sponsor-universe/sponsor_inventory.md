# Sponsor inventory — live count across top DOL sponsors

Each row is a KNOWN DOL physician H-1B sponsor resolved to its own ATS. 'physicianCount' is
the live count of 'physician' openings at that employer (Workday CXS / Greenhouse), every one
a sponsor-backed J-1/H-1B lead. iCIMS/Oracle (json-ld) are reachable via the JSON-LD reader.

## Totals
- Sponsors probed: 36
- Resolved to a no-auth JSON API (Workday/Greenhouse): 8
- Live-counted: 7
- **Physician openings reachable RIGHT NOW (json-api only): 2522**
- Additional sponsors reachable via JSON-LD (iCIMS/Oracle, fetch path = next build): 8

## Per sponsor
| Employer | ATS | Reach | Physician openings | Handle |
|---|---|---|---|---|
| Cleveland Clinic | workday | json-api | 1004 | ccf/wd1/clevelandcliniccareers |
| Ochsner Health | workday | json-api | 786 | ochsner/wd1/ochsner |
| Vanderbilt University Medical Center | workday | json-api | 262 | vumc/wd1/vumccareers |
| UPMC | workday | json-api | 192 | gohealthuc/wd12/external |
| Stanford Health Care | workday | json-api | 152 | stanfordmedicine/wd115/shc_external_career_site |
| University of Arkansas for Medical Sciences | workday | json-api | 104 | uasys/wd5/uams_all_careers |
| Memorial Sloan Kettering | workday | json-api | 22 | msk/wd108/mskcc_careers_primary |
| Mayo Clinic | oracle_hcm | json-ld |  |  |
| Icahn School of Medicine at Mount Sinai | unknown | none |  |  |
| Emory University | icims | json-ld |  | www |
| Banner Health | unknown | none |  |  |
| Montefiore Medical Center | unknown | none |  |  |
| University of Iowa | unknown | none |  |  |
| Mass General Brigham | unknown | none |  |  |
| Duke University | successfactors | json-ld |  |  |
| Yale New Haven Health | unknown | none |  |  |
| University of Michigan | unknown | none |  |  |
| Henry Ford Health | unknown | none |  |  |
| Baylor College of Medicine | successfactors | json-ld |  |  |
| Northwestern Medicine | unknown | none |  |  |
| UCSF | oracle_hcm | json-ld |  |  |
| Johns Hopkins Medicine | successfactors | json-ld |  |  |
| Penn Medicine | unknown | none |  |  |
| Geisinger | unknown | none |  |  |
| Houston Methodist | unknown | none |  |  |
| Indiana University | unknown | none |  |  |
| University of Florida | unknown | none |  |  |
| Rochester Regional Health | workday | json-api |  | rrhs/wd5/login |
| Maimonides Medical Center | unknown | none |  |  |
| Rush University Medical Center | unknown | none |  |  |
| University of Maryland Medical System | phenom | json-ld |  |  |
| Wayne State University | unknown | none |  |  |
| University of Texas Medical Branch | unknown | none |  |  |
| SUNY Upstate Medical University | unknown | none |  |  |
| University of Kentucky | unknown | none |  |  |
| Tufts Medical Center | phenom | json-ld |  |  |
