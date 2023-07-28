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

import { Injectable } from "@angular/core";
import { DEFAULT_INTERRUPTSOURCES, Idle } from "@ng-idle/core";
import { StyleService } from "./style.service";
import { Router } from "@angular/router";

@Injectable({
  providedIn: "root",
})
export class TimeoutService {
  constructor(private idle: Idle, style: StyleService, router: Router) {
    style.updated.subscribe(() => {
      this.idle.setIdle(style.idleTimeout - 1);
    });
    this.idle.setIdle(style.idleTimeout - 1);
    this.idle.setTimeout(1);
    this.idle.setInterrupts(DEFAULT_INTERRUPTSOURCES);
    this.idle.onTimeout.subscribe(() => {
      router.navigate(["/"], { queryParamsHandling: "preserve" });
      this.idle.setIdle(style.idleTimeout - 1);
      this.idle.watch();
    });
    this.idle.watch();
  }

  useTimeout(seconds: number) {
    if (seconds <= 1) return;

    this.idle.setIdle(seconds - 1);
    this.idle.watch();
  }
}
