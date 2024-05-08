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
import { TemplateService } from "@isign/forms-templates";
import { Observable } from "rxjs";
import { VocatisDisplayService, WaitNumberItem } from "vocatis-numbers";

@Injectable({
  providedIn: "root",
})
export class DataService {
  constructor(
    private readonly vocatis: VocatisDisplayService,
    private readonly template: TemplateService
  ) {}

  loadData(updateInterval: number): Observable<WaitNumberItem[]> {
    // read the template
    const tmpl = this.template.getTemplate();

    // list of source ids
    const sources: string[] = []; // set is distinct
    for (let key in tmpl.parameters) {
      if (key.startsWith("source")) {
        const id = tmpl.parameters[key];
        if (!!id) sources.push(id);
      }
    }

    // highlight categories
    const cats = tmpl.parameters["highlightcat"]?.split(",") ?? [];

    return this.vocatis.getCalledNumbers(sources, cats, updateInterval);
  }
}
