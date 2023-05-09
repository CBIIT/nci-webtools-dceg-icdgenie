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
import { SortingState, IntegratedSorting, PagingState, IntegratedPaging } from "@devexpress/dx-react-grid";
import { formState, resultsState } from "./batch-query.state";
import { readFileAsText, exportTsv } from "./batch-query.utils";
import { useState } from "react";

export default function BatchQuery() {
  const [form, setForm] = useRecoilState(formState);
  const [results, setResults] = useRecoilState(resultsState);
  const mergeForm = (obj) => setForm({ ...form, ...obj });
  const mergeResults = (obj) => setResults({ ...results, ...obj });
  const [fileError, setFileError] = useState("")
  const [uploaded, setUploaded] = useState(false);
  const [showResults, setShowResults] = useState(false);

  const [integratedSortingColumnExtensions] = useState([
    { columnName: 'id', compare: (a, b) => { return a - b } },
  ]);

  console.log(form)
  console.log(results)
  async function handleChange(event) {
    let { type, name, value, files, dataset } = event.target;

    if (type === "file") {
      
      mergeForm({input: ""})

      if(files[0].name.endsWith(".tsv")){
        setFileError("")
        setUploaded(true)
        setShowResults(false)

        var fileText = await readFileAsText(files);
        fileText = fileText.split("\n")
        fileText.splice(0,1)
        value = fileText.join("\n")
      }
      else{
        setFileError("Please upload a .tsv file")
        return;
      }
        
    }

    if (name === "inputType") {
      mergeForm({
        icd10Id: false,
        icdo3Site: false,
        icdo3Morph: false,
        [name]: value
      })
    }
    else {
      if (dataset.name) {
        name = dataset.name;
      }

      mergeForm({ [name]: value });
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    mergeResults({ loading: true });

    const response = await axios.post("api/batch", {
      input: form.input,
      inputType: form.inputType,
      icd10Id: form.icd10Id,
      icdo3Site: form.icdo3Site,
      icdo3Morph: form.icdo3Morph
    });

    setShowResults(true);

    var columns;
    var columnExtensions;

    if (form.inputType === "icd10" || (form.icdo3Site !== form.icdo3Morph)) {
      columns = [
        (form.icd10Id || form.icdo3Site || form.icdo3Morph) && { name: "id", title: "Patient ID" },
        form.inputType === "icd10" && { name: "code", title: "ICD-10 Code" },
        form.icdo3Site && { name: "code", title: "ICD-O-3 Site Code" },
        form.icdo3Morph && { name: "code", title: "ICD-O-3 Morphology Code" },
        { name: "description", title: "Description" }
      ].filter(Boolean);

      columnExtensions = [
        (form.icd10Id || form.icdo3Site || form.icdo3Morph) && { columnName: "id", width: "10rem" },
        { columnName: "code", width: "15rem" },
        { columnName: "description", wordWrapEnabled: "true" },
      ].filter(Boolean)
    }
    else {
      columns = [
        { name: "id", title: "Patient ID" },
        { name: "morphCode", title: "Morphology Code" },
        { name: "siteCode", title: "Site Code" },
        { name: "morphology", title: "Morphology Description" },
        { name: "site", title: "Site Description" },
        { name: "indicator", title: "Indicator" }
      ]
      columnExtensions = [
        { columnName: "id", width: "8rem" },
        { columnName: "morphCode", width: "12rem" },
        { columnName: "siteCode", width: "10rem" },
        { columnName: "morphology", wordWrapEnabled: "true" },
        { columnName: "site", wordWrapEnabled: "true" },
        { columnName: "indicator", wordWrapEnabled: "true" },
      ]
    }

    console.log(response.data)
    /*  
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
        ].filter(Boolean);*/

    mergeResults({
      loading: false,
      output: response.data,
      columns: columns,
      columnExtensions: columnExtensions
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
                  label="ICD-10 Codes"
                  name="inputType"
                  type="radio"
                  id="icd10Input"
                  value="icd10"
                  checked={form.inputType === "icd10"}
                  onChange={handleChange}
                />
                <div className="ms-5">
                  <Form.Check
                    label="Patient IDs"
                    name="icd10Id"
                    type="checkbox"
                    id="icd10Id"
                    value="icd10Id"
                    checked={form.icd10Id}
                    disabled={form.inputType === "icdo3"}
                    onClick={() => mergeForm({ ["icd10Id"]: !form.icd10Id })}
                  />

                  <Form.Check
                    label="Codes"
                    name="icd10Code"
                    type="checkbox"
                    id="icd10CCode"
                    value="icd10Code"
                    disabled={true}
                    checked={form.inputType === "icd10"}
                  />
                </div>

                <Form.Check
                  label="ICD-O-3 Codes (Must Select Morphology and/or Site)"
                  name="inputType"
                  type="radio"
                  id="icdo3Input"
                  value="icdo3"
                  checked={form.inputType === "icdo3"}
                  onChange={handleChange}
                />

                <div className="ms-5">
                  <Form.Check
                    label="Patient IDs"
                    name="icdo3Id"
                    type="checkbox"
                    id="icdo3Id"
                    value="icdo3Id"
                    disabled={true}
                    checked={form.inputType === "icdo3"}
                  />

                  <Form.Check
                    label="Morphology"
                    name="icdo3Morph"
                    type="checkbox"
                    id="icdo3Morph"
                    value="icdo3Morph"
                    checked={form.icdo3Morph}
                    disabled={form.inputType === "icd10"}
                    onClick={() => mergeForm({ ["icdo3Morph"]: !form.icdo3Morph })}
                  />

                  <Form.Check
                    label="Site"
                    name="icdo3Site"
                    type="checkbox"
                    id="icdo3Site"
                    value="icdo3Site"
                    checked={form.icdo3Site}
                    disabled={form.inputType === "icd10"}
                    onClick={() => mergeForm({ ["icdo3Site"]: !form.icdo3Site })}
                  />

                </div>
              </Form.Group>
            </Col>
            <Col md={4}>
            </Col>
          </Row>

          <Row className="justify-content-center">
            <Col md={8}>
              <Form.Group className="mb-1">
                <Form.Label>
                  Please upload a file (.tsv) or enter a list of ICD-10 codes or ICD-O-3 codes
                </Form.Label>
                <Form.Control
                  className="mb-3"
                  as="textarea"
                  name="input"
                  rows={2}
                  value={form.input}
                  disabled={uploaded}
                  placeholder="ICD-10 Codes (Ex. C16.1), ICD-O-3 Codes (Ex. 8144/2)"
                  onChange={handleChange}
                />
                <Row>
                  <Col md={6}>
                    <input
                      type="file"
                      id="fileInput"
                      name="fileInput"
                      className="form-control"
                      aria-label="Upload a file containing search terms"
                      data-name="input"
                      accept=".tsv"
                      onChange={handleChange}
                    />
                    {fileError ? <div style={{ color: "red"}}>{fileError}</div> : <></>}
                    <a href={`${process.env.PUBLIC_URL}/files/icdgenie_example_icdo3_morphology_site.tsv`}>
                      Download Example
                    </a>
                  </Col>
                  <Col md={1}>
                    <Button
                      className="mt-1"
                      variant="primary"
                      type="submit"
                      size="sm"
                      disabled={form.inputType === "icdo3" && (!form.icdo3Site && !form.icdo3Morph)}
                    >
                      Submit
                    </Button>
                  </Col>
                </Row>
              </Form.Group>
            </Col>
          </Row>
        </Container>
      </Form>
      {showResults ? (
        <div className="bg-light">
          <hr />
          <Container className="py-3">
            <div className="mb-3 d-flex justify-content-between align-items-center">
              <div className="text-uppercase" style={{ fontSize: "14px", letterSpacing: "1.5px" }}>
                <b>{results.output.length.toLocaleString()}</b> Results Found
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => exportTsv(results.output, "icd_genie_batch_export.tsv")}
              >
                Export CSV
              </Button>
            </div>
            <div className="index border">
              <Grid rows={results.output} columns={results.columns}>
                <SortingState defaultSorting={[{ columnName: "id", direction: "asc" }]} />
                <PagingState defaultCurrentPage={0} defaultPageSize={20} />
                <IntegratedSorting columnExtensions={integratedSortingColumnExtensions} />
                <IntegratedPaging />
                <Table columnExtensions={results.columnExtensions} />
                <TableHeaderRow showSortingControls />
                <PagingPanel pageSizes={[10, 20, 50, 100]} />
              </Grid>
            </div>
          </Container>
        </div>
      ) : (
        <> </>
      )}
    </div>
  );
}
