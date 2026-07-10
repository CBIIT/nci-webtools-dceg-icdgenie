/**
 * Generate the two ICD-10-CM <-> ICD-11 translation index files from the flat mapping CSVs
 * produced by translation-xlsx-to-csv.py.
 *
 * Outputs (OpenSearch bulk format — one index line then one document line, matching the other
 * data/*.json files consumed by import-opensearch.js):
 *   data/icd10_to_icd11.json  — one doc per ICD-10-CM code, groups = OR alternatives, codes = AND
 *   data/icd11_to_icd10.json  — one doc per row (strictly 1-to-1)
 *
 * Grouping semantics (assumption A1, see docs/tickets/NCIATWP-translation-feature/questions.md):
 *   - The icd11Code cell splits on '/' into OR groups; each group splits on '&' into AND codes.
 *   - '&' binds tighter than '/'. The icd11Title cell splits on '/' 1:1 with the code groups.
 *   - Multiple rows for one ICD-10 code contribute additional OR groups (deduped).
 *
 * Run from the database/ directory (paths are relative to it):
 *   node scripts/generate-translation-indexes.js
 */

const fs = require("fs");
const path = require("path");
const { parse } = require("csv-parse/sync");

const DATA_DIR = path.resolve(__dirname, "..", "data");

function readCsv(fileName, columns) {
  const raw = fs.readFileSync(path.join(DATA_DIR, fileName), "utf-8");
  return parse(raw, {
    columns,
    from_line: 2, // skip header
    skip_empty_lines: true,
    relax_column_count: true,
    trim: true,
  });
}

function writeBulk(fileName, index, docs) {
  const outPath = path.join(DATA_DIR, fileName);
  const lines = [];
  docs.forEach((doc, id) => {
    lines.push(JSON.stringify({ index: { _index: index, _id: id } }));
    lines.push(JSON.stringify(doc));
  });
  fs.writeFileSync(outPath, lines.join("\n") + "\n", "utf-8");
  console.log(`Wrote ${docs.length} docs -> data/${fileName}`);
}

// Split one row's icd11Code / icd11Title cell into OR groups of AND codes.
function splitGroups(icd11Code, icd11Title, icd11Chapter, icd11ClassKind) {
  const codeParts = String(icd11Code ?? "").split("/");
  const titleParts = String(icd11Title ?? "").split("/");
  return codeParts.map((part, i) => {
    const codes = part
      .split("&")
      .map((c) => c.trim())
      .filter((c) => c.length > 0);
    // Align the title part with the code group; fall back to the whole title if the title has a
    // different number of '/' segments than the code (rare — a title that itself contains '/').
    const title = (titleParts.length === codeParts.length ? titleParts[i] : icd11Title).trim();
    return {
      codes,
      title,
      chapter: icd11Chapter || "",
      classKind: icd11ClassKind || "",
      block: codes.length === 0, // blank icd11Code -> maps to an ICD-11 block/chapter (title only)
    };
  });
}

function groupKey(group) {
  return group.codes.join("&") + "|" + group.title;
}

function build10to11() {
  const rows = readCsv("icd10_to_icd11_mapping.csv", [
    "icd10Code", "icd10ClassKind", "icd10Chapter", "icd10Title",
    "icd11Code", "icd11ClassKind", "icd11Chapter", "icd11Title",
  ]);

  const byCode = new Map();
  for (const row of rows) {
    let entry = byCode.get(row.icd10Code);
    if (!entry) {
      entry = {
        icd10Code: row.icd10Code,
        icd10Title: row.icd10Title || "",
        icd10Chapter: row.icd10Chapter || "",
        icd10ClassKind: row.icd10ClassKind || "",
        groups: [],
        _seen: new Set(),
      };
      byCode.set(row.icd10Code, entry);
    }
    for (const group of splitGroups(row.icd11Code, row.icd11Title, row.icd11Chapter, row.icd11ClassKind)) {
      const key = groupKey(group);
      if (entry._seen.has(key)) continue;
      entry._seen.add(key);
      entry.groups.push(group);
    }
  }

  const docs = [...byCode.values()].map(({ _seen, ...doc }) => doc);
  writeBulk("icd10_to_icd11.json", "icd10_to_icd11", docs);
  return docs;
}

function build11to10() {
  const rows = readCsv("icd11_to_icd10_mapping.csv", [
    "icd11Code", "icd11Chapter", "icd11Title", "icd10Code", "icd10Chapter", "icd10Title",
  ]);

  const docs = rows.map((row) => ({
    icd11Code: row.icd11Code,
    icd11Title: row.icd11Title || "",
    icd11Chapter: row.icd11Chapter || "",
    icd10Code: row.icd10Code || "",
    icd10Title: row.icd10Title || "",
    icd10Chapter: row.icd10Chapter || "",
  }));
  writeBulk("icd11_to_icd10.json", "icd11_to_icd10", docs);
  return docs;
}

const tenToEleven = build10to11();
const elevenToTen = build11to10();

console.log(
  `\nSummary: ${tenToEleven.length} ICD-10-CM codes with ICD-11 mappings; ` +
    `${elevenToTen.length} ICD-11 -> ICD-10-CM rows.`
);
