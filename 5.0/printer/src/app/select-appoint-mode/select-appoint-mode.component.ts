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
