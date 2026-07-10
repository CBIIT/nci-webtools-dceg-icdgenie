const { lookup } = require("./translate-core");

// ICD-10-CM <-> ICD-11 translation lookup. Single code, explicit direction.
//   from = "icd10"  -> look up the icd10_to_icd11 index (groups = OR alternatives, codes = AND)
//   from = "icd11"  -> look up the icd11_to_icd10 index (strictly 1-to-1)
// Grouping semantics documented in docs/tickets/NCIATWP-translation-feature/questions.md (A1).
async function translate(request, response) {
  const { logger } = request.app.locals;
  const { code, from } = request.body;
  logger.debug(`translate: from=${from} code=${code}`);

  try {
    const result = await lookup(from, code);
    return response.json(result);
  } catch (error) {
    logger.error(error);
    return response.status(500).json({ found: false, message: "Translation lookup failed." });
  }
}

module.exports = {
  translate,
};
