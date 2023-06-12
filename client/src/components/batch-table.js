import { Grid, Table, TableHeaderRow, PagingPanel } from "@devexpress/dx-react-grid-bootstrap4";
import { SortingState, IntegratedSorting, PagingState, IntegratedPaging } from "@devexpress/dx-react-grid";
import { useState } from "react";

export default function BatchTable({ results, sorting }) {

    const [integratedSortingColumnExtensions] = useState([
        { columnName: 'id', compare: (a, b) => { return a - b } },
      ]);
    

    console.log(results)
    return (
        <Grid rows={results.output} columns={results.columns}>
            <SortingState sorting={sorting} />
            <PagingState defaultCurrentPage={0} defaultPageSize={10} />
            <IntegratedSorting columnExtensions={integratedSortingColumnExtensions} />
            <IntegratedPaging />
            <Table columnExtensions={results.columnExtensions} showPageJump={false} />
            <TableHeaderRow showSortingControls />
            <PagingPanel pageSizes={
                [
                    results.output.length && 10,
                    results.output.length >= 20 && 20,
                    results.output.length >= 50 && 50,
                    results.output.length >= 100 && 100
                ].filter(Boolean)
            } />
        </Grid>
    )
}