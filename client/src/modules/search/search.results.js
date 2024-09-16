import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import ICD10 from "./search.icd10";
import ICDO3 from "./search.icdo3";
import { useEffect, useState } from "react";

export default function SearchResults({ query, maps, search }) {
  const [tab, setTab] = useState("icd10CodeTable")

  useEffect(() => {
    if (maps.icdo3.length === 0)
      setTab("icd10CodeTable")
    else if (maps.tabular.size === 0 && maps.neoplasm.size === 0 && maps.drug.size === 0 && maps.injury.size === 0)
      setTab("icdo3CodeTable")
    else 
      setTab("icd10CodeTable")
  }, [maps])
  
  return (
    <Tabs
      id="results-tabs"
      activeKey={tab}
      className="d-flex justify-content-center bg-primary-light"
      onSelect={(e) => setTab(e)}
      >
      <Tab eventKey="icd10CodeTable" title="ICD-10 Code Table">

        <ICD10 maps={maps} search={search} />
      </Tab>
      <Tab eventKey="icdo3CodeTable" title="ICD-O-3 Code Table">
        <ICDO3 maps={maps}/>
      </Tab>
      {/*<Tab eventKey="contact" title="ICD-10 Hierarchy">
        <div className="bg-light">
          <ICD10Hierarchy form={results} maps={maps}/>
        </div>
    </Tab>*/}
    </Tabs>
  );
}
