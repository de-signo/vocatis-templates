import { registerLocaleData } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { LOCALE_ID, NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { RouterModule } from "@angular/router";
import { AppComponent } from "./app.component";
import localeDe from "@angular/common/locales/de";
import { PopupComponent } from "./popup/popup.component";
import { ListComponent } from "./list/list.component";

registerLocaleData(localeDe);

@NgModule({
  declarations: [AppComponent, PopupComponent, ListComponent],
  imports: [
    BrowserModule,
    HttpClientModule,
    RouterModule.forRoot([{ path: "**", component: AppComponent }]),
  ],
  providers: [{ provide: LOCALE_ID, useValue: "de-DE" }],
  bootstrap: [AppComponent],
})
export class AppModule {}
