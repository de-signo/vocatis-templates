import { ComponentFixture, TestBed } from "@angular/core/testing";

import { ScanAppointmentComponent } from "./scan-appointment.component";

describe("ScanAppointmentComponent", () => {
  let component: ScanAppointmentComponent;
  let fixture: ComponentFixture<ScanAppointmentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ScanAppointmentComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ScanAppointmentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
