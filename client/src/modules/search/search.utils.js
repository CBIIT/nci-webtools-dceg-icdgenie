import axios from "axios";

export async function getSearchResults(query) {
  // perform queries in parallel
  const [indexResponse, neoplasmResponse, injuryResponse, drugResponse, icdo3Response] = await Promise.all([
    axios.get("api/search/icd10", { params: { query, type: "index", format: "tree" } }),
    axios.get("api/search/icd10", { params: { query, type: "neoplasm", format: "tree" } }),
    axios.get("api/search/icd10", { params: { query, type: "injury", format: "tree" } }),
    axios.get("api/search/icd10", { params: { query, type: "drug", format: "tree" } }),
    axios.get("api/search/icdo3", { params: { query } }),
  ]);

  return {
    indexData: indexResponse.data,
    neoplasmData: neoplasmResponse.data,
    drugData: drugResponse.data,
    injuryData: injuryResponse.data,
    icdo3Data: icdo3Response.data,
  };
}
