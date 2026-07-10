import { Row, Col, Card, Badge } from "react-bootstrap";

// One translation entry laid out left-to-right: source on the left, translation on the right.
// Reused for the single Translate result and for each row of the Batch Translate results.
// `idLabel` optionally prepends a Participant ID cell on the far left (batch with IDs).
export function TranslateResult({ data, idLabel }) {
  const { source, targetSystem, groups, found, message } = data;
  return (
    <Row className="border rounded bg-white mx-0 py-3">
      {idLabel != null && (
        <Col md={2} className="border-end pe-md-3 mb-3 mb-md-0">
          <div className="small text-muted text-uppercase mb-1">Participant ID</div>
          <div className="fw-bold">{idLabel || "—"}</div>
        </Col>
      )}

      {/* Source — left */}
      <Col md={idLabel != null ? 4 : 4} className="border-end pe-md-3 mb-3 mb-md-0">
        <div className="small text-muted text-uppercase mb-1">Source ({source?.system})</div>
        <div className="fw-bold">{source?.code ?? data.input}</div>
        {source?.title ? <div>{source.title}</div> : null}
      </Col>

      {/* Translation — right */}
      <Col className="ps-md-3">
        <div className="small text-muted text-uppercase mb-2">
          Translation{targetSystem ? ` (${targetSystem})` : ""}
        </div>
        {found ? (
          <TranslationGroups groups={groups} targetSystem={targetSystem} />
        ) : (
          <div className="alert alert-warning mb-0 py-2">
            {message || "No translation found."}
          </div>
        )}
      </Col>
    </Row>
  );
}

// The OR/AND combination stack for one source code's translation. OR alternatives are separated by
// an OR badge; AND codes within a group are joined by an AND badge; a blank-code target renders as a
// "block" chip.
export function TranslationGroups({ groups, targetSystem }) {
  if (!groups || groups.length === 0) {
    return <div className="alert alert-warning mb-0 py-2">No mapped codes.</div>;
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
