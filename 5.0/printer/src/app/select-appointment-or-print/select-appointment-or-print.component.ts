import { Component } from "@angular/core";
import { Subscription, timer } from "rxjs";
import { ScanAppointmentService } from "../services/scan-appointment.service";
import { StyleService } from "../services/style.service";
import { TicketService } from "../services/ticket.service";

@Component({
  selector: "vpr-select-appointment-or-print",
  templateUrl: "./select-appointment-or-print.component.html",
  styleUrls: ["./select-appointment-or-print.component.scss"],
})
export class SelectAppointmentOrPrint {
  constructor(
    private scan: ScanAppointmentService,
    private style: StyleService,
    private ticket: TicketService
  ) {}

  private timerSub: Subscription | undefined;

  print2() {
    this.ticket.handleGetNewNumber(this.style.buttons[1]);
  }

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
