import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import ICD10 from "./search.icd10";
import ICDO3 from "./search.icdo3";
import ICD11 from "./search.icd11";
import ICDO4 from "./search.icdo4";
import ICD10PCS from "./search.icd10pcs";
import { useEffect, useState } from "react";

export default function SearchResults({ query, maps, search, totals = {}, resultLimit = 0 }) {
  const [tab, setTab] = useState("icd10Codes")

  const hasIcd10 = maps.tabular.size > 0 || maps.neoplasm.size > 0 || maps.drug.size > 0 || maps.injury.size > 0;
  const hasIcdo3 = maps.icdo3.length > 0;
  const hasIcd11 = maps.icd11.size > 0;
  const hasIcdo4 = maps.icdo4.length > 0;
  const hasIcd10pcs = maps.icd10pcs.length > 0;

  //True match count backing each tab (ICD-10-CM shows the tabular list).
  const tabTotals = {
    icd10Codes: totals.tabular || 0,
    icd10pcsCodes: totals.icd10pcs || 0,
    icd11Codes: totals.icd11 || 0,
    icdo3Codes: totals.icdo3 || 0,
    icdo4Codes: totals.icdo4 || 0,
  };
  const activeTotal = tabTotals[tab] || 0;
  const truncated = resultLimit > 0 && activeTotal > resultLimit;

  useEffect(() => {
    if (hasIcd10) setTab("icd10Codes")
    else if (hasIcd10pcs) setTab("icd10pcsCodes")
    else if (hasIcd11) setTab("icd11Codes")
    else if (hasIcdo3) setTab("icdo3Codes")
    else if (hasIcdo4) setTab("icdo4Codes")
    else setTab("icd10Codes")
  }, [maps])

  return (
    <>
    {truncated &&
      <div className="text-center py-2 px-3" style={{ backgroundColor: "#fff3cd", color: "#664d03" }} role="status">
        Showing the first {resultLimit.toLocaleString()} of {activeTotal.toLocaleString()} matches. Refine your search to narrow the results.
      </div>
    }
    <Tabs
      id="results-tabs"
      activeKey={tab}
      className="d-flex justify-content-center bg-primary-light"
      onSelect={(e) => setTab(e)}
      >
      <Tab eventKey="icd10Codes" title="ICD-10-CM">
        <ICD10 maps={maps} search={search} />
      </Tab>
      <Tab eventKey="icd10pcsCodes" title="ICD-10-PCS">
        <ICD10PCS maps={maps} />
      </Tab>
      <Tab eventKey="icd11Codes" title="ICD-11">
        <ICD11 maps={maps} search={search} />
      </Tab>
      <Tab eventKey="icdo3Codes" title="ICD-O-3">
        <ICDO3 maps={maps} />
      </Tab>
      <Tab eventKey="icdo4Codes" title="ICD-O-4">
        <ICDO4 maps={maps} />
      </Tab>
    </Tabs>
    </>
  );
}
