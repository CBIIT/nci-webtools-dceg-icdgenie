const { Router, json } = require("express");
const icdgenie = require("./icdgenie");

const api = Router();

api.use(json());

api.get("/ping", (request, response) => {
  const { logger, database } = request.app.locals;
  logger.debug("ping");
  const results = icdgenie.getStatus(database);
  response.json(results);
});

api.get("/search", (request, response) => {
  const { logger, database } = request.app.locals;
  logger.debug("search: " + JSON.stringify(request.query));
  const results = icdgenie.search(database, request.query);
  response.json(results);
});

module.exports = { api };
