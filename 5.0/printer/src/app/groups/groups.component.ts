/*
 *  Copyright (C) 2023 DE SIGNO GmbH
 *
 *  This program is dual licensed. If you did not license the program under
 *  differnt tems, the following applies:
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

import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { TopLevelItemModel } from "../services/app-data.model";
import { DataService } from "../services/data.service";

@Component({
  selector: "vpr-groups",
  templateUrl: "./groups.component.html",
  styleUrls: ["./groups.component.scss"],
})
export class GroupsComponent implements OnInit {
  groups: TopLevelItemModel[] = [];
  constructor(private data: DataService, private router: Router) {}

  ngOnInit(): void {
    this.data.groups.subscribe((data) => (this.groups = data));
  }

  selectGroup(g: TopLevelItemModel, index: number) {
    if (g.type == "appointment") {
      switch (g.mode) {
        case "id":
          this.router.navigate(["/enter-appoint-id"], {
            queryParamsHandling: "preserve",
          });
          break;
        case "scan":
          this.router.navigate(["/scan-appointment"], {
            queryParamsHandling: "preserve",
          });
          break;
      }
    } else {
      this.router.navigate(["/groups", index], {
        queryParamsHandling: "preserve",
      });
    }
  }
}
