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
    private data: DataService
  ) {
    // configure languages
    this.langs = environment.enableMultilang ? ["de", "en"] : null;
    translate.setDefaultLang("de");
    translate.use("de");

    route.queryParams.subscribe((params) => {
      const opt = params["o"];
      this.showWaitTime = opt == "wt";

      const lang = params["l"];
      if (lang) this.translate.use(lang);

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
          }
        );
      } else {
        this.id = params["i"];
        timer(0, environment.refreshInterval)
          .pipe(
            switchMap((_) =>
              this.id ? this.data.getStatus(this.id) : of(null)
            )
          )
          .subscribe(
            (st) => {
              this.ticket = st;
              this.error = false;
              this.now = Date.now();
            },
            (error) => {
              this.error = true;
              console.error(error);
            }
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
      }
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
