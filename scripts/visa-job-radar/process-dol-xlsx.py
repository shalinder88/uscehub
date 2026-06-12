"""
Process DOL LCA H-1B disclosure xlsx files (quarterly or annual) into per-year
physician-sponsor JSON for repeat-rate.ts.

Works on FY2018 (260-col annual), FY2019 (260-col annual), and FY2020+ (98-col quarterly).
Merges all quarters within a year and deduplicates by CASE_NUMBER.

Usage:
    python3 process-dol-xlsx.py --year FY2023 [--downloads ~/Downloads] [--out <dir>]

Output:
    docs/platform-v2/local/career/jobs/radar/sponsor-universe/by-year/FY2023.json
    shape: [{"employer":"Mayo Clinic","positions":36,"state":"MN","specialties":["29-1216","29-1229"]}, ...]
"""

import sys
import os
import json
import re
from collections import defaultdict

try:
    import openpyxl
except ImportError:
    print("ERROR: openpyxl not found. Run: pip3 install openpyxl")
    sys.exit(1)

# ── constants ──────────────────────────────────────────────────────────────────

DOWNLOADS = os.path.expanduser("~/Downloads")
BY_YEAR_DIR = os.path.join(
    os.path.dirname(__file__), "../../docs/platform-v2/local/career/jobs/radar/sponsor-universe/by-year"
)

# ── helpers ────────────────────────────────────────────────────────────────────

def norm_soc(soc):
    if not soc:
        return ""
    # Strip leading apostrophe (FY2018/2019 Excel text-force format) and .00 suffix
    return str(soc).strip().lstrip("'").split(".")[0]

def is_physician_soc(soc):
    s = norm_soc(soc)
    # SOC 2018 (FY2023+): 29-12xx  |  SOC 2010 (FY2022 and earlier): 29-106x
    return s.startswith("29-12") or s.startswith("29-106")

def is_certified(status):
    s = str(status or "").strip().lower()
    return s == "certified" or s.startswith("certified")

def is_h1b(visa_class):
    v = str(visa_class or "").strip().upper()
    return v == "H-1B"

def find_col(headers, *candidates):
    lower = [str(h or "").strip().lower().replace("-", "_").replace(" ", "_") for h in headers]
    for c in candidates:
        key = c.lower().replace("-", "_").replace(" ", "_")
        if key in lower:
            return lower.index(key)
    return -1

# ── file discovery ─────────────────────────────────────────────────────────────

def find_disclosure_files(year_label, downloads_dir):
    """Return list of matching disclosure xlsx paths for a given year label (e.g. FY2023)."""
    fy = year_label.upper()
    year_num = fy.replace("FY", "")

    candidates = []
    for fname in sorted(os.listdir(downloads_dir)):
        if not fname.endswith(".xlsx"):
            continue
        fl = fname.lower()
        # Skip appendix, worksites, appendixB
        if "appendix" in fl or "worksite" in fl:
            continue
        # Must match the fiscal year
        if year_num not in fname:
            continue
        # Must be a disclosure/LCA/H-1B file, not CW-1
        if fl.startswith("cw") or "cw-1" in fl or "cw_" in fl:
            continue
        # Match disclosure files (including FY2026 typo "dislclosure")
        # Rule: file starts with "lca_" or "h-1b_" and contains the year number
        if (fl.startswith("lca_") or fl.startswith("h-1b_") or fl.startswith("h1b")):
            candidates.append(os.path.join(downloads_dir, fname))

    return candidates

# ── row processor ──────────────────────────────────────────────────────────────

