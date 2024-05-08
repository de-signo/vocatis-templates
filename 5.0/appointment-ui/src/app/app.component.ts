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

import { Component, OnDestroy, OnInit } from "@angular/core";
import { AppointmentModel } from "@isign/vocatis-api";
import { Subscription, throwError, timer } from "rxjs";
import { catchError, delay, map, mergeMap, retryWhen } from "rxjs/operators";
import { DataService } from "./services/data.service";
import {
  MapperService,
  VocatisTicketsService,
} from "vocatis-lib/dist/vocatis-appointments";
import { AppErrorHandler } from "./error-handler/app-error-handler";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent implements OnInit, OnDestroy {
  readonly updateInterval = 30000;

  list: AppointmentModel[] = [];
  error?: { message: string };

  private subscriptions: Subscription[] = [];
  constructor(
    private api: DataService,
    private tickets: VocatisTicketsService,
    private mapper: MapperService,
    private errorHandler: AppErrorHandler,
  ) {
    this.subscriptions.push(
      errorHandler.onError.subscribe((e) => (this.error = e)),
    );
  }

  ngOnInit(): void {
    this.subscriptions.push(
      timer(0, this.updateInterval)
        .pipe(
          mergeMap(() => this.api.loadAppointments()),
          catchError((error) => {
            console.error(error);
            return throwError(error);
          }),
          retryWhen((errors) => errors.pipe(delay(this.updateInterval))),
        )
        .subscribe(),
    );
    this.subscriptions.push(
      this.api.appointments
        .pipe(
          map((data) => {
            data.sort((a, b) => a.start.localeCompare(b.start));
            return data;
          }),
        )
        .subscribe((data) => (this.list = data)),
    );
  }

  ngOnDestroy() {
    this.subscriptions?.forEach((s) => s.unsubscribe());
    this.subscriptions = [];
  }

  async onCreateTicket(apt: AppointmentModel) {
    const wnr = this.mapper.mapAppointmentToTicket(apt);
    const wn = await this.tickets.createTicket(wnr);
    // ignore result, could display some info here.

    // update appointments
    await this.api.loadAppointments().toPromise();
  }

  clearError() {
    this.error = undefined;
  }
}
