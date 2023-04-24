import { atom } from "recoil";

export const formState = atom({
  key: "batchQuery.formState",
  default: {
    input: "",
    inputType: "icd10",
    icd10Id: false,
    icdo3Site: false,
    icdo3Morph: false,
    inputPlaceholder: "",
  },
});

export const resultsState = atom({
  key: "batchQuery.resultsState",
  default: {
    loading: false,
    output: [],
    columns: [],
    columnExtensions: [],
  },
});
