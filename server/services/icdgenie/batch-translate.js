const _ = require("lodash");
const { lookup, normalizeDirection } = require("./translate-core");

// Batch ICD-10-CM <-> ICD-11 translation. Accepts a newline-separated list of codes (optionally
// tab-prefixed with a Participant ID) and a direction; returns one structured result per input,
// reusing the same single-code lookup. The client renders these as rows (source left, translation
// right) and explodes one-to-many combinations into one export row per OR alternative.
async function batchTranslate(request, response) {
  const { logger } = request.app.locals;
  const { input, from, id } = request.body;
  const dir = normalizeDirection(from);
  logger.debug(`batch translate: from=${dir} id=${!!id}`);

  try {
    // Mirror batch.js input parsing: split on newlines, tab-split each row, trim and de-quote.
    const rows = (input ?? "")
      .split(/\n/g)
      .filter((e) => e.length > 0)
      .map((e) => e.split("\t").map((f) => f.trim().replace(/"/g, "")));

    if (!Array.isArray(rows)) {
      return response.status(400).json({ message: "Invalid input." });
    }

    const results = [];
    // Chunk so we don't fan out thousands of queries at once (mirrors the batch.js chunk size).
    for (const chunk of _.chunk(rows, 20)) {
      const part = await Promise.all(
        chunk.map(async (cols) => {
          const patientId = id ? cols[0] : undefined;
          const code = id ? cols[1] : cols[0];
          const result = await lookup(dir, code);
          return { id: patientId, input: code, ...result };
        })
      );
      results.push(...part);
    }

    response.json({ from: dir, results });
  } catch (error) {
    logger.error(error);
    response.status(500).json({ message: "Batch translation failed. Please try again." });
  }
}

module.exports = {
  batchTranslate,
};
