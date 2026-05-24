"""
P98-1: NPPES V2 internal ingest
Reads NPPES_organizations_only.csv (Type-2 orgs, 1.9M rows) into DuckDB.
Produces: nppes_orgs.duckdb + sanity_report.json + orgs_slim.csv

Run: python3 ingest_nppes.py [--source PATH_TO_CSV]

Hard rules (from source_rights_ledger):
- Type-2 organizations only (entity_type_code=2)
- No individual provider (Type-1) data
- Identity/location evidence only — not credential/license verification
- NUCC taxonomy codes stored internally but definitions NOT displayed publicly
"""

import argparse
import csv
import json
import os
import sys
import time
from pathlib import Path

import duckdb

DEFAULT_SOURCE = (
    "/Volumes/T7Shield_Code/01_PROJECTS/Health_USMLE_Platform/"
    "03_DATA_OFFLOAD/Residency_Public_Data_2026-05-03/13_NPPES/"
    "NPPES_organizations_only.csv"
)

DB_PATH = Path(__file__).parent / "nppes_orgs.duckdb"
SLIM_CSV_PATH = Path(__file__).parent / "orgs_slim.csv"
REPORT_PATH = Path(__file__).parent / "sanity_report.json"

# Slim column set — identity/location/taxonomy signals only
# Intentionally excludes: EIN, authorized official details, other provider identifiers
SLIM_COLUMNS = {
    "NPI": "npi",
    "Provider Organization Name (Legal Business Name)": "org_name",
    "Provider Other Organization Name": "other_name",
    "Provider Other Organization Name Type Code": "other_name_type",
    "Provider First Line Business Mailing Address": "mail_addr1",
    "Provider Second Line Business Mailing Address": "mail_addr2",
    "Provider Business Mailing Address City Name": "mail_city",
    "Provider Business Mailing Address State Name": "mail_state",
    "Provider Business Mailing Address Postal Code": "mail_zip",
    "Provider First Line Business Practice Location Address": "pl_addr1",
    "Provider Second Line Business Practice Location Address": "pl_addr2",
    "Provider Business Practice Location Address City Name": "pl_city",
    "Provider Business Practice Location Address State Name": "pl_state",
    "Provider Business Practice Location Address Postal Code": "pl_zip",
    "Provider Business Practice Location Address Telephone Number": "pl_phone",
    "Provider Enumeration Date": "enumeration_date",
    "Last Update Date": "last_update_date",
    "NPI Deactivation Date": "deactivation_date",
    "NPI Reactivation Date": "reactivation_date",
    "Healthcare Provider Taxonomy Code_1": "taxonomy_1",
    "Healthcare Provider Primary Taxonomy Switch_1": "taxonomy_1_primary",
    "Healthcare Provider Taxonomy Code_2": "taxonomy_2",
    "Healthcare Provider Taxonomy Code_3": "taxonomy_3",
    "Healthcare Provider Taxonomy Code_4": "taxonomy_4",
    "Healthcare Provider Taxonomy Code_5": "taxonomy_5",
    "Is Organization Subpart": "is_subpart",
    "Parent Organization LBN": "parent_org_name",
    "Parent Organization TIN": "parent_org_tin",
}

# Taxonomy prefixes for healthcare facility types relevant to IMGs
# Source: NUCC taxonomy code set (numeric codes only — NOT definitions, no display)
RELEVANT_TAXONOMY_PREFIXES = {
    "282N": "General Acute Care Hospital",
    "273Y": "Psychiatric Unit",
    "276400": "Rehabilitation Hospital",
    "2865": "Long Term Care Hospital",
    "261Q": "Clinic/Center (FQHC prefix)",
    "261QF": "FQHC",
    "261QR1300X": "Rural Health Clinic",
    "282J": "Religious Nonmedical Health Care Institution",
    "286500": "Military Hospital",
    "V": "Department of Veterans Affairs",
    "207": "Allopathic & Osteopathic Physicians",
}


