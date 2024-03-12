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
import { environment } from "src/environments/environment";
import {
  ButtonModel,
  TopLevelItemModel,
  WaitNumberModel,
} from "./app-data.model";
import { HttpClient } from "@angular/common/http";
import { forkJoin, Observable } from "rxjs";
import { map, shareReplay, tap } from "rxjs/operators";
import { BehaviorSubject } from "rxjs";
import { AppointmentModel, VocatisApiService } from "@isign/vocatis-api";
import { TemplateService } from "@isign/forms-templates";

interface GroupsSpecItem {
  type?: "group";
  title: string | { [key: string]: string };
  items?: {
    title: string | { [key: string]: string };
    queue: string;
    categories?: string[];
  }[];
}

interface GroupsSpec {
  groups: (GroupsSpecItem | TopLevelItemModel)[];
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

  constructor(
    private readonly vocatis: VocatisApiService,
    private readonly template: TemplateService,
    private readonly http: HttpClient,
  ) {}

  private groupsShared: Observable<GroupsSpec> = this.http
    .get<GroupsSpec>(environment.groupsConfigUrl)
    .pipe(shareReplay()); // only request once

  loadGroups(): Observable<TopLevelItemModel[]> {
    return forkJoin([this.groupsShared, this.vocatis.getQueues(false)]).pipe(
      map((data) =>
        data[0].groups.map<TopLevelItemModel>((g) => {
          switch (g.type) {
            case "appointment":
              return g;
            default:
            case undefined:
            case "group":
              return {
                type: "group",
                title: g.title,
                items:
                  g?.items?.map((i) => {
                    const qs = data[1].find((s) => s.id == i.queue);
                    return {
                      title: i.title,
                      queue: i.queue,
                      categories: i.categories,
                      openCloseStatus: qs?.openCloseStatus ?? 0,
                      queueLength: qs?.queueLength ?? 0,
                      estimateWaitTime: qs?.currentMaxWaitingTime ?? 0,
                    };
                  }) ?? [],
              };
          }
        }),
      ),
      tap((data) => {
        this.groups.next(data);
      }),
    );
  }

  loadButtons(): Observable<ButtonModel[]> {
    // read the template
    const tmpl = this.template.getTemplate();

    // list of source ids
    const buttons: ButtonModel[] = []; // set is distinct
    for (let key in tmpl.parameters) {
      if (key.startsWith("text")) {
        const title = tmpl.parameters[key];
        if (!title) continue;

        const index = key.substring(4);
        const queueid = tmpl.parameters["queueid" + index];
        if (!queueid) continue;

        const cats = tmpl.parameters["catid" + index]?.split(",") ?? [];
        buttons.push({
          title: title,
          queue: queueid,
          categories: cats,
          openCloseStatus: 0,
          queueLength: 0,
          estimateWaitTime: 0,
        });
      }
    }

    // get queues and assign to buttons
    return this.vocatis.getQueues(false).pipe(
      map((queues) => {
        buttons.map((btn) => {
          var queue = queues.find((q) => btn.queue == q.id);
          if (queue != null) {
            btn.openCloseStatus = queue.openCloseStatus;
            btn.queueLength = queue.queueLength;
            btn.estimateWaitTime = queue.currentMaxWaitingTime;
          }
          return btn;
        });
        return buttons;
      }),
      tap((data) => {
        this.buttons.next(data);
      }),
    );
  }

  loadAppointments(): Observable<AppointmentModel[]> {
    return this.vocatis.getAppointments({ date: new Date() }).pipe(
      tap((data) => {
        this.appointments.next(data);
      }),
    );
  }

  getNewNumber(
    queue: string,
    categories?: string[],
  ): Observable<WaitNumberModel> {
    return this.vocatis.createTicket(queue, categories);
  }
}
