import { Injectable } from "@angular/core";
import { WaitNumberRequestModel } from "./model";
import {
  VocatisApiService,
  WaitNumberDetailsModel,
  WaitNumberModel,
} from "@isign/vocatis-api";
import { firstValueFrom } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class VocatisTicketsService {
  constructor(private readonly vocatis: VocatisApiService) {}

  async createTicket(
    wn: WaitNumberRequestModel,
  ): Promise<WaitNumberModel | WaitNumberDetailsModel> {
    if (wn.appointment) {
      // check if theres an existing number with that appointment
      var awn = await firstValueFrom(
        this.vocatis.getAppointmentWithNumbers(wn.appointment),
      );
      if (awn.appointment != null && awn.numbers?.length > 0) {
        return awn.numbers[0];
      }
    }

    const ticket = await firstValueFrom(
      this.vocatis.createTicket(
        wn.queue,
        wn.categories,
        wn.appointment,
        wn.number,
        wn.postpone,
      ),
    );
    if (!!wn.ref || !!wn.phone || !!wn.name || !!wn.description) {
      if (wn.name) ticket.name = wn.name;
      if (wn.phone) ticket.phone = wn.phone;
      if (wn.description) ticket.description = wn.description;
      if (wn.ref) ticket.referenceId = wn.ref;
      await firstValueFrom(this.vocatis.putTicket(ticket));
    }

    return ticket;
  }
}
