const { client } = require("./opensearch-client");

// Exact code match. Codes are stored as text with a .keyword sub-field; match only on the exact
// .keyword value. We intentionally do NOT add a match_phrase clause on the analyzed field: the
// analyzer splits codes on punctuation (e.g. "1A03.Z" -> ["1a03","z"]), so a phrase match would let
// a partial stem like "1A03" bleed onto its children and return the wrong code's mapping. This
// mirrors regular search, which also dropped fuzzy matching for code lookups and uses exact only.
function exactCode(field, value) {
  return { term: { [`${field}.keyword`]: value } };
}

// Direction config so the two lookups share one code path (no copy-paste branches).
const DIRECTIONS = {
  icd10: {
    index: "icd10_to_icd11",
    field: "icd10Code",
    sourceSystem: "ICD-10-CM",
    targetSystem: "ICD-11",
    notFound: "No ICD-11 translation found for this ICD-10-CM code.",
    // The ICD-11 code/title are stored verbatim from the mapping file (A1); the client displays them
    // as-is (the `&`/`/` string is not parsed).
    toResult: (hit) => ({
      source: { code: hit.icd10Code, title: hit.icd10Title, chapter: hit.icd10Chapter, system: "ICD-10-CM" },
      targetSystem: "ICD-11",
      target: { code: hit.icd11Code || "", title: hit.icd11Title || "" },
    }),
  },
  icd11: {
    index: "icd11_to_icd10",
    field: "icd11Code",
    sourceSystem: "ICD-11",
    targetSystem: "ICD-10-CM",
    notFound: "No ICD-10-CM translation found for this ICD-11 code.",
    toResult: (hit) => ({
      source: { code: hit.icd11Code, title: hit.icd11Title, chapter: hit.icd11Chapter, system: "ICD-11" },
      targetSystem: "ICD-10-CM",
      target: { code: hit.icd10Code || "", title: hit.icd10Title || "" },
    }),
  },
};

function normalizeDirection(from) {
  return from === "icd11" ? "icd11" : "icd10"; // default 10 -> 11
}

// Look up a single code in the given direction. Returns a uniform payload used by both the
// single-code endpoint and the batch endpoint.
async function lookup(from, rawCode) {
  const dir = normalizeDirection(from);
  const cfg = DIRECTIONS[dir];
  // Codes are stored uppercase (e.g. "A02.2", "1A00", "XN8P1"); normalize so the exact keyword
  // match isn't defeated by lowercase input.
  const code = (rawCode ?? "").trim().toUpperCase();

  if (!code) {
    return { from: dir, code, found: false, message: "Enter a code to translate." };
  }

  const query = await client.search({
    index: cfg.index,
    body: { query: exactCode(cfg.field, code), size: 1 },
  });
  const hit = query.body.hits.hits[0]?._source;

  if (!hit) {
    return { from: dir, code, found: false, message: cfg.notFound };
  }
  return { from: dir, found: true, ...cfg.toResult(hit) };
}

module.exports = { lookup, exactCode, normalizeDirection };
