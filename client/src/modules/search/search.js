import Container from "react-bootstrap/Container";
import { defaultFormState } from "./search.state";
import { useState } from "react";
import { query } from "../../services/query";
import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";
import Accordion from "react-bootstrap/Accordion";
import { TreeDataState, CustomTreeData } from "@devexpress/dx-react-grid";
import { Grid, Table, TableHeaderRow, TableTreeColumn } from "@devexpress/dx-react-grid-bootstrap4";
import { LoadingOverlay } from "@cbiitss/react-components";

export default function Search() {
  const [form, setForm] = useState(defaultFormState);
  const mergeForm = (obj) => setForm({ ...form, ...obj });
  const [tab, setTab] = useState("codeTable");

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

  const icdo3Columns = [
    { name: "code", title: "Code" },
    { name: "description", title: "Description" },
    { name: "isPreferred", title: "Preferred?" },
  ];

  const tableColumnExtensions = [{ columnName: "neoplasm", width: 400, wordWrapEnabled: true }];

  const getChildRows = (row, rootRows) => {
    return row ? row.children : rootRows;
  };

  async function handleSubmit(event) {
    event.preventDefault();

    mergeForm({ ...form, loading: true });

    const index = await query("api/search/icd10", {
      query: form.search,
      type: "index",
      format: "tree",
    });

    const neoplasm = await query("api/search/icd10", {
      query: form.search,
      type: "neoplasm",
      format: "tree",
    });

    const drug = await query("api/search/icd10", {
      query: form.search,
      type: "drug",
      format: "tree",
    });

    const injury = await query("api/search/icd10", {
      query: form.search,
      type: "injury",
      format: "tree",
    });

    var icdo3 = await query("api/search/icdo3", {
      query: form.search,
    });

    icdo3 = icdo3.map((e) => {
      return {
        ...e,
        isPreferred: e.preferred ? "Yes" : "No",
      };
    });

    mergeForm({
      ...form,
      indexData: index,
      neoplasmData: neoplasm,
      drugData: drug,
      injuryData: injury,
      icdo3Data: icdo3,
      loading: false,
      submitted: true,
    });
  }

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleSubmit(event);
    }
  };

  function handleChange(event) {
    const { name, value } = event.target;
    mergeForm({ [name]: value });
  }

  return (
    <>
      <Container className="py-4 h-100">
        <div className="row justify-content-center">
          <div className="col-xl-5 mt-3">
            <div className="input-group mb-3">
              <input
                name="search"
                type="text"
                className="form-control"
                value={form.search}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
              />
              <div className="input-group-append">
                <button className="btn btn-outline-primary" type="button" onClick={handleSubmit}>
                  Search
                </button>
              </div>
            </div>
          </div>
        </div>
        <LoadingOverlay active={form.loading} overlayStyle={{ position: "fixed" }} />
        <Tabs activeKey={tab} onSelect={(e) => setTab(e)} className="mb-3">
          <Tab eventKey="codeTable" title="ICD-10 Code Table">
            <Accordion defaultActiveKey="0" alwaysOpen>
              <Accordion.Item eventKey="0">
                <Accordion.Header>
                  <b>Index Table</b>
                </Accordion.Header>
                <Accordion.Body>
                  <Grid rows={form.indexData} columns={indexColumns}>
                    <TreeDataState />
                    <CustomTreeData getChildRows={getChildRows} />
                    <Table columnExtensions={tableColumnExtensions} />
                    <TableHeaderRow />
                    <TableTreeColumn for="description" />
                  </Grid>
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey="1">
                <Accordion.Header>
                  <b>Neoplasm Table</b>
                </Accordion.Header>
                <Accordion.Body>
                  <Grid rows={form.neoplasmData} columns={neoplasmColumns}>
                    <TreeDataState />
                    <CustomTreeData getChildRows={getChildRows} />
                    <Table columnExtensions={tableColumnExtensions} />
                    <TableHeaderRow />
                    <TableTreeColumn for="neoplasm" />
                  </Grid>
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey="2">
                <Accordion.Header>
                  <b>Drug Table</b>
                </Accordion.Header>
                <Accordion.Body>
                  <Grid rows={form.drugData} columns={drugColumns}>
                    <TreeDataState />
                    <CustomTreeData getChildRows={getChildRows} />
                    <Table columnExtensions={tableColumnExtensions} />
                    <TableHeaderRow />
                    <TableTreeColumn for="substance" />
                  </Grid>
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey="3">
                <Accordion.Header>
                  <b>Injury Table</b>
                </Accordion.Header>
                <Accordion.Body>
                  <Grid rows={form.injuryData} columns={indexColumns}>
                    <TreeDataState />
                    <CustomTreeData getChildRows={getChildRows} />
                    <Table columnExtensions={tableColumnExtensions} />
                    <TableHeaderRow />
                    <TableTreeColumn for="description" />
                  </Grid>
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>
          </Tab>
          <Tab eventKey="codeTree" title="ICD-O-3 Code Table">
            <Grid rows={form.icdo3Data} columns={icdo3Columns}>
              <TreeDataState />
              <CustomTreeData getChildRows={getChildRows} />
              <Table columnExtensions={[{ columnName: "description", wordWrapEnabled: true }]} />
              <TableHeaderRow />
              <TableTreeColumn for="code" />
            </Grid>
          </Tab>
        </Tabs>
      </Container>
    </>
  );
}
