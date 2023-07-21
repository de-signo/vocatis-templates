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

import { Pipe, PipeTransform } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";

@Pipe({ name: "selectLang", pure: false })
export class SelectLangPipe implements PipeTransform {
  constructor(private translate: TranslateService) {}

  transform(text: string | { [key: string]: string }): string {
    if (typeof text === "string") {
      return text;
    } else {
      const lang = this.translate.currentLang;
      // match
      if (lang in text) return text[lang];

      const keys = Object.keys(text);

      // empty object
      if (!keys || !keys.length) return "";

      // use default
      return text[keys[0]];
    }
  }
}
