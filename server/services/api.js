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
const createAwsOpensearchConnector = require("aws-opensearch-connector");

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

api.post("/translate", async (request, response) => {
  const { logger } = request.app.locals;
  var client = new Client({
    node: host,
    ssl: {
      rejectUnauthorized: false
    }
  })
  console.log("\"" + request.body.params + "\"")
  var body = {
    "query": {
      "bool": {
        "filter": [
          {
            "query_string": {
              "query": "\"" + request.body.params + "\"",
              "fields": ["icdo3", "icd10"],
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

  const results = await client.search({ index: "translations", body })
  response.json(results.body.hits.hits.map((e) => { return e._source }))
})

async function fuzzySearch(options, client, index) {

  var results = []
  await Promise.all(options.map(async (e) => {

    var body = {
      "query": {
        "bool": {
          "filter": [
            {
              "query_string": {
                "query": e.text,
                "fields": ["*"],
                "lenient": true,
                "analyze_wildcard": true,
                "allow_leading_wildcard": true,
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
      "size": 500
    }

    const query = await client.search({ index: index, body })
    results = results.concat(query.body.hits.hits)
  }))


  return results
}

api.post("/opensearch", async (request, response) => {
  const { logger } = request.app.locals;
  var client = new Client({
    node: host,
    ssl: {
      rejectUnauthorized: false
    }
  })

  const query = request.body.search.split(" ").length === 1 ? "*" + request.body.search + "*" : "\"" + request.body.search + "\""
  logger.info(query)

  var body = {
    "query": {
      "bool": {
        "filter": [
          {
            "query_string": {
              "query": query,
              "fields": ["*"],
              "lenient": true,
              "analyze_wildcard": true,
              "allow_leading_wildcard": true,
            }
          }
        ],
      }
    },
    "suggest": {
      "spell-check": {
        "text": query,
        "term": {
          "field": "description"
        }
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
    "size": 500
  }

  const [tabularResult, neoplasmResult, drugResult, injuryResult, icdo3Result] = await Promise.all([
    client.search({ index: "tabular", body }),
    client.search({ index: "neoplasm", body }),
    client.search({ index: "drug", body }),
    client.search({ index: "injury", body }),
    client.search({ index: "icdo3", body })
  ])


  var results = {
    tabular: tabularResult.body.hits.hits,
    neoplasm: neoplasmResult.body.hits.hits,
    drug: drugResult.body.hits.hits,
    injury: injuryResult.body.hits.hits,
    icdo3: icdo3Result.body.hits.hits,
    showSuggestions: true,
    fuzzyTerms: [],
  }

  const tabularOptions = tabularResult.body.suggest["spell-check"][0].options;
  const neoplasmOptions = neoplasmResult.body.suggest["spell-check"][0].options;
  const drugOptions = drugResult.body.suggest["spell-check"][0].options;
  const injuryOptions = injuryResult.body.suggest["spell-check"][0].options;
  const icdo3Options = icdo3Result.body.suggest["spell-check"][0].options

  console.log(injuryOptions)

  if (results.tabular.length || results.neoplasm.length || results.drug.length || results.injury.length || results.icdo3.length) {
    const [tabularFuzzy, neoplasmFuzzy, drugFuzzy, injuryFuzzy, icdo3Fuzzy] = await Promise.all([
      fuzzySearch(tabularOptions, client, "tabular"),
      fuzzySearch(neoplasmOptions, client, "neoplasm"),
      fuzzySearch(drugOptions, client, "drug"),
      fuzzySearch(injuryOptions, client, "injury"),
      fuzzySearch(icdo3Options, client, "icdo3")
    ])

    results.tabular = results.tabular.concat(tabularFuzzy)
    results.neoplasm = results.neoplasm.concat(neoplasmFuzzy)
    results.drug = results.drug.concat(drugFuzzy)
    results.injury = results.injury.concat(injuryFuzzy)
    results.icdo3 = results.icdo3.concat(icdo3Fuzzy)
    results.showSuggestions = false
  }
  else {
    const minScore = 0.75
    results.fuzzyTerms = [...new Set([
      ...tabularOptions.filter(e => e.score >= minScore).map(e => e.text),
      ...neoplasmOptions.filter(e => e.score >= minScore).map(e => e.text),
      ...drugOptions.filter(e => e.score >= minScore).map(e => e.text),
      ...injuryOptions.filter(e => e.score >= minScore).map(e => e.text),
      ...icdo3Options.filter(e => e.score >= minScore).map(e => e.text)
    ])]
  }


  response.json(results)
})

module.exports = { api };
