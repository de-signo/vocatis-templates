import { Component } from "@angular/core";
import { StyleService } from "../services/style.service";

@Component({
  selector: "vpr-info",
  templateUrl: "./info.component.html",
  styleUrls: ["./info.component.scss"],
})
export class InfoComponent {
  infoText: string = "";

  constructor(style: StyleService) {
    this.infoText = style.aptErrorInfo;
    style.updated.subscribe(() => {
      this.infoText = style.aptErrorInfo;
    });
  }
}
