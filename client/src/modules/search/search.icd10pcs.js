import { DataTypeProvider } from "@devexpress/dx-react-grid";
import { Grid, Table, TableHeaderRow } from "@devexpress/dx-react-grid-bootstrap4";
import Container from "react-bootstrap/Container";

export default function ICD10PCS({ maps }) {
  const columns = [
    { name: "code", title: "ICD-10-PCS Code" },
    { name: "description", title: "Description" },
  ];

  const columnExtensions = [{ columnName: "description", wordWrapEnabled: true }];

  function IcdCodeTypeProvider({ value }) {
    return value;
  }

  return (
    <Container className="py-5 h-100 col-xl-10 col-sm-12 index">
      <Grid rows={maps.icd10pcs ? maps.icd10pcs.map((e) => e._source) : []} columns={columns}>
        <IcdCodeTypeProvider for={["code"]} />
        <Table columnExtensions={columnExtensions} noDataCellComponent={() => <td />} />
        <TableHeaderRow />
      </Grid>
    </Container>
  );
}
