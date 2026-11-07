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
import { ShooterPlayfield } from "./Game Objects/ShooterPlayfield";
import { ShooterEnemy } from "./Game Objects/ShooterEnemy";
import { HudHeaderUI } from "../../core/components/UI/HudHeaderUI";
import { DialogUI } from "../../core/components/UI/DialogUI";
import { getShooterCaptureScene } from "./captureMode";
import { spawnPixelBurst } from "../../core/effects/spawnEffect";
import { EXPLOSION_SMALL, MUZZLE_FLASH } from "../../core/effects/PixelEffectPresets";

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

    const captureScene = getShooterCaptureScene();
    const startX = Globals.canvasWidth / 2 - SPRITE_SIZE / 2;
    const startY = PLAYFIELD_HEIGHT - PIXEL_GRID * 3 - SPRITE_SIZE / 2;

    this.levelRoot.addChild(new ParallaxBackground());

    const playfield = new ShooterPlayfield();
    this.levelRoot.addChild(playfield);

    playfield.addChild(new Spaceship(startX, startY));

    const showcaseScore = captureScene === "gameplay" ? 12800 : 0;
    if (captureScene === "gameplay") {
      playfield.addChild(new ShooterEnemy(32, 56, "scout"));
      playfield.addChild(new ShooterEnemy(144, 80, "cruiser"));
      playfield.addChild(new ShooterEnemy(240, 64, "drifter"));
      spawnPixelBurst(playfield, startX + 16, startY - 8, MUZZLE_FLASH);
      spawnPixelBurst(playfield, 160, 120, EXPLOSION_SMALL);
    } else {
      playfield.addChild(new ShooterEnemySpawner());
    }

    this.levelRoot.addChild(new HudHeaderUI(showcaseScore, 3));

    const dialogWidth = 256;
    const dialogHeight = 96;
    this.levelRoot.addChild(
      new DialogUI(
        Math.round((DISPLAY_WIDTH - dialogWidth) / 2),
        Math.round((DISPLAY_HEIGHT - dialogHeight) / 2),
        dialogWidth,
        dialogHeight,
        captureScene === "gameover" ? "GAME OVER" : "SPACE BEAST",
        captureScene === "gameover" ? 1200 : 0,
        captureScene !== "gameplay",
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

    if (captureScene === "gameplay") {
      DialogUI.close();
      this.engine.gameManager?.resume();
      DialogUI.setPrimaryLabel("START");
    } else if (captureScene === "gameover") {
      DialogUI.setPrimaryLabel("RESTART");
      this.engine.gameManager?.pause();
    } else {
      this.engine.gameManager?.pause();
      DialogUI.setPrimaryLabel("START");
    }

  }
}
