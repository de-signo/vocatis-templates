/*
 *  Copyright (C) 2023 DE SIGNO GmbH
 *
 *  This program is dual licensed. If you did not license the program under
 *  differnt tems, the following applies:
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

import { Component, OnInit } from "@angular/core";
import { Subscription, firstValueFrom, timer } from "rxjs";
import { ScanAppointmentService } from "../services/scan-appointment.service";
import { StyleService } from "../services/style.service";
import { TicketService } from "../services/ticket.service";

@Component({
  selector: "vpr-scan-appointment",
  templateUrl: "./scan-appointment.component.html",
  styleUrls: ["./scan-appointment.component.scss"],
})
export class ScanAppointmentComponent implements OnInit {
  timeout = false;
  isscanning = false;
  private timeoutSub?: Subscription;

  constructor(
    private scan: ScanAppointmentService,
    private style: StyleService,
    private ticket: TicketService
  ) {}

  get arrow() {
    return this.style.arrow;
  }

  get showForgotQR() {
    return this.style.scanShowForgotQrCode;
  }

  ngOnInit(): void {
    this.resetTimeout();
  }

  private resetTimeout() {
    if (this.timeoutSub) this.timeoutSub.unsubscribe();
    this.timeoutSub = timer(4000).subscribe((_) => (this.timeout = true));
  }

  private timerSub: Subscription | undefined;
  async onScanInput(event: Event) {
    // prevent raising timeout while scan input is processing
    (this.timeout = false), this.resetTimeout();

    this.isscanning = true;
    if (this.timerSub) {
      this.timerSub.unsubscribe();
    }
    this.timerSub = timer(100).subscribe((_) => {
      let value = (event.target as HTMLTextAreaElement).value;
      this.scan
        .handleScan(value)
        .catch((error) =>
          console.error("failed to handle scan input. " + error)
        );
    });
  }

  printForgotQrCode() {
    this.ticket.handleGetNewNumber({
      queue: this.style.forgotQrCodeQueue,
      categories: this.style.forgotQrCodeCategories,
      title: "",
    });
  }
}
