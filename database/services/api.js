const { Router, json } = require("express");
const sqlite = require("better-sqlite3");
const icdgenie = require("./icdgenie");
const config = require("../config.json");

const api = Router();
const database = sqlite(config.database);

api.use(json());

api.get("/ping", (request, response) => {
  const results = icdgenie.getStatus();
  response.json(results);
});

api.get("/search", (request, response) => {
  const { logger } = request.app.locals;
  logger.debug("Search: " + JSON.stringify(request.query));
  const results = icdgenie.search(database, request.query);
  response.json(results);
});

module.exports = { api };
