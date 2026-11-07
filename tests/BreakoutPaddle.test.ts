import { describe, expect, it } from "vitest";
import {
  aliveBrickCount,
  ballOnPaddlePosition,
  createBrickGrid,
  enforceMinimumVertical,
  launchBallVelocity,
  paddleBounceVelocity,
  stepBall,
  START_LIVES,
  type BallState,
  type BrickState,
  type PaddleState,
} from "../src/game/BreakoutPaddle/breakoutLogic";

describe("breakout paddle logic", () => {
  it("creates a full brick grid", () => {
    const bricks = createBrickGrid();
    expect(bricks).toHaveLength(40);
    expect(aliveBrickCount(bricks)).toBe(40);
  });

  it("varies paddle bounce by hit position", () => {
    const paddle: PaddleState = { x: 100, y: 200, w: 40, h: 6 };
    const left = paddleBounceVelocity(108, paddle);
    const right = paddleBounceVelocity(132, paddle);
    expect(left.vx).toBeLessThan(0);
    expect(right.vx).toBeGreaterThan(0);
    expect(left.vy).toBeLessThan(0);
    expect(Math.abs(left.vy)).toBeGreaterThan(1);
  });

  it("enforces a minimum vertical speed", () => {
    const flat = enforceMinimumVertical(3.4, 0.1, 3.5);
    expect(Math.abs(flat.vy)).toBeGreaterThanOrEqual(1.15);
  });

  it("launch velocity aims upward", () => {
    const vel = launchBallVelocity();
    expect(vel.vy).toBeLessThan(0);
  });

  it("destroys one brick and adds score once", () => {
    const bricks = createBrickGrid();
    const target = bricks[0]!;
    const paddle: PaddleState = { x: 120, y: 220, w: 40, h: 6 };
    const ball: BallState = {
      x: target.x + target.w / 2,
      y: target.y - 4,
      vx: 0,
      vy: 3,
    };
    const result = stepBall(ball, bricks, paddle, 1);
    expect(result.scoreDelta).toBe(10);
    expect(aliveBrickCount(result.bricks)).toBe(39);
    expect(result.bricks[0]!.alive).toBe(false);
  });

  it("loses a life when the ball leaves the playfield", () => {
    const bricks = createBrickGrid();
    const paddle: PaddleState = { x: 120, y: 220, w: 40, h: 6 };
    const ball: BallState = { x: 160, y: 230, vx: 0, vy: 8 };
    const result = stepBall(ball, bricks, paddle, 1);
    expect(result.lostLife).toBe(true);
  });

  it("anchors the ball on the paddle while ready", () => {
    const paddle: PaddleState = { x: 50, y: 210, w: 40, h: 6 };
    const ball = ballOnPaddlePosition(paddle);
    expect(ball.x).toBe(70);
    expect(ball.y).toBeLessThan(paddle.y);
    expect(ball.vx).toBe(0);
    expect(ball.vy).toBe(0);
  });

  it("starts with three lives constant", () => {
    expect(START_LIVES).toBe(3);
  });

  it("can clear all bricks", () => {
    let bricks: BrickState[] = createBrickGrid().map((b) => ({
      ...b,
      alive: false,
    }));
    expect(aliveBrickCount(bricks)).toBe(0);
  });
});
