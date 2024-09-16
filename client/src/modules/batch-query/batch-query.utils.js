import saveAs from "file-saver";
import { Children } from "react";
import * as XLSX from "xlsx";

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

export function exportExcelFile(filename, sheets) {
  const workbook = XLSX.utils.book_new();
  sheets.forEach(({ name, dataSet }) => {
    const { columns, data } = dataSet[0];
    const sheetColumns = columns.map((c) => c.title);
    const sheetData = data.map((row) => row.map((cell) => cell.value));
    const sheetRows = [sheetColumns, ...sheetData];
    const sheet = XLSX.utils.aoa_to_sheet(sheetRows);
    sheet["!cols"] = columns.map(({ width }) => ({ wpx: width.wpx }));

    XLSX.utils.book_append_sheet(workbook, sheet, name);
  });
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

export function ExcelFile({ filename, element, children }) {
  const sheets = Children.map(children, (child) => child.props);
  return <span onClick={() => exportExcelFile(filename, sheets)}>{element}</span>;
}

export function ExcelSheet({ name, dataSet }) {
  return null;
}
