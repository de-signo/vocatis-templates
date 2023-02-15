import { EventEmitter, Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { ActivatedRoute } from "@angular/router";

@Injectable({
  providedIn: "root",
})
export class StyleService {
  view: "" | "print" = "";
  activeStyle: "select" | "printer" | "appointment" | "groups" | "ticket" =
    "select";
  ticketShowQrCode = false;
  listShowQrCode = false;
  idleTimeout = 10;
  aptErrorInfo: string = "";
  enablePrint = false;
  postponeOffset?: number;
  late: null | number = null;
  appShowWaitTime = false;
  listShowWaitTime = false;
  arrow: "right" | "down" = "right";
  trackingId = "";
  planToQueue: { [key: string]: { queue: string; categories: string[] } } = {};

  // forgot qr code
  scanShowForgotQrCode = false;
  forgotQrCodeQueue: string = "";
  forgotQrCodeCategories: string[] = [];

  // for default ticket
  ticketId: string = "";
  ticketNumber: string = "";

  updated = new EventEmitter();

  constructor(route: ActivatedRoute) {
    route.queryParams.subscribe((params) => {
      const qr = params["s/qr"];
      this.listShowQrCode = environment.enableApp && (qr == 1 || qr == 3);
      this.ticketShowQrCode = environment.enableApp && (qr == 2 || qr == 3);
      this.enablePrint = params["s/mode"] == "print";
      const it = parseInt(params["s/it"]);
      this.idleTimeout = Number.isNaN(it) ? 10 : it;
      const ar = params["s/ar"];
      this.arrow = ar == "d" ? "down" : "right";
      const pp = params["s/pp"];
      this.postponeOffset =
        !pp && pp != "0" && pp != 0 ? undefined : 1000 * parseInt(pp);
      const lt = parseInt(params["s/lt"]);
      this.late = Number.isNaN(lt) ? null : lt;
      this.aptErrorInfo = params["s/aei"] ?? "";
      this.view = params["view"] ?? "";
      const wt = params["s/wt"];
      this.appShowWaitTime = wt == "2" || wt == 2 || wt == "3" || wt == 3;
      this.listShowWaitTime = wt == "1" || wt == 1 || wt == "3" || wt == 3;
      this.trackingId = params["s/tracking_id"] ?? "";
      // read plan / queue map
      const apt_cats = params["s/catid_apt"] ?? [];
      let i = 1;
      let p2q = {} as {
        [key: string]: { queue: string; categories: string[] };
      };
      while (true) {
        let pn = params["s/ap_pn" + i];
        let qi = params["s/ap_qi" + i];
        if (!pn && !qi) break;
        p2q[pn] = { queue: qi, categories: apt_cats };
        i++;
      }
      this.planToQueue = p2q;

      // forgot qrCode params
      const fg = params["s/fg"];
      this.scanShowForgotQrCode = fg == "1" || fg == 1;
      this.forgotQrCodeCategories = params["s/fgc"] ?? [];
      this.forgotQrCodeQueue = params["s/fgq"];

      // default ticket params
      this.ticketId = params["s/id"];
      this.ticketNumber = params["s/ticketnumber"];

      // detect witch style was selected
      var style = params["s"] ?? "";
      if (style.startsWith("vocm19aponly")) {
        this.activeStyle = "appointment";
      } else if (style.startsWith("vocatis_multi_2019_groupconfig")) {
        this.activeStyle = "groups";
      } else if (style.startsWith("vocatic_multi_2019")) {
        this.activeStyle = "printer";
      } else if (style.startsWith("vocatis_ticket_default")) {
        this.activeStyle = "ticket";
        this.ticketShowQrCode = environment.enableApp; // overwrite s/qr parameter
      } else {
        this.activeStyle = "select";
      }

      this.updated.emit();
    });
  }
}
