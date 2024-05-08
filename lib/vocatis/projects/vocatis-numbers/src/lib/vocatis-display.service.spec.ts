import {
  TestBed,
  fakeAsync,
  flushMicrotasks,
  inject,
  tick,
} from "@angular/core/testing";

import { VocatisDisplayService } from "./vocatis-display.service";
import { VocatisApiService } from "@isign/vocatis-api";
import { delay, of, take, throwError, timeout } from "rxjs";
import { TestScheduler } from "rxjs/testing";

describe("VocatisDisplayService", () => {
  let service: VocatisDisplayService;
  let api: VocatisApiService;
  let apiSpy: jasmine.SpyObj<VocatisApiService>;
  let testScheduler: TestScheduler;

  beforeEach(() => {
    testScheduler = new TestScheduler((actual, expected) => {
      return expect(actual).toEqual(expected);
    });
  });

  beforeEach(() => {
    api = apiSpy = jasmine.createSpyObj<VocatisApiService>(["getQueueDisplay"]);

    TestBed.configureTestingModule({
      providers: [{ provide: VocatisApiService, useValue: api }],
    });
    service = TestBed.inject(VocatisDisplayService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("should poll", () => {
    apiSpy.getQueueDisplay.and.returnValues(
      of({ body: [], etag: "tag1" }),
      // 100 (interval) + 100 (delay)
      of({ body: [], etag: "tag2" }).pipe(delay(100)),
      throwError(() => new Error("expected test error, should cause retry")),
      // 100 (start interval) + 100 (retry delay) + 300 (delay)
      of({ body: [], etag: "tag3" }).pipe(delay(300)),
    );

    const stream = service.getCalledNumbers(["id1"], [], 100).pipe(
      take(3), // end when all results are due (error does not emit a value)
    );
    expect(stream).toBeTruthy();
    const expectedMarbles = "a 199ms b 499ms (c|)";
    const expectedValues = {
      a: [],
      b: [],
      c: [],
    };

    testScheduler.run(({ expectObservable }) => {
      expectObservable(stream).toBe(expectedMarbles, expectedValues);
    });
  });
});
