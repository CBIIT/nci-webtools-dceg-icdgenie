const express = require("express");
const request = require("supertest");
const { api } = require("../services/api");
const { getLogger } = require("../services/logger");
const { loadDatabaseInMemory } = require("../services/database");
const { APP_NAME, DATABASE_PATH, LOG_LEVEL } = process.env;

const app = express();
app.locals.logger = getLogger(APP_NAME, { level: LOG_LEVEL });
app.locals.database = loadDatabaseInMemory(DATABASE_PATH);
app.use("/api", api);

test("api is defined", () => {
  expect(api).toBeDefined();
});

test("GET api/ping returns true", async () => {
  const response = await request(app).get("/api/ping");
  expect(response.body).toBe(true);
});

test("GET api/search returns icd10 results when searching by code", async () => {
  const params = { code: "C76.2", format: "list" };
  const response = await request(app).get("/api/search/icd10").query(params);
  const responseValues = response.body.map((record) => Object.values(record)).flat();
  expect(responseValues).toContain(params.code);
});

test("GET api/search returns icd10 results when searching by description", async () => {
  const params = { description: "neoplasm", format: "list" };
  const response = await request(app).get("/api/search/icd10").query(params);

  // icd10 results should not be empty
  const icd10Results = response.body;
  expect(icd10Results.length).toBeGreaterThan(0);

  // icd10 results should contain the search term
  const descriptionRegex = new RegExp(params.description, "i");
  const responseValues = response.body.map((record) => Object.values(record)).flat();
  const hasDescription = responseValues.some((value) => descriptionRegex.test(value));
  expect(hasDescription).toBe(true);
});
