import { Component, ElementRef, HostListener, ViewChild } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { DEFAULT_INTERRUPTSOURCES, Idle } from "@ng-idle/core";
import { Router } from "@angular/router";
import { of, timer } from "rxjs";
import { DataService } from "./services/data.service";
import { concatMap, switchMap } from "rxjs/operators";
import { EntrySelectComponent } from "./entry-select/entry-select.component";
import { SelectQueueComponent } from "./select-queue/select-queue.component";
import { ScanAppointmentComponent } from "./scan-appointment/scan-appointment.component";
import { StyleService } from "./services/style.service";
import { TicketService } from "./services/ticket.service";
import { TicketComponent } from "./ticket/ticket.component";
import { environment } from "src/environments/environment";
import { GroupsComponent } from "./groups/groups.component";
import { OnInit } from "@angular/core";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
  host: {
    "[class.view-print]": "style.view == 'print'",
  },
})
export class AppComponent implements OnInit {
  langs: string[] | null;
  showHome: boolean = true;
  showLogo: boolean;

  @ViewChild("printPage") printPage: ElementRef | null = null;

  constructor(
    idle: Idle,
    private router: Router,
    private translate: TranslateService,
    private dataService: DataService,
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

  ngOnInit(): void {
    // configure data loading
    timer(0, 1 * 60 * 1000)
      .pipe(
        switchMap((_) => {
          const activeStyle = this.style.activeStyle;
          if (activeStyle == "groups") {
            return this.dataService.loadGroups();
          } else if (activeStyle == "appointment") {
            return this.dataService.loadAppointments();
          } else if (activeStyle == "printer") {
            return this.dataService.loadButtons();
          } else if (activeStyle == "select") {
            return this.dataService
              .loadAppointments()
              .pipe(concatMap((_) => this.dataService.loadButtons()));
          } else return of(null);
        })
      )
      .subscribe(
        (_) => {},
        (error) => console.error(error)
      );
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
      if (activeStyle == "appointment")
        this.router.navigate(["/scan-appointment"], {
          queryParamsHandling: "preserve",
        });
      else if (activeStyle == "printer") {
        this.router.navigate(["/select-queue"], {
          queryParamsHandling: "preserve",
        });
      } else if (activeStyle == "groups") {
        this.router.navigate(["/groups"], { queryParamsHandling: "preserve" });
      } else if (activeStyle == "ticket") {
        this.router.navigate([{ outlets: { print: ["ticket"] } }], {
          queryParamsHandling: "preserve",
        });
      }
    } else if (
      activeStyle == "printer" &&
      component instanceof SelectQueueComponent
    )
      this.showHome = false;
    else if (
      activeStyle == "appointment" &&
      component instanceof ScanAppointmentComponent
    )
      this.showHome = false;
    else if (activeStyle == "groups" && component instanceof GroupsComponent)
      this.showHome = false;
    else this.showHome = true;
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
