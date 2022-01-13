function searchMorphologyTable(database, { code, description, query }) {
  if (query) {
    return database
      .prepare(
        `select * from icdo3_morphology where 
          code like :queryPrefix or 
          description like :query
        order by id`,
      )
      .all({ query: `%${query}%`, queryPrefix: `${query}%` });
  } else if (code) {
    return database
      .prepare(
        `select * from icdo3_morphology where 
          code like :code
        order by id`,
      )
      .all({ code: `${code}%` });
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
