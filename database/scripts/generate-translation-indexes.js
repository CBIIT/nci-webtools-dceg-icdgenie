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

// Per the client (questions.md A1), the ICD-11 translation is displayed EXACTLY as it appears in the
// mapping file — the `&`/`/` combination string is NOT parsed. We store the verbatim icd11Code and
// icd11Title cells. An ICD-10 code spanning multiple rows (A2) is OR across rows, so its rows' verbatim
// strings are joined with " / " (multi-row assumption).
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
        _codes: [],
        _titles: [],
        _seen: new Set(),
      };
      byCode.set(row.icd10Code, entry);
    }
    // Dedupe identical rows; preserve the raw cells verbatim (no split/trim of internal spacing).
    // Only rows that carry an ICD-11 code contribute — blank-code rows map to an ICD-11 block (A4,
    // deferred) and have no code string to display. Push code+title together to keep them aligned.
    if (!row.icd11Code) continue;
    const key = row.icd11Code + "|" + (row.icd11Title || "");
    if (entry._seen.has(key)) continue;
    entry._seen.add(key);
    entry._codes.push(row.icd11Code);
    entry._titles.push(row.icd11Title || "");
  }

  const docs = [...byCode.values()].map(({ _codes, _titles, _seen, ...doc }) => ({
    ...doc,
    // Verbatim ICD-11 mapping string(s); multiple rows joined by " / " (OR across rows).
    icd11Code: _codes.join(" / "),
    icd11Title: _titles.join(" / "),
  }));
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
