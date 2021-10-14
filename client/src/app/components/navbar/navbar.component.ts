import { Component, Input } from "@angular/core";

@Component({
  selector: "app-navbar",
  templateUrl: "./navbar.component.html",
  styleUrls: ["./navbar.component.scss"],
})
export class NavbarComponent {
  @Input() links: { target: string; title: string; exact?: boolean }[] = [];
  collapse: boolean = false;
}
