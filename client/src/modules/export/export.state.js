import { atom } from "recoil";

export const defaultFormState = {
  type: "",
  input: "",
  output: [],
  outputType: 'icd10',
  columnExtension: [],
  loading: false,
  submitted: false,
};

export const formState = atom({
  key: "export.formState",
  default: defaultFormState,
});
