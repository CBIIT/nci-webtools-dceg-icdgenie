import { useEffect, useState } from "react";
import { TreeDataState, CustomTreeData } from "@devexpress/dx-react-grid";
import { Grid, Table, TableHeaderRow, TableTreeColumn } from "@devexpress/dx-react-grid-bootstrap4";
import Container from "react-bootstrap/Container";

export default function ICD10({ maps, search }) {
  const [tabularOpen, setTabularOpen] = useState([])

  useEffect(() => {
    function expandTreeData(map) {
      const node = map.find(e => e[1].code === search)
      if (node) {
        const toReturn = Array.from(node[1].parents, id => map.findIndex((e) => e[0] === id))
        return toReturn
      }
      return []
    }

    setTabularOpen(expandTreeData(Array.from(maps.tabular)))
  }, [maps, search])

  const indexColumns = [
    { name: "description", title: "Description" },
    { name: "code", title: "Code" },
  ];

  const indexColumnExtension = [{ columnName: "description", width: "45rem", wordWrapEnabled: true }];

  function getTabularChildRows(row, rootRows) {

    if (row) {
      if (row.children.length === 0)
        return null

      var children = []
      row.children.forEach((child) => {
        children = children.concat(maps.tabular.get(child))
      })

      return children
    }
    return rootRows;
  }

  function IcdCodeTypeProvider({ value }) {
    return value
  }

  return (
    <Container className="py-5 h-100 col-xl-10 col-sm-12 index">
      <Grid rows={maps.tabular ? Array.from(maps.tabular.values()).filter((node) => node.parents.length === 0) : []} columns={indexColumns}>
        <IcdCodeTypeProvider for={["code"]} />
        <TreeDataState
          expandedRowIds={tabularOpen}
          onExpandedRowIdsChange={setTabularOpen}
        />
        <CustomTreeData getChildRows={getTabularChildRows} />
        <Table columnExtensions={indexColumnExtension} noDataCellComponent={() => <td />} />
        <TableHeaderRow />
        <TableTreeColumn for="description" />
      </Grid>
    </Container>
  );
}
