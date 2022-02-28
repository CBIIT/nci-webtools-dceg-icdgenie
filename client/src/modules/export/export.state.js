import { atom } from "recoil";

export const defaultFormState = {
  type: "keywords",
  input: "",
  output: [],
  csv: '',
  outputType: "icd10",
  columns: [],
  columnExtension: [],
  loading: false,
  submitted: false,
};

export const formState = atom({
  key: "export.formState",
  default: defaultFormState,
});
