import {
  ComponentFixture,
  discardPeriodicTasks,
  fakeAsync,
  flush,
  flushMicrotasks,
  getTestBed,
  inject,
  TestBed,
  tick,
  waitForAsync,
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

      let req = httpMock.expectOne(`${environment.dataServiceUrl}?wait=120`);
      expect(req.request.method).toBe("GET");
      req.flush([]);

      httpMock.verify();

      tick(environment.updateInterval);
      req = httpMock.expectOne(
        `${environment.dataServiceUrl}?wait=120&last=97d170e1550eee4afc0af065b78cda302a97674c`
      );
      expect(req.request.method).toBe("GET");
      req.flush([]);

      httpMock.verify();

      component.ngOnDestroy();
      //tick(environment.updateInterval);
    })
  ));

  it("should poll (with error)", fakeAsync(
    inject([AppComponent], (component: AppComponent) => {
      component.ngOnInit();
      const spy = spyOn(console, "error");

      tick(100);
      expect(component).toBeTruthy();

      let req = httpMock.expectOne(
        `${environment.dataServiceUrl}?wait=120`,
        "request 1"
      );
      expect(req.request.method).toBe("GET");
      req.error(new ProgressEvent("error"));

      httpMock.verify();
      expect(spy).toHaveBeenCalled();
      spy.calls.reset();

      tick(environment.updateInterval);
      req = httpMock.expectOne(
        `${environment.dataServiceUrl}?wait=120`,
        "request 2"
      );
      expect(req.request.method).toBe("GET");
      req.error(new ProgressEvent("error"));

      httpMock.verify();
      expect(spy).toHaveBeenCalled();
      spy.calls.reset();

      tick(environment.updateInterval);
      req = httpMock.expectOne(
        `${environment.dataServiceUrl}?wait=120`,
        "request 3"
      );
      expect(req.request.method).toBe("GET");
      req.flush([]);

      httpMock.verify();
      expect(spy).not.toHaveBeenCalled();
      spy.calls.reset();

      tick(environment.updateInterval);
      req = httpMock.expectOne(
        `${environment.dataServiceUrl}?wait=120&last=97d170e1550eee4afc0af065b78cda302a97674c`,
        "request 4"
      );
      expect(req.request.method).toBe("GET");
      req.error(new ProgressEvent("error"));

      httpMock.verify();
      expect(spy).toHaveBeenCalled();
      spy.calls.reset();

      tick(environment.updateInterval);
      req = httpMock.expectOne(
        `${environment.dataServiceUrl}?wait=120&last=97d170e1550eee4afc0af065b78cda302a97674c`,
        "request 5"
      );
      expect(req.request.method).toBe("GET");
      req.flush([]);

      httpMock.verify();
      expect(spy).not.toHaveBeenCalled();
      spy.calls.reset();

      tick(environment.updateInterval);
      req = httpMock.expectOne(
        `${environment.dataServiceUrl}?wait=120&last=97d170e1550eee4afc0af065b78cda302a97674c`,
        "request 6"
      );
      expect(req.request.method).toBe("GET");
      req.error(new ProgressEvent("error"));

      httpMock.verify();
      expect(spy).toHaveBeenCalled();
      spy.calls.reset();

      tick(environment.updateInterval);
      req = httpMock.expectOne(
        `${environment.dataServiceUrl}?wait=120&last=97d170e1550eee4afc0af065b78cda302a97674c`,
        "request 7"
      );
      expect(req.request.method).toBe("GET");
      req.flush([]);

      httpMock.verify();
      expect(spy).not.toHaveBeenCalled();
      spy.calls.reset();

      component.ngOnDestroy();
    })
  ));

  it("should poll (delayed)", fakeAsync(
    inject([AppComponent], (component: AppComponent) => {
      component.ngOnInit();

      tick(100);
      flushMicrotasks();
      expect(component).toBeTruthy();

      let req = httpMock.expectOne(`${environment.dataServiceUrl}?wait=120`);
      expect(req.request.method).toBe("GET");
      tick(2 * environment.updateInterval);
      req.flush([]);

      httpMock.verify();

      tick(environment.updateInterval);
      req = httpMock.expectOne(
        `${environment.dataServiceUrl}?wait=120&last=97d170e1550eee4afc0af065b78cda302a97674c`
      );
      expect(req.request.method).toBe("GET");
      req.flush([]);

      httpMock.verify();

      component.ngOnDestroy();
    })
  ));
});
