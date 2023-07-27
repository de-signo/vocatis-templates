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

import { ErrorHandler, EventEmitter, Injectable, NgZone } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class AppErrorHandler implements ErrorHandler {
  onError = new EventEmitter<ErrorModel>();

  constructor(private zone: NgZone) {}

  handleError(error: any) {
    let errObj: ErrorModel;
    if (typeof error === "string") {
      errObj = { message: error };
    } else if ("message" in error) {
      errObj = { message: error.message };
    } else {
      errObj = { message: error };
    }

    console.error(errObj.message);
    this.zone.run(() => this.onError.emit(errObj));
  }
}

export interface ErrorModel {
  message: string;
}
