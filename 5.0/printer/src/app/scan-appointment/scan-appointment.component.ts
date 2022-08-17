import { Component } from "@angular/core";
import { Subscription, timer } from "rxjs";
import { ScanAppointmentService } from "../services/scan-appointment.service";
import { StyleService } from "../services/style.service";
import { TicketService } from "../services/ticket.service";

@Component({
  selector: "vpr-scan-appointment",
  templateUrl: "./scan-appointment.component.html",
  styleUrls: ["./scan-appointment.component.scss"],
})
export class ScanAppointmentComponent {
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
