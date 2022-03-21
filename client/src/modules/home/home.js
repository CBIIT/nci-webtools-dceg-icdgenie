import { NavLink } from "react-router-dom";
import Container from "react-bootstrap/Container";
import HomeImage from "./images/landing-page.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCaretRight } from "@fortawesome/free-solid-svg-icons";
import { Row, Col } from "react-bootstrap";

export default function Home() {
  return (
    <>
      <div className="d-flex flex-column cover-image h-100 shadow-sm" style={{ backgroundImage: `url(${HomeImage})` }}>
        <Container className="d-flex h-75 flex-column justify-content-center align-items-center py-5">
          <div style={{ fontSize: '45px', color: 'white', fontWeight: '300', letterSpacing: '7px' }}>ICDGENIE</div>


          <NavLink className="col-xl-4 col-sm-11 btn btn-outline-primary mt-5 py-3" to="search" style={{ color: 'white', boxSizing: 'border-box', border: '5px solid white', backgroundColor: 'rgba(62,63,66,0.72)' }}>
            <Row style={{display: 'inline'}}>
              <Col xl={10} style={{ fontSize: '28px', letterSpacing: '2px', fontWeight: '300', display:'inline' }}>EXPLORE THE DATABASE</Col>
              <Col xl={2} style={{ display: 'inline'}}>
                <FontAwesomeIcon
                  className="mt-1"
                  icon={faCaretRight}
                  style={{ fontSize: "30px"}}
                />
              </Col>
            </Row>
          </NavLink>

        </Container>
        <div className="d-flex flex-grow-1  justify-content-center mt-4" style={{ backgroundColor: 'white', background: 'linear-gradient(270deg, #F1A193 0%, #A9E0FB 100%)' }}>
          <p className="col-xl-7 col-md-11 align-self-center mx-1 py-3" style={{ fontSize: '18px', lineHeight: '36px' }}>
            Accurate histological classification is important for facilitating studies of cancer epidemiology and
            etiologic heterogeneity. ICDgenie is a web-based tool that can assist epidemiologists, pathologists,
            research assistants, and data scientists to more easily access, translate and validate codes and text
            descriptions from the International Classification of Diseases (10th Edition) and International
            Classification of Diseases for Oncology, 3rd Edition (ICD-O-3). By improving accessibility and making
            existing cancer classification and coding schemes to be more readily understandable and searchable,
            ICDgenie will help accelerate descriptive and molecular epidemiological studies of cancer.
          </p>
        </div>
      </div>
    </>
  );
}
