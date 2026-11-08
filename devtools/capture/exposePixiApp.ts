import type { Application } from "pixi.js";
import type { Engine } from "../../src/core/Engine";

declare global {
  var __PIXI_APP__: Application;
}

/** Capture-only: exposes the Pixi app for browser debugging extensions. */
export function exposePixiAppForCapture(engine: Engine): void {
  globalThis.__PIXI_APP__ = engine.app;
}
