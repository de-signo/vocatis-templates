/*
 *  Copyright (C) 2023 DE SIGNO GmbH
 *
 *  This program is dual licensed. If you did not license the program under
 *  different terms, the following applies:
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

import { Component } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Subscription } from "rxjs";
import { StyleService } from "../services/style.service";
import { TicketService } from "../services/ticket.service";

@Component({
  selector: "vpr-print",
  templateUrl: "./print.component.html",
  styleUrls: ["./print.component.scss"],
})
export class PrintComponent {
  get arrow() {
    return this.style.arrow;
  }

  isAppointment = false;
  state: "wait" | "take" | "show" = "wait";

  private subscriptions: Subscription[] = [];
  constructor(
    public ticket: TicketService,
    private style: StyleService,
    route: ActivatedRoute
  ) {
    this.subscriptions.push(
      route.params.subscribe((params) => {
        const i = params["type"];
        this.isAppointment = i === "appointment";
        this.state = params["state"];
      })
    );
  }

  ngOnDestroy(): void {
    for (const sub of this.subscriptions) sub.unsubscribe();
    this.subscriptions = [];
  }
}
