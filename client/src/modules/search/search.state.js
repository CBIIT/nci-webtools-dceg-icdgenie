import { atom } from "recoil";

export const defaultFormState = {
  search: "",
  neoplasmData: [],
  submitted: false,
};

export const formState = atom({
  key: "search.formState",
  default: defaultFormState,
});
