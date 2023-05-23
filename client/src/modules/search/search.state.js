import { atom, selectorFamily } from "recoil";
import { getSearchResults } from "./search.utils";

export const searchState = atom({
  key: "search.searchState",
  default: "",
});

export const modalState = atom({
  key: "search.modalState",
  default: {
    open: false,
    title: "",
    body: "",
  },
});
