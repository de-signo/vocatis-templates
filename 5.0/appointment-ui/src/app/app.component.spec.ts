import {
  fakeAsync,
  flushMicrotasks,
  getTestBed,
  inject,
  TestBed,
  tick,
} from "@angular/core/testing";
import {
  HttpClientTestingModule,
  HttpTestingController,
} from "@angular/common/http/testing";
import { AppComponent } from "./app.component";
import { ActivatedRoute } from "@angular/router";
import { of } from "rxjs";
import { environment } from "src/environments/environment";
import { timeout } from "rxjs/operators";

describe("AppComponent", () => {
  let httpMock: HttpTestingController;
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AppComponent,
        { provide: ActivatedRoute, useValue: { queryParams: of({}) } },
      ],
    }).compileComponents();
    const injector = getTestBed();
    httpMock = injector.get(HttpTestingController);
  });

  it("should poll (no error)", fakeAsync(
    inject([AppComponent], (component: AppComponent) => {
      component.ngOnInit();

      tick(100);
      flushMicrotasks();
      expect(component).toBeTruthy();

      let req = httpMock.expectOne(`${environment.dataServiceUrl}`);
      expect(req.request.method).toBe("GET");
      req.flush([]);

      httpMock.verify();

      tick(30000);
      req = httpMock.expectOne(`${environment.dataServiceUrl}`);
      expect(req.request.method).toBe("GET");
      req.flush([]);

      httpMock.verify();

      component.ngOnDestroy();
    })
  ));

  it("should poll (with error)", fakeAsync(
    inject([AppComponent], (component: AppComponent) => {
      component.ngOnInit();
      const spy = spyOn(console, "error");

      tick(100);
      expect(component).toBeTruthy();

      let req = httpMock.expectOne(
        `${environment.dataServiceUrl}`,
        "request 1"
      );
      expect(req.request.method).toBe("GET");
      req.error(new ProgressEvent("error"));

      httpMock.verify();
      expect(spy).toHaveBeenCalled();
      spy.calls.reset();

      tick(30000);
      req = httpMock.expectOne(`${environment.dataServiceUrl}`, "request 2");
      expect(req.request.method).toBe("GET");
      req.error(new ProgressEvent("error"));

      httpMock.verify();
      expect(spy).toHaveBeenCalled();
      spy.calls.reset();

      tick(30000);
      req = httpMock.expectOne(`${environment.dataServiceUrl}`, "request 3");
      expect(req.request.method).toBe("GET");
      req.flush([]);

      httpMock.verify();
      expect(spy).not.toHaveBeenCalled();
      spy.calls.reset();

      tick(30000);
      req = httpMock.expectOne(`${environment.dataServiceUrl}`, "request 4");
      expect(req.request.method).toBe("GET");
      req.error(new ProgressEvent("error"));

      httpMock.verify();
      expect(spy).toHaveBeenCalled();
      spy.calls.reset();

      tick(30000);
      req = httpMock.expectOne(`${environment.dataServiceUrl}`, "request 5");
      expect(req.request.method).toBe("GET");
      req.flush([]);

      httpMock.verify();
      expect(spy).not.toHaveBeenCalled();
      spy.calls.reset();

      tick(30000);
      req = httpMock.expectOne(`${environment.dataServiceUrl}`, "request 6");
      expect(req.request.method).toBe("GET");
      req.error(new ProgressEvent("error"));

      httpMock.verify();
      expect(spy).toHaveBeenCalled();
      spy.calls.reset();

      tick(30000);
      req = httpMock.expectOne(`${environment.dataServiceUrl}`, "request 7");
      expect(req.request.method).toBe("GET");
      req.flush([]);

      httpMock.verify();
      expect(spy).not.toHaveBeenCalled();
      spy.calls.reset();

      component.ngOnDestroy();
    })
  ));
});
