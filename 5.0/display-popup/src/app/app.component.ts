import { Component } from "@angular/core";
import { Subscription, timer } from "rxjs";
import { TemplateService } from "@isign/forms-templates";
import { VocatisDisplayService, WaitNumberItem } from "vocatis-numbers";
import { environment } from "src/environments/environment";
import { isEqual, toNumber } from "lodash-es";
import { Params } from "@angular/router";
import { PlayerService } from "./player.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent {
  readonly updateInterval = environment.updateInterval;
  readonly popupTimeout = environment.popupTimeout;

  private list: WaitNumberItem[] = [];
  private queue: { number: WaitNumberItem; audio?: HTMLAudioElement }[] = [];

  popup?: WaitNumberItem = undefined;
  popupEnd: number = 0;

  audioSrc: string = "";
  voices: SpeechSynthesisVoice[] = [];
  speechUrl: string | null = null;
  speech: { voice: SpeechSynthesisVoice; text: string; rate: number } | null =
    null;
  audio?: HTMLAudioElement = undefined;
  dataParams?: Params;

  private subscriptions: Subscription[] = [];

  constructor(
    private readonly vocatis: VocatisDisplayService,
    private readonly template: TemplateService,
    private player: PlayerService,
  ) {}

  ngOnInit(): void {
    const template = this.template.getTemplate();
    const notify = template.parameters["notify"] ?? "";
    this.speech = this.parseSpeechUrl(notify);
    this.speechUrl = this.speech ? notify : null;
    this.audioSrc = this.speech ? "" : notify;

    // read voices (this seems to be lazy loaded. Thus listen to changed event.)
    this.voices = speechSynthesis.getVoices();
    speechSynthesis.addEventListener("voiceschanged", () => {
      this.voices = speechSynthesis.getVoices();
      if (this.speechUrl) this.speech = this.parseSpeechUrl(this.speechUrl);
    });

    // load numbers
    const tmpl = this.template.getTemplate();
    const sources: string[] = []; // set is distinct
    for (let key in tmpl.parameters) {
      if (key.startsWith("source")) {
        const id = tmpl.parameters[key];
        if (!!id) sources.push(id);
      }
    }
    this.subscriptions.push(
      this.vocatis.getCalledNumbers(sources, [], environment.updateInterval)
      .subscribe((data) => this.updateList(data)),
    );
    this.subscriptions.push(
      timer(0, 500).subscribe((data) => this.updateHighlight()),
    );
  }

  ngOnDestroy() {
    this.subscriptions?.forEach((s) => s.unsubscribe());
    this.subscriptions = [];
  }

  updateList(items: WaitNumberItem[]) {
    var oldList = this.list;
    const newItems = items.filter((v) => !oldList.find((o) => isEqual(v, o)));
    this.list = items;

    if (newItems.length) {
      this.queue.push(
        ...newItems.map((item) => ({
          number: item,
          audio: this.prepareAudio(item),
        })),
      );
      this.updateHighlight();
    }
  }

  updateHighlight() {
    // popup
    const now = Date.now();
    if (this.popup && this.popupEnd <= now) {
      this.popup = undefined;
    }
    if (!this.popup && this.queue.length) {
      let item = this.queue.shift() ?? null;
      this.audio = item?.audio;
      this.popup = item?.number;
      this.audio?.play();
      if (item) this.speek(item.number);
      this.popupEnd = Date.now() + this.popupTimeout;
    }
    this.player.setPaused(!this.popup);

    // audio
    if (this.audio && (this.audio.paused || this.audio.ended)) {
      this.audio = undefined;
    }
  }

  prepareAudio(item: WaitNumberItem): HTMLAudioElement | undefined {
    if (!this.audioSrc) return undefined;

    const audio = new Audio();
    audio.src = this.audioSrc
      .replace("~number~", item.number)
      .replace("~room~", item.room);
    audio.load();
    return audio;
  }

  private speek(item: WaitNumberItem) {
    if (this.speech) {
      var speech = this.speech;
      const text = speech.text
        .replace("~number~", item.number)
        .replace("~room~", item.room);
      var utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = speech.voice;
      utterance.rate = speech.rate;
      speechSynthesis.speak(utterance);
    }
  }

  parseSpeechUrl(
    url: string,
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
          `Selected voice '${voice}' not found. Available voices: ${JSON.stringify(
            voices.map((v) => v.name),
          )}`,
        );
      }
      vvoice = found ?? voices[0];
    }
    var nrate = 1;
    if (rate) nrate = toNumber(rate);
    return { voice: vvoice, text: text, rate: nrate };
  }
}
