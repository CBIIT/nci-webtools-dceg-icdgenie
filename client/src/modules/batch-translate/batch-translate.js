import { useRecoilState } from "recoil";
import axios from "axios";
import { Form, Container, Row, Col, Button, OverlayTrigger, Popover, Spinner } from "react-bootstrap";
import { Link } from "react-router-dom";
import { useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleQuestion } from "@fortawesome/free-solid-svg-icons";
import Loader from "../common/loader";
import DirectionToggle from "../translate/direction-toggle";
import { TranslateResult } from "../translate/translation-result";
import { readFileAsText, ExcelFile, ExcelSheet } from "../batch-query/batch-query.utils";
import { formState, resultsState } from "./batch-translate.state";

const SYSTEM_LABEL = { icd10: "ICD-10-CM", icd11: "ICD-11" };

// Build the exploded export rows: one row per OR alternative, source repeated, AND codes joined by
// " & " in the target-code cell (the representation chosen for this feature).
function buildExport(results) {
  const from = results.from;
  const withId = results.id;
  const sourceSystem = SYSTEM_LABEL[from];
  const targetSystem = from === "icd10" ? "ICD-11" : "ICD-10-CM";

  const columns = [
    withId && { title: "Participant ID", width: { wpx: 110 } },
    { title: `${sourceSystem} Code`, width: { wpx: 120 } },
    { title: `${sourceSystem} Description`, width: { wpx: 260 } },
    { title: `${targetSystem} Code`, width: { wpx: 150 } },
    { title: `${targetSystem} Description`, width: { wpx: 300 } },
  ].filter(Boolean);

  const data = [];
  for (const r of results.output) {
    const srcCode = r.source?.code ?? r.input ?? "";
    const srcTitle = r.source?.title ?? "";
    const idCell = withId ? [{ value: r.id ?? "" }] : [];

    if (!r.found || !r.groups || r.groups.length === 0) {
      data.push([...idCell, { value: srcCode }, { value: srcTitle }, { value: "(no translation found)" }, { value: "" }]);
      continue;
    }
    for (const g of r.groups) {
      const tgtCode = g.block || !g.codes.length ? "[block]" : g.codes.join(" & ");
      data.push([...idCell, { value: srcCode }, { value: srcTitle }, { value: tgtCode }, { value: g.title ?? "" }]);
    }
  }
  return [{ columns, data }];
}

