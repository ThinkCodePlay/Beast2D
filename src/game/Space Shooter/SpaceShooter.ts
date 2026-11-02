import { Level } from "../../core/Level";
import { DISPLAY_HEIGHT, DISPLAY_WIDTH, PIXEL_GRID, SPRITE_SIZE, TEXTURE_BEAST_SHIP, TEXTURE_STARS_LAYER_1, TEXTURE_STARS_LAYER_2 } from "../../core/consts";
import { Globals } from "../../core/Globals";
import { Spaceship } from "./Game Objects/Spaceship";
import { EnemyCircleSpawner } from "./Game Objects/EnemyCircleSpawner";
import { ParallaxBackground } from "./Game Objects/ParallaxBackground";
import { HeartsUI } from "../../core/components/UI/HeartsUI";
import { DialogUI } from "../../core/components/UI/DialogUI";
import { ScoreUI } from "../../core/components/UI/ScoreUI";

export class SpaceShooter extends Level {
  override assets = [
    TEXTURE_BEAST_SHIP,
    TEXTURE_STARS_LAYER_1,
    TEXTURE_STARS_LAYER_2,
  ];

  protected init(): void {
    const startX = Globals.canvasWidth / 2;
    const startY = Globals.canvasHeight - PIXEL_GRID * 4 - SPRITE_SIZE / 2;

    // background
    this.levelRoot.addChild(new ParallaxBackground());

    // player
    this.levelRoot.addChild(new Spaceship(startX, startY));

    // enemies
    this.levelRoot.addChild(new EnemyCircleSpawner());

    // UI
    this.levelRoot.addChild(new HeartsUI(PIXEL_GRID, PIXEL_GRID, 3));
    this.levelRoot.addChild(
      new ScoreUI(Globals.canvasWidth - PIXEL_GRID, PIXEL_GRID),
    );

    const dialogWidth = DISPLAY_WIDTH - PIXEL_GRID * 2;
    const dialogHeight = PIXEL_GRID * 7;
    this.levelRoot.addChild(
      new DialogUI(
        PIXEL_GRID,
        (DISPLAY_HEIGHT - dialogHeight) / 2,
        dialogWidth,
        dialogHeight,
        "Game Over",
        0,
        false,
      ),
    );

    // dialog button handlers TODO: move to it's own game object
    DialogUI.setOnRestart(() => {
      this.engine.gameManager?.resume();
      this.engine.gameManager?.loadLevel("spaceShooter");
    });

    DialogUI.setOnPause(() => {
      this.engine.gameManager?.pause();
    });

    DialogUI.setOnResume(() => {
      this.engine.gameManager?.resume();
    });
  }
}
