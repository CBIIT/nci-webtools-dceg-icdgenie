import { useRecoilState } from "recoil";
import axios from "axios";
import Loader from "../common/loader";
import { Form, Container, Row, Col, Button, Popover, OverlayTrigger } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { formState, resultsState } from "./batch-query.state";
import { readFileAsText, exportTsv, ExcelFile, ExcelSheet } from "./batch-query.utils";
import { useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleQuestion } from "@fortawesome/free-solid-svg-icons";

import BatchTable from "../../components/batch-table";

export default function BatchQuery() {
  const [form, setForm] = useRecoilState(formState);
  const [results, setResults] = useRecoilState(resultsState);
  const mergeForm = (obj) => setForm({ ...form, ...obj });
  const mergeResults = (obj) => setResults({ ...results, ...obj });
  const [fileError, setFileError] = useState("")
  const [uploaded, setUploaded] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const fileRef = useRef();

  const navigate = useNavigate();

  const [sortColumn, setSorting] = useState([{ columnName: "id", direction: "asc" }])

  function exportResults() {
    return [
      {
        columns: results.columns.map((e) => {
          return { title: e.title, width: { wpx: 120 } }
        }),
        data: results.output.map((e) => {
          const values = Object.values(e);
          return values.map((f) => {
            return { value: f }
          })
        })
      }
    ]
  }

  async function handleChange(event) {
    let { type, name, value, files, dataset } = event.target;

    if (type === "file") {

      mergeForm({ input: "" })

      if (files[0].name.endsWith(".tsv")) {
        setFileError("")
        setUploaded(true)
        setShowResults(false)

        var fileText = await readFileAsText(files);
        fileText = fileText.split("\n")
        fileText.splice(0, 1)
        value = fileText.join("\n")
      }
      else {
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
      id: form.icd10Id || form.icdo3Id,
      icdo3Id: form.icdo3Id,
      icdo3Site: form.icdo3Site,
      icdo3Morph: form.icdo3Morph
    });

    setShowResults(true);

    var columns;
    var columnExtensions;
    console.log(form)
    if (form.inputType === "icd10" || (form.icdo3Site !== form.icdo3Morph)) {

      if (form.icd10Id || form.icdo3Id)
        setSorting([{ columnName: "id", direction: "asc" }])
      else
        setSorting([{ columnName: "code", direction: "asc" }])

      columns = [
        (form.icd10Id || form.icdo3Id) && { name: "id", title: "Participant ID" },
        form.inputType === "icd10" && { name: "code", title: "ICD-10 Code" },
        form.icdo3Site && { name: "code", title: "ICD-O-3 Site Code" },
        form.icdo3Morph && { name: "code", title: "ICD-O-3 Morphology Code" },
        { name: "description", title: "Description" }
      ].filter(Boolean);

      columnExtensions = [
        (form.icd10Id || form.icdo3Id) && { columnName: "id", width: "10rem" },
        { columnName: "code", width: "15rem" },
        { columnName: "description", wordWrapEnabled: "true" },
      ].filter(Boolean)
    }
    else {

      if (!form.icdo3Id)
        setSorting([{ columnName: "morphCode", direction: "asc" }])
      else
        setSorting([{ columnName: "id", direction: "asc" }])

      columns = [
        form.icdo3Id && { name: "id", title: "Participant ID" },
        { name: "morphCode", title: "Morphology Code" },
        { name: "siteCode", title: "Site Code" },
        { name: "morphology", title: "Morphology Description" },
        { name: "site", title: "Site Description" },
        { name: "indicator", title: "Indicator" }
      ].filter(Boolean);

      columnExtensions = [
        form.icdo3Id && { columnName: "id", width: "9rem" },
        { columnName: "morphCode", width: "12rem" },
        { columnName: "siteCode", width: "10rem" },
        { columnName: "morphology", wordWrapEnabled: "true" },
        { columnName: "site", wordWrapEnabled: "true" },
        { columnName: "indicator", wordWrapEnabled: "true" },
      ].filter(Boolean);
    }

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

  async function handleReset() {

    if (fileRef.current)
      fileRef.current.files = null;

    setShowResults(false)
    setUploaded(false)
    setFileError("")

    mergeForm({
      input: "",
      inputType: "icd10",
      icd10Id: false,
      icdo3Site: false,
      icdo3Morph: false,
    })

    mergeResults({
      output: [],
      columns: [],
      columnExtensions: [],
    })
  }

  return (
    <div className="d-flex flex-column h-100 bg-white">
      <Container>
        <h1 className="my-3 page-header text-muted text-center text-uppercase">Batch Query</h1>
      </Container>

      <hr />

      <Form onSubmit={handleSubmit} onReset={handleReset}>
        <Loader show={results.loading} fullscreen />
        <Container className="py-2">
          <Row className="justify-content-center">
            <Col md={8}>
              <Form.Group>
                <Form.Label>Select searchable type</Form.Label>
                <p>We highly recommend that users review the <a href="javascript:void(0)"
                  onClick={() => {
                    navigate("/getting-started");
                  }}
                >
                  Getting Started
                </a> page for information on proper data formatting for optimal use of ICD Genie.</p>

              </Form.Group>
            </Col>
          </Row>
          <Row className="justify-content-center">

            <Col md={6}>
              <Form.Group className="mb-3">
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
                  <div className="d-flex">
                    <Form.Check
                      label={<label>Particpant ID <i className="text-muted">(Optional)</i></label>}
                      name="icd10Id"
                      type="checkbox"
                      id="icd10Id"
                      value="icd10Id"
                      checked={form.icd10Id}
                      disabled={form.inputType === "icdo3"}
                      onClick={() => mergeForm({ ["icd10Id"]: !form.icd10Id })}
                    />
                    <OverlayTrigger trigger="click" placement="right" rootClose
                      overlay={<Popover id="icd10Id_tip">
                        <Popover.Header>Participant ID</Popover.Header>
                        <Popover.Body>
                          A “Participant ID” refers to a single, unique identifier pertaining to a single individual (“participant”)
                          in a study
                        </Popover.Body>
                      </Popover>
                      }>
                      <div>
                        <FontAwesomeIcon icon={faCircleQuestion} className="mx-1" size="sm" style={{ cursor: "pointer" }} />
                      </div>
                    </OverlayTrigger>
                  </div>
                  <div className="d-flex">
                    <Form.Check
                      label="Code"
                      name="icd10Code"
                      type="checkbox"
                      id="icd10CCode"
                      value="icd10Code"
                      disabled={true}
                      checked={form.inputType === "icd10"}
                    />
                    <OverlayTrigger trigger="click" placement="right" rootClose
                      overlay={<Popover id="icd10_tip">
                        <Popover.Header>ICD-10 Codes</Popover.Header>
                        <Popover.Body>
                          <p><i>The International Classification of Diseases, Tenth Revision (ICD-10) is a system created by the World Health Organization to categorize all diagnoses, symptoms, and procedures. </i></p>
                          <div><b>Example Code:</b> W56.29 <i>(Translation: Accidental Contact with an Orca)</i></div>
                          <ul>
                            <li>Alphanumeric</li>
                            <li>Can be up to 6 characters (7-character codes are not currently supported)</li>
                            <li>First character is always a letter (except "U")</li>
                            <li>Second and third characters are always a number</li>
                            <li>Characters 4 through 6: either a number or letter</li>
                          </ul>
                        </Popover.Body>
                      </Popover>
                      }>
                      <div>
                        <FontAwesomeIcon icon={faCircleQuestion} className="mx-1" size="sm" style={{ cursor: "pointer" }} />
                      </div>
                    </OverlayTrigger>
                  </div>
                </div>

                <Form.Check
                  label="ICD-O-3 Codes"
                  name="inputType"
                  type="radio"
                  id="icdo3Input"
                  value="icdo3"
                  checked={form.inputType === "icdo3"}
                  onChange={handleChange}
                />
                <i>At a minimum : ICD-O-3 site code or ICD-O-3 morphology code must be selected</i>

                <div className="ms-5">
                  <div className="d-flex">
                    <Form.Check
                      label={<label>Particpant ID <i className="text-muted">(Optional)</i></label>}
                      name="icdo3Id"
                      type="checkbox"
                      id="icdo3Id"
                      value="icdo3Id"
                      checked={form.icdo3Id}
                      disabled={form.inputType === "icd10"}
                      onClick={() => mergeForm({ ["icdo3Id"]: !form.icdo3Id })}
                    />
                    <OverlayTrigger trigger="click" placement="right" rootClose
                      overlay={<Popover id="icdo3ID_tip">
                        <Popover.Header>Participant ID</Popover.Header>
                        <Popover.Body>
                          A “Participant ID” refers to a single, unique identifier pertaining to a single individual (“participant”)
                          in a study
                        </Popover.Body>
                      </Popover>
                      }>
                      <div>
                        <FontAwesomeIcon icon={faCircleQuestion} className="mx-1" size="sm" style={{ cursor: "pointer" }} />
                      </div>
                    </OverlayTrigger>
                  </div>

                  <div className="d-flex">
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
                     <OverlayTrigger trigger="click" placement="right" rootClose
                      overlay={<Popover id="icdo3Morph_tip">
                        <Popover.Header>ICD-O-3 Morphology Code</Popover.Header>
                        <Popover.Body>
                          <p><i>The International Classification of Diseases for Oncology, Third Edition (ICD-O-3) is a system created by the World Health Organization to categorize cancer diagnoses.</i></p>
                          <p><i>The morphology code captures the type of cell the tumor is composed of and the characteristic of the tumor itself. This may be referred to as “histology” or “histological term” in your data.</i></p>
                          <div><b>Example Morphology Code:</b> 9140/3 <i>(Translation : Kaposi’s Sarcoma)</i></div>
                          <ul>
                            <li>Entirely Numeric</li>
                            <li>Must have a forward slash after the fourth number (i.e., "/")</li>
                            <li>Number after the slash is the behavior code – either “1”, “2,” or “3.” Behavior codes “6” and “9” are not supported at this time.</li>
                          </ul>
                        </Popover.Body>
                      </Popover>
                      }>
                      <div>
                        <FontAwesomeIcon icon={faCircleQuestion} className="mx-1" size="sm" style={{ cursor: "pointer" }} />
                      </div>
                    </OverlayTrigger>
                  </div>
                  <div className="d-flex">
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
                    <OverlayTrigger trigger="click" placement="right" rootClose
                      overlay={<Popover id="icdo3Site_tip">
                        <Popover.Header>ICD-O-3 Site code</Popover.Header>
                        <Popover.Body>
                          <p><i>The International Classification of Diseases for Oncology, Third Edition (ICD-O-3) is a system created by the World Health Organization to categorize cancer diagnoses.</i></p>
                          <p><i>The site code indicates where a neoplasm was found. “Site code” in your data may be “topography” or “topographical information”.</i></p>
                          <div><b>Example Site Code: </b>C71.9</div>
                          <ul>
                            <li>Alphanumeric; begins with “C” followed by 2 numbers, a period, and at least one more number</li>
                          </ul>
                        </Popover.Body>
                      </Popover>
                      }>
                      <div>
                        <FontAwesomeIcon icon={faCircleQuestion} className="mx-1" size="sm" style={{ cursor: "pointer" }} />
                      </div>
                    </OverlayTrigger>
                  </div>
                </div>
              </Form.Group>
            </Col>
            <Col md={2}>
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
                      ref={fileRef}
                      onChange={handleChange}
                    />
                    {fileError ? <div style={{ color: "red" }}>{fileError}</div> : <></>}

                    <div className="d-flex justify-content-between">
                      <a href={`${process.env.PUBLIC_URL}/files/icdgenie_example_icd10_patient_id.tsv`}>
                        Download ICD-10 Sample
                      </a>

                      <a href={`${process.env.PUBLIC_URL}/files/icdgenie_example_icdo3_morphology_site.tsv`}>
                        Download ICD-O-3 Sample
                      </a>
                    </div>
                  </Col>
                  <Col xs={2} xl={1}>
                    <Button
                      className="mt-1"
                      variant="primary"
                      type="submit"
                      size="sm"
                      disabled={!form.input || (form.inputType === "icdo3" && (!form.icdo3Site && !form.icdo3Morph))}
                    >
                      Submit
                    </Button>
                  </Col>
                  <Col xs={2} xl={1}>
                    <Button
                      className="mt-1"
                      variant="outline-danger"
                      type="reset"
                      size="sm"
                    >
                      Reset
                    </Button>
                  </Col>
                </Row>
              </Form.Group>
            </Col>
          </Row>
        </Container>
      </Form>
      {
        showResults ? (
          <div className="bg-light">
            <hr />
            <Container className="py-3">
              <div className="mb-3 d-flex justify-content-between align-items-center">
                <div className="text-uppercase" style={{ fontSize: "14px", letterSpacing: "1.5px" }}>
                  <b>{results.output.length.toLocaleString()}</b> Results Found
                </div>
                <ExcelFile
                  filename={`icd_genie_batch_export`}
                  element={<Button variant="primary" size="sm">Export Results</Button>}>
                  <ExcelSheet dataSet={exportResults()} name="Batch Query Results" />
                </ExcelFile>
              </div>
              <div className="d-flex index border">
                <BatchTable results={results} sorting={sortColumn}/>
              </div>
            </Container>
          </div>
        ) : (
          <> </>
        )
      }
    </div >
  );
}
