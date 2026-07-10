import { useRecoilState } from "recoil";
import axios from "axios";
import { Form, Container, Row, Col, Button, ButtonGroup, Card, Badge } from "react-bootstrap";
import { Link } from "react-router-dom";
import Loader from "../common/loader";
import { formState, resultsState } from "./translate.state";
import { useState } from "react";

export default function Translate() {
  const [form, setForm] = useRecoilState(formState);
  const [results, setResults] = useRecoilState(resultsState);
  const mergeForm = (obj) => setForm({ ...form, ...obj });
  const [submitError, setSubmitError] = useState("");

  function selectDirection(dir) {
    if (dir === form.from) return;
    setForm({ ...form, from: dir });
    setResults({ loading: false, data: null });
    setSubmitError("");
  }

  const directionLabel =
    form.from === "icd10" ? "ICD-10-CM → ICD-11" : "ICD-11 → ICD-10-CM";

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitError("");
    setResults({ loading: true, data: null });
    try {
      const response = await axios.post("api/translate", {
        code: form.code,
        from: form.from,
      });
      setResults({ loading: false, data: response.data });
    } catch (error) {
      console.error("Translate error:", error);
      setResults({ loading: false, data: null });
      setSubmitError("An error occurred. Please try again.");
    }
  }

  function handleReset() {
    setSubmitError("");
    setResults({ loading: false, data: null });
    mergeForm({ code: "", from: "icd10" });
  }

  const data = results.data;

  return (
    <div className="d-flex flex-column h-100 bg-white">
      <Container>
        <h1 className="my-3 page-header text-muted text-center text-uppercase">Translate</h1>
      </Container>

      <hr />

      <Form onSubmit={handleSubmit} onReset={handleReset}>
        <Loader show={results.loading} fullscreen />
        <Container className="py-2">
          <Row className="justify-content-center">
            <Col md={8}>
              <Form.Group className="mb-3">
                <Form.Label>Translate a single code between ICD-10-CM and ICD-11.</Form.Label>
                <p>
                  ICD-11 → ICD-10-CM is a one-to-one match. ICD-10-CM → ICD-11 can map to a
                  combination of codes, shown below with <b>AND</b> / <b>OR</b> logic. For code
                  formatting help, see the <Link to="/getting-started">Getting Started</Link> page.
                </p>
              </Form.Group>
            </Col>
          </Row>

          <Row className="justify-content-center">
            <Col md={8}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold d-block">Direction</Form.Label>
                <ButtonGroup className="w-100" size="lg">
                  <Button
                    type="button"
                    variant={form.from === "icd10" ? "primary" : "outline-primary"}
                    active={form.from === "icd10"}
                    onClick={() => selectDirection("icd10")}
                  >
                    ICD-10-CM → ICD-11
                  </Button>
                  <Button
                    type="button"
                    variant={form.from === "icd11" ? "primary" : "outline-primary"}
                    active={form.from === "icd11"}
                    onClick={() => selectDirection("icd11")}
                  >
                    ICD-11 → ICD-10-CM
                  </Button>
                </ButtonGroup>
              </Form.Group>
            </Col>
          </Row>

          <Row className="justify-content-center">
            <Col md={8}>
              <Form.Group className="mb-1">
                <Form.Label htmlFor="codeInput">
                  Enter a {form.from === "icd10" ? "ICD-10-CM" : "ICD-11"} code
                </Form.Label>
                <Form.Control
                  className="mb-2"
                  id="codeInput"
                  name="code"
                  value={form.code}
                  placeholder={form.from === "icd10" ? "Ex. A18.7" : "Ex. 1A00"}
                  onChange={(e) => mergeForm({ code: e.target.value })}
                />
                <div className="d-flex justify-content-end gap-2">
                  <Button variant="primary" type="submit" size="sm" disabled={!form.code.trim()}>
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

      {data && (
        <div className="bg-light">
          <hr />
          <Container className="py-3">
            <h3
              className="text-uppercase fw-bold text-center mb-3"
              style={{ letterSpacing: "1.5px" }}
            >
              {directionLabel}
            </h3>

            {data.found ? (
              <Row className="justify-content-center">
                <Col md={10}>
                  <TranslateResult data={data} />
                </Col>
              </Row>
            ) : (
              <Row className="justify-content-center">
                <Col md={10}>
                  <div className="alert alert-warning mb-0">
                    {data.message || "No translation found."}
                  </div>
                </Col>
              </Row>
            )}
          </Container>
        </div>
      )}
    </div>
  );
}

// One translation entry laid out left-to-right: source on the left, translation on the right.
// Structured as a single row so a future Batch Translation view can stack one row per input code.
function TranslateResult({ data }) {
  const { source, targetSystem, groups } = data;
  return (
    <Row className="border rounded bg-white mx-0 py-3">
      {/* Source — left */}
      <Col md={4} className="border-end pe-md-3 mb-3 mb-md-0">
        <div className="small text-muted text-uppercase mb-1">Source ({source.system})</div>
        <div className="fw-bold">{source.code}</div>
        {source.title ? <div>{source.title}</div> : null}
      </Col>

      {/* Translation — right */}
      <Col md={8} className="ps-md-3">
        <div className="small text-muted text-uppercase mb-2">Translation ({targetSystem})</div>
        <TranslationGroups groups={groups} targetSystem={targetSystem} />
      </Col>
    </Row>
  );
}

// The OR/AND combination stack for one source code's translation. OR alternatives are separated by
// an OR badge; AND codes within a group are joined by an AND badge; a blank-code target renders as a
// "block" chip.
function TranslationGroups({ groups, targetSystem }) {
  if (groups.length === 0) {
    return <div className="alert alert-warning mb-0">No mapped codes.</div>;
  }
  return groups.map((group, i) => (
    <div key={i}>
      {i > 0 && (
        <div className="text-center my-2">
          <Badge bg="primary" className="text-white">OR</Badge>
        </div>
      )}
      <Card>
        <Card.Body className="py-2">
          {group.block || group.codes.length === 0 ? (
            <div>
              <Badge bg="info" className="me-2 text-dark">
                block
              </Badge>
              Maps to {targetSystem} block: <span className="fw-bold">{group.title}</span>
            </div>
          ) : (
            <>
              <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
                {group.codes.map((code, j) => (
                  <span key={j} className="d-inline-flex align-items-center gap-2">
                    {j > 0 && <Badge bg="dark" className="text-white">AND</Badge>}
                    <span className="fw-bold">{code}</span>
                  </span>
                ))}
              </div>
              <div>{group.title}</div>
            </>
          )}
        </Card.Body>
      </Card>
    </div>
  ));
}
