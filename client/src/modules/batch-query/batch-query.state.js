import { atom } from "recoil";

export const formState = atom({
  key: "batchQuery.formState",
  default: {
    input: "",
    inputType: "icd10",
    subType: "site",
    outputType: "icdo3",
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
