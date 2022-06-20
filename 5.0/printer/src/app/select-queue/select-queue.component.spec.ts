import { ComponentFixture, TestBed } from "@angular/core/testing";

import { SelectQueueComponent } from "./select-queue.component";

describe("SelectQueueComponent", () => {
  let component: SelectQueueComponent;
  let fixture: ComponentFixture<SelectQueueComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SelectQueueComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SelectQueueComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
