import { Component, OnDestroy, OnInit } from "@angular/core";
import { EMPTY, Observable, Subscription, throwError, timer } from "rxjs";
import { catchError, delay, mergeMap, retryWhen, tap } from "rxjs/operators";
import { environment } from "src/environments/environment";
import { HttpClient } from "@angular/common/http";
import { isEqual, toNumber } from "lodash-es";
import { ActivatedRoute, Params } from "@angular/router";
import { WaitNumberItem } from "./model";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent implements OnInit, OnDestroy {
  readonly updateInterval = 2500;
  readonly highlightTimeout = 5000;
  readonly popupTimeout = 10000;

  list: WaitNumberItem[] = [];
  enableHighlight = false;
  highlightQueue: { item: WaitNumberItem; ends: number }[] = [];
  enablePopup = false;
  popup: WaitNumberItem | null = null;
  popupEnd: number = 0;
  popupQueue: WaitNumberItem[] = [];
  audioSrc: string = "";

  voices: SpeechSynthesisVoice[] = [];
  speechUrl: string | null = null;
  speech: { voice: SpeechSynthesisVoice; text: string; rate: number } | null =
    null;
  audio: HTMLAudioElement | null = null;
  audioQueue: HTMLAudioElement[] = [];
  dataParams: Params | null = null;

  private subscriptions: Subscription[] = [];
  constructor(private http: HttpClient, private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.enableHighlight = params["s/hl"] == "1";
      this.enablePopup = !!params["s/popup"];
      const notify = params["s/notify"] ?? "";
      this.speech = this.parseSpeechUrl(notify);
      this.speechUrl = this.speech ? notify : null;
      this.audioSrc = this.speech ? "" : notify;
      this.dataParams = params;
    });

    // read voices (this seems to be lazy loaded. Thus listen to changed event.)
    this.voices = speechSynthesis.getVoices();
    speechSynthesis.addEventListener("voiceschanged", () => {
      this.voices = speechSynthesis.getVoices();
      if (this.speechUrl) this.speech = this.parseSpeechUrl(this.speechUrl);
    });

    this.subscriptions.push(
      timer(0, this.updateInterval)
        .pipe(
          mergeMap(() => this.loadData()),
          catchError((error) => {
            console.error(error);
            return throwError(error);
          }),
          retryWhen((errors) => errors.pipe(delay(this.updateInterval)))
        )
        .subscribe((data) => this.updateList(data))
    );

    this.subscriptions.push(
      timer(0, 500).subscribe((data) => this.updateHighlight())
    );
  }

  ngOnDestroy() {
    this.subscriptions?.forEach((s) => s.unsubscribe());
    this.subscriptions = [];
  }

  loadData(): Observable<WaitNumberItem[]> {
    const jsonFile = `${environment.dataServiceUrl}`;
    return this.http.get<WaitNumberItem[]>(jsonFile, {
      params: this.dataParams ?? [],
    });
  }

  updateList(items: WaitNumberItem[]) {
    // limit to 8 items
    items = items?.slice(0, 8);

    var oldList = this.list;
    const newItems = items.filter((v) => !oldList.find((o) => isEqual(v, o)));

    this.list = items;

    if (newItems.length) {
      if (this.enablePopup) {
        this.popupQueue.push(...newItems);
      }

      if (this.enableHighlight) {
        const hlEnd = Date.now() + this.highlightTimeout;
        this.highlightQueue.push(
          ...newItems.map((i) => {
            return { item: i, ends: hlEnd };
          })
        );
      }

      if (this.speech) {
        var speech = this.speech;
        newItems.forEach((item) => {
          const text = speech.text
            .replace("~number~", item.number)
            .replace("~room~", item.room);
          var utterance = new SpeechSynthesisUtterance(text);
          utterance.voice = speech.voice;
          utterance.rate = speech.rate;
          speechSynthesis.speak(utterance);
        });
      }

      if (this.audioSrc)
        this.audioQueue.push(...newItems.map((i) => this.prepareAudio(i)));

      this.updateHighlight();
    }
  }

  updateHighlight() {
    // highlight
    const now = Date.now();
    this.highlightQueue = this.highlightQueue.filter((h) => h.ends > now);

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

  prepareAudio(item: WaitNumberItem): HTMLAudioElement {
    const audio = new Audio();
    audio.src = this.audioSrc
      .replace("~number~", item.number)
      .replace("~room~", item.room);
    audio.load();
    return audio;
  }

  parseSpeechUrl(
    url: string
  ): { voice: SpeechSynthesisVoice; text: string; rate: number } | null {
    if (!url.startsWith("speech://")) return null;

    const query = url.substring(9);
    const vars = query.split("&");
    var voice = "";
    var text = "";
    var rate = "";
    for (var i = 0; i < vars.length; i++) {
      const pair = vars[i].split("=");
      const key = decodeURIComponent(pair[0]);
      if (key == "voice") {
        voice = decodeURIComponent(pair[1]);
      } else if (key == "text") {
        text = decodeURIComponent(pair[1]);
      } else if (key == "rate") {
        rate = decodeURIComponent(pair[1]);
      }
    }

    var voices = speechSynthesis.getVoices();
    var vvoice = voices[0];
    if (voice) {
      var found = voices.find((v) => v.name == voice);
      if (!found) found = voices.find((v) => v.name.startsWith(voice));
      if (!found) {
        console.log(
          `Selected voice '${voice}' not found. Available voices: ${voices}`
        );
      } else {
        vvoice = found ?? voices[0];
      }
    }
    var nrate = 1;
    if (rate) nrate = toNumber(rate);
    return { voice: vvoice, text: text, rate: nrate };
  }

  getHighlightedItems(): WaitNumberItem[] {
    return this.highlightQueue.map((h) => h.item);
  }
}
