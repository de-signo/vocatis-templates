import { registerLocaleData } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { ErrorHandler, LOCALE_ID, NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { RouterModule } from "@angular/router";
import { AppComponent } from "./app.component";
import localeDe from "@angular/common/locales/de";
import { PopupComponent } from "./popup/popup.component";
import { ListComponent } from "./list/list.component";
import { AppErrorHandler } from "./error-handler/app-error-handler";

registerLocaleData(localeDe);

@NgModule({
  declarations: [AppComponent, PopupComponent, ListComponent],
  imports: [
    BrowserModule,
    HttpClientModule,
    RouterModule.forRoot([{ path: "**", component: AppComponent }]),
  ],
  providers: [
    { provide: LOCALE_ID, useValue: "de-DE" },
    { provide: ErrorHandler, useClass: AppErrorHandler },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
