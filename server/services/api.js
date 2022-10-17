const { Router, json } = require("express");
const cors = require("cors");
const { stringify } = require("csv-stringify");
const icdgenie = require("./icdgenie");
const icd10 = require("./icdgenie/icd10");
const icdo3 = require("./icdgenie/icdo3");
const translate = require("./icdgenie/translate");
const batch = require("./icdgenie/batch");
const spec = require("./icdgenie/spec");
const { APP_BASE_URL, ADMIN, PASSWORD, DOMAIN } = process.env;
const api = Router();

const { Client } = require("@opensearch-project/opensearch")
const createAwsOpensearchConnector = require("aws-opensearch-connector")

const host = `https://${ADMIN}:${PASSWORD}@${DOMAIN}`;

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
    "sort": [
      {
        "_script": {
          "type": "number",
          "order": "asc",
          "script": "Long.parseLong(doc['_id'].value)"
        }
      }
    ],
    "size": 10000
  }

  const tabularResult = await client.search({
    index: "tabular",
    body
  })

  const neoplasmResult = await client.search({
    index: "neoplasm",
    body
  })

  const drugResult = await client.search({
    index: "drug",
    body
  })

  const injuryResult = await client.search({
    index: "injury",
    body
  })

  const results = {
    tabular: tabularResult.body.hits.hits,
    neoplasm: neoplasmResult.body.hits.hits,
    drug: drugResult.body.hits.hits,
    injury: injuryResult.body.hits.hits,
  }

  response.json(results)
})

module.exports = { api };
