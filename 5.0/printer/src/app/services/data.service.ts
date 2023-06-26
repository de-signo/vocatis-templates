import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import {
  ButtonModel,
  TopLevelItemModel,
  WaitNumberModel,
} from "./app-data.model";
import {
  HttpClient,
  HttpHeaders,
  HttpParameterCodec,
  HttpParams,
} from "@angular/common/http";
import { firstValueFrom, Observable } from "rxjs";
import { first, tap } from "rxjs/operators";
import { BehaviorSubject } from "rxjs";
import {
  AppointmentModel,
  WaitNumberRequestModel,
} from "vocatis-lib/dist/vocatis-appointments";

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
  public groups: BehaviorSubject<TopLevelItemModel[]> = new BehaviorSubject<
    TopLevelItemModel[]
  >([]);
  public buttons: BehaviorSubject<ButtonModel[]> = new BehaviorSubject<
    ButtonModel[]
  >([]);
  public appointments: BehaviorSubject<AppointmentModel[]> =
    new BehaviorSubject<AppointmentModel[]>([]);

  constructor(private http: HttpClient) {}

  loadGroups(): Observable<TopLevelItemModel[]> {
    const jsonFile = environment.groupsServiceUrl;
    return this.http
      .get<TopLevelItemModel[]>(jsonFile + window.location.search)
      .pipe(
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
    categories?: string[]
  ): Observable<WaitNumberModel> {
    const jsonFile = environment.numberServiceUrl;
    return this.http.get<WaitNumberModel>(jsonFile, {
      params: { queue: queue, categories: categories ?? "" },
    });
  }

  createTicket(wn: WaitNumberRequestModel): Promise<WaitNumberModel> {
    const jsonFile = environment.numberServiceUrl;

    let params = new HttpParams({ encoder: new CustomHttpParamEncoder() });
    params = params.appendAll({
      appointment: wn.appointment,
      queue: wn.queue,
      categories: wn.categories,
    });
    if (wn.number) params = params.append("number", wn.number);
    if (wn.ref) params = params.append("ref", wn.ref);
    if (wn.name) params = params.append("name", wn.name);
    if (wn.phone) params = params.append("phone", wn.phone);
    if (wn.description) params = params.append("description", wn.description);
    if (wn.postpone)
      params = params.append("postpone", wn.postpone.toISOString());
    return firstValueFrom(
      this.http.get<WaitNumberModel>(jsonFile, { params: params })
    );
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
