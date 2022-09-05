import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { environment } from "src/environments/environment";
import { Subscription, timer } from "rxjs";
import { WaitNumberModel } from "./app-data.model";
import { DataService } from "./data.service";
import { StyleService } from "./style.service";
import { TicketService } from "./ticket.service";
import * as ical from "./ical";

@Injectable({
  providedIn: "root",
})
export class ScanAppointmentService {
  state: "" | "invalid" | "late" | "qr" = "";
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

    let icsres: ical.FullCalendar | undefined = undefined;
    try {
      icsres = ical.parseICS(data);
      console.log(icsres);
    } catch (icserr) {
      this.state = "invalid";
      console.error(icserr);
    }

    if (!icsres || Object.keys(icsres).length != 1) {
      this.state = "invalid";
    } else {
      const apt = Object.values(icsres)[0];
      if (!apt.uid || !apt.start || !apt.description || !apt.contact) {
        this.state = "invalid";
      } else {
        const queue = this.style.planToQueue;
        const appTime = apt.start.getTime();
        const cutOffTime =
          this.style.late == null ? 0 : Date.now() - this.style.late * 60000;

        this.currentDate = new Date(appTime);
        if (appTime < cutOffTime) {
          // too late
          this.state = "late";
          console.log(
            `The appointment with id '${apt.uid}' was at ${apt.start}. Too late.`
          );
        } else {
          const contact =
            typeof apt.contact == "string" ? apt.contact : apt.contact.val;
          this.number = await this.data.getTicketFromAppointment(
            {
              id: apt.uid,
              ref: apt.uid,
              time: apt.start,
              name: contact,
              title: apt.description,
            },
            queue.queue,
            queue.categories
          );
          if (this.style.listShowQrCode) this.state = "qr";
          else {
            await this.print.handlePrintTicket(this.number, "appointment");
            return;
          }
        }
      }
    }
    this.timerSub = timer(environment.appointmentTimeout * 1000).subscribe(
      (_) => this.router.navigate(["/"], { queryParamsHandling: "preserve" })
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
