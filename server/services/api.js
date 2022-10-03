const { Router, json } = require("express");
const cors = require("cors");
const { stringify } = require("csv-stringify");
const icdgenie = require("./icdgenie");
const icd10 = require("./icdgenie/icd10");
const icdo3 = require("./icdgenie/icdo3");
const translate = require("./icdgenie/translate");
const batch = require("./icdgenie/batch");
const spec = require("./icdgenie/spec");
const { APP_BASE_URL } = process.env;
const api = Router();

const { Client } = require("@opensearch-project/opensearch")
const createAwsOpensearchConnector = require("aws-opensearch-connector")

api.use(cors());
api.use(json());

api.get("/", (request, response) => {
  spec.servers = [{ url: APP_BASE_URL || "." }];
  response.json(spec);
});

api.get("/ping", (request, response) => {
  const { logger, database } = request.app.locals;
  logger.debug("ping");
  const results = icdgenie.getStatus(database);
  response.json(results);
});

api.get("/search/icd10", (request, response) => {
  const { logger, database } = request.app.locals;
  logger.debug("search icd10: " + JSON.stringify(request.query));
  const results = icd10.search(database, request.query);
  response.json(results);
});

api.get("/search/icdo3", (request, response) => {
  const { logger, database } = request.app.locals;
  logger.debug("search icdo3: " + JSON.stringify(request.query));
  const results = icdo3.search(database, request.query);
  response.json(results);
});

api.get("/translate", (request, response) => {
  const { logger, database } = request.app.locals;
  logger.debug("translate: " + JSON.stringify(request.query));
  const results = translate.translateCode(database, request.query);
  response.json(results);
});

api.post("/batch", (request, response) => {
  const { logger, database } = request.app.locals;
  logger.debug("batch: " + JSON.stringify(request.body));
  const results = batch.batchExport(database, request.body);

  if (request.body.outputFormat === "csv") {
    response.set("Content-Type", "text/csv");
    response.set("Content-Disposition", `attachment; filename=icdgenie_batch_export.csv`);
    stringify(results, { header: true }).pipe(response);
  } else {
    response.json(results);
  }
});

api.post("/opensearch", async (request, response) => {
  const { logger } = request.app.locals;
  var client = new Client({
    node: host,
    ssl: {
      rejectUnauthorized: false
    }
  })
  logger.info(request.body.search)
  var body = {
    "query": {
      "bool": {
        "filter": [
          {
            "multi_match": {
              "type": "best_fields",
              "query": request.body.search,
              "lenient": true
            }
          }
        ],
      }
    },
    "size": 10000
  }

  var results = await client.search({
    index: "injury",
    body
  })
  
  response.json(results.body.hits.hits)
})

module.exports = { api };
