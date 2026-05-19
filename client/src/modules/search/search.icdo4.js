import { DataTypeProvider } from "@devexpress/dx-react-grid";
import { Grid, Table, TableHeaderRow } from "@devexpress/dx-react-grid-bootstrap4";
import Container from "react-bootstrap/Container";

export default function ICDO4({ maps }) {
  const columns = [
    { name: "code", title: "ICD-O-4 Code" },
    { name: "description", title: "Description" },
    { name: "preferred", title: "Preferred Term" },
  ];

  const columnExtensions = [{ columnName: "description", width: 700, wordWrapEnabled: true }];

  function preferredTermFormatter({ value }) {
    return value === "1" ? "Yes" : "No";
  }

  function IcdCodeTypeProvider({ value }) {
    return value;
  }

  function PreferredTermTypeProvider(props) {
    return <DataTypeProvider formatterComponent={preferredTermFormatter} {...props} />;
  }

  return (
    <Container className="py-5 h-100 col-xl-10 col-sm-12 index">
      <Grid rows={maps.icdo4 ? maps.icdo4.map((e) => e._source) : []} columns={columns}>
        <IcdCodeTypeProvider for={["code"]} />
        <PreferredTermTypeProvider for={["preferred"]} />
        <Table columnExtensions={columnExtensions} noDataCellComponent={() => <td />} />
        <TableHeaderRow />
      </Grid>
    </Container>
  );
}
