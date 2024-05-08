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

import { Inject, Injectable } from "@angular/core";
import { AppointmentModel } from "@isign/vocatis-api";
import { WaitNumberRequestModel } from "./model";

export const APPOINTMENT_OPTIONS = "appointmentOptions";
export interface IAppointmentOptions {
  planToQueue: { [key: string]: { queue: string; categories: string[] } };
  postponeOffset?: number;
  numberSource?: "auto" | "T3" | "T4" | "T5" | "user";
}

@Injectable({
  providedIn: "root",
})
export class MapperService {
  private readonly planField: string = "Plan";
  private readonly numberField: string = "Number";
  private readonly descField: string = "Description";
  private readonly refField: string = "Url";

  constructor(
    @Inject(APPOINTMENT_OPTIONS) private style: IAppointmentOptions,
  ) {}

  mapAppointmentToTicket(apt: AppointmentModel): WaitNumberRequestModel {
    const planToQueue = this.style.planToQueue;
    const postponeOffset = this.style.postponeOffset;

    // map queue
    if (!apt.userData)
      throw new Error("Appointment does not contain user-data fields");
    const plan = apt.userData[this.planField];
    if (!plan)
      throw new Error(`Appointment does not conatain field ${this.planField}`);
    const queue = planToQueue[plan];
    if (!queue) throw new Error(`The plan ${plan} is not mapped to a queue`);

    // get number
    let number: string | undefined;
    switch (this.style.numberSource ?? "auto") {
      default:
      case "auto":
        number = undefined;
        break;
      case "user":
        // user predefined number form field
        number = apt.userData[this.numberField];
        break;
      case "T3":
        // user predefined number form field
        number = "T" + apt.userData[this.numberField]?.slice(-3);
        break;
      case "T4":
        // user predefined number form field
        number = "T" + apt.userData[this.numberField]?.slice(-4);
        break;
      case "T5":
        // user predefined number form field
        number = "T" + apt.userData[this.numberField]?.slice(-5);
        break;
    }

    const startDate = new Date(apt.start);
    let phone = startDate.toLocaleTimeString("de-DE", {
      hour: "2-digit",
      minute: "2-digit",
    });
    if (apt.title) {
      phone = `${phone} - ${apt.title}`;
    }

    // determine postpone
    const postpone =
      postponeOffset !== undefined
        ? new Date(+startDate + +postponeOffset)
        : undefined;

    return {
      appointment: apt.id,

      number: number,
      postpone: postpone,

      name: apt.participants,
      phone: phone,
      description: apt.userData[this.descField],
      ref: apt.userData[this.refField],

      queue: queue.queue,
      categories: queue.categories,
    };
  }
}
