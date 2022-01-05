import { NavLink } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import HomeImage from "./images/home.svg";

export default function Home() {
  return (
    <>
      <div className="cover-image py-5 mb-4 shadow-sm" style={{ backgroundImage: `url(${HomeImage})` }}>
        <Container>
          <h1 className="display-4 mb-4">
            <span className="d-inline-block py-4 border-bottom border-dark">Welcome to ICDGenie</span>
          </h1>

          <p className="lead">A search, translation, and validation service for ICD codes and descriptions</p>
          <NavLink className="btn btn-outline-primary" to="search">
            Explore Database
          </NavLink>
        </Container>
      </div>

      <Container className="mb-4">
        <Row>
          <Col md={4}>
            <h2 className="text-primary">Introduction</h2>
          </Col>
          <Col md={8}>
            <p>
              Accurate histological classification is important for facilitating studies of cancer epidemiology and
              etiologic heterogeneity. ICDgenie is a web-based tool that can assist epidemiologists, pathologists,
              research assistants, and data scientists to more easily access, translate and validate codes and text
              descriptions from the International Classification of Diseases (10th Edition) and International
              Classification of Diseases for Oncology, 3rd Edition (ICD-O-3). By improving accessibility and making
              existing cancer classification and coding schemes to be more readily understandable and searchable,
              ICDgenie will help accelerate descriptive and molecular epidemiological studies of cancer.
            </p>
          </Col>
        </Row>
      </Container>
    </>
  );
}
