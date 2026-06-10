/**
 * NCIATWP-10146 — Convert the CMS ICD-10-CM "order" file (icd10cm_order_2026.txt)
 * into the OpenSearch bulk file for the `tabular` index (icd10tabular.json).
 *
 * Why: the previously-provided flat `icd10cm_codes_2026.txt` lacked parent/category
 * levels. The order file is the fixed-width CMS file that contains every code (headers
 * and billable) in hierarchical order, from which the parent/child tree is derived.
 *
 * We emit ONLY `type:"entry"` docs (the frontend filters to those; chapters/blocks are
 * not displayed per assumption #1, and the order file contains no block rows). This also
 * keeps parent code *ranges* out of the data (per the 5/29 Batch Query note).
 *
 * Output doc shape mirrors the existing icd10tabular.json entries:
 *   { code, codeID, type:"entry", path:[ancestorDescs..., ownDesc],
 *     description, parent:[ancestor nodes root->immediate], id }
 *
 * DECISION (NCIATWP-10146): the legacy XML importer stored each ancestor's `.parents`
 * as its FULL recursive ancestor subtree. For the 2026 set (98k codes, deeper) that
 * produced a ~225MB bulk file (~10x the 2022 one). We verified every consumer of the
 * `tabular` index — frontend `search.js processSearch` (reads only the top-level `parent`
 * array and each ancestor's `.parents` LENGTH for root detection) and backend
 * `search.js`/`batch.js` (read only each hit's own `description`) — and NONE traverse the
 * deep nesting. So we FLATTEN each ancestor's `.parents` to a plain array of ancestor ids:
 * the length (what root detection needs) is preserved, behavior is identical, and the file
 * shrinks dramatically. This diverges from the byte-exact legacy shape on purpose.
 *
 * Usage:
 *   node database/scripts/icd10cm-order-to-json.js [inputOrderFile] [outputJson]
 */
const fs = require("fs");
const path = require("path");

const INPUT = process.argv[2] ||
  path.resolve(__dirname, "../../docs/tickets/NCIATWP-10146/test-files/icd10cm_order_2026.txt");
const OUTPUT = process.argv[3] || path.resolve(__dirname, "../data/icd10tabular.json");

// Same numeric code id the legacy importer used (opensearch.js convertCode), on the DOTTED code.
function convertCode(code) {
  let decimals = 0;
  if (code.substring(1).includes("."))
    decimals = code.substring(1).split(".")[1].length;
  return ((code.charCodeAt(0) - 64) * 1000) +
    parseFloat(parseFloat(code.substring(1)).toFixed(decimals));
}

// Re-insert the decimal: first 3 chars are the category, the rest follow a dot (A000 -> A00.0).
function dot(dotless) {
  return dotless.length <= 3 ? dotless : dotless.slice(0, 3) + "." + dotless.slice(3);
}

// CMS order-file fixed-width layout (0-indexed):
//   [0:5] order number | [6:13] code (dotless) | [14] header/billable flag |
//   [16:76] short description | [77:] long description
function parseLine(line) {
  const dotless = line.substring(6, 13).trim();
  if (!dotless) return null;
  const longDesc = line.substring(77).trim();
  const shortDesc = line.substring(16, 76).trim();
  return { dotless, description: longDesc || shortDesc };
}

const lines = fs.readFileSync(INPUT, "utf-8").split(/\r?\n/).filter((l) => l.trim().length);

const entries = [];
const byDotless = new Map();
for (const line of lines) {
  const p = parseLine(line);
  if (!p) continue;
  const code = dot(p.dotless);
  const e = {
    id: entries.length,
    dotless: p.dotless,
    code,
    description: p.description,
    codeID: convertCode(code),
  };
  byDotless.set(p.dotless, e);
  entries.push(e);
}

// Ancestor entries from root (category) down to immediate parent. Parent = code minus the
// last char; skip prefixes that aren't real rows (placeholder gaps) so we attach to the
// nearest existing ancestor instead of orphaning.
function ancestorsOf(e) {
  const chain = [];
  let d = e.dotless;
  while (d.length > 3) {
    d = d.slice(0, -1);
    if (byDotless.has(d)) chain.push(byDotless.get(d));
  }
  return chain.reverse(); // root -> immediate
}

// Build the entry's top-level `parent` array: ancestors root->immediate. Each ancestor is a
// shallow node — its own `.parents` is FLATTENED to a plain array of ancestor ids (see DECISION
// in the header). Root detection only needs that array's length, which this preserves.
function parentArrayFor(e) {
  return ancestorsOf(e).map((a) => ({
    code: a.code,
    codeID: a.codeID,
    type: "entry",
    description: a.description,
    id: a.id,
    parents: ancestorsOf(a).map((x) => x.id), // flattened: ids only (length = ancestor count)
  }));
}

const out = fs.createWriteStream(OUTPUT);
let written = 0;
for (const e of entries) {
  const anc = ancestorsOf(e);
  const doc = {
    code: e.code,
    codeID: e.codeID,
    type: "entry",
    description: e.description,
    path: anc.map((a) => a.description).concat(e.description),
    parent: parentArrayFor(e),
    id: e.id,
  };
  out.write(JSON.stringify({ index: { _index: "tabular", _id: e.id } }) + "\n");
  out.write(JSON.stringify(doc) + "\n");
  written++;
}
out.end(() => {
  console.log(`Parsed ${entries.length} codes -> wrote ${written} entry docs to ${OUTPUT}`);
});
