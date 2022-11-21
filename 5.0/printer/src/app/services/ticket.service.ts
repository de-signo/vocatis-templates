import { EventEmitter, Injectable } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { timer } from "rxjs";
import { DataService } from "./data.service";
import { first } from "rxjs/operators";
import {
  ButtonModel,
  LeanButtonModel,
  WaitNumberModel,
} from "./app-data.model";
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
  state: "wait" | "show" | "take" = "wait";
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
    this.state = "wait";
    this.button = b;
    await this.router.navigate(["/print-status"], {
      queryParamsHandling: "preserve",
    });

    // get number from server
    let data = await this.dataService
      .getNewNumber(b.queue, b.categories)
      .pipe(first())
      .toPromise();
    this.current = data;
    this.onNumberGenerated.emit();
    if (this.style.enablePrint) {
      await this.router.navigate(
        [{ outlets: { primary: ["print-status"], print: ["ticket"] } }],
        { queryParamsHandling: "preserve" }
      );
      await this.printNumber(data);
      this.state = "take";
      await timer(3000).toPromise();
    } else {
      // show the number
      this.state = "show";
      await timer(10000).toPromise();
    }

    this.state = "wait";
    // warning: race condition with timer (see above)
    await this.router.navigate(["/"], { queryParamsHandling: "preserve" });
  }

  async handlePrintTicket(num: WaitNumberModel): Promise<void> {
    this.state = "wait";
    this.button = null;
    this.current = num;
    await this.router.navigate(["/print-status"], {
      queryParamsHandling: "preserve",
    });

    // get number from server
    if (this.style.enablePrint) {
      await this.router.navigate(
        [{ outlets: { primary: ["print-status"], print: ["ticket"] } }],
        { queryParamsHandling: "preserve" }
      );
      await this.printNumber(num);
      this.state = "take";
      await timer(3000).toPromise();
    } else {
      // show the number
      this.state = "show";
      await timer(10000).toPromise();
    }

    this.state = "wait";
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
