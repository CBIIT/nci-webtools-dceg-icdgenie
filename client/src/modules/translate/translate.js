import { useRecoilState } from "recoil";
import axios from "axios";
import { Form, Container, Row, Col, Button } from "react-bootstrap";
import { useLocation, useNavigate, Link } from "react-router-dom";
import Loader from "../common/loader";
import { formState, resultsState } from "./translate.state";
import DirectionToggle from "./direction-toggle";
import { TranslateResult, TranslationDisclaimer } from "./translation-result";
import { useEffect, useState } from "react";

export default function Translate() {
  const location = useLocation();
  const navigate = useNavigate();
  const [form, setForm] = useRecoilState(formState);
  const [results, setResults] = useRecoilState(resultsState);
  const mergeForm = (obj) => setForm({ ...form, ...obj });
  const [submitError, setSubmitError] = useState("");

  function selectDirection(dir) {
    if (dir === form.from) return;
    // Clear the typed code too: a code entered for one system shouldn't be submitted against the
    // other index after the direction flips (which yields a confusing wrong-system "not found").
    setForm({ ...form, from: dir, code: "" });
    setResults({ loading: false, data: null });
    setSubmitError("");
  }

  const directionLabel =
    form.from === "icd10" ? "ICD-10-CM → ICD-11" : "ICD-11 → ICD-10-CM";

  useEffect(() => {
    const state = location.state;
    if (!state?.code || !state?.from) return;

    const nextForm = { code: state.code, from: state.from };
    setForm((prev) => ({ ...prev, ...nextForm }));
    setResults({ loading: true, data: null });
    setSubmitError("");

    (async () => {
      try {
        const response = await axios.post("api/translate", nextForm);
        setResults({ loading: false, data: response.data });
      } catch (error) {
        console.error("Translate error:", error);
        setResults({ loading: false, data: null });
        setSubmitError("An error occurred. Please try again.");
      } finally {
        navigate(location.pathname, { replace: true, state: null });
      }
    })();
  }, [location.state, location.pathname, navigate, setForm, setResults]);

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
                <Form.Label>
                  Use this feature to translate a single code from ICD-10-CM to ICD-11 or from ICD-11 to ICD-10-CM.
                </Form.Label>
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
              <DirectionToggle value={form.from} onChange={selectDirection} />
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
                  <TranslationDisclaimer />
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
