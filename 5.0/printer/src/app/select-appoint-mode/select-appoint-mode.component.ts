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

import { Component, OnInit } from "@angular/core";
import { Subscription, timer } from "rxjs";
import { ScanAppointmentService } from "../services/scan-appointment.service";

@Component({
  selector: "vpr-select-appoint-mode",
  templateUrl: "./select-appoint-mode.component.html",
  styleUrls: ["./select-appoint-mode.component.scss"],
})
export class SelectAppointModeComponent implements OnInit {
  constructor(private scan: ScanAppointmentService) {}

  private timerSub: Subscription | undefined;

  ngOnInit(): void {}

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
}
