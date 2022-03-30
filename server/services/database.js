const Database = require("better-sqlite3");

function loadDatabaseInMemory(path) {
  const database = new Database(path);
  const buffer = database.serialize();
  return new Database(buffer);
}

module.exports = { loadDatabaseInMemory };
