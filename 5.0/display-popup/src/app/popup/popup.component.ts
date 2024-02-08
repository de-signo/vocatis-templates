import { Component, Input } from "@angular/core";
import { WaitNumberItem } from "vocatis-numbers";

@Component({
  selector: "app-popup",
  templateUrl: "./popup.component.html",
  styleUrls: ["./popup.component.scss"],
})
export class PopupComponent {
  @Input() waitNumber!: WaitNumberItem;

  constructor() {}
}
