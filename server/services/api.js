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

api.post("/batch", async (request, response) => {
  const { logger, database } = request.app.locals;
  logger.debug("batch: " + JSON.stringify(request.body));
  const { input, inputType, icd10Id, icdo3Site, icdo3Morph } = request.body;

  var client = new Client({
    node: host,
    ssl: {
      rejectUnauthorized: false
    }
  })

  var index = "tabular"
  var notFoundMsg = "ICD-10 code not found"
  var mustQuery;

  const inputs = input
    .split(/\n/g)
    .filter((e) => e.length > 0)
    .map((e) => e.split("\t").map((f) => f.trim().replace(/\"/g, "")))

  console.log(inputs)
  var results = [];

  if (inputType === "icd10" || (icdo3Site !== icdo3Morph)) {

    if (icdo3Morph) {
      index = "icdo3"
      notFoundMsg = "Morphology code not found"
    }
    else if (icdo3Site) {
      notFoundMsg = "Site code not found"
    }

    await Promise.all(inputs.map(async (e) => {

      var patientId;
      var code;

      if (icd10Id || icdo3Site || icdo3Morph) {
        patientId = e[0]
        code = "\"" + e[1] + "\""
        mustQuery = [
          {
            "match": {
              "code": code,
            }
          }
        ]
      }
      else {
        code = "\"" + e[0] + "\""
        mustQuery = [
          {
            "match": {
              "code": code,
            }
          }
        ]
      }

      var body = {
        "query": {
          "bool": {
            "must": mustQuery,
            "must_not": [
              {
                "query_string": {
                  "query": "\"DO NOT USE\"",
                  "fields": ["description"],
                }
              }
            ],
            "filter": [
              {
                "query_string": {
                  "query": code,
                  "fields": ["code"],
                  "lenient": true,
                  "fuzziness": "0"
                }
              }
            ]
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
        "size": 5000
      }

      const query = await client.search({ index: index, body: body });
      const hits = query.body.hits.hits

      if (patientId) {
        var preferred = 0;

        if (icdo3Morph) {
          preferred = hits.indexOf((e) => { e._source.preferred === "1" })
          preferred = preferred === -1 ? 0 : preferred
        }

        results = results.concat({
          id: patientId,
          code: e[1],
          description: hits.length ? hits[preferred]._source.description : notFoundMsg
        })
      }
      else
        results = results.concat({
          code: e[0],
          description: hits.length ? hits[0]._source.description : notFoundMsg
        })
    }))
  }
  else {
    await Promise.all(inputs.map(async (e) => {
      const patientId = e[0]
      const morphology = e[1]
      const site = e[2]
      var morphMsg = morphology === "NA" || morphology === "" ? "NA" : ""
      var siteMsg = site === "NA" || site === "" ? "NA" : ""

      var morphResults;
      var siteResults;
      var indicator = morphMsg === "NA" && siteMsg ==="NA" ? "NA" : "";

      if (morphMsg !== "NA") {
        const body = {
          "query": {
            "bool": {
              "must": [
                {
                  "match": {
                    "code": "\"" + morphology + "\"",
                  }
                }
              ],
              "must_not": [
                {
                  "query_string": {
                    "query": "\"DO NOT USE\"",
                    "fields": ["description"],
                  }
                }
              ],
              "filter": [
                {
                  "query_string": {
                    "query": "\"" + morphology + "\"",
                    "fields": ["code"],
                    "lenient": true,
                    "fuzziness": "0"
                  }
                }
              ]
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
          "size": 5000
        }

        const query = await client.search({ index: "icdo3", body: body });
        const hits = query.body.hits.hits
        if(hits.length === 0){
          morphMsg = "Morphology not found"
        }
        else {
          var preferred = hits.indexOf((e) => { e._source.preferred === "1" })
          morphResults = hits[preferred === -1 ? 0 : preferred]._source.description
          morphMsg = "Morphology found"
        }
        
      }

      if(siteMsg !== "NA"){

        const body = {
          "query": {
            "bool": {
              "must": [
                {
                  "match": {
                    "code": "\"" + site + "\"",
                  }
                }
              ],
              "must_not": [
                {
                  "query_string": {
                    "query": "\"DO NOT USE\"",
                    "fields": ["description"],
                  }
                }
              ],
              "filter": [
                {
                  "query_string": {
                    "query": "\"" + site + "\"",
                    "fields": ["code"],
                    "lenient": true,
                    "fuzziness": "0"
                  }
                }
              ]
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
          "size": 5000
        }

        const query = await client.search({ index: "tabular", body: body });
        const hits = query.body.hits.hits
        if(hits.length === 0){
          siteMsg = "Site not found"
        }
        else{
          siteResults = hits[0]._source.description
          siteMsg = "Site found"
        }
      }

      if(morphResults && siteResults){
        
        const body = {
          "query": {
            "bool": {
              "must": [
                {
                  "match": {
                    "icdo3": "\"" + morphology + "\"",
                  }
                },
                {
                  "match": {
                    "icd10": "\"" + site + "\"",
                  }
                }
              ],
              "must_not": [
                {
                  "query_string": {
                    "query": "\"DO NOT USE\"",
                    "fields": ["description"],
                  }
                }
              ],
              "filter": [
                {
                  "query_string": {
                    "query": "\"" + morphology + "\"",
                    "fields": ["icdo3"],
                    "lenient": true,
                    "fuzziness": "0"
                  }
                }
              ]
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
          "size": 5000
        }

        const query = await client.search({ index: "translations", body: body });
        const hits = query.body.hits.hits
       

        if(hits.length){
          indicator = morphResults + ", " + siteResults
        }
        else{
          indicator = "Combination not found"
        }
      }
      else if((morphMsg !== "NA" && siteMsg !== "NA") && (morphMsg === "Morphology not found" || siteMsg === "Site not found"))
        indicator = "Combination not found"
      else if(indicator !== "NA"){
        indicator = (morphMsg === "NA" ? "Morphology is NA" : morphMsg) + ", " + (siteMsg === "NA" ? "Site is NA" : siteMsg)
      }
      
      results = results.concat({
        id: patientId,
        morphCode: morphology,
        siteCode: site,
        morphology: morphResults ? morphResults : morphMsg,
        site: siteResults ? siteResults : siteMsg,
        indicator: indicator
      })

    }))
  }


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

api.post("/browse", async (request, response) => {
  const { logger } = request.app.locals;
  var client = new Client({
    node: host,
    ssl: {
      rejectUnauthorized: false
    }
  })

  var body = {
    "query": {
      "range": {
        "price": {
          "gte": 1000,
          "lte": 2000
        }
      }
    }
  }
  const query = await client.search({ index: "tabular", body })
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
          "must_not": [
            {
              "query_string": {
                "query": "\"DO NOT USE\"",
                "fields": ["description"],
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
  var { search } = request.body
  const splitSearch = search.split(" ")

  //Handle [organ] cancer search
  if (splitSearch.length > 1 && splitSearch[splitSearch.length - 1] === "cancer") {
    search = splitSearch.slice(0, -1).join(" ")
    console.log(search)
  }

  //Prefix and suffix search for single words, exact match for icdo-3 and multi word queries
  const query = search.split(" ").length === 1 && !search.includes("/") ? "*" + search + "*" : "\"" + search + "\""

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
              "fuzziness": search.includes("/") ? "0" : "AUTO"
            }
          }
        ],
        "must_not": [
          {
            "query_string": {
              "query": "\"DO NOT USE \"",
              "fields": ["description"],
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
  const icdo3Options = !search.includes("/") ? icdo3Result.body.suggest["spell-check"][0].options : []

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
