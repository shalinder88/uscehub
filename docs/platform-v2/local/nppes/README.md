# P98-1: NPPES V2 Internal Ingest

**Built:** 2026-05-03  
**Source:** NPPES April 2026 V2 (CMS, download.cms.gov/nppes)  
**Script:** `ingest_nppes.py`

## What's here

| File | Description |
|------|-------------|
| `nppes_orgs.duckdb` | 1,917,366 org (Type-2) NPI records. 28-column slim schema. Indexes on npi, pl_state, pl_zip, taxonomy_1. ~380 MB. |
| `orgs_slim.csv` | Same 28-column dataset as CSV for non-DuckDB consumers. 377 MB. |
| `sanity_report.json` | Row counts, null rates, state distribution, taxonomy distribution, deactivation stats. |
| `ingest_nppes.py` | Build script. Re-run to rebuild from source on T7. |

## Hard compliance rules

- **Type-2 organizations only.** No individual provider (Type-1) records in this DB.
- **Identity and location evidence only.** NPPES is NOT credential or license verification.
- **NUCC taxonomy codes** are stored internally but taxonomy *definitions/descriptions* require a NUCC commercial license before any public display.
- Source file lives on T7 cold storage. This DB is derived output — the source file is the truth.

## Schema (28 columns)

| Column | Source field |
|--------|-------------|
| npi | NPI |
| org_name | Provider Organization Name (Legal Business Name) |
| other_name | Provider Other Organization Name |
| other_name_type | Provider Other Organization Name Type Code |
| mail_addr1/2, mail_city, mail_state, mail_zip | Mailing address fields |
| pl_addr1/2, pl_city, pl_state, pl_zip, pl_phone | Practice location fields |
| enumeration_date | Provider Enumeration Date |
| last_update_date | Last Update Date |
| deactivation_date / reactivation_date | NPI status dates |
| taxonomy_1 through taxonomy_5 | Healthcare Provider Taxonomy Code_1–5 |
| taxonomy_1_primary | Healthcare Provider Primary Taxonomy Switch_1 |
| is_subpart | Is Organization Subpart |
| parent_org_name / parent_org_tin | Parent Organization LBN/TIN |

Excluded from slim: EIN, authorized official PII, other provider identifier columns (50×4 = 200 cols).

## Key stats

- **Total org NPIs:** 1,917,366
- **Active (not deactivated):** 1,914,967
- **Acute care hospitals (282N*):** 16,953
- **FQHCs (261QF*):** 14,120
- **Org subparts (is_subpart=Y):** 155,549
- **Null rate on key fields:** 0% across org_name, pl_city, pl_state, pl_zip, taxonomy_1

## How to query

```python
import duckdb
con = duckdb.connect("nppes_orgs.duckdb", read_only=True)

# FQHCs in Maine
con.execute("""
    SELECT npi, org_name, pl_addr1, pl_city, pl_zip, taxonomy_1
    FROM nppes_orgs
    WHERE pl_state = 'ME' AND taxonomy_1 LIKE '261QF%'
    ORDER BY pl_city
""").df()

# All hospitals in a city
con.execute("""
    SELECT npi, org_name, pl_addr1, pl_zip
    FROM nppes_orgs
    WHERE pl_state = 'ME' AND taxonomy_1 LIKE '282N%'
""").df()
```

## Rebuild

```bash
python3 ingest_nppes.py
# or with custom source path:
python3 ingest_nppes.py --source /path/to/NPPES_organizations_only.csv
```

## Next steps (P98-2)

P98-2 will run the institution ↔ NPPES matcher against validated institutions
from P97 (starting with Maine), using deterministic scoring:
VERIFIED_EXACT_NPI → EXACT_NAME_ZIP → EXACT_NAME_CITY → FUZZY_NAME_ZIP → NO_MATCH.
