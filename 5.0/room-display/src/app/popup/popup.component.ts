import { Component, Input, OnInit } from "@angular/core";
import { WaitNumberItem } from "../model";

@Component({
  selector: "app-popup",
  templateUrl: "./popup.component.html",
  styleUrls: ["./popup.component.scss"],
})
export class PopupComponent {
  @Input() waitNumber!: WaitNumberItem;
  @Input() highlight!: boolean;

  constructor() {}

  getRoomNumber(item: WaitNumberItem): string {
    const regex = /^\D*/;
    const room = item.room;
    return room.replace(regex, "");
  }
}
