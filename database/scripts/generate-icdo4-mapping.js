const { Client } = require("@opensearch-project/opensearch");
const fs = require("fs");
const path = require("path");
const { parse } = require("csv-parse/sync");
const { stringify } = require("csv-stringify/sync");

const ADMIN = process.env.ADMIN;
const PASSWORD = process.env.PASSWORD;
const DOMAIN = process.env.DOMAIN;

if (!ADMIN || !PASSWORD || !DOMAIN) {
  console.error("Required env vars: ADMIN, PASSWORD, DOMAIN");
  console.error("Example: ADMIN=admin PASSWORD=... DOMAIN=localhost:9200 node scripts/generate-icdo4-mapping.js");
  process.exit(1);
}

const host = `https://${ADMIN}:${PASSWORD}@${DOMAIN}`;

const client = new Client({
  node: host,
  ssl: { rejectUnauthorized: process.env.OPENSEARCH_INSECURE !== "true" ? true : false },
});

const inputPath = process.argv[2] || path.resolve(__dirname, "..", "data", "icdo4_morphology.csv");
const outputPath = process.argv[3] || path.resolve(__dirname, "..", "data", "icd10cm_icdo4_mapping.csv");

function escapeQueryString(str) {
  return str.replace(/[+\-=&|><!(){}[\]^~?:\\/]/g, "\\$&");
}

async function queryTabular(codePattern) {
  const isWildcard = codePattern.includes("_");
  const escaped = escapeQueryString(codePattern.replace(/_/g, ""));
  const query = isWildcard ? escaped + "*" : `"${escaped}"`;

  const body = {
    query: {
      bool: {
        filter: [
          {
            query_string: {
              query: query,
              fields: ["code"],
              analyze_wildcard: true,
              allow_leading_wildcard: false,
            },
          },
        ],
      },
    },
    size: 500,
  };

  const result = await client.search({ index: "tabular", body });
  return result.body.hits.hits
    .map((h) => ({ code: h._source.code, description: h._source.description }))
    .filter((h) => {
      // For wildcards like C51._, only return codes that match the pattern (e.g., C51.0, C51.1)
      // Exclude range headers (C51-C58), parent codes without dot (C51), and deeper codes
      if (isWildcard) {
        const prefix = codePattern.replace(/_/g, "");
        return h.code.startsWith(prefix) && h.code.length > prefix.length && !h.code.includes("-");
      }
      return h.code === codePattern;
    });
}

const tabularCache = new Map();

async function queryTabularCached(codePattern) {
  if (tabularCache.has(codePattern)) return tabularCache.get(codePattern);
  const results = await queryTabular(codePattern);
  tabularCache.set(codePattern, results);
  return results;
}

async function main() {
  console.log(`Reading ${inputPath}`);
  const csvContent = fs.readFileSync(inputPath, "utf-8");
  const records = parse(csvContent, { columns: true, skip_empty_lines: true, trim: true });

  const rows = [];
  const seen = new Set();

  for (const record of records) {
    const icdo4Code = record.code;
    const icdo4Desc = record.description;
    const codeRef = (record.codeReference || "").trim();

    if (!codeRef) continue;

    const refs = codeRef.split(",").map((r) => r.trim()).filter(Boolean);

    for (const ref of refs) {
      const icd10Matches = await queryTabularCached(ref);

      for (const match of icd10Matches) {
        const key = `${match.code}|${icdo4Code}`;
        if (seen.has(key)) continue;
        seen.add(key);

        rows.push([match.code, match.description, icdo4Code, icdo4Desc]);
      }
    }
  }

  const csvOutput = stringify(rows, {
    header: true,
    columns: ["icd10_code", "icd10_desc", "icdo4_code", "icdo4_desc"],
  });
  fs.writeFileSync(outputPath, csvOutput);
  console.log(`Written ${rows.length} rows to ${outputPath}`);
  console.log(`Cache hits: ${tabularCache.size} unique patterns cached`);
}

main().catch(console.error);
