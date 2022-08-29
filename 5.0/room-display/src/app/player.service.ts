import { Injectable } from "@angular/core";

declare global {
  interface Window {
    CefSharp:
      | {
          BindObjectAsync(
            name: string
          ): Promise<{ Success: boolean; Message: string }>;
        }
      | undefined;
    player: {
      getDisplayId(): Promise<string>;
      isActive(): Promise<boolean>;
      isPaused(): Promise<boolean>;
      setPaused(value: Boolean): Promise<any>;
      writeLog(category: string, level: number, message: string): Promise<any>;
    };
  }
}

@Injectable({
  providedIn: "root",
})
export class PlayerService {
  isPlayerAvailable = false;
  _paused = false;
  getPaused(): Promise<boolean> {
    if (this.isPlayerAvailable) {
      return window.player.isPaused();
    } else {
      return Promise.resolve(this._paused);
    }
  }

  setPaused(value: boolean): Promise<any> {
    if (this._paused == value) return Promise.resolve();
    this._paused = value;
    if (this.isPlayerAvailable) {
      return window.player.setPaused(value);
    } else {
      console.log(`Conent controller set paused to ${value} ignored.`);
      return Promise.resolve();
    }
  }

  constructor() {
    if (window.CefSharp) {
      window.CefSharp.BindObjectAsync("player").then((e) => {
        this.isPlayerAvailable = e.Success;
        if (!e.Success) {
          console.warn(
            "No player extension found. Maybe we're not on a iSign player. " +
              e.Message
          );
        }
      });
    } else {
      console.log(
        "Not running on an iSign player. Content controller disabled."
      );
    }
  }
}
