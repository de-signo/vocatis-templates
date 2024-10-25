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

import { Component, OnDestroy } from "@angular/core";
import { LangChangeEvent, TranslateService } from "@ngx-translate/core";
import { ActivatedRoute, Router } from "@angular/router";
import { OnInit } from "@angular/core";
import { of, Subscription, timer } from "rxjs";
import { TicketStatus, WaitNumberState } from "./services/models";
import { DataService } from "./services/data.service";
import { switchMap } from "rxjs/operators";
import { environment } from "app_src/environments/environment";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent implements OnInit, OnDestroy {
  WaitNumberState = WaitNumberState;

  id: string = "";
  ticket: TicketStatus | null = null;
  error = false;

  showWaitTime = false;

  langs: string[] | null;
  locale: string = "de";
  now: number = 0;
  translateSvcSub: Subscription | undefined;

  constructor(
    route: ActivatedRoute,
    router: Router,
    private translate: TranslateService,
    private data: DataService,
  ) {
    // configure languages
    this.langs = null;
    translate.setDefaultLang("de");
    translate.use("de");

    route.queryParams.subscribe((params) => {
      const opt = params["o"];
      this.showWaitTime = opt == "wt";

      const lang = params["l"];
      if (lang) this.translate.use(lang);

      const multilang = params["m"];
      if (multilang && (multilang == "1" || multilang == 1))
        this.langs = multilang ? ["de", "en"] : null;

      const queue = params["q"];
      const cat = params["c"];
      if (queue) {
        this.data.getNewNumber(queue, cat).subscribe(
          (data) => {
            this.id = data.id;
            this.error = false;
            router.navigate(["/"], {
              replaceUrl: true,
              queryParams: { o: opt, l: lang, i: data.id },
            }); // remove queue query
          },
          (error) => {
            this.error = true;
            console.error("Creating new ticket failed.", error);
          },
        );
      } else {
        this.id = params["i"];
        if (!this.id) {
          console.error("Invalid request, nether 'q' nor 'i' is present.");
          this.error = true;
          return;
        }
        timer(0, environment.refreshInterval)
          .pipe(
            switchMap((_) =>
              this.id ? this.data.getStatus(this.id) : of(null),
            ),
          )
          .subscribe(
            (st) => {
              this.ticket = st;
              this.error = false;
              this.now = Date.now();
            },
            (error) => {
              this.error = true;
              console.error("Fetching ticket status failed.", error);
            },
          );
      }
    });
  }

  ngOnInit() {
    this.now = Date.now();
    this.locale = this.translate.currentLang;
    // don't forget to unsubscribe!
    this.translateSvcSub = this.translate.onLangChange.subscribe(
      (langChangeEvent: LangChangeEvent) => {
        this.locale = langChangeEvent.lang;
      },
    );
  }

  ngOnDestroy(): void {
    this.translateSvcSub?.unsubscribe();
  }

  setLanguage(lang: string) {
    this.translate.use(lang);
  }

  toMinutes(seconds: number | undefined) {
    return Math.floor(seconds ?? 0 / 60);
  }
}
