import { Container, Row, Col } from "react-bootstrap";
import ResourcesImage from "./images/resources.png";
export default function Resources() {
  return (
    <div className="h-100 bg-white">
      <Container className="py-3">
        <h1 className="display-6 page-header text-muted text-center text-uppercase">Resources</h1>
      </Container>
      <hr />
      <Row>
        <Col md={5}>
          <Container className="py-5 ms-5">
            <h5 className="my-4 blue-subheader">ICD Genie utilizes data from the following publicly available resources:</h5>

            <p>ICD-10 diagnosis codes:</p>
            <ul>
              <li><a href="https://www.cms.gov/files/zip/2022-code-tables-tabular-and-index.zip" target="_blank">ICD-10-CM codes maintained by Centers for Medicare & Medicaid Services (CMS)</a></li>
            </ul>

            <p>ICD-O-3 morphology codes and description sources:</p>
            <ul>
              <li><a href="https://www.naaccr.org/icdo3/" target="_blank">North American Association of Central Cancer Registries (NAACCR)</a></li>
              <li><a href="https://seer.cancer.gov/icd-o-3/" target="_blank">Surveillance, Epidemiology, and End Results (SEER) program validation list</a></li>
              <li><a href="https://apps.who.int/iris/bitstream/handle/10665/96612/9789241548496_eng.pdf" target="_blank">World Health Organization (WHO) ICD-O-3 publication</a></li>
            </ul>
          </Container>
        </Col>
        <Col md={7}>
          <img src={ResourcesImage} style={{width: "100%"}}></img>
        </Col>
      </Row>
    </div>

  )
}