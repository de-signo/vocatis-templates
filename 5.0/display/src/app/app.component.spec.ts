/*
 *  Copyright (C) 2023 DE SIGNO GmbH
 *
 *  This program is dual licensed. If you did not license the program under
 *  different terms, the following applies:
 *
 *  This program is free software: You can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Affero General Public License for more details.
 *
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 */

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

      let req = httpMock.expectOne(`${environment.dataServiceUrl}`);
      expect(req.request.method).toBe("GET");
      req.flush([]);

      httpMock.verify();

      tick(environment.updateInterval);
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

      tick(environment.updateInterval);
      req = httpMock.expectOne(`${environment.dataServiceUrl}`, "request 2");
      expect(req.request.method).toBe("GET");
      req.error(new ProgressEvent("error"));

      httpMock.verify();
      expect(spy).toHaveBeenCalled();
      spy.calls.reset();

      tick(environment.updateInterval);
      req = httpMock.expectOne(`${environment.dataServiceUrl}`, "request 3");
      expect(req.request.method).toBe("GET");
      req.flush([]);

      httpMock.verify();
      expect(spy).not.toHaveBeenCalled();
      spy.calls.reset();

      tick(environment.updateInterval);
      req = httpMock.expectOne(`${environment.dataServiceUrl}`, "request 4");
      expect(req.request.method).toBe("GET");
      req.error(new ProgressEvent("error"));

      httpMock.verify();
      expect(spy).toHaveBeenCalled();
      spy.calls.reset();

      tick(environment.updateInterval);
      req = httpMock.expectOne(`${environment.dataServiceUrl}`, "request 5");
      expect(req.request.method).toBe("GET");
      req.flush([]);

      httpMock.verify();
      expect(spy).not.toHaveBeenCalled();
      spy.calls.reset();

      tick(environment.updateInterval);
      req = httpMock.expectOne(`${environment.dataServiceUrl}`, "request 6");
      expect(req.request.method).toBe("GET");
      req.error(new ProgressEvent("error"));

      httpMock.verify();
      expect(spy).toHaveBeenCalled();
      spy.calls.reset();

      tick(environment.updateInterval);
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
