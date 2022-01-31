import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntrySelectComponent } from './entry-select.component';

describe('EntrySelectComponent', () => {
  let component: EntrySelectComponent;
  let fixture: ComponentFixture<EntrySelectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EntrySelectComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EntrySelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
