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
