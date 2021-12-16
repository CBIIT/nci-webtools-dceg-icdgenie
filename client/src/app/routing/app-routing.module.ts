import { NgModule } from "@angular/core";
import { RouterModule, Routes, RouteReuseStrategy } from "@angular/router";
import { HomeComponent } from "../home/home.component";
import { SearchComponent } from "../search/search.component";
import { AboutComponent } from "../about/about.component";
import { ApiAccessComponent } from "../api-access/api-access.component";
import { CustomReuseStrategy } from "./custom-reuse-strategy";

const routes: Routes = [
  { path: "home", component: HomeComponent },
  { path: "search", component: SearchComponent },
  { path: "about", component: AboutComponent },
  { path: "api-access", component: ApiAccessComponent },
  { path: "", redirectTo: "home", pathMatch: "full" },
  { path: "**", redirectTo: "" },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  providers: [{ provide: RouteReuseStrategy, useClass: CustomReuseStrategy }],
  exports: [RouterModule],
})
export class AppRoutingModule {}
