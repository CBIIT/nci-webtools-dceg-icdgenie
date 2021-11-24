function getStatus(database) {
  return database.prepare(`SELECT 1`).pluck().get() == 1;
}

function searchICD10ByCode(database, code) {
  return database
    .prepare(
      `
      SELECT * FROM icd10 
      WHERE 
        malignantPrimary like :code OR
        malignantSecondary like :code OR
        carcinomaInSitu like :code OR
        benign like :code OR
        uncertainBehavior like :code OR
        unspecifiedBehavior like :code OR
        other like :code
    `,
    )
    .all({ code: `${code}%` });
}

function searchICD10ByDescription(database, description) {
  return database
    .prepare(
      `
      SELECT * FROM icd10 
      WHERE 
        neoplasm like :description OR
        parent like :description
    `,
    )
    .all({ description: `%${description}%` });
}

function search(database, query) {
  let results = {};

  if (query.code) {
    results.icd10 = searchICD10ByCode(database, query.code);
  } else if (query.description) {
    results.icd10 = searchICD10ByDescription(database, query.description);
  }

  return results;
}

module.exports = {
  search,
  getStatus,
};
