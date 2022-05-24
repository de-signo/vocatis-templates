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
    private translate: TranslateService
  ) {
    var appPath = environment.appUrl;
    // = "../app/index.cshtml"
    var basePath = document.baseURI;
    // = "/forms/XYZ/printer"
    this.absoluteAppUrl = new URL(appPath, document.baseURI).href;
    // = "http://host/forms/XYZ/app.index.cshtml"
  }

  getAppTicketUrl(queue: string, categories: string[] | undefined): string {
    const params = new HttpParams()
      .set("o", this.style.appShowWaitTime ? "wt" : "")
      .set("t", this.style.trackingId)
      .set("l", this.translate.currentLang)
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
      .set("i", id);

    const request = new HttpRequest("GET", this.absoluteAppUrl, null, {
      params,
    });
    return request.urlWithParams;
  }
}
