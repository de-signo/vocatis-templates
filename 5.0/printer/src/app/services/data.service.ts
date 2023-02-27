import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import {
  AppointmentModel,
  ButtonModel,
  GroupModel,
  WaitNumberModel,
} from "./app-data.model";
import {
  HttpClient,
  HttpHeaders,
  HttpParameterCodec,
  HttpParams,
} from "@angular/common/http";
import { Observable, of } from "rxjs";
import { first, tap } from "rxjs/operators";
import { BehaviorSubject } from "rxjs";

declare global {
  interface Window {
    // this are options set in index.cshtml
    hostOptions:
      | {
          printerStatusUrl: string;
        }
      | undefined;
  }
}

export class CustomHttpParamEncoder implements HttpParameterCodec {
  encodeKey(key: string): string {
    return encodeURIComponent(key);
  }
  encodeValue(value: string): string {
    return encodeURIComponent(value);
  }
  decodeKey(key: string): string {
    return decodeURIComponent(key);
  }
  decodeValue(value: string): string {
    return decodeURIComponent(value);
  }
}

@Injectable({
  providedIn: "root",
})
export class DataService {
  public groups: BehaviorSubject<GroupModel[]> = new BehaviorSubject<
    GroupModel[]
  >([]);
  public buttons: BehaviorSubject<ButtonModel[]> = new BehaviorSubject<
    ButtonModel[]
  >([]);
  public appointments: BehaviorSubject<AppointmentModel[]> =
    new BehaviorSubject<AppointmentModel[]>([]);

  constructor(private http: HttpClient) {}

  loadGroups(): Observable<GroupModel[]> {
    const jsonFile = environment.groupsServiceUrl;
    return this.http.get<GroupModel[]>(jsonFile + window.location.search).pipe(
      tap((data) => {
        this.groups.next(data);
      })
    );
  }

  loadButtons(): Observable<ButtonModel[]> {
    const jsonFile = environment.queueServiceUrl;
    return this.http.get<ButtonModel[]>(jsonFile + window.location.search).pipe(
      tap((data) => {
        this.buttons.next(data);
      })
    );
  }

  loadAppointments(): Observable<AppointmentModel[]> {
    const jsonFile = environment.appointmentsServiceUrl;
    return this.http
      .get<AppointmentModel[]>(jsonFile + window.location.search)
      .pipe(
        tap((data) => {
          this.appointments.next(data);
        })
      );
  }

  getNewNumber(
    queue: string,
    categories: string[]
  ): Observable<WaitNumberModel> {
    const jsonFile = environment.numberServiceUrl;
    return this.http.get<WaitNumberModel>(jsonFile, {
      params: { queue: queue, categories: categories },
    });
  }

  getTicketFromAppointment(
    apt: AppointmentModel,
    queue: string,
    categories: string[],
    postponeOffset?: number
  ): Promise<WaitNumberModel> {
    const jsonFile = environment.numberServiceUrl;
    const date = new Date(apt.time);

    let params = new HttpParams({ encoder: new CustomHttpParamEncoder() });
    params = params.appendAll({
      queue: queue,
      categories: categories,
      ref: apt.ref,
      name: apt.name,
      phone:
        date.toLocaleTimeString("de-DE", {
          hour: "2-digit",
          minute: "2-digit",
        }) +
        " - " +
        apt.title,
    });
    if (postponeOffset !== undefined) {
      params = params.append(
        "postpone",
        new Date(+date + +postponeOffset).toISOString()
      );
    }
    return this.http
      .get<WaitNumberModel>(jsonFile, { params: params })
      .toPromise();
  }

  postPrinterStatus(
    displayId: string,
    printer: string,
    status: number
  ): Promise<unknown> {
    if (!window.hostOptions) {
      return Promise.reject("host options not available.");
    }

    let url = window.hostOptions.printerStatusUrl;
    let body = new URLSearchParams();
    body.set("Display", displayId);
    body.set("Printer", printer);
    body.set("Status", status.toString());
    return this.http
      .post(url, body.toString(), {
        headers: new HttpHeaders().set(
          "Content-Type",
          "application/x-www-form-urlencoded"
        ),
      })
      .pipe(first())
      .toPromise();
  }
}
