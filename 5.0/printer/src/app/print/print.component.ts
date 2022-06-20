import { Component, OnInit } from "@angular/core";
import { TicketService } from "../services/ticket.service";

@Component({
  selector: "vpr-print",
  templateUrl: "./print.component.html",
  styleUrls: ["./print.component.scss"],
})
export class PrintComponent {
  constructor(public ticket: TicketService) {}
}
