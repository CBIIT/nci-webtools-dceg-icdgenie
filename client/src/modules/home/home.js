import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import SearchForm from "../common/search-form";
import Button from "react-bootstrap/Button"
import HomeImage from "./images/landing-page.png";
export default function Home() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    //const params = createSearchParams({ query: search });
    navigate(`/search`, { state: { query: search } });
  }

  return (
    <>
      <div className="cover-image" style={{ backgroundImage: `url(${HomeImage})` }}>
        <Container className="flex-grow-1 py-5" style={{ height: "50vh" }}>
          <Row className="h-100 justify-content-center align-items-center">
            <Col md={8}>
              <h1 className="display-4 mb-5 text-light text-center text-uppercase">ICD Genie</h1>
              <SearchForm
                className="shadow"
                search={search}
                setSearch={setSearch}
                handleSubmit={handleSubmit}
                placeholder="Search ICD Genie"
              />
            </Col>
          </Row>
        </Container>
      </div>
      <div className="bg-light">

        <Container className="py-3" style={{ fontSize: "15px" }}>
          <h4 className="pb-3">About ICD Genie</h4>
          <Row className="justify-content-center">
            <Col xl={8}>
              <p className="fw-normal">
                ICD Genie is a translator for textual diagnoses, ICD-10, and ICD-O-3 codes sourced from
                the <a href="https://www.cms.gov/files/zip/2022-code-tables-tabular-and-index.zip" target="_blank">Centers for Medicare & Medicaid Services (CMS)</a>,
                the <a href="https://www.naaccr.org/icdo3/" target="_blank">North American Association of Central Cancer Registries (NAACCR)</a>,
                the <a  href="https://seer.cancer.gov/icd-o-3/" target="_blank">Surveillance, Epidemiology, and End Results (SEER) program validation list</a>,
                and the <a href="https://apps.who.int/iris/bitstream/handle/10665/96612/9789241548496_eng.pdf" target="_blank">World Health Organization (WHO) ICD-O-3 publication</a>.
              </p>

              <p className="fw-normal">
                ICD Genie was created by Sairah Khan M.P.H.,
                Shu-Hong Lin Ph.D., BVSc, <a href="https://dceg.cancer.gov/fellowship-training/fellowship-experience/meet-fellows/iteb/abubakar-mustapha" target="_blank">Mustapha Abubakar M.D., Ph.D.</a>
                and <a href="https://dceg.cancer.gov/about/staff-directory/machiela-mitchell" target="_blank"> Mitchell J. Machiela Sc.D., MPH</a>of the NCI Division of Cancer Epidemiology and Genetics DCEG Integrative Tumor Epidemiology Branch with assistance developing the tool from Brian Park B.S., Ben Chen B.S., Hannah Stogsdill B.A., Kai-Ling Chen M.S. and Ye Wu Ph.D. of
                NCI’s <a href="https://datascience.cancer.gov/" target="_blank">Center for Biomedical Informatics and Information Technology.</a> Many thanks to our colleagues who provided critical input during the design and development of ICD Genie!
              </p>

              <p className="fw-normal mb-0">
                This project was funded by a <a href="https://dceg.cancer.gov/news-events/news/2021/2021-informatics-tool-challenge" target="_blank">DCEG Informatic Tool Challenge</a> award.
              </p>
            </Col>
            <Col className="fw-normal text-end" xl={4}>
              <div className="px-3" style={{ borderRight: "5px solid #FA6951" }}>
                <div>Learn about how to get started:</div>
                <Button variant="outline-primary" className="m-3 px-4 pill-button" onClick={() => { navigate('/about') }}>
                  About Page
                </Button>
                <div>Questions, comments or concerns, get in contact with ICD Genie Support</div>
                <Button variant="outline-primary" className="m-3 px-4 pill-button" onClick={() => window.location.href = "mailto:NCIICDGenieWebAdmin@mail.nih.gov"}>
                  Contact Us
                </Button>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
}
