import { ErrorHandler } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { AppErrorHandler } from "./app-error-handler";

describe("AppErrorHandler", () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [{ provide: ErrorHandler, useClass: AppErrorHandler }],
    }).compileComponents();
  });

  it("correctly handles error", () => {
    const spy = spyOn(console, "error");
    const error: Error = new Error("ERROR");

    var handler = new AppErrorHandler();
    handler.handleError(error);

    expect(spy).toHaveBeenCalledWith(error);
  });
});
