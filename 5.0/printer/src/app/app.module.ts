/*
 *  Copyright (C) 2023 DE SIGNO GmbH
 *
 *  This program is dual licensed. If you did not license the program under
 *  different terms, the following applies:
 *
 *  This program is free software: You can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Affero General Public License for more details.
 *
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 */

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
import { EnterAppointIdComponent } from "./enter-appoint-id/enter-appoint-id.component";
import { SelectAppointModeComponent } from "./select-appoint-mode/select-appoint-mode.component";
import { StyleService } from "./services/style.service";
import { APPOINTMENT_OPTIONS } from "vocatis-lib/dist/vocatis-appointments";
import { TouchClickDirective } from "./touchclick.directive";

registerLocaleData(localeDe);
registerLocaleData(localeEn);

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, "./assets/i18n/");
}

@NgModule({
  declarations: [
    FixedFocusDirective,
    TouchClickDirective,
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
    EnterAppointIdComponent,
    SelectAppointModeComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    NgIdleModule.forRoot(),
    RouterModule.forRoot([
      { path: "ticket", component: TicketComponent, outlet: "print" },
      { path: "groups/:index", component: SelectQueueComponent },
      { path: "groups", component: GroupsComponent },
      { path: "print-status/:type/:state", component: PrintComponent },
      { path: "select-queue", component: SelectQueueComponent },
      { path: "select-appoint-mode", component: SelectAppointModeComponent },
      { path: "scan-appointment", component: ScanAppointmentComponent },
      { path: "enter-appoint-id", component: EnterAppointIdComponent },
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
  providers: [{ provide: APPOINTMENT_OPTIONS, useExisting: StyleService }],
  bootstrap: [AppComponent],
})
export class AppModule {}
