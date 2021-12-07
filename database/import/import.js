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
  database.exec(mainIndexesSql);

  // import sources
  for (const { filePath, table, headers, treeRefs } of sources) {
    const { nodeRef, parentRef, pathRef, levelRef } = treeRefs;

    console.log(`[${timestamp()}] started importing ${table}`);
    const rows = readFileAsIterable(filePath, headers);
    await importTable(database, table, headers, rows);

    // update path
    let records = database.prepare(`SELECT * FROM ${table}`).all();

    database.exec("BEGIN TRANSACTION");
    for (const record of records) {
      let current = record;
      let parentRecords = [];

      // note: recursive cte is actually slower than a loop
      while (current && current[parentRef]) {
        parentRecords.push(current);

        current = records.find(
          (r) =>
            r[nodeRef].toLowerCase().includes(current[parentRef].toLowerCase()) &&
            r[levelRef] === current[levelRef] - 1,
        );
      }

      if (current) parentRecords.push(current);

      database.prepare(`UPDATE ${table} SET path = :path, parentId = :parentId WHERE id = :id`).run({
        id: record.id,
        parentId: parentRecords.length > 1 ? parentRecords[1].id : null,
        path: parentRecords
          .map((p) => p[pathRef])
          .reverse()
          .join("|"),
      });

      if (record.id % 1000 === 0 || record.id === records.length)
        console.log(`[${timestamp()}] progress: ${record.id}/${records.length}`);
    }

    database.exec("COMMIT");
    console.log(`[${timestamp()}] finished importing ${table}`);
  }

  database.close();
})();
