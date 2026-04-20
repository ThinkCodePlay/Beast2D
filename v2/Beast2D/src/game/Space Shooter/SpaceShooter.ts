import { Ticker } from "pixi.js";
import { Level } from "../../core/Level";
import { Globals } from "../../core/Globals";
import { Spaceship } from "./Game Objects/Spaceship";
import { EnemyCircleSpawner } from "./Game Objects/EnemyCircleSpawner";
import { ParallaxBackground } from "./Game Objects/ParallaxBackground";
import { HeartsUI } from "../../core/components/UI/HeartsUI";
import { DialogUI } from "../../core/components/UI/DialogUI";
import { ScoreUI } from "../../core/components/UI/ScoreUI";

export class SpaceShooter extends Level {
  protected init(): void {
    const startX = Globals.canvasWidth / 2;
    const startY = Globals.canvasHeight - 90;

    // background
    this.levelRoot.addChild(new ParallaxBackground(Globals.stage));

    // player
    this.levelRoot.addChild(new Spaceship(Globals.stage, startX, startY));

    // enemies
    this.levelRoot.addChild(new EnemyCircleSpawner(Globals.stage));

    // UI
    this.levelRoot.addChild(new HeartsUI(Globals.stage, 16, 16, 3, 32));
    this.levelRoot.addChild(
      new ScoreUI(Globals.stage, Globals.canvasWidth - 16, 16),
    );

    // dialog (hidden by default)
    this.levelRoot.addChild(
      new DialogUI(
        Globals.stage,
        Globals.canvasWidth / 2 - 160,
        Globals.canvasHeight / 2 - 70,
        320,
        190,
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

  protected update(ticker: Ticker): void {
    super.update(ticker);
  }
}
