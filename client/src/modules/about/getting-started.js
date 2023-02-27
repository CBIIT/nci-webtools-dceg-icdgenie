import { Container, Row, Col, Navbar, Nav } from "react-bootstrap";
import { HashLink } from "react-router-hash-link";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Starter() {
  const navigate = useNavigate();

  const [isMobile, setIsMobile] = useState(false);

  const handleResize = () => {
    if (window.innerWidth < 1000) {
      setIsMobile(true);
    } else {
      setIsMobile(false);
    }
  };

  useEffect(() => {
    window.addEventListener("resize", handleResize);
  });

  return (
    <div className="h-100 bg-white">
      <Container className="py-3">
        <h1 className="display-6 page-header text-muted text-center text-uppercase">Getting Started</h1>
      </Container>
      <hr />
      <Container className="py-5">
        <Row>
          {!isMobile && (
            <Col lg={2} sm={12}>
              <div className="pb-5" style={{ borderRight: "4px solid #0074a3" }}>
                <div className="my-2">
                  <HashLink smooth to="/getting-started/#checklist" className="h6 blue-subheader">
                    CHECKLIST
                  </HashLink>
                </div>
                <div className="my-2">
                  <HashLink smooth to="/getting-started/#searchTypes" className="h6 blue-subheader">
                    SEARCH TYPES
                  </HashLink>
                </div>
                <div className="my-2">
                  <HashLink smooth to="/getting-started/#formatting" className="h6 blue-subheader">
                    FORMATTING ICD CODES
                  </HashLink>
                </div>
                <div className="my-2">
                  <HashLink smooth to="/getting-started/#tutorials" className="h6 blue-subheader">
                    TUTORIALS
                  </HashLink>
                </div>
              </div>
            </Col>
          )}
          {isMobile && (
            <Navbar variant="light" className="pt-1 pb-4 flex-none-auto" expand="xl">
              <Container>
                <Navbar.Toggle aria-controls="page-navbar" />
                <Navbar.Collapse id="page-navbar">
                  <Nav className="d-flex w-100 justify-content-center">
                    <HashLink smooth to="/getting-started/#checklist" className="my-2 ps-4 h6 blue-subheader">
                      CHECKLIST
                    </HashLink>
                    <HashLink smooth to="/getting-started/#searchTypes" className="my-2 ps-4 h6 blue-subheader">
                      SEARCH TYPES
                    </HashLink>
                    <HashLink smooth to="/getting-started/#formatting" className="my-2 ps-4 h6 blue-subheader">
                      FORMATTING ICD CODES
                    </HashLink>
                    <HashLink smooth to="/getting-started/#tutorials" className="my-2 ps-4 h6 blue-subheader">
                      TUTORIALS
                    </HashLink>
                  </Nav>
                </Navbar.Collapse>
              </Container>
            </Navbar>
          )}
          <Col lg={10}>
            <Container>
              <h5>
                We encourage new users of ICD Genie to familiarize themselves with the following checklist to ensure
                they are using appropriate search terms and getting maximal utility from their ICD Genie searches.{" "}
              </h5>
              <h2 id="checklist" className="my-4 text-uppercase blue-subheader">
                Checklist
              </h2>
              <ol>
                <li>Assess if you need to use single or batch query</li>
                <li>
                  Figure out what you will use as input values (e.g., ICD-10 codes, ICD-O-3 codes or text diagnoses)
                </li>
                <li>Ensure your input values are properly formatted </li>
                <li style={{listStyleType: "none"}}>
                  <ul>
                    <li>
                      Ensure diagnosis codes (i.e., ICD-10 or codes ICD-O-3 you are looking to translate) are properly
                      formatted. Guidance is provided{" "}
                      <HashLink smooth to="/getting-started/#formatting">
                        below
                      </HashLink>
                    </li>
                    <li>Ensure text diagnoses are in American English, not British English</li>
                  </ul>
                </li>
                <li>Determine your desired output (ICD-10 codes, ICD-O-3 codes or text diagnoses)</li>
              </ol>
            </Container>
          </Col>
        </Row>
      </Container>
      <div style={{ backgroundColor: "lightgrey" }}>
        <Container className="py-5">
          <Row>
            <Col lg={2} />
            <Col lg={10}>
              <Container>
                <h2 id="searchTypes" className="my-4 text-uppercase blue-subheader">
                  Search Types
                </h2>
                <h3 style={{ fontWeight: "bold" }}>Single Query</h3>
                <p>
                  Single query accepts text, numeric (ICD-O-3), and alphanumeric (ICD-10) queries. You can explore
                  disease descriptions and the coding hierarchy (i.e., parent nodes and child nodes). Only one search
                  term can be entered at a time.{" "}
                </p>
                <h3 style={{ fontWeight: "bold" }}>Batch Query</h3>
                <p>
                  ICD Genie will return the original information submitted with a new column added at the end with the
                  search results. We recommend you submit a tab-delimited file (“.tsv”) with no more than 5 columns by
                  5,000 rows. If you have advanced queries that require more than 5,000 search codes or terms, we
                  recommend you use the{" "}
                  <a
                    href="javascript:void(0)"
                    onClick={() => {
                      navigate("/api-access");
                    }}
                  >
                    API Access
                  </a>
                  .
                </p>
                <div>Batch Query does not...</div>
                <ul>
                  <li>
                    Automatically detect the type of information you submit nor automatically determine what type of
                    output you need
                  </li>
                  <li>
                    Know which column is the input column you want it to use for queries of diagnosis codes or text
                  </li>
                </ul>
                <h3 style={{ fontWeight: "bold" }}>API</h3>
                <p>
                  For more advanced searches with large numbers of text or diagnosis code queries, we recommend{" "}
                  <a
                    href="javascript:void(0)"
                    onClick={() => {
                      navigate("/api-access");
                    }}
                  >
                    API Access
                  </a>
                  .
                </p>
              </Container>
            </Col>
          </Row>
        </Container>
      </div>
      <Container className="py-5">
        <Row>
          <Col lg={2} />
          <Col lg={10}>
            <Container>
              <h2 id="formatting" className="my-4 text-uppercase blue-subheader">
                Formatting ICD Codes
              </h2>
              <h3 style={{ fontWeight: "bold" }}>ICD-10 Codes</h3>
              <div>
                <strong>Example Code:</strong> C50.011
              </div>
              <ul>
                <li>Alphanumeric</li>
                <li>Can be up to 6 characters (7 character codes are not currently supported)</li>
                <li>First character is always a letter (except "U")</li>
                <li>Second and third characters are always a number</li>
                <li>Characters 4 through 6: either a number or letter</li>
              </ul>
              <h3 style={{ fontWeight: "bold" }}>ICD-O-3 Codes</h3>
              <div>
                <strong>Example Code:</strong> 8000/3
              </div>
              <ul>
                <li>Entirely Numeric</li>
                <li>Must have a forward slash (i.e., "/")</li>
                <li>Number after the slash is the behavior code</li>
              </ul>
            </Container>
          </Col>
        </Row>
      </Container>
      <div style={{ backgroundColor: "lightgrey" }}>
        <Container className="py-5">
          <Row>
            <Col lg={2} />
            <Col lg={10}>
              <Container>
                <h2 id="tutorials" className="my-4 text-uppercase blue-subheader">
                  Tutorials
                </h2>
                <h3 style={{ fontWeight: "bold" }}>Formatting</h3>
                <ul>
                  <li>Identifying what kind of ICD codes you have</li>
                  <li>Formatting data in excel or a text editor</li>
                </ul>
                <iframe
                    title="formatting"
                    width="80%"
                    height="400vw"
                    src="https://nci.rev.vbrick.com/embed?id=5008d4e6-38c4-431f-96f7-e999f284f3b4"
                    allowFullScreen
                  ></iframe>
                <h3 style={{ fontWeight: "bold" }}>Using the Tool</h3>
                <ul>
                  <li>Step by step guide for using batch query</li>
                </ul>
                <iframe
                    title="batch"
                    width="80%"
                    height="400vw"
                    src="https://nci.rev.vbrick.com/embed?id=6f9e1353-f6bf-4725-bd4e-2b03509e18a5"
                    allowFullScreen
                  ></iframe>
              </Container>
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
}