def ingest(source_path: str) -> dict:
    t0 = time.time()
    print(f"Source: {source_path}")
    print(f"DB:     {DB_PATH}")
    print(f"Slim:   {SLIM_CSV_PATH}")

    if not os.path.exists(source_path):
        sys.exit(f"ERROR: source file not found: {source_path}")

    # Remove existing DB for clean rebuild
    if DB_PATH.exists():
        DB_PATH.unlink()
        print("Removed existing DB for clean rebuild.")

    con = duckdb.connect(str(DB_PATH))

    print("\nStep 1: Load full org CSV into DuckDB...")
    # DuckDB can read CSV directly — much faster than Python row-by-row
    con.execute(f"""
        CREATE TABLE nppes_orgs_raw AS
        SELECT * FROM read_csv_auto(
            '{source_path}',
            header=true,
            quote='"',
            escape='"',
            null_padding=true,
            all_varchar=1
        )
    """)

    raw_count = con.execute("SELECT COUNT(*) FROM nppes_orgs_raw").fetchone()[0]
    print(f"  Loaded {raw_count:,} rows")

    # Verify all entity_type_code=2
    entity_types = con.execute(
        'SELECT "Entity Type Code", COUNT(*) FROM nppes_orgs_raw GROUP BY "Entity Type Code"'
    ).fetchall()
    print(f"  Entity type distribution: {entity_types}")

    non_org = con.execute(
        'SELECT COUNT(*) FROM nppes_orgs_raw WHERE "Entity Type Code" != \'2\''
    ).fetchone()[0]
    if non_org > 0:
        print(f"  WARNING: {non_org} non-Type-2 rows found — filtering out")

    print("\nStep 2: Create slim organizations view...")
    # Build the slim column list dynamically from the CSV header
    with open(source_path, "r", encoding="utf-8") as f:
        raw_header = next(csv.reader(f))

    slim_select_parts = []
    missing_cols = []
    for orig_col, alias in SLIM_COLUMNS.items():
        if orig_col in raw_header:
            slim_select_parts.append(f'"{orig_col}" AS {alias}')
        else:
            missing_cols.append(orig_col)
            slim_select_parts.append(f"NULL AS {alias}")

    if missing_cols:
        print(f"  WARNING: columns not found in source (NULLed): {missing_cols}")

    slim_select = ", ".join(slim_select_parts)
    con.execute(f"""
        CREATE TABLE nppes_orgs AS
        SELECT {slim_select}
        FROM nppes_orgs_raw
        WHERE "Entity Type Code" = '2'
          AND NPI IS NOT NULL
          AND NPI != ''
    """)

    slim_count = con.execute("SELECT COUNT(*) FROM nppes_orgs").fetchone()[0]
    print(f"  Slim table: {slim_count:,} rows, {len(SLIM_COLUMNS)} columns")

    # Create useful indexes
    print("\nStep 3: Creating indexes...")
    con.execute("CREATE INDEX idx_nppes_npi ON nppes_orgs (npi)")
    con.execute("CREATE INDEX idx_nppes_pl_state ON nppes_orgs (pl_state)")
    con.execute("CREATE INDEX idx_nppes_pl_zip ON nppes_orgs (pl_zip)")
    con.execute("CREATE INDEX idx_nppes_taxonomy1 ON nppes_orgs (taxonomy_1)")
    print("  Indexes created.")

    print("\nStep 4: Drop raw table (save space)...")
    con.execute("DROP TABLE nppes_orgs_raw")

    print("\nStep 5: Generate sanity report...")
    report = {}

    report["source_file"] = source_path
    report["db_path"] = str(DB_PATH)
    report["total_orgs"] = slim_count
    report["built_at"] = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    report["schema_version"] = "1.0"
    report["compliance_note"] = (
        "Organization (Type-2) records only. No individual provider data. "
        "Identity/location evidence only. NUCC taxonomy codes stored internally "
        "— definitions NOT for public display without NUCC commercial license."
    )

    # State distribution
    state_dist = con.execute(
        "SELECT pl_state, COUNT(*) AS n FROM nppes_orgs "
        "WHERE pl_state IS NOT NULL AND pl_state != '' "
        "GROUP BY pl_state ORDER BY n DESC LIMIT 20"
    ).fetchall()
    report["top_20_states_by_pl"] = [
        {"state": r[0], "count": r[1]} for r in state_dist
    ]

    # Active vs deactivated
    active = con.execute(
        "SELECT COUNT(*) FROM nppes_orgs WHERE deactivation_date IS NULL OR deactivation_date = ''"
    ).fetchone()[0]
    deactivated = slim_count - active
    report["active_orgs"] = active
    report["deactivated_orgs"] = deactivated

    # Primary taxonomy distribution (top 20)
    tax_dist = con.execute(
        "SELECT taxonomy_1, COUNT(*) AS n FROM nppes_orgs "
        "WHERE taxonomy_1 IS NOT NULL AND taxonomy_1 != '' "
        "GROUP BY taxonomy_1 ORDER BY n DESC LIMIT 20"
    ).fetchall()
    report["top_20_taxonomy_codes"] = [
        {"taxonomy_code": r[0], "count": r[1]} for r in tax_dist
    ]

    # Hospital-type org count (282N* = general acute care hospital)
    hospital_count = con.execute(
        "SELECT COUNT(*) FROM nppes_orgs WHERE taxonomy_1 LIKE '282N%'"
    ).fetchone()[0]
    report["acute_care_hospital_count_taxonomy_282N"] = hospital_count

    # FQHC count (261QF* prefix)
    fqhc_count = con.execute(
        "SELECT COUNT(*) FROM nppes_orgs WHERE taxonomy_1 LIKE '261QF%'"
    ).fetchone()[0]
    report["fqhc_count_taxonomy_261QF"] = fqhc_count

    # Orgs with subpart=Y
    subpart_count = con.execute(
        "SELECT COUNT(*) FROM nppes_orgs WHERE is_subpart = 'Y'"
    ).fetchone()[0]
    report["is_subpart_y_count"] = subpart_count

    # Column null rates for key fields
    null_rates = {}
    for col in ["org_name", "pl_city", "pl_state", "pl_zip", "taxonomy_1"]:
        null_n = con.execute(
            f"SELECT COUNT(*) FROM nppes_orgs WHERE {col} IS NULL OR {col} = ''"
        ).fetchone()[0]
        null_rates[col] = round(null_n / slim_count * 100, 2)
    report["null_rate_pct_key_fields"] = null_rates

    elapsed = round(time.time() - t0, 1)
    report["ingest_elapsed_seconds"] = elapsed

    with open(REPORT_PATH, "w") as f:
        json.dump(report, f, indent=2)
    print(f"  Sanity report written to {REPORT_PATH}")

    print("\nStep 6: Export slim CSV for non-DuckDB consumers...")
    con.execute(f"""
        COPY nppes_orgs TO '{SLIM_CSV_PATH}'
        (HEADER, DELIMITER ',')
    """)
    slim_csv_size = os.path.getsize(SLIM_CSV_PATH)
    print(
        f"  orgs_slim.csv: {slim_csv_size // 1_000_000} MB ({slim_count:,} rows)"
    )

    con.close()

    print(f"\nDone in {elapsed}s.")
    print(f"\nSummary:")
    print(f"  Total org NPIs: {slim_count:,}")
    print(f"  Active (not deactivated): {active:,}")
    print(f"  Deactivated: {deactivated:,}")
    print(f"  Acute care hospitals (282N*): {hospital_count:,}")
    print(f"  FQHCs (261QF*): {fqhc_count:,}")
    return report


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="NPPES V2 organization ingest")
    parser.add_argument(
        "--source",
        default=DEFAULT_SOURCE,
        help="Path to NPPES_organizations_only.csv",
    )
    args = parser.parse_args()
    ingest(args.source)
