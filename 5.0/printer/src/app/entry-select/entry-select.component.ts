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
import { Subscription, timer } from "rxjs";
import { ScanAppointmentService } from "../services/scan-appointment.service";
import { AppointmentModes, StyleService } from "../services/style.service";

@Component({
  selector: "vpr-entry-select",
  templateUrl: "./entry-select.component.html",
  styleUrls: ["./entry-select.component.scss"],
})
export class EntrySelectComponent {
  constructor(
    private scan: ScanAppointmentService,
    private style: StyleService
  ) {}

  private timerSub: Subscription | undefined;
  async onScanInput(event: Event) {
    if (this.timerSub) {
      this.timerSub.unsubscribe();
    }
    this.timerSub = timer(100).subscribe((_) => {
      let value = (event.target as HTMLTextAreaElement).value;
      this.scan
        .handleScan(value)
        .catch((error) =>
          console.error(
            "failed to handle scan input. " + (error instanceof String)
              ? error
              : error.message
          )
        );
    });
  }

  get appointmentRoute(): string {
    var apm = this.style.appointmentMode;
    return appoinmentModeToEntryRoute(apm);
  }

  get queueRoute(): string {
    return this.style.activeStyle == "groups" ? "/groups" : "/select-queue";
  }
}

export function appoinmentModeToEntryRoute(apm: number): string {
  if (
    (apm & (AppointmentModes.QRCode | AppointmentModes.AppointmentId)) ==
    (AppointmentModes.QRCode | AppointmentModes.AppointmentId)
  ) {
    // both
    return "/select-appoint-mode";
  } else if ((apm & AppointmentModes.QRCode) == AppointmentModes.QRCode) {
    return "/scan-appointment";
  } else if (
    (apm & AppointmentModes.AppointmentId) ==
    AppointmentModes.AppointmentId
  ) {
    return "/enter-appoint-id";
  } else return "";
}
