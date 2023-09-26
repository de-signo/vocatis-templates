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

import {
  AfterViewInit,
  Directive,
  ElementRef,
  HostListener,
  Input,
} from "@angular/core";
import { timer } from "rxjs";

@Directive({
  selector: "[rightClick]",
})
export class RightClickDirective {
  constructor(private readonly elementRef: ElementRef) {}

  @HostListener("contextmenu", ["$event"]) onContextMenu($event: Event) {
    this.elementRef.nativeElement.click();
    $event.preventDefault();
  }
}
