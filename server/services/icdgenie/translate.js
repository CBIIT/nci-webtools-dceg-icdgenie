const { Client } = require("@opensearch-project/opensearch")
const { ADMIN, PASSWORD, DOMAIN } = process.env;
const host = `https://${ADMIN}:${PASSWORD}@${DOMAIN}`;

// ICD-10-CM <-> ICD-11 translation lookup. Single code, explicit direction.
//   from = "icd10"  -> look up the icd10_to_icd11 index (groups = OR alternatives, codes = AND)
//   from = "icd11"  -> look up the icd11_to_icd10 index (strictly 1-to-1)
// Grouping semantics documented in docs/tickets/NCIATWP-translation-feature/questions.md (A1).

// Exact keyword match on a code field. The mapping codes are stored as keywords, but the default
// dynamic mapping analyzes them, so match on both the analyzed field and the .keyword sub-field to
// stay exact (e.g. "A02.2" must not also hit "A02" or "A02.20").
function exactCode(field, value) {
  return {
    bool: {
      should: [
        { term: { [`${field}.keyword`]: value } },
        { match_phrase: { [field]: value } },
      ],
      minimum_should_match: 1,
    },
  }
}

async function translate(request, response) {
  const { logger } = request.app.locals;
  const client = new Client({ node: host, ssl: { rejectUnauthorized: false } })

  let { code, from } = request.body;
  // Codes are stored uppercase (e.g. "A02.2", "1A00", "XN8P1"); normalize so the exact
  // keyword match isn't defeated by lowercase input.
  code = (code ?? "").trim().toUpperCase();
  from = from === "icd11" ? "icd11" : "icd10"; // default 10 -> 11

  logger.debug(`translate: from=${from} code=${code}`);

  if (!code) {
    return response.json({ from, code, found: false, message: "Enter a code to translate." });
  }

  try {
    if (from === "icd10") {
      const query = await client.search({
        index: "icd10_to_icd11",
        body: { query: exactCode("icd10Code", code), size: 5 },
      });
      const hit = query.body.hits.hits[0]?._source;
      if (!hit) {
        return response.json({
          from, code, found: false,
          message: "No ICD-11 translation found for this ICD-10-CM code.",
        });
      }
      return response.json({
        from,
        found: true,
        source: {
          code: hit.icd10Code,
          title: hit.icd10Title,
          chapter: hit.icd10Chapter,
          system: "ICD-10-CM",
        },
        targetSystem: "ICD-11",
        // groups joined by OR; codes within a group joined by AND
        groups: hit.groups || [],
      });
    }

    // from === "icd11": strictly 1-to-1
    const query = await client.search({
      index: "icd11_to_icd10",
      body: { query: exactCode("icd11Code", code), size: 5 },
    });
    const hit = query.body.hits.hits[0]?._source;
    if (!hit) {
      return response.json({
        from, code, found: false,
        message: "No ICD-10-CM translation found for this ICD-11 code.",
      });
    }
    return response.json({
      from,
      found: true,
      source: {
        code: hit.icd11Code,
        title: hit.icd11Title,
        chapter: hit.icd11Chapter,
        system: "ICD-11",
      },
      targetSystem: "ICD-10-CM",
      // Modeled as a single OR group with one AND code so the client renders both directions uniformly.
      groups: [{
        codes: hit.icd10Code ? [hit.icd10Code] : [],
        title: hit.icd10Title,
        chapter: hit.icd10Chapter,
        block: !hit.icd10Code,
      }],
    });
  } catch (error) {
    logger.error(error);
    return response.status(500).json({ from, code, found: false, message: "Translation lookup failed." });
  }
}

module.exports = {
  translate,
};
