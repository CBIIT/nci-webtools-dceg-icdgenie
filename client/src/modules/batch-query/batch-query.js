import { useRecoilState } from "recoil";
import axios from "axios";
import Form from "react-bootstrap/Form";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Button from "react-bootstrap/Button";
import Loader from "../common/loader";
import Modal from "react-bootstrap/Modal";
import { Grid, VirtualTable, TableHeaderRow } from "@devexpress/dx-react-grid-bootstrap4";
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
      form.outputType === "icdo3" && { name: "icdo3", title: "ICD-O-3 Code(s)" },
      form.outputType === "icdo3" && { name: "icdo3Description", title: "Description" },
      form.outputType === "icd10" && { name: "icd10", title: "ICD-10 Code(s)" },
      form.outputType === "icd10" && { name: "icd10Description", title: "Description" },
    ].filter(Boolean);

    const columnExtensions = [
      form.outputType === "icdo3" && { columnName: "icdo3Description", width: 600, wordWrapEnabled: true },
      form.outputType === "icd10" && { columnName: "icd10Description", width: 600, wordWrapEnabled: true },
    ].filter(Boolean);

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
        <h1 className="my-5 display-6 text-muted text-center text-uppercase">Batch Query</h1>
      </Container>

      <hr />

      <Form onSubmit={handleSubmit}>
        <Loader show={results.loading} fullscreen />
        <Container className="py-5">
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
              <Form.Group className="mb-3">
                <Form.Label>Please upload a file or enter a list of keywords, ICD-10 codes or ICD-O-3 codes</Form.Label>
                <Form.Control
                  className="mb-3"
                  as="textarea"
                  name="input"
                  rows={5}
                  value={form.input}
                  placeholder="Keywords (Ex. stomach), ICD-10 Codes (Ex. C16.1), ICD-O-3 Codes (Ex. 8144/2)"
                  onChange={handleChange}
                />
                <input
                  type="file"
                  id="fileInput"
                  name="fileInput"
                  className="form-control mb-3"
                  aria-label="Upload a file containing search terms"
                  data-name="input"
                  onChange={handleChange}
                />
              </Form.Group>
            </Col>
          </Row>
          <Row className="justify-content-center">
            <Col md={8}>
              <Button variant="primary" type="submit">
                Submit
              </Button>
            </Col>
          </Row>
        </Container>
      </Form>
      {results.columns.length && (
        <>
          <hr />
          <Container className="my-5">
            <div className="mb-3 d-flex justify-content-between align-items-center">
              <div className="text-uppercase" style={{ letterSpacing: "1.5px" }}>
                <b>{results.output.length.toLocaleString()}</b> Results Found
              </div>
              <Button variant="primary" onClick={() => exportCsv(results.output, "icd_genie_batch_export.csv")}>
                Export CSV
              </Button>
            </div>
            <div className="index border">
              <Grid rows={results.output} columns={results.columns}>
                <VirtualTable columnExtensions={results.columnExtensions} />
                <TableHeaderRow />
              </Grid>
            </div>
          </Container>
        </>
      )}
    </div>
  );
}
