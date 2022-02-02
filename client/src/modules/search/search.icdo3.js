import { useState } from "react";
import { TreeDataState, CustomTreeData, PagingState, IntegratedPaging } from "@devexpress/dx-react-grid";
import { Grid, Table, TableHeaderRow, TableTreeColumn, PagingPanel } from "@devexpress/dx-react-grid-bootstrap4";

export default function ICDO3({ form }) {
  const icdo3Columns = [
    { name: "description", title: "Description" },
    { name: "code", title: "Code" },
    { name: "isPreferred", title: "Preferred?" },
  ];

  const getChildRows = (row, rootRows) => {
    return row ? row.children : rootRows;
  };

  return (
    <Grid rows={form.icdo3Data} columns={icdo3Columns}>
      <TreeDataState />
      <CustomTreeData getChildRows={getChildRows} />
      <Table columnExtensions={[{ columnName: "description", width: 700, wordWrapEnabled: true }]} />
      <TableHeaderRow />
      <TableTreeColumn for="description" />
    </Grid>
  );
}
