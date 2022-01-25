import { atom } from "recoil";

export const defaultFormState = {
  search: "",
  indexData: [],
  neoplasmData: [],
  drugData: [],
  injuryData: [],
  icdo3Data: [],
  loading: false,
  submitted: false,
};

export const formState = atom({
  key: "search.formState",
  default: defaultFormState,
});
