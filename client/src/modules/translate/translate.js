import { useRecoilState } from "recoil";
import axios from "axios";
import { Form, Container, Row, Col, Button, Card, Badge } from "react-bootstrap";
import { Link } from "react-router-dom";
import Loader from "../common/loader";
import { formState, resultsState } from "./translate.state";
import { useState } from "react";

export default function Translate() {
  const [form, setForm] = useRecoilState(formState);
  const [results, setResults] = useRecoilState(resultsState);
  const mergeForm = (obj) => setForm({ ...form, ...obj });
  const [submitError, setSubmitError] = useState("");

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
                <p className="text-muted small mb-2">
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
                <Form.Label className="fw-bold">Direction</Form.Label>
                <div className="d-flex gap-4">
                  <Form.Check
                    label="ICD-10-CM → ICD-11"
                    name="from"
                    type="radio"
                    id="fromIcd10"
                    value="icd10"
                    checked={form.from === "icd10"}
                    onChange={() => mergeForm({ from: "icd10" })}
                  />
                  <Form.Check
                    label="ICD-11 → ICD-10-CM"
                    name="from"
                    type="radio"
                    id="fromIcd11"
                    value="icd11"
                    checked={form.from === "icd11"}
                    onChange={() => mergeForm({ from: "icd11" })}
                  />
                </div>
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
            <div
              className="text-uppercase mb-3"
              style={{ fontSize: "14px", letterSpacing: "1.5px" }}
            >
              {directionLabel}
            </div>

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

function TranslateResult({ data }) {
  const { source, targetSystem, groups } = data;
  return (
    <>
      <Card className="mb-3 border-primary">
        <Card.Body className="py-2">
          <div className="small text-muted text-uppercase">Source ({source.system})</div>
          <div>
            <span className="fw-bold">{source.code}</span>
            {source.title ? <span> — {source.title}</span> : null}
          </div>
        </Card.Body>
      </Card>

      <div className="small text-muted text-uppercase mb-2">
        Translation ({targetSystem})
      </div>

      {groups.length === 0 ? (
        <div className="alert alert-warning mb-0">No mapped codes.</div>
      ) : (
        groups.map((group, i) => (
          <div key={i}>
            {i > 0 && (
              <div className="text-center my-2">
                <Badge bg="secondary">OR</Badge>
              </div>
            )}
            <Card>
              <Card.Body className="py-2">
                {group.block || group.codes.length === 0 ? (
                  <div>
                    <Badge bg="info" className="me-2">
                      block
                    </Badge>
                    Maps to {targetSystem} block: <span className="fw-bold">{group.title}</span>
                  </div>
                ) : (
                  <>
                    <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
                      {group.codes.map((code, j) => (
                        <span key={j} className="d-inline-flex align-items-center gap-2">
                          {j > 0 && <Badge bg="dark">AND</Badge>}
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
        ))
      )}
    </>
  );
}
