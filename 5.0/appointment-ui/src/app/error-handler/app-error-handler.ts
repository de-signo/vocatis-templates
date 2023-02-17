import { ErrorHandler, EventEmitter, Injectable, NgZone } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class AppErrorHandler implements ErrorHandler {
  onError = new EventEmitter<ErrorModel>();

  constructor(private zone: NgZone) {}

  handleError(error: any) {
    let errObj: ErrorModel;
    if (typeof error === "string") {
      errObj = { message: error };
    } else if ("message" in error) {
      errObj = { message: error.message };
    } else {
      errObj = { message: error };
    }

    console.error(errObj.message);
    this.zone.run(() => this.onError.emit(errObj));
  }
}

export interface ErrorModel {
  message: string;
}
