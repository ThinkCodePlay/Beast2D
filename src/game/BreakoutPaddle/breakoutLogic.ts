import {
  C_BLUE,
  C_LEAF,
  C_ORANGE,
  C_RED,
  C_SKY,
  C_YELLOW,
} from "./palette";

export const HUD_HEIGHT = 16;
export const PLAYFIELD_TOP = HUD_HEIGHT;
export const PLAYFIELD_BOTTOM = 240;
export const FIELD_WIDTH = 320;

export const PADDLE_W = 40;
export const PADDLE_H = 6;
export const BALL_RADIUS = 3;
export const BALL_SPEED = 3.6;

export const BRICK_COLS = 8;
export const BRICK_ROWS = 5;
export const BRICK_W = 36;
export const BRICK_H = 8;
export const BRICK_GAP_X = 2;
export const BRICK_GAP_Y = 2;

export const START_LIVES = 3;
export const BRICK_POINTS = 10;

export type GamePhase = "ready" | "playing" | "won" | "lost";

export type BallState = {
  x: number;
  y: number;
  vx: number;
  vy: number;
};

export type BrickState = {
  id: number;
  x: number;
  y: number;
  w: number;
  h: number;
  alive: boolean;
  color: number;
};

export type PaddleState = {
  x: number;
  y: number;
  w: number;
  h: number;
};

const ROW_COLORS = [C_SKY, C_BLUE, C_LEAF, C_YELLOW, C_ORANGE, C_RED];

const MIN_VERTICAL_SPEED = 1.15;

export function brickGridOrigin(): { x: number; y: number } {
  const gridW =
    BRICK_COLS * BRICK_W + (BRICK_COLS - 1) * BRICK_GAP_X;
  return {
    x: Math.floor((FIELD_WIDTH - gridW) / 2),
    y: PLAYFIELD_TOP + 8,
  };
}

export function createBrickGrid(): BrickState[] {
  const { x: ox, y: oy } = brickGridOrigin();
  const bricks: BrickState[] = [];
  let id = 0;
  for (let row = 0; row < BRICK_ROWS; row += 1) {
    for (let col = 0; col < BRICK_COLS; col += 1) {
      bricks.push({
        id,
        x: ox + col * (BRICK_W + BRICK_GAP_X),
        y: oy + row * (BRICK_H + BRICK_GAP_Y),
        w: BRICK_W,
        h: BRICK_H,
        alive: true,
        color: ROW_COLORS[row % ROW_COLORS.length]!,
      });
      id += 1;
    }
  }
  return bricks;
}

export function aliveBrickCount(bricks: readonly BrickState[]): number {
  return bricks.reduce((n, b) => n + (b.alive ? 1 : 0), 0);
}

export function defaultPaddleY(): number {
  return PLAYFIELD_BOTTOM - 16;
}

export function paddleBounceVelocity(
  ballX: number,
  paddle: PaddleState,
  speed: number = BALL_SPEED,
): { vx: number; vy: number } {
  const center = paddle.x + paddle.w / 2;
  const half = paddle.w / 2;
  const offset = Math.max(-1, Math.min(1, (ballX - center) / half));
  const angle = offset * (Math.PI / 3);
  let vx = Math.sin(angle) * speed;
  let vy = -Math.cos(angle) * speed;
  ({ vx, vy } = enforceMinimumVertical(vx, vy, speed));
  return { vx, vy };
}

export function enforceMinimumVertical(
  vx: number,
  vy: number,
  speed: number,
): { vx: number; vy: number } {
  if (Math.abs(vy) >= MIN_VERTICAL_SPEED) {
    return { vx, vy };
  }
  const sign = vy === 0 ? -1 : Math.sign(vy);
  const newVy = sign * MIN_VERTICAL_SPEED;
  const remaining = Math.sqrt(Math.max(0, speed * speed - newVy * newVy));
  const vxSign = vx === 0 ? (Math.random() < 0.5 ? -1 : 1) : Math.sign(vx);
  return { vx: vxSign * remaining, vy: newVy };
}

export function launchBallVelocity(): { vx: number; vy: number } {
  const vx = 0.85;
  const vy = -BALL_SPEED;
  return enforceMinimumVertical(vx, vy, BALL_SPEED);
}

function circleRectOverlap(
  cx: number,
  cy: number,
  r: number,
  rect: { x: number; y: number; w: number; h: number },
): boolean {
  const closestX = Math.max(rect.x, Math.min(cx, rect.x + rect.w));
  const closestY = Math.max(rect.y, Math.min(cy, rect.y + rect.h));
  const dx = cx - closestX;
  const dy = cy - closestY;
  return dx * dx + dy * dy <= r * r;
}

