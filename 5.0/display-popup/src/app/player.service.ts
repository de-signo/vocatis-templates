import { Injectable } from "@angular/core";
import { PlayerExtension, PlayerExtensionService } from "@isign/player-extensions"

@Injectable({
  providedIn: "root",
})
export class PlayerService {
  private readonly resolvePlayer: Promise<PlayerExtension|undefined>;
  private _paused = false;

  async getPaused(): Promise<boolean> {
    const player = await this.resolvePlayer;
    if (!player)
      return this._paused;

    try {
      return await player.isPaused();
    }
    catch (ex) {
      console.error(ex);
      return this._paused;
    }
  }

  async setPaused(value: boolean): Promise<any> {
    if (this._paused == value) return Promise.resolve();
    this._paused = value;

    const player = await this.resolvePlayer;
    if (player) {
      try {
        return player.setPaused(value);
      }
      catch (ex) {
        console.error(ex);
        return this._paused;
      }
    } else {
      console.log(`Conent controller set paused to ${value} ignored.`);
      return Promise.resolve();
    }
  }

  constructor(private readonly playerExt: PlayerExtensionService) {
    this.resolvePlayer = playerExt.getPlayer();
  }
}
