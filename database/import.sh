#!/bin/bash
set -e

CHUNK_SIZE=${CHUNK_SIZE:-2000}
OPENSEARCH_URL="https://$DOMAIN/_bulk"
FAILED=0

import_file() {
  local file=$1
  local name=$(basename "$file" .json)
  local lines=$(wc -l < "$file" | tr -d ' ')

  # Clean step: delete the target index before loading so stale documents from a
  # previous import (e.g. codes/levels that no longer exist) do not linger. The index
  # name is read from the file's first bulk action line. Toggle off with CLEAN_INDEXES=false.
  if [ "${CLEAN_INDEXES:-true}" = "true" ]; then
    local index=$(head -n 1 "$file" | sed -n 's/.*"_index":"\([^"]*\)".*/\1/p')
    if [ -n "$index" ]; then
      echo "[$name] Cleaning: deleting index '$index' before import"
      curl -k -s -o /dev/null -XDELETE -u "$ADMIN:$PASSWORD" "https://$DOMAIN/$index"
    fi
  fi

  echo "[$name] Starting import ($lines lines)"

  if [ "$lines" -le "$CHUNK_SIZE" ]; then
    # Small file — single request
    local response=$(curl -k -s -w "\n%{http_code}" -XPOST -u "$ADMIN:$PASSWORD" "$OPENSEARCH_URL" --data-binary @"$file" -H "Content-Type: application/x-ndjson")
    local http_code=$(echo "$response" | tail -1)
    local body=$(echo "$response" | sed '$d')

    if [ "$http_code" -ge 400 ] 2>/dev/null; then
      echo "[$name] FAILED (HTTP $http_code)"
      echo "$body" | head -c 500
      echo ""
      FAILED=1
      return 1
    fi

    # Check for bulk errors in response
    if echo "$body" | grep -q '"errors":true'; then
      local error_count=$(echo "$body" | grep -o '"error"' | wc -l | tr -d ' ')
      echo "[$name] COMPLETED with $error_count bulk errors"
    else
      echo "[$name] COMPLETED successfully"
    fi
  else
    # Large file — split into chunks
    local total_chunks=$(( (lines + CHUNK_SIZE - 1) / CHUNK_SIZE ))
    local chunk_num=0
    local chunk_dir=$(mktemp -d)

    echo "[$name] File too large for single request, splitting into $total_chunks chunks"
    split -l "$CHUNK_SIZE" "$file" "$chunk_dir/chunk_"

    for chunk in "$chunk_dir"/chunk_*; do
      chunk_num=$((chunk_num + 1))
      echo "[$name] Importing chunk $chunk_num/$total_chunks"

      local response=$(curl -k -s -w "\n%{http_code}" -XPOST -u "$ADMIN:$PASSWORD" "$OPENSEARCH_URL" --data-binary @"$chunk" -H "Content-Type: application/x-ndjson")
      local http_code=$(echo "$response" | tail -1)
      local body=$(echo "$response" | sed '$d')

      if [ "$http_code" -ge 400 ] 2>/dev/null; then
        echo "[$name] FAILED chunk $chunk_num (HTTP $http_code)"
        echo "$body" | head -c 500
        echo ""
        FAILED=1
      elif echo "$body" | grep -q '"errors":true'; then
        local error_count=$(echo "$body" | grep -o '"error"' | wc -l | tr -d ' ')
        echo "[$name] Chunk $chunk_num completed with $error_count bulk errors"
      fi
    done

    rm -rf "$chunk_dir"
    echo "[$name] COMPLETED ($chunk_num chunks imported)"
  fi
}

echo "=== OpenSearch Data Import ==="
echo "Domain: $DOMAIN"
echo "Chunk size: $CHUNK_SIZE lines"
echo ""

FILES=(
  data/icd10drug.json
  data/icd10eindex.json
  data/icd10neoplasm.json
  data/icd10tabular.json
  data/icdo3.json
  data/translations.json
  data/icd10pcs.json
  data/icd11.json
  data/icdo4.json
  data/translations_icdo4.json
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    import_file "$file"
    echo ""
  else
    echo "[$(basename "$file" .json)] SKIPPED — file not found"
    FAILED=1
    echo ""
  fi
done

echo "=== Import Summary ==="
curl -k -s -u "$ADMIN:$PASSWORD" "https://$DOMAIN/_cat/indices?v"
echo ""

if [ "$FAILED" -ne 0 ]; then
  echo "=== IMPORT COMPLETED WITH ERRORS ==="
  exit 1
else
  echo "=== IMPORT COMPLETED SUCCESSFULLY ==="
  exit 0
fi
