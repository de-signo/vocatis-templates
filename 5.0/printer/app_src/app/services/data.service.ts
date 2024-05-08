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
import { Observable, map, of, shareReplay, switchMap, tap } from "rxjs";
import { BehaviorSubject } from "rxjs";
import { TicketStatus, WaitNumberModel } from "./models";
import { VocatisApiService } from "@isign/vocatis-api";

@Injectable({
  providedIn: "root",
})
export class DataService {
  public status: BehaviorSubject<TicketStatus | null> =
    new BehaviorSubject<TicketStatus | null>(null);

  constructor(private vocatis: VocatisApiService) {}

  private queues = new Map<string, Observable<string>>();
  private getQueueName(id: string): Observable<string> {
    if (typeof id !== "string") {
      throw Error("invalid parameter. id is not a string.");
    }
    const cached = this.queues.get(id);
    if (cached) return cached;

    const obs = this.vocatis.getQueue(id).pipe(
      map((q) => q.name),
      shareReplay(1, 60 * 60 * 1000),
    );
    this.queues.set(id, obs);
    return obs;
  }

  getStatus(id: string): Observable<TicketStatus> {
    if (typeof id !== "string") {
      throw Error("invalid parameter. id is not a string.");
    }
    return this.vocatis.getTicketStatus(id).pipe(
      switchMap((st) =>
        (st.queueId ? this.getQueueName(st.queueId) : of("")).pipe(
          map((qn) => ({
            number: st.number,
            title: qn,
            state: st.state,
            position: st.position,
            estimatedTimeOfCall: st.estimatedTimeOfCall,
            room: st.roomName,
          })),
        ),
      ),
      tap((data) => this.status.next(data)),
    );
  }

  getNewNumber(
    queue: string,
    categories?: string[],
  ): Observable<WaitNumberModel> {
    return this.vocatis.createTicket(queue, categories);
  }
}
