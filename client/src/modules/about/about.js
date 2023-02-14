import { Container, Row, Col } from "react-bootstrap";
import AboutImage from "./images/about.png";

export default function About() {
  return (
    <div className="h-100 bg-white">
      <Container className="py-3">
        <h1 className="display-6 page-header text-muted text-center text-uppercase ">About</h1>
      </Container>

      <hr />

      <Row>
        <Col lg={4} className="mw-lg-100">
          <img src={AboutImage} style={{ width: "150%", aspectRatio: "1.5" }}></img>
        </Col>
        <Col lg={8}>
          <Container className="py-5">
            <h5 className="my-4 blue-subheader">A Little Background</h5>
            <p>
              Accurate histological classification is important for facilitating studies of cancer epidemiology and
              etiologic heterogeneity. ICD Genie is a web-based tool that can assist epidemiologists, pathologists,
              research assistants, and data scientists to more easily access, translate and validate codes and text
              descriptions from the International Classification of Diseases (10th Edition) and International
              Classification of Diseases for Oncology, 3rd Edition (ICD-O-3).
            </p>

            <p>
              Although many of the early classification and coding conventions have remained unchanged in successive
              versions of ICD and ICD-O, substantial revisions have been made in more recent versions i.e., ICD-10 and
              ICD-O-3. Depending on when data were collected, epidemiological studies and cancer databases may employ
              different ICD versions, thereby hampering data harmonization. In addition, tumor-related data may be
              available only in pathology reports, in text formats, or as ICD codes, which can be difficult to translate
              for non-specialists.
            </p>

            <p>
              To address these challenges, we developed ICD Genie as a publicly available web tool to facilitate the
              translation of ICD-10 and ICD-O-3 codes to human-readable text and vice versa. By improving accessibility
              and making existing cancer classification and coding schemes more readily understandable and searchable,
              ICD Genie will help accelerate descriptive and molecular epidemiological studies of cancer.
            </p>
          </Container>
        </Col>
      </Row>
    </div>
  );
}
