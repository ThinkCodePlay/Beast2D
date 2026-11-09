import { Level } from "../../core/Level";
import { DISPLAY_HEIGHT, DISPLAY_WIDTH } from "../../core/display";
import {
  BUNNY_SPRITE_SIZE,
  TEXTURE_BUNNY_IDLE,
  TEXTURE_BUNNY_WALK_ANIMATION,
} from "../publicAssets";
import { BunnyPlayer } from "./Game Objects/BunnyPlayer";

export class BunnyHop extends Level {
  override assets = [TEXTURE_BUNNY_IDLE, TEXTURE_BUNNY_WALK_ANIMATION];

  protected init(): void {
    const startX = (DISPLAY_WIDTH - BUNNY_SPRITE_SIZE) / 2;
    const startY = (DISPLAY_HEIGHT - BUNNY_SPRITE_SIZE) / 2;
    this.levelRoot.addChild(new BunnyPlayer(startX, startY));
  }
}
