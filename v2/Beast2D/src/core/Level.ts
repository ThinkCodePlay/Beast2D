/* Level.ts
  Level is an abstract base class representing a game level or scene.
  It provides lifecycle methods for initializing, updating, and destroying
  the level, as well as managing game objects within the level.
  All specific levels should extend this class and implement the init method.
  */

import { ObjectNames } from "./consts";
import { Engine } from "./Engine";
import { GameObject } from "./GameObject";
import { Ticker, Container } from "pixi.js";

export abstract class Level {
  protected engine: Engine;
  protected levelRoot: GameObject;
  private tickerCallback: ((ticker: Ticker) => void) | null = null;

  constructor(engine: Engine) {
    this.engine = engine;
    this.levelRoot = this.createLevelRoot();
  }

  private createLevelRoot(): GameObject {
    const levelRoot = new GameObject(new Container());
    levelRoot.name = ObjectNames.LevelRoot;
    return levelRoot;
  }

  // Initialize the level (add objects, set up logic)
  public start() {
    this.levelRoot = this.createLevelRoot();
    this.engine.app.stage.addChild(this.levelRoot.container);

    this.init();

    // Register the update callback with the engine ticker
    this.tickerCallback = this.update.bind(this);
    this.engine.app.ticker.add(this.tickerCallback);
  }

  // Clean up the level when switching
  public destroy() {
    // Remove ticker callback first to prevent updates during teardown.
    if (this.tickerCallback) {
      this.engine.app.ticker.remove(this.tickerCallback);
      this.tickerCallback = null;
    }

    // Destroy all objects (this will clean up all components and graphics)
    this.levelRoot.destroy();
  }

  // Abstract method for setting up the level (must be implemented by subclasses)
  protected abstract init(): void;

  // Update method called by the engine ticker (can be overridden)
  protected update(ticker: Ticker): void {
    this.levelRoot.update(ticker.deltaTime);
  }

  // Get the complete scene hierarchy
  public getHierarchy() {
    return this.levelRoot.getHierarchy();
  }
}
