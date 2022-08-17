import { Component, Input, OnDestroy } from "@angular/core";
import { isEqual } from "lodash-es";
import { Subscription, timer } from "rxjs";
import { WaitNumberItem } from "../model";

@Component({
  selector: "app-list",
  templateUrl: "./list.component.html",
  styleUrls: ["./list.component.scss"],
})
export class ListComponent implements OnDestroy {
  @Input() list: WaitNumberItem[] = [];
  @Input() highlight: WaitNumberItem[] = [];
  now: Date = new Date();

  private subscriptions: Subscription[] = [];

  constructor() {
    this.subscriptions.push(
      timer(0, 10000).subscribe((_) => (this.now = new Date()))
    );
  }

  ngOnDestroy(): void {
    for (const sub of this.subscriptions) sub.unsubscribe();
    this.subscriptions = [];
  }

  isHighlighted(item: WaitNumberItem): boolean {
    return !!this.highlight.find((h) => isEqual(h, item));
  }
}
