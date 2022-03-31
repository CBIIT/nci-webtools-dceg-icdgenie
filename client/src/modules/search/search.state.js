import { atom, selectorFamily } from "recoil";
import { getSearchResults } from "./search.utils";

export const searchState = atom({
  key: "search.searchState",
  default: "",
});

export const resultsSelector = selectorFamily({
  key: "search.resultsSelector",
  get:
    (query) =>
    async ({ get }) => {
      return query?.length > 0
        ? await getSearchResults(query)
        : {
            indexData: [],
            neoplasmData: [],
            drugData: [],
            injuryData: [],
            icdo3Data: [],
          };
    },
});

export const modalState = atom({
  key: "search.modalState",
  default: {
    open: false,
    title: "",
    body: "",
  },
});
