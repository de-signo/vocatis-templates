import { EventEmitter, Injectable } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { firstValueFrom, timer } from "rxjs";
import { DataService } from "./data.service";
import { first } from "rxjs/operators";
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
            name: string
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

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private dataService: DataService,
    private style: StyleService
  ) {
    if (window.CefSharp) {
      window.CefSharp.BindObjectAsync("printer").then((e) => {
        this.isPrinterAvailable = e.Success;
        if (!e.Success) {
          console.warn(
            "No printing extension found. Maybe we're not on a iSign player. " +
              e.Message
          );
        }
      });
      window.CefSharp.BindObjectAsync("player").then((e) => {
        this.isPlayerAvailable = e.Success;
        if (!e.Success) {
          console.warn(
            "No player extension found. Maybe we're not on a iSign player. " +
              e.Message
          );
        }
      });
    } else {
      console.log(
        "Not running on an iSign player. Using printer dialog and disable printer status report."
      );
    }

    timer(10000, 60000).subscribe((_) =>
      this.reportPrinterStatus().catch((error) =>
        console.error("reportPrinterStatus failed. " + error)
      )
    );
  }

  private async reportPrinterStatus(): Promise<void> {
    if (!this.isPrinterAvailable || !this.isPlayerAvailable) return;
    let displayId = await window.player.getDisplayId();
    let status = await window.printer.getPrinterStatus();
    await this.dataService.postPrinterStatus(displayId, "default", status);
  }

  async handleGetNewNumber(b: LeanButtonModel) {
    this.button = b;
    await this.router.navigate(["/print-status", "ticket", "wait"], {
      queryParamsHandling: "preserve",
    });

    // get number from server
    let data = await firstValueFrom(
      this.dataService.getNewNumber(b.queue, b.categories)
    );
    this.current = data;
    this.onNumberGenerated.emit();
    if (this.style.enablePrint) {
      await this.router.navigate(
        [
          {
            outlets: { primary: ["print-status", "ticket"], print: ["ticket"] },
          },
        ],
        { queryParamsHandling: "preserve" }
      );
      await this.printNumber(data);
      await this.router.navigate(["/print-status", "ticket", "take"], {
        queryParamsHandling: "preserve",
      });

      await timer(3000).toPromise();
    } else {
      // show the number
      await this.router.navigate(["/print-status", "ticket", "show"], {
        queryParamsHandling: "preserve",
      });
      await timer(10000).toPromise();
    }

    // warning: race condition with timer (see above)
    await this.router.navigate(["/"], { queryParamsHandling: "preserve" });
  }

  async handlePrintTicket(
    num: WaitNumberModel,
    type: "appointment" | "ticket" = "ticket"
  ): Promise<void> {
    this.button = null;
    this.current = num;
    await this.router.navigate(["/print-status", type, "wait"], {
      queryParamsHandling: "preserve",
    });

    // get number from server
    if (this.style.enablePrint) {
      await this.router.navigate(
        [{ outlets: { primary: ["print-status", type], print: ["ticket"] } }],
        { queryParamsHandling: "preserve" }
      );
      await this.printNumber(num);
      await this.router.navigate(["/print-status", type, "take"], {
        queryParamsHandling: "preserve",
      });
      await timer(3000).toPromise();
    } else {
      // show the number
      await this.router.navigate(["/print-status", type, "show"], {
        queryParamsHandling: "preserve",
      });
      await timer(10000).toPromise();
    }

    // warning: race condition with timer (see above)
    await this.router.navigate(["/"], { queryParamsHandling: "preserve" });
  }

  async printNumber(num: WaitNumberModel) {
    // https://medium.com/@Idan_Co/angular-print-service-290651c721f9
    const component = this.printComponent;
    await component?.loaded();
    let blob = await toBlob(component?.element?.nativeElement, {
      pixelRatio: 2,
    });
    if (!blob) return;
    if (this.isPrinterAvailable) {
      let buffer = await blob.arrayBuffer();
      await window.printer.printImage([...new Uint8Array(buffer)]);
    } else {
      saveAs(blob, "ticket.png");
    }
  }
}
