import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import * as SwaggerUI from "swagger-ui";

@Component({
  selector: "app-api-access",
  templateUrl: "./api-access.component.html",
  styleUrls: ["./api-access.component.scss"],
})
export class ApiAccessComponent implements AfterViewInit {
  @ViewChild("swaggerContainer") swaggerContainer;

  constructor() {
    this.swaggerContainer = new ElementRef(null);
  }

  ngAfterViewInit(): void {
    SwaggerUI({
      domNode: this.swaggerContainer.nativeElement,
      url: "assets/api.json",
    });
  }
}
