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
import { ActivatedRoute } from "@angular/router";
import { IAppointmentOptions } from "vocatis-lib/dist/vocatis-appointments";

@Injectable({
  providedIn: "root",
})
export class StyleService implements IAppointmentOptions {
  postponeOffset?: number;
  planToQueue: { [key: string]: { queue: string; categories: string[] } } = {};
  numberSource?: "auto" | "T3" | "T4" | "T5" | "user";

  constructor(route: ActivatedRoute) {
    route.queryParams.subscribe((params) => {
      const pp = params["s/pp"];
      this.postponeOffset =
        !pp && pp != "0" && pp != 0 ? undefined : 1000 * parseInt(pp);

      // read plan / queue map
      const apt_cats = params["s/ap_cat"] ?? [];
      let i = 1;
      let p2q = {} as {
        [key: string]: { queue: string; categories: string[] };
      };
      while (true) {
        let pn = params["s/ap_pn" + i];
        let qi = params["s/ap_qi" + i];
        if (!pn && !qi) break;
        p2q[pn] = { queue: qi, categories: apt_cats };
        i++;
      }
      this.planToQueue = p2q;
      this.numberSource = params["s/ns"] ?? "auto";
    });
  }
}
