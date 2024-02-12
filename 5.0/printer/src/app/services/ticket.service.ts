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

import { EventEmitter, Injectable } from "@angular/core";
import { NavigationStart, Router } from "@angular/router";
import { firstValueFrom, timer } from "rxjs";
import { DataService } from "./data.service";
import { LeanButtonModel, WaitNumberModel } from "./app-data.model";
import { StyleService } from "./style.service";
import { TicketComponent } from "../ticket/ticket.component";
import { toBlob } from "html-to-image";
import { saveAs } from "file-saver";

declare global {
  interface Window {
    CefSharp:
      | {
          BindObjectAsync(
            name: string,
          ): Promise<{ Success: boolean; Message: string }>;
        }
      | undefined;
    printer: {
      printImage(content: number[]): Promise<any>;
      getPrinterStatus(): Promise<number>;
    };
    player: {
      getDisplayId(): Promise<string>;
    };
  }
}

@Injectable({
  providedIn: "root",
})
export class TicketService {
  isPrinterAvailable = false;
  isPlayerAvailable = false;

  current: WaitNumberModel = { id: "", number: "AA 530" };
  button: LeanButtonModel | null = null;
  printComponent: TicketComponent | null = null; // must be set by app component when ticket is loaded
  onNumberGenerated = new EventEmitter();
  cancel?: AbortController;

  constructor(
    private router: Router,
    private dataService: DataService,
    private style: StyleService,
  ) {
    if (window.CefSharp) {
      window.CefSharp.BindObjectAsync("printer").then((e) => {
        this.isPrinterAvailable = e.Success;
        if (!e.Success) {
          console.warn(
            "No printing extension found. Maybe we're not on a iSign player. " +
              e.Message,
          );
        }
      });
      window.CefSharp.BindObjectAsync("player").then((e) => {
        this.isPlayerAvailable = e.Success;
        if (!e.Success) {
          console.warn(
            "No player extension found. Maybe we're not on a iSign player. " +
              e.Message,
          );
        }
      });
    } else {
      console.log(
        "Not running on an iSign player. Using printer dialog and disable printer status report.",
      );
    }

    router.events.subscribe((event) => {
      if (event instanceof NavigationStart) {
        if (!event.url.includes("/print-status")) {
          this.cancel?.abort();
        }
      }
    });
  }

  async handleGetNewNumber(b: LeanButtonModel) {
    const cancel = await this.beginPrint(b);
    if (cancel.aborted) return;

    // get number from server
    let data = await firstValueFrom(
      this.dataService.getNewNumber(b.queue, b.categories),
    );

    if (cancel.aborted) return;
    await this.endPrint(data, "ticket", cancel);
  }

  async handlePrintTicket(
    num: WaitNumberModel,
    type: "appointment" | "ticket" = "ticket",
  ): Promise<void> {
    const cancel = await this.beginPrint(null, type);
    if (cancel.aborted) return;
    await this.endPrint(num, type, cancel);
  }

  private async beginPrint(
    b: LeanButtonModel | null,
    type: "appointment" | "ticket" = "ticket",
  ): Promise<AbortSignal> {
    this.button = null;

    const cancel = new AbortController();
    this.cancel = cancel;

    await this.router.navigate(["/print-status", type, "wait"], {
      queryParamsHandling: "preserve",
    });

    return cancel.signal;
  }

  private async endPrint(
    num: WaitNumberModel,
    type: "appointment" | "ticket" = "ticket",
    cancel: AbortSignal,
  ) {
    this.current = num;
    this.onNumberGenerated.emit();
    if (cancel.aborted) return;

    // get number from server
    if (this.style.enablePrint) {
      await this.router.navigate(
        [
          {
            outlets: {
              primary: ["print-status", type, "wait"],
              print: ["ticket"],
            },
          },
        ],
        { queryParamsHandling: "preserve" },
      );
      if (cancel.aborted) return;
      await this.printNumber(num);
      if (cancel.aborted) return;
      await this.router.navigate(["/print-status", type, "take"], {
        queryParamsHandling: "preserve",
      });
      if (cancel.aborted) return;
      await firstValueFrom(timer(3000));
    } else {
      // show the number
      await this.router.navigate(["/print-status", type, "show"], {
        queryParamsHandling: "preserve",
      });
      if (cancel.aborted) return;
      await firstValueFrom(timer(10000));
    }

    if (cancel.aborted) return;
    await this.router.navigate(["/"], { queryParamsHandling: "preserve" });
  }

  private async printNumber(num: WaitNumberModel) {
    // https://medium.com/@Idan_Co/angular-print-service-290651c721f9
    const component = this.printComponent;
    await component?.loaded();
    let blob = await toBlob(component?.element?.nativeElement, {
      pixelRatio: 2,
    });
    if (!blob) return;
    if (this.isPrinterAvailable) {
      console.log("Sending ticket to printer component");
      let buffer = await blob.arrayBuffer();
      await window.printer.printImage([...new Uint8Array(buffer)]);
    } else {
      console.log(
        "No printer component available. Providing the ticket as download.",
      );
      saveAs(blob, "ticket.png");
    }
  }
}
