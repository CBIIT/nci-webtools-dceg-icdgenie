import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import SearchForm from "../common/search-form";
import Button from "react-bootstrap/Button";
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
        <Container className="flex-grow-1 py-5" style={{ height: "17rem" }}>
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
      <div className="flex-grow-1 bg-light">
        <Container className=" py-3" style={{ fontSize: "15px" }}>
          <Row className="justify-content-center">
            <Col className="mb-4" xl={8}>
              <p className="fw-normal">
                ICD Genie is a translator for textual diagnoses, ICD-10, and ICD-O-3 codes sourced from the{" "}
                <a href="https://www.cms.gov/files/zip/2022-code-tables-tabular-and-index.zip" target="_blank">
                  Centers for Medicare & Medicaid Services (CMS)
                </a>
                , the{" "}
                <a href="https://www.naaccr.org/icdo3/" target="_blank">
                  North American Association of Central Cancer Registries (NAACCR)
                </a>
                , the{" "}
                <a href="https://seer.cancer.gov/icd-o-3/" target="_blank">
                  Surveillance, Epidemiology, and End Results (SEER) program validation list
                </a>
                , and the{" "}
                <a href="https://apps.who.int/iris/bitstream/handle/10665/96612/9789241548496_eng.pdf" target="_blank">
                  World Health Organization (WHO) ICD-O-3 publication
                </a>
                .
              </p>

              <p className="fw-normal">
                ICD Genie was created by Sairah Khan M.P.H., Shu-Hong Lin Ph.D., BVSc,{" "}
                <a href="https://dceg.cancer.gov/about/staff-directory/abubakar-Mustapha" target="_blank">
                  Mustapha Abubakar M.D., Ph.D.
                </a>{" "}
                and{" "}
                <a href="https://dceg.cancer.gov/about/staff-directory/machiela-mitchell" target="_blank">
                  {" "}
                  Mitchell J. Machiela Sc.D., MPH
                </a>{" "}
                of the NCI{" "}
                <a href="https://dceg.cancer.gov/" target="_blank">
                  Division of Cancer Epidemiology and Genetics (DCEG)
                </a>{" "}
                <a href="https://dceg.cancer.gov/about/organization/tdrp/iteb" target="_blank">
                  Integrative Tumor Epidemiology Branch
                </a>{" "}
                with assistance developing the tool from Brian Park B.S., Ben Chen B.S., Madhu Kanigicherla M.S., Pramiti Ganguli B.S., Hannah Stogsdill B.A., Kai-Ling
                Chen M.S. and Ye Wu Ph.D. of NCI’s{" "}
                <a href="https://datascience.cancer.gov/" target="_blank">
                  Center for Biomedical Informatics and Information Technology.
                </a>{" "}
                Many thanks to our colleagues who provided critical input during the design and development of ICD
                Genie!
              </p>

              <p className="fw-normal mb-0">
                This project was funded by a{" "}
                <a href="https://dceg.cancer.gov/news-events/news/2021/2021-informatics-tool-challenge" target="_blank">
                  DCEG Informatic Tool Challenge
                </a>{" "}
                award.
              </p>
            </Col>
            <Col className="fw-normal text-end" xl={4}>
              <div className="px-3">
                <div>Learn about how to get started:</div>
                <Link
                  className="m-3 btn btn-outline-primary rounded-pill"
                  to="/getting-started"
                >
                  Getting Started
                </Link>
                <div>For further details on ICD Genie, check out our About page:</div>
                <Link
                  className="m-3 btn btn-outline-primary rounded-pill"
                  to="/about"
                >
                  About
                </Link>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
}
