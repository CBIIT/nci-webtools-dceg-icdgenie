import { useRecoilValue } from "recoil";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import { resultsSelector } from "./search.state";
import ICD10 from "./search.icd10";
import ICDO3 from "./search.icdo3";
import ICD10Hierarchy from "./search.hierarchy";

export default function SearchResults({ query, maps }) {
  const results = useRecoilValue(resultsSelector(query));
  return (
    <Tabs
      id="results-tabs"
      defaultActiveKey="icd10CodeTable"
      className="d-flex justify-content-center bg-primary-light">
      <Tab eventKey="icd10CodeTable" title="ICD-10 Code Table">
        <div className="bg-light">
          <ICD10 form={results} maps={maps} />
        </div>
      </Tab>
      <Tab eventKey="icdo3CodeTable" title="ICD-O-3 Code Table">
        <div className="bg-light">
          <ICDO3 form={results} maps={maps} />
        </div>
      </Tab>
      <Tab eventKey="contact" title="ICD-10 Hierarchy">
        <div className="bg-light">
          <ICD10Hierarchy form={results} maps={maps}/>
        </div>
      </Tab>
    </Tabs>
  );
}
