import { Component } from '@angular/core';
import { AppLinkService } from '../services/app-link.service';
import { ScanAppointmentService } from '../services/scan-appointment.service';
import { StyleService } from '../services/style.service';
import { TicketService } from '../services/ticket.service';

@Component({
  selector: 'vpr-handle-appointment',
  templateUrl: './handle-appointment.component.html',
  styleUrls: ['./handle-appointment.component.scss']
})
export class HandleAppointmentComponent {
  get showQrCode(): boolean { return this.style.listShowQrCode; }
  get state() { return this.scan.state; }
  constructor(private scan: ScanAppointmentService, private style: StyleService, private ticket: TicketService,
    private appLink: AppLinkService) { }


  getAppLink(): string {
    if (!this.scan.number)
      return "";
    return this.appLink.getAppUrl(this.scan.number.id);
  }

  print() {
    if (!this.scan.number)
      return;
    this.scan.abort();
    this.ticket.handlePrintTicket(this.scan.number);
  }
}
