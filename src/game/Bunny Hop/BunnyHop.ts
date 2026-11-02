import { Level } from "../../core/Level";
import {
  BUNNY_SPRITE_SIZE,
  DISPLAY_HEIGHT,
  DISPLAY_WIDTH,
  TEXTURE_BUNNY_MOVE_ANIMATION,
} from "../../core/consts";
import { BunnyPlayer } from "./Game Objects/BunnyPlayer";

export class BunnyHop extends Level {
  override assets = [TEXTURE_BUNNY_MOVE_ANIMATION];

  protected init(): void {
    const startX = (DISPLAY_WIDTH - BUNNY_SPRITE_SIZE) / 2;
    const startY = (DISPLAY_HEIGHT - BUNNY_SPRITE_SIZE) / 2;
    this.levelRoot.addChild(new BunnyPlayer(startX, startY));
  }
}
