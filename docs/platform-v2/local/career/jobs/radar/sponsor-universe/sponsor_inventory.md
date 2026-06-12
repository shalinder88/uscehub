# Sponsor inventory — live count across top DOL sponsors

Each row is a KNOWN DOL physician H-1B sponsor resolved to its own ATS. 'physicianCount' is
the live count of 'physician' openings at that employer (Workday CXS / Greenhouse), every one
a sponsor-backed J-1/H-1B lead. iCIMS/Oracle (json-ld) are reachable via the JSON-LD reader.

## Totals
- Sponsors probed: 67
- Resolved to a no-auth JSON API (Workday/Greenhouse): 13
- Live-counted: 9
- **Physician openings reachable RIGHT NOW (json-api only): 3212**
- Additional sponsors reachable via JSON-LD (iCIMS/Oracle, fetch path = next build): 16

## Per sponsor
| Employer | ATS | Reach | Physician openings | Handle |
|---|---|---|---|---|
| Cleveland Clinic | workday | json-api | 1008 | ccf/wd1/clevelandcliniccareers |
| Ochsner Health | workday | json-api | 780 | ochsner/wd1/ochsner |
| Thomas Jefferson University Hospitals | workday | json-api | 402 | jeffersonhealth/wd5/thomasjeffersonexternal |
| Presbyterian Healthcare Services NM | workday | json-api | 307 | phsorg/wd1/careers |
| Vanderbilt University Medical Center | workday | json-api | 255 | vumc/wd1/vumccareers |
| UPMC | workday | json-api | 194 | gohealthuc/wd12/external |
| Stanford Health Care | workday | json-api | 146 | stanfordmedicine/wd115/shc_external_career_site |
| University of Arkansas for Medical Sciences | workday | json-api | 100 | uasys/wd5/uams_all_careers |
| Memorial Sloan Kettering | workday | json-api | 20 | msk/wd108/mskcc_careers_primary |
| Mayo Clinic | oracle_hcm | json-ld |  |  |
| Icahn School of Medicine at Mount Sinai | icims | json-ld |  | www |
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
| Northwell Health | unknown | none |  |  |
| BronxCare Health System | unknown | none |  |  |
| NYC Health and Hospitals | unknown | none |  |  |
| Rochester General Hospital | workday | json-api |  | rrhs/wd5/login |
| Mercy Health - St. Vincent | phenom | json-ld |  |  |
| OSF Multi-Specialty Group | unknown | none |  |  |
| USACS Medical Group | unknown | none |  |  |
| IU Health Care Associates | unknown | none |  |  |
| Froedtert Health | phenom | json-ld |  |  |
| Corewell Health | unknown | none |  |  |
| MedStar Health | unknown | none |  |  |
| Atlantic Health System | oracle_hcm | json-ld |  |  |
| WellSpan Health | unknown | none |  |  |
| Hartford HealthCare | unknown | none |  |  |
| Lifespan Health System | unknown | none |  |  |
| Baystate Health | unknown | none |  |  |
| Boston Children's Hospital | unknown | none |  |  |
| University of Alabama Birmingham Medicine | icims | json-ld |  | careers-uabmedicine |
| Medical University of South Carolina | unknown | none |  |  |
| Oregon Health and Science University | icims | json-ld |  | www |
| UC Health Colorado | unknown | none |  |  |
| Marshfield Clinic | workday | json-api |  | sanford/wd5/login |
| Essentia Health | unknown | none |  |  |
| Guthrie Clinic | oracle_hcm | json-ld |  |  |
| Hospital for Special Surgery | unknown | none |  |  |
| Roswell Park Comprehensive Cancer Center | unknown | none |  |  |
| UT Southwestern Medical Center | taleo | json-ld |  |  |
| University of Kansas Medical Center | workday | json-api |  | kumc/wd5/kumc |
| University of Wisconsin Health | unknown | none |  |  |
