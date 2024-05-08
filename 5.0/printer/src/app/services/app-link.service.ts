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

import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { HttpParams, HttpRequest } from "@angular/common/http";
import { StyleService } from "./style.service";
import { TranslateService } from "@ngx-translate/core";

@Injectable({
  providedIn: "root",
})
export class AppLinkService {
  private absoluteAppUrl: string;
  /*
   * app query params:
   * o: Options ("wt": showWaitTime)
   * lang: default lang
   * t: tracking id
   *
   * for exisitng ticket:
   * id: ticket id
   *
   * for new ticket:
   * q: queue
   * c: categories
   */
  constructor(
    private style: StyleService,
    private translate: TranslateService,
  ) {
    var appPath = environment.appUrl;
    // = "../app/index.html"
    var basePath = document.baseURI;
    // = "/forms/XYZ/printer"
    this.absoluteAppUrl = new URL(appPath, document.baseURI).href;
    // = "http://host/forms/XYZ/app.index.html"
  }

  getAppTicketUrl(queue: string, categories: string[] | undefined): string {
    const params = new HttpParams()
      .set("o", this.style.appShowWaitTime ? "wt" : "")
      .set("t", this.style.trackingId)
      .set("l", this.translate.currentLang)
      .set("m", this.style.enableAppMultilang ? 1 : 0)
      .set("q", queue)
      .set("c", categories?.join(",") ?? "");

    const request = new HttpRequest("GET", this.absoluteAppUrl, null, {
      params,
    });
    return request.urlWithParams;
  }

  getAppUrl(id: string): string {
    const params = new HttpParams()
      .set("o", this.style.appShowWaitTime ? "wt" : "")
      .set("t", this.style.trackingId)
      .set("l", this.translate.currentLang)
      .set("m", this.style.enableAppMultilang ? 1 : 0)
      .set("i", id);

    const request = new HttpRequest("GET", this.absoluteAppUrl, null, {
      params,
    });
    return request.urlWithParams;
  }
}
