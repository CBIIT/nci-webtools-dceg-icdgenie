import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { AppRoutingModule } from "./routing/app-routing.module";
import { HomeComponent } from "./home/home.component";
import { SearchComponent } from "./search/search.component";
import { AboutComponent } from "./about/about.component";
import { SearchService } from "./services/search/search.service";
import { AppComponent } from "./app.component";
import { NavbarComponent } from "./components/navbar/navbar.component";
import { FileValueAccessorDirective } from "./directives/file-value-accessor.directive";
import { ApiAccessComponent } from "./api-access/api-access.component";

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    HomeComponent,
    SearchComponent,
    AboutComponent,
    FileValueAccessorDirective,
    ApiAccessComponent,
  ],
  imports: [BrowserModule, AppRoutingModule, NgbModule],
  providers: [SearchService],
  bootstrap: [AppComponent],
})
export class AppModule {}
