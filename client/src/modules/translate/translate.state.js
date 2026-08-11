import { atom } from "recoil";

export const formState = atom({
  key: "translate.formState",
  default: {
    code: "",
    from: "icd10", // "icd10" (10 -> 11) or "icd11" (11 -> 10)
  },
});

export const resultsState = atom({
  key: "translate.resultsState",
  default: {
    loading: false,
    data: null, // response payload from /api/translate
  },
});
