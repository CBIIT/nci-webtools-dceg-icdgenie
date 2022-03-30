import { Form, Container, Row, Col } from "react-bootstrap";
import { formState } from "./export.state";
import { post } from "../../services/query";
import { useRecoilState } from "recoil";
import { LoadingOverlay } from "@cbiitss/react-components";
import { Grid, VirtualTable, TableHeaderRow } from "@devexpress/dx-react-grid-bootstrap4";
import { saveAs } from "file-saver";

export default function Export() {
  const [form, setForm] = useRecoilState(formState);
  const mergeForm = (obj) => setForm({ ...form, ...obj });

  function handleChange(event) {
    const { name, value } = event.target;
    mergeForm({ [name]: value });
  }

  function asCsv(records) {
    const keys = Object.keys(records[0]);
    const quote = (str) => (str ? `"${str.replace(/"/g, '""')}"` : "");
    let csv = keys.map((key) => quote(key)).join(",");

    for (const record of records) {
      csv += "\n" + keys.map((key) => quote(record[key])).join(",");
    }

    return csv;
  }

  async function handleSubmit(event) {
    mergeForm({ ...form, loading: true });

    const response = await post("api/batch", {
      inputType: form.type,
      input: form.input.replace(/\n$/, ""),
      outputType: form.outputType,
      outputFormat: "json",
    });

    // const fetchCSV = await fetch('api/batch', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({
    //         inputType: form.type,
    //         input: form.input,
    //         outputType: form.outputType,
    //         outputFormat: "csv",
    //     })
    // })
    // const csv = await fetchCSV.text()

    const csv = asCsv(response);

    var columns = [];
    var tableColumnExtensions = [{ columnName: "icd10Description", width: 600, wordWrapEnabled: true }];

    if (form.type === "keywords") columns = [{ name: "input", title: "Keyword(s)" }];
    else if (form.type === "icd10") columns = [{ name: "input", title: "ICD-10 Code(s)" }];
    else if (form.type === "icdo3") columns = [{ name: "input", title: "ICD-O-3 Code(s)" }];

    if (form.outputType === "icd10") {
      columns = columns.concat([
        { name: "icd10", title: "ICD-10 Code(s)" },
        { name: "icd10Description", title: "Description" },
      ]);
    } else if (form.outputType === "icdo3") {
      columns = columns.concat([
        { name: "icdo3", title: "ICD-O-3 Code(s)" },
        { name: "icdo3Description", title: "Description" },
      ]);
      tableColumnExtensions = [{ columnName: "icdo3Description", width: 600, wordWrapEnabled: true }];
    }

    mergeForm({
      ...form,
      columns: columns,
      columnExtension: tableColumnExtensions,
      loading: false,
      submitted: true,
      output: response,
      csv: csv,
    });
  }

  async function readFile(e) {
    e.preventDefault();
    const reader = new FileReader();
    reader.onload = async (e) => {
      mergeForm({ input: e.target.result });
    };
    reader.readAsText(e.target.files[0]);
  }

  function exportCSV() {
    const blob = new Blob([form.csv], { type: "text/csv;charset=utf-8" });
    saveAs(blob, "icdgenie_batch_export.csv");
  }

  return (
    <div className="h-100" style={{ backgroundColor: "white" }}>
      <div
        className="d-flex justify-content-center align-self-center pt-5"
        style={{ fontWeight: "300", color: "#3D9ABE", fontSize: "28px", letterSpacing: "4px" }}>
        BATCH QUERY
      </div>
      <hr className="mt-5" style={{ height: "3px", color: "#77B6D6" }} />
      <Container className="py-4">
        <LoadingOverlay active={form.loading} overlayStyle={{ position: "fixed" }} />
        <Row>
          <Col xl={3}></Col>
          <Col xl={3}>
            <Form.Group className="mb-3">
              <Form.Label>
                <b>Select searchable type</b>
              </Form.Label>
              <Form.Check
                label="Keywords"
                name="type"
                type="radio"
                id="keywords"
                value="keywords"
                checked={form.type === "keywords"}
                onChange={handleChange}
              />
              <Form.Check
                label="ICD-10 Codes"
                name="type"
                type="radio"
                id="icd10Input"
                value="icd10"
                checked={form.type === "icd10"}
                onChange={handleChange}
              />

              <Form.Check
                label="ICD-O-3 Codes"
                name="type"
                type="radio"
                id="icdo3Input"
                value="icdo3"
                checked={form.type === "icdo3"}
                onChange={handleChange}
              />
            </Form.Group>
          </Col>
          <Col xl={3}>
            <Form.Group className="mb-3">
              <Form.Label>
                <b>Select output type</b>
              </Form.Label>
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

        <Row>
          <Col xl={3}></Col>
          <Col xl={5}>
            <Form.Group className="mb-3">
              <Form.Label>
                <b>Please upload or enter a list of keywords, ICD-10 or ICD-O-3 code for batch query:</b>
              </Form.Label>
              <textarea
                className="form-control"
                name="input"
                placeholder="ICD-10 Codes, ICD-O-3 Codes, or Keywords"
                onChange={handleChange}></textarea>
            </Form.Group>
          </Col>
        </Row>
        <Row>
          <Col xl={3}></Col>
          <Col xl={5}>
            <Form.Group className="mb-3">
              <input className="form-control" type="file" id="fileInput" onChange={(e) => readFile(e)} />
            </Form.Group>
          </Col>
        </Row>
        <Row>
          <Col xl={3}></Col>
          <Col xl={3}>
            <button
              className="btn"
              type="button"
              onClick={handleSubmit}
              style={{ backgroundColor: "#0396E3", color: "white" }}>
              Translate
            </button>
          </Col>
        </Row>
      </Container>
      {form.submitted ? <hr className="mt-5" style={{ height: "3px", color: "#77B6D6" }} /> : []}
      {form.submitted ? (
        <Container className="py-4 h-100">
          <div className="d-flex mb-3">
            <div className="me-auto p-2" style={{ letterSpacing: "1.5px" }}>
              <b>{form.output.length}</b> RESULTS FOUND
            </div>
            <button
              className="btn btn-outline p-2"
              onClick={exportCSV}
              style={{ color: "#0396E3", border: "1px solid #0396E3" }}>
              Export
            </button>
          </div>
          <Row className="table-container">
            <Grid rows={form.output} columns={form.columns}>
              <VirtualTable columnExtensions={form.columnExtension} />
              <TableHeaderRow />
            </Grid>
          </Row>
        </Container>
      ) : (
        []
      )}
    </div>
  );
}
