// import { VirtualTable } from "@devexpress/dx-react-grid";
import { Grid, TableHeaderRow, VirtualTable } from "@devexpress/dx-react-grid-bootstrap4";

export default function ICDTranslations({ show, rows, type }) {
  const icdo3Columns = [
    { name: "icd10Description", title: "ICD-10 Description" },
    { name: "icd10", title: "ICD-10 Code" },
  ];

  const icd10Columns = [
    { name: "icdo3Description", title: "ICD-O-3 Description" },
    { name: "icdo3", title: "ICD-O-3 Code" },
  ];

  const columns = type === "icdo3" ? icdo3Columns : icd10Columns;
  const columnExtensions = [
    {
      columnName: type === "icdo3" ? "icd10Description" : "icdo3Description",
      width: 700,
      wordWrapEnabled: true,
    },
  ];

  return (
    <div className="index">
      <Grid rows={rows} columns={columns}>
        <VirtualTable columnExtensions={columnExtensions} />
        <TableHeaderRow />
      </Grid>
    </div>
  );
}
