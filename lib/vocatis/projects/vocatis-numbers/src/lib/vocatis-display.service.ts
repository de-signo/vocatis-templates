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
import { WaitNumberItem } from "./models";
import { VocatisApiService, WaitNumberDisplayModel } from "@isign/vocatis-api";
import { Observable, catchError, map, merge, of, repeat, retry, scan, switchMap, throwError } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class VocatisDisplayService {
  constructor(
    private readonly vocatis: VocatisApiService
  ) {}

  // This method produces a observable whenever new data for the id is available
  private longPollingGetQueueDisplayStream(id: string, updateInterval: number) {
    let etag: string|undefined;
    return of(id)
      .pipe(
        switchMap(id => this.vocatis.getQueueDisplay(id, true, true, etag)),
        repeat({delay: updateInterval}),
        map(items => {
          etag = items.etag ?? undefined;
          return { id: id, items: items.body }
        })
      )
  }

  getCalledNumbers(queues: string[], categories: string[], updateInterval: number): Observable<WaitNumberItem[]> {
    // list of source ids
    const sources = new Set<string>(queues.filter(q => !!q)); // set is distinct
    const cats = new Set(categories);

    const pollingObservables = [...sources].map((id) => this.longPollingGetQueueDisplayStream(id, updateInterval));

    // merge the obserables, returns whenever a obervable is created
    return merge(...pollingObservables).pipe(
      // save the most recent values
      scan((acc, value) => acc.set(value.id, value.items), new Map<string, WaitNumberDisplayModel[]>()),
    
      // format output
      map((itemsMap) =>
        Array.from(itemsMap.values())
          .flatMap(items => items)
          .map(item => <WaitNumberItem>{
            number: item.number,
            room: item.roomName,
            marked: !!item.categories.find((cid) => cats.has(cid.id)),
          })),

      // error handline with retry
      catchError((error) => {
        console.error(error);
        return throwError(() => error);
      }),
      retry({ delay: updateInterval })
    );
  }
}
