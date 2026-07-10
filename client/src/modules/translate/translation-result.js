import { Row, Col } from "react-bootstrap";

// One translation entry, laid out left-to-right: source on the left, the ICD-11/ICD-10 mapping on the
// right. Per the client (questions.md A1), the mapping is shown EXACTLY as it appears in the WHO
// mapping file — the `&`/`/` combination string is not parsed. <TranslationDisclaimer/> explains the
// symbols. Reused for the single Translate result and each row of Batch Translate.
export function TranslateResult({ data, idLabel }) {
  const { source, targetSystem, target, found, message } = data;
  return (
    <Row className="border rounded bg-white mx-0 py-3">
      {idLabel != null && (
        <Col md={2} className="border-end pe-md-3 mb-3 mb-md-0">
          <div className="small text-muted text-uppercase mb-1">Participant ID</div>
          <div className="fw-bold">{idLabel || "—"}</div>
        </Col>
      )}

      {/* Source — left */}
      <Col md={4} className="border-end pe-md-3 mb-3 mb-md-0">
        <div className="small text-muted text-uppercase mb-1">Source ({source?.system})</div>
        <div className="fw-bold">{source?.code ?? data.input}</div>
        {source?.title ? <div>{source.title}</div> : null}
      </Col>

      {/* Translation — right (verbatim mapping string) */}
      <Col className="ps-md-3">
        <div className="small text-muted text-uppercase mb-1">
          Translation{targetSystem ? ` (${targetSystem})` : ""}
        </div>
        {found && target?.code ? (
          <>
            <div className="fw-bold font-monospace" style={{ fontSize: "1.05rem", wordBreak: "break-word" }}>
              {target.code}
            </div>
            {target.title ? <div className="text-muted">{target.title}</div> : null}
          </>
        ) : (
          <div className="alert alert-warning mb-0 py-2">{message || "No translation found."}</div>
        )}
      </Col>
    </Row>
  );
}

// Explains the `&` / `/` symbols in the verbatim ICD-11 mapping string. Shown alongside results.
export function TranslationDisclaimer() {
  return (
    <div className="alert alert-secondary small mb-3">
      <b>How to read the translation:</b> the ICD-11 mapping is shown exactly as provided in the WHO
      mapping file. <b>&amp;</b> means <b>AND</b> — all listed codes are required to fully capture the
      ICD-10-CM code. <b>/</b> means <b>OR</b> — the ICD-10-CM code maps to one option or another
      depending on clinical context.{" "}
      <span className="text-muted">
        Example: <code>1B12.3&amp;XA0NE9/5A74.0</code> means (1B12.3 AND XA0NE9) OR 5A74.0.
      </span>
    </div>
  );
}
