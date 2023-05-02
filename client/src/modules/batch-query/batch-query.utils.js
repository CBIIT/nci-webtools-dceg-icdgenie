import saveAs from "file-saver";

export function readFileAsText(fileList) {
  if (!fileList || !fileList.length) return null;
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (ev) => resolve(ev.target.result);
    reader.onerror = (e) => reject(e);
    reader.readAsText(fileList[0]);
  });
}

export function toTsvString(records) {
  const keys = Object.keys(records[0]);
  const quoteValue = (str) => (str ? `"${str.replace(/"/g, '""')}"` : "");
  let csv = keys.map(quoteValue).join("\t");

  for (const record of records) {
    csv += "\n" + keys.map((key) => quoteValue(record[key])).join("\t");
  }

  return csv;
}

export function exportTsv(records, filename) {
  const csv = toTsvString(records);
  const blob = new Blob([csv], { type: "text/tsv;charset=utf-8" });
  saveAs(blob, filename);
}
