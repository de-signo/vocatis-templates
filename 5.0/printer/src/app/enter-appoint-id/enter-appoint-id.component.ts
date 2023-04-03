import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { firstValueFrom, timer } from "rxjs";
import { ScanAppointmentService } from "../services/scan-appointment.service";

@Component({
  selector: "vpr-enter-appoint-id",
  templateUrl: "./enter-appoint-id.component.html",
  styleUrls: ["./enter-appoint-id.component.scss"],
})
export class EnterAppointIdComponent {
  state: "enter" | "checking" | "error" = "enter";
  errorCounter = 0;
  private _code = "";
  get code(): string {
    return this._code;
  }
  set code(value: string) {
    this._code = value;
    this.onCodeChanged();
  }

  private codeLength = 5;
  codeIndexes: number[];

  constructor(private scan: ScanAppointmentService, private router: Router) {
    this.codeIndexes = [...Array(this.codeLength).keys()];
  }

  addChar(char: number) {
    let code: string;
    if (this.state == "error") {
      this.state = "enter";
      code = "";
    } else code = this._code;
    code = code + char.toString();
    this.code = code;
  }

  private onCodeChanged() {
    if (this._code.length >= this.codeLength) {
      this.checkCode(this._code);
    }
  }

  private async checkCode(code: string): Promise<void> {
    this.state = "checking";
    await firstValueFrom(timer(200));
    const apt = await this.scan.findAppointment(code);
    if (!apt) {
      this.errorCounter++;
      this.state = "error";
      this.code = "";
      console.log(
        `The appointment with id '${code}' was not found in the list.`
      );
      if (this.errorCounter == 3) {
        await this.router.navigate(["/info"], {
          queryParamsHandling: "preserve",
        });
      }
    } else {
      await this.scan.handleAppointment(apt);
    }
  }
}
