const icdo3 = require("./icdo3");
const icd10 = require("./icd10");
const translate = require("./translate");

function batchExport(database, query) {
  const { inputType, input, outputType } = query;
  const inputs = input
    .split(/\n/g)
    .map((input) => input.trim().replace(/\"/g, ""))
    .filter((input) => input.length > 0);
  let results = [];

  database.exec(`
    drop table if exists input;
    create temporary table input (input text);
  `);

  for (let input of inputs) {
    database.prepare(`insert into input values (?)`).run([input]);
  }

  if (inputType === "icdo3") {
    // batch export all children of icdo3 codes
    if (outputType === "icdo3") {
      results = database
        .prepare(
          `select input, code as icdo3, description as icdo3Description
          from input join icdo3_morphology on icdo3_morphology.code like input.input || '%'`,
        )
        .all();
    }

    // batch translate all icdo3 codes to icd10 codes
    else if (outputType === "icd10") {
      results = database
        .prepare(
          `select input, icd10, icd10Description
          from input join icd10_icdo3_mapping on icd10_icdo3_mapping.icdo3 like input.input || '%'`,
        )
        .all();
    }
  } else if (inputType === "icd10") {
    // batch translate all icd10 codes to icdo3 codes
    if (outputType === "icdo3") {
      results = database
        .prepare(
          `select input, icdo3, icdo3Description
          from input join icd10_icdo3_mapping on icd10_icdo3_mapping.icd10 like input.input || '%'`,
        )
        .all();
    }

    // batch export all children of icd10 codes
    else if (outputType === "icd10") {
      results = database
        .prepare(
          `select input, code as icd10, description as icd10Description
          from input join icd10 on icd10.code like input.input || '%'`,
        )
        .all();
    }
  } else {
    // batch export all icdo3 codes/descriptions containing the query
    if (outputType === "icdo3") {
      results = database
        .prepare(
          `select input, code as icdo3, description as icdo3Description 
          from input join icdo3_morphology on icdo3_morphology.description like '%' || input.input || '%'`,
        )
        .all();
    }

    // batch export all icd10 codes/descriptions containing the query
    else if (outputType === "icd10") {
      results = database
        .prepare(
          `select input, code as icd10, description as icd10Description 
          from input join icd10 on icd10.path like '%' || input.input || '%'`,
        )
        .all();
    }
  }

  return results;
}

module.exports = {
  batchExport,
};
