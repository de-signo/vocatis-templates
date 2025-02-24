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

import {
  HttpClient,
  provideHttpClient,
  withInterceptorsFromDi,
} from "@angular/common/http";
import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { TranslateModule, TranslateLoader } from "@ngx-translate/core";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";
import { QRCodeModule } from "angularx-qrcode";
import { AppComponent } from "./app.component";
import localeDe from "@angular/common/locales/de";
import localeEn from "@angular/common/locales/en";
import { registerLocaleData } from "@angular/common";
import { RouterModule } from "@angular/router";
import { ISignServicesModule } from "@isign/isign-services";
import { VocatisApiModule } from "@isign/vocatis-api";
import { environment } from "app_src/environments/environment";
import { TemplateBaseRefModule } from "@isign/forms-templates";

registerLocaleData(localeDe);
registerLocaleData(localeEn);

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, "./assets/i18n/");
}

@NgModule({
  declarations: [AppComponent],
  bootstrap: [AppComponent],
  imports: [
    TemplateBaseRefModule.forRoot(),
    VocatisApiModule.withAutoSetup(),
    ISignServicesModule.forRoot(environment.wellKnownISignUrl, "disabled"),
    BrowserModule,
    RouterModule.forRoot([]),
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
  providers: [provideHttpClient(withInterceptorsFromDi())],
})
export class AppModule {}