def process_file(path, seen_cases, employer_positions, employer_states, employer_socs):
    """
    Read one xlsx file with openpyxl read_only mode.
    Updates seen_cases (dedup), employer_positions, employer_states, employer_socs in place.
    Returns (rows_read, rows_physician) tuple.
    """
    print(f"  Reading {os.path.basename(path)} ...", flush=True)

    wb = openpyxl.load_workbook(path, read_only=True, data_only=True)
    ws = wb.active

    row_iter = ws.iter_rows(values_only=True)
    headers = list(next(row_iter))

    col_case   = find_col(headers, "CASE_NUMBER")
    col_status = find_col(headers, "CASE_STATUS", "STATUS")
    col_visa   = find_col(headers, "VISA_CLASS", "VISA CLASS")
    col_soc    = find_col(headers, "SOC_CODE", "SOC CODE", "SOC_CODE_ONET_DESIGNATION")
    col_emp    = find_col(headers, "EMPLOYER_NAME", "EMPLOYER_BUSINESS_NAME", "EMPLOYER NAME")
    col_state  = find_col(headers, "EMPLOYER_STATE", "EMPLOYER STATE")
    col_total  = find_col(headers, "TOTAL_WORKER_POSITIONS", "TOTAL_WORKERS", "TOTAL WORKER POSITIONS", "TOTAL WORKERS")
    col_new    = find_col(headers, "NEW_EMPLOYMENT", "NEW EMPLOYMENT")
    col_cont   = find_col(headers, "CONTINUED_EMPLOYMENT", "CONTINUED EMPLOYMENT")

    if col_emp < 0 or col_soc < 0:
        print(f"    WARNING: missing employer or SOC column — skipping file")
        wb.close()
        return 0, 0

    print(f"    Columns: {len(headers)} | emp={col_emp} soc={col_soc} status={col_status} visa={col_visa} total={col_total}", flush=True)

    rows_read = 0
    rows_physician = 0

    for row in row_iter:
        rows_read += 1

        # Status filter
        if col_status >= 0 and not is_certified(row[col_status]):
            continue

        # H-1B filter (skip H-1B1, E-3)
        if col_visa >= 0 and not is_h1b(row[col_visa]):
            continue

        # SOC physician filter
        soc_raw = str(row[col_soc] or "") if col_soc >= 0 else ""
        if not is_physician_soc(soc_raw):
            continue

        rows_physician += 1

        # Case-level dedup
        case_num = str(row[col_case] or "").strip() if col_case >= 0 else ""
        if case_num and case_num in seen_cases:
            continue
        if case_num:
            seen_cases.add(case_num)

        employer = str(row[col_emp] or "").strip()
        if not employer:
            continue

        # Worker positions
        positions = 1
        if col_total >= 0:
            v = row[col_total]
            if v is not None:
                try:
                    t = int(str(v).replace(",", "").split(".")[0])
                    if t > 0:
                        positions = t
                except (ValueError, TypeError):
                    pass
        elif col_new >= 0 or col_cont >= 0:
            n = 0
            c = 0
            if col_new >= 0 and row[col_new] is not None:
                try:
                    n = int(str(row[col_new]).replace(",", "").split(".")[0])
                except (ValueError, TypeError):
                    pass
            if col_cont >= 0 and row[col_cont] is not None:
                try:
                    c = int(str(row[col_cont]).replace(",", "").split(".")[0])
                except (ValueError, TypeError):
                    pass
            if n + c > 0:
                positions = n + c

        employer_positions[employer] += positions

        # State
        if col_state >= 0 and row[col_state]:
            employer_states[employer][str(row[col_state]).strip()[:2].upper()] += 1

        # SOC tracking
        soc_clean = norm_soc(soc_raw)
        if soc_clean:
            employer_socs[employer].add(soc_clean)

    wb.close()
    print(f"    Rows: {rows_read} total, {rows_physician} physician H-1B certified (after dedup)", flush=True)
    return rows_read, rows_physician

# ── main ───────────────────────────────────────────────────────────────────────

def main():
    args = sys.argv[1:]

    year_label = None
    downloads_dir = DOWNLOADS
    out_dir = os.path.normpath(os.path.join(os.path.dirname(__file__), BY_YEAR_DIR))
    partial = False

    i = 0
    while i < len(args):
        if args[i] == "--year" and i + 1 < len(args):
            year_label = args[i + 1].upper()
            if not year_label.startswith("FY"):
                year_label = "FY" + year_label
            i += 2
        elif args[i] == "--downloads" and i + 1 < len(args):
            downloads_dir = os.path.expanduser(args[i + 1])
            i += 2
        elif args[i] == "--out" and i + 1 < len(args):
            out_dir = args[i + 1]
            i += 2
        elif args[i] == "--partial":
            partial = True
            i += 1
        else:
            i += 1

    if not year_label:
        print("Usage: python3 process-dol-xlsx.py --year FY2023 [--downloads ~/Downloads] [--partial]")
        sys.exit(1)

    files = find_disclosure_files(year_label, downloads_dir)
    if not files:
        print(f"ERROR: no disclosure files found for {year_label} in {downloads_dir}")
        sys.exit(1)

    print(f"\n=== {year_label} ({'PARTIAL' if partial else 'full year'}) ===")
    print(f"Files: {len(files)}")
    for f in files:
        print(f"  {os.path.basename(f)}")

    seen_cases = set()
    employer_positions = defaultdict(int)
    employer_states = defaultdict(lambda: defaultdict(int))
    employer_socs = defaultdict(set)

    total_rows = 0
    total_physician = 0

    for path in files:
        r, p = process_file(path, seen_cases, employer_positions, employer_states, employer_socs)
        total_rows += r
        total_physician += p

    print(f"\nTotals for {year_label}: {total_rows} rows read, {total_physician} physician H-1B certified LCAs")
    print(f"Unique cases tracked (dedup): {len(seen_cases)}")
    print(f"Distinct employer-sponsors: {len(employer_positions)}")

    # Build output
    out = []
    for employer, positions in sorted(employer_positions.items(), key=lambda x: -x[1]):
        state_counts = employer_states[employer]
        top_state = max(state_counts, key=state_counts.get) if state_counts else None
        socs = sorted(employer_socs[employer])
        out.append({
            "employer": employer,
            "positions": positions,
            "state": top_state,
            "specialties": socs,
            "partial": partial,
        })

    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, year_label + ".json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(out, f, indent=2)
        f.write("\n")

    print(f"\nWritten: {out_path}")
    print(f"Top 10 employers by certified physician positions:")
    for e in out[:10]:
        print(f"  {e['employer']} ({e['state'] or '?'}) — {e['positions']} pos — {e['specialties'][:3]}")


if __name__ == "__main__":
    main()
