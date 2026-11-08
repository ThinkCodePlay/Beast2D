import type { Engine } from "../../../../src/core/Engine";
import {
  BreakoutPaddle,
  type BreakoutQaSnapshot,
} from "../../../../src/game/BreakoutPaddle/BreakoutPaddle";

declare global {
  var __beast2dBreakout: BreakoutQaSnapshot | undefined;
}

/** Capture-only: mirrors former DEV global probe for Playwright scripts. */
export function attachBreakoutQaProbe(engine: Engine): void {
  engine.app.ticker.add(() => {
    const level = engine.gameManager?.getCurrentLevel();
    if (level instanceof BreakoutPaddle) {
      globalThis.__beast2dBreakout = level.readQaSnapshot();
    }
  });
}
