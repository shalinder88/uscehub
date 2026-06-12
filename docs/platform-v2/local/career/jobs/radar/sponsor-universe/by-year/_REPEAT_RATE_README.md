# Phase A — Sponsor repeat-rate: AWAITING DATA

The repeat rate cannot be computed from the combined DOL snapshot in the repo
(FY2024 Q4 + FY2025 Q3, no per-record year tag). You need separate per-year
employer lists — which means a manual download from DOL (site 403s bots).

Once you have ≥2 year JSON files in this directory, `repeat-rate.ts` runs
automatically and prints the position-weighted year-over-year repeat rate.
If ≥~80%, the "monitoring the known-sponsor universe captures ≥90% of next
year's physician H-1B jobs" thesis is validated.

---

## Step-by-step (5 minutes per year file)

### 1. Download the raw Excel files from DOL OFLC

URL: https://www.dol.gov/agencies/eta/foreign-labor/performance

On that page, under **"LCA Program (H-1B, H-1B1, E-3)"** → **"Disclosure Data"**
→ pick the annual H-1B disclosure files. Download three:

| Year | Typical filename |
|------|-----------------|
| FY2022 | `LCA_Disclosure_Data_FY2022.xlsx` |
| FY2023 | `LCA_Disclosure_Data_FY2023.xlsx` |
| FY2024 | `LCA_Disclosure_Data_FY2024.xlsx` |

Each file has ~500k–700k rows.

### 2. Convert each to CSV

Open each Excel file → **File → Export as CSV** (UTF-8, comma-delimited).
Save to e.g. `~/Downloads/FY2023.csv`. Keep the first header row.

### 3. Run the conversion script (one per year)

```bash
cd /Users/shelly/usmle-platform
export PATH="$HOME/homebrew/bin:$PATH"

npx tsx scripts/visa-job-radar/process-dol-annual-csv.ts \
  --file ~/Downloads/LCA_Disclosure_Data_FY2022.csv --year FY2022

npx tsx scripts/visa-job-radar/process-dol-annual-csv.ts \
  --file ~/Downloads/LCA_Disclosure_Data_FY2023.csv --year FY2023

npx tsx scripts/visa-job-radar/process-dol-annual-csv.ts \
  --file ~/Downloads/LCA_Disclosure_Data_FY2024.csv --year FY2024
```

The script:
- Filters to **CASE_STATUS = "Certified"** (approved LCAs only)
- Filters to **SOC code prefix "29-12"** (physicians and surgeons — see below)
- Sums positions per employer (TOTAL_WORKERS, or NEW_EMPLOYMENT + CONTINUED_EMPLOYMENT)
- Outputs `by-year/FY2023.json` with shape `[{"employer":"Mayo Clinic","positions":36}, ...]`

It tolerates column name variations across DOL fiscal years (EMPLOYER_NAME vs
EMPLOYER_BUSINESS_NAME, TOTAL_WORKERS vs TOTAL_WORKER_POSITIONS, etc.).

### 4. Compute the repeat rate

```bash
npx tsx scripts/visa-job-radar/repeat-rate.ts
```

Output: `by-year/repeat_rate_results.md` with unweighted + position-weighted
year-over-year repeat rates and a PASS/PARTIAL/WEAK verdict.

---

## Physician SOC codes (29-12xx family — what the filter keeps)

```
29-1210  Physicians (all)
29-1211  Anesthesiologists
29-1212  Cardiologists
29-1213  Dermatologists
29-1214  Emergency Medicine Physicians
29-1215  Family Medicine Physicians
29-1216  General Internal Medicine Physicians
29-1217  Hospitalists
29-1218  Obstetricians and Gynecologists
29-1221  Pediatricians
29-1222  Pathologists
29-1223  Psychiatrists
29-1224  Radiologists
29-1229  Physicians, All Other
29-1241  Ophthalmologists
29-1242  Orthopedic Surgeons
29-1243  Neurologists
29-1244  Neurological Surgeons
29-1248  Surgeons, All Other
29-1249  Plastic Surgeons
```

The filter is `soc.startsWith("29-12")` which catches the entire family including
legacy 2010 SOC codes like 29-1062 that some older files still use (those start
with 29-10, NOT 29-12, so they would be excluded — check the FY2022 file column
counts to confirm physician rows are reasonable, ~15k–20k certified rows expected).

---

## Expected output range

Approximate scale (from the existing combined snapshot):
- ~1,465 distinct physician-sponsoring employers in recent years
- Position-weighted repeat rate historically **~85–92%** in comparable H-1B data
- If repeat rate is below 70%, investigate: check if "Certified-Withdrawn" rows
  were included (they should be; withdrawn = still filed), or if a year has an
  unusual amount of new-system-filer entries.
