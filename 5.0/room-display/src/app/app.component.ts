import { Component } from "@angular/core";
import { Observable, timer } from "rxjs";
import { mergeMap } from "rxjs/operators";
import { environment } from "src/environments/environment";
import { HttpClient } from "@angular/common/http";
import { isEqual, toNumber } from "lodash-es";
import { ActivatedRoute, Params } from "@angular/router";
import { WaitNumberItem } from "./model";
import { PlayerService } from "./player.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent {
  readonly updateInterval = 2500;
  readonly highlightTimeout = 10000;

  private list: WaitNumberItem[] = [];
  popup: WaitNumberItem | null = null;
  highlight = false;
  private highlightEnd: number = 0;

  audioSrc: string = "";
  voices: SpeechSynthesisVoice[] = [];
  speechUrl: string | null = null;
  speech: { voice: SpeechSynthesisVoice; text: string; rate: number } | null =
    null;
  audio: HTMLAudioElement | null = null;
  audioQueue: HTMLAudioElement[] = [];
  dataParams: Params | null = null;

  private roomFilter = "";

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private player: PlayerService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const notify = params["s/notify"] ?? "";
      this.speech = this.parseSpeechUrl(notify);
      this.speechUrl = this.speech ? notify : null;
      this.audioSrc = this.speech ? "" : notify;
      this.roomFilter = params["s/room"] ?? "";
      this.dataParams = params;
    });

    // read voices (this seems to be lazy loaded. Thus listen to changed event.)
    this.voices = speechSynthesis.getVoices();
    speechSynthesis.addEventListener("voiceschanged", () => {
      this.voices = speechSynthesis.getVoices();
      if (this.speechUrl) this.speech = this.parseSpeechUrl(this.speechUrl);
    });

    timer(0, this.updateInterval)
      .pipe(mergeMap(() => this.loadData()))
      .subscribe(
        (data) => this.updateList(data),
        (error) => console.error(error)
      );

    timer(0, 500).subscribe((data) => this.updateHighlight());
  }

  loadData(): Observable<WaitNumberItem[]> {
    const jsonFile = `${environment.dataServiceUrl}`;
    return this.http.get<WaitNumberItem[]>(jsonFile, {
      params: this.dataParams ?? [],
    });
  }

  updateList(items: WaitNumberItem[]) {
    if (this.roomFilter) items = items.filter((i) => i.room == this.roomFilter);

    var oldList = this.list;
    const newItems = items.filter((v) => !oldList.find((o) => isEqual(v, o)));
    this.list = items;

    if (newItems.length) {
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
    }
    this.updateHighlight();
  }

  updateHighlight() {
    // highlight
    const now = Date.now();
    if (this.highlight && this.highlightEnd <= now) {
      this.highlight = false;
    }
    if (
      !this.highlight &&
      this.list.length &&
      (this.popup?.number != this.list[0]?.number ||
        this.popup?.room != this.list[0].room)
    ) {
      this.highlight = true;
      this.highlightEnd = Date.now() + this.highlightTimeout;
    }

    // popup
    this.popup = this.list.length ? this.list[0] : null;
    this.player.setPaused(!this.list.length);

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
}
