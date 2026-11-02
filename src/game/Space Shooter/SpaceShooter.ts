import { Level } from "../../core/Level";
import { Globals } from "../../core/Globals";
import { Spaceship } from "./Game Objects/Spaceship";
import { EnemyCircleSpawner } from "./Game Objects/EnemyCircleSpawner";
import { ParallaxBackground } from "./Game Objects/ParallaxBackground";
import { HeartsUI } from "../../core/components/UI/HeartsUI";
import { DialogUI } from "../../core/components/UI/DialogUI";
import { ScoreUI } from "../../core/components/UI/ScoreUI";

export class SpaceShooter extends Level {
  override assets = [
    "BeastShip.png",
    "background/Stars-Big_1_1_PC.png",
    "background/Stars-Big_1_2_PC.png",
  ];

  protected init(): void {
    const startX = Globals.canvasWidth / 2;
    const startY = Globals.canvasHeight - 90;

    // background
    this.levelRoot.addChild(new ParallaxBackground());

    // player
    this.levelRoot.addChild(new Spaceship(startX, startY));

    // enemies
    this.levelRoot.addChild(new EnemyCircleSpawner());

    // UI
    this.levelRoot.addChild(new HeartsUI(16, 16, 3, 32));
    this.levelRoot.addChild(new ScoreUI(Globals.canvasWidth - 16, 16));

    // dialog (hidden by default)
    this.levelRoot.addChild(
      new DialogUI(
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
}
