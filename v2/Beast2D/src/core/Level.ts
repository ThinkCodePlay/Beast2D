// Level.ts
// Base class for game levels

import { Engine } from "./Engine";
import { GameObject } from "./GameObject";
import { Ticker } from "pixi.js";

export abstract class Level {
  protected engine: Engine;
  protected objects: GameObject[] = [];
  private tickerCallback: ((ticker: Ticker) => void) | null = null;

  constructor(engine: Engine) {
    this.engine = engine;
  }

  // Initialize the level (add objects, set up logic)
  public start() {
    this.init();
    // Register the update callback with the engine ticker
    this.tickerCallback = this.update.bind(this);
    this.engine.app.ticker.add(this.tickerCallback);
  }

  // Clean up the level when switching
  public stop() {
    // Destroy all objects (this will clean up all components and graphics)
    this.objects.forEach((obj) => {
      obj.destroy();
    });
    this.objects = [];

    // Remove ticker callback
    if (this.tickerCallback) {
      this.engine.app.ticker.remove(this.tickerCallback);
      this.tickerCallback = null;
    }
  }

  // Abstract method for setting up the level (must be implemented by subclasses)
  protected abstract init(): void;

  // Update method called by the engine ticker (can be overridden)
  protected update(ticker: Ticker): void {
    this.objects.forEach((obj) => obj.update(ticker.deltaTime));
  }
}
