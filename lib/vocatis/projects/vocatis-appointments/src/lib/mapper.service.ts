import { Inject, Injectable } from "@angular/core";
import { AppointmentModel, WaitNumberRequestModel } from "./model";

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
