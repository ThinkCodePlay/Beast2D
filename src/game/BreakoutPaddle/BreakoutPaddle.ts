import { Level } from "../../core/Level";
import { HudHeaderUI } from "../../core/components/UI/HudHeaderUI";
import { DialogUI } from "../../core/components/UI/DialogUI";
import { BREAKOUT_ASSETS } from "./breakoutAssets";
import {
  registerBreakoutUiFont,
  spawnBreakoutDialog,
  spawnBreakoutHint,
  spawnBreakoutHud,
  START_LIVES,
} from "./breakoutSetup";
import { BreakoutPlayfieldHint } from "./BreakoutPlayfieldHint";
import { BreakoutBackdrop } from "./Game Objects/BreakoutBackdrop";
import { BrickWall } from "./Game Objects/BrickWall";
import { BreakoutBallObj } from "./Game Objects/BreakoutBallObj";
import { BreakoutPaddleObj } from "./Game Objects/BreakoutPaddleObj";
import {
  newBreakoutSession,
  tickBreakoutSession,
  type BreakoutSession,
} from "./breakoutSession";
import { Movement } from "../../core/components/Movement/Movement";
import { KeyboardMovement } from "../../core/components/Movement/KeyboardMovement";
import { PointerMovement } from "../../core/components/Movement/PointerMovement";
const LEVEL_NAME = "breakoutPaddle";
const PADDLE_SPEED = 5.5;

/** Playwright / capture tooling snapshot (see `devtools/levels/breakout-paddle/capture/`). */
export type BreakoutQaSnapshot = {
  phase: BreakoutSession["phase"];
  lives: number;
  paddleX: number;
  dialogOpen: boolean;
  dialogTextReady: boolean;
  hintTextReady: boolean;
};

/**
 * Breakout paddle showcase — scene setup in {@link init}, rules in {@link breakoutSession}.
 */
export class BreakoutPaddle extends Level {
  override assets = [...BREAKOUT_ASSETS];

  private session: BreakoutSession = newBreakoutSession();
  private hud!: HudHeaderUI;
  private wall!: BrickWall;
  private paddle!: BreakoutPaddleObj;
  private ball!: BreakoutBallObj;

  protected init(): void {
    registerBreakoutUiFont();
    this.session = newBreakoutSession();

    this.levelRoot.addChild(new BreakoutBackdrop());

    this.hud = spawnBreakoutHud(START_LIVES);
    this.levelRoot.addChild(this.hud);

    this.levelRoot.addChild(spawnBreakoutHint("ARROWS MOVE  SPACE SERVE"));

    this.wall = new BrickWall();
    this.levelRoot.addChild(this.wall);

    this.paddle = new BreakoutPaddleObj();
    const paddleBody = this.paddle.body;
    paddleBody.addComponent(new Movement(PADDLE_SPEED, { x: true, y: false }));
    paddleBody.addComponent(new KeyboardMovement());
    paddleBody.addComponent(new PointerMovement());
    this.levelRoot.addChild(this.paddle);

    this.ball = new BreakoutBallObj();
    this.levelRoot.addChild(this.ball);

    this.levelRoot.addChild(
      spawnBreakoutDialog(() => {
        void this.restartLevel();
      }),
    );
  }

  /** @internal Used by capture devtools (`attachBreakoutQaProbe`). */
  readQaSnapshot(): BreakoutQaSnapshot {
    return {
      phase: this.session.phase,
      lives: this.session.lives,
      paddleX: this.paddle.readState().x,
      dialogOpen: DialogUI.isOpen(),
      dialogTextReady: DialogUI.isTextReady(),
      hintTextReady: BreakoutPlayfieldHint.isTextReady(),
    };
  }

  protected update(deltaTime: number): void {
    super.update(deltaTime);
    tickBreakoutSession(
      {
        context: this.context,
        session: this.session,
        hud: this.hud,
        wall: this.wall,
        paddle: this.paddle,
        ball: this.ball,
        onRestart: () => void this.restartLevel(),
        pauseGame: () => this.engine.gameManager?.pause(),
      },
      deltaTime,
    );
  }

  private async restartLevel(): Promise<void> {
    this.engine.gameManager?.resume();
    DialogUI.close();
    await this.engine.gameManager?.loadLevel(LEVEL_NAME);
  }

  public override destroy(): void {
    DialogUI.setOnRestart(null);
    super.destroy();
  }
}
