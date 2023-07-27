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