export type BrickHit = {
  brickId: number;
  normalX: number;
  normalY: number;
};

export function findBrickHit(
  ball: BallState,
  bricks: readonly BrickState[],
): BrickHit | null {
  for (const brick of bricks) {
    if (!brick.alive) continue;
    if (!circleRectOverlap(ball.x, ball.y, BALL_RADIUS, brick)) continue;
    const cx = ball.x;
    const cy = ball.y;
    const overlapLeft = cx + BALL_RADIUS - brick.x;
    const overlapRight = brick.x + brick.w - (cx - BALL_RADIUS);
    const overlapTop = cy + BALL_RADIUS - brick.y;
    const overlapBottom = brick.y + brick.h - (cy - BALL_RADIUS);
    const minOverlap = Math.min(
      overlapLeft,
      overlapRight,
      overlapTop,
      overlapBottom,
    );
    if (minOverlap === overlapLeft) {
      return { brickId: brick.id, normalX: -1, normalY: 0 };
    }
    if (minOverlap === overlapRight) {
      return { brickId: brick.id, normalX: 1, normalY: 0 };
    }
    if (minOverlap === overlapTop) {
      return { brickId: brick.id, normalX: 0, normalY: -1 };
    }
    return { brickId: brick.id, normalX: 0, normalY: 1 };
  }
  return null;
}

export type StepBallResult = {
  ball: BallState;
  bricks: BrickState[];
  scoreDelta: number;
  lostLife: boolean;
};

export function stepBall(
  ball: BallState,
  bricks: BrickState[],
  paddle: PaddleState,
  dt: number,
): StepBallResult {
  const speed = Math.hypot(ball.vx, ball.vy) || BALL_SPEED;
  const maxStep = BALL_RADIUS;
  const distance = speed * dt;
  const steps = Math.max(1, Math.ceil(distance / maxStep));
  const stepDt = dt / steps;

  let scoreDelta = 0;
  let lostLife = false;
  const brickMarks = new Set<number>();
  let b = { ...ball };

  for (let i = 0; i < steps; i += 1) {
    b = {
      ...b,
      x: b.x + b.vx * stepDt,
      y: b.y + b.vy * stepDt,
    };

    const minX = BALL_RADIUS;
    const maxX = FIELD_WIDTH - BALL_RADIUS;
    const minY = PLAYFIELD_TOP + BALL_RADIUS;

    if (b.x < minX) {
      b.x = minX;
      b.vx = Math.abs(b.vx);
    } else if (b.x > maxX) {
      b.x = maxX;
      b.vx = -Math.abs(b.vx);
    }

    if (b.y < minY) {
      b.y = minY;
      b.vy = Math.abs(b.vy);
    }

    if (b.y > PLAYFIELD_BOTTOM - BALL_RADIUS) {
      lostLife = true;
      break;
    }

    const paddleTop = paddle.y;
    const paddleBottom = paddle.y + paddle.h;
    if (
      b.vy > 0 &&
      b.y + BALL_RADIUS >= paddleTop &&
      b.y - BALL_RADIUS <= paddleBottom &&
      b.x >= paddle.x - BALL_RADIUS &&
      b.x <= paddle.x + paddle.w + BALL_RADIUS
    ) {
      b.y = paddleTop - BALL_RADIUS;
      const bounce = paddleBounceVelocity(b.x, paddle, speed);
      b.vx = bounce.vx;
      b.vy = bounce.vy;
    }

    const hit = findBrickHit(b, bricks);
    if (hit && !brickMarks.has(hit.brickId)) {
      brickMarks.add(hit.brickId);
      if (hit.normalX !== 0) {
        b.vx = hit.normalX * Math.abs(b.vx);
        b.x += hit.normalX * 1;
      }
      if (hit.normalY !== 0) {
        b.vy = hit.normalY * Math.abs(b.vy);
        b.y += hit.normalY * 1;
      }
      scoreDelta += BRICK_POINTS;
    }
  }

  const nextBricks = bricks.map((brick) =>
    brickMarks.has(brick.id) ? { ...brick, alive: false } : brick,
  );

  return { ball: b, bricks: nextBricks, scoreDelta, lostLife };
}

export function ballOnPaddlePosition(paddle: PaddleState): BallState {
  return {
    x: paddle.x + paddle.w / 2,
    y: paddle.y - BALL_RADIUS - 1,
    vx: 0,
    vy: 0,
  };
}
