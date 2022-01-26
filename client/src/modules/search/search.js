import Container from "react-bootstrap/Container";
import { defaultFormState } from "./search.state";
import { useState } from "react";
import { query } from "../../services/query";
import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";
import Accordion from "react-bootstrap/Accordion";
import { TreeDataState, CustomTreeData, PagingState, IntegratedPaging } from "@devexpress/dx-react-grid";
import { Grid, Table, TableHeaderRow, TableTreeColumn, PagingPanel } from "@devexpress/dx-react-grid-bootstrap4";
import { LoadingOverlay } from "@cbiitss/react-components";
import { Modal } from "react-bootstrap";
import ICD10 from "./search.icd10";
import ICDO3 from "./search.icdo3";

export default function Search() {
  const [form, setForm] = useState(defaultFormState);
  const mergeForm = (obj) => setForm({ ...form, ...obj });
  const [tab, setTab] = useState("codeTable");
  const [show, setShow] = useState(false);
  const [modalData, setModalData] = useState([]);

  const handleClose = () => setShow(false);

  const icdo3ModalColumns = [
    { name: "icd10Description", title: "ICD-10 Description" },
    { name: "icd10", title: "ICD-10 Code" },
  ];

  const icd10ModalColumns = [
    { name: "icdo3Description", title: "ICD-O-3 Description" },
    { name: "icdo3", title: "ICD-O-3 Code" },
  ];

  const getChildRows = (row, rootRows) => {
    return row ? row.children : rootRows;
  };

  async function handleSubmit(event) {
    event.preventDefault();
    mergeForm({ ...form, loading: true });

    var index = await query("api/search/icd10", {
      query: form.search,
      type: "index",
      format: "list",
    });

    index = index.map((e) => {
      return {
        ...e,
        code: (
          <a
            onClick={async () => {
              const translate = await query("api/translate", { icd10: e.code });
              console.log(translate);
              setModalData(translate);
              await setShow("icd10");
            }}
            href="javascript:void(0)">
            {e.code}
          </a>
        ),
      };
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
        code: (
          <a
            onClick={async () => {
              const translate = await query("api/translate", { icdo3: e.code });
              setModalData(translate);
              await setShow("icdo3");
            }}
            href="javascript:void(0)">
            {e.code}
          </a>
        ),
        isPreferred: e.preferred ? "Yes" : "No",
      };
    });

    mergeForm({
      indexData: index,
      neoplasmData: neoplasm,
      drugData: drug,
      injuryData: injury,
      icdo3Data: icdo3,
      loading: false,
      submitted: true,
    });
  }

  console.log(form);

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
      <Modal show={show} size="xl" onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>
            {show === "icdo3"
              ? `ICD-10 Translation for ICD-O-3 Code: ${modalData.length ? modalData[0].icdo3 : ""}`
              : `ICD-O-3 Translation for ICD-10 Code: ${modalData.length ? modalData[0].icd10 : ""}`}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Grid rows={modalData} columns={show === "icdo3" ? icdo3ModalColumns : icd10ModalColumns}>
            <PagingState defaultCurrentPage={0} pageSize={10} />
            <IntegratedPaging />
            <TreeDataState />
            <CustomTreeData getChildRows={getChildRows} />
            <Table
              columnExtensions={[
                {
                  columnName: show === "icdo3" ? "icd10Description" : "icdo3Description",
                  width: 700,
                  wordWrapEnabled: true,
                },
              ]}
            />
            <TableHeaderRow />
            <TableTreeColumn for="code" />
            <PagingPanel />
          </Grid>
        </Modal.Body>
      </Modal>
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
            <ICD10 form={form} />
          </Tab>
          <Tab eventKey="codeTree" title="ICD-O-3 Code Table">
            <ICDO3 form={form} />
          </Tab>
        </Tabs>
      </Container>
    </>
  );
}
