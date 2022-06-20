import {
  AfterViewInit,
  Directive,
  ElementRef,
  HostListener,
  Input,
} from "@angular/core";
import { timer } from "rxjs";

@Directive({
  selector: "[fixedfocus]",
})
export class FixedFocusDirective implements AfterViewInit {
  private shouldFocus = true;

  @Input()
  public set autofocus(shouldFocus: boolean) {
    this.shouldFocus = shouldFocus;
    this.checkFocus();
  }

  constructor(private readonly elementRef: ElementRef) {}

  public ngAfterViewInit() {
    this.checkFocus();
  }

  @HostListener("blur") onBlur() {
    timer(100).subscribe((_) => this.checkFocus());
  }

  private checkFocus() {
    if (!this.shouldFocus) {
      return;
    }

    const hostElement = <HTMLElement>this.elementRef.nativeElement;
    hostElement.focus();
  }
}
