import { Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { Observable, Subject, Subscription, timer } from "rxjs";
import { first } from "rxjs/operators";
import { WaitNumberModel } from "./app-data.model";
import { DataService } from "./data.service";
import { StyleService } from "./style.service";
import { TicketService } from "./ticket.service";

@Injectable({
  providedIn: "root",
})
export class ScanAppointmentService {
  state: "" | "invalid" | "notfound" | "noqueue" | "qr" = "";
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
      const appts = await this.data.appointments.pipe(first()).toPromise();

      const apt = appts.find((apt) => apt.id == apt_id);
      if (!apt) {
        this.state = "notfound";
        console.log(
          `The appointment with id '${apt_id}' was not found in the list.`
        );
      } else {
        const plan = apt.plan;
        const queue = this.style.planToQueue[plan];
        if (!queue) {
          this.state = "noqueue";
          console.log(`The plan '${plan}' is not configured.`);
        } else {
          this.number = await this.data.getTicketFromAppointment(
            apt,
            queue.queue,
            queue.categories
          );
          if (this.style.listShowQrCode) this.state = "qr";
          else {
            await this.print.handlePrintTicket(this.number);
            return;
          }
        }
      }
    }
    this.timerSub = timer(5000).subscribe((_) =>
      this.router.navigate(["/"], { queryParamsHandling: "preserve" })
    );
  }

  abort() {
    this.timerSub?.unsubscribe();
  }
}
