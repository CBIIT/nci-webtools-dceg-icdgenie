function searchMorphologyTable(database, { code, description }) {
  const [histology, behavior] = code?.split("/") || [];

  if (histology && behavior) {
    return database
      .prepare(
        `select * from icdo3_morphology where 
          histology = :histology and
          behavior = :behavior
        order by id`,
      )
      .all({ histology, behavior });
  } else if (histology) {
    return database
      .prepare(
        `select * from icdo3_morphology where 
          histology = :histology
        order by id`,
      )
      .all({ histology });
  } else if (description) {
    return database
      .prepare(
        `select * from icdo3_morphology where 
          description like :description
        order by id`,
      )
      .all({ description: `%${description}%` });
  } else {
    return [];
  }
}

function search(database, query) {
  let results = [];

  // todo: add more query types
  switch (query.type) {
    default:
      results = searchMorphologyTable(database, query);
      break;
  }

  return results;
}

module.exports = {
  search,
};
