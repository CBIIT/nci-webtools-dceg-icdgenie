import { atom } from "recoil";

export const formState = atom({
  key: "batchQuery.formState",
  default: {
    input: "",
    inputType: "icd10",
    icd10Id: false,
    icd10pcsId: false,
    icd11Id: false,
    icdo3Id: false,
    icdo3Site: false,
    icdo3Morph: false,
    icdo4Id: false,
    icdo4Site: false,
    icdo4Morph: false,
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
