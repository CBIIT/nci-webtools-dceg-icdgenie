import { Container, Row, Col, Navbar, Nav } from "react-bootstrap";
import { HashLink } from "react-router-hash-link";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import DataDictionary from "./images/data-dictionary.png";

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
                  <HashLink smooth to="/getting-started/#troubleshooting" className="h6 blue-subheader">
                    TROUBLESHOOTING ICD CODES
                  </HashLink>
                </div>
                <div className="my-2">
                  <HashLink smooth to="/getting-started/#how-to" className="h6 blue-subheader">
                    HOW DO I USE ICDGENIE
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
                    <HashLink smooth to="/getting-started/#troubleshooting" className="my-2 ps-4 h6 blue-subheader">
                      TROUBLESHOOTING ICD CODES
                    </HashLink>
                    <HashLink smooth to="/getting-started/#how-to" className="my-2 ps-4 h6 blue-subheader">
                      HOW DO I USE ICDGENIE
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
                <li>Assess if you need to use</li>
                <li style={{ listStyleType: "none" }}>
                  <ul>
                    <li><a href="javascript:void(0);" onClick={() => { navigate("/search") }}>Search</a> for a single entry.</li>
                    <li><a href="javascript:void(0);" onClick={() => { navigate("/batch-query") }}>Batch Query</a> ({"<"} 5000 rows)</li>
                    <li><a href="javascript:void(0);" onClick={() => { navigate("/api-access") }}>API Access </a> (1 to ≥ 5000 rows)</li>
                  </ul>
                </li>
                <li>
                  Figure out what you will use as input values e.g.,
                </li>
                <li style={{ listStyleType: "none" }}>
                  <ul>
                    <li>Participant identifiers</li>
                    <li>ICD-10 codes</li>
                    <li>ICD-O-3 morphology and/or site codes</li>
                    <li>Text diagnoses [available for <a href="javascript:void(0);" onClick={() => { navigate("/search") }}>"Search"</a> (single query) only]</li>
                  </ul>
                </li>
                <li>Ensure your input values are properly formatted. Guidance is provided <HashLink smooth to="/getting-started/#formatting">below</HashLink></li>
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
                  Single query accepts text, numeric (ICD-O-3 morphology or site codes), and alphanumeric (ICD-10 codes) queries. You can explore disease descriptions and the coding hierarchy (i.e., parent nodes and child nodes). Only one search term can be entered at a time. Ensure text diagnoses are in American English and not British English.{" "}
                </p>
                <h3 style={{ fontWeight: "bold" }}>Batch Query</h3>
                <p>
                  ICD Genie will return the original information submitted with a new column added at the end with the search results. We recommend you submit a tab-delimited file (“.tsv”) with less than 5,000 rows by 2 columns (ICD-10) or 3 columns (ICD-O-3). If you have 5,000 or more rows, we recommend you use the{" "}
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
                    Know which column is the input column you want it to use for queries of diagnosis codes
                  </li>
                </ul>
                <h3 style={{ fontWeight: "bold" }}>API</h3>
                <p>
                  For more advanced searches and searches with large numbers of text or diagnosis code queries ({">"} 5,000 rows), we recommend{" "}
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
                <strong>Example Code:</strong> W56.29 (translation: other contact with an orca)
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
                <strong>Example Morphology Code:</strong> 9140/3 (translation : Kaposi’s Sarcoma)
              </div>
              <ul>
                <li>Entirely Numeric</li>
                <li>Must have a forward slash after the fourth number (i.e., "/")</li>
                <li>Number after the slash is the behavior code – either “1”, “2,” or “3.” Behavior codes “6” and “9” are not supported at this time.</li>
              </ul>
              <div>
                <strong>Example Site Code:</strong> C71.9
              </div>
              <ul>
                <li>Alphanumeric; begins with “C” followed by 2 numbers, a period, and at least one more number</li>
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
                <h2 id="troubleshooting" className="my-4 text-uppercase blue-subheader">Troubleshooting ICD Codes</h2>
                <div>We understand from firsthand experience that the ICD-10 or ICD-O-3 codes you receive may not be properly formatted. For example, ICD codes you receive may be formatted as below: </div>
                <Row className="justify-content-center my-3">
                  <Row className="justify-content-center my-2" style={{ textDecoration: "underline", fontWeight: "bold" }}>Data for the Epidemiology Project</Row>
                  <table class="table w-50">
                    <thead>
                      <tr>
                        <th scope="col">Participant</th>
                        <th scope="col">Type.code</th>
                        <th scope="col">Site.code</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <th scope="row">1</th>
                        <td>8261.3</td>
                        <td>71.9</td>
                      </tr>
                    </tbody>
                    <tbody>
                      <tr>
                        <th scope="row">2</th>
                        <td>9140.3</td>
                        <td>44.5</td>
                      </tr>
                    </tbody>
                    <tbody>
                      <tr>
                        <th scope="row">3</th>
                        <td>9140.3</td>
                        <td>80.9</td>
                      </tr>
                    </tbody>
                  </table>
                  <Row className="justify-content-center my-2" style={{ textDecoration: "underline", fontWeight: "bold" }}>Data Dictionary for the Epidemiology Project</Row>
                  <img src={DataDictionary} style={{ width: "50%" }} />
                  <div className="my-2">After comparing the format of the data with criteria in “Formatted ICD Codes” it was determined that “Type.code” is the ICD-O-3 morphology code, where the “ .  “ needs to be replaced with a “/” and “Site.code” is the ICD-O-3 site code, missing the letter “C” as a prefix. Your data could require additional formatting to be compatible with ICD Genie requirements. </div>
                  <div className="my-3">The above data format was reformatted to the following for ICD Genie:</div>
                  <Row className="justify-content-center my-2" style={{ textDecoration: "underline", fontWeight: "bold" }}>Data for the Epidemiology Project, Corrected</Row>
                  <table class="table w-50">
                    <thead>
                      <tr>
                        <th scope="col">Participant</th>
                        <th scope="col">Type.code</th>
                        <th scope="col">Site.code</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <th scope="row">1</th>
                        <td>8261/3</td>
                        <td>C71.9</td>
                      </tr>
                    </tbody>
                    <tbody>
                      <tr>
                        <th scope="row">2</th>
                        <td>9140/3</td>
                        <td>C44.5</td>
                      </tr>
                    </tbody>
                    <tbody>
                      <tr>
                        <th scope="row">3</th>
                        <td>9140/3</td>
                        <td>C80.9</td>
                      </tr>
                    </tbody>
                  </table>
                  <div className="mt-2">Further detail on how to make these changes are available in the video tutorial, “Formatting Your Data.”</div>
                </Row>
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
              <h2 id="how-to" className="my-4 text-uppercase blue-subheader">
                How Do I Use ICDGenie
              </h2>
              <h3 style={{ fontWeight: "bold" }}>Single Query</h3>
              <p>Submit a single text, ICD-O-3, or ICD-10 query, click “submit,” and check both the ICD-O-3 and ICD-10 tabs on the screen for query results.</p>
              <h3 style={{ fontWeight: "bold" }}>Batch Query</h3>
              <ul>
                <li>Upload a tab-delimited file, suffixed “.tsv,” of {"<"}5,000 rows (of the medical codes) by </li>
                <li style={{ listStyleType: "none" }}>
                  <ul>
                    <li>2 columns maximum for ICD-10 (Participant ID, ICD-10 codes) or</li>
                    <li>3 columns maximum for ICD-O-3 (Participant ID, ICD-O-3 morphology code, ICD-O-3 site code); other possible combinations:</li>
                    <li style={{ listStyleType: "none" }}>
                      <ul>
                        <li>Participant ID, ICD-O-3 morphology codes (2 columns)</li>
                        <li>Participant ID, ICD-O-3 site codes (2 columns)</li>
                        <li>Participant ID, ICD-O-3 morphology codes, ICD-O-3 site codes (3 columns)</li>
                        <li>ICD-O-3 morphology codes, ICD-O-3 site codes (2 columns)</li>
                        <li>ICD-O-3 morphology codes (1 column)</li>
                        <li>ICD-O-3 site codes (1 column)</li>
                      </ul>
                    </li>
                  </ul>
                </li>
                <li>Submit the query</li>
                <li>Examine results on the screen and/or export them using “Export Results”</li>
              </ul>
              <p>If you lack a “Participant ID” column, do NOT select the “Participant IDs” radio button. Participant ID values are not necessary to use the tool.</p>
              <p>“Header rows” do not need to be removed before upload; ICD Genie will automatically “strip” them out after you upload the file.</p>
              <p>For detailed instructions on how to do this, check out our video “How to Use Batch Query.”</p>
              <p>Regarding ICD-O-3 results : we have a variable named “Indicator” that tells the user whether or not the variable (e.g., ICD-O-3 site code only data) or combination of variables (i.e., ICD-O-3 site & morphology codes) were found in our database. </p>
              <p>It is possible to have an invalid code in either column (e.g., invalid morphology code 9111/1 with invalid site code, C80.9 in the Batch Query ICD-O-3 example document) and/or an invalid combination even if the individual codes are valid. An example of the latter would be the valid morphology code 8261/3 (adenocarcinoma in villous adenoma) with valid site code C71.9 (brain, unspecified)  in our Batch Query ICD-O-3 example document. This combination is not found in our reference database. In this instance, ICD Genie will indicate that each column is individually valid but the combination was not found.</p>
              <p>Entries with “NA” will return “NA.”</p>
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
