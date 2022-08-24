import { Component } from "@angular/core";
import { Subscription, timer } from "rxjs";
import { ScanAppointmentService } from "../services/scan-appointment.service";
import { StyleService } from "../services/style.service";
import { TicketService } from "../services/ticket.service";

@Component({
  selector: "vpr-entry-select",
  templateUrl: "./entry-select.component.html",
  styleUrls: ["./entry-select.component.scss"],
})
export class EntrySelectComponent {
  constructor(
    private scan: ScanAppointmentService,
    private style: StyleService,
    private ticket: TicketService
  ) {}

  private timerSub: Subscription | undefined;

  get text1() {
    return this.style.buttons[0]?.title;
  }
  get text2() {
    return this.style.buttons[1]?.title;
  }

  print1() {
    this.ticket.handleGetNewNumber(this.style.buttons[0]);
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
