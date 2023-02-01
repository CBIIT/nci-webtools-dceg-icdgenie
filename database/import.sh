#!/bin/bash
set -x

# no need to run opensearch.js, since we've already built opensearch indexes
# node opensearch.js

# add/update documents
curl -k -XPOST -u "$ADMIN:$PASSWORD" "$DOMAIN/_bulk" --data-binary @data/icd10drug.json -H "Content-Type: application/json"
curl -k -XPOST -u "$ADMIN:$PASSWORD" "$DOMAIN/_bulk" --data-binary @data/icd10eindex.json -H "Content-Type: application/json"
curl -k -XPOST -u "$ADMIN:$PASSWORD" "$DOMAIN/_bulk" --data-binary @data/icd10neoplasm.json -H "Content-Type: application/json"
curl -k -XPOST -u "$ADMIN:$PASSWORD" "$DOMAIN/_bulk" --data-binary @data/icd10tabular.json -H "Content-Type: application/json"
curl -k -XPOST -u "$ADMIN:$PASSWORD" "$DOMAIN/_bulk" --data-binary @data/icdo3.json -H "Content-Type: application/json"
curl -k -XPOST -u "$ADMIN:$PASSWORD" "$DOMAIN/_bulk" --data-binary @data/translations.json -H "Content-Type: application/json"
