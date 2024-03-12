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

import { EventEmitter, Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import { TemplateService } from "@isign/forms-templates";
import { IAppointmentOptions } from "vocatis-lib/dist/vocatis-appointments";

@Injectable({
  providedIn: "root",
})
export class StyleService implements IAppointmentOptions {
  view: "" | "print" = "";
  activeStyle: "select" | "printer" | "appointment" | "groups" | "ticket" =
    "select";
  ticketShowQrCode = false;
  listShowQrCode = false;
  idleTimeout = 10;
  appointmentTimeout = 5;
  aptErrorInfo: string = "";
  enablePrint = false;
  late: null | number = null;
  appShowWaitTime = false;
  listShowWaitTime = false;
  arrow: "right" | "down" = "right";
  trackingId = "";

  // multilang
  enableMultilang?: boolean;
  enableAppMultilang?: boolean;

  // mapper (IAppointmentOptions)
  planToQueue: { [key: string]: { queue: string; categories: string[] } } = {};
  postponeOffset?: number;
  numberSource?: "auto" | "T3" | "T4" | "T5" | "user";

  // appointment mode and forgot qr code
  appointmentMode = AppointmentModes.QRCode;
  scanShowForgotQrCode = false;
  forgotQrCodeQueue: string = "";
  forgotQrCodeCategories: string[] = [];

  // groups
  entryPage: "groups" | "select" = "groups";

  // for default ticket
  ticketId?: string;
  ticketNumber?: string;

  updated = new EventEmitter();

  constructor(tmplSvc: TemplateService) {
    const tmpl = tmplSvc.getTemplate();
    const params = tmpl.parameters;

    const qr = params["qr"];
    this.listShowQrCode = environment.enableApp && (qr == "1" || qr == "3");
    this.ticketShowQrCode = environment.enableApp && (qr == "2" || qr == "3");
    this.enablePrint = params["mode"] == "print";

    // multilang
    const ml = params["ml"];
    this.enableMultilang = ml == "1" || ml == "3";
    this.enableAppMultilang = ml == "2" || ml == "3";

    // timeouts
    // if only one is set, use it for both, if non is set, use max
    const it = parseInt(params["it"] ?? "NaN");
    const at = parseInt(params["at"] ?? "NaN");
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

    const ar = params["ar"];
    this.arrow = ar == "d" ? "down" : "right";
    const pp = params["pp"];
    this.postponeOffset = !pp && pp != "0" ? undefined : 1000 * parseInt(pp);
    const lt = parseInt(params["lt"] ?? "NaN");
    this.late = Number.isNaN(lt) ? null : lt;
    this.aptErrorInfo = params["aei"] ?? "";
    this.view = <"" | "print">params["view"] ?? "";
    const wt = params["wt"];
    this.appShowWaitTime = wt == "2" || wt == "2" || wt == "3" || wt == "3";
    this.listShowWaitTime = wt == "1" || wt == "1" || wt == "3" || wt == "3";
    this.trackingId = params["tracking_id"] ?? "";

    // read plan / queue map
    const apt_cats = params["catid_apt"]?.split(",") ?? [];
    let i = 1;
    let p2q = {} as {
      [key: string]: { queue: string; categories: string[] };
    };
    while (true) {
      let pn = params["ap_pn" + i];
      let qi = params["ap_qi" + i];
      if (!pn || !qi) break;
      p2q[pn] = { queue: qi, categories: apt_cats };
      i++;
    }
    this.planToQueue = p2q;
    this.numberSource = <any>params["ns"] ?? "auto";

    // appointment mode and forgot
    const apm = parseInt(params["apm"] ?? "1");
    this.appointmentMode = apm;
    this.scanShowForgotQrCode =
      (apm & AppointmentModes.Forgot) == AppointmentModes.Forgot;
    this.forgotQrCodeCategories = params["fgc"]?.split(",") ?? [];
    this.forgotQrCodeQueue = params["fgq"] ?? "";

    // groups
    const entryPage = params["entry"];
    this.entryPage = entryPage === "s" ? "select" : "groups";

    // default ticket params
    this.ticketId = params["id"];
    this.ticketNumber = params["ticketnumber"];

    // detect witch style was selected
    var style = tmpl.key ?? "";
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
  }
}

export enum AppointmentModes {
  QRCode = 1,
  AppointmentId = 2,
  Forgot = 4,
}
