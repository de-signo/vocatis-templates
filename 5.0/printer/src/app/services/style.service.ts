import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ButtonModel, WaitNumberModel } from './app-data.model';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { BehaviorSubject } from 'rxjs';
import { ActivatedRoute } from '@angular/router';


@Injectable({
  providedIn: 'root'
})
export class StyleService {
  view: ""|"print" = "";
  activeStyle: "select"|"printer"|"appointment"|"groups"|"ticket" = "select";
  ticketShowQrCode = false;
  listShowQrCode = false;
  enablePrint = false;
  enablePostpone = false;
  showWaitTime = false;
  trackingId = "";
  planToQueue: {[key: string]: { queue: string, categories: string[] }} = {};

  // for default ticket
  ticketId: string = "";
  ticketNumber: string = "";

  constructor(route: ActivatedRoute)
  {
    route.queryParams.subscribe(
      params => {
        const qr = params["s/qr"];
        this.listShowQrCode = environment.enableApp && (qr == 1 || qr == 3);
        this.ticketShowQrCode = environment.enableApp && (qr == 2 || qr == 3);
        this.enablePrint = params["s/mode"] == "print";
        const pp = params["s/pp"];
        this.enablePostpone = pp == "1" || pp == 1;
        this.view = params["view"] ?? "";
        const wt = params["s/wt"];
        this.showWaitTime = wt == "1" || wt == 1;
        this.trackingId = params["s/tracking_id"] ?? "";
        // read plan / queue map
        const apt_cats = params["s/catid_apt"] ?? [];
        let i = 1;
        let p2q = {} as {[key: string]: {queue: string, categories: string[]}};
        while (true) {
          let pn = params["s/ap_pn" + i];
          let qi = params["s/ap_qi" + i];
          if (!pn && !qi)
            break;
          p2q[pn] = { queue: qi, categories: apt_cats };
          i++;
        }
        this.planToQueue = p2q;

        // default ticket params
        this.ticketId = params["s/id"];
        this.ticketNumber = params["s/ticketnumber"];

        // detect witch style was selected
        var style = params["s"] ?? "";
        if (style.startsWith("vocm19aponly")) {
          this.activeStyle = "appointment";
        }
        else if (style.startsWith("vocatis_multi_2019_groupconfig")) {
          this.activeStyle = "groups";
        }
        else if (style.startsWith("vocatic_multi_2019")) {
          this.activeStyle = "printer";
        }
        else if (style.startsWith("vocatis_ticket_default")) {
          this.activeStyle = "ticket";
        }
        else {
          this.activeStyle = "select";
        }
      }
    )
  }
}
