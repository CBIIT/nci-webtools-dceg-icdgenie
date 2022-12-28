import { useState } from "react";
import axios from "axios";
import { DataTypeProvider } from "@devexpress/dx-react-grid";
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

  async function showTranslationModal(icdo3) {
    try {
      setLoading(true);
      const rows = await axios.post("api/translate", { params: icdo3 });
      setModal({
        show: true,
        title: `ICD-10 Translation for ICD-O-3 Code: ${icdo3}`,
        body: <ICDTranslations rows={rows.data} type="icdo3" />,
      });
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  function icdCodeFormatter({ value }) {
    return (
      <Button className="p-0" variant="link" onClick={() => showTranslationModal(value)}>
        {value}
      </Button>
    );
  }

  function preferredTermFormatter({ value }) {
    return value === "1" ? "Yes" : "No";
  }

  function IcdCodeTypeProvider(props) {
    return <DataTypeProvider formatterComponent={icdCodeFormatter} {...props} />;
  }

  function PreferredTermTypeProvider(props) {
    return <DataTypeProvider formatterComponent={preferredTermFormatter} {...props} />;
  }

  return (
    <Container className="py-5 h-100 col-xl-10 col-sm-12 index">
      <Loader show={loading} fullscreen />
      <Grid rows={maps.icdo3 ? maps.icdo3.map((e) => { return e._source}) : []} columns={icdo3Columns}>
        <IcdCodeTypeProvider for={["code"]} />
        <PreferredTermTypeProvider for={["preferred"]} />
        <Table columnExtensions={columnExtensions} />
        <TableHeaderRow />
      </Grid>
    </Container>
  );
}
