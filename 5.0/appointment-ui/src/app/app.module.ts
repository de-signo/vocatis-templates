import { registerLocaleData } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { ErrorHandler, LOCALE_ID, NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { RouterModule } from "@angular/router";
import { AppComponent } from "./app.component";
import localeDe from "@angular/common/locales/de";
import { ListComponent } from "./list/list.component";
import { AppErrorHandler } from "./error-handler/app-error-handler";
import { StyleService } from "./services/style.service";
import { APPOINTMENT_OPTIONS } from "vocatis-lib/dist/vocatis-appointments";

registerLocaleData(localeDe);

@NgModule({
  declarations: [AppComponent, ListComponent],
  imports: [
    BrowserModule,
    HttpClientModule,
    RouterModule.forRoot([{ path: "**", component: AppComponent }]),
  ],
  providers: [
    { provide: LOCALE_ID, useValue: "de-DE" },
    { provide: ErrorHandler, useExisting: AppErrorHandler },
    { provide: APPOINTMENT_OPTIONS, useExisting: StyleService },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
