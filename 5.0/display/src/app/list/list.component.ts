/*
 *  Copyright (C) 2023 DE SIGNO GmbH
 *
 *  This program is dual licensed. If you did not license the program under
 *  different terms, the following applies:
 *
 *  This program is free software: You can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Affero General Public License for more details.
 *
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 */

import { Component, Input, OnDestroy } from "@angular/core";
import { isEqual } from "lodash-es";
import { Subscription, timer } from "rxjs";
import { WaitNumberItem } from "vocatis-numbers";

@Component({
  selector: "app-list",
  templateUrl: "./list.component.html",
  styleUrls: ["./list.component.scss"],
})
export class ListComponent implements OnDestroy {
  @Input() header: string = "";
  @Input() footer: string = "";
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
