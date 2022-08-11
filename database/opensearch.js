const fs = require("fs");
const { getTimestamp } = require("./utils");
const timestamp = getTimestamp(([absolute, relative]) => `${absolute / 1000}s, ${relative / 1000}s`);
const database = require("better-sqlite3")("database.db");

(async function main() {

    console.log(`[${timestamp()}] Start Opensearch import`);
    const query = database.prepare(`SELECT * FROM icd10 LIMIT 50`).all();

    var fd;
    try {
        fd = fs.openSync('icd10.json', 'a')
        query.map((e) => {
            fs.appendFileSync(fd, JSON.stringify({
                "index": {
                    "_index": "icdgenie",
                    "id": e.id
                }
            }) + '\n',
                'utf-8'
            )

            fs.appendFileSync(fd, JSON.stringify({
                "code": e.code,
                "path": e.path,
                "search_index": e.code + " " + e.path.replace(/[\|]/g, " ")
            }) + '\n',
                'utf-8'
            )
        })
    } catch (err) {
        console.log(`[${timestamp()}] ${err}`)
    } finally {
        if (fd) {
            fs.closeSync(fd)
        }

        console.log(`[${timestamp()}] Finished Opensearch import`);
    }

    database.close();
})();
