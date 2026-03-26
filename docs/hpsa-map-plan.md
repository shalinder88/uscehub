# HPSA Interactive Map — Implementation Plan

## Data Sources (All Official, Free)

### HPSA Data
- **Bulk download (CSV/XLSX/SHP):** https://data.hrsa.gov/data/download
  - Select "Health Workforce" → "Shortage Areas"
  - Updated nightly
  - Contains: HPSA ID, name, score, type, discipline, status, state, county, FIPS codes
- **ArcGIS REST MapServer:** https://gisportal.hrsa.gov/server/rest/services/Shortage/HealthProfessionalShortageAreas_FS/MapServer
  - Can query features as GeoJSON: append `/query?f=geojson`
- **HPSA Find Tool:** https://data.hrsa.gov/tools/shortage-area/hpsa-find
- **HPSA Dashboard:** https://data.hrsa.gov/topics/health-workforce/shortage-areas/dashboard
- **Scoring methodology:** https://bhw.hrsa.gov/workforce-shortage-areas/shortage-designation/scoring

### Regional Commission Counties
- **ARC (423 counties, 13 states):** https://www.arc.gov/wp-content/uploads/2021/11/Appalachian-Counties-Served-by-ARC_2021.xlsx
- **DRA (255 counties, 8 states):** https://dra.gov/states/ + https://dra.gov/map-room/
- **SCRC (428 counties, 7 states):** https://scrc.gov/SCRC-Region/region

### Census FIPS Codes
- https://www.census.gov/library/reference/code-lists/ansi.html

## Important Notes
- HPSAs are NOT county-level — they're census tract, population, or facility based
- A single county may have multiple HPSAs with different scores
- HPSA score ranges: Primary Care 0-25, Mental Health 0-25, Dental 0-26
- ~7,000-8,000+ total HPSA designations nationally
- Some counties overlap between ARC and SCRC

## Build Approach

### Phase 1: State-Level Map (Can Build Now)
- SVG map of US states colored by Conrad 30 fill status
- Click state → opens state detail page
- Color coding: red (fills early), orange (fills all), green (has remaining)
- Data source: our conrad-tracker-data.ts (already built)

### Phase 2: County-Level Overlay (Needs Data Import)
1. Download HRSA CSV with all HPSA designations
2. Download ARC XLSX with county FIPS
3. Compile DRA counties from website
4. Compile SCRC counties from website
5. Cross-reference all with Census FIPS codes
6. Build county-level GeoJSON from Census TIGER/Line files
7. Overlay: HPSA score + ARC/DRA/SCRC eligibility + Conrad status

### Phase 3: Interactive Features
- Hover: show county name, HPSA score, waiver pathways available
- Click: show detailed info, link to jobs in area
- Toggle: 2025 vs 2026 data
- Filter: by HPSA type (primary care, mental health)
- Search: by county/city/zip

### Libraries to Use
- react-simple-maps (lightweight SVG US map)
- d3-geo for projections if needed
- Or: embed HRSA's own ArcGIS map via iframe as interim solution

### Timeline
- Phase 1: 1-2 days (state-level SVG map)
- Phase 2: 3-5 days (data import + county mapping)
- Phase 3: 2-3 days (interactive features)
