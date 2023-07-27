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
