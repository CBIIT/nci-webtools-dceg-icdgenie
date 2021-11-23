const fs = require("fs");
const fsp = require("fs/promises");
const { readFileAsIterable, importTable, getTimestamp } = require("./utils");
const sqlite = require("better-sqlite3");
const sources = require("./sources.json");
const args = require("minimist")(process.argv.slice(2));
const timestamp = getTimestamp(([absolute, relative]) => `${absolute / 1000}s, ${relative / 1000}s`);

(async function main() {
  const databaseFilePath = args.db || "database.db";

  const mainTablesSql = await fsp.readFile("schema/tables/main.sql", "utf-8");
  const mainIndexesSql = await fsp.readFile("schema/indexes/main.sql", "utf-8");

  // recreate database
  if (fs.existsSync(databaseFilePath)) fs.unlinkSync(databaseFilePath);

  // create tables
  const database = sqlite(databaseFilePath);
  database.exec(mainTablesSql);

  // import sources
  for (const { filePath, table, headers } of sources) {
    console.log(`[${timestamp()}] started importing ${table}`);
    const rows = readFileAsIterable(filePath, headers);
    await importTable(database, table, headers, rows);
    console.log(`[${timestamp()}] finished importing ${table}`);
  }

  // create indexes
  database.exec(mainIndexesSql);
  database.close();
})();
