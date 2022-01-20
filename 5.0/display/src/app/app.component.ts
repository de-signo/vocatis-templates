import { Component } from '@angular/core';
import { Observable, timer } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { isEqual } from 'lodash-es';
import { ActivatedRoute, Params } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  readonly updateInterval = 2500;
  readonly highlightTimeout = 5000;
  readonly popupTimeout = 10000;

  list: WaitNumberItem[] = [];
  enableHighlight = false;
  highlightQueue: { item: WaitNumberItem, ends: number }[] = [];
  enablePopup = false;
  popup: WaitNumberItem|null = null;
  popupEnd: number = 0;
  popupQueue: WaitNumberItem[] = [];
  audioSrc: string = "";
  audio: HTMLAudioElement|null = null;
  audioQueue: any[] = [];
  dataParams: Params|null = null;

  constructor(private http: HttpClient, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParams
      .subscribe(params => {
        this.enableHighlight = params["s/hl"] == "1";
        this.enablePopup = !!params["s/popup"];
        this.audioSrc = params["s/notify"] ?? "";
        this.dataParams = params;
      }
    );

    timer(0, this.updateInterval).pipe(
      mergeMap(() => this.loadData())
    ).subscribe(
      data => this.updateList(data),
      error => console.error(error)
    );

    timer(0, 500).subscribe(
      data => this.updateHighlight(),
    );
  }

  loadData(): Observable<WaitNumberItem[]>
  {
    const jsonFile = `${environment.dataServiceUrl}`;
    return this.http.get<WaitNumberItem[]>(jsonFile, { params: this.dataParams ?? []});
  }

  updateList(items: WaitNumberItem[])
  {
    var oldList = this.list;
    const newItems = items.filter((v) => !oldList.find(o=> isEqual(v, o)));

    this.list = items;

    if (newItems.length) {
      if (this.enablePopup) {
        this.popupQueue.push(...newItems);
      }

      if (this.enableHighlight) {
        const hlEnd = Date.now() + this.highlightTimeout;
        this.highlightQueue.push(...(newItems.map(i => { return { item: i, ends: hlEnd }})));
      }

      if (this.audioSrc)
        this.audioQueue.push(...newItems.map(i => this.prepareAudio(i)));
  
      this.updateHighlight();
    }
  }

  updateHighlight() {
    // highlight
    const now = Date.now();
    this.highlightQueue = this.highlightQueue.filter(h => h.ends > now);

    // popup
    if (this.popup && this.popupEnd <= now) {
      this.popup = null;
    }
    if (!this.popup && this.popupQueue.length) {
      this.popup = this.popupQueue.shift() ?? null;
      this.popupEnd = Date.now() + this.popupTimeout;
    }

    // audio
    if (this.audio && (this.audio.paused || this.audio.ended)) {
      this.audio = null;
    }
    if (!this.audio && this.audioQueue.length) {
      this.audio = this.audioQueue.shift() ?? null;
      this.audio?.play();
    }
  }

  prepareAudio(item: WaitNumberItem) : HTMLAudioElement {
    const audio = new Audio();
    audio.src = this.audioSrc.replace("~number~", item.number).replace("~room~", item.room);
    audio.load();
    return audio;
  }

  isHighlighted(item: WaitNumberItem): boolean {
    return !!this.highlightQueue.find(h => isEqual(h.item, item));
  }
}

class WaitNumberItem {
  number!: string;
  room!: string;
  marked = false;
}
