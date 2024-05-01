import { Container, Row, Col, Navbar, Nav } from "react-bootstrap";
import { HashLink } from "react-router-hash-link";
import AboutImage from "./images/about.png";
import { useState, useEffect } from "react";

export default function About() {

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
        <h1 className="display-6 page-header text-muted text-center text-uppercase ">About</h1>
      </Container>

      <hr />
      <Container className="py-5">
        <Row>

          {!isMobile && (
            <Col lg={2} sm={12}>
              <div className="pb-5" style={{ borderRight: "4px solid #0074a3" }}>
                <div className="my-2">
                  <HashLink smooth to="/about/#background" className="h6 blue-subheader">
                    BACKGROUND
                  </HashLink>
                </div>
                <div className="my-2">
                  <HashLink smooth to="/about/#resources" className="h6 blue-subheader">
                    RESOURCES
                  </HashLink>
                </div>
                <div className="my-2">
                  <HashLink smooth to="/about/#contact" className="h6 blue-subheader">
                    CONTACT INFORMATION
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
                    <HashLink smooth to="/about/#background" className="my-2 ps-4 h6 blue-subheader">
                      BACKGROUND
                    </HashLink>
                    <HashLink smooth to="/about/#resources" className="my-2 ps-4 h6 blue-subheader">
                      RESOURCES
                    </HashLink>
                    <HashLink smooth to="/about/#contact" className="my-2 ps-4 h6 blue-subheader">
                      CONTACT INFORMATION
                    </HashLink>
                  </Nav>
                </Navbar.Collapse>
              </Container>
            </Navbar>
          )}
          <Col lg={10}>
            <Container className=" ps-5">
              <h3 id="background" className="mb-4 blue-subheader">1. Background</h3>
              <p>
                Accurate histological classification is important for facilitating studies of cancer epidemiology and etiologic heterogeneity. ICD Genie is a web-based tool that can assist epidemiologists, pathologists, research assistants, and data scientists to access and validate codes and text descriptions from the International Classification of Diseases (10th Edition) (ICD-10) and International Classification of Diseases for Oncology, 3rd Edition (ICD-O-3) more easily.
              </p>

              <p>
                Although many of the early classification and coding conventions have remained unchanged in successive versions of ICD and ICD-O, substantial revisions have been made in more recent versions i.e., ICD-10 and ICD-O-3. Tumor-related information may be available only in pathology reports, in text formats, or as ICD codes, which can be difficult to translate and record for non-specialists. The lack of a web-based tool for the batch translation of ICD codes to textual diagnoses is particularly challenging for large-scale epidemiological and public health projects that are often based on ICD codes derived from medical records for hundreds to thousands of individuals.
              </p>
              <p>
                To address these challenges, we developed ICD Genie as a publicly available web tool to facilitate the translation of ICD-10 and ICD-O-3 codes to human-readable text. By improving accessibility and by making existing cancer classification and coding schemes more readily understandable and searchable, ICD Genie will help accelerate descriptive and molecular epidemiological studies of cancer. The incorporation of ICD-10 in ICD Genie renders the tool useful for studies of other non-neoplastic diseases.
              </p>
              <p>ICD Genie is not intended to be used by cancer registrars or for cancer surveillance purposes. Cancer registrars should visit the Surveillance, Epidemiology, and End Results Program website (<a href="https://seer.cancer.gov/" target="_blank">https://seer.cancer.gov/</a>) for more information about coding guidelines and resources.
              </p>
            </Container>
          </Col>
        </Row>
      </Container>
      <div style={{ backgroundColor: "lightgrey" }}>
        <Container className="py-4">
          <Row>
            <Col lg={2} />
            <Col lg={10}>
              <Container className=" ps-5">
                <h3 id="resources" className="my-4 blue-subheader">
                  2. Resources
                </h3>
                <div className="my-2">ICD Genie utilizes data from the following publicly available resources:</div>
                <p>ICD-10 diagnosis codes:</p>
                <ul>
                  <li>
                    <a href="https://www.cms.gov/files/zip/2022-code-tables-tabular-and-index.zip" target="_blank">
                      ICD-10-CM codes maintained by Centers for Medicare & Medicaid Services (CMS)
                    </a>
                  </li>
                </ul>

                <p>ICD-O-3 morphology codes and description sources:</p>
                <ul>
                  <li>
                    <a href="https://www.naaccr.org/icdo3/" target="_blank">
                      North American Association of Central Cancer Registries (NAACCR)
                    </a>
                  </li>
                  <li>
                    <a href="https://seer.cancer.gov/icd-o-3/" target="_blank">
                      Surveillance, Epidemiology, and End Results (SEER) program validation list
                    </a>
                  </li>
                  <li>
                    <a
                      href="https://apps.who.int/iris/bitstream/handle/10665/96612/9789241548496_eng.pdf"
                      target="_blank"
                    >
                      World Health Organization (WHO) ICD-O-3 publication
                    </a>
                  </li>
                </ul>
                <div className="my-2">To learn more about the differences between ICD-10 and ICD-O-3, visit the <a href="https://training.seer.cancer.gov/index.html" target="_blank">SEER Training site</a></div>
              </Container>
            </Col>
          </Row>
        </Container>
      </div>
      <Container className="py-4">
        <Row>
          <Col lg={2} />
          <Col lg={10}>
            <Container>
              <h3 id="contact" className="my-4 blue-subheader">
                3. Contact Information
              </h3>
              <div className="my-2">Do you have questions or comments for us?</div>
              <div>Email us at <a href="mailto:NCIICDGenieWebAdmin@mail.nih.gov">NCIICDGenieWebAdmin@mail.nih.gov</a></div>
            </Container>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
