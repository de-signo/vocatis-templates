import { ComponentFixture, TestBed } from "@angular/core/testing";

import { SelectAppointModeComponent } from "./select-appoint-mode.component";

describe("SelectAppointModeComponent", () => {
  let component: SelectAppointModeComponent;
  let fixture: ComponentFixture<SelectAppointModeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SelectAppointModeComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectAppointModeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
