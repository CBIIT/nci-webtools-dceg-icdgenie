const fs = require("fs");
const path = require("path")
const { getTimestamp } = require("./utils");
const timestamp = getTimestamp(([absolute, relative]) => `${absolute / 1000}s, ${relative / 1000}s`);
const database = require("better-sqlite3")("database.db");
var xml2js = require('xml2js');

var id = -1;

function getChildren(currentNode) {

    if (currentNode.mainTerm) {
        return currentNode.mainTerm
    }
    else if (currentNode.term) {
        return currentNode.term
    }
    else if (currentNode[0]) {
        //console.log(currentNode)
        return currentNode
    }
    else {
        return []
    }

}

function parseDrugNode(currentNode, parents) {
    const title = currentNode.title[0]["_"] || currentNode.title[0]
    const nemod = currentNode.title[0]["nemod"] ? currentNode.title[0]["nemod"] : ""
    const description = title + nemod

    var nodePath = []
    var parentArray = []

    for (node of parents) {
        parentArray.push(node)
        if (node.description)
            nodePath.push(node.description)
    }

    nodePath.push(description)

    var code;
    if (currentNode.cell) {

        code = {
            "poisoningAccidental": currentNode.cell[0]["_"] === "--" ? "NA" : currentNode.cell[0]["_"],
            "poisoningIntentionalSelfHarm": currentNode.cell[1]["_"] === "--" ? "NA" : currentNode.cell[1]["_"],
            "poisoningAssault": currentNode.cell[2]["_"] === "--" ? "NA" : currentNode.cell[2]["_"],
            "poisoningUndetermined": currentNode.cell[3]["_"] === "--" ? "NA" : currentNode.cell[3]["_"],
            "adverseEffect": currentNode.cell[4]["_"] === "--" ? "NA" : currentNode.cell[4]["_"],
            "underdosing": currentNode.cell[5]["_"] === "--" ? "NA" : currentNode.cell[5]["_"]
        }
    }

    id++;
    return ({
        "code": code,
        "description": description,
        "path": nodePath,
        "parents": parentArray,
        "id": id
    })
}

function parseDrugTree(currentNode, nodes = []) {

    var toReturn = []
    var newNodes = []

    if (currentNode.title && !currentNode.mainTerm) {

        toReturn = [parseDrugNode(currentNode, nodes)]
        newNodes = nodes.concat(toReturn)
    }


    for (let childNode of getChildren(currentNode)) {

        toReturn = toReturn.concat(parseDrugTree(childNode, newNodes))
        //newNodes = [...parents]
    }
    return toReturn
}

function parseNeoplasmNode(currentNode, parents) {
    const title = currentNode.title[0]["_"] || currentNode.title[0]
    const nemod = currentNode.title[0]["nemod"] ? currentNode.title[0]["nemod"] : ""
    const description = title + nemod

    var nodePath = []
    var parentArray = []

    for (node of parents) {
        parentArray.push(node)
        if (node.description)
            nodePath.push(node.description)
    }

    nodePath.push(description)

    var code;
    if (currentNode.cell) {

        code = {
            "malignantPrimary": (!currentNode.cell[0] || currentNode.cell[0]["_"] === "-") ? "" : currentNode.cell[0]["_"],
            "malignantSecondary": (!currentNode.cell[1] || currentNode.cell[1]["_"] === "-") ? "" : currentNode.cell[1]["_"],
            "carcinomaInSitu": (!currentNode.cell[2] || currentNode.cell[2]["_"] === "-") ? "" : currentNode.cell[2]["_"],
            "benign": (!currentNode.cell[3] || currentNode.cell[3]["_"] === "-") ? "" : currentNode.cell[3]["_"],
            "uncertainBehavior": (!currentNode.cell[4] || currentNode.cell[4]["_"] === "-") ? "" : currentNode.cell[4]["_"],
            "unspecifiedBehavior": (!currentNode.cell[5] || currentNode.cell[5]["_"] === "-") ? "" : currentNode.cell[5]["_"]
        }
    }

    id++;
    return ({
        "code": code,
        "description": description,
        "path": nodePath,
        "parents": parentArray,
        "id": id
    })
}

function parseInjuryNode(currentNode, parents) {
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
    id++;
    return ({
        "code": code,
        "description": description,
        "path": nodePath,
        "parents": parentArray,
        "id": id
    })
}


function parseInjuryTree(currentNode, nodes = []) {

    var toReturn = []
    var newNodes = []

    if (currentNode.title && !currentNode.mainTerm) {

        toReturn = [parseInjuryNode(currentNode, nodes)]
        newNodes = nodes.concat(toReturn)
    }


    for (let childNode of getChildren(currentNode)) {

        toReturn = toReturn.concat(parseInjuryTree(childNode, newNodes))
        //newNodes = [...parents]
    }
    return toReturn
}


function parseNeoplasmTree(currentNode, nodes = []) {

    var toReturn = []
    var newNodes = []

    if (currentNode.title) {

        toReturn = [parseNeoplasmNode(currentNode, nodes)]
        newNodes = nodes.concat(toReturn)
    }


    for (let childNode of getChildren(currentNode)) {

        toReturn = toReturn.concat(parseNeoplasmTree(childNode, newNodes))
        //newNodes = [...parents]
    }
    return toReturn
}



