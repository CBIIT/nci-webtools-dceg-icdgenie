import { atom } from "recoil";

export const defaultFormState = {
  search: "",
  indexData: [],
  neoplasmData: [],
  drugData: [],
  injuryData: [],
  loading: false,
  submitted: false,
};

export const formState = atom({
  key: "search.formState",
  default: defaultFormState,
});
