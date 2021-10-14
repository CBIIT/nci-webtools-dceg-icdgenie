import { Component } from "@angular/core";
import { ActivatedRoute } from "@angular/router";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent {
  links = [
    { title: "Home", target: "/home" },
    { title: "Search", target: "/search" },
    { title: "About", target: "/about" },
  ];

  constructor(public route: ActivatedRoute) {}
}
