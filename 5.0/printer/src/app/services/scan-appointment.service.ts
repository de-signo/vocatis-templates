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

import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { firstValueFrom } from "rxjs";
import { WaitNumberModel } from "./app-data.model";
import { DataService } from "./data.service";
import { AppointmentModes, StyleService } from "./style.service";
import { TicketService } from "./ticket.service";
import {
  MapperService,
  VocatisTicketsService,
  WaitNumberRequestModel,
} from "vocatis-appointments";
import { TimeoutService } from "./timeout.service";
import { AppointmentModel } from "@isign/vocatis-api";

@Injectable({
  providedIn: "root",
})
export class ScanAppointmentService {
  private readonly numberField: string = "Number";

  state:
    | ""
    | "invalid"
    | "notfound"
    | "notfound_early"
    | "notfound_late"
    | "noqueue"
    | "late"
    | "qr" = "";
  currentDate: Date | undefined;
  number: WaitNumberModel | undefined;

  constructor(
    private router: Router,
    private data: DataService,
    private readonly vocatis: VocatisTicketsService,
    private style: StyleService,
    private mapper: MapperService,
    private print: TicketService,
    private timeout: TimeoutService,
  ) {}

  async handleScan(data: string): Promise<void> {
    this.state = "";
    await this.router.navigate(["/handle-appointment"], {
      queryParamsHandling: "preserve",
    });

    const regex = /UID[:Ö]([0-9]*)/;
    let match = data.match(regex);
    if (!match || match.length < 2) {
      this.state = "invalid";
    } else {
      let apt_id = match[1];
      const appts = await firstValueFrom(this.data.appointments);
      const apt =
        this.style.appointmentMode & AppointmentModes.QrCodeMatchNumber
          ? appts?.find((apt) => apt.userData?.[this.numberField] == apt_id)
          : appts?.find((apt) => apt.sourceId == apt_id);
      if (!apt) {
        // find time
        const dtregex = /DTSTART[:Ö]([0-9]*)T([0-9]*)/;
        const dtmatch = data.match(dtregex);
        if (dtmatch && dtmatch.length == 3) {
          const date = this.parseICalDateTime(dtmatch[1], dtmatch[2]);
          const dateDate = this.getDateWithoutTime(date);
          const now = new Date();
          const nowDate = this.getDateWithoutTime(now);
          const tomorrowDate = new Date(
            nowDate.getTime() + 24 * 60 * 60 * 1000,
          );
          if (dateDate < nowDate) {
            this.state = "notfound_late";
          } else if (dateDate >= tomorrowDate) {
            this.state = "notfound_early";
          } else {
            this.state = "notfound";
          }
          this.currentDate = date;
          console.log(
            `The appointment with id '${apt_id}' was not found in the list. DTSTART is ${date}`,
          );
        } else {
          this.state = "notfound";
          console.log(
            `The appointment with id '${apt_id}' was not found in the list.`,
          );
        }
      } else {
        if (await this.handleAppointment(apt)) return;
      }
    }
    this.timeout.useTimeout(this.style.appointmentTimeout);
  }

  async findAppointment(code: string): Promise<AppointmentModel | undefined> {
    const appts = await firstValueFrom(this.data.appointments);

    let aptmatches;
    if (this.style.appointmentMode & AppointmentModes.EnterCodeMatchId) {
      aptmatches = appts
        .filter((apt) => apt.sourceId?.endsWith(code))
        .sort((a, b) => a.start.localeCompare(b.start));
    } else {
      aptmatches = appts
        .filter((apt) => apt.userData?.[this.numberField]?.endsWith(code))
        .sort((a, b) => a.start.localeCompare(b.start));
    }

    const apt = aptmatches[0];
    return apt;
  }

  async handleAppointment(apt: AppointmentModel): Promise<boolean> {
    await this.router.navigate(["/handle-appointment"], {
      queryParamsHandling: "preserve",
    });

    let req: WaitNumberRequestModel;
    try {
      req = this.mapper.mapAppointmentToTicket(apt);
    } catch (error: any) {
      this.state = "noqueue";
      console.log(`Could not map appointment. ${error?.message ?? ""}`);
      return false;
    }

    const appTime = Date.parse(apt.start);
    const cutOffTime =
      this.style.late == null ? 0 : Date.now() - this.style.late * 60000;

    this.currentDate = new Date(appTime);
    if (appTime < cutOffTime) {
      // too late
      this.state = "late";
      console.log(
        `The appointment with source-id '${apt.sourceId}' was at ${appTime}. Too late.`,
      );
    } else {
      this.number = await this.vocatis.createTicket(req);
      console.log(
        `The appointment with source-id '${apt.sourceId}' was assigned to the number ${this.number.number}.`,
      );
      if (this.style.listShowQrCode) this.state = "qr";
      else {
        await this.print.handlePrintTicket(this.number, "appointment");
        return true;
      }
    }
    return false;
  }

  private parseICalDateTime(date: string, time: string): Date {
    // date = '20110914'
    // time = '184000Z'
    var strYear = parseInt(date.substring(0, 4));
    var strMonth = parseInt(date.substring(4, 6));
    var strDay = parseInt(date.substring(6, 8));
    var strHour = parseInt(time.substring(0, 2));
    var strMin = parseInt(time.substring(2, 4));
    var strSec = parseInt(time.substring(4, 6));
    return new Date(strYear, strMonth - 1, strDay, strHour, strMin, strSec);
  }

  private getDateWithoutTime(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }
}
