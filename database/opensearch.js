const fs = require("fs");
const path = require("path")
const { getTimestamp } = require("./utils");
const timestamp = getTimestamp(([absolute, relative]) => `${absolute / 1000}s, ${relative / 1000}s`);
const database = require("better-sqlite3")("database.db");
var xml2js = require('xml2js');


function getChildren(currentNode) {

    if (currentNode[0]) {
        return currentNode
    }
    else if (currentNode.mainTerm) {

        return currentNode.mainTerm
    }
    else if (currentNode.term) {
        return currentNode.term
    }
    else {
        return []
    }

}

function parseNode(currentNode, parents) {
    //console.log(currentNode)
    const title = currentNode.title[0]["_"] || currentNode.title
    const nemod = currentNode.title[0]["nemod"] ? currentNode.title[0]["nemod"] : ""

    const description = title + nemod

    var nodePath = []
    var parentArray = []

    for (node of parents) {
        parentArray.push(node)
        if (node.description)
            nodePath.push(node.description)
    }

    var code
    if (currentNode.code)
        code = currentNode.code[0]
    else if (parents.length && parents[parents.length - 1].code)
        code = parents[parents.length - 1].code
    else
        code = 'NA'

    nodePath.push(description)

    return ({
        "code": code,
        "description": description,
        "path": nodePath,
        "parents": parentArray
    })
}

function parseTree(currentNode, nodes = []) {

    var toReturn = []
    var newNodes = []

    if (currentNode.title) {
        toReturn = [parseNode(currentNode, nodes)]
        var newNodes = nodes.concat(toReturn)
    }

    for (let childNode of getChildren(currentNode)) {

        toReturn = toReturn.concat(parseTree(childNode, newNodes))
        //newNodes = [...parents]
    }
    return toReturn
}

(async function main() {

    /*console.log(`[${timestamp()}] Start Opensearch import`);
    const query = database.prepare(`SELECT * FROM icd10 LIMIT 50`).all();

    var fd;
    try {
        fd = fs.openSync('icd10.json', 'a')
        query.map((e) => {
            fs.appendFileSync(fd, JSON.stringify({
                "index": {
                    "_index": "icdgenie",
                    "_id": e.id
                }
            }) + '\n',
                'utf-8'
            )

            fs.appendFileSync(fd, JSON.stringify({
                "code": e.code,
                "path": e.path,
                "description": e.description,
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

    database.close();*/

    fs.readFile('icd10cm-eindex-2023.xml', function (err, data) {
        console.log(`[${timestamp()}] Start Opensearch import`);
        xml2js.parseString(data, (err, result) => {
            if (err) {
                throw err;
            }

            var terms = []
            terms = parseTree(result["ICD10CM.index"]["letter"], [])

            var fd;
            try {
                fd = fs.openSync(path.resolve('data', 'icd10eindex.json'), 'a')
                terms.map((e) => {
                    fs.appendFileSync(fd, JSON.stringify({
                        "index": {
                            "_index": "icdgenie",
                            "_id": e.id
                        }
                    }) + '\n',
                        'utf-8'
                    )

                    fs.appendFileSync(fd, JSON.stringify({
                        "code": e.code,
                        "path": e.path,
                        "description": e.description,
                        "parent": e.parents,
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

                console.log(`[${timestamp()}] Finished Injury import`);
            }
        });
    })
})();
