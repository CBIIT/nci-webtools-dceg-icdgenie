import { useEffect, useState } from "react";
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

export default function ICD10({ maps, search }) {
  const setModal = useSetRecoilState(modalState);

  const [indexPanel, setIndexPanel] = useState(null)
  const [neoplasmPanel, setNeoplasmPanel] = useState(null)
  const [drugPanel, setDrugPanel] = useState(null)
  const [injuryPanel, setInjuryPanel] = useState(null)
  const [loading, setLoading] = useState(false);
  const [tabularOpen, setTabularOpen] = useState([])
  const [neoplasmOpen, setNeoplasmOpen] = useState([])
  const [drugOpen, setDrugOpen] = useState([])
  const [injuryOpen, setInjuryOpen] = useState([])

  useEffect(() => {

    setIndexPanel(maps.tabular.size ? "0" : null)
    setNeoplasmPanel(maps.neoplasm.size ? "0" : null)
    setDrugPanel(maps.drug.size ? "0" : null)
    setInjuryPanel(maps.injury.size ? "0" : null)

    setTabularOpen(expandTreeData(Array.from(maps.tabular)))
    setNeoplasmOpen(expandTreeData(Array.from(maps.neoplasm)))
    setDrugOpen(expandTreeData(Array.from(maps.drug)))
    setInjuryOpen(expandTreeData(Array.from(maps.injury)))
  }, [maps])

  const indexColumns = [
    { name: "description", title: "Description" },
    { name: "code", title: "Code" },
  ];

  const neoplasmColumns = [
    { name: "description", title: "Neoplasm" },
    { name: "malignantPrimary", title: "Malignant Primary" },
    { name: "malignantSecondary", title: "Malignant Secondary" },
    { name: "carcinomaInSitu", title: "Ca in situ" },
    { name: "benign", title: "Benign" },
    { name: "uncertainBehavior", title: "Uncertain Behavior" },
    { name: "unspecifiedBehavior", title: "Unspecified Behavior" },
  ];

  const drugColumns = [
    { name: "description", title: "Substance" },
    { name: "poisoningAccidental", title: "Accidental Poisoning" },
    { name: "poisoningIntentionalSelfHarm", title: "Intentional Self Harm Poisoning" },
    { name: "poisoningAssault", title: "Assault Poisoning" },
    { name: "poisoningUndetermined", title: "Undetermined Poisoning" },
    { name: "adverseEffect", title: "Adverse Effect" },
    { name: "underdosing", title: "Underdosing" },
  ];


  const indexColumnExtension = [{ columnName: "description", width: "45rem", wordWrapEnabled: true }];

  const neoplasmColumnExtension = [
    { columnName: "description", width: "25rem", wordWrapEnabled: true },
    { columnName: "malignantPrimary", width: "7rem", wordWrapEnabled: true },
    { columnName: "malignantSecondary", width: "7rem", wordWrapEnabled: true },
    { columnName: "carcinomaInSitu", width: "8rem", wordWrapEnabled: true },
    { columnName: "benign", width: "6rem", wordWrapEnabled: true },
    { columnName: "uncertainBehavior", width: "8rem", wordWrapEnabled: true },
    { columnName: "unspecifiedBehavior", width: "8rem", wordWrapEnabled: true },
  ];

  const drugColumnExtension = [
    { columnName: "description", width: "25rem", wordWrapEnabled: true },
    { columnName: "poisoningAccidental", width: "7rem", wordWrapEnabled: true },
    { columnName: "poisoningIntentionalSelfHarm", width: "7rem", wordWrapEnabled: true },
    { columnName: "poisoningAssault", width: "7rem", wordWrapEnabled: true },
    { columnName: "poisoningUndetermined", width: "8rem", wordWrapEnabled: true },
    { columnName: "adverseEffect", width: "6rem", wordWrapEnabled: true },
    { columnName: "adverseEffect", width: "6rem", wordWrapEnabled: true },
  ];

  function expandTreeData(map) {
    const node = map.find(e => e[1].code === search)
    if (node) {
      const toReturn = Array.from(node[1].parents, id => map.findIndex((e) => e[0] === id))
      return toReturn
    }

    return []
  }

  function getChildRows(row, rootRows) {
    console.log(row)
    if (row)
      console.log(row.children)
    return row ? row.children : rootRows;
  }

  function getTabularChildRows(row, rootRows) {

    if (row) {
      if (row.children.length === 0)
        return null

      var children = []
      row.children.map((child) => {
        children = children.concat(maps.tabular.get(child))
      })

      return children
    }
    return rootRows;
  }

  function getNeoplasmChildRows(row, rootRows) {

    if (row) {
      if (row.children.length === 0)
        return null

      var children = []
      row.children.map((child) => {
        children = children.concat(maps.neoplasm.get(child))
      })

      return children
    }
    return rootRows;
  }


  function getDrugChildRows(row, rootRows) {

    if (row) {
      if (row.children.length === 0)
        return null

      var children = []
      row.children.map((child) => {
        children = children.concat(maps.drug.get(child))
      })

      return children
    }
    return rootRows;
  }

  function getInjuryChildRows(row, rootRows) {

    if (row) {
      if (row.children.length === 0)
        return null

      var children = []
      row.children.map((child) => {
        children = children.concat(maps.injury.get(child))
      })

      return children
    }
    return rootRows;
  }

  function IcdCodeTypeProvider({ value }) {
    return value
  }

  function handleAccordion(panel, setPanel) {

    return panel === null ? setPanel("0") : setPanel(null)
  }

  return (
    <Container className="py-5 col-xl-10 col-sm-12">
      <Loader show={loading} fullscreen />
      <Accordion onSelect={() => { maps.tabular.size ? handleAccordion(indexPanel, setIndexPanel) : setIndexPanel(null) }} activeKey={indexPanel} className={`mb-4 ${maps.tabular.size ? "index" : "disabled"}`}>
        <Accordion.Item eventKey="0">
          <Accordion.Header>
            <span className="accordion-font">INDEX TABLE</span>
          </Accordion.Header>
          <Accordion.Body>
            <Grid rows={maps.tabular ? Array.from(maps.tabular.values()).filter((node) => node.parents.length === 0) : []} columns={indexColumns}>
              <IcdCodeTypeProvider for={["code"]} />
              <TreeDataState
                expandedRowIds={tabularOpen}
                onExpandedRowIdsChange={setTabularOpen}
              />
              <CustomTreeData getChildRows={getTabularChildRows} />
              <Table columnExtensions={indexColumnExtension} />
              <TableHeaderRow />
              <TableTreeColumn for="description" />
            </Grid>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>

      <Accordion onSelect={() => { maps.neoplasm.size ? handleAccordion(neoplasmPanel, setNeoplasmPanel) : setNeoplasmPanel(null) }} activeKey={neoplasmPanel} className={`mb-4 ${maps.neoplasm.size ? "neoplasm" : "disabled"}`}>
        <Accordion.Item eventKey="0">
          <Accordion.Header>
            <span className="accordion-font">NEOPLASM TABLE</span>
          </Accordion.Header>
          <Accordion.Body>
            <Grid rows={maps.neoplasm ? Array.from(maps.neoplasm.values()).filter((node) => node.parents.length === 0) : []} columns={neoplasmColumns}>
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
              <TreeDataState
                expandedRowIds={neoplasmOpen}
                onExpandedRowIdsChange={setNeoplasmOpen}
              />
              <CustomTreeData getChildRows={getNeoplasmChildRows} />
              <Table columnExtensions={neoplasmColumnExtension} />
              <TableHeaderRow />
              <TableTreeColumn for="description" />
            </Grid>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>

      <Accordion onSelect={() => { maps.drug.size ? handleAccordion(drugPanel, setDrugPanel) : setDrugPanel(null) }} activeKey={drugPanel} className={`mb-4 ${maps.drug.size ? "drug" : "disabled"}`}>
        <Accordion.Item eventKey="0">
          <Accordion.Header>
            <span className="accordion-font">DRUG TABLE</span>
          </Accordion.Header>
          <Accordion.Body>
            <Grid rows={maps.drug ? Array.from(maps.drug.values()).filter((node) => node.parents.length === 0) : []} columns={drugColumns}>
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
              <TreeDataState
                expandedRowIds={drugOpen}
                onExpandedRowIdsChange={setDrugOpen}
              />
              <CustomTreeData getChildRows={getDrugChildRows} />
              <Table columnExtensions={drugColumnExtension} />
              <TableHeaderRow />
              <TableTreeColumn for="description" />
            </Grid>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>

      <Accordion onSelect={() => { maps.injury.size ? handleAccordion(injuryPanel, setInjuryPanel) : setInjuryPanel(null) }} activeKey={injuryPanel} className={`mb-4 ${maps.injury.size ? "injury" : "disabled"}`}>
        <Accordion.Item eventKey="0">
          <Accordion.Header>
            <span className="accordion-font">INJURY TABLE</span>
          </Accordion.Header>
          <Accordion.Body>
            <Grid rows={maps.injury ? Array.from(maps.injury.values()).filter((node) => node.parents.length === 0) : []} columns={indexColumns}>
              <IcdCodeTypeProvider for={["code"]} />
              <TreeDataState
                expandedRowIds={injuryOpen}
                onExpandedRowIdsChange={setInjuryOpen}
              />
              <CustomTreeData getChildRows={getInjuryChildRows} />
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
