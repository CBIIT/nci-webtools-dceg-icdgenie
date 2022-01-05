function translateCode(database, { icd10, icdo3 }) {
  if (icd10) {
    return database
      .prepare(
        `select * from icd10_icdo3_mapping where 
          icd10 like :icd10
        order by icd10`,
      )
      .all({ icd10: `${icd10}%` });
  } else if (icdo3) {
    return database
      .prepare(
        `select * from icd10_icdo3_mapping where 
          icdo3 like :icdo3
        order by icdo3`,
      )
      .all({ icdo3: `${icdo3}%` });
  } else {
    return [];
  }
}

module.exports = {
  translateCode,
};
