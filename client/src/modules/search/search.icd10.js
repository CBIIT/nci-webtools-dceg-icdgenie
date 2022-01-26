import { formState } from "./search.state";
import { useState } from "react";
import Accordion from "react-bootstrap/Accordion";
import { TreeDataState, CustomTreeData, PagingState, IntegratedPaging } from "@devexpress/dx-react-grid";
import { Grid, Table, TableHeaderRow, TableTreeColumn, PagingPanel } from "@devexpress/dx-react-grid-bootstrap4";
import { Modal } from "react-bootstrap";

export default function ICD10({ form }) {
  const [show, setShow] = useState(false);

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

  const tableColumnExtensions = [{ columnName: "neoplasm", width: 400, wordWrapEnabled: true }];

  const getChildRows = (row, rootRows) => {
    return row ? row.children : rootRows;
  };
  const getIndexChild = (row, rootRows) => {
    const childRows = rootRows.filter((r) => r.parentId === (row ? row.id : null));
    return childRows.length ? childRows : null;
  };

  return (
    <Accordion defaultActiveKey="0" alwaysOpen>
      <Accordion.Item eventKey="0">
        <Accordion.Header>
          <b>Index Table</b>
        </Accordion.Header>
        <Accordion.Body>
          <Grid rows={form.indexData} columns={indexColumns}>
            <TreeDataState />
            <CustomTreeData getChildRows={getIndexChild} />
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
  );
}