export default function BatchTranslate() {
  const [form, setForm] = useRecoilState(formState);
  const [results, setResults] = useRecoilState(resultsState);
  const mergeForm = (obj) => setForm({ ...form, ...obj });
  const [fileError, setFileError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [uploaded, setUploaded] = useState(false);
  const [reading, setReading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const fileRef = useRef();

  function selectDirection(dir) {
    if (dir === form.from) return;
    // Clear the input (and any uploaded file) too: a list entered for one system shouldn't be
    // submitted against the other index after the direction flips.
    mergeForm({ from: dir, input: "" });
    if (fileRef.current) fileRef.current.value = "";
    setUploaded(false);
    setFileError("");
    setShowResults(false);
    setSubmitError("");
  }

  async function handleChange(event) {
    const { type, name, value, files } = event.target;

    if (type === "file") {
      if (!files || !files[0]) return;
      if (!files[0].name.endsWith(".tsv")) {
        setFileError("Please upload a .tsv file");
        return;
      }
      setFileError("");
      setShowResults(false);
      // Clear the previous input immediately so the stale list can't be submitted while the new
      // file is still being read, then show the reading indicator.
      setForm((prev) => ({ ...prev, input: "" }));
      setUploaded(false);
      setReading(true);
      try {
        let fileText = await readFileAsText(files);
        fileText = fileText.split("\n");
        fileText.splice(0, 1); // drop header row
        setForm((prev) => ({ ...prev, input: fileText.join("\n") }));
        setUploaded(true);
      } catch (err) {
        console.error("File read error:", err);
        setFileError("Could not read the file. Please try again.");
      } finally {
        setReading(false);
      }
      return;
    }

    mergeForm({ [name]: value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitError("");
    setResults({ ...results, loading: true });
    try {
      const response = await axios.post("api/batch-translate", {
        input: form.input,
        from: form.from,
        id: form.id,
      });
      setResults({
        loading: false,
        from: response.data.from,
        id: form.id,
        output: response.data.results || [],
      });
      setShowResults(true);
    } catch (error) {
      console.error("Batch translate error:", error);
      setResults({ ...results, loading: false });
      setShowResults(false);
      setSubmitError("An error occurred. Please try again.");
    }
  }

  function handleReset() {
    if (fileRef.current) fileRef.current.value = "";
    setUploaded(false);
    setReading(false);
    setFileError("");
    setSubmitError("");
    setShowResults(false);
    mergeForm({ input: "", from: "icd10", id: false });
    setResults({ loading: false, from: "icd10", id: false, output: [] });
  }

  const placeholder = form.id
    ? "Participant ID<TAB>Code, one per line"
    : form.from === "icd10"
    ? "One ICD-10-CM code per line (Ex. A18.7)"
    : "One ICD-11 code per line (Ex. 1A00)";

  return (
    <div className="d-flex flex-column h-100 bg-white">
      <Container>
        <h1 className="my-3 page-header text-muted text-center text-uppercase">Batch Translate</h1>
      </Container>

      <hr />

      <Form onSubmit={handleSubmit} onReset={handleReset}>
        <Loader show={results.loading} fullscreen />
        <Container className="py-2">
          <Row className="justify-content-center">
            <Col md={8}>
              <Form.Group className="mb-3">
                <Form.Label>Translate a list of codes between ICD-10-CM and ICD-11.</Form.Label>
                <p>
                  Upload a .tsv file or paste a list of codes, one per line. ICD-11 → ICD-10-CM is a
                  one-to-one match; ICD-10-CM → ICD-11 may return a combination of codes. To translate
                  a single code, use <Link to="/translate">Translate</Link>. For code formatting help,
                  see the <Link to="/getting-started">Getting Started</Link> page.
                </p>
              </Form.Group>
            </Col>
          </Row>

          <Row className="justify-content-center">
            <Col md={8}>
              <DirectionToggle value={form.from} onChange={selectDirection} />
            </Col>
          </Row>

          <Row className="justify-content-center">
            <Col md={8}>
              <Form.Group className="mb-3">
                <div className="d-flex">
                  <Form.Check
                    label={<span>Participant ID <i className="text-muted">(Optional)</i></span>}
                    name="id"
                    type="checkbox"
                    id="batchTranslateId"
                    checked={form.id}
                    onChange={() => mergeForm({ id: !form.id })}
                  />
                  <OverlayTrigger
                    trigger="click"
                    placement="right"
                    rootClose
                    overlay={
                      <Popover id="batchTranslateId_tip">
                        <Popover.Header>Participant ID</Popover.Header>
                        <Popover.Body>
                          A "Participant ID" refers to a single, unique identifier pertaining to a
                          single individual ("participant") in a study. When enabled, each input line
                          is "Participant ID &lt;tab&gt; Code".
                        </Popover.Body>
                      </Popover>
                    }
                  >
                    <div>
                      <FontAwesomeIcon icon={faCircleQuestion} className="mx-1" size="sm" style={{ cursor: "pointer" }} />
                    </div>
                  </OverlayTrigger>
                </div>
              </Form.Group>
            </Col>
          </Row>

          <Row className="justify-content-center">
            <Col md={8}>
              <Form.Group className="mb-1">
                <Form.Label htmlFor="batchInput">Please upload a file (.tsv) or enter a list of codes</Form.Label>
                <Row className="mb-2">
                  <Col md={6}>
                    <input
                      type="file"
                      id="batchTranslateFile"
                      name="fileInput"
                      className="form-control"
                      aria-label="Upload a .tsv file of codes"
                      accept=".tsv"
                      ref={fileRef}
                      onChange={handleChange}
                      disabled={reading}
                    />
                    {reading ? (
                      <div className="text-muted mt-1">
                        <Spinner animation="border" size="sm" className="me-2" />
                        Importing file…
                      </div>
                    ) : null}
                    {fileError ? <div style={{ color: "red" }}>{fileError}</div> : null}
                  </Col>
                </Row>
                <Form.Control
                  className="mb-2"
                  as="textarea"
                  id="batchInput"
                  name="input"
                  rows={3}
                  value={form.input}
                  disabled={uploaded || reading}
                  placeholder={reading ? "Importing file…" : placeholder}
                  onChange={handleChange}
                />
                <div className="d-flex justify-content-end gap-2">
                  <Button variant="primary" type="submit" size="sm" disabled={reading || !form.input.trim()}>
                    Translate
                  </Button>
                  <Button variant="outline-danger" type="reset" size="sm">
                    Reset
                  </Button>
                </div>
              </Form.Group>
            </Col>
          </Row>
        </Container>
      </Form>

      {submitError && <div className="text-danger text-center my-2">{submitError}</div>}

      {showResults && (
        <div className="bg-light">
          <hr />
          <Container className="py-3">
            <div className="mb-3 d-flex justify-content-between align-items-center">
              <div className="text-uppercase" style={{ fontSize: "14px", letterSpacing: "1.5px" }}>
                <b>{results.output.length.toLocaleString()}</b> Results Found
              </div>
              <ExcelFile
                filename="icd_genie_batch_translate"
                element={<Button variant="primary" size="sm">Export Results</Button>}
              >
                <ExcelSheet dataSet={buildExport(results)} name="Batch Translate Results" />
              </ExcelFile>
            </div>

            {results.output.map((r, i) => (
              <div key={i} className="mb-2">
                <TranslateResult data={r} idLabel={results.id ? r.id ?? "" : undefined} />
              </div>
            ))}
          </Container>
        </div>
      )}
    </div>
  );
}
