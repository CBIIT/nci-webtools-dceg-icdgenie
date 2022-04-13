import Accordion from "react-bootstrap/Accordion";
import Container from "react-bootstrap/Container";
import D3Tree, { prepareTreeData } from "../common/tree";

export default function ICD10Hierarchy({ form }) {
  const { indexData, neoplasmData, drugData, injuryData } = form;

  const indexTree = prepareTreeData(indexData, "Index");
  const neoplasmTree = prepareTreeData(neoplasmData, "Neoplasm", { label: (d) => d.neoplasm });
  const drugTree = prepareTreeData(drugData, "Drug", { label: (d) => d.substance });
  const injuryTree = prepareTreeData(injuryData, "Injury");

  return (
    <Container className="py-5 col-xl-8 col-sm-12">
      <Accordion defaultActiveKey="0" alwaysOpen className="mb-4 index">
        <Accordion.Item eventKey="0">
          <Accordion.Header>
            <span className="accordion-font">INDEX HIERARCHY</span>
          </Accordion.Header>
          <Accordion.Body className="overflow-auto">
            {indexData.length ?
              <D3Tree {...indexTree} className="mw-100" style={{ maxHeight: "800px" }} />
              :
              <big className="d-flex justify-content-center my-4 text-muted" >
                No Data
              </big>}
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>

      <Accordion defaultActiveKey="0" alwaysOpen className="mb-4 neoplasm">
        <Accordion.Item eventKey="0">
          <Accordion.Header>
            <span className="accordion-font">NEOPLASM HIERARCHY</span>
          </Accordion.Header>
          <Accordion.Body className="overflow-auto">
            {neoplasmData.length ?
              <D3Tree {...neoplasmTree} className="mw-100" style={{ maxHeight: "800px" }} />
              :
              <big className="d-flex justify-content-center my-4 text-muted" >
                No Data
              </big>}
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>

      <Accordion defaultActiveKey="0" alwaysOpen className="mb-4 drug">
        <Accordion.Item eventKey="0">
          <Accordion.Header>
            <span className="accordion-font">DRUG HIERARCHY</span>
          </Accordion.Header>
          <Accordion.Body className="overflow-auto">
            {drugData.length ?
              <D3Tree {...drugTree} className="mw-100" style={{ maxHeight: "800px" }} />
              :
              <big className="d-flex justify-content-center my-4 text-muted" >
                No Data
              </big>}
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>

      <Accordion defaultActiveKey="0" alwaysOpen className="mb-4 injury">
        <Accordion.Item eventKey="0">
          <Accordion.Header>
            <span className="accordion-font">INJURY HIERARCHY</span>
          </Accordion.Header>
          <Accordion.Body className="overflow-auto">
            {injuryData.length ?
              <D3Tree {...injuryTree} className="mw-100" style={{ maxHeight: "800px" }} />
              :
              <big className="d-flex justify-content-center my-4 text-muted" >
                No Data
              </big>}
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    </Container>
  );
}
