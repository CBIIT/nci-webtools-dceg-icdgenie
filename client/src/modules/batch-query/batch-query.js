import { useRecoilState } from "recoil";
import axios from "axios";
import Loader from "../common/loader";
import { Form, Container, Row, Col, Button, Popover, OverlayTrigger } from "react-bootstrap";
import { Link } from "react-router-dom";
import { formState, resultsState } from "./batch-query.state";
import { readFileAsText, ExcelFile, ExcelSheet } from "./batch-query.utils";
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
  const [submitError, setSubmitError] = useState("")
  const [uploaded, setUploaded] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const fileRef = useRef();

  const [sortColumn, setSorting] = useState([{ columnName: "id", direction: "asc" }])

  function exportResults() {
    return [
      {
        columns: results.columns.map((e) => {
          return { title: e.title, width: { wpx: 120 } }
        }),
        data: results.output.map((e) => {
          return results.columns.map((col) => {
            return { value: e[col.name] }
          })
        })
      }
    ]
  }

  async function handleChange(event) {
    let { type, name, value, files, dataset } = event.target;

    if (type === "file") {

      if (!files || !files[0]) return;

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
        icd10pcsId: false,
        icd11Id: false,
        icdo3Id: false,
        icdo3Site: false,
        icdo3Morph: false,
        icdo4Id: false,
        icdo4Site: false,
        icdo4Morph: false,
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

    setSubmitError("")
    try {
    const response = await axios.post("api/batch", {
      input: form.input,
      inputType: form.inputType,
      id: form.icd10Id || form.icd10pcsId || form.icd11Id || form.icdo3Id || form.icdo4Id,
      icdo3Id: form.icdo3Id,
      icdo3Site: form.icdo3Site,
      icdo3Morph: form.icdo3Morph,
      icdo4Id: form.icdo4Id,
      icdo4Site: form.icdo4Site,
      icdo4Morph: form.icdo4Morph
    });

    setShowResults(true);

    var columns;
    var columnExtensions;

    if (form.inputType === "icd10pcs") {
      // ICD-10-PCS: single code lookup
      if (form.icd10pcsId)
        setSorting([{ columnName: "id", direction: "asc" }])
      else
        setSorting([{ columnName: "code", direction: "asc" }])

      columns = [
        form.icd10pcsId && { name: "id", title: "Participant ID" },
        { name: "code", title: "ICD-10-PCS Code" },
        { name: "description", title: "Description" }
      ].filter(Boolean);

      columnExtensions = [
        form.icd10pcsId && { columnName: "id", width: "10rem" },
        { columnName: "code", width: "15rem" },
        { columnName: "description", wordWrapEnabled: "true" },
      ].filter(Boolean)
    }
    else if (form.inputType === "icd11") {
      // ICD-11: single code lookup
      if (form.icd11Id)
        setSorting([{ columnName: "id", direction: "asc" }])
      else
        setSorting([{ columnName: "code", direction: "asc" }])

      columns = [
        form.icd11Id && { name: "id", title: "Participant ID" },
        { name: "code", title: "ICD-11 Code" },
        { name: "description", title: "Description" }
      ].filter(Boolean);

      columnExtensions = [
        form.icd11Id && { columnName: "id", width: "10rem" },
        { columnName: "code", width: "15rem" },
        { columnName: "description", wordWrapEnabled: "true" },
      ].filter(Boolean)
    }
    else if (form.inputType === "icdo4" && form.icdo4Site !== form.icdo4Morph) {
      // ICD-O-4: single field (morph only or site only)
      if (form.icdo4Id)
        setSorting([{ columnName: "id", direction: "asc" }])
      else
        setSorting([{ columnName: "code", direction: "asc" }])

      columns = [
        form.icdo4Id && { name: "id", title: "Participant ID" },
        form.icdo4Morph && { name: "code", title: "ICD-O-4 Morphology Code" },
        form.icdo4Site && { name: "code", title: "ICD-O-4 Site Code" },
        { name: "description", title: "Description" }
      ].filter(Boolean);

      columnExtensions = [
        form.icdo4Id && { columnName: "id", width: "10rem" },
        { columnName: "code", width: "15rem" },
        { columnName: "description", wordWrapEnabled: "true" },
      ].filter(Boolean)
    }
    else if (form.inputType === "icdo4" && form.icdo4Site && form.icdo4Morph) {
      // ICD-O-4: both morph + site
      if (form.icdo4Id)
        setSorting([{ columnName: "id", direction: "asc" }])
      else
        setSorting([{ columnName: "morphCode", direction: "asc" }])

      columns = [
        form.icdo4Id && { name: "id", title: "Participant ID" },
        { name: "morphCode", title: "Morphology Code" },
        { name: "siteCode", title: "Site Code" },
        { name: "morphology", title: "Morphology Description" },
        { name: "site", title: "Site Description" },
        { name: "indicator", title: "Indicator" }
      ].filter(Boolean);

      columnExtensions = [
        form.icdo4Id && { columnName: "id", width: "9rem" },
        { columnName: "morphCode", width: "12rem" },
        { columnName: "siteCode", width: "10rem" },
        { columnName: "morphology", wordWrapEnabled: "true" },
        { columnName: "site", wordWrapEnabled: "true" },
        { columnName: "indicator", wordWrapEnabled: "true" },
      ].filter(Boolean);
    }
    else if (form.inputType === "icd10" || (form.inputType === "icdo3" && form.icdo3Site !== form.icdo3Morph)) {
      // ICD-10 or ICD-O-3 single field (existing logic)
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
      // ICD-O-3 both morph + site (existing logic)
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

    mergeResults({
      loading: false,
      output: response.data,
      columns: columns,
      columnExtensions: columnExtensions
    });
    } catch (error) {
      console.error("Batch query error:", error)
      mergeResults({ loading: false })
      setShowResults(false)
      setSubmitError("An error occurred. Please try again.")
    }
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
      icd10pcsId: false,
      icd11Id: false,
      icdo3Id: false,
      icdo3Site: false,
      icdo3Morph: false,
      icdo4Id: false,
      icdo4Site: false,
      icdo4Morph: false,
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
                <p>We highly recommend that users review the <Link to="/getting-started">Getting Started</Link> page for information on proper data formatting for optimal use of ICD Genie.</p>

              </Form.Group>
            </Col>
          </Row>
          <Row className="justify-content-center">

            <Col md={4}>
              <Form.Group className="mb-3">
                {/* ICD-10-CM Codes */}
                <div className="d-flex align-items-center gap-2">
                  <Form.Check
                    label="ICD-10-CM Codes"
                    name="inputType"
                    type="radio"
                    id="icd10Input"
                    value="icd10"
                    checked={form.inputType === "icd10"}
                    onChange={handleChange}
                  />
                  <a href={`${process.env.PUBLIC_URL}/files/icdgenie_example_icd10_patient_id.tsv`} className="small">(download sample)</a>
                </div>

                <div className="ms-5">
                  <div className="d-flex">
                    <Form.Check
                      label={<span>Participant ID <i className="text-muted">(Optional)</i></span>}
                      name="icd10Id"
                      type="checkbox"
                      id="icd10Id"
                      value="icd10Id"
                      checked={form.icd10Id}
                      disabled={form.inputType !== "icd10"}
                      aria-disabled={form.inputType !== "icd10"}
                      onClick={() => mergeForm({ "icd10Id": !form.icd10Id })}
                    />
                    <OverlayTrigger trigger="click" placement="right" rootClose
                      overlay={<Popover id="icd10Id_tip">
                        <Popover.Header>Participant ID</Popover.Header>
                        <Popover.Body>
                          A "Participant ID" refers to a single, unique identifier pertaining to a single individual ("participant")
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
                      aria-disabled={true}
                      checked={form.inputType === "icd10"}
                    />
                    <OverlayTrigger trigger="click" placement="right" rootClose
                      overlay={<Popover id="icd10_tip">
                        <Popover.Header>ICD-10-CM Codes</Popover.Header>
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

                {/* ICD-10-PCS Codes */}
                <div className="d-flex align-items-center gap-2 mt-3">
                  <Form.Check
                    label="ICD-10-PCS Codes"
                    name="inputType"
                    type="radio"
                    id="icd10pcsInput"
                    value="icd10pcs"
                    checked={form.inputType === "icd10pcs"}
                    onChange={handleChange}
                  />
                  <a href={`${process.env.PUBLIC_URL}/files/icdgenie_example_icd10pcs.tsv`} className="small">(download sample)</a>
                </div>

                <div className="ms-5">
                  <div className="d-flex">
                    <Form.Check
                      label={<span>Participant ID <i className="text-muted">(Optional)</i></span>}
                      name="icd10pcsId"
                      type="checkbox"
                      id="icd10pcsId"
                      value="icd10pcsId"
                      checked={form.icd10pcsId}
                      disabled={form.inputType !== "icd10pcs"}
                      aria-disabled={form.inputType !== "icd10pcs"}
                      onClick={() => mergeForm({ "icd10pcsId": !form.icd10pcsId })}
                    />
                    <OverlayTrigger trigger="click" placement="right" rootClose
                      overlay={<Popover id="icd10pcsId_tip">
                        <Popover.Header>Participant ID</Popover.Header>
                        <Popover.Body>
                          A "Participant ID" refers to a single, unique identifier pertaining to a single individual ("participant")
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
                      name="icd10pcsCode"
                      type="checkbox"
                      id="icd10pcsCode"
                      value="icd10pcsCode"
                      disabled={true}
                      aria-disabled={true}
                      checked={form.inputType === "icd10pcs"}
                    />
                    <OverlayTrigger trigger="click" placement="right" rootClose
                      overlay={<Popover id="icd10pcs_tip">
                        <Popover.Header>ICD-10-PCS Codes</Popover.Header>
                        <Popover.Body>
                          <p><i>The International Classification of Diseases, Tenth Revision, Procedure Coding System (ICD-10-PCS) is a system created by the Centers for Medicare &amp; Medicaid Services (CMS) to categorize inpatient hospital procedures.</i></p>
                          <div><b>Example Code:</b> 0DBJ0ZZ <i>(Translation: Excision of Appendix, Open Approach)</i></div>
                          <ul>
                            <li>Alphanumeric, no decimals</li>
                            <li>Always exactly 7 characters</li>
                            <li>Uses digits 0–9 and letters, but never the letters "O" or "I" (to avoid confusion with 0 and 1)</li>
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

                {/* ICD-11 Codes */}
                <div className="d-flex align-items-center gap-2 mt-3">
                  <Form.Check
                    label="ICD-11 Codes"
                    name="inputType"
                    type="radio"
                    id="icd11Input"
                    value="icd11"
                    checked={form.inputType === "icd11"}
                    onChange={handleChange}
                  />
                  <a href={`${process.env.PUBLIC_URL}/files/icdgenie_example_icd11.tsv`} className="small">(download sample)</a>
                </div>

                <div className="ms-5">
                  <div className="d-flex">
                    <Form.Check
                      label={<span>Participant ID <i className="text-muted">(Optional)</i></span>}
                      name="icd11Id"
                      type="checkbox"
                      id="icd11Id"
                      value="icd11Id"
                      checked={form.icd11Id}
                      disabled={form.inputType !== "icd11"}
                      aria-disabled={form.inputType !== "icd11"}
                      onClick={() => mergeForm({ "icd11Id": !form.icd11Id })}
                    />
                    <OverlayTrigger trigger="click" placement="right" rootClose
                      overlay={<Popover id="icd11Id_tip">
                        <Popover.Header>Participant ID</Popover.Header>
                        <Popover.Body>
                          A "Participant ID" refers to a single, unique identifier pertaining to a single individual ("participant")
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
                      name="icd11Code"
                      type="checkbox"
                      id="icd11Code"
                      value="icd11Code"
                      disabled={true}
                      aria-disabled={true}
                      checked={form.inputType === "icd11"}
                    />
                    <OverlayTrigger trigger="click" placement="right" rootClose
                      overlay={<Popover id="icd11_tip">
                        <Popover.Header>ICD-11 Codes</Popover.Header>
                        <Popover.Body>
                          <p><i>The International Classification of Diseases, 11th Revision (ICD-11) is the latest system created by the World Health Organization to categorize all diagnoses, symptoms, and procedures.</i></p>
                          <div><b>Example Code:</b> 1B70.0Y <i>(Translation: Erysipelas of other specified site)</i></div>
                          <ul>
                            <li>Alphanumeric, may contain a period (".")</li>
                            <li>The first character (the chapter) is a number or a letter</li>
                            <li>The second character is always a letter (this distinguishes ICD-11 from ICD-10)</li>
                            <li>May end in "Y" (other specified) or "Z" (unspecified)</li>
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

            <Col md={4}>
              <Form.Group className="mb-3">
                {/* ICD-O-3 Codes */}
                <div className="d-flex align-items-center gap-2">
                  <Form.Check
                    label="ICD-O-3 Codes"
                    name="inputType"
                    type="radio"
                    id="icdo3Input"
                    value="icdo3"
                    checked={form.inputType === "icdo3"}
                    onChange={handleChange}
                  />
                  <a href={`${process.env.PUBLIC_URL}/files/icdgenie_example_icdo3_morphology_site.tsv`} className="small">(download sample)</a>
                </div>
                <i>At a minimum : ICD-O-3 site code or ICD-O-3 morphology code must be selected</i>

                <div className="ms-5">
                  <div className="d-flex">
                    <Form.Check
                      label={
                        <span style={{ color: '#4A4A4A', fontWeight: 'normal' }}>
                          Participant ID <i style={{ color: '#4A4A4A', fontWeight: 'normal' }}>(Optional)</i>
                        </span>
                      }
                      name="icdo3Id"
                      type="checkbox"
                      id="icdo3Id"
                      value="icdo3Id"
                      checked={form.icdo3Id}
                      disabled={form.inputType !== "icdo3"}
                      aria-disabled={form.inputType !== "icdo3"}
                      onClick={() => mergeForm({ "icdo3Id": !form.icdo3Id })}
                    />
                    <OverlayTrigger trigger="click" placement="left" rootClose
                      overlay={<Popover id="icdo3ID_tip">
                        <Popover.Header>Participant ID</Popover.Header>
                        <Popover.Body>
                          A "Participant ID" refers to a single, unique identifier pertaining to a single individual ("participant")
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
                      disabled={form.inputType !== "icdo3"}
                      aria-disabled={form.inputType !== "icdo3"}
                      onClick={() => mergeForm({ "icdo3Morph": !form.icdo3Morph })}
                    />
                    <OverlayTrigger trigger="click" placement="left" rootClose
                      overlay={<Popover id="icdo3Morph_tip">
                        <Popover.Header>ICD-O-3 Morphology Code</Popover.Header>
                        <Popover.Body>
                          <p><i>The International Classification of Diseases for Oncology, Third Edition (ICD-O-3) is a system created by the World Health Organization to categorize cancer diagnoses.</i></p>
                          <p><i>The morphology code captures the type of cell the tumor is composed of and the characteristic of the tumor itself. This may be referred to as "histology" or "histological term" in your data.</i></p>
                          <div><b>Example Morphology Code:</b> 9140/3 <i>(Translation : Kaposi's Sarcoma)</i></div>
                          <ul>
                            <li>Entirely Numeric</li>
                            <li>Must have a forward slash after the fourth number (i.e., "/")</li>
                            <li>Number after the slash is the behavior code – either "1", "2," or "3." Behavior codes "6" and "9" are not supported at this time.</li>
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
                      disabled={form.inputType !== "icdo3"}
                      aria-disabled={form.inputType !== "icdo3"}
                      onClick={() => mergeForm({ "icdo3Site": !form.icdo3Site })}
                    />
                    <OverlayTrigger trigger="click" placement="left" rootClose
                      overlay={<Popover id="icdo3Site_tip">
                        <Popover.Header>ICD-O-3 Site code</Popover.Header>
                        <Popover.Body>
                          <p><i>The International Classification of Diseases for Oncology, Third Edition (ICD-O-3) is a system created by the World Health Organization to categorize cancer diagnoses.</i></p>
                          <p><i>The site code indicates where a neoplasm was found. "Site code" in your data may be "topography" or "topographical information".</i></p>
                          <div><b>Example Site Code: </b>C71.9</div>
                          <ul>
                            <li>Alphanumeric; begins with "C" followed by 2 numbers, a period, and at least one more number</li>
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

                {/* ICD-O-4 Codes */}
                <div className="d-flex align-items-center gap-2 mt-3">
                  <Form.Check
                    label="ICD-O-4 Codes"
                    name="inputType"
                    type="radio"
                    id="icdo4Input"
                    value="icdo4"
                    checked={form.inputType === "icdo4"}
                    onChange={handleChange}
                  />
                  <a href={`${process.env.PUBLIC_URL}/files/icdgenie_example_icdo4.tsv`} className="small">(download sample)</a>
                </div>
                <i>At a minimum : ICD-O-4 site code or ICD-O-4 morphology code must be selected</i>

                <div className="ms-5">
                  <div className="d-flex">
                    <Form.Check
                      label={
                        <span style={{ color: '#4A4A4A', fontWeight: 'normal' }}>
                          Participant ID <i style={{ color: '#4A4A4A', fontWeight: 'normal' }}>(Optional)</i>
                        </span>
                      }
                      name="icdo4Id"
                      type="checkbox"
                      id="icdo4Id"
                      value="icdo4Id"
                      checked={form.icdo4Id}
                      disabled={form.inputType !== "icdo4"}
                      aria-disabled={form.inputType !== "icdo4"}
                      onClick={() => mergeForm({ "icdo4Id": !form.icdo4Id })}
                    />
                    <OverlayTrigger trigger="click" placement="left" rootClose
                      overlay={<Popover id="icdo4Id_tip">
                        <Popover.Header>Participant ID</Popover.Header>
                        <Popover.Body>
                          A "Participant ID" refers to a single, unique identifier pertaining to a single individual ("participant")
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
                      name="icdo4Morph"
                      type="checkbox"
                      id="icdo4Morph"
                      value="icdo4Morph"
                      checked={form.icdo4Morph}
                      disabled={form.inputType !== "icdo4"}
                      aria-disabled={form.inputType !== "icdo4"}
                      onClick={() => mergeForm({ "icdo4Morph": !form.icdo4Morph })}
                    />
                    <OverlayTrigger trigger="click" placement="left" rootClose
                      overlay={<Popover id="icdo4Morph_tip">
                        <Popover.Header>ICD-O-4 Morphology Code</Popover.Header>
                        <Popover.Body>
                          <p><i>The International Classification of Diseases for Oncology, Fourth Edition (ICD-O-4) is the latest system created by the World Health Organization to categorize cancer diagnoses.</i></p>
                          <p><i>The morphology code captures the type of cell the tumor is composed of and the characteristic of the tumor itself. This may be referred to as "histology" or "histological term" in your data.</i></p>
                          <div><b>Example Morphology Code:</b> 80000/3 <i>(Translation: Neoplasm, malignant, NOS)</i></div>
                          <ul>
                            <li>Entirely Numeric</li>
                            <li>5 digits before the forward slash (vs. 4 digits in ICD-O-3)</li>
                            <li>Must have a forward slash after the fifth number (i.e., "/")</li>
                            <li>Number after the slash is the behavior code: 0 (benign), 1 (uncertain), 2 (in situ), 3 (malignant), 6 (metastatic), or 9 (malignant, uncertain)</li>
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
                      name="icdo4Site"
                      type="checkbox"
                      id="icdo4Site"
                      value="icdo4Site"
                      checked={form.icdo4Site}
                      disabled={form.inputType !== "icdo4"}
                      aria-disabled={form.inputType !== "icdo4"}
                      onClick={() => mergeForm({ "icdo4Site": !form.icdo4Site })}
                    />
                    <OverlayTrigger trigger="click" placement="left" rootClose
                      overlay={<Popover id="icdo4Site_tip">
                        <Popover.Header>ICD-O-4 Site Code</Popover.Header>
                        <Popover.Body>
                          <p><i>The International Classification of Diseases for Oncology, Fourth Edition (ICD-O-4) is the latest system created by the World Health Organization to categorize cancer diagnoses.</i></p>
                          <p><i>The site code indicates where a neoplasm was found. "Site code" in your data may be "topography" or "topographical information".</i></p>
                          <div><b>Example Site Code: </b>C71.9</div>
                          <ul>
                            <li>Alphanumeric; begins with "C" followed by 2 numbers, a period, and at least one more number</li>
                            <li>Uses the same C00–C80 range as ICD-O-3</li>
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
          </Row>

          <Row className="justify-content-center">
            <Col md={8}>
              <Form.Group className="mb-1">
                <Form.Label htmlFor="codeInput">
                  Please upload a file (.tsv) or enter a list of codes
                </Form.Label>
                <Row className="mb-2">
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
                  </Col>
                </Row>
                <Form.Control
                  className="mb-2"
                  as="textarea"
                  id="codeInput"
                  name="input"
                  rows={2}
                  value={form.input}
                  disabled={uploaded}
                  placeholder="ICD-10-CM Codes (Ex. C16.1), ICD-O-3 Codes (Ex. 8144/2), ICD-10-PCS Codes (Ex. 4A0Z76Z), ICD-11 Codes (Ex. 1B70.0Y), ICD-O-4 Codes (Ex. 80000/3)"
                  onChange={handleChange}
                />
                <div className="d-flex justify-content-end gap-2">
                  <Button
                    variant="primary"
                    type="submit"
                    size="sm"
                    disabled={!form.input || (form.inputType === "icdo3" && (!form.icdo3Site && !form.icdo3Morph)) || (form.inputType === "icdo4" && (!form.icdo4Site && !form.icdo4Morph))}
                  >
                    Submit
                  </Button>
                  <Button
                    variant="outline-danger"
                    type="reset"
                    size="sm"
                  >
                    Reset
                  </Button>
                </div>
              </Form.Group>
            </Col>
          </Row>
        </Container>
      </Form>
      {submitError && <div className="text-danger text-center my-2">{submitError}</div>}
      {
        showResults ? (
          <div className="bg-light">
            <hr />
            <Container className="py-3">
              <div className="mb-3 d-flex justify-content-between align-items-center">
                <div className="text-uppercase" style={{ fontSize: "14px", letterSpacing: "1.5px" }}>
                  <b>{results.output.length.toLocaleString()}</b> Results Found
                </div>
                <Row className="align-items-center">
                  <Col xl={10} className="me-0 pe-0">
                  <ExcelFile
                    filename={`icd_genie_batch_export`}
                    className="pe-0"
                    element={<Button variant="primary" size="sm">Export Results</Button>}>
                    <ExcelSheet dataSet={exportResults()} name="Batch Query Results" />
                  </ExcelFile>
                  </Col>
                  <Col xl={2} className="ps-0">
                  <OverlayTrigger trigger="click" placement="top" rootClose
                    overlay={<Popover id="icd10Id_tip">
                      <Popover.Header>Participant ID</Popover.Header>
                      <Popover.Body>
                        <p>To rename and set the save location of the export file you must have the following settings enabled for your browser. If you do not have these settings on the file will be saved with a generic name to your default download folder.</p>
                        <div>Chrome:</div>
                        <p>Settings -{">"} Downloads -{">"} Enable "Ask me what to do with each download"</p>
                        <div>Firefox:</div>
                        <p>Settings -{">"} Search for Download section -{">"} Check "Always ask you where to save files"</p>
                        <div>Edge:</div>
                        <p>Settings -{">"} Downloads -{">"} Enable "Ask me what to do with each download"</p>
                      </Popover.Body>
                    </Popover>
                    }>
                    <div>
                      <FontAwesomeIcon icon={faCircleQuestion} className="mx-1" size="sm" style={{ cursor: "pointer" }} />
                    </div>
                  </OverlayTrigger>
                  </Col>
                </Row>
              </div>
              <div className="d-flex index border">
                <BatchTable results={results} sorting={sortColumn} />
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
