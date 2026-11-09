import type { EngineContext } from "../../core/EngineContext";
import { DialogUI } from "../../core/components/UI/DialogUI";
import { HudHeaderUI } from "../../core/components/UI/HudHeaderUI";
import type { BrickWall } from "./Game Objects/BrickWall";
import type { BreakoutBallObj } from "./Game Objects/BreakoutBallObj";
import type { BreakoutPaddleObj } from "./Game Objects/BreakoutPaddleObj";
import { BreakoutPlayfieldHint } from "./BreakoutPlayfieldHint";
import {
  aliveBrickCount,
  ballOnPaddlePosition,
  launchBallVelocity,
  START_LIVES,
  stepBall,
  type BallState,
  type GamePhase,
} from "./breakoutLogic";

export type BreakoutSession = {
  phase: GamePhase;
  lives: number;
  ball: BallState;
};

export function newBreakoutSession(): BreakoutSession {
  return {
    phase: "ready",
    lives: START_LIVES,
    ball: { x: 0, y: 0, vx: 0, vy: 0 },
  };
}

type FrameDeps = {
  context: EngineContext;
  session: BreakoutSession;
  hud: HudHeaderUI;
  wall: BrickWall;
  paddle: BreakoutPaddleObj;
  ball: BreakoutBallObj;
  onRestart: () => void;
  pauseGame: () => void;
};

export function tickBreakoutSession(deps: FrameDeps, deltaTime: number): void {
  const { session, context } = deps;
  const input = context.input;

  if (session.phase === "won" || session.phase === "lost") {
    if (input.wasPressed("shoot") || input.isKeyDown("KeyR")) {
      deps.onRestart();
    }
    return;
  }

  if (session.phase === "ready") {
    session.ball = ballOnPaddlePosition(deps.paddle.readState());
    deps.ball.sync(session.ball);
    if (input.wasPressed("shoot")) {
      session.ball = { ...session.ball, ...launchBallVelocity() };
      session.phase = "playing";
      BreakoutPlayfieldHint.setMessage("");
    } else {
      BreakoutPlayfieldHint.setMessage("ARROWS MOVE  SPACE SERVE");
    }
    return;
  }

  const result = stepBall(
    session.ball,
    deps.wall.states,
    deps.paddle.readState(),
    deltaTime,
  );
  session.ball = result.ball;
  deps.wall.applyStates(result.bricks);
  deps.ball.sync(session.ball);
  if (result.scoreDelta > 0) {
    HudHeaderUI.addScore(result.scoreDelta);
  }

  if (result.lostLife) {
    session.lives -= 1;
    deps.hud.setHearts(session.lives);
    if (session.lives <= 0) {
      endBreakout(session, deps, false);
      return;
    }
    session.phase = "ready";
    BreakoutPlayfieldHint.setMessage("BALL LOST  SPACE SERVE");
    return;
  }

  if (aliveBrickCount(deps.wall.states) === 0) {
    endBreakout(session, deps, true);
  }
}

function endBreakout(
  session: BreakoutSession,
  deps: FrameDeps,
  won: boolean,
): void {
  session.phase = won ? "won" : "lost";
  deps.pauseGame();
  DialogUI.open(
    won ? "You cleared the bricks!" : "Out of lives!",
    HudHeaderUI.getScore(),
  );
  BreakoutPlayfieldHint.setMessage("SPACE OR R RESTART");
}
