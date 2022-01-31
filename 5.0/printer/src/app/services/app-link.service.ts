import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { AppointmentModel, ButtonModel, GroupModel, WaitNumberModel } from './app-data.model';
import { HttpClient, HttpHeaders, HttpParams, HttpRequest } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { first, tap } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';
import { StyleService } from './style.service';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root'
})
export class AppLinkService {
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
  constructor(private style: StyleService, private translate: TranslateService) {}

  getAppTicketUrl(queue: string, categories: string[]|undefined) : string {
    const params = new HttpParams()
      .set('o', this.style.showWaitTime ? "wt" : "")
      .set('t', this.style.trackingId)
      .set('lang', this.translate.currentLang)
      .set('q', queue)
      .set('c', categories?.join(",") ?? "");

    const request = new HttpRequest('GET', environment.appUrl, null, {params});
    return request.urlWithParams;
  }

  getAppUrl(id: string): string {
    const params = new HttpParams()
      .set('o', this.style.showWaitTime ? "wt" : "")
      .set('t', this.style.trackingId)
      .set('lang', this.translate.currentLang)
      .set('id', id);

    const request = new HttpRequest('GET', environment.appUrl, null, {params});
    return request.urlWithParams;
  }
}
