import { TestBed } from "@angular/core/testing";

import { VocatisTicketsService } from "./vocatis-tickets.service";
import { VocatisApiService } from "@isign/vocatis-api";

describe("VocatisTicketsService", () => {
  let service: VocatisTicketsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: VocatisApiService, useValue: {} }],
    });
    service = TestBed.inject(VocatisTicketsService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });
});
