const fs = require("fs");
const fsp = require("fs/promises");
const readline = require("readline");

const { Client } = require("@opensearch-project/opensearch");
const { ADMIN, PASSWORD, DOMAIN } = process.env;
const host = `https://${ADMIN}:${PASSWORD}@${DOMAIN}`;

const client = new Client({
  node: host,
  ssl: {
    rejectUnauthorized: false,
  },
});

const sources = [
  { path: "data/icd10drug.json", index: "drug" },
  { path: "data/icd10eindex.json", index: "injury" },
  { path: "data/icd10neoplasm.json", index: "neoplasm" },
  {
    path: "data/icd10tabular.json",
    index: "tabular",
    // codeID / parent.codeID hold mixed integer and fractional values (e.g. 8033 and
    // 8033.3, encoding hierarchy depth). Without an explicit mapping, concurrent bulk
    // batches race to infer the numeric type (long vs float) and the losing batch's docs
    // are dropped. Pin both to double so every document loads deterministically.
    mappings: {
      properties: {
        codeID: { type: "double" },
        parent: { properties: { codeID: { type: "double" } } },
      },
    },
  },
  { path: "data/icdo3.json", index: "icdo3" },
  { path: "data/translations.json", index: "translations" },
  { path: "data/icd10pcs.json", index: "icd10pcs" },
  { path: "data/icd11.json", index: "icd11" },
  { path: "data/icdo4.json", index: "icdo4" },
  { path: "data/translations_icdo4.json", index: "translations_icdo4" },
];

runImport(client, sources)
  .then(() => {
    client.close();
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    client.close();
    process.exit(1);
  });

async function runImport(client, sources, logger = console) {
  const failures = [];

  for (const source of sources) {
    logger.info(`Importing ${source.path} into ${source.index}`);

    // Delete the index before loading: the bulk import below only writes documents by _id,
    // so documents from a previous dataset would otherwise linger in the index and appear
    // as duplicates in search results.
    await client.indices.delete({ index: source.index }, { ignore: [404] });

    // Create the index up front — concurrent bulk batches racing to auto-create it get
    // their documents rejected. Apply an explicit mapping when the source provides one so
    // fields with mixed numeric types don't hit a dynamic-mapping type race.
    await client.indices.create({
      index: source.index,
      ...(source.mappings ? { body: { mappings: source.mappings } } : {}),
    });

    const datasource = [];
    const reader = readline.createInterface({
      input: fs.createReadStream(source.path),
    });

    let id = 0;
    for await (const line of reader) {
      let contents = JSON.parse(line);
      if (!contents.index) {
        datasource.push({ id, ...contents });
        id++;
      }
    }

    logger.info(`Read ${datasource.length} documents, starting import.`);

    let dropped = 0;
    const result = await client.helpers.bulk({
      datasource,
      onDocument(doc) {
        return {
          index: { _index: source.index, _id: doc.id },
        };
      },
      onDrop(item) {
        dropped++;
        if (dropped <= 10) {
          logger.error(`Failed to index ${source.index} doc id=${item.document?.id}: ${JSON.stringify(item.error)}`);
        }
      },
    });

    logger.info(result);

    if (result.failed > 0) {
      failures.push(`${source.index}: ${result.failed} of ${result.total} documents failed`);
    }

    logger.info(`Imported ${source.index}`);
  }

  if (failures.length > 0) {
    throw new Error(`Import completed with failures — ${failures.join("; ")}`);
  }
}
