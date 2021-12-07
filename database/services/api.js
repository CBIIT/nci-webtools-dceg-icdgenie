const { Router, json } = require("express");
const icd10 = require("./icdgenie/icd10");

const api = Router();

api.use(json());

api.get("/ping", (request, response) => {
  const { logger, database } = request.app.locals;
  logger.debug("ping");
  const results = icdgenie.getStatus(database);
  response.json(results);
});

api.get("/search/icd10", (request, response) => {
  const { logger, database } = request.app.locals;
  logger.debug("search: " + JSON.stringify(request.query));
  const results = icd10.search(database, request.query);
  response.json(results);
});

module.exports = { api };
