function searchInjuryTable(database, { code, description }) {
  if (code) {
    return database
      .prepare(
        `with parents as (
          select * from icd10_injury where
            code like :code
          union all
          select i.* from icd10_injury i
            join parents p on i.id = p.parentId
        ) select distinct * from parents order by level, code`,
      )
      .all({ code: `${code}%` });
  } else if (description) {
    return database
      .prepare(
        `with parents as (
          select * from icd10_injury where
            path like :description
          union all
          select i.* from icd10_injury i
            join parents p on i.id = p.parentId
        ) select distinct * from parents order by level, path`,
      )
      .all({ description: `%${description}%` });
  } else {
    return database.prepare(`SELECT * FROM icd10_injury`).all();
  }
}

function searchDrugTable(database, { code, description }) {
  if (code) {
    return database
      .prepare(
        `with parents as (
          select * from icd10_drug where
            poisoningAccidental like :code or
            poisoningIntentionalSelfHarm like :code or
            poisoningAssault like :code or
            poisoningUndetermined like :code or
            adverseEffect like :code or
            underdosing like :code
          union all
          select i.* from icd10_drug i
            join parents p on i.id = p.parentId
        ) select distinct * from parents order by level, path`,
      )
      .all({ code: `${code}%` });
  } else if (description) {
    return database
      .prepare(
        `with parents as (
          select * from icd10_drug where
            path like :description
          union all
          select i.* from icd10_drug i
            join parents p on i.id = p.parentId
        ) select distinct * from parents order by level, path`,
      )
      .all({ description: `%${description}%` });
  } else {
    return database.prepare(`SELECT * FROM icd10_drug`).all();
  }
}

function searchNeoplasmTable(database, { code, description }) {
  if (code) {
    return database
      .prepare(
        `with parents as (
          select * from icd10_neoplasm where
            malignantPrimary like :code or
            malignantSecondary like :code or
            carcinomaInSitu like :code or
            benign like :code or
            uncertainBehavior like :code or
            unspecifiedBehavior like :code
          union all
          select i.* from icd10_neoplasm i
            join parents p on i.id = p.parentId
        ) select distinct * from parents order by level, path`,
      )
      .all({ code: `${code}%` });
  } else if (description) {
    return database
      .prepare(
        `with parents as (
          select * from icd10_neoplasm where
            path like :description 
          union all
          select i.* from icd10_neoplasm i
            join parents p on i.id = p.parentId
        ) select distinct * from parents order by level, path`,
      )
      .all({ description: `%${description}%` });
  } else {
    return database.prepare(`SELECT * FROM icd10_neoplasm`).all();
  }
}

function searchIndexTable(database, { code, description }) {
  if (code) {
    return database
      .prepare(
        `with parents as (
          select * from icd10 where
            code like :code
          union all
          select i.* from icd10 i
            join parents p on i.id = p.parentId
        ) select distinct * from parents order by level, code`,
      )
      .all({ code: `${code}%` });
  } else if (description) {
    return database
      .prepare(
        `with parents as (
          select * from icd10 where
            path like :description
          union all
          select i.* from icd10 i
            join parents p on i.id = p.parentId
        ) select distinct * from parents order by level, path`,
      )
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
};
