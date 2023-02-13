import { Component, OnDestroy, OnInit } from "@angular/core";
import { Subscription, throwError, timer } from "rxjs";
import { catchError, delay, map, mergeMap, retryWhen } from "rxjs/operators";
import { AppointmentModel } from "./services/model";
import { DataService } from "./services/data.service";
import { MapperService } from "./services/mapper.service";
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
    private mapper: MapperService,
    private errorHandler: AppErrorHandler
  ) {
    this.subscriptions.push(
      errorHandler.onError.subscribe((e) => (this.error = e))
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
          retryWhen((errors) => errors.pipe(delay(this.updateInterval)))
        )
        .subscribe()
    );
    this.subscriptions.push(
      this.api.appointments
        .pipe(
          map((data) => {
            data.sort((a, b) => a.start.localeCompare(b.start));
            return data;
          })
        )
        .subscribe((data) => (this.list = data))
    );
  }

  ngOnDestroy() {
    this.subscriptions?.forEach((s) => s.unsubscribe());
    this.subscriptions = [];
  }

  async onCreateTicket(apt: AppointmentModel) {
    const wnr = this.mapper.mapAppointmentToTicket(apt);
    const wn = await this.api.createTicket(wnr);
    // ignore result, could display some info here.

    // update appointments
    await this.api.loadAppointments().toPromise();
  }

  clearError() {
    this.error = undefined;
  }
}
