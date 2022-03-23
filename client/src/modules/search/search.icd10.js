import Accordion from "react-bootstrap/Accordion";
import { TreeDataState, CustomTreeData, PagingState, IntegratedPaging } from "@devexpress/dx-react-grid";
import { Grid, Table, TableHeaderRow, TableTreeColumn, PagingPanel } from "@devexpress/dx-react-grid-bootstrap4";
import Container from "react-bootstrap/Container";

export default function ICD10({ form }) {

  const indexColumns = [
    { name: "description", title: "Description" },
    { name: "link", title: "Code" },
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
    { columnName: "uncertaiunspecifiedBehaviornBehavior", wordWrapEnabled: true }
  ]

  const drugColumnExtension = [
    { columnName: "substance", width: 400, wordWrapEnabled: true },
    { columnName: "poisoningAccidental", wordWrapEnabled: true },
    { columnName: "poisoningIntentionalSelfHarm", wordWrapEnabled: true },
    { columnName: "poisoningAssault", wordWrapEnabled: true },
    { columnName: "poisoningUndetermined", wordWrapEnabled: true },
  ]

  const getChildRows = (row, rootRows) => {
    const childRows = rootRows.filter((r) => r.parentId === (row ? row.id : null));
    return childRows.length ? childRows : null;
  };

  const neoplasmRowComponent = ({ tableRow, ...restProps }) => {
    return <Table.Row {...restProps} style={{ border: '0.75px solid #97B4CB', backgroundColor: "#5A6B91", background: 'linear-gradient(270deg, #3F95B1 0%, #D14E1A 100%)' }} />;
  };

  const drugRowComponent = ({ tableRow, ...restProps }) => {
    return <Table.Row {...restProps} style={{ border: '0.75px solid #97B4CB', backgroundColor: "#5A6B91", background: 'linear-gradient(270deg, #3F95B1 0%, #682306 100%)' }} />;
  };

  const injuryRowComponent = ({ tableRow, ...restProps }) => {
    return <Table.Row {...restProps} style={{ border: '0.75px solid #97B4CB', backgroundColor: "#5A6B91", background: 'linear-gradient(270deg, #3F95B1 0%, #00686D 100%)' }} />;
  };

  return (
    <Container className="py-5 col-xl-8 col-sm-12">
      <Accordion defaultActiveKey="0" alwaysOpen className="mb-4">
        <Accordion.Item eventKey="0">
          <Accordion.Header className="index">
            <span className="accordion-font">INDEX TABLE</span>
          </Accordion.Header>
          <Accordion.Body>
            <Grid rows={form.indexData} columns={indexColumns}>
              <TreeDataState />
              <CustomTreeData getChildRows={getChildRows} />
              <Table columnExtensions={indexColumnExtension} />
              <TableHeaderRow />
              <TableTreeColumn for="description" />
            </Grid>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>

      <Accordion defaultActiveKey="0" alwaysOpen className="mb-4">
        <Accordion.Item eventKey="0">
          <Accordion.Header className="neoplasm">
            <span className="accordion-font">NEOPLASM TABLE</span>
          </Accordion.Header>
          <Accordion.Body>
            <Grid rows={form.neoplasmData} columns={neoplasmColumns}>
              <TreeDataState />
              <CustomTreeData getChildRows={getChildRows} />
              <Table
                columnExtensions={neoplasmColumnExtension}
              />
              <TableHeaderRow rowComponent={neoplasmRowComponent}/>
              <TableTreeColumn for="neoplasm" />
            </Grid>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>

      <Accordion defaultActiveKey="0" alwaysOpen className="mb-4">
        <Accordion.Item eventKey="0">
          <Accordion.Header className="drug">
            <span className="accordion-font">DRUG TABLE</span>
          </Accordion.Header>
          <Accordion.Body>
            <Grid rows={form.drugData} columns={drugColumns}>
              <TreeDataState />
              <CustomTreeData getChildRows={getChildRows} />
              <Table columnExtensions={drugColumnExtension} />
              <TableHeaderRow rowComponent={drugRowComponent}/>
              <TableTreeColumn for="substance" />
            </Grid>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>

      <Accordion defaultActiveKey="0" alwaysOpen className="mb-4">
        <Accordion.Item eventKey="0">
          <Accordion.Header className="injury">
            <span className="accordion-font">INJURY TABLE</span>
          </Accordion.Header>
          <Accordion.Body>
            <Grid rows={form.injuryData} columns={indexColumns}>
              <TreeDataState />
              <CustomTreeData getChildRows={getChildRows} />
              <Table columnExtensions={indexColumnExtension} />
              <TableHeaderRow rowComponent={injuryRowComponent}/>
              <TableTreeColumn for="description" />
            </Grid>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    </Container>
  );
}
