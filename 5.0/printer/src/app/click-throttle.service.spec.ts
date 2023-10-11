import { TestBed } from "@angular/core/testing";

import { ClickThrottleService } from "./click-throttle.service";

describe("ClickThrottleService", () => {
  let service: ClickThrottleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ClickThrottleService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
