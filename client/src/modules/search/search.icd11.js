import { DataTypeProvider } from "@devexpress/dx-react-grid";
import { Grid, Table, TableHeaderRow } from "@devexpress/dx-react-grid-bootstrap4";
import Container from "react-bootstrap/Container";

export default function ICD11({ maps }) {
  const columns = [
    { name: "description", title: "Description" },
    { name: "code", title: "Code" },
  ];

  const columnExtensions = [{ columnName: "description", wordWrapEnabled: true }];

  function IcdCodeTypeProvider({ value }) {
    return value;
  }

  return (
    <Container className="py-5 h-100 col-xl-10 col-sm-12 index">
      <Grid rows={maps.icd11 ? maps.icd11.map((e) => e._source) : []} columns={columns}>
        <IcdCodeTypeProvider for={["code"]} />
        <Table columnExtensions={columnExtensions} noDataCellComponent={() => <td />} />
        <TableHeaderRow />
      </Grid>
    </Container>
  );
}
