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
  selector: "[fixedfocus]",
})
export class FixedFocusDirective implements AfterViewInit {
  private shouldFocus = true;

  @Input()
  public set autofocus(shouldFocus: boolean) {
    this.shouldFocus = shouldFocus;
    this.checkFocus();
  }

  constructor(private readonly elementRef: ElementRef) {}

  public ngAfterViewInit() {
    this.checkFocus();
  }

  @HostListener("blur") onBlur() {
    timer(100).subscribe((_) => this.checkFocus());
  }

  private checkFocus() {
    if (!this.shouldFocus) {
      return;
    }

    const hostElement = <HTMLElement>this.elementRef.nativeElement;
    hostElement.focus();
  }
}
