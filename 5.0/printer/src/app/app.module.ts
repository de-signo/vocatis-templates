import { HttpClient, HttpClientModule } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { RouterModule } from "@angular/router";
import { NgIdleModule } from "@ng-idle/core";
import { TranslateModule, TranslateLoader } from "@ngx-translate/core";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";
import { QRCodeModule } from "angularx-qrcode";
import { AppComponent } from "./app.component";
import { EntrySelectComponent } from "./entry-select/entry-select.component";
import { SelectQueueComponent } from "./select-queue/select-queue.component";
import { TicketComponent } from "./ticket/ticket.component";
import localeDe from "@angular/common/locales/de";
import localeEn from "@angular/common/locales/en";
import { registerLocaleData } from "@angular/common";
import { ScanAppointmentComponent } from "./scan-appointment/scan-appointment.component";
import { HandleAppointmentComponent } from "./handle-appointment/handle-appointment.component";
import { PrintComponent } from "./print/print.component";
import { FixedFocusDirective } from "./fixedfocus.directive";
import { GroupsComponent } from "./groups/groups.component";
import { SelectLangPipe } from "./select-lang.pipe";
import { InfoComponent } from "./info/info.component";

registerLocaleData(localeDe);
registerLocaleData(localeEn);

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, "./assets/i18n/");
}

@NgModule({
  declarations: [
    FixedFocusDirective,
    SelectLangPipe,
    AppComponent,
    EntrySelectComponent,
    SelectQueueComponent,
    TicketComponent,
    ScanAppointmentComponent,
    HandleAppointmentComponent,
    PrintComponent,
    GroupsComponent,
    InfoComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    NgIdleModule.forRoot(),
    RouterModule.forRoot([
      { path: "ticket", component: TicketComponent, outlet: "print" },
      { path: "groups/:index", component: SelectQueueComponent },
      { path: "groups", component: GroupsComponent },
      { path: "print-status", component: PrintComponent },
      { path: "select-queue", component: SelectQueueComponent },
      { path: "scan-appointment", component: ScanAppointmentComponent },
      { path: "handle-appointment", component: HandleAppointmentComponent },
      { path: "info", component: InfoComponent },
      { path: "**", component: EntrySelectComponent },
    ]),
    TranslateModule.forRoot({
      defaultLanguage: "de",
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
    }),
    QRCodeModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