function parseTabularNode(currentNode, parents) {


    const code = currentNode.name[0]
    const description = currentNode.desc[0]

    var nodePath = []
    var parentArray = []

    for (node of parents) {
        parentArray.push(node)
        if (node.description)
            nodePath.push(node.description)
    }

    nodePath.push(description)
    id++;
    return ({
        "code": code,
        "description": description,
        "path": nodePath,
        "parents": parentArray,
        "id": id
    })
}

function getTabularChildren(currentNode) {

    if (currentNode.diag) {
        return currentNode.diag
    }
    if (currentNode.section) {
        return currentNode.section
    }
    if (currentNode.chapter) {
        return currentNode.chapter
    }

    return []
}

function parseTabularTree(currentNode, nodes = []) {

    var toReturn = []
    var newNodes = []

    if (currentNode.name && currentNode.desc && !currentNode.sectionIndex) {

        toReturn = [parseTabularNode(currentNode, nodes)]
        newNodes = nodes.concat(toReturn)
    }


    for (let childNode of getTabularChildren(currentNode)) {

        toReturn = toReturn.concat(parseTabularTree(childNode, newNodes))
        //newNodes = [...parents]
    }
    return toReturn
}


(async function main() {

   
    await fs.readFile('icd10cm-tabular-2023.xml', function (err, data) {
        console.log(`[${timestamp()}] Start tabular import`);
        xml2js.parseString(data, (err, result) => {
            try {
                if (err) {
                    throw err;
                }


                var terms = []
                terms = parseTabularTree(result["ICD10CM.tabular"], [])

                var fd = fs.openSync(path.resolve('data', 'icd10tabular.json'), 'a')
                terms.map((e, index) => {
                    fs.appendFileSync(fd, JSON.stringify({
                        "index": {
                            "_index": "tabular",
                            "_id": index
                        }
                    }) + '\n',
                        'utf-8'
                    )

                    fs.appendFileSync(fd, JSON.stringify({
                        "code": e.code,
                        "path": e.path,
                        "description": e.description,
                        "parent": e.parents,
                        "id": e.id
                    }) + '\n',
                        'utf-8'
                    )
                })
                id = -1;
                console.log(`[${timestamp()}] Finish tabular import`); 
            } catch (err) {
                console.log(err)
            }
        })
    })
    
    await fs.readFile('icd10cm-neoplasm-2023.xml', function (err, data) {
        console.log(`[${timestamp()}] Start neoplasm import`);
        xml2js.parseString(data, (err, result) => {
            try {
                if (err) {
                    throw err;
                }

                var terms = []
                terms = parseNeoplasmTree(result["ICD10CM.index"]["letter"][0].mainTerm, [])
               // console.log(terms)

                var fd = fs.openSync(path.resolve('data', 'icd10neoplasm.json'), 'a')
                terms.map((e, index) => {
                    fs.appendFileSync(fd, JSON.stringify({
                        "index": {
                            "_index": "neoplasm",
                            "_id": index
                        }
                    }) + '\n',
                        'utf-8'
                    )

                    fs.appendFileSync(fd, JSON.stringify({
                        "code": e.code,
                        "path": e.path,
                        "description": e.description,
                        "parent": e.parents,
                        "id": e.id
                    }) + '\n',
                        'utf-8'
                    )
                })
                id = -1;
                console.log(`[${timestamp()}] Finish neoplasm import`);
            } catch (err) {
                console.log(err)
            }
        })
    })

    await fs.readFile('icd10cm-drug-2023.xml', function (err, data) {
        console.log(`[${timestamp()}] Start drug import`);
        xml2js.parseString(data, (err, result) => {
            try {
                if (err) {
                    throw err;
                }

                var terms = []
                fs.writeFileSync('drug.json', JSON.stringify(result, null, 4))
                terms = parseDrugTree(result["ICD10CM.index"]["letter"], [])
                var fd = fs.openSync(path.resolve('data', 'icd10drug.json'), 'a')
                terms.map((e, index) => {
                    fs.appendFileSync(fd, JSON.stringify({
                        "index": {
                            "_index": "drug",
                            "_id": index
                        }
                    }) + '\n',
                        'utf-8'
                    )

                    fs.appendFileSync(fd, JSON.stringify({
                        "code": e.code,
                        "path": e.path,
                        "description": e.description,
                        "parent": e.parents,
                        "id": e.id
                    }) + '\n',
                        'utf-8'
                    )
                })
                id = -1;
                console.log(`[${timestamp()}] Finish drug import`);
            } catch (err) {
                console.log(err)
            }
        })
    })

    await fs.readFile('icd10cm-eindex-2023.xml', function (err, data) {
        console.log(`[${timestamp()}] Start injury import`);
        xml2js.parseString(data, (err, result) => {
            if (err) {
                throw err;
            }

            var terms = []
            fs.writeFileSync('injury.json', JSON.stringify(result, null, 4))
            terms = parseInjuryTree(result["ICD10CM.index"]["letter"], [])

            var fd;
            try {
                fd = fs.openSync(path.resolve('data', 'icd10eindex.json'), 'a')
                terms.map((e,index) => {
                    fs.appendFileSync(fd, JSON.stringify({
                        "index": {
                            "_index": "injury",
                            "_id": index
                        }
                    }) + '\n',
                        'utf-8'
                    )

                    fs.appendFileSync(fd, JSON.stringify({
                        "code": e.code,
                        "path": e.path,
                        "description": e.description,
                        "parent": e.parents,
                        "id": e.id
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
                id = -1
                console.log(`[${timestamp()}] Finish injury import`);
            }
        });
    })
})();
