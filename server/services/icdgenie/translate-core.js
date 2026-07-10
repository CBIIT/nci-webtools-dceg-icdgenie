const { client } = require("./opensearch-client");

// Exact code match on a keyword field. The mapping codes are stored as text with a .keyword
// sub-field; match on the keyword (exact) and fall back to a phrase match on the analyzed field.
function exactCode(field, value) {
  return {
    bool: {
      should: [
        { term: { [`${field}.keyword`]: value } },
        { match_phrase: { [field]: value } },
      ],
      minimum_should_match: 1,
    },
  };
}

// Direction config so the two lookups share one code path (no copy-paste branches).
const DIRECTIONS = {
  icd10: {
    index: "icd10_to_icd11",
    field: "icd10Code",
    sourceSystem: "ICD-10-CM",
    targetSystem: "ICD-11",
    notFound: "No ICD-11 translation found for this ICD-10-CM code.",
    toResult: (hit) => ({
      source: { code: hit.icd10Code, title: hit.icd10Title, chapter: hit.icd10Chapter, system: "ICD-10-CM" },
      targetSystem: "ICD-11",
      // groups joined by OR; codes within a group joined by AND
      groups: hit.groups || [],
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
      // Modeled as a single OR group with one AND code so the client renders both directions uniformly.
      groups: [{
        codes: hit.icd10Code ? [hit.icd10Code] : [],
        title: hit.icd10Title,
        chapter: hit.icd10Chapter,
        block: !hit.icd10Code,
      }],
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
