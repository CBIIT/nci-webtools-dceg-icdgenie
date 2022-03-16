const icdo3 = require("./icdo3");
const icd10 = require("./icd10");
const translate = require("./translate");

function batchExport(database, query) {
  const { inputType, input, outputType } = query;
  const inputs = input
    .split(/\n/g)
    .map((input) => input.trim())
    .filter((input) => input.length > 0);
  let results = [];

  if (inputType === "icdo3") {
    // batch export all children of icdo3 codes
    if (outputType === "icdo3") {
      for (const code of inputs) {
        results = results.concat(
          icdo3.search(database, { code }).map((result) => ({
            input: code,
            icdo3: result.code,
            icdo3Description: result.description,
          })),
        );
      }
    }

    // batch translate all icdo3 codes to icd10 codes
    else if (outputType === "icd10") {
      for (const code of inputs) {
        results = results.concat(
          translate.translateCode(database, { icdo3: code }).map((result) => ({
            input: code,
            icd10: result.icd10,
            icd10Description: result.icd10Description,
          })),
        );
      }
    }
  } else if (inputType === "icd10") {
    // batch translate all icd10 codes to icdo3 codes
    if (outputType === "icdo3") {
      for (const code of inputs) {
        results = results.concat(
          translate.translateCode(database, { icd10: code }).map((result) => ({
            input: code,
            icdo3: result.icdo3,
            icdo3Description: result.icdo3Description,
          })),
        );
      }
    }

    // batch export all children of icd10 codes
    else if (outputType === "icd10") {
      for (const code of inputs) {
        results = results.concat(
          icd10.search(database, { code }).map((result) => ({
            input: code,
            icd10: result.code,
            icd10Description: result.description,
          })),
        );
      }
    }
  } else {
    // batch export all icdo3 codes/descriptions containing the query
    if (outputType === "icdo3") {
      for (const query of inputs) {
        results = results.concat(
          icdo3.search(database, { query }).map((result) => ({
            input: query,
            icdo3: result.code,
            icdo3Description: result.description,
          })),
        );
      }
    }

    // batch export all icd10 codes/descriptions containing the query
    else if (outputType === "icd10") {
      for (const query of inputs) {
        results = results.concat(
          icd10.search(database, { query }).map((result) => ({
            input: query,
            icd10: result.code,
            icd10Description: result.description,
          })),
        );
      }
    }
  }

  return results;
}

module.exports = {
  batchExport,
};
