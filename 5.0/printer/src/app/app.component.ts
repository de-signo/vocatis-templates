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

import { Component, ElementRef, HostListener, ViewChild } from "@angular/core";
import { TranslateService } from "@ngx-translate/core";
import { DEFAULT_INTERRUPTSOURCES, Idle } from "@ng-idle/core";
import { Router } from "@angular/router";
import { of, Subject, throwError, timer } from "rxjs";
import { DataService } from "./services/data.service";
import {
  catchError,
  concatMap,
  delay,
  retryWhen,
  startWith,
  switchMap,
} from "rxjs/operators";
import {
  appoinmentModeToEntryRoute,
  EntrySelectComponent,
} from "./entry-select/entry-select.component";
import { SelectQueueComponent } from "./select-queue/select-queue.component";
import { ScanAppointmentComponent } from "./scan-appointment/scan-appointment.component";
import { AppointmentModes, StyleService } from "./services/style.service";
import { TicketService } from "./services/ticket.service";
import { TicketComponent } from "./ticket/ticket.component";
import { environment } from "src/environments/environment";
import { GroupsComponent } from "./groups/groups.component";
import { OnInit } from "@angular/core";
import { EnterAppointIdComponent } from "./enter-appoint-id/enter-appoint-id.component";
import { SelectAppointModeComponent } from "./select-appoint-mode/select-appoint-mode.component";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
  host: {
    "[class.view-print]": "style.view == 'print'",
    "[class.view-ticket]": "style.activeStyle == 'ticket'",
  },
})
export class AppComponent implements OnInit {
  langs: string[] | null;
  showHome: boolean = true;
  showInfo: boolean = true;
  showLogo: boolean;
  private readonly updateInterval = 1 * 20 * 1000;

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

    this.style.updated.subscribe(() => {
      this.showInfo = !!style.aptErrorInfo;
    });

    idle.onTimeout.subscribe(() => {
      translate.use("de");
    });
  }

  ngOnInit(): void {
    // configure data loading
    this.ticket.onNumberGenerated
      .asObservable()
      .pipe(
        startWith(0),
        switchMap(() => timer(0, this.updateInterval)),
        switchMap((_) => {
          const activeStyle = this.style.activeStyle;
          if (activeStyle == "groups") {
            return this.dataService
              .loadGroups()
              .pipe(concatMap((_) => this.dataService.loadAppointments()));
          } else if (activeStyle == "appointment") {
            return this.dataService.loadAppointments();
          } else if (activeStyle == "printer") {
            return this.dataService.loadButtons();
          } else if (activeStyle == "select") {
            return this.dataService
              .loadAppointments()
              .pipe(concatMap((_) => this.dataService.loadButtons()));
          } else return of(null);
        }),
        catchError((error) => {
          console.error(error);
          return throwError(error);
        }),
        retryWhen((errors) => errors.pipe(delay(this.updateInterval)))
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
      if (activeStyle == "appointment") {
        const aRoute = appoinmentModeToEntryRoute(this.style.appointmentMode);
        this.router.navigate([aRoute], {
          queryParamsHandling: "preserve",
        });
      } else if (activeStyle == "printer") {
        this.router.navigate(["/select-queue"], {
          queryParamsHandling: "preserve",
        });
      } else if (activeStyle == "groups") {
        if (this.style.entryPage == "groups")
          this.router.navigate(["/groups"], {
            queryParamsHandling: "preserve",
          });
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
    else if (activeStyle == "appointment") {
      const apm =
        this.style.appointmentMode &
        (AppointmentModes.QRCode | AppointmentModes.AppointmentId);
      this.showHome = !(
        (component instanceof ScanAppointmentComponent &&
          apm == AppointmentModes.QRCode) ||
        (component instanceof EnterAppointIdComponent &&
          apm == AppointmentModes.AppointmentId) ||
        (component instanceof SelectAppointModeComponent &&
          apm == (AppointmentModes.AppointmentId | AppointmentModes.QRCode))
      );
    } else if (activeStyle == "groups" && component instanceof GroupsComponent)
      this.showHome = this.style.entryPage != "groups";
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
