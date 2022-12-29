import { useRecoilState } from "recoil";
import axios from "axios";
import Form from "react-bootstrap/Form";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Loader from "../common/loader";
import Modal from "react-bootstrap/Modal";
import { Grid, Table, TableHeaderRow, PagingPanel } from "@devexpress/dx-react-grid-bootstrap4";
import {
  SortingState,
  IntegratedSorting,
  PagingState,
  IntegratedPaging,
} from '@devexpress/dx-react-grid';
import { formState, resultsState } from "./batch-query.state";
import { readFileAsText, exportCsv } from "./batch-query.utils";

export default function BatchQuery() {
  const [form, setForm] = useRecoilState(formState);
  const [results, setResults] = useRecoilState(resultsState);
  const mergeForm = (obj) => setForm({ ...form, ...obj });
  const mergeResults = (obj) => setResults({ ...results, ...obj });

  async function handleChange(event) {
    let { type, name, value, files, dataset } = event.target;

    if (type === "file") {
      value = await readFileAsText(files);
    }

    if (dataset.name) {
      name = dataset.name;
    }

    mergeForm({ [name]: value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    mergeResults({ loading: true });

    const response = await axios.post("api/batch", {
      input: form.input,
      inputType: form.inputType,
      outputType: form.outputType,
    });

    const columns = [
      { name: "input", title: "Input" },
      form.outputType === "icdo3" && { name: "code", title: "ICD-O-3 Code(s)" },
      form.outputType === "icdo3" && { name: "description", title: "Description" },
      form.outputType === "icd10" && { name: "code", title: "ICD-10 Code(s)" },
      form.outputType === "icd10" && { name: "description", title: "Description" },
    ].filter(Boolean);

    const columnExtensions = [
      { columnName: "input", width: "10rem" },
      { columnName: "code", width: "15rem" },
      form.outputType === "icdo3" && { columnName: "description", wordWrapEnabled: true },
      form.outputType === "icd10" && { columnName: "description", wordWrapEnabled: true },
    ].filter(Boolean);
    console.log(response)
    mergeResults({
      loading: false,
      output: response.data,
      columns,
      columnExtensions,
    });
  }

  return (
    <div className="d-flex flex-column h-100 bg-white">
      <Container>
        <h1 className="my-3 page-header text-muted text-center text-uppercase">Batch Query</h1>
      </Container>

      <hr />

      <Form onSubmit={handleSubmit}>
        <Loader show={results.loading} fullscreen />
        <Container className="py-2">
          <Row className="justify-content-center">
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Select searchable type</Form.Label>
                <Form.Check
                  label="Keywords"
                  name="inputType"
                  type="radio"
                  id="keywords"
                  value="keywords"
                  checked={form.inputType === "keywords"}
                  onChange={handleChange}
                />
                <Form.Check
                  label="ICD-10 Codes"
                  name="inputType"
                  type="radio"
                  id="icd10Input"
                  value="icd10"
                  checked={form.inputType === "icd10"}
                  onChange={handleChange}
                />
                <Form.Check
                  label="ICD-O-3 Codes"
                  name="inputType"
                  type="radio"
                  id="icdo3Input"
                  value="icdo3"
                  checked={form.inputType === "icdo3"}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label>Select output type</Form.Label>
                <Form.Check
                  label="ICD-10 Codes"
                  name="outputType"
                  type="radio"
                  id="icd10Output"
                  value="icd10"
                  checked={form.outputType === "icd10"}
                  onChange={handleChange}
                />
                <Form.Check
                  label="ICD-O-3 Codes"
                  name="outputType"
                  type="radio"
                  id="icdo3Output"
                  value="icdo3"
                  checked={form.outputType === "icdo3"}
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="justify-content-center">
            <Col md={8}>
              <Form.Group className="mb-1">
                <Form.Label>Please upload a file (.csv) or enter a list of keywords, ICD-10 codes or ICD-O-3 codes</Form.Label>
                <Form.Control
                  className="mb-3"
                  as="textarea"
                  name="input"
                  rows={2}
                  value={form.input}
                  placeholder="Keywords (Ex. stomach), ICD-10 Codes (Ex. C16.1), ICD-O-3 Codes (Ex. 8144/2)"
                  onChange={handleChange}
                />
                <Row>
                  <Col md={6}>
                    <input
                      type="file"
                      id="fileInput"
                      name="fileInput"
                      className="form-control mb-3"
                      aria-label="Upload a file containing search terms"
                      data-name="input"
                      accept=".csv"
                      onChange={handleChange}
                    />
                  </Col>
                  <Col md={1}>
                    <Button className="mt-1" variant="primary" type="submit" size="sm">
                      Submit
                    </Button>
                  </Col>
                </Row>
              </Form.Group>
            </Col>
          </Row>
        </Container>
      </Form>
      {results.columns.length && (
        <div className="bg-light">
          <hr />
          <Container className="py-3">
            <div className="mb-3 d-flex justify-content-between align-items-center">
              <div className="text-uppercase" style={{ fontSize: "14px", letterSpacing: "1.5px" }}>
                <b>{results.output.length.toLocaleString()}</b> Results Found
              </div>
              <Button variant="primary" size="sm" onClick={() => exportCsv(results.output, "icd_genie_batch_export.csv")}>
                Export CSV
              </Button>
            </div>
            <div className="index border">
              <Grid rows={results.output} columns={results.columns}>
                <SortingState
                  defaultSorting={[{ columnName: 'input', direction: 'asc' }]}
                />
                <PagingState
                  defaultCurrentPage={0}
                  defaultPageSize={20}
                />
                <IntegratedSorting />
                <IntegratedPaging />
                <Table columnExtensions={results.columnExtensions} />
                <TableHeaderRow showSortingControls />
                <PagingPanel pageSizes={[10, 20, 50, 100]} />
              </Grid>
            </div>
          </Container>
        </div>
      )}
    </div>
  );
}
