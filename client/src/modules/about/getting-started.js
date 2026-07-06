import { Container, Row, Col, Navbar, Nav } from "react-bootstrap";
import { HashLink } from "react-router-hash-link";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import DataDictionary from "./images/data-dictionary.png";

function VideoTutorial({ src, label }) {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    const linkStyle = { color: "#005ea2", textDecoration: "none" };
    const pStyle = { color: "#595959", margin: "20px 0", lineHeight: 1.6 };
    return (
      <div
        role="alert"
        style={{
          width: "80%",
          backgroundColor: "#f1f1f1",
          fontFamily: '"Helvetica Neue", Helvetica, Arial, sans-serif',
          textAlign: "center",
          padding: "50px 0 40px 0",
        }}
      >
        <div style={{ width: "600px", maxWidth: "100%", margin: "0 auto" }}>
          <h1 style={{ letterSpacing: "-1px", lineHeight: "60px", fontSize: "60px", fontWeight: 100, margin: "0 0 50px 0", textShadow: "0 1px 0 #fff", color: "#333333" }}>
            404
          </h1>
          <p style={pStyle}>
            <strong>There isn&apos;t a GitHub Pages site here.</strong>
          </p>
          <p style={pStyle}>
            If you&apos;re trying to publish one,{" "}
            <a href="https://help.github.com/pages/" style={linkStyle}>
              read the full documentation
            </a>{" "}
            to learn how to set up <strong>GitHub Pages</strong> for your repository, organization, or user account.
          </p>
          <div style={{ marginTop: "35px", color: "#595959" }}>
            <a href="https://githubstatus.com" style={{ ...linkStyle, color: "#595959", fontWeight: 200, fontSize: "14px", margin: "0 10px" }}>
              GitHub Status
            </a>{" "}
            &mdash;{" "}
            <a href="https://twitter.com/githubstatus" style={{ ...linkStyle, color: "#595959", fontWeight: 200, fontSize: "14px", margin: "0 10px" }}>
              @githubstatus
            </a>
          </div>
          <a href="https://github.com" style={{ display: "inline-block", marginTop: "35px" }}>
            <img
              width="32"
              height="32"
              alt="GitHub"
              src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyRpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuMy1jMDExIDY2LjE0NTY2MSwgMjAxMi8wMi8wNi0xNDo1NjoyNyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENTNiAoTWFjaW50b3NoKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpEQUM1QkUxRUI0MUMxMUUyQUQzREIxQzRENUFFNUM5NiIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpEQUM1QkUxRkI0MUMxMUUyQUQzREIxQzRENUFFNUM5NiI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOkUxNkJENjdGQjNGMDExRTJBRDNEQjFDNEQ1QUU1Qzk2IiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOkUxNkJENjgwQjNGMDExRTJBRDNEQjFDNEQ1QUU1Qzk2Ii8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+hfPRaQAAB6lJREFUeNrsW2mM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"
            />
          </a>
        </div>
      </div>
    );
  }

  return (
    <video controls width="80%" aria-label={label} onError={() => setHasError(true)}>
      <source src={src} type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  );
}

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
              <ul style={{ listStyleType: "none" }}>
                <li>1. Assess if you need to use</li>
                <li >
                  <ul>
                    <li><a href="javascript:void(0);" onClick={() => { navigate("/search") }}>Search</a> for a single entry.</li>
                    <li><a href="javascript:void(0);" onClick={() => { navigate("/batch-query") }}>Batch Query</a> ({"<"} 5000 rows)</li>
                    <li><a href="javascript:void(0);" onClick={() => { navigate("/api-access") }}>API Access </a> (1 to ≥ 5000 rows)</li>
                  </ul>
                </li>
                <li>
                  2. Figure out what you will use as input values e.g.,
                </li>
                <li>
                  <ul>
                    <li>Participant identifiers</li>
                    <li>ICD-10 codes</li>
                    <li>ICD-11 codes</li>
                    <li>ICD-O-3 morphology and/or topography codes</li>
                    <li>ICD-O-4 morphology and/or topography codes</li>
                    <li>Text diagnoses [available for <a href="javascript:void(0);" onClick={() => { navigate("/search") }}>"Search"</a> (single query) only]</li>
                  </ul>
                </li>
                <li>3. Ensure your input values are properly formatted. Guidance is provided <HashLink smooth to="/getting-started/#formatting">below</HashLink></li>
                <li>4. Determine your desired output (ICD-10 codes, ICD-O-3 codes or text diagnoses)</li>
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
                <h2 id="searchTypes" className="my-4 text-uppercase blue-subheader">
                  Search Types
                </h2>
                <h3 style={{ fontWeight: "bold" }}>Single Query</h3>
                <p>
                  Single query accepts individual text, numeric (ICD-O-3 and ICD-O-4 morphology or topography codes), or alphanumeric (ICD-10 or ICD-11 codes) queries. You can explore disease descriptions and the coding hierarchy (i.e., parent nodes and child nodes). Only one search term can be entered at a time. Ensure text diagnoses are in American English and not British English (e.g., tumor as opposed to tumour).{" "}
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
              <h3 style={{ fontWeight: "bold" }}>ICD-10-CM Codes</h3>
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
              <h3 style={{ fontWeight: "bold" }}>ICD-10-PCS Codes</h3>
              <div>
                <strong>Example Code:</strong> 0DTJ0ZZ (translation: Resection of appendix, open approach)
              </div>
              <ul>
                <li>Alphanumeric</li>
                <li>Always 7 characters without a decimal point</li>
                <li>Each character can be a number or a letter</li>
                <li>The letters "O" and "I" are omitted to prevent confusion with the numbers "0" and "1"</li>
                <li>Each character represents a specific component of the procedure (e.g., Character 1: Section, Character 2: Body system)</li>
              </ul>
              <h3 style={{ fontWeight: "bold" }}>ICD-11 Codes</h3>
              <div>
                <strong>Example Code:</strong> 2F80.0 (translation: Kaposi sarcoma of skin)
              </div>
              <ul>
                <li>Alphanumeric</li>
                <li>First character may be a letter or a number</li>
                <li>Second character is always a letter, which differentiates ICD-11 from ICD-10</li>
                <li>The letters "O" and "I" are omitted to prevent confusion with the numbers "0" and "1"</li>
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
              <h3 style={{ fontWeight: "bold" }}>ICD-O-4 Codes</h3>
              <div>
                <strong>Example Morphology Code:</strong> 80700/3
              </div>
              <ul>
                <li>Alphanumeric</li>
                <li>Must have a forward slash after the fifth number (i.e., "/")</li>
              </ul>
              <div>
                <strong>Example Topography Code:</strong> C72.3 (translation: optic nerve)
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
                  <img src={DataDictionary} style={{ width: "50%" }} alt="Data dictionary preview for the epidemiology project"/>
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
              <p>Submit a single text or ICD code, click “submit,” and select the relevant tab (e.g., ICD-10 vs. ICD-11, ICD-O-3 vs. ICD-O-4) for query results.</p>
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
                <VideoTutorial
                  src="https://cbiit.github.io/nci-webtools-dceg-icdgenie/22-1202-Checking_ICD_O_3_ICD_10_Codes.mp4"
                  label="Formatting your data video tutorial"
                />
                <h3 style={{ fontWeight: "bold" }}>Using the Tool</h3>
                <ul>
                  <li>Step by step guide for using batch query</li>
                </ul>
                <VideoTutorial
                  src="https://cbiit.github.io/nci-webtools-dceg-icdgenie/22-1201-How_to_Use_ICDgenie_s_Batch_Query_Tool.mp4"
                  label="How to use Batch Query video tutorial"
                />
              </Container>
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
}
