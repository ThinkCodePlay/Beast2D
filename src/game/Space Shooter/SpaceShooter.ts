import { Level } from "../../core/Level";
import {
  DISPLAY_HEIGHT,
  DISPLAY_WIDTH,
  PIXEL_GRID,
  PLAYFIELD_HEIGHT,
  SPRITE_SIZE,
  TEXTURE_BEAST_SHIP,
  TEXTURE_ENEMY_CRUISER_SHEET,
  TEXTURE_ENEMY_DRIFTER_SHEET,
  TEXTURE_ENEMY_SCOUT_SHEET,
  TEXTURE_HEART,
  TEXTURE_SHOOTER_BULLET,
  TEXTURE_SHOOTER_BUTTON,
  TEXTURE_SHOOTER_FONT,
  TEXTURE_SHOOTER_HUD,
  TEXTURE_SHOOTER_PANEL,
  TEXTURE_STARS_LAYER_1,
  TEXTURE_STARS_LAYER_2,
} from "../../core/consts";
import { Globals } from "../../core/Globals";
import { Beast2D16 } from "../../core/palette/beast2d16";
import { preloadBitmapFont } from "../../core/ui/BitmapText";
import { Spaceship } from "./Game Objects/Spaceship";
import { ShooterEnemySpawner } from "./Game Objects/ShooterEnemySpawner";
import { ParallaxBackground } from "./Game Objects/ParallaxBackground";
import { ShooterHud } from "./Game Objects/ShooterHud";
import { ShooterPlayfield } from "./Game Objects/ShooterPlayfield";
import { HeartsUI } from "../../core/components/UI/HeartsUI";
import { DialogUI } from "../../core/components/UI/DialogUI";
import { ScoreUI } from "../../core/components/UI/ScoreUI";

export class SpaceShooter extends Level {
  private static onGameOverRestart: (() => void) | null = null;

  static bindGameOverRestart(handler: () => void): void {
    SpaceShooter.onGameOverRestart = handler;
  }

  static triggerGameOverRestart(): void {
    SpaceShooter.onGameOverRestart?.();
  }

  override assets = [
    TEXTURE_BEAST_SHIP,
    TEXTURE_HEART,
    TEXTURE_STARS_LAYER_1,
    TEXTURE_STARS_LAYER_2,
    TEXTURE_SHOOTER_BULLET,
    TEXTURE_SHOOTER_HUD,
    TEXTURE_SHOOTER_PANEL,
    TEXTURE_SHOOTER_BUTTON,
    TEXTURE_SHOOTER_FONT,
    TEXTURE_ENEMY_SCOUT_SHEET,
    TEXTURE_ENEMY_CRUISER_SHEET,
    TEXTURE_ENEMY_DRIFTER_SHEET,
  ];

  protected init(): void {
    void preloadBitmapFont();

    const startX = Globals.canvasWidth / 2 - SPRITE_SIZE / 2;
    const startY =
      PLAYFIELD_HEIGHT - PIXEL_GRID * 3 - SPRITE_SIZE / 2;

    this.levelRoot.addChild(new ParallaxBackground());
    this.levelRoot.addChild(new ShooterHud());

    const playfield = new ShooterPlayfield();
    this.levelRoot.addChild(playfield);

    playfield.addChild(new Spaceship(startX, startY));
    playfield.addChild(new ShooterEnemySpawner());

    this.levelRoot.addChild(new HeartsUI(PIXEL_GRID / 2, 0, 3, 16, 4));
    this.levelRoot.addChild(
      new ScoreUI(Globals.canvasWidth - PIXEL_GRID / 2, 1, 0, "SCORE"),
    );

    const dialogWidth = DISPLAY_WIDTH - PIXEL_GRID * 4;
    const dialogHeight = PIXEL_GRID * 8;
    this.levelRoot.addChild(
      new DialogUI(
        PIXEL_GRID * 2,
        (DISPLAY_HEIGHT - dialogHeight) / 2,
        dialogWidth,
        dialogHeight,
        "SPACE BEAST",
        0,
        true,
        {
          color: Beast2D16.Shadow,
          strokeColor: Beast2D16.Magenta,
        },
      ),
    );

    const reloadLevel = (): void => {
      this.engine.gameManager?.resume();
      DialogUI.close();
      void this.engine.gameManager?.loadLevel("spaceShooter");
    };

    DialogUI.setOnRestart(() => {
      this.engine.gameManager?.resume();
      DialogUI.close();
    });

    SpaceShooter.bindGameOverRestart(reloadLevel);

    DialogUI.setOnPause(() => {
      this.engine.gameManager?.pause();
    });

    DialogUI.setOnResume(() => {
      this.engine.gameManager?.resume();
    });

    this.engine.gameManager?.pause();
    DialogUI.setPrimaryLabel("START");
  }
}
