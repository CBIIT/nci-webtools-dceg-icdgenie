const { Client } = require("@opensearch-project/opensearch")
const { stringify } = require("csv-stringify")
const { APP_BASE_URL, ADMIN, PASSWORD, DOMAIN } = process.env;
const host = `https://${ADMIN}:${PASSWORD}@${DOMAIN}`;
var _ = require('lodash');

// AC #6 Level priority: Preferred > Synonym (joined "or") > Related (joined "or")
function applyLevelPriority(hits) {
  const preferred = hits.filter(h => h._source.level === "Preferred")
  if (preferred.length > 0) return preferred[0]._source.description

  const synonyms = hits.filter(h => h._source.level === "Synonym")
  if (synonyms.length > 0) return synonyms.map(h => h._source.description).join(" or ")

  const related = hits.filter(h => h._source.level === "Related")
  if (related.length > 0) return related.map(h => h._source.description).join(" or ")

  return hits[0]._source.description
}

async function batchQuery(request, response) {
  const { logger, database } = request.app.locals;
  const { input, inputType, id, icdo3Site, icdo3Morph, icdo4Site, icdo4Morph } = request.body;
  logger.debug("batch query: inputType=" + inputType);

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
  var results = [];

  try {

  for (var i = 0; i < inputs.length; i++) {

    if (inputType === "icd10pcs") {
      index = "icd10pcs"
      notFoundMsg = "ICD-10-PCS code not found"
    }
    else if (inputType === "icd11") {
      index = "icd11"
      notFoundMsg = "ICD-11 code not found"
    }

    if (inputType === "icd10" || inputType === "icd10pcs" || inputType === "icd11" || (inputType === "icdo3" && icdo3Site !== icdo3Morph) || (inputType === "icdo4" && icdo4Site !== icdo4Morph)) {

      if (inputType === "icdo3" && icdo3Morph) {
        index = "icdo3"
        notFoundMsg = "Morphology code not found"
      }
      else if (inputType === "icdo3" && icdo3Site) {
        notFoundMsg = "Site code not found"
      }
      else if (inputType === "icdo4" && icdo4Morph) {
        index = "icdo4"
        notFoundMsg = "ICD-O-4 morphology code not found"
      }
      else if (inputType === "icdo4" && icdo4Site) {
        notFoundMsg = "Site code not found"
      }

      results.push(await Promise.all(inputs[i].map(async (e) => {

        var patientId;
        var code;

        if (id) {
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

          if (inputType === "icdo3" && icdo3Morph) {
            preferred = hits.indexOf((e) => { e._source.preferred === "1" })
            preferred = preferred === -1 ? 0 : preferred
          }

          return ({
            id: patientId,
            code: e[1],
            description: hits.length ? hits[preferred]._source.description : notFoundMsg
          })
        }
        else
          return ({
            code: e[0],
            description: hits.length ? hits[0]._source.description : notFoundMsg
          })
      })))
    }
    else if (inputType === "icdo4" && icdo4Site && icdo4Morph) {
      // ICD-O-4 combined morph + site
      results.push(await Promise.all(inputs[i].map(async (e) => {

        var patientId;
        var morphology;
        var site;

        if (id) {
          patientId = e[0]
          morphology = e[1]
          site = e[2]
        }
        else {
          morphology = e[0]
          site = e[1]
        }

        var morphMsg = morphology === "NA" || morphology === "" ? "NA" : ""
        var siteMsg = site === "NA" || site === "" ? "NA" : ""

        var morphResults;
        var siteResults;
        var indicator = morphMsg === "NA" && siteMsg === "NA" ? "NA" : "";

        var allMorphHits = [];

        if (morphMsg !== "NA") {
          const body = {
            "query": {
              "bool": {
                "must": [{ "match": { "code": "\"" + morphology + "\"" } }],
                "filter": [{ "query_string": { "query": "\"" + morphology + "\"", "fields": ["code"], "lenient": true, "fuzziness": "0" } }]
              }
            },
            "size": 5000
          }

          const query = await client.search({ index: "icdo4", body: body });
          allMorphHits = query.body.hits.hits
          if (allMorphHits.length === 0) {
            morphMsg = "Morphology not found"
          }
          else {
            // Default: use Preferred term
            var preferredHit = allMorphHits.find(h => h._source.level === "Preferred")
            morphResults = preferredHit ? preferredHit._source.description : allMorphHits[0]._source.description
            morphMsg = morphResults
          }
        }

        if (siteMsg !== "NA") {
          const body = {
            "query": {
              "bool": {
                "must": [{ "match": { "code": "\"" + site + "\"" } }],
                "filter": [{ "query_string": { "query": "\"" + site + "\"", "fields": ["code"], "lenient": true, "fuzziness": "0" } }]
              }
            },
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
                  { "match": { "icdo4": "\"" + morphology + "\"" } },
                  { "match": { "icd10": "\"" + site + "\"" } }
                ],
                "filter": [{ "query_string": { "query": "\"" + morphology + "\"", "fields": ["icdo4"], "lenient": true, "fuzziness": "0" } }]
              }
            },
            "size": 5000
          }

          const query = await client.search({ index: "translations_icdo4", body: body });
          const comboHits = query.body.hits.hits

          if (comboHits.length) {
            // Combo found — apply Level priority to morph rows matching this ICD-10 reference
            // Filter morph hits to rows whose codeReference contains the site code
            const sitePrefix = site.split(".")[0] + "."
            const matchingRows = allMorphHits.filter(h => {
              const ref = h._source.codeReference || ""
              return ref.includes(site) || ref.includes(sitePrefix.slice(0, -1) + "._")
            })

            if (matchingRows.length > 0) {
              morphResults = applyLevelPriority(matchingRows)
            }
            // else keep Preferred from all hits

            indicator = morphResults + ", " + siteResults
          }
          else {
            // Combo not found — morphResults stays as Preferred term
            indicator = "Combination not found"
          }
        }
        else if ((morphMsg !== "NA" && siteMsg !== "NA") && (morphMsg === "Morphology not found" || siteMsg === "Site not found"))
          indicator = "Combination not found"
        else if (indicator !== "NA") {
          indicator = (morphMsg === "NA" ? "Morphology is NA" : morphMsg) + ", " + (siteMsg === "NA" ? "Site is NA" : siteMsg)
        }

        if (patientId) {
          return ({
            id: patientId,
            morphCode: morphology,
            siteCode: site,
            morphology: morphResults ? morphResults : morphMsg,
            site: siteResults ? siteResults : siteMsg,
            indicator: indicator
          })
        }
        else {
          return ({
            morphCode: morphology,
            siteCode: site,
            morphology: morphResults ? morphResults : morphMsg,
            site: siteResults ? siteResults : siteMsg,
            indicator: indicator
          })
        }
      })))
    }
    else {
      // ICD-O-3 combined morph + site (existing logic)
      results.push(await Promise.all(inputs[i].map(async (e) => {

        var patientId;
        var morphology;
        var site;

        if (id) {
          patientId = e[0]
          morphology = e[1]
          site = e[2]
        }
        else {
          morphology = e[0]
          site = e[1]
        }

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

        if (patientId) {
          return ({
            id: patientId,
            morphCode: morphology,
            siteCode: site,
            morphology: morphResults ? morphResults : morphMsg,
            site: siteResults ? siteResults : siteMsg,
            indicator: indicator
          })
        }
        else {
          return ({
            morphCode: morphology,
            siteCode: site,
            morphology: morphResults ? morphResults : morphMsg,
            site: siteResults ? siteResults : siteMsg,
            indicator: indicator
          })
        }
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
  } catch (error) {
    const { logger } = request.app.locals;
    logger.error("Batch query error:", error);
    response.status(500).json({ error: "An error occurred processing the batch query" });
  }
}

module.exports = {
  batchQuery,
};
