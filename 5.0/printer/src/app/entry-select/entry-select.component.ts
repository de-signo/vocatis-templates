import { Component } from '@angular/core';
import { ScanAppointmentService } from '../services/scan-appointment.service';

@Component({
  selector: 'vpr-entry-select',
  templateUrl: './entry-select.component.html',
  styleUrls: ['./entry-select.component.scss']
})
export class EntrySelectComponent {
  constructor(private scan: ScanAppointmentService) { }

  onScanInput(event: Event) {
    let value = (event.target as HTMLTextAreaElement).value;
    if (!value)
      return;
    this.scan.handleScan(value).catch(error =>
      console.error("failed to handle scan input. " + error));
  }
}
