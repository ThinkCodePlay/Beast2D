/* EngineContext.ts
  Services shared by everything running inside one Engine: stage, canvas
  size, time, input, timers, collisions. GameObjects and components reach it
  through `gameObject.context` (available once the object is in a level).
*/

import type { Container } from "pixi.js";
import { CollisionSystem } from "./CollisionSystem";
import { FixedStepper } from "./FixedStepper";
import { Input } from "./Input";
import { Time } from "./Time";
import { Timers } from "./Timers";

export interface EngineContextOptions {
  stage: Container;
  width: number;
  height: number;
  debug?: boolean;
  /** Where keyboard events are listened to (the window by default in browsers). */
  inputTarget?: EventTarget | null;
}

export class EngineContext {
  readonly stage: Container;
  width: number;
  height: number;
  debug: boolean;

  readonly time = new Time();
  readonly input = new Input();
  readonly timers = new Timers();
  readonly collisions = new CollisionSystem();
  /** Collisions run at a fixed 60 Hz regardless of display refresh rate. */
  readonly collisionStepper = new FixedStepper(1);

  constructor(options: EngineContextOptions) {
    this.stage = options.stage;
    this.width = options.width;
    this.height = options.height;
    this.debug = options.debug ?? true;

    const target =
      options.inputTarget !== undefined
        ? options.inputTarget
        : typeof window !== "undefined"
          ? window
          : null;
    if (target) this.input.attach(target);
  }

  resize(width: number, height: number): void {
    this.width = width;
    this.height = height;
  }

  /** Clears per-level state (called when a level is torn down). */
  resetLevelState(): void {
    this.collisions.clear();
    this.timers.clear();
    this.collisionStepper.reset();
  }

  dispose(): void {
    this.input.detach();
    this.resetLevelState();
  }
}
