/*
 *  Copyright (C) 2023 DE SIGNO GmbH
 *
 *  This program is dual licensed. If you did not license the program under
 *  differnt tems, the following applies:
 *
 *  This program is free software: You can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Affero General Public License for more details.
 *
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 */

import {
  AfterViewInit,
  Component,
  ElementRef,
  HostListener,
  OnDestroy,
  QueryList,
  ViewChildren,
} from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Subscription } from "rxjs";
import { environment } from "src/environments/environment";
import {
  ButtonModel,
  GroupItemModel,
  OpenCloseStatus,
} from "../services/app-data.model";
import { AppLinkService } from "../services/app-link.service";
import { DataService } from "../services/data.service";
import { StyleService } from "../services/style.service";
import { TicketService } from "../services/ticket.service";

@Component({
  selector: "vpr-select-queue",
  templateUrl: "./select-queue.component.html",
  styleUrls: ["./select-queue.component.scss"],
})
export class SelectQueueComponent implements OnDestroy, AfterViewInit {
  buttons: ButtonModel[] = [];

  get showQrCode() {
    return this.styleService.listShowQrCode;
  }
  get showWaitTime() {
    return this.styleService.listShowWaitTime;
  }

  showStatusInColumns = false;
  @ViewChildren("statusPanel")
  private statusPanels: QueryList<ElementRef> | undefined;
  private subscriptions: Subscription[] = [];
  constructor(
    dataService: DataService,
    private ticket: TicketService,
    private styleService: StyleService,
    route: ActivatedRoute,
    private appLink: AppLinkService
  ) {
    this.subscriptions.push(
      route.params.subscribe((params) => {
        const i = params["index"];
        if (i === undefined) {
          // show buttons from queue service
          dataService.buttons.subscribe((data) => (this.buttons = data));
        } else {
          // show buttons from groups
          dataService.groups.subscribe(
            (groups) => (this.buttons = (<GroupItemModel>groups[i]).items)
          );
        }
      })
    );
  }

  ngOnDestroy(): void {
    for (const sub of this.subscriptions) sub.unsubscribe();
    this.subscriptions = [];
  }

  ngAfterViewInit(): void {
    const sub = this.statusPanels?.changes.subscribe((r) => {
      setTimeout(() => this.onResize(null), 0);
    });
    if (sub) this.subscriptions.push(sub);
  }

  getViewFor(
    b: ButtonModel
  ): "open" | "closed-manually" | "closed-hours" | "closed-limit" {
    if (!environment.enableOpenClose) return "open";

    if (b.openCloseStatus & OpenCloseStatus.IsOpen) return "open";
    else if (b.openCloseStatus & OpenCloseStatus.Manual)
      return "closed-manually";
    else if (b.openCloseStatus & OpenCloseStatus.IsOutsideHours)
      return "closed-hours";
    else if (b.openCloseStatus & OpenCloseStatus.IsFull) return "closed-limit";

    return "closed-manually";
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

  @HostListener("window:resize", ["$event"])
  onResize(event: any) {
    if (!this.statusPanels?.first) return;
    const el = this.statusPanels.first.nativeElement as HTMLElement;
    const isLandscape = el.offsetWidth > el.offsetHeight;
    const hasTime = this.showWaitTime;
    // https://michael-stoll.atlassian.net/browse/IS-639?focusedCommentId=11946

    if (hasTime) this.showStatusInColumns = !isLandscape;
    else this.showStatusInColumns = isLandscape;
  }
}
