import { Component } from '@angular/core';
import { ScanAppointmentService } from '../services/scan-appointment.service';

@Component({
  selector: 'vpr-scan-appointment',
  templateUrl: './scan-appointment.component.html',
  styleUrls: ['./scan-appointment.component.scss']
})
export class ScanAppointmentComponent {

  constructor(private scan: ScanAppointmentService) { }

  onScanInput(event: Event) {
    let value = (event.target as HTMLTextAreaElement).value;
    if (!value)
      return;
    this.scan.handleScan(value).catch(error =>
      console.error("failed to handle scan input. " + error));
  }
}
