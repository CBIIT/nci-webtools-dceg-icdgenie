import Container from "react-bootstrap/Container";
import { defaultFormState, formState } from "./search.state";
import { useState, useRef } from "react";
import { useRecoilState } from "recoil";
import { query } from "../../services/query";
import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";
import { TreeDataState, CustomTreeData } from "@devexpress/dx-react-grid";
import { Grid, Table, VirtualTable, TableHeaderRow, TableTreeColumn } from "@devexpress/dx-react-grid-bootstrap4";
import { LoadingOverlay } from "@cbiitss/react-components";
import { Modal } from "react-bootstrap";
import { Tree } from "../../components/Tree";
import * as d3 from "d3";
import ICD10 from "./search.icd10";
import ICDO3 from "./search.icdo3";
import Accordion from "react-bootstrap/Accordion";

export default function Search() {
  const [form, setForm] = useRecoilState(formState);
  const mergeForm = (obj) => setForm({ ...form, ...obj });
  const [tab, setTab] = useState("icd10Table");
  const [show, setShow] = useState(false);
  const [modalData, setModalData] = useState([]);
  const [search, setSearch] = useState("");

  const indexICD10 = useRef(null);
  const neoplasmICD10 = useRef(null);
  const drugICD10 = useRef(null);
  const injuryICD10 = useRef(null);

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
      query: search,
      type: "index",
      format: "list",
    });

    index = index.map((e) => {
      return {
        ...e,
        link: (
          <a
            onClick={async () => {
              const translate = await query("api/translate", { icd10: e.code });
              setModalData(translate);
              await setShow("icd10");
            }}
            href="javascript:void(0)">
            {e.code}
          </a>
        ),
      };
    });

    var rootIndex = index.map((e) => {
      return {
        ...e,
        parentId: e.parentId === null ? 1 : e.parentId,
      };
    });

    rootIndex = [{ description: "Index", code: "", id: 1, parentId: null, parentCode: null }].concat(rootIndex);

    if (index.length) {
      if (indexICD10.current.children.length) {
        indexICD10.current.removeChild(indexICD10.current.children[0]);
      }

      indexICD10.current.appendChild(
        Tree(rootIndex, {
          label: (d) => d.description + " " + d.code,
          tree: d3.cluster,
          children: (d) => d.children,
          width: 2000,
        }),
      );
    }

    var neoplasm = await query("api/search/icd10", {
      query: search,
      type: "neoplasm",
      format: "list",
    });

    neoplasm = neoplasm.map((e) => {
      return {
        ...e,
        malignantPrimary: /\d/.test(e.malignantPrimary) ? (
          <a
            onClick={async () => {
              const translate = await query("api/translate", { icd10: e.malignantPrimary });
              setModalData(translate);
              await setShow("icd10");
            }}
            href="javascript:void(0)">
            {e.malignantPrimary}
          </a>
        ) : (
          e.malignantPrimary
        ),
        malignantSecondary: (
          <a
            onClick={async () => {
              const translate = await query("api/translate", { icd10: e.malignantSecondary });
              setModalData(translate);
              await setShow("icd10");
            }}
            href="javascript:void(0)">
            {e.malignantSecondary}
          </a>
        ),
        carcinomaInSitu: (
          <a
            onClick={async () => {
              const translate = await query("api/translate", { icd10: e.carcinomaInSitu });
              setModalData(translate);
              await setShow("icd10");
            }}
            href="javascript:void(0)">
            {e.carcinomaInSitu}
          </a>
        ),
        benign: (
          <a
            onClick={async () => {
              const translate = await query("api/translate", { icd10: e.benign });
              setModalData(translate);
              await setShow("icd10");
            }}
            href="javascript:void(0)">
            {e.benign}
          </a>
        ),
        uncertainBehavior: (
          <a
            onClick={async () => {
              const translate = await query("api/translate", { icd10: e.uncertainBehavior });
              setModalData(translate);
              await setShow("icd10");
            }}
            href="javascript:void(0)">
            {e.uncertainBehavior}
          </a>
        ),
        unspecifiedBehavior: (
          <a
            onClick={async () => {
              const translate = await query("api/translate", { icd10: e.unspecifiedBehavior });
              setModalData(translate);
              await setShow("icd10");
            }}
            href="javascript:void(0)">
            {e.unspecifiedBehavior}
          </a>
        ),
      };
    });

    if (neoplasm.length) {
      if (neoplasmICD10.current.children.length) {
        neoplasmICD10.current.removeChild(neoplasmICD10.current.children[0]);
      }

      neoplasmICD10.current.appendChild(
        Tree(neoplasm, {
          label: (d) => d.neoplasm,
          tree: d3.cluster,
          children: (d) => d.children,
          width: 2000,
        }),
      );
    }

    var drug = await query("api/search/icd10", {
      query: search,
      type: "drug",
      format: "list",
    });

    drug = drug.map((e) => {
      return {
        ...e,
        poisoningAccidental: (
          <a
            onClick={async () => {
              const translate = await query("api/translate", { icd10: e.poisoningAccidental });
              setModalData(translate);
              await setShow("icd10");
            }}
            href="javascript:void(0)">
            {e.poisoningAccidental}
          </a>
        ),
      };
    });

    var rootDrug = drug.map((e) => {
      return {
        ...e,
        parentId: e.parentId === null ? 1 : e.parentId,
      };
    });

    rootDrug = [{ substance: "Drug", id: 1, parentId: null }].concat(rootDrug);

    if (drug.length) {
      if (drugICD10.current.children.length) {
        drugICD10.current.removeChild(drugICD10.current.children[0]);
      }

      drugICD10.current.appendChild(
        Tree(rootDrug, {
          label: (d) => d.substance,
          tree: d3.cluster,
          children: (d) => d.children,
          width: 2000,
        }),
      );
    }

    var injury = await query("api/search/icd10", {
      query: search,
      type: "injury",
      format: "list",
    });

    injury = injury.map((e) => {
      return {
        ...e,
        link: (
          <a
            onClick={async () => {
              const translate = await query("api/translate", { icd10: e.code });
              setModalData(translate);
              await setShow("icd10");
            }}
            href="javascript:void(0)">
            {e.code}
          </a>
        ),
      };
    });

    var rootInjury = index.map((e) => {
      return {
        ...e,
        parentId: e.parentId === null ? 1 : e.parentId,
      };
    });

    rootInjury = [{ description: "Injury", code: "", id: 1, parentId: null, parentCode: null }].concat(rootInjury);

    if (index.length) {
      if (injuryICD10.current.children.length) {
        injuryICD10.current.removeChild(injuryICD10.current.children[0]);
      }

      injuryICD10.current.appendChild(
        Tree(rootInjury, {
          label: (d) => d.description + " " + d.code,
          tree: d3.cluster,
          children: (d) => d.children,
          width: 2000,
        }),
      );
    }

    var icdo3 = await query("api/search/icdo3", {
      query: search,
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

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      handleSubmit(event);
    }
  };

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
            <TreeDataState />
            <CustomTreeData getChildRows={getChildRows} />
            <VirtualTable
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
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={"Search by Keywords, ICD-10 code, or ICD-O-3 code"}
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
          <Tab eventKey="icd10Table" title="ICD-10 Code Table">
            <ICD10 form={form} />
          </Tab>
          <Tab eventKey="icdo3Table" title="ICD-O-3 Code Table">
            <ICDO3 form={form} />
          </Tab>
          <Tab eventKey="icd10Cluster" title="ICD-10 Hierarchy">
            <Accordion defaultActiveKey="index" alwaysOpen>
              <Accordion.Item eventKey="index">
                <Accordion.Header>
                  <b>Index Hierarchy</b>
                </Accordion.Header>
                <Accordion.Body>
                  <div ref={indexICD10} style={{ maxWidth: "100%", maxHeight: "800px", overflow: "auto" }} />
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey="neoplasm">
                <Accordion.Header>
                  <b>Neoplasm Hierarchy</b>
                </Accordion.Header>
                <Accordion.Body>
                  <div ref={neoplasmICD10} style={{ maxHeight: "800px", overflow: "auto" }} />
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey="drug">
                <Accordion.Header>
                  <b>Drug Hierarchy</b>
                </Accordion.Header>
                <Accordion.Body>
                  <div ref={drugICD10} style={{ maxHeight: "800px", overflow: "auto" }} />
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey="injury">
                <Accordion.Header>
                  <b>Injury Hierarchy</b>
                </Accordion.Header>
                <Accordion.Body>
                  <div ref={injuryICD10} style={{ maxHeight: "800px", overflow: "auto" }} />
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>
          </Tab>
        </Tabs>
      </Container>
    </>
  );
}
