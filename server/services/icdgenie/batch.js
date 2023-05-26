const { Client } = require("@opensearch-project/opensearch")
const { APP_BASE_URL, ADMIN, PASSWORD, DOMAIN } = process.env;
const host = `https://${ADMIN}:${PASSWORD}@${DOMAIN}`;
var _ = require('lodash');

async function batchQuery(request, response) {
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

  var inputs = input
    .split(/\n/g)
    .filter((e) => e.length > 0)
    .map((e) => e.split("\t").map((f) => f.trim().replace(/\"/g, "")))

  inputs = _.chunk(inputs, 20)
  console.log(inputs)
  var results = [];

 for(var i = 0;i < inputs.length; i++) {

    if (inputType === "icd10" || (icdo3Site !== icdo3Morph)) {

      if (icdo3Morph) {
        index = "icdo3"
        notFoundMsg = "Morphology code not found"
      }
      else if (icdo3Site) {
        notFoundMsg = "Site code not found"
      }

      results.push(await Promise.all(inputs[i].map(async (e) => {

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

          return({
            id: patientId,
            code: e[1],
            description: hits.length ? hits[preferred]._source.description : notFoundMsg
          })
        }
        else
          return({
            code: e[0],
            description: hits.length ? hits[0]._source.description : notFoundMsg
          })
      })))
    }
    else {
      results.push(await Promise.all(inputs[i].map(async (e) => {
        const patientId = e[0]
        const morphology = e[1]
        const site = e[2]
        var morphMsg = morphology === "NA" || morphology === "" ? "NA" : ""
        var siteMsg = site === "NA" || site === "" ? "NA" : ""

        var morphResults;
        var siteResults;
        var indicator = morphMsg === "NA" && siteMsg === "NA" ? "NA" : "";

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
          if (hits.length === 0) {
            morphMsg = "Morphology not found"
          }
          else {
            var preferred = hits.indexOf((e) => { e._source.preferred === "1" })
            morphResults = hits[preferred === -1 ? 0 : preferred]._source.description
            morphMsg = morphResults
          }
        }

        if (siteMsg !== "NA") {

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
          if (hits.length === 0) {
            siteMsg = "Site not found"
          }
          else {
            siteResults = hits[0]._source.description
            siteMsg = siteResults
          }
        }

        if (morphResults && siteResults) {

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


          if (hits.length) {
            indicator = morphResults + ", " + siteResults
          }
          else {
            indicator = "Combination not found"
          }
        }
        else if ((morphMsg !== "NA" && siteMsg !== "NA") && (morphMsg === "Morphology not found" || siteMsg === "Site not found"))
          indicator = "Combination not found"
        else if (indicator !== "NA") {
          indicator = (morphMsg === "NA" ? "Morphology is NA" : morphMsg) + ", " + (siteMsg === "NA" ? "Site is NA" : siteMsg)
        }

        return({
          id: patientId,
          morphCode: morphology,
          siteCode: site,
          morphology: morphResults ? morphResults : morphMsg,
          site: siteResults ? siteResults : siteMsg,
          indicator: indicator
        })

      })))
    }
  }


  if (request.body.outputFormat === "csv") {
    response.set("Content-Type", "text/csv");
    response.set("Content-Disposition", `attachment; filename=icdgenie_batch_export.csv`);
    stringify(results.flat(), { header: true }).pipe(response);
  } else {
    response.json(results.flat());
  }
}

module.exports = {
  batchQuery,
};
