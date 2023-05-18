import { useState } from "react";
import axios from "axios";
import { DataTypeProvider, TableKeyboardNavigation } from "@devexpress/dx-react-grid";
import { Grid, Table, TableHeaderRow, VirtualTable } from "@devexpress/dx-react-grid-bootstrap4";
import Container from "react-bootstrap/Container";
import Button from "react-bootstrap/Button";
import ICDTranslations from "./search.translations";
import Loader from "../common/loader";
import { modalState } from "./search.state";
import { useSetRecoilState } from "recoil";

export default function ICDO3({ form, maps }) {
  const [loading, setLoading] = useState(false);
  const setModal = useSetRecoilState(modalState);

  const icdo3Columns = [
    { name: "code", title: "ICD-O-3 Code" },
    { name: "description", title: "Description" },
    { name: "preferred", title: "Preferred Term" },
  ];

  const columnExtensions = [{ columnName: "description", width: 700, wordWrapEnabled: true }];

  function preferredTermFormatter({ value }) {
    return value === "1" ? "Yes" : "No";
  }

  function IcdCodeTypeProvider({value}) {
    return value
  }

  function PreferredTermTypeProvider(props) {
    return <DataTypeProvider formatterComponent={preferredTermFormatter} {...props} />;
  }

  return (
    <Container className="py-5 h-100 col-xl-10 col-sm-12 index">
      <Loader show={loading} fullscreen />
      <Grid rows={maps.icdo3 ? maps.icdo3.map((e) => { return e._source }) : []} columns={icdo3Columns}>
        <IcdCodeTypeProvider for={["code"]} />
        <PreferredTermTypeProvider for={["preferred"]} />
        <Table columnExtensions={columnExtensions} noDataCellComponent={() => <td />}/>

        <TableHeaderRow />
      </Grid>
    </Container>
  );
}
