import { Container, Row, Col } from "react-bootstrap";
import ResourcesImage from "./images/resources.png";
export default function Resources() {
  return (
    <div className="h-100 bg-white">
      <Container className="py-3">
        <h1 className="display-6 page-header text-muted text-center text-uppercase">Resources</h1>
      </Container>
      <hr />
      <Container fluid>
        <Row>
          <Col md={5}>
            <Container className="py-3 ps-5">
              <h5 className="my-4 blue-subheader">
                ICD Genie utilizes data from the following publicly available resources:
              </h5>

              <p className="mb-1"><strong>ICD-10:</strong></p>
              <ul>
                <li>
                  ICD-10-CM and ICD-10-PCS codes (2026 versions) maintained by Centers for Medicare &amp; Medicaid Services (CMS)
                </li>
              </ul>

              <p className="mb-1"><strong>ICD-11:</strong></p>
              <ul>
                <li>World Health Organization (2022 release)</li>
              </ul>

              <p className="mb-1"><strong>ICD-O-4:</strong></p>
              <ul>
                <li>
                  Published by Znaor et al. (2026) in Cancer Epidemiology (DOI:{" "}
                  <a href="https://doi.org/10.1016/j.canep.2026.102989" target="_blank">
                    10.1016/j.canep.2026.102989
                  </a>
                  )
                </li>
                <li>Data used in tool sourced from Supplementary Table 1.</li>
              </ul>

              <p className="mb-1"><strong>ICD-O-3 morphology codes and description sources:</strong></p>
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
          {/*<Col md={7} className="px-0">
            <img src={ResourcesImage} className="w-100 img-fluid"></img>
          </Col>*/}
        </Row>
      </Container>
    </div>
  );
}
