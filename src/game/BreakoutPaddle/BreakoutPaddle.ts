import { Level } from "../../core/Level";
import {
  DISPLAY_HEIGHT,
  DISPLAY_WIDTH,
  PIXEL_GRID,
  TEXTURE_HEART,
} from "../../core/consts";
import { DialogUI } from "../../core/components/UI/DialogUI";
import { HudHeaderUI } from "../../core/components/UI/HudHeaderUI";
import { PlayfieldHintUI } from "../../core/components/UI/PlayfieldHintUI";
import { ScoreUI } from "../../core/components/UI/ScoreUI";
import { Beast2D16 } from "../../core/palette/beast2d16";
import { useBitmapFont } from "../../core/ui/bitmapFontRegistry";
import {
  preloadBitmapFont,
  resetBitmapTextAtlas,
} from "../../core/ui/BitmapText";
import { DEFAULT_BEAST2D_BITMAP_FONT } from "../../core/ui/defaultBitmapFont";
import {
  DEFAULT_BEAST2D_DIALOG_THEME,
  DEFAULT_BEAST2D_HUD_THEME,
  TEXTURE_DEFAULT_DIALOG_BUTTON,
  TEXTURE_DEFAULT_DIALOG_PANEL,
  TEXTURE_DEFAULT_HUD_BAND,
} from "../../core/ui/defaultUiTheme";
import { Box } from "../../core/prefabs/Box";
import { Circle } from "../../core/prefabs/Circle";
import { HorizontalClampComponent } from "../../core/components/Movement/HorizontalClampComponent";
import { HorizontalInputComponent } from "../../core/components/Movement/HorizontalInputComponent";
import {
  BALL_RADIUS,
  type BallState,
  type BrickState,
  type GamePhase,
  aliveBrickCount,
  ballOnPaddlePosition,
  createBrickGrid,
  defaultPaddleY,
  launchBallVelocity,
  PADDLE_H,
  PADDLE_W,
  START_LIVES,
  stepBall,
} from "./breakoutLogic";
import { C_CREAM, C_HOT_PINK, C_PLUM } from "./palette";

const PADDLE_SPEED = 5.5;
const LEVEL_NAME = "breakoutPaddle";

export class BreakoutPaddle extends Level {
  override assets = [
    TEXTURE_HEART,
    TEXTURE_DEFAULT_HUD_BAND,
    TEXTURE_DEFAULT_DIALOG_PANEL,
    TEXTURE_DEFAULT_DIALOG_BUTTON,
    DEFAULT_BEAST2D_BITMAP_FONT.atlasPath,
  ];

  private phase: GamePhase = "ready";
  private lives = START_LIVES;
  private hud: HudHeaderUI | null = null;
  private ball: BallState = { x: 0, y: 0, vx: 0, vy: 0 };
  private bricks: BrickState[] = [];
  private paddleBox: Box | null = null;
  private ballCircle: Circle | null = null;
  private brickObjects: Box[] = [];

  protected init(): void {
    useBitmapFont(DEFAULT_BEAST2D_BITMAP_FONT);
    resetBitmapTextAtlas();
    void preloadBitmapFont();

    this.phase = "ready";
    this.lives = START_LIVES;
    this.bricks = createBrickGrid();

    const backdrop = new Box(0, 0, DISPLAY_WIDTH, DISPLAY_HEIGHT, {
      color: C_PLUM,
      strokeWidth: 0,
    });
    backdrop.runWhenPaused = true;
    this.levelRoot.addChild(backdrop);

    this.hud = new HudHeaderUI(0, this.lives, DEFAULT_BEAST2D_HUD_THEME);
    this.levelRoot.addChild(this.hud);
    ScoreUI.resetScore(0);

    this.levelRoot.addChild(new PlayfieldHintUI("ARROWS MOVE  SPACE SERVE"));

    const paddleY = defaultPaddleY();
    this.paddleBox = new Box(
      DISPLAY_WIDTH / 2 - PADDLE_W / 2,
      paddleY,
      PADDLE_W,
      PADDLE_H,
      {
        color: C_HOT_PINK,
        strokeColor: C_PLUM,
        strokeWidth: 1,
      },
    );
    this.paddleBox.addComponent(new HorizontalInputComponent(PADDLE_SPEED));
    this.paddleBox.addComponent(
      new HorizontalClampComponent(
        PIXEL_GRID,
        DISPLAY_WIDTH - PIXEL_GRID - PADDLE_W,
      ),
    );
    this.levelRoot.addChild(this.paddleBox);

    this.ball = ballOnPaddlePosition(this.readPaddle());
    this.ballCircle = new Circle(
      this.ball.x - BALL_RADIUS,
      this.ball.y - BALL_RADIUS,
      BALL_RADIUS,
      {
        color: C_CREAM,
        strokeColor: C_PLUM,
        strokeWidth: 1,
      },
    );
    this.levelRoot.addChild(this.ballCircle);

    this.brickObjects = [];
    for (const brick of this.bricks) {
      const brickBox = new Box(brick.x, brick.y, brick.w, brick.h, {
        color: brick.color,
        strokeColor: C_PLUM,
        strokeWidth: 1,
      });
      this.brickObjects.push(brickBox);
      this.levelRoot.addChild(brickBox);
    }

    const dialogWidth = DISPLAY_WIDTH - PIXEL_GRID * 2;
    const dialogHeight = PIXEL_GRID * 6;
    this.levelRoot.addChild(
      new DialogUI(
        PIXEL_GRID,
        (DISPLAY_HEIGHT - dialogHeight) / 2,
        dialogWidth,
        dialogHeight,
        "",
        0,
        false,
        DEFAULT_BEAST2D_DIALOG_THEME,
        {
          color: Beast2D16.Shadow,
          strokeColor: Beast2D16.Magenta,
        },
      ),
    );

    DialogUI.setOnRestart(() => {
      void this.restartLevel();
    });
  }

