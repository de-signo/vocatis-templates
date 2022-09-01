import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { ActivatedRoute } from "@angular/router";
import { LeanButtonModel } from "./app-data.model";

@Injectable({
  providedIn: "root",
})
export class StyleService {
  view: "" | "print" = "";
  activeStyle: "select" | "ticket" = "select";
  ticketShowQrCode = false;
  listShowQrCode = false;
  aptErrorInfo: string = "";
  enablePrint = false;
  enablePostpone = false;
  late: null | number = null;
  appShowWaitTime = false;
  listShowWaitTime = false;
  arrow: "right" | "down" = "right";
  trackingId = "";
  planToQueue!: { queue: string; categories: string[] };
  buttons: LeanButtonModel[] = [];

  // forgot qr code
  scanShowForgotQrCode = false;
  forgotQrCodeQueue: string = "";
  forgotQrCodeCategories: string[] = [];

  // for default ticket
  ticketId: string = "";
  ticketNumber: string = "";

  constructor(route: ActivatedRoute) {
    route.queryParams.subscribe((params) => {
      const qr = params["s/qr"];
      this.listShowQrCode = environment.enableApp && (qr == 1 || qr == 3);
      this.ticketShowQrCode = environment.enableApp && (qr == 2 || qr == 3);
      this.enablePrint = params["s/mode"] == "print";
      const ar = params["s/ar"];
      this.arrow = ar == "d" ? "down" : "right";
      const pp = params["s/pp"];
      this.enablePostpone = pp == "1" || pp == 1;
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
      const apt_qi = params["s/ap_qi"];
      this.planToQueue = { queue: apt_qi, categories: apt_cats };

      // read buttons
      let j = 1;
      let btns = [] as LeanButtonModel[];
      while (true) {
        let t = params["s/text" + j];
        let qi = params["s/queueid" + j];
        let ci = params["s/catid" + j] ?? [];
        if (!t && !qi) break;
        btns.push({ title: t, queue: qi, categories: ci });
        j++;
      }
      this.buttons = btns;

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
      if (style.startsWith("vocatis_ticket_default")) {
        this.activeStyle = "ticket";
        this.listShowQrCode = environment.enableApp; // overwrite s/qr parameter
      } else {
        this.activeStyle = "select";
      }
    });
  }
}
