import Container from "react-bootstrap/Container";
import { defaultFormState } from "./search.state";
import { useState } from "react";
import { query } from "../../services/query";
import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";
import { TreeDataState, CustomTreeData } from "@devexpress/dx-react-grid";
import { Grid, Table, TableHeaderRow, TableTreeColumn } from "@devexpress/dx-react-grid-bootstrap4";

export default function Search() {
  const [form, setForm] = useState(defaultFormState);
  const mergeForm = (obj) => setForm({ ...form, ...obj });
  const [tab, setTab] = useState("codeTable");

  const columns = [
    { name: "neoplasm", title: "Neoplasm" },
    { name: "malignantPrimary", title: "Malignant Primary" },
    { name: "malignantSecondary", title: "Malignant Secondary" },
    { name: "carcinomaInSitu", title: "Ca in situ" },
    { name: "benign", title: "Benign" },
    { name: "uncertainBehavior", title: "Uncertain Behavior" },
    { name: "unspecifiedBehavior", title: "Unspecified Behavior" },
  ];

  const tableColumnExtensions = [{ columnName: "neoplasm", width: 400, wordWrapEnabled: true }];

  const getChildRows = (row, rootRows) => {
    return row ? row.children : rootRows;
  };

  async function handleSubmit(event) {
    event.preventDefault();
    const response = await query("api/search/icd10", {
      description: form.search,
      type: "neoplasm",
      format: "tree",
    });

    console.log(response);
    mergeForm({ ...form, neoplasmData: response, submitted: true });
  }

  function handleChange(event) {
    const { name, value } = event.target;
    mergeForm({ [name]: value });
  }

  return (
    <>
      <Container className="py-4 h-100">
        <div className="row justify-content-center">
          <h2 className="row mb-2 justify-content-center">ICDGenie</h2>
          <div className="col-xl-6">
            <p className="row w-40 mb-2 justify-content-center">
              ICDGenie is a suite of web-based applications designed to easily and efficiently interrogate linkage
              disequilibrium in population groups. Each included application is specialized for querying and displaying
              unique aspects of linkage desequilibrium.
            </p>
          </div>
          <hr />
          <div className="col-xl-5 mt-3">
            <div className="input-group mb-3">
              <input name="search" type="text" className="form-control" value={form.search} onChange={handleChange} />
              <div className="input-group-append">
                <button className="btn btn-outline-primary" type="button" onClick={handleSubmit}>
                  Search
                </button>
              </div>
            </div>
          </div>
        </div>
        <Tabs activeKey={tab} onSelect={(e) => setTab(e)} className="mb-3">
          <Tab eventKey="codeTable" title="ICD-10 Code Table">
            <h4 className="row mb-2 justify-content-center">ICD-10 Neoplasm Code Table</h4>
            <hr />
            <Grid rows={form.neoplasmData} columns={columns}>
              <TreeDataState />
              <CustomTreeData getChildRows={getChildRows} />
              <Table columnExtensions={tableColumnExtensions} />
              <TableHeaderRow />
              <TableTreeColumn for="neoplasm" />
            </Grid>
          </Tab>
        </Tabs>
      </Container>
    </>
  );
}
