import { ComponentFixture, TestBed } from "@angular/core/testing";

import { EnterAppointIdComponent } from "./enter-appoint-id.component";

describe("EnterAppointIdComponent", () => {
  let component: EnterAppointIdComponent;
  let fixture: ComponentFixture<EnterAppointIdComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EnterAppointIdComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EnterAppointIdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
