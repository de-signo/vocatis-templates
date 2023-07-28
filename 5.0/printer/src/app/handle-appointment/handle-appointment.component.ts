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

import { Component } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { AppLinkService } from "../services/app-link.service";
import { ScanAppointmentService } from "../services/scan-appointment.service";
import { StyleService } from "../services/style.service";
import { TicketService } from "../services/ticket.service";

@Component({
  selector: "vpr-handle-appointment",
  templateUrl: "./handle-appointment.component.html",
  styleUrls: ["./handle-appointment.component.scss"],
})
export class HandleAppointmentComponent {
  get locale() {
    return this.translateService.currentLang;
  }
  get showQrCode(): boolean {
    return this.style.listShowQrCode;
  }
  get errorInfo() {
    return this.style.aptErrorInfo;
  }
  get state() {
    return this.scan.state;
  }
  get aptDate() {
    return this.scan.currentDate;
  }

  constructor(
    private scan: ScanAppointmentService,
    private style: StyleService,
    private ticket: TicketService,
    private appLink: AppLinkService,
    private translateService: TranslateService
  ) {}

  getAppLink(): string {
    if (!this.scan.number) return "";
    return this.appLink.getAppUrl(this.scan.number.id);
  }

  print() {
    if (!this.scan.number) return;
    this.ticket.handlePrintTicket(this.scan.number);
  }
}
