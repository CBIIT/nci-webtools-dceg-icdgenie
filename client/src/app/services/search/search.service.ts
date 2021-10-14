import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class SearchService {
  constructor() {}

  getCodeFromDescription(description: string) {}

  getDescriptionFromCode(code: string) {}
}