  private readPaddle() {
    const x = this.paddleBox?.transform?.x ?? DISPLAY_WIDTH / 2 - PADDLE_W / 2;
    const y = this.paddleBox?.transform?.y ?? defaultPaddleY();
    return { x, y, w: PADDLE_W, h: PADDLE_H };
  }

  private syncBallGraphics(): void {
    if (!this.ballCircle?.transform) return;
    this.ballCircle.transform.setPosition(
      this.ball.x - BALL_RADIUS,
      this.ball.y - BALL_RADIUS,
    );
  }

  private syncBricks(): void {
    this.bricks.forEach((brick, i) => {
      const obj = this.brickObjects[i];
      if (!obj) return;
      obj.container.visible = brick.alive;
    });
  }

  private setHint(text: string): void {
    PlayfieldHintUI.setMessage(text);
  }

  private refreshLives(): void {
    this.hud?.setHearts(this.lives);
  }

  private attachBallToPaddle(): void {
    this.ball = ballOnPaddlePosition(this.readPaddle());
    this.syncBallGraphics();
  }

  private async restartLevel(): Promise<void> {
    this.engine.gameManager?.resume();
    DialogUI.close();
    await this.engine.gameManager?.loadLevel(LEVEL_NAME);
  }

  protected update(deltaTime: number): void {
    super.update(deltaTime);

    const input = this.context.input;

    if (
      input.wasPressed("shoot") &&
      (this.phase === "won" || this.phase === "lost")
    ) {
      void this.restartLevel();
      return;
    }

    if (input.isKeyDown("KeyR") && (this.phase === "won" || this.phase === "lost")) {
      void this.restartLevel();
      return;
    }

    if (this.phase === "ready") {
      this.attachBallToPaddle();
      if (input.wasPressed("shoot")) {
        const vel = launchBallVelocity();
        this.ball = { ...this.ball, ...vel };
        this.phase = "playing";
        this.setHint("");
      } else {
        this.setHint("ARROWS MOVE  SPACE SERVE");
      }
      this.syncBallGraphics();
      return;
    }

    if (this.phase !== "playing") {
      return;
    }

    const paddle = this.readPaddle();
    const result = stepBall(this.ball, this.bricks, paddle, deltaTime);
    this.ball = result.ball;
    this.bricks = result.bricks;
    if (result.scoreDelta > 0) {
      ScoreUI.addScore(result.scoreDelta);
    }
    this.syncBallGraphics();
    this.syncBricks();

    if (result.lostLife) {
      this.lives -= 1;
      this.refreshLives();
      if (this.lives <= 0) {
        this.endGame(false);
        return;
      }
      this.phase = "ready";
      this.setHint("BALL LOST  SPACE SERVE");
      this.attachBallToPaddle();
      return;
    }

    if (aliveBrickCount(this.bricks) === 0) {
      this.endGame(true);
    }
  }

  private endGame(won: boolean): void {
    this.phase = won ? "won" : "lost";
    this.engine.gameManager?.pause();
    const score = ScoreUI.getScore();
    DialogUI.open(
      won ? "You cleared the bricks!" : "Out of lives!",
      score,
    );
    this.setHint("SPACE OR R RESTART");
  }

  public override destroy(): void {
    DialogUI.setOnRestart(null);
    this.hud = null;
    super.destroy();
  }
}
