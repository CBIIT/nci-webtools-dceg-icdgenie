const { Router, json } = require("express");
const cors = require("cors");
const icdgenie = require("./icdgenie");
const search = require("./icdgenie/search");
const batch = require("./icdgenie/batch");
const spec = require("./icdgenie/spec");
const { APP_BASE_URL } = process.env;
const api = Router();

api.use(cors());
api.use(json({limit: "40mb"}));

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

api.post("/batch", async (request, response) => {
  batch.batchQuery(request, response)
});

api.post("/opensearch", async (request, response) => {
  search.opensearch(request,response)
})

module.exports = { api };
