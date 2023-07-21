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
import { Router } from "@angular/router";
import { firstValueFrom, timer } from "rxjs";
import { ScanAppointmentService } from "../services/scan-appointment.service";

@Component({
  selector: "vpr-enter-appoint-id",
  templateUrl: "./enter-appoint-id.component.html",
  styleUrls: ["./enter-appoint-id.component.scss"],
})
export class EnterAppointIdComponent {
  state: "enter" | "checking" | "error" = "enter";
  errorCounter = 0;
  private _code = "";
  get code(): string {
    return this._code;
  }
  set code(value: string) {
    this._code = value;
    this.onCodeChanged();
  }

  private codeLength = 5;
  codeIndexes: number[];

  constructor(private scan: ScanAppointmentService, private router: Router) {
    this.codeIndexes = [...Array(this.codeLength).keys()];
  }

  addChar(char: number) {
    let code: string;
    if (this.state == "error") {
      this.state = "enter";
      code = "";
    } else code = this._code;
    code = code + char.toString();
    this.code = code;
  }

  private onCodeChanged() {
    if (this._code.length >= this.codeLength) {
      this.checkCode(this._code);
    }
  }

  private async checkCode(code: string): Promise<void> {
    this.state = "checking";
    await firstValueFrom(timer(200));
    const apt = await this.scan.findAppointment(code);
    if (!apt) {
      this.errorCounter++;
      this.state = "error";
      this.code = "";
      console.log(
        `The appointment with id '${code}' was not found in the list.`
      );
      if (this.errorCounter == 3) {
        await this.router.navigate(["/info"], {
          queryParamsHandling: "preserve",
        });
      }
    } else {
      await this.scan.handleAppointment(apt);
    }
  }
}
