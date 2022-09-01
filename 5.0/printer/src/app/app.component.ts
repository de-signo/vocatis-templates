import { Component, ElementRef, HostListener, ViewChild } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { DEFAULT_INTERRUPTSOURCES, Idle } from "@ng-idle/core";
import { Router } from "@angular/router";
import { EntrySelectComponent } from "./entry-select/entry-select.component";
import { StyleService } from "./services/style.service";
import { TicketService } from "./services/ticket.service";
import { TicketComponent } from "./ticket/ticket.component";
import { environment } from "src/environments/environment";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
  host: {
    "[class.view-print]": "style.view == 'print'",
  },
})
export class AppComponent {
  langs: string[] | null;
  showHome: boolean = true;
  showLogo: boolean;

  @ViewChild("printPage") printPage: ElementRef | null = null;

  constructor(
    idle: Idle,
    private router: Router,
    private translate: TranslateService,
    private style: StyleService,
    private ticket: TicketService
  ) {
    this.showLogo = environment.showLogo;

    // configure languages
    this.langs = environment.enableMultilang ? ["de", "en"] : null;
    translate.setDefaultLang("de");
    translate.use("de");

    // configure idle timeout
    idle.setIdle(environment.idleTimeout - 1);
    idle.setTimeout(1);
    idle.setInterrupts(DEFAULT_INTERRUPTSOURCES);
    idle.onTimeout.subscribe(() => {
      router.navigate(["/"], { queryParamsHandling: "preserve" });
      translate.use("de");
      idle.watch();
    });
    idle.watch();
  }

  onPrinterOutletActivate(c: any): void {
    this.ticket.printComponent = c as TicketComponent;
  }

  setLanguage(lang: string) {
    this.translate.use(lang);
  }

  onRouterOutletActivate(component: any) {
    // set home and entry page
    const activeStyle = this.style.activeStyle;
    if (component instanceof EntrySelectComponent) {
      this.showHome = false;
      if (activeStyle == "ticket") {
        this.router.navigate([{ outlets: { print: ["ticket"] } }], {
          queryParamsHandling: "preserve",
        });
      }
    } else this.showHome = true;
  }

  @HostListener("touchstart", ["$event"])
  touchHandler(event: any) {
    if (event.touches.length > 1) {
      // prevent mult touch
      event.preventDefault();
    }
  }

  @HostListener("contextmenu", ["$event"])
  onRightClick(event: any) {
    if (environment.production) event.preventDefault();
  }
}
