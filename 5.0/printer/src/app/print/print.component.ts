import { Component } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Subscription } from "rxjs";
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

  isAppointment = false;
  state: "wait" | "take" | "show" = "wait";

  private subscriptions: Subscription[] = [];
  constructor(
    public ticket: TicketService,
    private style: StyleService,
    route: ActivatedRoute
  ) {
    this.subscriptions.push(
      route.params.subscribe((params) => {
        const i = params["type"];
        this.isAppointment = i === "appointment";
        this.state = params["state"];
      })
    );
  }

  ngOnDestroy(): void {
    for (const sub of this.subscriptions) sub.unsubscribe();
    this.subscriptions = [];
  }
}
