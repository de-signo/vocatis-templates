import { Inject, Injectable } from "@angular/core";
import { AppointmentModel, WaitNumberRequestModel } from "./model";

export const APPOINTMENT_OPTIONS = "appointmentOptions";
export interface IAppointmentOptions {
  planToQueue: { [key: string]: { queue: string; categories: string[] } };
  postponeOffset?: number;
}

@Injectable({
  providedIn: "root",
})
export class MapperService {
  private readonly planField: string = "Plan";
  private readonly numberField: string = "Number";
  private readonly refField: string = "Url";

  constructor(
    @Inject(APPOINTMENT_OPTIONS) private style: IAppointmentOptions
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
    // user predefined number form field
    const number = apt.userData[this.numberField];
    // other number schemes implented here.

    const startDate = new Date(apt.start);
    const phone = startDate.toLocaleTimeString("de-DE", {
      hour: "2-digit",
      minute: "2-digit",
    });

    // determine postpone
    const postpone =
      postponeOffset !== undefined
        ? new Date(+startDate + +postponeOffset)
        : undefined;

    return {
      appointment: apt.id,

      number: number,
      postpone: postpone,

      name: apt.title,
      phone: phone,
      ref: apt.userData[this.refField],

      queue: queue.queue,
      categories: queue.categories,
    };
  }
}
