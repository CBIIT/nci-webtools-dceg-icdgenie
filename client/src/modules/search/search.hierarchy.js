import Accordion from "react-bootstrap/Accordion";
import Container from "react-bootstrap/Container";
import D3Tree, { prepareTreeData } from "../common/tree";

export default function ICD10Hierarchy({ form, maps }) {
  const { tabular, neoplasm, drug, injury } = maps;

  const indexTree = prepareTreeData(tabular ? tabular : [], "Index");
  const neoplasmTree = prepareTreeData(neoplasm ? neoplasm : [], "Neoplasm", { label: (d) => d.description });
  const drugTree = prepareTreeData(drug ? drug : [], "Drug", { label: (d) => d.description });
  const injuryTree = prepareTreeData(injury ? injury : [], "Injury");

  return (
    <Container className="py-5 col-xl-8 col-sm-12">
      <Accordion defaultActiveKey="0" alwaysOpen className="mb-4 index">
        <Accordion.Item eventKey="0">
          <Accordion.Header>
            <span className="accordion-font">INDEX HIERARCHY</span>
          </Accordion.Header>
          <Accordion.Body className="overflow-auto">
            {indexTree.data ?
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
            {neoplasmTree.data ?
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
            {drugTree.data ?
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
            {injuryTree.data ?
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
