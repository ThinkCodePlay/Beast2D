/* Level.ts
  Abstract base class for a level (scene). Subclasses implement `init()` to
  add objects to `levelRoot` and may override `update(dt)` for level logic
  (call `super.update(dt)` first). The engine drives the level through
  `tick`, which also runs collisions, applies transforms and flushes
  destroyed objects.
*/

import { Container } from "pixi.js";
import { ObjectNames } from "./consts";
import type { Engine } from "./Engine";
import type { EngineContext } from "./EngineContext";
import { GameObject } from "./GameObject";

export abstract class Level {
  protected engine: Engine;
  protected levelRoot!: GameObject;
  private started = false;

  /** Asset paths that LevelManager preloads before `start()`. */
  assets: string[] = [];

  constructor(engine: Engine) {
    this.engine = engine;
  }

  protected get context(): EngineContext {
    return this.engine.context;
  }

  // Initialize the level (create the root, add objects, set up logic)
  public start() {
    const context = this.context;

    this.levelRoot = new GameObject(new Container());
    this.levelRoot.name = ObjectNames.LevelRoot;
    this.levelRoot.runWhenPaused = true;
    this.levelRoot.context = context;
    context.stage.addChild(this.levelRoot.container);

    this.started = true;
    this.init();
  }

  // Clean up the level when switching
  public destroy() {
    if (!this.started) return;
    this.started = false;

    this.levelRoot.destroy();
    GameObject.flushDestroyed();
    this.context.resetLevelState();
  }

  // Abstract method for setting up the level (must be implemented by subclasses)
  protected abstract init(): void;

  // Level logic, called every frame (can be overridden)
  protected update(deltaTime: number): void {
    this.levelRoot.update(deltaTime);
  }

  /** One frame. Called by the engine. */
  public tick(deltaTime: number): void {
    if (!this.started) return;
    const context = this.context;

    this.update(deltaTime);

    if (!context.time.paused && context.collisionStepper.consume(deltaTime) > 0) {
      context.collisions.update();
    }

    this.levelRoot.syncTransforms();
    context.timers.update(context.time.deltaSeconds);
    GameObject.flushDestroyed();
  }

  // Get the complete scene hierarchy
  public getHierarchy() {
    return this.started ? this.levelRoot.getHierarchy() : null;
  }
}
