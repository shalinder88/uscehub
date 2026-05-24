#!/bin/bash
# P101-3B — T7 Artifact Backfill helper
# Iterates through each packet's source URLs, uses scripts/p101-fetch-html.ts
# to fetch+clean, copies cleaned text to T7, computes SHA-256, writes hash file.
# Not a permanent script — runs once per re-mount. Operator may delete after.

set -u
export PATH=/bin:/usr/bin:/usr/local/bin:$HOME/homebrew/bin:$HOME/.local/bin:$PATH

T7_ROOT="/Volumes/T7Shield_Code/USCEHubEvidence/p101"
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TMP_CACHE="$REPO_ROOT/tmp-html-cache"

# (institution-slug, state, url1, url2...) — one URL per line, prefixed with slug|state
cat <<'EOF' > /tmp/p101-3b-urls.txt
uab-hospital|AL|https://www.uab.edu/medicine/international/international-programs/international-visiting-medical-students
stanford-health-care|CA|https://med.stanford.edu/visiting-clerkships/international.html
emory-university-hospital|GA|https://med.emory.edu/education/admissions/visiting/index.html
upmc-presbyterian|PA|https://www.researchprograms.medschool.pitt.edu/international-visiting-student-program
boston-medical-center|MA|https://www.bumc.bu.edu/isep/
parkland-health-utsw|TX|https://medschool.utsouthwestern.edu/admissions/visiting/international.html
brigham-and-womens-hospital|MA|https://hms.harvard.edu/departments/office-registrar/visiting-students-program/apply
massachusetts-general-hospital|MA|https://www.massgeneral.org/surgery/education-and-training/advanced-surgery-clerkship-program
beth-israel-deaconess-medical-center|MA|https://www.bidmc.org/medical-education/undergraduate-medical-education
cook-county-health-stroger|IL|https://cookcountyhealth.org/education-and-research/
EOF

mkdir -p "$TMP_CACHE"
mkdir -p /tmp/p101-3b-results

> /tmp/p101-3b-results/manifest.csv
echo "slug,state,url,sha256,bytes,outcome" >> /tmp/p101-3b-results/manifest.csv

while IFS='|' read -r slug state url; do
  [ -z "$slug" ] && continue
  echo "==> [$state/$slug] $url"
  T7_INST="$T7_ROOT/$state/$slug"
  mkdir -p "$T7_INST/cleaned-text" "$T7_INST/hashes" "$T7_INST/source-pages" "$T7_INST/metadata"

  # Run the helper. It writes tmp-html-cache/<sha1>.html and .txt
  cd "$REPO_ROOT"
  out=$(npx tsx scripts/p101-fetch-html.ts "$url" "$TMP_CACHE" 2>&1)
  echo "$out" | tail -3

  # Find the produced .txt file (most recent in tmp-html-cache)
  TXT=$(/bin/ls -t "$TMP_CACHE"/*.txt 2>/dev/null | /usr/bin/head -1)
  HTML=$(/bin/ls -t "$TMP_CACHE"/*.html 2>/dev/null | /usr/bin/head -1)
  META=$(/bin/ls -t "$TMP_CACHE"/*.meta.json 2>/dev/null | /usr/bin/head -1)

  if [ -z "$TXT" ] || [ ! -f "$TXT" ]; then
    echo "  FAIL: no cleaned text produced"
    echo "$slug,$state,$url,FAILED,0,FETCH_OR_CLEAN_FAILED" >> /tmp/p101-3b-results/manifest.csv
    continue
  fi

  # SHA-256 of cleaned text
  HASH=$(/usr/bin/shasum -a 256 "$TXT" | /usr/bin/awk '{print $1}')
  BYTES=$(/usr/bin/wc -c < "$TXT")

  # Copy artifacts to T7
  /bin/cp "$TXT" "$T7_INST/cleaned-text/$(basename "$TXT")"
  [ -f "$HTML" ] && /bin/cp "$HTML" "$T7_INST/source-pages/$(basename "$HTML")"
  [ -f "$META" ] && /bin/cp "$META" "$T7_INST/metadata/$(basename "$META")"
  echo "$HASH  $(basename "$TXT")" > "$T7_INST/hashes/$(basename "$TXT").sha256"

  echo "  OK hash=$HASH bytes=$BYTES"
  echo "$slug,$state,$url,$HASH,$BYTES,CAPTURED" >> /tmp/p101-3b-results/manifest.csv
done < /tmp/p101-3b-urls.txt

echo ""
echo "=== Final results ==="
/bin/cat /tmp/p101-3b-results/manifest.csv
