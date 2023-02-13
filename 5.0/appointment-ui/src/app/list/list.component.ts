import { Component, EventEmitter, Input, Output } from "@angular/core";
import { AppointmentModel } from "../services/model";

@Component({
  selector: "app-list",
  templateUrl: "./list.component.html",
  styleUrls: ["./list.component.scss"],
})
export class ListComponent {
  @Input() list: AppointmentModel[] = [];
  @Output() createTicket = new EventEmitter<AppointmentModel>();

  constructor() {}

  onCreateTicket(apt: AppointmentModel) {
    this.createTicket.emit(apt);
  }
}
