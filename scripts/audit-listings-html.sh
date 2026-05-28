#!/usr/bin/env bash
# Mega-audit structural script — fetches each /listing/[id] page from the
# local dev server, extracts a few signals from the SSR HTML, and emits a
# CSV row per listing. No regex on user inputs; only on HTML grep filters
# which are tooling, not source-code logic.
#
# Usage: bash scripts/audit-listings-html.sh > docs/audit-listings.csv

set -uo pipefail

IDS_FILE="${1:-/tmp/uscehub-ids.txt}"
if [[ ! -f "$IDS_FILE" ]]; then
  echo "missing ids file at $IDS_FILE" >&2
  exit 1
fi

echo "id,type,title_len,about_text_len,about_para_count,about_list_count,has_sidebar,has_apply,entity_count"

while IFS=, read -r id type; do
  [[ -z "$id" ]] && continue
  html=$(curl -s --max-time 15 "http://localhost:3000/listing/$id" || true)
  if [[ -z "$html" ]]; then
    echo "$id,$type,0,0,0,0,0,0,0"
    continue
  fi
  title=$(echo "$html" | grep -oE '<title>[^<]+</title>' | head -1 | sed 's|<title>||; s|</title>||')
  title_len=${#title}
  about_block=$(echo "$html" | awk '/lv2-about/{flag=1} /lv2-section-h.*Quick highlights/{flag=0} flag' || true)
  about_text=$(echo "$about_block" | sed 's/<[^>]*>//g' | tr -d '\n' | tr -s ' ')
  about_text_len=${#about_text}
  about_para_count=$(echo "$about_block" | grep -c '<p[ >]' || echo 0)
  about_list_count=$(echo "$about_block" | grep -cE '<ul[ >]|<ol[ >]' || echo 0)
  has_sidebar=$(echo "$html" | grep -c 'VERIFIED SOURCE' || echo 0)
  has_apply=$(echo "$html" | grep -c 'lv2-cta-apply\|Apply at\|apply now' || echo 0)
  entity_count=$(echo "$about_text" | grep -oE '&#[0-9]+;|&[a-zA-Z]+;' | wc -l | tr -d ' ')
  echo "$id,$type,$title_len,$about_text_len,$about_para_count,$about_list_count,$has_sidebar,$has_apply,$entity_count"
done < "$IDS_FILE"
