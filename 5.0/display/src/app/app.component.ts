/*
 *  Copyright (C) 2023 DE SIGNO GmbH
 *
 *  This program is dual licensed. If you did not license the program under
 *  different terms, the following applies:
 *
 *  This program is free software: You can redistribute it and/or modify
 *  it under the terms of the GNU Affero General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU Affero General Public License for more details.
 *
 *  You should have received a copy of the GNU Affero General Public License
 *  along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 */

import { Component, OnDestroy, OnInit } from "@angular/core";
import { Subscription, timer } from "rxjs";
import { environment } from "src/environments/environment";
import { isEqual, toNumber } from "lodash-es";
import { WaitNumberItem } from "vocatis-numbers";
import { DataService } from "./data.service";
import { TemplateService } from "@isign/forms-templates";
import { PlayerExtensionService } from "@isign/player-extensions";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent implements OnInit, OnDestroy {
  readonly updateInterval = environment.updateInterval;
  readonly highlightTimeout = 5000;
  readonly popupTimeout = 10000;

  header: string = "";
  footer: string = "";

  list: WaitNumberItem[] = [];
  enableHighlight = false;
  highlightQueue: { item: WaitNumberItem; ends: number }[] = [];
  enablePopup = false;
  hideWhenEmpty = false;
  popup: WaitNumberItem | null = null;
  popupEnd: number = 0;
  popupQueue: WaitNumberItem[] = [];
  audioSrc: string = "";

  private voicesLoaded = false;
  speechUrl: string | null = null;
  speech: { voice: SpeechSynthesisVoice; text: string; rate: number } | null =
    null;
  audio: HTMLAudioElement | null = null;
  audioQueue: HTMLAudioElement[] = [];

  private subscriptions: Subscription[] = [];
  constructor(
    private readonly dataSvc: DataService,
    private readonly tmplSvc: TemplateService,
    private readonly player: PlayerExtensionService,
  ) {}

  ngOnInit(): void {
    const tmpl = this.tmplSvc.getTemplate();
    const params = tmpl.parameters;
    this.header = params["header"] ?? "";
    this.footer = params["footer"] ?? "";
    this.enableHighlight = params["hl"] == "1";
    this.enablePopup = !!params["popup"];
    this.hideWhenEmpty = !!params["empty"];
    const notify = params["notify"] ?? "";
    this.speech = this.parseSpeechUrl(notify);
    this.speechUrl = this.speech ? notify : null;
    this.audioSrc = this.speech ? "" : notify;

    // read voices (this seems to be lazy loaded. Thus listen to changed event.)
    speechSynthesis.addEventListener("voiceschanged", () => {
      this.voicesLoaded = true;
      if (this.speechUrl) this.speech = this.parseSpeechUrl(this.speechUrl);
    });

    this.subscriptions.push(
      this.dataSvc
        .loadData(this.updateInterval)
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
    // limit to 8 items
    items = items?.slice(0, 8);

    var oldList = this.list;
    const newItems = items.filter((v) => !oldList.find((o) => isEqual(v, o)));

    this.list = items;
    if (this.hideWhenEmpty) {
      this.updateContentPaused();
    }

    if (newItems.length) {
      if (this.enablePopup) {
        this.popupQueue.push(...newItems);
      }

      if (this.enableHighlight) {
        const hlEnd = Date.now() + this.highlightTimeout;
        this.highlightQueue.push(
          ...newItems.map((i) => {
            return { item: i, ends: hlEnd };
          }),
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

  private async updateContentPaused() {
    try {
      if (!this.hideWhenEmpty) return;

      const player = await this.player.getPlayer();
      if (!player) return;

      const list = this.list;
      const paused = !list || !list.length;
      await player?.setPaused(paused);
    } catch (ex) {
      console.error("failed to set content paused", ex);
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
        if (this.voicesLoaded) {
          console.log(
            `Selected voice '${voice}' not found. Available voices: ${voices.map(
              (v) => v.name,
            )}`,
          );
        }
      } else {
        vvoice = found ?? voices[0];
      }
    }
    var nrate = 1;
    if (rate) nrate = toNumber(rate);
    if (vvoice) {
      console.log(`Using voice: ${vvoice?.name}`);
    }
    return { voice: vvoice, text: text, rate: nrate };
  }

  getHighlightedItems(): WaitNumberItem[] {
    return this.highlightQueue.map((h) => h.item);
  }
}
