const { Router, json } = require("express");
const icdgenie = require("./icdgenie");

const api = Router();
api.use(json());

api.get("/ping", (request, response) => {
  const results = icdgenie.getStatus();
  response.json(results);
});

api.get("/getCodeFromDescription", (request, response) => {
  const { description } = request.params;
  const results = icdgenie.getCodeFromDescription(description);
  response.json(results);
});

api.get("/getDescriptionFromCode", (request, response) => {
  const { code } = request.params;
  const results = icdgenie.getDescriptionFromCode(code);
  response.json(results);
});

module.exports = { api };
