const path = require("path");
const express = require("express");
const request = require("supertest");
const sqlite = require("better-sqlite3");
const { logs, database } = require("../config");
const { api } = require("../services/api");
const { getLogger } = require("../services/logger");

const app = express();
app.locals.logger = getLogger("test", logs);
app.locals.database = sqlite(database);
app.use("/api", api);

test("api is defined", () => {
  expect(api).toBeDefined();
});

test("GET api/ping returns true", async () => {
  const response = await request(app).get("/api/ping");
  expect(response.body).toBe(true);
});

test("GET api/search returns icd10 results when searching by code", async () => {
  const params = { code: "C76.2" };
  const response = await request(app).get("/api/search").query(params);
  const responseValues = response.body.icd10.map((record) => Object.values(record)).flat();
  expect(responseValues).toContain(params.code);
});

test("GET api/search returns icd10 results when searching by description", async () => {
  const params = { description: "neoplasm" };
  const response = await request(app).get("/api/search").query(params);

  // icd10 results should not be empty
  const icd10Results = response.body.icd10;
  expect(icd10Results.length).toBeGreaterThan(0);

  // all icd10 results should contain the search term
  const descriptionRegex = new RegExp(params.description, "i");
  for (const result of icd10Results) {
    const resultContainsDescription = descriptionRegex.test(result.neoplasm) || descriptionRegex.test(result.parent);
    expect(resultContainsDescription).toBe(true);
  }
});
