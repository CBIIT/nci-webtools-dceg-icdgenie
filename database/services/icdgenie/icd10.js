function getStatus(database) {
  return database.prepare(`SELECT 1`).pluck().get() == 1;
}

function searchInjuryTable(database, { code, description }) {
  if (code) {
    return database.prepare(`SELECT * FROM icd10_injury WHERE code LIKE :code order by code`).all({ code: `${code}%` });
  } else if (description) {
    return database
      .prepare(`SELECT * FROM icd10_injury WHERE path like :description order by path`)
      .all({ description: `%${description}%` });
  } else {
    return database.prepare(`SELECT * FROM icd10_injury`).all();
  }
}

function searchDrugTable(database, { code, description }) {
  if (code) {
    return database
      .prepare(
        `SELECT * FROM icd10_drug WHERE 
        poisoningAccidental LIKE :code OR
        poisoningIntentionalSelfHarm LIKE :code OR
        poisoningAssault LIKE :code OR
        poisoningUndetermined LIKE :code OR
        adverseEffect LIKE :code OR
        underdosing LIKE :code`,
      )
      .all({ code: `${code}%` });
  } else if (description) {
    return database
      .prepare(`SELECT * FROM icd10_drug WHERE path like :description order by path`)
      .all({ description: `%${description}%` });
  } else {
    return database.prepare(`SELECT * FROM icd10_drug`).all();
  }
}

function searchNeoplasmTable(database, { code, description }) {
  if (code) {
    return database
      .prepare(
        `SELECT * FROM icd10_neoplasm WHERE 
        malignantPrimary LIKE :code OR
        malignantSecondary LIKE :code OR
        carcinomaInSitu LIKE :code OR
        benign LIKE :code OR
        uncertainBehavior LIKE :code OR
        unspecifiedBehavior LIKE :code`,
      )
      .all({ code: `${code}%` });
  } else if (description) {
    return database
      .prepare(`SELECT * FROM icd10_neoplasm WHERE path like :description order by path`)
      .all({ description: `%${description}%` });
  } else {
    return database.prepare(`SELECT * FROM icd10_neoplasm`).all();
  }
}

function searchIndexTable(database, { code, description }) {
  if (code) {
    return database.prepare(`SELECT * FROM icd10 WHERE code like :code order by code`).all({ code: `${code}%` });
  } else if (description) {
    return database
      .prepare(`SELECT * FROM icd10 WHERE path like :description order by path`)
      .all({ description: `%${description}%` });
  } else {
    return database.prepare(`SELECT * FROM icd10`).all();
  }
}

function search(database, query) {
  switch (query.type) {
    case "drug":
      return searchDrugTable(database, query);
    case "injury":
      return searchInjuryTable(database, query);
    case "neoplasm":
      return searchNeoplasmTable(database, query);
    default:
      return searchIndexTable(database, query);
  }
}

module.exports = {
  search,
  getStatus,
};
