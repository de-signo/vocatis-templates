import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";

@Injectable({
  providedIn: "root",
})
export class ClickThrottleService {
  private lastClick: Date;

  constructor() {
    this.lastClick = new Date();
  }

  click(): boolean {
    let now = new Date();
    let dt = +now - +this.lastClick;
    let accept = dt > environment.throttleClicks;
    if (accept) this.lastClick = now;
    return accept;
  }
}
