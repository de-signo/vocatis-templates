import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { Subscription, timer, firstValueFrom } from "rxjs";
import { first } from "rxjs/operators";
import { WaitNumberModel } from "./app-data.model";
import { DataService } from "./data.service";
import { StyleService } from "./style.service";
import { TicketService } from "./ticket.service";

@Injectable({
  providedIn: "root",
})
export class ScanAppointmentService {
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

  private timerSub: Subscription | undefined;
  constructor(
    private router: Router,
    private data: DataService,
    private style: StyleService,
    private print: TicketService
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

      const apt = appts?.find((apt) => apt.id == apt_id);
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
            nowDate.getTime() + 24 * 60 * 60 * 1000
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
            `The appointment with id '${apt_id}' was not found in the list. DTSTART is ${date}`
          );
        } else {
          this.state = "notfound";
          console.log(
            `The appointment with id '${apt_id}' was not found in the list.`
          );
        }
      } else {
        const plan = apt.plan;
        const queue = this.style.planToQueue[plan];
        if (!queue) {
          this.state = "noqueue";
          console.log(`The plan '${plan}' is not configured.`);
        } else {
          const appTime = Date.parse(apt.time);
          const cutOffTime =
            this.style.late == null ? 0 : Date.now() - this.style.late * 60000;

          this.currentDate = new Date(appTime);
          if (appTime < cutOffTime) {
            // too late
            this.state = "late";
            console.log(
              `The appointment with id '${apt_id}' was at ${appTime}. Too late.`
            );
          } else {
            this.number = await this.data.getTicketFromAppointment(
              apt,
              queue.queue,
              queue.categories,
              this.style.postponeOffset
            );
            if (this.style.listShowQrCode) this.state = "qr";
            else {
              await this.print.handlePrintTicket(this.number);
              return;
            }
          }
        }
      }
    }
    this.timerSub = timer(this.style.appointmentTimeout * 1000).subscribe((_) =>
      this.router.navigate(["/"], { queryParamsHandling: "preserve" })
    );
  }

  abort() {
    this.timerSub?.unsubscribe();
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
