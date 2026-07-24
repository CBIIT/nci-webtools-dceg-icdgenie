import { useEffect, useState } from "react";
import { DataTypeProvider } from "@devexpress/dx-react-grid";
import Accordion from "react-bootstrap/Accordion";
import { TreeDataState, CustomTreeData } from "@devexpress/dx-react-grid";
import { Grid, Table, TableHeaderRow, TableTreeColumn } from "@devexpress/dx-react-grid-bootstrap4";
import Container from "react-bootstrap/Container";
import { useNavigate } from "react-router-dom";

export default function ICD11({ maps, search }) {
  const navigate = useNavigate();
  const [panel, setPanel] = useState(null);
  const [expandedRows, setExpandedRows] = useState([]);

  useEffect(() => {
    setPanel(maps.icd11.size ? "0" : null);
    setExpandedRows(expandTreeData(Array.from(maps.icd11)));
  }, [maps]);

  const columns = [
    { name: "description", title: "Description" },
    { name: "code", title: "Code" },
  ];

  const columnExtensions = [{ columnName: "description", width: "45rem", wordWrapEnabled: true }];

  function expandTreeData(map) {
    const node = map.find((e) => e[1].code === search);
    if (node) {
      return Array.from(node[1].parents, (id) => map.findIndex((e) => e[0] === id));
    }
    return [];
  }

  function getChildRows(row, rootRows) {
    if (row) {
      if (row.children.length === 0) return null;
      var children = [];
      row.children.forEach((child) => {
        const childNode = maps.icd11.get(child);
        if (childNode) children.push(childNode);
      });
      return children.length > 0 ? children : null;
    }
    return rootRows;
  }

  function IcdCodeTypeProvider(props) {
    function CodeLink({ value: code }) {
      if (!code) return code;
      return (
        <button
          type="button"
          className="btn btn-link p-0 align-baseline"
          onClick={() => navigate("/translate", { state: { code, from: "icd11" } })}
        >
          {code}
        </button>
      );
    }

    return <DataTypeProvider formatterComponent={CodeLink} {...props} />;
  }

  function handleAccordion() {
    return panel === null ? setPanel("0") : setPanel(null);
  }

  return (
    <Container className="py-5 h-100 col-xl-10 col-sm-12 index">
      <Grid
        rows={
          maps.icd11
            ? Array.from(maps.icd11.values()).filter((node) => node.parents.length === 0)
            : []
        }
        columns={columns}
      >
        <IcdCodeTypeProvider for={["code"]} />
        <TreeDataState expandedRowIds={expandedRows} onExpandedRowIdsChange={setExpandedRows} />
        <CustomTreeData getChildRows={getChildRows} />
        <Table columnExtensions={columnExtensions} noDataCellComponent={() => <td />} />
        <TableHeaderRow />
        <TableTreeColumn for="description" />
      </Grid>

      {/* <Accordion
        onSelect={() => {
          maps.icd11.size ? handleAccordion() : setPanel(null);
        }}
        activeKey={panel}
        className={`mb-4 ${maps.icd11.size ? "index" : "disabled"}`}
      >
        <Accordion.Item eventKey="0">
          <Accordion.Header>
            <span className="accordion-font">ICD-11 CODES</span>
          </Accordion.Header>
          <Accordion.Body>
            <Grid
              rows={
                maps.icd11
                  ? Array.from(maps.icd11.values()).filter((node) => node.parents.length === 0)
                  : []
              }
              columns={columns}
            >
              <IcdCodeTypeProvider for={["code"]} />
              <TreeDataState expandedRowIds={expandedRows} onExpandedRowIdsChange={setExpandedRows} />
              <CustomTreeData getChildRows={getChildRows} />
              <Table columnExtensions={columnExtensions} />
              <TableHeaderRow />
              <TableTreeColumn for="description" />
            </Grid>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion> */}
    </Container>
  );
}
