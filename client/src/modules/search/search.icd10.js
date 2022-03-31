import { useState } from "react";
import Button from "react-bootstrap/Button";
import Accordion from "react-bootstrap/Accordion";
import { TreeDataState, CustomTreeData, DataTypeProvider } from "@devexpress/dx-react-grid";
import { Grid, Table, TableHeaderRow, TableTreeColumn } from "@devexpress/dx-react-grid-bootstrap4";
import Container from "react-bootstrap/Container";
import { useSetRecoilState } from "recoil";
import { modalState } from "./search.state";
import ICDTranslations from "./search.translations";
import axios from "axios";
import Loader from "../common/loader";

export default function ICD10({ form }) {
  const setModal = useSetRecoilState(modalState);
  const [loading, setLoading] = useState(false);

  const indexColumns = [
    { name: "description", title: "Description" },
    { name: "code", title: "Code" },
  ];

  const neoplasmColumns = [
    { name: "neoplasm", title: "Neoplasm" },
    { name: "malignantPrimary", title: "Malignant Primary" },
    { name: "malignantSecondary", title: "Malignant Secondary" },
    { name: "carcinomaInSitu", title: "Ca in situ" },
    { name: "benign", title: "Benign" },
    { name: "uncertainBehavior", title: "Uncertain Behavior" },
    { name: "unspecifiedBehavior", title: "Unspecified Behavior" },
  ];

  const drugColumns = [
    { name: "substance", title: "Substance" },
    { name: "poisoningAccidental", title: "Accidental Poisoning" },
    { name: "poisoningIntentionalSelfHarm", title: "Intentional Self Harm Poisoning" },
    { name: "poisoningAssault", title: "Assault Poisoning" },
    { name: "poisoningUndetermined", title: "Undetermined Poisoning" },
    { name: "adverseEffect", title: "Adverse Effect" },
    { name: "underdosing", title: "Underdosing" },
  ];

  const indexColumnExtension = [{ columnName: "description", width: 800, wordWrapEnabled: true }];

  const neoplasmColumnExtension = [
    { columnName: "neoplasm", width: 400, wordWrapEnabled: true },
    { columnName: "malignantPrimary", wordWrapEnabled: true },
    { columnName: "malignantSecondary", wordWrapEnabled: true },
    { columnName: "uncertainBehavior", wordWrapEnabled: true },
    { columnName: "unspecifiedBehavior", wordWrapEnabled: true },
  ];

  const drugColumnExtension = [
    { columnName: "substance", width: 400, wordWrapEnabled: true },
    { columnName: "poisoningAccidental", wordWrapEnabled: true },
    { columnName: "poisoningIntentionalSelfHarm", wordWrapEnabled: true },
    { columnName: "poisoningAssault", wordWrapEnabled: true },
    { columnName: "poisoningUndetermined", wordWrapEnabled: true },
  ];

  function getChildRows(row, rootRows) {
    return row ? row.children : rootRows;
  }

  async function showTranslationModal(icd10) {
    try {
      setLoading(true);
      icd10 = icd10.replace(/-$/, "");
      const rows = await axios.get("api/translate", { params: { icd10 } });
      setModal({
        show: true,
        title: `ICD-O-3 Translation for ICD10 Code: ${icd10}`,
        body: <ICDTranslations rows={rows.data} type="icd10" />,
      });
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  }

  function icdCodeFormatter({ value }) {
    const isValidCode = /[A-Z]+\d+(\.\d+)?/i.test(value);
    return isValidCode ? (
      <Button className="p-0" variant="link" onClick={() => showTranslationModal(value)}>
        {value}
      </Button>
    ) : (
      value
    );
  }

  function IcdCodeTypeProvider(props) {
    return <DataTypeProvider formatterComponent={icdCodeFormatter} {...props} />;
  }

  return (
    <Container className="py-5 col-xl-8 col-sm-12">
      <Loader show={loading} fullscreen />
      <Accordion defaultActiveKey="0" alwaysOpen className="mb-4 index">
        <Accordion.Item eventKey="0">
          <Accordion.Header>
            <span className="accordion-font">INDEX TABLE</span>
          </Accordion.Header>
          <Accordion.Body>
            <Grid rows={form.indexData} columns={indexColumns}>
              <IcdCodeTypeProvider for={["code"]} />
              <TreeDataState />
              <CustomTreeData getChildRows={getChildRows} />
              <Table columnExtensions={indexColumnExtension} />
              <TableHeaderRow />
              <TableTreeColumn for="description" />
            </Grid>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>

      <Accordion defaultActiveKey="0" alwaysOpen className="mb-4 neoplasm">
        <Accordion.Item eventKey="0">
          <Accordion.Header>
            <span className="accordion-font">NEOPLASM TABLE</span>
          </Accordion.Header>
          <Accordion.Body>
            <Grid rows={form.neoplasmData} columns={neoplasmColumns}>
              <IcdCodeTypeProvider
                for={[
                  "malignantPrimary",
                  "malignantSecondary",
                  "carcinomaInSitu",
                  "benign",
                  "uncertainBehavior",
                  "unspecifiedBehavior",
                ]}
              />
              <TreeDataState />
              <CustomTreeData getChildRows={getChildRows} />
              <Table columnExtensions={neoplasmColumnExtension} />
              <TableHeaderRow />
              <TableTreeColumn for="neoplasm" />
            </Grid>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>

      <Accordion defaultActiveKey="0" alwaysOpen className="mb-4 drug">
        <Accordion.Item eventKey="0">
          <Accordion.Header>
            <span className="accordion-font">DRUG TABLE</span>
          </Accordion.Header>
          <Accordion.Body>
            <Grid rows={form.drugData} columns={drugColumns}>
              <IcdCodeTypeProvider
                for={[
                  "poisoningAccidental",
                  "poisoningIntentionalSelfHarm",
                  "poisoningAssault",
                  "poisoningUndetermined",
                  "adverseEffect",
                  "underdosing",
                ]}
              />
              <TreeDataState />
              <CustomTreeData getChildRows={getChildRows} />
              <Table columnExtensions={drugColumnExtension} />
              <TableHeaderRow />
              <TableTreeColumn for="substance" />
            </Grid>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>

      <Accordion defaultActiveKey="0" alwaysOpen className="mb-4 injury">
        <Accordion.Item eventKey="0">
          <Accordion.Header>
            <span className="accordion-font">INJURY TABLE</span>
          </Accordion.Header>
          <Accordion.Body>
            <Grid rows={form.injuryData} columns={indexColumns}>
              <IcdCodeTypeProvider for={["code"]} />
              <TreeDataState />
              <CustomTreeData getChildRows={getChildRows} />
              <Table columnExtensions={indexColumnExtension} />
              <TableHeaderRow />
              <TableTreeColumn for="description" />
            </Grid>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    </Container>
  );
}
