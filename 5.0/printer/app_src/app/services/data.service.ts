import { Injectable } from "@angular/core";
import { environment } from "../../environments/environment";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { BehaviorSubject } from "rxjs";
import { TicketStatus, WaitNumberModel } from "./models";

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

@Injectable({
  providedIn: "root",
})
export class DataService {
  public status: BehaviorSubject<TicketStatus | null> =
    new BehaviorSubject<TicketStatus | null>(null);

  constructor(private http: HttpClient) {}

  getStatus(id: string): Observable<TicketStatus> {
    const jsonFile = environment.statusServiceUrl;
    return this.http.get<TicketStatus>(jsonFile, { params: { id: id } });
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
}
