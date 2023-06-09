import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import {
  AppointmentModel,
  WaitNumberRequestModel,
} from "vocatis-lib/dist/vocatis-appointments";
import {
  HttpClient,
  HttpParameterCodec,
  HttpParams,
} from "@angular/common/http";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
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
  public appointments: BehaviorSubject<AppointmentModel[]> =
    new BehaviorSubject<AppointmentModel[]>([]);

  constructor(private http: HttpClient) {}

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

  createTicket(wn: WaitNumberRequestModel): Promise<any> {
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
    if (wn.postpone)
      params = params.append("postpone", wn.postpone.toISOString());
    return this.http.get<any>(jsonFile, { params: params }).toPromise();
  }
}
