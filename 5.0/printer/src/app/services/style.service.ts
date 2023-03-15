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
  appointmentTimeout = 5;
  aptErrorInfo: string = "";
  enablePrint = false;
  postponeOffset?: number;
  late: null | number = null;
  appShowWaitTime = false;
  listShowWaitTime = false;
  arrow: "right" | "down" = "right";
  trackingId = "";
  planToQueue: { [key: string]: { queue: string; categories: string[] } } = {};

  // appointment mode and forgot qr code
  appointmentMode = AppointmentModes.QRCode;
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

      // timeouts
      // if only one is set, use it for both, if non is set, use max
      const it = parseInt(params["s/it"]);
      const at = parseInt(params["s/at"]);
      if (Number.isNaN(it)) {
        if (Number.isNaN(at)) {
          this.idleTimeout = 60;
          this.appointmentTimeout = 60;
        } else {
          this.idleTimeout = at;
          this.appointmentTimeout = at;
        }
      } else if (Number.isNaN(at)) {
        this.idleTimeout = it;
        this.appointmentTimeout = it;
      } else {
        this.idleTimeout = it;
        this.appointmentTimeout = at == 0 ? it : at;
      }

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

      // appointment mode and forgot
      const apm = parseInt(params["s/apm"] ?? "1");
      this.appointmentMode = apm;
      this.scanShowForgotQrCode =
        (apm & AppointmentModes.Forgot) == AppointmentModes.Forgot;
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

export enum AppointmentModes {
  QRCode = 1,
  AppointmentId = 2,
  Forgot = 4,
}
