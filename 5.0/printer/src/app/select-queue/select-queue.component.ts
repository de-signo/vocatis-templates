import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { environment } from 'src/environments/environment';
import { ButtonModel, OpenCloseStatus } from '../services/app-data.model';
import { AppLinkService } from '../services/app-link.service';
import { DataService } from '../services/data.service';
import { StyleService } from '../services/style.service';
import { TicketService } from '../services/ticket.service';


@Component({
  selector: 'vpr-select-queue',
  templateUrl: './select-queue.component.html',
  styleUrls: ['./select-queue.component.scss']
})
export class SelectQueueComponent {
  buttons: ButtonModel[] = [];
  get showQrCode() { return this.styleService.listShowQrCode };

  constructor(dataService: DataService, private ticket: TicketService, private styleService: StyleService,
    route: ActivatedRoute, private appLink: AppLinkService) {
    route.params.subscribe(params => {
      const i = params["index"];
      if (i === undefined) {
        // show buttons from queue service
        dataService.buttons.subscribe(
          data => this.buttons = data
        );
      }
      else {
        // show buttons from groups
        dataService.groups.subscribe(
          groups => this.buttons = groups[i].items
        );
      }
    })
  }

  getViewFor(b: ButtonModel): "open"|"closed_manually"|"closed_hours"|"closed_full" {
    if (!environment.enableOpenClose)
      return "open";

    if (b.openCloseStatus & OpenCloseStatus.IsOutsideHours)
      return "closed_hours";
    else if (b.openCloseStatus & OpenCloseStatus.IsFull)
      return "closed_full";
    else if (b.openCloseStatus & OpenCloseStatus.Manual)
      return "closed_manually";
    return "open";
  }

  getAppTicketLink(b: ButtonModel): string {
    return this.appLink.getAppTicketUrl(b.queue, b.categories);
  }

  qrClick(b: ButtonModel) {
    // for debug only
    if (!this.ticket.isPlayerAvailable) {
      window.open(this.appLink.getAppTicketUrl(b.queue, b.categories));
    }
  }
  print(b: ButtonModel) {
    this.ticket.handleGetNewNumber(b);
  }
}
