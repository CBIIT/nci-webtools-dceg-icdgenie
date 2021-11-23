const fs = require("fs");
const path = require("path");
const { parse } = require("csv-parse");

module.exports = {
  getTimestamp,
  readFileAsIterable,
  importTable,
};

function readFileAsIterable(filePath, headers) {
  const defaultOptions = {
    columns: headers || true,
    skip_empty_lines: true,
    relax_column_count: true,
    trim: true,
    from_line: headers ? 2 : 1,
  };

  switch (path.extname(filePath)) {
    case ".csv":
      return fs.createReadStream(filePath).pipe(
        parse({
          ...defaultOptions,
          delimiter: ",",
        }),
      );

    case ".tsv":
      return fs.createReadStream(filePath).pipe(
        parse({
          ...defaultOptions,
          delimiter: "\t",
        }),
      );

    default:
      return [];
  }
}

async function importTable(database, tableName, headers, rows, createTable = false) {
  if (createTable) {
    database.exec(
      `drop table if exists "${tableName}";
      create table "${tableName}" (
          ${headers.map((header) => `"${header}" text`).join(",")}
      );`,
    );
  }

  const quote = (value) => `"${value}"`;
  const placeholders = headers.map(() => "?").join(",");
  const insertStatement = database.prepare(
    `insert into "${tableName}" (${headers.map(quote).join(",")})  values (${placeholders})`,
  );

  database.exec("begin transaction");

  for await (const row of rows) {
    const values = headers.map((header) => row[header]).map((value) => (value === "" ? null : value));

    insertStatement.run(values);
  }

  database.exec("commit");
}

function getTimestamp(formatter = (v) => v.join(", ")) {
  const start = new Date().getTime();
  return function () {
    this.previous = this.now || new Date().getTime();
    this.now = new Date().getTime();
    return formatter([now - start, now - previous]);
  };
}
