import { Component } from "@angular/core";
import { StyleService } from "../services/style.service";
import { TicketService } from "../services/ticket.service";

@Component({
  selector: "vpr-print",
  templateUrl: "./print.component.html",
  styleUrls: ["./print.component.scss"],
})
export class PrintComponent {
  get arrow() {
    return this.style.arrow;
  }

  constructor(public ticket: TicketService, private style: StyleService) {}
}
