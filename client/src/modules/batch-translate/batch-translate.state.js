import { atom } from "recoil";

export const formState = atom({
  key: "batchTranslate.formState",
  default: {
    input: "",
    from: "icd10", // "icd10" (10 -> 11) or "icd11" (11 -> 10)
    id: false, // Participant ID column present in the input
  },
});

export const resultsState = atom({
  key: "batchTranslate.resultsState",
  default: {
    loading: false,
    from: "icd10",
    id: false, // whether the submitted batch included Participant IDs
    output: [], // array of per-input results from /api/batch-translate
  },
});
