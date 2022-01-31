import { Component, ElementRef, OnDestroy, OnInit } from '@angular/core';
import { LangChangeEvent, TranslateService } from '@ngx-translate/core';
import { Subject, Subscription } from 'rxjs';
import { first } from 'rxjs/operators';
import { WaitNumberModel } from '../services/app-data.model';
import { AppLinkService } from '../services/app-link.service';
import { StyleService } from '../services/style.service';
import { TicketService } from '../services/ticket.service';

@Component({
  selector: 'vpr-ticket',
  templateUrl: './ticket.component.html',
  styleUrls: ['./ticket.component.scss']
})
export class TicketComponent implements OnInit, OnDestroy {
  
  get number(): WaitNumberModel|null {
    if (this.styleService.activeStyle == "ticket")
      return { id:this.styleService.ticketId,  number: this.styleService.ticketNumber };
    else
      return this.ticket.current;
  }

  getAppLink(num: WaitNumberModel): string {
    return this.appLink.getAppUrl(num.id);
  }
 
  locale: string = "de";
  now: number = 0;
  private tranlateSvcSub: Subscription | null = null;
  private loadedSubject = new Subject<boolean>();
  private isLoaded = false;
  private loadedImages = 0;
  get showQrCode() { return this.styleService.ticketShowQrCode };

  constructor(private translateService: TranslateService, private styleService: StyleService, private ticket: TicketService,
    private appLink: AppLinkService, public element: ElementRef) { }

  ngOnInit() {
    this.now = Date.now();
    this.locale = this.translateService.currentLang;
    // don't forget to unsubscribe!
    this.tranlateSvcSub = this.translateService.onLangChange
      .subscribe((langChangeEvent: LangChangeEvent) => {
          this.locale = langChangeEvent.lang;
      });
    this.loaded().then(_ => {
      if (this.styleService.activeStyle == "ticket") {
        // auto print the window
        window.focus();
        window.print();
        // remove this line for testing:
        window.setTimeout(function () { window.close() }, 1000);
      }
    })
  }

  ngOnDestroy(): void {
    this.tranlateSvcSub?.unsubscribe();
  }

  loaded(): Promise<any> {
    if (this.isLoaded)
      return Promise.resolve();
    else
      return this.loadedSubject.pipe(first()).toPromise();
  }

  onImgLoaded(event: any) {
    this.loadedImages++;
    let count = this.element.nativeElement.getElementsByTagName("img").length;
    if (this.loadedImages >= count) {
      this.isLoaded = true;
      this.loadedSubject.next();
    }
  }
}
